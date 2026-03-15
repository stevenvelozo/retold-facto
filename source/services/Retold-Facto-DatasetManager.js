/**
 * Retold Facto - Dataset Manager Service
 *
 * Manages dataset lifecycle including type validation (Raw, Compositional,
 * Projection, Derived), source linking with reliability weights, and
 * dataset statistics.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const defaultDatasetManagerOptions = (
	{
		RoutePrefix: '/facto'
	});

const VALID_DATASET_TYPES = ['Raw', 'Compositional', 'Projection', 'Derived'];

class RetoldFactoDatasetManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultDatasetManagerOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoDatasetManager';
	}

	/**
	 * Connect REST API routes for dataset management.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// GET /facto/datasets/types -- list valid dataset types
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/datasets/types`,
			(pRequest, pResponse, fNext) =>
			{
				pResponse.send({ Types: VALID_DATASET_TYPES });
				return fNext();
			});

		// GET /facto/dataset/:IDDataset/stats -- get dataset statistics
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/dataset/:IDDataset/stats`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				if (isNaN(tmpIDDataset) || tmpIDDataset < 1)
				{
					pResponse.send({ Error: 'Invalid IDDataset parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Error: 'Dataset DAL not initialized' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpResult = { IDDataset: tmpIDDataset, Dataset: false, RecordCount: 0, SourceCount: 0 };

				// Load the dataset itself
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.Dataset.query.clone()
							.addFilter('IDDataset', tmpIDDataset);
						this.fable.DAL.Dataset.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (!pError && pRecord)
								{
									tmpResult.Dataset = pRecord;
								}
								return fStep();
							});
					});

				// Count records in this dataset
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.Record)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.Record.query.clone()
							.addFilter('IDDataset', tmpIDDataset)
							.addFilter('Deleted', 0);
						this.fable.DAL.Record.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.RecordCount = pCount;
								}
								return fStep();
							});
					});

				// Count linked sources
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.DatasetSource)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.DatasetSource.query.clone()
							.addFilter('IDDataset', tmpIDDataset)
							.addFilter('Deleted', 0);
						this.fable.DAL.DatasetSource.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.SourceCount = pCount;
								}
								return fStep();
							});
					});

				tmpAnticipate.wait(
					(pError) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send(tmpResult);
						return fNext();
					});
			});

		// GET /facto/dataset/:IDDataset/sources -- list sources linked to a dataset
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/dataset/:IDDataset/sources`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				if (isNaN(tmpIDDataset) || tmpIDDataset < 1)
				{
					pResponse.send({ Error: 'Invalid IDDataset parameter', Sources: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.DatasetSource)
				{
					pResponse.send({ Error: 'DatasetSource DAL not initialized', Sources: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.DatasetSource.query.clone()
					.addFilter('IDDataset', tmpIDDataset)
					.addFilter('Deleted', 0);

				this.fable.DAL.DatasetSource.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`DatasetManager error listing sources for dataset ${tmpIDDataset}: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Sources: [] });
							return fNext();
						}
						pResponse.send({ IDDataset: tmpIDDataset, Count: pRecords.length, Sources: pRecords });
						return fNext();
					});
			});

		// POST /facto/dataset/:IDDataset/source -- link a source to a dataset
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/dataset/:IDDataset/source`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				if (isNaN(tmpIDDataset) || tmpIDDataset < 1)
				{
					pResponse.send({ Error: 'Invalid IDDataset parameter' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpIDSource = parseInt(tmpBody.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'IDSource is required' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.DatasetSource)
				{
					pResponse.send({ Error: 'DatasetSource DAL not initialized' });
					return fNext();
				}

				let tmpReliabilityWeight = parseFloat(tmpBody.ReliabilityWeight);
				if (isNaN(tmpReliabilityWeight) || tmpReliabilityWeight < 0 || tmpReliabilityWeight > 1)
				{
					tmpReliabilityWeight = 1.0;
				}

				let tmpQuery = this.fable.DAL.DatasetSource.query.clone()
					.addRecord(
						{
							IDDataset: tmpIDDataset,
							IDSource: tmpIDSource,
							ReliabilityWeight: tmpReliabilityWeight
						});

				this.fable.DAL.DatasetSource.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`DatasetManager error linking source ${tmpIDSource} to dataset ${tmpIDDataset}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, DatasetSource: pRecord });
						return fNext();
					});
			});

		// GET /facto/dataset/:IDDataset/records -- list records in a dataset (paginated)
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/dataset/:IDDataset/records/:Begin/:Cap`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				let tmpBegin = parseInt(pRequest.params.Begin, 10) || 0;
				let tmpCap = parseInt(pRequest.params.Cap, 10) || 50;

				if (isNaN(tmpIDDataset) || tmpIDDataset < 1)
				{
					pResponse.send({ Error: 'Invalid IDDataset parameter', Records: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'Record DAL not initialized', Records: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Record.query.clone()
					.addFilter('IDDataset', tmpIDDataset)
					.addFilter('Deleted', 0)
					.setBegin(tmpBegin)
					.setCap(tmpCap);

				this.fable.DAL.Record.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError, Records: [] });
							return fNext();
						}
						pResponse.send({ IDDataset: tmpIDDataset, Begin: tmpBegin, Cap: tmpCap, Count: pRecords.length, Records: pRecords });
						return fNext();
					});
			});

		// PUT /facto/dataset/:IDDataset/version-policy -- set VersionPolicy on a dataset
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/dataset/:IDDataset/version-policy`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				if (isNaN(tmpIDDataset) || tmpIDDataset < 1)
				{
					pResponse.send({ Error: 'Invalid IDDataset parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Error: 'Dataset DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpPolicy = tmpBody.VersionPolicy;

				if (tmpPolicy !== 'Append' && tmpPolicy !== 'Replace')
				{
					pResponse.send({ Error: "VersionPolicy must be 'Append' or 'Replace'" });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Dataset.query.clone()
					.addRecord({ IDDataset: tmpIDDataset, VersionPolicy: tmpPolicy });

				this.fable.DAL.Dataset.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`DatasetManager error setting VersionPolicy for dataset ${tmpIDDataset}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Dataset: pRecord });
						return fNext();
					});
			});

		// GET /facto/dataset/:IDDataset/versions -- list version history (IngestJobs) for a dataset
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/dataset/:IDDataset/versions`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				if (isNaN(tmpIDDataset) || tmpIDDataset < 1)
				{
					pResponse.send({ Error: 'Invalid IDDataset parameter', Versions: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.IngestJob)
				{
					pResponse.send({ Error: 'IngestJob DAL not initialized', Versions: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.IngestJob.query.clone()
					.addFilter('IDDataset', tmpIDDataset)
					.addFilter('Deleted', 0);

				this.fable.DAL.IngestJob.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`DatasetManager error listing versions for dataset ${tmpIDDataset}: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Versions: [] });
							return fNext();
						}

						// Sort by DatasetVersion descending
						pRecords.sort((a, b) =>
						{
							return (parseInt(b.DatasetVersion, 10) || 0) - (parseInt(a.DatasetVersion, 10) || 0);
						});

						pResponse.send({ IDDataset: tmpIDDataset, Count: pRecords.length, Versions: pRecords });
						return fNext();
					});
			});

		this.fable.log.info(`DatasetManager routes connected at ${tmpRoutePrefix}/dataset(s)/*`);
	}
}

module.exports = RetoldFactoDatasetManager;
module.exports.serviceType = 'RetoldFactoDatasetManager';
module.exports.default_configuration = defaultDatasetManagerOptions;
