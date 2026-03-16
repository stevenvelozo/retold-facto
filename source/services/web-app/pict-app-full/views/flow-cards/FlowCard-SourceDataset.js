const libPictFlowCard = require('pict-section-flow').PictFlowCard;

/**
 * FlowCard-SourceDataset
 *
 * Represents a source dataset in the projection mapping flow.
 * Output ports are dynamically generated from discovered fields.
 */
class FlowCardSourceDataset extends libPictFlowCard
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({},
			{
				Title: 'Source Dataset',
				Name: 'Source Dataset',
				Code: 'SRC',
				Category: 'Data Source',
				Description: 'Source dataset with discovered record fields',
				TitleBarColor: '#2980b9',
				Width: 200,
				Height: 100,
				Inputs: [],
				Outputs:
				[
					{ Name: 'IDRecord', Side: 'right' }
				],
				ShowTypeLabel: true,
				PortLabelsOnHover: false,
				PortLabelsOutside: true
			},
			pOptions);

		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'FlowCardSourceDataset';
	}
}

module.exports = FlowCardSourceDataset;

module.exports.default_configuration =
{
	Title: 'Source Dataset',
	Code: 'SRC',
	Category: 'Data Source',
	TitleBarColor: '#2980b9',
	Width: 200,
	Height: 100
};
