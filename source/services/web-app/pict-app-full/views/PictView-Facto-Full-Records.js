const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Records",

	DefaultRenderable: "Facto-Full-Records-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-records-pager {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-bottom: 1em;
		}
		.facto-records-pager span {
			font-size: 0.85em;
			color: var(--facto-text-secondary);
		}
		.facto-record-data {
			max-width: 400px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.8em;
			color: var(--facto-text-secondary);
		}
		.facto-filter-bar {
			border: 1px solid var(--facto-border, #333);
			border-radius: 6px;
			padding: 1em;
			margin-bottom: 1em;
			background: var(--facto-bg-surface);
		}
		.facto-filter-bar h3 {
			margin: 0 0 0.75em 0;
			font-size: 0.9em;
			color: var(--facto-text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		.facto-filter-section {
			margin-bottom: 1em;
		}
		.facto-filter-section:last-child {
			margin-bottom: 0;
		}
		.facto-filter-label {
			display: block;
			font-size: 0.8em;
			color: var(--facto-text-secondary);
			margin-bottom: 0.4em;
			font-weight: 600;
		}
		.facto-source-checkboxes {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5em 1em;
			max-height: 120px;
			overflow-y: auto;
			padding: 0.25em 0;
		}
		.facto-source-checkboxes label {
			display: flex;
			align-items: center;
			gap: 0.35em;
			font-size: 0.85em;
			cursor: pointer;
			white-space: nowrap;
		}
		.facto-source-checkboxes input[type="checkbox"] {
			cursor: pointer;
		}
		.facto-source-toggle {
			font-size: 0.75em;
			color: var(--facto-link);
			cursor: pointer;
			margin-left: 0.5em;
			text-decoration: underline;
		}
		.facto-date-filters {
			display: flex;
			align-items: center;
			gap: 0.75em;
			flex-wrap: wrap;
		}
		.facto-date-filters input[type="text"] {
			padding: 0.35em 0.5em;
			font-size: 0.85em;
			border: 1px solid var(--facto-border);
			border-radius: 4px;
			background: var(--facto-bg-input);
			color: var(--facto-text);
			width: 160px;
			margin-bottom: 0;
		}
		.facto-date-filters span {
			font-size: 0.8em;
			color: var(--facto-text-secondary);
		}
		.facto-filter-actions {
			display: flex;
			gap: 0.5em;
			margin-top: 0.75em;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-Records-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Records</h1>
		<p>Browse ingested records across all datasets.</p>
	</div>

	<div class="facto-filter-bar">
		<h3>Filters</h3>

		<div class="facto-filter-section">
			<span class="facto-filter-label">
				Data Sources
				<span class="facto-source-toggle" onclick="{~P~}.views['Facto-Full-Records'].toggleAllSources(true)">All</span>
				<span class="facto-source-toggle" onclick="{~P~}.views['Facto-Full-Records'].toggleAllSources(false)">None</span>
			</span>
			<div id="Facto-Full-Records-SourceCheckboxes" class="facto-source-checkboxes">
				<span style="font-size:0.85em; color:var(--facto-text-secondary);">Loading sources...</span>
			</div>
		</div>

		<div class="facto-filter-section">
			<span class="facto-filter-label">Date Range (Ingest Date)</span>
			<div class="facto-date-filters">
				<span>From</span>
				<input type="text" id="Facto-Full-Records-DateFrom" placeholder="YYYY, YYYY-MM, or YYYY-MM-DD" />
				<span>To</span>
				<input type="text" id="Facto-Full-Records-DateTo" placeholder="YYYY, YYYY-MM, or YYYY-MM-DD" />
			</div>
		</div>

		<div class="facto-filter-actions">
			<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Records'].applyFilters()">Apply Filters</button>
			<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Records'].clearFilters()">Clear</button>
		</div>
	</div>

	<div class="facto-records-pager">
		<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Records'].prevPage()">Previous</button>
		<span id="Facto-Full-Records-PageInfo">Page 1</span>
		<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Records'].nextPage()">Next</button>
	</div>

	<div id="Facto-Full-Records-List"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Records-Content",
			TemplateHash: "Facto-Full-Records-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullRecordsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Load sources for the multiselect, then load records
		this.pict.providers.Facto.loadSources().then(
			() =>
			{
				this.renderSourceCheckboxes();
				this.loadCurrentPage();
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	renderSourceCheckboxes()
	{
		let tmpContainer = document.getElementById('Facto-Full-Records-SourceCheckboxes');
		if (!tmpContainer)
		{
			return;
		}

		let tmpSources = this.pict.AppData.Facto.Sources;
		if (!tmpSources || tmpSources.length === 0)
		{
			tmpContainer.innerHTML = '<span style="font-size:0.85em; color:var(--facto-text-secondary);">No sources available.</span>';
			return;
		}

		let tmpSelectedSources = this.pict.AppData.Facto.RecordFilterSources;
		let tmpHtml = '';
		for (let i = 0; i < tmpSources.length; i++)
		{
			let tmpSource = tmpSources[i];
			let tmpChecked = (tmpSelectedSources.length === 0 || tmpSelectedSources.indexOf(tmpSource.IDSource) >= 0) ? '' : '';
			let tmpLabel = tmpSource.Name || ('Source #' + tmpSource.IDSource);
			tmpHtml += '<label>';
			tmpHtml += '<input type="checkbox" class="facto-source-cb" value="' + tmpSource.IDSource + '"' + tmpChecked + ' />';
			tmpHtml += ' ' + tmpLabel;
			tmpHtml += '</label>';
		}
		tmpContainer.innerHTML = tmpHtml;
	}

	toggleAllSources(pChecked)
	{
		let tmpCheckboxes = document.querySelectorAll('.facto-source-cb');
		for (let i = 0; i < tmpCheckboxes.length; i++)
		{
			tmpCheckboxes[i].checked = pChecked;
		}
	}

	readFiltersFromDOM()
	{
		// Read selected sources from checkboxes
		let tmpSelectedSources = [];
		let tmpCheckboxes = document.querySelectorAll('.facto-source-cb:checked');
		for (let i = 0; i < tmpCheckboxes.length; i++)
		{
			tmpSelectedSources.push(parseInt(tmpCheckboxes[i].value, 10));
		}

		let tmpDateFrom = '';
		let tmpDateTo = '';
		let tmpDateFromEl = document.getElementById('Facto-Full-Records-DateFrom');
		let tmpDateToEl = document.getElementById('Facto-Full-Records-DateTo');
		if (tmpDateFromEl)
		{
			tmpDateFrom = tmpDateFromEl.value;
		}
		if (tmpDateToEl)
		{
			tmpDateTo = tmpDateToEl.value;
		}

		this.pict.AppData.Facto.RecordFilterSources = tmpSelectedSources;
		this.pict.AppData.Facto.RecordFilterDateFrom = tmpDateFrom;
		this.pict.AppData.Facto.RecordFilterDateTo = tmpDateTo;
	}

	hasActiveFilters()
	{
		let tmpData = this.pict.AppData.Facto;
		return (tmpData.RecordFilterSources.length > 0 ||
			tmpData.RecordFilterDateFrom ||
			tmpData.RecordFilterDateTo);
	}

	loadCurrentPage()
	{
		let tmpData = this.pict.AppData.Facto;
		if (this.hasActiveFilters())
		{
			this.pict.providers.Facto.loadFilteredRecords(
				tmpData.RecordPage,
				tmpData.RecordFilterSources,
				tmpData.RecordFilterDateFrom,
				tmpData.RecordFilterDateTo
			).then(() => { this.refreshList(); });
		}
		else
		{
			this.pict.providers.Facto.loadRecords(tmpData.RecordPage).then(
				() => { this.refreshList(); });
		}
	}

	applyFilters()
	{
		this.readFiltersFromDOM();
		this.pict.AppData.Facto.RecordPage = 0;
		this.loadCurrentPage();
	}

	clearFilters()
	{
		this.pict.AppData.Facto.RecordFilterSources = [];
		this.pict.AppData.Facto.RecordFilterDateFrom = '';
		this.pict.AppData.Facto.RecordFilterDateTo = '';
		this.pict.AppData.Facto.RecordPage = 0;

		// Clear DOM inputs
		let tmpDateFromEl = document.getElementById('Facto-Full-Records-DateFrom');
		let tmpDateToEl = document.getElementById('Facto-Full-Records-DateTo');
		if (tmpDateFromEl)
		{
			tmpDateFromEl.value = '';
		}
		if (tmpDateToEl)
		{
			tmpDateToEl.value = '';
		}

		// Uncheck all source checkboxes
		let tmpCheckboxes = document.querySelectorAll('.facto-source-cb');
		for (let i = 0; i < tmpCheckboxes.length; i++)
		{
			tmpCheckboxes[i].checked = false;
		}

		this.loadCurrentPage();
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Records-List');
		if (!tmpContainer) return;

		let tmpRecords = this.pict.AppData.Facto.Records;
		let tmpPageInfo = document.getElementById('Facto-Full-Records-PageInfo');
		if (tmpPageInfo) tmpPageInfo.textContent = 'Page ' + ((this.pict.AppData.Facto.RecordPage || 0) + 1);

		if (!tmpRecords || tmpRecords.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No records found. Ingest data via Source Research or the Ingest API.</div>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Dataset</th><th>Source</th><th>GUID</th><th>Data</th><th></th></tr></thead><tbody>';
		for (let i = 0; i < tmpRecords.length; i++)
		{
			let tmpRec = tmpRecords[i];
			let tmpData = '';
			try { tmpData = JSON.stringify(JSON.parse(tmpRec.Content || '{}'));  }
			catch(e) { tmpData = tmpRec.Content || ''; }

			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpRec.IDRecord || '') + '</td>';
			tmpHtml += '<td>' + (tmpRec.IDDataset || '') + '</td>';
			tmpHtml += '<td>' + (tmpRec.IDSource || '') + '</td>';
			tmpHtml += '<td style="font-size:0.8em; color:var(--facto-text-tertiary);">' + (tmpRec.GUIDRecord || '').substring(0, 8) + '...</td>';
			tmpHtml += '<td class="facto-record-data">' + tmpData + '</td>';
			tmpHtml += '<td><button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Record/' + tmpRec.IDRecord + '\')">View</button></td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	prevPage()
	{
		if (this.pict.AppData.Facto.RecordPage > 0)
		{
			this.pict.AppData.Facto.RecordPage--;
			this.loadCurrentPage();
		}
	}

	nextPage()
	{
		this.pict.AppData.Facto.RecordPage++;
		this.loadCurrentPage();
	}
}

module.exports = FactoFullRecordsView;

module.exports.default_configuration = _ViewConfiguration;
