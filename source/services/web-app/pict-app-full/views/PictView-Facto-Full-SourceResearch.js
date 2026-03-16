const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-SourceResearch",

	DefaultRenderable: "Facto-Full-SourceResearch-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-research-search {
			display: flex;
			gap: 0.75em;
			margin-bottom: 1.25em;
		}
		.facto-research-search input {
			flex: 1;
			margin-bottom: 0;
		}
		.facto-research-detail {
			margin-top: 1.25em;
			padding-top: 1.25em;
			border-top: 1px solid var(--facto-border-subtle);
		}
		.facto-research-import textarea {
			width: 100%;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.85em;
			padding: 0.75em;
			background: var(--facto-bg-input);
			color: var(--facto-text);
			border: 1px solid var(--facto-border);
			border-radius: 6px;
			margin-bottom: 0.5em;
		}
		.facto-research-add-form {
			background: var(--facto-bg-card);
			border: 1px solid var(--facto-border);
			border-radius: 8px;
			padding: 1.25em;
			margin-bottom: 1.25em;
		}
		.facto-research-add-form .facto-form-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.75em;
		}
		.facto-research-add-form .facto-form-grid .facto-form-full {
			grid-column: 1 / -1;
		}
		.facto-research-add-form label {
			display: block;
			font-size: 0.8em;
			font-weight: 600;
			margin-bottom: 0.25em;
			color: var(--facto-text-muted);
		}
		.facto-research-add-form input,
		.facto-research-add-form textarea,
		.facto-research-add-form select {
			width: 100%;
			margin-bottom: 0;
		}
		.facto-research-add-form textarea {
			font-size: 0.9em;
		}
		.facto-research-add-form .facto-form-actions {
			margin-top: 1em;
			display: flex;
			gap: 0.5em;
		}
		.facto-research-header-row {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 0;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-SourceResearch-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header facto-research-header-row">
		<div>
			<h1>Source Research</h1>
			<p>Research and catalog potential data sources before provisioning them as runtime Sources and Datasets.</p>
		</div>
		<button class="facto-btn facto-btn-success" onclick="{~P~}.views['Facto-Full-SourceResearch'].toggleAddForm()">+ Add Entry</button>
	</div>

	<div id="Facto-Full-Research-AddForm" style="display:none;">
		<div class="facto-research-add-form">
			<div class="facto-form-grid">
				<div>
					<label>Name</label>
					<input type="text" id="Facto-Research-Add-Name" placeholder="Source name">
				</div>
				<div>
					<label>Agency</label>
					<input type="text" id="Facto-Research-Add-Agency" placeholder="Agency or organization">
				</div>
				<div>
					<label>Type</label>
					<input type="text" id="Facto-Research-Add-Type" placeholder="e.g. API, CSV, Database">
				</div>
				<div>
					<label>Category</label>
					<input type="text" id="Facto-Research-Add-Category" placeholder="e.g. Census, Financial, Health">
				</div>
				<div>
					<label>URL</label>
					<input type="text" id="Facto-Research-Add-URL" placeholder="https://...">
				</div>
				<div>
					<label>Protocol</label>
					<input type="text" id="Facto-Research-Add-Protocol" placeholder="e.g. REST, FTP, SFTP">
				</div>
				<div>
					<label>Region</label>
					<input type="text" id="Facto-Research-Add-Region" placeholder="e.g. US, EU, Global">
				</div>
				<div>
					<label>Update Frequency</label>
					<input type="text" id="Facto-Research-Add-UpdateFrequency" placeholder="e.g. Daily, Weekly, Annual">
				</div>
				<div class="facto-form-full">
					<label>Description</label>
					<textarea id="Facto-Research-Add-Description" rows="2" placeholder="Brief description of this source"></textarea>
				</div>
				<div class="facto-form-full">
					<label>Notes</label>
					<textarea id="Facto-Research-Add-Notes" rows="2" placeholder="Additional notes"></textarea>
				</div>
			</div>
			<div class="facto-form-actions">
				<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SourceResearch'].createEntry()">Save Entry</button>
				<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-SourceResearch'].toggleAddForm()">Cancel</button>
			</div>
		</div>
	</div>

	<div class="facto-research-search">
		<input type="text" id="Facto-Full-Research-Search" placeholder="Search catalog by name, agency, category, or description...">
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SourceResearch'].searchCatalog()">Search</button>
	</div>

	<div id="Facto-Full-Research-List"></div>
	<div id="Facto-Full-Research-Detail" class="facto-research-detail" style="display:none;"></div>
	<div id="Facto-Full-Research-Status" class="facto-status" style="display:none;"></div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Import / Export</div>
		<div class="facto-research-import">
			<textarea id="Facto-Full-Research-ImportJSON" rows="4" placeholder="Paste JSON array of catalog entries here..."></textarea>
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SourceResearch'].importCatalog()">Import JSON</button>
			<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-SourceResearch'].exportCatalog()">Export Catalog</button>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-SourceResearch-Content",
			TemplateHash: "Facto-Full-SourceResearch-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullSourceResearchView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this._SourceLinks = {};

		Promise.all([
			this.pict.providers.Facto.loadCatalogEntries(),
			this.pict.providers.Facto.loadCatalogSourceLinks()
		]).then(
			(pResults) =>
			{
				let tmpLinksResponse = pResults[1];
				if (tmpLinksResponse && tmpLinksResponse.Links)
				{
					this._SourceLinks = tmpLinksResponse.Links;
				}
				this.refreshList();
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	setStatus(pMessage, pType)
	{
		let tmpEl = document.getElementById('Facto-Full-Research-Status');
		if (!tmpEl) return;
		tmpEl.className = 'facto-status facto-status-' + (pType || 'info');
		tmpEl.textContent = pMessage;
		tmpEl.style.display = 'block';
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Research-List');
		if (!tmpContainer) return;

		let tmpEntries = this.pict.AppData.Facto.CatalogEntries;
		if (!tmpEntries || tmpEntries.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No catalog entries yet. Import a catalog or add sources manually.</div>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Agency</th><th>Name</th><th>Type</th><th>Category</th><th>Region</th><th>Verified</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpEntries.length; i++)
		{
			let tmpEntry = tmpEntries[i];
			let tmpVerified = tmpEntry.Verified ? '<span class="facto-badge facto-badge-success">Yes</span>' : '<span class="facto-badge facto-badge-muted">No</span>';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpEntry.IDSourceCatalogEntry || '') + '</td>';
			tmpHtml += '<td>' + (tmpEntry.Agency || '') + '</td>';
			tmpHtml += '<td>' + (tmpEntry.Name || '') + '</td>';
			tmpHtml += '<td><span class="facto-badge facto-badge-primary">' + (tmpEntry.Type || '') + '</span></td>';
			tmpHtml += '<td>' + (tmpEntry.Category || '') + '</td>';
			tmpHtml += '<td>' + (tmpEntry.Region || '') + '</td>';
			tmpHtml += '<td>' + tmpVerified + '</td>';
			tmpHtml += '<td>';
			let tmpLinkedSource = this._SourceLinks && this._SourceLinks[tmpEntry.IDSourceCatalogEntry];
			if (tmpLinkedSource)
			{
				tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Source/' + tmpLinkedSource + '\')">View Source &rarr;</button> ';
			}
			tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-SourceResearch\'].viewEntry(' + tmpEntry.IDSourceCatalogEntry + ')">Datasets</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-danger facto-btn-small" onclick="pict.views[\'Facto-Full-SourceResearch\'].deleteEntry(' + tmpEntry.IDSourceCatalogEntry + ')">Delete</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	toggleAddForm()
	{
		let tmpForm = document.getElementById('Facto-Full-Research-AddForm');
		if (!tmpForm) return;
		tmpForm.style.display = (tmpForm.style.display === 'none') ? 'block' : 'none';
	}

	createEntry()
	{
		let tmpData =
		{
			Name: (document.getElementById('Facto-Research-Add-Name') || {}).value || '',
			Agency: (document.getElementById('Facto-Research-Add-Agency') || {}).value || '',
			Type: (document.getElementById('Facto-Research-Add-Type') || {}).value || '',
			Category: (document.getElementById('Facto-Research-Add-Category') || {}).value || '',
			URL: (document.getElementById('Facto-Research-Add-URL') || {}).value || '',
			Protocol: (document.getElementById('Facto-Research-Add-Protocol') || {}).value || '',
			Region: (document.getElementById('Facto-Research-Add-Region') || {}).value || '',
			UpdateFrequency: (document.getElementById('Facto-Research-Add-UpdateFrequency') || {}).value || '',
			Description: (document.getElementById('Facto-Research-Add-Description') || {}).value || '',
			Notes: (document.getElementById('Facto-Research-Add-Notes') || {}).value || ''
		};

		if (!tmpData.Name)
		{
			this.pict.providers.FactoUI.showToast('Name is required', 'error');
			return;
		}

		this.pict.providers.Facto.createCatalogEntry(tmpData).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error: ' + pResponse.Error, 'error');
					return;
				}

				this.pict.providers.FactoUI.showToast('Catalog entry created', 'ok');

				// Clear the form fields
				let tmpFields = ['Name', 'Agency', 'Type', 'Category', 'URL', 'Protocol', 'Region', 'UpdateFrequency', 'Description', 'Notes'];
				for (let i = 0; i < tmpFields.length; i++)
				{
					let tmpEl = document.getElementById('Facto-Research-Add-' + tmpFields[i]);
					if (tmpEl) tmpEl.value = '';
				}

				// Hide the form and refresh the list
				let tmpForm = document.getElementById('Facto-Full-Research-AddForm');
				if (tmpForm) tmpForm.style.display = 'none';

				return this.pict.providers.Facto.loadCatalogEntries();
			}).then(
			() =>
			{
				this.refreshList();
			});
	}

	searchCatalog()
	{
		let tmpQuery = (document.getElementById('Facto-Full-Research-Search') || {}).value || '';
		if (!tmpQuery)
		{
			this.pict.providers.Facto.loadCatalogEntries().then(
				() => { this.refreshList(); });
			return;
		}

		this.pict.providers.Facto.searchCatalog(tmpQuery).then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.CatalogEntries = (pResponse && pResponse.Entries) ? pResponse.Entries : [];
				this.refreshList();
			});
	}

	deleteEntry(pIDEntry)
	{
		if (!confirm('Remove this catalog entry?')) return;
		this.pict.providers.Facto.deleteCatalogEntry(pIDEntry).then(
			() => { return this.pict.providers.Facto.loadCatalogEntries(); }).then(
			() => { this.refreshList(); this.setStatus('Entry removed', 'ok'); });
	}

	viewEntry(pIDEntry)
	{
		let tmpDetail = document.getElementById('Facto-Full-Research-Detail');
		if (!tmpDetail) return;
		tmpDetail.style.display = 'block';

		this.pict.providers.Facto.loadCatalogEntryDatasets(pIDEntry).then(
			(pResponse) =>
			{
				let tmpDatasets = (pResponse && pResponse.Datasets) ? pResponse.Datasets : [];
				let tmpHtml = '<h3>Dataset Definitions for Entry #' + pIDEntry + '</h3>';

				if (tmpDatasets.length === 0)
				{
					tmpHtml += '<div class="facto-empty">No dataset definitions yet.</div>';
				}
				else
				{
					tmpHtml += '<table><thead><tr><th>ID</th><th>Name</th><th>Format</th><th>Endpoint URL</th><th>Policy</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
					for (let i = 0; i < tmpDatasets.length; i++)
					{
						let tmpDS = tmpDatasets[i];
						let tmpStatus = tmpDS.Provisioned
							? '<span class="facto-badge facto-badge-success">Provisioned</span>'
							: '<span class="facto-badge facto-badge-muted">Not provisioned</span>';
						let tmpAction = '';
						if (tmpDS.Provisioned)
						{
							tmpAction = '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-SourceResearch\'].fetchDataset(' + tmpDS.IDCatalogDatasetDefinition + ', ' + pIDEntry + ')">Fetch</button>';
							if (tmpDS.IDSource)
							{
								tmpAction += ' <button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Source/' + tmpDS.IDSource + '\')">View Source &rarr;</button>';
							}
						}
						else
						{
							tmpAction = '<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-SourceResearch\'].provisionDataset(' + tmpDS.IDCatalogDatasetDefinition + ', ' + pIDEntry + ')">Provision</button>';
						}
						tmpHtml += '<tr>';
						tmpHtml += '<td>' + (tmpDS.IDCatalogDatasetDefinition || '') + '</td>';
						tmpHtml += '<td>' + (tmpDS.Name || '') + '</td>';
						tmpHtml += '<td><span class="facto-badge facto-badge-primary">' + (tmpDS.Format || '') + '</span></td>';
						tmpHtml += '<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpDS.EndpointURL || '') + '</td>';
						tmpHtml += '<td>' + (tmpDS.VersionPolicy || 'Append') + '</td>';
						tmpHtml += '<td>' + tmpStatus + '</td>';
						tmpHtml += '<td>' + tmpAction + '</td>';
						tmpHtml += '</tr>';
					}
					tmpHtml += '</tbody></table>';
				}

				tmpHtml += '<div style="margin-top:1em;"><button class="facto-btn facto-btn-secondary" onclick="document.getElementById(\'Facto-Full-Research-Detail\').style.display=\'none\'">Close</button></div>';
				tmpDetail.innerHTML = tmpHtml;
			});
	}

	provisionDataset(pIDCatalogDataset, pIDEntry)
	{
		this.setStatus('Provisioning...', 'info');
		this.pict.providers.Facto.provisionCatalogDataset(pIDCatalogDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					let tmpStatusEl = document.getElementById('Facto-Full-Research-Status');
					if (tmpStatusEl)
					{
						tmpStatusEl.className = 'facto-status facto-status-ok';
						tmpStatusEl.innerHTML = 'Provisioned! Source: ' + (pResponse.Source.Hash || pResponse.Source.Name) + ' (#' + pResponse.Source.IDSource + '), Dataset: ' + (pResponse.Dataset.Hash || pResponse.Dataset.Name) + ' (#' + pResponse.Dataset.IDDataset + ') &mdash; <a href="#/Source/' + pResponse.Source.IDSource + '" style="color:var(--facto-brand);text-decoration:underline;cursor:pointer;">View Source \u2192</a>';
						tmpStatusEl.style.display = 'block';
					}
					this.viewEntry(pIDEntry);
				}
				else
				{
					this.setStatus('Error: ' + ((pResponse && pResponse.Error) || 'Unknown'), 'error');
				}
			});
	}

	fetchDataset(pIDCatalogDataset, pIDEntry)
	{
		this.setStatus('Fetching data from endpoint...', 'info');
		this.pict.providers.Facto.fetchCatalogDataset(pIDCatalogDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					let tmpMsg = 'Fetched! ' + pResponse.Ingested + ' records ingested (v' + pResponse.DatasetVersion + ', ' + pResponse.Format + ')';
					if (pResponse.IsDuplicate) tmpMsg += ' [duplicate content]';
					this.setStatus(tmpMsg, 'ok');
					this.viewEntry(pIDEntry);
				}
				else
				{
					this.setStatus('Fetch error: ' + ((pResponse && pResponse.Error) || 'Unknown'), 'error');
				}
			});
	}

	importCatalog()
	{
		let tmpTextArea = document.getElementById('Facto-Full-Research-ImportJSON');
		if (!tmpTextArea || !tmpTextArea.value)
		{
			this.setStatus('Paste JSON to import', 'warn');
			return;
		}

		let tmpEntries;
		try { tmpEntries = JSON.parse(tmpTextArea.value); }
		catch (pErr) { this.setStatus('Invalid JSON: ' + pErr.message, 'error'); return; }

		this.pict.providers.Facto.importCatalog(tmpEntries).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					this.setStatus('Imported ' + pResponse.EntriesCreated + ' entries with ' + pResponse.DatasetsCreated + ' datasets', 'ok');
					tmpTextArea.value = '';
					return this.pict.providers.Facto.loadCatalogEntries();
				}
				else
				{
					this.setStatus('Import error: ' + ((pResponse && pResponse.Error) || 'Unknown'), 'error');
				}
			}).then(
			() => { this.refreshList(); });
	}

	exportCatalog()
	{
		this.pict.providers.Facto.exportCatalog().then(
			(pResponse) =>
			{
				let tmpTextArea = document.getElementById('Facto-Full-Research-ImportJSON');
				if (tmpTextArea)
				{
					tmpTextArea.value = JSON.stringify(pResponse && pResponse.Entries ? pResponse.Entries : pResponse, null, 2);
				}
				this.setStatus('Catalog exported to JSON text area', 'ok');
			});
	}
}

module.exports = FactoFullSourceResearchView;

module.exports.default_configuration = _ViewConfiguration;
