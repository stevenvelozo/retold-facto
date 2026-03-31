const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-SchemaResearch",

	DefaultRenderable: "Facto-Full-SchemaResearch-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-schema-research-search {
			display: flex;
			gap: 0.75em;
			margin-bottom: 1.25em;
		}
		.facto-schema-research-search input {
			flex: 1;
			margin-bottom: 0;
		}
		.facto-schema-research-add-form {
			background: var(--facto-bg-card);
			border: 1px solid var(--facto-border);
			border-radius: 8px;
			padding: 1.25em;
			margin-bottom: 1.25em;
		}
		.facto-schema-research-add-form .facto-form-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.75em;
		}
		.facto-schema-research-add-form .facto-form-grid .facto-form-full {
			grid-column: 1 / -1;
		}
		.facto-schema-research-add-form label {
			display: block;
			font-size: 0.8em;
			font-weight: 600;
			margin-bottom: 0.25em;
			color: var(--facto-text-muted);
		}
		.facto-schema-research-add-form input,
		.facto-schema-research-add-form textarea,
		.facto-schema-research-add-form select {
			width: 100%;
			margin-bottom: 0;
		}
		.facto-schema-research-add-form textarea {
			font-size: 0.9em;
		}
		.facto-schema-research-add-form .facto-form-actions {
			margin-top: 1em;
			display: flex;
			gap: 0.5em;
		}
		.facto-schema-research-header-row {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			margin-bottom: 0;
		}
		.facto-schema-research-import textarea {
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
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-SchemaResearch-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header facto-schema-research-header-row">
		<div>
			<h1>Schema Research</h1>
			<p>Research, define, and document schemas that describe the shape of records in your data pools.</p>
		</div>
		<button class="facto-btn facto-btn-success" onclick="{~P~}.views['Facto-Full-SchemaResearch'].toggleAddForm()">+ Add Schema</button>
	</div>

	<div id="Facto-Full-SchemaResearch-AddForm" style="display:none;">
		<div class="facto-schema-research-add-form">
			<div class="facto-form-grid">
				<div>
					<label>Name</label>
					<input type="text" id="Facto-SchemaResearch-Add-Name" placeholder="Schema name">
				</div>
				<div>
					<label>Type</label>
					<select id="Facto-SchemaResearch-Add-Type">
						<option value="Record">Record</option>
						<option value="Event">Event</option>
						<option value="Document">Document</option>
						<option value="Metric">Metric</option>
						<option value="Reference">Reference</option>
						<option value="Other">Other</option>
					</select>
				</div>
				<div class="facto-form-full">
					<label>Description</label>
					<textarea id="Facto-SchemaResearch-Add-Description" rows="2" placeholder="Brief description of what this schema defines"></textarea>
				</div>
				<div class="facto-form-full">
					<label>Schema Definition (MicroDDL) — optional, can be added later</label>
					<textarea id="Facto-SchemaResearch-Add-DDL" rows="4" placeholder="!TableName&#10;@IDColumn&#10;$Name 200&#10;#Count&#10;&CreatedDate" style="font-family: 'SF Mono', Consolas, monospace; font-size: 0.85em;"></textarea>
				</div>
			</div>
			<div class="facto-form-actions">
				<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SchemaResearch'].createEntry()">Save Schema</button>
				<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-SchemaResearch'].toggleAddForm()">Cancel</button>
			</div>
		</div>
	</div>

	<div class="facto-schema-research-search">
		<input type="text" id="Facto-Full-SchemaResearch-Search" placeholder="Search schemas by name, type, or description...">
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SchemaResearch'].searchSchemas()">Search</button>
	</div>

	<div id="Facto-Full-SchemaResearch-List"></div>
	<div id="Facto-Full-SchemaResearch-Status" class="facto-status" style="display:none;"></div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Import / Export</div>
		<div class="facto-schema-research-import">
			<textarea id="Facto-Full-SchemaResearch-ImportJSON" rows="4" placeholder="Paste JSON array of schema definitions here..."></textarea>
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SchemaResearch'].importSchemas()">Import JSON</button>
			<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-SchemaResearch'].exportSchemas()">Export Schemas</button>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-SchemaResearch-Content",
			TemplateHash: "Facto-Full-SchemaResearch-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullSchemaResearchView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.providers.Facto.loadSchemas().then(
			() =>
			{
				this.refreshList();
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	setStatus(pMessage, pType)
	{
		let tmpEl = document.getElementById('Facto-Full-SchemaResearch-Status');
		if (!tmpEl) return;
		tmpEl.className = 'facto-status facto-status-' + (pType || 'info');
		tmpEl.textContent = pMessage;
		tmpEl.style.display = 'block';
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('Facto-Full-SchemaResearch-List');
		if (!tmpContainer) return;

		let tmpSchemas = this.pict.AppData.Facto.Schemas;
		if (!tmpSchemas || tmpSchemas.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No schemas yet. Add a schema to begin defining your data shapes.</div>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Version</th><th>Hash</th><th>Active</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpSchemas.length; i++)
		{
			let tmpSchema = tmpSchemas[i];
			let tmpActive = tmpSchema.Active ? '<span class="facto-badge facto-badge-success">Active</span>' : '<span class="facto-badge facto-badge-muted">Inactive</span>';
			let tmpHash = tmpSchema.SchemaHash || '';
			if (tmpHash.length > 12) tmpHash = tmpHash.substring(0, 12) + '\u2026';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpSchema.IDSchema || '') + '</td>';
			tmpHtml += '<td>' + (tmpSchema.Name || '') + '</td>';
			tmpHtml += '<td><span class="facto-badge facto-badge-primary">' + (tmpSchema.Type || '') + '</span></td>';
			tmpHtml += '<td>' + (tmpSchema.Version || 0) + '</td>';
			tmpHtml += '<td><code style="font-size:0.8em;">' + tmpHash + '</code></td>';
			tmpHtml += '<td>' + tmpActive + '</td>';
			tmpHtml += '<td>';
			tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Schema/' + tmpSchema.IDSchema + '\')">View</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-danger facto-btn-small" onclick="pict.views[\'Facto-Full-SchemaResearch\'].deleteEntry(' + tmpSchema.IDSchema + ')">Delete</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	toggleAddForm()
	{
		let tmpForm = document.getElementById('Facto-Full-SchemaResearch-AddForm');
		if (!tmpForm) return;
		tmpForm.style.display = (tmpForm.style.display === 'none') ? 'block' : 'none';
	}

	createEntry()
	{
		let tmpData =
		{
			Name: (document.getElementById('Facto-SchemaResearch-Add-Name') || {}).value || '',
			Type: (document.getElementById('Facto-SchemaResearch-Add-Type') || {}).value || 'Record',
			Description: (document.getElementById('Facto-SchemaResearch-Add-Description') || {}).value || '',
			SchemaDefinition: (document.getElementById('Facto-SchemaResearch-Add-DDL') || {}).value || ''
		};

		if (!tmpData.Name)
		{
			this.pict.providers.FactoUI.showToast('Name is required', 'error');
			return;
		}

		this.pict.providers.Facto.createSchema(tmpData).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error: ' + pResponse.Error, 'error');
					return;
				}

				this.pict.providers.FactoUI.showToast('Schema created', 'ok');

				// Clear the form fields
				let tmpFields = ['Name', 'Description', 'DDL'];
				for (let i = 0; i < tmpFields.length; i++)
				{
					let tmpEl = document.getElementById('Facto-SchemaResearch-Add-' + tmpFields[i]);
					if (tmpEl) tmpEl.value = '';
				}
				let tmpTypeEl = document.getElementById('Facto-SchemaResearch-Add-Type');
				if (tmpTypeEl) tmpTypeEl.selectedIndex = 0;

				// Hide the form and refresh the list
				let tmpForm = document.getElementById('Facto-Full-SchemaResearch-AddForm');
				if (tmpForm) tmpForm.style.display = 'none';

				return this.pict.providers.Facto.loadSchemas();
			}).then(
			() =>
			{
				this.refreshList();
			});
	}

	searchSchemas()
	{
		let tmpQuery = (document.getElementById('Facto-Full-SchemaResearch-Search') || {}).value || '';
		if (!tmpQuery)
		{
			this.pict.providers.Facto.loadSchemas().then(
				() => { this.refreshList(); });
			return;
		}

		// Client-side filter on loaded schemas
		let tmpLower = tmpQuery.toLowerCase();
		let tmpAll = this.pict.AppData.Facto.Schemas || [];
		this.pict.AppData.Facto.Schemas = tmpAll.filter(
			(pSchema) =>
			{
				return (pSchema.Name && pSchema.Name.toLowerCase().indexOf(tmpLower) >= 0) ||
					(pSchema.Type && pSchema.Type.toLowerCase().indexOf(tmpLower) >= 0) ||
					(pSchema.Description && pSchema.Description.toLowerCase().indexOf(tmpLower) >= 0);
			});
		this.refreshList();
		// Restore full list in AppData for next time
		this.pict.AppData.Facto.Schemas = tmpAll;
	}

	deleteEntry(pIDSchema)
	{
		if (!confirm('Delete this schema?')) return;
		this.pict.providers.Facto.api('DELETE', '/1.0/Schema/' + pIDSchema).then(
			() => { return this.pict.providers.Facto.loadSchemas(); }).then(
			() => { this.refreshList(); this.setStatus('Schema removed', 'ok'); });
	}

	importSchemas()
	{
		let tmpTextArea = document.getElementById('Facto-Full-SchemaResearch-ImportJSON');
		if (!tmpTextArea || !tmpTextArea.value)
		{
			this.setStatus('Paste JSON to import', 'warn');
			return;
		}

		let tmpSchemas;
		try { tmpSchemas = JSON.parse(tmpTextArea.value); }
		catch (pErr) { this.setStatus('Invalid JSON: ' + pErr.message, 'error'); return; }

		if (!Array.isArray(tmpSchemas))
		{
			tmpSchemas = [tmpSchemas];
		}

		let tmpPromises = tmpSchemas.map(
			(pSchema) =>
			{
				return this.pict.providers.Facto.createSchema(pSchema);
			});

		Promise.all(tmpPromises).then(
			() =>
			{
				this.setStatus('Imported ' + tmpSchemas.length + ' schema(s)', 'ok');
				tmpTextArea.value = '';
				return this.pict.providers.Facto.loadSchemas();
			}).then(
			() => { this.refreshList(); });
	}

	exportSchemas()
	{
		let tmpTextArea = document.getElementById('Facto-Full-SchemaResearch-ImportJSON');
		if (tmpTextArea)
		{
			let tmpSchemas = this.pict.AppData.Facto.Schemas || [];
			tmpTextArea.value = JSON.stringify(tmpSchemas, null, 2);
		}
		this.setStatus('Schemas exported to JSON text area', 'ok');
	}
}

module.exports = FactoFullSchemaResearchView;

module.exports.default_configuration = _ViewConfiguration;
