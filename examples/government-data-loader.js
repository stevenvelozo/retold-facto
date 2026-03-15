#!/usr/bin/env node
/**
 * Retold Facto — Government Data Loader Example
 *
 * Downloads 6 real US government datasets spanning all supported
 * ingest formats (CSV, JSON, XML, TSV, Excel, Fixed-Width), creates
 * Source/Dataset/SourceDocumentation records, and ingests the data.
 *
 * Supports two modes:
 *   --port <port>   HTTP mode: exercises the Facto REST API against a running server
 *   --db <path>     Direct mode: creates a standalone SQLite database (default)
 *
 * Usage:
 *   node examples/government-data-loader.js --port 8386
 *   node examples/government-data-loader.js --db examples/facto-government-data.sqlite
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFs = require('fs');
const libPath = require('path');
const libHttp = require('http');
const libHttps = require('https');

// ================================================================
// Configuration
// ================================================================

let _DBPath = libPath.join(__dirname, 'facto-government-data.sqlite');
let _CLIPort = null;

// Parse CLI flags
let tmpArgs = process.argv.slice(2);
for (let i = 0; i < tmpArgs.length; i++)
{
	if ((tmpArgs[i] === '--db' || tmpArgs[i] === '-d') && tmpArgs[i + 1])
	{
		_DBPath = libPath.resolve(tmpArgs[i + 1]);
		i++;
	}
	else if ((tmpArgs[i] === '--port' || tmpArgs[i] === '-p') && tmpArgs[i + 1])
	{
		_CLIPort = parseInt(tmpArgs[i + 1], 10);
		i++;
	}
	else if (tmpArgs[i] === '--help' || tmpArgs[i] === '-h')
	{
		console.log('Retold Facto — Government Data Loader');
		console.log('');
		console.log('Usage:');
		console.log('  node examples/government-data-loader.js [options]');
		console.log('');
		console.log('Options:');
		console.log('  --port, -p <port>   HTTP mode: send data to a running Facto server');
		console.log('  --db, -d <path>     Direct mode: create a standalone SQLite database');
		console.log('                      (default: examples/facto-government-data.sqlite)');
		console.log('  --help, -h          Show this help message');
		console.log('');
		console.log('Examples:');
		console.log('  node examples/government-data-loader.js --port 8386');
		console.log('  node examples/government-data-loader.js --db /tmp/test.sqlite');
		process.exit(0);
	}
}

// ================================================================
// Dataset Definitions
// ================================================================

const GOVERNMENT_DATASETS = [
	{
		name: 'USGS Earthquakes (Past 7 Days)',
		sourceType: 'API',
		sourceURL: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.csv',
		agency: 'US Geological Survey',
		description: 'All earthquakes worldwide in the past 7 days, from the USGS Earthquake Hazards Program real-time feed.',
		format: 'csv',
		certainty: 0.95,
		documentation: [
			{
				Name: 'Data Source Information',
				DocumentType: 'Overview',
				Description: 'USGS Earthquake Hazards Program provides real-time earthquake data via GeoJSON, CSV, and KML feeds.',
				Content: 'Feed URL: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.csv\nUpdate Frequency: Every 5 minutes\nCoverage: Global\nFields: time, latitude, longitude, depth, mag, magType, nst, gap, dmin, rms, net, id, updated, place, type, horizontalError, depthError, magError, magNst, status, locationSource, magSource'
			},
			{
				Name: 'License',
				DocumentType: 'License',
				Description: 'USGS data is in the public domain.',
				Content: 'USGS-authored or produced data and information are in the public domain and may be used without restriction. https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits'
			}
		]
	},
	{
		name: 'Treasury Debt to the Penny',
		sourceType: 'API',
		sourceURL: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v2/accounting/od/debt_to_penny?page[size]=100&format=json',
		agency: 'US Treasury Department',
		description: 'Daily US national debt figures from the Treasury Fiscal Data API, showing total public debt outstanding.',
		format: 'json',
		certainty: 0.98,
		documentation: [
			{
				Name: 'API Documentation',
				DocumentType: 'Overview',
				Description: 'Treasury Fiscal Data API provides programmatic access to federal financial data.',
				Content: 'API Base: https://api.fiscaldata.treasury.gov/\nEndpoint: /services/api/fiscal_service/v2/accounting/od/debt_to_penny\nFormat: JSON (default), CSV, XML\nFields: record_date, debt_held_public_amt, intragov_hold_amt, tot_pub_debt_out_amt, src_line_nbr, record_fiscal_year, record_fiscal_quarter, record_calendar_year, record_calendar_quarter, record_calendar_month, record_calendar_day'
			},
			{
				Name: 'License',
				DocumentType: 'License',
				Description: 'US Government public domain data.',
				Content: 'Data published by the US Treasury is in the public domain and freely available for reuse.'
			}
		]
	},
	{
		name: 'Treasury Exchange Rates',
		sourceType: 'API',
		sourceURL: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/rates_of_exchange?page[size]=50&format=xml',
		agency: 'US Treasury Department',
		description: 'Foreign currency exchange rates published by the US Treasury, in XML format.',
		format: 'xml',
		certainty: 0.95,
		documentation: [
			{
				Name: 'API Documentation',
				DocumentType: 'Overview',
				Description: 'Treasury exchange rates used for federal government reporting of foreign currency transactions.',
				Content: 'API Base: https://api.fiscaldata.treasury.gov/\nEndpoint: /services/api/fiscal_service/v1/accounting/od/rates_of_exchange\nFormat: XML\nFields: record_date, country, currency, country_currency_desc, exchange_rate, effective_date, src_line_nbr, record_fiscal_year, record_fiscal_quarter, record_calendar_year, record_calendar_quarter, record_calendar_month, record_calendar_day'
			},
			{
				Name: 'License',
				DocumentType: 'License',
				Description: 'US Government public domain data.',
				Content: 'Exchange rates published by the Treasury are public domain data.'
			}
		]
	},
	{
		name: 'USGS Streamflow - Potomac River',
		sourceType: 'API',
		sourceURL: 'https://waterservices.usgs.gov/nwis/iv/?format=rdb&sites=01646500&period=P1D&parameterCd=00060',
		agency: 'US Geological Survey',
		description: 'Real-time streamflow (discharge) data for the Potomac River at Little Falls, DC. Tab-delimited RDB format with comment headers.',
		format: 'tsv',
		certainty: 0.90,
		parseOptions: { delimiter: '\t', stripCommentLines: true },
		documentation: [
			{
				Name: 'Data Source Information',
				DocumentType: 'Overview',
				Description: 'USGS National Water Information System (NWIS) provides real-time water data from thousands of monitoring stations.',
				Content: 'Service URL: https://waterservices.usgs.gov/nwis/iv/\nFormat: RDB (tab-delimited with # comment lines)\nSite: 01646500 (Potomac River at Little Falls, Washington DC)\nParameter: 00060 (Discharge, cubic feet per second)\nPeriod: P1D (past 1 day)\nUpdate Frequency: Every 15 minutes'
			},
			{
				Name: 'License',
				DocumentType: 'License',
				Description: 'USGS data is in the public domain.',
				Content: 'All USGS data products are in the public domain.'
			}
		]
	},
	{
		name: 'BLS Consumer Price Index',
		sourceType: 'API',
		sourceURL: 'https://api.bls.gov/publicAPI/v2/timeseries/data/CUUR0000SA0',
		agency: 'Bureau of Labor Statistics',
		description: 'Consumer Price Index for All Urban Consumers (CPI-U), seasonally adjusted. Downloaded as JSON, converted to Excel for format demonstration.',
		format: 'excel',
		certainty: 0.97,
		documentation: [
			{
				Name: 'API Documentation',
				DocumentType: 'Overview',
				Description: 'BLS Public Data API provides access to economic time series data.',
				Content: 'API Base: https://api.bls.gov/publicAPI/v2/\nSeries: CUUR0000SA0 (CPI for All Urban Consumers, All items, US city average, Not seasonally adjusted)\nFormat: JSON\nFields: year, period, periodName, value, footnotes'
			},
			{
				Name: 'License',
				DocumentType: 'License',
				Description: 'BLS data is in the public domain.',
				Content: 'Bureau of Labor Statistics data are in the public domain and may be reproduced without permission.'
			}
		]
	},
	{
		name: 'NOAA Weather Station Inventory',
		sourceType: 'File',
		sourceURL: 'https://www.ncei.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt',
		agency: 'National Oceanic and Atmospheric Administration',
		description: 'Global Historical Climatology Network (GHCN) daily weather station inventory. Fixed-width format containing station IDs, locations, and metadata.',
		format: 'fixed-width',
		certainty: 0.92,
		parseOptions:
		{
			columns: [
				{ name: 'ID', start: 1, width: 11 },
				{ name: 'Latitude', start: 13, width: 8 },
				{ name: 'Longitude', start: 22, width: 9 },
				{ name: 'Elevation', start: 32, width: 6 },
				{ name: 'State', start: 39, width: 2 },
				{ name: 'Name', start: 42, width: 30 },
				{ name: 'GSNFlag', start: 73, width: 3 },
				{ name: 'HCNFlag', start: 77, width: 3 },
				{ name: 'WMOId', start: 81, width: 5 }
			]
		},
		// Limit to first 500 lines to keep example manageable
		maxLines: 500,
		documentation: [
			{
				Name: 'Data Source Information',
				DocumentType: 'Overview',
				Description: 'GHCN-Daily is the official archive of daily weather observations from land-based stations worldwide.',
				Content: 'File: ghcnd-stations.txt\nFormat: Fixed-width text\nColumns: ID (11), Latitude (8), Longitude (9), Elevation (6), State (2), Name (30), GSN Flag (3), HCN/CRN Flag (3), WMO ID (5)\nCoverage: Global (~120,000+ stations)\nSource: NOAA National Centers for Environmental Information'
			},
			{
				Name: 'License',
				DocumentType: 'License',
				Description: 'NOAA data is in the public domain.',
				Content: 'NOAA data are generally in the public domain and may be used freely.'
			},
			{
				Name: 'Data Dictionary',
				DocumentType: 'DataDictionary',
				Description: 'Column definitions for the GHCN station inventory file.',
				Content: 'ID: 11-char station identifier (country code + network code + station number)\nLatitude: Decimal degrees, positive=North\nLongitude: Decimal degrees, positive=East\nElevation: Meters above sea level\nState: US state abbreviation (blank for non-US)\nName: Station name\nGSN Flag: GSN (GCOS Surface Network) indicator\nHCN Flag: HCN (US Historical Climatology Network) or CRN indicator\nWMO ID: World Meteorological Organization station number'
			}
		]
	}
];

// ================================================================
// HTTPS Download Helper
// ================================================================

function downloadURL(pURL, fCallback)
{
	console.log(`    Downloading: ${pURL.substring(0, 80)}...`);

	let tmpRequest = libHttps.get(pURL,
		(pResponse) =>
		{
			// Follow redirects
			if (pResponse.statusCode >= 300 && pResponse.statusCode < 400 && pResponse.headers.location)
			{
				let tmpRedirectURL = pResponse.headers.location;
				if (!tmpRedirectURL.startsWith('http'))
				{
					let tmpParsedURL = new URL(pURL);
					tmpRedirectURL = tmpParsedURL.origin + tmpRedirectURL;
				}
				console.log(`    Redirecting to: ${tmpRedirectURL.substring(0, 80)}...`);
				return downloadURL(tmpRedirectURL, fCallback);
			}

			if (pResponse.statusCode !== 200)
			{
				return fCallback(new Error(`HTTP ${pResponse.statusCode} for ${pURL}`));
			}

			let tmpChunks = [];
			pResponse.on('data', (pChunk) => tmpChunks.push(pChunk));
			pResponse.on('end', () =>
			{
				let tmpBuffer = Buffer.concat(tmpChunks);
				return fCallback(null, tmpBuffer);
			});
			pResponse.on('error', (pError) => fCallback(pError));
		});

	tmpRequest.on('error', (pError) => fCallback(pError));
	tmpRequest.setTimeout(30000, () =>
	{
		tmpRequest.destroy();
		return fCallback(new Error(`Timeout downloading ${pURL}`));
	});
}

// ================================================================
// HTTP API Helpers (for HTTP mode)
// ================================================================

function httpRequest(pMethod, pPort, pPath, pBody, fCallback)
{
	let tmpBodyString = pBody ? JSON.stringify(pBody) : null;

	let tmpOptions =
	{
		hostname: 'localhost',
		port: pPort,
		path: pPath,
		method: pMethod,
		headers: { 'Content-Type': 'application/json' }
	};

	if (tmpBodyString)
	{
		tmpOptions.headers['Content-Length'] = Buffer.byteLength(tmpBodyString);
	}

	let tmpRequest = libHttp.request(tmpOptions,
		(pResponse) =>
		{
			let tmpChunks = [];
			pResponse.on('data', (pChunk) => tmpChunks.push(pChunk));
			pResponse.on('end', () =>
			{
				let tmpRaw = Buffer.concat(tmpChunks).toString('utf8');
				try
				{
					return fCallback(null, JSON.parse(tmpRaw));
				}
				catch (pParseError)
				{
					return fCallback(new Error(`Failed to parse response from ${pPath}: ${tmpRaw.substring(0, 200)}`));
				}
			});
			pResponse.on('error', (pError) => fCallback(pError));
		});

	tmpRequest.on('error', (pError) => fCallback(pError));
	tmpRequest.setTimeout(60000, () =>
	{
		tmpRequest.destroy();
		return fCallback(new Error(`Timeout on ${pMethod} ${pPath}`));
	});

	if (tmpBodyString)
	{
		tmpRequest.write(tmpBodyString);
	}
	tmpRequest.end();
}

function httpPost(pPort, pPath, pBody, fCallback)
{
	return httpRequest('POST', pPort, pPath, pBody, fCallback);
}

function httpPut(pPort, pPath, pBody, fCallback)
{
	return httpRequest('PUT', pPort, pPath, pBody, fCallback);
}

function httpGet(pPort, pPath, fCallback)
{
	return httpRequest('GET', pPort, pPath, null, fCallback);
}

// Track created Sources by agency name to avoid duplicates
let _SourcesByAgency = {};

// ================================================================
// Bootstrap
// ================================================================

console.log('==========================================================');
console.log('  Retold Facto — Government Data Loader');
console.log('==========================================================');

if (_CLIPort)
{
	console.log(`  Mode: HTTP (port ${_CLIPort})`);
	console.log('');

	// In HTTP mode, just start processing datasets immediately
	processAllDatasets(null, _CLIPort);
}
else
{
	console.log(`  Mode: Direct (SQLite)`);
	console.log(`  Database: ${_DBPath}`);
	console.log('');

	bootstrapDirect();
}

// ================================================================
// Direct-mode Bootstrap (SQLite + Fable)
// ================================================================

function bootstrapDirect()
{
	const libFable = require('fable');
	const libMeadowConnectionSQLite = require('meadow-connection-sqlite');
	const libRetoldFacto = require('../source/Retold-Facto.js');

	// Remove existing database so we start fresh
	if (libFs.existsSync(_DBPath))
	{
		libFs.unlinkSync(_DBPath);
	}

	// Ensure parent directory exists
	let tmpDbDir = libPath.dirname(_DBPath);
	if (!libFs.existsSync(tmpDbDir))
	{
		libFs.mkdirSync(tmpDbDir, { recursive: true });
	}

	let _Settings = (
		{
			Product: 'FactoGovLoader',
			ProductVersion: '0.0.1',
			APIServerPort: 0,
			LogStreams:
				[
					{
						streamtype: 'console',
						level: 'warn'
					}
				],
			SQLite:
				{
					SQLiteFilePath: _DBPath
				}
		});

	let _Fable = new libFable(_Settings);

	_Fable.serviceManager.addServiceType('MeadowSQLiteProvider', libMeadowConnectionSQLite);
	_Fable.serviceManager.instantiateServiceProvider('MeadowSQLiteProvider');

	_Fable.MeadowSQLiteProvider.connectAsync(
		(pConnectError) =>
		{
			if (pConnectError)
			{
				console.error(`SQLite connection error: ${pConnectError}`);
				process.exit(1);
			}

			_Fable.settings.MeadowProvider = 'SQLite';

			// Create schema
			_Fable.MeadowSQLiteProvider.db.exec(libRetoldFacto.FACTO_SCHEMA_SQL);
			console.log('  Schema created.');

			// Set up the Facto service (no web server needed)
			_Fable.serviceManager.addServiceType('RetoldFacto', libRetoldFacto);
			_Fable.serviceManager.instantiateServiceProvider('RetoldFacto',
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

			_Fable.RetoldFacto.initializeService(
				(pInitError) =>
				{
					if (pInitError)
					{
						console.error(`Initialization error: ${pInitError}`);
						process.exit(1);
					}

					console.log('  Facto service initialized.');
					console.log('');

					processAllDatasets(_Fable, null);
				});
		});
}

// ================================================================
// Agency-to-Source Mapping
// ================================================================

/**
 * Find or create a Source for a given agency.
 * In HTTP mode, queries the server first; in direct mode, checks our local map.
 */
