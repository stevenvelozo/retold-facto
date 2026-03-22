const libPictView = require('pict-view');

class FactoDatasetsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		this.pict.providers.Facto.loadDatasets().then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error loading datasets: ' + pError.message, {type: 'error'});
			});
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('facto-datasets-list');
		if (!tmpContainer) return;

		let tmpDatasets = this.pict.AppData.Facto.Datasets;
		if (!tmpDatasets || tmpDatasets.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No datasets created yet.</p>';
			return;
		}

		let tmpBadgeClass = { Raw: 'badge-raw', Compositional: 'badge-compositional', Projection: 'badge-projection', Derived: 'badge-derived' };

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>Description</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpDatasets.length; i++)
		{
			let tmpDataset = tmpDatasets[i];
			let tmpBadge = tmpBadgeClass[tmpDataset.Type] || 'badge-raw';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpDataset.IDDataset || '') + '</td>';
			tmpHtml += '<td>' + (tmpDataset.Name || '') + '</td>';
			tmpHtml += '<td><span class="badge ' + tmpBadge + '">' + (tmpDataset.Type || '') + '</span></td>';
			tmpHtml += '<td style="max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpDataset.Description || '') + '</td>';
			tmpHtml += '<td><button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Datasets\'].viewStats(' + tmpDataset.IDDataset + ')">Stats</button></td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	viewStats(pIDDataset)
	{
		this.pict.providers.Facto.loadDatasetStats(pIDDataset).then(
			(pResponse) =>
			{
				let tmpMsg = 'Dataset: ' + (pResponse.Dataset ? pResponse.Dataset.Name : '#' + pIDDataset);
				tmpMsg += ' | Records: ' + (pResponse.RecordCount || 0);
				tmpMsg += ' | Linked Sources: ' + (pResponse.SourceCount || 0);
				this.pict.views['Pict-Section-Modal'].toast(tmpMsg, {type: 'info'});
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}

	addDataset()
	{
		let tmpName = this.pict.providers.FactoUI.getVal('facto-dataset-name');
		let tmpType = this.pict.providers.FactoUI.getVal('facto-dataset-type') || 'Raw';
		let tmpDescription = this.pict.providers.FactoUI.getVal('facto-dataset-desc');

		if (!tmpName)
		{
			this.pict.views['Pict-Section-Modal'].toast('Name is required', {type: 'warning'});
			return;
		}

		this.pict.providers.Facto.createDataset(
			{
				Name: tmpName,
				Type: tmpType,
				Description: tmpDescription
			}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.IDDataset)
				{
					this.pict.views['Pict-Section-Modal'].toast('Dataset created: ' + pResponse.Name, {type: 'success'});
					if (document.getElementById('facto-dataset-name')) document.getElementById('facto-dataset-name').value = '';
					if (document.getElementById('facto-dataset-desc')) document.getElementById('facto-dataset-desc').value = '';
					return this.pict.providers.Facto.loadDatasets();
				}
				else
				{
					this.pict.views['Pict-Section-Modal'].toast('Error creating dataset', {type: 'error'});
				}
			}).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}
}

module.exports = FactoDatasetsView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Datasets',
	DefaultRenderable: 'Facto-Datasets',
	DefaultDestinationAddress: '#Facto-Section-Datasets',
	Templates:
	[
		{
			Hash: 'Facto-Datasets',
			Template: /*html*/`
<div class="accordion-row">
	<div class="accordion-number">2</div>
	<div class="accordion-card open" id="facto-card-datasets">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-datasets')">
			<span class="accordion-title">Datasets</span>
			<span class="accordion-preview">Raw, Compositional, Projection, Derived</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Datasets are named collections of records. Types: Raw (ingested), Compositional (merged), Projection (flattened), Derived (computed).</p>
			<div id="facto-datasets-list"></div>

			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Create Dataset</h3>
			<div class="inline-group">
				<div>
					<label for="facto-dataset-name">Name</label>
					<input type="text" id="facto-dataset-name" placeholder="e.g. Census Population 2020">
				</div>
				<div>
					<label for="facto-dataset-type">Type</label>
					<select id="facto-dataset-type">
						<option value="Raw">Raw</option>
						<option value="Compositional">Compositional</option>
						<option value="Projection">Projection</option>
						<option value="Derived">Derived</option>
					</select>
				</div>
			</div>
			<div>
				<label for="facto-dataset-desc">Description</label>
				<input type="text" id="facto-dataset-desc" placeholder="Brief description of the dataset">
			</div>
			<button class="primary" onclick="pict.views['Facto-Datasets'].addDataset()">Create Dataset</button>

		</div>
	</div>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Datasets',
			TemplateHash: 'Facto-Datasets',
			DestinationAddress: '#Facto-Section-Datasets'
		}
	]
};
