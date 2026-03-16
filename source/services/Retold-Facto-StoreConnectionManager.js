/**
 * Retold Facto - Store Connection Manager Service
 *
 * Manages external database connections for projection deployment.
 * Provides CRUD endpoints for store connections, connection testing,
 * and available connector type discovery.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const defaultStoreConnectionManagerOptions = (
	{
		RoutePrefix: '/facto'
	});

// Connector modules to try-require for the available-types endpoint
const CONNECTOR_MODULES =
[
	{ Type: 'MySQL', Module: 'meadow-connection-mysql' },
	{ Type: 'PostgreSQL', Module: 'meadow-connection-postgresql' },
	{ Type: 'MSSQL', Module: 'meadow-connection-mssql' },
	{ Type: 'SQLite', Module: 'meadow-connection-sqlite' },
	{ Type: 'Solr', Module: 'meadow-connection-solr' },
	{ Type: 'RocksDB', Module: 'meadow-connection-rocksdb' }
];

class RetoldFactoStoreConnectionManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultStoreConnectionManagerOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoStoreConnectionManager';
	}

	/**
	 * Mask sensitive fields (password) in a Config JSON string before sending to client.
	 *
	 * @param {string} pConfigJSON - Raw Config JSON string
	 * @returns {string} Masked Config JSON string
	 */
	_maskConfig(pConfigJSON)
	{
		if (!pConfigJSON) return '{}';
		try
		{
			let tmpConfig = JSON.parse(pConfigJSON);
			if (tmpConfig.password)
			{
				tmpConfig.password = '***';
			}
			if (tmpConfig.Password)
			{
				tmpConfig.Password = '***';
			}
			return JSON.stringify(tmpConfig);
		}
		catch (pError)
		{
			return '{}';
		}
	}

	/**
	 * Merge an incoming Config object with the stored one,
	 * preserving the actual password if the client sent '***'.
	 *
	 * @param {object} pNewConfig - The incoming config from the client
	 * @param {string} pStoredConfigJSON - The existing stored config JSON
	 * @returns {string} Merged config JSON
	 */
	_mergeConfig(pNewConfig, pStoredConfigJSON)
	{
		let tmpStored = {};
		try
		{
			tmpStored = JSON.parse(pStoredConfigJSON || '{}');
		}
		catch (pError) { /* ignore parse errors */ }

		if (pNewConfig.password === '***' && tmpStored.password)
		{
			pNewConfig.password = tmpStored.password;
		}
		if (pNewConfig.Password === '***' && tmpStored.Password)
		{
			pNewConfig.Password = tmpStored.Password;
		}
		return JSON.stringify(pNewConfig);
	}

	/**
	 * Connect REST API routes for store connection management.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// GET /facto/connections -- list all non-deleted connections
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/connections`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.StoreConnection)
				{
					pResponse.send({ Connections: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.StoreConnection.query.clone()
					.addFilter('Deleted', 0);

				this.fable.DAL.StoreConnection.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`StoreConnectionManager error listing connections: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Connections: [] });
							return fNext();
						}

						// Mask passwords before sending
						for (let i = 0; i < pRecords.length; i++)
						{
							pRecords[i].Config = this._maskConfig(pRecords[i].Config);
						}

						pResponse.send({ Count: pRecords.length, Connections: pRecords });
						return fNext();
					});
			});

		// POST /facto/connection -- create a new connection
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/connection`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.StoreConnection)
				{
					pResponse.send({ Error: 'StoreConnection DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpName = tmpBody.Name || 'Untitled Connection';
				let tmpType = tmpBody.Type || 'MySQL';
				let tmpConfig = tmpBody.Config || {};

				let tmpRecord =
				{
					Name: tmpName,
					Type: tmpType,
					Config: (typeof tmpConfig === 'string') ? tmpConfig : JSON.stringify(tmpConfig),
					Status: 'Untested'
				};

				let tmpQuery = this.fable.DAL.StoreConnection.query.clone()
					.setIDUser(0)
					.addRecord(tmpRecord);

				this.fable.DAL.StoreConnection.doCreate(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}

						pRecord.Config = this._maskConfig(pRecord.Config);
						pResponse.send({ Success: true, Connection: pRecord });
						return fNext();
					});
			});

		// GET /facto/connection/:IDStoreConnection -- read a single connection
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/connection/:IDStoreConnection`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.StoreConnection)
				{
					pResponse.send({ Error: 'StoreConnection DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.IDStoreConnection, 10);

				let tmpQuery = this.fable.DAL.StoreConnection.query.clone()
					.addFilter('IDStoreConnection', tmpID);

				this.fable.DAL.StoreConnection.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						if (!pRecord || !pRecord.IDStoreConnection)
						{
							pResponse.send({ Error: 'Connection not found' });
							return fNext();
						}

						pRecord.Config = this._maskConfig(pRecord.Config);
						pResponse.send({ Connection: pRecord });
						return fNext();
					});
			});

		// PUT /facto/connection/:IDStoreConnection -- update a connection
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/connection/:IDStoreConnection`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.StoreConnection)
				{
					pResponse.send({ Error: 'StoreConnection DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.IDStoreConnection, 10);
				let tmpBody = pRequest.body || {};

				// First read the existing record to preserve password if masked
				let tmpReadQuery = this.fable.DAL.StoreConnection.query.clone()
					.addFilter('IDStoreConnection', tmpID);

				this.fable.DAL.StoreConnection.doRead(tmpReadQuery,
					(pReadError, pReadQuery, pExisting) =>
					{
						if (pReadError || !pExisting || !pExisting.IDStoreConnection)
						{
							pResponse.send({ Error: 'Connection not found' });
							return fNext();
						}

						if (tmpBody.Name !== undefined) pExisting.Name = tmpBody.Name;
						if (tmpBody.Type !== undefined) pExisting.Type = tmpBody.Type;
						if (tmpBody.Config !== undefined)
						{
							let tmpNewConfig = (typeof tmpBody.Config === 'string')
								? JSON.parse(tmpBody.Config)
								: tmpBody.Config;
							pExisting.Config = this._mergeConfig(tmpNewConfig, pExisting.Config);
						}
						if (tmpBody.Status !== undefined) pExisting.Status = tmpBody.Status;

						let tmpUpdateQuery = this.fable.DAL.StoreConnection.query.clone()
							.addRecord(pExisting);

						this.fable.DAL.StoreConnection.doUpdate(tmpUpdateQuery,
							(pError, pQuery, pRecord) =>
							{
								if (pError)
								{
									pResponse.send({ Error: pError.message || pError });
									return fNext();
								}

								pRecord.Config = this._maskConfig(pRecord.Config);
								pResponse.send({ Success: true, Connection: pRecord });
								return fNext();
							});
					});
			});

		// DELETE /facto/connection/:IDStoreConnection -- soft-delete
		pOratorServiceServer.doDel(`${tmpRoutePrefix}/connection/:IDStoreConnection`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.StoreConnection)
				{
					pResponse.send({ Error: 'StoreConnection DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.IDStoreConnection, 10);

				let tmpReadQuery = this.fable.DAL.StoreConnection.query.clone()
					.addFilter('IDStoreConnection', tmpID);

				this.fable.DAL.StoreConnection.doRead(tmpReadQuery,
					(pReadError, pReadQuery, pExisting) =>
					{
						if (pReadError || !pExisting || !pExisting.IDStoreConnection)
						{
							pResponse.send({ Error: 'Connection not found' });
							return fNext();
						}

						pExisting.Deleted = 1;
						pExisting.DeleteDate = new Date().toISOString();

						let tmpUpdateQuery = this.fable.DAL.StoreConnection.query.clone()
							.addRecord(pExisting);

						this.fable.DAL.StoreConnection.doUpdate(tmpUpdateQuery,
							(pError) =>
							{
								if (pError)
								{
									pResponse.send({ Error: pError.message || pError });
									return fNext();
								}

								pResponse.send({ Success: true });
								return fNext();
							});
					});
			});

		// POST /facto/connection/:IDStoreConnection/test -- test a saved connection
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/connection/:IDStoreConnection/test`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.StoreConnection)
				{
					pResponse.send({ Success: false, Error: 'StoreConnection DAL not initialized' });
					return fNext();
				}

				let tmpID = parseInt(pRequest.params.IDStoreConnection, 10);

				let tmpReadQuery = this.fable.DAL.StoreConnection.query.clone()
					.addFilter('IDStoreConnection', tmpID);

				this.fable.DAL.StoreConnection.doRead(tmpReadQuery,
					(pReadError, pReadQuery, pExisting) =>
					{
						if (pReadError || !pExisting || !pExisting.IDStoreConnection)
						{
							pResponse.send({ Success: false, Error: 'Connection not found' });
							return fNext();
						}

						let tmpConfig = {};
						try { tmpConfig = JSON.parse(pExisting.Config || '{}'); }
						catch (e) { /* ignore */ }

						this._testConnection(pExisting.Type, tmpConfig,
							(pTestError, pResult) =>
							{
								// Update the connection record with test results
								pExisting.LastTestedDate = new Date().toISOString();
								pExisting.Status = pTestError ? 'Failed' : 'OK';

								let tmpUpdateQuery = this.fable.DAL.StoreConnection.query.clone()
									.addRecord(pExisting);

								this.fable.DAL.StoreConnection.doUpdate(tmpUpdateQuery,
									() =>
									{
										if (pTestError)
										{
											pResponse.send({ Success: false, Error: pTestError.message || pTestError, Status: 'Failed' });
										}
										else
										{
											pResponse.send({ Success: true, Status: 'OK', Result: pResult || {} });
										}
										return fNext();
									});
							});
					});
			});

		// POST /facto/connection/test -- test an ad-hoc connection config (no save)
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/connection/test`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpBody = pRequest.body || {};
				let tmpType = tmpBody.Type || '';
				let tmpConfig = tmpBody.Config || {};

				if (!tmpType)
				{
					pResponse.send({ Success: false, Error: 'Type is required' });
					return fNext();
				}

				this._testConnection(tmpType, tmpConfig,
					(pTestError, pResult) =>
					{
						if (pTestError)
						{
							pResponse.send({ Success: false, Error: pTestError.message || pTestError });
						}
						else
						{
							pResponse.send({ Success: true, Result: pResult || {} });
						}
						return fNext();
					});
			});

		// GET /facto/connection/available-types -- list installed connector types
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/connection/available-types`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpAvailable = [];

				for (let i = 0; i < CONNECTOR_MODULES.length; i++)
				{
					try
					{
						require.resolve(CONNECTOR_MODULES[i].Module);
						tmpAvailable.push(
						{
							Type: CONNECTOR_MODULES[i].Type,
							Module: CONNECTOR_MODULES[i].Module,
							Installed: true
						});
					}
					catch (e)
					{
						tmpAvailable.push(
						{
							Type: CONNECTOR_MODULES[i].Type,
							Module: CONNECTOR_MODULES[i].Module,
							Installed: false
						});
					}
				}

				pResponse.send({ Types: tmpAvailable });
				return fNext();
			});

		this.fable.log.info(`StoreConnectionManager routes connected at ${tmpRoutePrefix}/connection*`);
	}

	/**
	 * Test a database connection by attempting to connect with the given config.
	 *
	 * @param {string} pType - Connection type (MySQL, PostgreSQL, etc.)
	 * @param {object} pConfig - Connection configuration object
	 * @param {function} fCallback - Callback(pError, pResult)
	 */
	_testConnection(pType, pConfig, fCallback)
	{
		let tmpModuleName = '';

		for (let i = 0; i < CONNECTOR_MODULES.length; i++)
		{
			if (CONNECTOR_MODULES[i].Type === pType)
			{
				tmpModuleName = CONNECTOR_MODULES[i].Module;
				break;
			}
		}

		if (!tmpModuleName)
		{
			return fCallback(new Error(`Unknown connection type: ${pType}`));
		}

		let tmpConnectorModule;
		try
		{
			tmpConnectorModule = require(tmpModuleName);
		}
		catch (pError)
		{
			return fCallback(new Error(`Connector module ${tmpModuleName} is not installed: ${pError.message}`));
		}

		try
		{
			// Instantiate the connector with the config
			let tmpConnector = new tmpConnectorModule(this.fable, pConfig, `TestConnection-${pType}-${Date.now()}`);

			// Try to connect
			tmpConnector.connectAsync(
				(pConnectError) =>
				{
					if (pConnectError)
					{
						return fCallback(new Error(`Connection failed: ${pConnectError.message || pConnectError}`));
					}

					// Connection succeeded
					return fCallback(null, { Connected: true, Type: pType });
				});
		}
		catch (pError)
		{
			return fCallback(new Error(`Failed to instantiate connector: ${pError.message}`));
		}
	}
}

module.exports = RetoldFactoStoreConnectionManager;
module.exports.serviceType = 'RetoldFactoStoreConnectionManager';
module.exports.default_configuration = defaultStoreConnectionManagerOptions;