function findOrCreateSource(pFable, pPort, pAgencyName, pSourceType, fCallback)
{
	let tmpIsHTTP = (pPort !== null);

	// Already created this agency's Source in this run?
	if (_SourcesByAgency[pAgencyName])
	{
		console.log(`    Source reused: #${_SourcesByAgency[pAgencyName]} (${pAgencyName})`);
		return fCallback(null, _SourcesByAgency[pAgencyName]);
	}

	let tmpSourceData =
	{
		Name: pAgencyName,
		Type: pSourceType,
		Protocol: 'HTTPS',
		Description: `Data source: ${pAgencyName}`,
		Active: 1
	};

	if (tmpIsHTTP)
	{
		// Check if source already exists on the server by name
		// Meadow FilteredTo: /1.0/{PluralEntity}/FilteredTo/FBV~Field~EQ~Value/Begin/Cap
		httpGet(pPort, `/1.0/Sources/FilteredTo/FBV~Name~EQ~${encodeURIComponent(pAgencyName)}/0/10`,
			(pError, pResult) =>
			{
				// Meadow doReads returns an array directly
				let tmpRecords = Array.isArray(pResult) ? pResult : [];
				if (tmpRecords.length > 0)
				{
					let tmpExistingID = tmpRecords[0].IDSource;
					_SourcesByAgency[pAgencyName] = tmpExistingID;
					console.log(`    Source found on server: #${tmpExistingID} (${pAgencyName})`);
					return fCallback(null, tmpExistingID);
				}

				// Create new source
				httpPost(pPort, '/1.0/Source', tmpSourceData,
					(pCreateError, pCreateResult) =>
					{
						if (pCreateError)
						{
							console.error(`    Error creating source: ${pCreateError.message}`);
							return fCallback(pCreateError);
						}
						let tmpNewID = pCreateResult.IDSource;
						_SourcesByAgency[pAgencyName] = tmpNewID;
						console.log(`    Source created: #${tmpNewID} (${pAgencyName})`);

						// Activate it
						httpPut(pPort, `/facto/source/${tmpNewID}/activate`, {},
							(pActivateError) =>
							{
								if (!pActivateError)
								{
									console.log(`    Source #${tmpNewID} activated`);
								}
								return fCallback(null, tmpNewID);
							});
					});
			});
	}
	else
	{
		let tmpQuery = pFable.DAL.Source.query.clone()
			.addRecord(tmpSourceData);

		pFable.DAL.Source.doCreate(tmpQuery,
			(pError, pQuery, pQueryRead, pRecord) =>
			{
				if (pError)
				{
					console.error(`    Error creating source: ${pError}`);
					return fCallback(pError);
				}
				let tmpNewID = pRecord.IDSource;
				_SourcesByAgency[pAgencyName] = tmpNewID;
				console.log(`    Source created: #${tmpNewID} (${pAgencyName})`);
				return fCallback(null, tmpNewID);
			});
	}
}

