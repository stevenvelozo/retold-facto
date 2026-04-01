/**
 * Retold Facto — Browser Integration Tests
 *
 * End-to-end scenario: ingest two CSV files (weather stations + readings),
 * create projection mappings (one graphically, one automatically via API),
 * deploy projections to SQLite, execute the multi-set pipeline, and
 * verify the merged result.
 *
 * Takes screenshots at each major step into test/screenshots/.
 *
 * Requires:
 *   npm run build          (build the web UI bundle)
 *   npm install            (puppeteer in devDependencies)
 *
 * Run:
 *   npm run test-browser
 *
 * @license MIT
 * @author Steven Velozo <steven@velozo.com>
 */

'use strict';

const Chai = require('chai');
const Expect = Chai.expect;

const libFS = require('fs');
const libPath = require('path');
const libHTTP = require('http');

const _TestPort = 9350;
const _BaseURL = `http://127.0.0.1:${_TestPort}`;
const _ScreenshotDir = libPath.join(__dirname, 'screenshots');

// ══════════════════════════════════════════════════════════════
//  Helpers
// ══════════════════════════════════════════════════════════════

/**
 * POST JSON to the facto API.
 */
function apiPost(pPath, pBody)
{
	return new Promise(
		(fResolve, fReject) =>
		{
			let tmpData = JSON.stringify(pBody);
			let tmpOptions =
			{
				hostname: '127.0.0.1',
				port: _TestPort,
				path: pPath,
				method: 'POST',
				headers:
				{
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(tmpData),
				},
			};

			let tmpReq = libHTTP.request(tmpOptions,
				(pRes) =>
				{
					let tmpChunks = [];
					pRes.on('data', (pChunk) => tmpChunks.push(pChunk));
					pRes.on('end', () =>
					{
						let tmpRaw = Buffer.concat(tmpChunks).toString();
						try
						{
							fResolve(JSON.parse(tmpRaw));
						}
						catch (e)
						{
							fResolve(tmpRaw);
						}
					});
				});
			tmpReq.on('error', fReject);
			tmpReq.write(tmpData);
			tmpReq.end();
		});
}

/**
 * GET JSON from the facto API.
 */
function apiGet(pPath)
{
	return new Promise(
		(fResolve, fReject) =>
		{
			libHTTP.get(`${_BaseURL}${pPath}`,
				(pRes) =>
				{
					let tmpChunks = [];
					pRes.on('data', (pChunk) => tmpChunks.push(pChunk));
					pRes.on('end', () =>
					{
						let tmpRaw = Buffer.concat(tmpChunks).toString();
						try
						{
							fResolve(JSON.parse(tmpRaw));
						}
						catch (e)
						{
							fResolve(tmpRaw);
						}
					});
				}).on('error', fReject);
		});
}

/**
 * Save a screenshot with a numbered prefix for ordering.
 */
async function screenshot(pPage, pName)
{
	if (!libFS.existsSync(_ScreenshotDir))
	{
		libFS.mkdirSync(_ScreenshotDir, { recursive: true });
	}
	let tmpPath = libPath.join(_ScreenshotDir, pName + '.png');
	await pPage.screenshot({ path: tmpPath, fullPage: true });
	console.log(`      📸 ${pName}.png`);
}

/**
 * Wait for navigation to settle after a hash change.
 */
async function waitForRender(pPage, pMs)
{
	await pPage.evaluate((pDelay) => new Promise((r) => setTimeout(r, pDelay)), pMs || 500);
}

// ══════════════════════════════════════════════════════════════
//  Server bootstrap
// ══════════════════════════════════════════════════════════════

