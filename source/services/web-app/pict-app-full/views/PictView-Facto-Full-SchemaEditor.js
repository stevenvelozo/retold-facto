const libPictView = require('pict-view');

const libProjectionConstants = require('./projections/Facto-Projections-Constants.js');

const MICRODDL_TYPE_MAP = libProjectionConstants.MICRODDL_TYPE_MAP;
const DATATYPE_TO_SYMBOL = libProjectionConstants.DATATYPE_TO_SYMBOL;

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-SchemaEditor",

	DefaultRenderable: "Facto-Full-SchemaEditor-Content",
	DefaultDestinationAddress: "#Facto-Proj-Schema-Editor-Container",

	AutoRender: false,

	CSS: /*css*/`
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

	`,

	Templates:
	[
		{
			Hash: "Facto-Full-SchemaEditor-Template",
			Template: /*html*/`
<div>
	<div id="Facto-Proj-Schema-Editor" class="facto-schema-editor">
		<div class="facto-schema-header">
			<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-ProjectionDetail'].closeSchemaEditor()">&larr; Back</button>
			<h3 id="Facto-Proj-Schema-Title">Schema Editor</h3>
			<div class="facto-schema-mode-tabs">
				<button class="facto-schema-mode-tab active" id="Facto-Proj-ModeTab-Visual" onclick="{~P~}.views['Facto-Full-SchemaEditor'].switchEditorMode('visual')">Visual Builder</button>
				<button class="facto-schema-mode-tab" id="Facto-Proj-ModeTab-DDL" onclick="{~P~}.views['Facto-Full-SchemaEditor'].switchEditorMode('ddl')">MicroDDL</button>
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
			<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-SchemaEditor'].addColumn()">+ Add Column</button>
			<div class="facto-section-title" style="margin-top:1em; font-size:0.72em;">Generated MicroDDL</div>
			<div class="facto-schema-preview" id="Facto-Proj-DDL-Preview"></div>
		</div>

		<!-- DDL Editor -->
		<div id="Facto-Proj-DDL-Wrap" style="display:none;">
			<textarea class="facto-ddl-editor" id="Facto-Proj-DDL-Textarea" placeholder="!MyTable&#10;@IDMyTable&#10;$Name 200&#10;#Count&#10;&CreatedDate"></textarea>
			<div style="margin-top:0.5em;">
				<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-SchemaEditor'].compileDDL()">Compile &amp; Preview</button>
			</div>
			<div class="facto-schema-preview" id="Facto-Proj-Schema-Preview" style="display:none;"></div>
		</div>

		<div style="margin-top:1em;">
			<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-SchemaEditor'].saveSchema()">Save Schema</button>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-SchemaEditor-Content",
			TemplateHash: "Facto-Full-SchemaEditor-Template",
			DestinationAddress: "#Facto-Proj-Schema-Editor-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullSchemaEditorView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._EditingIDDataset = 0;
		this._EditingName = '';
		this._Columns = [];
		this._EditorMode = 'visual';
	}

	editSchema(pIDDataset, pName)
	{
		this._EditingIDDataset = pIDDataset;
		this._EditingName = pName || '';

		// Render the sub-view so its DOM exists
		this.render();

		let tmpEditor = document.getElementById('Facto-Proj-Schema-Editor');
		let tmpTitle = document.getElementById('Facto-Proj-Schema-Title');

		if (tmpEditor) tmpEditor.classList.add('active');
		if (tmpTitle) tmpTitle.textContent = 'Schema: ' + (pName || 'Untitled');

		// Load existing schema
		this.pict.providers.Facto.loadProjectionSchema(pIDDataset).then(
			(pResponse) =>
			{
				let tmpDDL = (pResponse && pResponse.SchemaDefinition) ? pResponse.SchemaDefinition : '';
				let tmpCleanName = (pName || 'Record').replace(/[^a-zA-Z0-9]/g, '');
				let tmpIDColName = 'ID' + tmpCleanName;
				let tmpGUIDColName = 'GUID' + tmpCleanName;

				if (tmpDDL)
				{
					this._Columns = libProjectionConstants.microDDLToColumns(tmpDDL);
				}
				else
				{
					// Start with default ID and GUID columns for the entity
					this._Columns =
					[
						{ Name: tmpIDColName, DataType: 'AutoIdentity', Size: '' },
						{ Name: tmpGUIDColName, DataType: 'GUID', Size: '' }
					];
				}

				// Ensure the entity ID and GUID columns always exist
				let tmpHasID = this._Columns.some((c) => { return c.Name === tmpIDColName; });
				let tmpHasGUID = this._Columns.some((c) => { return c.Name === tmpGUIDColName; });

				if (!tmpHasID)
				{
					this._Columns.unshift({ Name: tmpIDColName, DataType: 'AutoIdentity', Size: '' });
				}
				if (!tmpHasGUID)
				{
					// Insert GUID right after the ID column
					let tmpIDIndex = this._Columns.findIndex((c) => { return c.Name === tmpIDColName; });
					this._Columns.splice(tmpIDIndex + 1, 0, { Name: tmpGUIDColName, DataType: 'GUID', Size: '' });
				}

				this.refreshColumnBuilder();
				this.updateDDLPreview();

				// Also set the DDL textarea
				let tmpTextarea = document.getElementById('Facto-Proj-DDL-Textarea');
				if (tmpTextarea)
				{
					tmpTextarea.value = tmpDDL || libProjectionConstants.columnsToMicroDDL(this._Columns, this._EditingName);
				}
			});
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
				this._Columns = libProjectionConstants.microDDLToColumns(tmpTextarea.value);
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
				tmpTextarea.value = libProjectionConstants.columnsToMicroDDL(this._Columns, this._EditingName);
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
			tmpHtml += '<td><select data-col-index="' + i + '" data-col-field="DataType" onchange="pict.views[\'Facto-Full-SchemaEditor\']._onColumnTypeChange(' + i + ', this.value)">';

			for (let tmpSym in MICRODDL_TYPE_MAP)
			{
				let tmpType = MICRODDL_TYPE_MAP[tmpSym];
				let tmpSelected = (tmpType.DataType === tmpCol.DataType) ? ' selected' : '';
				tmpHtml += '<option value="' + tmpType.DataType + '"' + tmpSelected + '>' + tmpType.Label + '</option>';
			}

			tmpHtml += '</select></td>';
			tmpHtml += '<td><input type="text" class="facto-col-size" value="' + (tmpCol.Size || '').replace(/"/g, '&quot;') + '" data-col-index="' + i + '" data-col-field="Size"' + (tmpSizeDisabled ? ' disabled' : '') + '></td>';
			tmpHtml += '<td><button class="facto-col-remove-btn" onclick="pict.views[\'Facto-Full-SchemaEditor\'].removeColumn(' + i + ')" title="Remove column">&times;</button></td>';
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
			tmpPreview.textContent = libProjectionConstants.columnsToMicroDDL(this._Columns, this._EditingName);
		}
	}

	compileDDL()
	{
		let tmpTextarea = document.getElementById('Facto-Proj-DDL-Textarea');
		if (!tmpTextarea) return;

		let tmpDDL = tmpTextarea.value.trim();
		if (!tmpDDL)
		{
			this.pict.views['Pict-Section-Modal'].toast('Enter MicroDDL text first.', {type: 'warning'});
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
			this.pict.views['Pict-Section-Modal'].toast('No projection selected.', {type: 'warning'});
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
			tmpDDL = libProjectionConstants.columnsToMicroDDL(this._Columns, this._EditingName);
		}

		this.pict.providers.Facto.saveProjectionSchema(this._EditingIDDataset, tmpDDL).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.views['Pict-Section-Modal'].toast('Error saving schema: ' + pResponse.Error, {type: 'error'});
					return;
				}

				this.pict.views['Pict-Section-Modal'].toast('Schema saved (v' + (pResponse.SchemaVersion || 0) + ')', {type: 'success'});

				// Notify the detail view about the schema update
				let tmpDetailView = this.pict.views['Facto-Full-ProjectionDetail'];
				if (tmpDetailView && typeof tmpDetailView.onSchemaUpdated === 'function')
				{
					tmpDetailView.onSchemaUpdated(pResponse.SchemaVersion);
				}
			});
	}

}

module.exports = FactoFullSchemaEditorView;

module.exports.default_configuration = _ViewConfiguration;