/**
 * Find or create a Dataset by name.
 * In HTTP mode, queries the server first; in direct mode, always creates.
 */
function findOrCreateDataset(pFable, pPort, pDatasetDef, fCallback)
{
	let tmpIsHTTP = (pPort !== null);
	let tmpDatasetData =
	{
		Name: pDatasetDef.name,
		Type: 'Raw',
		Description: pDatasetDef.description
	};

	if (tmpIsHTTP)
	{
		// Check if dataset already exists on the server by name
		// Meadow FilteredTo: /1.0/{PluralEntity}/FilteredTo/FBV~Field~EQ~Value/Begin/Cap
		httpGet(pPort, `/1.0/Datasets/FilteredTo/FBV~Name~EQ~${encodeURIComponent(pDatasetDef.name)}/0/10`,
			(pError, pResult) =>
			{
				let tmpRecords = Array.isArray(pResult) ? pResult : [];
				if (tmpRecords.length > 0)
				{
					let tmpExistingID = tmpRecords[0].IDDataset;
					console.log(`    Dataset found on server: #${tmpExistingID} (${pDatasetDef.name})`);
					return fCallback(null, tmpExistingID);
				}

				httpPost(pPort, '/1.0/Dataset', tmpDatasetData,
					(pCreateError, pCreateResult) =>
					{
						if (pCreateError)
						{
							console.error(`    Error creating dataset: ${pCreateError.message}`);
							return fCallback(pCreateError);
						}
						let tmpNewID = pCreateResult.IDDataset;
						console.log(`    Dataset created: #${tmpNewID}`);
						return fCallback(null, tmpNewID);
					});
			});
	}
	else
	{
		let tmpQuery = pFable.DAL.Dataset.query.clone()
			.addRecord(tmpDatasetData);

		pFable.DAL.Dataset.doCreate(tmpQuery,
			(pError, pQuery, pQueryRead, pRecord) =>
			{
				if (pError)
				{
					console.error(`    Error creating dataset: ${pError}`);
					return fCallback(pError);
				}
				console.log(`    Dataset created: #${pRecord.IDDataset}`);
				return fCallback(null, pRecord.IDDataset);
			});
	}
}

