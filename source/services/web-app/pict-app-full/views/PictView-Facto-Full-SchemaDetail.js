const libPictView = require('pict-view');
const libPictSectionContent = require('pict-section-content');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-SchemaDetail",

	DefaultRenderable: "Facto-Full-SchemaDetail-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-schema-detail-back {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			color: var(--facto-text-secondary);
			cursor: pointer;
			font-size: 0.85em;
			margin-bottom: 0.75em;
			transition: color 0.15s;
		}
		.facto-schema-detail-back:hover {
			color: var(--facto-brand);
		}

		/* Schema definition display */
		.facto-schema-ddl-wrap {
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border-subtle);
			border-radius: 8px;
			padding: 1em 1.25em;
			margin-bottom: 1.5em;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.85em;
			white-space: pre-wrap;
			color: var(--facto-text);
			max-height: 300px;
			overflow-y: auto;
		}
		.facto-schema-ddl-empty {
			color: var(--facto-text-tertiary);
			font-style: italic;
		}
		.facto-schema-edit-section {
			margin-bottom: 1.5em;
		}
		.facto-schema-edit-section textarea {
			width: 100%;
			min-height: 150px;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.85em;
			margin-bottom: 0.5em;
		}
		.facto-schema-edit-actions {
			display: flex;
			gap: 0.5em;
			align-items: center;
		}

		/* Version history */
		.facto-version-history {
			margin-top: 1.5em;
		}
		.facto-version-history h2 {
			font-size: 1em;
			margin: 0 0 0.75em;
			color: var(--facto-text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		/* Linked datasets */
		.facto-linked-datasets {
			margin-top: 1.5em;
		}
		.facto-linked-datasets h2 {
			font-size: 1em;
			margin: 0 0 0.75em;
			color: var(--facto-text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		.facto-link-dataset-row {
			display: flex;
			gap: 0.5em;
			align-items: center;
			margin-top: 0.75em;
		}
		.facto-link-dataset-row select {
			width: 300px;
			margin-bottom: 0;
		}

		/* Documentation section */
		.facto-doc-section {
			margin-top: 1.5em;
		}
		.facto-doc-section-header {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-bottom: 0.75em;
		}
		.facto-doc-section-header h2 {
			font-size: 1em;
			margin: 0;
			color: var(--facto-text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		.facto-edit-toggle {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			padding: 0.25em 0.6em;
			font-size: 0.75em;
			border-radius: 4px;
			cursor: pointer;
			transition: background 0.15s, color 0.15s;
			border: 1px solid var(--facto-border-subtle);
			background: transparent;
			color: var(--facto-text-tertiary);
		}
		.facto-edit-toggle:hover {
			border-color: var(--facto-brand);
			color: var(--facto-brand);
		}
		.facto-edit-toggle.active {
			background: var(--facto-brand-a15);
			border-color: var(--facto-brand);
			color: var(--facto-brand);
		}

		/* Doc content */
		.facto-doc-content-wrap {
			background: var(--facto-bg-elevated);
			border: 1px solid var(--facto-border-subtle);
			border-radius: 8px;
			padding: 1.5em 2em;
			min-height: 100px;
		}
		.facto-doc-content-wrap h1 { font-size: 1.75em; color: var(--facto-text-heading); border-bottom: 1px solid var(--facto-border-subtle); padding-bottom: 0.3em; margin-top: 0; }
		.facto-doc-content-wrap h2 { font-size: 1.4em; color: var(--facto-text-heading); border-bottom: 1px solid var(--facto-border-subtle); padding-bottom: 0.25em; margin-top: 1.5em; }
		.facto-doc-content-wrap h3 { font-size: 1.15em; color: var(--facto-text-heading); margin-top: 1.25em; }
		.facto-doc-content-wrap p { line-height: 1.7; color: var(--facto-text-secondary); margin: 0.75em 0; }
		.facto-doc-content-wrap a { color: var(--facto-brand); }
		.facto-doc-content-wrap code { background: var(--facto-brand-a10); color: var(--facto-brand); padding: 0.15em 0.35em; border-radius: 3px; font-size: 0.9em; }
		.facto-doc-content-wrap pre { background: var(--facto-bg-input); border: 1px solid var(--facto-border-subtle); border-radius: 6px; padding: 1em; overflow-x: auto; color: var(--facto-text-heading); }
		.facto-doc-content-wrap pre code { background: transparent; padding: 0; color: inherit; }
		.facto-doc-content-wrap blockquote { border-left: 3px solid var(--facto-brand); padding: 0.5em 1em; margin: 1em 0; color: var(--facto-text-tertiary); background: var(--facto-brand-a05); border-radius: 0 4px 4px 0; }
		.facto-doc-content-wrap img { max-width: 100%; height: auto; border-radius: 4px; margin: 0.5em 0; }
		.facto-doc-content-wrap ul, .facto-doc-content-wrap ol { color: var(--facto-text-secondary); padding-left: 1.5em; line-height: 1.7; }

		.facto-doc-list {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5em;
			margin-bottom: 1em;
		}
		.facto-doc-item {
			padding: 0.4em 0.75em;
			background: var(--facto-bg-elevated);
			border: 1px solid var(--facto-border-subtle);
			border-radius: 6px;
			font-size: 0.85em;
			cursor: pointer;
			color: var(--facto-text-secondary);
			transition: border-color 0.15s, color 0.15s;
		}
		.facto-doc-item:hover { border-color: var(--facto-brand); color: var(--facto-text-heading); }
		.facto-doc-item.active { border-color: var(--facto-brand); color: var(--facto-brand); background: var(--facto-brand-a10); }
		.facto-doc-new-input {
			display: flex;
			gap: 0.5em;
			align-items: center;
		}
		.facto-doc-new-input input {
			width: 240px;
			margin-bottom: 0;
		}

		/* Analyze records panel */
		.facto-schema-analyze-panel {
			background: var(--facto-bg-card);
			border: 1px solid var(--facto-border);
			border-radius: 8px;
			padding: 1.25em;
			margin-bottom: 1.5em;
		}
		.facto-schema-analyze-panel h2 {
			font-size: 1em;
			margin: 0 0 0.75em;
			color: var(--facto-text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		.facto-schema-analyze-controls {
			display: flex;
			gap: 0.75em;
			align-items: center;
			flex-wrap: wrap;
			margin-bottom: 0.75em;
		}
		.facto-schema-analyze-controls select,
		.facto-schema-analyze-controls input {
			margin-bottom: 0;
		}
		.facto-schema-analyze-controls select {
			max-width: 300px;
		}
		.facto-schema-analyze-controls input[type="number"] {
			width: 80px;
		}
		.facto-schema-fields-table {
			width: 100%;
			border-collapse: collapse;
			font-size: 0.85em;
			margin-top: 0.75em;
		}
		.facto-schema-fields-table th {
			text-align: left;
			padding: 0.5em 0.6em;
			border-bottom: 2px solid var(--facto-border);
			color: var(--facto-text-heading);
			font-size: 0.8em;
			text-transform: uppercase;
			letter-spacing: 0.04em;
		}
		.facto-schema-fields-table td {
			padding: 0.4em 0.6em;
			border-bottom: 1px solid var(--facto-border-subtle);
			vertical-align: middle;
		}
		.facto-schema-fields-table input[type="text"] {
			width: 100%;
			margin-bottom: 0;
			padding: 0.25em 0.4em;
			font-size: 0.95em;
		}
		.facto-schema-fields-table select {
			margin-bottom: 0;
			padding: 0.25em 0.3em;
			font-size: 0.95em;
		}
		.facto-schema-fields-table .facto-field-addr {
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.9em;
			color: var(--facto-text);
		}
		.facto-schema-fields-table .facto-field-sample {
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.85em;
			color: var(--facto-text-tertiary);
			max-width: 180px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.facto-schema-fields-table .facto-field-freq {
			text-align: center;
			color: var(--facto-text-secondary);
		}
		.facto-schema-analyze-actions {
			display: flex;
			gap: 0.5em;
			margin-top: 1em;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-SchemaDetail-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-schema-detail-back" onclick="{~P~}.views['Facto-Full-SchemaDetail'].goBack()">
		&#8592; Back to Schema Research
	</div>

	<div class="facto-content-header">
		<h1 id="Facto-SchemaDetail-Title">Schema</h1>
	</div>

	<div id="Facto-SchemaDetail-Loading" style="color:var(--facto-text-secondary);">Loading schema...</div>
	<div id="Facto-SchemaDetail-Error" class="facto-status facto-status-error" style="display:none;"></div>

	<div id="Facto-SchemaDetail-Container" style="display:none;">
		<div class="facto-record-meta" id="Facto-SchemaDetail-Meta"></div>

		<div id="Facto-SchemaDetail-DDLSection"></div>

		<div class="facto-schema-analyze-panel">
			<h2>Generate Schema from Records</h2>
			<div class="facto-schema-analyze-controls">
				<label style="font-size:0.85em; color:var(--facto-text-secondary);">Dataset:</label>
				<select id="Facto-SchemaDetail-AnalyzeDataset"><option value="">Select dataset...</option></select>
				<label style="font-size:0.85em; color:var(--facto-text-secondary);">Source:</label>
				<select id="Facto-SchemaDetail-AnalyzeSource"><option value="">Any source</option></select>
				<label style="font-size:0.85em; color:var(--facto-text-secondary);">Samples:</label>
				<input type="number" id="Facto-SchemaDetail-AnalyzeSampleSize" value="50" min="1" max="200">
				<button class="facto-btn facto-btn-primary" onclick="pict.views['Facto-Full-SchemaDetail'].analyzeRecords()">Analyze Records</button>
			</div>
			<div id="Facto-SchemaDetail-AnalyzeStatus" style="display:none;"></div>
			<div id="Facto-SchemaDetail-AnalyzeResults"></div>
		</div>

		<div class="facto-linked-datasets" id="Facto-SchemaDetail-LinkedDatasets"></div>

		<div class="facto-doc-section">
			<div class="facto-doc-section-header">
				<h2>Documentation</h2>
				<button class="facto-edit-toggle" id="Facto-SchemaDetail-EditToggle" onclick="{~P~}.views['Facto-Full-SchemaDetail'].toggleEditMode()">
					&#9998; Edit
				</button>
			</div>
			<div id="Facto-SchemaDetail-DocListWrap"></div>
			<div id="Facto-SchemaDetail-ContentWrap" style="display:none;">
				<div class="facto-doc-content-wrap" id="Facto-SchemaDetail-ContentDisplay"></div>
			</div>
			<div id="Facto-SchemaDetail-EditorWrap" style="display:none;">
				<div id="Facto-SchemaDetail-EditorContainer"></div>
			</div>
		</div>

		<div class="facto-version-history" id="Facto-SchemaDetail-VersionHistory"></div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-SchemaDetail-Content",
			TemplateHash: "Facto-Full-SchemaDetail-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullSchemaDetailView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._CurrentIDSchema = null;
		this._CurrentIDDoc = null;
		this._CurrentDocName = '';
		this._CurrentDocContent = '';
		this._Documentation = [];
		this._Versions = [];
		this._LinkedDatasets = [];
		this._SchemaData = null;
		this._EditMode = false;
		this._DDLEditMode = false;
	}

	onBeforeInitialize()
	{
		super.onBeforeInitialize();

		if (!this.pict.providers.PictContent)
		{
			this.pict.addProvider('PictContent', { ProviderIdentifier: 'PictContent' }, libPictSectionContent.PictContentProvider);
		}

		return true;
	}

	loadSchema(pIDSchema, pIDDoc)
	{
		this._CurrentIDSchema = pIDSchema;
		this._CurrentIDDoc = pIDDoc || null;
		this.render();
	}

	onAfterRender()
	{
		super.onAfterRender();

		if (!this._CurrentIDSchema)
		{
			let tmpLoading = document.getElementById('Facto-SchemaDetail-Loading');
			if (tmpLoading) tmpLoading.textContent = 'No schema selected.';
			return;
		}

		this._fetchAndDisplaySchema();
	}

	_fetchAndDisplaySchema()
	{
		let tmpProvider = this.pict.providers.Facto;
		let tmpLoadingEl = document.getElementById('Facto-SchemaDetail-Loading');
		let tmpErrorEl = document.getElementById('Facto-SchemaDetail-Error');

		let tmpSummary = null;
		let tmpDocumentation = null;
		let tmpVersions = null;

		let tmpSummaryPromise = tmpProvider.loadSchemaSummary(this._CurrentIDSchema);
		let tmpDocsPromise = tmpProvider.loadSchemaDocumentation(this._CurrentIDSchema);
		let tmpVersionsPromise = tmpProvider.loadSchemaVersions(this._CurrentIDSchema);

		tmpSummaryPromise.then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
					if (tmpErrorEl)
					{
						tmpErrorEl.textContent = 'Error loading schema: ' + pResponse.Error;
						tmpErrorEl.style.display = 'block';
					}
					return;
				}
				tmpSummary = pResponse;
			});

		tmpDocsPromise.then(
			(pResponse) =>
			{
				tmpDocumentation = (pResponse && pResponse.Documentation) ? pResponse.Documentation : [];
			});

		tmpVersionsPromise.then(
			(pResponse) =>
			{
				tmpVersions = (pResponse && pResponse.Versions) ? pResponse.Versions : [];
			});

		Promise.all([tmpSummaryPromise, tmpDocsPromise, tmpVersionsPromise]).then(
			() =>
			{
				if (!tmpSummary || !tmpSummary.Schema)
				{
					if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
					if (tmpErrorEl)
					{
						tmpErrorEl.textContent = 'Schema not found';
						tmpErrorEl.style.display = 'block';
					}
					return;
				}

				this._renderSchemaDetail(tmpSummary, tmpDocumentation, tmpVersions);
			}).catch(
			(pError) =>
			{
				if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
				if (tmpErrorEl)
				{
					tmpErrorEl.textContent = 'Error loading schema: ' + (pError.message || pError);
					tmpErrorEl.style.display = 'block';
				}
			});
	}

	_renderSchemaDetail(pSummary, pDocumentation, pVersions)
	{
		let tmpLoadingEl = document.getElementById('Facto-SchemaDetail-Loading');
		let tmpContainer = document.getElementById('Facto-SchemaDetail-Container');
		let tmpTitleEl = document.getElementById('Facto-SchemaDetail-Title');

		if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
		if (tmpContainer) tmpContainer.style.display = 'block';

		let tmpSchema = pSummary.Schema;
		this._SchemaData = tmpSchema;

		if (tmpTitleEl)
		{
			tmpTitleEl.textContent = tmpSchema.Name || ('Schema #' + tmpSchema.IDSchema);
		}

		// Metadata cards
		let tmpMetaEl = document.getElementById('Facto-SchemaDetail-Meta');
		if (tmpMetaEl)
		{
			tmpMetaEl.innerHTML = this._buildMetaCards(tmpSchema, pSummary);
		}

		// Schema definition section
		this._renderDDLSection(tmpSchema);

		// Populate analyze dropdowns
		this._populateAnalyzeDropdowns();

		// Linked datasets
		this._LinkedDatasets = pSummary.LinkedDatasets || [];
		this._renderLinkedDatasets();

		// Documentation
		this._Documentation = pDocumentation;
		this._renderDocList();

		// Version history
		this._Versions = pVersions;
		this._renderVersionHistory();

		// Auto-open document if specified
		if (this._CurrentIDDoc)
		{
			this.selectDocument(this._CurrentIDDoc);
		}
	}

	_buildMetaCards(pSchema, pSummary)
	{
		let tmpGUID = (pSchema.GUIDSchema || '').substring(0, 8) + '\u2026' + (pSchema.GUIDSchema || '').substring((pSchema.GUIDSchema || '').length - 4);
		let tmpActive = pSchema.Active
			? '<span class="facto-badge facto-badge-success">Active</span>'
			: '<span class="facto-badge facto-badge-muted">Inactive</span>';

		let tmpHtml = '';

		// Identity card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Schema Identity</h3>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">ID</span><span class="facto-record-meta-value">' + pSchema.IDSchema + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">GUID</span><span class="facto-record-meta-value">' + tmpGUID + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Hash</span><span class="facto-record-meta-value facto-hash-value">' + (pSchema.Hash || '\u2014') + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Status</span><span class="facto-record-meta-value">' + tmpActive + '</span></div>';
		tmpHtml += '</div>';

		// Schema info card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Schema Info</h3>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Type</span><span class="facto-record-meta-value"><span class="facto-badge facto-badge-primary">' + (pSchema.Type || '\u2014') + '</span></span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Version</span><span class="facto-record-meta-value">' + (pSchema.Version || 0) + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Schema Hash</span><span class="facto-record-meta-value"><code style="font-size:0.8em;">' + (pSchema.SchemaHash || '\u2014') + '</code></span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Description</span><span class="facto-record-meta-value">' + (pSchema.Description || '\u2014') + '</span></div>';
		tmpHtml += '</div>';

		// Statistics card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Statistics</h3>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Documents</span><span class="facto-record-meta-value">' + (pSummary.DocumentationCount || 0) + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Versions</span><span class="facto-record-meta-value">' + (pSummary.VersionCount || 0) + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Linked Datasets</span><span class="facto-record-meta-value">' + (pSummary.LinkedDatasetCount || 0) + '</span></div>';
		tmpHtml += '</div>';

		return tmpHtml;
	}

	// ------------------------------------------------------------------
	// Schema Definition Section
	// ------------------------------------------------------------------

	_renderDDLSection(pSchema)
	{
		let tmpEl = document.getElementById('Facto-SchemaDetail-DDLSection');
		if (!tmpEl) return;

		let tmpDDL = pSchema.SchemaDefinition || '';
		let tmpHtml = '<div class="facto-schema-edit-section">';
		tmpHtml += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5em;">';
		tmpHtml += '<h2 style="font-size:1em; margin:0; color:var(--facto-text-secondary); text-transform:uppercase; letter-spacing:0.05em;">Schema Definition (MicroDDL)</h2>';
		tmpHtml += '<button class="facto-edit-toggle" id="Facto-SchemaDetail-DDLEditToggle" onclick="pict.views[\'Facto-Full-SchemaDetail\'].toggleDDLEdit()">' + (this._DDLEditMode ? '&#10003; Done' : '&#9998; Edit') + '</button>';
		tmpHtml += '</div>';

		if (this._DDLEditMode)
		{
			// Detect which tracking columns are already present
			let tmpHasAuditing = /&CreateDate/i.test(tmpDDL) || /&UpdateDate/i.test(tmpDDL);
			let tmpHasSoftDeletes = /\^Deleted/i.test(tmpDDL) || /&DeleteDate/i.test(tmpDDL);

			tmpHtml += '<div style="display:flex; gap:0.5em; margin-bottom:0.5em; flex-wrap:wrap;">';
			if (tmpHasAuditing)
			{
				tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-SchemaDetail\'].removeAuditingColumns()" title="Remove CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser">&#10005; Remove Auditing</button>';
			}
			else
			{
				tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-SchemaDetail\'].addAuditingColumns()" title="Add CreateDate, CreatingIDUser, UpdateDate, UpdatingIDUser">&#43; Add Auditing</button>';
			}
			if (tmpHasSoftDeletes)
			{
				tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-SchemaDetail\'].removeSoftDeleteColumns()" title="Remove Deleted, DeleteDate, DeletingIDUser">&#10005; Remove Soft Deletes</button>';
			}
			else
			{
				tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-SchemaDetail\'].addSoftDeleteColumns()" title="Add Deleted, DeleteDate, DeletingIDUser">&#43; Add Soft Deletes</button>';
			}
			tmpHtml += '</div>';

			tmpHtml += '<textarea id="Facto-SchemaDetail-DDLInput">' + (tmpDDL || '') + '</textarea>';
			tmpHtml += '<div class="facto-schema-edit-actions">';
			tmpHtml += '<button class="facto-btn facto-btn-primary" onclick="pict.views[\'Facto-Full-SchemaDetail\'].saveDDL()">Save &amp; Version</button>';
			tmpHtml += '<button class="facto-btn facto-btn-secondary" onclick="pict.views[\'Facto-Full-SchemaDetail\'].compileDDL()">Compile Preview</button>';
			tmpHtml += '<input type="text" id="Facto-SchemaDetail-ChangeDesc" placeholder="Change description (optional)" style="flex:1; margin-bottom:0;">';
			tmpHtml += '</div>';
			tmpHtml += '<div id="Facto-SchemaDetail-CompilePreview" style="margin-top:0.75em;"></div>';
		}
		else
		{
			if (tmpDDL)
			{
				tmpHtml += '<div class="facto-schema-ddl-wrap">' + tmpDDL.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
			}
			else
			{
				tmpHtml += '<div class="facto-schema-ddl-wrap facto-schema-ddl-empty">No schema definition yet. Click Edit to add a MicroDDL definition.</div>';
			}
		}

		tmpHtml += '</div>';
		tmpEl.innerHTML = tmpHtml;
	}

	toggleDDLEdit()
	{
		this._DDLEditMode = !this._DDLEditMode;
		if (this._SchemaData)
		{
			this._renderDDLSection(this._SchemaData);
		}
	}

	saveDDL()
	{
		let tmpDDLInput = document.getElementById('Facto-SchemaDetail-DDLInput');
		let tmpChangeDesc = (document.getElementById('Facto-SchemaDetail-ChangeDesc') || {}).value || '';
		if (!tmpDDLInput) return;

		let tmpDDL = tmpDDLInput.value;
		let tmpProvider = this.pict.providers.Facto;

		tmpProvider.saveSchema(this._CurrentIDSchema,
			{
				SchemaDefinition: tmpDDL,
				ChangeDescription: tmpChangeDesc
			}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error: ' + pResponse.Error, 'error');
					return;
				}

				this.pict.providers.FactoUI.showToast('Schema saved (v' + (pResponse.Version || '?') + ')', 'ok');
				this._DDLEditMode = false;

				// Reload the full detail
				this._fetchAndDisplaySchema();
			});
	}

	compileDDL()
	{
		let tmpDDLInput = document.getElementById('Facto-SchemaDetail-DDLInput');
		let tmpPreview = document.getElementById('Facto-SchemaDetail-CompilePreview');
		if (!tmpDDLInput || !tmpPreview) return;

		let tmpDDL = tmpDDLInput.value;
		if (!tmpDDL)
		{
			tmpPreview.innerHTML = '<div class="facto-status facto-status-warn">Enter a MicroDDL definition first.</div>';
			return;
		}

		this.pict.providers.Facto.compileSchemaDefinition(this._CurrentIDSchema, tmpDDL).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					tmpPreview.innerHTML = '<div class="facto-status facto-status-error">Compile error: ' + pResponse.Error + '</div>';
					return;
				}

				tmpPreview.innerHTML = '<div class="facto-schema-ddl-wrap" style="max-height:200px;">' + JSON.stringify(pResponse, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
			});
	}

	// ------------------------------------------------------------------
	// Add/Remove Tracking Columns
	// ------------------------------------------------------------------

	_getAuditingColumns()
	{
		return ['&CreateDate', '#CreatingIDUser', '&UpdateDate', '#UpdatingIDUser'];
	}

	_getSoftDeleteColumns()
	{
		return ['^Deleted', '&DeleteDate', '#DeletingIDUser'];
	}

	_getDDLLines()
	{
		let tmpInput = document.getElementById('Facto-SchemaDetail-DDLInput');
		if (!tmpInput) return [];
		return tmpInput.value.split('\n');
	}

	_setDDLLines(pLines)
	{
		let tmpInput = document.getElementById('Facto-SchemaDetail-DDLInput');
		if (!tmpInput) return;
		tmpInput.value = pLines.join('\n');
		// Re-render the DDL section to update button states
		if (this._SchemaData)
		{
			this._SchemaData.SchemaDefinition = tmpInput.value;
			this._renderDDLSection(this._SchemaData);
		}
	}

	_columnExistsInDDL(pLines, pColumnName)
	{
		// Check if a column name (without prefix symbol) exists in any line
		let tmpLower = pColumnName.toLowerCase();
		for (let i = 0; i < pLines.length; i++)
		{
			let tmpLine = pLines[i].trim();
			if (tmpLine.length < 2) continue;
			// Extract column name: first char is the symbol, rest is the name (possibly with size)
			let tmpName = tmpLine.substring(1).split(' ')[0].trim();
			if (tmpName.toLowerCase() === tmpLower)
			{
				return true;
			}
		}
		return false;
	}

	addAuditingColumns()
	{
		let tmpLines = this._getDDLLines();
		let tmpColumns = this._getAuditingColumns();

		for (let i = 0; i < tmpColumns.length; i++)
		{
			let tmpColName = tmpColumns[i].substring(1);
			if (!this._columnExistsInDDL(tmpLines, tmpColName))
			{
				tmpLines.push(tmpColumns[i]);
			}
		}

		this._setDDLLines(tmpLines);
	}

	removeAuditingColumns()
	{
		let tmpLines = this._getDDLLines();
		let tmpColumnNames = this._getAuditingColumns().map(function(c) { return c.substring(1).toLowerCase(); });

		let tmpFiltered = tmpLines.filter(
			function(pLine)
			{
				let tmpTrimmed = pLine.trim();
				if (tmpTrimmed.length < 2) return true;
				let tmpName = tmpTrimmed.substring(1).split(' ')[0].trim().toLowerCase();
				return tmpColumnNames.indexOf(tmpName) < 0;
			});

		this._setDDLLines(tmpFiltered);
	}

	addSoftDeleteColumns()
	{
		let tmpLines = this._getDDLLines();
		let tmpColumns = this._getSoftDeleteColumns();

		for (let i = 0; i < tmpColumns.length; i++)
		{
			let tmpColName = tmpColumns[i].substring(1);
			if (!this._columnExistsInDDL(tmpLines, tmpColName))
			{
				tmpLines.push(tmpColumns[i]);
			}
		}

		this._setDDLLines(tmpLines);
	}

	removeSoftDeleteColumns()
	{
		let tmpLines = this._getDDLLines();
		let tmpColumnNames = this._getSoftDeleteColumns().map(function(c) { return c.substring(1).toLowerCase(); });

		let tmpFiltered = tmpLines.filter(
			function(pLine)
			{
				let tmpTrimmed = pLine.trim();
				if (tmpTrimmed.length < 2) return true;
				let tmpName = tmpTrimmed.substring(1).split(' ')[0].trim().toLowerCase();
				return tmpColumnNames.indexOf(tmpName) < 0;
			});

		this._setDDLLines(tmpFiltered);
	}

	// ------------------------------------------------------------------
	// Analyze Records
	// ------------------------------------------------------------------

	_populateAnalyzeDropdowns()
	{
		let tmpProvider = this.pict.providers.Facto;

		// Load datasets and sources if not already loaded
		let tmpDatasetsReady = (this.pict.AppData.Facto.Datasets && this.pict.AppData.Facto.Datasets.length > 0);
		let tmpSourcesReady = (this.pict.AppData.Facto.Sources && this.pict.AppData.Facto.Sources.length > 0);

		let tmpPromises = [];
		if (!tmpDatasetsReady) tmpPromises.push(tmpProvider.loadDatasets());
		if (!tmpSourcesReady) tmpPromises.push(tmpProvider.loadSources());

		if (tmpPromises.length > 0)
		{
			Promise.all(tmpPromises).then(() => { this._fillAnalyzeSelects(); });
		}
		else
		{
			this._fillAnalyzeSelects();
		}
	}

	_fillAnalyzeSelects()
	{
		let tmpDatasetSelect = document.getElementById('Facto-SchemaDetail-AnalyzeDataset');
		let tmpSourceSelect = document.getElementById('Facto-SchemaDetail-AnalyzeSource');

		if (tmpDatasetSelect)
		{
			let tmpDatasets = this.pict.AppData.Facto.Datasets || [];
			for (let i = 0; i < tmpDatasets.length; i++)
			{
				let tmpOpt = document.createElement('option');
				tmpOpt.value = tmpDatasets[i].IDDataset;
				tmpOpt.textContent = tmpDatasets[i].Name + ' (' + (tmpDatasets[i].Type || '') + ')';
				tmpDatasetSelect.appendChild(tmpOpt);
			}
		}

		if (tmpSourceSelect)
		{
			let tmpSources = this.pict.AppData.Facto.Sources || [];
			for (let i = 0; i < tmpSources.length; i++)
			{
				let tmpOpt = document.createElement('option');
				tmpOpt.value = tmpSources[i].IDSource;
				tmpOpt.textContent = tmpSources[i].Name;
				tmpSourceSelect.appendChild(tmpOpt);
			}
		}
	}

	analyzeRecords()
	{
		let tmpDatasetVal = (document.getElementById('Facto-SchemaDetail-AnalyzeDataset') || {}).value || '';
		let tmpSourceVal = (document.getElementById('Facto-SchemaDetail-AnalyzeSource') || {}).value || '';
		let tmpSampleSize = parseInt((document.getElementById('Facto-SchemaDetail-AnalyzeSampleSize') || {}).value, 10) || 50;

		let tmpIDDataset = parseInt(tmpDatasetVal, 10) || 0;
		let tmpIDSource = parseInt(tmpSourceVal, 10) || 0;

		if (!tmpIDDataset && !tmpIDSource)
		{
			this.pict.providers.FactoUI.showToast('Select a dataset or source to analyze', 'error');
			return;
		}

		let tmpStatusEl = document.getElementById('Facto-SchemaDetail-AnalyzeStatus');
		let tmpResultsEl = document.getElementById('Facto-SchemaDetail-AnalyzeResults');
		if (tmpStatusEl)
		{
			tmpStatusEl.style.display = 'block';
			tmpStatusEl.className = 'facto-status facto-status-info';
			tmpStatusEl.textContent = 'Analyzing records...';
		}
		if (tmpResultsEl) tmpResultsEl.innerHTML = '';

		this.pict.providers.Facto.analyzeRecords(tmpIDDataset, tmpIDSource, tmpSampleSize).then(
			(pResponse) =>
			{
				if (tmpStatusEl) tmpStatusEl.style.display = 'none';

				if (pResponse && pResponse.Error)
				{
					if (tmpStatusEl)
					{
						tmpStatusEl.className = 'facto-status facto-status-error';
						tmpStatusEl.textContent = 'Error: ' + pResponse.Error;
						tmpStatusEl.style.display = 'block';
					}
					return;
				}

				this._AnalyzedFields = pResponse.Fields || [];
				this._AnalyzedRecordCount = pResponse.RecordsAnalyzed || 0;
				this._renderAnalyzeResults();
			});
	}

	_renderAnalyzeResults()
	{
		let tmpResultsEl = document.getElementById('Facto-SchemaDetail-AnalyzeResults');
		if (!tmpResultsEl) return;

		let tmpFields = this._AnalyzedFields || [];
		if (tmpFields.length === 0)
		{
			tmpResultsEl.innerHTML = '<div class="facto-empty">No fields discovered in the sampled records.</div>';
			return;
		}

		let tmpTypeOptions = ['String', 'Number', 'Integer', 'Float', 'Boolean', 'DateTime', 'Array', 'Object'];
		let tmpTotalRecords = this._AnalyzedRecordCount || 1;

		let tmpHtml = '<div style="font-size:0.85em; color:var(--facto-text-secondary); margin-bottom:0.5em;">Discovered <strong>' + tmpFields.length + '</strong> fields across <strong>' + tmpTotalRecords + '</strong> records</div>';
		tmpHtml += '<table class="facto-schema-fields-table">';
		tmpHtml += '<thead><tr>';
		tmpHtml += '<th style="width:30px;"><input type="checkbox" id="Facto-SchemaDetail-AnalyzeSelectAll" checked onchange="pict.views[\'Facto-Full-SchemaDetail\'].toggleAllAnalyzedFields(this.checked)"></th>';
		tmpHtml += '<th>Address</th><th>Hash</th><th>Name</th><th>DataType</th><th>Freq</th><th>Sample</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < tmpFields.length; i++)
		{
			let tmpField = tmpFields[i];
			let tmpChecked = tmpField.InSchema ? ' checked' : '';
			let tmpSample = (tmpField.SampleValues && tmpField.SampleValues.length > 0) ? String(tmpField.SampleValues[0]) : '';
			if (tmpSample.length > 60) tmpSample = tmpSample.substring(0, 57) + '\u2026';

			tmpHtml += '<tr>';
			tmpHtml += '<td><input type="checkbox" class="facto-analyze-field-check" data-idx="' + i + '"' + tmpChecked + '></td>';
			tmpHtml += '<td class="facto-field-addr">' + tmpField.Address + '</td>';
			tmpHtml += '<td><input type="text" class="facto-analyze-field-hash" data-idx="' + i + '" value="' + (tmpField.Hash || '').replace(/"/g, '&quot;') + '"></td>';
			tmpHtml += '<td><input type="text" class="facto-analyze-field-name" data-idx="' + i + '" value="' + (tmpField.Name || '').replace(/"/g, '&quot;') + '"></td>';
			tmpHtml += '<td><select class="facto-analyze-field-type" data-idx="' + i + '">';
			for (let j = 0; j < tmpTypeOptions.length; j++)
			{
				let tmpSelected = (tmpTypeOptions[j] === tmpField.DataType) ? ' selected' : '';
				tmpHtml += '<option value="' + tmpTypeOptions[j] + '"' + tmpSelected + '>' + tmpTypeOptions[j] + '</option>';
			}
			tmpHtml += '</select></td>';
			tmpHtml += '<td class="facto-field-freq">' + tmpField.Frequency + '/' + tmpTotalRecords + '</td>';
			tmpHtml += '<td class="facto-field-sample" title="' + tmpSample.replace(/"/g, '&quot;') + '">' + tmpSample.replace(/</g, '&lt;') + '</td>';
			tmpHtml += '</tr>';
		}

		tmpHtml += '</tbody></table>';
		tmpHtml += '<div class="facto-schema-analyze-actions">';
		tmpHtml += '<button class="facto-btn facto-btn-success" onclick="pict.views[\'Facto-Full-SchemaDetail\'].applyAnalyzedSchema()">Apply to Schema</button>';
		tmpHtml += '<button class="facto-btn facto-btn-secondary" onclick="document.getElementById(\'Facto-SchemaDetail-AnalyzeResults\').innerHTML=\'\'">Clear</button>';
		tmpHtml += '</div>';

		tmpResultsEl.innerHTML = tmpHtml;
	}

	toggleAllAnalyzedFields(pChecked)
	{
		let tmpCheckboxes = document.querySelectorAll('.facto-analyze-field-check');
		for (let i = 0; i < tmpCheckboxes.length; i++)
		{
			tmpCheckboxes[i].checked = pChecked;
		}
	}

	applyAnalyzedSchema()
	{
		let tmpFields = this._AnalyzedFields || [];
		if (tmpFields.length === 0) return;

		// Read edited values from DOM
		let tmpSelectedDescriptors = [];
		let tmpDDLLines = [];

		for (let i = 0; i < tmpFields.length; i++)
		{
			let tmpCheck = document.querySelector('.facto-analyze-field-check[data-idx="' + i + '"]');
			if (!tmpCheck || !tmpCheck.checked) continue;

			let tmpHash = (document.querySelector('.facto-analyze-field-hash[data-idx="' + i + '"]') || {}).value || tmpFields[i].Hash;
			let tmpName = (document.querySelector('.facto-analyze-field-name[data-idx="' + i + '"]') || {}).value || tmpFields[i].Name;
			let tmpType = (document.querySelector('.facto-analyze-field-type[data-idx="' + i + '"]') || {}).value || tmpFields[i].DataType;

			tmpSelectedDescriptors.push(
			{
				Address: tmpFields[i].Address,
				Hash: tmpHash,
				Name: tmpName,
				DataType: tmpType,
				Default: tmpFields[i].SampleValues && tmpFields[i].SampleValues.length > 0 ? tmpFields[i].SampleValues[0] : ''
			});

			// Generate MicroDDL line
			let tmpDDLCol = this._typeToMicroDDL(tmpType, tmpHash);
			if (tmpDDLCol) tmpDDLLines.push(tmpDDLCol);
		}

		if (tmpSelectedDescriptors.length === 0)
		{
			this.pict.providers.FactoUI.showToast('No fields selected', 'error');
			return;
		}

		// Build the schema name from the current schema
		let tmpTableName = (this._SchemaData && this._SchemaData.Name) ? this._SchemaData.Name.replace(/[^a-zA-Z0-9]/g, '') : 'GeneratedSchema';
		let tmpDDL = '!' + tmpTableName + '\n@ID' + tmpTableName + '\n' + tmpDDLLines.join('\n');
		let tmpManyfestJSON = JSON.stringify(tmpSelectedDescriptors, null, 2);

		// Save to the schema
		this.pict.providers.Facto.saveSchema(this._CurrentIDSchema,
		{
			SchemaDefinition: tmpDDL,
			ManyfestDefinition: tmpManyfestJSON,
			ChangeDescription: 'Generated from record analysis (' + this._AnalyzedRecordCount + ' records)'
		}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error: ' + pResponse.Error, 'error');
					return;
				}
				this.pict.providers.FactoUI.showToast('Schema applied (v' + (pResponse.Version || '?') + ')', 'ok');
				this._DDLEditMode = false;
				this._fetchAndDisplaySchema();
			});
	}

	_typeToMicroDDL(pType, pName)
	{
		switch (pType)
		{
			case 'String': return '$' + pName + ' 200';
			case 'Number': return '#' + pName;
			case 'Integer': return '#' + pName;
			case 'Float': return '.' + pName + ' 10,2';
			case 'Boolean': return '^' + pName;
			case 'DateTime': return '&' + pName;
			case 'Array': return '*' + pName;
			case 'Object': return '*' + pName;
			default: return '$' + pName + ' 200';
		}
	}

	// ------------------------------------------------------------------
	// Linked Datasets
	// ------------------------------------------------------------------

	_renderLinkedDatasets()
	{
		let tmpEl = document.getElementById('Facto-SchemaDetail-LinkedDatasets');
		if (!tmpEl) return;

		let tmpHtml = '<h2>Linked Datasets</h2>';

		if (this._LinkedDatasets && this._LinkedDatasets.length > 0)
		{
			tmpHtml += '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Actions</th></tr></thead><tbody>';
			for (let i = 0; i < this._LinkedDatasets.length; i++)
			{
				let tmpDS = this._LinkedDatasets[i];
				tmpHtml += '<tr>';
				tmpHtml += '<td>' + (tmpDS.IDDataset || '') + '</td>';
				tmpHtml += '<td>' + (tmpDS.Name || '') + '</td>';
				tmpHtml += '<td><span class="facto-badge facto-badge-primary">' + (tmpDS.Type || '') + '</span></td>';
				tmpHtml += '<td>';
				tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Projection/' + tmpDS.IDDataset + '\')">View</button> ';
				tmpHtml += '<button class="facto-btn facto-btn-danger facto-btn-small" onclick="pict.views[\'Facto-Full-SchemaDetail\'].unlinkDataset(' + tmpDS.IDDataset + ')">Unlink</button>';
				tmpHtml += '</td>';
				tmpHtml += '</tr>';
			}
			tmpHtml += '</tbody></table>';
		}
		else
		{
			tmpHtml += '<div class="facto-empty">No datasets linked to this schema yet.</div>';
		}

		// Link a dataset control
		tmpHtml += '<div class="facto-link-dataset-row">';
		tmpHtml += '<select id="Facto-SchemaDetail-LinkDatasetSelect"><option value="">Select a dataset to link...</option></select>';
		tmpHtml += '<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-SchemaDetail\'].linkDataset()">Link Dataset</button>';
		tmpHtml += '</div>';

		tmpEl.innerHTML = tmpHtml;

		// Populate the select with available datasets
		this._populateDatasetSelect();
	}

	_populateDatasetSelect()
	{
		let tmpSelect = document.getElementById('Facto-SchemaDetail-LinkDatasetSelect');
		if (!tmpSelect) return;

		let tmpDatasets = this.pict.AppData.Facto.Datasets || [];
		let tmpLinkedIDs = {};
		if (this._LinkedDatasets)
		{
			for (let i = 0; i < this._LinkedDatasets.length; i++)
			{
				tmpLinkedIDs[this._LinkedDatasets[i].IDDataset] = true;
			}
		}

		for (let i = 0; i < tmpDatasets.length; i++)
		{
			if (!tmpLinkedIDs[tmpDatasets[i].IDDataset])
			{
				let tmpOpt = document.createElement('option');
				tmpOpt.value = tmpDatasets[i].IDDataset;
				tmpOpt.textContent = tmpDatasets[i].Name + ' (' + (tmpDatasets[i].Type || '') + ')';
				tmpSelect.appendChild(tmpOpt);
			}
		}
	}

	linkDataset()
	{
		let tmpSelect = document.getElementById('Facto-SchemaDetail-LinkDatasetSelect');
		if (!tmpSelect || !tmpSelect.value) return;

		let tmpIDDataset = parseInt(tmpSelect.value, 10);
		this.pict.providers.Facto.linkSchemaToDataset(this._CurrentIDSchema, tmpIDDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error: ' + pResponse.Error, 'error');
					return;
				}
				this.pict.providers.FactoUI.showToast('Dataset linked', 'ok');
				this._fetchAndDisplaySchema();
			});
	}

	unlinkDataset(pIDDataset)
	{
		if (!confirm('Unlink this dataset from the schema?')) return;
		this.pict.providers.Facto.unlinkSchemaFromDataset(this._CurrentIDSchema, pIDDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error: ' + pResponse.Error, 'error');
					return;
				}
				this.pict.providers.FactoUI.showToast('Dataset unlinked', 'ok');
				this._fetchAndDisplaySchema();
			});
	}

	// ------------------------------------------------------------------
	// Version History
	// ------------------------------------------------------------------

	_renderVersionHistory()
	{
		let tmpEl = document.getElementById('Facto-SchemaDetail-VersionHistory');
		if (!tmpEl) return;

		let tmpHtml = '<h2>Version History</h2>';

		if (this._Versions && this._Versions.length > 0)
		{
			tmpHtml += '<table><thead><tr><th>Version</th><th>Hash</th><th>Change Description</th><th>Date</th></tr></thead><tbody>';
			for (let i = 0; i < this._Versions.length; i++)
			{
				let tmpVer = this._Versions[i];
				let tmpHash = tmpVer.SchemaHash || '';
				if (tmpHash.length > 12) tmpHash = tmpHash.substring(0, 12) + '\u2026';
				let tmpDate = tmpVer.CreateDate || '';
				if (tmpDate && tmpDate.length > 19) tmpDate = tmpDate.substring(0, 19);
				tmpHtml += '<tr>';
				tmpHtml += '<td><strong>v' + (tmpVer.Version || 0) + '</strong></td>';
				tmpHtml += '<td><code style="font-size:0.8em;">' + tmpHash + '</code></td>';
				tmpHtml += '<td>' + (tmpVer.ChangeDescription || '\u2014') + '</td>';
				tmpHtml += '<td>' + tmpDate + '</td>';
				tmpHtml += '</tr>';
			}
			tmpHtml += '</tbody></table>';
		}
		else
		{
			tmpHtml += '<div class="facto-empty">No versions yet. Save a schema definition to create the first version.</div>';
		}

		tmpEl.innerHTML = tmpHtml;
	}

	// ------------------------------------------------------------------
	// Documentation
	// ------------------------------------------------------------------

	_renderDocList()
	{
		let tmpEl = document.getElementById('Facto-SchemaDetail-DocListWrap');
		if (!tmpEl) return;

		let tmpHtml = '<div class="facto-doc-list">';

		// New Document button
		tmpHtml += '<div class="facto-doc-new-input" id="Facto-SchemaDetail-NewDocWrap">';
		tmpHtml += '<input type="text" id="Facto-SchemaDetail-NewDocName" placeholder="Document name...">';
		tmpHtml += '<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-SchemaDetail\'].createDocument()">New Document</button>';
		tmpHtml += '</div>';

		tmpHtml += '</div>';

		if (this._Documentation && this._Documentation.length > 0)
		{
			tmpHtml += '<div class="facto-doc-list">';
			for (let i = 0; i < this._Documentation.length; i++)
			{
				let tmpDoc = this._Documentation[i];
				let tmpActiveClass = (this._CurrentIDDoc && parseInt(this._CurrentIDDoc, 10) === tmpDoc.IDSchemaDocumentation) ? ' active' : '';
				tmpHtml += '<div class="facto-doc-item' + tmpActiveClass + '" onclick="pict.views[\'Facto-Full-SchemaDetail\'].selectDocument(' + tmpDoc.IDSchemaDocumentation + ')">';
				tmpHtml += (tmpDoc.Name || 'Untitled');
				tmpHtml += '</div>';
			}
			tmpHtml += '</div>';
		}

		tmpEl.innerHTML = tmpHtml;
	}

	selectDocument(pIDDoc)
	{
		let tmpProvider = this.pict.providers.Facto;
		this._CurrentIDDoc = pIDDoc;

		if (window.history && window.history.replaceState)
		{
			window.history.replaceState(null, '', '#/Schema/' + this._CurrentIDSchema + '/Doc/' + pIDDoc);
		}

		this._renderDocList();

		tmpProvider.loadSchemaDocument(this._CurrentIDSchema, pIDDoc).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.log.error('Error loading document: ' + pResponse.Error);
					return;
				}

				let tmpDoc = pResponse.Documentation;
				this._CurrentDocName = tmpDoc.Name || 'Untitled';
				this._CurrentDocContent = tmpDoc.Content || '';

				this._showDocument();
			});
	}

	_showDocument()
	{
		let tmpContentWrap = document.getElementById('Facto-SchemaDetail-ContentWrap');
		let tmpEditorWrap = document.getElementById('Facto-SchemaDetail-EditorWrap');

		if (this._EditMode)
		{
			if (tmpContentWrap) tmpContentWrap.style.display = 'none';
			if (tmpEditorWrap) tmpEditorWrap.style.display = 'block';

			let tmpEditorView = this.pict.views['Facto-Full-SchemaDocEditor'];
			if (tmpEditorView)
			{
				tmpEditorView.openEditor(this._CurrentIDSchema, this._CurrentIDDoc, this._CurrentDocName, this._CurrentDocContent);
			}
		}
		else
		{
			if (tmpEditorWrap) tmpEditorWrap.style.display = 'none';
			if (tmpContentWrap) tmpContentWrap.style.display = 'block';

			this._renderReadOnlyContent();
		}
	}

	_renderReadOnlyContent()
	{
		let tmpDisplayEl = document.getElementById('Facto-SchemaDetail-ContentDisplay');
		if (!tmpDisplayEl) return;

		if (!this._CurrentDocContent)
		{
			tmpDisplayEl.innerHTML = '<p style="color:var(--facto-text-tertiary);">Empty document.</p>';
			return;
		}

		let tmpHTML = this.pict.providers.PictContent.parseMarkdown(this._CurrentDocContent);
		tmpDisplayEl.innerHTML = tmpHTML;
	}

	toggleEditMode()
	{
		let tmpToggleBtn = document.getElementById('Facto-SchemaDetail-EditToggle');

		if (this._EditMode)
		{
			let tmpEditorView = this.pict.views['Facto-Full-SchemaDocEditor'];
			if (tmpEditorView)
			{
				let tmpResult = tmpEditorView.closeEditor();
				this._CurrentDocContent = tmpResult.Content;
				this._CurrentDocName = tmpResult.Name;
			}

			this._EditMode = false;
			if (tmpToggleBtn)
			{
				tmpToggleBtn.innerHTML = '&#9998; Edit';
				tmpToggleBtn.classList.remove('active');
			}
		}
		else
		{
			this._EditMode = true;
			if (tmpToggleBtn)
			{
				tmpToggleBtn.innerHTML = '&#10003; Done';
				tmpToggleBtn.classList.add('active');
			}
		}

		if (this._CurrentIDDoc)
		{
			this._showDocument();
		}
	}

	createDocument()
	{
		let tmpNameInput = document.getElementById('Facto-SchemaDetail-NewDocName');
		let tmpName = tmpNameInput ? tmpNameInput.value.trim() : '';
		if (!tmpName)
		{
			let tmpUntitledCount = 0;
			if (this._Documentation)
			{
				for (let i = 0; i < this._Documentation.length; i++)
				{
					let tmpDocName = this._Documentation[i].Name || '';
					if (tmpDocName === 'Untitled' || tmpDocName.match(/^Untitled \d+$/))
					{
						tmpUntitledCount++;
					}
				}
			}
			tmpName = 'Untitled ' + (tmpUntitledCount + 1);
		}

		let tmpProvider = this.pict.providers.Facto;
		tmpProvider.createSchemaDocument(this._CurrentIDSchema,
			{
				Name: tmpName,
				DocumentType: 'markdown',
				Content: '# ' + tmpName + '\n\n'
			}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success && pResponse.Documentation)
				{
					if (tmpNameInput) tmpNameInput.value = '';

					let tmpNewID = pResponse.Documentation.IDSchemaDocumentation;
					return tmpProvider.loadSchemaDocumentation(this._CurrentIDSchema).then(
						(pDocsResponse) =>
						{
							this._Documentation = (pDocsResponse && pDocsResponse.Documentation) ? pDocsResponse.Documentation : [];
							this._renderDocList();
							this.selectDocument(tmpNewID);
						});
				}
			});
	}

	onDocumentNameChanged(pIDDoc, pNewName)
	{
		for (let i = 0; i < this._Documentation.length; i++)
		{
			if (this._Documentation[i].IDSchemaDocumentation === parseInt(pIDDoc, 10))
			{
				this._Documentation[i].Name = pNewName;
				break;
			}
		}
		this._CurrentDocName = pNewName;
		this._renderDocList();
	}

	goBack()
	{
		this.pict.PictApplication.navigateTo('/SchemaResearch');
	}
}

module.exports = FactoFullSchemaDetailView;

module.exports.default_configuration = _ViewConfiguration;
