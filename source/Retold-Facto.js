/**
 * Retold Facto
 *
 * Data warehouse and knowledge graph storage service.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const libOrator = require('orator');
const libOratorServiceServerRestify = require('orator-serviceserver-restify');
const libOratorStaticServer = require('orator-static-server');

const libMeadow = require('meadow');
const libMeadowEndpoints = require('meadow-endpoints');

const libPath = require('path');
const libFs = require('fs');

const libRetoldFactoSourceManager = require('./services/Retold-Facto-SourceManager.js');
const libRetoldFactoRecordManager = require('./services/Retold-Facto-RecordManager.js');
const libRetoldFactoDatasetManager = require('./services/Retold-Facto-DatasetManager.js');
const libRetoldFactoIngestEngine = require('./services/Retold-Facto-IngestEngine.js');
const libRetoldFactoProjectionEngine = require('./services/Retold-Facto-ProjectionEngine.js');
const libRetoldFactoCatalogManager = require('./services/Retold-Facto-CatalogManager.js');
const libRetoldFactoStoreConnectionManager = require('./services/Retold-Facto-StoreConnectionManager.js');
const libRetoldFactoDataLakeService = require('./services/Retold-Facto-DataLakeService.js');
const libRetoldFactoSourceFolderScanner = require('./services/Retold-Facto-SourceFolderScanner.js');

const libMeadowIntegration = require('meadow-integration');
const libTabularTransform = require('meadow-integration/source/services/tabular/Service-TabularTransform.js');

// Embedded schema SQL for auto-creation when using SQLite
const FACTO_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS Source (
	IDSource INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDSource TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	Name TEXT, Hash TEXT DEFAULT '', Type TEXT, URL TEXT, Protocol TEXT,
	Description TEXT, Configuration TEXT, Active INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS SourceDocumentation (
	IDSourceDocumentation INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDSourceDocumentation TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDSource INTEGER DEFAULT 0, Name TEXT, DocumentType TEXT,
	MimeType TEXT, StorageKey TEXT, Description TEXT, Content TEXT
);
CREATE TABLE IF NOT EXISTS Dataset (
	IDDataset INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDDataset TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	Name TEXT, Hash TEXT DEFAULT '', Type TEXT, Description TEXT,
	SchemaHash TEXT, SchemaVersion INTEGER DEFAULT 0, SchemaDefinition TEXT,
	VersionPolicy TEXT DEFAULT 'Append'
);
CREATE TABLE IF NOT EXISTS DatasetSource (
	IDDatasetSource INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDDatasetSource TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDDataset INTEGER DEFAULT 0, IDSource INTEGER DEFAULT 0,
	ReliabilityWeight REAL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS Record (
	IDRecord INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDRecord TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDDataset INTEGER DEFAULT 0, IDSource INTEGER DEFAULT 0,
	Type TEXT, SchemaHash TEXT, SchemaVersion INTEGER DEFAULT 0,
	Version INTEGER DEFAULT 1, IDIngestJob INTEGER DEFAULT 0,
	IngestDate TEXT, OriginCreateDate TEXT,
	RepresentedTimeStampStart INTEGER DEFAULT 0,
	RepresentedTimeStampStop INTEGER DEFAULT 0,
	RepresentedDuration INTEGER DEFAULT 0, Content TEXT
);
CREATE TABLE IF NOT EXISTS RecordBinary (
	IDRecordBinary INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDRecordBinary TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDRecord INTEGER DEFAULT 0, MimeType TEXT, StorageKey TEXT,
	FileSize INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS CertaintyIndex (
	IDCertaintyIndex INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDCertaintyIndex TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDRecord INTEGER DEFAULT 0, CertaintyValue REAL DEFAULT 0.5,
	Dimension TEXT, Justification TEXT
);
CREATE TABLE IF NOT EXISTS IngestJob (
	IDIngestJob INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDIngestJob TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDSource INTEGER DEFAULT 0, IDDataset INTEGER DEFAULT 0,
	Status TEXT, StartDate TEXT, EndDate TEXT,
	RecordsProcessed INTEGER DEFAULT 0, RecordsCreated INTEGER DEFAULT 0,
	RecordsUpdated INTEGER DEFAULT 0, RecordsErrored INTEGER DEFAULT 0,
	Configuration TEXT, Log TEXT,
	DatasetVersion INTEGER DEFAULT 0, ContentSignature TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS SourceCatalogEntry (
	IDSourceCatalogEntry INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDSourceCatalogEntry TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	Agency TEXT, Name TEXT, Type TEXT, URL TEXT, Protocol TEXT,
	Category TEXT, Region TEXT, UpdateFrequency TEXT,
	Description TEXT, Notes TEXT, Verified INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS CatalogDatasetDefinition (
	IDCatalogDatasetDefinition INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDCatalogDatasetDefinition TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDSourceCatalogEntry INTEGER DEFAULT 0, Name TEXT, Format TEXT,
	MimeType TEXT, EndpointURL TEXT, Description TEXT,
	ParseOptions TEXT, AuthRequirements TEXT,
	VersionPolicy TEXT DEFAULT 'Append',
	Provisioned INTEGER DEFAULT 0,
	IDSource INTEGER DEFAULT 0, IDDataset INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS StoreConnection (
	IDStoreConnection INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDStoreConnection TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	Name TEXT, Type TEXT, Config TEXT,
	Status TEXT DEFAULT 'Untested', LastTestedDate TEXT
);
CREATE TABLE IF NOT EXISTS ProjectionStore (
	IDProjectionStore INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDProjectionStore TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDDataset INTEGER DEFAULT 0, IDStoreConnection INTEGER DEFAULT 0,
	TargetTableName TEXT, Status TEXT DEFAULT 'Pending',
	DeployedAt TEXT, DeployLog TEXT
);
CREATE TABLE IF NOT EXISTS ProjectionMapping (
	IDProjectionMapping INTEGER PRIMARY KEY AUTOINCREMENT,
	GUIDProjectionMapping TEXT,
	CreateDate TEXT, CreatingIDUser INTEGER DEFAULT 0,
	UpdateDate TEXT, UpdatingIDUser INTEGER DEFAULT 0,
	Deleted INTEGER DEFAULT 0, DeleteDate TEXT, DeletingIDUser INTEGER DEFAULT 0,
	IDDataset INTEGER DEFAULT 0,
	IDSource INTEGER DEFAULT 0,
	IDProjectionStore INTEGER DEFAULT 0,
	Name TEXT,
	SchemaVersion INTEGER DEFAULT 0,
	MappingConfiguration TEXT,
	FlowDiagramState TEXT,
	Active INTEGER DEFAULT 1
);
`;

const defaultFactoSettings = (
	{
		StorageProvider: false,
		StorageProviderModule: false,

		FullMeadowSchemaPath: `${process.cwd()}/model/`,
		FullMeadowSchemaFilename: false,

		AutoInitializeDataService: true,
		AutoStartOrator: true,
		AutoCreateSchema: false,

		// Path to the web app folder for static serving; false to skip
		WebAppPath: false,

		// Endpoint allow-list.  Only enabled groups have their routes wired.
		Endpoints:
			{
				// Per-entity CRUD endpoints (e.g. /1.0/Source, /1.0/Record)
				MeadowEndpoints: true,
				// Source management API (/facto/source/*)
				SourceManager: true,
				// Record ingest/version/certainty API (/facto/record/*)
				RecordManager: true,
				// Dataset management API (/facto/dataset/*)
				DatasetManager: true,
				// Ingest engine API (/facto/ingest/*)
				IngestEngine: true,
				// Projection engine API (/facto/projection/*)
				ProjectionEngine: true,
				// Catalog manager API (/facto/catalog/*)
				CatalogManager: true,
				// Store connection manager API (/facto/connection/*)
				StoreConnectionManager: true,
				// Source folder scanner API (/facto/scanner/*)
				SourceFolderScanner: true,
				// Web UI
				WebUI: true
			},

		Facto:
			{
				RoutePrefix: '/facto',
				DefaultCertaintyValue: 0.5,
				ScanPaths: [],
				AutoProvision: false,
				AutoIngest: false
			}
	});

class RetoldFacto extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		// Intersect default options, parent constructor, service information
		let tmpOptions = Object.assign({}, JSON.parse(JSON.stringify(defaultFactoSettings)), pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFacto';

		// Re-apply defaults without mutating the module-level defaultFactoSettings object.
		this.options = Object.assign({}, JSON.parse(JSON.stringify(defaultFactoSettings)), this.options);

		// Add the restify server provider and orator base class to fable
		this.fable.serviceManager.addServiceType('OratorServiceServer', libOratorServiceServerRestify);
		this.fable.serviceManager.addServiceType('Orator', libOrator);

		// Initialize Restify
		this.fable.serviceManager.instantiateServiceProvider('OratorServiceServer', this.options);

		// Initialize Orator, which will automatically use the default OratorServiceServer
		this.fable.serviceManager.instantiateServiceProvider('Orator', this.options);

		// Initialize Meadow
		this._Meadow = libMeadow.new(pFable);
		this._DAL = {};
		this._MeadowEndpoints = {};
		this.models = {};
		this.fullModel = false;
		this.entityList = false;

		// Register and instantiate sub-services
		this.fable.serviceManager.addServiceType('RetoldFactoSourceManager', libRetoldFactoSourceManager);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoSourceManager',
			{
				RoutePrefix: this.options.Facto.RoutePrefix
			});

		this.fable.serviceManager.addServiceType('RetoldFactoRecordManager', libRetoldFactoRecordManager);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoRecordManager',
			{
				RoutePrefix: this.options.Facto.RoutePrefix,
				DefaultCertaintyValue: this.options.Facto.DefaultCertaintyValue
			});

		this.fable.serviceManager.addServiceType('RetoldFactoDatasetManager', libRetoldFactoDatasetManager);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoDatasetManager',
			{
				RoutePrefix: this.options.Facto.RoutePrefix
			});

		this.fable.serviceManager.addServiceType('RetoldFactoIngestEngine', libRetoldFactoIngestEngine);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoIngestEngine',
			{
				RoutePrefix: this.options.Facto.RoutePrefix
			});

		this.fable.serviceManager.addServiceType('RetoldFactoProjectionEngine', libRetoldFactoProjectionEngine);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoProjectionEngine',
			{
				RoutePrefix: this.options.Facto.RoutePrefix
			});

		this.fable.serviceManager.addServiceType('RetoldFactoCatalogManager', libRetoldFactoCatalogManager);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoCatalogManager',
			{
				RoutePrefix: this.options.Facto.RoutePrefix
			});

		this.fable.serviceManager.addServiceType('RetoldFactoStoreConnectionManager', libRetoldFactoStoreConnectionManager);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoStoreConnectionManager',
			{
				RoutePrefix: this.options.Facto.RoutePrefix
			});

		this.fable.serviceManager.addServiceType('RetoldFactoDataLakeService', libRetoldFactoDataLakeService);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoDataLakeService',
			{
				CatalogPath: this.options.Facto.CatalogPath || null,
				DataDir: this.options.Facto.DataDir || null
			});

		this.fable.serviceManager.addServiceType('RetoldFactoSourceFolderScanner', libRetoldFactoSourceFolderScanner);
		this.fable.serviceManager.instantiateServiceProvider('RetoldFactoSourceFolderScanner',
			{
				RoutePrefix: this.options.Facto.RoutePrefix
			});

		// Register Meadow Integration services for projection mapping transforms
		this.fable.serviceManager.addServiceType('TabularCheck', libMeadowIntegration.TabularCheck);
		this.fable.serviceManager.instantiateServiceProvider('TabularCheck');
		this.fable.serviceManager.addServiceType('TabularTransform', libTabularTransform);
		this.fable.serviceManager.instantiateServiceProvider('TabularTransform');

		// Expose DAL on fable for convenience
		this.fable.DAL = this._DAL;
		this.fable.MeadowEndpoints = this._MeadowEndpoints;

		this.serviceInitialized = false;
	}

	/**
	 * Rebuild the merged fullModel and entityList from all loaded models.
	 */
	rebuildFullModel()
	{
		let tmpModelNames = Object.keys(this.models);

		if (tmpModelNames.length === 0)
		{
			this.fullModel = false;
			this.entityList = false;
			return;
		}

		let tmpMergedModel = (
			{
				Tables: {},
				TablesSequence: [],
				Authorization: {},
				Endpoints: {},
				Pict: {}
			});

		for (let i = 0; i < tmpModelNames.length; i++)
		{
			let tmpModel = this.models[tmpModelNames[i]];

			if (tmpModel.Tables)
			{
				Object.assign(tmpMergedModel.Tables, tmpModel.Tables);
			}
			if (tmpModel.TablesSequence)
			{
				tmpMergedModel.TablesSequence = tmpMergedModel.TablesSequence.concat(tmpModel.TablesSequence);
			}
			if (tmpModel.Authorization)
			{
				Object.assign(tmpMergedModel.Authorization, tmpModel.Authorization);
			}
			if (tmpModel.Endpoints)
			{
				Object.assign(tmpMergedModel.Endpoints, tmpModel.Endpoints);
			}
			if (tmpModel.Pict)
			{
				Object.assign(tmpMergedModel.Pict, tmpModel.Pict);
			}
		}

		this.fullModel = tmpMergedModel;
		this.entityList = Object.keys(this._DAL);
	}

	/**
	 * Load a parsed model object and create DAL objects and Meadow Endpoints
	 * for each entity in it.
	 *
	 * @param {string} pModelName - A name to identify this model
	 * @param {Object} pModelObject - The parsed stricture model
	 * @param {string} [pStorageProvider] - Optional storage provider name override
	 * @param {function} fCallback - Callback
	 */
	loadModel(pModelName, pModelObject, pStorageProvider, fCallback)
	{
		let tmpCallback = fCallback;
		let tmpStorageProvider = pStorageProvider;
		if (typeof(pStorageProvider) === 'function')
		{
			tmpCallback = pStorageProvider;
			tmpStorageProvider = this.options.StorageProvider;
		}

		this.fable.log.info(`Retold Facto loading model [${pModelName}]...`);

		if (this.models.hasOwnProperty(pModelName))
		{
			this.fable.log.warn(`Model [${pModelName}] is already loaded; overwriting.`);
		}

		this.models[pModelName] = pModelObject;

		let tmpEntityList = Object.keys(pModelObject.Tables);

		this.fable.log.info(`...initializing ${tmpEntityList.length} DAL objects and corresponding Meadow Endpoints for model [${pModelName}]...`);

		for (let i = 0; i < tmpEntityList.length; i++)
		{
			let tmpDALEntityName = tmpEntityList[i];
			let tmpRoutesAlreadyConnected = this._MeadowEndpoints.hasOwnProperty(tmpDALEntityName);

			if (this._DAL.hasOwnProperty(tmpDALEntityName))
			{
				this.fable.log.warn(`Entity [${tmpDALEntityName}] already exists in the DAL; overwriting.`);
			}

			try
			{
				let tmpDALSchema = pModelObject.Tables[tmpDALEntityName];
				let tmpDALMeadowSchema = tmpDALSchema.MeadowSchema;

				this._DAL[tmpDALEntityName] = this._Meadow.loadFromPackageObject(tmpDALMeadowSchema);
				this.fable.log.info(`...defaulting the ${tmpDALEntityName} DAL to use ${tmpStorageProvider}`);
				this._DAL[tmpDALEntityName].setProvider(tmpStorageProvider);
				this.fable.log.info(`...initializing the ${tmpDALEntityName} Meadow Endpoints`);
				this._MeadowEndpoints[tmpDALEntityName] = libMeadowEndpoints.new(this._DAL[tmpDALEntityName]);

				if (!tmpRoutesAlreadyConnected)
				{
					this.fable.log.info(`...mapping the ${tmpDALEntityName} Meadow Endpoints to Orator`);
					this._MeadowEndpoints[tmpDALEntityName].connectRoutes(this.fable.OratorServiceServer);
				}
				else
				{
					this.fable.log.info(`...routes for ${tmpDALEntityName} already registered; skipping connectRoutes.`);
				}
			}
			catch (pError)
			{
				this.fable.log.error(`Error initializing DAL and Endpoints for entity [${tmpDALEntityName}]: ${pError}`);
			}
		}

		this.rebuildFullModel();

		return tmpCallback();
	}

	/**
	 * Load a model from a JSON file on disk.
	 */
	loadModelFromFile(pModelName, pModelPath, pModelFilename, fCallback)
	{
		this.fable.log.info(`...loading model [${pModelName}] from file [${pModelPath}${pModelFilename}]...`);

		let tmpModelObject;
		try
		{
			tmpModelObject = require(`${pModelPath}${pModelFilename}`);
		}
		catch (pError)
		{
			this.fable.log.error(`Error loading model file [${pModelPath}${pModelFilename}]: ${pError}`);
			return fCallback(pError);
		}

		return this.loadModel(pModelName, tmpModelObject, fCallback);
	}

	/**
	 * Check if an endpoint group is enabled in the Endpoints configuration.
	 */
	isEndpointGroupEnabled(pGroupName)
	{
		if (!this.options.Endpoints)
		{
			return false;
		}
		if (!this.options.Endpoints.hasOwnProperty(pGroupName))
		{
			return false;
		}
		return !!this.options.Endpoints[pGroupName];
	}

	/**
	 * Create the database schema using the embedded SQL.
	 * Uses the MeadowSQLiteProvider's db handle to execute DDL.
	 *
	 * @param {function} fCallback - Callback(pError)
	 */
	createSchema(fCallback)
	{
		try
		{
			if (this.fable.MeadowSQLiteProvider && this.fable.MeadowSQLiteProvider.db)
			{
				this.fable.log.info('Creating Facto schema (CREATE TABLE IF NOT EXISTS)...');
				this.fable.MeadowSQLiteProvider.db.exec(FACTO_SCHEMA_SQL);
				this.fable.log.info('Facto schema created successfully.');
			}
			else
			{
				this.fable.log.warn('No SQLite provider available; skipping schema auto-creation.');
			}
		}
		catch (pError)
		{
			this.fable.log.error(`Error creating Facto schema: ${pError}`);
			return fCallback(pError);
		}

		return fCallback();
	}

	onBeforeInitialize(fCallback)
	{
		return fCallback();
	}

	onInitialize(fCallback)
	{
		return fCallback();
	}

	onAfterInitialize(fCallback)
	{
		let tmpScanPaths = this.options.Facto.ScanPaths;
		if (!Array.isArray(tmpScanPaths) || tmpScanPaths.length === 0)
		{
			return fCallback();
		}

		// Start the server immediately — scan in the background so
		// slow/large folder trees on external drives don't block startup.
		this.fable.log.info(`Retold Facto: Scanning ${tmpScanPaths.length} configured path(s) in background...`);

		let tmpFable = this.fable;

		// Use setImmediate so the initializeService chain completes first
		setImmediate(
			() =>
			{
				let tmpAnticipate = tmpFable.newAnticipate();

				for (let i = 0; i < tmpScanPaths.length; i++)
				{
					let tmpPath = tmpScanPaths[i];
					tmpAnticipate.anticipate(
						(fStepCallback) =>
						{
							tmpFable.RetoldFactoSourceFolderScanner.addScanPath(tmpPath,
								(pError) =>
								{
									if (pError)
									{
										tmpFable.log.error(`Error scanning path ${tmpPath}: ${pError}`);
									}
									return fStepCallback();
								});
						});
				}

				tmpAnticipate.wait(
					(pError) =>
					{
						if (pError)
						{
							tmpFable.log.error(`Error adding scan paths: ${pError}`);
						}
						else
						{
							tmpFable.log.info(`Retold Facto: Background scan complete.`);
						}
					});
			});

		return fCallback();
	}

	initializePersistenceEngine(fCallback)
	{
		if (this.options.StorageProviderModule)
		{
			this.fable.serviceManager.addAndInstantiateServiceType(`Meadow${this.options.StorageProvider}Provider`, require(this.options.StorageProviderModule));
		}
		return fCallback();
	}

	initializeService(fCallback)
	{
		if (this.serviceInitialized)
		{
			return fCallback(new Error("Retold Facto is being initialized but has already been initialized..."));
		}
		else
		{
			let tmpAnticipate = this.fable.newAnticipate();

			this.fable.log.info(`Retold Facto is initializing...`);

			// Log endpoint configuration
			let tmpGroupNames = ['MeadowEndpoints', 'SourceManager', 'RecordManager', 'DatasetManager', 'IngestEngine', 'ProjectionEngine', 'CatalogManager', 'StoreConnectionManager', 'SourceFolderScanner', 'WebUI'];
			let tmpEnabledGroups = [];
			let tmpDisabledGroups = [];
			for (let i = 0; i < tmpGroupNames.length; i++)
			{
				if (this.isEndpointGroupEnabled(tmpGroupNames[i]))
				{
					tmpEnabledGroups.push(tmpGroupNames[i]);
				}
				else
				{
					tmpDisabledGroups.push(tmpGroupNames[i]);
				}
			}
			this.fable.log.info(`Endpoint groups enabled: [${tmpEnabledGroups.join(', ')}]`);
			if (tmpDisabledGroups.length > 0)
			{
				this.fable.log.info(`Endpoint groups disabled: [${tmpDisabledGroups.join(', ')}]`);
			}

			tmpAnticipate.anticipate(this.onBeforeInitialize.bind(this));

			tmpAnticipate.anticipate(
				(fInitCallback) =>
				{
					if (this.options.AutoStartOrator)
					{
						this.fable.Orator.startWebServer(fInitCallback);
					}
					else
					{
						return fInitCallback();
					}
				});

			// Enable JSON body parsing and query string parsing
			tmpAnticipate.anticipate(
				(fInitCallback) =>
				{
					this.fable.OratorServiceServer.server.use(this.fable.OratorServiceServer.bodyParser());
					this.fable.OratorServiceServer.server.use(require('restify').plugins.queryParser());
					return fInitCallback();
				});

			tmpAnticipate.anticipate(this.initializePersistenceEngine.bind(this));

			// Auto-create schema if configured
			tmpAnticipate.anticipate(
				(fInitCallback) =>
				{
					if (this.options.AutoCreateSchema)
					{
						return this.createSchema(fInitCallback);
					}
					return fInitCallback();
				});

			tmpAnticipate.anticipate(this.onInitialize.bind(this));

			// Wire endpoint routes based on the Endpoints allow-list
			tmpAnticipate.anticipate(
				(fInitCallback) =>
				{
					if (this.isEndpointGroupEnabled('SourceManager'))
					{
						this.fable.RetoldFactoSourceManager.connectRoutes(this.fable.OratorServiceServer);
					}

					if (this.isEndpointGroupEnabled('RecordManager'))
					{
						this.fable.RetoldFactoRecordManager.connectRoutes(this.fable.OratorServiceServer);
					}

					if (this.isEndpointGroupEnabled('DatasetManager'))
					{
						this.fable.RetoldFactoDatasetManager.connectRoutes(this.fable.OratorServiceServer);
					}

					if (this.isEndpointGroupEnabled('IngestEngine'))
					{
						this.fable.RetoldFactoIngestEngine.connectRoutes(this.fable.OratorServiceServer);
					}

					if (this.isEndpointGroupEnabled('ProjectionEngine'))
					{
						this.fable.RetoldFactoProjectionEngine.connectRoutes(this.fable.OratorServiceServer);
					}

					if (this.isEndpointGroupEnabled('CatalogManager'))
					{
						this.fable.RetoldFactoCatalogManager.connectRoutes(this.fable.OratorServiceServer);
					}

					if (this.isEndpointGroupEnabled('StoreConnectionManager'))
					{
						this.fable.RetoldFactoStoreConnectionManager.connectRoutes(this.fable.OratorServiceServer);
					}

					if (this.isEndpointGroupEnabled('SourceFolderScanner'))
					{
						this.fable.RetoldFactoSourceFolderScanner.connectRoutes(this.fable.OratorServiceServer);
					}

					return fInitCallback();
				});

			// Load default model if MeadowEndpoints are enabled and a schema file is configured
			tmpAnticipate.anticipate(
				(fInitCallback) =>
				{
					if (!this.isEndpointGroupEnabled('MeadowEndpoints'))
					{
						this.fable.log.info('MeadowEndpoints are disabled; skipping data endpoint initialization.');
						return fInitCallback();
					}

					if (this.options.FullMeadowSchemaFilename)
					{
						let tmpModelName = this.options.FullMeadowSchemaFilename.replace(/\.json$/i, '');
						return this.loadModelFromFile(tmpModelName, this.options.FullMeadowSchemaPath, this.options.FullMeadowSchemaFilename, fInitCallback);
					}
					else
					{
						this.fable.log.info('No default model configured; skipping data endpoint initialization.');
						return fInitCallback();
					}
				});

			// Wire static file serving for web UI if enabled
			tmpAnticipate.anticipate(
				(fInitCallback) =>
				{
					if (!this.isEndpointGroupEnabled('WebUI'))
					{
						return fInitCallback();
					}

					let tmpWebAppPath = this.options.WebAppPath;
					if (!tmpWebAppPath)
					{
						// Default to the bundled web app
						tmpWebAppPath = libPath.join(__dirname, 'services', 'web-app', 'web');
					}

					this.fable.log.info(`Serving Facto web UI from ${tmpWebAppPath}`);

					// Serve pict.min.js from the pict package's dist folder
					let tmpPictMinJsPath;
					try
					{
						tmpPictMinJsPath = require.resolve('pict/dist/pict.min.js');
					}
					catch (pResolveError)
					{
						this.fable.log.warn(`Could not resolve pict.min.js: ${pResolveError}`);
					}

					if (tmpPictMinJsPath)
					{
						this.fable.OratorServiceServer.doGet('/pict.min.js',
							(pRequest, pResponse, fNext) =>
							{
								libFs.readFile(tmpPictMinJsPath, 'utf8',
									(pError, pData) =>
									{
										if (pError)
										{
											pResponse.send(500, { Error: 'Could not read pict.min.js' });
											return fNext();
										}
										pResponse.setHeader('Content-Type', 'application/javascript');
										pResponse.sendRaw(200, pData);
										return fNext();
									});
							});
					}

					this.fable.serviceManager.addServiceType('OratorStaticServer', libOratorStaticServer);
					let tmpStaticServer = this.fable.serviceManager.instantiateServiceProvider('OratorStaticServer');

					// Serve the accordion (simple) app at /simple/*
					let tmpSimpleWebAppPath = libPath.join(tmpWebAppPath, 'simple');
					tmpStaticServer.addStaticRoute(tmpSimpleWebAppPath, 'index.html', '/simple/*', '/simple/');

					// Serve the full app at /* (registered after /simple/* so it doesn't shadow it)
					tmpStaticServer.addStaticRoute(tmpWebAppPath, 'index.html', '/*', '/');

					return fInitCallback();
				});

			// Warm up projection entities for deployed ProjectionStores
			tmpAnticipate.anticipate(
				(fInitCallback) =>
				{
					if (!this.isEndpointGroupEnabled('ProjectionEngine'))
					{
						return fInitCallback();
					}
					this.fable.RetoldFactoProjectionEngine._warmUpProjectionEntities(fInitCallback);
				});

			tmpAnticipate.anticipate(this.onAfterInitialize.bind(this));

			tmpAnticipate.wait(
				(pError) =>
				{
					if (pError)
					{
						this.log.error(`Error initializing Retold Facto: ${pError}`);
						return fCallback(pError);
					}
					this.serviceInitialized = true;
					return fCallback();
				});
		}
	}

	stopService(fCallback)
	{
		if (!this.serviceInitialized)
		{
			return fCallback(new Error("Retold Facto is being stopped but is not initialized..."));
		}
		else
		{
			this.fable.log.info(`Retold Facto is stopping Orator`);

			let tmpAnticipate = this.fable.newAnticipate();

			tmpAnticipate.anticipate(this.fable.Orator.stopWebServer.bind(this.fable.Orator));

			tmpAnticipate.wait(
				(pError) =>
				{
					if (pError)
					{
						this.log.error(`Error stopping Retold Facto: ${pError}`);
						return fCallback(pError);
					}
					this.serviceInitialized = false;
					return fCallback();
				});
		}
	}
}

module.exports = RetoldFacto;
module.exports.FACTO_SCHEMA_SQL = FACTO_SCHEMA_SQL;