// ================================================================
// Dataset Processing Entry Point
// ================================================================

function processAllDatasets(pFable, pPort)
{
	// Reset agency tracking for this run
	_SourcesByAgency = {};

	processDataset(pFable, pPort, 0,
		(pError) =>
		{
			if (pError)
			{
				console.error(`\nError during processing: ${pError.message}`);
			}

			printSummary(pFable, pPort);
		});
}

// ================================================================
// Sequential Dataset Processing
// ================================================================

function processDataset(pFable, pPort, pIndex, fDone)
{
	if (pIndex >= GOVERNMENT_DATASETS.length)
	{
		return fDone();
	}

	let tmpDatasetDef = GOVERNMENT_DATASETS[pIndex];
	let tmpIsHTTP = (pPort !== null);

	console.log(`----------------------------------------------------------`);
	console.log(`  [${pIndex + 1}/${GOVERNMENT_DATASETS.length}] ${tmpDatasetDef.name}`);
	console.log(`  Format: ${tmpDatasetDef.format.toUpperCase()} | Agency: ${tmpDatasetDef.agency}`);
	console.log(`  Certainty: ${tmpDatasetDef.certainty}`);
	console.log('');

	let tmpSourceID = 0;
	let tmpDatasetID = 0;

	// Step chain — each step calls the next
	let tmpSteps = [];

	// Step 1: Find or Create Source (deduped by agency name)
	tmpSteps.push(
		(fStep) =>
		{
			findOrCreateSource(pFable, pPort, tmpDatasetDef.agency, tmpDatasetDef.sourceType,
				(pError, pSourceID) =>
				{
					if (!pError && pSourceID)
					{
						tmpSourceID = pSourceID;
					}
					return fStep();
				});
		});

	// Step 2: Find or Create Dataset (deduped by name in HTTP mode)
	tmpSteps.push(
		(fStep) =>
		{
			findOrCreateDataset(pFable, pPort, tmpDatasetDef,
				(pError, pDatasetID) =>
				{
					if (!pError && pDatasetID)
					{
						tmpDatasetID = pDatasetID;
					}
					return fStep();
				});
		});

	// Step 3: Set VersionPolicy on Dataset
	tmpSteps.push(
		(fStep) =>
		{
			if (!tmpDatasetID)
			{
				return fStep();
			}

			if (tmpIsHTTP)
			{
				httpPut(pPort, `/facto/dataset/${tmpDatasetID}/version-policy`,
					{ VersionPolicy: 'Append' },
					(pError) =>
					{
						if (!pError)
						{
							console.log(`    VersionPolicy set: Append`);
						}
						return fStep();
					});
			}
			else
			{
				// Direct mode: update the Dataset record
				let tmpQuery = pFable.DAL.Dataset.query.clone()
					.addRecord({ IDDataset: tmpDatasetID, VersionPolicy: 'Append' });

				pFable.DAL.Dataset.doUpdate(tmpQuery,
					(pError) =>
					{
						if (!pError)
						{
							console.log(`    VersionPolicy set: Append`);
						}
						return fStep();
					});
			}
		});

	// Step 4: Link Dataset to Source
	tmpSteps.push(
		(fStep) =>
		{
			if (!tmpSourceID || !tmpDatasetID)
			{
				return fStep();
			}

			if (tmpIsHTTP)
			{
				httpPost(pPort, `/facto/dataset/${tmpDatasetID}/source`,
					{
						IDSource: tmpSourceID,
						ReliabilityWeight: tmpDatasetDef.certainty
					},
					(pError, pResult) =>
					{
						if (pError)
						{
							console.error(`    Error linking source to dataset: ${pError.message}`);
						}
						else
						{
							console.log(`    DatasetSource linked (weight: ${tmpDatasetDef.certainty})`);
						}
						return fStep();
					});
			}
			else
			{
				let tmpQuery = pFable.DAL.DatasetSource.query.clone()
					.addRecord(
						{
							IDDataset: tmpDatasetID,
							IDSource: tmpSourceID,
							ReliabilityWeight: tmpDatasetDef.certainty
						});

				pFable.DAL.DatasetSource.doCreate(tmpQuery,
					(pError) =>
					{
						if (!pError)
						{
							console.log(`    DatasetSource linked (weight: ${tmpDatasetDef.certainty})`);
						}
						return fStep();
					});
			}
		});

	// Step 5: Create SourceDocumentation
	tmpSteps.push(
		(fStep) =>
		{
			if (!tmpSourceID || !tmpDatasetDef.documentation)
			{
				return fStep();
			}

			let tmpDocsRemaining = tmpDatasetDef.documentation.length;
			let tmpDocsCreated = 0;

			for (let d = 0; d < tmpDatasetDef.documentation.length; d++)
			{
				let tmpDoc = tmpDatasetDef.documentation[d];
				let tmpDocData =
				{
					IDSource: tmpSourceID,
					Name: tmpDoc.Name,
					DocumentType: tmpDoc.DocumentType,
					MimeType: 'text/plain',
					Description: tmpDoc.Description,
					Content: tmpDoc.Content
				};

				let tmpDocDone = () =>
				{
					tmpDocsCreated++;
					if (tmpDocsCreated >= tmpDocsRemaining)
					{
						console.log(`    Documentation created: ${tmpDocsRemaining} doc(s)`);
						return fStep();
					}
				};

				if (tmpIsHTTP)
				{
					httpPost(pPort, '/1.0/SourceDocumentation', tmpDocData,
						(pError) =>
						{
							return tmpDocDone();
						});
				}
				else
				{
					let tmpQuery = pFable.DAL.SourceDocumentation.query.clone()
						.addRecord(tmpDocData);

					pFable.DAL.SourceDocumentation.doCreate(tmpQuery,
						(pError) =>
						{
							return tmpDocDone();
						});
				}
			}
		});

	// Step 6: Download and Ingest
	tmpSteps.push(
		(fStep) =>
		{
			if (!tmpSourceID || !tmpDatasetID)
			{
				console.error('    Skipping ingest: no source/dataset ID.');
				return fStep();
			}

			downloadURL(tmpDatasetDef.sourceURL,
				(pDownloadError, pBuffer) =>
				{
					if (pDownloadError)
					{
						console.error(`    Download error: ${pDownloadError.message}`);
						return fStep();
					}

					console.log(`    Downloaded: ${pBuffer.length} bytes`);

					if (tmpIsHTTP)
					{
						ingestDataHTTP(pPort, tmpDatasetDef, pBuffer, tmpDatasetID, tmpSourceID,
							(pIngestError, pResult) =>
							{
								if (pIngestError)
								{
									console.error(`    Ingest error: ${pIngestError.message}`);
								}
								else if (pResult)
								{
									console.log(`    Ingested: ${pResult.Ingested} records (${pResult.Errors} errors)`);
									if (pResult.DatasetVersion)
									{
										console.log(`    Version: ${pResult.DatasetVersion} | Duplicate: ${pResult.IsDuplicate ? 'Yes' : 'No'}`);
									}
								}
								return fStep();
							});
					}
					else
					{
						ingestDataDirect(pFable, tmpDatasetDef, pBuffer, tmpDatasetID, tmpSourceID,
							(pIngestError, pResult) =>
							{
								if (pIngestError)
								{
									console.error(`    Ingest error: ${pIngestError.message}`);
								}
								else if (pResult)
								{
									console.log(`    Ingested: ${pResult.Ingested} records (${pResult.Errors} errors)`);
								}
								return fStep();
							});
					}
				});
		});

	// Step 7: Print per-dataset stats
	tmpSteps.push(
		(fStep) =>
		{
			if (!tmpSourceID || !tmpDatasetID)
			{
				return fStep();
			}

			if (tmpIsHTTP)
			{
				httpGet(pPort, `/facto/source/${tmpSourceID}/summary`,
					(pError, pSourceSummary) =>
					{
						if (!pError && pSourceSummary)
						{
							console.log(`    Source summary: ${pSourceSummary.RecordCount} records, ${pSourceSummary.DocumentationCount} docs`);
						}
						httpGet(pPort, `/facto/dataset/${tmpDatasetID}/stats`,
							(pError, pDatasetStats) =>
							{
								if (!pError && pDatasetStats)
								{
									console.log(`    Dataset stats: ${pDatasetStats.RecordCount} records, ${pDatasetStats.SourceCount} source(s)`);
								}
								return fStep();
							});
					});
			}
			else
			{
				// Direct mode: quick count for feedback
				let tmpQuery = pFable.DAL.Record.query.clone()
					.addFilter('IDDataset', tmpDatasetID)
					.addFilter('Deleted', 0);
				pFable.DAL.Record.doCount(tmpQuery,
					(pError, pQuery, pCount) =>
					{
						let tmpRecordCount = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
						console.log(`    Dataset #${tmpDatasetID}: ${tmpRecordCount} records stored`);
						return fStep();
					});
			}
		});

	// Run steps sequentially
	runStepChain(tmpSteps, 0,
		() =>
		{
			console.log('');
			processDataset(pFable, pPort, pIndex + 1, fDone);
		});
}

