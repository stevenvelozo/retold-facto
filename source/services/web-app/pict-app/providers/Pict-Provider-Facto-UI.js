const libPictProvider = require('pict-provider');

const _ProviderConfiguration =
{
	ProviderIdentifier: 'FactoUI',
	AutoInitialize: true,
	AutoInitializeOrdinal: 0,

	CSS: /*css*/`
		/* Toast notifications */
		.facto-toast-container {
			position: fixed;
			top: 1em;
			right: 1em;
			z-index: 10000;
			display: flex;
			flex-direction: column;
			gap: 0.5em;
			pointer-events: none;
		}
		.facto-toast {
			pointer-events: auto;
			min-width: 260px;
			max-width: 420px;
			padding: 0.7em 1em;
			border-radius: 6px;
			font-size: 0.85em;
			font-weight: 500;
			box-shadow: 0 4px 16px rgba(0,0,0,0.25);
			animation: facto-toast-in 0.25s ease-out;
			cursor: pointer;
			word-break: break-word;
		}
		.facto-toast.facto-toast-out {
			animation: facto-toast-out 0.2s ease-in forwards;
		}
		.facto-toast-success {
			background: var(--facto-success-bg, #22543d);
			color: #e6ffed;
			border-left: 4px solid #38a169;
		}
		.facto-toast-error {
			background: var(--facto-error-bg, #742a2a);
			color: #ffe0e0;
			border-left: 4px solid #e53e3e;
		}
		.facto-toast-info {
			background: var(--facto-info-bg, #1a365d);
			color: #e0edff;
			border-left: 4px solid #3182ce;
		}
		.facto-toast-warn {
			background: var(--facto-warn-bg, #744210);
			color: #fff3d0;
			border-left: 4px solid #d69e2e;
		}
		@keyframes facto-toast-in {
			from { opacity: 0; transform: translateX(40px); }
			to   { opacity: 1; transform: translateX(0); }
		}
		@keyframes facto-toast-out {
			from { opacity: 1; transform: translateX(0); }
			to   { opacity: 0; transform: translateX(40px); }
		}
	`
};

class FactoUIProvider extends libPictProvider
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onInitialize()
	{
		// Register toast CSS with Pict's CSS system
		if (this.pict && this.pict.CSSMap && this.options.CSS)
		{
			this.pict.CSSMap.addCSS('FactoUI-Toast', this.options.CSS, 500, 'FactoUI');
		}
	}

	/**
	 * Show an in-DOM toast notification.
	 * @param {string} pMessage - The message to display
	 * @param {string} [pType='info'] - 'success', 'error', 'warn', or 'info'
	 * @param {number} [pDuration=4000] - Auto-dismiss time in ms (0 = manual dismiss)
	 */
	showToast(pMessage, pType, pDuration)
	{
		let tmpType = pType || 'info';
		let tmpDuration = (typeof pDuration === 'number') ? pDuration : 4000;

		let tmpContainer = document.getElementById('Facto-Toast-Container');
		if (!tmpContainer)
		{
			tmpContainer = document.createElement('div');
			tmpContainer.id = 'Facto-Toast-Container';
			tmpContainer.className = 'facto-toast-container';
			document.body.appendChild(tmpContainer);
		}

		let tmpToast = document.createElement('div');
		tmpToast.className = `facto-toast facto-toast-${tmpType}`;
		tmpToast.textContent = pMessage;

		let tmpDismiss = () =>
		{
			tmpToast.classList.add('facto-toast-out');
			setTimeout(() => { if (tmpToast.parentNode) tmpToast.parentNode.removeChild(tmpToast); }, 250);
		};

		tmpToast.addEventListener('click', tmpDismiss);
		tmpContainer.appendChild(tmpToast);

		if (tmpDuration > 0)
		{
			setTimeout(tmpDismiss, tmpDuration);
		}
	}
}

module.exports = FactoUIProvider;

module.exports.default_configuration = _ProviderConfiguration;
