const libPictView = require('pict-view');

class FactoScannerView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		this.loadScannerState();
	}

	loadScannerState()
	{
		// Load scan paths and discovered datasets
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
				this.pict.views['Pict-Section-Modal'].toast('Error loading scanner state: ' + pError.message, {type: 'error'});
			});
	}

	refreshPathsList()
	{
		let tmpContainer = document.getElementById('facto-scanner-paths-list');
		if (!tmpContainer) return;

		let tmpPaths = this.pict.AppData.Facto.ScannerPaths || [];

		if (tmpPaths.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No scan paths configured. Add a folder path to discover datasets.</p>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>Path</th><th>Datasets</th><th>Last Scanned</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpPaths.length; i++)
		{
			let tmpPath = tmpPaths[i];
			let tmpLastScanned = tmpPath.LastScannedAt ? new Date(tmpPath.LastScannedAt).toLocaleString() : 'Never';
			tmpHtml += '<tr>';
			tmpHtml += '<td style="font-family:monospace; font-size:0.85em;">' + this.escapeHtml(tmpPath.Path) + '</td>';
			tmpHtml += '<td>' + (tmpPath.DatasetCount || 0) + '</td>';
			tmpHtml += '<td>' + tmpLastScanned + '</td>';
			tmpHtml += '<td>';
			tmpHtml += '<button class="danger" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Scanner\'].removePath(\'' + this.escapeAttr(tmpPath.Path) + '\')">Remove</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	refreshDatasetsList()
	{
		let tmpContainer = document.getElementById('facto-scanner-datasets-list');
		if (!tmpContainer) return;

		let tmpDatasets = this.pict.AppData.Facto.ScannerDatasets || [];

		if (tmpDatasets.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No datasets discovered yet. Add a scan path containing dataset folders with README.md files.</p>';
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
		let tmpSearchEl = document.getElementById('facto-scanner-search');
		let tmpSearchTerm = tmpSearchEl ? tmpSearchEl.value.toLowerCase() : '';

		let tmpStatusFilter = document.getElementById('facto-scanner-status-filter');
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
		tmpHtml += '<th><input type="checkbox" id="facto-scanner-select-all" onclick="pict.views[\'Facto-Scanner\'].toggleSelectAll(this.checked)"></th>';
		tmpHtml += '<th>Name</th><th>Title</th><th>Provider</th><th>Format</th><th>Data</th><th>Status</th><th>Actions</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < tmpFiltered.length; i++)
		{
			let tmpDS = tmpFiltered[i];
			let tmpStatusClass = this.getStatusBadgeClass(tmpDS.Status);
			let tmpDataInfo = tmpDS.HasData
				? (tmpDS.DataFileCount + ' file' + (tmpDS.DataFileCount !== 1 ? 's' : '') + ' (' + (tmpDS.TotalDataSizeFormatted || '0 B') + ')')
				: '<span style="color:#dc3545;">No data</span>';
			let tmpFormat = tmpDS.DataFormat ? (tmpDS.DataFormat.Format || 'unknown') : 'unknown';

			tmpHtml += '<tr>';
			tmpHtml += '<td><input type="checkbox" class="facto-scanner-checkbox" data-folder="' + this.escapeAttr(tmpDS.FolderName) + '"></td>';
			tmpHtml += '<td style="font-family:monospace; font-size:0.85em;">' + this.escapeHtml(tmpDS.FolderName) + '</td>';
			tmpHtml += '<td>' + this.escapeHtml((tmpDS.Title || '').substring(0, 50)) + '</td>';
			tmpHtml += '<td>' + this.escapeHtml((tmpDS.Provider || '').substring(0, 30)) + '</td>';
			tmpHtml += '<td>' + tmpFormat + '</td>';
			tmpHtml += '<td>' + tmpDataInfo + '</td>';
			tmpHtml += '<td><span class="badge ' + tmpStatusClass + '">' + tmpDS.Status + '</span></td>';
			tmpHtml += '<td>';
			let tmpEscFolder = this.escapeAttr(tmpDS.FolderName);
			tmpHtml += '<div class="facto-row-actions" id="facto-row-actions-' + tmpEscFolder + '">';
			tmpHtml += '<button class="facto-row-actions-trigger" onclick="pict.views[\'Facto-Scanner\'].toggleRowMenu(event, \'' + tmpEscFolder + '\')" title="Actions">&#8942;</button>';
			tmpHtml += '<div class="facto-row-actions-menu">';
			tmpHtml += '<button onclick="pict.views[\'Facto-Scanner\'].viewDetail(\'' + tmpEscFolder + '\'); pict.views[\'Facto-Scanner\'].closeRowMenus();">Detail</button>';
			if (tmpDS.Status === 'Discovered')
			{
				tmpHtml += '<button class="facto-action-success" onclick="pict.views[\'Facto-Scanner\'].provisionOne(\'' + tmpEscFolder + '\'); pict.views[\'Facto-Scanner\'].closeRowMenus();">Provision</button>';
			}
			tmpHtml += '</div>';
			tmpHtml += '</div>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpHtml += '<p style="color:#888; font-size:0.85em; margin-top:8px;">Showing ' + tmpFiltered.length + ' of ' + tmpDatasets.length + ' dataset(s)</p>';

		tmpContainer.innerHTML = tmpHtml;
	}

	updateSummary(pTotal, pDiscovered, pProvisioned, pWithData)
	{
		let tmpEl = document.getElementById('facto-scanner-summary');
		if (!tmpEl) return;
		tmpEl.innerHTML = '<strong>' + pTotal + '</strong> discovered &nbsp;|&nbsp; <strong>' + pProvisioned + '</strong> provisioned &nbsp;|&nbsp; <strong>' + pWithData + '</strong> with data';
	}

	getStatusBadgeClass(pStatus)
	{
		if (pStatus === 'Discovered') return 'badge-raw';
		if (pStatus === 'Provisioned') return 'badge-compositional';
		if (pStatus === 'Ingested') return 'badge-projection';
		if (pStatus === 'Error') return 'badge-derived';
		return '';
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

	// ================================================================
	// Actions
	// ================================================================

	addPath()
	{
		let tmpPathInput = document.getElementById('facto-scanner-path-input');
		let tmpPath = tmpPathInput ? tmpPathInput.value.trim() : '';

		if (!tmpPath)
		{
			this.pict.views['Pict-Section-Modal'].toast('Enter a folder path to scan', {type: 'warning'});
			return;
		}

		this.pict.views['Pict-Section-Modal'].toast('Scanning ' + tmpPath + '...', {type: 'info'});

		this.pict.providers.Facto.addScannerPath(tmpPath).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.views['Pict-Section-Modal'].toast('Error: ' + pResponse.Error, {type: 'error'});
					return;
				}
				let tmpResult = pResponse.ScanResult || {};
				this.pict.views['Pict-Section-Modal'].toast('Scanned! Found ' + (tmpResult.DatasetsFound || 0) + ' dataset(s) in ' + (tmpResult.FoldersScanned || 0) + ' folder(s)', {type: 'success'});
				if (tmpPathInput) tmpPathInput.value = '';
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}

	async removePath(pPath)
	{
		let tmpConfirmed = await this.pict.views['Pict-Section-Modal'].confirm('Remove scan path and its discovered datasets?\n\n' + pPath, { title: 'Remove Path', confirmLabel: 'Remove', dangerous: true });
		if (!tmpConfirmed) return;

		this.pict.providers.Facto.removeScannerPath(pPath).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.views['Pict-Section-Modal'].toast('Error: ' + pResponse.Error, {type: 'error'});
					return;
				}
				this.pict.views['Pict-Section-Modal'].toast('Path removed', {type: 'success'});
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}

	rescanAll()
	{
		this.pict.views['Pict-Section-Modal'].toast('Re-scanning all paths...', {type: 'info'});

		this.pict.providers.Facto.rescanPaths().then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.views['Pict-Section-Modal'].toast('Error: ' + pResponse.Error, {type: 'error'});
					return;
				}
				this.pict.views['Pict-Section-Modal'].toast('Re-scan complete', {type: 'success'});
				this.loadScannerState();
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
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
		this.pict.views['Pict-Section-Modal'].toast('Provisioning ' + pFolderName + '...', {type: 'info'});

		this.pict.providers.Facto.provisionScannerDataset(pFolderName).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.views['Pict-Section-Modal'].toast('Error: ' + pResponse.Error, {type: 'error'});
					return;
				}
				this.pict.views['Pict-Section-Modal'].toast('Provisioned ' + pFolderName + ' (Source #' + (pResponse.Source ? pResponse.Source.IDSource : '?') + ', Dataset #' + (pResponse.Dataset ? pResponse.Dataset.IDDataset : '?') + ')', {type: 'success'});
				this.loadScannerState();
				// Refresh sources/datasets views
				this.pict.providers.FactoUI.refreshDataViews(['sources', 'datasets']);
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}

	async provisionSelected()
	{
		let tmpSelected = this.getSelectedFolderNames();
		if (tmpSelected.length === 0)
		{
			this.pict.views['Pict-Section-Modal'].toast('Select datasets to provision using the checkboxes', {type: 'warning'});
			return;
		}

		let tmpConfirmed = await this.pict.views['Pict-Section-Modal'].confirm('Provision ' + tmpSelected.length + ' selected dataset(s)?', { title: 'Provision Selected', confirmLabel: 'Provision' });
		if (!tmpConfirmed) return;

		this.provisionBatch(tmpSelected, 0, 0, 0);
	}

	async provisionAll()
	{
		let tmpConfirmed = await this.pict.views['Pict-Section-Modal'].confirm('Provision ALL discovered datasets?', { title: 'Provision All', confirmLabel: 'Provision All', dangerous: true });
		if (!tmpConfirmed) return;

		this.pict.views['Pict-Section-Modal'].toast('Provisioning all datasets...', {type: 'info'});

		this.pict.providers.Facto.provisionAllScannerDatasets().then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.views['Pict-Section-Modal'].toast('Error: ' + pResponse.Error, {type: 'error'});
					return;
				}
				this.pict.views['Pict-Section-Modal'].toast('Provisioned ' + pResponse.Provisioned + ' of ' + pResponse.Total + ' (' + pResponse.Errors + ' error(s))', {type: 'success'});
				this.loadScannerState();
				this.pict.providers.FactoUI.refreshDataViews(['sources', 'datasets']);
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}

	provisionBatch(pFolderNames, pIndex, pSuccessCount, pErrorCount)
	{
		if (pIndex >= pFolderNames.length)
		{
			this.pict.views['Pict-Section-Modal'].toast('Provisioned ' + pSuccessCount + ' of ' + pFolderNames.length + ' (' + pErrorCount + ' error(s))', {type: 'success'});
			this.loadScannerState();
			this.pict.providers.FactoUI.refreshDataViews(['sources', 'datasets']);
			return;
		}

		let tmpName = pFolderNames[pIndex];
		this.pict.views['Pict-Section-Modal'].toast('Provisioning ' + (pIndex + 1) + '/' + pFolderNames.length + ': ' + tmpName + '...', {type: 'info'});

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

	toggleRowMenu(pEvent, pFolderName)
	{
		pEvent.stopPropagation();
		let tmpEl = document.getElementById('facto-row-actions-' + pFolderName);
		if (!tmpEl) return;

		let tmpWasOpen = tmpEl.classList.contains('open');
		this.closeRowMenus();

		if (!tmpWasOpen)
		{
			tmpEl.classList.add('open');
			let tmpCloseHandler = (pCloseEvent) =>
			{
				if (!tmpEl.contains(pCloseEvent.target))
				{
					tmpEl.classList.remove('open');
					document.removeEventListener('click', tmpCloseHandler);
				}
			};
			setTimeout(() => { document.addEventListener('click', tmpCloseHandler); }, 0);
		}
	}

	closeRowMenus()
	{
		let tmpOpenMenus = document.querySelectorAll('.facto-row-actions.open');
		for (let i = 0; i < tmpOpenMenus.length; i++)
		{
			tmpOpenMenus[i].classList.remove('open');
		}
	}

	viewDetail(pFolderName)
	{
		let tmpContainer = document.getElementById('facto-scanner-detail');
		if (!tmpContainer) return;

		tmpContainer.innerHTML = '<p style="color:#888;">Loading details for ' + this.escapeHtml(pFolderName) + '...</p>';

		this.pict.providers.Facto.loadScannerDatasetDetail(pFolderName).then(
			(pDS) =>
			{
				if (pDS && pDS.Error)
				{
					tmpContainer.innerHTML = '<p style="color:#dc3545;">' + pDS.Error + '</p>';
					return;
				}

				let tmpHtml = '<div style="border:1px solid #ddd; border-radius:6px; padding:16px; background:#fafafa;">';
				tmpHtml += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">';
				tmpHtml += '<h3 style="margin:0; font-size:1.1em; color:#333;">' + this.escapeHtml(pDS.Title || pDS.FolderName) + '</h3>';
				tmpHtml += '<button class="secondary" style="padding:4px 10px; font-size:0.82em;" onclick="document.getElementById(\'facto-scanner-detail\').innerHTML=\'\';">Close</button>';
				tmpHtml += '</div>';

				// Metadata grid
				tmpHtml += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 20px; font-size:0.9em; margin-bottom:12px;">';
				tmpHtml += '<div><strong>Folder:</strong> <span style="font-family:monospace;">' + this.escapeHtml(pDS.FolderName) + '</span></div>';
				tmpHtml += '<div><strong>Status:</strong> <span class="badge ' + this.getStatusBadgeClass(pDS.Status) + '">' + (pDS.Status || '') + '</span></div>';
				tmpHtml += '<div><strong>Provider:</strong> ' + this.escapeHtml(pDS.Provider || 'Unknown') + '</div>';
				tmpHtml += '<div><strong>License:</strong> ' + this.escapeHtml(pDS.License || 'Unknown') + '</div>';
				if (pDS.SourceURL)
				{
					tmpHtml += '<div><strong>Source:</strong> <a href="' + this.escapeHtml(pDS.SourceURL) + '" target="_blank">' + this.escapeHtml(pDS.SourceURL.substring(0, 60)) + '</a></div>';
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
					tmpHtml += '<div><strong>Source ID:</strong> #' + pDS.IDSource + '</div>';
				}
				if (pDS.IDDataset)
				{
					tmpHtml += '<div><strong>Dataset ID:</strong> #' + pDS.IDDataset + '</div>';
				}
				tmpHtml += '</div>';

				// Description
				if (pDS.Description)
				{
					tmpHtml += '<div style="margin-bottom:12px;"><strong>Description:</strong><div style="color:#555; font-size:0.9em; margin-top:4px; max-height:100px; overflow-y:auto; white-space:pre-wrap;">' + this.escapeHtml(pDS.Description.substring(0, 500)) + '</div></div>';
				}

				// Data files
				if (pDS.DataFiles && pDS.DataFiles.length > 0)
				{
					tmpHtml += '<div style="margin-bottom:12px;"><strong>Data Files (' + pDS.DataFiles.length + '):</strong>';
					tmpHtml += '<table style="margin-top:4px; font-size:0.85em;"><thead><tr><th>File</th><th>Format</th><th>Size</th><th>Compressed</th></tr></thead><tbody>';
					for (let i = 0; i < pDS.DataFiles.length && i < 20; i++)
					{
						let tmpFile = pDS.DataFiles[i];
						let tmpSize = this.formatSize(tmpFile.Size || 0);
						tmpHtml += '<tr>';
						tmpHtml += '<td style="font-family:monospace; font-size:0.9em;">' + this.escapeHtml(tmpFile.FileName) + '</td>';
						tmpHtml += '<td>' + (tmpFile.Format || 'unknown') + '</td>';
						tmpHtml += '<td>' + tmpSize + '</td>';
						tmpHtml += '<td>' + (tmpFile.Compressed ? 'Yes' : 'No') + '</td>';
						tmpHtml += '</tr>';
					}
					if (pDS.DataFiles.length > 20)
					{
						tmpHtml += '<tr><td colspan="4" style="color:#888;">...and ' + (pDS.DataFiles.length - 20) + ' more file(s)</td></tr>';
					}
					tmpHtml += '</tbody></table></div>';
				}
				else
				{
					tmpHtml += '<p style="color:#dc3545; font-size:0.9em; margin-bottom:12px;"><strong>No data files.</strong> Download needed.</p>';
				}

				// Errors
				if (pDS.Errors && pDS.Errors.length > 0)
				{
					tmpHtml += '<div style="margin-bottom:12px; padding:8px; background:#f8d7da; border-radius:4px; font-size:0.85em; color:#721c24;"><strong>Errors:</strong><ul style="margin:4px 0 0 16px;">';
					for (let i = 0; i < pDS.Errors.length; i++)
					{
						tmpHtml += '<li>' + this.escapeHtml(pDS.Errors[i]) + '</li>';
					}
					tmpHtml += '</ul></div>';
				}

				// Action buttons
				tmpHtml += '<div>';
				if (pDS.Status === 'Discovered')
				{
					tmpHtml += '<button class="success" onclick="pict.views[\'Facto-Scanner\'].provisionOne(\'' + this.escapeAttr(pDS.FolderName) + '\')">Provision</button>';
				}
				tmpHtml += '</div>';

				tmpHtml += '</div>';
				tmpContainer.innerHTML = tmpHtml;
			}).catch(
			(pError) =>
			{
				tmpContainer.innerHTML = '<p style="color:#dc3545;">Error: ' + pError.message + '</p>';
			});
	}

	formatSize(pBytes)
	{
		if (pBytes === 0) return '0 B';
		let tmpUnits = ['B', 'KB', 'MB', 'GB', 'TB'];
		let tmpIndex = Math.floor(Math.log(pBytes) / Math.log(1024));
		return (pBytes / Math.pow(1024, tmpIndex)).toFixed(1) + ' ' + tmpUnits[tmpIndex];
	}


}