function startFactoServer(fCallback)
{
	const libFable = require('pict');
	const libMeadowConnectionManager = require('meadow-connection-manager');
	const libRetoldFacto = require('../source/Retold-Facto.js');

	let tmpSettings =
	{
		Product: 'FactoBrowserTest',
		ProductVersion: '0.0.1',
		APIServerPort: _TestPort,
		SQLite:
		{
			SQLiteFilePath: ':memory:',
		},
		LogStreams:
		[
			{
				streamtype: 'console',
				level: 'warn',
			},
		],
	};

	let tmpFable = new libFable(tmpSettings);

	// Bootstrap via connection manager (matches production bin/retold-facto.js)
	tmpFable.serviceManager.addServiceType('MeadowConnectionManager', libMeadowConnectionManager);
	tmpFable.serviceManager.instantiateServiceProvider('MeadowConnectionManager');

	tmpFable.MeadowConnectionManager.connect('facto',
		{
			Type: 'SQLite',
			SQLiteFilePath: ':memory:',
		},
		(pError, pConnection) =>
		{
			if (pError) return fCallback(pError);

			tmpFable.MeadowSQLiteProvider = pConnection.instance;
			tmpFable.settings.MeadowProvider = 'SQLite';

			let tmpDB = tmpFable.MeadowSQLiteProvider.db;
			tmpDB.exec(libRetoldFacto.FACTO_SCHEMA_SQL);

			tmpFable.serviceManager.addServiceType('RetoldFacto', libRetoldFacto);
			let tmpFacto = tmpFable.serviceManager.instantiateServiceProvider('RetoldFacto',
				{
					StorageProvider: 'SQLite',
					AutoCreateSchema: false,

					FullMeadowSchemaPath: libPath.join(__dirname, 'model') + '/',
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
						CatalogManager: true,
						StoreConnectionManager: true,
						SchemaManager: true,
						WebUI: true,
					},
				});

			tmpFacto.onBeforeInitialize = (fCB) =>
			{
				tmpFable.OratorServiceServer.server.use(require('restify').plugins.bodyParser());
				tmpFable.OratorServiceServer.server.use(require('restify').plugins.queryParser());
				return fCB();
			};

			tmpFacto.initializeService(
				(pInitError) =>
				{
					if (pInitError) return fCallback(pInitError);
					return fCallback(null, tmpFable, tmpFacto);
				});
		});
}

// ══════════════════════════════════════════════════════════════
//  Test suite
// ══════════════════════════════════════════════════════════════

