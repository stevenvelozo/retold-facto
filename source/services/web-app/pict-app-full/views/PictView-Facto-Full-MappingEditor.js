const libMeadowMappingEditorView = require('meadow-integration').MeadowMappingEditorView;

// Facto-specific view configuration: same template HTML as the generic editor
// but with 'Facto-Full-MappingEditor' in all onclick handlers so pict can
// resolve the registered view name.  DOM IDs are the generic MeadowMap-*
// set so inherited JS methods work without modification.
const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-MappingEditor",

	DefaultRenderable: "Facto-Full-MappingEditor-Content",
	DefaultDestinationAddress: "#Facto-Proj-Mapping-Editor-Container",

	AutoRender: false,

	CSS: libMeadowMappingEditorView.default_configuration.CSS,

	Templates:
	[
		{
			Hash: "Facto-Full-MappingEditor-Template",
			Template: /*html*/`
<div>
	<div id="MeadowMap-Editor" class="meadow-mapping-editor">
		<div class="meadow-mapping-header">
			<button class="meadow-mapping-btn meadow-mapping-btn-secondary meadow-mapping-btn-small" onclick="{~P~}.views['Facto-Full-MappingEditor'].closeMappingEditor()">&larr; Back</button>
			<h3 id="MeadowMap-Title">Mapping Editor</h3>
			<div class="meadow-schema-mode-tabs">
				<button class="meadow-schema-mode-tab active" id="MeadowMap-Mode-Flow" onclick="{~P~}.views['Facto-Full-MappingEditor'].switchMapMode('flow')">Visual Mapper</button>
				<button class="meadow-schema-mode-tab" id="MeadowMap-Mode-JSON" onclick="{~P~}.views['Facto-Full-MappingEditor'].switchMapMode('json')">JSON Config</button>
			</div>
		</div>

		<div id="MeadowMap-List-Wrap">
			<div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75em;">
				<div class="meadow-section-title" style="margin:0;">Existing Mappings</div>
				<button class="meadow-mapping-btn meadow-mapping-btn-primary meadow-mapping-btn-small" onclick="{~P~}.views['Facto-Full-MappingEditor'].newMapping()">+ New Mapping</button>
			</div>
			<div id="MeadowMap-List"></div>
		</div>

		<div id="MeadowMap-Detail" style="display:none;">
			<div style="display:flex; gap:0.5em; align-items:center; margin-bottom:0.75em;">
				<label style="font-size:0.78em; font-weight:600;">Mapping Name</label>
				<input type="text" id="MeadowMap-Name" placeholder="Mapping name" style="flex:1; padding:0.3em 0.5em; font-size:0.85em; border:1px solid var(--facto-border); border-radius:4px; background:var(--facto-bg-input); color:var(--facto-text);">
			</div>

			<div style="display:flex; gap:0.5em; align-items:center; margin-bottom:0.75em;">
				<label style="font-size:0.78em; font-weight:600;">Source</label>
				<select id="MeadowMap-Source" style="flex:1; padding:0.3em 0.5em; font-size:0.85em; border:1px solid var(--facto-border); border-radius:4px;"></select>
				<button class="meadow-mapping-btn meadow-mapping-btn-secondary meadow-mapping-btn-small" onclick="{~P~}.views['Facto-Full-MappingEditor'].discoverSourceFields()">Discover Fields</button>
			</div>

			<div id="MeadowMap-Flow-Wrap">
				<div id="MeadowMap-Flow-Container" class="meadow-flow-container"></div>
			</div>

			<div id="MeadowMap-JSON-Wrap" style="display:none;">
				<textarea class="meadow-mapping-json-editor" id="MeadowMap-JSON" placeholder='{"Entity":"MyTable","GUIDTemplate":"{~D:Record.IDRecord~}","Mappings":{},"Solvers":[],"ManyfestAddresses":false}'></textarea>
			</div>

			<div style="margin-top:0.75em;">
				<div style="font-size:0.72em; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:var(--facto-text-tertiary); margin-bottom:0.35em;">Target Stores</div>
				<div id="MeadowMap-Stores" class="meadow-mapping-store-checklist"></div>
			</div>

			<div style="margin-top:0.75em; display:flex; gap:0.5em; flex-wrap:wrap; align-items:center;">
				<button class="meadow-mapping-btn meadow-mapping-btn-primary" onclick="{~P~}.views['Facto-Full-MappingEditor'].saveMapping()">Save Mapping</button>
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

/**
 * FactoFullMappingEditorView
 *
 * Thin wrapper around MeadowMappingEditorView that wires the generic editor
 * to retold-facto's API provider.  All visual/canvas/serialization logic
 * lives in the base class; this subclass only supplies data access and the
 * close callback.
 */
class FactoFullMappingEditorView extends libMeadowMappingEditorView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	// ── Facto-specific data methods ──────────────────────────────────────────

	_doLoadMappings(pContextID)
	{
		return this.pict.providers.Facto.loadProjectionMappings(pContextID);
	}

	_doLoadSources()
	{
		return this.pict.providers.Facto.loadSources();
	}

	_doLoadStores(pContextID)
	{
		return this.pict.providers.Facto.loadProjectionStores(pContextID);
	}

	_doLoadTargetSchema(pContextID)
	{
		return this.pict.providers.Facto.loadProjectionSchema(pContextID);
	}

	_doLoadMapping(pMappingID)
	{
		return this.pict.providers.Facto.loadProjectionMapping(pMappingID);
	}

	_doDeleteMapping(pMappingID)
	{
		return this.pict.providers.Facto.deleteProjectionMapping(pMappingID);
	}

	_doDiscoverSourceFields(pContextID, pSourceID, pRecordLimit)
	{
		return this.pict.providers.Facto.discoverFields(pContextID, pSourceID, pRecordLimit);
	}

	_doCreateMapping(pContextID, pData)
	{
		return this.pict.providers.Facto.createProjectionMapping(pContextID, pData);
	}

	_doUpdateMapping(pMappingID, pData)
	{
		return this.pict.providers.Facto.updateProjectionMapping(pMappingID, pData);
	}

	_onClose()
	{
		this.pict.views['Facto-Full-ProjectionDetail'].closeMappingEditor();
	}
}

module.exports = FactoFullMappingEditorView;

module.exports.default_configuration = _ViewConfiguration;
