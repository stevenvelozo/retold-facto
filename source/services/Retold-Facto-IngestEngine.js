/**
 * Retold Facto - Ingest Engine Service
 *
 * Orchestrates the download and ingest of external datasets.
 * Manages IngestJob lifecycle, download from configured sources,
 * parsing, and record creation.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');
const libFs = require('fs');
const libPath = require('path');

const defaultIngestEngineOptions = (
	{
		RoutePrefix: '/facto',
		DefaultCertaintyValue: 0.5
	});

const VALID_JOB_STATUSES = ['Pending', 'Running', 'Completed', 'Failed', 'Cancelled'];

class RetoldFactoIngestEngine extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultIngestEngineOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoIngestEngine';
	}

	/**
	 * Append a message to an ingest job's log.
	 */
	appendJobLog(pIDIngestJob, pMessage, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.IngestJob)
		{
			return fCallback(new Error('IngestJob DAL not initialized'));
		}

		// Read current log, append, update
		let tmpReadQuery = this.fable.DAL.IngestJob.query.clone()
			.addFilter('IDIngestJob', pIDIngestJob);

		this.fable.DAL.IngestJob.doRead(tmpReadQuery,
			(pError, pQuery, pRecord) =>
			{
				if (pError || !pRecord)
				{
					return fCallback(pError || new Error('Job not found'));
				}

				let tmpTimestamp = new Date().toISOString();
				let tmpCurrentLog = pRecord.Log || '';
				let tmpNewLog = tmpCurrentLog + `[${tmpTimestamp}] ${pMessage}\n`;

				let tmpUpdateQuery = this.fable.DAL.IngestJob.query.clone()
					.addRecord({ IDIngestJob: pIDIngestJob, Log: tmpNewLog });

				this.fable.DAL.IngestJob.doUpdate(tmpUpdateQuery,
					(pUpdateError) =>
					{
						return fCallback(pUpdateError);
					});
			});
	}

	/**
	 * Parse a CSV string into an array of objects.
	 *
	 * @param {string} pCSVContent - Raw CSV text
	 * @param {object} [pOptions] - Options: delimiter, columns (boolean), stripCommentLines (boolean)
	 * @param {function} fCallback - Callback(pError, pRecords)
	 */
	parseCSV(pCSVContent, pOptions, fCallback)
	{
		if (typeof pOptions === 'function')
		{
			fCallback = pOptions;
			pOptions = {};
		}

		let tmpContent = pCSVContent;

		// Strip comment lines (e.g. USGS RDB format uses # prefix for metadata)
		if (pOptions && pOptions.stripCommentLines)
		{
			tmpContent = tmpContent.split('\n')
				.filter((pLine) => !pLine.startsWith('#'))
				.join('\n');
		}

		let tmpParseOptions = {
			columns: (pOptions && pOptions.columns !== undefined) ? pOptions.columns : true,
			skip_empty_lines: true,
			trim: true,
			delimiter: (pOptions && pOptions.delimiter) ? pOptions.delimiter : ','
		};

		try
		{
			let libCSVParseSync = require('csv-parse/sync');
			let tmpRecords = libCSVParseSync.parse(tmpContent, tmpParseOptions);
			return fCallback(null, tmpRecords);
		}
		catch (pError)
		{
			return fCallback(pError);
		}
	}

	/**
	 * Parse an XML string into an array of objects.
	 *
	 * @param {string} pXMLContent - Raw XML text
	 * @param {object} [pOptions] - Options: recordPath (dot-separated path to records array)
	 * @param {function} fCallback - Callback(pError, pRecords)
	 */
	parseXML(pXMLContent, pOptions, fCallback)
	{
		if (typeof pOptions === 'function')
		{
			fCallback = pOptions;
			pOptions = {};
		}

		try
		{
			let { XMLParser } = require('fast-xml-parser');
			let tmpParser = new XMLParser(
				{
					ignoreAttributes: false,
					attributeNamePrefix: '@_'
				});
			let tmpParsed = tmpParser.parse(pXMLContent);

			let tmpRecords = null;

			// If recordPath is given, navigate to it
			if (pOptions && pOptions.recordPath)
			{
				let tmpParts = pOptions.recordPath.split('.');
				let tmpCurrent = tmpParsed;
				for (let i = 0; i < tmpParts.length; i++)
				{
					if (tmpCurrent && typeof tmpCurrent === 'object' && tmpParts[i] in tmpCurrent)
					{
						tmpCurrent = tmpCurrent[tmpParts[i]];
					}
					else
					{
						return fCallback(new Error(`recordPath '${pOptions.recordPath}' not found in XML`));
					}
				}
				tmpRecords = Array.isArray(tmpCurrent) ? tmpCurrent : [tmpCurrent];
			}
			else
			{
				// Smart extraction: walk tree looking for first array-valued key
				tmpRecords = this._extractXMLRecords(tmpParsed);
			}

			if (!tmpRecords)
			{
				// Wrap the entire parsed result as a single record
				tmpRecords = [tmpParsed];
			}

			return fCallback(null, tmpRecords);
		}
		catch (pError)
		{
			return fCallback(pError);
		}
	}

	/**
	 * Walk an XML-parsed object looking for the first array of records.
	 * @private
	 */
	_extractXMLRecords(pObject)
	{
		if (!pObject || typeof pObject !== 'object')
		{
			return null;
		}

		let tmpKeys = Object.keys(pObject);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpValue = pObject[tmpKeys[i]];
			if (Array.isArray(tmpValue) && tmpValue.length > 0 && typeof tmpValue[0] === 'object')
			{
				return tmpValue;
			}
		}

		// Recurse one level deeper
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpValue = pObject[tmpKeys[i]];
			if (typeof tmpValue === 'object' && !Array.isArray(tmpValue))
			{
				let tmpResult = this._extractXMLRecords(tmpValue);
				if (tmpResult)
				{
					return tmpResult;
				}
			}
		}

		return null;
	}

	/**
	 * Parse an Excel buffer into an array of objects.
	 *
	 * @param {Buffer} pExcelBuffer - Excel file data as a Buffer
	 * @param {object} [pOptions] - Options: sheet (sheet name or index)
	 * @param {function} fCallback - Callback(pError, pRecords)
	 */
	parseExcel(pExcelBuffer, pOptions, fCallback)
	{
		if (typeof pOptions === 'function')
		{
			fCallback = pOptions;
			pOptions = {};
		}

		try
		{
			let libXLSX = require('xlsx');
			let tmpWorkbook = libXLSX.read(pExcelBuffer, { type: 'buffer' });

			let tmpSheetName;
			if (pOptions && pOptions.sheet !== undefined)
			{
				if (typeof pOptions.sheet === 'number')
				{
					tmpSheetName = tmpWorkbook.SheetNames[pOptions.sheet];
				}
				else
				{
					tmpSheetName = pOptions.sheet;
				}
			}
			else
			{
				tmpSheetName = tmpWorkbook.SheetNames[0];
			}

			if (!tmpSheetName || !tmpWorkbook.Sheets[tmpSheetName])
			{
				return fCallback(new Error(`Sheet '${tmpSheetName}' not found in workbook`));
			}

			let tmpRecords = libXLSX.utils.sheet_to_json(tmpWorkbook.Sheets[tmpSheetName]);
			return fCallback(null, tmpRecords);
		}
		catch (pError)
		{
			return fCallback(pError);
		}
	}

	/**
	 * Parse fixed-width text into an array of objects.
	 *
	 * @param {string} pContent - Fixed-width text content
	 * @param {object} pOptions - Required: columns (array of {name, start, width}), optional: skipLines
	 * @param {function} fCallback - Callback(pError, pRecords)
	 */
	parseFixedWidth(pContent, pOptions, fCallback)
	{
		if (typeof pOptions === 'function')
		{
			fCallback = pOptions;
			pOptions = {};
		}

		if (!pOptions || !pOptions.columns || !Array.isArray(pOptions.columns) || pOptions.columns.length === 0)
		{
			return fCallback(new Error('parseFixedWidth requires pOptions.columns array of {name, start, width}'));
		}

		try
		{
			let tmpLines = pContent.split('\n');
			let tmpSkipLines = (pOptions.skipLines) ? parseInt(pOptions.skipLines, 10) : 0;
			let tmpRecords = [];

			for (let i = tmpSkipLines; i < tmpLines.length; i++)
			{
				let tmpLine = tmpLines[i];
				// Skip blank lines
				if (!tmpLine || tmpLine.trim().length === 0)
				{
					continue;
				}

				let tmpRecord = {};
				for (let j = 0; j < pOptions.columns.length; j++)
				{
					let tmpCol = pOptions.columns[j];
					// start is 1-based
					let tmpStartIdx = (tmpCol.start - 1);
					let tmpValue = tmpLine.substring(tmpStartIdx, tmpStartIdx + tmpCol.width).trim();
					tmpRecord[tmpCol.name] = tmpValue;
				}
				tmpRecords.push(tmpRecord);
			}

			return fCallback(null, tmpRecords);
		}
		catch (pError)
		{
			return fCallback(pError);
		}
	}

	/**
	 * Parse a JSON string into an array of objects.
	 * Handles both arrays and single objects.
	 *
	 * @param {string} pJSONContent - Raw JSON text
	 * @param {function} fCallback - Callback(pError, pRecords)
	 */
	parseJSON(pJSONContent, fCallback)
	{
		try
		{
			let tmpParsed = JSON.parse(pJSONContent);

			if (Array.isArray(tmpParsed))
			{
				return fCallback(null, tmpParsed);
			}
			else if (typeof tmpParsed === 'object' && tmpParsed !== null)
			{
				// If it has a data/records/rows key, extract that
				if (Array.isArray(tmpParsed.data))
				{
					return fCallback(null, tmpParsed.data);
				}
				if (Array.isArray(tmpParsed.records))
				{
					return fCallback(null, tmpParsed.records);
				}
				if (Array.isArray(tmpParsed.rows))
				{
					return fCallback(null, tmpParsed.rows);
				}
				// Single object -- wrap in array
				return fCallback(null, [tmpParsed]);
			}
			else
			{
				return fCallback(new Error('JSON content is not an object or array'));
			}
		}
		catch (pError)
		{
			return fCallback(pError);
		}
	}

	/**
	 * Ingest a file (CSV or JSON) into a dataset from a source.
	 *
	 * @param {string} pFilePath - Absolute path to the file
	 * @param {number} pIDDataset - Target dataset ID
	 * @param {number} pIDSource - Source ID
	 * @param {object} [pOptions] - Options: format (csv/json), type, delimiter
	 * @param {function} fCallback - Callback(pError, pResult)
	 */
	ingestFile(pFilePath, pIDDataset, pIDSource, pOptions, fCallback)
	{
		if (typeof pOptions === 'function')
		{
			fCallback = pOptions;
			pOptions = {};
		}

		let tmpFormat = (pOptions && pOptions.format) ? pOptions.format.toLowerCase() : '';
		let tmpRecordType = (pOptions && pOptions.type) ? pOptions.type : 'file-ingest';
		let tmpDelimiter = (pOptions && pOptions.delimiter) ? pOptions.delimiter : ',';

		let tmpStripComments = (pOptions && pOptions.stripCommentLines) ? true : false;

		// Auto-detect format from extension if not specified
		if (!tmpFormat)
		{
			let tmpExt = libPath.extname(pFilePath).toLowerCase();
			if (tmpExt === '.csv' || tmpExt === '.tsv')
			{
				tmpFormat = 'csv';
				if (tmpExt === '.tsv') tmpDelimiter = '\t';
			}
			else if (tmpExt === '.json')
			{
				tmpFormat = 'json';
			}
			else if (tmpExt === '.xml')
			{
				tmpFormat = 'xml';
			}
			else if (tmpExt === '.xlsx' || tmpExt === '.xls')
			{
				tmpFormat = 'excel';
			}
			else if (tmpExt === '.fw' || tmpExt === '.dat')
			{
				tmpFormat = 'fixed-width';
			}
			else if (tmpExt === '.rdb')
			{
				tmpFormat = 'csv';
				tmpDelimiter = '\t';
				tmpStripComments = true;
			}
			else
			{
				return fCallback(new Error(`Cannot determine format for file extension: ${tmpExt}`));
			}
		}

		// Read the file (binary for Excel, utf8 for everything else)
		let tmpContent;
		try
		{
			if (tmpFormat === 'excel')
			{
				tmpContent = libFs.readFileSync(pFilePath);
			}
			else
			{
				tmpContent = libFs.readFileSync(pFilePath, 'utf8');
			}
		}
		catch (pReadError)
		{
			return fCallback(pReadError);
		}

		// Parse based on format
		let tmpParseCallback = (pParseError, pParsedRecords) =>
		{
			if (pParseError)
			{
				return fCallback(pParseError);
			}

			if (!pParsedRecords || pParsedRecords.length === 0)
			{
				return fCallback(null, { Ingested: 0, Errors: 0, Total: 0 });
			}

			// Ingest each parsed record into the Record table
			let tmpAnticipate = this.fable.newAnticipate();
			let tmpIngested = 0;
			let tmpErrors = 0;
			let tmpIngestedRecords = [];

			for (let i = 0; i < pParsedRecords.length; i++)
			{
				let tmpRowData = pParsedRecords[i];

				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						let tmpRecordData = {
							IDDataset: pIDDataset,
							IDSource: pIDSource,
							Type: tmpRecordType,
							Version: 1,
							IngestDate: new Date().toISOString(),
							Content: (typeof tmpRowData === 'string') ? tmpRowData : JSON.stringify(tmpRowData)
						};

						let tmpQuery = this.fable.DAL.Record.query.clone()
							.addRecord(tmpRecordData);

						this.fable.DAL.Record.doCreate(tmpQuery,
							(pCreateError, pQuery, pQueryRead, pRecord) =>
							{
								if (pCreateError)
								{
									tmpErrors++;
									return fStepCallback();
								}

								tmpIngested++;
								tmpIngestedRecords.push(pRecord);

								// Auto-create certainty index
								let tmpCertaintyValue = this.options.DefaultCertaintyValue || 0.5;
								let tmpCIQuery = this.fable.DAL.CertaintyIndex.query.clone()
									.addRecord(
										{
											IDRecord: pRecord.IDRecord,
											CertaintyValue: tmpCertaintyValue,
											Dimension: 'overall',
											Justification: 'Default file-ingest certainty'
										});

								this.fable.DAL.CertaintyIndex.doCreate(tmpCIQuery,
									(pCIError) =>
									{
										return fStepCallback();
									});
							});
					});
			}

			tmpAnticipate.wait(
				(pWaitError) =>
				{
					return fCallback(null,
						{
							Ingested: tmpIngested,
							Errors: tmpErrors,
							Total: pParsedRecords.length,
							Records: tmpIngestedRecords,
							Format: tmpFormat,
							FilePath: pFilePath
						});
				});
		};

		if (tmpFormat === 'csv')
		{
			this.parseCSV(tmpContent, { delimiter: tmpDelimiter, stripCommentLines: tmpStripComments }, tmpParseCallback);
		}
		else if (tmpFormat === 'json')
		{
			this.parseJSON(tmpContent, tmpParseCallback);
		}
		else if (tmpFormat === 'xml')
		{
			this.parseXML(tmpContent, pOptions || {}, tmpParseCallback);
		}
		else if (tmpFormat === 'excel')
		{
			this.parseExcel(tmpContent, pOptions || {}, tmpParseCallback);
		}
		else if (tmpFormat === 'fixed-width')
		{
			this.parseFixedWidth(tmpContent, pOptions || {}, tmpParseCallback);
		}
		else
		{
			return fCallback(new Error(`Unsupported format: ${tmpFormat}`));
		}
	}

	/**
	 * Connect REST API routes for ingest operations.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// GET /facto/ingest/jobs -- list all ingest jobs
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/ingest/jobs`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.IngestJob)
				{
					pResponse.send({ Jobs: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.IngestJob.query.clone()
					.addFilter('Deleted', 0)
					.setCap(100);

				this.fable.DAL.IngestJob.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`IngestEngine error listing jobs: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Jobs: [] });
							return fNext();
						}
						pResponse.send({ Count: pRecords.length, Jobs: pRecords });
						return fNext();
					});
			});

		// GET /facto/ingest/job/:IDIngestJob -- get a single ingest job with details
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/ingest/job/:IDIngestJob`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDIngestJob = parseInt(pRequest.params.IDIngestJob, 10);
				if (isNaN(tmpIDIngestJob) || tmpIDIngestJob < 1)
				{
					pResponse.send({ Error: 'Invalid IDIngestJob parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.IngestJob)
				{
					pResponse.send({ Error: 'IngestJob DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.IngestJob.query.clone()
					.addFilter('IDIngestJob', tmpIDIngestJob);

				this.fable.DAL.IngestJob.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError || !pRecord)
						{
							pResponse.send({ Error: pError ? (pError.message || pError) : 'Job not found' });
							return fNext();
						}
						pResponse.send({ Job: pRecord });
						return fNext();
					});
			});

		// POST /facto/ingest/job -- create a new ingest job
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/ingest/job`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.IngestJob)
				{
					pResponse.send({ Error: 'IngestJob DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpIDSource = parseInt(tmpBody.IDSource, 10) || 0;
				let tmpIDDataset = parseInt(tmpBody.IDDataset, 10) || 0;
				let tmpConfiguration = tmpBody.Configuration || '';

				if (typeof tmpConfiguration === 'object')
				{
					tmpConfiguration = JSON.stringify(tmpConfiguration);
				}

				let tmpJobData = {
					IDSource: tmpIDSource,
					IDDataset: tmpIDDataset,
					Status: 'Pending',
					RecordsProcessed: 0,
					RecordsCreated: 0,
					RecordsUpdated: 0,
					RecordsErrored: 0,
					Configuration: tmpConfiguration,
					Log: `[${new Date().toISOString()}] Job created\n`
				};

				let tmpQuery = this.fable.DAL.IngestJob.query.clone()
					.addRecord(tmpJobData);

				this.fable.DAL.IngestJob.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`IngestEngine error creating job: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Job: pRecord });
						return fNext();
					});
			});

		// PUT /facto/ingest/job/:IDIngestJob/start -- mark a job as running
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/ingest/job/:IDIngestJob/start`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDIngestJob = parseInt(pRequest.params.IDIngestJob, 10);
				if (isNaN(tmpIDIngestJob) || tmpIDIngestJob < 1)
				{
					pResponse.send({ Error: 'Invalid IDIngestJob parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.IngestJob)
				{
					pResponse.send({ Error: 'IngestJob DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.IngestJob.query.clone()
					.addRecord(
						{
							IDIngestJob: tmpIDIngestJob,
							Status: 'Running',
							StartDate: new Date().toISOString()
						});

				this.fable.DAL.IngestJob.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}

						this.appendJobLog(tmpIDIngestJob, 'Job started',
							() =>
							{
								pResponse.send({ Success: true, Job: pRecord });
								return fNext();
							});
					});
			});

		// PUT /facto/ingest/job/:IDIngestJob/complete -- mark a job as completed
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/ingest/job/:IDIngestJob/complete`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDIngestJob = parseInt(pRequest.params.IDIngestJob, 10);
				if (isNaN(tmpIDIngestJob) || tmpIDIngestJob < 1)
				{
					pResponse.send({ Error: 'Invalid IDIngestJob parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.IngestJob)
				{
					pResponse.send({ Error: 'IngestJob DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};

				let tmpUpdateData = {
					IDIngestJob: tmpIDIngestJob,
					Status: tmpBody.Status || 'Completed',
					EndDate: new Date().toISOString()
				};

				// Allow updating counters
				if (tmpBody.RecordsProcessed !== undefined)
				{
					tmpUpdateData.RecordsProcessed = parseInt(tmpBody.RecordsProcessed, 10) || 0;
				}
				if (tmpBody.RecordsCreated !== undefined)
				{
					tmpUpdateData.RecordsCreated = parseInt(tmpBody.RecordsCreated, 10) || 0;
				}
				if (tmpBody.RecordsUpdated !== undefined)
				{
					tmpUpdateData.RecordsUpdated = parseInt(tmpBody.RecordsUpdated, 10) || 0;
				}
				if (tmpBody.RecordsErrored !== undefined)
				{
					tmpUpdateData.RecordsErrored = parseInt(tmpBody.RecordsErrored, 10) || 0;
				}

				// Validate status
				if (VALID_JOB_STATUSES.indexOf(tmpUpdateData.Status) < 0)
				{
					tmpUpdateData.Status = 'Completed';
				}

				let tmpQuery = this.fable.DAL.IngestJob.query.clone()
					.addRecord(tmpUpdateData);

				this.fable.DAL.IngestJob.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}

						this.appendJobLog(tmpIDIngestJob, `Job ${tmpUpdateData.Status.toLowerCase()}`,
							() =>
							{
								pResponse.send({ Success: true, Job: pRecord });
								return fNext();
							});
					});
			});

		// POST /facto/ingest/file -- ingest CSV or JSON data from request body
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/ingest/file`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'Record DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpIDDataset = parseInt(tmpBody.IDDataset, 10) || 0;
				let tmpIDSource = parseInt(tmpBody.IDSource, 10) || 0;
				let tmpFormat = (tmpBody.Format || '').toLowerCase();
				let tmpRecordType = tmpBody.Type || 'file-ingest';
				let tmpDelimiter = tmpBody.Delimiter || ',';
				let tmpContent = tmpBody.Content || '';
				let tmpColumns = tmpBody.Columns || null;
				let tmpStripComments = tmpBody.StripCommentLines || false;

				if (!tmpContent)
				{
					pResponse.send({ Error: 'Content is required (raw CSV, JSON, XML, or fixed-width string)', Ingested: 0 });
					return fNext();
				}

				if (!tmpFormat)
				{
					// Attempt auto-detect
					let tmpTrimmed = tmpContent.trim();
					if (tmpTrimmed.startsWith('[') || tmpTrimmed.startsWith('{'))
					{
						tmpFormat = 'json';
					}
					else if (tmpTrimmed.startsWith('<?xml') || tmpTrimmed.startsWith('<'))
					{
						tmpFormat = 'xml';
					}
					else
					{
						tmpFormat = 'csv';
					}
				}

				let tmpParseCallback = (pParseError, pParsedRecords) =>
				{
					if (pParseError)
					{
						pResponse.send({ Error: 'Parse error: ' + pParseError.message, Ingested: 0 });
						return fNext();
					}

					if (!pParsedRecords || pParsedRecords.length === 0)
					{
						pResponse.send({ Ingested: 0, Errors: 0, Total: 0, Format: tmpFormat });
						return fNext();
					}

					let tmpAnticipate = this.fable.newAnticipate();
					let tmpIngested = 0;
					let tmpErrors = 0;
					let tmpIngestedRecords = [];

					for (let i = 0; i < pParsedRecords.length; i++)
					{
						let tmpRowData = pParsedRecords[i];

						tmpAnticipate.anticipate(
							(fStepCallback) =>
							{
								let tmpRecordData = {
									IDDataset: tmpIDDataset,
									IDSource: tmpIDSource,
									Type: tmpRecordType,
									Version: 1,
									IngestDate: new Date().toISOString(),
									Content: (typeof tmpRowData === 'string') ? tmpRowData : JSON.stringify(tmpRowData)
								};

								let tmpQuery = this.fable.DAL.Record.query.clone()
									.addRecord(tmpRecordData);

								this.fable.DAL.Record.doCreate(tmpQuery,
									(pCreateError, pQuery, pQueryRead, pRecord) =>
									{
										if (pCreateError)
										{
											tmpErrors++;
											return fStepCallback();
										}

										tmpIngested++;
										tmpIngestedRecords.push(pRecord);

										// Auto-create certainty index
										let tmpCertaintyValue = this.options.DefaultCertaintyValue || 0.5;
										let tmpCIQuery = this.fable.DAL.CertaintyIndex.query.clone()
											.addRecord(
												{
													IDRecord: pRecord.IDRecord,
													CertaintyValue: tmpCertaintyValue,
													Dimension: 'overall',
													Justification: 'Default file-ingest certainty'
												});

										this.fable.DAL.CertaintyIndex.doCreate(tmpCIQuery,
											(pCIError) =>
											{
												return fStepCallback();
											});
									});
							});
					}

					tmpAnticipate.wait(
						(pWaitError) =>
						{
							pResponse.send(
								{
									Ingested: tmpIngested,
									Errors: tmpErrors,
									Total: pParsedRecords.length,
									Records: tmpIngestedRecords,
									Format: tmpFormat
								});
							return fNext();
						});
				};

				if (tmpFormat === 'csv')
				{
					this.parseCSV(tmpContent, { delimiter: tmpDelimiter, stripCommentLines: tmpStripComments }, tmpParseCallback);
				}
				else if (tmpFormat === 'json')
				{
					this.parseJSON(tmpContent, tmpParseCallback);
				}
				else if (tmpFormat === 'xml')
				{
					this.parseXML(tmpContent, {}, tmpParseCallback);
				}
				else if (tmpFormat === 'excel')
				{
					// Excel content comes as base64-encoded
					try
					{
						let tmpBuffer = Buffer.from(tmpContent, 'base64');
						this.parseExcel(tmpBuffer, {}, tmpParseCallback);
					}
					catch (pDecodeError)
					{
						pResponse.send({ Error: 'Failed to decode base64 Excel content: ' + pDecodeError.message, Ingested: 0 });
						return fNext();
					}
				}
				else if (tmpFormat === 'fixed-width')
				{
					if (!tmpColumns)
					{
						pResponse.send({ Error: 'Columns specification required for fixed-width format (array of {name, start, width})', Ingested: 0 });
						return fNext();
					}
					this.parseFixedWidth(tmpContent, { columns: tmpColumns }, tmpParseCallback);
				}
				else
				{
					pResponse.send({ Error: `Unsupported format: ${tmpFormat}`, Ingested: 0 });
					return fNext();
				}
			});

		// GET /facto/ingest/statuses -- list valid job statuses
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/ingest/statuses`,
			(pRequest, pResponse, fNext) =>
			{
				pResponse.send({ Statuses: VALID_JOB_STATUSES });
				return fNext();
			});

		this.fable.log.info(`IngestEngine routes connected at ${tmpRoutePrefix}/ingest/*`);
	}
}

module.exports = RetoldFactoIngestEngine;
module.exports.serviceType = 'RetoldFactoIngestEngine';
module.exports.default_configuration = defaultIngestEngineOptions;
