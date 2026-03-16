const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Connections",

	DefaultRenderable: "Facto-Full-Connections-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: `
		.facto-conn-form {
			display: none;
			padding: 1em;
			background: var(--facto-bg-surface, #fcf8f0);
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 8px;
			margin-bottom: 1em;
		}
		.facto-conn-form.active {
			display: block;
		}
		.facto-conn-form-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 0.6em;
		}
		.facto-conn-form-grid label {
			font-size: 0.78em;
			font-weight: 600;
			color: var(--facto-text-secondary, #786848);
			display: block;
			margin-bottom: 0.2em;
		}
		.facto-conn-form-grid input,
		.facto-conn-form-grid select {
			width: 100%;
			padding: 0.4em 0.6em;
			font-size: 0.85em;
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 4px;
			background: var(--facto-bg-base, #f6f0e4);
			color: var(--facto-text-primary, #3e2f1a);
		}
		.facto-conn-form-actions {
			grid-column: span 2;
			display: flex;
			gap: 0.5em;
			margin-top: 0.5em;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-Connections-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Store Connections</h1>
		<p>Manage database and storage connections used by projections.</p>
	</div>

	<div class="facto-section">
		<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1em;">
			<div class="facto-section-title" style="margin:0;">Connections</div>
			<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Connections'].toggleConnectionForm()">+ Add Connection</button>
		</div>

		<div id="Facto-Conn-Form" class="facto-conn-form">
			<div class="facto-conn-form-grid">
				<div>
					<label>Connection Name</label>
					<input type="text" id="Facto-Conn-Name" placeholder="e.g. Production MySQL">
				</div>
				<div>
					<label>Type</label>
					<select id="Facto-Conn-Type" onchange="{~P~}.views['Facto-Full-Connections'].updateConnectionFormFields()">
						<option value="MySQL">MySQL</option>
						<option value="PostgreSQL">PostgreSQL</option>
						<option value="MSSQL">MSSQL</option>
						<option value="SQLite">SQLite</option>
						<option value="Solr">Solr</option>
						<option value="RocksDB">RocksDB</option>
					</select>
				</div>
				<div id="Facto-Conn-FilePath-Wrap" style="display:none;">
					<label>File Path</label>
					<input type="text" id="Facto-Conn-FilePath" placeholder="/path/to/database.sqlite">
				</div>
				<div id="Facto-Conn-Host-Wrap">
					<label>Host</label>
					<input type="text" id="Facto-Conn-Host" placeholder="localhost">
				</div>
				<div id="Facto-Conn-Port-Wrap">
					<label>Port</label>
					<input type="number" id="Facto-Conn-Port" placeholder="3306">
				</div>
				<div id="Facto-Conn-User-Wrap">
					<label>User</label>
					<input type="text" id="Facto-Conn-User" placeholder="root">
				</div>
				<div id="Facto-Conn-Password-Wrap">
					<label>Password</label>
					<input type="password" id="Facto-Conn-Password" placeholder="password">
				</div>
				<div id="Facto-Conn-Database-Wrap">
					<label>Database</label>
					<input type="text" id="Facto-Conn-Database" placeholder="my_database">
				</div>
				<div class="facto-conn-form-actions">
					<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Connections'].addConnection()">Save Connection</button>
					<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Connections'].toggleConnectionForm()">Cancel</button>
				</div>
			</div>
		</div>

		<div id="Facto-Conn-List"></div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Connections-Content",
			TemplateHash: "Facto-Full-Connections-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullConnectionsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._Connections = [];
	}

	onAfterRender()
	{
		// Load connections from the API
		this.pict.providers.Facto.loadStoreConnections().then(
			(pResult) =>
			{
				this._Connections = (pResult && pResult.Connections) ? pResult.Connections : [];
				this.refreshConnectionList();
			});

		return super.onAfterRender();
	}

	toggleConnectionForm()
	{
		let tmpForm = document.getElementById('Facto-Conn-Form');
		if (tmpForm)
		{
			tmpForm.classList.toggle('active');
			if (tmpForm.classList.contains('active'))
			{
				this.updateConnectionFormFields();
			}
		}
	}

	updateConnectionFormFields()
	{
		let tmpType = (document.getElementById('Facto-Conn-Type') || {}).value || 'MySQL';
		let tmpIsFileBased = (tmpType === 'SQLite' || tmpType === 'RocksDB');

		let tmpFilePathWrap = document.getElementById('Facto-Conn-FilePath-Wrap');
		let tmpHostWrap = document.getElementById('Facto-Conn-Host-Wrap');
		let tmpPortWrap = document.getElementById('Facto-Conn-Port-Wrap');
		let tmpUserWrap = document.getElementById('Facto-Conn-User-Wrap');
		let tmpPasswordWrap = document.getElementById('Facto-Conn-Password-Wrap');
		let tmpDatabaseWrap = document.getElementById('Facto-Conn-Database-Wrap');

		if (tmpFilePathWrap) tmpFilePathWrap.style.display = tmpIsFileBased ? '' : 'none';
		if (tmpHostWrap) tmpHostWrap.style.display = tmpIsFileBased ? 'none' : '';
		if (tmpPortWrap) tmpPortWrap.style.display = tmpIsFileBased ? 'none' : '';
		if (tmpUserWrap) tmpUserWrap.style.display = tmpIsFileBased ? 'none' : '';
		if (tmpPasswordWrap) tmpPasswordWrap.style.display = tmpIsFileBased ? 'none' : '';
		if (tmpDatabaseWrap) tmpDatabaseWrap.style.display = tmpIsFileBased ? 'none' : '';
	}

	refreshConnectionList()
	{
		let tmpContainer = document.getElementById('Facto-Conn-List');
		if (!tmpContainer) return;

		if (this._Connections.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-card" style="text-align:center; padding:2em; color:var(--facto-text-tertiary);">No connections configured. Add one to get started.</div>';
			return;
		}

		let tmpHtml = '<table class="facto-table"><thead><tr>';
		tmpHtml += '<th>Name</th><th>Type</th><th>Status</th><th>Actions</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < this._Connections.length; i++)
		{
			let tmpConn = this._Connections[i];
			let tmpStatusClass = (tmpConn.Status || 'Untested').toLowerCase();

			tmpHtml += '<tr>';
			tmpHtml += '<td><strong>' + (tmpConn.Name || '\u2014') + '</strong></td>';
			tmpHtml += '<td>' + (tmpConn.Type || '\u2014') + '</td>';
			tmpHtml += '<td><span class="facto-status-badge ' + tmpStatusClass + '">' + (tmpConn.Status || 'Untested') + '</span></td>';
			tmpHtml += '<td>';
			tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-Connections\'].testConnection(' + tmpConn.IDStoreConnection + ')">Test</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Connections\'].deleteConnection(' + tmpConn.IDStoreConnection + ')">Delete</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}

		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	addConnection()
	{
		let tmpName = (document.getElementById('Facto-Conn-Name') || {}).value || '';
		let tmpType = (document.getElementById('Facto-Conn-Type') || {}).value || 'MySQL';

		if (!tmpName)
		{
			this.pict.providers.FactoUI.showToast('Connection name is required.', 'warn');
			return;
		}

		let tmpIsFileBased = (tmpType === 'SQLite' || tmpType === 'RocksDB');
		let tmpConfig = {};

		if (tmpIsFileBased)
		{
			tmpConfig.SQLiteFilePath = (document.getElementById('Facto-Conn-FilePath') || {}).value || '';
			if (!tmpConfig.SQLiteFilePath)
			{
				this.pict.providers.FactoUI.showToast('File path is required for ' + tmpType + ' connections.', 'warn');
				return;
			}
		}
		else
		{
			tmpConfig.host = (document.getElementById('Facto-Conn-Host') || {}).value || 'localhost';
			tmpConfig.server = tmpConfig.host;
			tmpConfig.port = parseInt((document.getElementById('Facto-Conn-Port') || {}).value) || 0;
			tmpConfig.user = (document.getElementById('Facto-Conn-User') || {}).value || '';
			tmpConfig.password = (document.getElementById('Facto-Conn-Password') || {}).value || '';
			tmpConfig.database = (document.getElementById('Facto-Conn-Database') || {}).value || '';
		}

		this.pict.providers.Facto.createStoreConnection(
		{
			Name: tmpName,
			Type: tmpType,
			Config: tmpConfig
		}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error: ' + pResponse.Error, 'error');
					return;
				}

				// Reload connections
				this.pict.providers.Facto.loadStoreConnections().then(
					(pResult) =>
					{
						this._Connections = (pResult && pResult.Connections) ? pResult.Connections : [];
						this.refreshConnectionList();
						this.toggleConnectionForm();

						// Clear form
						let tmpFields = ['Name', 'Host', 'Port', 'User', 'Password', 'Database', 'FilePath'];
						for (let i = 0; i < tmpFields.length; i++)
						{
							let tmpEl = document.getElementById('Facto-Conn-' + tmpFields[i]);
							if (tmpEl) tmpEl.value = '';
						}
					});
			});
	}

	testConnection(pIDStoreConnection)
	{
		this.pict.providers.Facto.testStoreConnection(pIDStoreConnection).then(
			(pResponse) =>
			{
				// Reload connections to get updated status
				this.pict.providers.Facto.loadStoreConnections().then(
					(pResult) =>
					{
						this._Connections = (pResult && pResult.Connections) ? pResult.Connections : [];
						this.refreshConnectionList();

						if (pResponse && pResponse.Success)
						{
							this.pict.providers.FactoUI.showToast('Connection test succeeded!', 'success');
						}
						else
						{
							this.pict.providers.FactoUI.showToast('Connection test failed: ' + (pResponse && pResponse.Error ? pResponse.Error : 'Unknown error'), 'error');
						}
					});
			});
	}

	deleteConnection(pIDStoreConnection)
	{
		if (!confirm('Delete this connection?')) return;

		this.pict.providers.Facto.deleteStoreConnection(pIDStoreConnection).then(
			() =>
			{
				this.pict.providers.Facto.loadStoreConnections().then(
					(pResult) =>
					{
						this._Connections = (pResult && pResult.Connections) ? pResult.Connections : [];
						this.refreshConnectionList();
					});
			});
	}

}

module.exports = FactoFullConnectionsView;

module.exports.default_configuration = _ViewConfiguration;
