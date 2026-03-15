/**
 * Retold Facto - Source Manager Service
 *
 * Manages data sources and their supporting documentation.
 * Provides endpoints for source CRUD beyond the auto-generated Meadow endpoints,
 * including documentation management and active/inactive toggling.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const defaultSourceManagerOptions = (
	{
		RoutePrefix: '/facto'
	});

class RetoldFactoSourceManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultSourceManagerOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoSourceManager';
	}

	/**
	 * Connect REST API routes for source management.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// GET /facto/source/by-hash/:Hash -- look up a source by its human-readable Hash
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/by-hash/:Hash`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpHash = pRequest.params.Hash;
				if (!tmpHash)
				{
					pResponse.send({ Error: 'Hash parameter is required' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Source.query.clone()
					.addFilter('Hash', tmpHash)
					.addFilter('Deleted', 0);

				this.fable.DAL.Source.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						if (!pRecords || pRecords.length === 0)
						{
							pResponse.send({ Error: `No source found with Hash "${tmpHash}"` });
							return fNext();
						}
						pResponse.send({ Source: pRecords[0] });
						return fNext();
					});
			});

		// GET /facto/sources/active -- list all active (non-deleted) sources
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/sources/active`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized', Sources: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Source.query.clone()
					.addFilter('Deleted', 0)
					.addFilter('Active', 1);

				this.fable.DAL.Source.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error listing active sources: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Sources: [] });
							return fNext();
						}
						pResponse.send({ Active: true, Count: pRecords.length, Sources: pRecords });
						return fNext();
					});
			});

		// PUT /facto/source/:IDSource/activate -- mark a source as active
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/source/:IDSource/activate`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Source.query.clone()
					.addRecord({ IDSource: tmpIDSource, Active: 1 });

				this.fable.DAL.Source.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error activating source ${tmpIDSource}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Source: pRecord });
						return fNext();
					});
			});

		// PUT /facto/source/:IDSource/deactivate -- mark a source as inactive
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/source/:IDSource/deactivate`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Source.query.clone()
					.addRecord({ IDSource: tmpIDSource, Active: 0 });

				this.fable.DAL.Source.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error deactivating source ${tmpIDSource}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Source: pRecord });
						return fNext();
					});
			});

		// GET /facto/source/:IDSource/documentation -- list documentation for a source
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/:IDSource/documentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter', Documentation: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceDocumentation)
				{
					pResponse.send({ Error: 'SourceDocumentation DAL not initialized', Documentation: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.SourceDocumentation.query.clone()
					.addFilter('IDSource', tmpIDSource)
					.addFilter('Deleted', 0);

				this.fable.DAL.SourceDocumentation.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error listing documentation for source ${tmpIDSource}: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Documentation: [] });
							return fNext();
						}
						pResponse.send({ IDSource: tmpIDSource, Count: pRecords.length, Documentation: pRecords });
						return fNext();
					});
			});

		// GET /facto/source/:IDSource/summary -- get a source with its stats
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/:IDSource/summary`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpResult = { IDSource: tmpIDSource, Source: false, RecordCount: 0, DatasetCount: 0, DocumentationCount: 0 };

				// Load the source record
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.Source.query.clone()
							.addFilter('IDSource', tmpIDSource);
						this.fable.DAL.Source.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (!pError && pRecord)
								{
									tmpResult.Source = pRecord;
								}
								return fStep();
							});
					});

				// Count records from this source
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.Record)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.Record.query.clone()
							.addFilter('IDSource', tmpIDSource)
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

				// Count datasets linked to this source
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.DatasetSource)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.DatasetSource.query.clone()
							.addFilter('IDSource', tmpIDSource)
							.addFilter('Deleted', 0);
						this.fable.DAL.DatasetSource.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.DatasetCount = pCount;
								}
								return fStep();
							});
					});

				// Count documentation entries
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.SourceDocumentation)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.SourceDocumentation.query.clone()
							.addFilter('IDSource', tmpIDSource)
							.addFilter('Deleted', 0);
						this.fable.DAL.SourceDocumentation.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.DocumentationCount = pCount;
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

		this.fable.log.info(`SourceManager routes connected at ${tmpRoutePrefix}/source(s)/*`);
	}
}

module.exports = RetoldFactoSourceManager;
module.exports.serviceType = 'RetoldFactoSourceManager';
module.exports.default_configuration = defaultSourceManagerOptions;
