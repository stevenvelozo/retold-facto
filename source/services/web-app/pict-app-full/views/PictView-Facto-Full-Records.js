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
		.facto-source-toggle {
			font-size: 0.75em;
			color: var(--facto-link);
			cursor: pointer;
			margin-left: 0.5em;
			text-decoration: underline;
		}
		.facto-filter-list {
			border: 1px solid var(--facto-border);
			border-radius: 4px;
			max-height: 200px;
			overflow-y: auto;
			background: var(--facto-bg-input);
		}
		.facto-filter-list-item {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0.4em 0.75em;
			cursor: pointer;
			font-size: 0.85em;
			color: var(--facto-text);
			border-left: 3px solid transparent;
			transition: background-color 0.15s, border-color 0.15s;
			user-select: none;
		}
		.facto-filter-list-item:hover {
			background: var(--facto-bg-elevated);
		}
		.facto-filter-list-item.selected {
			background: color-mix(in srgb, var(--facto-brand) 15%, transparent);
			border-left-color: var(--facto-brand);
			font-weight: 600;
		}
		.facto-filter-list-item + .facto-filter-list-item {
			border-top: 1px solid var(--facto-border-subtle, var(--facto-border));
		}
		.facto-filter-count {
			font-size: 0.8em;
			color: var(--facto-text-tertiary);
			margin-left: 1em;
			white-space: nowrap;
		}
		.facto-filter-list-item.selected .facto-filter-count {
			color: var(--facto-text-secondary);
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
			<div id="Facto-Full-Records-SourceList" class="facto-filter-list">
				<div class="facto-filter-list-item" style="color:var(--facto-text-secondary); cursor:default;">Loading sources\u2026</div>
			</div>
		</div>

		<div class="facto-filter-section">
			<span class="facto-filter-label">
				Projections (Datasets)
				<span class="facto-source-toggle" onclick="{~P~}.views['Facto-Full-Records'].toggleAllDatasets(true)">All</span>
				<span class="facto-source-toggle" onclick="{~P~}.views['Facto-Full-Records'].toggleAllDatasets(false)">None</span>
			</span>
			<div id="Facto-Full-Records-DatasetList" class="facto-filter-list">
				<div class="facto-filter-list-item" style="color:var(--facto-text-secondary); cursor:default;">Loading datasets\u2026</div>
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
		// Load sources and datasets, then render lists and load records
		Promise.all([
			this.pict.providers.Facto.loadSources(),
			this.pict.providers.Facto.loadDatasets()
		]).then(
			() =>
			{
				this.renderSourceList();
				this.renderDatasetList();

				// Restore filter UI state from AppData (populated by URL route handler)
				this._restoreFilterUIFromState();

				this.loadCurrentPage();

				// Load counts in the background and update badges when ready
				this.pict.providers.Facto.loadSourceCounts().then(
					() => { this.updateSourceCounts(); });
				this.pict.providers.Facto.loadDatasetCounts().then(
					() => { this.updateDatasetCounts(); });
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	/**
	 * Restore filter UI checkboxes and date inputs from AppData state.
	 * Called after source/dataset lists are rendered so DOM elements exist.
	 */
	_restoreFilterUIFromState()
	{
		let tmpData = this.pict.AppData.Facto;

		// Restore selected sources
		if (tmpData.RecordFilterSources && tmpData.RecordFilterSources.length > 0)
		{
			let tmpSourceItems = document.querySelectorAll('#Facto-Full-Records-SourceList .facto-filter-list-item');
			for (let i = 0; i < tmpSourceItems.length; i++)
			{
				let tmpID = parseInt(tmpSourceItems[i].getAttribute('data-id'), 10);
				if (tmpData.RecordFilterSources.indexOf(tmpID) >= 0)
				{
					tmpSourceItems[i].classList.add('selected');
				}
			}
		}

		// Restore selected datasets
		if (tmpData.RecordFilterDatasets && tmpData.RecordFilterDatasets.length > 0)
		{
			let tmpDatasetItems = document.querySelectorAll('#Facto-Full-Records-DatasetList .facto-filter-list-item');
			for (let i = 0; i < tmpDatasetItems.length; i++)
			{
				let tmpID = parseInt(tmpDatasetItems[i].getAttribute('data-id'), 10);
				if (tmpData.RecordFilterDatasets.indexOf(tmpID) >= 0)
				{
					tmpDatasetItems[i].classList.add('selected');
				}
			}
		}

		// Restore date inputs
		if (tmpData.RecordFilterDateFrom)
		{
			let tmpEl = document.getElementById('Facto-Full-Records-DateFrom');
			if (tmpEl) tmpEl.value = tmpData.RecordFilterDateFrom;
		}
		if (tmpData.RecordFilterDateTo)
		{
			let tmpEl = document.getElementById('Facto-Full-Records-DateTo');
			if (tmpEl) tmpEl.value = tmpData.RecordFilterDateTo;
		}
	}

	renderSourceList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Records-SourceList');
		if (!tmpContainer)
		{
			return;
		}

		let tmpSources = this.pict.AppData.Facto.Sources;
		if (!tmpSources || tmpSources.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-filter-list-item" style="color:var(--facto-text-secondary); cursor:default;">No sources available.</div>';
			return;
		}

		let tmpHtml = '';
		for (let i = 0; i < tmpSources.length; i++)
		{
			let tmpSource = tmpSources[i];
			let tmpLabel = tmpSource.Name || ('Source #' + tmpSource.IDSource);
			let tmpCount = (typeof tmpSource.RecordCount !== 'undefined') ? tmpSource.RecordCount.toLocaleString() : '\u2026';
			tmpHtml += '<div class="facto-filter-list-item" data-id="' + tmpSource.IDSource + '" onclick="pict.views[\'Facto-Full-Records\'].toggleListItem(this)">';
			tmpHtml += '<span class="facto-filter-list-name">' + tmpLabel + '</span>';
			tmpHtml += '<span class="facto-filter-count">(' + tmpCount + ')</span>';
			tmpHtml += '</div>';
		}
		tmpContainer.innerHTML = tmpHtml;
	}

	renderDatasetList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Records-DatasetList');
		if (!tmpContainer)
		{
			return;
		}

		let tmpDatasets = this.pict.AppData.Facto.Datasets;
		if (!tmpDatasets || tmpDatasets.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-filter-list-item" style="color:var(--facto-text-secondary); cursor:default;">No datasets available.</div>';
			return;
		}

		let tmpHtml = '';
		for (let i = 0; i < tmpDatasets.length; i++)
		{
			let tmpDataset = tmpDatasets[i];
			let tmpLabel = tmpDataset.Name || ('Dataset #' + tmpDataset.IDDataset);
			let tmpCount = (typeof tmpDataset.RecordCount !== 'undefined') ? tmpDataset.RecordCount.toLocaleString() : '\u2026';
			tmpHtml += '<div class="facto-filter-list-item" data-id="' + tmpDataset.IDDataset + '" onclick="pict.views[\'Facto-Full-Records\'].toggleListItem(this)">';
			tmpHtml += '<span class="facto-filter-list-name">' + tmpLabel + '</span>';
			tmpHtml += '<span class="facto-filter-count">(' + tmpCount + ')</span>';
			tmpHtml += '</div>';
		}
		tmpContainer.innerHTML = tmpHtml;
	}

	updateSourceCounts()
	{
		let tmpContainer = document.getElementById('Facto-Full-Records-SourceList');
		if (!tmpContainer)
		{
			return;
		}
		let tmpSources = this.pict.AppData.Facto.Sources;
		if (!tmpSources)
		{
			return;
		}
		let tmpItems = tmpContainer.querySelectorAll('.facto-filter-list-item');
		for (let i = 0; i < tmpItems.length; i++)
		{
			let tmpID = parseInt(tmpItems[i].getAttribute('data-id'), 10);
			for (let j = 0; j < tmpSources.length; j++)
			{
				if (tmpSources[j].IDSource === tmpID)
				{
					let tmpCountEl = tmpItems[i].querySelector('.facto-filter-count');
					if (tmpCountEl)
					{
						tmpCountEl.textContent = '(' + tmpSources[j].RecordCount.toLocaleString() + ')';
					}
					break;
				}
			}
		}
	}

	updateDatasetCounts()
	{
		let tmpContainer = document.getElementById('Facto-Full-Records-DatasetList');
		if (!tmpContainer)
		{
			return;
		}
		let tmpDatasets = this.pict.AppData.Facto.Datasets;
		if (!tmpDatasets)
		{
			return;
		}
		let tmpItems = tmpContainer.querySelectorAll('.facto-filter-list-item');
		for (let i = 0; i < tmpItems.length; i++)
		{
			let tmpID = parseInt(tmpItems[i].getAttribute('data-id'), 10);
			for (let j = 0; j < tmpDatasets.length; j++)
			{
				if (tmpDatasets[j].IDDataset === tmpID)
				{
					let tmpCountEl = tmpItems[i].querySelector('.facto-filter-count');
					if (tmpCountEl)
					{
						tmpCountEl.textContent = '(' + tmpDatasets[j].RecordCount.toLocaleString() + ')';
					}
					break;
				}
			}
		}
	}

	toggleListItem(pElement)
	{
		if (pElement)
		{
			pElement.classList.toggle('selected');
		}
	}

	toggleAllSources(pSelected)
	{
		let tmpItems = document.querySelectorAll('#Facto-Full-Records-SourceList .facto-filter-list-item');
		for (let i = 0; i < tmpItems.length; i++)
		{
			if (pSelected)
			{
				tmpItems[i].classList.add('selected');
			}
			else
			{
				tmpItems[i].classList.remove('selected');
			}
		}
	}

	toggleAllDatasets(pSelected)
	{
		let tmpItems = document.querySelectorAll('#Facto-Full-Records-DatasetList .facto-filter-list-item');
		for (let i = 0; i < tmpItems.length; i++)
		{
			if (pSelected)
			{
				tmpItems[i].classList.add('selected');
			}
			else
			{
				tmpItems[i].classList.remove('selected');
			}
		}
	}

	readFiltersFromDOM()
	{
		// Read selected sources from list items
		let tmpSelectedSources = [];
		let tmpSourceItems = document.querySelectorAll('#Facto-Full-Records-SourceList .facto-filter-list-item.selected');
		for (let i = 0; i < tmpSourceItems.length; i++)
		{
			tmpSelectedSources.push(parseInt(tmpSourceItems[i].getAttribute('data-id'), 10));
		}

		// Read selected datasets from list items
		let tmpSelectedDatasets = [];
		let tmpDatasetItems = document.querySelectorAll('#Facto-Full-Records-DatasetList .facto-filter-list-item.selected');
		for (let i = 0; i < tmpDatasetItems.length; i++)
		{
			tmpSelectedDatasets.push(parseInt(tmpDatasetItems[i].getAttribute('data-id'), 10));
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
		this.pict.AppData.Facto.RecordFilterDatasets = tmpSelectedDatasets;
		this.pict.AppData.Facto.RecordFilterDateFrom = tmpDateFrom;
		this.pict.AppData.Facto.RecordFilterDateTo = tmpDateTo;
	}

	hasActiveFilters()
	{
		let tmpData = this.pict.AppData.Facto;
		return (tmpData.RecordFilterSources.length > 0 ||
			tmpData.RecordFilterDatasets.length > 0 ||
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
				tmpData.RecordFilterDateTo,
				tmpData.RecordFilterDatasets
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
		let tmpData = this.pict.AppData.Facto;
		let tmpProvider = this.pict.providers.Facto;

		// Build filter objects from current UI state
		let tmpFilters = tmpProvider.buildRecordFiltersFromState(
			tmpData.RecordFilterSources,
			tmpData.RecordFilterDatasets,
			tmpData.RecordFilterDateFrom,
			tmpData.RecordFilterDateTo
		);

		// Navigate to the filtered URL (this triggers the route handler which loads data)
		let tmpRoute = tmpProvider.buildRecordsFilterRoute(tmpFilters, 0);
		this.pict.PictApplication.navigateTo(tmpRoute);
	}

	clearFilters()
	{
		this.pict.AppData.Facto.RecordFilterSources = [];
		this.pict.AppData.Facto.RecordFilterDatasets = [];
		this.pict.AppData.Facto.RecordFilterDateFrom = '';
		this.pict.AppData.Facto.RecordFilterDateTo = '';
		this.pict.AppData.Facto.RecordPage = 0;
		this.pict.AppData.Facto.RecordFilterString = '';

		// Navigate to unfiltered Records (clears the URL)
		this.pict.PictApplication.navigateTo('/Records');
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
			if (tmpRec.Type === 'projection')
			{
				// Projection records: show content in a modal or expand inline
				let tmpSafeContent = (tmpRec.Content || '').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
				tmpHtml += '<td><button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Records\'].viewProjectionRecord(' + tmpRec.IDRecord + ',' + tmpRec.IDDataset + ')">View</button></td>';
			}
			else
			{
				tmpHtml += '<td><button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Record/' + tmpRec.IDRecord + '\')">View</button></td>';
			}
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	viewProjectionRecord(pIDRecord, pIDDataset)
	{
		let tmpDatasets = this.pict.AppData.Facto.Datasets || [];
		let tmpDataset = tmpDatasets.find(function(d) { return d.IDDataset === pIDDataset; });
		if (!tmpDataset) return;

		this.pict.PictApplication.navigateTo('/Projection/' + tmpDataset.Name + '/Record/' + pIDRecord);
	}

	prevPage()
	{
		if (this.pict.AppData.Facto.RecordPage > 0)
		{
			this.pict.AppData.Facto.RecordPage--;
			this._navigateToCurrentFilter();
		}
	}

	nextPage()
	{
		this.pict.AppData.Facto.RecordPage++;
		this._navigateToCurrentFilter();
	}

	/**
	 * Navigate to the current filter + page state as a URL.
	 * Used by pagination and any action that changes page but not filters.
	 */
	_navigateToCurrentFilter()
	{
		let tmpData = this.pict.AppData.Facto;

		if (this.hasActiveFilters())
		{
			let tmpProvider = this.pict.providers.Facto;
			let tmpFilters = tmpProvider.buildRecordFiltersFromState(
				tmpData.RecordFilterSources,
				tmpData.RecordFilterDatasets,
				tmpData.RecordFilterDateFrom,
				tmpData.RecordFilterDateTo
			);
			let tmpBegin = (tmpData.RecordPage || 0) * (tmpData.RecordPageSize || 50);
			let tmpRoute = tmpProvider.buildRecordsFilterRoute(tmpFilters, tmpBegin);
			this.pict.PictApplication.navigateTo(tmpRoute);
		}
		else
		{
			// No filters — just reload the current page directly
			this.loadCurrentPage();
		}
	}
}

module.exports = FactoFullRecordsView;

module.exports.default_configuration = _ViewConfiguration;
