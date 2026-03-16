module.exports =
{
	loadStoreConnections: function()
	{
		return this.api('GET', '/facto/connections');
	},

	createStoreConnection: function(pData)
	{
		return this.api('POST', '/facto/connection', pData);
	},

	updateStoreConnection: function(pID, pData)
	{
		return this.api('PUT', `/facto/connection/${pID}`, pData);
	},

	deleteStoreConnection: function(pID)
	{
		return this.api('DELETE', `/facto/connection/${pID}`);
	},

	testStoreConnection: function(pID)
	{
		return this.api('POST', `/facto/connection/${pID}/test`);
	},

	testAdHocConnection: function(pType, pConfig)
	{
		return this.api('POST', '/facto/connection/test', { Type: pType, Config: pConfig });
	},

	loadAvailableConnectionTypes: function()
	{
		return this.api('GET', '/facto/connection/available-types');
	}
};
