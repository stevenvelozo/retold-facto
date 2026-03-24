/**
 * Retold Facto -- Beacon Provider
 *
 * Fable service that registers retold-facto as a beacon in the
 * Ultravisor mesh.  This exposes facto's data access, transform,
 * and deployment capabilities so other nodes in the mesh can
 * interact with the facto data pipeline remotely.
 *
 * Three capabilities are registered:
 *   - FactoData:      CRUD operations against facto's database
 *   - FactoTransform:  TabularTransform execution (pure function)
 *   - FactoDeploy:     Schema deployment to projection stores
 *
 * @license MIT
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');
const libBeaconService = require('ultravisor-beacon');

class RetoldFactoBeaconProvider extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'RetoldFactoBeaconProvider';

		// Beacon service reference (created on connectBeacon)
		this._BeaconService = null;
	}

	/**
	 * Connect to an Ultravisor coordinator as a beacon, registering
	 * facto's data, transform, and deployment capabilities.
	 *
	 * @param {object} pBeaconConfig Beacon configuration:
	 *   - ServerURL {string} Ultravisor server URL (required)
	 *   - Name {string} Beacon name (default: 'retold-facto')
	 *   - Password {string} Auth password (default: '')
	 *   - MaxConcurrent {number} Max concurrent work items (default: 1)
	 *   - StagingPath {string} Local staging directory (default: cwd)
	 *   - Tags {object} Beacon tags (default: {})
	 *   - BindAddresses {array} Addresses to bind (default: [])
	 * @param {Function} fCallback Called with (pError, pBeaconInfo)
	 */
	connectBeacon(pBeaconConfig, fCallback)
	{
		if (!pBeaconConfig || !pBeaconConfig.ServerURL)
		{
			return fCallback(new Error('connectBeacon requires a ServerURL in the config.'));
		}

		if (this._BeaconService && this._BeaconService.isEnabled())
		{
			this.log.warn('RetoldFactoBeaconProvider: beacon already connected.');
			return fCallback(null);
		}

		// Register the beacon service type with fable if not already present
		this.fable.addServiceTypeIfNotExists('UltravisorBeacon', libBeaconService);

		// Instantiate the beacon service with the provided config
		this._BeaconService = this.fable.instantiateServiceProviderWithoutRegistration('UltravisorBeacon',
			{
				ServerURL: pBeaconConfig.ServerURL,
				Name: pBeaconConfig.Name || 'retold-facto',
				Password: pBeaconConfig.Password || '',
				MaxConcurrent: pBeaconConfig.MaxConcurrent || 1,
				StagingPath: pBeaconConfig.StagingPath || process.cwd(),
				Tags: pBeaconConfig.Tags || {},
				BindAddresses: pBeaconConfig.BindAddresses || []
			});

		// Capture a reference to the fable instance for use in
		// capability handler closures (which run in a different scope).
		let tmpFable = this.fable;
		let tmpLog = this.log;

		// ---------------------------------------------------------
		// Capability: FactoData
		// CRUD operations against facto's database via DAL entities
		// ---------------------------------------------------------
		this._BeaconService.registerCapability(
			{
				Capability: 'FactoData',
				Name: 'FactoDataProvider',
				actions:
				{
					'CreateSource':
					{
						Description: 'Create a new Source record',
						SettingsSchema:
						[
							{ Name: 'Name', DataType: 'String', Required: true },
							{ Name: 'Type', DataType: 'String', Required: true },
							{ Name: 'URL', DataType: 'String', Required: false }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpQuery = tmpFable.DAL.Source.query.clone();
							tmpFable.DAL.Source.doCreate(tmpQuery,
								{
									Name: tmpSettings.Name,
									Type: tmpSettings.Type,
									URL: tmpSettings.URL
								},
								(pError, pQuery, pRecord) =>
								{
									if (pError)
									{
										tmpLog.error(`FactoData.CreateSource failed: ${pError.message}`);
										return fCallback(pError);
									}
									return fCallback(null, { Outputs: { Created: pRecord } });
								});
						}
					},

					'CreateDataset':
					{
						Description: 'Create a new Dataset record',
						SettingsSchema:
						[
							{ Name: 'Name', DataType: 'String', Required: true },
							{ Name: 'Type', DataType: 'String', Required: true }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpQuery = tmpFable.DAL.Dataset.query.clone();
							tmpFable.DAL.Dataset.doCreate(tmpQuery,
								{
									Name: tmpSettings.Name,
									Type: tmpSettings.Type
								},
								(pError, pQuery, pRecord) =>
								{
									if (pError)
									{
										tmpLog.error(`FactoData.CreateDataset failed: ${pError.message}`);
										return fCallback(pError);
									}
									return fCallback(null, { Outputs: { Created: pRecord } });
								});
						}
					},

					'CreateIngestJob':
					{
						Description: 'Create a new IngestJob record',
						SettingsSchema:
						[
							{ Name: 'IDSource', DataType: 'Integer', Required: true },
							{ Name: 'IDDataset', DataType: 'Integer', Required: true },
							{ Name: 'Status', DataType: 'String', Required: false },
							{ Name: 'StartDate', DataType: 'DateTime', Required: false }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpQuery = tmpFable.DAL.IngestJob.query.clone();
							tmpFable.DAL.IngestJob.doCreate(tmpQuery,
								{
									IDSource: tmpSettings.IDSource,
									IDDataset: tmpSettings.IDDataset,
									Status: tmpSettings.Status,
									StartDate: tmpSettings.StartDate
								},
								(pError, pQuery, pRecord) =>
								{
									if (pError)
									{
										tmpLog.error(`FactoData.CreateIngestJob failed: ${pError.message}`);
										return fCallback(pError);
									}
									return fCallback(null, { Outputs: { Created: pRecord } });
								});
						}
					},

					'CreateRecord':
					{
						Description: 'Create a new Record entry',
						SettingsSchema:
						[
							{ Name: 'IDDataset', DataType: 'Integer', Required: true },
							{ Name: 'IDSource', DataType: 'Integer', Required: true },
							{ Name: 'IDIngestJob', DataType: 'Integer', Required: true },
							{ Name: 'Content', DataType: 'String', Required: true },
							{ Name: 'Type', DataType: 'String', Required: false },
							{ Name: 'IngestDate', DataType: 'DateTime', Required: false },
							{ Name: 'Version', DataType: 'Integer', Required: false }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpQuery = tmpFable.DAL.Record.query.clone();
							tmpFable.DAL.Record.doCreate(tmpQuery,
								{
									IDDataset: tmpSettings.IDDataset,
									IDSource: tmpSettings.IDSource,
									IDIngestJob: tmpSettings.IDIngestJob,
									Content: tmpSettings.Content,
									Type: tmpSettings.Type,
									IngestDate: tmpSettings.IngestDate,
									Version: tmpSettings.Version
								},
								(pError, pQuery, pRecord) =>
								{
									if (pError)
									{
										tmpLog.error(`FactoData.CreateRecord failed: ${pError.message}`);
										return fCallback(pError);
									}
									return fCallback(null, { Outputs: { Created: pRecord } });
								});
						}
					},

					'ReadRecords':
					{
						Description: 'Read Records with optional filter and cap',
						SettingsSchema:
						[
							{ Name: 'Filter', DataType: 'Object', Required: false },
							{ Name: 'Cap', DataType: 'Integer', Required: false }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpFilter = tmpSettings.Filter || {};
							let tmpCap = tmpSettings.Cap || 100;
							let tmpQuery = tmpFable.DAL.Record.query.clone();
							tmpQuery.setCap(tmpCap);

							// Apply filter fields to the query
							let tmpFilterKeys = Object.keys(tmpFilter);
							for (let i = 0; i < tmpFilterKeys.length; i++)
							{
								tmpQuery.addFilter(tmpFilterKeys[i], tmpFilter[tmpFilterKeys[i]]);
							}

							tmpFable.DAL.Record.doReads(tmpQuery,
								(pError, pQuery, pRecords) =>
								{
									if (pError)
									{
										tmpLog.error(`FactoData.ReadRecords failed: ${pError.message}`);
										return fCallback(pError);
									}
									return fCallback(null, { Outputs: { Records: pRecords } });
								});
						}
					},

					'UpdateIngestJob':
					{
						Description: 'Update an existing IngestJob record',
						SettingsSchema:
						[
							{ Name: 'IDIngestJob', DataType: 'Integer', Required: true },
							{ Name: 'Status', DataType: 'String', Required: false },
							{ Name: 'RecordsProcessed', DataType: 'Integer', Required: false },
							{ Name: 'RecordsCreated', DataType: 'Integer', Required: false },
							{ Name: 'EndDate', DataType: 'DateTime', Required: false }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpQuery = tmpFable.DAL.IngestJob.query.clone();
							tmpQuery.addFilter('IDIngestJob', tmpSettings.IDIngestJob);

							let tmpUpdateRecord = {};
							if (tmpSettings.Status !== undefined)
							{
								tmpUpdateRecord.Status = tmpSettings.Status;
							}
							if (tmpSettings.RecordsProcessed !== undefined)
							{
								tmpUpdateRecord.RecordsProcessed = tmpSettings.RecordsProcessed;
							}
							if (tmpSettings.RecordsCreated !== undefined)
							{
								tmpUpdateRecord.RecordsCreated = tmpSettings.RecordsCreated;
							}
							if (tmpSettings.EndDate !== undefined)
							{
								tmpUpdateRecord.EndDate = tmpSettings.EndDate;
							}

							tmpFable.DAL.IngestJob.doUpdate(tmpQuery, tmpUpdateRecord,
								(pError, pQuery, pRecord) =>
								{
									if (pError)
									{
										tmpLog.error(`FactoData.UpdateIngestJob failed: ${pError.message}`);
										return fCallback(pError);
									}
									return fCallback(null, { Outputs: { Updated: pRecord } });
								});
						}
					},

					'CreateProjectionStore':
					{
						Description: 'Create a new ProjectionStore record',
						SettingsSchema:
						[
							{ Name: 'IDDataset', DataType: 'Integer', Required: true },
							{ Name: 'IDStoreConnection', DataType: 'Integer', Required: true },
							{ Name: 'TargetTableName', DataType: 'String', Required: true },
							{ Name: 'Status', DataType: 'String', Required: false }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpQuery = tmpFable.DAL.ProjectionStore.query.clone();
							tmpFable.DAL.ProjectionStore.doCreate(tmpQuery,
								{
									IDDataset: tmpSettings.IDDataset,
									IDStoreConnection: tmpSettings.IDStoreConnection,
									TargetTableName: tmpSettings.TargetTableName,
									Status: tmpSettings.Status
								},
								(pError, pQuery, pRecord) =>
								{
									if (pError)
									{
										tmpLog.error(`FactoData.CreateProjectionStore failed: ${pError.message}`);
										return fCallback(pError);
									}
									return fCallback(null, { Outputs: { Created: pRecord } });
								});
						}
					}
				}
			});

		// ---------------------------------------------------------
		// Capability: FactoTransform
		// TabularTransform execution (pure data transformation)
		// ---------------------------------------------------------
		this._BeaconService.registerCapability(
			{
				Capability: 'FactoTransform',
				Name: 'FactoTransformProvider',
				actions:
				{
					'ApplyMapping':
					{
						Description: 'Apply a TabularTransform mapping to an array of records',
						SettingsSchema:
						[
							{ Name: 'Records', DataType: 'Array', Required: true },
							{ Name: 'MappingConfiguration', DataType: 'Object', Required: true }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpRecords = tmpSettings.Records || [];
							let tmpMappingConfig = tmpSettings.MappingConfiguration || {};
							let tmpTabularTransform = tmpFable.services.TabularTransform;

							if (!tmpTabularTransform)
							{
								return fCallback(new Error('TabularTransform service is not available on the fable instance.'));
							}

							let tmpMappingOutcome = tmpTabularTransform.newMappingOutcomeObject();
							tmpMappingOutcome.ExplicitConfiguration = tmpMappingConfig;
							tmpMappingOutcome.ImplicitConfiguration = tmpMappingConfig;

							for (let i = 0; i < tmpRecords.length; i++)
							{
								try
								{
									tmpTabularTransform.transformRecord(tmpRecords[i], tmpMappingOutcome);
								}
								catch (pTransformError)
								{
									tmpLog.error(`FactoTransform.ApplyMapping error on record ${i}: ${pTransformError.message}`);
								}
							}

							let tmpEntityName = tmpMappingConfig.Entity || Object.keys(tmpMappingOutcome.Comprehension)[0] || 'Unknown';
							let tmpComprehension = tmpMappingOutcome.Comprehension[tmpEntityName] || {};

							return fCallback(null,
								{
									Outputs:
									{
										Comprehension: tmpComprehension,
										BadRecords: tmpMappingOutcome.BadRecords,
										ParsedRowCount: tmpMappingOutcome.ParsedRowCount,
										UniqueCount: Object.keys(tmpComprehension).length
									}
								});
						}
					}
				}
			});

		// ---------------------------------------------------------
		// Capability: FactoDeploy
		// Schema deployment to projection stores
		// ---------------------------------------------------------
		this._BeaconService.registerCapability(
			{
				Capability: 'FactoDeploy',
				Name: 'FactoDeployProvider',
				actions:
				{
					'DeploySchema':
					{
						Description: 'Deploy a dataset schema to a projection store',
						SettingsSchema:
						[
							{ Name: 'IDDataset', DataType: 'Integer', Required: true },
							{ Name: 'IDStoreConnection', DataType: 'Integer', Required: true },
							{ Name: 'TargetTableName', DataType: 'String', Required: true }
						],
						Handler: function (pWorkItem, pContext, fCallback)
						{
							let tmpSettings = pWorkItem.Settings || {};
							let tmpProjectionEngine = tmpFable.services.RetoldFactoProjectionEngine;

							if (!tmpProjectionEngine)
							{
								return fCallback(new Error('ProjectionEngine service is not available on the fable instance.'));
							}

							tmpProjectionEngine.deploySchema(
								tmpSettings.IDDataset,
								tmpSettings.IDStoreConnection,
								tmpSettings.TargetTableName,
								(pError, pResult) =>
								{
									if (pError)
									{
										tmpLog.error(`FactoDeploy.DeploySchema failed: ${pError.message}`);
										return fCallback(pError);
									}
									return fCallback(null, { Outputs: { DeployResult: pResult } });
								});
						}
					}
				}
			});

		this.log.info('RetoldFactoBeaconProvider: registered capabilities [FactoData, FactoTransform, FactoDeploy]');

		// Enable the beacon -- authenticate, register, begin polling.
		this._BeaconService.enable(
			(pEnableError, pBeaconInfo) =>
			{
				if (pEnableError)
				{
					this.log.error(`RetoldFactoBeaconProvider: beacon enable failed: ${pEnableError.message}`);
					this._BeaconService = null;
					return fCallback(pEnableError);
				}

				this.log.info(`RetoldFactoBeaconProvider: beacon connected as ${pBeaconInfo.BeaconID}`);
				return fCallback(null, pBeaconInfo);
			});
	}

	/**
	 * Disconnect the beacon from the Ultravisor coordinator.
	 *
	 * @param {Function} fCallback Called with (pError)
	 */
	disconnectBeacon(fCallback)
	{
		if (!this._BeaconService || !this._BeaconService.isEnabled())
		{
			if (this.log)
			{
				this.log.info('RetoldFactoBeaconProvider: beacon not connected, nothing to disconnect.');
			}
			return fCallback(null);
		}

		this._BeaconService.disable(
			(pError) =>
			{
				if (pError)
				{
					this.log.warn(`RetoldFactoBeaconProvider: beacon disconnect warning: ${pError.message}`);
				}
				else
				{
					this.log.info('RetoldFactoBeaconProvider: beacon disconnected.');
				}
				this._BeaconService = null;
				return fCallback(pError || null);
			});
	}

	/**
	 * Check if beacon mode is currently enabled.
	 *
	 * @returns {boolean}
	 */
	isEnabled()
	{
		return this._BeaconService && this._BeaconService.isEnabled();
	}
}

module.exports = RetoldFactoBeaconProvider;
