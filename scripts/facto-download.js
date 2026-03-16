#!/usr/bin/env node
/**
 * Retold Facto — Offline Data Lake Downloader (CLI)
 *
 * Thin CLI wrapper around RetoldFactoDataLakeService.
 * Reads download-catalog.json and downloads public datasets into a
 * well-organized folder structure for stable, repeatable ingestion.
 *
 * Usage:
 *   node scripts/facto-download.js --dry-run
 *   node scripts/facto-download.js --dry-run --tier 2
 *   node scripts/facto-download.js --id iso-4217-currencies
 *   node scripts/facto-download.js --list
 *   node scripts/facto-download.js --category 01_foundational_reference
 *   node scripts/facto-download.js --tier 2 --force
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFable = require('fable');
const libPath = require('path');

const libRetoldFactoDataLakeService = require('../source/services/Retold-Facto-DataLakeService.js');

// ================================================================
// Constants
// ================================================================

const CATALOG_PATH = libPath.join(__dirname, '..', 'documentation', 'datasets', 'download-catalog.json');
const DEFAULT_DATA_DIR = libPath.join(__dirname, '..', 'dist', 'retold-facto-raw-data');

// ================================================================
// CLI Argument Parsing
// ================================================================

let _Options = (
	{
		dryRun: false,
		list: false,
		force: false,
		tier: null,
		category: null,
		id: null,
		dataDir: DEFAULT_DATA_DIR
	});

let tmpArgs = process.argv.slice(2);
for (let i = 0; i < tmpArgs.length; i++)
{
	if (tmpArgs[i] === '--dry-run' || tmpArgs[i] === '-n')
	{
		_Options.dryRun = true;
	}
	else if (tmpArgs[i] === '--list' || tmpArgs[i] === '-l')
	{
		_Options.list = true;
	}
	else if (tmpArgs[i] === '--force' || tmpArgs[i] === '-f')
	{
		_Options.force = true;
	}
	else if ((tmpArgs[i] === '--tier' || tmpArgs[i] === '-t') && tmpArgs[i + 1])
	{
		_Options.tier = parseInt(tmpArgs[i + 1], 10);
		i++;
	}
	else if ((tmpArgs[i] === '--category' || tmpArgs[i] === '-c') && tmpArgs[i + 1])
	{
		_Options.category = tmpArgs[i + 1];
		i++;
	}
	else if ((tmpArgs[i] === '--id') && tmpArgs[i + 1])
	{
		_Options.id = tmpArgs[i + 1];
		i++;
	}
	else if ((tmpArgs[i] === '--data-dir' || tmpArgs[i] === '-d') && tmpArgs[i + 1])
	{
		_Options.dataDir = libPath.resolve(tmpArgs[i + 1]);
		i++;
	}
	else if (tmpArgs[i] === '--skip-api')
	{
		// Default behavior — flag exists for explicitness
	}
	else if (tmpArgs[i] === '--help' || tmpArgs[i] === '-h')
	{
		console.log('Retold Facto — Offline Data Lake Downloader');
		console.log('');
		console.log('Usage:');
		console.log('  node scripts/facto-download.js [options]');
		console.log('');
		console.log('Options:');
		console.log('  --dry-run, -n          Show what would be downloaded without downloading');
		console.log('  --list, -l             List all datasets with cached/missing status');
		console.log('  --tier, -t <n>         Only datasets at tier N or lower');
		console.log('  --category, -c <name>  Only datasets in this category');
		console.log('  --id <id>              Download a single dataset by ID');
		console.log('  --data-dir, -d <path>  Override data directory (default: data/)');
		console.log('  --force, -f            Re-download even if already cached');
		console.log('  --skip-api             Skip API-only datasets (default behavior)');
		console.log('  --help, -h             Show this help');
		console.log('');
		console.log('Categories:');
		console.log('  01_foundational_reference');
		console.log('  02_geographic_location');
		console.log('  03_people_cultural_entities');
		console.log('  04_business_industry');
		console.log('  05_media_entertainment');
		console.log('');
		console.log('Examples:');
		console.log('  node scripts/facto-download.js --dry-run');
		console.log('  node scripts/facto-download.js --dry-run --tier 1');
		console.log('  node scripts/facto-download.js --id iso-4217-currencies');
		console.log('  node scripts/facto-download.js --tier 2');
		console.log('  node scripts/facto-download.js --list');
		process.exit(0);
	}
	else
	{
		console.error(`Unknown argument: ${tmpArgs[i]}`);
		console.error('Use --help for usage information.');
		process.exit(1);
	}
}

// ================================================================
// Reporting Helpers
// ================================================================

function printStatusLine(pService, pEntry, pStatus)
{
	let tmpDataset = pEntry.dataset;
	let tmpDownloadable = pService.isDownloadable(tmpDataset);
	let tmpMethodLabel = tmpDownloadable ? tmpDataset.method : `${tmpDataset.method} (manual)`;

	let tmpStatusIcon = '  ';
	if (pStatus === 'cached')
	{
		tmpStatusIcon = '\u2713 ';
	}
	else if (pStatus === 'error')
	{
		tmpStatusIcon = '\u2717 ';
	}
	else if (pStatus === 'missing' && !tmpDownloadable)
	{
		tmpStatusIcon = '- ';
	}

	let tmpSizeStr = tmpDataset.size_compressed || '???';
	let tmpTierStr = `T${tmpDataset.tier}`;

	console.log(`  ${tmpStatusIcon}[${tmpTierStr}] ${tmpDataset.id.padEnd(35)} ${tmpSizeStr.padEnd(15)} ${tmpMethodLabel.padEnd(16)} ${pStatus}`);
}

// ================================================================
// Main
// ================================================================

async function main()
{
	// Create a lightweight Fable instance for the service
	let tmpFable = libFable.new(
		{
			Product: 'RetoldFacto',
			ProductVersion: '0.0.1',
			LogLevel: 5
		});

	// Register and instantiate the DataLake service
	tmpFable.serviceManager.addServiceType('RetoldFactoDataLakeService', libRetoldFactoDataLakeService);
	let tmpService = tmpFable.serviceManager.instantiateServiceProvider('RetoldFactoDataLakeService',
		{
			CatalogPath: CATALOG_PATH,
			DataDir: _Options.dataDir
		});

	let tmpCatalog = tmpService.loadCatalog();
	if (!tmpCatalog)
	{
		console.error('Failed to load catalog.');
		process.exit(1);
	}

	let tmpFilters = (
		{
			tier: _Options.tier,
			category: _Options.category,
			id: _Options.id
		});

	let tmpEntries = tmpService.flattenCatalog(tmpCatalog, tmpFilters);

	if (tmpEntries.length === 0)
	{
		console.log('No datasets match the given filters.');
		return;
	}

	// --list mode
	if (_Options.list)
	{
		console.log('');
		console.log('Retold Facto \u2014 Data Lake Status');
		console.log(`Data directory: ${_Options.dataDir}`);
		console.log('');

		let tmpCurrentCategory = '';
		let tmpCachedCount = 0;
		let tmpMissingCount = 0;
		let tmpErrorCount = 0;
		let tmpManualCount = 0;
		let tmpCachedSize = 0;

		for (let i = 0; i < tmpEntries.length; i++)
		{
			let tmpEntry = tmpEntries[i];

			if (tmpEntry.categoryFolder !== tmpCurrentCategory)
			{
				tmpCurrentCategory = tmpEntry.categoryFolder;
				console.log(`\n  ${tmpCurrentCategory}/`);
			}

			let tmpStatus = tmpService.getDatasetStatus(tmpEntry);
			printStatusLine(tmpService, tmpEntry, tmpStatus);

			if (tmpStatus === 'cached')
			{
				tmpCachedCount++;
				let tmpDatasetDir = tmpService.getDatasetDir(tmpEntry.categoryFolder, tmpEntry.dataset.id);
				let tmpManifest = tmpService.readManifest(tmpDatasetDir);
				if (tmpManifest)
				{
					tmpCachedSize += tmpManifest.total_size || 0;
				}
			}
			else if (tmpStatus === 'error')
			{
				tmpErrorCount++;
			}
			else if (!tmpService.isDownloadable(tmpEntry.dataset))
			{
				tmpManualCount++;
			}
			else
			{
				tmpMissingCount++;
			}
		}

		console.log('');
		console.log(`Total: ${tmpEntries.length} datasets`);
		console.log(`  Cached:      ${tmpCachedCount} (${tmpService.formatSize(tmpCachedSize)} on disk)`);
		console.log(`  Missing:     ${tmpMissingCount} (downloadable)`);
		console.log(`  API/Manual:  ${tmpManualCount} (need custom scripts)`);
		if (tmpErrorCount > 0)
		{
			console.log(`  Errors:      ${tmpErrorCount}`);
		}
		console.log('');
		return;
	}

	// --dry-run mode
	if (_Options.dryRun)
	{
		console.log('');
		console.log('Retold Facto \u2014 Download Dry Run');
		if (_Options.tier !== null)
		{
			console.log(`Tier filter: <= ${_Options.tier}`);
		}
		if (_Options.category)
		{
			console.log(`Category filter: ${_Options.category}`);
		}
		if (_Options.id)
		{
			console.log(`Dataset filter: ${_Options.id}`);
		}
		console.log('');

		let tmpCurrentCategory = '';
		let tmpTotalSize = 0;
		let tmpDownloadableCount = 0;
		let tmpSkippedCount = 0;
		let tmpAlreadyCachedCount = 0;

		for (let i = 0; i < tmpEntries.length; i++)
		{
			let tmpEntry = tmpEntries[i];
			let tmpDataset = tmpEntry.dataset;

			if (tmpEntry.categoryFolder !== tmpCurrentCategory)
			{
				tmpCurrentCategory = tmpEntry.categoryFolder;
				console.log(`\n  ${tmpCurrentCategory}/`);
			}

			let tmpDownloadable = tmpService.isDownloadable(tmpDataset);
			let tmpStatus = tmpService.getDatasetStatus(tmpEntry);
			let tmpSizeBytes = tmpService.parseSize(tmpDataset.size_compressed);
			let tmpSizeStr = tmpDataset.size_compressed || '???';

			if (!tmpDownloadable)
			{
				console.log(`    SKIP  ${tmpDataset.id.padEnd(35)} ${tmpSizeStr.padEnd(15)} ${tmpDataset.method} (needs custom script)`);
				tmpSkippedCount++;
			}
			else if (tmpStatus === 'cached' && !_Options.force)
			{
				console.log(`    OK    ${tmpDataset.id.padEnd(35)} ${tmpSizeStr.padEnd(15)} already cached`);
				tmpAlreadyCachedCount++;
			}
			else
			{
				let tmpUrlCount = tmpDataset.method === 'rest_api' ? (tmpDataset.fetch_steps || []).length + ' step(s)' : `${(tmpDataset.urls || []).length} URL(s)`;
				console.log(`    GET   ${tmpDataset.id.padEnd(35)} ${tmpSizeStr.padEnd(15)} ${tmpDataset.method} \u2192 ${tmpUrlCount}`);
				tmpTotalSize += tmpSizeBytes;
				tmpDownloadableCount++;
			}
		}

		console.log('');
		console.log('Summary:');
		console.log(`  Would download: ${tmpDownloadableCount} datasets (~${tmpService.formatSize(tmpTotalSize)})`);
		console.log(`  Already cached: ${tmpAlreadyCachedCount}`);
		console.log(`  Skipped (API):  ${tmpSkippedCount}`);
		console.log(`  Total matched:  ${tmpEntries.length}`);
		console.log('');
		console.log('Run without --dry-run to download.');
		console.log('');
		return;
	}

	// Download mode
	console.log('');
	console.log('Retold Facto \u2014 Downloading to Offline Data Lake');
	console.log(`Data directory: ${_Options.dataDir}`);
	console.log('');

	let tmpDownloadable = [];
	let tmpSkipped = [];

	for (let i = 0; i < tmpEntries.length; i++)
	{
		let tmpEntry = tmpEntries[i];
		let tmpDataset = tmpEntry.dataset;

		if (!tmpService.isDownloadable(tmpDataset))
		{
			tmpSkipped.push(tmpEntry);
			continue;
		}

		let tmpStatus = tmpService.getDatasetStatus(tmpEntry);
		if (tmpStatus === 'cached' && !_Options.force)
		{
			console.log(`  [CACHED] ${tmpDataset.id} \u2014 already downloaded`);
			continue;
		}

		tmpDownloadable.push(tmpEntry);
	}

	if (tmpDownloadable.length === 0)
	{
		console.log('Nothing to download. All matching datasets are cached or API-only.');
		if (tmpSkipped.length > 0)
		{
			console.log(`(${tmpSkipped.length} API/manual datasets were skipped)`);
		}
		console.log('');
		return;
	}

	console.log(`Downloading ${tmpDownloadable.length} dataset(s)...`);
	console.log('');

	let tmpSuccessCount = 0;
	let tmpErrorCount = 0;

	for (let i = 0; i < tmpDownloadable.length; i++)
	{
		let tmpEntry = tmpDownloadable[i];
		let tmpDataset = tmpEntry.dataset;

		console.log(`[${i + 1}/${tmpDownloadable.length}] ${tmpDataset.name} (${tmpDataset.id})`);
		console.log(`  Method: ${tmpDataset.method} | Size: ${tmpDataset.size_compressed || '???'} | Tier: ${tmpDataset.tier}`);

		let tmpManifest = await tmpService.downloadDataset(tmpEntry);

		if (tmpManifest.status === 'complete')
		{
			console.log(`  Complete: ${tmpService.formatSize(tmpManifest.total_size)} in ${tmpManifest.files.length} file(s)`);
			tmpSuccessCount++;
		}
		else
		{
			tmpErrorCount++;
		}
		console.log('');
	}

	console.log('');
	console.log('Download complete.');
	console.log(`  Success: ${tmpSuccessCount}`);
	if (tmpErrorCount > 0)
	{
		console.log(`  Errors:  ${tmpErrorCount}`);
	}
	if (tmpSkipped.length > 0)
	{
		console.log(`  Skipped: ${tmpSkipped.length} (API/manual \u2014 need custom scripts)`);
	}
	console.log('');
}

main().catch(
	(pError) =>
	{
		console.error(`Fatal error: ${pError.message}`);
		process.exit(1);
	});
