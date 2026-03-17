const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-TopBar",

	DefaultRenderable: "Facto-Full-TopBar-Content",
	DefaultDestinationAddress: "#Facto-Full-TopBar-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-topbar {
			display: flex;
			align-items: center;
			height: 48px;
			background: var(--facto-topbar-bg);
			padding: 0 1.25em;
			border-bottom: 1px solid var(--facto-border-subtle);
			position: sticky;
			top: 0;
			z-index: 100;
		}

		.facto-topbar-brand {
			font-size: 1.05em;
			font-weight: 700;
			color: var(--facto-topbar-hover);
			cursor: pointer;
			margin-right: 2em;
			white-space: nowrap;
			text-decoration: none;
		}

		.facto-topbar-brand:hover {
			color: var(--facto-topbar-active);
		}

		.facto-topbar-nav {
			display: flex;
			align-items: center;
			gap: 0.15em;
			flex: 1;
			overflow-x: auto;
		}

		.facto-topbar-nav a {
			padding: 0.35em 0.7em;
			font-size: 0.85em;
			font-weight: 500;
			color: var(--facto-topbar-text);
			text-decoration: none;
			border-radius: 5px;
			white-space: nowrap;
			cursor: pointer;
			transition: color 0.12s, background 0.12s;
		}

		.facto-topbar-nav a:hover {
			color: var(--facto-topbar-hover);
			background: rgba(255,255,255,0.06);
		}

		.facto-topbar-nav a.active {
			color: var(--facto-topbar-active);
			background: rgba(255,255,255,0.08);
		}

		.facto-topbar-right {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-left: auto;
		}

		.facto-topbar-simple-link {
			font-size: 0.75em;
			color: var(--facto-topbar-text);
			text-decoration: none;
			opacity: 0.6;
		}

		.facto-topbar-simple-link:hover {
			opacity: 1;
		}

		/* Settings gear */
		.facto-settings-wrap {
			position: relative;
		}

		.facto-settings-gear {
			background: none;
			border: none;
			padding: 0.3em;
			cursor: pointer;
			color: var(--facto-topbar-text);
			display: flex;
			align-items: center;
			border-radius: 4px;
			transition: color 0.12s;
		}

		.facto-settings-gear:hover {
			color: var(--facto-topbar-hover);
		}

		.facto-settings-gear svg {
			width: 20px;
			height: 20px;
			fill: currentColor;
		}

		/* Settings panel */
		.facto-settings-panel {
			position: absolute;
			top: 100%;
			right: 0;
			margin-top: 0.5em;
			background: var(--facto-bg-surface);
			border: 1px solid var(--facto-border);
			border-radius: 8px;
			padding: 1em;
			min-width: 220px;
			box-shadow: var(--facto-shadow-heavy);
			z-index: 200;
		}

		.facto-settings-panel-title {
			font-size: 0.8em;
			font-weight: 600;
			color: var(--facto-text-secondary);
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 0.75em;
		}

		.facto-theme-grid {
			display: flex;
			flex-direction: column;
			gap: 0.4em;
		}

		.facto-theme-swatch {
			display: flex;
			align-items: center;
			gap: 0.6em;
			padding: 0.4em 0.5em;
			border-radius: 5px;
			cursor: pointer;
			transition: background 0.12s;
		}

		.facto-theme-swatch:hover {
			background: var(--facto-bg-elevated);
		}

		.facto-theme-swatch.active {
			background: var(--facto-bg-elevated);
			outline: 2px solid var(--facto-brand);
			outline-offset: -2px;
		}

		.facto-theme-swatch-colors {
			display: flex;
			gap: 3px;
		}

		.facto-theme-swatch-dot {
			width: 14px;
			height: 14px;
			border-radius: 50%;
			border: 1px solid rgba(255,255,255,0.1);
		}

		.facto-theme-swatch-label {
			font-size: 0.82em;
			color: var(--facto-text);
		}

		@media (max-width: 900px) {
			.facto-topbar-nav {
				display: none;
			}
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-TopBar-Template",
			Template: /*html*/`
<div class="facto-topbar">
	<a class="facto-topbar-brand" onclick="{~P~}.PictApplication.navigateTo('/Home')">Retold Facto</a>

	<div class="facto-topbar-nav" id="Facto-Full-TopBar-Nav">
		<a data-route="Scanner" onclick="{~P~}.PictApplication.navigateTo('/Scanner')">Scanner</a>
		<a data-route="SourceResearch" onclick="{~P~}.PictApplication.navigateTo('/SourceResearch')">Source Research</a>
		<a data-route="IngestJobs" onclick="{~P~}.PictApplication.navigateTo('/IngestJobs')">Ingestion Jobs</a>
		<a data-route="Sources" onclick="{~P~}.PictApplication.navigateTo('/Sources')">Sources</a>
		<a data-route="Datasets" onclick="{~P~}.PictApplication.navigateTo('/Datasets')">Data Sets</a>
		<a data-route="Records" onclick="{~P~}.PictApplication.navigateTo('/Records')">Records</a>
		<a data-route="Projections" onclick="{~P~}.PictApplication.navigateTo('/Projections')">Projections</a>
		<a data-route="Connections" onclick="{~P~}.PictApplication.navigateTo('/Connections')">Connections</a>
		<a data-route="Dashboards" onclick="{~P~}.PictApplication.navigateTo('/Dashboards')">Dashboards</a>
	</div>

	<div class="facto-topbar-right">
		<a class="facto-topbar-simple-link" href="/simple/">Simple View</a>

		<div class="facto-settings-wrap">
			<button class="facto-settings-gear" onclick="{~P~}.views['Facto-Full-TopBar'].toggleThemePanel()">
				<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg>
			</button>

			<div class="facto-settings-panel" id="Facto-Full-Settings-Panel" style="display:none;">
				<div class="facto-settings-panel-title">Theme</div>
				<div class="facto-theme-grid" id="Facto-Full-Settings-ThemeGrid"></div>
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
			RenderableHash: "Facto-Full-TopBar-Content",
			TemplateHash: "Facto-Full-TopBar-Template",
			DestinationAddress: "#Facto-Full-TopBar-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullTopBarView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
		this._themePanelOpen = false;
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this._renderThemeGrid();

		// Close theme panel on outside click
		document.addEventListener('click',
			(pEvent) =>
			{
				if (!this._themePanelOpen) return;
				let tmpWrap = pEvent.target.closest('.facto-settings-wrap');
				if (!tmpWrap)
				{
					this._themePanelOpen = false;
					let tmpPanel = document.getElementById('Facto-Full-Settings-Panel');
					if (tmpPanel) tmpPanel.style.display = 'none';
				}
			});

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	toggleThemePanel()
	{
		let tmpPanel = document.getElementById('Facto-Full-Settings-Panel');
		if (!tmpPanel) return;

		this._themePanelOpen = !this._themePanelOpen;
		tmpPanel.style.display = this._themePanelOpen ? 'block' : 'none';
	}

	selectTheme(pThemeKey)
	{
		this.pict.PictApplication.applyTheme(pThemeKey);
		this._renderThemeGrid();
		this._themePanelOpen = false;
		let tmpPanel = document.getElementById('Facto-Full-Settings-Panel');
		if (tmpPanel) tmpPanel.style.display = 'none';
	}

	highlightRoute(pRoute)
	{
		let tmpNav = document.getElementById('Facto-Full-TopBar-Nav');
		if (!tmpNav) return;

		let tmpLinks = tmpNav.querySelectorAll('a[data-route]');
		for (let i = 0; i < tmpLinks.length; i++)
		{
			if (tmpLinks[i].getAttribute('data-route') === pRoute)
			{
				tmpLinks[i].classList.add('active');
			}
			else
			{
				tmpLinks[i].classList.remove('active');
			}
		}
	}

	_renderThemeGrid()
	{
		let tmpGrid = document.getElementById('Facto-Full-Settings-ThemeGrid');
		if (!tmpGrid) return;

		let tmpThemes = this.pict.PictApplication.getThemeList();
		let tmpCurrentTheme = this.pict.AppData.Facto.CurrentTheme || 'facto-dark';

		let tmpHtml = '';
		for (let i = 0; i < tmpThemes.length; i++)
		{
			let tmpTheme = tmpThemes[i];
			let tmpActiveClass = (tmpTheme.Key === tmpCurrentTheme) ? ' active' : '';
			tmpHtml += '<div class="facto-theme-swatch' + tmpActiveClass + '" onclick="pict.views[\'Facto-Full-TopBar\'].selectTheme(\'' + tmpTheme.Key + '\')">';
			tmpHtml += '<div class="facto-theme-swatch-colors">';
			for (let c = 0; c < tmpTheme.Colors.length; c++)
			{
				tmpHtml += '<div class="facto-theme-swatch-dot" style="background:' + tmpTheme.Colors[c] + ';"></div>';
			}
			tmpHtml += '</div>';
			tmpHtml += '<div class="facto-theme-swatch-label">' + tmpTheme.Label + '</div>';
			tmpHtml += '</div>';
		}
		tmpGrid.innerHTML = tmpHtml;
	}
}

module.exports = FactoFullTopBarView;

module.exports.default_configuration = _ViewConfiguration;
