const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-QueryPanel",

	DefaultRenderable: "Facto-Full-QueryPanel-Content",
	DefaultDestinationAddress: "#Facto-Proj-Query-Container",

	AutoRender: false,

	CSS: ``,

	Templates:
	[
		{
			Hash: "Facto-Full-QueryPanel-Template",
			Template: /*html*/`
<div>
	<div style="margin-bottom:1em;">
		<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].closeQuery()">&larr; Back to Projection</button>
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
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-QueryPanel'].runQuery()">Run Query</button>
		<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-QueryPanel'].runAggregate()">Aggregate</button>
	</div>
	<div id="Facto-Full-Projections-Results" class="facto-projection-results" style="display:none;"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-QueryPanel-Content",
			TemplateHash: "Facto-Full-QueryPanel-Template",
			DestinationAddress: "#Facto-Proj-Query-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullQueryPanelView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	runQuery()
	{
		let tmpDatasetID = parseInt(this.pict.providers.FactoUI.getVal('Facto-Full-Proj-DatasetID')) || 0;
		let tmpType = this.pict.providers.FactoUI.getVal('Facto-Full-Proj-Type');

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
		let tmpDatasetID = parseInt(this.pict.providers.FactoUI.getVal('Facto-Full-Proj-DatasetID')) || 0;

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

module.exports = FactoFullQueryPanelView;

module.exports.default_configuration = _ViewConfiguration;
