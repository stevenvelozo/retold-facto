const libPictView = require('pict-view');
const libPictSectionObjectEditor = require('pict-section-objecteditor');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-RecordViewer",

	DefaultRenderable: "Facto-Full-RecordViewer-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-record-viewer-back {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			color: var(--facto-text-secondary);
			cursor: pointer;
			font-size: 0.85em;
			margin-bottom: 0.75em;
			transition: color 0.15s;
		}
		.facto-record-viewer-back:hover {
			color: var(--facto-brand);
		}
		.facto-record-meta {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
			gap: 1em;
			margin-bottom: 1.5em;
		}
		.facto-record-meta-card {
			background: var(--facto-bg-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 8px;
			padding: 1em;
		}
		.facto-record-meta-card h3 {
			margin: 0 0 0.5em;
			font-size: 0.75em;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--facto-text-tertiary, #888);
		}
		.facto-record-meta-row {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			padding: 0.2em 0;
			font-size: 0.85em;
		}
		.facto-record-meta-label {
			color: var(--facto-text-secondary, #aaa);
			flex-shrink: 0;
			margin-right: 0.75em;
		}
		.facto-record-meta-value {
			color: var(--facto-text-heading, #eee);
			text-align: right;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.9em;
		}
		.facto-record-meta-value.facto-hash-value {
			color: var(--facto-brand, #4a90d9);
		}
		.facto-record-certainty-bar {
			height: 6px;
			background: var(--facto-border-subtle, #2a2e3a);
			border-radius: 3px;
			margin-top: 0.35em;
			overflow: hidden;
		}
		.facto-record-certainty-fill {
			height: 100%;
			border-radius: 3px;
			transition: width 0.3s;
		}
		.facto-record-content-section {
			margin-top: 1.5em;
		}
		.facto-record-content-section h2 {
			font-size: 1em;
			margin: 0 0 0.75em;
			color: var(--facto-text-secondary, #aaa);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		/* Override ObjectEditor styles for dark theme compatibility */
		.facto-record-content-section .pict-objecteditor {
			background: var(--facto-bg-elevated, #1a1e2a);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-heading, #eee);
		}
		.facto-record-content-section .pict-oe-row:hover {
			background: var(--facto-table-row-hover, #222738);
		}
		.facto-record-content-section .pict-oe-key {
			color: var(--facto-brand, #4a90d9);
		}
		.facto-record-content-section .pict-oe-separator {
			color: var(--facto-text-tertiary, #888);
		}
		.facto-record-content-section .pict-oe-value-string {
			color: #2ee6a8;
		}
		.facto-record-content-section .pict-oe-value-string::before,
		.facto-record-content-section .pict-oe-value-string::after {
			color: #1a8a66;
		}
		.facto-record-content-section .pict-oe-value-number {
			color: #d4a0ff;
		}
		.facto-record-content-section .pict-oe-value-boolean {
			color: #ffb347;
		}
		.facto-record-content-section .pict-oe-value-null {
			color: var(--facto-text-tertiary, #666);
		}
		.facto-record-content-section .pict-oe-summary {
			color: var(--facto-text-tertiary, #666);
		}
		.facto-record-content-section .pict-oe-toggle {
			color: var(--facto-text-secondary, #aaa);
		}
		.facto-record-content-section .pict-oe-toggle:hover {
			color: var(--facto-brand, #4a90d9);
			background: var(--facto-table-row-hover, #222738);
		}
		.facto-record-content-section .pict-oe-type-badge {
			background: var(--facto-table-row-hover, #222738);
			color: var(--facto-text-tertiary, #888);
		}
		.facto-record-content-section .pict-oe-empty {
			color: var(--facto-text-tertiary, #666);
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-RecordViewer-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-record-viewer-back" onclick="{~P~}.views['Facto-Full-RecordViewer'].goBack()">
		&#8592; Back to Records
	</div>

	<div class="facto-content-header">
		<h1 id="Facto-RecordViewer-Title">Record</h1>
	</div>

	<div id="Facto-RecordViewer-Loading" style="color:var(--facto-text-secondary);">Loading record...</div>
	<div id="Facto-RecordViewer-Error" class="facto-status facto-status-error" style="display:none;"></div>

	<div id="Facto-RecordViewer-MetaContainer" style="display:none;">
		<div class="facto-record-meta" id="Facto-RecordViewer-Meta"></div>

		<div class="facto-record-content-section">
			<h2>Record Content</h2>
			<div id="Facto-RecordViewer-ObjectEditor-Container"></div>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-RecordViewer-Content",
			TemplateHash: "Facto-Full-RecordViewer-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullRecordViewerView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._CurrentIDRecord = null;
		this._ObjectEditorView = null;
	}

	onBeforeInitialize()
	{
		super.onBeforeInitialize();

		// Register the ObjectEditor view type if it isn't already present
		if (!this.fable.servicesMap.hasOwnProperty('PictViewObjectEditor'))
		{
			this.fable.addServiceType('PictViewObjectEditor', libPictSectionObjectEditor);
		}

		return true;
	}

	/**
	 * Navigate to a specific record by ID.
	 */
	loadRecord(pIDRecord)
	{
		this._CurrentIDRecord = pIDRecord;
		this.render();
	}

	onAfterRender()
	{
		super.onAfterRender();

		if (!this._CurrentIDRecord)
		{
			let tmpLoading = document.getElementById('Facto-RecordViewer-Loading');
			if (tmpLoading)
			{
				tmpLoading.textContent = 'No record selected.';
			}
			return;
		}

		this._fetchAndDisplayRecord(this._CurrentIDRecord);
	}

	_fetchAndDisplayRecord(pIDRecord)
	{
		let tmpProvider = this.pict.providers.Facto;
		let tmpLoadingEl = document.getElementById('Facto-RecordViewer-Loading');
		let tmpErrorEl = document.getElementById('Facto-RecordViewer-Error');
		let tmpMetaContainer = document.getElementById('Facto-RecordViewer-MetaContainer');

		// Fetch the record, its source, its dataset, and certainty in parallel
		let tmpRecord = null;
		let tmpSource = null;
		let tmpDataset = null;
		let tmpCertainty = null;
		let tmpIngestJob = null;

		let tmpRecordPromise = tmpProvider.api('GET', '/1.0/Record/' + pIDRecord);
		let tmpCertaintyPromise = tmpProvider.api('GET', '/facto/record/' + pIDRecord + '/certainty');

		tmpRecordPromise.then(
			(pRecordResponse) =>
			{
				if (pRecordResponse && pRecordResponse.Error)
				{
					if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
					if (tmpErrorEl)
					{
						tmpErrorEl.textContent = 'Error loading record: ' + pRecordResponse.Error;
						tmpErrorEl.style.display = 'block';
					}
					return;
				}

				tmpRecord = pRecordResponse;

				// Now fetch the related source, dataset, and ingest job
				let tmpFetches = [];

				if (tmpRecord.IDSource)
				{
					tmpFetches.push(
						tmpProvider.api('GET', '/1.0/Source/' + tmpRecord.IDSource).then(
							(pResp) => { tmpSource = pResp; }));
				}
				if (tmpRecord.IDDataset)
				{
					tmpFetches.push(
						tmpProvider.api('GET', '/1.0/Dataset/' + tmpRecord.IDDataset).then(
							(pResp) => { tmpDataset = pResp; }));
				}
				if (tmpRecord.IDIngestJob)
				{
					tmpFetches.push(
						tmpProvider.api('GET', '/facto/ingest/job/' + tmpRecord.IDIngestJob).then(
							(pResp) => { tmpIngestJob = pResp; }));
				}

				return Promise.all(tmpFetches).then(
					() =>
					{
						return tmpCertaintyPromise;
					}).then(
					(pCertaintyResponse) =>
					{
						tmpCertainty = pCertaintyResponse;
						this._renderRecordDetail(tmpRecord, tmpSource, tmpDataset, tmpCertainty, tmpIngestJob);
					});
			}).catch(
			(pError) =>
			{
				if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
				if (tmpErrorEl)
				{
					tmpErrorEl.textContent = 'Error loading record: ' + (pError.message || pError);
					tmpErrorEl.style.display = 'block';
				}
			});
	}

	_renderRecordDetail(pRecord, pSource, pDataset, pCertainty, pIngestJob)
	{
		let tmpLoadingEl = document.getElementById('Facto-RecordViewer-Loading');
		let tmpMetaContainer = document.getElementById('Facto-RecordViewer-MetaContainer');
		let tmpTitleEl = document.getElementById('Facto-RecordViewer-Title');

		if (tmpLoadingEl) tmpLoadingEl.style.display = 'none';
		if (tmpMetaContainer) tmpMetaContainer.style.display = 'block';

		// Title
		if (tmpTitleEl)
		{
			let tmpTitle = 'Record #' + pRecord.IDRecord;
			if (pDataset && pDataset.Hash)
			{
				tmpTitle += ' \u2014 ' + pDataset.Hash;
			}
			tmpTitleEl.textContent = tmpTitle;
		}

		// Build metadata cards
		let tmpMetaEl = document.getElementById('Facto-RecordViewer-Meta');
		if (tmpMetaEl)
		{
			tmpMetaEl.innerHTML = this._buildMetaCards(pRecord, pSource, pDataset, pCertainty, pIngestJob);
		}

		// Parse the Content JSON and render via ObjectEditor
		let tmpContentData = {};
		if (pRecord.Content)
		{
			try
			{
				tmpContentData = JSON.parse(pRecord.Content);
			}
			catch (e)
			{
				tmpContentData = { '_raw': pRecord.Content };
			}
		}

		// Store the parsed content in AppData so the ObjectEditor can find it
		this.pict.AppData.Facto.CurrentRecordContent = tmpContentData;

		// Create or re-render the ObjectEditor
		this._renderObjectEditor();
	}

	_renderObjectEditor()
	{
		let tmpEditorContainerId = 'Facto-RecordViewer-ObjectEditor-Container';
		let tmpViewHash = 'Facto-RecordViewer-ObjectEditor';

		// If we already created this view, just re-render
		if (this.pict.views[tmpViewHash])
		{
			this.pict.views[tmpViewHash].render();
			return;
		}

		// Create a new ObjectEditor view instance
		let tmpEditorConfig =
		{
			ViewIdentifier: tmpViewHash,
			DefaultDestinationAddress: '#' + tmpEditorContainerId,
			ObjectDataAddress: 'AppData.Facto.CurrentRecordContent',
			InitialExpandDepth: 2,
			Editable: false,
			ShowTypeIndicators: true,
			IndentPixels: 20,
			Renderables:
			[
				{
					RenderableHash: 'ObjectEditor-Container',
					TemplateHash: 'ObjectEditor-Container-Template',
					DestinationAddress: '#' + tmpEditorContainerId,
					RenderMethod: 'replace'
				}
			]
		};

		this.pict.addView(tmpViewHash, tmpEditorConfig, libPictSectionObjectEditor);

		// The ObjectEditor registers node renderers in onBeforeInitialize.
		// Since this view is created dynamically (after the app init cycle),
		// we must explicitly trigger initialization before the first render.
		let tmpEditorView = this.pict.views[tmpViewHash];
		tmpEditorView.onBeforeInitialize();
		tmpEditorView.render();
	}

	_buildMetaCards(pRecord, pSource, pDataset, pCertainty, pIngestJob)
	{
		let tmpHtml = '';

		// Record Identity card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Record Identity</h3>';
		tmpHtml += this._metaRow('ID', pRecord.IDRecord);
		tmpHtml += this._metaRow('GUID', pRecord.GUIDRecord, true);
		tmpHtml += this._metaRow('Type', pRecord.Type || '\u2014');
		tmpHtml += this._metaRow('Version', pRecord.Version || 1);
		tmpHtml += '</div>';

		// Source card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Source</h3>';
		if (pSource && !pSource.Error)
		{
			tmpHtml += this._metaRow('Name', pSource.Name || '\u2014');
			tmpHtml += this._metaRow('Hash', pSource.Hash || '\u2014', false, true);
			tmpHtml += this._metaRow('Type', pSource.Type || '\u2014');
			if (pSource.URL)
			{
				tmpHtml += this._metaRow('URL', pSource.URL);
			}
		}
		else
		{
			tmpHtml += this._metaRow('ID', pRecord.IDSource || 0);
		}
		tmpHtml += '</div>';

		// Dataset card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Dataset</h3>';
		if (pDataset && !pDataset.Error)
		{
			tmpHtml += this._metaRow('Name', pDataset.Name || '\u2014');
			tmpHtml += this._metaRow('Hash', pDataset.Hash || '\u2014', false, true);
			tmpHtml += this._metaRow('Type', pDataset.Type || '\u2014');
			tmpHtml += this._metaRow('Version Policy', pDataset.VersionPolicy || '\u2014');
		}
		else
		{
			tmpHtml += this._metaRow('ID', pRecord.IDDataset || 0);
		}
		tmpHtml += '</div>';

		// Ingest Metadata card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Ingest Metadata</h3>';
		tmpHtml += this._metaRow('Ingest Date', this._formatDate(pRecord.IngestDate));
		tmpHtml += this._metaRow('Ingest Job', pRecord.IDIngestJob || '\u2014');
		if (pIngestJob && pIngestJob.Job)
		{
			tmpHtml += this._metaRow('Job Status', pIngestJob.Job.Status || '\u2014');
		}
		tmpHtml += this._metaRow('Created', this._formatDate(pRecord.CreateDate));
		if (pRecord.OriginCreateDate)
		{
			tmpHtml += this._metaRow('Origin Date', this._formatDate(pRecord.OriginCreateDate));
		}
		tmpHtml += '</div>';

		// Schema card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Schema</h3>';
		tmpHtml += this._metaRow('Schema Hash', pRecord.SchemaHash || '\u2014');
		tmpHtml += this._metaRow('Schema Version', pRecord.SchemaVersion || 0);
		tmpHtml += '</div>';

		// Certainty card
		tmpHtml += '<div class="facto-record-meta-card">';
		tmpHtml += '<h3>Certainty</h3>';
		if (pCertainty && pCertainty.CertaintyIndices && pCertainty.CertaintyIndices.length > 0)
		{
			for (let i = 0; i < pCertainty.CertaintyIndices.length; i++)
			{
				let tmpCI = pCertainty.CertaintyIndices[i];
				let tmpPct = Math.round((tmpCI.CertaintyValue || 0) * 100);
				let tmpBarColor = tmpPct >= 70 ? '#28a745' : tmpPct >= 40 ? '#ffc107' : '#dc3545';
				tmpHtml += this._metaRow(tmpCI.Dimension || 'overall', tmpPct + '%');
				tmpHtml += '<div class="facto-record-certainty-bar"><div class="facto-record-certainty-fill" style="width:' + tmpPct + '%; background:' + tmpBarColor + ';"></div></div>';
				if (tmpCI.Justification)
				{
					tmpHtml += '<div style="font-size:0.75em; color:var(--facto-text-tertiary); margin-top:0.15em;">' + this._escapeHtml(tmpCI.Justification) + '</div>';
				}
			}
		}
		else
		{
			tmpHtml += '<div style="color:var(--facto-text-tertiary); font-size:0.85em;">No certainty data</div>';
		}
		tmpHtml += '</div>';

		return tmpHtml;
	}

	_metaRow(pLabel, pValue, pIsGuid, pIsHash)
	{
		let tmpDisplayValue = this._escapeHtml(String(pValue || ''));
		if (pIsGuid && tmpDisplayValue.length > 16)
		{
			tmpDisplayValue = '<span title="' + tmpDisplayValue + '">' + tmpDisplayValue.substring(0, 8) + '\u2026' + tmpDisplayValue.substring(tmpDisplayValue.length - 4) + '</span>';
		}
		let tmpValueClass = 'facto-record-meta-value';
		if (pIsHash)
		{
			tmpValueClass += ' facto-hash-value';
		}
		return '<div class="facto-record-meta-row"><span class="facto-record-meta-label">' + this._escapeHtml(pLabel) + '</span><span class="' + tmpValueClass + '">' + tmpDisplayValue + '</span></div>';
	}

	_formatDate(pDateStr)
	{
		if (!pDateStr) return '\u2014';
		try
		{
			// SQLite datetimes (e.g. "2026-03-15 19:07:43") lack a timezone
			// indicator, so new Date() would treat them as local time.
			// Append 'Z' to interpret them as UTC, matching ISO timestamps.
			let tmpNormalized = pDateStr;
			if (typeof tmpNormalized === 'string' && !tmpNormalized.endsWith('Z') && !tmpNormalized.match(/[+-]\d{2}:\d{2}$/))
			{
				tmpNormalized = tmpNormalized.replace(' ', 'T') + 'Z';
			}
			let tmpDate = new Date(tmpNormalized);
			return tmpDate.toLocaleString();
		}
		catch (e)
		{
			return pDateStr;
		}
	}

	_escapeHtml(pStr)
	{
		return pStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	goBack()
	{
		this.pict.PictApplication.navigateTo('/Records');
	}
}

module.exports = FactoFullRecordViewerView;

module.exports.default_configuration = _ViewConfiguration;
