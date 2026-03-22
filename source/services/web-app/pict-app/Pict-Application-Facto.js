const libPictApplication = require('pict-application');

const libPictSectionModal = require('pict-section-modal');
const libProvider = require('./providers/Pict-Provider-Facto.js');

const libViewLayout = require('./views/PictView-Facto-Layout.js');
const libViewSources = require('./views/PictView-Facto-Sources.js');
const libViewRecords = require('./views/PictView-Facto-Records.js');
const libViewDatasets = require('./views/PictView-Facto-Datasets.js');
const libViewIngest = require('./views/PictView-Facto-Ingest.js');
const libViewProjections = require('./views/PictView-Facto-Projections.js');
const libViewCatalog = require('./views/PictView-Facto-Catalog.js');
const libViewScanner = require('./views/PictView-Facto-Scanner.js');

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
		this.pict.addView('Facto-Sources', libViewSources.default_configuration, libViewSources);
		this.pict.addView('Facto-Records', libViewRecords.default_configuration, libViewRecords);
		this.pict.addView('Facto-Datasets', libViewDatasets.default_configuration, libViewDatasets);
		this.pict.addView('Facto-Ingest', libViewIngest.default_configuration, libViewIngest);
		this.pict.addView('Facto-Projections', libViewProjections.default_configuration, libViewProjections);
		this.pict.addView('Facto-Catalog', libViewCatalog.default_configuration, libViewCatalog);
		this.pict.addView('Facto-Scanner', libViewScanner.default_configuration, libViewScanner);
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

		// Render layout (which cascades child view renders)
		this.pict.views['Facto-Layout'].render();

		return fCallback();
	}
}

module.exports = FactoApplication;

module.exports.default_configuration = require('./Pict-Application-Facto-Configuration.json');
