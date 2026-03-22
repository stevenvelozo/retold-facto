const libPictProvider = require('pict-provider');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'FactoUI',
	AutoInitialize: true,
	AutoInitializeOrdinal: 0
};

class FactoUIProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	/**
	 * Read a form field value by element ID using pict's ContentAssignment.
	 * Replaces the (document.getElementById(id) || {}).value || '' pattern.
	 * @param {string} pID - The element ID (without the leading #)
	 * @returns {string} The element's value, or empty string if not found
	 */
	getVal(pID)
	{
		return this.pict.ContentAssignment.readContent('#' + pID) || '';
	}

	/**
	 * Reload and refresh sibling views after data-mutating operations.
	 * Handles both pict-app ('Facto-X') and pict-app-full ('Facto-Full-X') identifiers.
	 * @param {string[]} [pWhich=['sources','datasets']] - Which views to refresh
	 */
	refreshDataViews(pWhich)
	{
		let tmpLoad = pWhich || ['sources', 'datasets'];

		if (tmpLoad.indexOf('sources') > -1)
		{
			let tmpView = this.pict.views['Facto-Sources'] || this.pict.views['Facto-Full-Sources'];
			if (tmpView)
			{
				this.pict.providers.Facto.loadSources().then(() => { tmpView.refreshList(); });
			}
		}
		if (tmpLoad.indexOf('datasets') > -1)
		{
			let tmpView = this.pict.views['Facto-Datasets'] || this.pict.views['Facto-Full-Datasets'];
			if (tmpView)
			{
				this.pict.providers.Facto.loadDatasets().then(() => { tmpView.refreshList(); });
			}
		}
		if (tmpLoad.indexOf('records') > -1)
		{
			let tmpView = this.pict.views['Facto-Records'] || this.pict.views['Facto-Full-Records'];
			if (tmpView)
			{
				this.pict.providers.Facto.loadRecords().then(() => { tmpView.refreshList(); });
			}
		}
	}
}

module.exports = FactoUIProvider;

module.exports.default_configuration = _ProviderConfiguration;
