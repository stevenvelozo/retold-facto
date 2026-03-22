const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Sources",

	DefaultRenderable: "Facto-Full-Sources-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	Templates:
	[
		{
			Hash: "Facto-Full-Sources-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Sources</h1>
		<p>Manage data sources that feed into the warehouse.</p>
	</div>

	<div id="Facto-Full-Sources-List"></div>

	<div class="facto-section" style="margin-top:2em;">
		<div class="facto-section-title">Add Source</div>
		<div class="facto-inline-group">
			<div>
				<label>Name</label>
				<input type="text" id="Facto-Full-Source-Name" placeholder="Source name">
			</div>
			<div>
				<label>Type</label>
				<select id="Facto-Full-Source-Type">
					<option value="API">API</option>
					<option value="File">File</option>
					<option value="Database">Database</option>
					<option value="Manual">Manual</option>
				</select>
			</div>
			<div>
				<label>URL</label>
				<input type="text" id="Facto-Full-Source-URL" placeholder="https://...">
			</div>
		</div>
		<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Sources'].addSource()">Add Source</button>
	</div>

</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Sources-Content",
			TemplateHash: "Facto-Full-Sources-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullSourcesView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.providers.Facto.loadSources().then(
			() => { this.refreshList(); }).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error loading sources: ' + pError.message, {type: 'error'});
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}



	refreshList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Sources-List');
		if (!tmpContainer) return;

		let tmpSources = this.pict.AppData.Facto.Sources;
		if (!tmpSources || tmpSources.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No sources yet. Add one below or provision from Source Research.</div>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Hash</th><th>Name</th><th>Type</th><th>URL</th><th>Active</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpSources.length; i++)
		{
			let tmpSource = tmpSources[i];
			let tmpActive = tmpSource.Active ? '<span class="facto-badge facto-badge-success">Active</span>' : '<span class="facto-badge facto-badge-muted">Inactive</span>';
			let tmpToggleBtn = tmpSource.Active
				? '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Sources\'].toggleActive(' + tmpSource.IDSource + ', false)">Deactivate</button>'
				: '<button class="facto-btn facto-btn-success facto-btn-small" onclick="pict.views[\'Facto-Full-Sources\'].toggleActive(' + tmpSource.IDSource + ', true)">Activate</button>';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpSource.IDSource || '') + '</td>';
			tmpHtml += '<td><code>' + (tmpSource.Hash || '-') + '</code></td>';
			tmpHtml += '<td>' + (tmpSource.Name || '') + '</td>';
			tmpHtml += '<td><span class="facto-badge facto-badge-primary">' + (tmpSource.Type || '') + '</span></td>';
			tmpHtml += '<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpSource.URL || '') + '</td>';
			tmpHtml += '<td>' + tmpActive + '</td>';
			let tmpViewBtn = '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Source/' + tmpSource.IDSource + '\')">View</button>';
			tmpHtml += '<td>' + tmpViewBtn + ' ' + tmpToggleBtn + '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	toggleActive(pIDSource, pActivate)
	{
		let tmpPromise = pActivate
			? this.pict.providers.Facto.activateSource(pIDSource)
			: this.pict.providers.Facto.deactivateSource(pIDSource);

		tmpPromise.then(
			() => { return this.pict.providers.Facto.loadSources(); }).then(
			() => { this.refreshList(); this.pict.views['Pict-Section-Modal'].toast(pActivate ? 'Source activated' : 'Source deactivated', {type: 'success'}); });
	}

	addSource()
	{
		let tmpName = this.pict.providers.FactoUI.getVal('Facto-Full-Source-Name');
		let tmpType = this.pict.providers.FactoUI.getVal('Facto-Full-Source-Type');
		let tmpURL = this.pict.providers.FactoUI.getVal('Facto-Full-Source-URL');

		if (!tmpName)
		{
			this.pict.views['Pict-Section-Modal'].toast('Source name is required', {type: 'warning'});
			return;
		}

		this.pict.providers.Facto.createSource({ Name: tmpName, Type: tmpType, URL: tmpURL, Active: 1 }).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.IDSource)
				{
					this.pict.views['Pict-Section-Modal'].toast('Source created: ' + tmpName, {type: 'success'});
					document.getElementById('Facto-Full-Source-Name').value = '';
					document.getElementById('Facto-Full-Source-URL').value = '';
					return this.pict.providers.Facto.loadSources();
				}
				else
				{
					this.pict.views['Pict-Section-Modal'].toast('Error creating source', {type: 'error'});
				}
			}).then(
			() => { this.refreshList(); });
	}
}

module.exports = FactoFullSourcesView;

module.exports.default_configuration = _ViewConfiguration;