module.exports = FactoScannerView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Scanner',
	DefaultRenderable: 'Facto-Scanner',
	DefaultDestinationAddress: '#Facto-Section-Scanner',
	Templates:
	[
		{
			Hash: 'Facto-Scanner',
			Template: /*html*/`
<div class="accordion-row">
	<div class="accordion-number">&#9776;</div>
	<div class="accordion-card open" id="facto-card-scanner">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-scanner')">
			<span class="accordion-title">Source Folder Scanner</span>
			<span class="accordion-preview">Discover and provision datasets from folder trees</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Point the scanner at folder trees containing dataset research (README.md + data/). Discovered datasets can be provisioned into the database individually or in bulk.</p>

			<!-- Summary -->
			<div id="facto-scanner-summary" style="margin-bottom:12px; padding:8px 12px; background:#e9ecef; border-radius:4px; font-size:0.9em; color:#555;">
				No datasets loaded
			</div>

			<!-- Add scan path -->
			<div class="inline-group" style="margin-bottom:12px;">
				<div style="flex:3;">
					<input type="text" id="facto-scanner-path-input" placeholder="/path/to/dataset/folder/tree" style="margin-bottom:0;">
				</div>
				<div style="flex:0 0 auto; display:flex; align-items:flex-end; gap:4px;">
					<button class="primary" style="margin-bottom:0;" onclick="pict.views['Facto-Scanner'].addPath()">Add &amp; Scan</button>
					<button class="secondary" style="margin-bottom:0;" onclick="pict.views['Facto-Scanner'].rescanAll()">Re-scan All</button>
				</div>
			</div>

			<!-- Scan paths list -->
			<div id="facto-scanner-paths-list" style="margin-bottom:16px;"></div>

			<!-- Filter bar -->
			<div class="inline-group" style="margin-bottom:8px;">
				<div style="flex:3;">
					<input type="text" id="facto-scanner-search" placeholder="Search by name, title, or provider..." style="margin-bottom:0;" oninput="pict.views['Facto-Scanner'].filterDatasets()">
				</div>
				<div style="flex:1;">
					<select id="facto-scanner-status-filter" style="margin-bottom:0;" onchange="pict.views['Facto-Scanner'].filterDatasets()">
						<option value="">All Statuses</option>
						<option value="Discovered">Discovered</option>
						<option value="Provisioned">Provisioned</option>
						<option value="Ingested">Ingested</option>
						<option value="Error">Error</option>
					</select>
				</div>
				<div style="flex:0 0 auto; display:flex; align-items:flex-end; gap:4px;">
					<button class="success" style="margin-bottom:0;" onclick="pict.views['Facto-Scanner'].provisionSelected()">Provision Selected</button>
					<button class="success" style="margin-bottom:0;" onclick="pict.views['Facto-Scanner'].provisionAll()">Provision All</button>
				</div>
			</div>

			<!-- Datasets table -->
			<div id="facto-scanner-datasets-list"></div>

			<!-- Detail panel -->
			<div id="facto-scanner-detail" style="margin-top:12px;"></div>
		</div>
	</div>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Scanner',
			TemplateHash: 'Facto-Scanner',
			DestinationAddress: '#Facto-Section-Scanner'
		}
	]
};
