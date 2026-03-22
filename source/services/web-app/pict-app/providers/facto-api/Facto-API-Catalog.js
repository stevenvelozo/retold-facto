module.exports =
{
	loadCatalogEntries: function()
	{
		return this.api('GET', '/facto/catalog/entries').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.CatalogEntries = (pResponse && pResponse.Entries) ? pResponse.Entries : [];
			});
	},

	searchCatalog: function(pQuery)
	{
		return this.api('GET', '/facto/catalog/search?q=' + encodeURIComponent(pQuery)).then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.CatalogEntries = (pResponse && pResponse.Entries) ? pResponse.Entries : [];
				return pResponse;
			});
	},

	createCatalogEntry: function(pData)
	{
		return this.api('POST', '/facto/catalog/entry', pData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	deleteCatalogEntry: function(pIDEntry)
	{
		return this.api('DELETE', '/facto/catalog/entry/' + pIDEntry).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadCatalogEntryDatasets: function(pIDEntry)
	{
		return this.api('GET', '/facto/catalog/entry/' + pIDEntry + '/datasets').then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	addCatalogDataset: function(pIDEntry, pData)
	{
		return this.api('POST', '/facto/catalog/entry/' + pIDEntry + '/dataset', pData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	provisionCatalogDataset: function(pIDCatalogDataset)
	{
		return this.api('POST', '/facto/catalog/dataset/' + pIDCatalogDataset + '/provision').then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	fetchCatalogDataset: function(pIDCatalogDataset)
	{
		return this.api('POST', '/facto/catalog/dataset/' + pIDCatalogDataset + '/fetch').then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	importCatalog: function(pEntries)
	{
		return this.api('POST', '/facto/catalog/import', pEntries).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	exportCatalog: function()
	{
		return this.api('GET', '/facto/catalog/export').then(
			(pResponse) =>
			{
				return pResponse;
			});
	}
};
