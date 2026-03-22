module.exports =
{
	// ================================================================
	// Projection Operations
	// ================================================================

	loadProjections: function()
	{
		return this.api('GET', '/facto/projections').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.Projections = (pResponse && pResponse.Projections) ? pResponse.Projections : [];
				return pResponse;
			});
	},

	deleteProjection: function(pIDDataset)
	{
		return this.api('DELETE', `/1.0/Dataset/${pIDDataset}`);
	},

	loadDatasetsByType: function(pType)
	{
		return this.api('GET', `/facto/datasets/by-type/${pType}`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	queryRecords: function(pParams)
	{
		return this.api('POST', '/facto/projections/query', pParams).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	aggregateRecords: function(pParams)
	{
		return this.api('POST', '/facto/projections/aggregate', pParams).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	queryCertainty: function(pParams)
	{
		return this.api('POST', '/facto/projections/certainty', pParams).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	compareDatasets: function(pDatasetIDs)
	{
		return this.api('POST', '/facto/projections/compare', { DatasetIDs: pDatasetIDs }).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadProjectionSummary: function()
	{
		return this.api('GET', '/facto/projections/summary').then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	uploadSourceFile: function(pIDSource, pFilename, pContentType, pBase64Data)
	{
		return this.api('POST', `/facto/source/${pIDSource}/documentation/upload`,
			{
				Filename: pFilename,
				ContentType: pContentType,
				Data: pBase64Data
			});
	},

	ingestFileContent: function(pIDDataset, pIDSource, pContent, pFormat, pType)
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
	},

	// ================================================================
	// Projection Schema Operations
	// ================================================================

	compileMicroDDL: function(pDDLText)
	{
		return this.api('POST', '/facto/projection/compile', { DDL: pDDLText });
	},

	loadProjectionSchema: function(pIDDataset)
	{
		return this.api('GET', `/facto/projection/${pIDDataset}/schema`);
	},

	saveProjectionSchema: function(pIDDataset, pSchemaDefinition)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/save-schema`, { SchemaDefinition: pSchemaDefinition });
	},

	loadProjectionStores: function(pIDDataset)
	{
		return this.api('GET', `/facto/projection/${pIDDataset}/stores`);
	},

	deployProjection: function(pIDDataset, pIDStoreConnection, pTargetTableName)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/deploy`,
			{
				IDStoreConnection: pIDStoreConnection,
				TargetTableName: pTargetTableName
			});
	},

	// ======================================================================
	// Projection Mapping Operations
	// ======================================================================

	loadProjectionMappings: function(pIDDataset)
	{
		return this.api('GET', `/facto/projection/${pIDDataset}/mappings`);
	},

	loadProjectionMapping: function(pID)
	{
		return this.api('GET', `/facto/projection/mapping/${pID}`);
	},

	createProjectionMapping: function(pIDDataset, pData)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/mapping`, pData);
	},

	updateProjectionMapping: function(pID, pData)
	{
		return this.api('POST', `/facto/projection/mapping/${pID}/update`, pData);
	},

	deleteProjectionMapping: function(pID)
	{
		return this.api('DELETE', `/facto/projection/mapping/${pID}`);
	},

	discoverFields: function(pIDDataset, pIDSource, pSampleSize)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/discover-fields`,
			{
				IDSource: pIDSource,
				SampleSize: pSampleSize || 50
			});
	},

	executeImport: function(pIDDataset, pIDProjectionMapping, pIDProjectionStore, pBatchSize, pStageComprehension)
	{
		return this.api('POST', `/facto/projection/${pIDDataset}/import`,
			{
				IDProjectionMapping: pIDProjectionMapping,
				IDProjectionStore: pIDProjectionStore,
				BatchSize: pBatchSize || 100,
				StageComprehension: !!pStageComprehension
			});
	}
};
