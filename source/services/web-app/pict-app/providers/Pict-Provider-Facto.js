const libPictProvider = require('pict-provider');

class FactoProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	// ================================================================
	// API Helper
	// ================================================================

	api(pMethod, pPath, pBody)
	{
		let tmpOpts = { method: pMethod, headers: {} };
		if (pBody)
		{
			tmpOpts.headers['Content-Type'] = 'application/json';
			tmpOpts.body = JSON.stringify(pBody);
		}
		return fetch(pPath, tmpOpts).then(
			function(pResponse)
			{
				return pResponse.text().then(
					function(pText)
					{
						let tmpData;
						try
						{
							tmpData = JSON.parse(pText);
						}
						catch (pParseError)
						{
							return { Error: 'HTTP ' + pResponse.status + ' (non-JSON): ' + pText.substring(0, 200) };
						}
						// Translate Restify error format {code, message} to {Error}
						if (!pResponse.ok && tmpData && tmpData.code && !tmpData.Error)
						{
							tmpData.Error = tmpData.code + ': ' + (tmpData.message || 'HTTP ' + pResponse.status);
						}
						return tmpData;
					});
			}).catch(
			function(pError)
			{
				return { Error: pError.message || 'Network error' };
			});
	}

	setStatus(pElementId, pMessage, pType)
	{
		let tmpEl = document.getElementById(pElementId);
		if (!tmpEl) return;
		tmpEl.className = 'status ' + (pType || 'info');
		tmpEl.textContent = pMessage;
		tmpEl.style.display = 'block';
	}

	clearStatus(pElementId)
	{
		let tmpEl = document.getElementById(pElementId);
		if (!tmpEl) return;
		tmpEl.style.display = 'none';
		tmpEl.textContent = '';
	}

	// ================================================================
	// Catalog Operations
	// ================================================================

	loadCatalogEntries()
	{
		return this.api('GET', '/facto/catalog/entries').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.CatalogEntries = (pResponse && pResponse.Entries) ? pResponse.Entries : [];
			});
	}

	searchCatalog(pQuery)
	{
		return this.api('GET', '/facto/catalog/search?q=' + encodeURIComponent(pQuery)).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	createCatalogEntry(pData)
	{
		return this.api('POST', '/facto/catalog/entry', pData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	deleteCatalogEntry(pIDEntry)
	{
		return this.api('DELETE', '/facto/catalog/entry/' + pIDEntry).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadCatalogEntryDatasets(pIDEntry)
	{
		return this.api('GET', '/facto/catalog/entry/' + pIDEntry + '/datasets').then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	addCatalogDataset(pIDEntry, pData)
	{
		return this.api('POST', '/facto/catalog/entry/' + pIDEntry + '/dataset', pData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	provisionCatalogDataset(pIDCatalogDataset)
	{
		return this.api('POST', '/facto/catalog/dataset/' + pIDCatalogDataset + '/provision').then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	fetchCatalogDataset(pIDCatalogDataset)
	{
		return this.api('POST', '/facto/catalog/dataset/' + pIDCatalogDataset + '/fetch').then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	importCatalog(pEntries)
	{
		return this.api('POST', '/facto/catalog/import', pEntries).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	exportCatalog()
	{
		return this.api('GET', '/facto/catalog/export').then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	// ================================================================
	// Source Operations
	// ================================================================

	loadSources()
	{
		return this.api('GET', '/1.0/Sources/0/100').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.Sources = Array.isArray(pResponse) ? pResponse : [];
				return this.pict.AppData.Facto.Sources;
			});
	}

	loadActiveSources()
	{
		return this.api('GET', '/facto/sources/active').then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	createSource(pSourceData)
	{
		return this.api('POST', '/1.0/Source', pSourceData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	activateSource(pIDSource)
	{
		return this.api('PUT', `/facto/source/${pIDSource}/activate`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	deactivateSource(pIDSource)
	{
		return this.api('PUT', `/facto/source/${pIDSource}/deactivate`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadSourceSummary(pIDSource)
	{
		return this.api('GET', `/facto/source/${pIDSource}/summary`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	// ================================================================
	// Source Documentation Operations
	// ================================================================

	loadSourceDocumentation(pIDSource)
	{
		return this.api('GET', `/facto/source/${pIDSource}/documentation`);
	}

	loadSourceDocument(pIDSource, pIDDoc)
	{
		return this.api('GET', `/facto/source/${pIDSource}/documentation/${pIDDoc}`);
	}

	createSourceDocument(pIDSource, pData)
	{
		return this.api('POST', `/facto/source/${pIDSource}/documentation`, pData);
	}

	updateSourceDocument(pIDSource, pIDDoc, pData)
	{
		return this.api('PUT', `/facto/source/${pIDSource}/documentation/${pIDDoc}`, pData);
	}

	deleteSourceDocument(pIDSource, pIDDoc)
	{
		return this.api('DELETE', `/facto/source/${pIDSource}/documentation/${pIDDoc}`);
	}

	// ================================================================
	// Source Catalog Context
	// ================================================================

	loadSourceCatalogContext(pIDSource)
	{
		return this.api('GET', `/facto/source/${pIDSource}/catalog-context`);
	}

	loadCatalogSourceLinks()
	{
		return this.api('GET', '/facto/catalog/source-links');
	}

	// ================================================================
	// Dataset Operations
	// ================================================================

	loadDatasets()
	{
		return this.api('GET', '/1.0/Datasets/0/100').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.Datasets = Array.isArray(pResponse) ? pResponse : [];
			});
	}

	createDataset(pDatasetData)
	{
		return this.api('POST', '/1.0/Dataset', pDatasetData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadDatasetStats(pIDDataset)
	{
		return this.api('GET', `/facto/dataset/${pIDDataset}/stats`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadDatasetSources(pIDDataset)
	{
		return this.api('GET', `/facto/dataset/${pIDDataset}/sources`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	linkDatasetSource(pIDDataset, pIDSource, pReliabilityWeight)
	{
		return this.api('POST', `/facto/dataset/${pIDDataset}/source`,
			{
				IDSource: pIDSource,
				ReliabilityWeight: pReliabilityWeight || 1.0
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadDatasetRecords(pIDDataset, pBegin, pCap)
	{
		return this.api('GET', `/facto/dataset/${pIDDataset}/records/${pBegin || 0}/${pCap || 50}`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	// ================================================================
	// Record Operations
	// ================================================================

	loadRecords(pPage)
	{
		let tmpPageSize = this.pict.AppData.Facto.RecordPageSize;
		let tmpBegin = (pPage || 0) * tmpPageSize;
		return this.api('GET', `/1.0/Records/${tmpBegin}/${tmpPageSize}`).then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.Records = Array.isArray(pResponse) ? pResponse : [];
			});
	}

	ingestRecords(pRecords, pIDDataset, pIDSource)
	{
		return this.api('POST', '/facto/record/ingest',
			{
				Records: pRecords,
				IDDataset: pIDDataset,
				IDSource: pIDSource
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadRecordCertainty(pIDRecord)
	{
		return this.api('GET', `/facto/record/${pIDRecord}/certainty`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	addRecordCertainty(pIDRecord, pCertaintyValue, pDimension, pJustification)
	{
		return this.api('POST', `/facto/record/${pIDRecord}/certainty`,
			{
				CertaintyValue: pCertaintyValue,
				Dimension: pDimension || 'overall',
				Justification: pJustification || ''
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadRecordVersions(pIDRecord)
	{
		return this.api('GET', `/facto/record/${pIDRecord}/versions`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	// ================================================================
	// Ingest Job Operations
	// ================================================================

	loadIngestJobs()
	{
		return this.api('GET', '/facto/ingest/jobs').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.IngestJobs = (pResponse && pResponse.Jobs) ? pResponse.Jobs : [];
			});
	}

	createIngestJob(pIDSource, pIDDataset, pConfiguration)
	{
		return this.api('POST', '/facto/ingest/job',
			{
				IDSource: pIDSource,
				IDDataset: pIDDataset,
				Configuration: pConfiguration || {}
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	startIngestJob(pIDIngestJob)
	{
		return this.api('PUT', `/facto/ingest/job/${pIDIngestJob}/start`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	completeIngestJob(pIDIngestJob, pCounters, pStatus)
	{
		let tmpBody = Object.assign({}, pCounters || {});
		if (pStatus)
		{
			tmpBody.Status = pStatus;
		}
		return this.api('PUT', `/facto/ingest/job/${pIDIngestJob}/complete`, tmpBody).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadIngestJobDetails(pIDIngestJob)
	{
		return this.api('GET', `/facto/ingest/job/${pIDIngestJob}`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	// ================================================================
	// Projection Operations
	// ================================================================

	loadProjections()
	{
		return this.api('GET', '/facto/projections').then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadDatasetsByType(pType)
	{
		return this.api('GET', `/facto/datasets/by-type/${pType}`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	queryRecords(pParams)
	{
		return this.api('POST', '/facto/projections/query', pParams).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	aggregateRecords(pParams)
	{
		return this.api('POST', '/facto/projections/aggregate', pParams).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	queryCertainty(pParams)
	{
		return this.api('POST', '/facto/projections/certainty', pParams).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	compareDatasets(pDatasetIDs)
	{
		return this.api('POST', '/facto/projections/compare', { DatasetIDs: pDatasetIDs }).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	loadProjectionSummary()
	{
		return this.api('GET', '/facto/projections/summary').then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	uploadSourceFile(pIDSource, pFilename, pContentType, pBase64Data)
	{
		return this.api('POST', `/facto/source/${pIDSource}/documentation/upload`,
			{
				Filename: pFilename,
				ContentType: pContentType,
				Data: pBase64Data
			});
	}

	ingestFileContent(pIDDataset, pIDSource, pContent, pFormat, pType)
	{
		return this.api('POST', '/facto/ingest/file',
			{
				IDDataset: pIDDataset || 0,
				IDSource: pIDSource || 0,
				Content: pContent,
				Format: pFormat || 'Auto',
				Type: pType || 'data'
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	}

	// ================================================================
	// Scanner Operations
	// ================================================================

	loadScannerPaths()
	{
		return this.api('GET', '/facto/scanner/paths').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.ScannerPaths = (pResponse && pResponse.Paths) ? pResponse.Paths : [];
			});
	}

	loadScannerDatasets(pFilter)
	{
		let tmpQuery = '/facto/scanner/datasets';
		let tmpParams = [];
		if (pFilter)
		{
			if (pFilter.status) tmpParams.push('status=' + encodeURIComponent(pFilter.status));
			if (pFilter.search) tmpParams.push('search=' + encodeURIComponent(pFilter.search));
		}
		if (tmpParams.length > 0) tmpQuery += '?' + tmpParams.join('&');

		return this.api('GET', tmpQuery).then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.ScannerDatasets = (pResponse && pResponse.Datasets) ? pResponse.Datasets : [];
			});
	}

	loadScannerDatasetDetail(pFolderName)
	{
		return this.api('GET', '/facto/scanner/dataset/' + encodeURIComponent(pFolderName));
	}

	addScannerPath(pPath)
	{
		return this.api('POST', '/facto/scanner/path', { Path: pPath });
	}

	removeScannerPath(pPath)
	{
		return this.api('DELETE', '/facto/scanner/path', { Path: pPath });
	}

	rescanPaths(pPath)
	{
		let tmpBody = pPath ? { Path: pPath } : {};
		return this.api('POST', '/facto/scanner/rescan', tmpBody);
	}

	provisionScannerDataset(pFolderName)
	{
		return this.api('POST', '/facto/scanner/dataset/' + encodeURIComponent(pFolderName) + '/provision');
	}

	ingestScannerDataset(pFolderName, pOptions)
	{
		return this.api('POST', '/facto/scanner/dataset/' + encodeURIComponent(pFolderName) + '/ingest', pOptions || {});
	}

	downloadScannerDataset(pFolderName)
	{
		return this.api('POST', '/facto/scanner/dataset/' + encodeURIComponent(pFolderName) + '/download');
	}

	provisionAllScannerDatasets()
	{
		return this.api('POST', '/facto/scanner/provision-all');
	}

	// ================================================================
	// Store Connection Operations
	// ================================================================

	loadStoreConnections()
	{
		return this.api('GET', '/facto/connections');
	}

	createStoreConnection(pData)
	{
		return this.api('POST', '/facto/connection', pData);
	}

	updateStoreConnection(pID, pData)
	{
		return this.api('PUT', `/facto/connection/${pID}`, pData);
	}

	deleteStoreConnection(pID)
	{
		return this.api('DELETE', `/facto/connection/${pID}`);
	}

	testStoreConnection(pID)
	{
		return this.api('POST', `/facto/connection/${pID}/test`);
	}

	testAdHocConnection(pType, pConfig)
	{
		return this.api('POST', '/facto/connection/test', { Type: pType, Config: pConfig });
	}

	loadAvailableConnectionTypes()
	{
		return this.api('GET', '/facto/connection/available-types');
	}

	// ================================================================
	// Projection Schema Operations
	// ================================================================

	compileMicroDDL(pDDLText)
	{
		return this.api('POST', '/facto/projection/compile', { DDL: pDDLText });
	}

	loadProjectionSchema(pIDDataset)
	{
		return this.api('GET', `/facto/projection/${pIDDataset}/schema`);
	}

	saveProjectionSchema(pIDDataset, pSchemaDefinition)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/save-schema`, { SchemaDefinition: pSchemaDefinition });
	}

	loadProjectionStores(pIDDataset)
	{
		return this.api('GET', `/facto/projection/${pIDDataset}/stores`);
	}

	deployProjection(pIDDataset, pIDStoreConnection, pTargetTableName)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/deploy`,
			{
				IDStoreConnection: pIDStoreConnection,
				TargetTableName: pTargetTableName
			});
	}

	// ======================================================================
	// Projection Mapping Operations
	// ======================================================================

	loadProjectionMappings(pIDDataset)
	{
		return this.api('GET', `/facto/projection/${pIDDataset}/mappings`);
	}

	loadProjectionMapping(pID)
	{
		return this.api('GET', `/facto/projection/mapping/${pID}`);
	}

	createProjectionMapping(pIDDataset, pData)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/mapping`, pData);
	}

	updateProjectionMapping(pID, pData)
	{
		return this.api('POST', `/facto/projection/mapping/${pID}/update`, pData);
	}

	deleteProjectionMapping(pID)
	{
		return this.api('DELETE', `/facto/projection/mapping/${pID}`);
	}

	discoverFields(pIDDataset, pIDSource, pSampleSize)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/discover-fields`,
			{
				IDSource: pIDSource,
				SampleSize: pSampleSize || 50
			});
	}

	executeImport(pIDDataset, pIDProjectionMapping, pIDProjectionStore, pBatchSize, pCap)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/import`,
			{
				IDProjectionMapping: pIDProjectionMapping,
				IDProjectionStore: pIDProjectionStore,
				BatchSize: pBatchSize || 100,
				Cap: pCap || 0
			});
	}
}

module.exports = FactoProvider;

module.exports.default_configuration =
{
	ProviderIdentifier: 'Facto',
	AutoInitialize: true
};
