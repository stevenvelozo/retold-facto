/**
 * Retold Facto - Projection Engine Service
 *
 * Creates flattened projections, temporary SQL tables, and materialized
 * views from multidimensional dataset data for reporting and charting.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');
const libFoxHound = require('foxhound');
const libFS = require('fs');
const libPath = require('path');
const libMeadow = require('meadow');
const libMeadowEndpoints = require('meadow-endpoints');
const libMeadowIntegration = require('meadow-integration');

const defaultProjectionEngineOptions = (
	{
		RoutePrefix: '/facto'
	});

const VALID_DATASET_TYPES = ['Raw', 'Compositional', 'Projection', 'Derived'];

class RetoldFactoProjectionEngine extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultProjectionEngineOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoProjectionEngine';

		// Map of dynamically registered Meadow entities for projection tables.
		// Keyed by TargetTableName (entity scope).
		this._ProjectionEntities = {};

		// Register meadow-integration service types so we can instantiate them
		if (!this.fable.serviceManager.services.IntegrationAdapter)
		{
			this.fable.serviceManager.addServiceType('IntegrationAdapter', libMeadowIntegration.IntegrationAdapter);
		}
		if (!this.fable.serviceManager.services.MeadowCloneRestClient)
		{
			this.fable.serviceManager.addServiceType('MeadowCloneRestClient', libMeadowIntegration.CloneRestClient);
		}
	}

	/**
	 * Connect REST API routes for projection operations.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// GET /facto/projections -- list all projection datasets
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/projections`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Projections: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Dataset.query.clone()
					.addFilter('Type', 'Projection')
					.addFilter('Deleted', 0);

				this.fable.DAL.Dataset.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`ProjectionEngine error listing projections: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Projections: [] });
							return fNext();
						}
						pResponse.send({ Count: pRecords.length, Projections: pRecords });
						return fNext();
					});
			});

		// GET /facto/datasets/by-type/:Type -- list datasets filtered by type
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/datasets/by-type/:Type`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpType = pRequest.params.Type;

				if (!this.fable.DAL || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Error: 'Dataset DAL not initialized', Datasets: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Dataset.query.clone()
					.addFilter('Type', tmpType)
					.addFilter('Deleted', 0);

				this.fable.DAL.Dataset.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError, Datasets: [] });
							return fNext();
						}
						pResponse.send({ Type: tmpType, Count: pRecords.length, Datasets: pRecords });
						return fNext();
					});
			});

		// POST /facto/projections/query -- cross-dataset record query
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projections/query`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'Record DAL not initialized', Records: [] });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpDatasetIDs = tmpBody.DatasetIDs || [];
				let tmpType = tmpBody.Type || '';
				let tmpIDSource = parseInt(tmpBody.IDSource, 10) || 0;
				let tmpCertaintyThreshold = parseFloat(tmpBody.CertaintyThreshold) || 0;
				let tmpTimeRangeStart = parseInt(tmpBody.TimeRangeStart, 10) || 0;
				let tmpTimeRangeStop = parseInt(tmpBody.TimeRangeStop, 10) || 0;
				let tmpBegin = parseInt(tmpBody.Begin, 10) || 0;
				let tmpCap = parseInt(tmpBody.Cap, 10) || 100;

				if (!Array.isArray(tmpDatasetIDs) || tmpDatasetIDs.length === 0)
				{
					pResponse.send({ Error: 'DatasetIDs array is required', Records: [], Count: 0 });
					return fNext();
				}

				// Query records per dataset using Anticipate
				let tmpAnticipate = this.fable.newAnticipate();
				let tmpAllRecords = [];

				for (let i = 0; i < tmpDatasetIDs.length; i++)
				{
					let tmpDatasetID = parseInt(tmpDatasetIDs[i], 10);
					if (!tmpDatasetID) continue;

					tmpAnticipate.anticipate(
						(fStepCallback) =>
						{
							let tmpQuery = this.fable.DAL.Record.query.clone()
								.addFilter('IDDataset', tmpDatasetID)
								.addFilter('Deleted', 0);

							if (tmpType)
							{
								tmpQuery.addFilter('Type', tmpType);
							}
							if (tmpIDSource > 0)
							{
								tmpQuery.addFilter('IDSource', tmpIDSource);
							}
							if (tmpTimeRangeStart > 0)
							{
								tmpQuery.addFilter('RepresentedTimeStampStart', tmpTimeRangeStart, '>=');
							}
							if (tmpTimeRangeStop > 0)
							{
								tmpQuery.addFilter('RepresentedTimeStampStop', tmpTimeRangeStop, '<=');
							}

							tmpQuery.setCap(tmpCap);

							this.fable.DAL.Record.doReads(tmpQuery,
								(pError, pQuery, pRecords) =>
								{
									if (!pError && pRecords)
									{
										for (let j = 0; j < pRecords.length; j++)
										{
											tmpAllRecords.push(pRecords[j]);
										}
									}
									return fStepCallback();
								});
						});
				}

				tmpAnticipate.wait(
					() =>
					{
						// If certainty threshold is set, filter records
						if (tmpCertaintyThreshold > 0 && this.fable.DAL.CertaintyIndex)
						{
							let tmpFilterAnticipate = this.fable.newAnticipate();
							let tmpFilteredRecords = [];

							for (let i = 0; i < tmpAllRecords.length; i++)
							{
								let tmpRecord = tmpAllRecords[i];

								tmpFilterAnticipate.anticipate(
									(fFilterCallback) =>
									{
										let tmpCIQuery = this.fable.DAL.CertaintyIndex.query.clone()
											.addFilter('IDRecord', tmpRecord.IDRecord)
											.addFilter('Dimension', 'overall')
											.addFilter('Deleted', 0)
											.setCap(1);

										this.fable.DAL.CertaintyIndex.doReads(tmpCIQuery,
											(pCIError, pCIQuery, pCIRecords) =>
											{
												if (!pCIError && pCIRecords && pCIRecords.length > 0)
												{
													if (pCIRecords[0].CertaintyValue >= tmpCertaintyThreshold)
													{
														tmpRecord.CertaintyValue = pCIRecords[0].CertaintyValue;
														tmpFilteredRecords.push(tmpRecord);
													}
												}
												return fFilterCallback();
											});
									});
							}

							tmpFilterAnticipate.wait(
								() =>
								{
									// Apply pagination to filtered results
									let tmpPaginated = tmpFilteredRecords.slice(tmpBegin, tmpBegin + tmpCap);
									pResponse.send(
										{
											Query: { DatasetIDs: tmpDatasetIDs, Type: tmpType, CertaintyThreshold: tmpCertaintyThreshold },
											Count: tmpPaginated.length,
											TotalMatched: tmpFilteredRecords.length,
											Records: tmpPaginated
										});
									return fNext();
								});
						}
						else
						{
							// Apply pagination
							let tmpPaginated = tmpAllRecords.slice(tmpBegin, tmpBegin + tmpCap);
							pResponse.send(
								{
									Query: { DatasetIDs: tmpDatasetIDs, Type: tmpType },
									Count: tmpPaginated.length,
									TotalMatched: tmpAllRecords.length,
									Records: tmpPaginated
								});
							return fNext();
						}
					});
			});

		// POST /facto/projections/aggregate -- count records grouped by a dimension
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projections/aggregate`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'Record DAL not initialized', Aggregation: [] });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpDatasetIDs = tmpBody.DatasetIDs || [];
				let tmpGroupBy = tmpBody.GroupBy || 'IDDataset';

				if (!Array.isArray(tmpDatasetIDs) || tmpDatasetIDs.length === 0)
				{
					pResponse.send({ Error: 'DatasetIDs array is required', Aggregation: [] });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpAggregation = [];
				let tmpTotal = 0;

				if (tmpGroupBy === 'IDDataset')
				{
					// Count records per dataset
					for (let i = 0; i < tmpDatasetIDs.length; i++)
					{
						let tmpDatasetID = parseInt(tmpDatasetIDs[i], 10);
						if (!tmpDatasetID) continue;

						tmpAnticipate.anticipate(
							(fStepCallback) =>
							{
								let tmpCountQuery = this.fable.DAL.Record.query.clone()
									.addFilter('IDDataset', tmpDatasetID)
									.addFilter('Deleted', 0);

								this.fable.DAL.Record.doCount(tmpCountQuery,
									(pError, pQuery, pCount) =>
									{
										let tmpCount = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
										tmpAggregation.push({ Group: 'IDDataset', Key: tmpDatasetID, RecordCount: tmpCount });
										tmpTotal += tmpCount;
										return fStepCallback();
									});
							});
					}
				}
				else if (tmpGroupBy === 'IDSource')
				{
					// First get distinct sources linked to these datasets via DatasetSource
					tmpAnticipate.anticipate(
						(fStepCallback) =>
						{
							let tmpInnerAnticipate = this.fable.newAnticipate();
							let tmpSourceIDs = {};

							for (let i = 0; i < tmpDatasetIDs.length; i++)
							{
								let tmpDatasetID = parseInt(tmpDatasetIDs[i], 10);
								if (!tmpDatasetID) continue;

								tmpInnerAnticipate.anticipate(
									(fInnerCallback) =>
									{
										let tmpDSQuery = this.fable.DAL.DatasetSource.query.clone()
											.addFilter('IDDataset', tmpDatasetID)
											.addFilter('Deleted', 0);

										this.fable.DAL.DatasetSource.doReads(tmpDSQuery,
											(pError, pQuery, pRecords) =>
											{
												if (!pError && pRecords)
												{
													for (let j = 0; j < pRecords.length; j++)
													{
														tmpSourceIDs[pRecords[j].IDSource] = true;
													}
												}
												return fInnerCallback();
											});
									});
							}

							tmpInnerAnticipate.wait(
								() =>
								{
									// Now count records per source
									let tmpSourceKeys = Object.keys(tmpSourceIDs);
									let tmpSourceAnticipate = this.fable.newAnticipate();

									for (let i = 0; i < tmpSourceKeys.length; i++)
									{
										let tmpSourceID = parseInt(tmpSourceKeys[i], 10);

										tmpSourceAnticipate.anticipate(
											(fSourceCallback) =>
											{
												let tmpCountQuery = this.fable.DAL.Record.query.clone()
													.addFilter('IDSource', tmpSourceID)
													.addFilter('Deleted', 0);

												this.fable.DAL.Record.doCount(tmpCountQuery,
													(pError, pQuery, pCount) =>
													{
														let tmpCount = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
														tmpAggregation.push({ Group: 'IDSource', Key: tmpSourceID, RecordCount: tmpCount });
														tmpTotal += tmpCount;
														return fSourceCallback();
													});
											});
									}

									tmpSourceAnticipate.wait(() => { return fStepCallback(); });
								});
						});
				}
				else if (tmpGroupBy === 'Type')
				{
					// Get distinct record types from the specified datasets
					tmpAnticipate.anticipate(
						(fStepCallback) =>
						{
							let tmpTypeMap = {};
							let tmpTypeAnticipate = this.fable.newAnticipate();

							for (let i = 0; i < tmpDatasetIDs.length; i++)
							{
								let tmpDatasetID = parseInt(tmpDatasetIDs[i], 10);
								if (!tmpDatasetID) continue;

								tmpTypeAnticipate.anticipate(
									(fTypeCallback) =>
									{
										let tmpReadQuery = this.fable.DAL.Record.query.clone()
											.addFilter('IDDataset', tmpDatasetID)
											.addFilter('Deleted', 0)
											.setCap(1000);

										this.fable.DAL.Record.doReads(tmpReadQuery,
											(pError, pQuery, pRecords) =>
											{
												if (!pError && pRecords)
												{
													for (let j = 0; j < pRecords.length; j++)
													{
														let tmpType = pRecords[j].Type || '(none)';
														tmpTypeMap[tmpType] = (tmpTypeMap[tmpType] || 0) + 1;
													}
												}
												return fTypeCallback();
											});
									});
							}

							tmpTypeAnticipate.wait(
								() =>
								{
									let tmpTypes = Object.keys(tmpTypeMap);
									for (let i = 0; i < tmpTypes.length; i++)
									{
										let tmpCount = tmpTypeMap[tmpTypes[i]];
										tmpAggregation.push({ Group: 'Type', Key: tmpTypes[i], RecordCount: tmpCount });
										tmpTotal += tmpCount;
									}
									return fStepCallback();
								});
						});
				}

				tmpAnticipate.wait(
					() =>
					{
						pResponse.send(
							{
								GroupBy: tmpGroupBy,
								Aggregation: tmpAggregation,
								Total: tmpTotal
							});
						return fNext();
					});
			});

		// POST /facto/projections/certainty -- certainty-weighted record lookup
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projections/certainty`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.CertaintyIndex || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'DAL not initialized', Records: [] });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpDatasetIDs = tmpBody.DatasetIDs || [];
				let tmpMinCertainty = parseFloat(tmpBody.MinCertainty);
				let tmpMaxCertainty = parseFloat(tmpBody.MaxCertainty);
				let tmpDimension = tmpBody.Dimension || 'overall';
				let tmpSortDirection = (tmpBody.SortByCertainty === 'asc') ? 'asc' : 'desc';
				let tmpBegin = parseInt(tmpBody.Begin, 10) || 0;
				let tmpCap = parseInt(tmpBody.Cap, 10) || 50;

				if (isNaN(tmpMinCertainty)) tmpMinCertainty = 0;
				if (isNaN(tmpMaxCertainty)) tmpMaxCertainty = 1;

				// Query certainty indices within range
				let tmpCIQuery = this.fable.DAL.CertaintyIndex.query.clone()
					.addFilter('Dimension', tmpDimension)
					.addFilter('CertaintyValue', tmpMinCertainty, '>=')
					.addFilter('CertaintyValue', tmpMaxCertainty, '<=')
					.addFilter('Deleted', 0)
					.setCap(500);

				this.fable.DAL.CertaintyIndex.doReads(tmpCIQuery,
					(pCIError, pCIQuery, pCIRecords) =>
					{
						if (pCIError)
						{
							pResponse.send({ Error: pCIError.message || pCIError, Records: [] });
							return fNext();
						}

						if (!pCIRecords || pCIRecords.length === 0)
						{
							pResponse.send({ Count: 0, Records: [] });
							return fNext();
						}

						// Sort by certainty value
						pCIRecords.sort(
							(a, b) =>
							{
								return tmpSortDirection === 'asc'
									? a.CertaintyValue - b.CertaintyValue
									: b.CertaintyValue - a.CertaintyValue;
							});

						// Collect IDRecord values and certainty map
						let tmpCertaintyMap = {};
						let tmpRecordIDs = [];
						for (let i = 0; i < pCIRecords.length; i++)
						{
							let tmpIDRecord = pCIRecords[i].IDRecord;
							if (!tmpCertaintyMap[tmpIDRecord])
							{
								tmpCertaintyMap[tmpIDRecord] = pCIRecords[i].CertaintyValue;
								tmpRecordIDs.push(tmpIDRecord);
							}
						}

						// Now fetch the actual records
						let tmpAnticipate = this.fable.newAnticipate();
						let tmpMatchedRecords = [];

						for (let i = 0; i < tmpRecordIDs.length; i++)
						{
							let tmpIDRecord = tmpRecordIDs[i];

							tmpAnticipate.anticipate(
								(fStepCallback) =>
								{
									let tmpRecQuery = this.fable.DAL.Record.query.clone()
										.addFilter('IDRecord', tmpIDRecord)
										.addFilter('Deleted', 0);

									this.fable.DAL.Record.doRead(tmpRecQuery,
										(pRecError, pRecQuery, pRecord) =>
										{
											if (!pRecError && pRecord && pRecord.IDRecord)
											{
												// Filter by DatasetIDs if provided
												if (tmpDatasetIDs.length === 0 || tmpDatasetIDs.indexOf(pRecord.IDDataset) >= 0)
												{
													pRecord.CertaintyValue = tmpCertaintyMap[tmpIDRecord];
													pRecord.CertaintyDimension = tmpDimension;
													tmpMatchedRecords.push(pRecord);
												}
											}
											return fStepCallback();
										});
								});
						}

						tmpAnticipate.wait(
							() =>
							{
								// Re-sort the matched records by certainty
								tmpMatchedRecords.sort(
									(a, b) =>
									{
										return tmpSortDirection === 'asc'
											? a.CertaintyValue - b.CertaintyValue
											: b.CertaintyValue - a.CertaintyValue;
									});

								let tmpPaginated = tmpMatchedRecords.slice(tmpBegin, tmpBegin + tmpCap);
								pResponse.send(
									{
										Dimension: tmpDimension,
										MinCertainty: tmpMinCertainty,
										MaxCertainty: tmpMaxCertainty,
										Count: tmpPaginated.length,
										TotalMatched: tmpMatchedRecords.length,
										Records: tmpPaginated
									});
								return fNext();
							});
					});
			});

		// POST /facto/projections/compare -- compare datasets
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projections/compare`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Dataset || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'DAL not initialized', Datasets: [] });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpDatasetIDs = tmpBody.DatasetIDs || [];

				if (!Array.isArray(tmpDatasetIDs) || tmpDatasetIDs.length === 0)
				{
					pResponse.send({ Error: 'DatasetIDs array is required', Datasets: [] });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpDatasets = [];

				for (let i = 0; i < tmpDatasetIDs.length; i++)
				{
					let tmpDatasetID = parseInt(tmpDatasetIDs[i], 10);
					if (!tmpDatasetID) continue;

					tmpAnticipate.anticipate(
						(fStepCallback) =>
						{
							let tmpDatasetInfo = { IDDataset: tmpDatasetID, Name: '', Type: '', RecordCount: 0, SourceCount: 0 };
							let tmpInner = this.fable.newAnticipate();

							// Load dataset metadata
							tmpInner.anticipate(
								(fInnerCallback) =>
								{
									let tmpDSQuery = this.fable.DAL.Dataset.query.clone()
										.addFilter('IDDataset', tmpDatasetID);

									this.fable.DAL.Dataset.doRead(tmpDSQuery,
										(pError, pQuery, pRecord) =>
										{
											if (!pError && pRecord)
											{
												tmpDatasetInfo.Name = pRecord.Name || '';
												tmpDatasetInfo.Type = pRecord.Type || '';
											}
											return fInnerCallback();
										});
								});

							// Count records
							tmpInner.anticipate(
								(fInnerCallback) =>
								{
									let tmpCountQuery = this.fable.DAL.Record.query.clone()
										.addFilter('IDDataset', tmpDatasetID)
										.addFilter('Deleted', 0);

									this.fable.DAL.Record.doCount(tmpCountQuery,
										(pError, pQuery, pCount) =>
										{
											tmpDatasetInfo.RecordCount = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
											return fInnerCallback();
										});
								});

							// Count linked sources
							tmpInner.anticipate(
								(fInnerCallback) =>
								{
									let tmpDSSourceQuery = this.fable.DAL.DatasetSource.query.clone()
										.addFilter('IDDataset', tmpDatasetID)
										.addFilter('Deleted', 0);

									this.fable.DAL.DatasetSource.doCount(tmpDSSourceQuery,
										(pError, pQuery, pCount) =>
										{
											tmpDatasetInfo.SourceCount = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
											return fInnerCallback();
										});
								});

							tmpInner.wait(
								() =>
								{
									tmpDatasets.push(tmpDatasetInfo);
									return fStepCallback();
								});
						});
				}

				tmpAnticipate.wait(
					() =>
					{
						pResponse.send({ Datasets: tmpDatasets });
						return fNext();
					});
			});

		// GET /facto/projections/summary -- global warehouse statistics
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/projections/summary`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL)
				{
					pResponse.send({ Error: 'DAL not initialized' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpSummary = {
					Sources: 0,
					Datasets: 0,
					Records: 0,
					CertaintyIndices: 0,
					IngestJobs: 0,
					DatasetsByType: { Raw: 0, Compositional: 0, Projection: 0, Derived: 0 }
				};

				// Count Sources
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						if (!this.fable.DAL.Source) return fStepCallback();
						let tmpQuery = this.fable.DAL.Source.query.clone().addFilter('Deleted', 0);
						this.fable.DAL.Source.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								tmpSummary.Sources = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
								return fStepCallback();
							});
					});

				// Count Datasets
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						if (!this.fable.DAL.Dataset) return fStepCallback();
						let tmpQuery = this.fable.DAL.Dataset.query.clone().addFilter('Deleted', 0);
						this.fable.DAL.Dataset.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								tmpSummary.Datasets = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
								return fStepCallback();
							});
					});

				// Count Records
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						if (!this.fable.DAL.Record) return fStepCallback();
						let tmpQuery = this.fable.DAL.Record.query.clone().addFilter('Deleted', 0);
						this.fable.DAL.Record.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								tmpSummary.Records = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
								return fStepCallback();
							});
					});

				// Count CertaintyIndices
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						if (!this.fable.DAL.CertaintyIndex) return fStepCallback();
						let tmpQuery = this.fable.DAL.CertaintyIndex.query.clone().addFilter('Deleted', 0);
						this.fable.DAL.CertaintyIndex.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								tmpSummary.CertaintyIndices = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
								return fStepCallback();
							});
					});

				// Count IngestJobs
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						if (!this.fable.DAL.IngestJob) return fStepCallback();
						let tmpQuery = this.fable.DAL.IngestJob.query.clone().addFilter('Deleted', 0);
						this.fable.DAL.IngestJob.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								tmpSummary.IngestJobs = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
								return fStepCallback();
							});
					});

				// Count Datasets by Type
				for (let t = 0; t < VALID_DATASET_TYPES.length; t++)
				{
					let tmpType = VALID_DATASET_TYPES[t];
					tmpAnticipate.anticipate(
						(fStepCallback) =>
						{
							if (!this.fable.DAL.Dataset) return fStepCallback();
							let tmpQuery = this.fable.DAL.Dataset.query.clone()
								.addFilter('Type', tmpType)
								.addFilter('Deleted', 0);
							this.fable.DAL.Dataset.doCount(tmpQuery,
								(pError, pQuery, pCount) =>
								{
									tmpSummary.DatasetsByType[tmpType] = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
									return fStepCallback();
								});
						});
				}

				tmpAnticipate.wait(
					() =>
					{
						pResponse.send(tmpSummary);
						return fNext();
					});
			});

		// POST /facto/projection/compile -- compile MicroDDL text to schema JSON
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projection/compile`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpBody = pRequest.body || {};
				let tmpDDL = tmpBody.DDL || '';

				if (!tmpDDL.trim())
				{
					pResponse.send({ Error: 'DDL text is required', Schema: null });
					return fNext();
				}

				// Client-side parse of MicroDDL into a schema object.
				// This mirrors the Stricture symbol set without requiring
				// a full Stricture compiler invocation.
				try
				{
					let tmpSchema = this._parseMicroDDL(tmpDDL);
					pResponse.send({ Success: true, Schema: tmpSchema });
				}
				catch (pError)
				{
					pResponse.send({ Error: pError.message || pError, Schema: null });
				}
				return fNext();
			});

		// GET /facto/projection/:IDDataset/schema -- get schema definition for a projection
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/projection/:IDDataset/schema`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Error: 'Dataset DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.IDDataset, 10);

				let tmpQuery = this.fable.DAL.Dataset.query.clone()
					.addFilter('IDDataset', tmpID);

				this.fable.DAL.Dataset.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						if (!pRecord || !pRecord.IDDataset)
						{
							pResponse.send({ Error: 'Dataset not found' });
							return fNext();
						}

						pResponse.send(
						{
							IDDataset: pRecord.IDDataset,
							Name: pRecord.Name,
							SchemaDefinition: pRecord.SchemaDefinition || '',
							SchemaVersion: pRecord.SchemaVersion || 0,
							SchemaHash: pRecord.SchemaHash || ''
						});
						return fNext();
					});
			});

		// POST /facto/projection/:IDDataset/save-schema -- save schema definition
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projection/:IDDataset/save-schema`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Error: 'Dataset DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.IDDataset, 10);
				let tmpBody = pRequest.body || {};
				let tmpSchemaDef = tmpBody.SchemaDefinition || '';

				let tmpQuery = this.fable.DAL.Dataset.query.clone()
					.addFilter('IDDataset', tmpID);

				this.fable.DAL.Dataset.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError || !pRecord || !pRecord.IDDataset)
						{
							pResponse.send({ Error: 'Dataset not found' });
							return fNext();
						}

						pRecord.SchemaDefinition = tmpSchemaDef;
						pRecord.SchemaVersion = (pRecord.SchemaVersion || 0) + 1;

						// Simple hash of the DDL text
						let tmpHash = 0;
						for (let i = 0; i < tmpSchemaDef.length; i++)
						{
							tmpHash = ((tmpHash << 5) - tmpHash + tmpSchemaDef.charCodeAt(i)) | 0;
						}
						pRecord.SchemaHash = 'ddl-' + Math.abs(tmpHash).toString(16);

						let tmpUpdateQuery = this.fable.DAL.Dataset.query.clone()
							.addRecord(pRecord);

						this.fable.DAL.Dataset.doUpdate(tmpUpdateQuery,
							(pUpdateError, pUpdateQuery, pUpdated) =>
							{
								if (pUpdateError)
								{
									pResponse.send({ Error: pUpdateError.message || pUpdateError });
									return fNext();
								}

								pResponse.send(
								{
									Success: true,
									IDDataset: pUpdated.IDDataset,
									SchemaVersion: pUpdated.SchemaVersion,
									SchemaHash: pUpdated.SchemaHash
								});
								return fNext();
							});
					});
			});

		// GET /facto/projection/:IDDataset/stores -- list projection store entries
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/projection/:IDDataset/stores`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.ProjectionStore)
				{
					pResponse.send({ Stores: [] });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.IDDataset, 10);

				let tmpQuery = this.fable.DAL.ProjectionStore.query.clone()
					.addFilter('IDDataset', tmpID)
					.addFilter('Deleted', 0);

				this.fable.DAL.ProjectionStore.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError, Stores: [] });
							return fNext();
						}

						pResponse.send({ Count: pRecords.length, Stores: pRecords });
						return fNext();
					});
			});

		// POST /facto/projection/:IDDataset/deploy -- deploy schema to a target store
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projection/:IDDataset/deploy`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Dataset ||
					!this.fable.DAL.StoreConnection || !this.fable.DAL.ProjectionStore)
				{
					pResponse.send({ Error: 'DAL not initialized' });
					return fNext();
				}

				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				let tmpBody = pRequest.body || {};
				let tmpIDStoreConnection = parseInt(tmpBody.IDStoreConnection, 10);
				let tmpTargetTableName = tmpBody.TargetTableName || '';

				if (!tmpIDStoreConnection)
				{
					pResponse.send({ Error: 'IDStoreConnection is required' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpDataset = null;
				let tmpConnection = null;

				// Load dataset
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						let tmpQuery = this.fable.DAL.Dataset.query.clone()
							.addFilter('IDDataset', tmpIDDataset);

						this.fable.DAL.Dataset.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (pError || !pRecord || !pRecord.IDDataset)
								{
									return fStepCallback(new Error('Dataset not found'));
								}
								tmpDataset = pRecord;
								return fStepCallback();
							});
					});

				// Load store connection
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						let tmpQuery = this.fable.DAL.StoreConnection.query.clone()
							.addFilter('IDStoreConnection', tmpIDStoreConnection);

						this.fable.DAL.StoreConnection.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (pError || !pRecord || !pRecord.IDStoreConnection)
								{
									return fStepCallback(new Error('StoreConnection not found'));
								}
								tmpConnection = pRecord;
								return fStepCallback();
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

						if (!tmpDataset.SchemaDefinition)
						{
							pResponse.send({ Error: 'Dataset has no schema definition' });
							return fNext();
						}

						let tmpTableName = tmpTargetTableName || tmpDataset.Name.replace(/[^a-zA-Z0-9_]/g, '_');

						// Parse the MicroDDL to build a Meadow table schema for deployment
						let tmpParsedSchema;
						try
						{
							tmpParsedSchema = this._parseMicroDDL(tmpDataset.SchemaDefinition);
						}
						catch (pParseError)
						{
							pResponse.send({ Error: `Schema parse error: ${pParseError.message}` });
							return fNext();
						}

						if (!tmpParsedSchema || !tmpParsedSchema.Tables || Object.keys(tmpParsedSchema.Tables).length === 0)
						{
							pResponse.send({ Error: 'Schema contains no tables' });
							return fNext();
						}

						// Get the connector module and attempt deployment
						let tmpConfig = {};
						try { tmpConfig = JSON.parse(tmpConnection.Config || '{}'); }
						catch (e) { /* ignore */ }

						let tmpConnectorModuleName = '';
						let tmpConnectorModules =
						[
							{ Type: 'MySQL', Module: 'meadow-connection-mysql' },
							{ Type: 'PostgreSQL', Module: 'meadow-connection-postgresql' },
							{ Type: 'MSSQL', Module: 'meadow-connection-mssql' },
							{ Type: 'SQLite', Module: 'meadow-connection-sqlite' },
							{ Type: 'Solr', Module: 'meadow-connection-solr' },
							{ Type: 'RocksDB', Module: 'meadow-connection-rocksdb' }
						];

						for (let i = 0; i < tmpConnectorModules.length; i++)
						{
							if (tmpConnectorModules[i].Type === tmpConnection.Type)
							{
								tmpConnectorModuleName = tmpConnectorModules[i].Module;
								break;
							}
						}

						if (!tmpConnectorModuleName)
						{
							pResponse.send({ Error: `Unknown connection type: ${tmpConnection.Type}` });
							return fNext();
						}

						let tmpConnectorModule;
						try
						{
							tmpConnectorModule = require(tmpConnectorModuleName);
						}
						catch (pRequireError)
						{
							pResponse.send({ Error: `Connector module not installed: ${tmpConnectorModuleName}` });
							return fNext();
						}

						let tmpLog = [];
						tmpLog.push(`[${new Date().toISOString()}] Starting deployment to ${tmpConnection.Type} connection "${tmpConnection.Name}"`);
						tmpLog.push(`[${new Date().toISOString()}] Target table: ${tmpTableName}`);

						try
						{
							let tmpConnector = new tmpConnectorModule(this.fable, tmpConfig, `Deploy-${Date.now()}`);

							tmpConnector.connectAsync(
								(pConnectError) =>
								{
									if (pConnectError)
									{
										tmpLog.push(`[${new Date().toISOString()}] Connection failed: ${pConnectError.message || pConnectError}`);
										this._saveProjectionStore(tmpIDDataset, tmpIDStoreConnection, tmpTableName, 'Failed', tmpLog.join('\n'),
											() =>
											{
												pResponse.send({ Error: `Connection failed: ${pConnectError.message}`, Log: tmpLog.join('\n') });
												return fNext();
											});
										return;
									}

									tmpLog.push(`[${new Date().toISOString()}] Connected successfully`);

									// Build the Meadow table schema for deployment
									let tmpFirstTableKey = Object.keys(tmpParsedSchema.Tables)[0];
									let tmpTableSchema = tmpParsedSchema.Tables[tmpFirstTableKey];

									// Override the table name to use the user's target name
									tmpTableSchema.TableName = tmpTableName;

									tmpLog.push(`[${new Date().toISOString()}] Creating table with ${tmpTableSchema.Columns.length} columns...`);

									// Use the connector's schema provider to create the table
									tmpConnector.createTable(tmpTableSchema,
										(pCreateError) =>
										{
											if (pCreateError)
											{
												tmpLog.push(`[${new Date().toISOString()}] Table creation failed: ${pCreateError.message || pCreateError}`);
												this._saveProjectionStore(tmpIDDataset, tmpIDStoreConnection, tmpTableName, 'Failed', tmpLog.join('\n'),
													() =>
													{
														pResponse.send({ Error: `Table creation failed: ${pCreateError.message}`, Log: tmpLog.join('\n') });
														return fNext();
													});
												return;
											}

											tmpLog.push(`[${new Date().toISOString()}] Table "${tmpTableName}" created successfully`);

											this._saveProjectionStore(tmpIDDataset, tmpIDStoreConnection, tmpTableName, 'Deployed', tmpLog.join('\n'),
												(pSaveError, pProjectionStore) =>
												{
													// Register a dynamic Meadow entity so the IntegrationAdapter
													// can upsert records through MeadowEndpoints.
													if (pProjectionStore && pProjectionStore.IDProjectionStore)
													{
														this._registerProjectionEntity(pProjectionStore, tmpConnection, tmpParsedSchema, tmpConnector,
															(pRegError) =>
															{
																if (pRegError)
																{
																	tmpLog.push(`[${new Date().toISOString()}] Entity registration warning: ${pRegError.message}`);
																}
																else
																{
																	tmpLog.push(`[${new Date().toISOString()}] Meadow entity [${tmpTableName}] registered for REST upserts`);
																}
																pResponse.send(
																{
																	Success: true,
																	TargetTableName: tmpTableName,
																	ConnectionType: tmpConnection.Type,
																	ConnectionName: tmpConnection.Name,
																	Log: tmpLog.join('\n'),
																	ProjectionStore: pProjectionStore
																});
																return fNext();
															});
													}
													else
													{
														pResponse.send(
														{
															Success: true,
															TargetTableName: tmpTableName,
															ConnectionType: tmpConnection.Type,
															ConnectionName: tmpConnection.Name,
															Log: tmpLog.join('\n'),
															ProjectionStore: pProjectionStore
														});
														return fNext();
													}
												});
										});
								});
						}
						catch (pDeployError)
						{
							tmpLog.push(`[${new Date().toISOString()}] Deployment error: ${pDeployError.message}`);
							pResponse.send({ Error: pDeployError.message, Log: tmpLog.join('\n') });
							return fNext();
						}
					});
			});

		// ======================================================================
		// Projection Mapping CRUD routes
		// ======================================================================

		// GET /facto/projection/:IDDataset/mappings -- list mappings for a projection
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/projection/:IDDataset/mappings`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.ProjectionMapping)
				{
					pResponse.send({ Mappings: [] });
					return fNext();
				}

				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);

				let tmpQuery = this.fable.DAL.ProjectionMapping.query.clone()
					.addFilter('IDDataset', tmpIDDataset)
					.addFilter('Deleted', 0);

				this.fable.DAL.ProjectionMapping.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`ProjectionEngine error listing mappings: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Mappings: [] });
							return fNext();
						}
						pResponse.send({ Count: pRecords.length, Mappings: pRecords });
						return fNext();
					});
			});

		// GET /facto/projection/mapping/:ID -- get single mapping
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/projection/mapping/:ID`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.ProjectionMapping)
				{
					pResponse.send({ Error: 'DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.ID, 10);

				let tmpQuery = this.fable.DAL.ProjectionMapping.query.clone()
					.addFilter('IDProjectionMapping', tmpID);

				this.fable.DAL.ProjectionMapping.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError || !pRecord || !pRecord.IDProjectionMapping)
						{
							pResponse.send({ Error: 'Mapping not found' });
							return fNext();
						}
						pResponse.send({ Mapping: pRecord });
						return fNext();
					});
			});

		// POST /facto/projection/:IDDataset/mapping -- create mapping
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projection/:IDDataset/mapping`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.ProjectionMapping)
				{
					pResponse.send({ Error: 'DAL not initialized' });
					return fNext();
				}

				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				let tmpBody = pRequest.body || {};

				let tmpNewRecord =
				{
					IDDataset: tmpIDDataset,
					IDSource: parseInt(tmpBody.IDSource, 10) || 0,
					IDProjectionStore: parseInt(tmpBody.IDProjectionStore, 10) || 0,
					Name: tmpBody.Name || 'New Mapping',
					SchemaVersion: parseInt(tmpBody.SchemaVersion, 10) || 0,
					MappingConfiguration: (typeof tmpBody.MappingConfiguration === 'string')
						? tmpBody.MappingConfiguration
						: JSON.stringify(tmpBody.MappingConfiguration || {}),
					FlowDiagramState: (typeof tmpBody.FlowDiagramState === 'string')
						? tmpBody.FlowDiagramState
						: JSON.stringify(tmpBody.FlowDiagramState || {}),
					Active: (tmpBody.Active !== undefined) ? (tmpBody.Active ? 1 : 0) : 1
				};

				let tmpCreateQuery = this.fable.DAL.ProjectionMapping.query.clone()
					.setIDUser(0)
					.addRecord(tmpNewRecord);

				this.fable.DAL.ProjectionMapping.doCreate(tmpCreateQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`ProjectionEngine error creating mapping: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Mapping: pRecord });
						return fNext();
					});
			});

		// POST /facto/projection/mapping/:ID/update -- update mapping
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projection/mapping/:ID/update`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.ProjectionMapping)
				{
					pResponse.send({ Error: 'DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.ID, 10);
				let tmpBody = pRequest.body || {};

				let tmpReadQuery = this.fable.DAL.ProjectionMapping.query.clone()
					.addFilter('IDProjectionMapping', tmpID);

				this.fable.DAL.ProjectionMapping.doRead(tmpReadQuery,
					(pReadError, pReadQuery, pExisting) =>
					{
						if (pReadError || !pExisting || !pExisting.IDProjectionMapping)
						{
							pResponse.send({ Error: 'Mapping not found' });
							return fNext();
						}

						// Update fields that were provided
						if (tmpBody.Name !== undefined) pExisting.Name = tmpBody.Name;
						if (tmpBody.IDSource !== undefined) pExisting.IDSource = parseInt(tmpBody.IDSource, 10) || 0;
						if (tmpBody.IDProjectionStore !== undefined) pExisting.IDProjectionStore = parseInt(tmpBody.IDProjectionStore, 10) || 0;
						if (tmpBody.SchemaVersion !== undefined) pExisting.SchemaVersion = parseInt(tmpBody.SchemaVersion, 10) || 0;
						if (tmpBody.Active !== undefined) pExisting.Active = tmpBody.Active ? 1 : 0;
						if (tmpBody.MappingConfiguration !== undefined)
						{
							pExisting.MappingConfiguration = (typeof tmpBody.MappingConfiguration === 'string')
								? tmpBody.MappingConfiguration
								: JSON.stringify(tmpBody.MappingConfiguration);
						}
						if (tmpBody.FlowDiagramState !== undefined)
						{
							pExisting.FlowDiagramState = (typeof tmpBody.FlowDiagramState === 'string')
								? tmpBody.FlowDiagramState
								: JSON.stringify(tmpBody.FlowDiagramState);
						}

						let tmpUpdateQuery = this.fable.DAL.ProjectionMapping.query.clone()
							.setIDUser(0)
							.addRecord(pExisting);

						this.fable.DAL.ProjectionMapping.doUpdate(tmpUpdateQuery,
							(pUpdateError, pUpdateQuery, pUpdated) =>
							{
								if (pUpdateError)
								{
									this.fable.log.error(`ProjectionEngine error updating mapping: ${pUpdateError}`);
									pResponse.send({ Error: pUpdateError.message || pUpdateError });
									return fNext();
								}
								pResponse.send({ Success: true, Mapping: pUpdated });
								return fNext();
							});
					});
			});

		// DELETE /facto/projection/mapping/:ID -- soft-delete mapping
		pOratorServiceServer.doDel(`${tmpRoutePrefix}/projection/mapping/:ID`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.ProjectionMapping)
				{
					pResponse.send({ Error: 'DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.ID, 10);

				let tmpReadQuery = this.fable.DAL.ProjectionMapping.query.clone()
					.addFilter('IDProjectionMapping', tmpID);

				this.fable.DAL.ProjectionMapping.doRead(tmpReadQuery,
					(pReadError, pReadQuery, pExisting) =>
					{
						if (pReadError || !pExisting || !pExisting.IDProjectionMapping)
						{
							pResponse.send({ Error: 'Mapping not found' });
							return fNext();
						}

						pExisting.Deleted = 1;
						pExisting.DeleteDate = new Date().toISOString();

						let tmpUpdateQuery = this.fable.DAL.ProjectionMapping.query.clone()
							.setIDUser(0)
							.addRecord(pExisting);

						this.fable.DAL.ProjectionMapping.doUpdate(tmpUpdateQuery,
							(pUpdateError) =>
							{
								if (pUpdateError)
								{
									pResponse.send({ Error: pUpdateError.message || pUpdateError });
									return fNext();
								}
								pResponse.send({ Success: true });
								return fNext();
							});
					});
			});

		// ======================================================================
		// Field Discovery route
		// ======================================================================

		// POST /facto/projection/:IDDataset/discover-fields
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projection/:IDDataset/discover-fields`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'DAL not initialized' });
					return fNext();
				}

				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				let tmpBody = pRequest.body || {};
				let tmpIDSource = parseInt(tmpBody.IDSource, 10) || 0;
				let tmpSampleSize = parseInt(tmpBody.SampleSize, 10) || 50;

				let tmpRecordQuery = this.fable.DAL.Record.query.clone()
					.addFilter('Deleted', 0)
					.setCap(tmpSampleSize);

				if (tmpIDSource > 0)
				{
					tmpRecordQuery.addFilter('IDSource', tmpIDSource);
				}
				else
				{
					// Fallback: query by dataset sources
					tmpRecordQuery.addFilter('IDDataset', tmpIDDataset);
				}

				this.fable.DAL.Record.doReads(tmpRecordQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`ProjectionEngine error discovering fields: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}

						let tmpTabularCheck = this.fable.services.TabularCheck;
						let tmpStatistics = tmpTabularCheck.newStatisticsObject('FieldDiscovery');

						let tmpRowCount = 0;
						for (let i = 0; i < pRecords.length; i++)
						{
							try
							{
								let tmpParsed = JSON.parse(pRecords[i].Content);
								tmpTabularCheck.collectStatistics(tmpParsed, tmpStatistics);
								tmpRowCount++;
							}
							catch (pParseError)
							{
								this.fable.log.warn(`ProjectionEngine: Could not parse record ${pRecords[i].IDRecord} content: ${pParseError.message}`);
							}
						}

						pResponse.send(
						{
							Headers: tmpStatistics.Headers || [],
							ColumnStatistics: tmpStatistics.ColumnStatistics || {},
							SampleSize: tmpRowCount
						});
						return fNext();
					});
			});

		// ======================================================================
		// Import Execution route
		// ======================================================================

		// POST /facto/projection/:IDDataset/import
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/projection/:IDDataset/import`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.ProjectionMapping ||
					!this.fable.DAL.ProjectionStore || !this.fable.DAL.StoreConnection ||
					!this.fable.DAL.Record || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Error: 'DAL not initialized' });
					return fNext();
				}

				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				let tmpBody = pRequest.body || {};
				let tmpIDProjectionMapping = parseInt(tmpBody.IDProjectionMapping, 10);
				let tmpIDProjectionStore = parseInt(tmpBody.IDProjectionStore, 10);
				let tmpBatchSize = parseInt(tmpBody.BatchSize, 10) || 100;
				let tmpCap = parseInt(tmpBody.Cap, 10) || 0;
				let tmpStageComprehension = !!tmpBody.StageComprehension;

				if (!tmpIDProjectionMapping)
				{
					pResponse.send({ Error: 'IDProjectionMapping is required' });
					return fNext();
				}
				if (!tmpIDProjectionStore)
				{
					pResponse.send({ Error: 'IDProjectionStore is required' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpMapping = null;
				let tmpMappingConfig = null;
				let tmpProjectionStore = null;
				let tmpConnection = null;
				let tmpDataset = null;
				let tmpLog = [];

				// Load mapping
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						let tmpQuery = this.fable.DAL.ProjectionMapping.query.clone()
							.addFilter('IDProjectionMapping', tmpIDProjectionMapping);

						this.fable.DAL.ProjectionMapping.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (pError || !pRecord || !pRecord.IDProjectionMapping)
								{
									return fStepCallback(new Error('Mapping not found'));
								}
								tmpMapping = pRecord;
								try
								{
									tmpMappingConfig = JSON.parse(tmpMapping.MappingConfiguration || '{}');
								}
								catch (e)
								{
									return fStepCallback(new Error('Invalid MappingConfiguration JSON'));
								}
								return fStepCallback();
							});
					});

				// Load projection store
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						let tmpQuery = this.fable.DAL.ProjectionStore.query.clone()
							.addFilter('IDProjectionStore', tmpIDProjectionStore);

						this.fable.DAL.ProjectionStore.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (pError || !pRecord || !pRecord.IDProjectionStore)
								{
									return fStepCallback(new Error('ProjectionStore not found'));
								}
								tmpProjectionStore = pRecord;
								return fStepCallback();
							});
					});

				// Load dataset
				tmpAnticipate.anticipate(
					(fStepCallback) =>
					{
						let tmpQuery = this.fable.DAL.Dataset.query.clone()
							.addFilter('IDDataset', tmpIDDataset);

						this.fable.DAL.Dataset.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (pError || !pRecord || !pRecord.IDDataset)
								{
									return fStepCallback(new Error('Dataset not found'));
								}
								tmpDataset = pRecord;
								return fStepCallback();
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

						// Load the store connection
						let tmpConnQuery = this.fable.DAL.StoreConnection.query.clone()
							.addFilter('IDStoreConnection', tmpProjectionStore.IDStoreConnection);

						this.fable.DAL.StoreConnection.doRead(tmpConnQuery,
							(pConnError, pConnQuery, pConnRecord) =>
							{
								if (pConnError || !pConnRecord || !pConnRecord.IDStoreConnection)
								{
									pResponse.send({ Error: 'StoreConnection not found for this ProjectionStore' });
									return fNext();
								}
								tmpConnection = pConnRecord;

								// Parse schema for column definitions
								let tmpParsedSchema = null;
								try
								{
									tmpParsedSchema = this._parseMicroDDL(tmpDataset.SchemaDefinition || '');
								}
								catch (e)
								{
									pResponse.send({ Error: `Schema parse error: ${e.message}` });
									return fNext();
								}

								let tmpColumns = [];
								if (tmpParsedSchema && tmpParsedSchema.Tables)
								{
									let tmpTableKeys = Object.keys(tmpParsedSchema.Tables);
									if (tmpTableKeys.length > 0)
									{
										tmpColumns = tmpParsedSchema.Tables[tmpTableKeys[0]].Columns || [];
									}
								}

								tmpLog.push(`[${new Date().toISOString()}] Starting import for mapping "${tmpMapping.Name}" -> store "${tmpProjectionStore.TargetTableName}"`);

								// Query source records from internal DAL
								let tmpRecordQuery = this.fable.DAL.Record.query.clone()
									.addFilter('Deleted', 0)
									.addFilter('IDSource', tmpMapping.IDSource);

								if (tmpCap > 0)
								{
									tmpRecordQuery.setCap(tmpCap);
								}

								this.fable.DAL.Record.doReads(tmpRecordQuery,
									(pRecordError, pRecordQuery, pRecords) =>
									{
										if (pRecordError)
										{
											tmpLog.push(`[${new Date().toISOString()}] Record query error: ${pRecordError.message}`);
											pResponse.send({ Error: pRecordError.message, Log: tmpLog.join('\n') });
											return fNext();
										}

										tmpLog.push(`[${new Date().toISOString()}] Found ${pRecords.length} source records`);

										// Phase 1: Build comprehension via TabularTransform
										let tmpTabularTransform = this.fable.services.TabularTransform;
										let tmpMappingOutcome = tmpTabularTransform.newMappingOutcomeObject();
										tmpMappingOutcome.ExplicitConfiguration = tmpMappingConfig;
										// Pre-seed ImplicitConfiguration so initializeMappingOutcomeObject()
										// does not attempt to auto-generate one (which references an
										// out-of-scope variable in the meadow-integration source).
										tmpMappingOutcome.ImplicitConfiguration = tmpMappingConfig;

										let tmpParseErrorCount = 0;

										for (let i = 0; i < pRecords.length; i++)
										{
											let tmpRecord = pRecords[i];
											let tmpParsedContent;
											try
											{
												tmpParsedContent = JSON.parse(tmpRecord.Content);
											}
											catch (e)
											{
												tmpParseErrorCount++;
												tmpLog.push(`[${new Date().toISOString()}] Parse error on record ${tmpRecord.IDRecord}: ${e.message}`);
												continue;
											}

											// Pass flat content — Pict's resolveStateFromAddress auto-wraps as rootDataObject.Record = pRecord
											let tmpWrapped = Object.assign({ IDRecord: tmpRecord.IDRecord }, tmpParsedContent);

											try
											{
												tmpTabularTransform.transformRecord(tmpWrapped, tmpMappingOutcome);
											}
											catch (e)
											{
												tmpLog.push(`[${new Date().toISOString()}] Transform error on record ${tmpRecord.IDRecord}: ${e.message}`);
											}
										}

										// Extract the comprehension records
										let tmpEntityName = tmpMappingConfig.Entity || Object.keys(tmpMappingOutcome.Comprehension)[0];
										let tmpComprehensionRecords = tmpMappingOutcome.Comprehension[tmpEntityName] || {};
										let tmpRecordGUIDs = Object.keys(tmpComprehensionRecords);

										tmpLog.push(`[${new Date().toISOString()}] Comprehension built: ${tmpMappingOutcome.ParsedRowCount} transformed, ${tmpRecordGUIDs.length} unique records (${tmpMappingOutcome.BadRecords.length} bad, ${tmpParseErrorCount} parse errors)`);

										// Stage comprehension to disk if requested
										let tmpStagingFile = false;
										if (tmpStageComprehension)
										{
											try
											{
												let tmpStagingDir = libPath.join(process.cwd(), 'data', 'staging');
												if (!libFS.existsSync(tmpStagingDir))
												{
													libFS.mkdirSync(tmpStagingDir, { recursive: true });
												}
												let tmpTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
												let tmpFilename = `comprehension-${tmpIDDataset}-${tmpIDProjectionMapping}-${tmpTimestamp}.json`;
												let tmpFilePath = libPath.join(tmpStagingDir, tmpFilename);
												let tmpStagingData = {
													IDDataset: tmpIDDataset,
													IDProjectionMapping: tmpIDProjectionMapping,
													IDProjectionStore: tmpIDProjectionStore,
													MappingName: tmpMapping.Name,
													Entity: tmpEntityName,
													Timestamp: new Date().toISOString(),
													RecordCount: tmpRecordGUIDs.length,
													BadRecordCount: tmpMappingOutcome.BadRecords.length,
													Comprehension: tmpMappingOutcome.Comprehension,
													BadRecords: tmpMappingOutcome.BadRecords
												};
												libFS.writeFileSync(tmpFilePath, JSON.stringify(tmpStagingData, null, '\t'));
												tmpStagingFile = tmpFilename;
												tmpLog.push(`[${new Date().toISOString()}] Comprehension staged to: ${tmpFilename}`);
											}
											catch (pStagingError)
											{
												tmpLog.push(`[${new Date().toISOString()}] Staging error: ${pStagingError.message}`);
											}
										}

										if (tmpRecordGUIDs.length === 0)
										{
											tmpLog.push(`[${new Date().toISOString()}] No records to insert`);
											pResponse.send(
											{
												Success: true,
												RecordsProcessed: pRecords.length,
												RecordsTransformed: 0,
												RecordsCreated: 0,
												RecordsErrored: tmpParseErrorCount + tmpMappingOutcome.BadRecords.length,
												StagingFile: tmpStagingFile,
												Log: tmpLog.join('\n')
											});
											return fNext();
										}

										// Phase 2: Upsert comprehension records via IntegrationAdapter + REST to self
										let tmpTargetEntityName = tmpProjectionStore.TargetTableName;

										// Lazy-register the projection entity if not already registered
										let tmpDoImport = () =>
										{
											let tmpPort = this.fable.settings.APIServerPort || 8080;
											let tmpServerURL = `http://localhost:${tmpPort}/1.0/`;

											// Create a RestClient that points at our own Orator server
											let tmpRestClient = this.fable.serviceManager.instantiateServiceProviderWithoutRegistration(
												'MeadowCloneRestClient',
												{
													ServerURL: tmpServerURL
												});

											// Create an IntegrationAdapter for this entity
											let tmpAdapter = this.fable.serviceManager.instantiateServiceProviderWithoutRegistration(
												'IntegrationAdapter',
												{
													Entity: tmpTargetEntityName,
													Client: tmpRestClient,
													AdapterSetGUIDMarshalPrefix: `PROJ-${tmpIDDataset}`,
													PerformUpserts: true,
													PerformDeletes: false,
													SimpleMarshal: true
												});

											// Feed comprehension records to the adapter
											let tmpGUIDField = `GUID${tmpTargetEntityName}`;
											for (let i = 0; i < tmpRecordGUIDs.length; i++)
											{
												let tmpGUID = tmpRecordGUIDs[i];
												let tmpCompRecord = tmpComprehensionRecords[tmpGUID];
												// Ensure the GUID field exists for IntegrationAdapter
												if (!tmpCompRecord[tmpGUIDField])
												{
													tmpCompRecord[tmpGUIDField] = tmpGUID;
												}
												tmpAdapter.addSourceRecord(tmpCompRecord);
											}

											tmpLog.push(`[${new Date().toISOString()}] Pushing ${tmpRecordGUIDs.length} records via IntegrationAdapter to ${tmpServerURL}${tmpTargetEntityName}/Upsert`);

											// Marshal and push records through the REST API
											tmpAdapter.marshalSourceRecords(
												(pMarshalError) =>
												{
													if (pMarshalError)
													{
														tmpLog.push(`[${new Date().toISOString()}] Marshal error: ${pMarshalError.message}`);
														pResponse.send(
														{
															Error: `Marshal error: ${pMarshalError.message}`,
															RecordsProcessed: pRecords.length,
															RecordsTransformed: tmpRecordGUIDs.length,
															StagingFile: tmpStagingFile,
															Log: tmpLog.join('\n')
														});
														return fNext();
													}

													let tmpMarshaledCount = Object.keys(tmpAdapter._MarshaledRecords).length;
													tmpLog.push(`[${new Date().toISOString()}] Marshaled ${tmpMarshaledCount} records; pushing to server...`);

													tmpAdapter.pushRecordsToServer(
														(pPushError) =>
														{
															if (pPushError)
															{
																tmpLog.push(`[${new Date().toISOString()}] Push error: ${pPushError.message}`);
															}

															tmpLog.push(`[${new Date().toISOString()}] Import complete: ${pRecords.length} source records, ${tmpRecordGUIDs.length} unique, ${tmpMarshaledCount} upserted`);

															pResponse.send(
															{
																Success: !pPushError,
																RecordsProcessed: pRecords.length,
																RecordsTransformed: tmpRecordGUIDs.length,
																RecordsDeduplicated: tmpMappingOutcome.ParsedRowCount - tmpRecordGUIDs.length,
																BadRecords: tmpMappingOutcome.BadRecords.length,
																RecordsUpserted: tmpMarshaledCount,
																StagingFile: tmpStagingFile,
																Log: tmpLog.join('\n')
															});
															return fNext();
														});
												});
										};

										if (!this._ProjectionEntities[tmpTargetEntityName])
										{
											// Entity not yet registered — register lazily
											tmpLog.push(`[${new Date().toISOString()}] Registering Meadow entity [${tmpTargetEntityName}] for REST upserts...`);
											this._registerProjectionEntity(tmpProjectionStore, tmpConnection, tmpParsedSchema, null,
												(pRegError) =>
												{
													if (pRegError)
													{
														tmpLog.push(`[${new Date().toISOString()}] Entity registration failed: ${pRegError.message}`);
														pResponse.send(
														{
															Error: `Entity registration failed: ${pRegError.message}`,
															Log: tmpLog.join('\n')
														});
														return fNext();
													}
													tmpLog.push(`[${new Date().toISOString()}] Entity [${tmpTargetEntityName}] registered successfully`);
													return tmpDoImport();
												});
										}
										else
										{
											return tmpDoImport();
										}
									});
							});
					});
			});

		// ======================================================================
		// Comprehension Staging routes
		// ======================================================================

		// GET /facto/projection/:IDDataset/comprehensions — list staged comprehension files
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/projection/:IDDataset/comprehensions`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				let tmpStagingDir = libPath.join(process.cwd(), 'data', 'staging');

				if (!libFS.existsSync(tmpStagingDir))
				{
					pResponse.send({ Files: [] });
					return fNext();
				}

				try
				{
					let tmpAllFiles = libFS.readdirSync(tmpStagingDir);
					let tmpPrefix = `comprehension-${tmpIDDataset}-`;
					let tmpFiles = tmpAllFiles
						.filter((pFile) => { return pFile.startsWith(tmpPrefix) && pFile.endsWith('.json'); })
						.sort()
						.reverse();

					pResponse.send({ Files: tmpFiles });
				}
				catch (pReadError)
				{
					pResponse.send({ Error: pReadError.message, Files: [] });
				}
				return fNext();
			});

		// GET /facto/projection/:IDDataset/comprehension/:Filename — download a staged comprehension file
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/projection/:IDDataset/comprehension/:Filename`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpFilename = pRequest.params.Filename;

				// Sanitize filename to prevent path traversal
				if (!tmpFilename || tmpFilename.includes('..') || tmpFilename.includes('/') || tmpFilename.includes('\\'))
				{
					pResponse.send({ Error: 'Invalid filename' });
					return fNext();
				}

				let tmpFilePath = libPath.join(process.cwd(), 'data', 'staging', tmpFilename);

				if (!libFS.existsSync(tmpFilePath))
				{
					pResponse.send({ Error: 'File not found' });
					return fNext();
				}

				try
				{
					let tmpContent = libFS.readFileSync(tmpFilePath, 'utf8');
					let tmpParsed = JSON.parse(tmpContent);
					pResponse.send(tmpParsed);
				}
				catch (pReadError)
				{
					pResponse.send({ Error: pReadError.message });
				}
				return fNext();
			});

		this.fable.log.info(`ProjectionEngine routes connected at ${tmpRoutePrefix}/projections/*`);
	}

	/**
	 * Parse MicroDDL text into a schema object with Tables.
	 *
	 * Supports the core MicroDDL symbols:
	 *   ! = Table declaration
	 *   @ = Auto-identity column
	 *   % = GUID column
	 *   $ = String column (with size)
	 *   * = Text column
	 *   # = Numeric column
	 *   . = Decimal column (with precision)
	 *   & = DateTime column
	 *   ^ = Boolean column
	 *   -> = Join reference (ignored for schema generation)
	 *
	 * @param {string} pDDL - MicroDDL text
	 * @returns {object} Schema object with Tables hash
	 */

	/**
	 * Build a Meadow-compatible schema array from parsed MicroDDL columns.
	 *
	 * FoxHound uses this schema to determine how to handle each column in
	 * generated INSERT queries (e.g. AutoIdentity → NULL, CreateDate → NOW()).
	 *
	 * @param {Array} pColumns - Column definitions from _parseMicroDDL()
	 * @returns {Array} Meadow schema array for FoxHound
	 */
	_buildMeadowSchemaFromColumns(pColumns)
	{
		let tmpSchema = [];
		for (let i = 0; i < pColumns.length; i++)
		{
			let tmpCol = pColumns[i];
			let tmpType = 'Default';

			// Map MicroDDL types to FoxHound schema types
			if (tmpCol.MeadowType)
			{
				tmpType = tmpCol.MeadowType;
			}
			else if (tmpCol.DataType === 'ID')
			{
				tmpType = 'AutoIdentity';
			}
			else if (tmpCol.DataType === 'GUID')
			{
				tmpType = 'AutoGUID';
			}

			tmpSchema.push(
			{
				Column: tmpCol.Column,
				Type: tmpType,
				Size: tmpCol.Size || 'Default'
			});
		}
		return tmpSchema;
	}

	/**
	 * Coerce parameter values for SQLite compatibility.
	 *
	 * better-sqlite3 does not accept JavaScript booleans; they must be
	 * converted to 0/1.  Single-element arrays are unwrapped to scalars.
	 * This mirrors the coercion in Meadow-Provider-SQLite.
	 *
	 * @param {object} pParameters - FoxHound query parameters (mutated in place)
	 */
	_coerceSQLiteParameters(pParameters)
	{
		let tmpKeys = Object.keys(pParameters);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpKey = tmpKeys[i];
			let tmpValue = pParameters[tmpKey];

			if (typeof(tmpValue) === 'boolean')
			{
				pParameters[tmpKey] = tmpValue ? 1 : 0;
			}
			else if (Array.isArray(tmpValue) && tmpValue.length === 1)
			{
				pParameters[tmpKey] = tmpValue[0];
			}
		}
	}

	_parseMicroDDL(pDDL)
	{
		let tmpLines = pDDL.split('\n');
		let tmpTables = {};
		let tmpCurrentTable = null;

		let tmpSymbolMap =
		{
			'@': { DataType: 'ID', MeadowType: 'AutoIdentity' },
			'%': { DataType: 'GUID', MeadowType: 'AutoGUID' },
			'$': { DataType: 'String', MeadowType: 'String' },
			'*': { DataType: 'Text', MeadowType: 'String' },
			'#': { DataType: 'Numeric', MeadowType: 'Numeric' },
			'.': { DataType: 'Decimal', MeadowType: 'Numeric' },
			'&': { DataType: 'DateTime', MeadowType: 'String' },
			'^': { DataType: 'Boolean', MeadowType: 'Deleted' }
		};

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i].trim();

			// Skip blank lines and comments
			if (!tmpLine || tmpLine.startsWith('//') || tmpLine.startsWith('--'))
			{
				continue;
			}

			// Skip join references
			if (tmpLine.startsWith('->'))
			{
				continue;
			}

			// Table declaration
			if (tmpLine.startsWith('!'))
			{
				let tmpTableName = tmpLine.substring(1).trim();
				tmpCurrentTable =
				{
					TableName: tmpTableName,
					Columns: []
				};
				tmpTables[tmpTableName] = tmpCurrentTable;
				continue;
			}

			// Column definition
			let tmpSymbol = tmpLine.charAt(0);
			if (tmpSymbolMap.hasOwnProperty(tmpSymbol) && tmpCurrentTable)
			{
				let tmpRest = tmpLine.substring(1).trim();
				let tmpParts = tmpRest.split(/\s+/);
				let tmpColumnName = tmpParts[0] || '';
				let tmpSize = tmpParts[1] || 'Default';

				tmpCurrentTable.Columns.push(
				{
					Column: tmpColumnName,
					DataType: tmpSymbolMap[tmpSymbol].DataType,
					Size: tmpSize
				});
			}
		}

		return { Tables: tmpTables };
	}

	/**
	 * Save or update a ProjectionStore record.
	 *
	 * @param {number} pIDDataset - The dataset ID
	 * @param {number} pIDStoreConnection - The store connection ID
	 * @param {string} pTargetTableName - Target table name
	 * @param {string} pStatus - Status string (Pending, Deployed, Failed)
	 * @param {string} pLog - Deployment log text
	 * @param {function} fCallback - Callback(pError, pRecord)
	 */
	_saveProjectionStore(pIDDataset, pIDStoreConnection, pTargetTableName, pStatus, pLog, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.ProjectionStore)
		{
			return fCallback(new Error('ProjectionStore DAL not initialized'));
		}

		// Check if a ProjectionStore record already exists for this dataset + connection
		let tmpQuery = this.fable.DAL.ProjectionStore.query.clone()
			.addFilter('IDDataset', pIDDataset)
			.addFilter('IDStoreConnection', pIDStoreConnection)
			.addFilter('Deleted', 0);

		this.fable.DAL.ProjectionStore.doReads(tmpQuery,
			(pError, pQuery, pRecords) =>
			{
				if (!pError && pRecords && pRecords.length > 0)
				{
					// Update existing record
					let tmpExisting = pRecords[0];
					tmpExisting.TargetTableName = pTargetTableName;
					tmpExisting.Status = pStatus;
					tmpExisting.DeployLog = pLog;
					if (pStatus === 'Deployed')
					{
						tmpExisting.DeployedAt = new Date().toISOString();
					}

					let tmpUpdateQuery = this.fable.DAL.ProjectionStore.query.clone()
						.addRecord(tmpExisting);

					this.fable.DAL.ProjectionStore.doUpdate(tmpUpdateQuery,
						(pUpdateError, pUpdateQuery, pUpdated) =>
						{
							return fCallback(pUpdateError, pUpdated);
						});
				}
				else
				{
					// Create new record
					let tmpNewRecord =
					{
						IDDataset: pIDDataset,
						IDStoreConnection: pIDStoreConnection,
						TargetTableName: pTargetTableName,
						Status: pStatus,
						DeployLog: pLog
					};

					if (pStatus === 'Deployed')
					{
						tmpNewRecord.DeployedAt = new Date().toISOString();
					}

					let tmpCreateQuery = this.fable.DAL.ProjectionStore.query.clone()
						.setIDUser(0)
						.addRecord(tmpNewRecord);

					this.fable.DAL.ProjectionStore.doCreate(tmpCreateQuery,
						(pCreateError, pCreateQuery, pCreated) =>
						{
							return fCallback(pCreateError, pCreated);
						});
				}
			});
	}

	// ======================================================================
	// Dynamic Meadow Entity Registration for Projection Tables
	// ======================================================================

	/**
	 * Map connection type to the Fable singleton property name used by Meadow providers.
	 */
	_getProviderPropertyName(pConnectionType)
	{
		let tmpMap =
		{
			'SQLite': 'MeadowSQLiteProvider',
			'MySQL': 'MeadowMySQLProvider',
			'MSSQL': 'MeadowMSSQLProvider',
			'PostgreSQL': 'MeadowPostgreSQLProvider'
		};
		return tmpMap[pConnectionType] || false;
	}

	/**
	 * Dynamically register a Meadow entity + endpoints for a projection table.
	 *
	 * Creates a proxy Fable that routes DB queries to the external connection,
	 * then creates DAL + MeadowEndpoints so the IntegrationAdapter can upsert
	 * records through our own REST API.
	 *
	 * @param {object} pProjectionStore - The ProjectionStore record
	 * @param {object} pConnection - The StoreConnection record
	 * @param {object} pParsedSchema - Output of _parseMicroDDL()
	 * @param {object} pConnector - An already-connected meadow-connection instance (optional)
	 * @param {function} fCallback - Callback(pError)
	 */
	_registerProjectionEntity(pProjectionStore, pConnection, pParsedSchema, pConnector, fCallback)
	{
		let tmpEntityName = pProjectionStore.TargetTableName;

		// If already registered, skip
		if (this._ProjectionEntities[tmpEntityName])
		{
			this.fable.log.info(`Projection entity [${tmpEntityName}] already registered; skipping.`);
			return fCallback();
		}

		// Build a Meadow package object from the parsed schema
		let tmpFirstTableKey = Object.keys(pParsedSchema.Tables)[0];
		let tmpColumns = pParsedSchema.Tables[tmpFirstTableKey].Columns;
		let tmpMeadowSchemaArray = this._buildMeadowSchemaFromColumns(tmpColumns);

		let tmpPackageObject =
		{
			Scope: tmpEntityName,
			Schema: tmpMeadowSchemaArray
		};

		let tmpProviderProperty = this._getProviderPropertyName(pConnection.Type);
		if (!tmpProviderProperty)
		{
			return fCallback(new Error(`Unsupported connection type for entity registration: ${pConnection.Type}`));
		}

		let tmpFinishRegistration = (pConnectorInstance) =>
		{
			// Create a proxy Fable that overrides the provider property
			let tmpProxyFable = Object.create(this.fable);
			tmpProxyFable[tmpProviderProperty] = pConnectorInstance;

			// Create Meadow DAL with the proxy fable
			let tmpMeadow = libMeadow.new(tmpProxyFable);
			let tmpDAL = tmpMeadow.loadFromPackageObject(tmpPackageObject);
			tmpDAL.setProvider(pConnection.Type);

			// Create MeadowEndpoints and wire routes
			let tmpEndpoints = libMeadowEndpoints.new(tmpDAL);
			tmpEndpoints.connectRoutes(this.fable.OratorServiceServer);

			// Store the registration
			this._ProjectionEntities[tmpEntityName] =
			{
				DAL: tmpDAL,
				Endpoints: tmpEndpoints,
				Connector: pConnectorInstance,
				ProxyFable: tmpProxyFable,
				IDProjectionStore: pProjectionStore.IDProjectionStore
			};

			// Also publish to fable DAL/MeadowEndpoints maps
			if (this.fable.DAL)
			{
				this.fable.DAL[tmpEntityName] = tmpDAL;
			}
			if (this.fable.MeadowEndpoints)
			{
				this.fable.MeadowEndpoints[tmpEntityName] = tmpEndpoints;
			}

			this.fable.log.info(`Projection entity [${tmpEntityName}] registered (${pConnection.Type} via proxy fable).`);
			return fCallback();
		};

		if (pConnector)
		{
			// Reuse an already-connected connector
			return tmpFinishRegistration(pConnector);
		}

		// Create and connect a new connector
		let tmpConfig = {};
		try { tmpConfig = JSON.parse(pConnection.Config || '{}'); }
		catch (e) { /* ignore */ }

		let tmpConnectorModuleName = '';
		let tmpConnectorModules =
		[
			{ Type: 'MySQL', Module: 'meadow-connection-mysql' },
			{ Type: 'PostgreSQL', Module: 'meadow-connection-postgresql' },
			{ Type: 'MSSQL', Module: 'meadow-connection-mssql' },
			{ Type: 'SQLite', Module: 'meadow-connection-sqlite' }
		];

		for (let i = 0; i < tmpConnectorModules.length; i++)
		{
			if (tmpConnectorModules[i].Type === pConnection.Type)
			{
				tmpConnectorModuleName = tmpConnectorModules[i].Module;
				break;
			}
		}

		if (!tmpConnectorModuleName)
		{
			return fCallback(new Error(`Unknown connection type: ${pConnection.Type}`));
		}

		let tmpConnectorModule;
		try
		{
			tmpConnectorModule = require(tmpConnectorModuleName);
		}
		catch (pRequireError)
		{
			return fCallback(new Error(`Connector module not installed: ${tmpConnectorModuleName}`));
		}

		let tmpNewConnector = new tmpConnectorModule(this.fable, tmpConfig, `ProjEntity-${tmpEntityName}-${Date.now()}`);

		tmpNewConnector.connectAsync(
			(pConnectError) =>
			{
				if (pConnectError)
				{
					return fCallback(new Error(`Connection failed for entity [${tmpEntityName}]: ${pConnectError.message}`));
				}
				return tmpFinishRegistration(tmpNewConnector);
			});
	}

	/**
	 * Re-register Meadow entities for all deployed ProjectionStores on startup.
	 *
	 * This ensures projection entities survive server restarts.
	 *
	 * @param {function} fCallback - Callback(pError)
	 */
	_warmUpProjectionEntities(fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.ProjectionStore)
		{
			this.fable.log.warn('ProjectionStore DAL not available; skipping projection entity warm-up.');
			return fCallback();
		}

		let tmpQuery = this.fable.DAL.ProjectionStore.query.clone()
			.addFilter('Status', 'Deployed')
			.addFilter('Deleted', 0);

		this.fable.DAL.ProjectionStore.doReads(tmpQuery,
			(pError, pQuery, pRecords) =>
			{
				if (pError || !pRecords || pRecords.length === 0)
				{
					if (pError)
					{
						this.fable.log.warn(`Projection entity warm-up query error: ${pError.message}`);
					}
					else
					{
						this.fable.log.info('No deployed ProjectionStores found; warm-up complete.');
					}
					return fCallback();
				}

				this.fable.log.info(`Warming up ${pRecords.length} deployed projection entit${pRecords.length === 1 ? 'y' : 'ies'}...`);

				let tmpAnticipate = this.fable.newAnticipate();

				for (let i = 0; i < pRecords.length; i++)
				{
					let tmpStore = pRecords[i];

					tmpAnticipate.anticipate(
						(fStepCallback) =>
						{
							// Load the Dataset for the schema
							let tmpDatasetQuery = this.fable.DAL.Dataset.query.clone()
								.addFilter('IDDataset', tmpStore.IDDataset);

							this.fable.DAL.Dataset.doRead(tmpDatasetQuery,
								(pDatasetError, pDatasetQuery, pDataset) =>
								{
									if (pDatasetError || !pDataset || !pDataset.IDDataset || !pDataset.SchemaDefinition)
									{
										this.fable.log.warn(`Warm-up: skipping store ${tmpStore.IDProjectionStore} — dataset not found or no schema.`);
										return fStepCallback();
									}

									// Load the StoreConnection
									let tmpConnQuery = this.fable.DAL.StoreConnection.query.clone()
										.addFilter('IDStoreConnection', tmpStore.IDStoreConnection);

									this.fable.DAL.StoreConnection.doRead(tmpConnQuery,
										(pConnError, pConnQuery, pConnection) =>
										{
											if (pConnError || !pConnection || !pConnection.IDStoreConnection)
											{
												this.fable.log.warn(`Warm-up: skipping store ${tmpStore.IDProjectionStore} — connection not found.`);
												return fStepCallback();
											}

											let tmpParsedSchema;
											try
											{
												tmpParsedSchema = this._parseMicroDDL(pDataset.SchemaDefinition);
											}
											catch (pParseError)
											{
												this.fable.log.warn(`Warm-up: skipping store ${tmpStore.IDProjectionStore} — schema parse error: ${pParseError.message}`);
												return fStepCallback();
											}

											if (!tmpParsedSchema || !tmpParsedSchema.Tables || Object.keys(tmpParsedSchema.Tables).length === 0)
											{
												this.fable.log.warn(`Warm-up: skipping store ${tmpStore.IDProjectionStore} — empty schema.`);
												return fStepCallback();
											}

											this._registerProjectionEntity(tmpStore, pConnection, tmpParsedSchema, null,
												(pRegError) =>
												{
													if (pRegError)
													{
														this.fable.log.warn(`Warm-up: failed to register entity for store ${tmpStore.IDProjectionStore}: ${pRegError.message}`);
													}
													return fStepCallback();
												});
										});
								});
						});
				}

				tmpAnticipate.wait(
					(pWaitError) =>
					{
						this.fable.log.info('Projection entity warm-up complete.');
						return fCallback();
					});
			});
	}
}

module.exports = RetoldFactoProjectionEngine;
module.exports.serviceType = 'RetoldFactoProjectionEngine';
module.exports.default_configuration = defaultProjectionEngineOptions;