/**
 * Run an array of sequential step functions.
 */
function runStepChain(pSteps, pIndex, fDone)
{
	if (pIndex >= pSteps.length)
	{
		return fDone();
	}
	pSteps[pIndex](
		() =>
		{
			runStepChain(pSteps, pIndex + 1, fDone);
		});
}

// ================================================================
// Ingest: HTTP Mode (POST to /facto/ingest/file)
// ================================================================

function ingestDataHTTP(pPort, pDatasetDef, pBuffer, pIDDataset, pIDSource, fCallback)
{
	let tmpFormat = pDatasetDef.format;
	let tmpContent = pBuffer.toString('utf8');

	// Build the ingest request body
	let tmpBody =
	{
		IDDataset: pIDDataset,
		IDSource: pIDSource
	};

	switch (tmpFormat)
	{
		case 'csv':
			tmpBody.Format = 'csv';
			tmpBody.Content = tmpContent;
			break;

		case 'json':
			tmpBody.Format = 'json';
			tmpBody.Content = tmpContent;
			break;

		case 'xml':
			tmpBody.Format = 'xml';
			tmpBody.Content = tmpContent;
			break;

		case 'tsv':
			// Strip comment lines before sending, send as CSV with tab delimiter
			tmpBody.Format = 'csv';
			tmpBody.Content = tmpContent.split('\n')
				.filter((pLine) => !pLine.startsWith('#'))
				.join('\n');
			tmpBody.Delimiter = '\t';
			break;

		case 'excel':
			// Special: convert BLS JSON → Excel → base64 for ingest
			return ingestAsExcelHTTP(pPort, pDatasetDef, tmpContent, pIDDataset, pIDSource, fCallback);

		case 'fixed-width':
			tmpBody.Format = 'fixed-width';
			tmpBody.Content = tmpContent;
			if (pDatasetDef.parseOptions && pDatasetDef.parseOptions.columns)
			{
				tmpBody.Columns = pDatasetDef.parseOptions.columns;
			}
			// Apply maxLines limit by trimming content
			if (pDatasetDef.maxLines)
			{
				let tmpLines = tmpBody.Content.split('\n');
				if (tmpLines.length > pDatasetDef.maxLines)
				{
					tmpBody.Content = tmpLines.slice(0, pDatasetDef.maxLines).join('\n');
				}
			}
			break;

		default:
			return fCallback(new Error(`Unknown format: ${tmpFormat}`));
	}

	// Apply maxLines for non-fixed-width formats too
	if (tmpFormat !== 'fixed-width' && tmpFormat !== 'excel' && pDatasetDef.maxLines)
	{
		let tmpLines = tmpBody.Content.split('\n');
		if (tmpLines.length > pDatasetDef.maxLines + 1) // +1 for header
		{
			tmpBody.Content = tmpLines.slice(0, pDatasetDef.maxLines + 1).join('\n');
		}
	}

	httpPost(pPort, '/facto/ingest/file', tmpBody,
		(pError, pResult) =>
		{
			if (pError)
			{
				return fCallback(pError);
			}
			if (pResult && pResult.Error)
			{
				return fCallback(new Error(pResult.Error));
			}
			return fCallback(null,
				{
					Ingested: (pResult && pResult.Ingested) || 0,
					Errors: (pResult && pResult.Errors) || 0,
					Total: (pResult && pResult.Total) || 0,
					DatasetVersion: pResult && pResult.DatasetVersion,
					IsDuplicate: pResult && pResult.IsDuplicate,
					ContentSignature: pResult && pResult.ContentSignature
				});
		});
}

