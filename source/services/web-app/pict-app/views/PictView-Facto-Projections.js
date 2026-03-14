const libPictView = require('pict-view');

class FactoProjectionsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		this.loadSummary();
	}

	loadSummary()
	{
		this.pict.providers.Facto.loadProjectionSummary().then(
			(pResponse) =>
			{
				let tmpContainer = document.getElementById('facto-projections-summary');
				if (!tmpContainer || !pResponse) return;

				let tmpHtml = '<table><tbody>';
				tmpHtml += '<tr><td style="font-weight:600;">Sources</td><td>' + (pResponse.Sources || 0) + '</td>';
				tmpHtml += '<td style="font-weight:600;">Datasets</td><td>' + (pResponse.Datasets || 0) + '</td></tr>';
				tmpHtml += '<tr><td style="font-weight:600;">Records</td><td>' + (pResponse.Records || 0) + '</td>';
				tmpHtml += '<td style="font-weight:600;">Certainty Indices</td><td>' + (pResponse.CertaintyIndices || 0) + '</td></tr>';
				tmpHtml += '<tr><td style="font-weight:600;">Ingest Jobs</td><td>' + (pResponse.IngestJobs || 0) + '</td>';
				tmpHtml += '<td></td><td></td></tr>';

				if (pResponse.DatasetsByType)
				{
					tmpHtml += '<tr><td colspan="4" style="padding-top:12px; font-weight:600; border-bottom:2px solid #ddd;">Datasets by Type</td></tr>';
					tmpHtml += '<tr>';
					tmpHtml += '<td><span class="badge badge-raw">Raw</span></td><td>' + (pResponse.DatasetsByType.Raw || 0) + '</td>';
					tmpHtml += '<td><span class="badge badge-compositional">Compositional</span></td><td>' + (pResponse.DatasetsByType.Compositional || 0) + '</td>';
					tmpHtml += '</tr><tr>';
					tmpHtml += '<td><span class="badge badge-projection">Projection</span></td><td>' + (pResponse.DatasetsByType.Projection || 0) + '</td>';
					tmpHtml += '<td><span class="badge badge-derived">Derived</span></td><td>' + (pResponse.DatasetsByType.Derived || 0) + '</td>';
					tmpHtml += '</tr>';
				}

				tmpHtml += '</tbody></table>';
				tmpContainer.innerHTML = tmpHtml;
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-projections-status', 'Error loading summary: ' + pError.message, 'error');
			});
	}

	runQuery()
	{
		let tmpDatasetIDsRaw = (document.getElementById('facto-proj-dataset-ids') || {}).value || '';
		let tmpType = (document.getElementById('facto-proj-type') || {}).value || '';
		let tmpCertaintyThreshold = parseFloat((document.getElementById('facto-proj-certainty') || {}).value) || 0;
		let tmpTimeStart = (document.getElementById('facto-proj-time-start') || {}).value || '';
		let tmpTimeStop = (document.getElementById('facto-proj-time-stop') || {}).value || '';

		let tmpDatasetIDs = tmpDatasetIDsRaw.split(',').map(function(s) { return parseInt(s.trim(), 10); }).filter(function(n) { return !isNaN(n) && n > 0; });
		if (tmpDatasetIDs.length === 0)
		{
			this.pict.providers.Facto.setStatus('facto-projections-status', 'Enter at least one Dataset ID', 'warn');
			return;
		}

		let tmpParams = { DatasetIDs: tmpDatasetIDs, Begin: 0, Cap: 100 };
		if (tmpType) tmpParams.Type = tmpType;
		if (tmpCertaintyThreshold > 0) tmpParams.CertaintyThreshold = tmpCertaintyThreshold;
		if (tmpTimeStart) tmpParams.TimeRangeStart = parseInt(tmpTimeStart, 10) || 0;
		if (tmpTimeStop) tmpParams.TimeRangeStop = parseInt(tmpTimeStop, 10) || 0;

		this.pict.providers.Facto.setStatus('facto-projections-status', 'Querying...', 'info');

		this.pict.providers.Facto.queryRecords(tmpParams).then(
			(pResponse) =>
			{
				this.pict.providers.Facto.clearStatus('facto-projections-status');
				this.refreshResults(pResponse);
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-projections-status', 'Query error: ' + pError.message, 'error');
			});
	}

	runCompare()
	{
		let tmpDatasetIDsRaw = (document.getElementById('facto-proj-dataset-ids') || {}).value || '';
		let tmpDatasetIDs = tmpDatasetIDsRaw.split(',').map(function(s) { return parseInt(s.trim(), 10); }).filter(function(n) { return !isNaN(n) && n > 0; });

		if (tmpDatasetIDs.length === 0)
		{
			this.pict.providers.Facto.setStatus('facto-projections-status', 'Enter at least one Dataset ID', 'warn');
			return;
		}

		this.pict.providers.Facto.setStatus('facto-projections-status', 'Comparing...', 'info');

		this.pict.providers.Facto.compareDatasets(tmpDatasetIDs).then(
			(pResponse) =>
			{
				this.pict.providers.Facto.clearStatus('facto-projections-status');
				let tmpContainer = document.getElementById('facto-projections-results');
				if (!tmpContainer || !pResponse || !pResponse.Datasets) return;

				let tmpHtml = '<h4 style="margin:12px 0 8px; font-size:0.95em;">Dataset Comparison</h4>';
				tmpHtml += '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Records</th><th>Sources</th></tr></thead><tbody>';
				for (let i = 0; i < pResponse.Datasets.length; i++)
				{
					let tmpDS = pResponse.Datasets[i];
					let tmpTypeLower = (tmpDS.Type || '').toLowerCase();
					tmpHtml += '<tr>';
					tmpHtml += '<td>' + (tmpDS.IDDataset || '') + '</td>';
					tmpHtml += '<td>' + (tmpDS.Name || '') + '</td>';
					tmpHtml += '<td><span class="badge badge-' + tmpTypeLower + '">' + (tmpDS.Type || '') + '</span></td>';
					tmpHtml += '<td>' + (tmpDS.RecordCount || 0) + '</td>';
					tmpHtml += '<td>' + (tmpDS.SourceCount || 0) + '</td>';
					tmpHtml += '</tr>';
				}
				tmpHtml += '</tbody></table>';
				tmpContainer.innerHTML = tmpHtml;
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-projections-status', 'Compare error: ' + pError.message, 'error');
			});
	}

	refreshResults(pResponse)
	{
		let tmpContainer = document.getElementById('facto-projections-results');
		if (!tmpContainer) return;

		if (!pResponse || !pResponse.Records || pResponse.Records.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No records match the query.</p>';
			return;
		}

		let tmpHtml = '<h4 style="margin:12px 0 8px; font-size:0.95em;">Query Results (' + (pResponse.Count || pResponse.Records.length) + ' records)</h4>';
		tmpHtml += '<table><thead><tr><th>ID</th><th>Dataset</th><th>Source</th><th>Type</th><th>Version</th><th>Ingest Date</th><th>Content</th></tr></thead><tbody>';
		for (let i = 0; i < pResponse.Records.length; i++)
		{
			let tmpRecord = pResponse.Records[i];
			let tmpContent = tmpRecord.Content || '';
			if (tmpContent.length > 80) tmpContent = tmpContent.substring(0, 80) + '...';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpRecord.IDRecord || '') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.IDDataset || '') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.IDSource || '') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.Type || '') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.Version || 1) + '</td>';
			tmpHtml += '<td>' + (tmpRecord.IngestDate || '-') + '</td>';
			tmpHtml += '<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + tmpContent + '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}
}

