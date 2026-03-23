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
const libMeadowIntegration = require('meadow-integration');
const libCrypto = require('crypto');
const libFs = require('fs');
const libPath = require('path');
const libHttp = require('http');
const libHttps = require('https');

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

		this.fable.addAndInstantiateServiceTypeIfNotExists('MeadowIntegrationFileParser', libMeadowIntegration.FileParser);
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
	 * Compute a SHA-256 content signature for a piece of raw content.
	 *
	 * @param {string|Buffer} pContent - Raw content to hash
	 * @returns {string} Hex-encoded SHA-256 hash
	 */
	computeContentSignature(pContent)
	{
		return libCrypto.createHash('sha256').update(pContent).digest('hex');
	}

	/**
	 * Get the next dataset version number for a given dataset.
	 * Queries IngestJob for the max DatasetVersion and returns max + 1.
	 *
	 * @param {number} pIDDataset - Dataset ID
	 * @param {function} fCallback - Callback(pError, pNextVersion)
	 */
	getNextDatasetVersion(pIDDataset, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.IngestJob)
		{
			return fCallback(null, 1);
		}

		let tmpQuery = this.fable.DAL.IngestJob.query.clone()
			.addFilter('IDDataset', pIDDataset)
			.addFilter('Deleted', 0);

		this.fable.DAL.IngestJob.doReads(tmpQuery,
			(pError, pQuery, pRecords) =>
			{
				if (pError || !pRecords || pRecords.length === 0)
				{
					return fCallback(null, 1);
				}

				let tmpMaxVersion = 0;
				for (let i = 0; i < pRecords.length; i++)
				{
					let tmpVersion = parseInt(pRecords[i].DatasetVersion, 10) || 0;
					if (tmpVersion > tmpMaxVersion)
					{
						tmpMaxVersion = tmpVersion;
					}
				}
				return fCallback(null, tmpMaxVersion + 1);
			});
	}

	/**
	 * Check if an identical content signature already exists for a dataset.
	 *
	 * @param {number} pIDDataset - Dataset ID
	 * @param {string} pSignature - SHA-256 hex hash
	 * @param {function} fCallback - Callback(pError, pResult) where pResult = { isDuplicate, matchingVersion }
	 */
	checkDuplicateSignature(pIDDataset, pSignature, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.IngestJob)
		{
			return fCallback(null, { isDuplicate: false, matchingVersion: null });
		}

		let tmpQuery = this.fable.DAL.IngestJob.query.clone()
			.addFilter('IDDataset', pIDDataset)
			.addFilter('ContentSignature', pSignature)
			.addFilter('Deleted', 0);

		this.fable.DAL.IngestJob.doReads(tmpQuery,
			(pError, pQuery, pRecords) =>
			{
				if (pError || !pRecords || pRecords.length === 0)
				{
					return fCallback(null, { isDuplicate: false, matchingVersion: null });
				}

				return fCallback(null,
					{
						isDuplicate: true,
						matchingVersion: parseInt(pRecords[0].DatasetVersion, 10) || 0
					});
			});
	}

	/**
	 * Enforce the dataset's VersionPolicy before a new import.
	 * If 'Replace': soft-delete all existing Records for the dataset.
	 * If 'Append': no-op.
	 *
	 * @param {number} pIDDataset - Dataset ID
	 * @param {function} fCallback - Callback(pError)
	 */
	enforceVersionPolicy(pIDDataset, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.Dataset || !this.fable.DAL.Record)
		{
			return fCallback();
		}

		// Read the Dataset to get its VersionPolicy
		let tmpDatasetQuery = this.fable.DAL.Dataset.query.clone()
			.addFilter('IDDataset', pIDDataset);

		this.fable.DAL.Dataset.doRead(tmpDatasetQuery,
			(pError, pQuery, pDataset) =>
			{
				if (pError || !pDataset)
				{
					return fCallback();
				}

				let tmpPolicy = pDataset.VersionPolicy || 'Append';

				if (tmpPolicy !== 'Replace')
				{
					return fCallback();
				}

				// Soft-delete all existing non-deleted records for this dataset
				let tmpRecordQuery = this.fable.DAL.Record.query.clone()
					.addFilter('IDDataset', pIDDataset)
					.addFilter('Deleted', 0);

				this.fable.DAL.Record.doReads(tmpRecordQuery,
					(pReadError, pReadQuery, pRecords) =>
					{
						if (pReadError || !pRecords || pRecords.length === 0)
						{
							return fCallback();
						}

						let tmpAnticipate = this.fable.newAnticipate();

						for (let i = 0; i < pRecords.length; i++)
						{
							let tmpRecord = pRecords[i];
							tmpAnticipate.anticipate(
								(fStep) =>
								{
									let tmpDeleteQuery = this.fable.DAL.Record.query.clone()
										.addRecord(
											{
												IDRecord: tmpRecord.IDRecord,
												Deleted: 1,
												DeleteDate: new Date().toISOString()
											});

									this.fable.DAL.Record.doUpdate(tmpDeleteQuery,
										(pDelError) =>
										{
											return fStep();
										});
								});
						}

						tmpAnticipate.wait(
							(pWaitError) =>
							{
								this.fable.log.info(`VersionPolicy Replace: soft-deleted ${pRecords.length} existing records for dataset ${pIDDataset}`);
								return fCallback();
							});
					});
			});
	}

	/**
	 * Create an IngestJob record for a content import.
	 *
	 * @param {object} pJobData - { IDDataset, IDSource, DatasetVersion, ContentSignature, RecordCount, Format }
	 * @param {function} fCallback - Callback(pError, pIngestJob)
	 */
	createIngestJob(pJobData, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.IngestJob)
		{
			return fCallback(null, null);
		}

		let tmpJobRecord = {
			IDDataset: pJobData.IDDataset || 0,
			IDSource: pJobData.IDSource || 0,
			Status: 'Completed',
			StartDate: new Date().toISOString(),
			EndDate: new Date().toISOString(),
			RecordsProcessed: pJobData.RecordCount || 0,
			RecordsCreated: pJobData.RecordCount || 0,
			RecordsUpdated: 0,
			RecordsErrored: pJobData.ErrorCount || 0,
			DatasetVersion: pJobData.DatasetVersion || 0,
			ContentSignature: pJobData.ContentSignature || '',
			Configuration: JSON.stringify({ Format: pJobData.Format || 'unknown' }),
			Log: `[${new Date().toISOString()}] Auto-created by ingest (v${pJobData.DatasetVersion || 0})\n`
		};

		let tmpQuery = this.fable.DAL.IngestJob.query.clone()
			.addRecord(tmpJobRecord);

		this.fable.DAL.IngestJob.doCreate(tmpQuery,
			(pError, pQuery, pQueryRead, pRecord) =>
			{
				if (pError)
				{
					this.fable.log.error(`Error creating IngestJob: ${pError}`);
					return fCallback(pError);
				}
				return fCallback(null, pRecord);
			});
	}

	/**
	 * Navigate a nested object using a dot-separated path with optional
	 * array index notation (e.g. "Results.series[0].data").
	 * Delegates to MeadowIntegrationFileParserJSON.
	 *
	 * @param {object} pObject - The object to navigate
	 * @param {string} pPath - Dot-separated path, segments may include [n]
	 * @returns {*} The resolved value, or null if the path is invalid
	 */
	_resolveDataPath(pObject, pPath)
	{
		return this.fable.MeadowIntegrationFileParserJSON._resolveDataPath(pObject, pPath);
	}

	/**
	 * Parse a CSV string into an array of objects.
	 * Delegates to MeadowIntegrationFileParser.
	 *
	 * @param {string} pCSVContent - Raw CSV text
	 * @param {object} [pOptions] - Options: delimiter, stripCommentLines (boolean)
	 * @param {function} fCallback - Callback(pError, pRecords)
	 */
	parseCSV(pCSVContent, pOptions, fCallback)
	{
		if (typeof pOptions === 'function')
		{
			fCallback = pOptions;
			pOptions = {};
		}

		let tmpParseOptions = { format: 'csv' };
		if (pOptions && pOptions.delimiter)
		{
			tmpParseOptions.delimiter = pOptions.delimiter;
		}
		if (pOptions && pOptions.stripCommentLines)
		{
			tmpParseOptions.commentPrefix = '#';
		}

		return this.fable.MeadowIntegrationFileParser.parseContent(pCSVContent, tmpParseOptions, fCallback);
	}

	/**
	 * Parse an XML string into an array of objects.
	 * Delegates to MeadowIntegrationFileParser.
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

		let tmpParseOptions = Object.assign({ format: 'xml' }, pOptions);
		return this.fable.MeadowIntegrationFileParser.parseContent(pXMLContent, tmpParseOptions, fCallback);
	}

	/**
	 * Parse an Excel buffer into an array of objects.
	 * Delegates to MeadowIntegrationFileParser.
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

		let tmpParseOptions = { format: 'xlsx' };
		if (pOptions && pOptions.sheet !== undefined)
		{
			if (typeof pOptions.sheet === 'number')
			{
				tmpParseOptions.sheetIndex = pOptions.sheet;
			}
			else
			{
				tmpParseOptions.sheetName = pOptions.sheet;
			}
		}

		return this.fable.MeadowIntegrationFileParser.parseContent(pExcelBuffer, tmpParseOptions, fCallback);
	}

	/**
	 * Parse fixed-width text into an array of objects.
	 * Delegates to MeadowIntegrationFileParser.
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

		let tmpParseOptions = Object.assign({ format: 'fixedwidth' }, pOptions);
		return this.fable.MeadowIntegrationFileParser.parseContent(pContent, tmpParseOptions, fCallback);
	}

	/**
	 * Parse a JSON string into an array of objects.
	 * Delegates to MeadowIntegrationFileParser.
	 *
	 * @param {string} pJSONContent - Raw JSON text
	 * @param {object} [pOptions] - Options: dataPath (dot-separated path to records array)
	 * @param {function} fCallback - Callback(pError, pRecords)
	 */
	parseJSON(pJSONContent, pOptions, fCallback)
	{
		if (typeof pOptions === 'function')
		{
			fCallback = pOptions;
			pOptions = {};
		}

		let tmpParseOptions = { format: 'json' };
		if (pOptions && pOptions.dataPath)
		{
			tmpParseOptions.rootPath = pOptions.dataPath;
		}

		return this.fable.MeadowIntegrationFileParser.parseContent(pJSONContent, tmpParseOptions, fCallback);
	}

	/**
	 * Download content from a URL using Node's built-in http/https.
	 * Follows 3xx redirects (up to 5 hops), has a 30-second timeout.
	 *
	 * @param {string} pURL - The URL to download
	 * @param {function} fCallback - Callback(pError, pBuffer)
	 */
	downloadURL(pURL, fCallback)
	{
		let tmpMaxRedirects = 5;

		let tmpDoRequest = (pRequestURL, pRedirectCount) =>
		{
			if (pRedirectCount > tmpMaxRedirects)
			{
				return fCallback(new Error('Too many redirects (max ' + tmpMaxRedirects + ')'));
			}

			let tmpLib = pRequestURL.startsWith('https') ? libHttps : libHttp;

			let tmpRequest = tmpLib.get(pRequestURL,
				(pResponse) =>
				{
					// Follow redirects
					if (pResponse.statusCode >= 300 && pResponse.statusCode < 400 && pResponse.headers.location)
					{
						let tmpRedirectURL = pResponse.headers.location;
						// Handle relative redirect URLs
						if (tmpRedirectURL.startsWith('/'))
						{
							let tmpParsed = new URL(pRequestURL);
							tmpRedirectURL = tmpParsed.protocol + '//' + tmpParsed.host + tmpRedirectURL;
						}
						pResponse.resume();
						return tmpDoRequest(tmpRedirectURL, pRedirectCount + 1);
					}

					if (pResponse.statusCode !== 200)
					{
						pResponse.resume();
						return fCallback(new Error('HTTP ' + pResponse.statusCode + ' from ' + pRequestURL));
					}

					let tmpChunks = [];
					pResponse.on('data',
						(pChunk) =>
						{
							tmpChunks.push(pChunk);
						});
					pResponse.on('end',
						() =>
						{
							return fCallback(null, Buffer.concat(tmpChunks));
						});
					pResponse.on('error',
						(pStreamError) =>
						{
							return fCallback(pStreamError);
						});
				});

			tmpRequest.on('error',
				(pRequestError) =>
				{
					return fCallback(pRequestError);
				});

			tmpRequest.setTimeout(30000,
				() =>
				{
					tmpRequest.destroy();
					return fCallback(new Error('Request timeout after 30 seconds'));
				});
		};

		tmpDoRequest(pURL, 0);
	}

	/**
	 * Ingest raw content (string or Buffer) into a dataset from a source.
	 * Parses the content, runs the version/signature pipeline, and creates
	 * Record rows with CertaintyIndex entries.
	 *
	 * @param {string|Buffer} pContent - Raw content to ingest
	 * @param {number} pIDDataset - Target dataset ID
	 * @param {number} pIDSource - Source ID
	 * @param {object} [pOptions] - Options: format, type, delimiter, stripCommentLines, dataPath, recordPath, columns
	 * @param {function} fCallback - Callback(pError, pResult)
	 */
	ingestContent(pContent, pIDDataset, pIDSource, pOptions, fCallback)
	{
		if (typeof pOptions === 'function')
		{
			fCallback = pOptions;
			pOptions = {};
		}

		let tmpFormat = (pOptions && pOptions.format) ? pOptions.format.toLowerCase() : '';
		let tmpRecordType = (pOptions && pOptions.type) ? pOptions.type : 'ingest';
		let tmpDelimiter = (pOptions && pOptions.delimiter) ? pOptions.delimiter : ',';
		let tmpStripComments = (pOptions && pOptions.stripCommentLines) ? true : false;
		let tmpDataPath = (pOptions && pOptions.dataPath) ? pOptions.dataPath : '';
		let tmpRecordPath = (pOptions && pOptions.recordPath) ? pOptions.recordPath : '';
		let tmpColumns = (pOptions && pOptions.columns) ? pOptions.columns : null;

		let tmpContentString = (Buffer.isBuffer(pContent)) ? pContent.toString('utf8') : pContent;

		// Auto-detect format if not specified
		if (!tmpFormat)
		{
			let tmpTrimmed = tmpContentString.trim();
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

		// Compute content signature
		let tmpSignature = this.computeContentSignature(tmpContentString);

		let tmpParseCallback = (pParseError, pParsedRecords) =>
		{
			if (pParseError)
			{
				return fCallback(new Error('Parse error: ' + pParseError.message));
			}

			if (!pParsedRecords || pParsedRecords.length === 0)
			{
				return fCallback(null, { Ingested: 0, Errors: 0, Total: 0, Format: tmpFormat });
			}

			// Version/signature pipeline
			let tmpVersionAnticipate = this.fable.newAnticipate();
			let tmpDatasetVersion = 1;
			let tmpDuplicateResult = { isDuplicate: false, matchingVersion: null };
			let tmpIngestJob = null;

			tmpVersionAnticipate.anticipate(
				(fStep) =>
				{
					this.getNextDatasetVersion(pIDDataset,
						(pError, pNextVersion) =>
						{
							tmpDatasetVersion = pNextVersion || 1;
							return fStep();
						});
				});

			tmpVersionAnticipate.anticipate(
				(fStep) =>
				{
					this.checkDuplicateSignature(pIDDataset, tmpSignature,
						(pError, pResult) =>
						{
							if (pResult)
							{
								tmpDuplicateResult = pResult;
								if (pResult.isDuplicate)
								{
									this.fable.log.warn(`Duplicate content detected for dataset ${pIDDataset} (matches version ${pResult.matchingVersion})`);
								}
							}
							return fStep();
						});
				});

			tmpVersionAnticipate.anticipate(
				(fStep) =>
				{
					this.enforceVersionPolicy(pIDDataset, fStep);
				});

			tmpVersionAnticipate.anticipate(
				(fStep) =>
				{
					this.createIngestJob(
						{
							IDDataset: pIDDataset,
							IDSource: pIDSource,
							DatasetVersion: tmpDatasetVersion,
							ContentSignature: tmpSignature,
							RecordCount: pParsedRecords.length,
							Format: tmpFormat
						},
						(pError, pJob) =>
						{
							tmpIngestJob = pJob;
							return fStep();
						});
				});

			tmpVersionAnticipate.wait(
				(pVersionError) =>
				{
					let tmpAnticipate = this.fable.newAnticipate();
					let tmpIngested = 0;
					let tmpErrors = 0;
					let tmpIngestedRecords = [];
					let tmpIDIngestJob = (tmpIngestJob) ? tmpIngestJob.IDIngestJob : 0;

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
									Version: tmpDatasetVersion,
									IDIngestJob: tmpIDIngestJob,
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

										let tmpCertaintyValue = this.options.DefaultCertaintyValue || 0.5;
										let tmpCIQuery = this.fable.DAL.CertaintyIndex.query.clone()
											.addRecord(
												{
													IDRecord: pRecord.IDRecord,
													CertaintyValue: tmpCertaintyValue,
													Dimension: 'overall',
													Justification: 'Default ingest certainty'
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
									DatasetVersion: tmpDatasetVersion,
									ContentSignature: tmpSignature,
									IsDuplicate: tmpDuplicateResult.isDuplicate,
									IngestJob: tmpIngestJob
								});
						});
				});
		};

		let tmpParserOptions = { format: tmpFormat };

		if (tmpFormat === 'csv')
		{
			tmpParserOptions.delimiter = tmpDelimiter;
			if (tmpStripComments) tmpParserOptions.commentPrefix = '#';
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContentString, tmpParserOptions, tmpParseCallback);
		}
		else if (tmpFormat === 'json')
		{
			if (tmpDataPath) tmpParserOptions.rootPath = tmpDataPath;
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContentString, tmpParserOptions, tmpParseCallback);
		}
		else if (tmpFormat === 'xml')
		{
			if (tmpRecordPath) tmpParserOptions.recordPath = tmpRecordPath;
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContentString, tmpParserOptions, tmpParseCallback);
		}
		else if (tmpFormat === 'excel')
		{
			tmpParserOptions.format = 'xlsx';
			let tmpBuffer = Buffer.isBuffer(pContent) ? pContent : Buffer.from(pContent, 'base64');
			this.fable.MeadowIntegrationFileParser.parseContent(tmpBuffer, tmpParserOptions, tmpParseCallback);
		}
		else if (tmpFormat === 'fixed-width' || tmpFormat === 'other')
		{
			if (!tmpColumns)
			{
				return fCallback(new Error('Columns specification required for fixed-width format'));
			}
			tmpParserOptions.format = 'fixedwidth';
			tmpParserOptions.columns = tmpColumns;
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContentString, tmpParserOptions, tmpParseCallback);
		}
		else
		{
			return fCallback(new Error('Unsupported format: ' + tmpFormat));
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

		// Compute content signature from raw content
		let tmpContentForSignature = (tmpFormat === 'excel') ? tmpContent : tmpContent;
		let tmpSignature = this.computeContentSignature(tmpContentForSignature);

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

			// Version/signature pipeline
			let tmpVersionAnticipate = this.fable.newAnticipate();
			let tmpDatasetVersion = 1;
			let tmpDuplicateResult = { isDuplicate: false, matchingVersion: null };
			let tmpIngestJob = null;

			// Step 1: Get next version
			tmpVersionAnticipate.anticipate(
				(fStep) =>
				{
					this.getNextDatasetVersion(pIDDataset,
						(pError, pNextVersion) =>
						{
							tmpDatasetVersion = pNextVersion || 1;
							return fStep();
						});
				});

			// Step 2: Check for duplicate signature
			tmpVersionAnticipate.anticipate(
				(fStep) =>
				{
					this.checkDuplicateSignature(pIDDataset, tmpSignature,
						(pError, pResult) =>
						{
							if (pResult)
							{
								tmpDuplicateResult = pResult;
								if (pResult.isDuplicate)
								{
									this.fable.log.warn(`Duplicate content detected for dataset ${pIDDataset} (matches version ${pResult.matchingVersion})`);
								}
							}
							return fStep();
						});
				});

			// Step 3: Enforce version policy
			tmpVersionAnticipate.anticipate(
				(fStep) =>
				{
					this.enforceVersionPolicy(pIDDataset, fStep);
				});

			// Step 4: Create IngestJob, then create records
			tmpVersionAnticipate.anticipate(
				(fStep) =>
				{
					this.createIngestJob(
						{
							IDDataset: pIDDataset,
							IDSource: pIDSource,
							DatasetVersion: tmpDatasetVersion,
							ContentSignature: tmpSignature,
							RecordCount: pParsedRecords.length,
							Format: tmpFormat
						},
						(pError, pJob) =>
						{
							tmpIngestJob = pJob;
							return fStep();
						});
				});

			tmpVersionAnticipate.wait(
				(pVersionError) =>
				{
					// Now create the records with version info
					let tmpAnticipate = this.fable.newAnticipate();
					let tmpIngested = 0;
					let tmpErrors = 0;
					let tmpIngestedRecords = [];
					let tmpIDIngestJob = (tmpIngestJob) ? tmpIngestJob.IDIngestJob : 0;

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
									Version: tmpDatasetVersion,
									IDIngestJob: tmpIDIngestJob,
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
									FilePath: pFilePath,
									DatasetVersion: tmpDatasetVersion,
									ContentSignature: tmpSignature,
									IsDuplicate: tmpDuplicateResult.isDuplicate,
									IngestJob: tmpIngestJob
								});
						});
				});
		};

		let tmpParserOptions = { format: tmpFormat };

		if (tmpFormat === 'csv')
		{
			tmpParserOptions.delimiter = tmpDelimiter;
			if (tmpStripComments) tmpParserOptions.commentPrefix = '#';
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContent, tmpParserOptions, tmpParseCallback);
		}
		else if (tmpFormat === 'json')
		{
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContent, tmpParserOptions, tmpParseCallback);
		}
		else if (tmpFormat === 'xml')
		{
			if (pOptions && pOptions.recordPath) tmpParserOptions.recordPath = pOptions.recordPath;
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContent, tmpParserOptions, tmpParseCallback);
		}
		else if (tmpFormat === 'excel')
		{
			tmpParserOptions.format = 'xlsx';
			if (pOptions && pOptions.sheet !== undefined)
			{
				if (typeof pOptions.sheet === 'number') tmpParserOptions.sheetIndex = pOptions.sheet;
				else tmpParserOptions.sheetName = pOptions.sheet;
			}
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContent, tmpParserOptions, tmpParseCallback);
		}
		else if (tmpFormat === 'fixed-width')
		{
			tmpParserOptions.format = 'fixedwidth';
			if (pOptions && pOptions.columns) tmpParserOptions.columns = pOptions.columns;
			if (pOptions && pOptions.skipLines !== undefined) tmpParserOptions.skipLines = pOptions.skipLines;
			this.fable.MeadowIntegrationFileParser.parseContent(tmpContent, tmpParserOptions, tmpParseCallback);
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
				let tmpContent = tmpBody.Content || '';

				if (!tmpContent)
				{
					pResponse.send({ Error: 'Content is required (raw CSV, JSON, XML, or fixed-width string)', Ingested: 0 });
					return fNext();
				}

				let tmpIDDataset = parseInt(tmpBody.IDDataset, 10) || 0;
				let tmpIDSource = parseInt(tmpBody.IDSource, 10) || 0;

				let tmpOptions = {
					format: (tmpBody.Format || '').toLowerCase(),
					type: tmpBody.Type || 'file-ingest',
					delimiter: tmpBody.Delimiter || ',',
					stripCommentLines: tmpBody.StripCommentLines || false,
					columns: tmpBody.Columns || null,
					dataPath: tmpBody.DataPath || ''
				};

				this.ingestContent(tmpContent, tmpIDDataset, tmpIDSource, tmpOptions,
					(pError, pResult) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message, Ingested: 0 });
							return fNext();
						}
						pResponse.send(pResult);
						return fNext();
					});
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
