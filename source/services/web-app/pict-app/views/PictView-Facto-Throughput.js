/**
 * PictView-Facto-Throughput
 *
 * Live temporal histogram showing pipeline throughput across three stages:
 *   - Extracted (records parsed from source files)
 *   - Transformed (records mapped via TabularTransform)
 *   - Written (records persisted to Facto store)
 *
 * Renders four histograms:
 *   1. Extracted — blue
 *   2. Transformed — amber
 *   3. Written — green
 *   4. Combined (stacked) — all three overlaid
 *
 * Polls /facto/throughput every 500ms while active.
 */

const libPictView = require('pict-view');

const STAGE_COLORS =
{
	extracted:   { bar: '#4a90d9', bg: 'rgba(74,144,217,0.15)', label: 'Extracted' },
	transformed: { bar: '#d09818', bg: 'rgba(208,152,24,0.15)', label: 'Transformed' },
	written:     { bar: '#3a9468', bg: 'rgba(58,148,104,0.15)', label: 'Written' },
};

const HISTOGRAM_HEIGHT = 80;
const BAR_WIDTH = 6;
const BAR_GAP = 2;
const POLL_INTERVAL_MS = 500;

class FactoThroughputView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._pollTimer = null;
		this._isPolling = false;
	}

	onAfterRender()
	{
		// Don't auto-start polling — user clicks "Start Monitoring"
	}

	startMonitoring()
	{
		if (this._isPolling) return;
		this._isPolling = true;

		let tmpBtn = document.getElementById('facto-throughput-toggle');
		if (tmpBtn)
		{
			tmpBtn.textContent = 'Stop Monitoring';
			tmpBtn.className = 'danger';
		}

		this._poll();
	}

	stopMonitoring()
	{
		this._isPolling = false;
		if (this._pollTimer)
		{
			clearTimeout(this._pollTimer);
			this._pollTimer = null;
		}

		let tmpBtn = document.getElementById('facto-throughput-toggle');
		if (tmpBtn)
		{
			tmpBtn.textContent = 'Start Monitoring';
			tmpBtn.className = 'primary';
		}
	}

	toggleMonitoring()
	{
		if (this._isPolling)
		{
			this.stopMonitoring();
		}
		else
		{
			this.startMonitoring();
		}
	}

	_poll()
	{
		if (!this._isPolling) return;

		fetch('/facto/throughput?duration=30')
			.then((pResponse) => pResponse.json())
			.then((pData) =>
			{
				this._renderHistograms(pData);
				this._pollTimer = setTimeout(() => this._poll(), POLL_INTERVAL_MS);
			})
			.catch((pError) =>
			{
				this._pollTimer = setTimeout(() => this._poll(), POLL_INTERVAL_MS * 4);
			});
	}

	_renderHistograms(pData)
	{
		let tmpBuckets = pData.buckets || [];
		let tmpMaxValue = pData.maxValue || 1;
		let tmpTotals = { extracted: 0, transformed: 0, written: 0 };

		for (let i = 0; i < tmpBuckets.length; i++)
		{
			tmpTotals.extracted += tmpBuckets[i].extracted;
			tmpTotals.transformed += tmpBuckets[i].transformed;
			tmpTotals.written += tmpBuckets[i].written;
		}

		// Find max for stacked chart
		let tmpStackedMax = 1;
		for (let i = 0; i < tmpBuckets.length; i++)
		{
			let tmpTotal = tmpBuckets[i].extracted + tmpBuckets[i].transformed + tmpBuckets[i].written;
			if (tmpTotal > tmpStackedMax) tmpStackedMax = tmpTotal;
		}

		let tmpContainer = document.getElementById('facto-throughput-charts');
		if (!tmpContainer) return;

		let tmpHtml = '';

		// Summary totals
		tmpHtml += '<div style="display:flex; gap:24px; margin-bottom:12px; flex-wrap:wrap;">';
		tmpHtml += this._renderTotalBadge('Extracted', tmpTotals.extracted, STAGE_COLORS.extracted.bar);
		tmpHtml += this._renderTotalBadge('Transformed', tmpTotals.transformed, STAGE_COLORS.transformed.bar);
		tmpHtml += this._renderTotalBadge('Written', tmpTotals.written, STAGE_COLORS.written.bar);

		// Active run indicator
		if (pData.activeRun)
		{
			let tmpElapsed = ((Date.now() - pData.activeRun.startTime) / 1000).toFixed(1);
			tmpHtml += '<div style="font-size:0.85em; color:var(--facto-text-secondary); display:flex; align-items:center; gap:6px;">';
			tmpHtml += '<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#3a9468; animation:pulse 1s infinite;"></span>';
			tmpHtml += pData.activeRun.label + ' (' + tmpElapsed + 's)';
			tmpHtml += '</div>';
		}
		tmpHtml += '</div>';

		// Individual histograms
		tmpHtml += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">';
		tmpHtml += this._renderSingleHistogram('Extracted', 'extracted', tmpBuckets, tmpMaxValue);
		tmpHtml += this._renderSingleHistogram('Transformed', 'transformed', tmpBuckets, tmpMaxValue);
		tmpHtml += this._renderSingleHistogram('Written', 'written', tmpBuckets, tmpMaxValue);
		tmpHtml += this._renderStackedHistogram('Combined', tmpBuckets, tmpStackedMax);
		tmpHtml += '</div>';

		tmpContainer.innerHTML = tmpHtml;
	}

	_renderTotalBadge(pLabel, pCount, pColor)
	{
		return '<div style="display:flex; align-items:center; gap:6px;">'
			+ '<div style="width:12px; height:12px; border-radius:2px; background:' + pColor + ';"></div>'
			+ '<span style="font-weight:600; font-size:0.9em;">' + pLabel + ':</span>'
			+ '<span style="font-size:0.9em; color:var(--facto-text-secondary);">' + pCount.toLocaleString() + '</span>'
			+ '</div>';
	}

	_renderSingleHistogram(pTitle, pStage, pBuckets, pMaxValue)
	{
		let tmpColor = STAGE_COLORS[pStage];
		let tmpBarsHtml = '';
		let tmpMax = Math.max(pMaxValue, 1);

		for (let i = 0; i < pBuckets.length; i++)
		{
			let tmpVal = pBuckets[i][pStage];
			let tmpPct = (tmpVal / tmpMax) * 100;
			let tmpBarColor = tmpVal > 0 ? tmpColor.bar : 'transparent';

			tmpBarsHtml += '<div style="'
				+ 'display:inline-block;'
				+ 'width:' + BAR_WIDTH + 'px;'
				+ 'height:' + HISTOGRAM_HEIGHT + 'px;'
				+ 'margin-right:' + BAR_GAP + 'px;'
				+ 'position:relative;'
				+ 'vertical-align:bottom;'
				+ '">'
				+ '<div style="'
				+ 'position:absolute; bottom:0; left:0; right:0;'
				+ 'height:' + tmpPct + '%;'
				+ 'background:' + tmpBarColor + ';'
				+ 'border-radius:1px 1px 0 0;'
				+ 'transition:height 0.3s;'
				+ '" title="' + tmpVal + ' records"></div>'
				+ '</div>';
		}

		return '<div style="background:' + tmpColor.bg + '; border-radius:6px; padding:10px;">'
			+ '<div style="font-size:0.8em; font-weight:600; color:' + tmpColor.bar + '; margin-bottom:6px;">' + pTitle + '</div>'
			+ '<div style="overflow-x:auto; white-space:nowrap; display:flex; align-items:flex-end; height:' + HISTOGRAM_HEIGHT + 'px; border-bottom:1px solid rgba(0,0,0,0.1);">'
			+ tmpBarsHtml
			+ '</div>'
			+ '</div>';
	}

	// ─────────────────────────────────────────────
	//  Historical run browsing
	// ─────────────────────────────────────────────

	loadRunHistory()
	{
		fetch('/facto/throughput/runs?limit=10')
			.then((pResponse) => pResponse.json())
			.then((pRuns) =>
			{
				this._renderRunHistory(pRuns);
			})
			.catch(() => {});
	}

	loadHistoricalRun(pLabel)
	{
		this._activeHistoricalRun = pLabel;
		this._activeDatasetFilter = null;

		fetch('/facto/throughput/run/' + encodeURIComponent(pLabel))
			.then((pResponse) => pResponse.json())
			.then((pData) =>
			{
				pData.historicalRun = pLabel;
				this._renderHistograms(pData);
				this._loadDatasetBreakdown(pLabel);
			})
			.catch(() => {});
	}

	filterByDataset(pDataset)
	{
		if (!this._activeHistoricalRun) return;
		this._activeDatasetFilter = pDataset;

		let tmpUrl = '/facto/throughput/run/' + encodeURIComponent(this._activeHistoricalRun);
		if (pDataset)
		{
			tmpUrl += '?dataset=' + encodeURIComponent(pDataset);
		}

		fetch(tmpUrl)
			.then((pResponse) => pResponse.json())
			.then((pData) =>
			{
				pData.historicalRun = this._activeHistoricalRun;
				pData.datasetFilter = pDataset;
				this._renderHistograms(pData);
			})
			.catch(() => {});
	}

	_loadDatasetBreakdown(pLabel)
	{
		fetch('/facto/throughput/run/' + encodeURIComponent(pLabel) + '/datasets')
			.then((pResponse) => pResponse.json())
			.then((pDatasets) =>
			{
				this._renderDatasetBreakdown(pDatasets);
			})
			.catch(() => {});
	}

	_renderRunHistory(pRuns)
	{
		let tmpContainer = document.getElementById('facto-throughput-history');
		if (!tmpContainer) return;

		if (!pRuns || pRuns.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:var(--theme-color-text-muted, #aaa); font-size:0.85em; font-style:italic;">No historical runs found.</p>';
			return;
		}

		let tmpHtml = '<div style="font-size:0.85em; font-weight:600; color:var(--facto-text-heading); margin-bottom:6px;">Run History</div>';
		tmpHtml += '<div style="display:flex; flex-wrap:wrap; gap:6px;">';
		for (let i = 0; i < pRuns.length; i++)
		{
			let tmpRun = pRuns[i];
			let tmpDate = new Date(tmpRun.startTime).toLocaleString();
			let tmpDatasets = tmpRun.datasets.length;
			tmpHtml += '<button class="secondary" style="padding:4px 10px; font-size:0.8em;" '
				+ 'onclick="pict.views[\'Facto-Throughput\'].loadHistoricalRun(\'' + tmpRun.label.replace(/'/g, "\\'") + '\')" '
				+ 'title="' + tmpDate + ' — ' + tmpRun.eventCount + ' events, ' + tmpDatasets + ' datasets">'
				+ tmpRun.label.substring(0, 30) + (tmpRun.label.length > 30 ? '...' : '')
				+ '</button>';
		}
		tmpHtml += '</div>';

		tmpContainer.innerHTML = tmpHtml;
	}

	_renderDatasetBreakdown(pDatasets)
	{
		let tmpContainer = document.getElementById('facto-throughput-datasets');
		if (!tmpContainer) return;

		if (!pDatasets || pDatasets.length === 0)
		{
			tmpContainer.innerHTML = '';
			return;
		}

		// Find max total for scaling
		let tmpMaxTotal = 1;
		for (let i = 0; i < pDatasets.length; i++)
		{
			if (pDatasets[i].total > tmpMaxTotal) tmpMaxTotal = pDatasets[i].total;
		}

		let tmpHtml = '<div style="font-size:0.85em; font-weight:600; color:var(--facto-text-heading); margin-bottom:8px;">Per-Dataset Breakdown</div>';
		tmpHtml += '<div style="font-size:0.8em; margin-bottom:4px; color:var(--facto-text-tertiary);">Click a dataset to filter the histogram:</div>';

		for (let i = 0; i < pDatasets.length; i++)
		{
			let tmpDS = pDatasets[i];
			let tmpPct = (tmpDS.total / tmpMaxTotal) * 100;
			let tmpActive = this._activeDatasetFilter === tmpDS.dataset;

			tmpHtml += '<div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; cursor:pointer; '
				+ (tmpActive ? 'background:var(--facto-brand-a15); border-radius:4px; padding:2px 6px;' : 'padding:2px 6px;')
				+ '" onclick="pict.views[\'Facto-Throughput\'].filterByDataset(' + (tmpActive ? 'null' : '\'' + tmpDS.dataset.replace(/'/g, "\\'") + '\'') + ')">';
			tmpHtml += '<span style="min-width:200px; font-family:monospace; font-size:0.9em; color:var(--facto-text);">' + tmpDS.dataset + '</span>';

			// Stacked bar
			let tmpEPct = (tmpDS.extracted / tmpMaxTotal) * 100;
			let tmpTPct = (tmpDS.transformed / tmpMaxTotal) * 100;
			let tmpWPct = (tmpDS.written / tmpMaxTotal) * 100;

			tmpHtml += '<div style="flex:1; height:16px; display:flex; border-radius:3px; overflow:hidden; background:var(--facto-bg-elevated);">';
			if (tmpDS.extracted > 0) tmpHtml += '<div style="width:' + tmpEPct + '%; background:' + STAGE_COLORS.extracted.bar + ';" title="Extracted: ' + tmpDS.extracted + '"></div>';
			if (tmpDS.transformed > 0) tmpHtml += '<div style="width:' + tmpTPct + '%; background:' + STAGE_COLORS.transformed.bar + ';" title="Transformed: ' + tmpDS.transformed + '"></div>';
			if (tmpDS.written > 0) tmpHtml += '<div style="width:' + tmpWPct + '%; background:' + STAGE_COLORS.written.bar + ';" title="Written: ' + tmpDS.written + '"></div>';
			tmpHtml += '</div>';

			tmpHtml += '<span style="min-width:60px; text-align:right; font-size:0.85em; color:var(--facto-text-secondary);">' + tmpDS.total.toLocaleString() + '</span>';
			tmpHtml += '</div>';
		}

		tmpContainer.innerHTML = tmpHtml;
	}

	// ─────────────────────────────────────────────
	//  Histogram rendering
	// ─────────────────────────────────────────────

	_renderStackedHistogram(pTitle, pBuckets, pMaxValue)
	{
		let tmpBarsHtml = '';
		let tmpMax = Math.max(pMaxValue, 1);

		for (let i = 0; i < pBuckets.length; i++)
		{
			let tmpE = pBuckets[i].extracted;
			let tmpT = pBuckets[i].transformed;
			let tmpW = pBuckets[i].written;

			let tmpEPct = (tmpE / tmpMax) * 100;
			let tmpTPct = (tmpT / tmpMax) * 100;
			let tmpWPct = (tmpW / tmpMax) * 100;

			tmpBarsHtml += '<div style="'
				+ 'display:inline-flex; flex-direction:column-reverse;'
				+ 'width:' + BAR_WIDTH + 'px;'
				+ 'height:' + HISTOGRAM_HEIGHT + 'px;'
				+ 'margin-right:' + BAR_GAP + 'px;'
				+ 'vertical-align:bottom;'
				+ 'align-items:stretch;'
				+ '">';

			// Stacked bottom to top: written (green), transformed (amber), extracted (blue)
			if (tmpW > 0)
			{
				tmpBarsHtml += '<div style="height:' + tmpWPct + '%; background:' + STAGE_COLORS.written.bar + '; transition:height 0.3s;" title="Written: ' + tmpW + '"></div>';
			}
			if (tmpT > 0)
			{
				tmpBarsHtml += '<div style="height:' + tmpTPct + '%; background:' + STAGE_COLORS.transformed.bar + '; transition:height 0.3s;" title="Transformed: ' + tmpT + '"></div>';
			}
			if (tmpE > 0)
			{
				tmpBarsHtml += '<div style="height:' + tmpEPct + '%; background:' + STAGE_COLORS.extracted.bar + '; transition:height 0.3s;" title="Extracted: ' + tmpE + '"></div>';
			}

			tmpBarsHtml += '</div>';
		}

		return '<div style="background:rgba(0,0,0,0.03); border:1px solid var(--facto-border-subtle); border-radius:6px; padding:10px;">'
			+ '<div style="font-size:0.8em; font-weight:600; color:var(--facto-text-heading); margin-bottom:6px;">' + pTitle + ' (stacked)</div>'
			+ '<div style="overflow-x:auto; white-space:nowrap; display:flex; align-items:flex-end; height:' + HISTOGRAM_HEIGHT + 'px; border-bottom:1px solid rgba(0,0,0,0.1);">'
			+ tmpBarsHtml
			+ '</div>'
			+ '</div>';
	}
}

module.exports = FactoThroughputView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Throughput',
	DefaultRenderable: 'Facto-Throughput',
	DefaultDestinationAddress: '#Facto-Section-Throughput',
	Templates:
	[
		{
			Hash: 'Facto-Throughput',
			Template: /*html*/`
<div class="accordion-row">
	<div class="accordion-number" style="color:var(--facto-brand);">⚡</div>
	<div class="accordion-card open">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-throughput')" id="facto-card-throughput-header">
			<span class="accordion-title">Pipeline Throughput</span>
			<span class="accordion-preview">Live pipeline throughput monitoring</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body" id="facto-card-throughput">
			<p style="margin-bottom:12px; color:var(--theme-color-text-secondary, #666); font-size:0.9em;">
				Temporal histograms showing record flow through extraction, transformation, and storage stages.
			</p>
			<div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
				<button id="facto-throughput-toggle" class="primary" onclick="pict.views['Facto-Throughput'].toggleMonitoring()">Start Live Monitoring</button>
				<button class="secondary" onclick="pict.views['Facto-Throughput'].loadRunHistory()">Browse Run History</button>
			</div>
			<div id="facto-throughput-history" style="margin-bottom:12px;"></div>
			<div id="facto-throughput-charts">
				<p style="color:var(--theme-color-text-muted, #aaa); font-style:italic;">Click "Start Live Monitoring" for real-time view, or "Browse Run History" to inspect past runs.</p>
			</div>
			<div id="facto-throughput-datasets" style="margin-top:12px;"></div>
			<style>
				@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
			</style>
		</div>
	</div>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Throughput',
			TemplateHash: 'Facto-Throughput',
			DestinationAddress: '#Facto-Section-Throughput'
		}
	]
};