module.exports = FactoProjectionsView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Projections',
	DefaultRenderable: 'Facto-Projections',
	DefaultDestinationAddress: '#Facto-Section-Projections',
	Templates:
	[
		{
			Hash: 'Facto-Projections',
			Template: /*html*/`
<div class="accordion-row">
	<div class="accordion-number">5</div>
	<div class="accordion-card" id="facto-card-projections">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-projections')">
			<span class="accordion-title">Projections</span>
			<span class="accordion-preview">Cross-dataset queries and warehouse statistics</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Query across datasets, compare data, and view warehouse-wide statistics.</p>

			<h3 style="margin-bottom:8px; font-size:1em; color:#444;">Warehouse Summary</h3>
			<div id="facto-projections-summary" style="margin-bottom:16px;"><p style="color:#888; font-style:italic;">Loading...</p></div>

			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Cross-Dataset Query</h3>
			<div class="inline-group">
				<div>
					<label for="facto-proj-dataset-ids">Dataset IDs (comma-separated)</label>
					<input type="text" id="facto-proj-dataset-ids" placeholder="1,2,3">
				</div>
				<div>
					<label for="facto-proj-type">Record Type (optional)</label>
					<input type="text" id="facto-proj-type" placeholder="e.g. enrollment">
				</div>
			</div>
			<div class="inline-group">
				<div>
					<label for="facto-proj-certainty">Min Certainty (0-1)</label>
					<input type="text" id="facto-proj-certainty" placeholder="0.0">
				</div>
				<div>
					<label for="facto-proj-time-start">Time Range Start</label>
					<input type="text" id="facto-proj-time-start" placeholder="timestamp">
				</div>
				<div>
					<label for="facto-proj-time-stop">Time Range Stop</label>
					<input type="text" id="facto-proj-time-stop" placeholder="timestamp">
				</div>
			</div>
			<button class="primary" onclick="pict.views['Facto-Projections'].runQuery()">Query</button>
			<button class="secondary" onclick="pict.views['Facto-Projections'].runCompare()">Compare Datasets</button>
			<button class="secondary" onclick="pict.views['Facto-Projections'].loadSummary()">Refresh Summary</button>

			<div id="facto-projections-results" style="margin-top:16px;"></div>
			<div id="facto-projections-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Projections',
			TemplateHash: 'Facto-Projections',
			DestinationAddress: '#Facto-Section-Projections'
		}
	]
};