/**
 * For the Excel format demo in HTTP mode: parse the BLS JSON response,
 * write to a temporary .xlsx file, base64-encode it, and POST to the
 * /facto/ingest/file endpoint.
 */
function ingestAsExcelHTTP(pPort, pDatasetDef, pContent, pIDDataset, pIDSource, fCallback)
{
	try
	{
		let libXLSX = require('xlsx');
		let tmpJSON = JSON.parse(pContent);

		// BLS API returns { Results: { series: [ { data: [...] } ] } }
		let tmpRecords = [];
		if (tmpJSON.Results && tmpJSON.Results.series)
		{
			for (let s = 0; s < tmpJSON.Results.series.length; s++)
			{
				let tmpSeries = tmpJSON.Results.series[s];
				if (tmpSeries.data && Array.isArray(tmpSeries.data))
				{
					tmpRecords = tmpRecords.concat(tmpSeries.data);
				}
			}
		}

		if (tmpRecords.length === 0)
		{
			console.log('    BLS: No CPI data records found in response.');
			return fCallback(null, { Ingested: 0, Errors: 0, Total: 0 });
		}

		console.log(`    BLS: Converting ${tmpRecords.length} records to Excel...`);

		// Write to buffer
		let tmpWorksheet = libXLSX.utils.json_to_sheet(tmpRecords);
		let tmpWorkbook = libXLSX.utils.book_new();
		libXLSX.utils.book_append_sheet(tmpWorkbook, tmpWorksheet, 'CPI Data');
		let tmpExcelBuffer = libXLSX.write(tmpWorkbook, { type: 'buffer', bookType: 'xlsx' });

		console.log(`    BLS: Excel buffer ${tmpExcelBuffer.length} bytes, sending as base64...`);

		let tmpBody =
		{
			IDDataset: pIDDataset,
			IDSource: pIDSource,
			Format: 'excel',
			Content: tmpExcelBuffer.toString('base64')
		};

		httpPost(pPort, '/facto/ingest/file', tmpBody,
			(pError, pResult) =>
			{
				if (pError)
				{
					return fCallback(pError);
				}
				if (pResult && pResult.Error)
				{
					return fCallback(new Error(pResult.Error));
				}
				return fCallback(null,
					{
						Ingested: (pResult && pResult.Ingested) || 0,
						Errors: (pResult && pResult.Errors) || 0,
						Total: (pResult && pResult.Total) || 0,
						DatasetVersion: pResult && pResult.DatasetVersion,
						IsDuplicate: pResult && pResult.IsDuplicate,
						ContentSignature: pResult && pResult.ContentSignature
					});
			});
	}
	catch (pError)
	{
		return fCallback(pError);
	}
}

