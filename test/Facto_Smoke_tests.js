'use strict';

/**
 * Retold Facto bootstrap smoke tests — proves the application class
 * loads, registers all expected views + the Theme-Section provider,
 * and renders HTML into the application container.
 */

const libFS   = require('fs');
const libPath = require('path');

const { JSDOM } = require('jsdom');

const Chai = require('chai');
const Expect = Chai.expect;

const libPict = require('pict');
const libBundle = require('../source/services/web-app/pict-app/Pict-Facto-Bundle.js');

const _AppFull = libBundle.FactoFullApplication;

suite('Retold Facto Full — bootstrap smoke', function ()
{
	setup(function ()
	{
		let tmpDOM = new JSDOM(
			'<!doctype html><html><body>'
			+ '<div id="Facto-Full-Application-Container"></div>'
			+ '<style id="PICT-CSS"></style>'
			+ '</body></html>',
			{ url: 'http://localhost/' });
		global.window = tmpDOM.window;
		global.document = tmpDOM.window.document;
		global.localStorage = tmpDOM.window.localStorage;
	});

	test('FactoFullApplication loads as a function with a default_configuration', function ()
	{
		Expect(_AppFull).to.be.a('function');
		Expect(_AppFull.default_configuration).to.be.an('object');
	});

	test('Instantiation registers Theme-Section + Pict-Section-Modal + Layout + TopBar + BottomBar', function ()
	{
		let tmpPict = new libPict({ LogStreams: [{ streamtype: 'null', level: 'error' }] });
		let tmpInstance = new _AppFull(tmpPict, _AppFull.default_configuration);
		Expect(tmpInstance).to.exist;

		// Shell views
		Expect(tmpPict.views['Pict-Section-Modal']).to.exist;
		Expect(tmpPict.views['Facto-Full-Layout']).to.exist;
		Expect(tmpPict.views['Facto-Full-TopBar']).to.exist;
		Expect(tmpPict.views['Facto-Full-BottomBar']).to.exist;

		// A handful of content views (full inventory is 20+)
		let tmpExpectedViews =
		[
			'Facto-Full-Dashboard',
			'Facto-Full-Sources',
			'Facto-Full-Datasets',
			'Facto-Full-Records',
			'Facto-Full-Projections',
			'Facto-Full-SchemaEditor',
			'Facto-Full-Scanner'
		];
		for (let i = 0; i < tmpExpectedViews.length; i++)
		{
			Expect(tmpPict.views[tmpExpectedViews[i]],
				'expected view ' + tmpExpectedViews[i] + ' to be registered').to.exist;
		}

		// Theme-Section provider — the conversion's critical addition.
		Expect(tmpPict.providers['Theme-Section']).to.exist;
		// Facto's own provider stays.
		Expect(tmpPict.providers.Facto).to.exist;
		Expect(tmpPict.providers.FactoUI).to.exist;
	});

	test('Application class no longer exposes the retired theme methods', function ()
	{
		let tmpPict = new libPict({ LogStreams: [{ streamtype: 'null', level: 'error' }] });
		let tmpInstance = new _AppFull(tmpPict, _AppFull.default_configuration);

		// These were the homegrown theme methods we replaced with pict-section-theme.
		Expect(tmpInstance.applyTheme,    'applyTheme should be removed').to.be.undefined;
		Expect(tmpInstance.loadSavedTheme,'loadSavedTheme should be removed').to.be.undefined;
		Expect(tmpInstance.getThemeList,  'getThemeList should be removed').to.be.undefined;
	});
});

suite('Retold Facto — built bundle smoke', function ()
{
	test('main bundle exists and is non-trivial', function ()
	{
		let tmpPath = libPath.resolve(__dirname, '../source/services/web-app/web/retold-facto.js');
		let tmpStat = libFS.statSync(tmpPath);
		Expect(tmpStat.size).to.be.greaterThan(50000, 'bundle should be > 50KB');
	});

	test('bundle exposes window.FactoFullApplication', function ()
	{
		let tmpPath = libPath.resolve(__dirname, '../source/services/web-app/web/retold-facto.js');
		let tmpSrc = libFS.readFileSync(tmpPath, 'utf8');
		Expect(tmpSrc).to.include('FactoFullApplication');
	});

	test('built CSS file has no remaining legacy --facto-theme tokens (other than the alpha overlay aliases)', function ()
	{
		let tmpPath = libPath.resolve(__dirname, '../source/services/web-app/web/css/facto.css');
		let tmpSrc = libFS.readFileSync(tmpPath, 'utf8');
		// Only --facto-brand-a05..a25 + --facto-table-stripe should remain.
		let tmpFactoTokens = [...new Set((tmpSrc.match(/--facto-[a-z0-9-]+/g) || []))].sort();
		let tmpAllowed = new Set([
			'--facto-brand-a05', '--facto-brand-a08', '--facto-brand-a10',
			'--facto-brand-a12', '--facto-brand-a15', '--facto-brand-a20',
			'--facto-brand-a25', '--facto-table-stripe'
		]);
		let tmpStrays = tmpFactoTokens.filter(t => !tmpAllowed.has(t));
		Expect(tmpStrays, 'unexpected legacy --facto-* tokens: ' + tmpStrays.join(', ')).to.have.lengthOf(0);
	});

	test('facto-themes.css (the homegrown theme system) is gone', function ()
	{
		let tmpPath = libPath.resolve(__dirname, '../source/services/web-app/web/css/facto-themes.css');
		Expect(libFS.existsSync(tmpPath), 'facto-themes.css should have been retired').to.be.false;
	});
});
