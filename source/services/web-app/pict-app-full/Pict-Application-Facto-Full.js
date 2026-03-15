const libPictApplication = require('pict-application');
const libPictRouter = require('pict-router');

const THEME_LIST =
[
	{ Key: 'facto-dark', Label: 'Facto Dark', Colors: ['#12151e', '#4a90d9', '#28a745', '#dc3545', '#6366f1'] },
	{ Key: 'facto-light', Label: 'Facto Light', Colors: ['#f5f6f8', '#3b82f6', '#22c55e', '#ef4444', '#6366f1'] },
	{ Key: 'midnight-blue', Label: 'Midnight Blue', Colors: ['#0a0e1a', '#3b82f6', '#10b981', '#f87171', '#60a5fa'] },
	{ Key: 'slate', Label: 'Slate', Colors: ['#1e2228', '#6b8aae', '#5ea37a', '#c85a5a', '#82a0c4'] },
	{ Key: 'warm-earth', Label: 'Warm Earth', Colors: ['#1a1610', '#c4956a', '#8a9a5a', '#b04050', '#4a9090'] },
	{ Key: 'high-contrast', Label: 'High Contrast', Colors: ['#000000', '#58a6ff', '#3fb950', '#f85149', '#d29922'] }
];

// Shared provider (same API layer as accordion app)
const libProvider = require('../pict-app/providers/Pict-Provider-Facto.js');

// Shell views
const libViewLayout = require('./views/PictView-Facto-Full-Layout.js');
const libViewTopBar = require('./views/PictView-Facto-Full-TopBar.js');
const libViewBottomBar = require('./views/PictView-Facto-Full-BottomBar.js');

// Content views
const libViewDashboard = require('./views/PictView-Facto-Full-Dashboard.js');
const libViewSourceResearch = require('./views/PictView-Facto-Full-SourceResearch.js');
const libViewIngestJobs = require('./views/PictView-Facto-Full-IngestJobs.js');
const libViewSources = require('./views/PictView-Facto-Full-Sources.js');
const libViewDatasets = require('./views/PictView-Facto-Full-Datasets.js');
const libViewRecords = require('./views/PictView-Facto-Full-Records.js');
const libViewProjections = require('./views/PictView-Facto-Full-Projections.js');
const libViewDashboards = require('./views/PictView-Facto-Full-Dashboards.js');

class FactoFullApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Skip premature route resolution during addRoute(); the Layout view
		// calls resolve() explicitly after the DOM is ready.
		this.pict.settings.RouterSkipRouteResolveOnAdd = true;

		// Register the shared API provider
		this.pict.addProvider('Facto', libProvider.default_configuration, libProvider);

		// Register router
		this.pict.addProvider('PictRouter',
			require('./providers/PictRouter-Facto-Configuration.json'), libPictRouter);

		// Shell views
		this.pict.addView('Facto-Full-Layout', libViewLayout.default_configuration, libViewLayout);
		this.pict.addView('Facto-Full-TopBar', libViewTopBar.default_configuration, libViewTopBar);
		this.pict.addView('Facto-Full-BottomBar', libViewBottomBar.default_configuration, libViewBottomBar);

		// Content views
		this.pict.addView('Facto-Full-Dashboard', libViewDashboard.default_configuration, libViewDashboard);
		this.pict.addView('Facto-Full-SourceResearch', libViewSourceResearch.default_configuration, libViewSourceResearch);
		this.pict.addView('Facto-Full-IngestJobs', libViewIngestJobs.default_configuration, libViewIngestJobs);
		this.pict.addView('Facto-Full-Sources', libViewSources.default_configuration, libViewSources);
		this.pict.addView('Facto-Full-Datasets', libViewDatasets.default_configuration, libViewDatasets);
		this.pict.addView('Facto-Full-Records', libViewRecords.default_configuration, libViewRecords);
		this.pict.addView('Facto-Full-Projections', libViewProjections.default_configuration, libViewProjections);
		this.pict.addView('Facto-Full-Dashboards', libViewDashboards.default_configuration, libViewDashboards);
	}

	onAfterInitializeAsync(fCallback)
	{
		// Apply saved theme before first render
		this.loadSavedTheme();

		// Initialize application state
		this.pict.AppData.Facto =
		{
			CatalogEntries: [],
			Sources: [],
			Datasets: [],
			Records: [],
			IngestJobs: [],
			SelectedSource: null,
			SelectedDataset: null,
			RecordPage: 0,
			RecordPageSize: 50,
			CurrentTheme: 'facto-dark'
		};

		// Expose pict globally for inline onclick handlers
		window.pict = this.pict;

		// Render the layout shell — this cascades into TopBar, BottomBar, Dashboard
		this.pict.views['Facto-Full-Layout'].render();

		return super.onAfterInitializeAsync(fCallback);
	}

	navigateTo(pRoute)
	{
		this.pict.providers.PictRouter.navigate(pRoute);
	}

	showView(pViewIdentifier)
	{
		if (pViewIdentifier in this.pict.views)
		{
			this.pict.views[pViewIdentifier].render();
		}
		else
		{
			this.pict.log.warn(`View [${pViewIdentifier}] not found; falling back to dashboard.`);
			this.pict.views['Facto-Full-Dashboard'].render();
		}
	}

	// --- Theme ---
	applyTheme(pThemeKey)
	{
		let tmpThemeKey = pThemeKey || 'facto-dark';

		if (tmpThemeKey === 'facto-dark')
		{
			delete document.body.dataset.theme;
		}
		else
		{
			document.body.dataset.theme = tmpThemeKey;
		}

		localStorage.setItem('facto-theme', tmpThemeKey);

		if (this.pict.AppData.Facto)
		{
			this.pict.AppData.Facto.CurrentTheme = tmpThemeKey;
		}
	}

	loadSavedTheme()
	{
		let tmpSavedTheme = localStorage.getItem('facto-theme') || 'facto-dark';
		this.applyTheme(tmpSavedTheme);
	}

	getThemeList()
	{
		return THEME_LIST;
	}
}

module.exports = FactoFullApplication;

module.exports.default_configuration = require('./Pict-Application-Facto-Full-Configuration.json');
