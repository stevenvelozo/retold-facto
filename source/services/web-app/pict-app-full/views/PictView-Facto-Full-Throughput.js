/**
 * PictView-Facto-Full-Throughput
 *
 * Pipeline throughput visualization for the Full (hash-routed) Facto app.
 * Shows live temporal histograms via pict-section-histogram instances.
 * Each histogram has an inline time axis showing start / mid / end ticks.
 */
const libPictView = require('pict-view');
const libPictSectionHistogram = require('pict-section-histogram');

// Histogram definitions — one per pipeline stage plus a combined total
const HISTOGRAM_DEFS =
[
	{ id: 'Facto-Full-Histogram-Extracted',   stage: 'extracted',   color: '#4a90d9', label: 'Extracted' },
	{ id: 'Facto-Full-Histogram-Transformed', stage: 'transformed', color: '#d09818', label: 'Transformed' },
	{ id: 'Facto-Full-Histogram-Written',     stage: 'written',     color: '#3a9468', label: 'Written' },
	{ id: 'Facto-Full-Histogram-Total',       stage: 'total',       color: '#6366f1', label: 'Total' },
];

// Bar geometry — must match _ensureHistogramViews config.
// Width drives the histogram's pixel span: BAR_STRIDE × bucketCount should
// be close to the container width (~568px for a 2-col 1200px layout).
// 30 buckets × 18px = 540px ≈ fills the half-column container.
const BAR_THICKNESS = 16;
const BAR_GAP       = 2;
const BAR_STRIDE    = BAR_THICKNESS + BAR_GAP; // 18px per bucket

const POLL_INTERVAL_MS = 500;

