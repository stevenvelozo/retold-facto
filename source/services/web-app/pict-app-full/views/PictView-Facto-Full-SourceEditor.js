const libPictView = require('pict-view');
const libPictSectionMarkdownEditor = require('pict-section-markdowneditor');
const libPictSectionContent = require('pict-section-content');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-SourceEditor",

	DefaultRenderable: "Facto-Full-SourceEditor-Content",
	DefaultDestinationAddress: "#Facto-SourceDetail-EditorContainer",

	AutoRender: false,

	CSS: /*css*/`
		.facto-doc-editor-wrap {
			background: var(--facto-bg-elevated, #1a1e2a);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			border-radius: 8px;
			padding: 1em;
			min-height: 200px;
		}
		.facto-doc-toolbar {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-bottom: 0.75em;
		}
		.facto-doc-name {
			font-size: 0.9em;
			font-weight: 600;
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-name-input {
			font-size: 0.9em;
			font-weight: 600;
			color: var(--facto-text-heading, #eee);
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border, #3a3e4a);
			border-radius: 4px;
			padding: 0.2em 0.5em;
			width: 250px;
		}
		.facto-doc-name-input:focus {
			border-color: var(--facto-brand, #4a90d9);
			outline: none;
		}

		/* Editor toolbar controls */
		.facto-editor-controls {
			display: flex;
			align-items: center;
			gap: 0.25em;
			margin-left: auto;
		}
		.facto-editor-ctrl-btn {
			display: inline-flex;
			align-items: center;
			gap: 0.3em;
			padding: 0.2em 0.55em;
			font-size: 0.72em;
			border-radius: 4px;
			cursor: pointer;
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			background: transparent;
			color: var(--facto-text-tertiary, #888);
			transition: background 0.15s, color 0.15s, border-color 0.15s;
			white-space: nowrap;
		}
		.facto-editor-ctrl-btn:hover {
			border-color: var(--facto-border, #3a3e4a);
			color: var(--facto-text-secondary, #aaa);
		}
		.facto-editor-ctrl-btn.active {
			background: var(--facto-brand-a12);
			border-color: var(--facto-brand, #4a90d9);
			color: var(--facto-brand, #4a90d9);
		}
		.facto-editor-ctrl-sep {
			width: 1px;
			height: 16px;
			background: var(--facto-border-subtle, #2a2e3a);
			margin: 0 0.25em;
		}

		/* Settings gear & flyout */
		.facto-settings-wrap {
			position: relative;
			display: flex;
			align-items: center;
		}
		.facto-settings-gear {
			background: transparent;
			border: none;
			cursor: pointer;
			padding: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: 4px;
			color: var(--facto-text-tertiary, #888);
			transition: color 0.15s;
		}
		.facto-settings-gear:hover,
		.facto-settings-gear.active {
			color: var(--facto-brand, #4a90d9);
		}
		.facto-settings-gear svg {
			width: 18px;
			height: 18px;
			fill: currentColor;
		}
		.facto-settings-overlay {
			display: none;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 999;
		}
		.facto-settings-overlay.open {
			display: block;
		}
		.facto-settings-flyout {
			position: absolute;
			top: 36px;
			right: 0;
			width: 260px;
			background: var(--facto-bg-elevated, #1a1e2a);
			border: 1px solid var(--facto-border, #3a3e4a);
			border-radius: 8px;
			box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
			z-index: 1000;
			opacity: 0;
			transform: translateY(-4px);
			pointer-events: none;
			transition: opacity 0.15s ease, transform 0.15s ease;
		}
		.facto-settings-flyout.open {
			opacity: 1;
			transform: translateY(0);
			pointer-events: auto;
		}
		.facto-settings-flyout::before {
			content: '';
			position: absolute;
			top: -6px;
			right: 10px;
			width: 10px;
			height: 10px;
			background: var(--facto-bg-elevated, #1a1e2a);
			border-left: 1px solid var(--facto-border, #3a3e4a);
			border-top: 1px solid var(--facto-border, #3a3e4a);
			transform: rotate(45deg);
		}
		.facto-settings-section {
			padding: 8px 12px;
		}
		.facto-settings-label {
			font-size: 0.68rem;
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
			color: var(--facto-text-tertiary, #888);
			margin-bottom: 6px;
		}
		.facto-settings-divider {
			height: 1px;
			background: var(--facto-border-subtle, #2a2e3a);
			margin: 2px 8px;
		}
		.facto-settings-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 8px;
			margin-bottom: 5px;
		}
		.facto-settings-row:last-child {
			margin-bottom: 0;
		}
		.facto-settings-checkbox {
			width: 15px;
			height: 15px;
			accent-color: var(--facto-brand, #4a90d9);
			cursor: pointer;
			flex-shrink: 0;
		}
		.facto-settings-checkbox-label {
			font-size: 0.82rem;
			color: var(--facto-text-secondary, #aaa);
			cursor: pointer;
			user-select: none;
		}
		.facto-settings-select {
			width: 130px;
			padding: 4px 6px;
			border: 1px solid var(--facto-border, #3a3e4a);
			border-radius: 4px;
			background: var(--facto-bg-input, #0d1117);
			font-size: 0.78rem;
			color: var(--facto-text-secondary, #aaa);
			cursor: pointer;
		}
		.facto-settings-select:disabled {
			opacity: 0.35;
			cursor: not-allowed;
		}
		.facto-settings-select-label {
			font-size: 0.78rem;
			color: var(--facto-text-tertiary, #888);
			white-space: nowrap;
		}

		/* Override MarkdownEditor default light theme for dark theme.
		   Selectors must match or exceed library specificity. */
		.facto-doc-editor-wrap .pict-mde {
			background: transparent;
		}
		.facto-doc-editor-wrap .pict-mde-segment {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-segment-body {
			background: var(--facto-bg-input, #0d1117);
		}
		.facto-doc-editor-wrap .pict-mde-segment.pict-mde-active .pict-mde-segment-body {
			background: var(--facto-bg-input, #0d1117);
		}

		/* Drag handle */
		.facto-doc-editor-wrap .pict-mde-drag-handle {
			background: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-drag-handle:hover {
			background: var(--facto-border, #3a3e4a);
		}
		.facto-doc-editor-wrap .pict-mde-segment.pict-mde-active .pict-mde-drag-handle {
			background: var(--facto-brand-a25);
		}

		/* Left control buttons */
		.facto-doc-editor-wrap .pict-mde-left-btn {
			color: var(--facto-text-tertiary, #666);
		}
		.facto-doc-editor-wrap .pict-mde-left-btn:hover {
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-btn-remove:hover {
			color: var(--facto-error, #dc3545);
		}

		/* CodeMirror editor — selectors must include .cm-editor to beat
		   library's .pict-mde-segment-editor .cm-editor .cm-* specificity */
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor {
			background: var(--facto-bg-input, #0d1117);
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor .cm-gutters {
			background: var(--facto-bg-elevated, #1a1e2a);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-tertiary, #666);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor .cm-activeLine {
			background: var(--facto-brand-a05);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor .cm-activeLineGutter {
			background: var(--facto-brand-a10);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor .cm-cursor {
			border-left-color: var(--facto-text-heading, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor .cm-selectionBackground {
			background: var(--facto-brand-a20) !important;
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor .cm-content {
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-segment-editor .cm-editor .cm-lineNumbers .cm-gutterElement {
			color: var(--facto-text-tertiary, #555);
		}

		/* Rich preview — must match library's two-class specificity */
		.facto-doc-editor-wrap .pict-mde-rich-preview.pict-mde-has-rich-preview {
			background: var(--facto-bg-surface, #161a24);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-secondary, #aaa);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview h1,
		.facto-doc-editor-wrap .pict-mde-rich-preview h2,
		.facto-doc-editor-wrap .pict-mde-rich-preview h3,
		.facto-doc-editor-wrap .pict-mde-rich-preview h4 {
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview code {
			background: var(--facto-brand-a10);
			color: var(--facto-brand, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview pre {
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview a {
			color: var(--facto-brand, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview blockquote {
			border-left-color: var(--facto-brand, #4a90d9);
			color: var(--facto-text-tertiary, #888);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview table th,
		.facto-doc-editor-wrap .pict-mde-rich-preview table td {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-rich-preview hr {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}

		/* Image preview */
		.facto-doc-editor-wrap .pict-mde-image-preview.pict-mde-has-images {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-image-preview-label {
			color: var(--facto-text-tertiary, #666);
			background: var(--facto-bg-surface, #161a24);
		}

		/* Add-segment button */
		.facto-doc-editor-wrap .pict-mde-btn-add {
			background: var(--facto-bg-surface, #161a24);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-tertiary, #666);
		}
		.facto-doc-editor-wrap .pict-mde-btn-add:hover {
			border-color: var(--facto-brand, #4a90d9);
			color: var(--facto-brand, #4a90d9);
			background: var(--facto-brand-a05);
		}

		/* Sidebar buttons */
		.facto-doc-editor-wrap .pict-mde-sidebar-btn {
			background: var(--facto-bg-surface, #161a24);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-tertiary, #666);
		}
		.facto-doc-editor-wrap .pict-mde-sidebar-btn:hover {
			border-color: var(--facto-brand, #4a90d9);
			color: var(--facto-brand, #4a90d9);
		}

		/* Drag-over indicators */
		.facto-doc-editor-wrap .pict-mde-segment.pict-mde-drag-over-top {
			border-top-color: var(--facto-brand, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-segment.pict-mde-drag-over-bottom {
			border-bottom-color: var(--facto-brand, #4a90d9);
		}

		/* Rendered view (full-document preview mode) */
		.facto-doc-editor-wrap .pict-mde-rendered-view {
			background: var(--facto-bg-surface, #161a24);
			border-color: var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-secondary, #aaa);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view h1,
		.facto-doc-editor-wrap .pict-mde-rendered-view h2,
		.facto-doc-editor-wrap .pict-mde-rendered-view h3,
		.facto-doc-editor-wrap .pict-mde-rendered-view h4 {
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view p {
			color: var(--facto-text-secondary, #bbb);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view a {
			color: var(--facto-brand, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view code {
			background: var(--facto-brand-a10);
			color: var(--facto-brand, #4a90d9);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view pre {
			background: var(--facto-bg-input, #0d1117);
			border: 1px solid var(--facto-border-subtle, #2a2e3a);
			color: var(--facto-text-heading, #eee);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view pre code {
			background: transparent;
			color: inherit;
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view blockquote {
			border-left-color: var(--facto-brand, #4a90d9);
			color: var(--facto-text-tertiary, #888);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view table th,
		.facto-doc-editor-wrap .pict-mde-rendered-view table td {
			border-color: var(--facto-border-subtle, #2a2e3a);
		}
		.facto-doc-editor-wrap .pict-mde-rendered-view img {
			max-width: 100%;
			height: auto;
			border-radius: 4px;
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-SourceEditor-Template",
			Template: /*html*/`
