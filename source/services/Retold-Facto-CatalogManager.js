/**
 * Retold Facto - Catalog Manager Service
 *
 * Manages a research catalog of known data sources and their available
 * datasets ("database of databases"). Catalog entries describe agencies,
 * URLs, categories, and per-dataset ingest hints (format, parseOptions,
 * auth requirements). A "provision" action bridges catalog entries into
 * runtime Source + Dataset + DatasetSource records.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const defaultCatalogManagerOptions = (
	{
		RoutePrefix: '/facto'
	});

class RetoldFactoCatalogManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultCatalogManagerOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoCatalogManager';
	}

	/**
	 * Generate a human-readable hash (slug) from a name string.
	 *
	 * Converts "US Census Bureau" → "US-Census-Bureau",
	 * "ISO 3166 Countries" → "ISO-3166-Countries", etc.
	 *
	 * @param {string} pInput - The name to convert
	 * @returns {string} A clean kebab-case slug
	 */
	generateHash(pInput)
	{
		if (!pInput || typeof pInput !== 'string')
		{
			return '';
		}
		return pInput
			.replace(/[^a-zA-Z0-9\s\-_]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
			.substring(0, 128);
	}

	/**
	 * Find a Source by name, or create one if it doesn't exist.
	 *
	 * @param {string} pName - Source name to find or create
	 * @param {object} pDefaults - Default fields for creation (Type, URL, Protocol, Description)
	 * @param {function} fCallback - Callback(pError, pSource)
	 */
	findOrCreateSource(pName, pDefaults, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.Source)
		{
			return fCallback(new Error('Source DAL not initialized'));
		}

		let tmpQuery = this.fable.DAL.Source.query.clone()
			.addFilter('Name', pName)
			.addFilter('Deleted', 0);

		this.fable.DAL.Source.doReads(tmpQuery,
			(pError, pQuery, pRecords) =>
			{
				if (!pError && pRecords && pRecords.length > 0)
				{
					return fCallback(null, pRecords[0]);
				}

				// Create new source
				let tmpSourceData = Object.assign(
					{
						Name: pName,
						Hash: this.generateHash(pName),
						Active: 1
					}, pDefaults || {});

				let tmpCreateQuery = this.fable.DAL.Source.query.clone()
					.addRecord(tmpSourceData);

				this.fable.DAL.Source.doCreate(tmpCreateQuery,
					(pCreateError, pCreateQuery, pCreateQueryRead, pRecord) =>
					{
						if (pCreateError)
						{
							return fCallback(pCreateError);
						}
						return fCallback(null, pRecord);
					});
			});
	}

	/**
	 * Find a Dataset by name, or create one if it doesn't exist.
	 *
	 * @param {string} pName - Dataset name to find or create
	 * @param {object} pDefaults - Default fields for creation (Type, Description, VersionPolicy)
	 * @param {function} fCallback - Callback(pError, pDataset)
	 */
	findOrCreateDataset(pName, pDefaults, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.Dataset)
		{
			return fCallback(new Error('Dataset DAL not initialized'));
		}

		let tmpQuery = this.fable.DAL.Dataset.query.clone()
			.addFilter('Name', pName)
			.addFilter('Deleted', 0);

		this.fable.DAL.Dataset.doReads(tmpQuery,
			(pError, pQuery, pRecords) =>
			{
				if (!pError && pRecords && pRecords.length > 0)
				{
					return fCallback(null, pRecords[0]);
				}

				// Create new dataset
				let tmpDatasetData = Object.assign(
					{
						Name: pName,
						Hash: this.generateHash(pName),
						Type: 'Raw'
					}, pDefaults || {});

				let tmpCreateQuery = this.fable.DAL.Dataset.query.clone()
					.addRecord(tmpDatasetData);

				this.fable.DAL.Dataset.doCreate(tmpCreateQuery,
					(pCreateError, pCreateQuery, pCreateQueryRead, pRecord) =>
					{
						if (pCreateError)
						{
							return fCallback(pCreateError);
						}
						return fCallback(null, pRecord);
					});
			});
	}

	/**
	 * Ensure a DatasetSource link exists between a dataset and a source.
	 *
	 * @param {number} pIDDataset - Dataset ID
	 * @param {number} pIDSource - Source ID
	 * @param {function} fCallback - Callback(pError, pDatasetSource)
	 */
	ensureDatasetSourceLink(pIDDataset, pIDSource, fCallback)
	{
		if (!this.fable.DAL || !this.fable.DAL.DatasetSource)
		{
			return fCallback(new Error('DatasetSource DAL not initialized'));
		}

		let tmpQuery = this.fable.DAL.DatasetSource.query.clone()
			.addFilter('IDDataset', pIDDataset)
			.addFilter('IDSource', pIDSource)
			.addFilter('Deleted', 0);

		this.fable.DAL.DatasetSource.doReads(tmpQuery,
			(pError, pQuery, pRecords) =>
			{
				if (!pError && pRecords && pRecords.length > 0)
				{
					return fCallback(null, pRecords[0]);
				}

				// Create link
				let tmpCreateQuery = this.fable.DAL.DatasetSource.query.clone()
					.addRecord(
						{
							IDDataset: pIDDataset,
							IDSource: pIDSource,
							ReliabilityWeight: 1.0
						});

				this.fable.DAL.DatasetSource.doCreate(tmpCreateQuery,
					(pCreateError, pCreateQuery, pCreateQueryRead, pRecord) =>
					{
						if (pCreateError)
						{
							return fCallback(pCreateError);
						}
						return fCallback(null, pRecord);
					});
			});
	}

	/**
	 * Connect REST API routes for catalog management.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// ================================================================
		// Catalog Entry CRUD
		// ================================================================

		// GET /facto/catalog/entries -- list all catalog entries (non-deleted)
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/catalog/entries`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.SourceCatalogEntry)
				{
					pResponse.send({ Error: 'SourceCatalogEntry DAL not initialized', Entries: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
					.addFilter('Deleted', 0)
					.setCap(500);

				this.fable.DAL.SourceCatalogEntry.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`CatalogManager error listing entries: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Entries: [] });
							return fNext();
						}
						pResponse.send({ Count: pRecords.length, Entries: pRecords });
						return fNext();
					});
			});

		// GET /facto/catalog/entry/:IDSourceCatalogEntry -- get single entry with dataset definitions
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/catalog/entry/:IDSourceCatalogEntry`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDSourceCatalogEntry, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDSourceCatalogEntry parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceCatalogEntry)
				{
					pResponse.send({ Error: 'SourceCatalogEntry DAL not initialized' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpResult = { Entry: null, Datasets: [] };

				// Load the entry
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
							.addFilter('IDSourceCatalogEntry', tmpID);

						this.fable.DAL.SourceCatalogEntry.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (!pError && pRecord)
								{
									tmpResult.Entry = pRecord;
								}
								return fStep();
							});
					});

				// Load dataset definitions
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.CatalogDatasetDefinition)
						{
							return fStep();
						}

						let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
							.addFilter('IDSourceCatalogEntry', tmpID)
							.addFilter('Deleted', 0);

						this.fable.DAL.CatalogDatasetDefinition.doReads(tmpQuery,
							(pError, pQuery, pRecords) =>
							{
								if (!pError && pRecords)
								{
									tmpResult.Datasets = pRecords;
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
						if (!tmpResult.Entry)
						{
							pResponse.send({ Error: 'Catalog entry not found' });
							return fNext();
						}
						pResponse.send(tmpResult);
						return fNext();
					});
			});

		// POST /facto/catalog/entry -- create a catalog entry
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/catalog/entry`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.SourceCatalogEntry)
				{
					pResponse.send({ Error: 'SourceCatalogEntry DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};

				let tmpEntryData = {
					Agency: tmpBody.Agency || '',
					Name: tmpBody.Name || '',
					Type: tmpBody.Type || '',
					URL: tmpBody.URL || '',
					Protocol: tmpBody.Protocol || '',
					Category: tmpBody.Category || '',
					Region: tmpBody.Region || '',
					UpdateFrequency: tmpBody.UpdateFrequency || '',
					Description: tmpBody.Description || '',
					Notes: tmpBody.Notes || '',
					Verified: tmpBody.Verified ? 1 : 0
				};

				let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
					.addRecord(tmpEntryData);

				this.fable.DAL.SourceCatalogEntry.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`CatalogManager error creating entry: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Entry: pRecord });
						return fNext();
					});
			});

		// PUT /facto/catalog/entry/:IDSourceCatalogEntry -- update a catalog entry
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/catalog/entry/:IDSourceCatalogEntry`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDSourceCatalogEntry, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDSourceCatalogEntry parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceCatalogEntry)
				{
					pResponse.send({ Error: 'SourceCatalogEntry DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpUpdateData = { IDSourceCatalogEntry: tmpID };

				// Only update fields that are present in the body
				let tmpFields = ['Agency', 'Name', 'Type', 'URL', 'Protocol', 'Category', 'Region', 'UpdateFrequency', 'Description', 'Notes'];
				for (let i = 0; i < tmpFields.length; i++)
				{
					if (tmpBody.hasOwnProperty(tmpFields[i]))
					{
						tmpUpdateData[tmpFields[i]] = tmpBody[tmpFields[i]];
					}
				}
				if (tmpBody.hasOwnProperty('Verified'))
				{
					tmpUpdateData.Verified = tmpBody.Verified ? 1 : 0;
				}

				let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
					.addRecord(tmpUpdateData);

				this.fable.DAL.SourceCatalogEntry.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`CatalogManager error updating entry ${tmpID}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Entry: pRecord });
						return fNext();
					});
			});

		// DELETE /facto/catalog/entry/:IDSourceCatalogEntry -- soft-delete a catalog entry
		pOratorServiceServer.doDel(`${tmpRoutePrefix}/catalog/entry/:IDSourceCatalogEntry`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDSourceCatalogEntry, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDSourceCatalogEntry parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.SourceCatalogEntry)
				{
					pResponse.send({ Error: 'SourceCatalogEntry DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
					.addFilter('IDSourceCatalogEntry', tmpID);

				this.fable.DAL.SourceCatalogEntry.doDelete(tmpQuery,
					(pError) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Deleted: tmpID });
						return fNext();
					});
			});

		// ================================================================
		// Catalog Dataset Definition CRUD
		// ================================================================

		// GET /facto/catalog/entry/:IDSourceCatalogEntry/datasets -- list dataset definitions
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/catalog/entry/:IDSourceCatalogEntry/datasets`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDSourceCatalogEntry, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDSourceCatalogEntry parameter', Datasets: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Error: 'CatalogDatasetDefinition DAL not initialized', Datasets: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
					.addFilter('IDSourceCatalogEntry', tmpID)
					.addFilter('Deleted', 0);

				this.fable.DAL.CatalogDatasetDefinition.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError, Datasets: [] });
							return fNext();
						}
						pResponse.send({ IDSourceCatalogEntry: tmpID, Count: pRecords.length, Datasets: pRecords });
						return fNext();
					});
			});

		// POST /facto/catalog/entry/:IDSourceCatalogEntry/dataset -- add dataset definition
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/catalog/entry/:IDSourceCatalogEntry/dataset`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDSourceCatalogEntry, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDSourceCatalogEntry parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Error: 'CatalogDatasetDefinition DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};

				let tmpDefData = {
					IDSourceCatalogEntry: tmpID,
					Name: tmpBody.Name || '',
					Format: tmpBody.Format || '',
					MimeType: tmpBody.MimeType || '',
					EndpointURL: tmpBody.EndpointURL || '',
					Description: tmpBody.Description || '',
					ParseOptions: (typeof tmpBody.ParseOptions === 'object') ? JSON.stringify(tmpBody.ParseOptions) : (tmpBody.ParseOptions || ''),
					AuthRequirements: (typeof tmpBody.AuthRequirements === 'object') ? JSON.stringify(tmpBody.AuthRequirements) : (tmpBody.AuthRequirements || ''),
					VersionPolicy: tmpBody.VersionPolicy || 'Append',
					Provisioned: 0,
					IDSource: 0,
					IDDataset: 0
				};

				let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
					.addRecord(tmpDefData);

				this.fable.DAL.CatalogDatasetDefinition.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`CatalogManager error creating dataset definition: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, DatasetDefinition: pRecord });
						return fNext();
					});
			});

		// PUT /facto/catalog/dataset/:IDCatalogDatasetDefinition -- update a dataset definition
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/catalog/dataset/:IDCatalogDatasetDefinition`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDCatalogDatasetDefinition, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDCatalogDatasetDefinition parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Error: 'CatalogDatasetDefinition DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpUpdateData = { IDCatalogDatasetDefinition: tmpID };

				let tmpFields = ['Name', 'Format', 'MimeType', 'EndpointURL', 'Description', 'VersionPolicy'];
				for (let i = 0; i < tmpFields.length; i++)
				{
					if (tmpBody.hasOwnProperty(tmpFields[i]))
					{
						tmpUpdateData[tmpFields[i]] = tmpBody[tmpFields[i]];
					}
				}

				if (tmpBody.hasOwnProperty('ParseOptions'))
				{
					tmpUpdateData.ParseOptions = (typeof tmpBody.ParseOptions === 'object') ? JSON.stringify(tmpBody.ParseOptions) : tmpBody.ParseOptions;
				}
				if (tmpBody.hasOwnProperty('AuthRequirements'))
				{
					tmpUpdateData.AuthRequirements = (typeof tmpBody.AuthRequirements === 'object') ? JSON.stringify(tmpBody.AuthRequirements) : tmpBody.AuthRequirements;
				}

				let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
					.addRecord(tmpUpdateData);

				this.fable.DAL.CatalogDatasetDefinition.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, DatasetDefinition: pRecord });
						return fNext();
					});
			});

		// DELETE /facto/catalog/dataset/:IDCatalogDatasetDefinition -- soft-delete dataset definition
		pOratorServiceServer.doDel(`${tmpRoutePrefix}/catalog/dataset/:IDCatalogDatasetDefinition`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDCatalogDatasetDefinition, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDCatalogDatasetDefinition parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Error: 'CatalogDatasetDefinition DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
					.addFilter('IDCatalogDatasetDefinition', tmpID);

				this.fable.DAL.CatalogDatasetDefinition.doDelete(tmpQuery,
					(pError) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Deleted: tmpID });
						return fNext();
					});
			});

		// ================================================================
		// Search
		// ================================================================

		// GET /facto/catalog/search?q=term -- search catalog entries
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/catalog/search`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.SourceCatalogEntry)
				{
					pResponse.send({ Error: 'SourceCatalogEntry DAL not initialized', Entries: [] });
					return fNext();
				}

				let tmpSearchTerm = '';
				if (pRequest.query && pRequest.query.q)
				{
					tmpSearchTerm = pRequest.query.q.toLowerCase();
				}
				else if (pRequest.params && pRequest.params.q)
				{
					tmpSearchTerm = pRequest.params.q.toLowerCase();
				}

				let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
					.addFilter('Deleted', 0)
					.setCap(500);

				this.fable.DAL.SourceCatalogEntry.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError, Entries: [] });
							return fNext();
						}

						if (!tmpSearchTerm)
						{
							pResponse.send({ Query: '', Count: pRecords.length, Entries: pRecords });
							return fNext();
						}

						// Client-side filter across Agency, Name, Category, Description
						let tmpFiltered = pRecords.filter(
							(pEntry) =>
							{
								let tmpSearchable = [
									pEntry.Agency || '',
									pEntry.Name || '',
									pEntry.Category || '',
									pEntry.Description || ''
								].join(' ').toLowerCase();
								return tmpSearchable.indexOf(tmpSearchTerm) >= 0;
							});

						pResponse.send({ Query: tmpSearchTerm, Count: tmpFiltered.length, Entries: tmpFiltered });
						return fNext();
					});
			});

		// ================================================================
		// Provision
		// ================================================================

		// POST /facto/catalog/dataset/:IDCatalogDatasetDefinition/provision
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/catalog/dataset/:IDCatalogDatasetDefinition/provision`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDCatalogDatasetDefinition, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDCatalogDatasetDefinition parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CatalogDatasetDefinition || !this.fable.DAL.SourceCatalogEntry)
				{
					pResponse.send({ Error: 'Catalog DAL not initialized' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpCatalogDef = null;
				let tmpCatalogEntry = null;
				let tmpSource = null;
				let tmpDataset = null;
				let tmpDatasetSource = null;

				// Step 1: Load the catalog dataset definition
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
							.addFilter('IDCatalogDatasetDefinition', tmpID);

						this.fable.DAL.CatalogDatasetDefinition.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (pError || !pRecord)
								{
									return fStep(pError || new Error('CatalogDatasetDefinition not found'));
								}
								tmpCatalogDef = pRecord;
								return fStep();
							});
					});

				// Step 2: Load the parent catalog entry
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!tmpCatalogDef)
						{
							return fStep();
						}

						let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
							.addFilter('IDSourceCatalogEntry', tmpCatalogDef.IDSourceCatalogEntry);

						this.fable.DAL.SourceCatalogEntry.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (pError || !pRecord)
								{
									return fStep(pError || new Error('Parent SourceCatalogEntry not found'));
								}
								tmpCatalogEntry = pRecord;
								return fStep();
							});
					});

				// Step 3: Find-or-create runtime Source (by Agency name)
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!tmpCatalogEntry)
						{
							return fStep();
						}

						let tmpSourceName = tmpCatalogEntry.Agency || tmpCatalogEntry.Name;
						this.findOrCreateSource(tmpSourceName,
							{
								Type: tmpCatalogEntry.Type || 'API',
								URL: tmpCatalogEntry.URL || '',
								Protocol: tmpCatalogEntry.Protocol || 'HTTPS',
								Description: tmpCatalogEntry.Description || ''
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

				// Step 4: Find-or-create runtime Dataset
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!tmpCatalogDef)
						{
							return fStep();
						}

						this.findOrCreateDataset(tmpCatalogDef.Name,
							{
								Type: 'Raw',
								Description: tmpCatalogDef.Description || '',
								VersionPolicy: tmpCatalogDef.VersionPolicy || 'Append'
							},
							(pError, pDataset) =>
							{
								if (pError)
								{
									return fStep(pError);
								}
								tmpDataset = pDataset;
								return fStep();
							});
					});

				// Step 5: Ensure DatasetSource link + set VersionPolicy
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!tmpSource || !tmpDataset)
						{
							return fStep();
						}

						this.ensureDatasetSourceLink(tmpDataset.IDDataset, tmpSource.IDSource,
							(pError, pLink) =>
							{
								if (pError)
								{
									return fStep(pError);
								}
								tmpDatasetSource = pLink;

								// Update VersionPolicy on the dataset
								let tmpPolicy = tmpCatalogDef.VersionPolicy || 'Append';
								if (tmpPolicy === 'Append' || tmpPolicy === 'Replace')
								{
									let tmpUpdateQuery = this.fable.DAL.Dataset.query.clone()
										.addRecord({ IDDataset: tmpDataset.IDDataset, VersionPolicy: tmpPolicy });

									this.fable.DAL.Dataset.doUpdate(tmpUpdateQuery,
										(pUpdateError) =>
										{
											return fStep();
										});
								}
								else
								{
									return fStep();
								}
							});
					});

				// Step 6: Mark catalog definition as provisioned
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!tmpSource || !tmpDataset)
						{
							return fStep();
						}

						let tmpUpdateQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
							.addRecord(
								{
									IDCatalogDatasetDefinition: tmpID,
									Provisioned: 1,
									IDSource: tmpSource.IDSource,
									IDDataset: tmpDataset.IDDataset
								});

						this.fable.DAL.CatalogDatasetDefinition.doUpdate(tmpUpdateQuery,
							(pError) =>
							{
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

						pResponse.send(
							{
								Success: true,
								Source: tmpSource,
								Dataset: tmpDataset,
								DatasetSource: tmpDatasetSource,
								CatalogDatasetDefinition: tmpCatalogDef
							});
						return fNext();
					});
			});

		// ================================================================
		// Import / Export
		// ================================================================

		// POST /facto/catalog/import -- bulk import catalog entries from JSON array
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/catalog/import`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.SourceCatalogEntry || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Error: 'Catalog DAL not initialized' });
					return fNext();
				}

				let tmpEntries = pRequest.body;
				this.fable.log.info(`CatalogManager import: body type=${typeof tmpEntries}, isArray=${Array.isArray(tmpEntries)}`);
				if (!Array.isArray(tmpEntries))
				{
					// Allow { Entries: [...] } wrapper
					if (tmpEntries && Array.isArray(tmpEntries.Entries))
					{
						tmpEntries = tmpEntries.Entries;
					}
					else
					{
						pResponse.send({ Error: 'Request body must be a JSON array of catalog entries (received ' + (typeof tmpEntries) + ')' });
						return fNext();
					}
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpCreatedEntries = 0;
				let tmpCreatedDatasets = 0;
				let tmpErrors = 0;

				for (let i = 0; i < tmpEntries.length; i++)
				{
					let tmpEntryData = tmpEntries[i];

					tmpAnticipate.anticipate(
						(fStep) =>
						{
							let tmpRecord = {
								Agency: tmpEntryData.Agency || '',
								Name: tmpEntryData.Name || '',
								Type: tmpEntryData.Type || '',
								URL: tmpEntryData.URL || '',
								Protocol: tmpEntryData.Protocol || '',
								Category: tmpEntryData.Category || '',
								Region: tmpEntryData.Region || '',
								UpdateFrequency: tmpEntryData.UpdateFrequency || '',
								Description: tmpEntryData.Description || '',
								Notes: tmpEntryData.Notes || '',
								Verified: tmpEntryData.Verified ? 1 : 0
							};

							let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
								.addRecord(tmpRecord);

							this.fable.DAL.SourceCatalogEntry.doCreate(tmpQuery,
								(pError, pQuery, pQueryRead, pCreatedEntry) =>
								{
									if (pError || !pCreatedEntry)
									{
										tmpErrors++;
										return fStep();
									}

									tmpCreatedEntries++;

									// Create dataset definitions if provided
									let tmpDatasets = tmpEntryData.Datasets || [];
									if (tmpDatasets.length === 0)
									{
										return fStep();
									}

									let tmpDatasetAnticipate = this.fable.newAnticipate();

									for (let j = 0; j < tmpDatasets.length; j++)
									{
										let tmpDsData = tmpDatasets[j];

										tmpDatasetAnticipate.anticipate(
											(fDsStep) =>
											{
												let tmpDefRecord = {
													IDSourceCatalogEntry: pCreatedEntry.IDSourceCatalogEntry,
													Name: tmpDsData.Name || '',
													Format: tmpDsData.Format || '',
													MimeType: tmpDsData.MimeType || '',
													EndpointURL: tmpDsData.EndpointURL || '',
													Description: tmpDsData.Description || '',
													ParseOptions: (typeof tmpDsData.ParseOptions === 'object') ? JSON.stringify(tmpDsData.ParseOptions) : (tmpDsData.ParseOptions || ''),
													AuthRequirements: (typeof tmpDsData.AuthRequirements === 'object') ? JSON.stringify(tmpDsData.AuthRequirements) : (tmpDsData.AuthRequirements || ''),
													VersionPolicy: tmpDsData.VersionPolicy || 'Append',
													Provisioned: 0,
													IDSource: 0,
													IDDataset: 0
												};

												let tmpDefQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
													.addRecord(tmpDefRecord);

												this.fable.DAL.CatalogDatasetDefinition.doCreate(tmpDefQuery,
													(pDefError) =>
													{
														if (!pDefError)
														{
															tmpCreatedDatasets++;
														}
														else
														{
															tmpErrors++;
														}
														return fDsStep();
													});
											});
									}

									tmpDatasetAnticipate.wait(
										() =>
										{
											return fStep();
										});
								});
						});
				}

				tmpAnticipate.wait(
					(pError) =>
					{
						pResponse.send(
							{
								Success: true,
								EntriesCreated: tmpCreatedEntries,
								DatasetsCreated: tmpCreatedDatasets,
								Errors: tmpErrors
							});
						return fNext();
					});
			});

		// GET /facto/catalog/export -- export full catalog as JSON
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/catalog/export`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.SourceCatalogEntry || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Error: 'Catalog DAL not initialized' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpEntries = [];
				let tmpDatasets = [];

				// Load all entries
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.SourceCatalogEntry.query.clone()
							.addFilter('Deleted', 0)
							.setCap(500);

						this.fable.DAL.SourceCatalogEntry.doReads(tmpQuery,
							(pError, pQuery, pRecords) =>
							{
								if (!pError && pRecords)
								{
									tmpEntries = pRecords;
								}
								return fStep();
							});
					});

				// Load all dataset definitions
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
							.addFilter('Deleted', 0)
							.setCap(2000);

						this.fable.DAL.CatalogDatasetDefinition.doReads(tmpQuery,
							(pError, pQuery, pRecords) =>
							{
								if (!pError && pRecords)
								{
									tmpDatasets = pRecords;
								}
								return fStep();
							});
					});

				tmpAnticipate.wait(
					(pError) =>
					{
						// Group datasets by parent entry
						let tmpDatasetsByEntry = {};
						for (let i = 0; i < tmpDatasets.length; i++)
						{
							let tmpEntryID = tmpDatasets[i].IDSourceCatalogEntry;
							if (!tmpDatasetsByEntry[tmpEntryID])
							{
								tmpDatasetsByEntry[tmpEntryID] = [];
							}
							tmpDatasetsByEntry[tmpEntryID].push(
								{
									Name: tmpDatasets[i].Name,
									Format: tmpDatasets[i].Format,
									MimeType: tmpDatasets[i].MimeType,
									EndpointURL: tmpDatasets[i].EndpointURL,
									Description: tmpDatasets[i].Description,
									ParseOptions: tmpDatasets[i].ParseOptions,
									AuthRequirements: tmpDatasets[i].AuthRequirements,
									VersionPolicy: tmpDatasets[i].VersionPolicy,
									Provisioned: tmpDatasets[i].Provisioned,
									IDSource: tmpDatasets[i].IDSource,
									IDDataset: tmpDatasets[i].IDDataset
								});
						}

						// Build export structure
						let tmpExport = [];
						for (let i = 0; i < tmpEntries.length; i++)
						{
							let tmpEntry = tmpEntries[i];
							tmpExport.push(
								{
									Agency: tmpEntry.Agency,
									Name: tmpEntry.Name,
									Type: tmpEntry.Type,
									URL: tmpEntry.URL,
									Protocol: tmpEntry.Protocol,
									Category: tmpEntry.Category,
									Region: tmpEntry.Region,
									UpdateFrequency: tmpEntry.UpdateFrequency,
									Description: tmpEntry.Description,
									Notes: tmpEntry.Notes,
									Verified: tmpEntry.Verified,
									Datasets: tmpDatasetsByEntry[tmpEntry.IDSourceCatalogEntry] || []
								});
						}

						pResponse.send({ Count: tmpExport.length, Entries: tmpExport });
						return fNext();
					});
			});

		// ================================================================
		// Fetch and Ingest from Catalog
		// ================================================================

		// POST /facto/catalog/dataset/:IDCatalogDatasetDefinition/fetch
		// Downloads data from the catalog entry's EndpointURL, parses it
		// using the entry's Format and ParseOptions, and ingests it into
		// the provisioned Dataset/Source.
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/catalog/dataset/:IDCatalogDatasetDefinition/fetch`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpID = parseInt(pRequest.params.IDCatalogDatasetDefinition, 10);
				if (isNaN(tmpID) || tmpID < 1)
				{
					pResponse.send({ Error: 'Invalid IDCatalogDatasetDefinition parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.CatalogDatasetDefinition)
				{
					pResponse.send({ Error: 'Catalog DAL not initialized' });
					return fNext();
				}

				// Step 1: Load the catalog dataset definition
				let tmpQuery = this.fable.DAL.CatalogDatasetDefinition.query.clone()
					.addFilter('IDCatalogDatasetDefinition', tmpID);

				this.fable.DAL.CatalogDatasetDefinition.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError || !pRecord)
						{
							pResponse.send({ Error: 'CatalogDatasetDefinition not found' });
							return fNext();
						}

						// Step 2: Validate
						if (!pRecord.Provisioned)
						{
							pResponse.send({ Error: 'Dataset definition must be provisioned before fetching. Call provision first.' });
							return fNext();
						}

						if (!pRecord.EndpointURL)
						{
							pResponse.send({ Error: 'No EndpointURL configured for this dataset definition' });
							return fNext();
						}

						// Parse ParseOptions from JSON string
						let tmpParseOptions = {};
						if (pRecord.ParseOptions)
						{
							try
							{
								tmpParseOptions = JSON.parse(pRecord.ParseOptions);
							}
							catch (pParseError)
							{
								this.fable.log.warn(`CatalogManager: could not parse ParseOptions for definition ${tmpID}: ${pParseError.message}`);
							}
						}

						// Step 3: Download
						this.fable.log.info(`CatalogManager: fetching ${pRecord.EndpointURL} for definition ${tmpID}`);

						this.fable.RetoldFactoIngestEngine.downloadURL(pRecord.EndpointURL,
							(pDownloadError, pBuffer) =>
							{
								if (pDownloadError)
								{
									pResponse.send({ Error: 'Download failed: ' + pDownloadError.message });
									return fNext();
								}

								this.fable.log.info(`CatalogManager: downloaded ${pBuffer.length} bytes, ingesting as ${pRecord.Format || 'auto'}`);

								// Step 4: Build ingest options from catalog metadata and ingest
								let tmpFormat = (pRecord.Format || '').toLowerCase();
								let tmpIngestOptions = {
									format: tmpFormat,
									type: 'catalog-fetch',
									delimiter: tmpParseOptions.delimiter || ',',
									stripCommentLines: tmpParseOptions.stripCommentLines || false,
									dataPath: tmpParseOptions.dataPath || '',
									recordPath: tmpParseOptions.recordPath || '',
									columns: tmpParseOptions.columns || null
								};

								let tmpContent = (tmpFormat === 'excel') ? pBuffer : pBuffer.toString('utf8');

								this.fable.RetoldFactoIngestEngine.ingestContent(
									tmpContent,
									pRecord.IDDataset,
									pRecord.IDSource,
									tmpIngestOptions,
									(pIngestError, pResult) =>
									{
										if (pIngestError)
										{
											pResponse.send({ Error: 'Ingest failed: ' + pIngestError.message });
											return fNext();
										}

										pResponse.send(
											{
												Success: true,
												IDCatalogDatasetDefinition: tmpID,
												IDDataset: pRecord.IDDataset,
												IDSource: pRecord.IDSource,
												EndpointURL: pRecord.EndpointURL,
												Ingested: pResult.Ingested,
												Errors: pResult.Errors,
												Total: pResult.Total,
												DatasetVersion: pResult.DatasetVersion,
												ContentSignature: pResult.ContentSignature,
												IsDuplicate: pResult.IsDuplicate,
												Format: pResult.Format,
												IngestJob: pResult.IngestJob
											});
										return fNext();
									});
							});
					});
			});

		this.fable.log.info(`CatalogManager routes connected at ${tmpRoutePrefix}/catalog/*`);
	}
}

module.exports = RetoldFactoCatalogManager;
module.exports.serviceType = 'RetoldFactoCatalogManager';
module.exports.default_configuration = defaultCatalogManagerOptions;
