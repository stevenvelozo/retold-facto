const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Dashboard",

	DefaultRenderable: "Facto-Full-Dashboard-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-dashboard-stat {
			text-align: center;
		}

		.facto-dashboard-stat-value {
			font-size: 2em;
			font-weight: 700;
			color: var(--facto-text-heading);
			line-height: 1.2;
		}

		.facto-dashboard-stat-label {
			font-size: 0.85em;
			color: var(--facto-text-secondary);
			margin-top: 0.3em;
		}

		.facto-dashboard-actions {
			display: flex;
			gap: 0.75em;
			flex-wrap: wrap;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-Dashboard-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Dashboard</h1>
		<p>Retold Facto data warehouse overview.</p>
	</div>

	<div class="facto-card-grid" id="Facto-Full-Dashboard-Cards">
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-SourceCount">--</div>
			<div class="facto-dashboard-stat-label">Sources</div>
		</div>
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-DatasetCount">--</div>
			<div class="facto-dashboard-stat-label">Datasets</div>
		</div>
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-RecordCount">--</div>
			<div class="facto-dashboard-stat-label">Records</div>
		</div>
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-IngestCount">--</div>
			<div class="facto-dashboard-stat-label">Ingest Jobs</div>
		</div>
		<div class="facto-card facto-dashboard-stat">
			<div class="facto-dashboard-stat-value" id="Facto-Full-Dash-CatalogCount">--</div>
			<div class="facto-dashboard-stat-label">Catalog Entries</div>
		</div>
	</div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Quick Actions</div>
		<div class="facto-dashboard-actions">
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.PictApplication.navigateTo('/SourceResearch')">Source Research</button>
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.PictApplication.navigateTo('/Sources')">Manage Sources</button>
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.PictApplication.navigateTo('/Records')">Browse Records</button>
			<button class="facto-btn facto-btn-secondary" onclick="window.location.href='/simple/'">Simple View</button>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Dashboard-Content",
			TemplateHash: "Facto-Full-Dashboard-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullDashboardView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		let tmpProvider = this.pict.providers.Facto;

		// Load counts in parallel
		tmpProvider.loadSources().then(
			() =>
			{
				let tmpEl = document.getElementById('Facto-Full-Dash-SourceCount');
				if (tmpEl) tmpEl.textContent = (this.pict.AppData.Facto.Sources || []).length;
			});

		tmpProvider.loadDatasets().then(
			() =>
			{
				let tmpEl = document.getElementById('Facto-Full-Dash-DatasetCount');
				if (tmpEl) tmpEl.textContent = (this.pict.AppData.Facto.Datasets || []).length;
			});

		tmpProvider.loadRecords().then(
			() =>
			{
				let tmpEl = document.getElementById('Facto-Full-Dash-RecordCount');
				if (tmpEl) tmpEl.textContent = (this.pict.AppData.Facto.Records || []).length;
			});

		tmpProvider.loadIngestJobs().then(
			() =>
			{
				let tmpEl = document.getElementById('Facto-Full-Dash-IngestCount');
				if (tmpEl) tmpEl.textContent = (this.pict.AppData.Facto.IngestJobs || []).length;
			});

		tmpProvider.loadCatalogEntries().then(
			() =>
			{
				let tmpEl = document.getElementById('Facto-Full-Dash-CatalogCount');
				if (tmpEl) tmpEl.textContent = (this.pict.AppData.Facto.CatalogEntries || []).length;
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = FactoFullDashboardView;

module.exports.default_configuration = _ViewConfiguration;
