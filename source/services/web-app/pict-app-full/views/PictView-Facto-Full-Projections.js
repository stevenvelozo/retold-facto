const libPictView = require('pict-view');

const MICRODDL_TYPE_MAP =
{
	'@': { DataType: 'AutoIdentity', Label: 'Auto ID', HasSize: false },
	'%': { DataType: 'GUID', Label: 'GUID', HasSize: false },
	'$': { DataType: 'String', Label: 'String', HasSize: true },
	'*': { DataType: 'Text', Label: 'Text', HasSize: false },
	'#': { DataType: 'Numeric', Label: 'Numeric', HasSize: false },
	'.': { DataType: 'Decimal', Label: 'Decimal', HasSize: true },
	'&': { DataType: 'DateTime', Label: 'Date/Time', HasSize: false },
	'^': { DataType: 'Boolean', Label: 'Boolean', HasSize: false }
};

const DATATYPE_TO_SYMBOL = {};
for (let tmpSymbol in MICRODDL_TYPE_MAP)
{
	DATATYPE_TO_SYMBOL[MICRODDL_TYPE_MAP[tmpSymbol].DataType] = tmpSymbol;
}

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Projections",

	DefaultRenderable: "Facto-Full-Projections-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		/* Projections page layout */
		.facto-proj-tabs {
			display: flex;
			gap: 0;
			border-bottom: 2px solid var(--facto-border-subtle, #e8ddc8);
			margin-bottom: 1.25em;
		}
		.facto-proj-tab {
			padding: 0.6em 1.25em;
			font-size: 0.85em;
			font-weight: 600;
			cursor: pointer;
			border: none;
			background: transparent;
			color: var(--facto-text-tertiary, #a09070);
			border-bottom: 2px solid transparent;
			margin-bottom: -2px;
			transition: color 0.15s, border-color 0.15s;
		}
		.facto-proj-tab:hover {
			color: var(--facto-text-secondary, #786848);
		}
		.facto-proj-tab.active {
			color: var(--facto-brand, #18a5a0);
			border-bottom-color: var(--facto-brand, #18a5a0);
		}
		.facto-proj-panel {
			display: none;
		}
		.facto-proj-panel.active {
			display: block;
		}

		/* Schema editor */
		.facto-schema-editor {
			display: none;
		}
		.facto-schema-editor.active {
			display: block;
		}
		.facto-schema-header {
			display: flex;
			align-items: center;
			gap: 1em;
			margin-bottom: 1em;
		}
		.facto-schema-header h3 {
			margin: 0;
			flex: 1;
		}
		.facto-schema-mode-tabs {
			display: flex;
			gap: 0;
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 6px;
			overflow: hidden;
		}
		.facto-schema-mode-tab {
			padding: 0.35em 0.8em;
			font-size: 0.78em;
			cursor: pointer;
			border: none;
			background: transparent;
			color: var(--facto-text-secondary, #786848);
			transition: background 0.15s, color 0.15s;
		}
		.facto-schema-mode-tab:not(:last-child) {
			border-right: 1px solid var(--facto-border, #d6c8ae);
		}
		.facto-schema-mode-tab.active {
			background: var(--facto-brand-a12, rgba(24,165,160,0.12));
			color: var(--facto-brand, #18a5a0);
		}

		/* Column builder table */
		.facto-col-builder {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 0.75em;
		}
		.facto-col-builder th {
			text-align: left;
			font-size: 0.72em;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--facto-text-tertiary, #a09070);
			padding: 0.5em 0.4em;
			border-bottom: 1px solid var(--facto-border, #d6c8ae);
		}
		.facto-col-builder td {
			padding: 0.35em 0.4em;
			border-bottom: 1px solid var(--facto-border-subtle, #e8ddc8);
			vertical-align: middle;
		}
		.facto-col-builder input,
		.facto-col-builder select {
			width: 100%;
			padding: 0.3em 0.5em;
			font-size: 0.85em;
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 4px;
			background: var(--facto-bg-input, #fcf8f0);
			color: var(--facto-text, #3a3020);
		}
		.facto-col-builder .facto-col-size {
			width: 80px;
		}
		.facto-col-remove-btn {
			background: transparent;
			border: none;
			color: var(--facto-error, #c44836);
			cursor: pointer;
			font-size: 1.1em;
			padding: 0.2em 0.4em;
			border-radius: 4px;
		}
		.facto-col-remove-btn:hover {
			background: rgba(196, 72, 54, 0.1);
		}

		/* DDL editor */
		.facto-ddl-editor {
			width: 100%;
			min-height: 160px;
			font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
			font-size: 0.85em;
			padding: 0.75em;
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 6px;
			background: var(--facto-bg-input, #fcf8f0);
			color: var(--facto-text, #3a3020);
			resize: vertical;
			tab-size: 4;
		}

		/* Schema preview */
		.facto-schema-preview {
			padding: 0.6em 0.8em;
			font-family: 'SF Mono', 'Fira Code', monospace;
			font-size: 0.78em;
			background: var(--facto-bg-code, #f0e8d8);
			border: 1px solid var(--facto-border-subtle, #e8ddc8);
			border-radius: 6px;
			white-space: pre-wrap;
			max-height: 200px;
			overflow: auto;
			color: var(--facto-text-secondary, #786848);
			margin-top: 0.5em;
		}

		/* Connection form */
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
			background: var(--facto-bg-input, #fcf8f0);
			color: var(--facto-text, #3a3020);
		}
		.facto-conn-form-actions {
			grid-column: 1 / -1;
			display: flex;
			gap: 0.5em;
			margin-top: 0.5em;
		}

		/* Status badges */
		.facto-status-badge {
			display: inline-block;
			padding: 0.15em 0.5em;
			font-size: 0.72em;
			font-weight: 600;
			border-radius: 10px;
			text-transform: uppercase;
			letter-spacing: 0.3px;
		}
		.facto-status-badge.untested {
			background: var(--facto-brand-a10, rgba(24,165,160,0.1));
			color: var(--facto-text-tertiary, #a09070);
		}
		.facto-status-badge.ok {
			background: rgba(58, 148, 104, 0.12);
			color: var(--facto-success, #3a9468);
		}
		.facto-status-badge.failed {
			background: rgba(196, 72, 54, 0.12);
			color: var(--facto-error, #c44836);
		}
		.facto-status-badge.deployed {
			background: rgba(58, 148, 104, 0.12);
			color: var(--facto-success, #3a9468);
		}
		.facto-status-badge.pending {
			background: var(--facto-brand-a10, rgba(24,165,160,0.1));
			color: var(--facto-text-tertiary, #a09070);
		}

		/* Deploy dialog */
		.facto-deploy-dialog {
			display: none;
			padding: 1em;
			background: var(--facto-bg-surface, #fcf8f0);
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 8px;
			margin-top: 1em;
		}
		.facto-deploy-dialog.active {
			display: block;
		}
		.facto-deploy-log {
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
			color: var(--facto-text-secondary, #786848);
		}

		/* Mapping editor */
		.facto-mapping-editor {
			display: none;
		}
		.facto-mapping-editor.active {
			display: block;
		}
		.facto-mapping-header {
			display: flex;
			align-items: center;
			gap: 1em;
			margin-bottom: 1em;
		}
		.facto-mapping-header h3 {
			margin: 0;
			flex: 1;
		}
		.facto-mapping-list-table {
			width: 100%;
			border-collapse: collapse;
			margin-bottom: 1em;
		}
		.facto-mapping-list-table th {
			text-align: left;
			font-size: 0.72em;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--facto-text-tertiary, #a09070);
			padding: 0.5em 0.4em;
			border-bottom: 1px solid var(--facto-border, #d6c8ae);
		}
		.facto-mapping-list-table td {
			padding: 0.35em 0.4em;
			border-bottom: 1px solid var(--facto-border-subtle, #e8ddc8);
			vertical-align: middle;
		}
		.facto-flow-container {
			width: 100%;
			height: 500px;
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 6px;
			background: var(--facto-bg-surface, #fcf8f0);
			margin-bottom: 0.75em;
		}
		.facto-mapping-json-editor {
			width: 100%;
			min-height: 300px;
			font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
			font-size: 0.85em;
			padding: 0.75em;
			border: 1px solid var(--facto-border, #d6c8ae);
			border-radius: 6px;
			background: var(--facto-bg-input, #fcf8f0);
			color: var(--facto-text, #3a3020);
			resize: vertical;
			tab-size: 4;
		}
		.facto-import-log {
			font-family: 'SF Mono', monospace;
			font-size: 0.78em;
			padding: 0.6em;
			background: var(--facto-bg-code, #f0e8d8);
			border: 1px solid var(--facto-border-subtle, #e8ddc8);
			border-radius: 6px;
			white-space: pre-wrap;
			max-height: 300px;
			overflow: auto;
			margin-top: 0.5em;
			color: var(--facto-text-secondary, #786848);
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-Projections-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Projections</h1>
		<p>Define schemas, manage database connections, and deploy projections to external stores.</p>
	</div>

	<div class="facto-proj-tabs">
		<button class="facto-proj-tab active" onclick="{~P~}.views['Facto-Full-Projections'].showTab('projections')">Projections</button>
		<button class="facto-proj-tab" onclick="{~P~}.views['Facto-Full-Projections'].showTab('connections')">Connections</button>
		<button class="facto-proj-tab" onclick="{~P~}.views['Facto-Full-Projections'].showTab('query')">Query</button>
	</div>

	<!-- Projections Panel -->
	<div id="Facto-Proj-Panel-Projections" class="facto-proj-panel active">
		<div id="Facto-Proj-List-Wrap">
			<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1em;">
				<div class="facto-section-title" style="margin:0;">Projection Datasets</div>
				<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Projections'].createProjection()">+ New Projection</button>
			</div>
			<div id="Facto-Proj-List"></div>
		</div>

		<div id="Facto-Proj-Schema-Editor" class="facto-schema-editor">
			<div class="facto-schema-header">
				<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].closeSchemaEditor()">&larr; Back</button>
				<h3 id="Facto-Proj-Schema-Title">Schema Editor</h3>
				<div class="facto-schema-mode-tabs">
					<button class="facto-schema-mode-tab active" id="Facto-Proj-ModeTab-Visual" onclick="{~P~}.views['Facto-Full-Projections'].switchEditorMode('visual')">Visual Builder</button>
					<button class="facto-schema-mode-tab" id="Facto-Proj-ModeTab-DDL" onclick="{~P~}.views['Facto-Full-Projections'].switchEditorMode('ddl')">MicroDDL</button>
				</div>
			</div>

			<!-- Visual Builder -->
			<div id="Facto-Proj-Visual-Wrap">
				<table class="facto-col-builder">
					<thead>
						<tr>
							<th style="width:35%;">Column Name</th>
							<th style="width:25%;">Data Type</th>
							<th style="width:15%;">Size</th>
							<th style="width:15%;"></th>
						</tr>
					</thead>
					<tbody id="Facto-Proj-ColBuilder-Body"></tbody>
				</table>
				<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].addColumn()">+ Add Column</button>
				<div class="facto-section-title" style="margin-top:1em; font-size:0.72em;">Generated MicroDDL</div>
				<div class="facto-schema-preview" id="Facto-Proj-DDL-Preview"></div>
			</div>

			<!-- DDL Editor -->
			<div id="Facto-Proj-DDL-Wrap" style="display:none;">
				<textarea class="facto-ddl-editor" id="Facto-Proj-DDL-Textarea" placeholder="!MyTable&#10;@IDMyTable&#10;$Name 200&#10;#Count&#10;&CreatedDate"></textarea>
				<div style="margin-top:0.5em;">
					<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].compileDDL()">Compile &amp; Preview</button>
				</div>
				<div class="facto-schema-preview" id="Facto-Proj-Schema-Preview" style="display:none;"></div>
			</div>

			<div style="margin-top:1em; display:flex; gap:0.5em;">
				<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Projections'].saveSchema()">Save Schema</button>
				<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-Projections'].showDeployDialog()">Deploy to Store</button>
			</div>

			<!-- Deploy Dialog -->
			<div id="Facto-Proj-Deploy-Dialog" class="facto-deploy-dialog">
				<div class="facto-section-title">Deploy Projection Schema</div>
				<div class="facto-conn-form-grid" style="display:grid; margin-top:0.5em;">
					<div>
						<label>Target Connection</label>
						<select id="Facto-Proj-Deploy-Connection"></select>
					</div>
					<div>
						<label>Table Name</label>
						<input type="text" id="Facto-Proj-Deploy-TableName" placeholder="e.g. Schools">
					</div>
					<div class="facto-conn-form-actions">
						<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].deploySchema()">Deploy</button>
						<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].hideDeployDialog()">Cancel</button>
					</div>
				</div>
				<div id="Facto-Proj-Deploy-Log" class="facto-deploy-log" style="display:none;"></div>
			</div>
		</div>

		<div id="Facto-Proj-Mapping-Editor" class="facto-mapping-editor">
			<div class="facto-mapping-header">
				<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].closeMappingEditor()">&larr; Back</button>
				<h3 id="Facto-Proj-Mapping-Title">Mapping Editor</h3>
				<div class="facto-schema-mode-tabs">
					<button class="facto-schema-mode-tab active" id="Facto-Proj-MapMode-Flow" onclick="{~P~}.views['Facto-Full-Projections'].switchMapMode('flow')">Visual Mapper</button>
					<button class="facto-schema-mode-tab" id="Facto-Proj-MapMode-JSON" onclick="{~P~}.views['Facto-Full-Projections'].switchMapMode('json')">JSON Config</button>
				</div>
			</div>

			<div id="Facto-Proj-Mapping-List-Wrap">
				<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75em;">
					<div class="facto-section-title" style="margin:0;">Existing Mappings</div>
					<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].newMapping()">+ New Mapping</button>
				</div>
				<div id="Facto-Proj-Mapping-List"></div>
			</div>

			<div id="Facto-Proj-Mapping-Detail" style="display:none;">
				<div style="display:flex; gap:0.5em; align-items:center; margin-bottom:0.75em;">
					<label style="font-size:0.78em; font-weight:600;">Mapping Name</label>
					<input type="text" id="Facto-Proj-Mapping-Name" placeholder="Mapping name" style="flex:1; padding:0.3em 0.5em; font-size:0.85em; border:1px solid var(--facto-border); border-radius:4px; background:var(--facto-bg-input); color:var(--facto-text);">
				</div>

				<div style="display:flex; gap:0.5em; align-items:center; margin-bottom:0.75em;">
					<label style="font-size:0.78em; font-weight:600;">Source</label>
					<select id="Facto-Proj-Mapping-Source" style="flex:1; padding:0.3em 0.5em; font-size:0.85em; border:1px solid var(--facto-border); border-radius:4px;"></select>
					<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].discoverSourceFields()">Discover Fields</button>
				</div>

				<div id="Facto-Proj-Flow-Wrap">
					<div id="Facto-Proj-Flow-Container" class="facto-flow-container"></div>
				</div>

				<div id="Facto-Proj-JSON-Wrap" style="display:none;">
					<textarea class="facto-mapping-json-editor" id="Facto-Proj-Mapping-JSON" placeholder='{"Entity":"MyTable","GUIDTemplate":"{~D:Record.IDRecord~}","Mappings":{},"Solvers":[],"ManyfestAddresses":false}'></textarea>
				</div>

				<div style="margin-top:0.75em; display:flex; gap:0.5em; flex-wrap:wrap; align-items:center;">
					<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Projections'].saveMapping()">Save Mapping</button>
					<div style="flex:1;"></div>
					<label style="font-size:0.78em; font-weight:600;">Target Store</label>
					<select id="Facto-Proj-Import-Store" style="padding:0.3em 0.5em; font-size:0.85em; border:1px solid var(--facto-border); border-radius:4px;"></select>
					<label style="font-size:0.78em; font-weight:600;">Batch</label>
					<input type="number" id="Facto-Proj-Import-Batch" value="100" style="width:60px; padding:0.3em 0.5em; font-size:0.85em; border:1px solid var(--facto-border); border-radius:4px;">
					<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].executeImport()">Run Import</button>
				</div>

				<div id="Facto-Proj-Import-Log" class="facto-import-log" style="display:none;"></div>
			</div>
		</div>
	</div>

	<!-- Connections Panel -->
	<div id="Facto-Proj-Panel-Connections" class="facto-proj-panel">
		<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:1em;">
			<div class="facto-section-title" style="margin:0;">Store Connections</div>
			<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].toggleConnectionForm()">+ Add Connection</button>
		</div>

		<div id="Facto-Proj-ConnForm" class="facto-conn-form">
			<div class="facto-conn-form-grid">
				<div>
					<label>Connection Name</label>
					<input type="text" id="Facto-Proj-Conn-Name" placeholder="e.g. Production MySQL">
				</div>
				<div>
					<label>Type</label>
					<select id="Facto-Proj-Conn-Type">
						<option value="MySQL">MySQL</option>
						<option value="PostgreSQL">PostgreSQL</option>
						<option value="MSSQL">MSSQL</option>
						<option value="SQLite">SQLite</option>
						<option value="Solr">Solr</option>
						<option value="RocksDB">RocksDB</option>
					</select>
				</div>
				<div>
					<label>Host</label>
					<input type="text" id="Facto-Proj-Conn-Host" placeholder="localhost">
				</div>
				<div>
					<label>Port</label>
					<input type="number" id="Facto-Proj-Conn-Port" placeholder="3306">
				</div>
				<div>
					<label>User</label>
					<input type="text" id="Facto-Proj-Conn-User" placeholder="root">
				</div>
				<div>
					<label>Password</label>
					<input type="password" id="Facto-Proj-Conn-Password" placeholder="password">
				</div>
				<div>
					<label>Database</label>
					<input type="text" id="Facto-Proj-Conn-Database" placeholder="my_database">
				</div>
				<div>
					<label>&nbsp;</label>
				</div>
				<div class="facto-conn-form-actions">
					<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].addConnection()">Save Connection</button>
					<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Projections'].toggleConnectionForm()">Cancel</button>
				</div>
			</div>
		</div>

		<div id="Facto-Proj-ConnList"></div>
	</div>

	<!-- Query Panel (existing functionality) -->
	<div id="Facto-Proj-Panel-Query" class="facto-proj-panel">
		<div class="facto-section">
			<div class="facto-section-title">Warehouse Summary</div>
			<div id="Facto-Full-Projections-Summary" class="facto-card-grid"></div>
		</div>

		<div class="facto-section" style="margin-top:1.5em;">
			<div class="facto-section-title">Query Records</div>
			<div class="facto-inline-group">
				<div>
					<label>Dataset ID</label>
					<input type="number" id="Facto-Full-Proj-DatasetID" placeholder="e.g. 1">
				</div>
				<div>
					<label>Type Filter</label>
					<select id="Facto-Full-Proj-Type">
						<option value="">All</option>
						<option value="Raw">Raw</option>
						<option value="Compositional">Compositional</option>
						<option value="Projection">Projection</option>
					</select>
				</div>
			</div>
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-Projections'].runQuery()">Run Query</button>
			<button class="facto-btn facto-btn-secondary" onclick="{~P~}.views['Facto-Full-Projections'].runAggregate()">Aggregate</button>
		</div>
		<div id="Facto-Full-Projections-Results" class="facto-projection-results" style="display:none;"></div>
	</div>
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
		this._Connections = [];
		this._EditingIDDataset = 0;
		this._EditingName = '';
		this._Columns = [];
		this._EditorMode = 'visual';

		// Mapping editor state
		this._CurrentMappings = [];
		this._SelectedMappingID = 0;
		this._DiscoveredFields = {};
		this._FlowView = null;
		this._MapEditorMode = 'flow';
		this._MappingSources = [];
		this._MappingStores = [];
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Load all data in parallel
		Promise.all(
		[
			this.pict.providers.Facto.loadProjections(),
			this.pict.providers.Facto.loadStoreConnections(),
			this.pict.providers.Facto.loadProjectionSummary()
		]).then(
			(pResults) =>
			{
				this._Projections = (pResults[0] && pResults[0].Projections) ? pResults[0].Projections : [];
				this._Connections = (pResults[1] && pResults[1].Connections) ? pResults[1].Connections : [];

				this.refreshProjectionList();
				this.refreshConnectionList();

				// Render warehouse summary
				let tmpSummary = pResults[2] || {};
				let tmpSumContainer = document.getElementById('Facto-Full-Projections-Summary');
				if (tmpSumContainer)
				{
					let tmpHtml = '';
					tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (tmpSummary.TotalRecords || 0) + '</div><div class="facto-dashboard-stat-label">Total Records</div></div>';
					tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (tmpSummary.TotalDatasets || 0) + '</div><div class="facto-dashboard-stat-label">Total Datasets</div></div>';
					tmpHtml += '<div class="facto-card facto-dashboard-stat"><div class="facto-dashboard-stat-value">' + (tmpSummary.TotalSources || 0) + '</div><div class="facto-dashboard-stat-label">Total Sources</div></div>';
					tmpSumContainer.innerHTML = tmpHtml;
				}
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	// ================================================================
	// Tab Navigation
	// ================================================================

	showTab(pTabName)
	{
		let tmpTabButtons = document.querySelectorAll('.facto-proj-tab');
		let tmpPanels = document.querySelectorAll('.facto-proj-panel');

		for (let i = 0; i < tmpTabButtons.length; i++)
		{
			tmpTabButtons[i].classList.remove('active');
		}
		for (let i = 0; i < tmpPanels.length; i++)
		{
			tmpPanels[i].classList.remove('active');
		}

		let tmpPanelMap =
		{
			'projections': 'Facto-Proj-Panel-Projections',
			'connections': 'Facto-Proj-Panel-Connections',
			'query': 'Facto-Proj-Panel-Query'
		};

		let tmpPanel = document.getElementById(tmpPanelMap[pTabName]);
		if (tmpPanel) tmpPanel.classList.add('active');

		// Highlight the matching tab button
		for (let i = 0; i < tmpTabButtons.length; i++)
		{
			if (tmpTabButtons[i].textContent.toLowerCase().indexOf(pTabName) >= 0)
			{
				tmpTabButtons[i].classList.add('active');
				break;
			}
		}
	}

	// ================================================================
	// Projection List
	// ================================================================

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
			tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-Projections\'].editSchema(' + tmpProj.IDDataset + ', \'' + (tmpProj.Name || '').replace(/'/g, "\\'") + '\')">Edit Schema</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Projections\'].editMappings(' + tmpProj.IDDataset + ', \'' + (tmpProj.Name || '').replace(/'/g, "\\'") + '\')">Mappings</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Projections\'].viewStores(' + tmpProj.IDDataset + ')">Stores</button>';
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
					alert('Error: ' + pResponse.Error);
					return;
				}

				// Reload projections
				this.pict.providers.Facto.loadProjections().then(
					(pResult) =>
					{
						this._Projections = (pResult && pResult.Projections) ? pResult.Projections : [];
						this.refreshProjectionList();
					});
			});
	}

	viewStores(pIDDataset)
	{
		this.pict.providers.Facto.loadProjectionStores(pIDDataset).then(
			(pResponse) =>
			{
				let tmpStores = (pResponse && pResponse.Stores) ? pResponse.Stores : [];
				if (tmpStores.length === 0)
				{
					alert('No stores deployed for this projection yet.');
					return;
				}

				let tmpMsg = 'Deployed Stores:\n\n';
				for (let i = 0; i < tmpStores.length; i++)
				{
					tmpMsg += '  \u2022 ' + tmpStores[i].TargetTableName + ' (' + tmpStores[i].Status + ')\n';
				}
				alert(tmpMsg);
			});
	}

	// ================================================================
	// Schema Editor
	// ================================================================

	editSchema(pIDDataset, pName)
	{
		this._EditingIDDataset = pIDDataset;
		this._EditingName = pName || '';

		let tmpListWrap = document.getElementById('Facto-Proj-List-Wrap');
		let tmpEditor = document.getElementById('Facto-Proj-Schema-Editor');
		let tmpTitle = document.getElementById('Facto-Proj-Schema-Title');

		if (tmpListWrap) tmpListWrap.style.display = 'none';
		if (tmpEditor) tmpEditor.classList.add('active');
		if (tmpTitle) tmpTitle.textContent = 'Schema: ' + (pName || 'Untitled');

		// Load existing schema
		this.pict.providers.Facto.loadProjectionSchema(pIDDataset).then(
			(pResponse) =>
			{
				let tmpDDL = (pResponse && pResponse.SchemaDefinition) ? pResponse.SchemaDefinition : '';

				if (tmpDDL)
				{
					this._Columns = this.microDDLToColumns(tmpDDL);
				}
				else
				{
					// Start with a default table and ID column
					this._Columns =
					[
						{ Name: 'ID' + (pName || 'Record').replace(/[^a-zA-Z0-9]/g, ''), DataType: 'AutoIdentity', Size: '' }
					];
				}

				this.refreshColumnBuilder();
				this.updateDDLPreview();

				// Also set the DDL textarea
				let tmpTextarea = document.getElementById('Facto-Proj-DDL-Textarea');
				if (tmpTextarea)
				{
					tmpTextarea.value = tmpDDL || this.columnsToMicroDDL();
				}
			});
	}

	closeSchemaEditor()
	{
		let tmpListWrap = document.getElementById('Facto-Proj-List-Wrap');
		let tmpEditor = document.getElementById('Facto-Proj-Schema-Editor');

		if (tmpListWrap) tmpListWrap.style.display = '';
		if (tmpEditor) tmpEditor.classList.remove('active');

		this._EditingIDDataset = 0;
		this._Columns = [];
	}

	switchEditorMode(pMode)
	{
		this._EditorMode = pMode;

		let tmpVisualWrap = document.getElementById('Facto-Proj-Visual-Wrap');
		let tmpDDLWrap = document.getElementById('Facto-Proj-DDL-Wrap');
		let tmpVisualTab = document.getElementById('Facto-Proj-ModeTab-Visual');
		let tmpDDLTab = document.getElementById('Facto-Proj-ModeTab-DDL');

		if (pMode === 'visual')
		{
			if (tmpVisualWrap) tmpVisualWrap.style.display = '';
			if (tmpDDLWrap) tmpDDLWrap.style.display = 'none';
			if (tmpVisualTab) tmpVisualTab.classList.add('active');
			if (tmpDDLTab) tmpDDLTab.classList.remove('active');

			// Sync: parse DDL textarea back to columns
			let tmpTextarea = document.getElementById('Facto-Proj-DDL-Textarea');
			if (tmpTextarea && tmpTextarea.value.trim())
			{
				this._Columns = this.microDDLToColumns(tmpTextarea.value);
				this.refreshColumnBuilder();
				this.updateDDLPreview();
			}
		}
		else
		{
			if (tmpVisualWrap) tmpVisualWrap.style.display = 'none';
			if (tmpDDLWrap) tmpDDLWrap.style.display = '';
			if (tmpVisualTab) tmpVisualTab.classList.remove('active');
			if (tmpDDLTab) tmpDDLTab.classList.add('active');

			// Sync: marshal columns to DDL textarea
			this._marshalColumnsFromUI();
			let tmpTextarea = document.getElementById('Facto-Proj-DDL-Textarea');
			if (tmpTextarea)
			{
				tmpTextarea.value = this.columnsToMicroDDL();
			}
		}
	}

	addColumn()
	{
		this._marshalColumnsFromUI();
		this._Columns.push({ Name: '', DataType: 'String', Size: '200' });
		this.refreshColumnBuilder();
		this.updateDDLPreview();
	}

	removeColumn(pIndex)
	{
		this._marshalColumnsFromUI();
		this._Columns.splice(pIndex, 1);
		this.refreshColumnBuilder();
		this.updateDDLPreview();
	}

	refreshColumnBuilder()
	{
		let tmpBody = document.getElementById('Facto-Proj-ColBuilder-Body');
		if (!tmpBody) return;

		let tmpHtml = '';

		for (let i = 0; i < this._Columns.length; i++)
		{
			let tmpCol = this._Columns[i];
			let tmpSizeDisabled = !MICRODDL_TYPE_MAP[DATATYPE_TO_SYMBOL[tmpCol.DataType] || '$'].HasSize;

			tmpHtml += '<tr>';
			tmpHtml += '<td><input type="text" value="' + (tmpCol.Name || '').replace(/"/g, '&quot;') + '" data-col-index="' + i + '" data-col-field="Name"></td>';
			tmpHtml += '<td><select data-col-index="' + i + '" data-col-field="DataType" onchange="pict.views[\'Facto-Full-Projections\']._onColumnTypeChange(' + i + ', this.value)">';

			for (let tmpSym in MICRODDL_TYPE_MAP)
			{
				let tmpType = MICRODDL_TYPE_MAP[tmpSym];
				let tmpSelected = (tmpType.DataType === tmpCol.DataType) ? ' selected' : '';
				tmpHtml += '<option value="' + tmpType.DataType + '"' + tmpSelected + '>' + tmpType.Label + '</option>';
			}

			tmpHtml += '</select></td>';
			tmpHtml += '<td><input type="text" class="facto-col-size" value="' + (tmpCol.Size || '').replace(/"/g, '&quot;') + '" data-col-index="' + i + '" data-col-field="Size"' + (tmpSizeDisabled ? ' disabled' : '') + '></td>';
			tmpHtml += '<td><button class="facto-col-remove-btn" onclick="pict.views[\'Facto-Full-Projections\'].removeColumn(' + i + ')" title="Remove column">&times;</button></td>';
			tmpHtml += '</tr>';
		}

		tmpBody.innerHTML = tmpHtml;
	}

	_onColumnTypeChange(pIndex, pDataType)
	{
		this._marshalColumnsFromUI();
		let tmpSymbol = DATATYPE_TO_SYMBOL[pDataType] || '$';
		let tmpHasSize = MICRODDL_TYPE_MAP[tmpSymbol].HasSize;

		if (!tmpHasSize)
		{
			this._Columns[pIndex].Size = '';
		}
		else if (!this._Columns[pIndex].Size)
		{
			this._Columns[pIndex].Size = pDataType === 'String' ? '200' : '8,2';
		}

		this._Columns[pIndex].DataType = pDataType;
		this.refreshColumnBuilder();
		this.updateDDLPreview();
	}

	/**
	 * Read column values from the DOM inputs back into the _Columns array.
	 */
	_marshalColumnsFromUI()
	{
		let tmpInputs = document.querySelectorAll('#Facto-Proj-ColBuilder-Body input[data-col-field="Name"], #Facto-Proj-ColBuilder-Body input[data-col-field="Size"], #Facto-Proj-ColBuilder-Body select[data-col-field="DataType"]');

		for (let i = 0; i < tmpInputs.length; i++)
		{
			let tmpInput = tmpInputs[i];
			let tmpIndex = parseInt(tmpInput.getAttribute('data-col-index'), 10);
			let tmpField = tmpInput.getAttribute('data-col-field');

			if (tmpIndex >= 0 && tmpIndex < this._Columns.length && tmpField)
			{
				this._Columns[tmpIndex][tmpField] = tmpInput.value;
			}
		}
	}

	updateDDLPreview()
	{
		let tmpPreview = document.getElementById('Facto-Proj-DDL-Preview');
		if (tmpPreview)
		{
			tmpPreview.textContent = this.columnsToMicroDDL();
		}
	}

	columnsToMicroDDL()
	{
		let tmpTableName = (this._EditingName || 'Untitled').replace(/[^a-zA-Z0-9_]/g, '');
		let tmpLines = ['!' + tmpTableName];

		for (let i = 0; i < this._Columns.length; i++)
		{
			let tmpCol = this._Columns[i];
			let tmpSymbol = DATATYPE_TO_SYMBOL[tmpCol.DataType] || '$';
			let tmpLine = tmpSymbol + (tmpCol.Name || 'Column' + i);

			if (MICRODDL_TYPE_MAP[tmpSymbol].HasSize && tmpCol.Size)
			{
				tmpLine += ' ' + tmpCol.Size;
			}

			tmpLines.push(tmpLine);
		}

		return tmpLines.join('\n');
	}

	microDDLToColumns(pDDL)
	{
		let tmpLines = pDDL.split('\n');
		let tmpColumns = [];

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i].trim();
			if (!tmpLine || tmpLine.startsWith('!') || tmpLine.startsWith('//') || tmpLine.startsWith('--') || tmpLine.startsWith('->'))
			{
				continue;
			}

			let tmpSymbol = tmpLine.charAt(0);
			if (MICRODDL_TYPE_MAP.hasOwnProperty(tmpSymbol))
			{
				let tmpRest = tmpLine.substring(1).trim();
				let tmpParts = tmpRest.split(/\s+/);
				tmpColumns.push(
				{
					Name: tmpParts[0] || '',
					DataType: MICRODDL_TYPE_MAP[tmpSymbol].DataType,
					Size: tmpParts[1] || ''
				});
			}
		}

		return tmpColumns;
	}

	compileDDL()
	{
		let tmpTextarea = document.getElementById('Facto-Proj-DDL-Textarea');
		if (!tmpTextarea) return;

		let tmpDDL = tmpTextarea.value.trim();
		if (!tmpDDL)
		{
			alert('Enter MicroDDL text first.');
			return;
		}

		this.pict.providers.Facto.compileMicroDDL(tmpDDL).then(
			(pResponse) =>
			{
				let tmpPreview = document.getElementById('Facto-Proj-Schema-Preview');
				if (tmpPreview)
				{
					tmpPreview.style.display = 'block';
					if (pResponse && pResponse.Schema)
					{
						tmpPreview.textContent = JSON.stringify(pResponse.Schema, null, 2);
					}
					else
					{
						tmpPreview.textContent = 'Error: ' + (pResponse && pResponse.Error ? pResponse.Error : 'Unknown error');
					}
				}

				// Update columns from compiled schema
				if (pResponse && pResponse.Schema && pResponse.Schema.Tables)
				{
					let tmpTableKeys = Object.keys(pResponse.Schema.Tables);
					if (tmpTableKeys.length > 0)
					{
						let tmpTable = pResponse.Schema.Tables[tmpTableKeys[0]];
						this._Columns = [];
						for (let j = 0; j < tmpTable.Columns.length; j++)
						{
							let tmpCol = tmpTable.Columns[j];
							this._Columns.push(
							{
								Name: tmpCol.Column,
								DataType: tmpCol.DataType || 'String',
								Size: tmpCol.Size || ''
							});
						}
					}
				}
			});
	}

	saveSchema()
	{
		if (!this._EditingIDDataset)
		{
			alert('No projection selected.');
			return;
		}

		// Marshal current state to DDL text
		if (this._EditorMode === 'visual')
		{
			this._marshalColumnsFromUI();
		}

		let tmpDDL;
		if (this._EditorMode === 'ddl')
		{
			let tmpTextarea = document.getElementById('Facto-Proj-DDL-Textarea');
			tmpDDL = tmpTextarea ? tmpTextarea.value : '';
		}
		else
		{
			tmpDDL = this.columnsToMicroDDL();
		}

		this.pict.providers.Facto.saveProjectionSchema(this._EditingIDDataset, tmpDDL).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					alert('Error saving schema: ' + pResponse.Error);
					return;
				}

				// Update the schema version in the projections list
				for (let i = 0; i < this._Projections.length; i++)
				{
					if (this._Projections[i].IDDataset === this._EditingIDDataset)
					{
						this._Projections[i].SchemaVersion = pResponse.SchemaVersion || 0;
						break;
					}
				}

				alert('Schema saved (v' + (pResponse.SchemaVersion || 0) + ')');
			});
	}

	// ================================================================
	// Deploy
	// ================================================================

	showDeployDialog()
	{
		let tmpDialog = document.getElementById('Facto-Proj-Deploy-Dialog');
		if (tmpDialog) tmpDialog.classList.add('active');

		// Populate connection dropdown
		let tmpSelect = document.getElementById('Facto-Proj-Deploy-Connection');
		if (tmpSelect)
		{
			let tmpHtml = '<option value="">Select a connection...</option>';
			for (let i = 0; i < this._Connections.length; i++)
			{
				tmpHtml += '<option value="' + this._Connections[i].IDStoreConnection + '">' + (this._Connections[i].Name || 'Untitled') + ' (' + this._Connections[i].Type + ')</option>';
			}
			tmpSelect.innerHTML = tmpHtml;
		}

		// Default table name
		let tmpTableInput = document.getElementById('Facto-Proj-Deploy-TableName');
		if (tmpTableInput)
		{
			tmpTableInput.value = (this._EditingName || 'Projection').replace(/[^a-zA-Z0-9_]/g, '_');
		}

		// Hide old log
		let tmpLog = document.getElementById('Facto-Proj-Deploy-Log');
		if (tmpLog) tmpLog.style.display = 'none';
	}

	hideDeployDialog()
	{
		let tmpDialog = document.getElementById('Facto-Proj-Deploy-Dialog');
		if (tmpDialog) tmpDialog.classList.remove('active');
	}

	deploySchema()
	{
		let tmpSelect = document.getElementById('Facto-Proj-Deploy-Connection');
		let tmpTableInput = document.getElementById('Facto-Proj-Deploy-TableName');
		let tmpLog = document.getElementById('Facto-Proj-Deploy-Log');

		let tmpIDConn = tmpSelect ? parseInt(tmpSelect.value, 10) : 0;
		let tmpTableName = tmpTableInput ? tmpTableInput.value.trim() : '';

		if (!tmpIDConn)
		{
			alert('Select a connection first.');
			return;
		}
		if (!tmpTableName)
		{
			alert('Enter a table name.');
			return;
		}

		if (tmpLog)
		{
			tmpLog.style.display = 'block';
			tmpLog.textContent = 'Deploying...';
		}

		// Save schema first, then deploy
		if (this._EditorMode === 'visual')
		{
			this._marshalColumnsFromUI();
		}

		let tmpDDL = this._EditorMode === 'ddl'
			? (document.getElementById('Facto-Proj-DDL-Textarea') || {}).value || ''
			: this.columnsToMicroDDL();

		this.pict.providers.Facto.saveProjectionSchema(this._EditingIDDataset, tmpDDL).then(
			() =>
			{
				this.pict.providers.Facto.deployProjection(this._EditingIDDataset, tmpIDConn, tmpTableName).then(
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
							}
							else
							{
								tmpLog.textContent = 'Deployment complete.';
							}
						}
					});
			});
	}

	// ================================================================
	// Connection Management
	// ================================================================

	toggleConnectionForm()
	{
		let tmpForm = document.getElementById('Facto-Proj-ConnForm');
		if (tmpForm)
		{
			tmpForm.classList.toggle('active');
		}
	}

	refreshConnectionList()
	{
		let tmpContainer = document.getElementById('Facto-Proj-ConnList');
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
			tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-Projections\'].testConnection(' + tmpConn.IDStoreConnection + ')">Test</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Projections\'].deleteConnection(' + tmpConn.IDStoreConnection + ')">Delete</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}

		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	addConnection()
	{
		let tmpName = (document.getElementById('Facto-Proj-Conn-Name') || {}).value || '';
		let tmpType = (document.getElementById('Facto-Proj-Conn-Type') || {}).value || 'MySQL';
		let tmpHost = (document.getElementById('Facto-Proj-Conn-Host') || {}).value || 'localhost';
		let tmpPort = parseInt((document.getElementById('Facto-Proj-Conn-Port') || {}).value) || 0;
		let tmpUser = (document.getElementById('Facto-Proj-Conn-User') || {}).value || '';
		let tmpPassword = (document.getElementById('Facto-Proj-Conn-Password') || {}).value || '';
		let tmpDatabase = (document.getElementById('Facto-Proj-Conn-Database') || {}).value || '';

		if (!tmpName)
		{
			alert('Connection name is required.');
			return;
		}

		let tmpConfig =
		{
			server: tmpHost,
			host: tmpHost,
			port: tmpPort,
			user: tmpUser,
			password: tmpPassword,
			database: tmpDatabase
		};

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
					alert('Error: ' + pResponse.Error);
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
						let tmpFields = ['Name', 'Host', 'Port', 'User', 'Password', 'Database'];
						for (let i = 0; i < tmpFields.length; i++)
						{
							let tmpEl = document.getElementById('Facto-Proj-Conn-' + tmpFields[i]);
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
							alert('Connection test succeeded!');
						}
						else
						{
							alert('Connection test failed: ' + (pResponse && pResponse.Error ? pResponse.Error : 'Unknown error'));
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

	// ================================================================
	// Mapping Editor
	// ================================================================

	editMappings(pIDDataset, pName)
	{
		this._EditingIDDataset = pIDDataset;
		this._EditingName = pName || '';

		let tmpListWrap = document.getElementById('Facto-Proj-List-Wrap');
		let tmpEditor = document.getElementById('Facto-Proj-Mapping-Editor');
		let tmpTitle = document.getElementById('Facto-Proj-Mapping-Title');

		if (tmpListWrap) tmpListWrap.style.display = 'none';
		if (tmpEditor) tmpEditor.classList.add('active');
		if (tmpTitle) tmpTitle.textContent = 'Mappings: ' + (pName || 'Untitled');

		// Show the mapping list, hide detail
		let tmpMappingListWrap = document.getElementById('Facto-Proj-Mapping-List-Wrap');
		let tmpMappingDetail = document.getElementById('Facto-Proj-Mapping-Detail');
		if (tmpMappingListWrap) tmpMappingListWrap.style.display = '';
		if (tmpMappingDetail) tmpMappingDetail.style.display = 'none';

		// Load mappings, sources, and stores in parallel
		Promise.all(
		[
			this.pict.providers.Facto.loadProjectionMappings(pIDDataset),
			this.pict.providers.Facto.loadSources(),
			this.pict.providers.Facto.loadProjectionStores(pIDDataset)
		]).then(
			(pResults) =>
			{
				this._CurrentMappings = (pResults[0] && pResults[0].Mappings) ? pResults[0].Mappings : [];
				this._MappingSources = (pResults[1] && pResults[1].Sources) ? pResults[1].Sources : [];
				this._MappingStores = (pResults[2] && pResults[2].Stores) ? pResults[2].Stores : [];

				this.refreshMappingList();
			});
	}

	closeMappingEditor()
	{
		let tmpListWrap = document.getElementById('Facto-Proj-List-Wrap');
		let tmpEditor = document.getElementById('Facto-Proj-Mapping-Editor');

		if (tmpListWrap) tmpListWrap.style.display = '';
		if (tmpEditor) tmpEditor.classList.remove('active');

		this._SelectedMappingID = 0;

		// Clean up flow view
		if (this._FlowView)
		{
			this._FlowView = null;
		}
	}

	refreshMappingList()
	{
		let tmpContainer = document.getElementById('Facto-Proj-Mapping-List');
		if (!tmpContainer) return;

		if (this._CurrentMappings.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-card" style="text-align:center; padding:1.5em; color:var(--facto-text-tertiary);">No mappings yet. Create one to map source fields to projection columns.</div>';
			return;
		}

		let tmpHtml = '<table class="facto-mapping-list-table"><thead><tr>';
		tmpHtml += '<th>ID</th><th>Name</th><th>Source</th><th>Active</th><th>Actions</th>';
		tmpHtml += '</tr></thead><tbody>';

		for (let i = 0; i < this._CurrentMappings.length; i++)
		{
			let tmpMap = this._CurrentMappings[i];
			let tmpSourceName = '\u2014';
			for (let j = 0; j < this._MappingSources.length; j++)
			{
				if (this._MappingSources[j].IDSource === tmpMap.IDSource)
				{
					tmpSourceName = this._MappingSources[j].Name || 'Source ' + tmpMap.IDSource;
					break;
				}
			}

			tmpHtml += '<tr>';
			tmpHtml += '<td>' + tmpMap.IDProjectionMapping + '</td>';
			tmpHtml += '<td><strong>' + (tmpMap.Name || '\u2014') + '</strong></td>';
			tmpHtml += '<td>' + tmpSourceName + '</td>';
			tmpHtml += '<td>' + (tmpMap.Active ? '\u2713' : '\u2717') + '</td>';
			tmpHtml += '<td>';
			tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-Projections\'].openMappingDetail(' + tmpMap.IDProjectionMapping + ')">Edit</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.views[\'Facto-Full-Projections\'].deleteMapping(' + tmpMap.IDProjectionMapping + ')">Delete</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}

		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	newMapping()
	{
		this._SelectedMappingID = 0;

		let tmpMappingListWrap = document.getElementById('Facto-Proj-Mapping-List-Wrap');
		let tmpMappingDetail = document.getElementById('Facto-Proj-Mapping-Detail');
		if (tmpMappingListWrap) tmpMappingListWrap.style.display = 'none';
		if (tmpMappingDetail) tmpMappingDetail.style.display = '';

		// Reset fields
		let tmpNameInput = document.getElementById('Facto-Proj-Mapping-Name');
		if (tmpNameInput) tmpNameInput.value = '';

		// Populate source dropdown
		this._populateSourceDropdown();
		this._populateStoreDropdown();

		// Clear JSON editor
		let tmpJSONTextarea = document.getElementById('Facto-Proj-Mapping-JSON');
		if (tmpJSONTextarea)
		{
			tmpJSONTextarea.value = JSON.stringify(
			{
				Entity: (this._EditingName || 'Record').replace(/[^a-zA-Z0-9_]/g, ''),
				GUIDTemplate: '{~D:Record.IDRecord~}',
				GUIDName: 'GUID',
				Mappings: {},
				Solvers: [],
				ManyfestAddresses: false
			}, null, '\t');
		}

		// Clear flow container
		let tmpFlowContainer = document.getElementById('Facto-Proj-Flow-Container');
		if (tmpFlowContainer) tmpFlowContainer.innerHTML = '';
		this._FlowView = null;

		// Hide import log
		let tmpImportLog = document.getElementById('Facto-Proj-Import-Log');
		if (tmpImportLog) tmpImportLog.style.display = 'none';

		// Switch to flow mode
		this.switchMapMode('flow');
	}

	openMappingDetail(pIDProjectionMapping)
	{
		this._SelectedMappingID = pIDProjectionMapping;

		this.pict.providers.Facto.loadProjectionMapping(pIDProjectionMapping).then(
			(pResponse) =>
			{
				if (!pResponse || !pResponse.Mapping)
				{
					alert('Mapping not found');
					return;
				}

				let tmpMapping = pResponse.Mapping;

				let tmpMappingListWrap = document.getElementById('Facto-Proj-Mapping-List-Wrap');
				let tmpMappingDetail = document.getElementById('Facto-Proj-Mapping-Detail');
				if (tmpMappingListWrap) tmpMappingListWrap.style.display = 'none';
				if (tmpMappingDetail) tmpMappingDetail.style.display = '';

				// Set name
				let tmpNameInput = document.getElementById('Facto-Proj-Mapping-Name');
				if (tmpNameInput) tmpNameInput.value = tmpMapping.Name || '';

				// Populate dropdowns
				this._populateSourceDropdown(tmpMapping.IDSource);
				this._populateStoreDropdown(tmpMapping.IDProjectionStore);

				// Parse mapping config
				let tmpConfig = {};
				try { tmpConfig = JSON.parse(tmpMapping.MappingConfiguration || '{}'); }
				catch (e) { /* ignore */ }

				// Set JSON editor
				let tmpJSONTextarea = document.getElementById('Facto-Proj-Mapping-JSON');
				if (tmpJSONTextarea)
				{
					tmpJSONTextarea.value = JSON.stringify(tmpConfig, null, '\t');
				}

				// Clear flow container (will be populated when switching to flow mode or on discover)
				let tmpFlowContainer = document.getElementById('Facto-Proj-Flow-Container');
				if (tmpFlowContainer) tmpFlowContainer.innerHTML = '';
				this._FlowView = null;

				// Hide import log
				let tmpImportLog = document.getElementById('Facto-Proj-Import-Log');
				if (tmpImportLog) tmpImportLog.style.display = 'none';

				// Switch to flow mode
				this.switchMapMode('flow');
			});
	}

	deleteMapping(pIDProjectionMapping)
	{
		if (!confirm('Delete this mapping?')) return;

		this.pict.providers.Facto.deleteProjectionMapping(pIDProjectionMapping).then(
			() =>
			{
				this.pict.providers.Facto.loadProjectionMappings(this._EditingIDDataset).then(
					(pResult) =>
					{
						this._CurrentMappings = (pResult && pResult.Mappings) ? pResult.Mappings : [];
						this.refreshMappingList();
					});
			});
	}

	switchMapMode(pMode)
	{
		this._MapEditorMode = pMode;

		let tmpFlowWrap = document.getElementById('Facto-Proj-Flow-Wrap');
		let tmpJSONWrap = document.getElementById('Facto-Proj-JSON-Wrap');
		let tmpFlowTab = document.getElementById('Facto-Proj-MapMode-Flow');
		let tmpJSONTab = document.getElementById('Facto-Proj-MapMode-JSON');

		if (pMode === 'flow')
		{
			if (tmpFlowWrap) tmpFlowWrap.style.display = '';
			if (tmpJSONWrap) tmpJSONWrap.style.display = 'none';
			if (tmpFlowTab) tmpFlowTab.classList.add('active');
			if (tmpJSONTab) tmpJSONTab.classList.remove('active');
		}
		else
		{
			if (tmpFlowWrap) tmpFlowWrap.style.display = 'none';
			if (tmpJSONWrap) tmpJSONWrap.style.display = '';
			if (tmpFlowTab) tmpFlowTab.classList.remove('active');
			if (tmpJSONTab) tmpJSONTab.classList.add('active');

			// If there's a flow view, serialize flow → JSON
			if (this._FlowView && typeof this._FlowView.getFlowData === 'function')
			{
				let tmpConfig = this.flowToMappingConfig();
				let tmpJSONTextarea = document.getElementById('Facto-Proj-Mapping-JSON');
				if (tmpJSONTextarea)
				{
					tmpJSONTextarea.value = JSON.stringify(tmpConfig, null, '\t');
				}
			}
		}
	}

	_populateSourceDropdown(pSelectedIDSource)
	{
		let tmpSelect = document.getElementById('Facto-Proj-Mapping-Source');
		if (!tmpSelect) return;

		let tmpHtml = '<option value="0">Select a source...</option>';
		for (let i = 0; i < this._MappingSources.length; i++)
		{
			let tmpSrc = this._MappingSources[i];
			let tmpSelected = (tmpSrc.IDSource === pSelectedIDSource) ? ' selected' : '';
			tmpHtml += '<option value="' + tmpSrc.IDSource + '"' + tmpSelected + '>' + (tmpSrc.Name || 'Source ' + tmpSrc.IDSource) + '</option>';
		}
		tmpSelect.innerHTML = tmpHtml;
	}

	_populateStoreDropdown(pSelectedIDProjectionStore)
	{
		let tmpSelect = document.getElementById('Facto-Proj-Import-Store');
		if (!tmpSelect) return;

		let tmpHtml = '<option value="0">Select a store...</option>';
		for (let i = 0; i < this._MappingStores.length; i++)
		{
			let tmpStore = this._MappingStores[i];
			let tmpSelected = (tmpStore.IDProjectionStore === pSelectedIDProjectionStore) ? ' selected' : '';
			tmpHtml += '<option value="' + tmpStore.IDProjectionStore + '"' + tmpSelected + '>' + (tmpStore.TargetTableName || 'Store ' + tmpStore.IDProjectionStore) + ' (' + tmpStore.Status + ')</option>';
		}
		tmpSelect.innerHTML = tmpHtml;
	}

	discoverSourceFields()
	{
		let tmpSourceSelect = document.getElementById('Facto-Proj-Mapping-Source');
		let tmpIDSource = tmpSourceSelect ? parseInt(tmpSourceSelect.value, 10) : 0;

		if (!tmpIDSource)
		{
			alert('Select a source first.');
			return;
		}

		this.pict.providers.Facto.discoverFields(this._EditingIDDataset, tmpIDSource, 50).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					alert('Error: ' + pResponse.Error);
					return;
				}

				let tmpHeaders = (pResponse && pResponse.Headers) ? pResponse.Headers : [];
				this._DiscoveredFields[tmpIDSource] = tmpHeaders;

				alert('Discovered ' + tmpHeaders.length + ' fields from ' + (pResponse.SampleSize || 0) + ' records:\n\n' + tmpHeaders.join(', '));

				// Rebuild the flow if it exists
				this._rebuildFlowNodes();
			});
	}

	_rebuildFlowNodes()
	{
		// Get current source and schema columns
		let tmpSourceSelect = document.getElementById('Facto-Proj-Mapping-Source');
		let tmpIDSource = tmpSourceSelect ? parseInt(tmpSourceSelect.value, 10) : 0;
		let tmpFields = this._DiscoveredFields[tmpIDSource] || [];

		// Get schema columns from the projection
		let tmpSchemaColumns = this._getSchemaColumnsForProjection();

		// Initialize the flow view if needed
		this.initFlowView();

		if (!this._FlowView) return;

		// Build source node output ports from discovered fields
		let tmpSourcePorts = [{ Name: 'IDRecord', Side: 'right' }];
		for (let i = 0; i < tmpFields.length; i++)
		{
			tmpSourcePorts.push({ Name: tmpFields[i], Side: 'right' });
		}

		// Build target node input ports from schema columns
		let tmpTargetPorts = [];
		for (let i = 0; i < tmpSchemaColumns.length; i++)
		{
			tmpTargetPorts.push({ Name: tmpSchemaColumns[i], Side: 'left' });
		}

		// Clear and rebuild the flow
		let tmpFlowContainer = document.getElementById('Facto-Proj-Flow-Container');
		if (tmpFlowContainer) tmpFlowContainer.innerHTML = '';

		// Re-initialize
		this._FlowView = null;
		this.initFlowView();

		if (this._FlowView)
		{
			// Add source node on the left
			let tmpSourceNode = this._FlowView.addNode('SRC', 50, 50, 'Source: ' + (tmpSourceSelect ? tmpSourceSelect.options[tmpSourceSelect.selectedIndex].text : 'Source'));
			if (tmpSourceNode)
			{
				tmpSourceNode.Ports = [];
				for (let i = 0; i < tmpSourcePorts.length; i++)
				{
					tmpSourceNode.Ports.push(
					{
						Hash: 'src-port-' + i,
						Direction: 'output',
						Side: 'right',
						Label: tmpSourcePorts[i].Name
					});
				}
			}

			// Add target node on the right
			let tmpTargetNode = this._FlowView.addNode('TGT', 500, 50, 'Target: ' + (this._EditingName || 'Projection'));
			if (tmpTargetNode)
			{
				tmpTargetNode.Ports = [];
				for (let i = 0; i < tmpTargetPorts.length; i++)
				{
					tmpTargetNode.Ports.push(
					{
						Hash: 'tgt-port-' + i,
						Direction: 'input',
						Side: 'left',
						Label: tmpTargetPorts[i].Name
					});
				}
			}

			if (typeof this._FlowView.renderFlow === 'function')
			{
				this._FlowView.renderFlow();
			}
			else if (typeof this._FlowView.render === 'function')
			{
				this._FlowView.render();
			}
		}
	}

	_getSchemaColumnsForProjection()
	{
		// Find the projection dataset to get its schema
		let tmpColumns = [];
		for (let i = 0; i < this._Projections.length; i++)
		{
			if (this._Projections[i].IDDataset === this._EditingIDDataset)
			{
				let tmpDDL = this._Projections[i].SchemaDefinition || '';
				if (tmpDDL)
				{
					let tmpParsedColumns = this.microDDLToColumns(tmpDDL);
					for (let j = 0; j < tmpParsedColumns.length; j++)
					{
						tmpColumns.push(tmpParsedColumns[j].Name);
					}
				}
				break;
			}
		}
		return tmpColumns;
	}

	initFlowView()
	{
		if (this._FlowView) return;

		let tmpFlowContainer = document.getElementById('Facto-Proj-Flow-Container');
		if (!tmpFlowContainer) return;

		try
		{
			let libPictSectionFlow = require('pict-section-flow');

			this._FlowView = this.pict.addView('Facto-Mapping-Flow',
			{
				ViewIdentifier: 'Facto-Mapping-Flow',
				DefaultDestinationAddress: '#Facto-Proj-Flow-Container',
				EnableToolbar: true,
				EnablePanning: true,
				EnableZooming: true,
				EnableNodeDragging: true,
				EnableConnectionCreation: true
			}, libPictSectionFlow);

			// Register card types
			let libFlowCardSource = require('./flow-cards/FlowCard-SourceDataset.js');
			let libFlowCardTarget = require('./flow-cards/FlowCard-ProjectionTarget.js');

			let tmpSourceCard = this.pict.newServiceProvider('FlowCardSourceDataset', {}, libFlowCardSource);
			let tmpTargetCard = this.pict.newServiceProvider('FlowCardProjectionTarget', {}, libFlowCardTarget);

			tmpSourceCard.registerWithFlowView(this._FlowView);
			tmpTargetCard.registerWithFlowView(this._FlowView);

			if (typeof this._FlowView.render === 'function')
			{
				this._FlowView.render();
			}
		}
		catch (pFlowError)
		{
			this.log.error('Failed to initialize flow view: ' + pFlowError.message);
			tmpFlowContainer.innerHTML = '<div style="padding:2em; text-align:center; color:var(--facto-text-tertiary);">Flow editor could not be loaded. Use JSON Config mode instead.</div>';
		}
	}

	flowToMappingConfig()
	{
		let tmpConfig =
		{
			Entity: (this._EditingName || 'Record').replace(/[^a-zA-Z0-9_]/g, ''),
			GUIDTemplate: '{~D:Record.IDRecord~}',
			GUIDName: 'GUID',
			Mappings: {},
			Solvers: [],
			ManyfestAddresses: false
		};

		if (!this._FlowView || typeof this._FlowView.getFlowData !== 'function')
		{
			return tmpConfig;
		}

		let tmpFlowData = this._FlowView.getFlowData();
		if (!tmpFlowData || !tmpFlowData.Connections) return tmpConfig;

		// Build a port hash→label map from nodes
		let tmpPortMap = {};
		if (tmpFlowData.Nodes)
		{
			for (let i = 0; i < tmpFlowData.Nodes.length; i++)
			{
				let tmpNode = tmpFlowData.Nodes[i];
				if (tmpNode.Ports)
				{
					for (let j = 0; j < tmpNode.Ports.length; j++)
					{
						tmpPortMap[tmpNode.Ports[j].Hash] = tmpNode.Ports[j].Label;
					}
				}
			}
		}

		// Each connection: source output port label → source field, target input port label → target column
		for (let i = 0; i < tmpFlowData.Connections.length; i++)
		{
			let tmpConn = tmpFlowData.Connections[i];
			let tmpSourceField = tmpPortMap[tmpConn.SourcePortHash] || tmpConn.SourcePortHash || '';
			let tmpTargetColumn = tmpPortMap[tmpConn.TargetPortHash] || tmpConn.TargetPortHash || '';

			if (tmpTargetColumn && tmpSourceField)
			{
				// Check if the connection has custom template data
				let tmpTemplate = (tmpConn.Data && tmpConn.Data.Template)
					? tmpConn.Data.Template
					: '{~D:Record.' + tmpSourceField + '~}';

				tmpConfig.Mappings[tmpTargetColumn] = tmpTemplate;
			}
		}

		return tmpConfig;
	}

	saveMapping()
	{
		let tmpNameInput = document.getElementById('Facto-Proj-Mapping-Name');
		let tmpSourceSelect = document.getElementById('Facto-Proj-Mapping-Source');
		let tmpStoreSelect = document.getElementById('Facto-Proj-Import-Store');

		let tmpName = tmpNameInput ? tmpNameInput.value.trim() : '';
		let tmpIDSource = tmpSourceSelect ? parseInt(tmpSourceSelect.value, 10) : 0;
		let tmpIDProjectionStore = tmpStoreSelect ? parseInt(tmpStoreSelect.value, 10) : 0;

		if (!tmpName)
		{
			alert('Enter a mapping name.');
			return;
		}

		// Get mapping config
		let tmpMappingConfig;
		if (this._MapEditorMode === 'json')
		{
			let tmpJSONTextarea = document.getElementById('Facto-Proj-Mapping-JSON');
			let tmpJSON = tmpJSONTextarea ? tmpJSONTextarea.value : '{}';
			try
			{
				tmpMappingConfig = JSON.parse(tmpJSON);
			}
			catch (e)
			{
				alert('Invalid JSON: ' + e.message);
				return;
			}
		}
		else
		{
			tmpMappingConfig = this.flowToMappingConfig();
		}

		// Get flow diagram state
		let tmpFlowState = {};
		if (this._FlowView && typeof this._FlowView.getFlowData === 'function')
		{
			tmpFlowState = this._FlowView.getFlowData();
		}

		let tmpData =
		{
			Name: tmpName,
			IDSource: tmpIDSource,
			IDProjectionStore: tmpIDProjectionStore,
			MappingConfiguration: JSON.stringify(tmpMappingConfig),
			FlowDiagramState: JSON.stringify(tmpFlowState),
			Active: 1
		};

		let tmpPromise;
		if (this._SelectedMappingID)
		{
			tmpPromise = this.pict.providers.Facto.updateProjectionMapping(this._SelectedMappingID, tmpData);
		}
		else
		{
			tmpPromise = this.pict.providers.Facto.createProjectionMapping(this._EditingIDDataset, tmpData);
		}

		tmpPromise.then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					alert('Error: ' + pResponse.Error);
					return;
				}

				// Update the selected mapping ID if it was a create
				if (pResponse && pResponse.Mapping && pResponse.Mapping.IDProjectionMapping)
				{
					this._SelectedMappingID = pResponse.Mapping.IDProjectionMapping;
				}

				alert('Mapping saved.');

				// Refresh mapping list
				this.pict.providers.Facto.loadProjectionMappings(this._EditingIDDataset).then(
					(pResult) =>
					{
						this._CurrentMappings = (pResult && pResult.Mappings) ? pResult.Mappings : [];
					});
			});
	}

	executeImport()
	{
		let tmpStoreSelect = document.getElementById('Facto-Proj-Import-Store');
		let tmpBatchInput = document.getElementById('Facto-Proj-Import-Batch');
		let tmpImportLog = document.getElementById('Facto-Proj-Import-Log');

		let tmpIDProjectionStore = tmpStoreSelect ? parseInt(tmpStoreSelect.value, 10) : 0;
		let tmpBatchSize = tmpBatchInput ? parseInt(tmpBatchInput.value, 10) : 100;

		if (!this._SelectedMappingID)
		{
			alert('Save the mapping first before running an import.');
			return;
		}
		if (!tmpIDProjectionStore)
		{
			alert('Select a target store.');
			return;
		}

		if (tmpImportLog)
		{
			tmpImportLog.style.display = 'block';
			tmpImportLog.textContent = 'Running import...';
		}

		this.pict.providers.Facto.executeImport(
			this._EditingIDDataset,
			this._SelectedMappingID,
			tmpIDProjectionStore,
			tmpBatchSize
		).then(
			(pResponse) =>
			{
				if (tmpImportLog)
				{
					if (pResponse && pResponse.Log)
					{
						tmpImportLog.textContent = pResponse.Log;
					}
					else if (pResponse && pResponse.Error)
					{
						tmpImportLog.textContent = 'ERROR: ' + pResponse.Error;
					}
					else
					{
						tmpImportLog.textContent = 'Import complete: ' + JSON.stringify(pResponse, null, 2);
					}
				}
			});
	}

	// ================================================================
	// Query (preserved from original view)
	// ================================================================

	runQuery()
	{
		let tmpDatasetID = parseInt((document.getElementById('Facto-Full-Proj-DatasetID') || {}).value) || 0;
		let tmpType = (document.getElementById('Facto-Full-Proj-Type') || {}).value || '';

		let tmpParams = {};
		if (tmpDatasetID) tmpParams.IDDataset = tmpDatasetID;
		if (tmpType) tmpParams.Type = tmpType;

		this.pict.providers.Facto.queryRecords(tmpParams).then(
			(pResponse) =>
			{
				this._showResults('Query Results', pResponse);
			});
	}

	runAggregate()
	{
		let tmpDatasetID = parseInt((document.getElementById('Facto-Full-Proj-DatasetID') || {}).value) || 0;

		let tmpParams = {};
		if (tmpDatasetID) tmpParams.IDDataset = tmpDatasetID;

		this.pict.providers.Facto.aggregateRecords(tmpParams).then(
			(pResponse) =>
			{
				this._showResults('Aggregate Results', pResponse);
			});
	}

	_showResults(pTitle, pData)
	{
		let tmpContainer = document.getElementById('Facto-Full-Projections-Results');
		if (!tmpContainer) return;
		tmpContainer.style.display = 'block';

		let tmpRecordCount = (pData && pData.Records) ? pData.Records.length : (pData && pData.Aggregations) ? pData.Aggregations.length : 0;
		let tmpHtml = '<h3>' + pTitle + ' (' + tmpRecordCount + ')</h3>';
		tmpHtml += '<pre>' + JSON.stringify(pData, null, 2) + '</pre>';
		tmpHtml += '<button class="facto-btn facto-btn-secondary" style="margin-top:0.5em;" onclick="document.getElementById(\'Facto-Full-Projections-Results\').style.display=\'none\'">Close</button>';
		tmpContainer.innerHTML = tmpHtml;
	}
}

module.exports = FactoFullProjectionsView;

module.exports.default_configuration = _ViewConfiguration;
