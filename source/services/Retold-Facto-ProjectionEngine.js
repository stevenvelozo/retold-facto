/**
 * Retold Facto - Projection Engine Service
 *
 * Creates flattened projections, temporary SQL tables, and materialized
 * views from multidimensional dataset data for reporting and charting.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

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

		this.fable.log.info(`ProjectionEngine routes connected at ${tmpRoutePrefix}/projections/*`);
	}
}

module.exports = RetoldFactoProjectionEngine;
module.exports.serviceType = 'RetoldFactoProjectionEngine';
module.exports.default_configuration = defaultProjectionEngineOptions;
