const libPictView = require('pict-view');

class FactoIngestView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		this.pict.providers.Facto.loadIngestJobs().then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error loading jobs: ' + pError.message, 'error');
			});
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('facto-ingest-list');
		if (!tmpContainer) return;

		let tmpJobs = this.pict.AppData.Facto.IngestJobs;
		if (!tmpJobs || tmpJobs.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No ingest jobs yet.</p>';
			return;
		}

		let tmpStatusColors = { Pending: '#ffc107', Running: '#17a2b8', Completed: '#28a745', Failed: '#dc3545', Cancelled: '#6c757d' };

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Status</th><th>Source</th><th>Dataset</th><th>Processed</th><th>Created</th><th>Errors</th><th>Start</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpJobs.length; i++)
		{
			let tmpJob = tmpJobs[i];
			let tmpColor = tmpStatusColors[tmpJob.Status] || '#888';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpJob.IDIngestJob || '') + '</td>';
			tmpHtml += '<td><span style="color:' + tmpColor + '; font-weight:600;">' + (tmpJob.Status || '') + '</span></td>';
			tmpHtml += '<td>' + (tmpJob.IDSource || '') + '</td>';
			tmpHtml += '<td>' + (tmpJob.IDDataset || '') + '</td>';
			tmpHtml += '<td>' + (tmpJob.RecordsProcessed || 0) + '</td>';
			tmpHtml += '<td>' + (tmpJob.RecordsCreated || 0) + '</td>';
			tmpHtml += '<td>' + (tmpJob.RecordsErrored || 0) + '</td>';
			tmpHtml += '<td>' + (tmpJob.StartDate || '-') + '</td>';
			tmpHtml += '<td>';
			if (tmpJob.Status === 'Pending')
			{
				tmpHtml += '<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Ingest\'].startJob(' + tmpJob.IDIngestJob + ')">Start</button>';
			}
			tmpHtml += '<button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Ingest\'].viewLog(' + tmpJob.IDIngestJob + ')">Log</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	startJob(pIDIngestJob)
	{
		this.pict.providers.Facto.startIngestJob(pIDIngestJob).then(
			() =>
			{
				this.pict.providers.Facto.setStatus('facto-ingest-status', 'Job #' + pIDIngestJob + ' started', 'ok');
				return this.pict.providers.Facto.loadIngestJobs();
			}).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error: ' + pError.message, 'error');
			});
	}

	viewLog(pIDIngestJob)
	{
		this.pict.providers.Facto.loadIngestJobDetails(pIDIngestJob).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Job)
				{
					let tmpLog = pResponse.Job.Log || '(empty)';
					let tmpLogContainer = document.getElementById('facto-ingest-log');
					if (tmpLogContainer)
					{
						tmpLogContainer.textContent = 'Job #' + pIDIngestJob + ' Log:\n' + tmpLog;
						tmpLogContainer.style.display = 'block';
					}
				}
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error: ' + pError.message, 'error');
			});
	}

	ingestPastedContent()
	{
		let tmpIDDataset = parseInt((document.getElementById('facto-ingest-paste-dataset') || {}).value, 10) || 0;
		let tmpIDSource = parseInt((document.getElementById('facto-ingest-paste-source') || {}).value, 10) || 0;
		let tmpFormat = (document.getElementById('facto-ingest-paste-format') || {}).value || 'Auto';
		let tmpType = (document.getElementById('facto-ingest-paste-type') || {}).value || 'data';
		let tmpContent = (document.getElementById('facto-ingest-paste-content') || {}).value || '';

		if (!tmpContent.trim())
		{
			this.pict.providers.Facto.setStatus('facto-ingest-status', 'Content is required', 'warn');
			return;
		}

		this.pict.providers.Facto.setStatus('facto-ingest-status', 'Ingesting...', 'info');

		this.pict.providers.Facto.ingestFileContent(tmpIDDataset, tmpIDSource, tmpContent, tmpFormat, tmpType).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					this.pict.providers.Facto.setStatus('facto-ingest-status',
						'Ingested ' + (pResponse.RecordsCreated || 0) + ' records', 'ok');
					if (document.getElementById('facto-ingest-paste-content'))
					{
						document.getElementById('facto-ingest-paste-content').value = '';
					}
				}
				else
				{
					this.pict.providers.Facto.setStatus('facto-ingest-status',
						'Ingest error: ' + ((pResponse && pResponse.Error) || 'Unknown'), 'error');
				}
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error: ' + pError.message, 'error');
			});
	}

	createJob()
	{
		let tmpIDSource = parseInt((document.getElementById('facto-ingest-source') || {}).value, 10) || 0;
		let tmpIDDataset = parseInt((document.getElementById('facto-ingest-dataset') || {}).value, 10) || 0;

		if (!tmpIDSource || !tmpIDDataset)
		{
			this.pict.providers.Facto.setStatus('facto-ingest-status', 'Source ID and Dataset ID are required', 'warn');
			return;
		}

		this.pict.providers.Facto.createIngestJob(tmpIDSource, tmpIDDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					this.pict.providers.Facto.setStatus('facto-ingest-status', 'Ingest job created: #' + pResponse.Job.IDIngestJob, 'ok');
					if (document.getElementById('facto-ingest-source')) document.getElementById('facto-ingest-source').value = '';
					if (document.getElementById('facto-ingest-dataset')) document.getElementById('facto-ingest-dataset').value = '';
					return this.pict.providers.Facto.loadIngestJobs();
				}
				else
				{
					this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error creating job', 'error');
				}
			}).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-ingest-status', 'Error: ' + pError.message, 'error');
			});
	}
}

