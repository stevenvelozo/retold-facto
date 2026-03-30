/**
 * PictView-Facto-Full-Throughput
 *
 * Pipeline throughput visualization for the Full (hash-routed) Facto app.
 * Shows live temporal histograms and historical run browsing.
 */
const libPictView = require('pict-view');

const STAGE_COLORS =
{
	extracted:   { bar: '#4a90d9', bg: 'rgba(74,144,217,0.15)', label: 'Extracted' },
	transformed: { bar: '#d09818', bg: 'rgba(208,152,24,0.15)', label: 'Transformed' },
	written:     { bar: '#3a9468', bg: 'rgba(58,148,104,0.15)', label: 'Written' },
};

const HISTOGRAM_HEIGHT = 100;
const BAR_WIDTH = 6;
const BAR_GAP = 2;
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
	}

	onAfterRender()
	{
		// Auto-load run history on render
		this.loadRunHistory();
	}

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
		let tmpStackedMax = 1;
		for (let i = 0; i < tmpBuckets.length; i++)
		{
			let t = tmpBuckets[i].extracted + tmpBuckets[i].transformed + tmpBuckets[i].written;
			if (t > tmpStackedMax) tmpStackedMax = t;
		}

		let tmpContainer = document.getElementById('facto-tp-charts');
		if (!tmpContainer) return;

		let tmpHtml = '';

		// Header with totals
		tmpHtml += '<div style="display:flex; gap:24px; margin-bottom:16px; flex-wrap:wrap; align-items:center;">';
		tmpHtml += this._badge('Extracted', tmpTotals.extracted, STAGE_COLORS.extracted.bar);
		tmpHtml += this._badge('Transformed', tmpTotals.transformed, STAGE_COLORS.transformed.bar);
		tmpHtml += this._badge('Written', tmpTotals.written, STAGE_COLORS.written.bar);
		if (pData.activeRun)
		{
			let elapsed = ((Date.now() - pData.activeRun.startTime) / 1000).toFixed(1);
			tmpHtml += '<span style="font-size:0.85em; color:var(--facto-text-secondary); display:flex; align-items:center; gap:6px;">'
				+ '<span style="width:8px; height:8px; border-radius:50%; background:var(--facto-success); animation:pulse 1s infinite;"></span>'
				+ pData.activeRun.label + ' (' + elapsed + 's)</span>';
		}
		if (pData.historicalRun)
		{
			tmpHtml += '<span style="font-size:0.85em; color:var(--facto-text-secondary);">Viewing: ' + pData.historicalRun
				+ (pData.datasetFilter ? ' → ' + pData.datasetFilter : '') + '</span>';
		}
		tmpHtml += '</div>';

		// Histograms in 2x2 grid
		tmpHtml += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">';
		tmpHtml += this._singleHistogram('Extracted', 'extracted', tmpBuckets, tmpMaxValue);
		tmpHtml += this._singleHistogram('Transformed', 'transformed', tmpBuckets, tmpMaxValue);
		tmpHtml += this._singleHistogram('Written', 'written', tmpBuckets, tmpMaxValue);
		tmpHtml += this._stackedHistogram('Combined', tmpBuckets, tmpStackedMax);
		tmpHtml += '</div>';

		tmpContainer.innerHTML = tmpHtml;
	}

	_badge(pLabel, pCount, pColor)
	{
		return '<div style="display:flex; align-items:center; gap:6px;">'
			+ '<div style="width:12px; height:12px; border-radius:2px; background:' + pColor + ';"></div>'
			+ '<span style="font-weight:600; font-size:0.9em;">' + pLabel + ':</span>'
			+ '<span style="font-size:0.9em; color:var(--facto-text-secondary);">' + pCount.toLocaleString() + '</span></div>';
	}

	_singleHistogram(pTitle, pStage, pBuckets, pMax)
	{
		let c = STAGE_COLORS[pStage];
		let bars = '';
		let m = Math.max(pMax, 1);
		for (let i = 0; i < pBuckets.length; i++)
		{
			let v = pBuckets[i][pStage];
			let pct = (v / m) * 100;
			bars += '<div style="display:inline-block; width:' + BAR_WIDTH + 'px; height:' + HISTOGRAM_HEIGHT + 'px; margin-right:' + BAR_GAP + 'px; position:relative; vertical-align:bottom;">'
				+ '<div style="position:absolute; bottom:0; left:0; right:0; height:' + pct + '%; background:' + (v > 0 ? c.bar : 'transparent') + '; border-radius:1px 1px 0 0; transition:height 0.3s;" title="' + v + '"></div></div>';
		}
		return '<div style="background:' + c.bg + '; border-radius:8px; padding:12px;">'
			+ '<div style="font-size:0.85em; font-weight:600; color:' + c.bar + '; margin-bottom:8px;">' + pTitle + '</div>'
			+ '<div style="overflow-x:auto; white-space:nowrap; display:flex; align-items:flex-end; height:' + HISTOGRAM_HEIGHT + 'px; border-bottom:1px solid rgba(0,0,0,0.1);">' + bars + '</div></div>';
	}

	_stackedHistogram(pTitle, pBuckets, pMax)
	{
		let bars = '';
		let m = Math.max(pMax, 1);
		for (let i = 0; i < pBuckets.length; i++)
		{
			let e = pBuckets[i].extracted, t = pBuckets[i].transformed, w = pBuckets[i].written;
			bars += '<div style="display:inline-flex; flex-direction:column-reverse; width:' + BAR_WIDTH + 'px; height:' + HISTOGRAM_HEIGHT + 'px; margin-right:' + BAR_GAP + 'px; vertical-align:bottom; align-items:stretch;">';
			if (w > 0) bars += '<div style="height:' + ((w/m)*100) + '%; background:' + STAGE_COLORS.written.bar + '; transition:height 0.3s;" title="Written: ' + w + '"></div>';
			if (t > 0) bars += '<div style="height:' + ((t/m)*100) + '%; background:' + STAGE_COLORS.transformed.bar + '; transition:height 0.3s;" title="Transformed: ' + t + '"></div>';
			if (e > 0) bars += '<div style="height:' + ((e/m)*100) + '%; background:' + STAGE_COLORS.extracted.bar + '; transition:height 0.3s;" title="Extracted: ' + e + '"></div>';
			bars += '</div>';
		}
		return '<div style="background:var(--facto-bg-elevated); border:1px solid var(--facto-border-subtle); border-radius:8px; padding:12px;">'
			+ '<div style="font-size:0.85em; font-weight:600; color:var(--facto-text-heading); margin-bottom:8px;">' + pTitle + ' (stacked)</div>'
			+ '<div style="overflow-x:auto; white-space:nowrap; display:flex; align-items:flex-end; height:' + HISTOGRAM_HEIGHT + 'px; border-bottom:1px solid rgba(0,0,0,0.1);">' + bars + '</div></div>';
	}

	_renderRunHistory(pRuns)
	{
		let c = document.getElementById('facto-tp-history');
		if (!c) return;
		if (!pRuns || pRuns.length === 0) { c.innerHTML = '<p style="color:var(--facto-text-tertiary); font-size:0.85em; font-style:italic;">No historical runs yet. Run a pipeline ingest first.</p>'; return; }

		let h = '<div style="font-size:0.85em; font-weight:600; color:var(--facto-text-heading); margin-bottom:8px;">Run History</div><div style="display:flex; flex-wrap:wrap; gap:8px;">';
		for (let i = 0; i < pRuns.length; i++)
		{
			let r = pRuns[i];
			let d = new Date(r.startTime).toLocaleString();
			h += '<button class="facto-btn facto-btn-secondary" style="font-size:0.8em;" onclick="pict.views[\'Facto-Full-Throughput\'].loadHistoricalRun(\'' + r.label.replace(/'/g, "\\'") + '\')" title="' + d + ' — ' + r.eventCount + ' events">'
				+ r.label.substring(0, 35) + (r.label.length > 35 ? '...' : '') + '</button>';
		}
		h += '</div>';
		c.innerHTML = h;
	}

	_renderDatasetBreakdown(pDatasets)
	{
		let c = document.getElementById('facto-tp-datasets');
		if (!c) return;
		if (!pDatasets || pDatasets.length === 0) { c.innerHTML = ''; return; }

		let maxTotal = 1;
		for (let i = 0; i < pDatasets.length; i++) { if (pDatasets[i].total > maxTotal) maxTotal = pDatasets[i].total; }

		let h = '<div style="font-size:0.85em; font-weight:600; color:var(--facto-text-heading); margin-bottom:8px; margin-top:16px;">Per-Dataset Breakdown</div>';
		h += '<div style="font-size:0.8em; margin-bottom:6px; color:var(--facto-text-tertiary);">Click a dataset to filter the histogram:</div>';
		for (let i = 0; i < pDatasets.length; i++)
		{
			let ds = pDatasets[i];
			let active = this._activeDatasetFilter === ds.dataset;
			h += '<div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; cursor:pointer; padding:3px 8px; border-radius:4px; '
				+ (active ? 'background:var(--facto-brand-a15);' : '') + '" onclick="pict.views[\'Facto-Full-Throughput\'].filterByDataset(' + (active ? 'null' : '\'' + ds.dataset.replace(/'/g, "\\'") + '\'') + ')">';
			h += '<span style="min-width:220px; font-family:monospace; font-size:0.9em; color:var(--facto-text);">' + ds.dataset + '</span>';
			h += '<div style="flex:1; height:16px; display:flex; border-radius:3px; overflow:hidden; background:var(--facto-bg-elevated);">';
			if (ds.extracted > 0) h += '<div style="width:' + ((ds.extracted/maxTotal)*100) + '%; background:' + STAGE_COLORS.extracted.bar + ';" title="Extracted: ' + ds.extracted + '"></div>';
			if (ds.transformed > 0) h += '<div style="width:' + ((ds.transformed/maxTotal)*100) + '%; background:' + STAGE_COLORS.transformed.bar + ';" title="Transformed: ' + ds.transformed + '"></div>';
			if (ds.written > 0) h += '<div style="width:' + ((ds.written/maxTotal)*100) + '%; background:' + STAGE_COLORS.written.bar + ';" title="Written: ' + ds.written + '"></div>';
			h += '</div>';
			h += '<span style="min-width:60px; text-align:right; font-size:0.85em; color:var(--facto-text-secondary);">' + ds.total.toLocaleString() + '</span></div>';
		}
		c.innerHTML = h;
	}
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
	<p style="color:var(--facto-text-secondary); margin-bottom:16px; font-size:0.9em;">
		Temporal histograms showing record flow through extraction, transformation, and storage stages.
	</p>
	<div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
		<button id="facto-tp-toggle" class="facto-btn facto-btn-primary" onclick="pict.views['Facto-Full-Throughput'].toggleMonitoring()">Start Live Monitoring</button>
		<button class="facto-btn facto-btn-secondary" onclick="pict.views['Facto-Full-Throughput'].loadRunHistory()">Refresh History</button>
	</div>
	<div id="facto-tp-history" style="margin-bottom:16px;"></div>
	<div id="facto-tp-charts">
		<p style="color:var(--facto-text-tertiary); font-style:italic;">Click "Start Live Monitoring" for real-time view, or select a run from the history above.</p>
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
