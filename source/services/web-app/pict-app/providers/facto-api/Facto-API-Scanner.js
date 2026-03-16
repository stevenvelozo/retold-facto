module.exports =
{
	loadScannerPaths: function()
	{
		return this.api('GET', '/facto/scanner/paths').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.ScannerPaths = (pResponse && pResponse.Paths) ? pResponse.Paths : [];
			});
	},

	loadScannerDatasets: function(pFilter)
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
	},

	loadScannerDatasetDetail: function(pFolderName)
	{
		return this.api('GET', '/facto/scanner/dataset/' + encodeURIComponent(pFolderName));
	},

	addScannerPath: function(pPath)
	{
		return this.api('POST', '/facto/scanner/path', { Path: pPath });
	},

	removeScannerPath: function(pPath)
	{
		return this.api('DELETE', '/facto/scanner/path', { Path: pPath });
	},

	rescanPaths: function(pPath)
	{
		let tmpBody = pPath ? { Path: pPath } : {};
		return this.api('POST', '/facto/scanner/rescan', tmpBody);
	},

	provisionScannerDataset: function(pFolderName)
	{
		return this.api('POST', '/facto/scanner/dataset/' + encodeURIComponent(pFolderName) + '/provision');
	},

	ingestScannerDataset: function(pFolderName, pOptions)
	{
		return this.api('POST', '/facto/scanner/dataset/' + encodeURIComponent(pFolderName) + '/ingest', pOptions || {});
	},

	downloadScannerDataset: function(pFolderName)
	{
		return this.api('POST', '/facto/scanner/dataset/' + encodeURIComponent(pFolderName) + '/download');
	},

	provisionAllScannerDatasets: function()
	{
		return this.api('POST', '/facto/scanner/provision-all');
	}
};
