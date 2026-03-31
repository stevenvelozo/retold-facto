const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Dashboards",

	DefaultRenderable: "Facto-Full-Dashboards-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-dashboards-summary
		{
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
			gap: 1em;
			margin-bottom: 2em;
		}

		.facto-dashboards-stat
		{
			text-align: center;
			padding: 1.2em 0.5em;
		}

		.facto-dashboards-stat-value
		{
			font-size: 2em;
			font-weight: 700;
			color: var(--facto-text-heading);
			line-height: 1.2;
		}

		.facto-dashboards-stat-label
		{
			font-size: 0.85em;
			color: var(--facto-text-secondary);
			margin-top: 0.3em;
		}

		.facto-dashboards-chart-row
		{
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1.5em;
			margin-bottom: 1.5em;
		}

		@media (max-width: 800px)
		{
			.facto-dashboards-chart-row
			{
				grid-template-columns: 1fr;
			}
		}

		.facto-dashboards-chart-card
		{
			background: var(--facto-bg-elevated, var(--facto-bg-surface));
			border: 1px solid var(--facto-border);
			border-radius: 8px;
			padding: 1.25em;
			position: relative;
			min-height: 320px;
		}

		.facto-dashboards-chart-title
		{
			font-size: 0.95em;
			font-weight: 600;
			color: var(--facto-text-heading);
			margin-bottom: 0.75em;
		}

		.facto-dashboards-chart-wrap
		{
			position: relative;
			width: 100%;
			max-height: 300px;
		}

		.facto-dashboards-chart-wrap canvas
		{
			width: 100% !important;
			max-height: 300px;
		}

		.facto-dashboards-loading
		{
			color: var(--facto-text-tertiary);
			font-size: 0.9em;
			text-align: center;
			padding: 4em 0;
		}

		.facto-dashboards-header-row
		{
			display: flex;
			align-items: center;
			gap: 1em;
			flex-wrap: wrap;
		}

		.facto-dashboards-header-row h1
		{
			margin: 0;
		}

		.facto-dashboards-updated
		{
			font-size: 0.8em;
			color: var(--facto-text-tertiary);
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-Dashboards-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<div class="facto-dashboards-header-row">
			<h1>Dashboards</h1>
			<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-Dashboards'].refreshAll()">↻ Refresh</button>
			<span class="facto-dashboards-updated" id="Facto-Dashboards-Updated"></span>
		</div>
		<p>Analytics and visualizations across your data warehouse.</p>
	</div>

	<div class="facto-dashboards-summary" id="Facto-Dashboards-Summary">
		<div class="facto-card facto-dashboards-stat">
			<div class="facto-dashboards-stat-value" id="Facto-Dash-Sources">--</div>
			<div class="facto-dashboards-stat-label">Sources</div>
		</div>
		<div class="facto-card facto-dashboards-stat">
			<div class="facto-dashboards-stat-value" id="Facto-Dash-Datasets">--</div>
			<div class="facto-dashboards-stat-label">Datasets</div>
		</div>
		<div class="facto-card facto-dashboards-stat">
			<div class="facto-dashboards-stat-value" id="Facto-Dash-Records">--</div>
			<div class="facto-dashboards-stat-label">Records</div>
		</div>
		<div class="facto-card facto-dashboards-stat">
			<div class="facto-dashboards-stat-value" id="Facto-Dash-IngestJobs">--</div>
			<div class="facto-dashboards-stat-label">Ingest Jobs</div>
		</div>
		<div class="facto-card facto-dashboards-stat">
			<div class="facto-dashboards-stat-value" id="Facto-Dash-Certainty">--</div>
			<div class="facto-dashboards-stat-label">Certainty Indices</div>
		</div>
	</div>

	<div class="facto-dashboards-chart-row">
		<div class="facto-dashboards-chart-card">
			<div class="facto-dashboards-chart-title">Records by Dataset</div>
			<div class="facto-dashboards-chart-wrap">
				<canvas id="Facto-Dash-Chart-RecordsByDataset"></canvas>
			</div>
			<div class="facto-dashboards-loading" id="Facto-Dash-Loading-RecordsByDataset">Loading…</div>
		</div>
		<div class="facto-dashboards-chart-card">
			<div class="facto-dashboards-chart-title">Records by Source</div>
			<div class="facto-dashboards-chart-wrap">
				<canvas id="Facto-Dash-Chart-RecordsBySource"></canvas>
			</div>
			<div class="facto-dashboards-loading" id="Facto-Dash-Loading-RecordsBySource">Loading…</div>
		</div>
	</div>

	<div class="facto-dashboards-chart-row">
		<div class="facto-dashboards-chart-card">
			<div class="facto-dashboards-chart-title">Datasets by Type</div>
			<div class="facto-dashboards-chart-wrap">
				<canvas id="Facto-Dash-Chart-DatasetsByType"></canvas>
			</div>
			<div class="facto-dashboards-loading" id="Facto-Dash-Loading-DatasetsByType">Loading…</div>
		</div>
		<div class="facto-dashboards-chart-card">
			<div class="facto-dashboards-chart-title">Ingest Job Activity</div>
			<div class="facto-dashboards-chart-wrap">
				<canvas id="Facto-Dash-Chart-IngestActivity"></canvas>
			</div>
			<div class="facto-dashboards-loading" id="Facto-Dash-Loading-IngestActivity">Loading…</div>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Dashboards-Content",
			TemplateHash: "Facto-Full-Dashboards-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

// A small curated palette that works across light and dark themes.
// The view also reads theme CSS variables at render time for accents.
const CHART_PALETTE =
[
	'#18a5a0', '#c44836', '#3a9468', '#6366f1', '#e5a036',
	'#d94882', '#2e86de', '#8b5cf6', '#10b981', '#f59e0b',
	'#ef4444', '#06b6d4', '#a855f7', '#84cc16', '#f97316'
];

class FactoFullDashboardsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._chartRecordsByDataset = null;
		this._chartRecordsBySource = null;
		this._chartDatasetsByType = null;
		this._chartIngestActivity = null;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.loadAllDashboardData();
		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	// ------------------------------------------------------------------
	// Theme helpers
	// ------------------------------------------------------------------

	getThemeColor(pVarName, pFallback)
	{
		let tmpStyle = getComputedStyle(document.body);
		let tmpVal = tmpStyle.getPropertyValue(pVarName).trim();
		return tmpVal || pFallback || '#888888';
	}

	getChartPalette(pCount)
	{
		// Build a palette from the curated set, cycling if needed
		let tmpPalette = [];
		for (let i = 0; i < pCount; i++)
		{
			tmpPalette.push(CHART_PALETTE[i % CHART_PALETTE.length]);
		}
		return tmpPalette;
	}

	getChartDefaults()
	{
		return {
			textColor: this.getThemeColor('--facto-text', '#cccccc'),
			textSecondary: this.getThemeColor('--facto-text-secondary', '#999999'),
			gridColor: this.getThemeColor('--facto-border-subtle', '#333333'),
			borderColor: this.getThemeColor('--facto-border', '#444444')
		};
	}

	// ------------------------------------------------------------------
	// Formatting helpers
	// ------------------------------------------------------------------

	formatNumber(pNum)
	{
		if (typeof pNum !== 'number') return '--';
		return pNum.toLocaleString();
	}

	setStatText(pID, pValue)
	{
		let tmpEl = document.getElementById(pID);
		if (tmpEl) tmpEl.textContent = this.formatNumber(pValue);
	}

	hideLoading(pID)
	{
		let tmpEl = document.getElementById(pID);
		if (tmpEl) tmpEl.style.display = 'none';
	}

	// ------------------------------------------------------------------
	// Master data load
	// ------------------------------------------------------------------

	loadAllDashboardData()
	{
		let tmpProvider = this.pict.providers.Facto;

		// 1) Summary stats + datasets-by-type
		tmpProvider.loadProjectionSummary().then(
			(pSummary) =>
			{
				if (!pSummary) return;
				this.setStatText('Facto-Dash-Sources', pSummary.Sources);
				this.setStatText('Facto-Dash-Datasets', pSummary.Datasets);
				this.setStatText('Facto-Dash-Records', pSummary.Records);
				this.setStatText('Facto-Dash-IngestJobs', pSummary.IngestJobs);
				this.setStatText('Facto-Dash-Certainty', pSummary.CertaintyIndices);
				this.renderDatasetsByTypeChart(pSummary.DatasetsByType || {});
			}).catch(
			(pErr) =>
			{
				this.pict.log.error('Dashboards: failed to load summary', pErr);
			});

		// 2) Records by dataset
		tmpProvider.loadDatasets().then(
			() =>
			{
				return tmpProvider.loadDatasetCounts();
			}).then(
			() =>
			{
				this.renderRecordsByDatasetChart();
			}).catch(
			(pErr) =>
			{
				this.pict.log.error('Dashboards: failed to load dataset counts', pErr);
			});

		// 3) Records by source
		tmpProvider.loadSources().then(
			() =>
			{
				return tmpProvider.loadSourceCounts();
			}).then(
			() =>
			{
				this.renderRecordsBySourceChart();
			}).catch(
			(pErr) =>
			{
				this.pict.log.error('Dashboards: failed to load source counts', pErr);
			});

		// 4) Ingest job activity
		tmpProvider.loadIngestJobs().then(
			() =>
			{
				this.renderIngestActivityChart();
			}).catch(
			(pErr) =>
			{
				this.pict.log.error('Dashboards: failed to load ingest jobs', pErr);
			});

		// Update timestamp
		let tmpEl = document.getElementById('Facto-Dashboards-Updated');
		if (tmpEl) tmpEl.textContent = 'Updated ' + new Date().toLocaleTimeString();
	}

	refreshAll()
	{
		// Destroy existing charts before re-rendering
		this.destroyCharts();

		// Reset loading indicators
		let tmpLoadingIDs =
		[
			'Facto-Dash-Loading-RecordsByDataset',
			'Facto-Dash-Loading-RecordsBySource',
			'Facto-Dash-Loading-DatasetsByType',
			'Facto-Dash-Loading-IngestActivity'
		];
		for (let i = 0; i < tmpLoadingIDs.length; i++)
		{
			let tmpEl = document.getElementById(tmpLoadingIDs[i]);
			if (tmpEl) tmpEl.style.display = '';
		}

		// Reset stat values
		let tmpStatIDs = ['Facto-Dash-Sources', 'Facto-Dash-Datasets', 'Facto-Dash-Records', 'Facto-Dash-IngestJobs', 'Facto-Dash-Certainty'];
		for (let i = 0; i < tmpStatIDs.length; i++)
		{
			let tmpEl = document.getElementById(tmpStatIDs[i]);
			if (tmpEl) tmpEl.textContent = '--';
		}

		this.loadAllDashboardData();
	}

	destroyCharts()
	{
		if (this._chartRecordsByDataset) { this._chartRecordsByDataset.destroy(); this._chartRecordsByDataset = null; }
		if (this._chartRecordsBySource) { this._chartRecordsBySource.destroy(); this._chartRecordsBySource = null; }
		if (this._chartDatasetsByType) { this._chartDatasetsByType.destroy(); this._chartDatasetsByType = null; }
		if (this._chartIngestActivity) { this._chartIngestActivity.destroy(); this._chartIngestActivity = null; }
	}

	// ------------------------------------------------------------------
	// Chart: Records by Dataset (Doughnut)
	// ------------------------------------------------------------------

	renderRecordsByDatasetChart()
	{
		this.hideLoading('Facto-Dash-Loading-RecordsByDataset');
		let tmpCanvas = document.getElementById('Facto-Dash-Chart-RecordsByDataset');
		if (!tmpCanvas || typeof Chart === 'undefined') return;

		let tmpDatasets = this.pict.AppData.Facto.Datasets || [];

		// Filter to datasets that have records
		let tmpLabels = [];
		let tmpData = [];
		let tmpIDs = [];
		for (let i = 0; i < tmpDatasets.length; i++)
		{
			let tmpCount = tmpDatasets[i].RecordCount || 0;
			if (tmpCount > 0)
			{
				tmpLabels.push(tmpDatasets[i].Name || ('Dataset ' + tmpDatasets[i].IDDataset));
				tmpData.push(tmpCount);
				tmpIDs.push(tmpDatasets[i].IDDataset);
			}
		}

		if (tmpLabels.length === 0)
		{
			let tmpCard = tmpCanvas.closest('.facto-dashboards-chart-card');
			if (tmpCard)
			{
				let tmpWrap = tmpCard.querySelector('.facto-dashboards-chart-wrap');
				if (tmpWrap) tmpWrap.innerHTML = '<div style="text-align:center; color:var(--facto-text-tertiary); padding:3em 0;">No records associated with datasets yet.</div>';
			}
			return;
		}

		let tmpColors = this.getChartPalette(tmpLabels.length);
		let tmpDefaults = this.getChartDefaults();

		if (this._chartRecordsByDataset) this._chartRecordsByDataset.destroy();
		this._chartRecordsByDataset = new Chart(tmpCanvas,
		{
			type: 'doughnut',
			data:
			{
				labels: tmpLabels,
				datasets:
				[{
					data: tmpData,
					backgroundColor: tmpColors,
					borderColor: tmpDefaults.borderColor,
					borderWidth: 1
				}]
			},
			options:
			{
				responsive: true,
				maintainAspectRatio: false,
				plugins:
				{
					legend:
					{
						position: 'bottom',
						labels:
						{
							color: tmpDefaults.textColor,
							font: { size: 11 },
							padding: 8,
							boxWidth: 12
						}
					},
					tooltip:
					{
						callbacks:
						{
							label: function(pContext)
							{
								let tmpLabel = pContext.label || '';
								let tmpValue = pContext.parsed || 0;
								let tmpTotal = pContext.dataset.data.reduce(function(a, b) { return a + b; }, 0);
								let tmpPct = tmpTotal > 0 ? ((tmpValue / tmpTotal) * 100).toFixed(1) : 0;
								return tmpLabel + ': ' + tmpValue.toLocaleString() + ' (' + tmpPct + '%)';
							}
						}
					}
				},
				onClick: (pEvent, pElements) =>
				{
					if (pElements.length > 0)
					{
						let tmpIdx = pElements[0].index;
						let tmpID = tmpIDs[tmpIdx];
						if (tmpID)
						{
							this.pict.PictApplication.navigateTo('/Projection/' + tmpID);
						}
					}
				}
			}
		});
	}

	// ------------------------------------------------------------------
	// Chart: Records by Source (Horizontal Bar)
	// ------------------------------------------------------------------

	renderRecordsBySourceChart()
	{
		this.hideLoading('Facto-Dash-Loading-RecordsBySource');
		let tmpCanvas = document.getElementById('Facto-Dash-Chart-RecordsBySource');
		if (!tmpCanvas || typeof Chart === 'undefined') return;

		let tmpSources = this.pict.AppData.Facto.Sources || [];
		if (tmpSources.length === 0) return;

		let tmpLabels = [];
		let tmpData = [];
		let tmpIDs = [];
		for (let i = 0; i < tmpSources.length; i++)
		{
			let tmpName = tmpSources[i].Name || ('Source ' + tmpSources[i].IDSource);
			// Truncate long names for the chart axis
			if (tmpName.length > 40) tmpName = tmpName.substring(0, 37) + '…';
			tmpLabels.push(tmpName);
			tmpData.push(tmpSources[i].RecordCount || 0);
			tmpIDs.push(tmpSources[i].IDSource);
		}

		let tmpColors = this.getChartPalette(tmpLabels.length);
		let tmpDefaults = this.getChartDefaults();

		if (this._chartRecordsBySource) this._chartRecordsBySource.destroy();
		this._chartRecordsBySource = new Chart(tmpCanvas,
		{
			type: 'bar',
			data:
			{
				labels: tmpLabels,
				datasets:
				[{
					label: 'Records',
					data: tmpData,
					backgroundColor: tmpColors,
					borderColor: tmpDefaults.borderColor,
					borderWidth: 1,
					borderRadius: 3
				}]
			},
			options:
			{
				indexAxis: 'y',
				responsive: true,
				maintainAspectRatio: false,
				plugins:
				{
					legend: { display: false },
					tooltip:
					{
						callbacks:
						{
							label: function(pContext)
							{
								return 'Records: ' + (pContext.parsed.x || 0).toLocaleString();
							}
						}
					}
				},
				scales:
				{
					x:
					{
						beginAtZero: true,
						ticks: { color: tmpDefaults.textSecondary },
						grid: { color: tmpDefaults.gridColor }
					},
					y:
					{
						ticks:
						{
							color: tmpDefaults.textColor,
							font: { size: 11 }
						},
						grid: { display: false }
					}
				},
				onClick: (pEvent, pElements) =>
				{
					if (pElements.length > 0)
					{
						let tmpIdx = pElements[0].index;
						let tmpID = tmpIDs[tmpIdx];
						if (tmpID)
						{
							this.pict.PictApplication.navigateTo('/Source/' + tmpID);
						}
					}
				}
			}
		});
	}

	// ------------------------------------------------------------------
	// Chart: Datasets by Type (Bar)
	// ------------------------------------------------------------------

	renderDatasetsByTypeChart(pDatasetsByType)
	{
		this.hideLoading('Facto-Dash-Loading-DatasetsByType');
		let tmpCanvas = document.getElementById('Facto-Dash-Chart-DatasetsByType');
		if (!tmpCanvas || typeof Chart === 'undefined') return;

		let tmpTypes = ['Raw', 'Compositional', 'Projection', 'Derived'];
		let tmpLabels = tmpTypes.slice();
		let tmpData = [];
		for (let i = 0; i < tmpTypes.length; i++)
		{
			tmpData.push(pDatasetsByType[tmpTypes[i]] || 0);
		}

		let tmpTypeColors =
		[
			this.getThemeColor('--facto-brand', '#18a5a0'),
			'#6366f1',
			this.getThemeColor('--facto-success', '#3a9468'),
			'#e5a036'
		];
		let tmpDefaults = this.getChartDefaults();

		if (this._chartDatasetsByType) this._chartDatasetsByType.destroy();
		this._chartDatasetsByType = new Chart(tmpCanvas,
		{
			type: 'bar',
			data:
			{
				labels: tmpLabels,
				datasets:
				[{
					label: 'Datasets',
					data: tmpData,
					backgroundColor: tmpTypeColors,
					borderColor: tmpDefaults.borderColor,
					borderWidth: 1,
					borderRadius: 4
				}]
			},
			options:
			{
				responsive: true,
				maintainAspectRatio: false,
				plugins:
				{
					legend: { display: false },
					tooltip:
					{
						callbacks:
						{
							label: function(pContext)
							{
								return pContext.label + ': ' + (pContext.parsed.y || 0).toLocaleString();
							}
						}
					}
				},
				scales:
				{
					y:
					{
						beginAtZero: true,
						ticks:
						{
							color: tmpDefaults.textSecondary,
							stepSize: 1,
							precision: 0
						},
						grid: { color: tmpDefaults.gridColor }
					},
					x:
					{
						ticks: { color: tmpDefaults.textColor },
						grid: { display: false }
					}
				}
			}
		});
	}

	// ------------------------------------------------------------------
	// Chart: Ingest Job Activity (Stacked Bar)
	// ------------------------------------------------------------------

	renderIngestActivityChart()
	{
		this.hideLoading('Facto-Dash-Loading-IngestActivity');
		let tmpCanvas = document.getElementById('Facto-Dash-Chart-IngestActivity');
		if (!tmpCanvas || typeof Chart === 'undefined') return;

		let tmpJobs = this.pict.AppData.Facto.IngestJobs || [];
		if (tmpJobs.length === 0)
		{
			// Show empty state text
			let tmpCard = tmpCanvas.closest('.facto-dashboards-chart-card');
			if (tmpCard)
			{
				let tmpWrap = tmpCard.querySelector('.facto-dashboards-chart-wrap');
				if (tmpWrap) tmpWrap.innerHTML = '<div style="text-align:center; color:var(--facto-text-tertiary); padding:3em 0;">No ingest jobs yet.</div>';
			}
			return;
		}

		// Show the most recent jobs (up to 20), sorted by ID ascending
		let tmpSorted = tmpJobs.slice().sort(
			function(a, b) { return (a.IDIngestJob || 0) - (b.IDIngestJob || 0); }
		);
		if (tmpSorted.length > 20) tmpSorted = tmpSorted.slice(tmpSorted.length - 20);

		let tmpLabels = [];
		let tmpCreated = [];
		let tmpUpdated = [];
		let tmpErrored = [];

		for (let i = 0; i < tmpSorted.length; i++)
		{
			let tmpJob = tmpSorted[i];
			let tmpLabel = 'Job ' + (tmpJob.IDIngestJob || '?');
			if (tmpJob.StartDate)
			{
				let tmpDate = new Date(tmpJob.StartDate);
				if (!isNaN(tmpDate.getTime()))
				{
					tmpLabel = (tmpDate.getMonth() + 1) + '/' + tmpDate.getDate();
				}
			}
			tmpLabels.push(tmpLabel);
			tmpCreated.push(tmpJob.RecordsCreated || 0);
			tmpUpdated.push(tmpJob.RecordsUpdated || 0);
			tmpErrored.push(tmpJob.RecordsErrored || 0);
		}

		let tmpDefaults = this.getChartDefaults();

		if (this._chartIngestActivity) this._chartIngestActivity.destroy();
		this._chartIngestActivity = new Chart(tmpCanvas,
		{
			type: 'bar',
			data:
			{
				labels: tmpLabels,
				datasets:
				[
					{
						label: 'Created',
						data: tmpCreated,
						backgroundColor: this.getThemeColor('--facto-success', '#3a9468'),
						borderRadius: 2
					},
					{
						label: 'Updated',
						data: tmpUpdated,
						backgroundColor: this.getThemeColor('--facto-brand', '#18a5a0'),
						borderRadius: 2
					},
					{
						label: 'Errored',
						data: tmpErrored,
						backgroundColor: this.getThemeColor('--facto-error', '#c44836'),
						borderRadius: 2
					}
				]
			},
			options:
			{
				responsive: true,
				maintainAspectRatio: false,
				plugins:
				{
					legend:
					{
						labels:
						{
							color: tmpDefaults.textColor,
							font: { size: 11 },
							boxWidth: 12,
							padding: 10
						}
					},
					tooltip:
					{
						mode: 'index',
						intersect: false
					}
				},
				scales:
				{
					x:
					{
						stacked: true,
						ticks:
						{
							color: tmpDefaults.textSecondary,
							font: { size: 10 },
							maxRotation: 45
						},
						grid: { display: false }
					},
					y:
					{
						stacked: true,
						beginAtZero: true,
						ticks:
						{
							color: tmpDefaults.textSecondary,
							precision: 0
						},
						grid: { color: tmpDefaults.gridColor }
					}
				}
			}
		});
	}
}

module.exports = FactoFullDashboardsView;

module.exports.default_configuration = _ViewConfiguration;
