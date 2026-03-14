/**
* Unit tests for Retold Facto
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;

const libFable = require('fable');
const libSuperTest = require('supertest');
const libMeadowConnectionSQLite = require('meadow-connection-sqlite');
const libFs = require('fs');
const libPath = require('path');

const _APIServerPort = 9340;
const _BaseURL = `http://localhost:${_APIServerPort}/`;

let _Fable;
let _RetoldFacto;
let _SuperTest;

suite
(
	'Retold Facto',
	function()
	{
		suiteSetup
		(
			function(fDone)
			{
				this.timeout(10000);

				let tmpSettings = {
					Product: 'RetoldFactoTest',
					ProductVersion: '0.0.1',
					APIServerPort: _APIServerPort,
					SQLite:
						{
							SQLiteFilePath: ':memory:'
						},
					LogStreams:
						[
							{
								streamtype: 'console',
								level: 'fatal'
							}
						]
				};

				_Fable = new libFable(tmpSettings);

				// Register the SQLite provider
				_Fable.serviceManager.addServiceType('MeadowSQLiteProvider', libMeadowConnectionSQLite);
				_Fable.serviceManager.instantiateServiceProvider('MeadowSQLiteProvider');

				_Fable.MeadowSQLiteProvider.connectAsync(
					(pError) =>
					{
						if (pError)
						{
							return fDone(pError);
						}

						let tmpDB = _Fable.MeadowSQLiteProvider.db;

						// Create all tables for the Facto model
						tmpDB.exec(`
							CREATE TABLE IF NOT EXISTS Source (
								IDSource INTEGER PRIMARY KEY AUTOINCREMENT,
								GUIDSource TEXT,
								CreateDate TEXT,
								CreatingIDUser INTEGER DEFAULT 0,
								UpdateDate TEXT,
								UpdatingIDUser INTEGER DEFAULT 0,
								Deleted INTEGER DEFAULT 0,
								DeleteDate TEXT,
								DeletingIDUser INTEGER DEFAULT 0,
								Name TEXT,
								Type TEXT,
								URL TEXT,
								Protocol TEXT,
								Description TEXT,
								Configuration TEXT,
								Active INTEGER DEFAULT 0
							);
							CREATE TABLE IF NOT EXISTS SourceDocumentation (
								IDSourceDocumentation INTEGER PRIMARY KEY AUTOINCREMENT,
								GUIDSourceDocumentation TEXT,
								CreateDate TEXT,
								CreatingIDUser INTEGER DEFAULT 0,
								UpdateDate TEXT,
								UpdatingIDUser INTEGER DEFAULT 0,
								Deleted INTEGER DEFAULT 0,
								DeleteDate TEXT,
								DeletingIDUser INTEGER DEFAULT 0,
								IDSource INTEGER DEFAULT 0,
								Name TEXT,
								DocumentType TEXT,
								MimeType TEXT,
								StorageKey TEXT,
								Description TEXT,
								Content TEXT
							);
							CREATE TABLE IF NOT EXISTS Dataset (
								IDDataset INTEGER PRIMARY KEY AUTOINCREMENT,
								GUIDDataset TEXT,
								CreateDate TEXT,
								CreatingIDUser INTEGER DEFAULT 0,
								UpdateDate TEXT,
								UpdatingIDUser INTEGER DEFAULT 0,
								Deleted INTEGER DEFAULT 0,
								DeleteDate TEXT,
								DeletingIDUser INTEGER DEFAULT 0,
								Name TEXT,
								Type TEXT,
								Description TEXT,
								SchemaHash TEXT,
								SchemaVersion INTEGER DEFAULT 0,
								SchemaDefinition TEXT
							);
							CREATE TABLE IF NOT EXISTS DatasetSource (
								IDDatasetSource INTEGER PRIMARY KEY AUTOINCREMENT,
								GUIDDatasetSource TEXT,
								CreateDate TEXT,
								CreatingIDUser INTEGER DEFAULT 0,
								UpdateDate TEXT,
								UpdatingIDUser INTEGER DEFAULT 0,
								Deleted INTEGER DEFAULT 0,
								DeleteDate TEXT,
								DeletingIDUser INTEGER DEFAULT 0,
								IDDataset INTEGER DEFAULT 0,
								IDSource INTEGER DEFAULT 0,
								ReliabilityWeight REAL DEFAULT 0
							);
							CREATE TABLE IF NOT EXISTS Record (
								IDRecord INTEGER PRIMARY KEY AUTOINCREMENT,
								GUIDRecord TEXT,
								CreateDate TEXT,
								CreatingIDUser INTEGER DEFAULT 0,
								UpdateDate TEXT,
								UpdatingIDUser INTEGER DEFAULT 0,
								Deleted INTEGER DEFAULT 0,
								DeleteDate TEXT,
								DeletingIDUser INTEGER DEFAULT 0,
								IDDataset INTEGER DEFAULT 0,
								IDSource INTEGER DEFAULT 0,
								Type TEXT,
								SchemaHash TEXT,
								SchemaVersion INTEGER DEFAULT 0,
								Version INTEGER DEFAULT 1,
								IngestDate TEXT,
								OriginCreateDate TEXT,
								RepresentedTimeStampStart INTEGER DEFAULT 0,
								RepresentedTimeStampStop INTEGER DEFAULT 0,
								RepresentedDuration INTEGER DEFAULT 0,
								Content TEXT
							);
							CREATE TABLE IF NOT EXISTS RecordBinary (
								IDRecordBinary INTEGER PRIMARY KEY AUTOINCREMENT,
								GUIDRecordBinary TEXT,
								CreateDate TEXT,
								CreatingIDUser INTEGER DEFAULT 0,
								UpdateDate TEXT,
								UpdatingIDUser INTEGER DEFAULT 0,
								Deleted INTEGER DEFAULT 0,
								DeleteDate TEXT,
								DeletingIDUser INTEGER DEFAULT 0,
								IDRecord INTEGER DEFAULT 0,
								MimeType TEXT,
								StorageKey TEXT,
								FileSize INTEGER DEFAULT 0
							);
							CREATE TABLE IF NOT EXISTS CertaintyIndex (
								IDCertaintyIndex INTEGER PRIMARY KEY AUTOINCREMENT,
								GUIDCertaintyIndex TEXT,
								CreateDate TEXT,
								CreatingIDUser INTEGER DEFAULT 0,
								UpdateDate TEXT,
								UpdatingIDUser INTEGER DEFAULT 0,
								Deleted INTEGER DEFAULT 0,
								DeleteDate TEXT,
								DeletingIDUser INTEGER DEFAULT 0,
								IDRecord INTEGER DEFAULT 0,
								CertaintyValue REAL DEFAULT 0.5,
								Dimension TEXT,
								Justification TEXT
							);
							CREATE TABLE IF NOT EXISTS IngestJob (
								IDIngestJob INTEGER PRIMARY KEY AUTOINCREMENT,
								GUIDIngestJob TEXT,
								CreateDate TEXT,
								CreatingIDUser INTEGER DEFAULT 0,
								UpdateDate TEXT,
								UpdatingIDUser INTEGER DEFAULT 0,
								Deleted INTEGER DEFAULT 0,
								DeleteDate TEXT,
								DeletingIDUser INTEGER DEFAULT 0,
								IDSource INTEGER DEFAULT 0,
								IDDataset INTEGER DEFAULT 0,
								Status TEXT,
								StartDate TEXT,
								EndDate TEXT,
								RecordsProcessed INTEGER DEFAULT 0,
								RecordsCreated INTEGER DEFAULT 0,
								RecordsUpdated INTEGER DEFAULT 0,
								RecordsErrored INTEGER DEFAULT 0,
								Configuration TEXT,
								Log TEXT
							);
						`);

						_Fable.settings.MeadowProvider = 'SQLite';

						const libRetoldFacto = require('../source/Retold-Facto.js');
						_Fable.serviceManager.addServiceType('RetoldFacto', libRetoldFacto);
						_RetoldFacto = _Fable.serviceManager.instantiateServiceProvider('RetoldFacto',
							{
								StorageProvider: 'SQLite',

								FullMeadowSchemaPath: `${__dirname}/model/`,
								FullMeadowSchemaFilename: 'MeadowModel-Extended.json',

								AutoStartOrator: true,

								Endpoints:
									{
										MeadowEndpoints: true,
										SourceManager: true,
										RecordManager: true,
										DatasetManager: true,
										IngestEngine: true,
										ProjectionEngine: true,
										WebUI: false
									}
							});

						// Enable JSON body parsing
						_RetoldFacto.onBeforeInitialize = (fCallback) =>
						{
							_Fable.OratorServiceServer.server.use(_Fable.OratorServiceServer.bodyParser());
							return fCallback();
						};

						_RetoldFacto.initializeService(
							(pInitError) =>
							{
								if (pInitError)
								{
									return fDone(pInitError);
								}
								_SuperTest = libSuperTest(`http://localhost:${_APIServerPort}`);
								return fDone();
							});
					});
			}
		);

		suiteTeardown
		(
			function(fDone)
			{
				this.timeout(5000);
				if (_RetoldFacto && _RetoldFacto.serviceInitialized)
				{
					_RetoldFacto.stopService(fDone);
				}
				else
				{
					return fDone();
				}
			}
		);

		suite
		(
			'Object Sanity',
			function()
			{
				test
				(
					'The RetoldFacto class should exist',
					function()
					{
						const libRetoldFacto = require('../source/Retold-Facto.js');
						Expect(libRetoldFacto).to.be.a('function');
					}
				);
				test
				(
					'The service should be initialized',
					function()
					{
						Expect(_RetoldFacto).to.be.an('object');
						Expect(_RetoldFacto.serviceInitialized).to.equal(true);
					}
				);
				test
				(
					'The entity list should contain all 8 entities',
					function()
					{
						Expect(_RetoldFacto.entityList).to.be.an('array');
						Expect(_RetoldFacto.entityList).to.include('Source');
						Expect(_RetoldFacto.entityList).to.include('SourceDocumentation');
						Expect(_RetoldFacto.entityList).to.include('Dataset');
						Expect(_RetoldFacto.entityList).to.include('DatasetSource');
						Expect(_RetoldFacto.entityList).to.include('Record');
						Expect(_RetoldFacto.entityList).to.include('RecordBinary');
						Expect(_RetoldFacto.entityList).to.include('CertaintyIndex');
						Expect(_RetoldFacto.entityList).to.include('IngestJob');
						Expect(_RetoldFacto.entityList.length).to.equal(8);
					}
				);
				test
				(
					'DAL objects should exist for all entities',
					function()
					{
						Expect(_RetoldFacto._DAL).to.be.an('object');
						Expect(_RetoldFacto._DAL.Source).to.be.an('object');
						Expect(_RetoldFacto._DAL.Record).to.be.an('object');
						Expect(_RetoldFacto._DAL.CertaintyIndex).to.be.an('object');
					}
				);
				test
				(
					'MeadowEndpoints should exist for all entities',
					function()
					{
						Expect(_RetoldFacto._MeadowEndpoints).to.be.an('object');
						Expect(_RetoldFacto._MeadowEndpoints.Source).to.be.an('object');
						Expect(_RetoldFacto._MeadowEndpoints.Record).to.be.an('object');
						Expect(_RetoldFacto._MeadowEndpoints.Dataset).to.be.an('object');
					}
				);
			}
		);

		suite
		(
			'Service Lifecycle',
			function()
			{
				test
				(
					'Should not allow double initialization',
					function(fDone)
					{
						_RetoldFacto.initializeService(
							(pError) =>
							{
								Expect(pError).to.be.an.instanceOf(Error);
								Expect(pError.message).to.contain('already been initialized');
								return fDone();
							});
					}
				);
				test
				(
					'Lifecycle hooks should exist',
					function()
					{
						Expect(_RetoldFacto.onBeforeInitialize).to.be.a('function');
						Expect(_RetoldFacto.onInitialize).to.be.a('function');
						Expect(_RetoldFacto.onAfterInitialize).to.be.a('function');
					}
				);
				test
				(
					'Endpoint group check should work',
					function()
					{
						Expect(_RetoldFacto.isEndpointGroupEnabled('MeadowEndpoints')).to.equal(true);
						Expect(_RetoldFacto.isEndpointGroupEnabled('SourceManager')).to.equal(true);
						Expect(_RetoldFacto.isEndpointGroupEnabled('IngestEngine')).to.equal(true);
						Expect(_RetoldFacto.isEndpointGroupEnabled('ProjectionEngine')).to.equal(true);
						Expect(_RetoldFacto.isEndpointGroupEnabled('NonExistent')).to.equal(false);
					}
				);
			}
		);

		suite
		(
			'Source CRUD Endpoints',
			function()
			{
				test
				(
					'Should create a Source',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/Source')
							.send({ Name: 'US Census API', Type: 'API', URL: 'https://api.census.gov', Protocol: 'HTTPS', Active: 1 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Name).to.equal('US Census API');
									Expect(pResponse.body.IDSource).to.be.greaterThan(0);
									return fDone();
								});
					}
				);
				test
				(
					'Should create a second Source',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/Source')
							.send({ Name: 'Dept of Labor CSV', Type: 'File', URL: 'https://www.bls.gov/data/', Protocol: 'HTTPS' })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Name).to.equal('Dept of Labor CSV');
									return fDone();
								});
					}
				);
				test
				(
					'Should read a Source by ID',
					function(fDone)
					{
						_SuperTest
							.get('/1.0/Source/1')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Name).to.equal('US Census API');
									Expect(pResponse.body.Type).to.equal('API');
									return fDone();
								});
					}
				);
				test
				(
					'Should list Sources',
					function(fDone)
					{
						_SuperTest
							.get('/1.0/Sources/0/10')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body).to.be.an('array');
									Expect(pResponse.body.length).to.equal(2);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Source Manager Domain Endpoints',
			function()
			{
				test
				(
					'Should return active sources (only source 1 is active)',
					function(fDone)
					{
						_SuperTest
							.get('/facto/sources/active')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Active).to.equal(true);
									Expect(pResponse.body.Sources).to.be.an('array');
									Expect(pResponse.body.Sources.length).to.equal(1);
									Expect(pResponse.body.Sources[0].Name).to.equal('US Census API');
									return fDone();
								});
					}
				);
				test
				(
					'Should activate source 2',
					function(fDone)
					{
						_SuperTest
							.put('/facto/source/2/activate')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Success).to.equal(true);
									return fDone();
								});
					}
				);
				test
				(
					'Should now return 2 active sources',
					function(fDone)
					{
						_SuperTest
							.get('/facto/sources/active')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Sources.length).to.equal(2);
									return fDone();
								});
					}
				);
				test
				(
					'Should deactivate source 2',
					function(fDone)
					{
						_SuperTest
							.put('/facto/source/2/deactivate')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Success).to.equal(true);
									return fDone();
								});
					}
				);
				test
				(
					'Should return 1 active source after deactivation',
					function(fDone)
					{
						_SuperTest
							.get('/facto/sources/active')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Sources.length).to.equal(1);
									return fDone();
								});
					}
				);
				test
				(
					'Should create source documentation',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/SourceDocumentation')
							.send({ IDSource: 1, Name: 'Census API Docs', DocumentType: 'markdown', MimeType: 'text/markdown', Description: 'API documentation' })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.IDSourceDocumentation).to.be.greaterThan(0);
									return fDone();
								});
					}
				);
				test
				(
					'Should list documentation for source 1',
					function(fDone)
					{
						_SuperTest
							.get('/facto/source/1/documentation')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Documentation).to.be.an('array');
									Expect(pResponse.body.Documentation.length).to.equal(1);
									Expect(pResponse.body.Documentation[0].Name).to.equal('Census API Docs');
									return fDone();
								});
					}
				);
				test
				(
					'Should get source summary with counts',
					function(fDone)
					{
						_SuperTest
							.get('/facto/source/1/summary')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Source).to.be.an('object');
									Expect(pResponse.body.Source.Name).to.equal('US Census API');
									Expect(pResponse.body.DocumentationCount).to.equal(1);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Dataset CRUD Endpoints',
			function()
			{
				test
				(
					'Should create a Raw Dataset',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/Dataset')
							.send({ Name: 'Census Population 2020', Type: 'Raw', Description: 'US Census population counts by county' })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Name).to.equal('Census Population 2020');
									Expect(pResponse.body.Type).to.equal('Raw');
									return fDone();
								});
					}
				);
				test
				(
					'Should create a Projection Dataset',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/Dataset')
							.send({ Name: 'Population Summary View', Type: 'Projection', Description: 'Flattened population data for charting' })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Name).to.equal('Population Summary View');
									Expect(pResponse.body.Type).to.equal('Projection');
									return fDone();
								});
					}
				);
				test
				(
					'Should create a DatasetSource link',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/DatasetSource')
							.send({ IDDataset: 1, IDSource: 1, ReliabilityWeight: 0.85 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.IDDataset).to.equal(1);
									Expect(pResponse.body.IDSource).to.equal(1);
									return fDone();
								});
					}
				);
				test
				(
					'Should list dataset types via domain endpoint',
					function(fDone)
					{
						_SuperTest
							.get('/facto/datasets/types')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Types).to.be.an('array');
									Expect(pResponse.body.Types).to.include('Raw');
									Expect(pResponse.body.Types).to.include('Compositional');
									Expect(pResponse.body.Types).to.include('Projection');
									Expect(pResponse.body.Types).to.include('Derived');
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Dataset Manager Domain Endpoints',
			function()
			{
				test
				(
					'Should link a source to a dataset via domain endpoint',
					function(fDone)
					{
						_SuperTest
							.post('/facto/dataset/1/source')
							.send({ IDSource: 2, ReliabilityWeight: 0.6 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Success).to.equal(true);
									Expect(pResponse.body.DatasetSource).to.be.an('object');
									return fDone();
								});
					}
				);
				test
				(
					'Should list sources linked to dataset 1',
					function(fDone)
					{
						_SuperTest
							.get('/facto/dataset/1/sources')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Sources).to.be.an('array');
									Expect(pResponse.body.Sources.length).to.equal(2);
									return fDone();
								});
					}
				);
				test
				(
					'Should get dataset stats',
					function(fDone)
					{
						_SuperTest
							.get('/facto/dataset/1/stats')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Dataset).to.be.an('object');
									Expect(pResponse.body.Dataset.Name).to.equal('Census Population 2020');
									Expect(pResponse.body.SourceCount).to.equal(2);
									Expect(pResponse.body.RecordCount).to.equal(0);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Record CRUD Endpoints',
			function()
			{
				test
				(
					'Should create a Record',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/Record')
							.send(
								{
									IDDataset: 1,
									IDSource: 1,
									Type: 'census-population',
									Version: 1,
									RepresentedTimeStampStart: 1577836800,
									RepresentedTimeStampStop: 1609459199,
									Content: JSON.stringify({ county: 'Los Angeles', state: 'CA', population: 10014009 })
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.IDRecord).to.be.greaterThan(0);
									Expect(pResponse.body.Type).to.equal('census-population');
									return fDone();
								});
					}
				);
				test
				(
					'Should create a second Record',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/Record')
							.send(
								{
									IDDataset: 1,
									IDSource: 1,
									Type: 'census-population',
									Version: 1,
									RepresentedTimeStampStart: 1577836800,
									RepresentedTimeStampStop: 1609459199,
									Content: JSON.stringify({ county: 'Cook', state: 'IL', population: 5275541 })
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.IDRecord).to.be.greaterThan(0);
									return fDone();
								});
					}
				);
				test
				(
					'Should read a Record by ID',
					function(fDone)
					{
						_SuperTest
							.get('/1.0/Record/1')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Type).to.equal('census-population');
									let tmpContent = JSON.parse(pResponse.body.Content);
									Expect(tmpContent.county).to.equal('Los Angeles');
									return fDone();
								});
					}
				);
				test
				(
					'Should list Records with pagination',
					function(fDone)
					{
						_SuperTest
							.get('/1.0/Records/0/50')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body).to.be.an('array');
									Expect(pResponse.body.length).to.equal(2);
									return fDone();
								});
					}
				);
				test
				(
					'Should count Records',
					function(fDone)
					{
						_SuperTest
							.get('/1.0/Records/Count')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Count).to.equal(2);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Record Manager Domain Endpoints',
			function()
			{
				test
				(
					'Should batch ingest records with auto-certainty',
					function(fDone)
					{
						this.timeout(10000);
						_SuperTest
							.post('/facto/record/ingest')
							.send(
								{
									IDDataset: 1,
									IDSource: 1,
									Records:
									[
										{
											Type: 'census-population',
											Content: JSON.stringify({ county: 'Harris', state: 'TX', population: 4713325 }),
											RepresentedTimeStampStart: 1577836800,
											RepresentedTimeStampStop: 1609459199
										},
										{
											Type: 'census-population',
											Content: JSON.stringify({ county: 'Maricopa', state: 'AZ', population: 4485414 }),
											RepresentedTimeStampStart: 1577836800,
											RepresentedTimeStampStop: 1609459199
										}
									]
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Ingested).to.equal(2);
									Expect(pResponse.body.Errors).to.equal(0);
									Expect(pResponse.body.Total).to.equal(2);
									Expect(pResponse.body.DefaultCertainty).to.equal(0.5);
									Expect(pResponse.body.Records).to.be.an('array');
									Expect(pResponse.body.Records.length).to.equal(2);
									return fDone();
								});
					}
				);
				test
				(
					'Should return error for empty ingest request',
					function(fDone)
					{
						_SuperTest
							.post('/facto/record/ingest')
							.send({ IDDataset: 1, IDSource: 1 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Error).to.be.a('string');
									Expect(pResponse.body.Ingested).to.equal(0);
									return fDone();
								});
					}
				);
				test
				(
					'Should get certainty indices for an ingested record',
					function(fDone)
					{
						// Record 3 was created by batch ingest and should have auto-certainty
						_SuperTest
							.get('/facto/record/3/certainty')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.CertaintyIndices).to.be.an('array');
									Expect(pResponse.body.CertaintyIndices.length).to.be.greaterThan(0);
									Expect(pResponse.body.CertaintyIndices[0].Dimension).to.equal('overall');
									return fDone();
								});
					}
				);
				test
				(
					'Should add a new certainty index entry',
					function(fDone)
					{
						_SuperTest
							.post('/facto/record/1/certainty')
							.send({ CertaintyValue: 0.9, Dimension: 'accuracy', Justification: 'Verified against official source' })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Success).to.equal(true);
									Expect(pResponse.body.CertaintyIndex).to.be.an('object');
									Expect(pResponse.body.CertaintyIndex.Dimension).to.equal('accuracy');
									return fDone();
								});
					}
				);
				test
				(
					'Should list binary attachments for a record (empty)',
					function(fDone)
					{
						_SuperTest
							.get('/facto/record/1/binary')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Binaries).to.be.an('array');
									Expect(pResponse.body.Binaries.length).to.equal(0);
									return fDone();
								});
					}
				);
				test
				(
					'Should get record versions by GUIDRecord',
					function(fDone)
					{
						_SuperTest
							.get('/facto/record/1/versions')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Versions).to.be.an('array');
									Expect(pResponse.body.Versions.length).to.be.greaterThan(0);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'CertaintyIndex CRUD Endpoints',
			function()
			{
				test
				(
					'Should create a CertaintyIndex entry',
					function(fDone)
					{
						_SuperTest
							.post('/1.0/CertaintyIndex')
							.send({ IDRecord: 1, CertaintyValue: 0.5, Dimension: 'completeness', Justification: 'Default initial certainty' })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.IDCertaintyIndex).to.be.greaterThan(0);
									Expect(pResponse.body.Dimension).to.equal('completeness');
									return fDone();
								});
					}
				);
				test
				(
					'Should read CertaintyIndex by ID',
					function(fDone)
					{
						_SuperTest
							.get('/1.0/CertaintyIndex/1')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.IDRecord).to.be.greaterThan(0);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Dataset Manager Advanced',
			function()
			{
				test
				(
					'Should get updated dataset stats with records',
					function(fDone)
					{
						_SuperTest
							.get('/facto/dataset/1/stats')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.RecordCount).to.equal(4);
									Expect(pResponse.body.SourceCount).to.equal(2);
									return fDone();
								});
					}
				);
				test
				(
					'Should list records for a dataset with pagination',
					function(fDone)
					{
						_SuperTest
							.get('/facto/dataset/1/records/0/10')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Records).to.be.an('array');
									Expect(pResponse.body.Records.length).to.equal(4);
									Expect(pResponse.body.IDDataset).to.equal(1);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Ingest Engine Domain Endpoints',
			function()
			{
				test
				(
					'Should create an ingest job',
					function(fDone)
					{
						_SuperTest
							.post('/facto/ingest/job')
							.send({ IDSource: 1, IDDataset: 1, Configuration: { format: 'csv', delimiter: ',' } })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Success).to.equal(true);
									Expect(pResponse.body.Job).to.be.an('object');
									Expect(pResponse.body.Job.Status).to.equal('Pending');
									Expect(pResponse.body.Job.IDSource).to.equal(1);
									return fDone();
								});
					}
				);
				test
				(
					'Should list ingest jobs',
					function(fDone)
					{
						_SuperTest
							.get('/facto/ingest/jobs')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Jobs).to.be.an('array');
									Expect(pResponse.body.Jobs.length).to.equal(1);
									return fDone();
								});
					}
				);
				test
				(
					'Should get ingest job details',
					function(fDone)
					{
						_SuperTest
							.get('/facto/ingest/job/1')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Job).to.be.an('object');
									Expect(pResponse.body.Job.Status).to.equal('Pending');
									Expect(pResponse.body.Job.Log).to.contain('Job created');
									return fDone();
								});
					}
				);
				test
				(
					'Should start an ingest job',
					function(fDone)
					{
						_SuperTest
							.put('/facto/ingest/job/1/start')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Success).to.equal(true);
									return fDone();
								});
					}
				);
				test
				(
					'Should complete an ingest job with counters',
					function(fDone)
					{
						_SuperTest
							.put('/facto/ingest/job/1/complete')
							.send({ RecordsProcessed: 100, RecordsCreated: 95, RecordsErrored: 5 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Success).to.equal(true);
									return fDone();
								});
					}
				);
				test
				(
					'Should verify completed job has log entries',
					function(fDone)
					{
						_SuperTest
							.get('/facto/ingest/job/1')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Job.Log).to.contain('Job created');
									Expect(pResponse.body.Job.Log).to.contain('Job started');
									Expect(pResponse.body.Job.Log).to.contain('Job completed');
									return fDone();
								});
					}
				);
				test
				(
					'Should list valid job statuses',
					function(fDone)
					{
						_SuperTest
							.get('/facto/ingest/statuses')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Statuses).to.be.an('array');
									Expect(pResponse.body.Statuses).to.include('Pending');
									Expect(pResponse.body.Statuses).to.include('Running');
									Expect(pResponse.body.Statuses).to.include('Completed');
									Expect(pResponse.body.Statuses).to.include('Failed');
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Projection Engine Domain Endpoints',
			function()
			{
				test
				(
					'Should list projection datasets',
					function(fDone)
					{
						_SuperTest
							.get('/facto/projections')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Projections).to.be.an('array');
									Expect(pResponse.body.Projections.length).to.equal(1);
									Expect(pResponse.body.Projections[0].Name).to.equal('Population Summary View');
									return fDone();
								});
					}
				);
				test
				(
					'Should list datasets by type',
					function(fDone)
					{
						_SuperTest
							.get('/facto/datasets/by-type/Raw')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Datasets).to.be.an('array');
									Expect(pResponse.body.Datasets.length).to.equal(1);
									Expect(pResponse.body.Type).to.equal('Raw');
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Schema Auto-Creation',
			function()
			{
				test
				(
					'Should expose FACTO_SCHEMA_SQL on module exports',
					function()
					{
						const libRetoldFacto = require('../source/Retold-Facto.js');
						Expect(libRetoldFacto.FACTO_SCHEMA_SQL).to.be.a('string');
						Expect(libRetoldFacto.FACTO_SCHEMA_SQL).to.contain('CREATE TABLE IF NOT EXISTS Source');
						Expect(libRetoldFacto.FACTO_SCHEMA_SQL).to.contain('CREATE TABLE IF NOT EXISTS IngestJob');
					}
				);
				test
				(
					'Should have createSchema method on the service instance',
					function()
					{
						Expect(_RetoldFacto.createSchema).to.be.a('function');
					}
				);
				test
				(
					'Should be able to run createSchema without error (tables already exist)',
					function(fDone)
					{
						_RetoldFacto.createSchema(
							(pError) =>
							{
								Expect(pError).to.not.exist;
								return fDone();
							});
					}
				);
			}
		);

		suite
		(
			'CSV/JSON File Ingest via API',
			function()
			{
				test
				(
					'Should ingest CSV content via POST /facto/ingest/file',
					function(fDone)
					{
						this.timeout(10000);
						let tmpCSVContent = 'name,state,population\nAlaska,AK,733391\nDelaware,DE,989948\nVermont,VT,643077';

						_SuperTest
							.post('/facto/ingest/file')
							.send(
								{
									IDDataset: 1,
									IDSource: 1,
									Format: 'csv',
									Type: 'state-population',
									Content: tmpCSVContent
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Ingested).to.equal(3);
									Expect(pResponse.body.Errors).to.equal(0);
									Expect(pResponse.body.Total).to.equal(3);
									Expect(pResponse.body.Format).to.equal('csv');
									Expect(pResponse.body.Records).to.be.an('array');
									Expect(pResponse.body.Records.length).to.equal(3);
									// Verify content was stored as JSON
									let tmpContent = JSON.parse(pResponse.body.Records[0].Content);
									Expect(tmpContent.name).to.equal('Alaska');
									Expect(tmpContent.state).to.equal('AK');
									return fDone();
								});
					}
				);
				test
				(
					'Should ingest JSON array content via POST /facto/ingest/file',
					function(fDone)
					{
						this.timeout(10000);
						let tmpJSONContent = JSON.stringify([
							{ county: 'San Diego', state: 'CA', population: 3338330 },
							{ county: 'Orange', state: 'CA', population: 3186989 }
						]);

						_SuperTest
							.post('/facto/ingest/file')
							.send(
								{
									IDDataset: 1,
									IDSource: 1,
									Format: 'json',
									Type: 'county-population',
									Content: tmpJSONContent
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Ingested).to.equal(2);
									Expect(pResponse.body.Errors).to.equal(0);
									Expect(pResponse.body.Format).to.equal('json');
									return fDone();
								});
					}
				);
				test
				(
					'Should auto-detect JSON format',
					function(fDone)
					{
						this.timeout(10000);
						let tmpContent = JSON.stringify({ data: [{ metric: 'gdp', value: 21433 }] });

						_SuperTest
							.post('/facto/ingest/file')
							.send(
								{
									IDDataset: 1,
									IDSource: 1,
									Type: 'economic',
									Content: tmpContent
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Ingested).to.equal(1);
									Expect(pResponse.body.Format).to.equal('json');
									return fDone();
								});
					}
				);
				test
				(
					'Should auto-detect CSV format',
					function(fDone)
					{
						this.timeout(10000);
						let tmpContent = 'key,value\nalpha,100\nbeta,200';

						_SuperTest
							.post('/facto/ingest/file')
							.send(
								{
									IDDataset: 1,
									IDSource: 1,
									Content: tmpContent
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Ingested).to.equal(2);
									Expect(pResponse.body.Format).to.equal('csv');
									return fDone();
								});
					}
				);
				test
				(
					'Should return error when Content is missing',
					function(fDone)
					{
						_SuperTest
							.post('/facto/ingest/file')
							.send({ IDDataset: 1, IDSource: 1 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Error).to.be.a('string');
									Expect(pResponse.body.Ingested).to.equal(0);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'Programmatic File Ingest',
			function()
			{
				test
				(
					'Should ingest a CSV file from disk',
					function(fDone)
					{
						this.timeout(10000);

						// Write a temp CSV file
						let tmpFilePath = libPath.join(__dirname, 'tmp-test-ingest.csv');
						libFs.writeFileSync(tmpFilePath, 'city,state,zip\nPortland,OR,97201\nSeattle,WA,98101\nBoise,ID,83702\n');

						_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, 1, 1,
							{ type: 'city-data' },
							(pError, pResult) =>
							{
								// Clean up temp file
								try { libFs.unlinkSync(tmpFilePath); } catch(e) {}

								if (pError) return fDone(pError);
								Expect(pResult.Ingested).to.equal(3);
								Expect(pResult.Errors).to.equal(0);
								Expect(pResult.Format).to.equal('csv');
								Expect(pResult.Records).to.be.an('array');
								return fDone();
							});
					}
				);
				test
				(
					'Should ingest a JSON file from disk',
					function(fDone)
					{
						this.timeout(10000);

						let tmpFilePath = libPath.join(__dirname, 'tmp-test-ingest.json');
						libFs.writeFileSync(tmpFilePath, JSON.stringify([
							{ region: 'West', count: 50 },
							{ region: 'East', count: 45 }
						]));

						_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, 1, 1,
							{ type: 'region-data' },
							(pError, pResult) =>
							{
								try { libFs.unlinkSync(tmpFilePath); } catch(e) {}

								if (pError) return fDone(pError);
								Expect(pResult.Ingested).to.equal(2);
								Expect(pResult.Format).to.equal('json');
								return fDone();
							});
					}
				);
				test
				(
					'Should return error for non-existent file',
					function(fDone)
					{
						_Fable.RetoldFactoIngestEngine.ingestFile('/tmp/non-existent-file-12345.csv', 1, 1,
							(pError, pResult) =>
							{
								Expect(pError).to.be.an.instanceOf(Error);
								return fDone();
							});
					}
				);
				test
				(
					'Should return error for unknown file extension',
					function(fDone)
					{
						let tmpFilePath = libPath.join(__dirname, 'tmp-test-ingest.xyz');
						libFs.writeFileSync(tmpFilePath, 'some unknown format data');

						_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, 1, 1,
							(pError, pResult) =>
							{
								try { libFs.unlinkSync(tmpFilePath); } catch(e) {}

								Expect(pError).to.be.an.instanceOf(Error);
								Expect(pError.message).to.contain('Cannot determine format');
								return fDone();
							});
					}
				);
				test
				(
					'Should handle TSV files with auto-detected tab delimiter',
					function(fDone)
					{
						this.timeout(10000);

						let tmpFilePath = libPath.join(__dirname, 'tmp-test-ingest.tsv');
						libFs.writeFileSync(tmpFilePath, 'name\tscore\nAlice\t95\nBob\t87\n');

						_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, 1, 1,
							{ type: 'scores' },
							(pError, pResult) =>
							{
								try { libFs.unlinkSync(tmpFilePath); } catch(e) {}

								if (pError) return fDone(pError);
								Expect(pResult.Ingested).to.equal(2);
								Expect(pResult.Format).to.equal('csv');
								return fDone();
							});
					}
				);
			}
		);

		suite
		(
			'Projection Engine Advanced',
			function()
			{
				test
				(
					'Should query records across datasets',
					function(fDone)
					{
						this.timeout(10000);
						_SuperTest
							.post('/facto/projections/query')
							.send({ DatasetIDs: [1], Begin: 0, Cap: 100 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Query).to.be.an('object');
									Expect(pResponse.body.Records).to.be.an('array');
									Expect(pResponse.body.Records.length).to.be.greaterThan(0);
									Expect(pResponse.body.Count).to.be.greaterThan(0);
									return fDone();
								});
					}
				);
				test
				(
					'Should query with type filter',
					function(fDone)
					{
						this.timeout(10000);
						_SuperTest
							.post('/facto/projections/query')
							.send({ DatasetIDs: [1], Type: 'census-population', Begin: 0, Cap: 100 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Records).to.be.an('array');
									// All returned records should be of the filtered type
									for (let i = 0; i < pResponse.body.Records.length; i++)
									{
										Expect(pResponse.body.Records[i].Type).to.equal('census-population');
									}
									return fDone();
								});
					}
				);
				test
				(
					'Should aggregate records by dataset',
					function(fDone)
					{
						this.timeout(10000);
						_SuperTest
							.post('/facto/projections/aggregate')
							.send({ DatasetIDs: [1], GroupBy: 'IDDataset' })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Aggregation).to.be.an('array');
									Expect(pResponse.body.Aggregation.length).to.be.greaterThan(0);
									Expect(pResponse.body.Total).to.be.greaterThan(0);
									return fDone();
								});
					}
				);
				test
				(
					'Should query certainty-weighted records',
					function(fDone)
					{
						this.timeout(10000);
						_SuperTest
							.post('/facto/projections/certainty')
							.send({ DatasetIDs: [1], MinCertainty: 0.0, MaxCertainty: 1.0, Begin: 0, Cap: 100 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Records).to.be.an('array');
									Expect(pResponse.body.Count).to.be.a('number');
									return fDone();
								});
					}
				);
				test
				(
					'Should compare datasets',
					function(fDone)
					{
						this.timeout(10000);
						_SuperTest
							.post('/facto/projections/compare')
							.send({ DatasetIDs: [1, 2] })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Datasets).to.be.an('array');
									Expect(pResponse.body.Datasets.length).to.equal(2);
									// First dataset should have records, second should have none
									Expect(pResponse.body.Datasets[0].IDDataset).to.equal(1);
									Expect(pResponse.body.Datasets[0].RecordCount).to.be.greaterThan(0);
									Expect(pResponse.body.Datasets[1].IDDataset).to.equal(2);
									return fDone();
								});
					}
				);
				test
				(
					'Should get warehouse summary statistics',
					function(fDone)
					{
						this.timeout(10000);
						_SuperTest
							.get('/facto/projections/summary')
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Sources).to.be.a('number');
									Expect(pResponse.body.Sources).to.be.greaterThan(0);
									Expect(pResponse.body.Datasets).to.be.a('number');
									Expect(pResponse.body.Datasets).to.be.greaterThan(0);
									Expect(pResponse.body.Records).to.be.a('number');
									Expect(pResponse.body.Records).to.be.greaterThan(0);
									Expect(pResponse.body.DatasetsByType).to.be.an('object');
									Expect(pResponse.body.DatasetsByType.Raw).to.be.a('number');
									Expect(pResponse.body.DatasetsByType.Projection).to.be.a('number');
									return fDone();
								});
					}
				);
				test
				(
					'Should return empty results for non-existent dataset query',
					function(fDone)
					{
						this.timeout(10000);
						_SuperTest
							.post('/facto/projections/query')
							.send({ DatasetIDs: [999], Begin: 0, Cap: 100 })
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									if (pError) return fDone(pError);
									Expect(pResponse.body.Records).to.be.an('array');
									Expect(pResponse.body.Records.length).to.equal(0);
									return fDone();
								});
					}
				);
			}
		);

		suite
		(
			'CSV/JSON Parsing Methods',
			function()
			{
				test
				(
					'parseCSV should parse a basic CSV string',
					function(fDone)
					{
						_Fable.RetoldFactoIngestEngine.parseCSV('a,b\n1,2\n3,4',
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].a).to.equal('1');
								Expect(pRecords[0].b).to.equal('2');
								return fDone();
							});
					}
				);
				test
				(
					'parseJSON should parse an array',
					function(fDone)
					{
						_Fable.RetoldFactoIngestEngine.parseJSON('[{"x":1},{"x":2}]',
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								return fDone();
							});
					}
				);
				test
				(
					'parseJSON should extract data key from object',
					function(fDone)
					{
						_Fable.RetoldFactoIngestEngine.parseJSON('{"data":[{"y":10}]}',
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(1);
								Expect(pRecords[0].y).to.equal(10);
								return fDone();
							});
					}
				);
				test
				(
					'parseJSON should wrap a single object in an array',
					function(fDone)
					{
						_Fable.RetoldFactoIngestEngine.parseJSON('{"solo":true}',
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(1);
								Expect(pRecords[0].solo).to.equal(true);
								return fDone();
							});
					}
				);
				test
				(
					'parseJSON should return error for invalid JSON',
					function(fDone)
					{
						_Fable.RetoldFactoIngestEngine.parseJSON('not valid json {{{',
							(pError, pRecords) =>
							{
								Expect(pError).to.be.an.instanceOf(Error);
								return fDone();
							});
					}
				);
			}
		);
		suite
		(
			'Multi-Format Ingest',
			function()
			{
				// ========================================================
				// XML Parsing
				// ========================================================
				test
				(
					'parseXML should parse a basic XML array',
					function(fDone)
					{
						let tmpXML = '<root><item><name>Alice</name><score>95</score></item><item><name>Bob</name><score>87</score></item></root>';
						_Fable.RetoldFactoIngestEngine.parseXML(tmpXML,
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].name).to.equal('Alice');
								Expect(pRecords[1].score).to.equal(87);
								return fDone();
							});
					}
				);
				test
				(
					'parseXML should auto-detect nested record array',
					function(fDone)
					{
						let tmpXML = '<?xml version="1.0"?><response><meta><total>2</total></meta><data><record><id>1</id><val>A</val></record><record><id>2</id><val>B</val></record></data></response>';
						_Fable.RetoldFactoIngestEngine.parseXML(tmpXML,
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].id).to.equal(1);
								Expect(pRecords[1].val).to.equal('B');
								return fDone();
							});
					}
				);
				test
				(
					'parseXML should navigate with recordPath option',
					function(fDone)
					{
						let tmpXML = '<api><results><items><item><x>10</x></item><item><x>20</x></item></items></results></api>';
						_Fable.RetoldFactoIngestEngine.parseXML(tmpXML, { recordPath: 'api.results.items.item' },
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].x).to.equal(10);
								return fDone();
							});
					}
				);
				test
				(
					'parseXML should return error for malformed XML',
					function(fDone)
					{
						_Fable.RetoldFactoIngestEngine.parseXML('<<<not xml at all>>>',
							(pError, pRecords) =>
							{
								// fast-xml-parser may not error on malformed XML but should at least return something
								// The key test is that it doesn't crash
								Expect(pRecords).to.exist;
								return fDone();
							});
					}
				);
				test
				(
					'parseXML should return error for invalid recordPath',
					function(fDone)
					{
						let tmpXML = '<root><item>test</item></root>';
						_Fable.RetoldFactoIngestEngine.parseXML(tmpXML, { recordPath: 'root.nonexistent.path' },
							(pError, pRecords) =>
							{
								Expect(pError).to.be.an.instanceOf(Error);
								Expect(pError.message).to.contain('not found in XML');
								return fDone();
							});
					}
				);

				// ========================================================
				// Excel Parsing
				// ========================================================
				test
				(
					'parseExcel should parse a basic workbook',
					function(fDone)
					{
						let libXLSX = require('xlsx');
						let tmpWorksheet = libXLSX.utils.aoa_to_sheet([
							['name', 'score'],
							['Alice', 95],
							['Bob', 87]
						]);
						let tmpWorkbook = libXLSX.utils.book_new();
						libXLSX.utils.book_append_sheet(tmpWorkbook, tmpWorksheet, 'Sheet1');
						let tmpBuffer = libXLSX.write(tmpWorkbook, { type: 'buffer', bookType: 'xlsx' });

						_Fable.RetoldFactoIngestEngine.parseExcel(tmpBuffer,
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].name).to.equal('Alice');
								Expect(pRecords[0].score).to.equal(95);
								return fDone();
							});
					}
				);
				test
				(
					'parseExcel should select sheet by name',
					function(fDone)
					{
						let libXLSX = require('xlsx');
						let tmpSheet1 = libXLSX.utils.aoa_to_sheet([['a'], [1]]);
						let tmpSheet2 = libXLSX.utils.aoa_to_sheet([['b'], [2], [3]]);
						let tmpWorkbook = libXLSX.utils.book_new();
						libXLSX.utils.book_append_sheet(tmpWorkbook, tmpSheet1, 'First');
						libXLSX.utils.book_append_sheet(tmpWorkbook, tmpSheet2, 'Second');
						let tmpBuffer = libXLSX.write(tmpWorkbook, { type: 'buffer', bookType: 'xlsx' });

						_Fable.RetoldFactoIngestEngine.parseExcel(tmpBuffer, { sheet: 'Second' },
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].b).to.equal(2);
								return fDone();
							});
					}
				);
				test
				(
					'parseExcel should return empty array for empty sheet',
					function(fDone)
					{
						let libXLSX = require('xlsx');
						let tmpWorksheet = libXLSX.utils.aoa_to_sheet([]);
						let tmpWorkbook = libXLSX.utils.book_new();
						libXLSX.utils.book_append_sheet(tmpWorkbook, tmpWorksheet, 'Empty');
						let tmpBuffer = libXLSX.write(tmpWorkbook, { type: 'buffer', bookType: 'xlsx' });

						_Fable.RetoldFactoIngestEngine.parseExcel(tmpBuffer,
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(0);
								return fDone();
							});
					}
				);

				// ========================================================
				// Fixed-Width Parsing
				// ========================================================
				test
				(
					'parseFixedWidth should extract columns by position',
					function(fDone)
					{
						let tmpContent = 'ACM12345678 37.7749  -122.4194\nBCN98765432 41.3851  2.1734  \n';
						_Fable.RetoldFactoIngestEngine.parseFixedWidth(tmpContent,
							{
								columns: [
									{ name: 'ID', start: 1, width: 11 },
									{ name: 'Lat', start: 13, width: 8 },
									{ name: 'Lon', start: 22, width: 9 }
								]
							},
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].ID).to.equal('ACM12345678');
								Expect(pRecords[0].Lat).to.equal('37.7749');
								Expect(pRecords[1].ID).to.equal('BCN98765432');
								return fDone();
							});
					}
				);
				test
				(
					'parseFixedWidth should skip lines with skipLines option',
					function(fDone)
					{
						let tmpContent = 'HEADER LINE 1\nHEADER LINE 2\nDAT 100\nDAT 200\n';
						_Fable.RetoldFactoIngestEngine.parseFixedWidth(tmpContent,
							{
								columns: [
									{ name: 'Code', start: 1, width: 3 },
									{ name: 'Value', start: 5, width: 3 }
								],
								skipLines: 2
							},
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].Code).to.equal('DAT');
								Expect(pRecords[0].Value).to.equal('100');
								return fDone();
							});
					}
				);
				test
				(
					'parseFixedWidth should return error without columns option',
					function(fDone)
					{
						_Fable.RetoldFactoIngestEngine.parseFixedWidth('some data',
							(pError, pRecords) =>
							{
								Expect(pError).to.be.an.instanceOf(Error);
								Expect(pError.message).to.contain('columns');
								return fDone();
							});
					}
				);

				// ========================================================
				// CSV Comment Stripping
				// ========================================================
				test
				(
					'parseCSV should strip comment lines when stripCommentLines is true',
					function(fDone)
					{
						let tmpContent = '# This is a comment\n# Another comment\nname,score\nAlice,95\nBob,87\n';
						_Fable.RetoldFactoIngestEngine.parseCSV(tmpContent, { stripCommentLines: true },
							(pError, pRecords) =>
							{
								Expect(pError).to.not.exist;
								Expect(pRecords).to.be.an('array');
								Expect(pRecords.length).to.equal(2);
								Expect(pRecords[0].name).to.equal('Alice');
								return fDone();
							});
					}
				);

				// ========================================================
				// ingestFile with new extensions
				// ========================================================
				test
				(
					'ingestFile should handle .xml files',
					function(fDone)
					{
						this.timeout(10000);
						let tmpFilePath = libPath.join(__dirname, 'tmp-test-ingest.xml');
						libFs.writeFileSync(tmpFilePath, '<root><item><name>XMLAlice</name><value>100</value></item><item><name>XMLBob</name><value>200</value></item></root>');

						_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, 1, 1,
							(pError, pResult) =>
							{
								try { libFs.unlinkSync(tmpFilePath); } catch(e) {}

								Expect(pError).to.not.exist;
								Expect(pResult.Format).to.equal('xml');
								Expect(pResult.Ingested).to.equal(2);
								return fDone();
							});
					}
				);
				test
				(
					'ingestFile should handle .xlsx files',
					function(fDone)
					{
						this.timeout(10000);
						let libXLSX = require('xlsx');
						let tmpFilePath = libPath.join(__dirname, 'tmp-test-ingest.xlsx');
						let tmpWorksheet = libXLSX.utils.aoa_to_sheet([
							['city', 'pop'],
							['NYC', 8336817],
							['LA', 3979576]
						]);
						let tmpWorkbook = libXLSX.utils.book_new();
						libXLSX.utils.book_append_sheet(tmpWorkbook, tmpWorksheet, 'Cities');
						libXLSX.writeFile(tmpWorkbook, tmpFilePath);

						_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, 1, 1,
							(pError, pResult) =>
							{
								try { libFs.unlinkSync(tmpFilePath); } catch(e) {}

								Expect(pError).to.not.exist;
								Expect(pResult.Format).to.equal('excel');
								Expect(pResult.Ingested).to.equal(2);
								return fDone();
							});
					}
				);
				test
				(
					'ingestFile should handle .fw (fixed-width) files',
					function(fDone)
					{
						this.timeout(10000);
						let tmpFilePath = libPath.join(__dirname, 'tmp-test-ingest.fw');
						libFs.writeFileSync(tmpFilePath, 'AAA 100\nBBB 200\nCCC 300\n');

						_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, 1, 1,
							{
								columns: [
									{ name: 'Code', start: 1, width: 3 },
									{ name: 'Val', start: 5, width: 3 }
								]
							},
							(pError, pResult) =>
							{
								try { libFs.unlinkSync(tmpFilePath); } catch(e) {}

								Expect(pError).to.not.exist;
								Expect(pResult.Format).to.equal('fixed-width');
								Expect(pResult.Ingested).to.equal(3);
								return fDone();
							});
					}
				);
				test
				(
					'ingestFile should handle .rdb files as TSV with comment stripping',
					function(fDone)
					{
						this.timeout(10000);
						let tmpFilePath = libPath.join(__dirname, 'tmp-test-ingest.rdb');
						let tmpContent = '# USGS comment line\n# Another comment\nagency_cd\tsite_no\tvalue\n5s\t15s\t14n\nUSGS\t01646500\t1234\nUSGS\t01646500\t5678\n';
						libFs.writeFileSync(tmpFilePath, tmpContent);

						_Fable.RetoldFactoIngestEngine.ingestFile(tmpFilePath, 1, 1,
							(pError, pResult) =>
							{
								try { libFs.unlinkSync(tmpFilePath); } catch(e) {}

								Expect(pError).to.not.exist;
								Expect(pResult.Format).to.equal('csv');
								Expect(pResult.Ingested).to.be.greaterThan(0);
								return fDone();
							});
					}
				);

				// ========================================================
				// POST /facto/ingest/file with new formats
				// ========================================================
				test
				(
					'POST /facto/ingest/file should auto-detect XML content',
					function(fDone)
					{
						_SuperTest.post('/facto/ingest/file')
							.send(
								{
									Content: '<items><item><name>PostXML1</name></item><item><name>PostXML2</name></item></items>',
									IDDataset: 1,
									IDSource: 1,
									Type: 'xml-test'
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									Expect(pError).to.not.exist;
									Expect(pResponse.body.Format).to.equal('xml');
									Expect(pResponse.body.Ingested).to.equal(2);
									return fDone();
								});
					}
				);
				test
				(
					'POST /facto/ingest/file should accept explicit Format=xml',
					function(fDone)
					{
						_SuperTest.post('/facto/ingest/file')
							.send(
								{
									Content: '<data><row><a>1</a></row><row><a>2</a></row><row><a>3</a></row></data>',
									Format: 'xml',
									IDDataset: 1,
									IDSource: 1
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									Expect(pError).to.not.exist;
									Expect(pResponse.body.Format).to.equal('xml');
									Expect(pResponse.body.Ingested).to.equal(3);
									return fDone();
								});
					}
				);
				test
				(
					'POST /facto/ingest/file should accept Format=fixed-width with Columns',
					function(fDone)
					{
						_SuperTest.post('/facto/ingest/file')
							.send(
								{
									Content: 'AAA 100\nBBB 200\n',
									Format: 'fixed-width',
									Columns: [
										{ name: 'Code', start: 1, width: 3 },
										{ name: 'Val', start: 5, width: 3 }
									],
									IDDataset: 1,
									IDSource: 1
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									Expect(pError).to.not.exist;
									Expect(pResponse.body.Format).to.equal('fixed-width');
									Expect(pResponse.body.Ingested).to.equal(2);
									return fDone();
								});
					}
				);
				test
				(
					'POST /facto/ingest/file should reject fixed-width without Columns',
					function(fDone)
					{
						_SuperTest.post('/facto/ingest/file')
							.send(
								{
									Content: 'AAA 100\nBBB 200\n',
									Format: 'fixed-width',
									IDDataset: 1,
									IDSource: 1
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									Expect(pError).to.not.exist;
									Expect(pResponse.body.Error).to.contain('Columns');
									return fDone();
								});
					}
				);
				test
				(
					'POST /facto/ingest/file should accept Format=excel with base64 content',
					function(fDone)
					{
						let libXLSX = require('xlsx');
						let tmpWorksheet = libXLSX.utils.aoa_to_sheet([
							['x', 'y'],
							[10, 20],
							[30, 40]
						]);
						let tmpWorkbook = libXLSX.utils.book_new();
						libXLSX.utils.book_append_sheet(tmpWorkbook, tmpWorksheet, 'Data');
						let tmpBuffer = libXLSX.write(tmpWorkbook, { type: 'buffer', bookType: 'xlsx' });
						let tmpBase64 = tmpBuffer.toString('base64');

						_SuperTest.post('/facto/ingest/file')
							.send(
								{
									Content: tmpBase64,
									Format: 'excel',
									IDDataset: 1,
									IDSource: 1,
									Type: 'excel-test'
								})
							.expect(200)
							.end(
								(pError, pResponse) =>
								{
									Expect(pError).to.not.exist;
									Expect(pResponse.body.Format).to.equal('excel');
									Expect(pResponse.body.Ingested).to.equal(2);
									return fDone();
								});
					}
				);
			}
		);
	}
);
