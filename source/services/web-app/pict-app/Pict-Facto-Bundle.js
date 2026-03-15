module.exports =
{
	FactoApplication: require('./Pict-Application-Facto.js'),
	FactoFullApplication: require('../pict-app-full/Pict-Application-Facto-Full.js')
};

if (typeof(window) !== 'undefined')
{
	window.FactoApplication = module.exports.FactoApplication;
	window.FactoFullApplication = module.exports.FactoFullApplication;
}
