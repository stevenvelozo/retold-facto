'use strict';

// Brand wrapper — deterministic brand block emitted by `npm run brand`
// (which calls pict-section-theme-brand with the Branding entry from
// Retold-Modules-Manifest.json). Passed to Theme-Section as the `Brand`
// option so the BrandMark wordmark + --brand-color-* variables are
// wired into every themed surface.

// services/web-app/Facto-Brand.js  →  three levels up to the package.json
const tmpPackage = require('../../../package.json');

if (!tmpPackage.retold || !tmpPackage.retold.brand)
{
	throw new Error('retold-facto: package.json is missing retold.brand — '
		+ 'run `npm run brand` (which calls pict-section-theme-brand) before building');
}

module.exports = tmpPackage.retold.brand;
