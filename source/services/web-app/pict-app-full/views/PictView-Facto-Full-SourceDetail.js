const libPictView = require('pict-view');
const libPictSectionContent = require('pict-section-content');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-SourceDetail",

	DefaultRenderable: "Facto-Full-SourceDetail-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-source-detail-back {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			color: var(--facto-text-secondary);
			cursor: pointer;
			font-size: 0.85em;
			margin-bottom: 0.75em;
			transition: color 0.15s;
		}
		.facto-source-detail-back:hover {
			color: var(--facto-brand);
		}

		/* Research context section */
		.facto-research-context {
			background: var(--facto-bg-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 8px;
			padding: 1em;
			margin-bottom: 1.5em;
		}
		.facto-research-context h3 {
			margin: 0 0 0.5em;
			font-size: 0.75em;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--facto-text-tertiary, #888);
		}
		.facto-research-context-detail {
			font-size: 0.85em;
			color: var(--facto-text-secondary, #aaa);
			line-height: 1.6;
		}
		.facto-research-context-detail strong {
			color: var(--facto-text-heading, #eee);
		}
		.facto-research-context-note {
			margin-top: 0.5em;
			padding: 0.5em 0.75em;
			background: var(--facto-brand-a08);
			border-left: 3px solid var(--facto-brand, #4a90d9);
			border-radius: 0 4px 4px 0;
			font-size: 0.85em;
			color: var(--facto-text-secondary, #aaa);
		}

		/* Dataset definitions table */
		.facto-dataset-defs {
			margin-bottom: 1.5em;
		}
		.facto-dataset-defs h2 {
			font-size: 1em;
			margin: 0 0 0.75em;
			color: var(--facto-text-secondary, #aaa);
			text-transform: uppercase;
			letter-spacing: 0.05em;
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
			color: var(--facto-text-secondary, #aaa);
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
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			background: transparent;
			color: var(--facto-text-tertiary, #888);
		}
		.facto-edit-toggle:hover {
			border-color: var(--facto-brand, #4a90d9);
			color: var(--facto-brand, #4a90d9);
		}
		.facto-edit-toggle.active {
			background: var(--facto-brand-a15);
			border-color: var(--facto-brand, #4a90d9);
			color: var(--facto-brand, #4a90d9);
		}

		/* Read-only rendered content */
		.facto-doc-content-wrap {
			background: var(--facto-bg-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 8px;
			padding: 1.5em 2em;
			min-height: 100px;
		}
		.facto-doc-content-wrap h1 {
			font-size: 1.75em;
			color: var(--facto-text-heading, #eee);
			border-bottom: 1px solid var(--facto-border-subtle, #2a2e3a);
			padding-bottom: 0.3em;
			margin-top: 0;
		}
		.facto-doc-content-wrap h2 {
			font-size: 1.4em;
			color: var(--facto-text-heading, #eee);
			border-bottom: 1px solid var(--facto-border-subtle, #2a2e3a);
			padding-bottom: 0.25em;
			margin-top: 1.5em;
		}
		.facto-doc-content-wrap h3 {
			font-size: 1.15em;
			color: var(--facto-text-heading, #eee);
			margin-top: 1.25em;
		}
		.facto-doc-content-wrap h4,
		.facto-doc-content-wrap h5,
		.facto-doc-content-wrap h6 {
			color: var(--facto-text-secondary, #ccc);
			margin-top: 1em;
		}
		.facto-doc-content-wrap p {
			line-height: 1.7;
			color: var(--facto-text-secondary, #bbb);
			margin: 0.75em 0;
		}
		.facto-doc-content-wrap a {
			color: var(--facto-brand, #4a90d9);
		}
		.facto-doc-content-wrap code {
			background: var(--facto-brand-a10);
			color: var(--facto-brand, #4a90d9);
			padding: 0.15em 0.35em;
			border-radius: 3px;
			font-size: 0.9em;
		}
		.facto-doc-content-wrap pre {
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 6px;
			padding: 1em;
			overflow-x: auto;
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-content-wrap pre code {
			background: transparent;
			padding: 0;
			color: inherit;
		}
		.facto-doc-content-wrap blockquote {
			border-left: 3px solid var(--facto-brand, #4a90d9);
			padding: 0.5em 1em;
			margin: 1em 0;
			color: var(--facto-text-tertiary, #888);
			background: var(--facto-brand-a05);
			border-radius: 0 4px 4px 0;
		}
		.facto-doc-content-wrap table {
			width: 100%;
			border-collapse: collapse;
			margin: 1em 0;
		}
		.facto-doc-content-wrap table th,
		.facto-doc-content-wrap table td {
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			padding: 0.5em 0.75em;
		}
		.facto-doc-content-wrap table th {
			background: rgba(255, 255, 255, 0.03);
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-content-wrap img {
			max-width: 100%;
			height: auto;
			border-radius: 4px;
			margin: 0.5em 0;
		}
		.facto-doc-content-wrap hr {
			border: none;
			border-top: 1px solid var(--facto-border-subtle, #2a2e3a);
			margin: 1.5em 0;
		}
		.facto-doc-content-wrap ul,
		.facto-doc-content-wrap ol {
			color: var(--facto-text-secondary, #bbb);
			padding-left: 1.5em;
			line-height: 1.7;
		}
		.facto-doc-list {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5em;
			margin-bottom: 1em;
		}
		.facto-doc-item {
			padding: 0.4em 0.75em;
			background: var(--facto-bg-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 6px;
			font-size: 0.85em;
			cursor: pointer;
			color: var(--facto-text-secondary, #aaa);
			transition: border-color 0.15s, color 0.15s;
		}
		.facto-doc-item:hover {
			border-color: var(--facto-brand, #4a90d9);
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-item.active {
			border-color: var(--facto-brand, #4a90d9);
			color: var(--facto-brand, #4a90d9);
			background: var(--facto-brand-a10);
		}
		.facto-doc-new-input {
			display: flex;
			gap: 0.5em;
			align-items: center;
		}
		.facto-doc-new-input input {
			width: 240px;
			margin-bottom: 0;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-SourceDetail-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-source-detail-back" onclick="{~P~}.views['Facto-Full-SourceDetail'].goBack()">
		&#8592; Back to Source Research
	</div>

	<div class="facto-content-header">
		<h1 id="Facto-SourceDetail-Title">Source</h1>
	</div>

	<div id="Facto-SourceDetail-Loading" style="color:var(--facto-text-secondary);">Loading source...</div>
	<div id="Facto-SourceDetail-Error" class="facto-status facto-status-error" style="display:none;"></div>

	<div id="Facto-SourceDetail-Container" style="display:none;">
		<div class="facto-record-meta" id="Facto-SourceDetail-Meta"></div>

		<div id="Facto-SourceDetail-ResearchContext"></div>

		<div class="facto-dataset-defs" id="Facto-SourceDetail-DatasetDefs"></div>

		<div class="facto-doc-section">
			<div class="facto-doc-section-header">
				<h2>Documentation</h2>
				<button class="facto-edit-toggle" id="Facto-SourceDetail-EditToggle" onclick="{~P~}.views['Facto-Full-SourceDetail'].toggleEditMode()">
					&#9998; Edit
				</button>
			</div>
			<div id="Facto-SourceDetail-DocListWrap"></div>
			<div id="Facto-SourceDetail-ContentWrap" style="display:none;">
				<div class="facto-doc-content-wrap" id="Facto-SourceDetail-ContentDisplay"></div>
			</div>
			<div id="Facto-SourceDetail-EditorWrap" style="display:none;">
				<div id="Facto-SourceDetail-EditorContainer"></div>
			</div>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-SourceDetail-Content",
			TemplateHash: "Facto-Full-SourceDetail-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullSourceDetailView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._CurrentIDSource = null;
		this._CurrentIDDoc = null;
		this._CurrentDocName = '';
		this._CurrentDocContent = '';
		this._Documentation = [];
		this._EditMode = false;
	}

	onBeforeInitialize()
	{
		super.onBeforeInitialize();

		// Register the Content provider for markdown rendering (read-only display)
		if (!this.pict.providers.PictContent)
		{
			this.pict.addProvider('PictContent', { ProviderIdentifier: 'PictContent' }, libPictSectionContent.PictContentProvider);
		}

		return true;
	}

	/**
	 * Navigate to a specific source, optionally opening a document.
	 */
	loadSource(pIDSource, pIDDoc)
	{
		this._CurrentIDSource = pIDSource;
		this._CurrentIDDoc = pIDDoc || null;
		this.render();
	}

	onAfterRender()
	{
		super.onAfterRender();

		if (!this._CurrentIDSource)
		{
			let tmpLoading = document.getElementById('Facto-SourceDetail-Loading');
			if (tmpLoading)
			{
				tmpLoading.textContent = 'No source selected.';
			}
			return;
		}

		this._fetchAndDisplaySource();
	}

	_fetchAndDisplaySource()
	{
		let tmpProvider = this.pict.providers.Facto;
		let tmpLoadingEl = document.getElementById('Facto-SourceDetail-Loading');
		let tmpErrorEl = document.getElementById('Facto-SourceDetail-Error');

		let tmpSummary = null;
		let tmpCatalogContext = null;
		let tmpDocumentation = null;

		let tmpSummaryPromise = tmpProvider.loadSourceSummary(this._CurrentIDSource);
		let tmpCatalogPromise = tmpProvider.loadSourceCatalogContext(this._CurrentIDSource);
		let tmpDocsPromise = tmpProvider.loadSourceDocumentation(this._CurrentIDSource);

		tmpSummaryPromise.then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
					if (tmpErrorEl)
					{
						tmpErrorEl.textContent = 'Error loading source: ' + pResponse.Error;
						tmpErrorEl.style.display = 'block';
					}
					return;
				}
				tmpSummary = pResponse;
			});

		tmpCatalogPromise.then(
			(pResponse) =>
			{
				tmpCatalogContext = pResponse || { CatalogEntries: [], DatasetDefinitions: [] };
			});

		tmpDocsPromise.then(
			(pResponse) =>
			{
				tmpDocumentation = (pResponse && pResponse.Documentation) ? pResponse.Documentation : [];
			});

		Promise.all([tmpSummaryPromise, tmpCatalogPromise, tmpDocsPromise]).then(
			() =>
			{
				if (!tmpSummary || !tmpSummary.Source)
				{
					if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
					if (tmpErrorEl)
					{
						tmpErrorEl.textContent = 'Source not found';
						tmpErrorEl.style.display = 'block';
					}
					return;
				}

				this._renderSourceDetail(tmpSummary, tmpCatalogContext, tmpDocumentation);
			}).catch(
			(pError) =>
			{
				if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
				if (tmpErrorEl)
				{
					tmpErrorEl.textContent = 'Error loading source: ' + (pError.message || pError);
					tmpErrorEl.style.display = 'block';
				}
			});
	}

	_renderSourceDetail(pSummary, pCatalogContext, pDocumentation)
	{
		let tmpLoadingEl = document.getElementById('Facto-SourceDetail-Loading');
		let tmpContainer = document.getElementById('Facto-SourceDetail-Container');
		let tmpTitleEl = document.getElementById('Facto-SourceDetail-Title');

		if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
		if (tmpContainer) tmpContainer.style.display = 'block';

		let tmpSource = pSummary.Source;

		// Title
		if (tmpTitleEl)
		{
			tmpTitleEl.textContent = (tmpSource.Hash || tmpSource.Name || ('Source #' + tmpSource.IDSource));
		}

		// Metadata cards
		let tmpMetaEl = document.getElementById('Facto-SourceDetail-Meta');
		if (tmpMetaEl)
		{
			tmpMetaEl.innerHTML = this._buildMetaCards(tmpSource, pSummary);
		}

		// Research context
		this._renderResearchContext(pCatalogContext);

		// Dataset definitions
		this._renderDatasetDefs(pCatalogContext);

		// Documentation list
		this._Documentation = pDocumentation;
		this._renderDocList();

		// Auto-open document if specified
		if (this._CurrentIDDoc)
		{
			this.selectDocument(this._CurrentIDDoc);
		}
	}

	_buildMetaCards(pSource, pSummary)
	{
		let tmpGUID = (pSource.GUIDSource || '').substring(0, 8) + '\u2026' + (pSource.GUIDSource || '').substring((pSource.GUIDSource || '').length - 4);
		let tmpActive = pSource.Active
			? '<span class="facto-badge facto-badge-success">Active</span>'
			: '<span class="facto-badge facto-badge-muted">Inactive</span>';

		let tmpHtml = '';

		// Source Identity card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Source Identity</h3>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">ID</span><span class="facto-record-meta-value">' + pSource.IDSource + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">GUID</span><span class="facto-record-meta-value">' + tmpGUID + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Hash</span><span class="facto-record-meta-value facto-hash-value">' + (pSource.Hash || '\u2014') + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Status</span><span class="facto-record-meta-value">' + tmpActive + '</span></div>';
		tmpHtml += '</div>';

		// Connection card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Connection</h3>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Name</span><span class="facto-record-meta-value">' + (pSource.Name || '\u2014') + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Type</span><span class="facto-record-meta-value">' + (pSource.Type || '\u2014') + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">URL</span><span class="facto-record-meta-value" title="' + (pSource.URL || '') + '">' + (pSource.URL || '\u2014') + '</span></div>';
		tmpHtml += '</div>';

		// Statistics card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Statistics</h3>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Records</span><span class="facto-record-meta-value">' + (pSummary.RecordCount || 0).toLocaleString() + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Datasets</span><span class="facto-record-meta-value">' + (pSummary.DatasetCount || 0) + '</span></div>';
		tmpHtml += '<div class="facto-record-meta-row"><span class="facto-record-meta-label">Documents</span><span class="facto-record-meta-value">' + (pSummary.DocumentationCount || 0) + '</span></div>';
		tmpHtml += '</div>';

		return tmpHtml;
	}

	_renderResearchContext(pCatalogContext)
	{
		let tmpEl = document.getElementById('Facto-SourceDetail-ResearchContext');
		if (!tmpEl) return;

		if (!pCatalogContext || !pCatalogContext.CatalogEntries || pCatalogContext.CatalogEntries.length === 0)
		{
			tmpEl.innerHTML = '';
			return;
		}

		let tmpHtml = '';
		for (let i = 0; i < pCatalogContext.CatalogEntries.length; i++)
		{
			let tmpEntry = pCatalogContext.CatalogEntries[i];
			tmpHtml += '<div class="facto-research-context">';
			tmpHtml += '<h3>Research Context' + (pCatalogContext.CatalogEntries.length > 1 ? ' (' + (i + 1) + ')' : '') + '</h3>';
			tmpHtml += '<div class="facto-research-context-detail">';
			tmpHtml += '<strong>Agency:</strong> ' + (tmpEntry.Agency || '\u2014');
			tmpHtml += ' &nbsp;\u00B7&nbsp; <strong>Category:</strong> ' + (tmpEntry.Category || '\u2014');
			tmpHtml += ' &nbsp;\u00B7&nbsp; <strong>Region:</strong> ' + (tmpEntry.Region || '\u2014');
			tmpHtml += ' &nbsp;\u00B7&nbsp; <strong>Update Frequency:</strong> ' + (tmpEntry.UpdateFrequency || '\u2014');
			tmpHtml += ' &nbsp;\u00B7&nbsp; <strong>Verified:</strong> ' + (tmpEntry.Verified ? 'Yes' : 'No');
			tmpHtml += '</div>';

			if (tmpEntry.Description)
			{
				tmpHtml += '<div class="facto-research-context-detail" style="margin-top:0.5em;">' + tmpEntry.Description + '</div>';
			}

			if (tmpEntry.Notes)
			{
				tmpHtml += '<div class="facto-research-context-note">' + tmpEntry.Notes + '</div>';
			}

			tmpHtml += '</div>';
		}

		tmpEl.innerHTML = tmpHtml;
	}

	_renderDatasetDefs(pCatalogContext)
	{
		let tmpEl = document.getElementById('Facto-SourceDetail-DatasetDefs');
		if (!tmpEl) return;

		if (!pCatalogContext || !pCatalogContext.DatasetDefinitions || pCatalogContext.DatasetDefinitions.length === 0)
		{
			tmpEl.innerHTML = '';
			return;
		}

		let tmpDefs = pCatalogContext.DatasetDefinitions;
		let tmpHtml = '<h2>Dataset Definitions</h2>';
		tmpHtml += '<table><thead><tr><th>Name</th><th>Format</th><th>Endpoint</th><th>Policy</th><th>Status</th></tr></thead><tbody>';

		for (let i = 0; i < tmpDefs.length; i++)
		{
			let tmpDef = tmpDefs[i];
			let tmpStatus = tmpDef.Provisioned
				? '<span class="facto-badge facto-badge-success">Provisioned</span>'
				: '<span class="facto-badge facto-badge-muted">Not provisioned</span>';

			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpDef.Name || '') + '</td>';
			tmpHtml += '<td><span class="facto-badge facto-badge-primary">' + (tmpDef.Format || '') + '</span></td>';
			tmpHtml += '<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpDef.EndpointURL || '') + '</td>';
			tmpHtml += '<td>' + (tmpDef.VersionPolicy || 'Append') + '</td>';
			tmpHtml += '<td>' + tmpStatus + '</td>';
			tmpHtml += '</tr>';
		}

		tmpHtml += '</tbody></table>';
		tmpEl.innerHTML = tmpHtml;
	}

	_renderDocList()
	{
		let tmpEl = document.getElementById('Facto-SourceDetail-DocListWrap');
		if (!tmpEl) return;

		let tmpHtml = '<div class="facto-doc-list">';

		// New Document button
		tmpHtml += '<div class="facto-doc-new-input" id="Facto-SourceDetail-NewDocWrap">';
		tmpHtml += '<input type="text" id="Facto-SourceDetail-NewDocName" placeholder="Document name...">';
		tmpHtml += '<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-SourceDetail\'].createDocument()">New Document</button>';
		tmpHtml += '</div>';

		tmpHtml += '</div>';

		// Document tabs
		if (this._Documentation && this._Documentation.length > 0)
		{
			tmpHtml += '<div class="facto-doc-list">';
			for (let i = 0; i < this._Documentation.length; i++)
			{
				let tmpDoc = this._Documentation[i];
				let tmpActiveClass = (this._CurrentIDDoc && parseInt(this._CurrentIDDoc, 10) === tmpDoc.IDSourceDocumentation) ? ' active' : '';
				tmpHtml += '<div class="facto-doc-item' + tmpActiveClass + '" onclick="pict.views[\'Facto-Full-SourceDetail\'].selectDocument(' + tmpDoc.IDSourceDocumentation + ')">';
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

		// Update URL hash without full re-render
		if (window.history && window.history.replaceState)
		{
			window.history.replaceState(null, '', '#/Source/' + this._CurrentIDSource + '/Doc/' + pIDDoc);
		}

		// Re-render doc list to highlight active
		this._renderDocList();

		tmpProvider.loadSourceDocument(this._CurrentIDSource, pIDDoc).then(
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
		let tmpContentWrap = document.getElementById('Facto-SourceDetail-ContentWrap');
		let tmpEditorWrap = document.getElementById('Facto-SourceDetail-EditorWrap');

		if (this._EditMode)
		{
			// Edit mode: show editor sub-view
			if (tmpContentWrap) tmpContentWrap.style.display = 'none';
			if (tmpEditorWrap) tmpEditorWrap.style.display = 'block';

			let tmpEditorView = this.pict.views['Facto-Full-SourceEditor'];
			if (tmpEditorView)
			{
				tmpEditorView.openEditor(this._CurrentIDSource, this._CurrentIDDoc, this._CurrentDocName, this._CurrentDocContent);
			}
		}
		else
		{
			// Read mode: show rendered content
			if (tmpEditorWrap) tmpEditorWrap.style.display = 'none';
			if (tmpContentWrap) tmpContentWrap.style.display = 'block';

			this._renderReadOnlyContent();
		}
	}

	_renderReadOnlyContent()
	{
		let tmpDisplayEl = document.getElementById('Facto-SourceDetail-ContentDisplay');
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
		let tmpToggleBtn = document.getElementById('Facto-SourceDetail-EditToggle');

		if (this._EditMode)
		{
			// Leaving edit mode: marshal content from editor sub-view
			let tmpEditorView = this.pict.views['Facto-Full-SourceEditor'];
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
			// Entering edit mode
			this._EditMode = true;
			if (tmpToggleBtn)
			{
				tmpToggleBtn.innerHTML = '&#10003; Done';
				tmpToggleBtn.classList.add('active');
			}
		}

		// Re-display current document in the new mode (if one is selected)
		if (this._CurrentIDDoc)
		{
			this._showDocument();
		}
	}

	createDocument()
	{
		let tmpNameInput = document.getElementById('Facto-SourceDetail-NewDocName');
		let tmpName = tmpNameInput ? tmpNameInput.value.trim() : '';
		if (!tmpName)
		{
			// Auto-number untitled docs based on existing ones
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
		tmpProvider.createSourceDocument(this._CurrentIDSource,
			{
				Name: tmpName,
				DocumentType: 'markdown',
				Content: '# ' + tmpName + '\n\n'
			}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success && pResponse.Documentation)
				{
					// Clear the input
					if (tmpNameInput) tmpNameInput.value = '';

					// Reload doc list and auto-select the new doc
					let tmpNewID = pResponse.Documentation.IDSourceDocumentation;
					return tmpProvider.loadSourceDocumentation(this._CurrentIDSource).then(
						(pDocsResponse) =>
						{
							this._Documentation = (pDocsResponse && pDocsResponse.Documentation) ? pDocsResponse.Documentation : [];
							this._renderDocList();
							this.selectDocument(tmpNewID);
						});
				}
			});
	}

	closeDocument()
	{
		let tmpEditorWrap = document.getElementById('Facto-SourceDetail-EditorWrap');
		let tmpContentWrap = document.getElementById('Facto-SourceDetail-ContentWrap');
		if (tmpEditorWrap) tmpEditorWrap.style.display = 'none';
		if (tmpContentWrap) tmpContentWrap.style.display = 'none';

		this._CurrentIDDoc = null;
		this._CurrentDocContent = '';

		// Update URL to remove doc reference
		if (window.history && window.history.replaceState)
		{
			window.history.replaceState(null, '', '#/Source/' + this._CurrentIDSource);
		}

		// Re-render doc list to clear active highlight
		this._renderDocList();
	}

	/**
	 * Called by the editor sub-view after a document name change on save.
	 */
	onDocumentNameChanged(pIDDoc, pNewName)
	{
		for (let i = 0; i < this._Documentation.length; i++)
		{
			if (this._Documentation[i].IDSourceDocumentation === parseInt(pIDDoc, 10))
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
		this.pict.PictApplication.navigateTo('/SourceResearch');
	}
}

module.exports = FactoFullSourceDetailView;

module.exports.default_configuration = _ViewConfiguration;