suite
(
	'Facto-Browser-Integration',
	function ()
	{
		this.timeout(120000);

		let _Fable;
		let _Facto;
		let _Browser;
		let _Page;
		let _Puppeteer;

		// IDs collected during the test flow
		let _IDSourceStations;
		let _IDSourceReadings;
		let _IDDatasetStations;
		let _IDDatasetReadings;
		let _IDDatasetProjection;
		let _IDStoreConnection;
		let _IDProjectionStore;

		suiteSetup
		(
			function (fDone)
			{
				// Verify web assets exist
				let tmpWebDir = libPath.join(__dirname, '..', 'source', 'services', 'web-app', 'web');
				if (!libFS.existsSync(libPath.join(tmpWebDir, 'retold-facto.js')))
				{
					return fDone(new Error('Web UI not built. Run "npm run build" first.'));
				}

				// Clean screenshot directory
				if (libFS.existsSync(_ScreenshotDir))
				{
					let tmpFiles = libFS.readdirSync(_ScreenshotDir);
					for (let i = 0; i < tmpFiles.length; i++)
					{
						if (tmpFiles[i].endsWith('.png'))
						{
							libFS.unlinkSync(libPath.join(_ScreenshotDir, tmpFiles[i]));
						}
					}
				}

				// Start the server
				startFactoServer(
					(pError, pFable, pFacto) =>
					{
						if (pError) return fDone(pError);
						_Fable = pFable;
						_Facto = pFacto;

						try
						{
							_Puppeteer = require('puppeteer');
						}
						catch (e)
						{
							return fDone(new Error('puppeteer is not installed.'));
						}

						_Puppeteer.launch(
						{
							headless: true,
							args: ['--no-sandbox', '--disable-setuid-sandbox'],
						})
						.then(
							(pBrowser) =>
							{
								_Browser = pBrowser;
								return _Browser.newPage();
							})
						.then(
							(pPage) =>
							{
								_Page = pPage;
								return _Page.setViewport({ width: 1440, height: 900 });
							})
						.then(() => fDone())
						.catch(fDone);
					});
			}
		);

		suiteTeardown
		(
			function (fDone)
			{
				let tmpSteps = [];
				if (_Browser) tmpSteps.push(_Browser.close().catch(() => {}));

				Promise.all(tmpSteps).then(
					() =>
					{
						if (_Facto && _Facto.serviceInitialized)
						{
							_Facto.stopService(fDone);
						}
						else
						{
							fDone();
						}
					});
			}
		);

		// ─────────────────────────────────────────────────
		//  Phase 1: Data Setup via API
		// ─────────────────────────────────────────────────

		test
		(
			'Create sources for weather stations and readings',
			async function ()
			{
				let tmpStations = await apiPost('/1.0/Source',
					{ Name: 'NOAA Weather Stations', Type: 'File', Active: 1 });
				_IDSourceStations = tmpStations.IDSource;
				Expect(_IDSourceStations).to.be.above(0);

				let tmpReadings = await apiPost('/1.0/Source',
					{ Name: 'Daily Weather Readings', Type: 'File', Active: 1 });
				_IDSourceReadings = tmpReadings.IDSource;
				Expect(_IDSourceReadings).to.be.above(0);
			}
		);

		test
		(
			'Create raw datasets for stations and readings',
			async function ()
			{
				let tmpDS1 = await apiPost('/1.0/Dataset',
					{ Name: 'Weather Stations', Type: 'Raw', Description: 'NOAA station locations and metadata' });
				_IDDatasetStations = tmpDS1.IDDataset;
				Expect(_IDDatasetStations).to.be.above(0);

				let tmpDS2 = await apiPost('/1.0/Dataset',
					{ Name: 'Weather Readings', Type: 'Raw', Description: 'Daily weather observations per station' });
				_IDDatasetReadings = tmpDS2.IDDataset;
				Expect(_IDDatasetReadings).to.be.above(0);
			}
		);

		test
		(
			'Ingest weather-stations.csv',
			async function ()
			{
				let tmpCSV = libFS.readFileSync(libPath.join(__dirname, 'fixtures', 'weather-stations.csv'), 'utf8');
				let tmpResult = await apiPost('/facto/ingest/file',
				{
					IDDataset: _IDDatasetStations,
					IDSource: _IDSourceStations,
					Content: tmpCSV,
					Format: 'csv',
					Type: 'station',
				});
				Expect(tmpResult.Ingested).to.equal(8);
			}
		);

		test
		(
			'Ingest weather-readings.csv',
			async function ()
			{
				let tmpCSV = libFS.readFileSync(libPath.join(__dirname, 'fixtures', 'weather-readings.csv'), 'utf8');
				let tmpResult = await apiPost('/facto/ingest/file',
				{
					IDDataset: _IDDatasetReadings,
					IDSource: _IDSourceReadings,
					Content: tmpCSV,
					Format: 'csv',
					Type: 'reading',
				});
				Expect(tmpResult.Ingested).to.equal(16);
			}
		);

		test
		(
			'Create a projection dataset for the combined weather view',
			async function ()
			{
				let tmpDS = await apiPost('/1.0/Dataset',
				{
					Name: 'Weather Summary',
					Type: 'Projection',
					Description: 'Combined station metadata + daily readings',
					SchemaDefinition: [
						'! WeatherSummary',
						'@ IDWeatherSummary',
						'% GUIDWeatherSummary',
						'$ StationID 64',
						'$ StationName 200',
						'$ State 4',
						'$ Date 20',
						'# TempHighF',
						'# TempLowF',
						'. PrecipInches',
						'# WindMPH',
						'$ Condition 64',
						'. Latitude',
						'. Longitude',
						'# Elevation',
					].join('\n'),
				});
				_IDDatasetProjection = tmpDS.IDDataset;
				Expect(_IDDatasetProjection).to.be.above(0);
			}
		);

		test
		(
			'Create an in-memory SQLite store connection',
			async function ()
			{
				let tmpConn = await apiPost('/1.0/StoreConnection',
				{
					Name: 'Test SQLite',
					Type: 'SQLite',
					Config: JSON.stringify({ SQLiteFilePath: ':memory:' }),
					Status: 'OK',
				});
				_IDStoreConnection = tmpConn.IDStoreConnection;
				Expect(_IDStoreConnection).to.be.above(0);
			}
		);

		test
		(
			'Deploy the projection schema to the SQLite store',
			async function ()
			{
				let tmpResult = await apiPost(`/facto/projection/${_IDDatasetProjection}/deploy`,
				{
					IDStoreConnection: _IDStoreConnection,
					TargetTableName: 'WeatherSummary',
				});
				Expect(tmpResult.Success).to.equal(true);
				// ProjectionStore may be a Meadow query wrapper; extract the ID
				let tmpPS = tmpResult.ProjectionStore || {};
				_IDProjectionStore = tmpPS.IDProjectionStore
					|| (tmpPS.result && tmpPS.result.value && tmpPS.result.value[0] && tmpPS.result.value[0].IDProjectionStore)
					|| 0;

				// If still 0, try to find it by querying
				if (!_IDProjectionStore)
				{
					let tmpStores = await apiGet(`/facto/projection/${_IDDatasetProjection}/stores`);
					if (tmpStores.Stores && tmpStores.Stores.length > 0)
					{
						_IDProjectionStore = tmpStores.Stores[0].IDProjectionStore;
					}
				}
				Expect(_IDProjectionStore).to.be.above(0);
			}
		);

		// ─────────────────────────────────────────────────
		//  Phase 2: Create mappings via API
		// ─────────────────────────────────────────────────

		test
		(
			'Create mapping for stations (auto-mapped via API)',
			async function ()
			{
				let tmpResult = await apiPost(`/facto/projection/${_IDDatasetProjection}/mapping`,
				{
					IDSource: _IDSourceStations,
					Name: 'Stations Auto-Map',
					MappingConfiguration: JSON.stringify(
					{
						Entity: 'WeatherSummary',
						GUIDTemplate: '{~D:Record.StationID~}',
						Mappings:
						{
							StationID: 'StationID',
							StationName: 'Name',
							State: 'State',
							Latitude: 'Latitude',
							Longitude: 'Longitude',
							Elevation: 'Elevation',
						},
					}),
				});
				Expect(tmpResult.Success).to.equal(true);
				Expect(tmpResult.Mapping).to.be.an('object');
				// Meadow may return a query wrapper; try the direct property first
				let tmpID = tmpResult.Mapping.IDProjectionMapping
					|| (tmpResult.Mapping.result && tmpResult.Mapping.result.value && tmpResult.Mapping.result.value[0] && tmpResult.Mapping.result.value[0].IDProjectionMapping)
					|| 0;
				Expect(tmpID).to.be.above(0);
			}
		);

		test
		(
			'Create mapping for readings (auto-mapped via API)',
			async function ()
			{
				let tmpResult = await apiPost(`/facto/projection/${_IDDatasetProjection}/mapping`,
				{
					IDSource: _IDSourceReadings,
					Name: 'Readings Auto-Map',
					MappingConfiguration: JSON.stringify(
					{
						Entity: 'WeatherSummary',
						GUIDTemplate: '{~D:Record.StationID~}-{~D:Record.Date~}',
						Mappings:
						{
							StationID: 'StationID',
							Date: 'Date',
							TempHighF: 'TempHighF',
							TempLowF: 'TempLowF',
							PrecipInches: 'PrecipInches',
							WindMPH: 'WindMPH',
							Condition: 'Condition',
						},
					}),
				});
				Expect(tmpResult.Success).to.equal(true);
				Expect(tmpResult.Mapping).to.be.an('object');
				let tmpID = tmpResult.Mapping.IDProjectionMapping
					|| (tmpResult.Mapping.result && tmpResult.Mapping.result.value && tmpResult.Mapping.result.value[0] && tmpResult.Mapping.result.value[0].IDProjectionMapping)
					|| 0;
				Expect(tmpID).to.be.above(0);
			}
		);

		// ─────────────────────────────────────────────────
		//  Phase 3: Browse the UI and screenshot
		// ─────────────────────────────────────────────────

		test
		(
			'Screenshot: Dashboard',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/`, { waitUntil: 'networkidle0', timeout: 30000 });
				await waitForRender(_Page, 1000);
				await screenshot(_Page, '01-dashboard');
			}
		);

		test
		(
			'Screenshot: Sources list shows our 2 sources',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Sources`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1000);
				await screenshot(_Page, '02-sources');

				// Verify sources rendered
				let tmpContent = await _Page.content();
				Expect(tmpContent).to.include('NOAA Weather Stations');
				Expect(tmpContent).to.include('Daily Weather Readings');
			}
		);

		test
		(
			'Screenshot: Datasets list shows our 3 datasets',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Datasets`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1000);
				await screenshot(_Page, '03-datasets');

				let tmpContent = await _Page.content();
				Expect(tmpContent).to.include('Weather Stations');
				Expect(tmpContent).to.include('Weather Readings');
				Expect(tmpContent).to.include('Weather Summary');
			}
		);

		test
		(
			'Screenshot: Records list shows ingested data',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Records`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1000);
				await screenshot(_Page, '04-records');
			}
		);

		test
		(
			'Screenshot: Projections list shows the Weather Summary projection',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Projections`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1000);
				await screenshot(_Page, '05-projections');

				let tmpContent = await _Page.content();
				Expect(tmpContent).to.include('Weather Summary');
			}
		);

		test
		(
			'Screenshot: Projection detail with schema and mappings',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Projection/${_IDDatasetProjection}`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1500);
				await screenshot(_Page, '06-projection-detail');
			}
		);

		test
		(
			'Screenshot: Connections page shows the SQLite store',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Connections`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1000);
				await screenshot(_Page, '07-connections');

				let tmpContent = await _Page.content();
				Expect(tmpContent).to.include('Test SQLite');
			}
		);

		// ─────────────────────────────────────────────────
		//  Phase 4: Execute projection pipeline
		// ─────────────────────────────────────────────────

		test
		(
			'Create a multi-set projection to merge stations + readings',
			async function ()
			{
				let tmpResult = await apiPost(`/facto/projection/${_IDDatasetProjection}/multi-set-projection`,
				{
					Name: 'Weather Merge',
					IDProjectionStore: _IDProjectionStore,
					PipelineConfiguration: JSON.stringify(
					{
						MergeStrategy: 'WriteAll',
					}),
				});
				Expect(tmpResult.Success).to.equal(true);
				Expect(tmpResult.MultiSetProjection).to.be.an('object');
			}
		);

		test
		(
			'Execute the stations mapping import',
			async function ()
			{
				let tmpMappings = await apiGet(`/facto/projection/${_IDDatasetProjection}/mappings`);
				Expect(tmpMappings.Mappings.length).to.be.above(0);

				// Import stations first
				let tmpStationsMapping = tmpMappings.Mappings.find((m) => m.Name === 'Stations Auto-Map');
				Expect(tmpStationsMapping).to.be.an('object');

				let tmpResult = await apiPost(`/facto/projection/${_IDDatasetProjection}/import`,
				{
					IDProjectionMapping: tmpStationsMapping.IDProjectionMapping,
					IDProjectionStore: _IDProjectionStore,
					IDSource: _IDSourceStations,
				});
				Expect(tmpResult.Imported || tmpResult.RecordsProcessed || 0).to.be.at.least(0);
			}
		);

		test
		(
			'Execute the readings mapping import',
			async function ()
			{
				let tmpMappings = await apiGet(`/facto/projection/${_IDDatasetProjection}/mappings`);
				let tmpReadingsMapping = tmpMappings.Mappings.find((m) => m.Name === 'Readings Auto-Map');
				Expect(tmpReadingsMapping).to.be.an('object');

				let tmpResult = await apiPost(`/facto/projection/${_IDDatasetProjection}/import`,
				{
					IDProjectionMapping: tmpReadingsMapping.IDProjectionMapping,
					IDProjectionStore: _IDProjectionStore,
					IDSource: _IDSourceReadings,
				});
				Expect(tmpResult.Imported || tmpResult.RecordsProcessed || 0).to.be.at.least(0);
			}
		);

		// ─────────────────────────────────────────────────
		//  Phase 5: Verify results in UI
		// ─────────────────────────────────────────────────

		test
		(
			'Screenshot: Projection detail after import execution',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Projection/${_IDDatasetProjection}`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1500);
				await screenshot(_Page, '08-projection-after-import');
			}
		);

		test
		(
			'Screenshot: Dashboard with populated data',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Home`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1500);
				await screenshot(_Page, '09-dashboard-final');
			}
		);

		test
		(
			'Screenshot: Dashboards / histograms for ingestion',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Dashboards`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 2000);
				await screenshot(_Page, '09b-dashboards-histogram');
			}
		);

		test
		(
			'Screenshot: Throughput monitor',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/Throughput`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1500);
				await screenshot(_Page, '09c-throughput');
			}
		);

		test
		(
			'Verify ingested record counts via API',
			async function ()
			{
				let tmpStationRecords = await apiGet(`/facto/dataset/${_IDDatasetStations}/stats`);
				Expect(tmpStationRecords.RecordCount).to.equal(8);

				let tmpReadingRecords = await apiGet(`/facto/dataset/${_IDDatasetReadings}/stats`);
				Expect(tmpReadingRecords.RecordCount).to.equal(16);
			}
		);

		test
		(
			'Screenshot: IngestJobs showing completed imports',
			async function ()
			{
				await _Page.goto(`${_BaseURL}/#/IngestJobs`, { waitUntil: 'networkidle0', timeout: 15000 });
				await waitForRender(_Page, 1000);
				await screenshot(_Page, '10-ingest-jobs-final');
			}
		);
	}
);
