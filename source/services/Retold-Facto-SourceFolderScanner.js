/**
 * Retold Facto - Source Folder Scanner Service
 *
 * Scans folder trees to discover dataset research folders (identified by
 * having a README.md). Parses README metadata, enumerates data files,
 * and bridges discovered datasets into the facto database through
 * provisioning and ingestion.
 *
 * Folder structure expected:
 *   {scan-root}/
 *     {dataset-id}/
 *       README.md        — 12-section research documentation
 *       data/            — Raw data files (CSV, TSV, JSON, archives)
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const libPath = require('path');
const libFs = require('fs');
const libZlib = require('zlib');

const defaultSourceFolderScannerOptions = (
	{
		RoutePrefix: '/facto'
	});

// Map README heading text to structured keys
const SECTION_MAP = (
	{
		'Provider / Organization': 'Provider',
		'Provider': 'Provider',
		'Source URL': 'SourceURL',
		'License': 'License',
		'Description': 'Description',
		'Schema / Field Descriptions': 'Schema',
		'Schema': 'Schema',
		'Data Format': 'DataFormat',
		'Update Frequency': 'UpdateFrequency',
		'Record Count': 'RecordCount',
		'Known Issues / Quirks': 'KnownIssues',
		'Known Issues': 'KnownIssues',
		'Ingestion Notes': 'IngestionNotes',
		'Related Datasets': 'RelatedDatasets',
		'Documentation Links': 'DocumentationLinks'
	});

class RetoldFactoSourceFolderScanner extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultSourceFolderScannerOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoSourceFolderScanner';

		// In-memory state
		this.scanPaths = [];
		this.discoveredDatasets = {};
	}

	// ================================================================
	// README Parsing
	// ================================================================

	/**
	 * Parse a README.md content string into a structured metadata object.
	 *
	 * @param {string} pContent - The raw README.md content
	 * @returns {object} Parsed metadata object
	 */
	parseReadme(pContent)
	{
		if (!pContent || typeof pContent !== 'string')
		{
			return { Title: '', Sections: {} };
		}

		let tmpResult = { Title: '', Sections: {} };
		let tmpLines = pContent.split('\n');

		// Extract title from the first # line
		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i].trim();
			if (tmpLine.startsWith('# ') && !tmpLine.startsWith('## '))
			{
				tmpResult.Title = tmpLine.substring(2).trim();
				break;
			}
		}

		// Split by ## headings
		let tmpCurrentSection = null;
		let tmpCurrentContent = [];

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i];
			let tmpTrimmed = tmpLine.trim();

			if (tmpTrimmed.startsWith('## '))
			{
				// Save previous section
				if (tmpCurrentSection)
				{
					let tmpKey = SECTION_MAP[tmpCurrentSection] || tmpCurrentSection;
					tmpResult.Sections[tmpKey] = tmpCurrentContent.join('\n').trim();
				}

				tmpCurrentSection = tmpTrimmed.substring(3).trim();
				tmpCurrentContent = [];
			}
			else if (tmpCurrentSection)
			{
				tmpCurrentContent.push(tmpLine);
			}
		}

		// Save last section
		if (tmpCurrentSection)
		{
			let tmpKey = SECTION_MAP[tmpCurrentSection] || tmpCurrentSection;
			tmpResult.Sections[tmpKey] = tmpCurrentContent.join('\n').trim();
		}

		// Convenience accessors
		tmpResult.Provider = tmpResult.Sections.Provider || '';
		tmpResult.SourceURL = this.extractFirstUrl(tmpResult.Sections.SourceURL || '');
		tmpResult.License = tmpResult.Sections.License || '';
		tmpResult.Description = tmpResult.Sections.Description || '';
		tmpResult.Schema = tmpResult.Sections.Schema || '';
		tmpResult.UpdateFrequency = tmpResult.Sections.UpdateFrequency || '';
		tmpResult.RecordCount = tmpResult.Sections.RecordCount || '';
		tmpResult.KnownIssues = tmpResult.Sections.KnownIssues || '';
		tmpResult.IngestionNotes = tmpResult.Sections.IngestionNotes || '';
		tmpResult.RelatedDatasets = tmpResult.Sections.RelatedDatasets || '';
		tmpResult.DocumentationLinks = tmpResult.Sections.DocumentationLinks || '';

		// Parse data format section for structured info
		tmpResult.DataFormat = this.parseDataFormatSection(tmpResult.Sections.DataFormat || '');

		// Extract all documentation URLs
		tmpResult.DocumentationURLs = this.extractAllUrls(tmpResult.Sections.DocumentationLinks || '');

		return tmpResult;
	}

	/**
	 * Extract the first URL from a markdown text section.
	 */
	extractFirstUrl(pText)
	{
		if (!pText)
		{
			return '';
		}
		let tmpMatch = pText.match(/https?:\/\/[^\s)>\]]+/);
		return tmpMatch ? tmpMatch[0] : '';
	}

	/**
	 * Extract all URLs from a markdown text section.
	 */
	extractAllUrls(pText)
	{
		if (!pText)
		{
			return [];
		}
		let tmpMatches = pText.match(/https?:\/\/[^\s)>\]]+/g);
		return tmpMatches || [];
	}

	/**
	 * Parse the Data Format section for structured format info.
	 */
	parseDataFormatSection(pText)
	{
		if (!pText)
		{
			return { Format: 'unknown', Encoding: 'UTF-8', Delimiter: '', Compression: 'none' };
		}

		let tmpLower = pText.toLowerCase();
		let tmpFormat = 'unknown';
		let tmpDelimiter = '';
		let tmpCompression = 'none';
		let tmpEncoding = 'UTF-8';

		// Format detection
		if (tmpLower.indexOf('tab-separated') > -1 || tmpLower.indexOf('\ttsv') > -1 || tmpLower.match(/\btsv\b/))
		{
			tmpFormat = 'tsv';
			tmpDelimiter = '\t';
		}
		else if (tmpLower.indexOf('comma-separated') > -1 || tmpLower.match(/\bcsv\b/))
		{
			tmpFormat = 'csv';
			tmpDelimiter = ',';
		}
		else if (tmpLower.indexOf('pipe-delimited') > -1 || tmpLower.indexOf('pipe-separated') > -1)
		{
			tmpFormat = 'csv';
			tmpDelimiter = '|';
		}
		else if (tmpLower.match(/\bjson\b/))
		{
			tmpFormat = 'json';
		}
		else if (tmpLower.match(/\bxml\b/))
		{
			tmpFormat = 'xml';
		}
		else if (tmpLower.match(/\brdf\b/) || tmpLower.match(/\bn-triples\b/))
		{
			tmpFormat = 'rdf';
		}

		// Compression detection
		if (tmpLower.indexOf('gzip') > -1 || tmpLower.indexOf('.gz') > -1)
		{
			tmpCompression = 'gzip';
		}
		else if (tmpLower.indexOf('.zip') > -1 || tmpLower.indexOf('zip archive') > -1)
		{
			tmpCompression = 'zip';
		}
		else if (tmpLower.indexOf('.tar.xz') > -1 || tmpLower.indexOf('xz') > -1)
		{
			tmpCompression = 'tar.xz';
		}
		else if (tmpLower.indexOf('.tar.zst') > -1 || tmpLower.indexOf('zstandard') > -1)
		{
			tmpCompression = 'tar.zst';
		}

		// Encoding detection
		if (tmpLower.indexOf('latin') > -1 || tmpLower.indexOf('iso-8859') > -1)
		{
			tmpEncoding = 'ISO-8859-1';
		}
		else if (tmpLower.indexOf('ascii') > -1)
		{
			tmpEncoding = 'ASCII';
		}

		return (
			{
				Format: tmpFormat,
				Encoding: tmpEncoding,
				Delimiter: tmpDelimiter,
				Compression: tmpCompression,
				RawText: pText
			});
	}

	// ================================================================
	// File System Scanning
	// ================================================================

	/**
	 * Detect file format from filename extension.
	 */
	detectFileFormat(pFileName)
	{
		let tmpLower = pFileName.toLowerCase();

		// Strip compression extensions to find the real format
		let tmpBase = tmpLower;
		let tmpCompressed = false;

		if (tmpBase.endsWith('.gz'))
		{
			tmpBase = tmpBase.slice(0, -3);
			tmpCompressed = true;
		}
		else if (tmpBase.endsWith('.zip'))
		{
			tmpBase = tmpBase.slice(0, -4);
			tmpCompressed = true;
		}
		else if (tmpBase.endsWith('.bz2'))
		{
			tmpBase = tmpBase.slice(0, -4);
			tmpCompressed = true;
		}
		else if (tmpBase.endsWith('.xz'))
		{
			tmpBase = tmpBase.slice(0, -3);
			tmpCompressed = true;
		}
		else if (tmpBase.endsWith('.zst') || tmpBase.endsWith('.zstd'))
		{
			tmpBase = tmpBase.replace(/\.zstd?$/, '');
			tmpCompressed = true;
		}

		// Detect archive formats
		if (tmpBase.endsWith('.tar'))
		{
			return { Format: 'archive', Compressed: true };
		}

		// Detect data format from extension
		if (tmpBase.endsWith('.tsv') || tmpBase.endsWith('.tab'))
		{
			return { Format: 'tsv', Compressed: tmpCompressed };
		}
		if (tmpBase.endsWith('.csv'))
		{
			return { Format: 'csv', Compressed: tmpCompressed };
		}
		if (tmpBase.endsWith('.json') || tmpBase.endsWith('.jsonl') || tmpBase.endsWith('.ndjson'))
		{
			return { Format: 'json', Compressed: tmpCompressed };
		}
		if (tmpBase.endsWith('.xml') || tmpBase.endsWith('.rdf'))
		{
			return { Format: 'xml', Compressed: tmpCompressed };
		}
		if (tmpBase.endsWith('.xlsx') || tmpBase.endsWith('.xls'))
		{
			return { Format: 'excel', Compressed: false };
		}
		if (tmpBase.endsWith('.sql') || tmpBase.endsWith('.sqlite'))
		{
			return { Format: 'sql', Compressed: tmpCompressed };
		}
		if (tmpBase.endsWith('.txt') || tmpBase.endsWith('.dat'))
		{
			return { Format: 'text', Compressed: tmpCompressed };
		}

		// If we stripped a compression extension but found no data format, it's an archive
		if (tmpCompressed)
		{
			return { Format: 'archive', Compressed: true };
		}

		return { Format: 'unknown', Compressed: false };
	}

	/**
	 * Enumerate data files in a dataset's data/ subfolder.
	 *
	 * @param {string} pFolderPath - The dataset folder path
	 * @param {function} fCallback - Callback(pError, pFiles)
	 */
	resolveDataFiles(pFolderPath, fCallback)
	{
		let tmpDataDir = libPath.join(pFolderPath, 'data');

		if (!libFs.existsSync(tmpDataDir))
		{
			return fCallback(null, []);
		}

		let tmpFiles = [];

		try
		{
			let tmpWalk = (pDir, pRelPrefix) =>
			{
				let tmpEntries = libFs.readdirSync(pDir, { withFileTypes: true });

				for (let i = 0; i < tmpEntries.length; i++)
				{
					let tmpEntry = tmpEntries[i];
					let tmpFullPath = libPath.join(pDir, tmpEntry.name);
					let tmpRelPath = pRelPrefix ? `${pRelPrefix}/${tmpEntry.name}` : tmpEntry.name;

					if (tmpEntry.name === '_manifest.json' || tmpEntry.name === '_ingestion.json' || tmpEntry.name === '.git' || tmpEntry.name === '.DS_Store')
					{
						continue;
					}

					if (tmpEntry.isDirectory())
					{
						tmpWalk(tmpFullPath, tmpRelPath);
					}
					else if (tmpEntry.isFile())
					{
						let tmpStat = libFs.statSync(tmpFullPath);
						let tmpFormatInfo = this.detectFileFormat(tmpEntry.name);

						tmpFiles.push(
							{
								FileName: tmpRelPath,
								FullPath: tmpFullPath,
								Size: tmpStat.size,
								Format: tmpFormatInfo.Format,
								Compressed: tmpFormatInfo.Compressed,
								ModifiedAt: tmpStat.mtime.toISOString()
							});
					}
				}
			};

			tmpWalk(tmpDataDir, '');
		}
		catch (pError)
		{
			return fCallback(pError);
		}

		// Sort by size descending (largest first)
		tmpFiles.sort((a, b) => b.Size - a.Size);

		return fCallback(null, tmpFiles);
	}

	/**
	 * Parse a single dataset folder and build a DiscoveredDataset object.
	 *
	 * @param {string} pFolderPath - Absolute path to the dataset folder
	 * @param {function} fCallback - Callback(pError, pDiscoveredDataset)
	 */
	parseDatasetFolder(pFolderPath, fCallback)
	{
		let tmpReadmePath = libPath.join(pFolderPath, 'README.md');
		let tmpFolderName = libPath.basename(pFolderPath);

		// Read README
		libFs.readFile(tmpReadmePath, 'utf8',
			(pError, pContent) =>
			{
				if (pError)
				{
					return fCallback(null,
						{
							FolderPath: pFolderPath,
							FolderName: tmpFolderName,
							Title: tmpFolderName,
							Status: 'Error',
							Errors: [`Could not read README.md: ${pError.message}`],
							DataFiles: [],
							TotalDataSize: 0,
							HasData: false,
							NeedsDownload: true,
							DiscoveredAt: new Date().toISOString()
						});
				}

				let tmpParsed = this.parseReadme(pContent);

				// Resolve data files
				this.resolveDataFiles(pFolderPath,
					(pFileError, pFiles) =>
					{
						let tmpDataFiles = pFiles || [];
						let tmpTotalSize = 0;
						for (let i = 0; i < tmpDataFiles.length; i++)
						{
							tmpTotalSize += tmpDataFiles[i].Size;
						}

						let tmpDataset = (
							{
								FolderPath: pFolderPath,
								FolderName: tmpFolderName,

								// README metadata
								Title: tmpParsed.Title || tmpFolderName,
								Provider: tmpParsed.Provider,
								SourceURL: tmpParsed.SourceURL,
								License: tmpParsed.License,
								Description: tmpParsed.Description,
								Schema: tmpParsed.Schema,
								DataFormat: tmpParsed.DataFormat,
								UpdateFrequency: tmpParsed.UpdateFrequency,
								RecordCount: tmpParsed.RecordCount,
								KnownIssues: tmpParsed.KnownIssues,
								IngestionNotes: tmpParsed.IngestionNotes,
								RelatedDatasets: tmpParsed.RelatedDatasets,
								DocumentationLinks: tmpParsed.DocumentationLinks,
								DocumentationURLs: tmpParsed.DocumentationURLs,

								// Data files
								DataFiles: tmpDataFiles,
								TotalDataSize: tmpTotalSize,

								// Status
								Status: 'Discovered',
								HasData: tmpDataFiles.length > 0,
								NeedsDownload: tmpDataFiles.length === 0,

								// Provisioning (set later)
								IDSource: null,
								IDDataset: null,

								// Timestamps
								DiscoveredAt: new Date().toISOString(),
								ProvisionedAt: null,
								IngestedAt: null,
								LastScannedAt: new Date().toISOString(),

								Errors: []
							});

						return fCallback(null, tmpDataset);
					});
			});
	}

	/**
	 * Recursively scan a folder tree for dataset folders (those containing README.md).
	 *
	 * @param {string} pPath - Absolute path to scan
	 * @param {function} fCallback - Callback(pError, pScanResult)
	 */
	scanPath(pPath, fCallback)
	{
		let tmpAbsPath = libPath.resolve(pPath);
		let tmpSelf = this;

		if (!libFs.existsSync(tmpAbsPath))
		{
			return fCallback(new Error(`Scan path does not exist: ${tmpAbsPath}`));
		}

		let tmpStat = libFs.statSync(tmpAbsPath);
		if (!tmpStat.isDirectory())
		{
			return fCallback(new Error(`Scan path is not a directory: ${tmpAbsPath}`));
		}

		let tmpFoldersScanned = 0;
		let tmpDatasetsFound = 0;
		let tmpErrors = [];

		// Find all immediate child directories that contain a README.md
		let tmpDatasetFolders = [];

		try
		{
			let tmpEntries = libFs.readdirSync(tmpAbsPath, { withFileTypes: true });

			for (let i = 0; i < tmpEntries.length; i++)
			{
				if (tmpEntries[i].isDirectory())
				{
					let tmpChildPath = libPath.join(tmpAbsPath, tmpEntries[i].name);
					let tmpReadmePath = libPath.join(tmpChildPath, 'README.md');

					tmpFoldersScanned++;

					if (libFs.existsSync(tmpReadmePath))
					{
						tmpDatasetFolders.push(tmpChildPath);
					}
				}
			}
		}
		catch (pError)
		{
			this.fable.log.error(`SourceFolderScanner: error reading directory ${tmpAbsPath}: ${pError.message}`);
			return fCallback(pError);
		}

		this.fable.log.info(`SourceFolderScanner: found ${tmpDatasetFolders.length} dataset folder(s) with README.md in ${tmpAbsPath}`);

		// Parse each dataset folder
		let tmpAnticipate = this.fable.newAnticipate();
		let tmpProcessed = 0;

		for (let i = 0; i < tmpDatasetFolders.length; i++)
		{
			let tmpFolderPath = tmpDatasetFolders[i];

			tmpAnticipate.anticipate(
				(fStep) =>
				{
					tmpSelf.parseDatasetFolder(tmpFolderPath,
						(pParseError, pDataset) =>
						{
							tmpProcessed++;
							if (pParseError)
							{
								tmpErrors.push(`${tmpFolderPath}: ${pParseError.message}`);
							}
							else if (pDataset)
							{
								tmpSelf.discoveredDatasets[tmpFolderPath] = pDataset;
								tmpDatasetsFound++;
							}

							// Progress log every 25 or on final
							if (tmpProcessed % 25 === 0 || tmpProcessed === tmpDatasetFolders.length)
							{
								tmpSelf.fable.log.info(`SourceFolderScanner: parsed ${tmpProcessed}/${tmpDatasetFolders.length} dataset folders...`);
							}
							return fStep();
						});
				});
		}

		tmpAnticipate.wait(
			(pError) =>
			{
				// Update scan path metadata
				for (let i = 0; i < tmpSelf.scanPaths.length; i++)
				{
					if (tmpSelf.scanPaths[i].Path === tmpAbsPath)
					{
						tmpSelf.scanPaths[i].LastScannedAt = new Date().toISOString();
						tmpSelf.scanPaths[i].DatasetCount = tmpDatasetsFound;
					}
				}

				let tmpResult = (
					{
						Path: tmpAbsPath,
						FoldersScanned: tmpFoldersScanned,
						DatasetsFound: tmpDatasetsFound,
						Errors: tmpErrors
					});

				tmpSelf.fable.log.info(`SourceFolderScanner: scanned ${tmpAbsPath} — ${tmpDatasetsFound} datasets discovered in ${tmpFoldersScanned} folders`);

				return fCallback(null, tmpResult);
			});
	}

	// ================================================================
	// Scan Path Management
	// ================================================================

	/**
	 * Add a scan path and immediately scan it.
	 */
	addScanPath(pPath, fCallback)
	{
		let tmpAbsPath = libPath.resolve(pPath);

		// Check if already registered
		for (let i = 0; i < this.scanPaths.length; i++)
		{
			if (this.scanPaths[i].Path === tmpAbsPath)
			{
				// Already registered — just rescan
				return this.scanPath(tmpAbsPath, fCallback);
			}
		}

		this.scanPaths.push(
			{
				Path: tmpAbsPath,
				AddedAt: new Date().toISOString(),
				LastScannedAt: null,
				DatasetCount: 0
			});

		this.fable.log.info(`SourceFolderScanner: added scan path ${tmpAbsPath}`);

		return this.scanPath(tmpAbsPath, fCallback);
	}

	/**
	 * Remove a scan path and all its discovered datasets.
	 */
	removeScanPath(pPath, fCallback)
	{
		let tmpAbsPath = libPath.resolve(pPath);

		// Remove from scanPaths
		this.scanPaths = this.scanPaths.filter((pEntry) => pEntry.Path !== tmpAbsPath);

		// Remove discovered datasets under this path
		let tmpRemoved = 0;
		let tmpKeys = Object.keys(this.discoveredDatasets);
		for (let i = 0; i < tmpKeys.length; i++)
		{
			if (tmpKeys[i].startsWith(tmpAbsPath))
			{
				delete this.discoveredDatasets[tmpKeys[i]];
				tmpRemoved++;
			}
		}

		this.fable.log.info(`SourceFolderScanner: removed scan path ${tmpAbsPath} (${tmpRemoved} datasets removed)`);

		return fCallback(null, { Path: tmpAbsPath, DatasetsRemoved: tmpRemoved });
	}

	/**
	 * Re-scan all registered paths.
	 */
	scanAllPaths(fCallback)
	{
		let tmpAnticipate = this.fable.newAnticipate();
		let tmpResults = [];
		let tmpSelf = this;

		for (let i = 0; i < this.scanPaths.length; i++)
		{
			let tmpPath = this.scanPaths[i].Path;

			tmpAnticipate.anticipate(
				(fStep) =>
				{
					tmpSelf.scanPath(tmpPath,
						(pError, pResult) =>
						{
							if (pResult)
							{
								tmpResults.push(pResult);
							}
							return fStep();
						});
				});
		}

		tmpAnticipate.wait(
			(pError) =>
			{
				return fCallback(pError, tmpResults);
			});
	}

	// ================================================================
	// Dataset Queries
	// ================================================================

	/**
	 * Get all discovered datasets, optionally filtered.
	 *
	 * @param {object} pFilterOptions - { status, search, hasData }
	 * @returns {Array} Array of DiscoveredDataset objects
	 */
	getDiscoveredDatasets(pFilterOptions)
	{
		let tmpFilter = pFilterOptions || {};
		let tmpKeys = Object.keys(this.discoveredDatasets);
		let tmpResults = [];

		for (let i = 0; i < tmpKeys.length; i++)
		{
			let tmpDataset = this.discoveredDatasets[tmpKeys[i]];

			// Status filter
			if (tmpFilter.status && tmpDataset.Status !== tmpFilter.status)
			{
				continue;
			}

			// Has data filter
			if (tmpFilter.hasData !== undefined && tmpDataset.HasData !== tmpFilter.hasData)
			{
				continue;
			}

			// Search filter
			if (tmpFilter.search)
			{
				let tmpSearchTerm = tmpFilter.search.toLowerCase();
				let tmpSearchable = [
					tmpDataset.Title,
					tmpDataset.FolderName,
					tmpDataset.Provider,
					tmpDataset.Description
				].join(' ').toLowerCase();

				if (tmpSearchable.indexOf(tmpSearchTerm) < 0)
				{
					continue;
				}
			}

			tmpResults.push(tmpDataset);
		}

		// Sort by folder name
		tmpResults.sort((a, b) => a.FolderName.localeCompare(b.FolderName));

		return tmpResults;
	}

	/**
	 * Get a single discovered dataset by folder name.
	 *
	 * @param {string} pFolderName - The dataset folder name (e.g. 'iso-639-3')
	 * @returns {object|null} The DiscoveredDataset or null
	 */
	getDiscoveredDatasetByName(pFolderName)
	{
		let tmpKeys = Object.keys(this.discoveredDatasets);

		for (let i = 0; i < tmpKeys.length; i++)
		{
			if (this.discoveredDatasets[tmpKeys[i]].FolderName === pFolderName)
			{
				return this.discoveredDatasets[tmpKeys[i]];
			}
		}

		return null;
	}

	// ================================================================
	// Provisioning
	// ================================================================

	/**
	 * Provision a discovered dataset into the facto database.
	 * Creates Source, Dataset, DatasetSource, and SourceCatalogEntry records.
	 *
	 * @param {string} pFolderName - The dataset folder name
	 * @param {function} fCallback - Callback(pError, pResult)
	 */
	provisionDataset(pFolderName, fCallback)
	{
		let tmpDataset = this.getDiscoveredDatasetByName(pFolderName);

		if (!tmpDataset)
		{
			return fCallback(new Error(`Dataset not found: ${pFolderName}`));
		}

		if (!this.fable.RetoldFactoCatalogManager)
		{
			return fCallback(new Error('CatalogManager not initialized'));
		}

		let tmpAnticipate = this.fable.newAnticipate();
		let tmpSource = null;
		let tmpDatasetRecord = null;
		let tmpDatasetSource = null;
		let tmpSelf = this;

		// Step 1: Find or create Source
		tmpAnticipate.anticipate(
			(fStep) =>
			{
				let tmpSourceName = tmpDataset.Provider || tmpDataset.FolderName;
				tmpSelf.fable.RetoldFactoCatalogManager.findOrCreateSource(tmpSourceName,
					{
						Type: 'File',
						URL: tmpDataset.SourceURL || '',
						Protocol: 'HTTPS',
						Description: tmpDataset.Description ? tmpDataset.Description.substring(0, 255) : ''
					},
					(pError, pSource) =>
					{
						if (pError)
						{
							return fStep(pError);
						}
						tmpSource = pSource;
						return fStep();
					});
			});

		// Step 2: Find or create Dataset
		tmpAnticipate.anticipate(
			(fStep) =>
			{
				tmpSelf.fable.RetoldFactoCatalogManager.findOrCreateDataset(tmpDataset.Title,
					{
						Type: 'Raw',
						Description: tmpDataset.Description ? tmpDataset.Description.substring(0, 255) : '',
						VersionPolicy: 'Append'
					},
					(pError, pDataset) =>
					{
						if (pError)
						{
							return fStep(pError);
						}
						tmpDatasetRecord = pDataset;
						return fStep();
					});
			});

		// Step 3: Ensure DatasetSource link
		tmpAnticipate.anticipate(
			(fStep) =>
			{
				if (!tmpSource || !tmpDatasetRecord)
				{
					return fStep();
				}

				tmpSelf.fable.RetoldFactoCatalogManager.ensureDatasetSourceLink(
					tmpDatasetRecord.IDDataset,
					tmpSource.IDSource,
					(pError, pLink) =>
					{
						if (pError)
						{
							return fStep(pError);
						}
						tmpDatasetSource = pLink;
						return fStep();
					});
			});

		// Step 4: Create SourceCatalogEntry if DAL is available
		tmpAnticipate.anticipate(
			(fStep) =>
			{
				if (!tmpSelf.fable.DAL || !tmpSelf.fable.DAL.SourceCatalogEntry)
				{
					return fStep();
				}

				let tmpEntryData = (
					{
						Agency: tmpDataset.Provider || '',
						Name: tmpDataset.Title || tmpDataset.FolderName,
						Type: 'File',
						URL: tmpDataset.SourceURL || '',
						Protocol: 'HTTPS',
						Category: '',
						Region: '',
						UpdateFrequency: tmpDataset.UpdateFrequency || '',
						Description: tmpDataset.Description ? tmpDataset.Description.substring(0, 1000) : '',
						Notes: `Discovered from folder: ${tmpDataset.FolderPath}`,
						Verified: 1
					});

				let tmpQuery = tmpSelf.fable.DAL.SourceCatalogEntry.query.clone()
					.addRecord(tmpEntryData);

				tmpSelf.fable.DAL.SourceCatalogEntry.doCreate(tmpQuery,
					(pError) =>
					{
						// Non-fatal if this fails
						return fStep();
					});
			});

		tmpAnticipate.wait(
			(pError) =>
			{
				if (pError)
				{
					tmpDataset.Errors.push(`Provisioning failed: ${pError.message}`);
					tmpDataset.Status = 'Error';
					return fCallback(pError);
				}

				// Update discovered dataset with provisioning info
				tmpDataset.Status = 'Provisioned';
				tmpDataset.ProvisionedAt = new Date().toISOString();
				tmpDataset.IDSource = tmpSource ? tmpSource.IDSource : null;
				tmpDataset.IDDataset = tmpDatasetRecord ? tmpDatasetRecord.IDDataset : null;

				tmpSelf.fable.log.info(`SourceFolderScanner: provisioned ${pFolderName} (Source: ${tmpDataset.IDSource}, Dataset: ${tmpDataset.IDDataset})`);

				return fCallback(null,
					{
						Success: true,
						FolderName: pFolderName,
						Source: tmpSource,
						Dataset: tmpDatasetRecord,
						DatasetSource: tmpDatasetSource
					});
			});
	}

	// ================================================================
	// Ingestion
	// ================================================================

	/**
	 * Select the best data file for ingestion from a dataset's files.
	 * Prefers uncompressed files, then largest compressed file.
	 *
	 * @param {Array} pDataFiles - Array of data file objects
	 * @returns {object|null} The selected file or null
	 */
	selectBestDataFile(pDataFiles)
	{
		if (!pDataFiles || pDataFiles.length === 0)
		{
			return null;
		}

		// Prefer ingestable formats (csv, tsv, json) over archives
		let tmpIngestable = pDataFiles.filter(
			(pFile) =>
			{
				return pFile.Format === 'csv' || pFile.Format === 'tsv' || pFile.Format === 'json' || pFile.Format === 'text';
			});

		if (tmpIngestable.length > 0)
		{
			// Return the largest ingestable file
			return tmpIngestable[0]; // Already sorted by size desc
		}

		// Fall back to the largest non-archive file
		let tmpNonArchive = pDataFiles.filter(
			(pFile) =>
			{
				return pFile.Format !== 'archive';
			});

		return tmpNonArchive.length > 0 ? tmpNonArchive[0] : null;
	}

	// ================================================================
	// Ingestion Plan
	// ================================================================

	/**
	 * Read an existing _ingestion.json from a dataset's data directory.
	 *
	 * @param {string} pDataDir - Path to the dataset's data/ directory
	 * @returns {object|null} The parsed plan, or null if not found
	 */
	readIngestionPlan(pDataDir)
	{
		let tmpPlanPath = libPath.join(pDataDir, '_ingestion.json');

		if (!libFs.existsSync(tmpPlanPath))
		{
			return null;
		}

		try
		{
			let tmpContent = libFs.readFileSync(tmpPlanPath, 'utf8');
			return JSON.parse(tmpContent);
		}
		catch (pError)
		{
			this.log.warn(`Failed to read ingestion plan: ${pError.message}`);
			return null;
		}
	}

	/**
	 * Write an ingestion plan to a dataset's data directory.
	 *
	 * @param {string} pDataDir - Path to the dataset's data/ directory
	 * @param {object} pPlan - The plan object to write
	 */
	writeIngestionPlan(pDataDir, pPlan)
	{
		let tmpPlanPath = libPath.join(pDataDir, '_ingestion.json');

		try
		{
			libFs.writeFileSync(tmpPlanPath, JSON.stringify(pPlan, null, '\t'), 'utf8');
		}
		catch (pError)
		{
			this.log.error(`Failed to write ingestion plan: ${pError.message}`);
		}
	}

	/**
	 * Derive a record type name from a data file path.
	 * Strips directory prefixes and file extensions.
	 * e.g., "core/People.csv" → "People", "ml-32m/ratings.csv" → "ratings"
	 *
	 * @param {string} pFileName - Relative file path
	 * @returns {string} The derived record type
	 */
	deriveRecordType(pFileName)
	{
		let tmpBase = libPath.basename(pFileName);

		// Strip all extensions (including compound ones like .csv.gz)
		let tmpName = tmpBase;
		while (libPath.extname(tmpName))
		{
			tmpName = tmpName.slice(0, tmpName.length - libPath.extname(tmpName).length);
		}

		return tmpName;
	}

	/**
	 * Parse the README Schema section for per-file sub-headings.
	 * Returns a map of lowercase filename → { primaryKey, fields }.
	 *
	 * @param {string} pSchemaText - The raw Schema section text
	 * @returns {object} Map of filename → schema info
	 */
	parseSchemaForFiles(pSchemaText)
	{
		if (!pSchemaText)
		{
			return {};
		}

		let tmpResult = {};
		let tmpLines = pSchemaText.split('\n');
		let tmpCurrentFile = null;
		let tmpCurrentFields = [];

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i].trim();

			// Look for ### or #### headings that name files or tables
			let tmpHeadingMatch = tmpLine.match(/^#{3,4}\s+(.+)/);
			if (tmpHeadingMatch)
			{
				// Save previous file entry
				if (tmpCurrentFile)
				{
					tmpResult[tmpCurrentFile] = { fields: tmpCurrentFields };
				}

				// Extract the file/table name from the heading
				let tmpHeading = tmpHeadingMatch[1].trim();

				// Strip markdown formatting (bold, code) and common suffixes
				tmpHeading = tmpHeading.replace(/[*`]/g, '').trim();

				// Try to extract just a filename or table name
				// Common patterns: "ratings.csv", "People (player biographical data)"
				let tmpNameMatch = tmpHeading.match(/^(\S+\.(?:csv|tsv|json|txt|xml))/i);
				if (tmpNameMatch)
				{
					tmpCurrentFile = tmpNameMatch[1].toLowerCase();
				}
				else
				{
					// Use the first word as a table name
					let tmpFirstWord = tmpHeading.split(/[\s(]/)[0];
					if (tmpFirstWord.length > 1)
					{
						tmpCurrentFile = tmpFirstWord.toLowerCase();
					}
					else
					{
						tmpCurrentFile = null;
					}
				}

				tmpCurrentFields = [];
				continue;
			}

			// Look for table rows with field definitions: | `fieldName` | type | description |
			if (tmpCurrentFile && tmpLine.startsWith('|') && !tmpLine.match(/^\|[\s-]+\|/))
			{
				let tmpCells = tmpLine.split('|').map((pC) => pC.trim()).filter((pC) => pC.length > 0);
				if (tmpCells.length >= 2)
				{
					let tmpFieldName = tmpCells[0].replace(/`/g, '').trim();
					if (tmpFieldName.toLowerCase() !== 'field' && tmpFieldName.toLowerCase() !== 'table')
					{
						tmpCurrentFields.push(tmpFieldName);
					}
				}
			}
		}

		// Save last file entry
		if (tmpCurrentFile)
		{
			tmpResult[tmpCurrentFile] = { fields: tmpCurrentFields };
		}

		return tmpResult;
	}

	/**
	 * Parse the README IngestionNotes section for primary key, foreign key,
	 * and load-order hints.
	 *
	 * @param {string} pIngestionText - The raw Ingestion Notes text
	 * @returns {object} { primaryKeys: {table: key}, foreignKeys: {table: [keys]}, loadOrder: [names] }
	 */
	parseIngestionNotes(pIngestionText)
	{
		let tmpResult = { primaryKeys: {}, foreignKeys: {}, loadOrder: [] };

		if (!pIngestionText)
		{
			return tmpResult;
		}

		let tmpLines = pIngestionText.split('\n');

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i].trim();

			// Look for primary key mentions: "Primary key: fieldName for TableName"
			// or "playerID for People" patterns or "`movieId` for movies.csv"
			let tmpPKMatch = tmpLine.match(/[Pp]rimary\s+key[s]?[:\s]+`?(\w+)`?\s+(?:for|in)\s+(\w[\w.]*)/);
			if (tmpPKMatch)
			{
				let tmpKey = tmpPKMatch[1];
				let tmpTable = tmpPKMatch[2].toLowerCase().replace(/\.csv$|\.tsv$|\.json$/, '');
				tmpResult.primaryKeys[tmpTable] = tmpKey;
			}

			// Also look for composite key patterns:
			// "composite `userId`, `movieId`, `timestamp` for ratings.csv"
			let tmpCompositeMatch = tmpLine.match(/composite\s+([^f]+)\s+for\s+(\w[\w.]*)/i);
			if (tmpCompositeMatch)
			{
				let tmpKeys = tmpCompositeMatch[1].match(/`(\w+)`/g);
				let tmpTable = tmpCompositeMatch[2].toLowerCase().replace(/\.csv$|\.tsv$|\.json$/, '');
				if (tmpKeys)
				{
					tmpResult.primaryKeys[tmpTable] = tmpKeys.map((pK) => pK.replace(/`/g, '')).join(', ');
				}
			}

			// Look for foreign key mentions: "foreignKey links/references TableName"
			let tmpFKMatch = tmpLine.match(/`(\w+)`\s+(?:links?|references?|joins?)\s+(?:\w+\s+)?(?:to\s+)?(\w[\w.]*)/i);
			if (tmpFKMatch)
			{
				let tmpKey = tmpFKMatch[1];
				let tmpRefTable = tmpFKMatch[2].toLowerCase().replace(/\.csv$|\.tsv$|\.json$/, '');
				if (!tmpResult.foreignKeys[tmpRefTable])
				{
					tmpResult.foreignKeys[tmpRefTable] = [];
				}
				tmpResult.foreignKeys[tmpRefTable].push(tmpKey);
			}

			// Look for load-order mentions: "Load X first ... then Y"
			let tmpLoadOrderMatch = tmpLine.match(/[Ll]oad\s+(\w[\w.]*)\s+first/);
			if (tmpLoadOrderMatch)
			{
				let tmpFirst = tmpLoadOrderMatch[1].toLowerCase().replace(/\.csv$|\.tsv$|\.json$/, '');
				if (tmpResult.loadOrder.indexOf(tmpFirst) < 0)
				{
					tmpResult.loadOrder.push(tmpFirst);
				}
			}
		}

		return tmpResult;
	}

	/**
	 * Generate an ingestion plan for a dataset.
	 * If a plan already exists on disk, returns it.
	 * Otherwise, auto-generates from file list and README metadata.
	 *
	 * @param {string} pFolderName - The dataset folder name
	 * @param {function} fCallback - Callback(pError, pPlan)
	 */
	generateIngestionPlan(pFolderName, fCallback)
	{
		let tmpDataset = this.getDiscoveredDatasetByName(pFolderName);

		if (!tmpDataset)
		{
			return fCallback(new Error(`Dataset not found: ${pFolderName}`));
		}

		let tmpDataDir = libPath.join(tmpDataset.FolderPath, 'data');

		// Check for existing plan
		let tmpExistingPlan = this.readIngestionPlan(tmpDataDir);
		if (tmpExistingPlan)
		{
			return fCallback(null, tmpExistingPlan);
		}

		let tmpSelf = this;

		// Resolve data files
		this.resolveDataFiles(tmpDataset.FolderPath,
			(pError, pFiles) =>
			{
				if (pError)
				{
					return fCallback(pError);
				}

				if (!pFiles || pFiles.length === 0)
				{
					return fCallback(null,
						{
							version: 1,
							generatedAt: new Date().toISOString(),
							modifiedAt: null,
							autoGenerated: true,
							files: []
						});
				}

				// Build base plan entries from file list
				let tmpIngestableFormats = { csv: true, tsv: true, json: true, text: true, xml: true, excel: true };
				let tmpPlanFiles = [];

				for (let i = 0; i < pFiles.length; i++)
				{
					let tmpFile = pFiles[i];
					let tmpInclude = !!tmpIngestableFormats[tmpFile.Format];
					let tmpRecordType = tmpSelf.deriveRecordType(tmpFile.FileName);
					let tmpDelimiter = '';

					if (tmpFile.Format === 'csv')
					{
						tmpDelimiter = ',';
					}
					else if (tmpFile.Format === 'tsv')
					{
						tmpDelimiter = '\t';
					}

					tmpPlanFiles.push(
						{
							fileName: tmpFile.FileName,
							include: tmpInclude,
							format: tmpFile.Format,
							delimiter: tmpDelimiter,
							recordType: tmpRecordType,
							order: i + 1,
							primaryKey: '',
							foreignKeys: [],
							notes: ''
						});
				}

				// Enrich from README if available
				try
				{
					let tmpReadmePath = libPath.join(tmpDataset.FolderPath, 'README.md');
					if (libFs.existsSync(tmpReadmePath))
					{
						let tmpReadmeContent = libFs.readFileSync(tmpReadmePath, 'utf8');
						let tmpReadme = tmpSelf.parseReadme(tmpReadmeContent);

						// Parse schema for per-file metadata
						let tmpSchemaFiles = tmpSelf.parseSchemaForFiles(tmpReadme.Schema);

						// Parse ingestion notes for keys and load order
						let tmpIngestionHints = tmpSelf.parseIngestionNotes(tmpReadme.IngestionNotes);

						// Match schema info to plan entries
						for (let i = 0; i < tmpPlanFiles.length; i++)
						{
							let tmpEntry = tmpPlanFiles[i];
							let tmpLowerType = tmpEntry.recordType.toLowerCase();
							let tmpLowerFileName = tmpEntry.fileName.toLowerCase();
							let tmpBaseFileName = libPath.basename(tmpLowerFileName);

							// Try to match by recordType or full filename
							let tmpSchemaMatch = tmpSchemaFiles[tmpLowerType]
								|| tmpSchemaFiles[tmpBaseFileName]
								|| tmpSchemaFiles[tmpBaseFileName.replace(/\.\w+$/, '')];

							if (tmpSchemaMatch)
							{
								// Schema info found — no direct mapping to primaryKey here,
								// but confirms this is a recognized file
							}

							// Match primary key from ingestion notes
							if (tmpIngestionHints.primaryKeys[tmpLowerType])
							{
								tmpEntry.primaryKey = tmpIngestionHints.primaryKeys[tmpLowerType];
							}

							// Match foreign keys
							if (tmpIngestionHints.foreignKeys[tmpLowerType])
							{
								tmpEntry.foreignKeys = tmpIngestionHints.foreignKeys[tmpLowerType];
							}
						}

						// Apply load order if available
						if (tmpIngestionHints.loadOrder.length > 0)
						{
							let tmpOrderMap = {};
							for (let i = 0; i < tmpIngestionHints.loadOrder.length; i++)
							{
								tmpOrderMap[tmpIngestionHints.loadOrder[i]] = i + 1;
							}

							// Reorder: items in loadOrder get low order numbers, others follow
							let tmpNextOrder = tmpIngestionHints.loadOrder.length + 1;
							for (let i = 0; i < tmpPlanFiles.length; i++)
							{
								let tmpLowerType = tmpPlanFiles[i].recordType.toLowerCase();
								if (tmpOrderMap[tmpLowerType] !== undefined)
								{
									tmpPlanFiles[i].order = tmpOrderMap[tmpLowerType];
								}
								else
								{
									tmpPlanFiles[i].order = tmpNextOrder++;
								}
							}
						}

						// Override delimiter from README DataFormat if all files share a format
						if (tmpReadme.DataFormat && tmpReadme.DataFormat.Delimiter)
						{
							for (let i = 0; i < tmpPlanFiles.length; i++)
							{
								if (tmpPlanFiles[i].format === 'csv' || tmpPlanFiles[i].format === 'tsv' || tmpPlanFiles[i].format === 'text')
								{
									tmpPlanFiles[i].delimiter = tmpReadme.DataFormat.Delimiter;
								}
							}
						}
					}
				}
				catch (pEnrichError)
				{
					tmpSelf.log.warn(`Ingestion plan enrichment failed for ${pFolderName}: ${pEnrichError.message}`);
				}

				// Sort by order
				tmpPlanFiles.sort((a, b) => a.order - b.order);

				let tmpPlan = {
					version: 1,
					generatedAt: new Date().toISOString(),
					modifiedAt: null,
					autoGenerated: true,
					files: tmpPlanFiles
				};

				// Write the plan to disk
				if (libFs.existsSync(tmpDataDir))
				{
					tmpSelf.writeIngestionPlan(tmpDataDir, tmpPlan);
				}

				return fCallback(null, tmpPlan);
			});
	}

	/**
	 * Ingest a single data file with decompression support.
	 *
	 * @param {object} pFile - Data file object from resolveDataFiles
	 * @param {object} pDataset - The discovered dataset
	 * @param {object} pOptions - Ingestion options { format, delimiter, type }
	 * @param {function} fCallback - Callback(pError, pResult)
	 */
	ingestSingleFile(pFile, pDataset, pOptions, fCallback)
	{
		let tmpSelf = this;
		let tmpFilePath = pFile.FullPath;

		this.fable.log.info(`SourceFolderScanner: ingesting ${pFile.FileName} from ${pDataset.FolderName}`);

		// Handle compressed .gz files
		if (pFile.Compressed && tmpFilePath.endsWith('.gz') && !tmpFilePath.endsWith('.tar.gz'))
		{
			let tmpDecompressedPath = tmpFilePath.slice(0, -3);

			let tmpInput = libFs.createReadStream(tmpFilePath);
			let tmpGunzip = libZlib.createGunzip();
			let tmpOutput = libFs.createWriteStream(tmpDecompressedPath);

			tmpInput.pipe(tmpGunzip).pipe(tmpOutput);

			tmpOutput.on('finish',
				() =>
				{
					tmpSelf.fable.RetoldFactoIngestEngine.ingestFile(
						tmpDecompressedPath,
						pDataset.IDDataset,
						pDataset.IDSource,
						pOptions,
						fCallback);
				});

			tmpOutput.on('error', (pErr) => fCallback(pErr));
			tmpGunzip.on('error', (pErr) => fCallback(pErr));
		}
		else if (!pFile.Compressed || pFile.Format !== 'archive')
		{
			this.fable.RetoldFactoIngestEngine.ingestFile(
				tmpFilePath,
				pDataset.IDDataset,
				pDataset.IDSource,
				pOptions,
				fCallback);
		}
		else
		{
			return fCallback(new Error(`Cannot directly ingest archive file ${pFile.FileName}. Extract first.`));
		}
	}

	/**
	 * Ingest a dataset's data files into the facto database.
	 * Supports both single-file (legacy) and multi-file plan-based ingestion.
	 *
	 * @param {string} pFolderName - The dataset folder name
	 * @param {object} pOptions - { fileName, format, useIngestionPlan }
	 * @param {function} fCallback - Callback(pError, pResult)
	 */
	ingestDataset(pFolderName, pOptions, fCallback)
	{
		let tmpDataset = this.getDiscoveredDatasetByName(pFolderName);

		if (!tmpDataset)
		{
			return fCallback(new Error(`Dataset not found: ${pFolderName}`));
		}

		if (!tmpDataset.IDDataset || !tmpDataset.IDSource)
		{
			// Auto-provision first
			return this.provisionDataset(pFolderName,
				(pProvError) =>
				{
					if (pProvError)
					{
						return fCallback(pProvError);
					}
					return this.ingestDataset(pFolderName, pOptions, fCallback);
				});
		}

		if (!tmpDataset.HasData)
		{
			return fCallback(new Error(`Dataset ${pFolderName} has no data files. Download first.`));
		}

		if (!this.fable.RetoldFactoIngestEngine)
		{
			return fCallback(new Error('IngestEngine not initialized'));
		}

		let tmpOptions = pOptions || {};
		let tmpSelf = this;

		// Check if we should use the ingestion plan
		let tmpDataDir = libPath.join(tmpDataset.FolderPath, 'data');
		let tmpExistingPlan = this.readIngestionPlan(tmpDataDir);
		let tmpUsePlan = tmpOptions.useIngestionPlan || (tmpExistingPlan && !tmpOptions.fileName);

		if (tmpUsePlan)
		{
			return this.ingestFromPlan(pFolderName, tmpExistingPlan, fCallback);
		}

		// Legacy single-file ingestion path
		let tmpFile = null;
		if (tmpOptions.fileName)
		{
			tmpFile = tmpDataset.DataFiles.find((f) => f.FileName === tmpOptions.fileName);
		}
		else
		{
			tmpFile = this.selectBestDataFile(tmpDataset.DataFiles);
		}

		if (!tmpFile)
		{
			return fCallback(new Error(`No suitable data file found in ${pFolderName}`));
		}

		this.ingestSingleFile(tmpFile, tmpDataset, tmpOptions,
			(pIngestError, pResult) =>
			{
				if (!pIngestError)
				{
					tmpDataset.Status = 'Ingested';
					tmpDataset.IngestedAt = new Date().toISOString();
				}
				return fCallback(pIngestError, pResult);
			});
	}

	/**
	 * Ingest multiple files from a dataset using its ingestion plan.
	 *
	 * @param {string} pFolderName - The dataset folder name
	 * @param {object|null} pPlan - Existing plan, or null to auto-generate
	 * @param {function} fCallback - Callback(pError, pResult)
	 */
	ingestFromPlan(pFolderName, pPlan, fCallback)
	{
		let tmpSelf = this;
		let tmpDataset = this.getDiscoveredDatasetByName(pFolderName);

		if (!tmpDataset)
		{
			return fCallback(new Error(`Dataset not found: ${pFolderName}`));
		}

		let tmpExecutePlan = (pPlanToUse) =>
		{
			// Filter to included files and sort by order
			let tmpIncluded = (pPlanToUse.files || [])
				.filter((pEntry) => pEntry.include)
				.sort((a, b) => (a.order || 0) - (b.order || 0));

			if (tmpIncluded.length === 0)
			{
				return fCallback(new Error(`Ingestion plan for ${pFolderName} has no included files.`));
			}

			tmpSelf.fable.log.info(`SourceFolderScanner: ingesting ${tmpIncluded.length} files from plan for ${pFolderName}`);

			let tmpAnticipate = tmpSelf.fable.newAnticipate();
			let tmpFileResults = [];
			let tmpFilesIngested = 0;
			let tmpFilesErrored = 0;
			let tmpTotalRecords = 0;

			for (let i = 0; i < tmpIncluded.length; i++)
			{
				let tmpPlanEntry = tmpIncluded[i];

				tmpAnticipate.anticipate(
					(fStep) =>
					{
						// Find the matching data file
						let tmpFile = tmpDataset.DataFiles.find(
							(pF) => pF.FileName === tmpPlanEntry.fileName);

						if (!tmpFile)
						{
							tmpSelf.fable.log.warn(`  Skipping ${tmpPlanEntry.fileName}: file not found`);
							tmpFilesErrored++;
							tmpFileResults.push(
								{
									fileName: tmpPlanEntry.fileName,
									recordType: tmpPlanEntry.recordType,
									recordsIngested: 0,
									error: 'File not found'
								});
							return fStep();
						}

						let tmpFileOptions = {
							format: tmpPlanEntry.format,
							type: tmpPlanEntry.recordType
						};
						if (tmpPlanEntry.delimiter)
						{
							tmpFileOptions.delimiter = tmpPlanEntry.delimiter;
						}

						tmpSelf.fable.log.info(`  [${tmpFilesIngested + tmpFilesErrored + 1}/${tmpIncluded.length}] ${tmpPlanEntry.fileName} as "${tmpPlanEntry.recordType}"`);

						tmpSelf.ingestSingleFile(tmpFile, tmpDataset, tmpFileOptions,
							(pIngestError, pResult) =>
							{
								if (pIngestError)
								{
									tmpFilesErrored++;
									tmpFileResults.push(
										{
											fileName: tmpPlanEntry.fileName,
											recordType: tmpPlanEntry.recordType,
											recordsIngested: 0,
											error: pIngestError.message
										});
								}
								else
								{
									tmpFilesIngested++;
									let tmpCount = (pResult && pResult.Ingested) ? pResult.Ingested : 0;
									tmpTotalRecords += tmpCount;
									tmpFileResults.push(
										{
											fileName: tmpPlanEntry.fileName,
											recordType: tmpPlanEntry.recordType,
											recordsIngested: tmpCount,
											error: null
										});
								}
								return fStep();
							});
					});
			}

			tmpAnticipate.wait(
				(pError) =>
				{
					if (tmpFilesIngested > 0)
					{
						tmpDataset.Status = 'Ingested';
						tmpDataset.IngestedAt = new Date().toISOString();
					}

					return fCallback(null,
						{
							Success: tmpFilesIngested > 0,
							FolderName: pFolderName,
							FilesIngested: tmpFilesIngested,
							FilesErrored: tmpFilesErrored,
							TotalRecords: tmpTotalRecords,
							FileResults: tmpFileResults
						});
				});
		};

		// Use provided plan or generate one
		if (pPlan)
		{
			return tmpExecutePlan(pPlan);
		}

		this.generateIngestionPlan(pFolderName,
			(pGenError, pGeneratedPlan) =>
			{
				if (pGenError)
				{
					return fCallback(pGenError);
				}
				return tmpExecutePlan(pGeneratedPlan);
			});
	}

	// ================================================================
	// Download Support
	// ================================================================

	/**
	 * Download data files for a dataset that has no cached data.
	 * Matches the folder name to the download-catalog.json.
	 *
	 * @param {string} pFolderName - The dataset folder name
	 * @param {function} fCallback - Callback(pError, pResult)
	 */
	downloadDataset(pFolderName, fCallback)
	{
		let tmpDataset = this.getDiscoveredDatasetByName(pFolderName);

		if (!tmpDataset)
		{
			return fCallback(new Error(`Dataset not found: ${pFolderName}`));
		}

		if (!this.fable.RetoldFactoDataLakeService)
		{
			return fCallback(new Error('DataLakeService not initialized'));
		}

		let tmpDataLake = this.fable.RetoldFactoDataLakeService;
		let tmpSelf = this;

		// Try to match folder name to a catalog entry
		let tmpCatalog = tmpDataLake.loadCatalog();
		if (!tmpCatalog)
		{
			return fCallback(new Error('Could not load download catalog'));
		}

		let tmpEntries = tmpDataLake.flattenCatalog(tmpCatalog, { id: pFolderName });

		if (tmpEntries.length === 0)
		{
			return fCallback(new Error(`No catalog entry found for ${pFolderName}. Cannot auto-download.`));
		}

		let tmpEntry = tmpEntries[0];

		// Override the data directory to point to our source_research data/ folder
		let tmpDataDir = libPath.join(tmpDataset.FolderPath, 'data');
		if (!libFs.existsSync(tmpDataDir))
		{
			libFs.mkdirSync(tmpDataDir, { recursive: true });
		}

		this.fable.log.info(`SourceFolderScanner: downloading ${pFolderName} via DataLakeService`);

		// Use DataLakeService's download methods directly
		tmpDataLake.downloadDataset(tmpEntry,
			(pError, pManifest) =>
			{
				if (pError)
				{
					return fCallback(pError);
				}

				// Re-scan the data files
				tmpSelf.resolveDataFiles(tmpDataset.FolderPath,
					(pFileError, pFiles) =>
					{
						tmpDataset.DataFiles = pFiles || [];
						tmpDataset.TotalDataSize = 0;
						for (let i = 0; i < tmpDataset.DataFiles.length; i++)
						{
							tmpDataset.TotalDataSize += tmpDataset.DataFiles[i].Size;
						}
						tmpDataset.HasData = tmpDataset.DataFiles.length > 0;
						tmpDataset.NeedsDownload = !tmpDataset.HasData;

						return fCallback(null,
							{
								Success: true,
								FolderName: pFolderName,
								FilesDownloaded: tmpDataset.DataFiles.length,
								TotalSize: tmpDataset.TotalDataSize
							});
					});
			});
	}

	// ================================================================
	// REST API Routes
	// ================================================================

	/**
	 * Format a byte size for display.
	 */
	formatSize(pBytes)
	{
		if (pBytes === 0)
		{
			return '0 B';
		}
		let tmpUnits = ['B', 'KB', 'MB', 'GB', 'TB'];
		let tmpIndex = Math.floor(Math.log(pBytes) / Math.log(1024));
		return `${(pBytes / Math.pow(1024, tmpIndex)).toFixed(1)} ${tmpUnits[tmpIndex]}`;
	}

	/**
	 * Connect REST API routes.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;
		let tmpSelf = this;

		// GET /facto/scanner/paths — list all scan paths
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/scanner/paths`,
			(pRequest, pResponse, fNext) =>
			{
				pResponse.send(
					{
						Count: tmpSelf.scanPaths.length,
						Paths: tmpSelf.scanPaths
					});
				return fNext();
			});

		// POST /facto/scanner/path — add a scan path
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/scanner/path`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpBody = pRequest.body || {};
				let tmpPath = tmpBody.Path;

				if (!tmpPath)
				{
					pResponse.send({ Error: 'Path is required' });
					return fNext();
				}

				tmpSelf.addScanPath(tmpPath,
					(pError, pResult) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message });
							return fNext();
						}
						pResponse.send({ Success: true, ScanResult: pResult });
						return fNext();
					});
			});

		// DELETE /facto/scanner/path — remove a scan path
		pOratorServiceServer.doDel(`${tmpRoutePrefix}/scanner/path`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpBody = pRequest.body || {};
				let tmpPath = tmpBody.Path;

				if (!tmpPath)
				{
					pResponse.send({ Error: 'Path is required' });
					return fNext();
				}

				tmpSelf.removeScanPath(tmpPath,
					(pError, pResult) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message });
							return fNext();
						}
						pResponse.send({ Success: true, Result: pResult });
						return fNext();
					});
			});

		// POST /facto/scanner/rescan — re-scan all paths or a specific one
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/scanner/rescan`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpBody = pRequest.body || {};

				if (tmpBody.Path)
				{
					tmpSelf.scanPath(tmpBody.Path,
						(pError, pResult) =>
						{
							if (pError)
							{
								pResponse.send({ Error: pError.message });
								return fNext();
							}
							pResponse.send({ Success: true, ScanResult: pResult });
							return fNext();
						});
				}
				else
				{
					tmpSelf.scanAllPaths(
						(pError, pResults) =>
						{
							if (pError)
							{
								pResponse.send({ Error: pError.message });
								return fNext();
							}
							pResponse.send({ Success: true, ScanResults: pResults });
							return fNext();
						});
				}
			});

		// GET /facto/scanner/datasets — list all discovered datasets
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/scanner/datasets`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpFilter = {};

				if (pRequest.query)
				{
					if (pRequest.query.status)
					{
						tmpFilter.status = pRequest.query.status;
					}
					if (pRequest.query.search)
					{
						tmpFilter.search = pRequest.query.search;
					}
					if (pRequest.query.hasData !== undefined)
					{
						tmpFilter.hasData = pRequest.query.hasData === 'true';
					}
				}

				let tmpDatasets = tmpSelf.getDiscoveredDatasets(tmpFilter);

				// Return summary view (omit large schema/description fields)
				let tmpSummaries = tmpDatasets.map(
					(pDs) =>
					{
						return (
							{
								FolderName: pDs.FolderName,
								Title: pDs.Title,
								Provider: pDs.Provider,
								License: pDs.License,
								Status: pDs.Status,
								HasData: pDs.HasData,
								NeedsDownload: pDs.NeedsDownload,
								DataFileCount: pDs.DataFiles.length,
								TotalDataSize: pDs.TotalDataSize,
								TotalDataSizeFormatted: tmpSelf.formatSize(pDs.TotalDataSize),
								DataFormat: pDs.DataFormat,
								RecordCount: pDs.RecordCount,
								IDSource: pDs.IDSource,
								IDDataset: pDs.IDDataset,
								DiscoveredAt: pDs.DiscoveredAt
							});
					});

				pResponse.send({ Count: tmpSummaries.length, Datasets: tmpSummaries });
				return fNext();
			});

		// GET /facto/scanner/dataset/:FolderName — get full dataset detail
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/scanner/dataset/:FolderName`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpDataset = tmpSelf.getDiscoveredDatasetByName(pRequest.params.FolderName);

				if (!tmpDataset)
				{
					pResponse.send({ Error: `Dataset not found: ${pRequest.params.FolderName}` });
					return fNext();
				}

				pResponse.send(tmpDataset);
				return fNext();
			});

		// POST /facto/scanner/dataset/:FolderName/provision — provision a dataset
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/scanner/dataset/:FolderName/provision`,
			(pRequest, pResponse, fNext) =>
			{
				tmpSelf.provisionDataset(pRequest.params.FolderName,
					(pError, pResult) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message });
							return fNext();
						}
						pResponse.send(pResult);
						return fNext();
					});
			});

		// GET /facto/scanner/dataset/:FolderName/ingestion-plan — get or generate ingestion plan
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/scanner/dataset/:FolderName/ingestion-plan`,
			(pRequest, pResponse, fNext) =>
			{
				tmpSelf.generateIngestionPlan(pRequest.params.FolderName,
					(pError, pPlan) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message });
							return fNext();
						}
						pResponse.send(pPlan);
						return fNext();
					});
			});

		// PUT /facto/scanner/dataset/:FolderName/ingestion-plan — save edited ingestion plan
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/scanner/dataset/:FolderName/ingestion-plan`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpDataset = tmpSelf.getDiscoveredDatasetByName(pRequest.params.FolderName);

				if (!tmpDataset)
				{
					pResponse.send({ Error: `Dataset not found: ${pRequest.params.FolderName}` });
					return fNext();
				}

				let tmpPlan = pRequest.body;

				if (!tmpPlan || !Array.isArray(tmpPlan.files))
				{
					pResponse.send({ Error: 'Invalid plan: files array is required' });
					return fNext();
				}

				// Mark as user-modified
				tmpPlan.autoGenerated = false;
				tmpPlan.modifiedAt = new Date().toISOString();

				let tmpDataDir = libPath.join(tmpDataset.FolderPath, 'data');
				tmpSelf.writeIngestionPlan(tmpDataDir, tmpPlan);

				pResponse.send({ Success: true, Plan: tmpPlan });
				return fNext();
			});

		// POST /facto/scanner/dataset/:FolderName/ingest — ingest a dataset
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/scanner/dataset/:FolderName/ingest`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpOptions = pRequest.body || {};

				tmpSelf.ingestDataset(pRequest.params.FolderName, tmpOptions,
					(pError, pResult) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message });
							return fNext();
						}
						pResponse.send(pResult);
						return fNext();
					});
			});

		// POST /facto/scanner/dataset/:FolderName/download — download data if missing
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/scanner/dataset/:FolderName/download`,
			(pRequest, pResponse, fNext) =>
			{
				tmpSelf.downloadDataset(pRequest.params.FolderName,
					(pError, pResult) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message });
							return fNext();
						}
						pResponse.send(pResult);
						return fNext();
					});
			});

		// POST /facto/scanner/provision-all — provision all discovered datasets
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/scanner/provision-all`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpDatasets = tmpSelf.getDiscoveredDatasets({ status: 'Discovered' });
				let tmpAnticipate = tmpSelf.fable.newAnticipate();
				let tmpProvisioned = 0;
				let tmpErrors = 0;

				for (let i = 0; i < tmpDatasets.length; i++)
				{
					let tmpFolderName = tmpDatasets[i].FolderName;

					tmpAnticipate.anticipate(
						(fStep) =>
						{
							tmpSelf.provisionDataset(tmpFolderName,
								(pError) =>
								{
									if (pError)
									{
										tmpErrors++;
									}
									else
									{
										tmpProvisioned++;
									}
									return fStep();
								});
						});
				}

				tmpAnticipate.wait(
					(pError) =>
					{
						pResponse.send(
							{
								Success: true,
								Provisioned: tmpProvisioned,
								Errors: tmpErrors,
								Total: tmpDatasets.length
							});
						return fNext();
					});
			});

		this.fable.log.info(`SourceFolderScanner routes connected at ${tmpRoutePrefix}/scanner/*`);
	}
}

module.exports = RetoldFactoSourceFolderScanner;
module.exports.serviceType = 'RetoldFactoSourceFolderScanner';
module.exports.default_configuration = defaultSourceFolderScannerOptions;
