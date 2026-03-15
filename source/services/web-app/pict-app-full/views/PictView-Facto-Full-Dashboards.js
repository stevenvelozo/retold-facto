const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Dashboards",

	DefaultRenderable: "Facto-Full-Dashboards-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	Templates:
	[
		{
			Hash: "Facto-Full-Dashboards-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Dashboards</h1>
		<p>Custom analytics dashboards and data visualizations.</p>
	</div>

	<div class="facto-empty" style="padding:4em 1em;">
		<h3 style="margin-bottom:0.5em; color:var(--facto-text-secondary);">Coming Soon</h3>
		<p style="color:var(--facto-text-tertiary); max-width:500px; margin:0 auto;">
			Custom dashboards with charts, data visualizations, and configurable widgets will be available in a future release.
			For now, use the <a onclick="pict.PictApplication.navigateTo('/Projections')" style="cursor:pointer;">Projections</a> view to query and aggregate data.
		</p>
	</div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Dashboards-Content",
			TemplateHash: "Facto-Full-Dashboards-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullDashboardsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}
}

module.exports = FactoFullDashboardsView;

module.exports.default_configuration = _ViewConfiguration;
