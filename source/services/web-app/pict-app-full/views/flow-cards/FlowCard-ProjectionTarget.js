const libPictFlowCard = require('pict-section-flow').PictFlowCard;

/**
 * FlowCard-ProjectionTarget
 *
 * Represents the projection target table in the mapping flow.
 * Input ports are dynamically generated from schema columns.
 */
class FlowCardProjectionTarget extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({},
			{
				Title: 'Projection Target',
				Name: 'Projection Target',
				Code: 'TGT',
				Category: 'Data Target',
				Description: 'Projection target table with schema columns',
				TitleBarColor: '#27ae60',
				Width: 200,
				Height: 100,
				Inputs:
				[
					{ Name: 'ID', Side: 'left' }
				],
				Outputs: [],
				ShowTypeLabel: true,
				PortLabelsOnHover: false,
				PortLabelsOutside: true
			},
			pOptions);

		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'FlowCardProjectionTarget';
	}
}

module.exports = FlowCardProjectionTarget;

module.exports.default_configuration =
{
	Title: 'Projection Target',
	Code: 'TGT',
	Category: 'Data Target',
	TitleBarColor: '#27ae60',
	Width: 200,
	Height: 100
};
