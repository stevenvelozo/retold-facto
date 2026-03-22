const libPictView = require('pict-view');

const libProjectionConstants = require('./projections/Facto-Projections-Constants.js');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-MappingEditor",

	DefaultRenderable: "Facto-Full-MappingEditor-Content",
	DefaultDestinationAddress: "#Facto-Proj-Mapping-Editor-Container",

	AutoRender: false,

	CSS: /*css*/`
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
		.facto-mapping-store-checklist {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5em;
			margin-top: 0.25em;
		}
		.facto-mapping-store-checklist label {
			display: flex;
			align-items: center;
			gap: 0.35em;
			font-size: 0.82em;
			cursor: pointer;
			padding: 0.3em 0.5em;
			border: 1px solid var(--facto-border-subtle, #e8ddc8);
			border-radius: 4px;
			background: var(--facto-bg-input, #fcf8f0);
		}
		.facto-mapping-store-checklist label:has(input:checked) {
			border-color: var(--facto-brand, #18a5a0);
			background: var(--facto-brand-a12, rgba(24,165,160,0.12));
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-MappingEditor-Template",
			Template: /*html*/`
<div>
	<div id="Facto-Proj-Mapping-Editor" class="facto-mapping-editor">
		<div class="facto-mapping-header">
			<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-MappingEditor'].closeMappingEditor()">&larr; Back</button>
			<h3 id="Facto-Proj-Mapping-Title">Mapping Editor</h3>
			<div class="facto-schema-mode-tabs">
				<button class="facto-schema-mode-tab active" id="Facto-Proj-MapMode-Flow" onclick="{~P~}.views['Facto-Full-MappingEditor'].switchMapMode('flow')">Visual Mapper</button>
				<button class="facto-schema-mode-tab" id="Facto-Proj-MapMode-JSON" onclick="{~P~}.views['Facto-Full-MappingEditor'].switchMapMode('json')">JSON Config</button>
			</div>
		</div>

		<div id="Facto-Proj-Mapping-List-Wrap">
			<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75em;">
				<div class="facto-section-title" style="margin:0;">Existing Mappings</div>
				<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-MappingEditor'].newMapping()">+ New Mapping</button>
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
				<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-MappingEditor'].discoverSourceFields()">Discover Fields</button>
			</div>

			<div id="Facto-Proj-Flow-Wrap">
				<div id="Facto-Proj-Flow-Container" class="facto-flow-container"></div>
			</div>

			<div id="Facto-Proj-JSON-Wrap" style="display:none;">
				<textarea class="facto-mapping-json-editor" id="Facto-Proj-Mapping-JSON" placeholder='{"Entity":"MyTable","GUIDTemplate":"{~D:Record.IDRecord~}","Mappings":{},"Solvers":[],"ManyfestAddresses":false}'></textarea>
			</div>

			<div style="margin-top:0.75em;">
				<div style="font-size:0.72em; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:var(--facto-text-tertiary); margin-bottom:0.35em;">Target Stores</div>
				<div id="Facto-Proj-Mapping-Stores" class="facto-mapping-store-checklist"></div>
			</div>

			<div style="margin-top:0.75em; display:flex; gap:0.5em; flex-wrap:wrap; align-items:center;">
				<button class="facto-btn facto-btn-primary" onclick="{~P~}.views['Facto-Full-MappingEditor'].saveMapping()">Save Mapping</button>
			</div>
		</div>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-MappingEditor-Content",
			TemplateHash: "Facto-Full-MappingEditor-Template",
			DestinationAddress: "#Facto-Proj-Mapping-Editor-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullMappingEditorView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._EditingIDDataset = 0;
		this._EditingName = '';
		this._CurrentMappings = [];
		this._SelectedMappingID = 0;
		this._DiscoveredFields = {};
		this._FlowView = null;
		this._MapEditorMode = 'flow';
		this._MappingSources = [];
		this._MappingStores = [];
		this._CurrentProjectionSchema = null;
	}

	editMappings(pIDDataset, pName)
	{
		this._EditingIDDataset = pIDDataset;
		this._EditingName = pName || '';

		// Render the sub-view so its DOM exists
		this.render();

		let tmpEditor = document.getElementById('Facto-Proj-Mapping-Editor');
		let tmpTitle = document.getElementById('Facto-Proj-Mapping-Title');

		if (tmpEditor) tmpEditor.classList.add('active');
		if (tmpTitle) tmpTitle.textContent = 'Mappings: ' + (pName || 'Untitled');

		// Show the mapping list, hide detail
		let tmpMappingListWrap = document.getElementById('Facto-Proj-Mapping-List-Wrap');
		let tmpMappingDetail = document.getElementById('Facto-Proj-Mapping-Detail');
		if (tmpMappingListWrap) tmpMappingListWrap.style.display = '';
		if (tmpMappingDetail) tmpMappingDetail.style.display = 'none';

		// Load mappings, sources, stores, and fresh schema in parallel
		Promise.all(
		[
			this.pict.providers.Facto.loadProjectionMappings(pIDDataset),
			this.pict.providers.Facto.loadSources(),
			this.pict.providers.Facto.loadProjectionStores(pIDDataset),
			this.pict.providers.Facto.loadProjectionSchema(pIDDataset)
		]).then(
			(pResults) =>
			{
				this._CurrentMappings = (pResults[0] && pResults[0].Mappings) ? pResults[0].Mappings : [];
				this._MappingSources = Array.isArray(pResults[1]) ? pResults[1] : [];
				this._MappingStores = (pResults[2] && pResults[2].Stores) ? pResults[2].Stores : [];

				// Store the fresh schema locally for use by flow nodes
				let tmpSchema = pResults[3];
				if (tmpSchema && tmpSchema.SchemaDefinition)
				{
					this._CurrentProjectionSchema = tmpSchema.SchemaDefinition;
				}

				this.refreshMappingList();
			});
	}

	closeMappingEditor()
	{
		// Clean up flow view
		if (this._FlowView)
		{
			this._FlowView = null;
		}

		this._SelectedMappingID = 0;

		this.pict.views['Facto-Full-ProjectionDetail'].closeMappingEditor();
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
			tmpHtml += '<button class="facto-btn facto-btn-primary facto-btn-small" onclick="pict.views[\'Facto-Full-MappingEditor\'].openMappingDetail(' + tmpMap.IDProjectionMapping + ')">Edit</button> ';
			tmpHtml += '<button class="facto-btn facto-btn-danger facto-btn-small" onclick="pict.views[\'Facto-Full-MappingEditor\'].deleteMapping(' + tmpMap.IDProjectionMapping + ')">Delete</button>';
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
		this._populateStoreChecklist();

		// Clear JSON editor
		let tmpJSONTextarea = document.getElementById('Facto-Proj-Mapping-JSON');
		if (tmpJSONTextarea)
		{
			let tmpNewEntityName = (this._EditingName || 'Record').replace(/[^a-zA-Z0-9_]/g, '');
			let tmpNewGUIDCol = 'GUID' + tmpNewEntityName;
			let tmpNewIDCol = 'ID' + tmpNewEntityName;
			let tmpNewMappings = {};
			tmpNewMappings[tmpNewGUIDCol] = '{~D:Record.IDRecord~}';
			tmpNewMappings[tmpNewIDCol] = '{~D:Record.IDRecord~}';

			tmpJSONTextarea.value = JSON.stringify(
			{
				Entity: tmpNewEntityName,
				GUIDTemplate: '{~D:Record.IDRecord~}',
				GUIDName: tmpNewGUIDCol,
				Mappings: tmpNewMappings,
				Solvers: [],
				ManyfestAddresses: false
			}, null, '\t');
		}

		// Clear flow container
		let tmpFlowContainer = document.getElementById('Facto-Proj-Flow-Container');
		if (tmpFlowContainer) tmpFlowContainer.innerHTML = '';
		this._FlowView = null;

		// Switch to flow mode and initialize the flow editor
		this.switchMapMode('flow');
		this.initFlowView();

		// Fetch fresh schema then build TGT node ports from schema columns
		this.pict.providers.Facto.loadProjectionSchema(this._EditingIDDataset).then(
			(pSchema) =>
			{
				if (pSchema && pSchema.SchemaDefinition)
				{
					this._CurrentProjectionSchema = pSchema.SchemaDefinition;
				}
				this._rebuildFlowNodes();
			});
	}

	openMappingDetail(pIDProjectionMapping)
	{
		this._SelectedMappingID = pIDProjectionMapping;

		this.pict.providers.Facto.loadProjectionMapping(pIDProjectionMapping).then(
			(pResponse) =>
			{
				if (!pResponse || !pResponse.Mapping)
				{
					this.pict.views['Pict-Section-Modal'].toast('Mapping not found.', 'error');
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

				// Parse TargetStores from config, fall back to legacy IDProjectionStore
				let tmpTargetStores = null;
				try
				{
					let tmpParsedConfig = JSON.parse(tmpMapping.MappingConfiguration || '{}');
					if (Array.isArray(tmpParsedConfig.TargetStores) && tmpParsedConfig.TargetStores.length > 0)
					{
						tmpTargetStores = tmpParsedConfig.TargetStores;
					}
				}
				catch (e) { /* ignore */ }
				if (!tmpTargetStores && tmpMapping.IDProjectionStore)
				{
					tmpTargetStores = [tmpMapping.IDProjectionStore];
				}
				this._populateStoreChecklist(tmpTargetStores);

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

				// Clear flow container and re-initialize
				let tmpFlowContainer = document.getElementById('Facto-Proj-Flow-Container');
				if (tmpFlowContainer) tmpFlowContainer.innerHTML = '';
				this._FlowView = null;

				// Switch to flow mode and initialize the flow editor
				this.switchMapMode('flow');
				this.initFlowView();

				// Fetch fresh schema then build TGT node ports from schema columns
				this.pict.providers.Facto.loadProjectionSchema(this._EditingIDDataset).then(
					(pSchema) =>
					{
						if (pSchema && pSchema.SchemaDefinition)
						{
							this._CurrentProjectionSchema = pSchema.SchemaDefinition;
						}
						// Restore saved flow diagram state if available,
						// then rebuild ports from current schema (schema is
						// the source of truth for ports, not saved state).
						if (this._FlowView)
						{
							let tmpFlowState = null;
							try { tmpFlowState = JSON.parse(tmpMapping.FlowDiagramState || 'null'); }
							catch (pParseError) { /* ignore invalid JSON */ }

							if (tmpFlowState && tmpFlowState.Nodes && tmpFlowState.Nodes.length > 0)
							{
								if (typeof this._FlowView.setFlowData === 'function')
								{
									this._FlowView.setFlowData(tmpFlowState);
								}
							}
						}
						// Always rebuild SRC/TGT ports from current schema
						// after restoring positions and connections
						this._rebuildFlowNodes();
					});
			});
	}

	async deleteMapping(pIDProjectionMapping)
	{
		let tmpConfirmed = await this.pict.views['Pict-Section-Modal'].confirm('Delete this mapping?', { title: 'Delete Mapping', confirmLabel: 'Delete', dangerous: true });
		if (!tmpConfirmed) return;

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

			// If there's a flow view, serialize flow -> JSON
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

	_populateStoreChecklist(pSelectedStoreIDs)
	{
		let tmpContainer = document.getElementById('Facto-Proj-Mapping-Stores');
		if (!tmpContainer) return;

		let tmpSelectedSet = {};
		if (Array.isArray(pSelectedStoreIDs))
		{
			for (let i = 0; i < pSelectedStoreIDs.length; i++)
			{
				tmpSelectedSet[pSelectedStoreIDs[i]] = true;
			}
		}
		else if (pSelectedStoreIDs)
		{
			// Backwards compat: single IDProjectionStore value
			tmpSelectedSet[pSelectedStoreIDs] = true;
		}

		if (this._MappingStores.length === 0)
		{
			tmpContainer.innerHTML = '<div style="font-size:0.82em; color:var(--facto-text-tertiary);">No stores deployed yet. Deploy a store from the Projection page first.</div>';
			return;
		}

		let tmpHtml = '';
		for (let i = 0; i < this._MappingStores.length; i++)
		{
			let tmpStore = this._MappingStores[i];
			let tmpChecked = tmpSelectedSet[tmpStore.IDProjectionStore] ? ' checked' : '';
			let tmpLabel = (tmpStore.TargetTableName || 'Store ' + tmpStore.IDProjectionStore) + ' (' + (tmpStore.Status || 'Unknown') + ')';
			tmpHtml += '<label>';
			tmpHtml += '<input type="checkbox" value="' + tmpStore.IDProjectionStore + '"' + tmpChecked + '>';
			tmpHtml += ' ' + tmpLabel;
			tmpHtml += '</label>';
		}
		tmpContainer.innerHTML = tmpHtml;
	}

	_getCheckedStoreIDs()
	{
		let tmpContainer = document.getElementById('Facto-Proj-Mapping-Stores');
		if (!tmpContainer) return [];

		let tmpChecked = tmpContainer.querySelectorAll('input[type="checkbox"]:checked');
		let tmpIDs = [];
		for (let i = 0; i < tmpChecked.length; i++)
		{
			tmpIDs.push(parseInt(tmpChecked[i].value, 10));
		}
		return tmpIDs;
	}

	discoverSourceFields()
	{
		let tmpSourceSelect = document.getElementById('Facto-Proj-Mapping-Source');
		let tmpIDSource = tmpSourceSelect ? parseInt(tmpSourceSelect.value, 10) : 0;

		if (!tmpIDSource)
		{
			this.pict.views['Pict-Section-Modal'].toast('Select a source first.', {type: 'warning'});
			return;
		}

		this.pict.providers.Facto.discoverFields(this._EditingIDDataset, tmpIDSource, 50).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Error)
				{
					this.pict.views['Pict-Section-Modal'].toast('Error: ' + pResponse.Error, {type: 'error'});
					return;
				}

				let tmpHeaders = (pResponse && pResponse.Headers) ? pResponse.Headers : [];
				this._DiscoveredFields[tmpIDSource] = tmpHeaders;

				this.pict.views['Pict-Section-Modal'].toast('Discovered ' + tmpHeaders.length + ' fields from ' + (pResponse.SampleSize || 0) + ' records: ' + tmpHeaders.join(', '), {type: 'success', duration: 6000});

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

		let tmpSourceTitle = 'Source: ' + (tmpSourceSelect && tmpSourceSelect.selectedIndex >= 0 ? tmpSourceSelect.options[tmpSourceSelect.selectedIndex].text : 'Source');
		let tmpTargetTitle = 'Target: ' + (this._EditingName || 'Projection');

		// Build deterministic source ports (Whole Record + discovered fields)
		let tmpSourcePorts =
		[
			{ Hash: 'src-whole-record', Direction: 'output', Side: 'right', Label: 'Whole Record' }
		];
		for (let i = 0; i < tmpFields.length; i++)
		{
			tmpSourcePorts.push(
			{
				Hash: 'src-field-' + tmpFields[i].replace(/[^a-zA-Z0-9_-]/g, '_'),
				Direction: 'output',
				Side: 'right',
				Label: tmpFields[i]
			});
		}

		// Build deterministic target ports -- entity-specific GUID and ID are always present
		let tmpEntityName = (this._EditingName || 'Record').replace(/[^a-zA-Z0-9_]/g, '');
		let tmpGUIDColumnName = 'GUID' + tmpEntityName;
		let tmpIDColumnName = 'ID' + tmpEntityName;

		let tmpTargetPorts =
		[
			{ Hash: 'tgt-col-' + tmpGUIDColumnName, Direction: 'input', Side: 'left', Label: tmpGUIDColumnName },
			{ Hash: 'tgt-col-' + tmpIDColumnName, Direction: 'input', Side: 'left', Label: tmpIDColumnName }
		];
		for (let i = 0; i < tmpSchemaColumns.length; i++)
		{
			// Skip entity GUID/ID if they appear in schema columns (already added above)
			if (tmpSchemaColumns[i] === tmpGUIDColumnName || tmpSchemaColumns[i] === tmpIDColumnName) continue;

			tmpTargetPorts.push(
			{
				Hash: 'tgt-col-' + tmpSchemaColumns[i].replace(/[^a-zA-Z0-9_-]/g, '_'),
				Direction: 'input',
				Side: 'left',
				Label: tmpSchemaColumns[i]
			});
		}

		// Find existing SRC and TGT nodes (preserve user-added TPL/SOL nodes)
		let tmpFlowData = this._FlowView.getFlowData();
		let tmpSrcNode = null;
		let tmpTgtNode = null;

		for (let i = 0; i < tmpFlowData.Nodes.length; i++)
		{
			if (tmpFlowData.Nodes[i].Type === 'SRC') tmpSrcNode = tmpFlowData.Nodes[i];
			if (tmpFlowData.Nodes[i].Type === 'TGT') tmpTgtNode = tmpFlowData.Nodes[i];
		}

		if (tmpSrcNode)
		{
			// Merge source ports: start with newly built ports, then preserve
			// any existing ports from the saved state (e.g. previously discovered
			// fields) that aren't already in the new set.
			let tmpMergedSrcPorts = tmpSourcePorts.slice();
			let tmpSrcPortHashes = {};
			for (let p = 0; p < tmpMergedSrcPorts.length; p++)
			{
				tmpSrcPortHashes[tmpMergedSrcPorts[p].Hash] = true;
			}
			let tmpExistingPorts = tmpSrcNode.Ports || [];
			for (let p = 0; p < tmpExistingPorts.length; p++)
			{
				if (!tmpSrcPortHashes[tmpExistingPorts[p].Hash])
				{
					tmpMergedSrcPorts.push(tmpExistingPorts[p]);
				}
			}

			// Update existing source node in-place
			let tmpInternalNodes = this._FlowView._FlowData.Nodes;
			for (let i = 0; i < tmpInternalNodes.length; i++)
			{
				if (tmpInternalNodes[i].Hash === tmpSrcNode.Hash)
				{
					tmpInternalNodes[i].Ports = tmpMergedSrcPorts;
					tmpInternalNodes[i].Title = tmpSourceTitle;
					break;
				}
			}
		}
		else
		{
			// Push directly into _FlowData.Nodes to avoid addNode() rendering with empty ports
			this._FlowView._FlowData.Nodes.push(
			{
				Hash: 'node-src-' + this.fable.getUUID(),
				Type: 'SRC',
				X: 50,
				Y: 50,
				Width: 200,
				Height: 100,
				Title: tmpSourceTitle,
				Ports: tmpSourcePorts,
				Data: {}
			});
		}

		if (tmpTgtNode)
		{
			// Target ports: schema is the source of truth. Start with schema-
			// derived ports, then preserve any extra existing ports (e.g. user-
			// added custom columns) that aren't already in the new set.
			let tmpMergedTgtPorts = tmpTargetPorts.slice();
			let tmpTgtPortHashes = {};
			for (let p = 0; p < tmpMergedTgtPorts.length; p++)
			{
				tmpTgtPortHashes[tmpMergedTgtPorts[p].Hash] = true;
			}
			let tmpExistingTgtPorts = tmpTgtNode.Ports || [];
			for (let p = 0; p < tmpExistingTgtPorts.length; p++)
			{
				if (!tmpTgtPortHashes[tmpExistingTgtPorts[p].Hash])
				{
					tmpMergedTgtPorts.push(tmpExistingTgtPorts[p]);
				}
			}

			// Update existing target node in-place
			let tmpInternalNodes = this._FlowView._FlowData.Nodes;
			for (let i = 0; i < tmpInternalNodes.length; i++)
			{
				if (tmpInternalNodes[i].Hash === tmpTgtNode.Hash)
				{
					tmpInternalNodes[i].Ports = tmpMergedTgtPorts;
					tmpInternalNodes[i].Title = tmpTargetTitle;
					break;
				}
			}
		}
		else
		{
			// Push directly into _FlowData.Nodes to avoid addNode() rendering with empty ports
			this._FlowView._FlowData.Nodes.push(
			{
				Hash: 'node-tgt-' + this.fable.getUUID(),
				Type: 'TGT',
				X: 550,
				Y: 50,
				Width: 200,
				Height: 100,
				Title: tmpTargetTitle,
				Ports: tmpTargetPorts,
				Data: {}
			});
		}

		// Render the flow once with all ports correctly set
		if (typeof this._FlowView.renderFlow === 'function')
		{
			this._FlowView.renderFlow();
		}
		else if (typeof this._FlowView.render === 'function')
		{
			this._FlowView.render();
		}
	}

	_getSchemaColumnsForProjection()
	{
		// Use the locally cached schema definition
		let tmpColumns = [];
		let tmpDDL = this._CurrentProjectionSchema || '';
		if (tmpDDL)
		{
			let tmpParsedColumns = libProjectionConstants.microDDLToColumns(tmpDDL);
			for (let j = 0; j < tmpParsedColumns.length; j++)
			{
				tmpColumns.push(tmpParsedColumns[j].Name);
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
			let libFlowCardTemplate = require('./flow-cards/FlowCard-TemplateExpression.js');
			let libFlowCardSolver = require('./flow-cards/FlowCard-SolverExpression.js');

			this.pict.addServiceType('FlowCardSourceDataset', libFlowCardSource);
			this.pict.addServiceType('FlowCardProjectionTarget', libFlowCardTarget);
			this.pict.addServiceType('FlowCardTemplateExpression', libFlowCardTemplate);
			this.pict.addServiceType('FlowCardSolverExpression', libFlowCardSolver);

			// Render the flow view first so _NodeTypeProvider is initialized
			if (typeof this._FlowView.render === 'function')
			{
				this._FlowView.render();
			}

			// Register card types with the flow view (must happen after render
			// so _NodeTypeProvider exists)
			let tmpSourceCard = this.pict.instantiateServiceProviderWithoutRegistration('FlowCardSourceDataset', {});
			let tmpTargetCard = this.pict.instantiateServiceProviderWithoutRegistration('FlowCardProjectionTarget', {});
			let tmpTemplateCard = this.pict.instantiateServiceProviderWithoutRegistration('FlowCardTemplateExpression', {});
			let tmpSolverCard = this.pict.instantiateServiceProviderWithoutRegistration('FlowCardSolverExpression', {});

			tmpSourceCard.registerWithFlowView(this._FlowView);
			tmpTargetCard.registerWithFlowView(this._FlowView);
			tmpTemplateCard.registerWithFlowView(this._FlowView);
			tmpSolverCard.registerWithFlowView(this._FlowView);
		}
		catch (pFlowError)
		{
			this.log.error('Failed to initialize flow view: ' + pFlowError.message);
			tmpFlowContainer.innerHTML = '<div style="padding:2em; text-align:center; color:var(--facto-text-tertiary);">Flow editor could not be loaded. Use JSON Config mode instead.</div>';
		}
	}

	flowToMappingConfig()
	{
		let tmpEntityName = (this._EditingName || 'Record').replace(/[^a-zA-Z0-9_]/g, '');
		let tmpGUIDColumnName = 'GUID' + tmpEntityName;
		let tmpIDColumnName = 'ID' + tmpEntityName;

		let tmpConfig =
		{
			Entity: tmpEntityName,
			GUIDTemplate: '{~D:Record.IDRecord~}',
			GUIDName: tmpGUIDColumnName,
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

		// Build node hash->node map and port hash->{Label, NodeHash, NodeType} map
		let tmpNodeMap = {};
		let tmpPortMap = {};

		if (tmpFlowData.Nodes)
		{
			for (let i = 0; i < tmpFlowData.Nodes.length; i++)
			{
				let tmpNode = tmpFlowData.Nodes[i];
				tmpNodeMap[tmpNode.Hash] = tmpNode;

				if (tmpNode.Ports)
				{
					for (let j = 0; j < tmpNode.Ports.length; j++)
					{
						tmpPortMap[tmpNode.Ports[j].Hash] =
						{
							Label: tmpNode.Ports[j].Label,
							NodeHash: tmpNode.Hash,
							NodeType: tmpNode.Type
						};
					}
				}
			}
		}

		// Track solver nodes that connect to multiple target columns
		let tmpSolverEntries = {};

		// Process each connection where the target is a TGT node
		for (let i = 0; i < tmpFlowData.Connections.length; i++)
		{
			let tmpConn = tmpFlowData.Connections[i];
			let tmpSourcePort = tmpPortMap[tmpConn.SourcePortHash];
			let tmpTargetPort = tmpPortMap[tmpConn.TargetPortHash];

			if (!tmpSourcePort || !tmpTargetPort) continue;

			// Only process connections that end at a TGT node
			if (tmpTargetPort.NodeType !== 'TGT') continue;

			let tmpTargetColumn = tmpTargetPort.Label;
			if (!tmpTargetColumn) continue;

			let tmpSourceNode = tmpNodeMap[tmpSourcePort.NodeHash];
			if (!tmpSourceNode) continue;

			if (tmpSourceNode.Type === 'SRC')
			{
				// Direct mapping: SRC field -> TGT column
				let tmpSourceField = tmpSourcePort.Label;

				// Skip "Whole Record" direct connections to TGT (need intermediate node)
				if (tmpSourceField === 'Whole Record') continue;

				let tmpTemplate = (tmpConn.Data && tmpConn.Data.Template)
					? tmpConn.Data.Template
					: '{~D:Record.' + tmpSourceField + '~}';

				// Connection to the entity GUID port sets the GUIDTemplate for upsert uniqueness
				if (tmpTargetColumn === tmpGUIDColumnName)
				{
					tmpConfig.GUIDTemplate = tmpTemplate;
				}

				tmpConfig.Mappings[tmpTargetColumn] = tmpTemplate;
			}
			else if (tmpSourceNode.Type === 'TPL')
			{
				// Template expression: TPL result -> TGT column
				let tmpExpression = (tmpSourceNode.Data && tmpSourceNode.Data.TemplateExpression)
					? tmpSourceNode.Data.TemplateExpression
					: '';

				if (tmpExpression)
				{
					// TPL connected to entity GUID sets the GUIDTemplate
					if (tmpTargetColumn === tmpGUIDColumnName)
					{
						tmpConfig.GUIDTemplate = tmpExpression;
					}

					tmpConfig.Mappings[tmpTargetColumn] = tmpExpression;
				}
			}
			else if (tmpSourceNode.Type === 'SOL')
			{
				// Solver expression: SOL result -> TGT column
				let tmpExpression = (tmpSourceNode.Data && tmpSourceNode.Data.SolverExpression)
					? tmpSourceNode.Data.SolverExpression
					: '';

				if (tmpExpression)
				{
					// Group outputs for the same solver node
					if (!tmpSolverEntries[tmpSourceNode.Hash])
					{
						tmpSolverEntries[tmpSourceNode.Hash] =
						{
							expression: tmpExpression,
							outputs: {}
						};
					}
					tmpSolverEntries[tmpSourceNode.Hash].outputs[tmpTargetColumn] = true;
				}
			}
		}

		// Ensure entity-specific GUID and ID are always present in Mappings
		if (!tmpConfig.Mappings.hasOwnProperty(tmpGUIDColumnName))
		{
			tmpConfig.Mappings[tmpGUIDColumnName] = tmpConfig.GUIDTemplate;
		}
		if (!tmpConfig.Mappings.hasOwnProperty(tmpIDColumnName))
		{
			tmpConfig.Mappings[tmpIDColumnName] = '{~D:Record.IDRecord~}';
		}

		// Add grouped solver entries
		let tmpSolverKeys = Object.keys(tmpSolverEntries);
		for (let i = 0; i < tmpSolverKeys.length; i++)
		{
			tmpConfig.Solvers.push(tmpSolverEntries[tmpSolverKeys[i]]);
		}

		return tmpConfig;
	}

	saveMapping()
	{
		let tmpNameInput = document.getElementById('Facto-Proj-Mapping-Name');
		let tmpSourceSelect = document.getElementById('Facto-Proj-Mapping-Source');

		let tmpName = tmpNameInput ? tmpNameInput.value.trim() : '';
		let tmpIDSource = tmpSourceSelect ? parseInt(tmpSourceSelect.value, 10) : 0;
		let tmpCheckedStoreIDs = this._getCheckedStoreIDs();
		let tmpIDProjectionStore = tmpCheckedStoreIDs.length > 0 ? tmpCheckedStoreIDs[0] : 0;

		if (!tmpName)
		{
			this.pict.views['Pict-Section-Modal'].toast('Enter a mapping name.', {type: 'warning'});
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
				this.pict.views['Pict-Section-Modal'].toast('Invalid JSON: ' + e.message, {type: 'error'});
				return;
			}
		}
		else
		{
			tmpMappingConfig = this.flowToMappingConfig();
		}

		// Store target stores in the mapping config
		tmpMappingConfig.TargetStores = tmpCheckedStoreIDs;

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
					this.pict.views['Pict-Section-Modal'].toast('Error: ' + pResponse.Error, {type: 'error'});
					return;
				}

				// Update the selected mapping ID if it was a create
				if (pResponse && pResponse.Mapping && pResponse.Mapping.IDProjectionMapping)
				{
					this._SelectedMappingID = pResponse.Mapping.IDProjectionMapping;
				}

				this.pict.views['Pict-Section-Modal'].toast('Mapping saved.', {type: 'success'});

				// Refresh mapping list
				this.pict.providers.Facto.loadProjectionMappings(this._EditingIDDataset).then(
					(pResult) =>
					{
						this._CurrentMappings = (pResult && pResult.Mappings) ? pResult.Mappings : [];
					});
			});
	}

}

module.exports = FactoFullMappingEditorView;

module.exports.default_configuration = _ViewConfiguration;