// ================================================================
// Ingest: Direct Mode (parse + DAL)
// ================================================================

function ingestDataDirect(pFable, pDatasetDef, pBuffer, pIDDataset, pIDSource, fCallback)
{
	let tmpIngestEngine = pFable.RetoldFactoIngestEngine;
	let tmpFormat = pDatasetDef.format;
	let tmpCertainty = pDatasetDef.certainty;
	let tmpContent = pBuffer.toString('utf8');

	let tmpParseCallback = (pParseError, pParsedRecords) =>
	{
		if (pParseError)
		{
			return fCallback(pParseError);
		}

		if (!pParsedRecords || pParsedRecords.length === 0)
		{
			return fCallback(null, { Ingested: 0, Errors: 0, Total: 0 });
		}

		// Limit records if specified
		if (pDatasetDef.maxLines && pParsedRecords.length > pDatasetDef.maxLines)
		{
			pParsedRecords = pParsedRecords.slice(0, pDatasetDef.maxLines);
		}

		console.log(`    Parsed: ${pParsedRecords.length} records`);

		// Ingest records sequentially
		let tmpIngested = 0;
		let tmpErrors = 0;

		let tmpIngestRecord = (pRecordIndex) =>
		{
			if (pRecordIndex >= pParsedRecords.length)
			{
				return fCallback(null,
					{
						Ingested: tmpIngested,
						Errors: tmpErrors,
						Total: pParsedRecords.length
					});
			}

			let tmpRowData = pParsedRecords[pRecordIndex];
			let tmpRecordData = {
				IDDataset: pIDDataset,
				IDSource: pIDSource,
				Type: `gov-${tmpFormat}`,
				Version: 1,
				IngestDate: new Date().toISOString(),
				Content: (typeof tmpRowData === 'string') ? tmpRowData : JSON.stringify(tmpRowData)
			};

			let tmpQuery = pFable.DAL.Record.query.clone()
				.addRecord(tmpRecordData);

			pFable.DAL.Record.doCreate(tmpQuery,
				(pCreateError, pQuery, pQueryRead, pRecord) =>
				{
					if (pCreateError)
					{
						tmpErrors++;
						return tmpIngestRecord(pRecordIndex + 1);
					}

					tmpIngested++;

					// Create certainty index
					let tmpCIQuery = pFable.DAL.CertaintyIndex.query.clone()
						.addRecord(
							{
								IDRecord: pRecord.IDRecord,
								CertaintyValue: tmpCertainty,
								Dimension: 'overall',
								Justification: `${pDatasetDef.agency} official data`
							});

					pFable.DAL.CertaintyIndex.doCreate(tmpCIQuery,
						() =>
						{
							return tmpIngestRecord(pRecordIndex + 1);
						});
				});
		};

		tmpIngestRecord(0);
	};

	// Route to appropriate parser
	switch (tmpFormat)
	{
		case 'csv':
			tmpIngestEngine.parseCSV(tmpContent, {}, tmpParseCallback);
			break;

		case 'json':
			tmpIngestEngine.parseJSON(tmpContent, tmpParseCallback);
			break;

		case 'xml':
			tmpIngestEngine.parseXML(tmpContent, pDatasetDef.parseOptions || {}, tmpParseCallback);
			break;

		case 'tsv':
			tmpIngestEngine.parseCSV(tmpContent, pDatasetDef.parseOptions || { delimiter: '\t', stripCommentLines: true }, tmpParseCallback);
			break;

		case 'excel':
			// Special: download JSON, convert to Excel, then parse back
			ingestAsExcelDirect(pFable, pDatasetDef, tmpContent, tmpParseCallback);
			break;

		case 'fixed-width':
			tmpIngestEngine.parseFixedWidth(tmpContent, pDatasetDef.parseOptions || {}, tmpParseCallback);
			break;

		default:
			return fCallback(new Error(`Unknown format: ${tmpFormat}`));
	}
}

