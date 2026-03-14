/**
 * Retold Facto - Record Manager Service
 *
 * Manages record ingest, versioning, and certainty index operations.
 * Provides endpoints for batch ingest, version history, and certainty
 * tracking beyond the auto-generated Meadow CRUD endpoints.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const defaultRecordManagerOptions = (
	{
		RoutePrefix: '/facto',
		DefaultCertaintyValue: 0.5
	});

class RetoldFactoRecordManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultRecordManagerOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoRecordManager';
	}

	/**
	 * Ingest a single record: create it via the DAL, then auto-create a
	 * CertaintyIndex entry at the default certainty value.
	 *
	 * @param {Object} pRecordData - The record fields to create
	 * @param {function} fCallback - (pError, pCreatedRecord)
	 */
	ingestSingleRecord(pRecordData, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.Record)
		{
			return fCallback(new Error('Record DAL not initialized'));
		}

		// Set IngestDate to now if not provided
		if (!pRecordData.IngestDate)
		{
			pRecordData.IngestDate = new Date().toISOString();
		}

		// Default Version to 1 if not provided
		if (!pRecordData.Version)
		{
			pRecordData.Version = 1;
		}

		let tmpCreateQuery = this.fable.DAL.Record.query.clone()
			.addRecord(pRecordData);

		this.fable.DAL.Record.doCreate(tmpCreateQuery,
			(pError, pQuery, pQueryRead, pRecord) =>
			{
				if (pError)
				{
					return fCallback(pError);
				}

				if (!pRecord || !pRecord.IDRecord)
				{
					return fCallback(new Error('Record creation returned no record'));
				}

				// Auto-create a CertaintyIndex entry
				if (!this.fable.DAL.CertaintyIndex)
				{
					// No CertaintyIndex DAL; return the record without certainty
					return fCallback(null, pRecord);
				}

				let tmpCertaintyQuery = this.fable.DAL.CertaintyIndex.query.clone()
					.addRecord(
						{
							IDRecord: pRecord.IDRecord,
							CertaintyValue: this.options.DefaultCertaintyValue,
							Dimension: 'overall',
							Justification: 'Default certainty assigned at ingest'
						});

				this.fable.DAL.CertaintyIndex.doCreate(tmpCertaintyQuery,
					(pCertaintyError, pCertaintyQuery, pCertaintyQueryRead, pCertaintyRecord) =>
					{
						if (pCertaintyError)
						{
							this.fable.log.warn(`RecordManager warning: Record ${pRecord.IDRecord} created but CertaintyIndex creation failed: ${pCertaintyError}`);
						}
						return fCallback(null, pRecord);
					});
			});
	}

	/**
	 * Connect REST API routes for record management.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// POST /facto/record/ingest -- ingest a batch of records
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/record/ingest`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpBody = pRequest.body || {};
				let tmpRecords = tmpBody.Records || tmpBody.records || [];
				let tmpIDDataset = tmpBody.IDDataset || 0;
				let tmpIDSource = tmpBody.IDSource || 0;

				if (!Array.isArray(tmpRecords) || tmpRecords.length === 0)
				{
					pResponse.send(
						{
							Error: 'No records provided. Send { Records: [...], IDDataset: N, IDSource: N }',
							Ingested: 0,
							DefaultCertainty: this.options.DefaultCertaintyValue
						});
					return fNext();
				}

				let tmpIngested = 0;
				let tmpErrors = 0;
				let tmpCreatedRecords = [];

				let tmpAnticipate = this.fable.newAnticipate();

				for (let i = 0; i < tmpRecords.length; i++)
				{
					let tmpRecordData = tmpRecords[i];
					tmpAnticipate.anticipate(
						(fStep) =>
						{
							// Apply batch-level defaults
							if (tmpIDDataset && !tmpRecordData.IDDataset)
							{
								tmpRecordData.IDDataset = tmpIDDataset;
							}
							if (tmpIDSource && !tmpRecordData.IDSource)
							{
								tmpRecordData.IDSource = tmpIDSource;
							}

							this.ingestSingleRecord(tmpRecordData,
								(pError, pRecord) =>
								{
									if (pError)
									{
										tmpErrors++;
										this.fable.log.error(`RecordManager ingest error: ${pError}`);
									}
									else
									{
										tmpIngested++;
										tmpCreatedRecords.push(pRecord);
									}
									return fStep();
								});
						});
				}

				tmpAnticipate.wait(
					(pError) =>
					{
						pResponse.send(
							{
								Ingested: tmpIngested,
								Errors: tmpErrors,
								Total: tmpRecords.length,
								DefaultCertainty: this.options.DefaultCertaintyValue,
								Records: tmpCreatedRecords
							});
						return fNext();
					});
			});

		// GET /facto/record/:IDRecord/certainty -- get all certainty indices for a record
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/record/:IDRecord/certainty`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDRecord = parseInt(pRequest.params.IDRecord, 10);
				if (isNaN(tmpIDRecord) || tmpIDRecord < 1)
				{
					pResponse.send({ Error: 'Invalid IDRecord parameter', CertaintyIndices: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CertaintyIndex)
				{
					pResponse.send({ Error: 'CertaintyIndex DAL not initialized', CertaintyIndices: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.CertaintyIndex.query.clone()
					.addFilter('IDRecord', tmpIDRecord)
					.addFilter('Deleted', 0);

				this.fable.DAL.CertaintyIndex.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`RecordManager error reading certainty for record ${tmpIDRecord}: ${pError}`);
							pResponse.send({ Error: pError.message || pError, CertaintyIndices: [] });
							return fNext();
						}
						pResponse.send({ IDRecord: tmpIDRecord, Count: pRecords.length, CertaintyIndices: pRecords });
						return fNext();
					});
			});

		// POST /facto/record/:IDRecord/certainty -- add a new certainty index entry
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/record/:IDRecord/certainty`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDRecord = parseInt(pRequest.params.IDRecord, 10);
				if (isNaN(tmpIDRecord) || tmpIDRecord < 1)
				{
					pResponse.send({ Error: 'Invalid IDRecord parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CertaintyIndex)
				{
					pResponse.send({ Error: 'CertaintyIndex DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpCertaintyValue = parseFloat(tmpBody.CertaintyValue);
				if (isNaN(tmpCertaintyValue) || tmpCertaintyValue < 0 || tmpCertaintyValue > 1)
				{
					tmpCertaintyValue = this.options.DefaultCertaintyValue;
				}

				let tmpCertaintyData = {
					IDRecord: tmpIDRecord,
					CertaintyValue: tmpCertaintyValue,
					Dimension: tmpBody.Dimension || 'overall',
					Justification: tmpBody.Justification || ''
				};

				let tmpQuery = this.fable.DAL.CertaintyIndex.query.clone()
					.addRecord(tmpCertaintyData);

				this.fable.DAL.CertaintyIndex.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`RecordManager error creating certainty for record ${tmpIDRecord}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, CertaintyIndex: pRecord });
						return fNext();
					});
			});

		// GET /facto/record/:IDRecord/versions -- list all versions of a record (matching GUIDRecord)
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/record/:IDRecord/versions`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDRecord = parseInt(pRequest.params.IDRecord, 10);
				if (isNaN(tmpIDRecord) || tmpIDRecord < 1)
				{
					pResponse.send({ Error: 'Invalid IDRecord parameter', Versions: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'Record DAL not initialized', Versions: [] });
					return fNext();
				}

				// First read the record to get its GUIDRecord
				let tmpReadQuery = this.fable.DAL.Record.query.clone()
					.addFilter('IDRecord', tmpIDRecord);

				this.fable.DAL.Record.doRead(tmpReadQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError || !pRecord)
						{
							pResponse.send({ Error: pError ? (pError.message || pError) : 'Record not found', Versions: [] });
							return fNext();
						}

						// Find all records sharing the same GUIDRecord (version chain)
						let tmpVersionQuery = this.fable.DAL.Record.query.clone()
							.addFilter('GUIDRecord', pRecord.GUIDRecord)
							.addFilter('Deleted', 0);

						this.fable.DAL.Record.doReads(tmpVersionQuery,
							(pVersionError, pVersionQuery, pVersionRecords) =>
							{
								if (pVersionError)
								{
									pResponse.send({ Error: pVersionError.message || pVersionError, Versions: [] });
									return fNext();
								}
								pResponse.send(
									{
										IDRecord: tmpIDRecord,
										GUIDRecord: pRecord.GUIDRecord,
										Count: pVersionRecords.length,
										Versions: pVersionRecords
									});
								return fNext();
							});
					});
			});

		// GET /facto/record/:IDRecord/binary -- list binary attachments for a record
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/record/:IDRecord/binary`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDRecord = parseInt(pRequest.params.IDRecord, 10);
				if (isNaN(tmpIDRecord) || tmpIDRecord < 1)
				{
					pResponse.send({ Error: 'Invalid IDRecord parameter', Binaries: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.RecordBinary)
				{
					pResponse.send({ Error: 'RecordBinary DAL not initialized', Binaries: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.RecordBinary.query.clone()
					.addFilter('IDRecord', tmpIDRecord)
					.addFilter('Deleted', 0);

				this.fable.DAL.RecordBinary.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError, Binaries: [] });
							return fNext();
						}
						pResponse.send({ IDRecord: tmpIDRecord, Count: pRecords.length, Binaries: pRecords });
						return fNext();
					});
			});

		this.fable.log.info(`RecordManager routes connected at ${tmpRoutePrefix}/record/*`);
	}
}

module.exports = RetoldFactoRecordManager;
module.exports.serviceType = 'RetoldFactoRecordManager';
module.exports.default_configuration = defaultRecordManagerOptions;
