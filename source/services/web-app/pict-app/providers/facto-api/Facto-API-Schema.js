module.exports =
{
	// ================================================================
	// Schema Operations
	// ================================================================

	loadSchemas: function()
	{
		return this.api('GET', '/1.0/FactoSchemas/0/100').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.Schemas = Array.isArray(pResponse) ? pResponse : [];
				return this.pict.AppData.Facto.Schemas;
			});
	},

	createSchema: function(pSchemaData)
	{
		return this.api('POST', '/1.0/FactoSchema', pSchemaData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadSchemaSummary: function(pIDSchema)
	{
		return this.api('GET', `/facto/schema/${pIDSchema}/summary`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	// ================================================================
	// Schema Documentation Operations
	// ================================================================

	loadSchemaDocumentation: function(pIDSchema)
	{
		return this.api('GET', `/facto/schema/${pIDSchema}/documentation`);
	},

	loadSchemaDocument: function(pIDSchema, pIDDoc)
	{
		return this.api('GET', `/facto/schema/${pIDSchema}/documentation/${pIDDoc}`);
	},

	createSchemaDocument: function(pIDSchema, pData)
	{
		return this.api('POST', `/facto/schema/${pIDSchema}/documentation`, pData);
	},

	updateSchemaDocument: function(pIDSchema, pIDDoc, pData)
	{
		return this.api('PUT', `/facto/schema/${pIDSchema}/documentation/${pIDDoc}`, pData);
	},

	deleteSchemaDocument: function(pIDSchema, pIDDoc)
	{
		return this.api('DELETE', `/facto/schema/${pIDSchema}/documentation/${pIDDoc}`);
	},

	uploadSchemaFile: function(pIDSchema, pFilename, pContentType, pBase64Data)
	{
		return this.api('POST', `/facto/schema/${pIDSchema}/documentation/upload`,
			{
				Filename: pFilename,
				ContentType: pContentType,
				Data: pBase64Data
			});
	},

	// ================================================================
	// Schema Version Operations
	// ================================================================

	loadSchemaVersions: function(pIDSchema)
	{
		return this.api('GET', `/facto/schema/${pIDSchema}/versions`);
	},

	saveSchema: function(pIDSchema, pData)
	{
		return this.api('POST', `/facto/schema/${pIDSchema}/save`, pData);
	},

	compileSchemaDefinition: function(pIDSchema, pDDL)
	{
		return this.api('PUT', `/facto/schema/${pIDSchema}/compile`, { DDL: pDDL });
	},

	// ================================================================
	// Schema-Dataset Link Operations
	// ================================================================

	linkSchemaToDataset: function(pIDSchema, pIDDataset)
	{
		return this.api('PUT', `/facto/schema/${pIDSchema}/link-dataset/${pIDDataset}`);
	},

	unlinkSchemaFromDataset: function(pIDSchema, pIDDataset)
	{
		return this.api('PUT', `/facto/schema/${pIDSchema}/unlink-dataset/${pIDDataset}`);
	},

	analyzeRecords: function(pIDDataset, pIDSource, pSampleSize)
	{
		return this.api('POST', '/facto/schemas/analyze-records',
			{
				IDDataset: pIDDataset || 0,
				IDSource: pIDSource || 0,
				SampleSize: pSampleSize || 50
			});
	}
};
