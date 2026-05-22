const libPictApplication = require('pict-application');

const libPictSectionModal = require('pict-section-modal');
const libPictSectionLogin = require('pict-section-login');
const libBeaconWebAuthClient = require('ultravisor-beacon/webinterface/Pict-Beacon-WebAuth-Client.js');
const libProvider = require('./providers/Pict-Provider-Facto.js');

const libViewLayout = require('./views/PictView-Facto-Layout.js');
const libViewLogin = require('./views/PictView-Facto-Login.js');
const libViewSources = require('./views/PictView-Facto-Sources.js');
const libViewRecords = require('./views/PictView-Facto-Records.js');
const libViewDatasets = require('./views/PictView-Facto-Datasets.js');
const libViewIngest = require('./views/PictView-Facto-Ingest.js');
const libViewProjections = require('./views/PictView-Facto-Projections.js');
const libViewCatalog = require('./views/PictView-Facto-Catalog.js');
const libViewScanner = require('./views/PictView-Facto-Scanner.js');
const libViewThroughput = require('./views/PictView-Facto-Throughput.js');

class FactoApplication extends libPictApplication
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		// Register modal/notification service
		this.pict.addView('Pict-Section-Modal', libPictSectionModal.default_configuration, libPictSectionModal);

		// Register provider
		this.pict.addProvider('Facto', libProvider.default_configuration, libProvider);

		// Register views
		this.pict.addView('Facto-Layout', libViewLayout.default_configuration, libViewLayout);
		this.pict.addView('Facto-Login', libViewLogin.default_configuration, libViewLogin);
		this.pict.addView('Facto-Sources', libViewSources.default_configuration, libViewSources);
		this.pict.addView('Facto-Records', libViewRecords.default_configuration, libViewRecords);
		this.pict.addView('Facto-Datasets', libViewDatasets.default_configuration, libViewDatasets);
		this.pict.addView('Facto-Ingest', libViewIngest.default_configuration, libViewIngest);
		this.pict.addView('Facto-Projections', libViewProjections.default_configuration, libViewProjections);
		this.pict.addView('Facto-Catalog', libViewCatalog.default_configuration, libViewCatalog);
		this.pict.addView('Facto-Scanner', libViewScanner.default_configuration, libViewScanner);
		this.pict.addView('Facto-Throughput', libViewThroughput.default_configuration, libViewThroughput);

		// Beacon-side login section + client helper.  The helper hooks
		// pict-section-login's lifecycle callbacks back into this
		// application so login success / logout / session-check flow
		// through `_showLoginOverlay()` and `_hideLoginOverlay()`.  See
		// modules/fable/ultravisor-beacon/webinterface/Pict-Beacon-
		// WebAuth-Client.js for the install signature.  When facto's
		// server-side WebAuth proxy reports the UV is in promiscuous
		// mode, the gate stays armed but invisible.
		this._WebAuthClient = libBeaconWebAuthClient.install(this.pict,
			{
				Section:              libPictSectionLogin,
				AuthStateAddress:     'AppData.Facto.Auth',
				LoginRoute:           'Facto-Login',
				HomeRoute:            'Facto-Layout',
				StatusURL:            '/status',
				LoginEndpoint:        '/1.0/Authenticate',
				LogoutEndpoint:       '/1.0/Deauthenticate',
				CheckSessionEndpoint: '/1.0/CheckSession',
				OnAfterLogin:         () => this._hideLoginOverlay(),
				OnAfterLogout:        () => this._showLoginOverlay(),
				OnSessionChecked:     (pSess) => { if (!(pSess && pSess.LoggedIn)) { this._showLoginOverlay(); } else { this._hideLoginOverlay(); } }
			});
	}

	onAfterInitializeAsync(fCallback)
	{
		// Centralized application state
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
			ScannerPaths: [],
			ScannerDatasets: []
		};

		// Make pict available for inline onclick handlers
		window.pict = this.pict;

		// Ensure the login overlay mount point exists in the DOM
		// before the section view tries to render into it.  This is
		// a one-time append so re-renders of the wrapper view don't
		// stack additional overlays.
		this._ensureLoginOverlayMount();

		// Render layout (which cascades child view renders).  We render
		// the layout regardless of auth state; the overlay sits on top
		// of it (z-index 9999) so an unauthenticated user simply can't
		// interact with the underlying UI.
		this.pict.views['Facto-Layout'].render();

		// Boot gate: fetch /status to discover whether UV is running in
		// authenticated mode.  In promiscuous mode the overlay stays
		// hidden and the UI works as before.  In authenticated mode the
		// pict-section-login's CheckSessionOnLoad fires (its default is
		// true); the helper's OnSessionChecked hook then shows/hides
		// the overlay based on whether the user's cookie is still good.
		this._WebAuthClient.loadAuthStatus((pStatusErr) =>
			{
				if (pStatusErr)
				{
					this.pict.log.warn('Facto: /status fetch failed during boot: ' + pStatusErr.message);
				}
				let tmpAuth = (this.pict.AppData.Facto && this.pict.AppData.Facto.Auth) || {};
				if (tmpAuth.Mode === 'authenticated')
				{
					// Show overlay; the section's auto-CheckSession will
					// hide it back if there's a valid cookie.
					this._showLoginOverlay();
					this.pict.views['Facto-Login'].render();
				}
				return fCallback();
			});
	}

	/**
	 * Append `<div id="Facto-Login-Overlay">` to <body> if it isn't
	 * already there.  The Facto-Login wrapper view targets this element
	 * via its DefaultDestinationAddress, so it must exist before the
	 * wrapper's first render() call.
	 */
	_ensureLoginOverlayMount()
	{
		if (typeof document === 'undefined') { return; }
		if (document.getElementById('Facto-Login-Overlay')) { return; }
		let tmpDiv = document.createElement('div');
		tmpDiv.id = 'Facto-Login-Overlay';
		document.body.appendChild(tmpDiv);
	}

	_showLoginOverlay()
	{
		let tmpEl = (typeof document !== 'undefined') && document.getElementById('Facto-Login-Overlay');
		if (tmpEl) { tmpEl.classList.add('is-active'); }
	}

	_hideLoginOverlay()
	{
		let tmpEl = (typeof document !== 'undefined') && document.getElementById('Facto-Login-Overlay');
		if (tmpEl) { tmpEl.classList.remove('is-active'); }
	}
}

module.exports = FactoApplication;

module.exports.default_configuration = require('./Pict-Application-Facto-Configuration.json');
