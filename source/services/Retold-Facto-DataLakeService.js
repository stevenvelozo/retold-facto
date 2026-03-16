/**
 * Retold Facto - Data Lake Service
 *
 * Manages the offline data lake: downloading public datasets into a
 * well-organized folder structure for stable, repeatable ingestion.
 * Supports http_file, http_archive, git_clone, and rest_api (via fetch_steps) methods.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');
const libFs = require('fs');
const libPath = require('path');
const libHttps = require('https');
const libHttp = require('http');
const libUrl = require('url');
const libCrypto = require('crypto');
const libChildProcess = require('child_process');
const libZlib = require('zlib');

const defaultDataLakeOptions = (
	{
		CatalogPath: null,
		DataDir: null,
		UserAgent: 'RetoldFacto/1.0 (data-coagulation-platform; https://github.com/stevenvelozo/retold-facto)'
	});

// Map catalog category keys to folder names
const CATEGORY_FOLDER_MAP = (
	{
		'01_foundational_reference': '01-foundational-reference',
		'02_geographic_location': '02-geographic-location',
		'03_people_cultural_entities': '03-people-cultural-entities',
		'04_business_industry': '04-business-industry',
		'05_media_entertainment': '05-media-entertainment'
	});

// Methods we can actually download automatically
const DOWNLOADABLE_METHODS = ['http_file', 'http_archive', 'git_clone', 'rest_api'];

class RetoldFactoDataLakeService extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultDataLakeOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoDataLakeService';
	}

	// ================================================================
	// Catalog Loading
	// ================================================================

	loadCatalog()
	{
		let tmpCatalogPath = this.options.CatalogPath;
		if (!tmpCatalogPath)
		{
			this.log.error('No CatalogPath configured for DataLakeService.');
			return null;
		}

		if (!libFs.existsSync(tmpCatalogPath))
		{
			this.log.error(`Catalog not found at: ${tmpCatalogPath}`);
			return null;
		}

		let tmpRaw = libFs.readFileSync(tmpCatalogPath, 'utf8');
		return JSON.parse(tmpRaw);
	}

	/**
	 * Flatten the catalog into a list of { categoryKey, categoryFolder, dataset } objects,
	 * applying optional filters.
	 *
	 * @param {object} pCatalog - The parsed catalog JSON
	 * @param {object} pFilters - Optional { tier, category, id }
	 * @returns {Array}
	 */
	flattenCatalog(pCatalog, pFilters)
	{
		let tmpFilters = pFilters || {};
		let tmpEntries = [];

		let tmpCategoryKeys = Object.keys(pCatalog.categories);
		for (let c = 0; c < tmpCategoryKeys.length; c++)
		{
			let tmpCategoryKey = tmpCategoryKeys[c];

			if (tmpFilters.category && tmpCategoryKey !== tmpFilters.category)
			{
				continue;
			}

			let tmpCategoryFolder = CATEGORY_FOLDER_MAP[tmpCategoryKey] || tmpCategoryKey.replace(/_/g, '-');
			let tmpDatasets = pCatalog.categories[tmpCategoryKey].datasets;

			for (let d = 0; d < tmpDatasets.length; d++)
			{
				let tmpDataset = tmpDatasets[d];

				if (tmpFilters.id && tmpDataset.id !== tmpFilters.id)
				{
					continue;
				}

				if (tmpFilters.tier !== null && tmpFilters.tier !== undefined && tmpDataset.tier > tmpFilters.tier)
				{
					continue;
				}

				tmpEntries.push(
					{
						categoryKey: tmpCategoryKey,
						categoryFolder: tmpCategoryFolder,
						dataset: tmpDataset
					});
			}
		}

		return tmpEntries;
	}

	// ================================================================
	// Manifest Management
	// ================================================================

	getDatasetDir(pCategoryFolder, pDatasetId)
	{
		return libPath.join(this.options.DataDir, pCategoryFolder, pDatasetId);
	}

	getManifestPath(pDatasetDir)
	{
		return libPath.join(pDatasetDir, '_manifest.json');
	}

	readManifest(pDatasetDir)
	{
		let tmpManifestPath = this.getManifestPath(pDatasetDir);
		if (libFs.existsSync(tmpManifestPath))
		{
			try
			{
				return JSON.parse(libFs.readFileSync(tmpManifestPath, 'utf8'));
			}
			catch (pError)
			{
				return null;
			}
		}
		return null;
	}

	writeManifest(pDatasetDir, pManifest)
	{
		let tmpManifestPath = this.getManifestPath(pDatasetDir);
		libFs.writeFileSync(tmpManifestPath, JSON.stringify(pManifest, null, '\t'), 'utf8');
	}

	/**
	 * Scan a dataset directory and build a file inventory (excluding _manifest.json).
	 */
	inventoryFiles(pDatasetDir)
	{
		let tmpFiles = [];

		if (!libFs.existsSync(pDatasetDir))
		{
			return tmpFiles;
		}

		let tmpEntries = libFs.readdirSync(pDatasetDir);
		for (let i = 0; i < tmpEntries.length; i++)
		{
			if (tmpEntries[i] === '_manifest.json')
			{
				continue;
			}

			let tmpFullPath = libPath.join(pDatasetDir, tmpEntries[i]);
			let tmpStat = libFs.statSync(tmpFullPath);

			if (tmpStat.isFile())
			{
				tmpFiles.push(
					{
						name: tmpEntries[i],
						size: tmpStat.size
					});
			}
			else if (tmpStat.isDirectory())
			{
				let tmpDirSize = this.getDirectorySize(tmpFullPath);
				tmpFiles.push(
					{
						name: tmpEntries[i] + '/',
						size: tmpDirSize
					});
			}
		}

		return tmpFiles;
	}

	getDirectorySize(pDirPath)
	{
		let tmpTotal = 0;

		try
		{
			let tmpEntries = libFs.readdirSync(pDirPath);
			for (let i = 0; i < tmpEntries.length; i++)
			{
				let tmpFullPath = libPath.join(pDirPath, tmpEntries[i]);
				let tmpStat = libFs.statSync(tmpFullPath);

				if (tmpStat.isFile())
				{
					tmpTotal += tmpStat.size;
				}
				else if (tmpStat.isDirectory())
				{
					tmpTotal += this.getDirectorySize(tmpFullPath);
				}
			}
		}
		catch (pError)
		{
			// Skip unreadable dirs
		}

		return tmpTotal;
	}

	// ================================================================
	// Dataset Status
	// ================================================================

	getDatasetStatus(pEntry)
	{
		let tmpDatasetDir = this.getDatasetDir(pEntry.categoryFolder, pEntry.dataset.id);
		let tmpManifest = this.readManifest(tmpDatasetDir);

		if (!tmpManifest)
		{
			return 'missing';
		}
		if (tmpManifest.status === 'error')
		{
			return 'error';
		}
		if (tmpManifest.status === 'complete')
		{
			return 'cached';
		}
		return 'partial';
	}

	/**
	 * Check if a dataset entry is downloadable by this service.
	 * rest_api entries are only downloadable if they have fetch_steps defined.
	 */
	isDownloadable(pDataset)
	{
		if (pDataset.method === 'rest_api')
		{
			return Array.isArray(pDataset.fetch_steps) && pDataset.fetch_steps.length > 0;
		}
		return DOWNLOADABLE_METHODS.indexOf(pDataset.method) > -1;
	}

	// ================================================================
	// Size Formatting
	// ================================================================

	parseSize(pSizeStr)
	{
		if (!pSizeStr || pSizeStr === 'N/A' || pSizeStr === 'varies' || pSizeStr === 'small' || pSizeStr === 'large')
		{
			return 0;
		}

		// Handle compound sizes like "companyfacts ~10GB, submissions ~8GB"
		if (pSizeStr.indexOf(',') > -1)
		{
			let tmpParts = pSizeStr.split(',');
			let tmpTotal = 0;
			for (let i = 0; i < tmpParts.length; i++)
			{
				tmpTotal += this.parseSize(tmpParts[i].trim());
			}
			return tmpTotal;
		}

		// Handle "cities15000: 2MB, allCountries: 1.5GB" style
		if (pSizeStr.indexOf(':') > -1)
		{
			let tmpColonParts = pSizeStr.split(':');
			if (tmpColonParts.length >= 2)
			{
				return this.parseSize(tmpColonParts[tmpColonParts.length - 1].trim());
			}
		}

		// Strip leading text like "~" or "companyfacts "
		let tmpMatch = pSizeStr.match(/([\d.]+)\s*(KB|MB|GB|TB)/i);
		if (!tmpMatch)
		{
			return 0;
		}

		let tmpValue = parseFloat(tmpMatch[1]);
		let tmpUnit = tmpMatch[2].toUpperCase();
		let tmpMultipliers = { 'KB': 1024, 'MB': 1024 * 1024, 'GB': 1024 * 1024 * 1024, 'TB': 1024 * 1024 * 1024 * 1024 };
		return Math.round(tmpValue * (tmpMultipliers[tmpUnit] || 1));
	}

	formatSize(pBytes)
	{
		if (pBytes === 0)
		{
			return '???';
		}
		if (pBytes < 1024)
		{
			return pBytes + ' B';
		}
		if (pBytes < 1024 * 1024)
		{
			return (pBytes / 1024).toFixed(1) + ' KB';
		}
		if (pBytes < 1024 * 1024 * 1024)
		{
			return (pBytes / (1024 * 1024)).toFixed(1) + ' MB';
		}
		return (pBytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
	}

	// ================================================================
	// HTTP Download
	// ================================================================

	/**
	 * Download a single URL to a local file path.
	 * Returns a Promise that resolves with { path, size }.
	 * Follows redirects up to 5 times.
	 */
	downloadFile(pUrl, pDestPath, pRedirects, pHeaders)
	{
		let tmpRedirects = pRedirects || 0;
		if (tmpRedirects > 5)
		{
			return Promise.reject(new Error(`Too many redirects for ${pUrl}`));
		}

		let tmpSelf = this;
		return new Promise(
			(fResolve, fReject) =>
			{
				let tmpParsed = new URL(pUrl);
				let tmpLib = tmpParsed.protocol === 'https:' ? libHttps : libHttp;

				let tmpRequestOptions = (
					{
						headers: Object.assign(
						{
							'User-Agent': tmpSelf.options.UserAgent
						}, pHeaders || {})
					});

				let tmpRequest = tmpLib.get(pUrl, tmpRequestOptions,
					(pResponse) =>
					{
						// Follow redirects
						if (pResponse.statusCode >= 300 && pResponse.statusCode < 400 && pResponse.headers.location)
						{
							let tmpRedirectUrl = pResponse.headers.location;
							if (!tmpRedirectUrl.startsWith('http'))
							{
								tmpRedirectUrl = tmpParsed.protocol + '//' + tmpParsed.host + tmpRedirectUrl;
							}
							pResponse.resume();
							return tmpSelf.downloadFile(tmpRedirectUrl, pDestPath, tmpRedirects + 1, pHeaders)
								.then(fResolve)
								.catch(fReject);
						}

						if (pResponse.statusCode !== 200)
						{
							pResponse.resume();
							return fReject(new Error(`HTTP ${pResponse.statusCode} for ${pUrl}`));
						}

						// Ensure parent directory exists
						let tmpDir = libPath.dirname(pDestPath);
						if (!libFs.existsSync(tmpDir))
						{
							libFs.mkdirSync(tmpDir, { recursive: true });
						}

						let tmpFile = libFs.createWriteStream(pDestPath);
						let tmpDownloaded = 0;
						let tmpContentLength = parseInt(pResponse.headers['content-length'] || '0', 10);
						let tmpLastProgress = 0;

						pResponse.on('data',
							(pChunk) =>
							{
								tmpDownloaded += pChunk.length;

								if (tmpContentLength > 0)
								{
									let tmpProgress = Math.floor((tmpDownloaded / tmpContentLength) * 100);
									if (tmpProgress >= tmpLastProgress + 10)
									{
										tmpLastProgress = tmpProgress;
										process.stdout.write(`  ... ${tmpProgress}% (${tmpSelf.formatSize(tmpDownloaded)})\r`);
									}
								}
							});

						pResponse.pipe(tmpFile);

						tmpFile.on('finish',
							() =>
							{
								tmpFile.close();
								if (tmpContentLength > 0)
								{
									process.stdout.write('                                          \r');
								}
								fResolve({ path: pDestPath, size: tmpDownloaded });
							});

						tmpFile.on('error',
							(pError) =>
							{
								libFs.unlink(pDestPath, () => {});
								fReject(pError);
							});
					});

				tmpRequest.on('error', fReject);

				tmpRequest.setTimeout(300000,
					() =>
					{
						tmpRequest.destroy();
						fReject(new Error(`Timeout downloading ${pUrl}`));
					});
			});
	}

	/**
	 * Fetch a URL and return the parsed JSON body.
	 * Returns a Promise that resolves with the parsed object.
	 */
	fetchJson(pUrl, pHeaders)
	{
		let tmpSelf = this;
		return new Promise(
			(fResolve, fReject) =>
			{
				let tmpParsed = new URL(pUrl);
				let tmpLib = tmpParsed.protocol === 'https:' ? libHttps : libHttp;

				let tmpRequestHeaders = Object.assign(
					{
						'User-Agent': tmpSelf.options.UserAgent,
						'Accept': 'application/json'
					}, pHeaders || {});

				let tmpRequestOptions = (
					{
						headers: tmpRequestHeaders
					});

				let tmpRequest = tmpLib.get(pUrl, tmpRequestOptions,
					(pResponse) =>
					{
						// Follow redirects
						if (pResponse.statusCode >= 300 && pResponse.statusCode < 400 && pResponse.headers.location)
						{
							let tmpRedirectUrl = pResponse.headers.location;
							if (!tmpRedirectUrl.startsWith('http'))
							{
								tmpRedirectUrl = tmpParsed.protocol + '//' + tmpParsed.host + tmpRedirectUrl;
							}
							pResponse.resume();
							return tmpSelf.fetchJson(tmpRedirectUrl, pHeaders)
								.then(fResolve)
								.catch(fReject);
						}

						if (pResponse.statusCode !== 200)
						{
							pResponse.resume();
							return fReject(new Error(`HTTP ${pResponse.statusCode} for ${pUrl}`));
						}

						let tmpChunks = [];
						pResponse.on('data', (pChunk) => { tmpChunks.push(pChunk); });
						pResponse.on('end',
							() =>
							{
								try
								{
									let tmpBody = Buffer.concat(tmpChunks).toString('utf8');
									fResolve(JSON.parse(tmpBody));
								}
								catch (pError)
								{
									fReject(new Error(`Failed to parse JSON from ${pUrl}: ${pError.message}`));
								}
							});
						pResponse.on('error', fReject);
					});

				tmpRequest.on('error', fReject);

				tmpRequest.setTimeout(60000,
					() =>
					{
						tmpRequest.destroy();
						fReject(new Error(`Timeout fetching ${pUrl}`));
					});
			});
	}

	/**
	 * Fetch a URL and return the raw text body.
	 * Returns a Promise that resolves with a string.
	 */
	fetchText(pUrl, pHeaders)
	{
		let tmpSelf = this;
		return new Promise(
			(fResolve, fReject) =>
			{
				let tmpParsed = new URL(pUrl);
				let tmpLib = tmpParsed.protocol === 'https:' ? libHttps : libHttp;

				let tmpRequestHeaders = Object.assign(
					{
						'User-Agent': tmpSelf.options.UserAgent
					}, pHeaders || {});

				let tmpRequestOptions = (
					{
						headers: tmpRequestHeaders
					});

				let tmpRequest = tmpLib.get(pUrl, tmpRequestOptions,
					(pResponse) =>
					{
						if (pResponse.statusCode >= 300 && pResponse.statusCode < 400 && pResponse.headers.location)
						{
							let tmpRedirectUrl = pResponse.headers.location;
							if (!tmpRedirectUrl.startsWith('http'))
							{
								tmpRedirectUrl = tmpParsed.protocol + '//' + tmpParsed.host + tmpRedirectUrl;
							}
							pResponse.resume();
							return tmpSelf.fetchText(tmpRedirectUrl, pHeaders)
								.then(fResolve)
								.catch(fReject);
						}

						if (pResponse.statusCode !== 200)
						{
							pResponse.resume();
							return fReject(new Error(`HTTP ${pResponse.statusCode} for ${pUrl}`));
						}

						let tmpChunks = [];
						pResponse.on('data', (pChunk) => { tmpChunks.push(pChunk); });
						pResponse.on('end',
							() =>
							{
								fResolve(Buffer.concat(tmpChunks).toString('utf8'));
							});
						pResponse.on('error', fReject);
					});

				tmpRequest.on('error', fReject);

				tmpRequest.setTimeout(60000,
					() =>
					{
						tmpRequest.destroy();
						fReject(new Error(`Timeout fetching ${pUrl}`));
					});
			});
	}

	// ================================================================
	// Archive Extraction
	// ================================================================

	extractArchive(pArchivePath, pDestDir)
	{
		return new Promise(
			(fResolve, fReject) =>
			{
				let tmpFilename = libPath.basename(pArchivePath).toLowerCase();
				let tmpCommand = null;

				if (tmpFilename.endsWith('.zip'))
				{
					tmpCommand = `unzip -o -q "${pArchivePath}" -d "${pDestDir}"`;
				}
				else if (tmpFilename.endsWith('.tar.gz') || tmpFilename.endsWith('.tgz'))
				{
					tmpCommand = `tar -xzf "${pArchivePath}" -C "${pDestDir}"`;
				}
				else if (tmpFilename.endsWith('.tar.bz2') || tmpFilename.endsWith('.tbz2'))
				{
					tmpCommand = `tar -xjf "${pArchivePath}" -C "${pDestDir}"`;
				}
				else if (tmpFilename.endsWith('.tar.xz'))
				{
					tmpCommand = `tar -xJf "${pArchivePath}" -C "${pDestDir}"`;
				}
				else if (tmpFilename.endsWith('.tar.zst') || tmpFilename.endsWith('.tar.zstd'))
				{
					tmpCommand = `zstd -d "${pArchivePath}" --stdout | tar -xf - -C "${pDestDir}"`;
				}
				else if (tmpFilename.endsWith('.gz') && !tmpFilename.endsWith('.tar.gz'))
				{
					tmpCommand = `gunzip -k "${pArchivePath}"`;
				}
				else
				{
					return fResolve();
				}

				this.log.info(`  Extracting: ${tmpFilename}`);
				libChildProcess.exec(tmpCommand, { maxBuffer: 50 * 1024 * 1024 },
					(pError, pStdout, pStderr) =>
					{
						if (pError)
						{
							this.log.warn(`  Extract warning: ${pError.message}`);
						}
						fResolve();
					});
			});
	}

	// ================================================================
	// Git Clone
	// ================================================================

	gitClone(pUrl, pDestDir)
	{
		let tmpSelf = this;
		return new Promise(
			(fResolve, fReject) =>
			{
				let tmpRepoName = libPath.basename(pUrl, '.git').replace(/\.git$/, '');
				let tmpCloneTarget = libPath.join(pDestDir, tmpRepoName);

				if (libFs.existsSync(tmpCloneTarget))
				{
					tmpSelf.log.info(`  Updating existing clone: ${tmpRepoName}`);
					libChildProcess.exec(`git -C "${tmpCloneTarget}" pull --ff-only`, { timeout: 120000 },
						(pError) =>
						{
							if (pError)
							{
								tmpSelf.log.warn(`  Git pull warning: ${pError.message}`);
							}
							fResolve({ path: tmpCloneTarget });
						});
				}
				else
				{
					tmpSelf.log.info(`  Cloning: ${pUrl}`);
					libChildProcess.exec(`git clone --depth 1 "${pUrl}" "${tmpCloneTarget}"`, { timeout: 300000 },
						(pError) =>
						{
							if (pError)
							{
								return fReject(new Error(`Git clone failed for ${pUrl}: ${pError.message}`));
							}
							fResolve({ path: tmpCloneTarget });
						});
				}
			});
	}

	// ================================================================
	// URL / Filename Helpers
	// ================================================================

	filenameFromUrl(pUrl)
	{
		try
		{
			let tmpParsed = new URL(pUrl);
			let tmpPathname = tmpParsed.pathname;
			let tmpFilename = libPath.basename(tmpPathname);

			if (!tmpFilename || tmpFilename === '/')
			{
				tmpFilename = 'download_' + libCrypto.createHash('md5').update(pUrl).digest('hex').substring(0, 8);
			}

			if (!tmpFilename.match(/\.\w{2,5}$/))
			{
				if (pUrl.indexOf('.csv') > -1)
				{
					tmpFilename += '.csv';
				}
				else if (pUrl.indexOf('.json') > -1)
				{
					tmpFilename += '.json';
				}
				else if (pUrl.indexOf('.zip') > -1)
				{
					tmpFilename += '.zip';
				}
			}

			return tmpFilename;
		}
		catch (pError)
		{
			return 'download_' + libCrypto.createHash('md5').update(pUrl).digest('hex').substring(0, 8);
		}
	}

	isDirectDownloadUrl(pUrl)
	{
		let tmpLower = pUrl.toLowerCase();

		if (tmpLower.match(/\.(zip|gz|tgz|tar|csv|tsv|json|xml|txt|xls|xlsx|dat|bz2|xz|zst|zstd|sqlite|sql)$/))
		{
			return true;
		}

		if (tmpLower.indexOf('/download') > -1 || tmpLower.indexOf('/data/') > -1)
		{
			return true;
		}

		if (tmpLower.indexOf('raw.githubusercontent.com') > -1 || tmpLower.indexOf('/releases/download/') > -1)
		{
			return true;
		}

		if (tmpLower.indexOf('download.geonames.org') > -1 || tmpLower.indexOf('datasets.imdbws.com') > -1)
		{
			return true;
		}

		if (tmpLower.indexOf('datahub.io') > -1 && tmpLower.indexOf('/r/') > -1)
		{
			return true;
		}

		if (tmpLower.indexOf('standards-oui.ieee.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('rfc-editor.org/rfc-index') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('data.iana.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('nasdaqtrader.com') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('files.usaspending.gov') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('sec.gov/files/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('openlibrary.org/data/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('gutenberg.org/cache/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('ourairports.com/data/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('iso639-3.sil.org') > -1 && tmpLower.indexOf('/downloads/') > -1)
		{
			return true;
		}

		if (tmpLower.match(/[?&]format=(csv|json|xml)/))
		{
			return true;
		}
		if (tmpLower.indexOf('goldencopy.gleif.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('enterpriseefiling.fcc.gov') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('irs.gov/pub/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('onetcenter.org/dl_files/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('downloads.dbpedia.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('data.metabrainz.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('archive.org/download/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('planet.openstreetmap.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('static.openfoodfacts.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('static.openbeautyfacts.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('static.openpetfoodfacts.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('api.crossref.org/snapshots/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('loc.gov/cds/downloads/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('sec.gov/Archives/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('discogs-data-dumps') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('databus.dbpedia.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('aqs.epa.gov/aqsweb/airdata/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('download.open.fda.gov') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('fdc.nal.usda.gov/fdc-datasets/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('ncei.noaa.gov/pub/data/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('fenixservices.fao.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('ftp.cdc.gov/pub/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('accessdata.fda.gov/cder/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('cdstar.eva.mpg.de') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('nces.ed.gov/ipeds/datacenter/data/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('storage.googleapis.com/pantheon-public-data') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('ndownloader.figshare.com') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('gist.githubusercontent.com') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('cms.gov/files/zip/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('data.bls.gov/cew/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('dumps.wikimedia.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('cbwinslow/baseballdatabank') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('onetcenter.org/taxonomy/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('bulks-faostat.fao.org') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('nces.ed.gov/ccd/') > -1)
		{
			return true;
		}
		if (tmpLower.indexOf('nces.ed.gov/surveys/pss/') > -1)
		{
			return true;
		}

		return false;
	}

	isArchiveFilename(pFilename)
	{
		let tmpLower = pFilename.toLowerCase();
		return tmpLower.endsWith('.zip') ||
			tmpLower.endsWith('.tar.gz') ||
			tmpLower.endsWith('.tgz') ||
			tmpLower.endsWith('.tar.bz2') ||
			tmpLower.endsWith('.tar.xz') ||
			tmpLower.endsWith('.tar.zst') ||
			tmpLower.endsWith('.tar.zstd') ||
			tmpLower.endsWith('.gz');
	}

	// ================================================================
	// Download Method Handlers
	// ================================================================

	async downloadHttpFiles(pDataset, pDatasetDir, pManifest)
	{
		let tmpUrls = pDataset.urls || [];
		let tmpDatasetHeaders = pDataset.headers || null;

		for (let i = 0; i < tmpUrls.length; i++)
		{
			let tmpUrl = tmpUrls[i];

			if (tmpUrl.indexOf('{') > -1)
			{
				this.log.info(`  Skipping template URL: ${tmpUrl}`);
				continue;
			}

			let tmpFilename = this.filenameFromUrl(tmpUrl);
			let tmpDestPath = libPath.join(pDatasetDir, tmpFilename);

			this.log.info(`  Downloading: ${tmpFilename}`);
			try
			{
				let tmpResult = await this.downloadFile(tmpUrl, tmpDestPath, 0, tmpDatasetHeaders);
				pManifest.urls_downloaded.push(tmpUrl);
				this.log.info(`  OK: ${this.formatSize(tmpResult.size)}`);
			}
			catch (pError)
			{
				this.log.error(`  Failed: ${tmpUrl} — ${pError.message}`);
			}
		}
	}

	async downloadHttpArchives(pDataset, pDatasetDir, pManifest)
	{
		let tmpUrls = pDataset.urls || [];
		let tmpDatasetHeaders = pDataset.headers || null;

		for (let i = 0; i < tmpUrls.length; i++)
		{
			let tmpUrl = tmpUrls[i];

			if (!this.isDirectDownloadUrl(tmpUrl))
			{
				this.log.info(`  Skipping non-direct URL (browse manually): ${tmpUrl}`);
				continue;
			}

			let tmpFilename = this.filenameFromUrl(tmpUrl);
			let tmpDestPath = libPath.join(pDatasetDir, tmpFilename);

			this.log.info(`  Downloading: ${tmpFilename}`);
			try
			{
				let tmpResult = await this.downloadFile(tmpUrl, tmpDestPath, 0, tmpDatasetHeaders);
				pManifest.urls_downloaded.push(tmpUrl);
				this.log.info(`  OK: ${this.formatSize(tmpResult.size)}`);

				if (this.isArchiveFilename(tmpFilename) && !pDataset.skip_extract)
				{
					await this.extractArchive(tmpDestPath, pDatasetDir);
				}
			}
			catch (pError)
			{
				this.log.error(`  Failed: ${tmpUrl} — ${pError.message}`);
			}
		}
	}

	async downloadGitClone(pDataset, pDatasetDir, pManifest)
	{
		let tmpUrls = pDataset.urls || [];

		for (let i = 0; i < tmpUrls.length; i++)
		{
			let tmpUrl = tmpUrls[i];

			if (!tmpUrl.match(/github\.com|gitlab\.com|bitbucket\.org/))
			{
				this.log.info(`  Skipping non-git URL: ${tmpUrl}`);
				continue;
			}

			try
			{
				await this.gitClone(tmpUrl, pDatasetDir);
				pManifest.urls_downloaded.push(tmpUrl);
				this.log.info(`  OK: cloned`);
			}
			catch (pError)
			{
				this.log.error(`  Failed: ${tmpUrl} — ${pError.message}`);
			}
		}
	}

	// ================================================================
	// REST API Download (fetch_steps)
	// ================================================================

	/**
	 * Download a dataset via its fetch_steps DSL.
	 */
	async downloadRestApi(pDataset, pDatasetDir, pManifest)
	{
		let tmpSteps = pDataset.fetch_steps;
		if (!Array.isArray(tmpSteps) || tmpSteps.length === 0)
		{
			this.log.warn(`  No fetch_steps defined for ${pDataset.id} — skipping`);
			return;
		}

		await this.executeFetchSteps(tmpSteps, pDatasetDir, pManifest);
	}

	/**
	 * Execute an array of fetch_steps sequentially.
	 * Each step can reference files created by previous steps.
	 */
	async executeFetchSteps(pSteps, pDatasetDir, pManifest)
	{
		for (let i = 0; i < pSteps.length; i++)
		{
			let tmpStep = pSteps[i];
			let tmpAction = tmpStep.action;

			if (tmpAction === 'get_json')
			{
				await this.executeGetJson(tmpStep, pDatasetDir, pManifest);
			}
			else if (tmpAction === 'get_text')
			{
				await this.executeGetText(tmpStep, pDatasetDir, pManifest);
			}
			else if (tmpAction === 'for_each')
			{
				await this.executeForEach(tmpStep, pDatasetDir, pManifest);
			}
			else if (tmpAction === 'paginate')
			{
				await this.executePaginate(tmpStep, pDatasetDir, pManifest);
			}
			else if (tmpAction === 'merge_pages')
			{
				await this.executeMergePages(tmpStep, pDatasetDir, pManifest);
			}
			else if (tmpAction === 'for_each_in_pages')
			{
				await this.executeForEachInPages(tmpStep, pDatasetDir, pManifest);
			}
			else
			{
				this.log.warn(`  Unknown fetch_step action: ${tmpAction}`);
			}
		}
	}

	/**
	 * get_json: Fetch a URL, save the JSON response to a file.
	 */
	async executeGetJson(pStep, pDatasetDir, pManifest)
	{
		let tmpUrl = pStep.url;
		let tmpSaveAs = pStep.save_as;
		let tmpHeaders = pStep.headers || {};

		this.log.info(`  Fetching: ${tmpUrl}`);

		let tmpData = await this.fetchJson(tmpUrl, tmpHeaders);
		let tmpDestPath = libPath.join(pDatasetDir, tmpSaveAs);

		// Ensure subdirectory exists
		let tmpDir = libPath.dirname(tmpDestPath);
		if (!libFs.existsSync(tmpDir))
		{
			libFs.mkdirSync(tmpDir, { recursive: true });
		}

		libFs.writeFileSync(tmpDestPath, JSON.stringify(tmpData, null, '\t'), 'utf8');
		pManifest.urls_downloaded.push(tmpUrl);
		this.log.info(`  Saved: ${tmpSaveAs} (${this.formatSize(Buffer.byteLength(JSON.stringify(tmpData, null, '\t')))})`);

		if (pStep.delay_ms)
		{
			await this.delay(pStep.delay_ms);
		}
	}

	/**
	 * get_text: Fetch a URL, save the raw text to a file.
	 */
	async executeGetText(pStep, pDatasetDir, pManifest)
	{
		let tmpUrl = pStep.url;
		let tmpSaveAs = pStep.save_as;
		let tmpHeaders = pStep.headers || {};

		this.log.info(`  Fetching: ${tmpUrl}`);

		let tmpData = await this.fetchText(tmpUrl, tmpHeaders);
		let tmpDestPath = libPath.join(pDatasetDir, tmpSaveAs);

		let tmpDir = libPath.dirname(tmpDestPath);
		if (!libFs.existsSync(tmpDir))
		{
			libFs.mkdirSync(tmpDir, { recursive: true });
		}

		libFs.writeFileSync(tmpDestPath, tmpData, 'utf8');
		pManifest.urls_downloaded.push(tmpUrl);
		this.log.info(`  Saved: ${tmpSaveAs} (${this.formatSize(Buffer.byteLength(tmpData))})`);

		if (pStep.delay_ms)
		{
			await this.delay(pStep.delay_ms);
		}
	}

	/**
	 * for_each: Read a previously-saved JSON array file, iterate items,
	 * fetch a templated URL per item, and save results.
	 */
	async executeForEach(pStep, pDatasetDir, pManifest)
	{
		let tmpSourcePath = libPath.join(pDatasetDir, pStep.source_file);
		if (!libFs.existsSync(tmpSourcePath))
		{
			this.log.error(`  for_each: source file not found: ${pStep.source_file}`);
			return;
		}

		let tmpSourceData = JSON.parse(libFs.readFileSync(tmpSourcePath, 'utf8'));
		if (!Array.isArray(tmpSourceData))
		{
			this.log.error(`  for_each: source file is not a JSON array: ${pStep.source_file}`);
			return;
		}

		let tmpField = pStep.field;
		let tmpUrlTemplate = pStep.url_template;
		let tmpSaveAsTemplate = pStep.save_as;
		let tmpDelayMs = pStep.delay_ms || 100;
		let tmpHeaders = pStep.headers || {};
		let tmpSuccessCount = 0;
		let tmpErrorCount = 0;

		this.log.info(`  Iterating ${tmpSourceData.length} items from ${pStep.source_file}...`);

		for (let i = 0; i < tmpSourceData.length; i++)
		{
			let tmpItem = tmpSourceData[i];
			let tmpValue = tmpField ? tmpItem[tmpField] : (typeof tmpItem === 'string' ? tmpItem : JSON.stringify(tmpItem));

			// Expand template variables
			let tmpUrl = this.expandTemplate(tmpUrlTemplate, tmpItem, tmpValue);
			let tmpSaveAs = this.expandTemplate(tmpSaveAsTemplate, tmpItem, tmpValue);
			let tmpDestPath = libPath.join(pDatasetDir, tmpSaveAs);

			// Ensure subdirectory exists
			let tmpDir = libPath.dirname(tmpDestPath);
			if (!libFs.existsSync(tmpDir))
			{
				libFs.mkdirSync(tmpDir, { recursive: true });
			}

			let tmpSkipExisting = pStep.skip_existing !== false;
			let tmpSkipCount = 0;

			try
			{
				// Skip if file already exists (for resumability)
				if (tmpSkipExisting && libFs.existsSync(tmpDestPath))
				{
					tmpSkipCount++;
					if ((i + 1) % 100 === 0 || i === tmpSourceData.length - 1)
					{
						process.stdout.write(`  ... ${i + 1}/${tmpSourceData.length} (${tmpSuccessCount} ok, ${tmpSkipCount} cached, ${tmpErrorCount} err)\r`);
					}
					continue;
				}

				let tmpData = await this.fetchJson(tmpUrl, tmpHeaders);
				libFs.writeFileSync(tmpDestPath, JSON.stringify(tmpData, null, '\t'), 'utf8');
				pManifest.urls_downloaded.push(tmpUrl);
				tmpSuccessCount++;

				// Progress every 10 items or on last item
				if ((i + 1) % 10 === 0 || i === tmpSourceData.length - 1)
				{
					process.stdout.write(`  ... ${i + 1}/${tmpSourceData.length} (${tmpSuccessCount} ok, ${tmpSkipCount} cached, ${tmpErrorCount} err)\r`);
				}
			}
			catch (pError)
			{
				tmpErrorCount++;
				this.log.warn(`  Failed: ${tmpValue} — ${pError.message}`);
			}

			if (tmpDelayMs > 0 && i < tmpSourceData.length - 1)
			{
				await this.delay(tmpDelayMs);
			}
		}

		process.stdout.write('                                                              \r');
		this.log.info(`  for_each complete: ${tmpSuccessCount} ok, ${tmpSkipCount} cached, ${tmpErrorCount} errors`);
	}

	/**
	 * paginate: Fetch pages from a URL using offset or page-based pagination.
	 */
	async executePaginate(pStep, pDatasetDir, pManifest)
	{
		let tmpUrlTemplate = pStep.url_template;
		let tmpSaveAsTemplate = pStep.save_as;
		let tmpDelayMs = pStep.delay_ms || 100;
		let tmpHeaders = pStep.headers || {};
		let tmpMaxPages = pStep.max_pages || 1000;
		let tmpStartPage = pStep.start_page || 1;
		let tmpPageSize = pStep.page_size || 100;
		let tmpResultField = pStep.result_field;
		let tmpStopWhenEmpty = pStep.stop_when_empty !== false;

		this.log.info(`  Paginating: ${tmpUrlTemplate}`);

		let tmpPage = tmpStartPage;
		let tmpOffset = 0;
		let tmpTotalSaved = 0;

		while (tmpPage < tmpStartPage + tmpMaxPages)
		{
			let tmpUrl = tmpUrlTemplate
				.replace(/\{page\}/g, String(tmpPage))
				.replace(/\{offset\}/g, String(tmpOffset))
				.replace(/\{page_size\}/g, String(tmpPageSize));

			let tmpSaveAs = tmpSaveAsTemplate
				.replace(/\{page\}/g, String(tmpPage))
				.replace(/\{offset\}/g, String(tmpOffset));

			let tmpDestPath = libPath.join(pDatasetDir, tmpSaveAs);

			let tmpDir = libPath.dirname(tmpDestPath);
			if (!libFs.existsSync(tmpDir))
			{
				libFs.mkdirSync(tmpDir, { recursive: true });
			}

			// Skip if page file already exists (for resumability)
			if (libFs.existsSync(tmpDestPath))
			{
				tmpTotalSaved++;
				tmpPage++;
				tmpOffset += tmpPageSize;
				continue;
			}

			try
			{
				let tmpData = await this.fetchJson(tmpUrl, tmpHeaders);
				libFs.writeFileSync(tmpDestPath, JSON.stringify(tmpData, null, '\t'), 'utf8');
				pManifest.urls_downloaded.push(tmpUrl);
				tmpTotalSaved++;

				// Check if we should stop
				if (tmpStopWhenEmpty)
				{
					let tmpResults = tmpResultField ? tmpData[tmpResultField] : tmpData;
					if (Array.isArray(tmpResults) && tmpResults.length === 0)
					{
						this.log.info(`  Pagination complete: empty page at page ${tmpPage}`);
						break;
					}
				}

				process.stdout.write(`  ... page ${tmpPage} (${tmpTotalSaved} saved)\r`);
			}
			catch (pError)
			{
				this.log.warn(`  Pagination stopped at page ${tmpPage}: ${pError.message}`);
				break;
			}

			tmpPage++;
			tmpOffset += tmpPageSize;

			if (tmpDelayMs > 0)
			{
				await this.delay(tmpDelayMs);
			}
		}

		process.stdout.write('                                                              \r');
		this.log.info(`  Pagination complete: ${tmpTotalSaved} pages saved`);
	}

	/**
	 * merge_pages: Read all paginated JSON files matching a glob pattern
	 * and merge them into a single JSON array file.
	 */
	async executeMergePages(pStep, pDatasetDir, pManifest)
	{
		let tmpPattern = pStep.source_pattern; // e.g. "pages/shows_page_{page}.json"
		let tmpSaveAs = pStep.save_as;
		let tmpItemField = pStep.item_field; // optional: extract field from each page item (e.g. for search results)
		let tmpDestPath = libPath.join(pDatasetDir, tmpSaveAs);

		// Skip if already exists
		if (libFs.existsSync(tmpDestPath))
		{
			this.log.info(`  merge_pages: ${tmpSaveAs} already exists, skipping`);
			return;
		}

		let tmpMerged = [];
		let tmpPage = 0;
		// Check if pages start at 0 or 1
		let tmpTestFile0 = libPath.join(pDatasetDir, tmpPattern.replace(/\{page\}/g, '0'));
		if (!libFs.existsSync(tmpTestFile0))
		{
			tmpPage = 1;
		}

		while (true)
		{
			let tmpFilename = tmpPattern.replace(/\{page\}/g, String(tmpPage));
			let tmpFilePath = libPath.join(pDatasetDir, tmpFilename);

			if (!libFs.existsSync(tmpFilePath))
			{
				break;
			}

			let tmpData = JSON.parse(libFs.readFileSync(tmpFilePath, 'utf8'));
			if (Array.isArray(tmpData))
			{
				if (tmpItemField)
				{
					for (let i = 0; i < tmpData.length; i++)
					{
						tmpMerged.push(tmpData[i][tmpItemField] || tmpData[i]);
					}
				}
				else
				{
					tmpMerged = tmpMerged.concat(tmpData);
				}
			}

			tmpPage++;
		}

		libFs.writeFileSync(tmpDestPath, JSON.stringify(tmpMerged), 'utf8');
		this.log.info(`  merge_pages: merged ${tmpPage} pages into ${tmpSaveAs} (${tmpMerged.length} items)`);
	}

	/**
	 * for_each_in_pages: Iterate over items across multiple paginated JSON files
	 * and fetch a URL per item. Skips items whose output file already exists.
	 */
	async executeForEachInPages(pStep, pDatasetDir, pManifest)
	{
		let tmpPagePattern = pStep.source_pattern; // e.g. "pages/shows_page_{page}.json"
		let tmpField = pStep.field; // field to extract from each item for URL template
		let tmpItemField = pStep.item_field; // optional: unwrap item (e.g. search results have {show: {...}})
		let tmpUrlTemplate = pStep.url_template;
		let tmpSaveAsTemplate = pStep.save_as;
		let tmpDelayMs = pStep.delay_ms || 100;
		let tmpHeaders = pStep.headers || {};
		let tmpSuccessCount = 0;
		let tmpSkipCount = 0;
		let tmpErrorCount = 0;
		let tmpTotalItems = 0;

		// Count total items first — try page 0 then page 1 to find the start
		let tmpPage = 0;
		let tmpAllItems = [];
		// Check if pages start at 0 or 1
		let tmpTestFile0 = libPath.join(pDatasetDir, tmpPagePattern.replace(/\{page\}/g, '0'));
		if (!libFs.existsSync(tmpTestFile0))
		{
			tmpPage = 1;
		}
		while (true)
		{
			let tmpFilename = tmpPagePattern.replace(/\{page\}/g, String(tmpPage));
			let tmpFilePath = libPath.join(pDatasetDir, tmpFilename);

			if (!libFs.existsSync(tmpFilePath))
			{
				break;
			}

			let tmpData = JSON.parse(libFs.readFileSync(tmpFilePath, 'utf8'));
			if (Array.isArray(tmpData))
			{
				for (let i = 0; i < tmpData.length; i++)
				{
					let tmpItem = tmpItemField ? (tmpData[i][tmpItemField] || tmpData[i]) : tmpData[i];
					tmpAllItems.push(tmpItem);
				}
			}
			tmpPage++;
		}

		tmpTotalItems = tmpAllItems.length;
		this.log.info(`  for_each_in_pages: ${tmpTotalItems} items across ${tmpPage} pages`);

		for (let i = 0; i < tmpAllItems.length; i++)
		{
			let tmpItem = tmpAllItems[i];
			let tmpValue = tmpField ? tmpItem[tmpField] : (typeof tmpItem === 'string' ? tmpItem : JSON.stringify(tmpItem));

			let tmpUrl = this.expandTemplate(tmpUrlTemplate, tmpItem, tmpValue);
			let tmpSaveAs = this.expandTemplate(tmpSaveAsTemplate, tmpItem, tmpValue);
			let tmpDestPath = libPath.join(pDatasetDir, tmpSaveAs);

			// Ensure subdirectory exists
			let tmpDir = libPath.dirname(tmpDestPath);
			if (!libFs.existsSync(tmpDir))
			{
				libFs.mkdirSync(tmpDir, { recursive: true });
			}

			// Skip if already exists
			if (libFs.existsSync(tmpDestPath))
			{
				tmpSkipCount++;
				if ((i + 1) % 500 === 0)
				{
					process.stdout.write(`  ... ${i + 1}/${tmpTotalItems} (${tmpSuccessCount} ok, ${tmpSkipCount} cached, ${tmpErrorCount} err)\r`);
				}
				continue;
			}

			try
			{
				let tmpData = await this.fetchJson(tmpUrl, tmpHeaders);
				libFs.writeFileSync(tmpDestPath, JSON.stringify(tmpData, null, '\t'), 'utf8');
				pManifest.urls_downloaded.push(tmpUrl);
				tmpSuccessCount++;

				if ((i + 1) % 10 === 0 || i === tmpTotalItems - 1)
				{
					process.stdout.write(`  ... ${i + 1}/${tmpTotalItems} (${tmpSuccessCount} ok, ${tmpSkipCount} cached, ${tmpErrorCount} err)\r`);
				}
			}
			catch (pError)
			{
				tmpErrorCount++;
				if (tmpErrorCount <= 10)
				{
					this.log.warn(`  Failed: ${tmpValue} — ${pError.message}`);
				}
			}

			if (tmpDelayMs > 0)
			{
				await this.delay(tmpDelayMs);
			}
		}

		process.stdout.write('                                                              \r');
		this.log.info(`  for_each_in_pages complete: ${tmpSuccessCount} ok, ${tmpSkipCount} cached, ${tmpErrorCount} errors`);
	}

	/**
	 * Expand template variables in a string.
	 * Supports {value}, {item.fieldName}
	 */
	expandTemplate(pTemplate, pItem, pValue)
	{
		let tmpResult = pTemplate.replace(/\{value\}/g, String(pValue));

		// Replace {item.fieldName} patterns
		tmpResult = tmpResult.replace(/\{item\.(\w+)\}/g,
			(pMatch, pFieldName) =>
			{
				return pItem && pItem[pFieldName] !== undefined ? String(pItem[pFieldName]) : pMatch;
			});

		return tmpResult;
	}

	/**
	 * Simple delay helper.
	 */
	delay(pMs)
	{
		return new Promise((fResolve) => { setTimeout(fResolve, pMs); });
	}

	// ================================================================
	// Download Dispatcher
	// ================================================================

	/**
	 * Download a single dataset entry.
	 * Returns a Promise that resolves with a manifest object.
	 */
	async downloadDataset(pEntry)
	{
		let tmpDataset = pEntry.dataset;
		let tmpDatasetDir = this.getDatasetDir(pEntry.categoryFolder, tmpDataset.id);
		let tmpManifest = (
			{
				id: tmpDataset.id,
				name: tmpDataset.name,
				category: pEntry.categoryKey,
				tier: tmpDataset.tier,
				method: tmpDataset.method,
				license: tmpDataset.license,
				urls_downloaded: [],
				download_date: new Date().toISOString(),
				files: [],
				total_size: 0,
				status: 'in_progress'
			});

		// Ensure dataset directory exists
		if (!libFs.existsSync(tmpDatasetDir))
		{
			libFs.mkdirSync(tmpDatasetDir, { recursive: true });
		}

		try
		{
			if (tmpDataset.method === 'http_file')
			{
				await this.downloadHttpFiles(tmpDataset, tmpDatasetDir, tmpManifest);
			}
			else if (tmpDataset.method === 'http_archive')
			{
				await this.downloadHttpArchives(tmpDataset, tmpDatasetDir, tmpManifest);
			}
			else if (tmpDataset.method === 'git_clone')
			{
				await this.downloadGitClone(tmpDataset, tmpDatasetDir, tmpManifest);
			}
			else if (tmpDataset.method === 'rest_api')
			{
				await this.downloadRestApi(tmpDataset, tmpDatasetDir, tmpManifest);
			}

			// Build file inventory
			tmpManifest.files = this.inventoryFiles(tmpDatasetDir);
			tmpManifest.total_size = 0;
			for (let i = 0; i < tmpManifest.files.length; i++)
			{
				tmpManifest.total_size += tmpManifest.files[i].size;
			}

			tmpManifest.status = 'complete';
		}
		catch (pError)
		{
			tmpManifest.status = 'error';
			tmpManifest.error = pError.message;
			this.log.error(`  ERROR: ${pError.message}`);
		}

		// Write manifest
		this.writeManifest(tmpDatasetDir, tmpManifest);
		return tmpManifest;
	}
}

module.exports = RetoldFactoDataLakeService;
module.exports.default_options = defaultDataLakeOptions;