module.exports = FactoIngestView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Ingest',
	DefaultRenderable: 'Facto-Ingest',
	DefaultDestinationAddress: '#Facto-Section-Ingest',
	Templates:
	[
		{
			Hash: 'Facto-Ingest',
			Template: /*html*/`
<div class="accordion-row">
	<div class="accordion-number">4</div>
	<div class="accordion-card" id="facto-card-ingest">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-ingest')">
			<span class="accordion-title">Ingest Jobs</span>
			<span class="accordion-preview">Download, parse, and store datasets</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Track data ingest operations from configured sources into datasets.</p>
			<div id="facto-ingest-list"></div>

			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Create Ingest Job</h3>
			<div class="inline-group">
				<div>
					<label for="facto-ingest-source">Source ID</label>
					<input type="number" id="facto-ingest-source" placeholder="1">
				</div>
				<div>
					<label for="facto-ingest-dataset">Dataset ID</label>
					<input type="number" id="facto-ingest-dataset" placeholder="1">
				</div>
			</div>
			<button class="primary" onclick="pict.views['Facto-Ingest'].createJob()">Create Job</button>

			<pre id="facto-ingest-log" style="display:none; margin-top:12px; padding:12px; background:#f8f9fa; border:1px solid #e9ecef; border-radius:4px; font-size:0.85em; max-height:200px; overflow:auto; white-space:pre-wrap;"></pre>

			<h3 style="margin-top:20px; margin-bottom:8px; font-size:1em; color:#444;">Paste &amp; Ingest</h3>
			<p style="margin-bottom:8px; color:#666; font-size:0.85em;">Paste CSV or JSON content directly to ingest records.</p>
			<div class="inline-group">
				<div>
					<label for="facto-ingest-paste-dataset">Dataset ID</label>
					<input type="number" id="facto-ingest-paste-dataset" placeholder="1">
				</div>
				<div>
					<label for="facto-ingest-paste-source">Source ID</label>
					<input type="number" id="facto-ingest-paste-source" placeholder="1">
				</div>
				<div>
					<label for="facto-ingest-paste-format">Format</label>
					<select id="facto-ingest-paste-format">
						<option value="Auto">Auto-Detect</option>
						<option value="CSV">CSV</option>
						<option value="JSON">JSON</option>
					</select>
				</div>
				<div>
					<label for="facto-ingest-paste-type">Record Type</label>
					<input type="text" id="facto-ingest-paste-type" placeholder="data">
				</div>
			</div>
			<textarea id="facto-ingest-paste-content" rows="6" style="width:100%; padding:8px 12px; border:1px solid #ccc; border-radius:4px; font-size:0.9em; font-family:monospace; margin-bottom:10px;" placeholder="Paste CSV or JSON data here..."></textarea>
			<button class="primary" onclick="pict.views['Facto-Ingest'].ingestPastedContent()">Ingest</button>

			<div id="facto-ingest-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Ingest',
			TemplateHash: 'Facto-Ingest',
			DestinationAddress: '#Facto-Section-Ingest'
		}
	]
};