<div class="facto-doc-editor-wrap">
	<div class="facto-doc-toolbar">
		<span class="facto-doc-name" id="Facto-SourceDetail-DocName"></span>
		<div class="facto-editor-controls" id="Facto-SourceDetail-EditorControls">
			<button class="facto-editor-ctrl-btn active" id="Facto-EditorCtrl-Preview" title="Toggle rich previews below each segment" onclick="{~P~}.views['Facto-Full-SourceEditor'].toggleEditorPreview()">&#x25CE; Preview</button>
			<button class="facto-editor-ctrl-btn active" id="Facto-EditorCtrl-LineNums" title="Toggle line numbers and sidebar controls" onclick="{~P~}.views['Facto-Full-SourceEditor'].toggleEditorControls()">&#x229E; Controls</button>
			<div class="facto-editor-ctrl-sep"></div>
			<button class="facto-editor-ctrl-btn" id="Facto-EditorCtrl-Rendered" title="Preview the full document as rendered markdown" onclick="{~P~}.views['Facto-Full-SourceEditor'].toggleEditorRenderedView()">&#9635; Full Preview</button>
			<div class="facto-editor-ctrl-sep"></div>
			<div class="facto-settings-wrap">
				<button class="facto-settings-gear" id="Facto-EditorSettings-Gear" title="Editor settings"
					onclick="{~P~}.views['Facto-Full-SourceEditor'].toggleSettingsPanel()">
					<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>
				</button>
				<div class="facto-settings-overlay" id="Facto-EditorSettings-Overlay"
					onclick="{~P~}.views['Facto-Full-SourceEditor'].closeSettingsPanel()"></div>
				<div class="facto-settings-flyout" id="Facto-EditorSettings-Flyout">
					<div class="facto-settings-section">
						<div class="facto-settings-label">Segmentation</div>
						<div class="facto-settings-row">
							<label class="facto-settings-checkbox-label"
								for="Facto-Setting-AutoSegment">Auto Segment Markdown</label>
							<input type="checkbox" class="facto-settings-checkbox"
								id="Facto-Setting-AutoSegment"
								onchange="{~P~}.views['Facto-Full-SourceEditor'].onAutoSegmentChanged(this.checked)">
						</div>
						<div class="facto-settings-row">
							<span class="facto-settings-select-label">Segment Depth</span>
							<select class="facto-settings-select"
								id="Facto-Setting-SegmentDepth"
								disabled
								onchange="{~P~}.views['Facto-Full-SourceEditor'].onSegmentDepthChanged(this.value)">
								<option value="1">Depth 1: Blocks</option>
								<option value="2" selected>Depth 2: ##</option>
								<option value="3">Depth 3: ###</option>
								<option value="4">Depth 4: ####</option>
								<option value="5">Depth 5: #####</option>
								<option value="6">Depth 6: ######</option>
							</select>
						</div>
					</div>
					<div class="facto-settings-divider"></div>
					<div class="facto-settings-section">
						<div class="facto-settings-label">Word Wrap</div>
						<div class="facto-settings-row">
							<label class="facto-settings-checkbox-label"
								for="Facto-Setting-WordWrap">Markdown Word Wrap</label>
							<input type="checkbox" class="facto-settings-checkbox"
								id="Facto-Setting-WordWrap"
								onchange="{~P~}.views['Facto-Full-SourceEditor'].onWordWrapChanged(this.checked)">
						</div>
					</div>
				</div>
			</div>
		</div>
		<button class="facto-btn facto-btn-primary facto-btn-small" onclick="{~P~}.views['Facto-Full-SourceEditor'].saveDocument()">Save</button>
	</div>
	<div id="Facto-SourceDetail-MarkdownEditor-Container"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-SourceEditor-Content",
			TemplateHash: "Facto-Full-SourceEditor-Template",
			DestinationAddress: "#Facto-SourceDetail-EditorContainer",
			RenderMethod: "replace"
		}
	]
};

