#!/usr/bin/env node
/**
 * Retold Facto — CLI Entry Point
 *
 * A data warehouse and knowledge graph storage system.
 *
 * Subcommands:
 *   serve               Start the API server with web UI (default)
 *   init                Initialize the database schema
 *   ingest <file>       Ingest a CSV or JSON file into a dataset
 *   source list         List all registered sources
 *   source add <name>   Register a new data source
 *   dataset list        List all datasets
 *   dataset add <name>  Create a new dataset
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFable = require('fable');
const libMeadowConnectionSQLite = require('meadow-connection-sqlite');
const libRetoldFacto = require('../source/Retold-Facto.js');

const libFs = require('fs');
const libPath = require('path');

// ================================================================
// CLI Argument Parsing
// ================================================================

let _CLIConfig = null;
let _CLILogPath = null;
let _CLIPort = null;
let _CLIDBPath = null;
let _CLICommand = 'serve';
let _CLIArgs = [];

// Parse arguments
let tmpArgs = process.argv.slice(2);
let tmpPositionalIndex = 0;

for (let i = 0; i < tmpArgs.length; i++)
{
	let tmpArg = tmpArgs[i];

	if (tmpArg === '--config' || tmpArg === '-c')
	{
		if (tmpArgs[i + 1])
		{
			let tmpConfigPath = libPath.resolve(tmpArgs[i + 1]);
			try
			{
				let tmpRaw = libFs.readFileSync(tmpConfigPath, 'utf8');
				_CLIConfig = JSON.parse(tmpRaw);
				console.log(`Retold Facto: Loaded config from ${tmpConfigPath}`);
			}
			catch (pConfigError)
			{
				console.error(`Retold Facto: Failed to load config from ${tmpConfigPath}: ${pConfigError.message}`);
				process.exit(1);
			}
			i++;
		}
	}
	else if (tmpArg === '--port' || tmpArg === '-p')
	{
		if (tmpArgs[i + 1])
		{
			_CLIPort = parseInt(tmpArgs[i + 1], 10);
			i++;
		}
	}
	else if (tmpArg === '--db' || tmpArg === '-d')
	{
		if (tmpArgs[i + 1])
		{
			_CLIDBPath = libPath.resolve(tmpArgs[i + 1]);
			i++;
		}
	}
	else if (tmpArg === '--log' || tmpArg === '-l')
	{
		if (tmpArgs[i + 1] && !tmpArgs[i + 1].startsWith('-'))
		{
			_CLILogPath = libPath.resolve(tmpArgs[i + 1]);
			i++;
		}
		else
		{
			_CLILogPath = `${process.cwd()}/Facto-Run-${Date.now()}.log`;
		}
	}
	else if (tmpArg === '--help' || tmpArg === '-h')
	{
		printHelp();
		process.exit(0);
	}
	else if (!tmpArg.startsWith('-'))
	{
		// Positional argument
		if (tmpPositionalIndex === 0)
		{
			_CLICommand = tmpArg;
		}
		else
		{
			_CLIArgs.push(tmpArg);
		}
		tmpPositionalIndex++;
	}
}

function printHelp()
{
	console.log(`
Retold Facto — Data Warehouse and Knowledge Graph Storage

Usage:
  retold-facto [command] [options]

Commands:
  serve                         Start the API server with web UI (default)
  init                          Initialize/create the database schema
  ingest <file>                 Ingest a CSV or JSON file into a dataset
  source list                   List all registered sources
  source add <name> [options]   Register a new data source
  dataset list                  List all datasets
  dataset add <name> [options]  Create a new dataset

Options:
  --config, -c <path>      Path to a JSON config file
  --port, -p <port>        Override the API server port (default: 8386)
  --db, -d <path>          Path to SQLite database file (default: ./data/facto.sqlite)
  --log, -l [path]         Write log output to a file
  --help, -h               Show this help

Ingest Options (positional after file path):
  retold-facto ingest <file> <dataset-id> <source-id> [type]

Source Add Options:
  retold-facto source add <name> <type> [url]

Dataset Add Options:
  retold-facto dataset add <name> <type> [description]

Examples:
  retold-facto                              Start server on default port
  retold-facto serve --port 9000            Start server on port 9000
  retold-facto init                         Create database tables
  retold-facto ingest data.csv 1 1          Ingest CSV into dataset 1 from source 1
  retold-facto source add "Census API" API  Register an API source
  retold-facto dataset add "Pop 2020" Raw   Create a Raw dataset
`);
}

// ================================================================
// Configuration
// ================================================================

let _Settings = (
	{
		Product: 'RetoldFacto',
		ProductVersion: '0.0.1',
		APIServerPort: _CLIPort || parseInt(process.env.PORT, 10) || 8386,
		LogStreams:
			[
				{
					streamtype: 'console'
				}
			],

		SQLite:
			{
				SQLiteFilePath: _CLIDBPath || libPath.join(process.cwd(), 'data', 'facto.sqlite')
			}
	});

// Merge CLI config if provided
if (_CLIConfig)
{
	Object.assign(_Settings, _CLIConfig);
}

if (_CLILogPath)
{
	_Settings.LogStreams.push(
		{
			loggertype: 'simpleflatfile',
			outputloglinestoconsole: false,
			showtimestamps: true,
			formattedtimestamps: true,
			level: 'trace',
			path: _CLILogPath
		});
}

// For non-serve commands, use quieter logging
if (_CLICommand !== 'serve')
{
	_Settings.LogStreams = [{ streamtype: 'console', level: 'warn' }];
}

// Ensure the data directory exists
let _DataDir = libPath.dirname(_Settings.SQLite.SQLiteFilePath);
if (_DataDir !== ':memory:' && !libFs.existsSync(_DataDir))
{
	libFs.mkdirSync(_DataDir, { recursive: true });
}

// ================================================================
// Bootstrap
// ================================================================

let _Fable = new libFable(_Settings);

_Fable.serviceManager.addServiceType('MeadowSQLiteProvider', libMeadowConnectionSQLite);
_Fable.serviceManager.instantiateServiceProvider('MeadowSQLiteProvider');

_Fable.MeadowSQLiteProvider.connectAsync(
	(pError) =>
	{
		if (pError)
		{
			console.error(`SQLite connection error: ${pError}`);
			process.exit(1);
		}

		_Fable.settings.MeadowProvider = 'SQLite';

		switch (_CLICommand)
		{
			case 'serve':
				commandServe();
				break;
			case 'init':
				commandInit();
				break;
			case 'ingest':
				commandIngest();
				break;
			case 'source':
				commandSource();
				break;
			case 'dataset':
				commandDataset();
				break;
			default:
				console.error(`Unknown command: ${_CLICommand}`);
				printHelp();
				process.exit(1);
		}
	});

// ================================================================
// Command: serve
// ================================================================
function commandServe()
{
	_Fable.serviceManager.addServiceType('RetoldFacto', libRetoldFacto);
	let tmpFactoService = _Fable.serviceManager.instantiateServiceProvider('RetoldFacto',
		{
			StorageProvider: 'SQLite',
			AutoCreateSchema: true,

			FullMeadowSchemaPath: libPath.join(__dirname, '..', 'test', 'model') + '/',
			FullMeadowSchemaFilename: 'MeadowModel-Extended.json',

			Endpoints:
				{
					MeadowEndpoints: true,
					SourceManager: true,
					RecordManager: true,
					DatasetManager: true,
					IngestEngine: true,
					ProjectionEngine: true,
					CatalogManager: true,
					WebUI: true
				}
		});

	tmpFactoService.initializeService(
		(pInitError) =>
		{
			if (pInitError)
			{
				_Fable.log.error(`Initialization error: ${pInitError}`);
				process.exit(1);
			}
			_Fable.log.info(`Retold Facto running on port ${_Settings.APIServerPort}`);
			_Fable.log.info(`API:     http://localhost:${_Settings.APIServerPort}/1.0/`);
			_Fable.log.info(`Facto:   http://localhost:${_Settings.APIServerPort}/facto/`);
			_Fable.log.info(`Web UI:  http://localhost:${_Settings.APIServerPort}/`);
		});
}

// ================================================================
// Command: init
// ================================================================
function commandInit()
{
	console.log('Initializing Facto database schema...');
	try
	{
		_Fable.MeadowSQLiteProvider.db.exec(libRetoldFacto.FACTO_SCHEMA_SQL);
		console.log('Schema created successfully.');
		console.log(`Database: ${_Settings.SQLite.SQLiteFilePath}`);
	}
	catch (pError)
	{
		console.error(`Error creating schema: ${pError.message}`);
		process.exit(1);
	}
	process.exit(0);
}

// ================================================================
// Command: ingest <file> [dataset-id] [source-id] [type]
// ================================================================
function commandIngest()
{
	let tmpFilePath = _CLIArgs[0];
	if (!tmpFilePath)
	{
		console.error('Error: File path is required for ingest command.');
		console.error('Usage: retold-facto ingest <file> [dataset-id] [source-id] [type]');
		process.exit(1);
	}

	tmpFilePath = libPath.resolve(tmpFilePath);
	if (!libFs.existsSync(tmpFilePath))
	{
		console.error(`Error: File not found: ${tmpFilePath}`);
		process.exit(1);
	}

	let tmpIDDataset = parseInt(_CLIArgs[1], 10) || 1;
	let tmpIDSource = parseInt(_CLIArgs[2], 10) || 1;
	let tmpRecordType = _CLIArgs[3] || 'file-ingest';

	// Create schema, set up service, then ingest
	_Fable.MeadowSQLiteProvider.db.exec(libRetoldFacto.FACTO_SCHEMA_SQL);

	_Fable.serviceManager.addServiceType('RetoldFacto', libRetoldFacto);
	let tmpFactoService = _Fable.serviceManager.instantiateServiceProvider('RetoldFacto',
		{
			StorageProvider: 'SQLite',
			AutoStartOrator: false,

			FullMeadowSchemaPath: libPath.join(__dirname, '..', 'test', 'model') + '/',
			FullMeadowSchemaFilename: 'MeadowModel-Extended.json',

			Endpoints:
				{
					MeadowEndpoints: true,
					SourceManager: false,
					RecordManager: false,
					DatasetManager: false,
					IngestEngine: true,
					ProjectionEngine: false,
					WebUI: false
				}
		});

	tmpFactoService.initializeService(
		(pInitError) =>
		{
			if (pInitError)
			{
				console.error(`Initialization error: ${pInitError}`);
				process.exit(1);
			}

			console.log(`Ingesting file: ${tmpFilePath}`);
			console.log(`  Dataset ID: ${tmpIDDataset}, Source ID: ${tmpIDSource}, Type: ${tmpRecordType}`);

			_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, tmpIDDataset, tmpIDSource,
				{ type: tmpRecordType },
				(pIngestError, pResult) =>
				{
					if (pIngestError)
					{
						console.error(`Ingest error: ${pIngestError.message}`);
						process.exit(1);
					}
					console.log(`Ingest complete:`);
					console.log(`  Format: ${pResult.Format}`);
					console.log(`  Total:  ${pResult.Total}`);
					console.log(`  Ingested: ${pResult.Ingested}`);
					console.log(`  Errors: ${pResult.Errors}`);
					process.exit(0);
				});
		});
}

// ================================================================
// Command: source [list|add]
// ================================================================
function commandSource()
{
	let tmpSubCommand = _CLIArgs[0] || 'list';

	// Create schema and set up service
	_Fable.MeadowSQLiteProvider.db.exec(libRetoldFacto.FACTO_SCHEMA_SQL);

	_Fable.serviceManager.addServiceType('RetoldFacto', libRetoldFacto);
	let tmpFactoService = _Fable.serviceManager.instantiateServiceProvider('RetoldFacto',
		{
			StorageProvider: 'SQLite',
			AutoStartOrator: false,

			FullMeadowSchemaPath: libPath.join(__dirname, '..', 'test', 'model') + '/',
			FullMeadowSchemaFilename: 'MeadowModel-Extended.json',

			Endpoints:
				{
					MeadowEndpoints: true,
					SourceManager: false,
					RecordManager: false,
					DatasetManager: false,
					IngestEngine: false,
					ProjectionEngine: false,
					WebUI: false
				}
		});

	tmpFactoService.initializeService(
		(pInitError) =>
		{
			if (pInitError)
			{
				console.error(`Initialization error: ${pInitError}`);
				process.exit(1);
			}

			if (tmpSubCommand === 'list')
			{
				let tmpQuery = _Fable.DAL.Source.query.clone()
					.addFilter('Deleted', 0)
					.setCap(1000);

				_Fable.DAL.Source.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							console.error(`Error listing sources: ${pError}`);
							process.exit(1);
						}
						if (pRecords.length === 0)
						{
							console.log('No sources registered.');
						}
						else
						{
							console.log(`\n  ID  | Name                           | Type     | Active`);
							console.log(`------+--------------------------------+----------+-------`);
							for (let i = 0; i < pRecords.length; i++)
							{
								let tmpS = pRecords[i];
								let tmpName = (tmpS.Name || '').substring(0, 30).padEnd(30);
								let tmpType = (tmpS.Type || '').substring(0, 8).padEnd(8);
								let tmpActive = tmpS.Active ? 'Yes' : 'No';
								console.log(`  ${String(tmpS.IDSource).padStart(3)} | ${tmpName} | ${tmpType} | ${tmpActive}`);
							}
							console.log(`\n  Total: ${pRecords.length} source(s)`);
						}
						process.exit(0);
					});
			}
			else if (tmpSubCommand === 'add')
			{
				let tmpName = _CLIArgs[1];
				if (!tmpName)
				{
					console.error('Error: Name is required for source add.');
					console.error('Usage: retold-facto source add <name> [type] [url]');
					process.exit(1);
				}

				let tmpType = _CLIArgs[2] || 'Manual';
				let tmpURL = _CLIArgs[3] || '';

				let tmpQuery = _Fable.DAL.Source.query.clone()
					.addRecord(
						{
							Name: tmpName,
							Type: tmpType,
							URL: tmpURL,
							Active: 1
						});

				_Fable.DAL.Source.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							console.error(`Error creating source: ${pError}`);
							process.exit(1);
						}
						console.log(`Source created: #${pRecord.IDSource} "${pRecord.Name}" (${pRecord.Type})`);
						process.exit(0);
					});
			}
			else
			{
				console.error(`Unknown source subcommand: ${tmpSubCommand}`);
				console.error('Usage: retold-facto source [list|add]');
				process.exit(1);
			}
		});
}

// ================================================================
// Command: dataset [list|add]
// ================================================================
function commandDataset()
{
	let tmpSubCommand = _CLIArgs[0] || 'list';

	// Create schema and set up service
	_Fable.MeadowSQLiteProvider.db.exec(libRetoldFacto.FACTO_SCHEMA_SQL);

	_Fable.serviceManager.addServiceType('RetoldFacto', libRetoldFacto);
	let tmpFactoService = _Fable.serviceManager.instantiateServiceProvider('RetoldFacto',
		{
			StorageProvider: 'SQLite',
			AutoStartOrator: false,

			FullMeadowSchemaPath: libPath.join(__dirname, '..', 'test', 'model') + '/',
			FullMeadowSchemaFilename: 'MeadowModel-Extended.json',

			Endpoints:
				{
					MeadowEndpoints: true,
					SourceManager: false,
					RecordManager: false,
					DatasetManager: false,
					IngestEngine: false,
					ProjectionEngine: false,
					WebUI: false
				}
		});

	tmpFactoService.initializeService(
		(pInitError) =>
		{
			if (pInitError)
			{
				console.error(`Initialization error: ${pInitError}`);
				process.exit(1);
			}

			if (tmpSubCommand === 'list')
			{
				let tmpQuery = _Fable.DAL.Dataset.query.clone()
					.addFilter('Deleted', 0)
					.setCap(1000);

				_Fable.DAL.Dataset.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							console.error(`Error listing datasets: ${pError}`);
							process.exit(1);
						}
						if (pRecords.length === 0)
						{
							console.log('No datasets created.');
						}
						else
						{
							console.log(`\n  ID  | Name                           | Type           | Description`);
							console.log(`------+--------------------------------+----------------+----------------------------`);
							for (let i = 0; i < pRecords.length; i++)
							{
								let tmpD = pRecords[i];
								let tmpName = (tmpD.Name || '').substring(0, 30).padEnd(30);
								let tmpType = (tmpD.Type || '').substring(0, 14).padEnd(14);
								let tmpDesc = (tmpD.Description || '').substring(0, 26);
								console.log(`  ${String(tmpD.IDDataset).padStart(3)} | ${tmpName} | ${tmpType} | ${tmpDesc}`);
							}
							console.log(`\n  Total: ${pRecords.length} dataset(s)`);
						}
						process.exit(0);
					});
			}
			else if (tmpSubCommand === 'add')
			{
				let tmpName = _CLIArgs[1];
				if (!tmpName)
				{
					console.error('Error: Name is required for dataset add.');
					console.error('Usage: retold-facto dataset add <name> [type] [description]');
					process.exit(1);
				}

				let tmpType = _CLIArgs[2] || 'Raw';
				let tmpDescription = _CLIArgs[3] || '';

				let tmpValidTypes = ['Raw', 'Compositional', 'Projection', 'Derived'];
				if (tmpValidTypes.indexOf(tmpType) < 0)
				{
					console.error(`Error: Invalid dataset type "${tmpType}". Valid types: ${tmpValidTypes.join(', ')}`);
					process.exit(1);
				}

				let tmpQuery = _Fable.DAL.Dataset.query.clone()
					.addRecord(
						{
							Name: tmpName,
							Type: tmpType,
							Description: tmpDescription
						});

				_Fable.DAL.Dataset.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							console.error(`Error creating dataset: ${pError}`);
							process.exit(1);
						}
						console.log(`Dataset created: #${pRecord.IDDataset} "${pRecord.Name}" (${pRecord.Type})`);
						process.exit(0);
					});
			}
			else
			{
				console.error(`Unknown dataset subcommand: ${tmpSubCommand}`);
				console.error('Usage: retold-facto dataset [list|add]');
				process.exit(1);
			}
		});
}
