module.exports = { FactoApplication: require('./Pict-Application-Facto.js') };

if (typeof(window) !== 'undefined')
{
	window.FactoApplication = module.exports.FactoApplication;
}
