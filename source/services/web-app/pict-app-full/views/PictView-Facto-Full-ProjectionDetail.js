const libPictView = require('pict-view');

const libProjectionConstants = require('./projections/Facto-Projections-Constants.js');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-ProjectionDetail",

	DefaultRenderable: "Facto-Full-ProjectionDetail-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-proj-detail-back {
			display: inline-flex;
			align-items: center;
			gap: 0.35em;
			color: var(--facto-text-secondary);
			cursor: pointer;
			font-size: 0.85em;
			margin-bottom: 0.75em;
			transition: color 0.15s;
		}
		.facto-proj-detail-back:hover {
			color: var(--facto-brand);
		}
		.facto-proj-detail-title-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 1.25em;
		}
		.facto-proj-detail-title-row h1 {
			margin: 0;
		}
		.facto-proj-detail-actions {
			display: flex;
			gap: 0.5em;
		}
		.facto-proj-meta-cards {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
			gap: 1em;
			margin-bottom: 1.5em;
		}
		.facto-proj-meta-card {
			background: var(--facto-bg-card);
			border: 1px solid var(--facto-border-subtle);
			border-radius: 8px;
			padding: 1em;
		}
		.facto-proj-meta-card-label {
			font-size: 0.7em;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--facto-text-tertiary);
			margin-bottom: 0.35em;
		}
		.facto-proj-meta-card-value {
			font-size: 1.1em;
			font-weight: 600;
			color: var(--facto-text-heading);
		}
		.facto-proj-section {
			margin-bottom: 1.5em;
		}
		.facto-proj-section-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 0.75em;
		}
		.facto-proj-section-header h2 {
			margin: 0;
			font-size: 1em;
			text-transform: uppercase;
			letter-spacing: 0.05em;
			color: var(--facto-text-secondary);
		}
		.facto-proj-ddl-preview {
			background: var(--facto-bg-code, #f0e8d8);
			border: 1px solid var(--facto-border-subtle);
			border-radius: 6px;
			padding: 0.75em;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.82em;
			white-space: pre-wrap;
			max-height: 150px;
			overflow: auto;
			color: var(--facto-text-secondary);
			margin-bottom: 0.75em;
		}
		.facto-proj-detail-loading {
			text-align: center;
			padding: 3em;
			color: var(--facto-text-tertiary);
		}
		.facto-proj-deploy-form {
			display: grid;
			grid-template-columns: 1fr 1fr auto auto;
			gap: 0.75em;
			align-items: end;
			padding: 1em;
			background: var(--facto-bg-surface, #fcf8f0);
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 8px;
			margin-bottom: 0.75em;
		}
		.facto-proj-deploy-form label {
			display: block;
			font-size: 0.72em;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--facto-text-tertiary);
			margin-bottom: 0.25em;
		}
		.facto-proj-deploy-log {
			font-family: 'SF Mono', monospace;
			font-size: 0.78em;
			padding: 0.6em;
			background: var(--facto-bg-code, #f0e8d8);
			border: 1px solid var(--facto-border-subtle, #e8ddc8);
			border-radius: 6px;
			white-space: pre-wrap;
			max-height: 200px;
			overflow: auto;
			margin-top: 0.5em;
			color: var(--facto-text-secondary);
		}
		.facto-proj-import-form {
			display: grid;
			grid-template-columns: 1fr 1fr auto auto;
			gap: 0.75em;
			align-items: end;
			padding: 1em;
			background: var(--facto-bg-surface, #fcf8f0);
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 8px;
			margin-bottom: 0.75em;
		}
		.facto-proj-import-form label {
			display: block;
			font-size: 0.72em;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--facto-text-tertiary);
			margin-bottom: 0.25em;
		}
		.facto-proj-import-stage-row {
			display: flex;
			align-items: center;
			gap: 0.5em;
			grid-column: 1 / -1;
		}
		.facto-proj-import-stage-row label {
			text-transform: none;
			font-size: 0.82em;
			margin-bottom: 0;
			cursor: pointer;
		}
		.facto-proj-import-staging-link {
			display: inline-block;
			margin-top: 0.5em;
			font-size: 0.82em;
			color: var(--facto-brand);
			cursor: pointer;
			text-decoration: underline;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-ProjectionDetail-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-proj-detail-back" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].goBack()">
		&larr; Back to Projections
	</div>

	<div id="Facto-ProjectionDetail-Loading" class="facto-proj-detail-loading">Loading projection...</div>

	<div id="Facto-ProjectionDetail-Container" style="display:none;">
		<div class="facto-proj-detail-title-row">
			<h1 id="Facto-ProjectionDetail-Title"></h1>
			<div class="facto-proj-detail-actions">
				<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].editSchema()">Edit Schema</button>
				<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].editMappings()">Mappings</button>
				<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].showQuery()">Query</button>
				<button class="facto-btn facto-btn-danger" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].deleteProjection()">Delete</button>
			</div>
		</div>

		<div id="Facto-ProjectionDetail-Meta" class="facto-proj-meta-cards"></div>

		<div class="facto-proj-section">
			<div class="facto-proj-section-header">
				<h2>Schema</h2>
				<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].editSchema()">Edit Schema</button>
			</div>
			<div id="Facto-ProjectionDetail-Schema"></div>
		</div>

		<div class="facto-proj-section">
			<div class="facto-proj-section-header">
				<h2>Deployed Stores</h2>
				<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].showDeployForm()">+ Deploy to Store</button>
			</div>
			<div id="Facto-ProjectionDetail-Deploy" style="display:none;">
				<div class="facto-proj-deploy-form">
					<div>
						<label>Connection</label>
						<select id="Facto-ProjectionDetail-Deploy-Connection"></select>
					</div>
					<div>
						<label>Table Name</label>
						<input type="text" id="Facto-ProjectionDetail-Deploy-TableName" placeholder="e.g. Schools">
					</div>
					<div>
						<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].deployToStore()">Deploy</button>
					</div>
					<div>
						<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].hideDeployForm()">Cancel</button>
					</div>
				</div>
				<div id="Facto-ProjectionDetail-Deploy-Log" class="facto-proj-deploy-log" style="display:none;"></div>
			</div>
			<div id="Facto-ProjectionDetail-Stores"></div>
		</div>

		<div class="facto-proj-section">
			<div class="facto-proj-section-header">
				<h2>Mappings</h2>
				<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].editMappings()">Manage Mappings</button>
			</div>
			<div id="Facto-ProjectionDetail-Mappings"></div>
		</div>

		<div class="facto-proj-section">
			<div class="facto-proj-section-header">
				<h2>Import Data</h2>
			</div>
			<div id="Facto-ProjectionDetail-Import"></div>
		</div>
	</div>

	<div id="Facto-Proj-Schema-Editor-Container" style="display:none;"></div>
	<div id="Facto-Proj-Mapping-Editor-Container" style="display:none;"></div>
	<div id="Facto-Proj-Query-Container" style="display:none;"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-ProjectionDetail-Content",
			TemplateHash: "Facto-Full-ProjectionDetail-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullProjectionDetailView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._CurrentIDDataset = null;
		this._ProjectionData = null;
		this._Schema = null;
		this._Stores = [];
		this._Mappings = [];
		this._Sources = [];
		this._Connections = [];
		this._Stats = null;
	}

	loadProjection(pIDDataset)
	{
		this._CurrentIDDataset = parseInt(pIDDataset, 10) || 0;
		this._ProjectionData = null;
		this._Schema = null;
		this._Stores = [];
		this._Mappings = [];
		this._Sources = [];
		this._Connections = [];
		this._Stats = null;

		this.render();
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		if (this._CurrentIDDataset)
		{
			this._fetchAndDisplayProjection();
		}

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	_fetchAndDisplayProjection()
	{
		let tmpLoading = document.getElementById('Facto-ProjectionDetail-Loading');
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Container');
		if (tmpLoading) tmpLoading.style.display = 'block';
		if (tmpContainer) tmpContainer.style.display = 'none';

		Promise.all(
		[
			this.pict.providers.Facto.loadProjections(),
			this.pict.providers.Facto.loadProjectionSchema(this._CurrentIDDataset),
			this.pict.providers.Facto.loadProjectionStores(this._CurrentIDDataset),
			this.pict.providers.Facto.loadProjectionMappings(this._CurrentIDDataset),
			this.pict.providers.Facto.loadSources(),
			this.pict.providers.Facto.loadDatasetStats(this._CurrentIDDataset),
			this.pict.providers.Facto.loadStoreConnections()
		]).then(
			(pResults) =>
			{
				// Find the projection dataset from the full list
				let tmpProjections = (pResults[0] && pResults[0].Projections) ? pResults[0].Projections : [];
				this._ProjectionData = null;
				for (let i = 0; i < tmpProjections.length; i++)
				{
					if (tmpProjections[i].IDDataset == this._CurrentIDDataset)
					{
						this._ProjectionData = tmpProjections[i];
						break;
					}
				}

				this._Schema = pResults[1] || {};
				this._Stores = (pResults[2] && pResults[2].Stores) ? pResults[2].Stores : [];
				this._Mappings = (pResults[3] && pResults[3].Mappings) ? pResults[3].Mappings : [];
				this._Sources = Array.isArray(pResults[4]) ? pResults[4] : [];
				this._Stats = pResults[5] || {};
				this._Connections = (pResults[6] && pResults[6].Connections) ? pResults[6].Connections : [];

				this._renderProjectionDetail();
			});
	}

	_renderProjectionDetail()
	{
		let tmpLoading = document.getElementById('Facto-ProjectionDetail-Loading');
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Container');
		if (tmpLoading) tmpLoading.style.display = 'none';
		if (tmpContainer) tmpContainer.style.display = 'block';

		let tmpProj = this._ProjectionData || {};

		// Title
		let tmpTitle = document.getElementById('Facto-ProjectionDetail-Title');
		if (tmpTitle) tmpTitle.textContent = tmpProj.Name || ('Projection #' + this._CurrentIDDataset);

		// URL state
		window.history.replaceState(null, '', '#/Projection/' + this._CurrentIDDataset);

		this._renderMetaCards();
		this._renderSchemaSection();
		this._renderStoresSection();
		this._renderMappingsSection();
		this._renderImportSection();
	}

	// ================================================================
	// Meta Cards
	// ================================================================

	_renderMetaCards()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Meta');
		if (!tmpContainer) return;

		let tmpProj = this._ProjectionData || {};
		let tmpSchema = this._Schema || {};
		let tmpStats = this._Stats || {};

		// Count columns from schema
		let tmpColumnCount = 0;
		if (tmpSchema.SchemaDefinition)
		{
			let tmpColumns = libProjectionConstants.microDDLToColumns(tmpSchema.SchemaDefinition);
			tmpColumnCount = tmpColumns.length;
		}

		let tmpHtml = '';
		tmpHtml += '<div class="facto-proj-meta-card"><div class="facto-proj-meta-card-label">Dataset ID</div><div class="facto-proj-meta-card-value">' + (tmpProj.IDDataset || this._CurrentIDDataset) + '</div></div>';
		tmpHtml += '<div class="facto-proj-meta-card"><div class="facto-proj-meta-card-label">Schema Version</div><div class="facto-proj-meta-card-value">v' + (tmpSchema.SchemaVersion || tmpProj.SchemaVersion || 0) + '</div></div>';
		tmpHtml += '<div class="facto-proj-meta-card"><div class="facto-proj-meta-card-label">Columns</div><div class="facto-proj-meta-card-value">' + tmpColumnCount + '</div></div>';
		tmpHtml += '<div class="facto-proj-meta-card"><div class="facto-proj-meta-card-label">Stores</div><div class="facto-proj-meta-card-value">' + this._Stores.length + '</div></div>';
		tmpHtml += '<div class="facto-proj-meta-card"><div class="facto-proj-meta-card-label">Mappings</div><div class="facto-proj-meta-card-value">' + this._Mappings.length + '</div></div>';
		tmpHtml += '<div class="facto-proj-meta-card"><div class="facto-proj-meta-card-label">Records</div><div class="facto-proj-meta-card-value">' + (tmpStats.RecordCount || 0) + '</div></div>';

		tmpContainer.innerHTML = tmpHtml;
	}

	// ================================================================
	// Schema Section
	// ================================================================

	_renderSchemaSection()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Schema');
		if (!tmpContainer) return;

		let tmpSchema = this._Schema || {};
		let tmpDDL = tmpSchema.SchemaDefinition || '';

		if (!tmpDDL)
		{
			tmpContainer.innerHTML = '<div class="facto-card" style="text-align:center; padding:1.5em; color:var(--facto-text-tertiary);">No schema defined yet. Click "Edit Schema" to create one.</div>';
			return;
		}

		let tmpHtml = '';
		tmpHtml += '<div class="facto-proj-ddl-preview">' + this._escapeHtml(tmpDDL) + '</div>';
		tmpContainer.innerHTML = tmpHtml;
	}

	// ================================================================
	// Stores Section
	// ================================================================

	_renderStoresSection()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Stores');
		if (!tmpContainer) return;

		if (this._Stores.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-card" style="text-align:center; padding:1.5em; color:var(--facto-text-tertiary);">No stores deployed yet. Click "+ Deploy to Store" to create one.</div>';
			return;
		}

		// Build connection lookup
		let tmpConnMap = {};
		for (let i = 0; i < this._Connections.length; i++)
		{
			tmpConnMap[this._Connections[i].IDStoreConnection] = this._Connections[i];
		}

		let tmpHtml = '<table class="facto-table"><thead><tr>';
		tmpHtml += '<th>ID</th><th>Connection</th><th>Target Table</th><th>Status</th><th>Deployed At</th><th>Actions</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < this._Stores.length; i++)
		{
			let tmpStore = this._Stores[i];
			let tmpConn = tmpConnMap[tmpStore.IDStoreConnection] || {};
			let tmpConnName = tmpConn.Name ? (tmpConn.Name + ' (' + (tmpConn.Type || '') + ')') : ('#' + (tmpStore.IDStoreConnection || '?'));
			let tmpStatusClass = (tmpStore.Status === 'Deployed') ? 'deployed' : (tmpStore.Status === 'Failed') ? 'failed' : 'pending';
			let tmpDeployedAt = tmpStore.DeployedAt ? new Date(tmpStore.DeployedAt).toLocaleString() : '\u2014';

			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpStore.IDProjectionStore || '') + '</td>';
			tmpHtml += '<td>' + this._escapeHtml(tmpConnName) + '</td>';
			tmpHtml += '<td><strong>' + (tmpStore.TargetTableName || '\u2014') + '</strong></td>';
			tmpHtml += '<td><span class="facto-status-badge ' + tmpStatusClass + '">' + (tmpStore.Status || 'Unknown') + '</span></td>';
			tmpHtml += '<td>' + tmpDeployedAt + '</td>';
			tmpHtml += '<td>';
			tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-ProjectionDetail\'].redeployStore(' + tmpStore.IDProjectionStore + ', ' + tmpStore.IDStoreConnection + ', \'' + (tmpStore.TargetTableName || '').replace(/'/g, "\\'") + '\')">Redeploy</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}

		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	// ================================================================
	// Mappings Section
	// ================================================================

	_renderMappingsSection()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Mappings');
		if (!tmpContainer) return;

		if (this._Mappings.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-card" style="text-align:center; padding:1.5em; color:var(--facto-text-tertiary);">No mappings yet. Create a mapping to link source data to this projection.</div>';
			return;
		}

		// Build a lookup for source names
		let tmpSourceMap = {};
		for (let i = 0; i < this._Sources.length; i++)
		{
			tmpSourceMap[this._Sources[i].IDSource] = this._Sources[i].Name || this._Sources[i].Hash || ('#' + this._Sources[i].IDSource);
		}

		// Build a lookup for store names
		let tmpStoreMap = {};
		for (let i = 0; i < this._Stores.length; i++)
		{
			tmpStoreMap[this._Stores[i].IDProjectionStore] = this._Stores[i].TargetTableName || ('Store ' + this._Stores[i].IDProjectionStore);
		}

		let tmpHtml = '<table class="facto-table"><thead><tr>';
		tmpHtml += '<th>ID</th><th>Name</th><th>Source</th><th>Target Stores</th><th>Active</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < this._Mappings.length; i++)
		{
			let tmpMapping = this._Mappings[i];
			let tmpSourceName = tmpSourceMap[tmpMapping.IDSource] || ('#' + (tmpMapping.IDSource || '?'));
			let tmpActive = tmpMapping.Active
				? '<span class="facto-badge facto-badge-success">\u2714</span>'
				: '<span class="facto-badge facto-badge-muted">\u2718</span>';

			// Parse TargetStores from config
			let tmpStoreNames = [];
			try
			{
				let tmpConfig = JSON.parse(tmpMapping.MappingConfiguration || '{}');
				if (Array.isArray(tmpConfig.TargetStores))
				{
					for (let j = 0; j < tmpConfig.TargetStores.length; j++)
					{
						tmpStoreNames.push(tmpStoreMap[tmpConfig.TargetStores[j]] || ('#' + tmpConfig.TargetStores[j]));
					}
				}
			}
			catch (e) { /* ignore */ }

			// Legacy fallback
			if (tmpStoreNames.length === 0 && tmpMapping.IDProjectionStore)
			{
				tmpStoreNames.push(tmpStoreMap[tmpMapping.IDProjectionStore] || ('#' + tmpMapping.IDProjectionStore));
			}

			let tmpStoresDisplay = tmpStoreNames.length > 0 ? tmpStoreNames.join(', ') : '\u2014';

			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpMapping.IDProjectionMapping || '') + '</td>';
			tmpHtml += '<td><strong>' + (tmpMapping.Name || '\u2014') + '</strong></td>';
			tmpHtml += '<td>' + this._escapeHtml(tmpSourceName) + '</td>';
			tmpHtml += '<td>' + this._escapeHtml(tmpStoresDisplay) + '</td>';
			tmpHtml += '<td>' + tmpActive + '</td>';
			tmpHtml += '</tr>';
		}

		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	// ================================================================
	// Deploy to Store
	// ================================================================

	showDeployForm()
	{
		let tmpDeployDiv = document.getElementById('Facto-ProjectionDetail-Deploy');
		if (tmpDeployDiv) tmpDeployDiv.style.display = '';

		// Populate connection dropdown
		let tmpSelect = document.getElementById('Facto-ProjectionDetail-Deploy-Connection');
		if (tmpSelect)
		{
			let tmpHtml = '<option value="">Select a connection...</option>';
			for (let i = 0; i < this._Connections.length; i++)
			{
				let tmpConn = this._Connections[i];
				tmpHtml += '<option value="' + tmpConn.IDStoreConnection + '">' + this._escapeHtml(tmpConn.Name || 'Untitled') + ' (' + (tmpConn.Type || '') + ')</option>';
			}
			tmpSelect.innerHTML = tmpHtml;
		}

		// Default table name from projection name
		let tmpTableInput = document.getElementById('Facto-ProjectionDetail-Deploy-TableName');
		if (tmpTableInput && !tmpTableInput.value)
		{
			let tmpName = this._ProjectionData ? this._ProjectionData.Name : 'Projection';
			tmpTableInput.value = (tmpName || 'Projection').replace(/[^a-zA-Z0-9_]/g, '_');
		}

		// Hide old log
		let tmpLog = document.getElementById('Facto-ProjectionDetail-Deploy-Log');
		if (tmpLog) tmpLog.style.display = 'none';
	}

	hideDeployForm()
	{
		let tmpDeployDiv = document.getElementById('Facto-ProjectionDetail-Deploy');
		if (tmpDeployDiv) tmpDeployDiv.style.display = 'none';
	}

	deployToStore()
	{
		let tmpSelect = document.getElementById('Facto-ProjectionDetail-Deploy-Connection');
		let tmpTableInput = document.getElementById('Facto-ProjectionDetail-Deploy-TableName');
		let tmpLog = document.getElementById('Facto-ProjectionDetail-Deploy-Log');

		let tmpIDConn = tmpSelect ? parseInt(tmpSelect.value, 10) : 0;
		let tmpTableName = tmpTableInput ? tmpTableInput.value.trim() : '';

		if (!tmpIDConn)
		{
			this.pict.providers.FactoUI.showToast('Select a connection first.', 'warn');
			return;
		}
		if (!tmpTableName)
		{
			this.pict.providers.FactoUI.showToast('Enter a table name.', 'warn');
			return;
		}

		if (tmpLog)
		{
			tmpLog.style.display = 'block';
			tmpLog.textContent = 'Deploying...';
		}

		this.pict.providers.Facto.deployProjection(this._CurrentIDDataset, tmpIDConn, tmpTableName).then(
			(pResponse) =>
			{
				if (tmpLog)
				{
					if (pResponse && pResponse.Log)
					{
						tmpLog.textContent = pResponse.Log;
					}
					else if (pResponse && pResponse.Error)
					{
						tmpLog.textContent = 'ERROR: ' + pResponse.Error;
						this.pict.providers.FactoUI.showToast('Deploy failed: ' + pResponse.Error, 'error');
						return;
					}
					else
					{
						tmpLog.textContent = 'Deployment complete.';
					}
				}

				this.pict.providers.FactoUI.showToast('Store deployed successfully.', 'success');

				// Refresh stores list
				this.pict.providers.Facto.loadProjectionStores(this._CurrentIDDataset).then(
					(pResult) =>
					{
						this._Stores = (pResult && pResult.Stores) ? pResult.Stores : [];
						this._renderStoresSection();
						this._renderMetaCards();
					});
			});
	}

	redeployStore(pIDProjectionStore, pIDStoreConnection, pTableName)
	{
		if (!confirm('Redeploy schema to "' + pTableName + '"? This will update the table structure.')) return;

		let tmpLog = document.getElementById('Facto-ProjectionDetail-Deploy-Log');
		let tmpDeployDiv = document.getElementById('Facto-ProjectionDetail-Deploy');
		if (tmpDeployDiv) tmpDeployDiv.style.display = '';
		if (tmpLog)
		{
			tmpLog.style.display = 'block';
			tmpLog.textContent = 'Redeploying...';
		}

		this.pict.providers.Facto.deployProjection(this._CurrentIDDataset, pIDStoreConnection, pTableName).then(
			(pResponse) =>
			{
				if (tmpLog)
				{
					if (pResponse && pResponse.Log)
					{
						tmpLog.textContent = pResponse.Log;
					}
					else if (pResponse && pResponse.Error)
					{
						tmpLog.textContent = 'ERROR: ' + pResponse.Error;
						this.pict.providers.FactoUI.showToast('Redeploy failed: ' + pResponse.Error, 'error');
						return;
					}
					else
					{
						tmpLog.textContent = 'Redeployment complete.';
					}
				}

				this.pict.providers.FactoUI.showToast('Store redeployed successfully.', 'success');

				// Refresh stores list
				this.pict.providers.Facto.loadProjectionStores(this._CurrentIDDataset).then(
					(pResult) =>
					{
						this._Stores = (pResult && pResult.Stores) ? pResult.Stores : [];
						this._renderStoresSection();
						this._renderMetaCards();
					});
			});
	}

	// ================================================================
	// Import Data
	// ================================================================

	_renderImportSection()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Import');
		if (!tmpContainer) return;

		if (this._Mappings.length === 0 || this._Stores.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-card" style="text-align:center; padding:1.5em; color:var(--facto-text-tertiary);">Configure at least one mapping and deploy a store before importing data.</div>';
			return;
		}

		let tmpHtml = '<div class="facto-proj-import-form">';

		// Mapping dropdown
		tmpHtml += '<div>';
		tmpHtml += '<label>Mapping</label>';
		tmpHtml += '<select id="Facto-ProjectionDetail-Import-Mapping" onchange="pict.views[\'Facto-Full-ProjectionDetail\']._onImportMappingChange()">';
		for (let i = 0; i < this._Mappings.length; i++)
		{
			let tmpMapping = this._Mappings[i];
			tmpHtml += '<option value="' + tmpMapping.IDProjectionMapping + '">' + this._escapeHtml(tmpMapping.Name || ('Mapping #' + tmpMapping.IDProjectionMapping)) + '</option>';
		}
		tmpHtml += '</select>';
		tmpHtml += '</div>';

		// Store dropdown
		tmpHtml += '<div>';
		tmpHtml += '<label>Target Store</label>';
		tmpHtml += '<select id="Facto-ProjectionDetail-Import-Store">';
		for (let i = 0; i < this._Stores.length; i++)
		{
			let tmpStore = this._Stores[i];
			tmpHtml += '<option value="' + tmpStore.IDProjectionStore + '">' + this._escapeHtml(tmpStore.TargetTableName || ('Store #' + tmpStore.IDProjectionStore)) + '</option>';
		}
		tmpHtml += '</select>';
		tmpHtml += '</div>';

		// Run Import button
		tmpHtml += '<div>';
		tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-ProjectionDetail\'].runImport()">Run Import</button>';
		tmpHtml += '</div>';

		// Spacer
		tmpHtml += '<div></div>';

		// Stage checkbox — full row
		tmpHtml += '<div class="facto-proj-import-stage-row">';
		tmpHtml += '<input type="checkbox" id="Facto-ProjectionDetail-Import-Stage">';
		tmpHtml += '<label for="Facto-ProjectionDetail-Import-Stage">Stage comprehension for inspection</label>';
		tmpHtml += '</div>';

		tmpHtml += '</div>';

		// Log area (hidden by default)
		tmpHtml += '<div id="Facto-ProjectionDetail-Import-Log" class="facto-proj-deploy-log" style="display:none;"></div>';

		// Staging download link area
		tmpHtml += '<div id="Facto-ProjectionDetail-Import-Staging"></div>';

		tmpContainer.innerHTML = tmpHtml;

		// If there's a first mapping, filter stores for it
		if (this._Mappings.length > 0)
		{
			this._onImportMappingChange();
		}
	}

	_onImportMappingChange()
	{
		let tmpMappingSelect = document.getElementById('Facto-ProjectionDetail-Import-Mapping');
		let tmpStoreSelect = document.getElementById('Facto-ProjectionDetail-Import-Store');
		if (!tmpMappingSelect || !tmpStoreSelect) return;

		let tmpIDMapping = parseInt(tmpMappingSelect.value, 10);

		// Find the mapping config to see if it has TargetStores
		let tmpTargetStores = null;
		for (let i = 0; i < this._Mappings.length; i++)
		{
			if (this._Mappings[i].IDProjectionMapping == tmpIDMapping)
			{
				try
				{
					let tmpConfig = JSON.parse(this._Mappings[i].MappingConfiguration || '{}');
					if (Array.isArray(tmpConfig.TargetStores) && tmpConfig.TargetStores.length > 0)
					{
						tmpTargetStores = tmpConfig.TargetStores;
					}
				}
				catch (e) { /* ignore */ }
				break;
			}
		}

		// Rebuild store dropdown, filtering to target stores if specified
		let tmpHtml = '';
		for (let i = 0; i < this._Stores.length; i++)
		{
			let tmpStore = this._Stores[i];
			if (tmpTargetStores && tmpTargetStores.indexOf(tmpStore.IDProjectionStore) === -1)
			{
				continue;
			}
			tmpHtml += '<option value="' + tmpStore.IDProjectionStore + '">' + this._escapeHtml(tmpStore.TargetTableName || ('Store #' + tmpStore.IDProjectionStore)) + '</option>';
		}
		tmpStoreSelect.innerHTML = tmpHtml;
	}

	runImport()
	{
		let tmpMappingSelect = document.getElementById('Facto-ProjectionDetail-Import-Mapping');
		let tmpStoreSelect = document.getElementById('Facto-ProjectionDetail-Import-Store');
		let tmpStageCheckbox = document.getElementById('Facto-ProjectionDetail-Import-Stage');
		let tmpLog = document.getElementById('Facto-ProjectionDetail-Import-Log');
		let tmpStagingDiv = document.getElementById('Facto-ProjectionDetail-Import-Staging');

		let tmpIDMapping = tmpMappingSelect ? parseInt(tmpMappingSelect.value, 10) : 0;
		let tmpIDStore = tmpStoreSelect ? parseInt(tmpStoreSelect.value, 10) : 0;
		let tmpStageComprehension = tmpStageCheckbox ? tmpStageCheckbox.checked : false;

		if (!tmpIDMapping)
		{
			this.pict.providers.FactoUI.showToast('Select a mapping first.', 'warn');
			return;
		}
		if (!tmpIDStore)
		{
			this.pict.providers.FactoUI.showToast('Select a target store first.', 'warn');
			return;
		}

		if (tmpLog)
		{
			tmpLog.style.display = 'block';
			tmpLog.textContent = 'Running import...';
		}
		if (tmpStagingDiv)
		{
			tmpStagingDiv.innerHTML = '';
		}

		this.pict.providers.Facto.executeImport(this._CurrentIDDataset, tmpIDMapping, tmpIDStore, 100, tmpStageComprehension).then(
			(pResponse) =>
			{
				if (tmpLog)
				{
					if (pResponse && pResponse.Log)
					{
						tmpLog.textContent = pResponse.Log;
					}
					else if (pResponse && pResponse.Error)
					{
						tmpLog.textContent = 'ERROR: ' + pResponse.Error;
						this.pict.providers.FactoUI.showToast('Import failed: ' + pResponse.Error, 'error');
						return;
					}
					else
					{
						tmpLog.textContent = 'Import complete.';
					}
				}

				if (pResponse && pResponse.Success)
				{
					this.pict.providers.FactoUI.showToast('Import complete: ' + (pResponse.RecordsCreated || 0) + ' records created.', 'success');
				}
				else if (pResponse && pResponse.RecordsErrored > 0)
				{
					this.pict.providers.FactoUI.showToast('Import completed with ' + pResponse.RecordsErrored + ' errors.', 'warn');
				}

				// Show staging download link if a file was generated
				if (pResponse && pResponse.StagingFile && tmpStagingDiv)
				{
					let tmpDownloadUrl = '/facto/projection/' + this._CurrentIDDataset + '/comprehension/' + pResponse.StagingFile;
					tmpStagingDiv.innerHTML = '<a class="facto-proj-import-staging-link" href="' + tmpDownloadUrl + '" target="_blank">Download staged comprehension: ' + this._escapeHtml(pResponse.StagingFile) + '</a>';
				}
			}).catch(
			(pError) =>
			{
				if (tmpLog)
				{
					tmpLog.style.display = 'block';
					tmpLog.textContent = 'ERROR: ' + (pError.message || pError);
				}
				this.pict.providers.FactoUI.showToast('Import failed.', 'error');
			});
	}

	// ================================================================
	// Schema Editor Delegation
	// ================================================================

	editSchema()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Container');
		let tmpBack = document.querySelector('.facto-proj-detail-back');
		let tmpSchemaContainer = document.getElementById('Facto-Proj-Schema-Editor-Container');

		if (tmpContainer) tmpContainer.style.display = 'none';
		if (tmpBack) tmpBack.style.display = 'none';
		if (tmpSchemaContainer) tmpSchemaContainer.style.display = '';

		let tmpName = this._ProjectionData ? this._ProjectionData.Name : '';
		this.pict.views['Facto-Full-SchemaEditor'].editSchema(this._CurrentIDDataset, tmpName);
	}

	closeSchemaEditor()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Container');
		let tmpBack = document.querySelector('.facto-proj-detail-back');
		let tmpSchemaContainer = document.getElementById('Facto-Proj-Schema-Editor-Container');

		if (tmpContainer) tmpContainer.style.display = '';
		if (tmpBack) tmpBack.style.display = '';
		if (tmpSchemaContainer) tmpSchemaContainer.style.display = 'none';

		// Refresh schema section to pick up changes
		this.pict.providers.Facto.loadProjectionSchema(this._CurrentIDDataset).then(
			(pSchema) =>
			{
				this._Schema = pSchema || {};
				this._renderSchemaSection();
				this._renderMetaCards();
			});
	}

	onSchemaUpdated(pSchemaVersion)
	{
		// Called by SchemaEditor after a successful save
		if (this._ProjectionData)
		{
			this._ProjectionData.SchemaVersion = pSchemaVersion;
		}
	}

	// ================================================================
	// Mapping Editor Delegation
	// ================================================================

	editMappings()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Container');
		let tmpBack = document.querySelector('.facto-proj-detail-back');
		let tmpMappingContainer = document.getElementById('Facto-Proj-Mapping-Editor-Container');

		if (tmpContainer) tmpContainer.style.display = 'none';
		if (tmpBack) tmpBack.style.display = 'none';
		if (tmpMappingContainer) tmpMappingContainer.style.display = '';

		let tmpName = this._ProjectionData ? this._ProjectionData.Name : '';
		this.pict.views['Facto-Full-MappingEditor'].editMappings(this._CurrentIDDataset, tmpName);
	}

	closeMappingEditor()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Container');
		let tmpBack = document.querySelector('.facto-proj-detail-back');
		let tmpMappingContainer = document.getElementById('Facto-Proj-Mapping-Editor-Container');

		if (tmpContainer) tmpContainer.style.display = '';
		if (tmpBack) tmpBack.style.display = '';
		if (tmpMappingContainer) tmpMappingContainer.style.display = 'none';

		// Refresh mappings section to pick up changes
		Promise.all(
		[
			this.pict.providers.Facto.loadProjectionMappings(this._CurrentIDDataset),
			this.pict.providers.Facto.loadProjectionStores(this._CurrentIDDataset)
		]).then(
			(pResults) =>
			{
				this._Mappings = (pResults[0] && pResults[0].Mappings) ? pResults[0].Mappings : [];
				this._Stores = (pResults[1] && pResults[1].Stores) ? pResults[1].Stores : [];
				this._renderMappingsSection();
				this._renderStoresSection();
				this._renderMetaCards();
			});
	}

	// ================================================================
	// Query Panel Delegation
	// ================================================================

	showQuery()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Container');
		let tmpBack = document.querySelector('.facto-proj-detail-back');
		let tmpQueryContainer = document.getElementById('Facto-Proj-Query-Container');

		if (tmpContainer) tmpContainer.style.display = 'none';
		if (tmpBack) tmpBack.style.display = 'none';
		if (tmpQueryContainer) tmpQueryContainer.style.display = '';

		let tmpQueryPanel = this.pict.views['Facto-Full-QueryPanel'];
		if (tmpQueryPanel)
		{
			tmpQueryPanel.render();
		}
	}

	closeQuery()
	{
		let tmpContainer = document.getElementById('Facto-ProjectionDetail-Container');
		let tmpBack = document.querySelector('.facto-proj-detail-back');
		let tmpQueryContainer = document.getElementById('Facto-Proj-Query-Container');

		if (tmpContainer) tmpContainer.style.display = '';
		if (tmpBack) tmpBack.style.display = '';
		if (tmpQueryContainer) tmpQueryContainer.style.display = 'none';
	}

	// ================================================================
	// Actions
	// ================================================================

	deleteProjection()
	{
		let tmpName = this._ProjectionData ? this._ProjectionData.Name : this._CurrentIDDataset;
		if (!confirm('Delete projection "' + tmpName + '"? This will remove the dataset and all associated mappings and stores.')) return;

		this.pict.providers.Facto.deleteProjection(this._CurrentIDDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.providers.FactoUI.showToast('Error deleting projection: ' + pResponse.Error, 'error');
					return;
				}

				this.pict.providers.FactoUI.showToast('Projection deleted.', 'success');
				this.pict.PictApplication.navigateTo('/Projections');
			});
	}

	refresh()
	{
		if (this._CurrentIDDataset)
		{
			this._fetchAndDisplayProjection();
		}
	}

	goBack()
	{
		this.pict.PictApplication.navigateTo('/Projections');
	}

	_escapeHtml(pText)
	{
		let tmpDiv = document.createElement('div');
		tmpDiv.textContent = pText;
		return tmpDiv.innerHTML;
	}
}

module.exports = FactoFullProjectionDetailView;

module.exports.default_configuration = _ViewConfiguration;
