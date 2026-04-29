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
				<div style="grid-column: span 2;">
					<label>Connection Name</label>
					<input type="text" id="Facto-Conn-Name" placeholder="e.g. Production MySQL">
				</div>
			</div>

			<!-- pict-section-connection-form renders the type select + per-provider field block here -->
			<div id="Facto-Conn-Form-FieldsSlot" style="margin-top:0.6em"></div>

			<div class="facto-conn-form-actions" style="margin-top:0.6em">
				<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Connections'].addConnection()">Save Connection</button>
				<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Connections'].toggleConnectionForm()">Cancel</button>
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

	}

	onAfterRender()
	{
		// Load connections from the API
		this.pict.providers.Facto.loadStoreConnections().then(
			() =>
			{
				this.refreshConnectionList();
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error loading connections: ' + pError.message, {type: 'error'});
			});

		// Fetch the form schemas and hand them to the shared
		// pict-section-connection-form view (which renders into
		// #Facto-Conn-Form-FieldsSlot once the user opens the form).
		this.pict.providers.Facto.api('GET', '/facto/connection/schemas').then(
			(pData) =>
			{
				let tmpSchemas = (pData && Array.isArray(pData.Schemas)) ? pData.Schemas : [];
				let tmpFormView = this.pict.views['PictSection-ConnectionForm'];
				if (tmpFormView && typeof(tmpFormView.setSchemas) === 'function')
				{
					tmpFormView.setSchemas(tmpSchemas);
				}
				this.pict.AppData.Facto.ConnectionFormSchemas = tmpSchemas;
			}).catch(
			(pError) =>
			{
				if (this.pict.log && this.pict.log.warn)
				{
					this.pict.log.warn(`Facto: failed to fetch /facto/connection/schemas: ${pError && pError.message}`);
				}
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
				// Make sure the schema-driven form renders into the slot
				// when the user opens the panel.  AutoRender is false on
				// the shared view so we trigger it here.  Schemas were
				// fetched earlier by loadAvailableConnectionTypes().
				let tmpFormView = this.pict.views['PictSection-ConnectionForm'];
				if (tmpFormView) { tmpFormView.render(); }
			}
		}
	}

	refreshConnectionList()
	{
		let tmpContainer = document.getElementById('Facto-Conn-List');
		if (!tmpContainer) return;

		if (this.pict.AppData.Facto.StoreConnections.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-card" style="text-align:center; padding:2em; color:var(--facto-text-tertiary);">No connections configured. Add one to get started.</div>';
			return;
		}

		let tmpHtml = '<table class="facto-table"><thead><tr>';
		tmpHtml += '<th>Name</th><th>Type</th><th>Status</th><th>Actions</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < this.pict.AppData.Facto.StoreConnections.length; i++)
		{
			let tmpConn = this.pict.AppData.Facto.StoreConnections[i];
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
		let tmpName = this.pict.providers.FactoUI.getVal('Facto-Conn-Name');
		if (!tmpName)
		{
			this.pict.views['Pict-Section-Modal'].toast('Connection name is required.', {type: 'warning'});
			return;
		}

		// Pull Type + Config straight from the shared schema-driven view.
		// That view handles SQLite vs server-style providers, MSSQL retry
		// tuning, etc., uniformly via its schema definitions.
		let tmpFormView = this.pict.views['PictSection-ConnectionForm'];
		let tmpConnInfo = (tmpFormView && typeof(tmpFormView.getProviderConfig) === 'function')
			? tmpFormView.getProviderConfig()
			: { Provider: '', Config: {} };

		if (!tmpConnInfo.Provider)
		{
			this.pict.views['Pict-Section-Modal'].toast('Pick a provider type.', {type: 'warning'});
			return;
		}

		this.pict.providers.Facto.createStoreConnection(
		{
			Name:   tmpName,
			Type:   tmpConnInfo.Provider,
			Config: tmpConnInfo.Config || {}
		}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.views['Pict-Section-Modal'].toast('Error: ' + pResponse.Error, {type: 'error'});
					return;
				}

				// Reload connections
				this.pict.providers.Facto.loadStoreConnections().then(
					(pResult) =>
					{

						this.refreshConnectionList();
						this.toggleConnectionForm();

						// Clear name input + reset the shared schema-driven
						// form back to its default (first provider, default values).
						let tmpNameEl = document.getElementById('Facto-Conn-Name');
						if (tmpNameEl) tmpNameEl.value = '';
						if (tmpFormView && typeof(tmpFormView.clear) === 'function')
						{
							tmpFormView.clear();
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
						
						this.refreshConnectionList();

						if (pResponse && pResponse.Success)
						{
							this.pict.views['Pict-Section-Modal'].toast('Connection test succeeded!', {type: 'success'});
						}
						else
						{
							this.pict.views['Pict-Section-Modal'].toast('Connection test failed: ' + (pResponse && pResponse.Error ? pResponse.Error : 'Unknown error'), {type: 'error'});
						}
					});
			});
	}

	async deleteConnection(pIDStoreConnection)
	{
		let tmpConfirmed = await this.pict.views['Pict-Section-Modal'].confirm('Delete this connection?', { title: 'Delete Connection', confirmLabel: 'Delete', dangerous: true });
		if (!tmpConfirmed) return;

		this.pict.providers.Facto.deleteStoreConnection(pIDStoreConnection).then(
			() =>
			{
				this.pict.providers.Facto.loadStoreConnections().then(
					(pResult) =>
					{
						
						this.refreshConnectionList();
					});
			});
	}

}

module.exports = FactoFullConnectionsView;

module.exports.default_configuration = _ViewConfiguration;
