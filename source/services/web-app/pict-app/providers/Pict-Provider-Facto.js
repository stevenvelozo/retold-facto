const libPictProvider = require('pict-provider');

class FactoProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	// ================================================================
	// API Helper
	// ================================================================

	api(pMethod, pPath, pBody)
	{
		let tmpOpts = { method: pMethod, headers: {} };
		if (pBody)
		{
			tmpOpts.headers['Content-Type'] = 'application/json';
			tmpOpts.body = JSON.stringify(pBody);
		}
		return fetch(pPath, tmpOpts).then(
			function(pResponse)
			{
				return pResponse.text().then(
					function(pText)
					{
						let tmpData;
						try
						{
							tmpData = JSON.parse(pText);
						}
						catch (pParseError)
						{
							return { Error: 'HTTP ' + pResponse.status + ' (non-JSON): ' + pText.substring(0, 200) };
						}
						// Translate Restify error format {code, message} to {Error}
						if (!pResponse.ok && tmpData && tmpData.code && !tmpData.Error)
						{
							tmpData.Error = tmpData.code + ': ' + (tmpData.message || 'HTTP ' + pResponse.status);
						}
						return tmpData;
					});
			}).catch(
			function(pError)
			{
				return { Error: pError.message || 'Network error' };
			});
	}


}

// Mix in domain-specific API methods
Object.assign(FactoProvider.prototype, require('./facto-api/Facto-API-Catalog.js'));
Object.assign(FactoProvider.prototype, require('./facto-api/Facto-API-Sources.js'));
Object.assign(FactoProvider.prototype, require('./facto-api/Facto-API-Datasets.js'));
Object.assign(FactoProvider.prototype, require('./facto-api/Facto-API-Projections.js'));
Object.assign(FactoProvider.prototype, require('./facto-api/Facto-API-Scanner.js'));
Object.assign(FactoProvider.prototype, require('./facto-api/Facto-API-Connections.js'));

module.exports = FactoProvider;

module.exports.default_configuration =
{
	ProviderIdentifier: 'Facto',
	AutoInitialize: true
};
