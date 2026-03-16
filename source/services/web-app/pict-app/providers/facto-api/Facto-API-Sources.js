module.exports =
{
	// ================================================================
	// Source Operations
	// ================================================================

	loadSources: function()
	{
		return this.api('GET', '/1.0/Sources/0/100').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.Sources = Array.isArray(pResponse) ? pResponse : [];
				return this.pict.AppData.Facto.Sources;
			});
	},

	loadActiveSources: function()
	{
		return this.api('GET', '/facto/sources/active').then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	createSource: function(pSourceData)
	{
		return this.api('POST', '/1.0/Source', pSourceData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	activateSource: function(pIDSource)
	{
		return this.api('PUT', `/facto/source/${pIDSource}/activate`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	deactivateSource: function(pIDSource)
	{
		return this.api('PUT', `/facto/source/${pIDSource}/deactivate`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadSourceSummary: function(pIDSource)
	{
		return this.api('GET', `/facto/source/${pIDSource}/summary`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	// ================================================================
	// Source Documentation Operations
	// ================================================================

	loadSourceDocumentation: function(pIDSource)
	{
		return this.api('GET', `/facto/source/${pIDSource}/documentation`);
	},

	loadSourceDocument: function(pIDSource, pIDDoc)
	{
		return this.api('GET', `/facto/source/${pIDSource}/documentation/${pIDDoc}`);
	},

	createSourceDocument: function(pIDSource, pData)
	{
		return this.api('POST', `/facto/source/${pIDSource}/documentation`, pData);
	},

	updateSourceDocument: function(pIDSource, pIDDoc, pData)
	{
		return this.api('PUT', `/facto/source/${pIDSource}/documentation/${pIDDoc}`, pData);
	},

	deleteSourceDocument: function(pIDSource, pIDDoc)
	{
		return this.api('DELETE', `/facto/source/${pIDSource}/documentation/${pIDDoc}`);
	},

	// ================================================================
	// Source Catalog Context
	// ================================================================

	loadSourceCatalogContext: function(pIDSource)
	{
		return this.api('GET', `/facto/source/${pIDSource}/catalog-context`);
	},

	loadCatalogSourceLinks: function()
	{
		return this.api('GET', '/facto/catalog/source-links');
	}
};
