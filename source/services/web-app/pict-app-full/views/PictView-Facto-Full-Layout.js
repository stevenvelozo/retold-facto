const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Layout",

	DefaultRenderable: "Facto-Full-Layout-Shell",
	DefaultDestinationAddress: "#Facto-Full-Application-Container",

	AutoRender: false,

	Templates:
	[
		{
			Hash: "Facto-Full-Layout-Shell-Template",
			Template: /*html*/`
<div id="Facto-Full-TopBar-Container"></div>
<div id="Facto-Full-Content-Container"></div>
<div id="Facto-Full-BottomBar-Container"></div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Layout-Shell",
			TemplateHash: "Facto-Full-Layout-Shell-Template",
			DestinationAddress: "#Facto-Full-Application-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullLayoutView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		// Render shell views
		this.pict.views['Facto-Full-TopBar'].render();
		this.pict.views['Facto-Full-BottomBar'].render();

		// Render the dashboard as default content.
		// The application will call resolve() after this, which will
		// override with the correct view if a hash route is present.
		this.pict.views['Facto-Full-Dashboard'].render();

		// Inject all view CSS into the PICT-CSS style element
		this.pict.CSSMap.injectCSS();

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}
}

module.exports = FactoFullLayoutView;

module.exports.default_configuration = _ViewConfiguration;
