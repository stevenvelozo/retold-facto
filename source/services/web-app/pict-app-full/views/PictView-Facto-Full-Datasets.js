const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Datasets",

	DefaultRenderable: "Facto-Full-Datasets-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	Templates:
	[
		{
			Hash: "Facto-Full-Datasets-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Data Sets</h1>
		<p>Manage datasets and their configurations.</p>
	</div>

	<div id="Facto-Full-Datasets-List"></div>
	<div id="Facto-Full-Datasets-Stats" style="display:none; margin-top:1.25em; padding-top:1.25em; border-top:1px solid var(--facto-border-subtle);"></div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Add Dataset</div>
		<div class="facto-inline-group">
			<div>
				<label>Name</label>
				<input type="text" id="Facto-Full-Dataset-Name" placeholder="Dataset name">
			</div>
			<div>
				<label>Type</label>
				<select id="Facto-Full-Dataset-Type">
					<option value="Raw">Raw</option>
					<option value="Compositional">Compositional</option>
					<option value="Projection">Projection</option>
					<option value="Derived">Derived</option>
				</select>
			</div>
			<div>
				<label>Description</label>
				<input type="text" id="Facto-Full-Dataset-Desc" placeholder="Description">
			</div>
		</div>
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Datasets'].addDataset()">Add Dataset</button>
	</div>

	<div id="Facto-Full-Datasets-Status" class="facto-status" style="display:none;"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Datasets-Content",
			TemplateHash: "Facto-Full-Datasets-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullDatasetsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.providers.Facto.loadDatasets().then(
			() => { this.refreshList(); });

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	setStatus(pMessage, pType)
	{
		let tmpEl = document.getElementById('Facto-Full-Datasets-Status');
		if (!tmpEl) return;
		tmpEl.className = 'facto-status facto-status-' + (pType || 'info');
		tmpEl.textContent = pMessage;
		tmpEl.style.display = 'block';
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Datasets-List');
		if (!tmpContainer) return;

		let tmpDatasets = this.pict.AppData.Facto.Datasets;
		if (!tmpDatasets || tmpDatasets.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No datasets yet. Add one below or provision from Source Research.</div>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Description</th><th>Version Policy</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpDatasets.length; i++)
		{
			let tmpDS = tmpDatasets[i];
			let tmpTypeBadge = 'facto-badge-primary';
			if (tmpDS.Type === 'Projection') tmpTypeBadge = 'facto-badge-warning';
			else if (tmpDS.Type === 'Derived') tmpTypeBadge = 'facto-badge-muted';

			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpDS.IDDataset || '') + '</td>';
			tmpHtml += '<td>' + (tmpDS.Name || '') + '</td>';
			tmpHtml += '<td><span class="facto-badge ' + tmpTypeBadge + '">' + (tmpDS.Type || '') + '</span></td>';
			tmpHtml += '<td>' + (tmpDS.Description || '') + '</td>';
			tmpHtml += '<td>' + (tmpDS.VersionPolicy || 'Append') + '</td>';
			tmpHtml += '<td><button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Datasets\'].viewStats(' + tmpDS.IDDataset + ')">Stats</button></td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	viewStats(pIDDataset)
	{
		let tmpStatsContainer = document.getElementById('Facto-Full-Datasets-Stats');
		if (!tmpStatsContainer) return;
		tmpStatsContainer.style.display = 'block';
		tmpStatsContainer.innerHTML = '<p style="color:var(--facto-text-secondary);">Loading stats for Dataset #' + pIDDataset + '...</p>';

		this.pict.providers.Facto.loadDatasetStats(pIDDataset).then(
			(pResponse) =>
			{
				if (pResponse)
				{
					let tmpHtml = '<h3>Dataset #' + pIDDataset + ' Statistics</h3>';
					tmpHtml += '<div class="facto-card-grid" style="margin-top:0.75em;">';
					tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (pResponse.RecordCount || 0) + '</div><div class="facto-dashboard-stat-label">Records</div></div>';
					tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (pResponse.SourceCount || 0) + '</div><div class="facto-dashboard-stat-label">Sources</div></div>';
					tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (pResponse.CurrentVersion || 0) + '</div><div class="facto-dashboard-stat-label">Current Version</div></div>';
					tmpHtml += '</div>';
					tmpHtml += '<div style="margin-top:0.75em;"><button class="facto-btn facto-btn-secondary" onclick="document.getElementById(\'Facto-Full-Datasets-Stats\').style.display=\'none\'">Close</button></div>';
					tmpStatsContainer.innerHTML = tmpHtml;
				}
			});
	}

	addDataset()
	{
		let tmpName = (document.getElementById('Facto-Full-Dataset-Name') || {}).value || '';
		let tmpType = (document.getElementById('Facto-Full-Dataset-Type') || {}).value || '';
		let tmpDesc = (document.getElementById('Facto-Full-Dataset-Desc') || {}).value || '';

		if (!tmpName)
		{
			this.setStatus('Dataset name is required', 'warn');
			return;
		}

		this.pict.providers.Facto.createDataset({ Name: tmpName, Type: tmpType, Description: tmpDesc }).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.IDDataset)
				{
					this.setStatus('Dataset created: ' + tmpName, 'ok');
					document.getElementById('Facto-Full-Dataset-Name').value = '';
					document.getElementById('Facto-Full-Dataset-Desc').value = '';
					return this.pict.providers.Facto.loadDatasets();
				}
				else
				{
					this.setStatus('Error creating dataset', 'error');
				}
			}).then(
			() => { this.refreshList(); });
	}
}

module.exports = FactoFullDatasetsView;

module.exports.default_configuration = _ViewConfiguration;
