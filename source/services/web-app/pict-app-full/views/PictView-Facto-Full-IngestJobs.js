const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-IngestJobs",

	DefaultRenderable: "Facto-Full-IngestJobs-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	Templates:
	[
		{
			Hash: "Facto-Full-IngestJobs-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Ingestion Jobs</h1>
		<p>Monitor and manage data ingestion jobs.</p>
	</div>

	<div id="Facto-Full-IngestJobs-List"></div>
	<div id="Facto-Full-IngestJobs-Status" class="facto-status" style="display:none;"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-IngestJobs-Content",
			TemplateHash: "Facto-Full-IngestJobs-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullIngestJobsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.providers.Facto.loadIngestJobs().then(
			() => { this.refreshList(); }).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error loading ingest jobs: ' + pError.message, {type: 'error'});
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('Facto-Full-IngestJobs-List');
		if (!tmpContainer) return;

		let tmpJobs = this.pict.AppData.Facto.IngestJobs;
		if (!tmpJobs || tmpJobs.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No ingestion jobs yet. Jobs are created automatically when data is ingested.</div>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Source</th><th>Dataset</th><th>Status</th><th>Version</th><th>Records</th><th>Errors</th><th>Created</th></tr></thead><tbody>';
		for (let i = 0; i < tmpJobs.length; i++)
		{
			let tmpJob = tmpJobs[i];
			let tmpStatusBadge = 'facto-badge-muted';
			if (tmpJob.Status === 'Complete') tmpStatusBadge = 'facto-badge-success';
			else if (tmpJob.Status === 'Running') tmpStatusBadge = 'facto-badge-primary';
			else if (tmpJob.Status === 'Error') tmpStatusBadge = 'facto-badge-error';

			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpJob.IDIngestJob || '') + '</td>';
			tmpHtml += '<td>' + (tmpJob.IDSource || '') + '</td>';
			tmpHtml += '<td>' + (tmpJob.IDDataset || '') + '</td>';
			tmpHtml += '<td><span class="facto-badge ' + tmpStatusBadge + '">' + (tmpJob.Status || 'Pending') + '</span></td>';
			tmpHtml += '<td>' + (tmpJob.DatasetVersion || '') + '</td>';
			tmpHtml += '<td>' + (tmpJob.RecordsIngested || 0) + '</td>';
			tmpHtml += '<td>' + (tmpJob.RecordsErrored || 0) + '</td>';
			tmpHtml += '<td>' + (tmpJob.CreatingIDUser ? new Date(tmpJob.CreateDate).toLocaleString() : (tmpJob.CreateDate || '')) + '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}
}

module.exports = FactoFullIngestJobsView;

module.exports.default_configuration = _ViewConfiguration;
