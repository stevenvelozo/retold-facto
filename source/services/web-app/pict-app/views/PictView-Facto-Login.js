/**
 * PictView-Facto-Login — full-viewport login overlay
 *
 * Different shape from the databeacon login view because facto's
 * layout is accordion-based (no panel-toggle pattern) and doesn't have
 * a routed content panel we can slot into.  Instead this wrapper
 * renders a full-viewport overlay (`position:fixed; inset:0`) that
 * stacks on top of the accordion layout when the boot gate requires
 * login.  Hidden by default; the application's boot gate flips
 * `display:block` when the user needs to authenticate.
 *
 * Inside the overlay is `#Pict-Login-Container` — the same mount
 * point name pict-section-login defaults to, so the section's render()
 * targets it without further config.
 */

const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: 'Facto-Login',
	AutoInitialize: true,
	AutoRender: false,

	DefaultRenderable: 'Facto-Login-Overlay',
	DefaultDestinationAddress: '#Facto-Login-Overlay',

	Templates:
	[
		{
			Hash: 'Facto-Login-Overlay-Template',
			Template: /*html*/`
<div class="facto-login-overlay-card">
	<div id="Pict-Login-Container"></div>
</div>`
		}
	],

	Renderables:
	[
		{
			RenderableHash: 'Facto-Login-Overlay',
			TemplateHash: 'Facto-Login-Overlay-Template',
			ContentDestinationAddress: '#Facto-Login-Overlay',
			RenderMethod: 'replace'
		}
	],

	CSS: /*css*/`
		#Facto-Login-Overlay
		{
			position: fixed;
			inset: 0;
			z-index: 9999;
			display: none;
			background: rgba(15, 19, 26, 0.92);
			align-items: center;
			justify-content: center;
			padding: 24px;
			overflow: auto;
		}
		#Facto-Login-Overlay.is-active
		{
			display: flex;
		}
		.facto-login-overlay-card
		{
			width: 100%;
			max-width: 420px;
		}
	`
};

class FactoLoginView extends libPictView
{
	onAfterRender(pRenderable, pAddress, pRecord, pContent)
	{
		// Render pict-section-login into the mount point we just
		// painted.  The section's DefaultDestinationAddress is the
		// same `#Pict-Login-Container`, so a plain render() routes.
		let tmpInner = this.pict && this.pict.views && this.pict.views['Pict-Section-Login'];
		if (tmpInner) { tmpInner.render(); }
		this.pict.CSSMap.injectCSS();
		return super.onAfterRender
			? super.onAfterRender(pRenderable, pAddress, pRecord, pContent)
			: undefined;
	}
}

module.exports = FactoLoginView;
module.exports.default_configuration = _ViewConfiguration;
