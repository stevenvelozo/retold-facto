const libPictView = require('pict-view');

class FactoSourcesView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		// Load sources from API on first render
		this.pict.providers.Facto.loadSources().then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-sources-status', 'Error loading sources: ' + pError.message, 'error');
			});
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('facto-sources-list');
		if (!tmpContainer) return;

		let tmpSources = this.pict.AppData.Facto.Sources;
		if (!tmpSources || tmpSources.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No sources registered yet.</p>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>URL</th><th>Active</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpSources.length; i++)
		{
			let tmpSource = tmpSources[i];
			let tmpActiveLabel = tmpSource.Active ? '<span style="color:#28a745;">Active</span>' : '<span style="color:#888;">Inactive</span>';
			let tmpToggleBtn = tmpSource.Active
				? '<button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Sources\'].toggleActive(' + tmpSource.IDSource + ', false)">Deactivate</button>'
				: '<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Sources\'].toggleActive(' + tmpSource.IDSource + ', true)">Activate</button>';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpSource.IDSource || '') + '</td>';
			tmpHtml += '<td>' + (tmpSource.Name || '') + '</td>';
			tmpHtml += '<td>' + (tmpSource.Type || '') + '</td>';
			tmpHtml += '<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpSource.URL || '') + '</td>';
			tmpHtml += '<td>' + tmpActiveLabel + '</td>';
			tmpHtml += '<td>' + tmpToggleBtn + '</td>';
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
			() =>
			{
				return this.pict.providers.Facto.loadSources();
			}).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-sources-status', 'Error: ' + pError.message, 'error');
			});
	}

	addSource()
	{
		let tmpName = (document.getElementById('facto-source-name') || {}).value || '';
		let tmpType = (document.getElementById('facto-source-type') || {}).value || '';
		let tmpURL = (document.getElementById('facto-source-url') || {}).value || '';
		let tmpProtocol = (document.getElementById('facto-source-protocol') || {}).value || '';

		if (!tmpName)
		{
			this.pict.providers.Facto.setStatus('facto-sources-status', 'Name is required', 'warn');
			return;
		}

		this.pict.providers.Facto.createSource(
			{
				Name: tmpName,
				Type: tmpType,
				URL: tmpURL,
				Protocol: tmpProtocol,
				Active: 1
			}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.IDSource)
				{
					this.pict.providers.Facto.setStatus('facto-sources-status', 'Source created: ' + pResponse.Name, 'ok');
					// Clear form
					if (document.getElementById('facto-source-name')) document.getElementById('facto-source-name').value = '';
					if (document.getElementById('facto-source-url')) document.getElementById('facto-source-url').value = '';
					// Reload list
					return this.pict.providers.Facto.loadSources();
				}
				else
				{
					this.pict.providers.Facto.setStatus('facto-sources-status', 'Error creating source', 'error');
				}
			}).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-sources-status', 'Error: ' + pError.message, 'error');
			});
	}
}

module.exports = FactoSourcesView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Sources',
	DefaultRenderable: 'Facto-Sources',
	DefaultDestinationAddress: '#Facto-Section-Sources',
	Templates:
	[
		{
			Hash: 'Facto-Sources',
			Template: /*html*/`
<div class="accordion-row">
	<div class="accordion-number">1</div>
	<div class="accordion-card open" id="facto-card-sources">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-sources')">
			<span class="accordion-title">Sources</span>
			<span class="accordion-preview">Manage data sources</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Data sources describe where ingested data originates -- websites, APIs, FTP servers, OCR results, ML outputs, etc.</p>
			<div id="facto-sources-list"></div>

			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Add Source</h3>
			<div class="inline-group">
				<div>
					<label for="facto-source-name">Name</label>
					<input type="text" id="facto-source-name" placeholder="e.g. US Census Bureau API">
				</div>
				<div>
					<label for="facto-source-type">Type</label>
					<select id="facto-source-type">
						<option value="API">API</option>
						<option value="File">File</option>
						<option value="FTP">FTP</option>
						<option value="Web">Web</option>
						<option value="OCR">OCR</option>
						<option value="ML">ML</option>
						<option value="Manual">Manual</option>
					</select>
				</div>
			</div>
			<div class="inline-group">
				<div>
					<label for="facto-source-url">URL</label>
					<input type="text" id="facto-source-url" placeholder="https://api.example.gov/data">
				</div>
				<div>
					<label for="facto-source-protocol">Protocol</label>
					<select id="facto-source-protocol">
						<option value="HTTPS">HTTPS</option>
						<option value="HTTP">HTTP</option>
						<option value="FTP">FTP</option>
						<option value="SFTP">SFTP</option>
						<option value="Local">Local</option>
					</select>
				</div>
			</div>
			<button class="primary" onclick="pict.views['Facto-Sources'].addSource()">Add Source</button>

			<div id="facto-sources-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Sources',
			TemplateHash: 'Facto-Sources',
			DestinationAddress: '#Facto-Section-Sources'
		}
	]
};
