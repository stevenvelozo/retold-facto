const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Projections",

	DefaultRenderable: "Facto-Full-Projections-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: ``,

	Templates:
	[
		{
			Hash: "Facto-Full-Projections-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Projections</h1>
		<p>Define schemas and deploy projections to external stores.</p>
	</div>

	<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1em;">
		<div class="facto-section-title" style="margin:0;">Projection Datasets</div>
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Projections'].createProjection()">+ New Projection</button>
	</div>
	<div id="Facto-Proj-List"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Projections-Content",
			TemplateHash: "Facto-Full-Projections-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullProjectionsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._Projections = [];
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.providers.Facto.loadProjections().then(
			(pResult) =>
			{
				this._Projections = (pResult && pResult.Projections) ? pResult.Projections : [];
				this.refreshProjectionList();
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	refreshProjectionList()
	{
		let tmpContainer = document.getElementById('Facto-Proj-List');
		if (!tmpContainer) return;

		if (this._Projections.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-card" style="text-align:center; padding:2em; color:var(--facto-text-tertiary);">No projection datasets yet. Create one to get started.</div>';
			return;
		}

		let tmpHtml = '<table class="facto-table"><thead><tr>';
		tmpHtml += '<th>ID</th><th>Name</th><th>Schema Ver.</th><th>Actions</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < this._Projections.length; i++)
		{
			let tmpProj = this._Projections[i];
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + tmpProj.IDDataset + '</td>';
			tmpHtml += '<td><strong>' + (tmpProj.Name || '\u2014') + '</strong></td>';
			tmpHtml += '<td>v' + (tmpProj.SchemaVersion || 0) + '</td>';
			tmpHtml += '<td>';
			tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Projection/' + tmpProj.IDDataset + '\')">View</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-danger facto-btn-small" onclick="pict.views[\'Facto-Full-Projections\'].deleteProjection(' + tmpProj.IDDataset + ', \'' + (tmpProj.Name || '').replace(/'/g, "\\'") + '\')">Delete</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}

		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	createProjection()
	{
		let tmpName = prompt('Projection name:');
		if (!tmpName) return;

		this.pict.providers.Facto.createDataset(
		{
			Name: tmpName,
			Type: 'Projection',
			Description: 'Projection dataset'
		}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error: ' + pResponse.Error, 'error');
					return;
				}

				// Navigate to the new projection's detail page
				if (pResponse && pResponse.IDDataset)
				{
					this.pict.PictApplication.navigateTo('/Projection/' + pResponse.IDDataset);
				}
				else
				{
					// Fallback: reload the list
					this.pict.providers.Facto.loadProjections().then(
						(pResult) =>
						{
							this._Projections = (pResult && pResult.Projections) ? pResult.Projections : [];
							this.refreshProjectionList();
						});
				}
			});
	}

	deleteProjection(pIDDataset, pName)
	{
		if (!confirm('Delete projection "' + (pName || pIDDataset) + '"? This will remove the dataset and all associated mappings and stores.')) return;

		this.pict.providers.Facto.deleteProjection(pIDDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error deleting projection: ' + pResponse.Error, 'error');
					return;
				}

				this.pict.providers.FactoUI.showToast('Projection deleted.', 'success');

				this.pict.providers.Facto.loadProjections().then(
					(pResult) =>
					{
						this._Projections = (pResult && pResult.Projections) ? pResult.Projections : [];
						this.refreshProjectionList();
					});
			});
	}
}

module.exports = FactoFullProjectionsView;

module.exports.default_configuration = _ViewConfiguration;