class FactoFullThroughputView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this._pollTimer = null;
		this._isPolling = false;
		this._activeHistoricalRun = null;
		this._activeDatasetFilter = null;
		this._histogramsReady = false;
	}

	onAfterRender()
	{
		this._ensureHistogramViews();
		// Render empty histograms immediately so containers aren't blank
		this._renderHistograms({ buckets: [], interval: 1000 });
		this.loadRunHistory();
	}

	// ─────────────────────────────────────────────
	//  Histogram view management
	// ─────────────────────────────────────────────

	_ensureHistogramViews()
	{
		if (this._histogramsReady) return;

		for (let i = 0; i < HISTOGRAM_DEFS.length; i++)
		{
			let tmpDef = HISTOGRAM_DEFS[i];
			// Container id is deterministic: stage name capitalised
			let tmpContainerId = 'Facto-Full-Histogram-' + _capitalise(tmpDef.stage) + '-Container';

			if (!this.pict.views[tmpDef.id])
			{
				this.pict.addView(tmpDef.id,
					{
						ViewIdentifier:            tmpDef.id,
						AutoRender:                false,
						RenderMode:                'browser',
						Orientation:               'vertical',
						TargetElementAddress:      '#' + tmpContainerId,
						DefaultDestinationAddress: '#' + tmpContainerId,
						MaxBarSize:                100,
						BarThickness:              BAR_THICKNESS,
						BarGap:                    BAR_GAP,
						ShowValues:                false,
						ShowLabels:                false,
						BarColor:                  tmpDef.color,
						Bins:                      [],
					},
					libPictSectionHistogram);
			}
		}

		this._histogramsReady = true;
	}

	/**
	 * Convert a bucket array to a Bins array for pict-section-histogram.
	 * Labels are always empty strings — we draw our own time axis instead.
	 */
	_bucketsToHistogramBins(pBuckets, pStage)
	{
		if (!pBuckets || pBuckets.length === 0) return [];
		return pBuckets.map((pBucket) => ({ Label: '', Value: pBucket[pStage] || 0 }));
	}

	/**
	 * Render a per-histogram time axis: start | mid | end tick labels.
	 * The div is sized to match the histogram pixel width so labels align.
	 */
	_renderTimeAxis(pAxisId, pBuckets)
	{
		let tmpAxisEl = document.getElementById(pAxisId);
		if (!tmpAxisEl) return;

		if (!pBuckets || pBuckets.length < 2)
		{
			tmpAxisEl.innerHTML = '';
			return;
		}

		let tmpWidth = pBuckets.length * BAR_STRIDE;
		tmpAxisEl.style.width = tmpWidth + 'px';

		let tmpFirst  = pBuckets[0].time;
		let tmpMid    = pBuckets[Math.floor((pBuckets.length - 1) / 2)].time;
		let tmpLast   = pBuckets[pBuckets.length - 1].time;

		tmpAxisEl.innerHTML =
			'<span>' + _hhmmss(new Date(tmpFirst)) + '</span>'
			+ '<span style="text-align:center;">' + _hhmmss(new Date(tmpMid)) + '</span>'
			+ '<span style="text-align:right;">' + _hhmmss(new Date(tmpLast)) + '</span>';
	}

	// ─────────────────────────────────────────────
	//  Live monitoring
	// ─────────────────────────────────────────────

	startMonitoring()
	{
		if (this._isPolling) return;
		this._isPolling = true;
		let tmpBtn = document.getElementById('facto-tp-toggle');
		if (tmpBtn) { tmpBtn.textContent = 'Stop Monitoring'; tmpBtn.className = 'facto-btn facto-btn-danger'; }
		this._poll();
	}

	stopMonitoring()
	{
		this._isPolling = false;
		if (this._pollTimer) { clearTimeout(this._pollTimer); this._pollTimer = null; }
		let tmpBtn = document.getElementById('facto-tp-toggle');
		if (tmpBtn) { tmpBtn.textContent = 'Start Live Monitoring'; tmpBtn.className = 'facto-btn facto-btn-primary'; }
	}

	toggleMonitoring()
	{
		this._isPolling ? this.stopMonitoring() : this.startMonitoring();
	}

	_poll()
	{
		if (!this._isPolling) return;
		fetch('/facto/throughput?duration=30')
			.then((r) => r.json())
			.then((d) => { this._renderHistograms(d); this._pollTimer = setTimeout(() => this._poll(), POLL_INTERVAL_MS); })
			.catch(() => { this._pollTimer = setTimeout(() => this._poll(), POLL_INTERVAL_MS * 4); });
	}

	loadRunHistory()
	{
		fetch('/facto/throughput/runs?limit=10')
			.then((r) => r.json())
			.then((runs) => { this._renderRunHistory(runs); })
			.catch(() => {});
	}

	loadHistoricalRun(pLabel)
	{
		this._activeHistoricalRun = pLabel;
		this._activeDatasetFilter = null;
		fetch('/facto/throughput/run/' + encodeURIComponent(pLabel))
			.then((r) => r.json())
			.then((d) => { d.historicalRun = pLabel; this._renderHistograms(d); this._loadDatasetBreakdown(pLabel); })
			.catch(() => {});
	}

	filterByDataset(pDataset)
	{
		if (!this._activeHistoricalRun) return;
		this._activeDatasetFilter = pDataset;
		let tmpUrl = '/facto/throughput/run/' + encodeURIComponent(this._activeHistoricalRun);
		if (pDataset) tmpUrl += '?dataset=' + encodeURIComponent(pDataset);
		fetch(tmpUrl)
			.then((r) => r.json())
			.then((d) => { d.historicalRun = this._activeHistoricalRun; d.datasetFilter = pDataset; this._renderHistograms(d); })
			.catch(() => {});
	}

	_loadDatasetBreakdown(pLabel)
	{
		fetch('/facto/throughput/run/' + encodeURIComponent(pLabel) + '/datasets')
			.then((r) => r.json())
			.then((ds) => { this._renderDatasetBreakdown(ds); })
			.catch(() => {});
	}

	// ─────────────────────────────────────────────
	//  Rendering
	// ─────────────────────────────────────────────

	_renderHistograms(pData)
	{
		let tmpBuckets = pData.buckets || [];
		let tmpInterval = pData.interval || 1000;

		// Compute totals for header badges
		let tmpTotals = { extracted: 0, transformed: 0, written: 0 };
		for (let i = 0; i < tmpBuckets.length; i++)
		{
			tmpTotals.extracted   += tmpBuckets[i].extracted   || 0;
			tmpTotals.transformed += tmpBuckets[i].transformed || 0;
			tmpTotals.written     += tmpBuckets[i].written     || 0;
		}

		// Header badges + run/active info
		let tmpHeaderEl = document.getElementById('facto-tp-header');
		if (tmpHeaderEl)
		{
			let tmpHtml = '<div style="display:flex; gap:20px; flex-wrap:wrap; align-items:center;">';
			tmpHtml += this._badge('Extracted',   tmpTotals.extracted,   '#4a90d9');
			tmpHtml += this._badge('Transformed', tmpTotals.transformed, '#d09818');
			tmpHtml += this._badge('Written',     tmpTotals.written,     '#3a9468');

			if (pData.activeRun)
			{
				let tmpElapsed = ((Date.now() - pData.activeRun.startTime) / 1000).toFixed(1);
				tmpHtml += '<span style="font-size:0.85em; color:var(--facto-text-secondary); display:flex; align-items:center; gap:6px;">'
					+ '<span style="width:8px; height:8px; border-radius:50%; background:var(--facto-success); animation:pulse 1s infinite;"></span>'
					+ pData.activeRun.label + ' (' + tmpElapsed + 's)</span>';
			}
			if (pData.historicalRun)
			{
				tmpHtml += '<span style="font-size:0.85em; color:var(--facto-text-secondary);">Viewing: ' + pData.historicalRun
					+ (pData.datasetFilter ? ' → ' + pData.datasetFilter : '') + '</span>';
			}
			tmpHtml += '</div>';
			tmpHeaderEl.innerHTML = tmpHtml;
		}

		// Feed each histogram view + update its inline time axis
		this._ensureHistogramViews();
		for (let i = 0; i < HISTOGRAM_DEFS.length; i++)
		{
			let tmpDef = HISTOGRAM_DEFS[i];
			let tmpView = this.pict.views[tmpDef.id];
			if (!tmpView) continue;

			let tmpBins = this._bucketsToHistogramBins(tmpBuckets, tmpDef.stage);
			tmpView.setBins(tmpBins);
			tmpView.renderHistogram();

			this._renderTimeAxis('Facto-Full-Histogram-' + _capitalise(tmpDef.stage) + '-Axis', tmpBuckets);
		}
	}

	_badge(pLabel, pCount, pColor)
	{
		return '<div style="display:flex; align-items:center; gap:6px;">'
			+ '<div style="width:10px; height:10px; border-radius:2px; background:' + pColor + ';"></div>'
			+ '<span style="font-weight:600; font-size:0.88em;">' + pLabel + ':</span>'
			+ '<span style="font-size:0.88em; color:var(--facto-text-secondary);">' + pCount.toLocaleString() + '</span>'
			+ '</div>';
	}

	_renderRunHistory(pRuns)
	{
		let tmpEl = document.getElementById('facto-tp-history');
		if (!tmpEl) return;
		if (!pRuns || pRuns.length === 0)
		{
			tmpEl.innerHTML = '<p style="color:var(--facto-text-tertiary); font-size:0.85em; font-style:italic;">No historical runs yet. Run a pipeline ingest first.</p>';
			return;
		}

		let tmpHtml = '<div style="font-size:0.85em; font-weight:600; color:var(--facto-text-heading); margin-bottom:8px;">Run History</div>'
			+ '<div style="display:flex; flex-wrap:wrap; gap:8px;">';
		for (let i = 0; i < pRuns.length; i++)
		{
			let tmpRun = pRuns[i];
			let tmpDate = new Date(tmpRun.startTime).toLocaleString();
			tmpHtml += '<button class="facto-btn facto-btn-secondary" style="font-size:0.8em;" '
				+ 'onclick="pict.views[\'Facto-Full-Throughput\'].loadHistoricalRun(\'' + tmpRun.label.replace(/'/g, "\\'") + '\')" '
				+ 'title="' + tmpDate + ' — ' + tmpRun.eventCount + ' events">'
				+ tmpRun.label.substring(0, 35) + (tmpRun.label.length > 35 ? '...' : '') + '</button>';
		}
		tmpHtml += '</div>';
		tmpEl.innerHTML = tmpHtml;
	}

	_renderDatasetBreakdown(pDatasets)
	{
		let tmpEl = document.getElementById('facto-tp-datasets');
		if (!tmpEl) return;
		if (!pDatasets || pDatasets.length === 0) { tmpEl.innerHTML = ''; return; }

		let tmpMaxTotal = 1;
		for (let i = 0; i < pDatasets.length; i++)
		{
			if (pDatasets[i].total > tmpMaxTotal) tmpMaxTotal = pDatasets[i].total;
		}

		let tmpHtml = '<div style="font-size:0.85em; font-weight:600; color:var(--facto-text-heading); margin-bottom:8px; margin-top:16px;">Per-Dataset Breakdown</div>';
		tmpHtml += '<div style="font-size:0.8em; margin-bottom:6px; color:var(--facto-text-tertiary);">Click a dataset to filter the histogram:</div>';
		for (let i = 0; i < pDatasets.length; i++)
		{
			let tmpDS = pDatasets[i];
			let tmpActive = this._activeDatasetFilter === tmpDS.dataset;
			let tmpDatasetEsc = tmpDS.dataset.replace(/'/g, "\\'");
			tmpHtml += '<div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; cursor:pointer; padding:3px 8px; border-radius:4px; '
				+ (tmpActive ? 'background:var(--facto-brand-a15);' : '') + '" '
				+ 'onclick="pict.views[\'Facto-Full-Throughput\'].filterByDataset(' + (tmpActive ? 'null' : '\'' + tmpDatasetEsc + '\'') + ')">';
			tmpHtml += '<span style="min-width:220px; font-family:monospace; font-size:0.9em; color:var(--facto-text);">' + tmpDS.dataset + '</span>';
			tmpHtml += '<div style="flex:1; height:16px; display:flex; border-radius:3px; overflow:hidden; background:var(--facto-bg-elevated);">';
			if (tmpDS.extracted   > 0) tmpHtml += '<div style="width:' + ((tmpDS.extracted   / tmpMaxTotal) * 100) + '%; background:#4a90d9;" title="Extracted: '   + tmpDS.extracted   + '"></div>';
			if (tmpDS.transformed > 0) tmpHtml += '<div style="width:' + ((tmpDS.transformed / tmpMaxTotal) * 100) + '%; background:#d09818;" title="Transformed: ' + tmpDS.transformed + '"></div>';
			if (tmpDS.written     > 0) tmpHtml += '<div style="width:' + ((tmpDS.written     / tmpMaxTotal) * 100) + '%; background:#3a9468;" title="Written: '     + tmpDS.written     + '"></div>';
			tmpHtml += '</div>';
			tmpHtml += '<span style="min-width:60px; text-align:right; font-size:0.85em; color:var(--facto-text-secondary);">' + tmpDS.total.toLocaleString() + '</span></div>';
		}
		tmpEl.innerHTML = tmpHtml;
	}
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function _hhmmss(pDate)
{
	return String(pDate.getHours()).padStart(2, '0')
		+ ':' + String(pDate.getMinutes()).padStart(2, '0')
		+ ':' + String(pDate.getSeconds()).padStart(2, '0');
}

function _capitalise(pStr)
{
	if (!pStr) return '';
	return pStr.charAt(0).toUpperCase() + pStr.slice(1);
}

module.exports = FactoFullThroughputView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Full-Throughput',
	DefaultRenderable: 'Facto-Full-Throughput-Content',
	DefaultDestinationAddress: '#Facto-Full-Content-Container',
	AutoRender: false,
	Templates:
	[
		{
			Hash: 'Facto-Full-Throughput-Template',
			Template: /*html*/`
<div style="max-width:1200px; margin:0 auto;">
	<h2 style="margin-bottom:4px;">Pipeline Throughput</h2>
	<p style="color:var(--facto-text-secondary); margin-bottom:12px; font-size:0.9em;">
		Temporal histograms showing record flow through extraction, transformation, and storage stages.
	</p>

	<div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
		<button id="facto-tp-toggle" class="facto-btn facto-btn-primary" onclick="pict.views['Facto-Full-Throughput'].toggleMonitoring()">Start Live Monitoring</button>
		<button class="facto-btn facto-btn-secondary" onclick="pict.views['Facto-Full-Throughput'].loadRunHistory()">Refresh History</button>
	</div>

	<div id="facto-tp-header" style="margin-bottom:12px;"></div>

	<div id="facto-tp-history" style="margin-bottom:16px;"></div>

	<div id="facto-tp-charts">
		<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">

			<div style="background:rgba(74,144,217,0.1); border-radius:8px; padding:12px;">
				<div style="font-size:0.85em; font-weight:600; color:#4a90d9; margin-bottom:6px;">Extracted</div>
				<div style="overflow-x:auto;">
					<div id="Facto-Full-Histogram-Extracted-Container"></div>
					<div id="Facto-Full-Histogram-Extracted-Axis"
						style="display:flex; justify-content:space-between; font-size:0.72em; font-family:monospace;
						       color:var(--facto-text-tertiary); margin-top:3px; padding-top:3px;
						       border-top:1px solid rgba(74,144,217,0.3);"></div>
				</div>
			</div>

			<div style="background:rgba(208,152,24,0.1); border-radius:8px; padding:12px;">
				<div style="font-size:0.85em; font-weight:600; color:#d09818; margin-bottom:6px;">Transformed</div>
				<div style="overflow-x:auto;">
					<div id="Facto-Full-Histogram-Transformed-Container"></div>
					<div id="Facto-Full-Histogram-Transformed-Axis"
						style="display:flex; justify-content:space-between; font-size:0.72em; font-family:monospace;
						       color:var(--facto-text-tertiary); margin-top:3px; padding-top:3px;
						       border-top:1px solid rgba(208,152,24,0.3);"></div>
				</div>
			</div>

			<div style="background:rgba(58,148,104,0.1); border-radius:8px; padding:12px;">
				<div style="font-size:0.85em; font-weight:600; color:#3a9468; margin-bottom:6px;">Written</div>
				<div style="overflow-x:auto;">
					<div id="Facto-Full-Histogram-Written-Container"></div>
					<div id="Facto-Full-Histogram-Written-Axis"
						style="display:flex; justify-content:space-between; font-size:0.72em; font-family:monospace;
						       color:var(--facto-text-tertiary); margin-top:3px; padding-top:3px;
						       border-top:1px solid rgba(58,148,104,0.3);"></div>
				</div>
			</div>

			<div style="background:var(--facto-bg-elevated); border:1px solid var(--facto-border-subtle); border-radius:8px; padding:12px;">
				<div style="font-size:0.85em; font-weight:600; color:#6366f1; margin-bottom:6px;">Total</div>
				<div style="overflow-x:auto;">
					<div id="Facto-Full-Histogram-Total-Container"></div>
					<div id="Facto-Full-Histogram-Total-Axis"
						style="display:flex; justify-content:space-between; font-size:0.72em; font-family:monospace;
						       color:var(--facto-text-tertiary); margin-top:3px; padding-top:3px;
						       border-top:1px solid rgba(99,102,241,0.3);"></div>
				</div>
			</div>

		</div>
	</div>

	<div id="facto-tp-datasets"></div>

	<style>
		@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
	</style>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Full-Throughput-Content',
			TemplateHash: 'Facto-Full-Throughput-Template',
			DestinationAddress: '#Facto-Full-Content-Container'
		}
	]
};