/**
 * For the Excel format demo in direct mode: parse the BLS JSON response,
 * write to a temporary .xlsx file, then read it back through parseExcel.
 */
function ingestAsExcelDirect(pFable, pDatasetDef, pContent, fCallback)
{
	try
	{
		let libXLSX = require('xlsx');
		let tmpJSON = JSON.parse(pContent);

		// BLS API returns { Results: { series: [ { data: [...] } ] } }
		let tmpRecords = [];
		if (tmpJSON.Results && tmpJSON.Results.series)
		{
			for (let s = 0; s < tmpJSON.Results.series.length; s++)
			{
				let tmpSeries = tmpJSON.Results.series[s];
				if (tmpSeries.data && Array.isArray(tmpSeries.data))
				{
					tmpRecords = tmpRecords.concat(tmpSeries.data);
				}
			}
		}

		if (tmpRecords.length === 0)
		{
			console.log('    BLS: No CPI data records found in response.');
			return fCallback(null, []);
		}

		console.log(`    BLS: Converting ${tmpRecords.length} records to Excel...`);

		// Write to temporary .xlsx
		let tmpWorksheet = libXLSX.utils.json_to_sheet(tmpRecords);
		let tmpWorkbook = libXLSX.utils.book_new();
		libXLSX.utils.book_append_sheet(tmpWorkbook, tmpWorksheet, 'CPI Data');

		let tmpExcelPath = libPath.join(__dirname, 'tmp-bls-cpi.xlsx');
		libXLSX.writeFile(tmpWorkbook, tmpExcelPath);

		console.log(`    BLS: Wrote temporary Excel file (${libFs.statSync(tmpExcelPath).size} bytes)`);

		// Read it back as Buffer and parse through parseExcel
		let tmpExcelBuffer = libFs.readFileSync(tmpExcelPath);
		pFable.RetoldFactoIngestEngine.parseExcel(tmpExcelBuffer, {},
			(pParseError, pParsedRecords) =>
			{
				// Clean up temp file
				try { libFs.unlinkSync(tmpExcelPath); } catch (e) { /* ignore */ }

				return fCallback(pParseError, pParsedRecords);
			});
	}
	catch (pError)
	{
		return fCallback(pError);
	}
}

// ================================================================
// Summary
// ================================================================

function printSummary(pFable, pPort)
{
	console.log('==========================================================');
	console.log('  WAREHOUSE SUMMARY');
	console.log('==========================================================');

	if (pPort)
	{
		// HTTP mode: use the ProjectionEngine summary endpoint
		httpGet(pPort, '/facto/projections/summary',
			(pError, pSummary) =>
			{
				if (pError)
				{
					console.error(`  Error fetching summary: ${pError.message}`);
					return;
				}

				console.log(`  Sources:              ${pSummary.Sources}`);
				console.log(`  Datasets:             ${pSummary.Datasets}`);
				console.log(`  Records:              ${pSummary.Records}`);
				console.log(`  Certainty Indices:    ${pSummary.CertaintyIndices}`);
				console.log(`  Ingest Jobs:          ${pSummary.IngestJobs}`);
				console.log('');
				if (pSummary.DatasetsByType)
				{
					console.log('  Datasets by Type:');
					for (let tmpType in pSummary.DatasetsByType)
					{
						console.log(`    ${tmpType}: ${pSummary.DatasetsByType[tmpType]}`);
					}
				}
				console.log('');
				console.log(`  Server: http://localhost:${pPort}/facto/app/`);
				console.log('==========================================================');
				console.log('  Done!');
				console.log('');
			});
	}
	else
	{
		// Direct mode: DAL counts
		let tmpCountEntities = ['Source', 'Dataset', 'DatasetSource', 'SourceDocumentation', 'Record', 'CertaintyIndex'];
		let tmpCounts = {};
		let tmpRemaining = tmpCountEntities.length;

		for (let i = 0; i < tmpCountEntities.length; i++)
		{
			let tmpEntity = tmpCountEntities[i];

			let tmpQuery = pFable.DAL[tmpEntity].query.clone()
				.addFilter('Deleted', 0);

			pFable.DAL[tmpEntity].doCount(tmpQuery,
				(pError, pQuery, pCount) =>
				{
					tmpCounts[tmpEntity] = (typeof pCount === 'number') ? pCount : parseInt(pCount, 10) || 0;
					tmpRemaining--;

					if (tmpRemaining <= 0)
					{
						console.log(`  Sources:              ${tmpCounts.Source}`);
						console.log(`  Datasets:             ${tmpCounts.Dataset}`);
						console.log(`  Dataset-Source Links:  ${tmpCounts.DatasetSource}`);
						console.log(`  Source Documentation:  ${tmpCounts.SourceDocumentation}`);
						console.log(`  Records:              ${tmpCounts.Record}`);
						console.log(`  Certainty Indices:    ${tmpCounts.CertaintyIndex}`);
						console.log('');
						console.log(`  Database: ${_DBPath}`);
						console.log('==========================================================');
						console.log('  Done!');
						console.log('');
					}
				});
		}
	}
}