class FactoFullSourceEditorView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this._CurrentIDSource = null;
		this._CurrentIDDoc = null;
		this._CurrentDocName = '';
		this._CurrentDocContent = '';

		// Settings state
		this._SettingsOpen = false;
		this._AutoSegment = false;
		this._AutoSegmentDepth = 2;
		this._WordWrap = false;
	}

	onBeforeInitialize()
	{
		super.onBeforeInitialize();

		// Register the MarkdownEditor view type if not already present
		if (!this.fable.servicesMap.hasOwnProperty('PictViewMarkdownEditor'))
		{
			this.fable.addServiceType('PictViewMarkdownEditor', libPictSectionMarkdownEditor);
		}

		// Register the Content provider for markdown rendering
		if (!this.pict.providers.PictContent)
		{
			this.pict.addProvider('PictContent', { ProviderIdentifier: 'PictContent' }, libPictSectionContent.PictContentProvider);
		}

		return true;
	}

	/**
	 * Open the editor for a specific document.
	 * Called by the coordinator when switching to edit mode.
	 */
	openEditor(pIDSource, pIDDoc, pDocName, pDocContent)
	{
		this._CurrentIDSource = pIDSource;
		this._CurrentIDDoc = pIDDoc;
		this._CurrentDocName = pDocName || '';
		this._CurrentDocContent = pDocContent || '';

		// Segment the content for the markdown editor
		this.pict.AppData.Facto.CurrentDocumentSegments = this._segmentMarkdownContent(this._CurrentDocContent);

		this.render();

		// Show editable name input
		let tmpNameEl = document.getElementById('Facto-SourceDetail-DocName');
		if (tmpNameEl)
		{
			tmpNameEl.innerHTML = '<input type="text" class="facto-doc-name-input" id="Facto-SourceDetail-DocNameInput" value="' + (this._CurrentDocName || '').replace(/"/g, '&quot;') + '">';
		}

		this._renderMarkdownEditor();
		this._syncEditorToolbarState();
	}

	/**
	 * Close the editor and marshal content back.
	 * Returns the current document content and name.
	 */
	closeEditor()
	{
		// If in rendered view mode, exit it first so MDE state is clean
		let tmpEditorView = this.pict.views['Facto-SourceDetail-MarkdownEditor'];
		if (tmpEditorView && tmpEditorView._renderedViewActive)
		{
			tmpEditorView.toggleRenderedView(false);
		}

		// Marshal content from editor back to raw string
		this._marshalEditorContent();

		// Capture any name change from the input
		let tmpNameInput = document.getElementById('Facto-SourceDetail-DocNameInput');
		if (tmpNameInput)
		{
			let tmpNewName = tmpNameInput.value.trim();
			if (tmpNewName && tmpNewName !== this._CurrentDocName)
			{
				this._CurrentDocName = tmpNewName;
			}
		}

		return {
			Content: this._CurrentDocContent,
			Name: this._CurrentDocName
		};
	}

	/**
	 * Sync the editor toolbar toggle buttons with the MDE's current state.
	 */
	_syncEditorToolbarState()
	{
		let tmpEditorView = this.pict.views['Facto-SourceDetail-MarkdownEditor'];
		if (!tmpEditorView) return;

		let tmpPreviewBtn = document.getElementById('Facto-EditorCtrl-Preview');
		if (tmpPreviewBtn)
		{
			tmpPreviewBtn.classList.toggle('active', tmpEditorView._previewsVisible);
		}

		let tmpControlsBtn = document.getElementById('Facto-EditorCtrl-LineNums');
		if (tmpControlsBtn)
		{
			tmpControlsBtn.classList.toggle('active', tmpEditorView._controlsVisible);
		}

		let tmpRenderedBtn = document.getElementById('Facto-EditorCtrl-Rendered');
		if (tmpRenderedBtn)
		{
			tmpRenderedBtn.classList.toggle('active', tmpEditorView._renderedViewActive);
		}
	}

	// -- Editor toolbar toggles --

	toggleEditorPreview()
	{
		let tmpEditorView = this.pict.views['Facto-SourceDetail-MarkdownEditor'];
		if (!tmpEditorView) return;

		tmpEditorView.togglePreview();

		let tmpBtn = document.getElementById('Facto-EditorCtrl-Preview');
		if (tmpBtn)
		{
			tmpBtn.classList.toggle('active', tmpEditorView._previewsVisible);
		}
	}

	toggleEditorControls()
	{
		let tmpEditorView = this.pict.views['Facto-SourceDetail-MarkdownEditor'];
		if (!tmpEditorView) return;

		tmpEditorView.toggleControls();

		let tmpBtn = document.getElementById('Facto-EditorCtrl-LineNums');
		if (tmpBtn)
		{
			tmpBtn.classList.toggle('active', tmpEditorView._controlsVisible);
		}
	}

	toggleEditorRenderedView()
	{
		let tmpEditorView = this.pict.views['Facto-SourceDetail-MarkdownEditor'];
		if (!tmpEditorView) return;

		tmpEditorView.toggleRenderedView();

		let tmpBtn = document.getElementById('Facto-EditorCtrl-Rendered');
		if (tmpBtn)
		{
			tmpBtn.classList.toggle('active', tmpEditorView._renderedViewActive);
		}
	}

	// -- Settings gear flyout --

	toggleSettingsPanel()
	{
		if (this._SettingsOpen)
		{
			this.closeSettingsPanel();
		}
		else
		{
			this.openSettingsPanel();
		}
	}

	openSettingsPanel()
	{
		this._SettingsOpen = true;

		let tmpFlyout = document.getElementById('Facto-EditorSettings-Flyout');
		let tmpOverlay = document.getElementById('Facto-EditorSettings-Overlay');
		let tmpGear = document.getElementById('Facto-EditorSettings-Gear');

		if (tmpFlyout) tmpFlyout.classList.add('open');
		if (tmpOverlay) tmpOverlay.classList.add('open');
		if (tmpGear) tmpGear.classList.add('active');

		// Sync checkboxes/selects with current state
		let tmpAutoSeg = document.getElementById('Facto-Setting-AutoSegment');
		if (tmpAutoSeg) tmpAutoSeg.checked = this._AutoSegment;

		let tmpDepth = document.getElementById('Facto-Setting-SegmentDepth');
		if (tmpDepth)
		{
			tmpDepth.value = String(this._AutoSegmentDepth);
			tmpDepth.disabled = !this._AutoSegment;
		}

		let tmpWrap = document.getElementById('Facto-Setting-WordWrap');
		if (tmpWrap) tmpWrap.checked = this._WordWrap;
	}

	closeSettingsPanel()
	{
		this._SettingsOpen = false;

		let tmpFlyout = document.getElementById('Facto-EditorSettings-Flyout');
		let tmpOverlay = document.getElementById('Facto-EditorSettings-Overlay');
		let tmpGear = document.getElementById('Facto-EditorSettings-Gear');

		if (tmpFlyout) tmpFlyout.classList.remove('open');
		if (tmpOverlay) tmpOverlay.classList.remove('open');
		if (tmpGear) tmpGear.classList.remove('active');
	}

	onAutoSegmentChanged(pChecked)
	{
		this._AutoSegment = pChecked;

		let tmpDepthSelect = document.getElementById('Facto-Setting-SegmentDepth');
		if (tmpDepthSelect)
		{
			tmpDepthSelect.disabled = !pChecked;
		}

		// If turning on, re-segment the current document and rebuild the editor
		if (pChecked && this._CurrentDocContent)
		{
			this._resegmentAndRebuildEditor();
		}
	}

	onSegmentDepthChanged(pValue)
	{
		this._AutoSegmentDepth = parseInt(pValue, 10) || 2;

		// Re-segment if auto-segment is active
		if (this._AutoSegment && this._CurrentDocContent)
		{
			this._resegmentAndRebuildEditor();
		}
	}

	onWordWrapChanged(pChecked)
	{
		this._WordWrap = pChecked;

		// Live-apply to all CodeMirror editors
		let tmpEditorView = this.pict.views['Facto-SourceDetail-MarkdownEditor'];
		if (tmpEditorView && tmpEditorView._segmentEditors)
		{
			for (let tmpKey in tmpEditorView._segmentEditors)
			{
				let tmpEditor = tmpEditorView._segmentEditors[tmpKey];
				if (tmpEditor && tmpEditor.contentDOM)
				{
					if (pChecked)
					{
						tmpEditor.contentDOM.classList.add('cm-lineWrapping');
					}
					else
					{
						tmpEditor.contentDOM.classList.remove('cm-lineWrapping');
					}
				}
			}
		}
	}

	/**
	 * Re-segment the current document content and rebuild the editor.
	 * Called when auto-segment is toggled on or the depth changes.
	 */
	_resegmentAndRebuildEditor()
	{
		// First marshal current editor content back to the raw string
		this._marshalEditorContent();

		// Re-segment
		let tmpSegments = this._segmentMarkdownContent(this._CurrentDocContent);
		this.pict.AppData.Facto.CurrentDocumentSegments = tmpSegments;

		// Force the editor to rebuild with the new segments
		let tmpEditorView = this.pict.views['Facto-SourceDetail-MarkdownEditor'];
		if (tmpEditorView)
		{
			tmpEditorView.marshalToView();
		}
	}

	/**
	 * Segment markdown content based on the auto-segment settings.
	 *
	 * When AutoSegment is enabled, splits the content into segments
	 * at the configured heading depth.
	 *
	 * Depth 1 splits every top-level block (paragraphs, code fences,
	 * headings, etc.) into its own segment. Depth 2+ splits at the
	 * corresponding heading level, keeping everything between two
	 * headings of that level (or higher) in the same segment.
	 *
	 * @param {string} pContent - Raw markdown text
	 * @returns {Array} Array of { Content: string } segment objects
	 */
	_segmentMarkdownContent(pContent)
	{
		if (!this._AutoSegment || !pContent)
		{
			return [{ Content: pContent || '' }];
		}

		let tmpDepth = this._AutoSegmentDepth;

		if (tmpDepth === 1)
		{
			// Depth 1: every block is its own segment.
			// Split on blank lines, preserving fenced code blocks.
			let tmpLines = pContent.split('\n');
			let tmpSegments = [];
			let tmpCurrent = [];
			let tmpInFence = false;

			for (let i = 0; i < tmpLines.length; i++)
			{
				let tmpLine = tmpLines[i];

				if (/^(`{3,}|~{3,})/.test(tmpLine.trim()))
				{
					tmpInFence = !tmpInFence;
					tmpCurrent.push(tmpLine);
					continue;
				}

				if (tmpInFence)
				{
					tmpCurrent.push(tmpLine);
					continue;
				}

				if (tmpLine.trim() === '')
				{
					if (tmpCurrent.length > 0)
					{
						tmpSegments.push({ Content: tmpCurrent.join('\n') });
						tmpCurrent = [];
					}
					continue;
				}

				tmpCurrent.push(tmpLine);
			}

			if (tmpCurrent.length > 0)
			{
				tmpSegments.push({ Content: tmpCurrent.join('\n') });
			}

			return tmpSegments.length > 0 ? tmpSegments : [{ Content: '' }];
		}

		// Depth 2+: split at headings of that level or higher.
		let tmpHeadingPattern = new RegExp('^(#{1,' + tmpDepth + '})\\s');
		let tmpLines = pContent.split('\n');
		let tmpSegments = [];
		let tmpCurrent = [];

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i];

			if (tmpHeadingPattern.test(tmpLine.trim()) && tmpCurrent.length > 0)
			{
				tmpSegments.push({ Content: tmpCurrent.join('\n') });
				tmpCurrent = [];
			}

			tmpCurrent.push(tmpLine);
		}

		if (tmpCurrent.length > 0)
		{
			tmpSegments.push({ Content: tmpCurrent.join('\n') });
		}

		return tmpSegments.length > 0 ? tmpSegments : [{ Content: '' }];
	}

	/**
	 * Marshal content out of the markdown editor and back into _CurrentDocContent.
	 */
	_marshalEditorContent()
	{
		let tmpViewHash = 'Facto-SourceDetail-MarkdownEditor';
		let tmpEditorView = this.pict.views[tmpViewHash];
		if (!tmpEditorView) return;

		tmpEditorView.marshalFromView();

		let tmpSegments = this.pict.AppData.Facto.CurrentDocumentSegments || [];
		let tmpParts = [];
		for (let i = 0; i < tmpSegments.length; i++)
		{
			if (tmpSegments[i] && tmpSegments[i].Content)
			{
				tmpParts.push(tmpSegments[i].Content);
			}
		}
		this._CurrentDocContent = tmpParts.join('\n\n');
	}

	_renderMarkdownEditor()
	{
		let tmpViewHash = 'Facto-SourceDetail-MarkdownEditor';
		let tmpContainerId = 'Facto-SourceDetail-MarkdownEditor-Container';

		// If editor view already exists, re-render it with new data
		if (this.pict.views[tmpViewHash])
		{
			this.pict.views[tmpViewHash].marshalToView();
			return;
		}

		// Create a new MarkdownEditor view instance
		let tmpEditorConfig =
		{
			ViewIdentifier: tmpViewHash,
			DefaultDestinationAddress: '#' + tmpContainerId,
			TargetElementAddress: '#' + tmpContainerId,
			ContentDataAddress: 'AppData.Facto.CurrentDocumentSegments',
			ReadOnly: false,
			EnableRichPreview: true,
			ImageBaseURL: '',
			Renderables:
			[
				{
					RenderableHash: tmpViewHash + '-Renderable',
					TemplateHash: 'MarkdownEditor-Container',
					DestinationAddress: '#' + tmpContainerId,
					RenderMethod: 'replace'
				}
			]
		};

		this.pict.addView(tmpViewHash, tmpEditorConfig, libPictSectionMarkdownEditor);

		// Must explicitly trigger initialization for dynamically added views
		let tmpEditorView = this.pict.views[tmpViewHash];

		// Override onImageUpload to upload files to the server instead of inlining base64
		let tmpSelf = this;
		tmpEditorView.onImageUpload = function(pFile, pSegmentIndex, fCallback)
		{
			let tmpReader = new FileReader();
			tmpReader.onload = function()
			{
				// Strip the data:...;base64, prefix
				let tmpBase64 = tmpReader.result.split(',')[1];
				tmpSelf.pict.providers.Facto.uploadSourceFile(
					tmpSelf._CurrentIDSource,
					pFile.name,
					pFile.type,
					tmpBase64
				).then(
					function(pResponse)
					{
						if (pResponse && pResponse.Success && pResponse.URL)
						{
							fCallback(null, pResponse.URL);
						}
						else
						{
							fCallback((pResponse && pResponse.Error) || 'Upload failed');
						}
					});
			};
			tmpReader.onerror = function()
			{
				fCallback('Failed to read file');
			};
			tmpReader.readAsDataURL(pFile);
			return true;
		};

		tmpEditorView.onBeforeInitialize();
		tmpEditorView.render();
	}

	saveDocument()
	{
		if (!this._CurrentIDDoc || !this._CurrentIDSource) return;

		// Marshal from editor
		this._marshalEditorContent();

		// Check if name was changed via the input
		let tmpUpdateData = { Content: this._CurrentDocContent };
		let tmpNameInput = document.getElementById('Facto-SourceDetail-DocNameInput');
		if (tmpNameInput)
		{
			let tmpNewName = tmpNameInput.value.trim();
			if (tmpNewName && tmpNewName !== this._CurrentDocName)
			{
				tmpUpdateData.Name = tmpNewName;
				this._CurrentDocName = tmpNewName;
			}
		}

		let tmpProvider = this.pict.providers.Facto;
		tmpProvider.updateSourceDocument(this._CurrentIDSource, this._CurrentIDDoc, tmpUpdateData).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					this._setEditorStatus('Saved', 'ok');

					// Notify coordinator to refresh doc list if name changed
					if (tmpUpdateData.Name)
					{
						let tmpCoordinator = this.pict.views['Facto-Full-SourceDetail'];
						if (tmpCoordinator)
						{
							tmpCoordinator.onDocumentNameChanged(this._CurrentIDDoc, tmpUpdateData.Name);
						}
					}
				}
				else
				{
					this._setEditorStatus('Error saving: ' + ((pResponse && pResponse.Error) || 'Unknown'), 'error');
				}
			});
	}

	_setEditorStatus(pMessage, pType)
	{
		let tmpNameEl = document.getElementById('Facto-SourceDetail-DocName');
		if (tmpNameEl)
		{
			let tmpOriginal = this._CurrentDocName;
			tmpNameEl.textContent = tmpOriginal + ' \u2014 ' + pMessage;
			setTimeout(() => { if (tmpNameEl) tmpNameEl.textContent = tmpOriginal; }, 2000);
		}
	}
}

module.exports = FactoFullSourceEditorView;

module.exports.default_configuration = _ViewConfiguration;
