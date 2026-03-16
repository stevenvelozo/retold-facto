const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Scanner",

	DefaultRenderable: "Facto-Full-Scanner-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-scanner-summary {
			display: flex;
			gap: 1.5em;
			padding: 0.75em 1em;
			background: var(--facto-bg-elevated);
			border-radius: 6px;
			margin-bottom: 1.25em;
			font-size: 0.9em;
		}
		.facto-scanner-summary-stat {
			display: flex;
			gap: 0.4em;
			align-items: baseline;
		}
		.facto-scanner-summary-stat strong {
			font-size: 1.2em;
			color: var(--facto-text-heading);
		}
		.facto-scanner-add-path {
			display: flex;
			gap: 0.75em;
			margin-bottom: 1.25em;
		}
		.facto-scanner-add-path input {
			flex: 1;
			margin-bottom: 0;
		}
		.facto-scanner-filters {
			display: flex;
			gap: 0.75em;
			margin-bottom: 0.75em;
			align-items: flex-end;
		}
		.facto-scanner-filters input {
			flex: 3;
			margin-bottom: 0;
		}
		.facto-scanner-filters select {
			flex: 1;
			margin-bottom: 0;
		}
		.facto-scanner-detail-panel {
			margin-top: 1.25em;
			padding: 1.25em;
			background: var(--facto-bg-elevated);
			border: 1px solid var(--facto-border-subtle);
			border-radius: 8px;
		}
		.facto-scanner-detail-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.5em 1.5em;
			font-size: 0.9em;
			margin-bottom: 1em;
		}
		.facto-scanner-description {
			color: var(--facto-text-secondary);
			font-size: 0.9em;
			margin-top: 0.35em;
			max-height: 100px;
			overflow-y: auto;
			white-space: pre-wrap;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-Scanner-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Source Folder Scanner</h1>
		<p>Point the scanner at folder trees containing dataset research (README.md + data/). Discovered datasets can be provisioned into the database individually or in bulk.</p>
	</div>

	<!-- Status (above everything so it's always visible) -->
	<div id="Facto-Full-Scanner-Status" class="facto-status" style="display:none;"></div>

	<!-- Summary bar -->
	<div class="facto-scanner-summary" id="Facto-Full-Scanner-Summary">
		<span style="color:var(--facto-text-secondary);">No datasets loaded</span>
	</div>

	<!-- Add scan path -->
	<div class="facto-scanner-add-path">
		<input type="text" id="Facto-Full-Scanner-PathInput" placeholder="/path/to/dataset/folder/tree">
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Scanner'].addPath()">Add &amp; Scan</button>
		<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-Scanner'].rescanAll()">Re-scan All</button>
	</div>

	<!-- Scan paths list -->
	<div id="Facto-Full-Scanner-PathsList" style="margin-bottom:1.5em;"></div>

	<!-- Filter bar -->
	<div class="facto-scanner-filters">
		<input type="text" id="Facto-Full-Scanner-Search" placeholder="Search by name, title, or provider..." oninput="{~P~}.views['Facto-Full-Scanner'].filterDatasets()">
		<select id="Facto-Full-Scanner-StatusFilter" onchange="{~P~}.views['Facto-Full-Scanner'].filterDatasets()">
			<option value="">All Statuses</option>
			<option value="Discovered">Discovered</option>
			<option value="Provisioned">Provisioned</option>
			<option value="Ingested">Ingested</option>
			<option value="Error">Error</option>
		</select>
		<button class="facto-btn facto-btn-success" onclick="{~P~}.views['Facto-Full-Scanner'].provisionSelected()">Provision Selected</button>
		<button class="facto-btn facto-btn-success" onclick="{~P~}.views['Facto-Full-Scanner'].provisionAll()">Provision All</button>
	</div>

	<!-- Datasets table -->
	<div id="Facto-Full-Scanner-DatasetsList"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Scanner-Content",
			TemplateHash: "Facto-Full-Scanner-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullScannerView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.loadScannerState();
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	setStatus(pMessage, pType)
	{
		let tmpEl = document.getElementById('Facto-Full-Scanner-Status');
		if (!tmpEl) return;
		tmpEl.className = 'facto-status facto-status-' + (pType || 'info');
		tmpEl.textContent = pMessage;
		tmpEl.style.display = 'block';
		tmpEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	loadScannerState()
	{
		Promise.all(
			[
				this.pict.providers.Facto.loadScannerPaths(),
				this.pict.providers.Facto.loadScannerDatasets()
			]).then(
			() =>
			{
				this.refreshPathsList();
				this.refreshDatasetsList();
			}).catch(
			(pError) =>
			{
				this.setStatus('Error loading scanner state: ' + pError.message, 'error');
			});
	}

	refreshPathsList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Scanner-PathsList');
		if (!tmpContainer) return;

		let tmpPaths = this.pict.AppData.Facto.ScannerPaths || [];

		if (tmpPaths.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No scan paths configured. Add a folder path to discover datasets.</div>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>Path</th><th>Datasets</th><th>Last Scanned</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpPaths.length; i++)
		{
			let tmpPath = tmpPaths[i];
			let tmpLastScanned = tmpPath.LastScannedAt ? new Date(tmpPath.LastScannedAt).toLocaleString() : 'Never';
			tmpHtml += '<tr>';
			tmpHtml += '<td style="font-family:\'SF Mono\', Consolas, monospace; font-size:0.85em;">' + this.escapeHtml(tmpPath.Path) + '</td>';
			tmpHtml += '<td>' + (tmpPath.DatasetCount || 0) + '</td>';
			tmpHtml += '<td>' + tmpLastScanned + '</td>';
			tmpHtml += '<td><button class="facto-btn facto-btn-danger facto-btn-small" onclick="pict.views[\'Facto-Full-Scanner\'].removePath(\'' + this.escapeAttr(tmpPath.Path) + '\')">Remove</button></td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	refreshDatasetsList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Scanner-DatasetsList');
		if (!tmpContainer) return;

		let tmpDatasets = this.pict.AppData.Facto.ScannerDatasets || [];

		if (tmpDatasets.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No datasets discovered yet. Add a scan path containing dataset folders with README.md files.</div>';
			this.updateSummary(0, 0, 0, 0);
			return;
		}

		// Compute summary stats
		let tmpDiscovered = 0;
		let tmpProvisioned = 0;
		let tmpIngested = 0;
		let tmpWithData = 0;
		for (let i = 0; i < tmpDatasets.length; i++)
		{
			if (tmpDatasets[i].Status === 'Discovered') tmpDiscovered++;
			if (tmpDatasets[i].Status === 'Provisioned') tmpProvisioned++;
			if (tmpDatasets[i].Status === 'Ingested') tmpIngested++;
			if (tmpDatasets[i].HasData) tmpWithData++;
		}
		this.updateSummary(tmpDatasets.length, tmpDiscovered, tmpProvisioned, tmpWithData);

		// Apply search filter
		let tmpSearchEl = document.getElementById('Facto-Full-Scanner-Search');
		let tmpSearchTerm = tmpSearchEl ? tmpSearchEl.value.toLowerCase() : '';

		let tmpStatusFilter = document.getElementById('Facto-Full-Scanner-StatusFilter');
		let tmpStatusValue = tmpStatusFilter ? tmpStatusFilter.value : '';

		let tmpFiltered = tmpDatasets;
		if (tmpSearchTerm)
		{
			tmpFiltered = tmpFiltered.filter(
				(pDS) =>
				{
					let tmpText = ((pDS.FolderName || '') + ' ' + (pDS.Title || '') + ' ' + (pDS.Provider || '')).toLowerCase();
					return tmpText.indexOf(tmpSearchTerm) > -1;
				});
		}
		if (tmpStatusValue)
		{
			tmpFiltered = tmpFiltered.filter(
				(pDS) =>
				{
					return pDS.Status === tmpStatusValue;
				});
		}

		let tmpHtml = '<table><thead><tr>';
		tmpHtml += '<th><input type="checkbox" id="Facto-Full-Scanner-SelectAll" onclick="pict.views[\'Facto-Full-Scanner\'].toggleSelectAll(this.checked)"></th>';
		tmpHtml += '<th>Name</th><th>Title</th><th>Provider</th><th>Format</th><th>Data</th><th>Status</th><th>Actions</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < tmpFiltered.length; i++)
		{
			let tmpDS = tmpFiltered[i];
			let tmpStatusBadge = this.getStatusBadge(tmpDS.Status);
			let tmpDataInfo = tmpDS.HasData
				? (tmpDS.DataFileCount + ' file' + (tmpDS.DataFileCount !== 1 ? 's' : '') + ' (' + (tmpDS.TotalDataSizeFormatted || '0 B') + ')')
				: '<span style="color:var(--facto-text-danger, #dc3545);">No data</span>';
			let tmpFormat = tmpDS.DataFormat ? (tmpDS.DataFormat.Format || 'unknown') : 'unknown';
			let tmpEscFolder = this.escapeAttr(tmpDS.FolderName);

			tmpHtml += '<tr id="facto-scanner-row-' + tmpEscFolder + '">';
			tmpHtml += '<td><input type="checkbox" class="facto-scanner-checkbox" data-folder="' + tmpEscFolder + '"></td>';
			tmpHtml += '<td style="font-family:\'SF Mono\', Consolas, monospace; font-size:0.85em;">' + this.escapeHtml(tmpDS.FolderName) + '</td>';
			tmpHtml += '<td>' + this.escapeHtml((tmpDS.Title || '').substring(0, 50)) + '</td>';
			tmpHtml += '<td>' + this.escapeHtml((tmpDS.Provider || '').substring(0, 30)) + '</td>';
			tmpHtml += '<td><span class="facto-badge facto-badge-primary">' + tmpFormat + '</span></td>';
			tmpHtml += '<td>' + tmpDataInfo + '</td>';
			tmpHtml += '<td>' + tmpStatusBadge + '</td>';
			tmpHtml += '<td>';
			if (tmpDS.Status === 'Discovered')
			{
				tmpHtml += '<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-Scanner\'].provisionOne(\'' + tmpEscFolder + '\')">Provision</button> ';
			}
			if ((tmpDS.Status === 'Provisioned' || tmpDS.Status === 'Discovered') && tmpDS.HasData)
			{
				tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-Scanner\'].ingestOne(\'' + tmpEscFolder + '\')">Ingest</button> ';
			}
			tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Scanner\'].viewDetail(\'' + tmpEscFolder + '\')">Detail</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpHtml += '<div style="color:var(--facto-text-secondary); font-size:0.85em; margin-top:0.5em;">Showing ' + tmpFiltered.length + ' of ' + tmpDatasets.length + ' dataset(s)</div>';

		tmpContainer.innerHTML = tmpHtml;
	}

	updateSummary(pTotal, pDiscovered, pProvisioned, pWithData)
	{
		let tmpEl = document.getElementById('Facto-Full-Scanner-Summary');
		if (!tmpEl) return;

		tmpEl.innerHTML = '<div class="facto-scanner-summary-stat"><strong>' + pTotal + '</strong> discovered</div>'
			+ '<div class="facto-scanner-summary-stat"><strong>' + pProvisioned + '</strong> provisioned</div>'
			+ '<div class="facto-scanner-summary-stat"><strong>' + pWithData + '</strong> with data</div>';
	}

	getStatusBadge(pStatus)
	{
		if (pStatus === 'Discovered') return '<span class="facto-badge facto-badge-info">Discovered</span>';
		if (pStatus === 'Provisioned') return '<span class="facto-badge facto-badge-success">Provisioned</span>';
		if (pStatus === 'Ingested') return '<span class="facto-badge facto-badge-warning">Ingested</span>';
		if (pStatus === 'Error') return '<span class="facto-badge facto-badge-danger">Error</span>';
		return '<span class="facto-badge facto-badge-muted">' + (pStatus || '') + '</span>';
	}

	escapeHtml(pStr)
	{
		if (!pStr) return '';
		return pStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	escapeAttr(pStr)
	{
		if (!pStr) return '';
		return pStr.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '&quot;');
	}

	formatSize(pBytes)
	{
		if (pBytes === 0) return '0 B';
		let tmpUnits = ['B', 'KB', 'MB', 'GB'];
		let tmpI = Math.floor(Math.log(pBytes) / Math.log(1024));
		if (tmpI >= tmpUnits.length) tmpI = tmpUnits.length - 1;
		return (pBytes / Math.pow(1024, tmpI)).toFixed(tmpI > 0 ? 1 : 0) + ' ' + tmpUnits[tmpI];
	}

	// ================================================================
	// Actions
	// ================================================================

	addPath()
	{
		let tmpPathInput = document.getElementById('Facto-Full-Scanner-PathInput');
		let tmpPath = tmpPathInput ? tmpPathInput.value.trim() : '';

		if (!tmpPath)
		{
			this.setStatus('Enter a folder path to scan', 'warn');
			return;
		}

		this.setStatus('Scanning ' + tmpPath + '...', 'info');

		this.pict.providers.Facto.addScannerPath(tmpPath).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.setStatus('Error: ' + pResponse.Error, 'error');
					return;
				}
				let tmpResult = pResponse.ScanResult || {};
				this.setStatus('Scanned! Found ' + (tmpResult.DatasetsFound || 0) + ' dataset(s) in ' + (tmpResult.FoldersScanned || 0) + ' folder(s)', 'ok');
				if (tmpPathInput) tmpPathInput.value = '';
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.setStatus('Error: ' + pError.message, 'error');
			});
	}

	removePath(pPath)
	{
		if (!confirm('Remove scan path and its discovered datasets?\n\n' + pPath)) return;

		this.pict.providers.Facto.removeScannerPath(pPath).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.setStatus('Error: ' + pResponse.Error, 'error');
					return;
				}
				this.setStatus('Path removed', 'ok');
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.setStatus('Error: ' + pError.message, 'error');
			});
	}

	rescanAll()
	{
		this.setStatus('Re-scanning all paths...', 'info');

		this.pict.providers.Facto.rescanPaths().then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.setStatus('Error: ' + pResponse.Error, 'error');
					return;
				}
				this.setStatus('Re-scan complete', 'ok');
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.setStatus('Error: ' + pError.message, 'error');
			});
	}

	filterDatasets()
	{
		this.refreshDatasetsList();
	}

	toggleSelectAll(pChecked)
	{
		let tmpCheckboxes = document.querySelectorAll('.facto-scanner-checkbox');
		for (let i = 0; i < tmpCheckboxes.length; i++)
		{
			tmpCheckboxes[i].checked = pChecked;
		}
	}

	getSelectedFolderNames()
	{
		let tmpCheckboxes = document.querySelectorAll('.facto-scanner-checkbox:checked');
		let tmpNames = [];
		for (let i = 0; i < tmpCheckboxes.length; i++)
		{
			tmpNames.push(tmpCheckboxes[i].getAttribute('data-folder'));
		}
		return tmpNames;
	}

	provisionOne(pFolderName)
	{
		this.setStatus('Provisioning ' + pFolderName + '...', 'info');

		this.pict.providers.Facto.provisionScannerDataset(pFolderName).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.setStatus('Error: ' + pResponse.Error, 'error');
					return;
				}
				this.setStatus(
					'Provisioned ' + pFolderName + ' (Source #' + (pResponse.Source ? pResponse.Source.IDSource : '?') + ', Dataset #' + (pResponse.Dataset ? pResponse.Dataset.IDDataset : '?') + ')', 'ok');
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.setStatus('Error: ' + pError.message, 'error');
			});
	}

	ingestOne(pFolderName)
	{
		this.setStatus('Ingesting ' + pFolderName + '...', 'info');

		this.pict.providers.Facto.ingestScannerDataset(pFolderName).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.setStatus('Ingest error: ' + pResponse.Error, 'error');
					return;
				}
				let tmpMsg = 'Ingested ' + pFolderName;
				if (pResponse.RecordsIngested !== undefined)
				{
					tmpMsg += ' — ' + pResponse.RecordsIngested + ' records';
				}
				if (pResponse.File)
				{
					tmpMsg += ' from ' + pResponse.File;
				}
				this.setStatus(tmpMsg, 'ok');
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.setStatus('Ingest error: ' + pError.message, 'error');
			});
	}

	provisionSelected()
	{
		let tmpSelected = this.getSelectedFolderNames();
		if (tmpSelected.length === 0)
		{
			this.setStatus('Select datasets to provision using the checkboxes', 'warn');
			return;
		}

		if (!confirm('Provision ' + tmpSelected.length + ' selected dataset(s)?')) return;

		this.provisionBatch(tmpSelected, 0, 0, 0);
	}

	provisionAll()
	{
		if (!confirm('Provision ALL discovered datasets?')) return;

		this.setStatus('Provisioning all datasets...', 'info');

		this.pict.providers.Facto.provisionAllScannerDatasets().then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.setStatus('Error: ' + pResponse.Error, 'error');
					return;
				}
				this.setStatus(
					'Provisioned ' + pResponse.Provisioned + ' of ' + pResponse.Total + ' (' + pResponse.Errors + ' error(s))', 'ok');
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.setStatus('Error: ' + pError.message, 'error');
			});
	}

	provisionBatch(pFolderNames, pIndex, pSuccessCount, pErrorCount)
	{
		if (pIndex >= pFolderNames.length)
		{
			this.setStatus(
				'Provisioned ' + pSuccessCount + ' of ' + pFolderNames.length + ' (' + pErrorCount + ' error(s))', 'ok');
			this.loadScannerState();
			return;
		}

		let tmpName = pFolderNames[pIndex];
		this.setStatus('Provisioning ' + (pIndex + 1) + '/' + pFolderNames.length + ': ' + tmpName + '...', 'info');

		this.pict.providers.Facto.provisionScannerDataset(tmpName).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.provisionBatch(pFolderNames, pIndex + 1, pSuccessCount, pErrorCount + 1);
				}
				else
				{
					this.provisionBatch(pFolderNames, pIndex + 1, pSuccessCount + 1, pErrorCount);
				}
			}).catch(
			() =>
			{
				this.provisionBatch(pFolderNames, pIndex + 1, pSuccessCount, pErrorCount + 1);
			});
	}

	viewDetail(pFolderName)
	{
		let tmpDetailRowId = 'facto-scanner-detail-' + pFolderName;
		let tmpExisting = document.getElementById(tmpDetailRowId);

		// Toggle: if already open, close it
		if (tmpExisting)
		{
			tmpExisting.remove();
			return;
		}

		// Close any other open detail row
		let tmpOldDetails = document.querySelectorAll('.facto-scanner-detail-row');
		for (let i = 0; i < tmpOldDetails.length; i++)
		{
			tmpOldDetails[i].remove();
		}

		// Find the clicked row and insert a detail row right after it
		let tmpRow = document.getElementById('facto-scanner-row-' + this.escapeAttr(pFolderName));
		if (!tmpRow) return;

		let tmpColCount = tmpRow.children.length;
		let tmpDetailRow = document.createElement('tr');
		tmpDetailRow.id = tmpDetailRowId;
		tmpDetailRow.className = 'facto-scanner-detail-row';
		tmpDetailRow.innerHTML = '<td colspan="' + tmpColCount + '"><div class="facto-scanner-detail-panel" style="margin:0;"><span style="color:var(--facto-text-secondary);">Loading details for ' + this.escapeHtml(pFolderName) + '...</span></div></td>';
		tmpRow.after(tmpDetailRow);

		this.pict.providers.Facto.loadScannerDatasetDetail(pFolderName).then(
			(pDS) =>
			{
				// Row might have been removed while loading
				let tmpTarget = document.getElementById(tmpDetailRowId);
				if (!tmpTarget) return;

				if (pDS && pDS.Error)
				{
					tmpTarget.innerHTML = '<td colspan="' + tmpColCount + '"><div class="facto-status facto-status-error" style="margin:0;">' + pDS.Error + '</div></td>';
					return;
				}

				let tmpHtml = '<td colspan="' + tmpColCount + '"><div class="facto-scanner-detail-panel" style="margin:0;">';
				tmpHtml += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1em;">';
				tmpHtml += '<h3 style="margin:0;">' + this.escapeHtml(pDS.Title || pDS.FolderName) + '</h3>';
				tmpHtml += '<button class="facto-btn facto-btn-secondary" onclick="pict.views[\'Facto-Full-Scanner\'].viewDetail(\'' + this.escapeAttr(pFolderName) + '\')">Close</button>';
				tmpHtml += '</div>';

				// Metadata grid
				tmpHtml += '<div class="facto-scanner-detail-grid">';
				tmpHtml += '<div><strong>Folder:</strong> <span style="font-family:\'SF Mono\', Consolas, monospace;">' + this.escapeHtml(pDS.FolderName) + '</span></div>';
				tmpHtml += '<div><strong>Status:</strong> ' + this.getStatusBadge(pDS.Status) + '</div>';
				tmpHtml += '<div><strong>Provider:</strong> ' + this.escapeHtml(pDS.Provider || 'Unknown') + '</div>';
				tmpHtml += '<div><strong>License:</strong> ' + this.escapeHtml(pDS.License || 'Unknown') + '</div>';
				if (pDS.SourceURL)
				{
					tmpHtml += '<div><strong>Source:</strong> <a href="' + this.escapeHtml(pDS.SourceURL) + '" target="_blank" style="color:var(--facto-brand);">' + this.escapeHtml(pDS.SourceURL.substring(0, 60)) + '</a></div>';
				}
				if (pDS.UpdateFrequency)
				{
					tmpHtml += '<div><strong>Update Frequency:</strong> ' + this.escapeHtml(pDS.UpdateFrequency.substring(0, 100)) + '</div>';
				}
				if (pDS.RecordCount)
				{
					tmpHtml += '<div><strong>Record Count:</strong> ' + this.escapeHtml(pDS.RecordCount.substring(0, 100)) + '</div>';
				}
				if (pDS.IDSource)
				{
					tmpHtml += '<div><strong>Source ID:</strong> <a href="#/Source/' + pDS.IDSource + '" style="color:var(--facto-brand);">#' + pDS.IDSource + '</a></div>';
				}
				if (pDS.IDDataset)
				{
					tmpHtml += '<div><strong>Dataset ID:</strong> #' + pDS.IDDataset + '</div>';
				}
				tmpHtml += '</div>';

				// Description
				if (pDS.Description)
				{
					tmpHtml += '<div style="margin-bottom:1em;"><strong>Description:</strong>';
					tmpHtml += '<div class="facto-scanner-description">' + this.escapeHtml(pDS.Description.substring(0, 500)) + '</div>';
					tmpHtml += '</div>';
				}

				// Data files
				if (pDS.DataFiles && pDS.DataFiles.length > 0)
				{
					tmpHtml += '<div style="margin-bottom:1em;"><strong>Data Files (' + pDS.DataFiles.length + '):</strong>';
					tmpHtml += '<table style="margin-top:0.35em;"><thead><tr><th>File</th><th>Format</th><th>Size</th><th>Compressed</th></tr></thead><tbody>';
					for (let i = 0; i < pDS.DataFiles.length && i < 20; i++)
					{
						let tmpFile = pDS.DataFiles[i];
						let tmpSize = this.formatSize(tmpFile.Size || 0);
						tmpHtml += '<tr>';
						tmpHtml += '<td style="font-family:\'SF Mono\', Consolas, monospace; font-size:0.85em;">' + this.escapeHtml(tmpFile.FileName) + '</td>';
						tmpHtml += '<td><span class="facto-badge facto-badge-primary">' + (tmpFile.Format || '') + '</span></td>';
						tmpHtml += '<td>' + tmpSize + '</td>';
						tmpHtml += '<td>' + (tmpFile.Compressed ? 'Yes' : 'No') + '</td>';
						tmpHtml += '</tr>';
					}
					tmpHtml += '</tbody></table>';
					tmpHtml += '</div>';
				}

				// Errors
				if (pDS.Errors && pDS.Errors.length > 0)
				{
					tmpHtml += '<div style="margin-bottom:1em;"><strong>Errors:</strong>';
					tmpHtml += '<ul style="margin-top:0.35em; padding-left:1.5em; color:var(--facto-text-danger, #dc3545);">';
					for (let i = 0; i < pDS.Errors.length; i++)
					{
						tmpHtml += '<li>' + this.escapeHtml(pDS.Errors[i]) + '</li>';
					}
					tmpHtml += '</ul></div>';
				}

				// Action buttons
				tmpHtml += '<div style="margin-top:1em; padding-top:1em; border-top:1px solid var(--facto-border-subtle, #eee);">';
				if (pDS.Status === 'Discovered')
				{
					tmpHtml += '<button class="facto-btn facto-btn-success" onclick="pict.views[\'Facto-Full-Scanner\'].provisionOne(\'' + this.escapeAttr(pFolderName) + '\')">Provision</button> ';
				}
				if (pDS.HasData)
				{
					tmpHtml += '<button class="facto-btn facto-btn-primary" onclick="pict.views[\'Facto-Full-Scanner\'].ingestOne(\'' + this.escapeAttr(pFolderName) + '\')">Ingest Data</button> ';
				}
				if (pDS.IDSource)
				{
					tmpHtml += '<button class="facto-btn facto-btn-secondary" onclick="pict.PictApplication.navigateTo(\'/Source/' + pDS.IDSource + '\')">View Source &rarr;</button> ';
				}
				tmpHtml += '</div>';

				tmpHtml += '</div></td>';
				tmpTarget.innerHTML = tmpHtml;
				tmpTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
			}).catch(
			(pError) =>
			{
				let tmpTarget = document.getElementById(tmpDetailRowId);
				if (tmpTarget)
				{
					tmpTarget.innerHTML = '<td colspan="' + tmpColCount + '"><div class="facto-status facto-status-error" style="margin:0;">Error: ' + pError.message + '</div></td>';
				}
			});
	}
}

module.exports = FactoFullScannerView;

module.exports.default_configuration = _ViewConfiguration;
