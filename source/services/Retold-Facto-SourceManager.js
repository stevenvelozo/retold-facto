/**
 * Retold Facto - Source Manager Service
 *
 * Manages data sources and their supporting documentation.
 * Provides endpoints for source CRUD beyond the auto-generated Meadow endpoints,
 * including documentation management and active/inactive toggling.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const defaultSourceManagerOptions = (
	{
		RoutePrefix: '/facto'
	});

class RetoldFactoSourceManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultSourceManagerOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoSourceManager';
	}

	/**
	 * Connect REST API routes for source management.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// GET /facto/source/by-hash/:Hash -- look up a source by its human-readable Hash
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/by-hash/:Hash`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpHash = pRequest.params.Hash;
				if (!tmpHash)
				{
					pResponse.send({ Error: 'Hash parameter is required' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Source.query.clone()
					.addFilter('Hash', tmpHash)
					.addFilter('Deleted', 0);

				this.fable.DAL.Source.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						if (!pRecords || pRecords.length === 0)
						{
							pResponse.send({ Error: `No source found with Hash "${tmpHash}"` });
							return fNext();
						}
						pResponse.send({ Source: pRecords[0] });
						return fNext();
					});
			});

		// GET /facto/sources/active -- list all active (non-deleted) sources
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/sources/active`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized', Sources: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Source.query.clone()
					.addFilter('Deleted', 0)
					.addFilter('Active', 1);

				this.fable.DAL.Source.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error listing active sources: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Sources: [] });
							return fNext();
						}
						pResponse.send({ Active: true, Count: pRecords.length, Sources: pRecords });
						return fNext();
					});
			});

		// PUT /facto/source/:IDSource/activate -- mark a source as active
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/source/:IDSource/activate`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Source.query.clone()
					.addRecord({ IDSource: tmpIDSource, Active: 1 });

				this.fable.DAL.Source.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error activating source ${tmpIDSource}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Source: pRecord });
						return fNext();
					});
			});

		// PUT /facto/source/:IDSource/deactivate -- mark a source as inactive
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/source/:IDSource/deactivate`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Source.query.clone()
					.addRecord({ IDSource: tmpIDSource, Active: 0 });

				this.fable.DAL.Source.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error deactivating source ${tmpIDSource}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Source: pRecord });
						return fNext();
					});
			});

		// GET /facto/source/:IDSource/documentation -- list documentation for a source
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/:IDSource/documentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter', Documentation: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceDocumentation)
				{
					pResponse.send({ Error: 'SourceDocumentation DAL not initialized', Documentation: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.SourceDocumentation.query.clone()
					.addFilter('IDSource', tmpIDSource)
					.addFilter('Deleted', 0);

				this.fable.DAL.SourceDocumentation.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error listing documentation for source ${tmpIDSource}: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Documentation: [] });
							return fNext();
						}
						pResponse.send({ IDSource: tmpIDSource, Count: pRecords.length, Documentation: pRecords });
						return fNext();
					});
			});

		// GET /facto/source/:IDSource/summary -- get a source with its stats
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/:IDSource/summary`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Source)
				{
					pResponse.send({ Error: 'Source DAL not initialized' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpResult = { IDSource: tmpIDSource, Source: false, RecordCount: 0, DatasetCount: 0, DocumentationCount: 0 };

				// Load the source record
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.Source.query.clone()
							.addFilter('IDSource', tmpIDSource);
						this.fable.DAL.Source.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (!pError && pRecord)
								{
									tmpResult.Source = pRecord;
								}
								return fStep();
							});
					});

				// Count records from this source
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.Record)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.Record.query.clone()
							.addFilter('IDSource', tmpIDSource)
							.addFilter('Deleted', 0);
						this.fable.DAL.Record.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.RecordCount = pCount;
								}
								return fStep();
							});
					});

				// Count datasets linked to this source
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.DatasetSource)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.DatasetSource.query.clone()
							.addFilter('IDSource', tmpIDSource)
							.addFilter('Deleted', 0);
						this.fable.DAL.DatasetSource.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.DatasetCount = pCount;
								}
								return fStep();
							});
					});

				// Count documentation entries
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.SourceDocumentation)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.SourceDocumentation.query.clone()
							.addFilter('IDSource', tmpIDSource)
							.addFilter('Deleted', 0);
						this.fable.DAL.SourceDocumentation.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.DocumentationCount = pCount;
								}
								return fStep();
							});
					});

				tmpAnticipate.wait(
					(pError) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send(tmpResult);
						return fNext();
					});
			});

		// POST /facto/source/:IDSource/documentation -- create a documentation record
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/source/:IDSource/documentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceDocumentation)
				{
					pResponse.send({ Error: 'SourceDocumentation DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpRecord =
				{
					IDSource: tmpIDSource,
					Name: tmpBody.Name || 'Untitled',
					DocumentType: tmpBody.DocumentType || 'markdown',
					MimeType: tmpBody.MimeType || 'text/markdown',
					StorageKey: '',
					Description: tmpBody.Description || '',
					Content: tmpBody.Content || ''
				};

				let tmpQuery = this.fable.DAL.SourceDocumentation.query.clone()
					.addRecord(tmpRecord);

				this.fable.DAL.SourceDocumentation.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pCreatedRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error creating documentation for source ${tmpIDSource}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Documentation: pCreatedRecord });
						return fNext();
					});
			});

		// GET /facto/source/:IDSource/documentation/:IDSourceDocumentation -- read a single doc
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/:IDSource/documentation/:IDSourceDocumentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				let tmpIDDoc = parseInt(pRequest.params.IDSourceDocumentation, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1 || isNaN(tmpIDDoc) || tmpIDDoc < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource or IDSourceDocumentation parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceDocumentation)
				{
					pResponse.send({ Error: 'SourceDocumentation DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.SourceDocumentation.query.clone()
					.addFilter('IDSourceDocumentation', tmpIDDoc)
					.addFilter('IDSource', tmpIDSource)
					.addFilter('Deleted', 0);

				this.fable.DAL.SourceDocumentation.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						if (!pRecord)
						{
							pResponse.send({ Error: `Documentation ${tmpIDDoc} not found for source ${tmpIDSource}` });
							return fNext();
						}
						pResponse.send({ Documentation: pRecord });
						return fNext();
					});
			});

		// PUT /facto/source/:IDSource/documentation/:IDSourceDocumentation -- update a doc
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/source/:IDSource/documentation/:IDSourceDocumentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				let tmpIDDoc = parseInt(pRequest.params.IDSourceDocumentation, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1 || isNaN(tmpIDDoc) || tmpIDDoc < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource or IDSourceDocumentation parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceDocumentation)
				{
					pResponse.send({ Error: 'SourceDocumentation DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpUpdateRecord = { IDSourceDocumentation: tmpIDDoc };
				if (tmpBody.hasOwnProperty('Name')) tmpUpdateRecord.Name = tmpBody.Name;
				if (tmpBody.hasOwnProperty('Content')) tmpUpdateRecord.Content = tmpBody.Content;
				if (tmpBody.hasOwnProperty('Description')) tmpUpdateRecord.Description = tmpBody.Description;
				if (tmpBody.hasOwnProperty('DocumentType')) tmpUpdateRecord.DocumentType = tmpBody.DocumentType;

				let tmpQuery = this.fable.DAL.SourceDocumentation.query.clone()
					.addRecord(tmpUpdateRecord);

				this.fable.DAL.SourceDocumentation.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pUpdatedRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error updating documentation ${tmpIDDoc}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Documentation: pUpdatedRecord });
						return fNext();
					});
			});

		// DELETE /facto/source/:IDSource/documentation/:IDSourceDocumentation -- soft-delete a doc
		pOratorServiceServer.doDel(`${tmpRoutePrefix}/source/:IDSource/documentation/:IDSourceDocumentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				let tmpIDDoc = parseInt(pRequest.params.IDSourceDocumentation, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1 || isNaN(tmpIDDoc) || tmpIDDoc < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource or IDSourceDocumentation parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceDocumentation)
				{
					pResponse.send({ Error: 'SourceDocumentation DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.SourceDocumentation.query.clone()
					.addRecord({ IDSourceDocumentation: tmpIDDoc, Deleted: 1, DeleteDate: new Date().toISOString() });

				this.fable.DAL.SourceDocumentation.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error deleting documentation ${tmpIDDoc}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Deleted: tmpIDDoc });
						return fNext();
					});
			});

		// GET /facto/source/:IDSource/catalog-context -- reverse-lookup catalog entries linked to this source
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/:IDSource/catalog-context`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter', CatalogEntries: [], DatasetDefinitions: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Error: 'CatalogDatasetDefinition DAL not initialized', CatalogEntries: [], DatasetDefinitions: [] });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpResult = { IDSource: tmpIDSource, CatalogEntries: [], DatasetDefinitions: [] };

				// Find all CatalogDatasetDefinition records linked to this source
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
							.addFilter('IDSource', tmpIDSource)
							.addFilter('Deleted', 0);

						this.fable.DAL.CatalogDatasetDefinition.doReads(tmpQuery,
							(pError, pQuery, pRecords) =>
							{
								if (!pError && pRecords)
								{
									tmpResult.DatasetDefinitions = pRecords;
								}
								return fStep();
							});
					});

				tmpAnticipate.wait(
					(pError) =>
					{
						if (pError || tmpResult.DatasetDefinitions.length === 0)
						{
							pResponse.send(tmpResult);
							return fNext();
						}

						// Collect unique catalog entry IDs
						let tmpEntryIDs = {};
						for (let i = 0; i < tmpResult.DatasetDefinitions.length; i++)
						{
							let tmpEntryID = tmpResult.DatasetDefinitions[i].IDSourceCatalogEntry;
							if (tmpEntryID && tmpEntryID > 0)
							{
								tmpEntryIDs[tmpEntryID] = true;
							}
						}

						let tmpEntryIDList = Object.keys(tmpEntryIDs);
						if (tmpEntryIDList.length === 0)
						{
							pResponse.send(tmpResult);
							return fNext();
						}

						// Load each catalog entry
						let tmpEntryAnticipate = this.fable.newAnticipate();
						for (let i = 0; i < tmpEntryIDList.length; i++)
						{
							let tmpEntryID = parseInt(tmpEntryIDList[i], 10);
							tmpEntryAnticipate.anticipate(
								(fEntryStep) =>
								{
									let tmpEntryQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
										.addFilter('IDSourceCatalogEntry', tmpEntryID);

									this.fable.DAL.SourceCatalogEntry.doRead(tmpEntryQuery,
										(pEntryError, pEntryQuery, pEntry) =>
										{
											if (!pEntryError && pEntry)
											{
												tmpResult.CatalogEntries.push(pEntry);
											}
											return fEntryStep();
										});
								});
						}

						tmpEntryAnticipate.wait(
							(pEntryError) =>
							{
								pResponse.send(tmpResult);
								return fNext();
							});
					});
			});

		// GET /facto/catalog/source-links -- returns a map of IDSourceCatalogEntry -> IDSource for all provisioned entries
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/catalog/source-links`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Links: {} });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
					.addFilter('Deleted', 0);

				this.fable.DAL.CatalogDatasetDefinition.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						let tmpLinks = {};
						if (!pError && pRecords)
						{
							for (let i = 0; i < pRecords.length; i++)
							{
								let tmpRec = pRecords[i];
								if (tmpRec.IDSource && tmpRec.IDSource > 0 && tmpRec.IDSourceCatalogEntry)
								{
									tmpLinks[tmpRec.IDSourceCatalogEntry] = tmpRec.IDSource;
								}
							}
						}
						pResponse.send({ Links: tmpLinks });
						return fNext();
					});
			});

		// POST /facto/source/:IDSource/documentation/upload -- upload a file (image, pdf, etc.)
		// Body: { Filename, ContentType, Data } where Data is base64-encoded file content
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/source/:IDSource/documentation/upload`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				if (isNaN(tmpIDSource) || tmpIDSource < 1)
				{
					pResponse.send({ Error: 'Invalid IDSource parameter' });
					return fNext();
				}

				let tmpFilename = pRequest.body && pRequest.body.Filename;
				let tmpData = pRequest.body && pRequest.body.Data;
				if (!tmpFilename || !tmpData)
				{
					pResponse.send({ Error: 'Filename and Data (base64) are required' });
					return fNext();
				}

				let tmpPath = require('path');
				let tmpFS = require('fs');

				// Sanitize filename: keep only alphanumeric, hyphens, underscores, dots
				let tmpSafeFilename = tmpFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
				// Prefix with timestamp to avoid collisions
				let tmpTimestamp = Date.now();
				let tmpFinalFilename = tmpTimestamp + '-' + tmpSafeFilename;

				// Build target directory: data/source-docs/{IDSource}/
				let tmpDataDir = this.fable.settings.DataDirectory || tmpPath.join(process.cwd(), 'data');
				let tmpSourceDocsDir = tmpPath.join(tmpDataDir, 'source-docs', String(tmpIDSource));

				// Ensure directory exists
				tmpFS.mkdirSync(tmpSourceDocsDir, { recursive: true });

				// Decode base64 and write
				let tmpBuffer = Buffer.from(tmpData, 'base64');
				let tmpFilePath = tmpPath.join(tmpSourceDocsDir, tmpFinalFilename);

				tmpFS.writeFile(tmpFilePath, tmpBuffer,
					(pError) =>
					{
						if (pError)
						{
							this.fable.log.error(`SourceManager error writing file ${tmpFilePath}: ${pError}`);
							pResponse.send({ Error: 'Failed to write file: ' + pError.message });
							return fNext();
						}

						let tmpURL = `${tmpRoutePrefix}/source/${tmpIDSource}/documentation/files/${tmpFinalFilename}`;
						pResponse.send({ Success: true, URL: tmpURL, Filename: tmpFinalFilename });
						return fNext();
					});
			});

		// GET /facto/source/:IDSource/documentation/files/:Filename -- serve an uploaded file
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/source/:IDSource/documentation/files/:Filename`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSource = parseInt(pRequest.params.IDSource, 10);
				let tmpFilename = pRequest.params.Filename;
				if (isNaN(tmpIDSource) || tmpIDSource < 1 || !tmpFilename)
				{
					pResponse.send(404, { Error: 'Not found' });
					return fNext();
				}

				let tmpPath = require('path');
				let tmpFS = require('fs');

				// Sanitize to prevent path traversal
				let tmpSafeFilename = tmpPath.basename(tmpFilename);
				let tmpDataDir = this.fable.settings.DataDirectory || tmpPath.join(process.cwd(), 'data');
				let tmpFilePath = tmpPath.join(tmpDataDir, 'source-docs', String(tmpIDSource), tmpSafeFilename);

				if (!tmpFS.existsSync(tmpFilePath))
				{
					pResponse.send(404, { Error: 'File not found' });
					return fNext();
				}

				// Determine content type from extension
				let tmpExt = tmpPath.extname(tmpSafeFilename).toLowerCase();
				let tmpContentTypes =
				{
					'.png': 'image/png',
					'.jpg': 'image/jpeg',
					'.jpeg': 'image/jpeg',
					'.gif': 'image/gif',
					'.webp': 'image/webp',
					'.svg': 'image/svg+xml',
					'.pdf': 'application/pdf',
					'.md': 'text/markdown',
					'.txt': 'text/plain'
				};
				let tmpContentType = tmpContentTypes[tmpExt] || 'application/octet-stream';

				let tmpFileData = tmpFS.readFileSync(tmpFilePath);
				pResponse.setHeader('Content-Type', tmpContentType);
				pResponse.setHeader('Content-Length', tmpFileData.length);
				pResponse.writeHead(200);
				pResponse.write(tmpFileData);
				pResponse.end();
				return fNext();
			});

		this.fable.log.info(`SourceManager routes connected at ${tmpRoutePrefix}/source(s)/*`);
	}
}

module.exports = RetoldFactoSourceManager;
module.exports.serviceType = 'RetoldFactoSourceManager';
module.exports.default_configuration = defaultSourceManagerOptions;
