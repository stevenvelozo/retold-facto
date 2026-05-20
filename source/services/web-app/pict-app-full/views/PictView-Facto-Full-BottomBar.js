const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-BottomBar",

	DefaultRenderable: "Facto-Full-BottomBar-Content",
	DefaultDestinationAddress: "#Facto-Full-BottomBar-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-bottombar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0.6em 1.25em;
			background: var(--theme-color-background-secondary);
			border-top: 1px solid var(--theme-color-border-light);
			font-size: 0.78em;
			color: var(--theme-color-text-muted);
		}

		.facto-bottombar a {
			color: var(--theme-color-text-muted);
			text-decoration: none;
		}

		.facto-bottombar a:hover {
			color: var(--theme-color-text-secondary);
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-BottomBar-Template",
			Template: /*html*/`
<div class="facto-bottombar">
	<span>Retold Facto Data Warehouse</span>
	<span>Retold</span>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-BottomBar-Content",
			TemplateHash: "Facto-Full-BottomBar-Template",
			DestinationAddress: "#Facto-Full-BottomBar-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullBottomBarView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = FactoFullBottomBarView;

module.exports.default_configuration = _ViewConfiguration;
