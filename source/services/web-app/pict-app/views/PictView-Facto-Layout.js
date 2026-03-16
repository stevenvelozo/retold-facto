const libPictView = require('pict-view');

class FactoLayoutView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		// Render all section views into their containers
		this.pict.views['Facto-Scanner'].render();
		this.pict.views['Facto-Catalog'].render();
		this.pict.views['Facto-Sources'].render();
		this.pict.views['Facto-Datasets'].render();
		this.pict.views['Facto-Records'].render();
		this.pict.views['Facto-Ingest'].render();
		this.pict.views['Facto-Projections'].render();

		this.pict.CSSMap.injectCSS();
	}

	toggleSection(pSectionId)
	{
		let tmpCard = document.getElementById(pSectionId);
		if (!tmpCard) return;
		tmpCard.classList.toggle('open');
	}

	expandAllSections()
	{
		let tmpCards = document.querySelectorAll('.accordion-card');
		for (let i = 0; i < tmpCards.length; i++)
		{
			tmpCards[i].classList.add('open');
		}
	}

	collapseAllSections()
	{
		let tmpCards = document.querySelectorAll('.accordion-card');
		for (let i = 0; i < tmpCards.length; i++)
		{
			tmpCards[i].classList.remove('open');
		}
	}
}

module.exports = FactoLayoutView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Layout',
	DefaultRenderable: 'Facto-Layout',
	DefaultDestinationAddress: '#Facto-Application-Container',
	CSS: /*css*/`
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; padding: 20px; }
h1 { margin-bottom: 20px; color: #1a1a1a; }
h2 { margin-bottom: 12px; color: #444; font-size: 1.2em; border-bottom: 2px solid #ddd; padding-bottom: 6px; }

.section { background: #fff; border-radius: 8px; padding: 20px; margin-bottom: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

/* Accordion layout */
.accordion-row { display: flex; gap: 0; margin-bottom: 16px; align-items: stretch; }
.accordion-number {
	flex: 0 0 48px; display: flex; align-items: flex-start; justify-content: center;
	padding-top: 16px; font-size: 1.6em; font-weight: 700; color: #4a90d9;
	user-select: none;
}
.accordion-card {
	flex: 1; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
	overflow: hidden; min-width: 0;
}
.accordion-header {
	display: flex; align-items: center; padding: 14px 20px; cursor: pointer;
	user-select: none; gap: 12px; transition: background 0.15s; line-height: 1.4;
}
.accordion-header:hover { background: #fafafa; }
.accordion-title { font-weight: 600; color: #333; font-size: 1.05em; white-space: nowrap; }
.accordion-preview { flex: 1; font-style: italic; color: #888; font-size: 0.9em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
.accordion-toggle {
	flex: 0 0 20px; display: flex; align-items: center; justify-content: center;
	border-radius: 4px; transition: background 0.15s, transform 0.25s; font-size: 0.7em; color: #888;
}
.accordion-header:hover .accordion-toggle { background: #eee; color: #555; }
.accordion-card.open .accordion-toggle { transform: rotate(180deg); }
.accordion-body { padding: 0 20px 20px; display: none; }
.accordion-card.open .accordion-body { display: block; }
.accordion-card.open .accordion-header { border-bottom: 1px solid #eee; }
.accordion-card.open .accordion-preview { display: none; }

.accordion-controls {
	display: flex; gap: 8px; margin-bottom: 12px; justify-content: flex-end;
}
.accordion-controls button {
	padding: 4px 10px; font-size: 0.82em; font-weight: 500; background: none;
	border: 1px solid #ccc; border-radius: 4px; color: #666; cursor: pointer; margin: 0;
}
.accordion-controls button:hover { background: #f0f0f0; border-color: #aaa; color: #333; }

label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 0.9em; }
input[type="text"], input[type="password"], input[type="number"] {
	width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px;
	font-size: 0.95em; margin-bottom: 10px;
}
input[type="text"]:focus, input[type="password"]:focus, input[type="number"]:focus {
	outline: none; border-color: #4a90d9;
}

button {
	padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;
	font-size: 0.9em; font-weight: 600; margin-right: 8px; margin-bottom: 8px;
}
button.primary { background: #4a90d9; color: #fff; }
button.primary:hover { background: #357abd; }
button.secondary { background: #6c757d; color: #fff; }
button.secondary:hover { background: #5a6268; }
button.danger { background: #dc3545; color: #fff; }
button.danger:hover { background: #c82333; }
button.success { background: #28a745; color: #fff; }
button.success:hover { background: #218838; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.status { padding: 8px 12px; border-radius: 4px; margin-top: 10px; font-size: 0.9em; }
.status.ok { background: #d4edda; color: #155724; }
.status.error { background: #f8d7da; color: #721c24; }
.status.info { background: #d1ecf1; color: #0c5460; }
.status.warn { background: #fff3cd; color: #856404; }

.inline-group { display: flex; gap: 8px; align-items: flex-end; margin-bottom: 10px; }
.inline-group > div { flex: 1; }

a { color: #4a90d9; }

select { background: #fff; width: 100%; padding: 8px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95em; margin-bottom: 10px; }

table { width: 100%; border-collapse: collapse; font-size: 0.9em; }
th { text-align: left; font-weight: 600; padding: 8px; border-bottom: 2px solid #ddd; color: #555; }
td { padding: 8px; border-bottom: 1px solid #eee; }
tr:hover { background: #fafafa; }

.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; font-weight: 600; }
.badge-raw { background: #d1ecf1; color: #0c5460; }
.badge-compositional { background: #d4edda; color: #155724; }
.badge-projection { background: #fff3cd; color: #856404; }
.badge-derived { background: #e2d5f1; color: #4a2d73; }

.certainty-bar { display: inline-block; width: 60px; height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; vertical-align: middle; }
.certainty-fill { height: 100%; border-radius: 4px; }
.certainty-low { background: #dc3545; }
.certainty-mid { background: #ffc107; }
.certainty-high { background: #28a745; }
`,
	Templates:
	[
		{
			Hash: 'Facto-Layout',
			Template: /*html*/`
<h1>Retold Facto</h1>
<p style="color:#666; margin-bottom:20px; font-size:0.95em;">Data Warehouse &amp; Knowledge Graph Storage</p>

<!-- Expand / Collapse All -->
<div class="accordion-controls">
	<button onclick="pict.views['Facto-Layout'].expandAllSections()">Expand All</button>
	<button onclick="pict.views['Facto-Layout'].collapseAllSections()">Collapse All</button>
</div>

<!-- Section containers -->
<div id="Facto-Section-Scanner"></div>
<div id="Facto-Section-Catalog"></div>
<div id="Facto-Section-Sources"></div>
<div id="Facto-Section-Datasets"></div>
<div id="Facto-Section-Records"></div>
<div id="Facto-Section-Ingest"></div>
<div id="Facto-Section-Projections"></div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Layout',
			TemplateHash: 'Facto-Layout',
			DestinationAddress: '#Facto-Application-Container'
		}
	]
};
