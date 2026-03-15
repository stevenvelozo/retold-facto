const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Projections",

	DefaultRenderable: "Facto-Full-Projections-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-projection-results {
			margin-top: 1.25em;
			padding-top: 1.25em;
			border-top: 1px solid var(--facto-border-subtle);
		}
		.facto-projection-results pre {
			max-height: 400px;
			overflow: auto;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-Projections-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Projections</h1>
		<p>Query, aggregate, and compare records across datasets.</p>
	</div>

	<div class="facto-section">
		<div class="facto-section-title">Warehouse Summary</div>
		<div id="Facto-Full-Projections-Summary" class="facto-card-grid"></div>
	</div>

	<div class="facto-section" style="margin-top:1.5em;">
		<div class="facto-section-title">Query Records</div>
		<div class="facto-inline-group">
			<div>
				<label>Dataset ID</label>
				<input type="number" id="Facto-Full-Proj-DatasetID" placeholder="e.g. 1">
			</div>
			<div>
				<label>Type Filter</label>
				<select id="Facto-Full-Proj-Type">
					<option value="">All</option>
					<option value="Raw">Raw</option>
					<option value="Compositional">Compositional</option>
					<option value="Projection">Projection</option>
				</select>
			</div>
		</div>
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Projections'].runQuery()">Run Query</button>
		<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-Projections'].runAggregate()">Aggregate</button>
	</div>

	<div id="Facto-Full-Projections-Results" class="facto-projection-results" style="display:none;"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Projections-Content",
			TemplateHash: "Facto-Full-Projections-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullProjectionsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.providers.Facto.loadProjectionSummary().then(
			(pResponse) =>
			{
				let tmpContainer = document.getElementById('Facto-Full-Projections-Summary');
				if (!tmpContainer || !pResponse) return;

				let tmpHtml = '';
				tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (pResponse.TotalRecords || 0) + '</div><div class="facto-dashboard-stat-label">Total Records</div></div>';
				tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (pResponse.TotalDatasets || 0) + '</div><div class="facto-dashboard-stat-label">Total Datasets</div></div>';
				tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (pResponse.TotalSources || 0) + '</div><div class="facto-dashboard-stat-label">Total Sources</div></div>';
				tmpContainer.innerHTML = tmpHtml;
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	runQuery()
	{
		let tmpDatasetID = parseInt((document.getElementById('Facto-Full-Proj-DatasetID') || {}).value) || 0;
		let tmpType = (document.getElementById('Facto-Full-Proj-Type') || {}).value || '';

		let tmpParams = {};
		if (tmpDatasetID) tmpParams.IDDataset = tmpDatasetID;
		if (tmpType) tmpParams.Type = tmpType;

		this.pict.providers.Facto.queryRecords(tmpParams).then(
			(pResponse) =>
			{
				this._showResults('Query Results', pResponse);
			});
	}

	runAggregate()
	{
		let tmpDatasetID = parseInt((document.getElementById('Facto-Full-Proj-DatasetID') || {}).value) || 0;

		let tmpParams = {};
		if (tmpDatasetID) tmpParams.IDDataset = tmpDatasetID;

		this.pict.providers.Facto.aggregateRecords(tmpParams).then(
			(pResponse) =>
			{
				this._showResults('Aggregate Results', pResponse);
			});
	}

	_showResults(pTitle, pData)
	{
		let tmpContainer = document.getElementById('Facto-Full-Projections-Results');
		if (!tmpContainer) return;
		tmpContainer.style.display = 'block';

		let tmpRecordCount = (pData && pData.Records) ? pData.Records.length : (pData && pData.Aggregations) ? pData.Aggregations.length : 0;
		let tmpHtml = '<h3>' + pTitle + ' (' + tmpRecordCount + ')</h3>';
		tmpHtml += '<pre>' + JSON.stringify(pData, null, 2) + '</pre>';
		tmpHtml += '<button class="facto-btn facto-btn-secondary" style="margin-top:0.5em;" onclick="document.getElementById(\'Facto-Full-Projections-Results\').style.display=\'none\'">Close</button>';
		tmpContainer.innerHTML = tmpHtml;
	}
}

module.exports = FactoFullProjectionsView;

module.exports.default_configuration = _ViewConfiguration;
