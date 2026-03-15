const libPictView = require('pict-view');

const _ViewConfiguration =
{
	ViewIdentifier: "Facto-Full-Records",

	DefaultRenderable: "Facto-Full-Records-Content",
	DefaultDestinationAddress: "#Facto-Full-Content-Container",

	AutoRender: false,

	CSS: /*css*/`
		.facto-records-pager {
			display: flex;
			align-items: center;
			gap: 0.75em;
			margin-bottom: 1em;
		}
		.facto-records-pager span {
			font-size: 0.85em;
			color: var(--facto-text-secondary);
		}
		.facto-record-data {
			max-width: 400px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-family: 'SF Mono', Consolas, monospace;
			font-size: 0.8em;
			color: var(--facto-text-secondary);
		}
	`,

	Templates:
	[
		{
			Hash: "Facto-Full-Records-Template",
			Template: /*html*/`
<div class="facto-content">
	<div class="facto-content-header">
		<h1>Records</h1>
		<p>Browse ingested records across all datasets.</p>
	</div>

	<div class="facto-records-pager">
		<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Records'].prevPage()">Previous</button>
		<span id="Facto-Full-Records-PageInfo">Page 1</span>
		<button class="facto-btn facto-btn-secondary facto-btn-small" onclick="{~P~}.views['Facto-Full-Records'].nextPage()">Next</button>
	</div>

	<div id="Facto-Full-Records-List"></div>
</div>
`
		}
	],

	Renderables:
	[
		{
			RenderableHash: "Facto-Full-Records-Content",
			TemplateHash: "Facto-Full-Records-Template",
			DestinationAddress: "#Facto-Full-Content-Container",
			RenderMethod: "replace"
		}
	]
};

class FactoFullRecordsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent)
	{
		this.pict.providers.Facto.loadRecords(this.pict.AppData.Facto.RecordPage).then(
			() => { this.refreshList(); });

		return super.onAfterRender(pRenderable, pRenderDestinationAddress, pRecord, pContent);
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('Facto-Full-Records-List');
		if (!tmpContainer) return;

		let tmpRecords = this.pict.AppData.Facto.Records;
		let tmpPageInfo = document.getElementById('Facto-Full-Records-PageInfo');
		if (tmpPageInfo) tmpPageInfo.textContent = 'Page ' + ((this.pict.AppData.Facto.RecordPage || 0) + 1);

		if (!tmpRecords || tmpRecords.length === 0)
		{
			tmpContainer.innerHTML = '<div class="facto-empty">No records found. Ingest data via Source Research or the Ingest API.</div>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Dataset</th><th>Source</th><th>GUID</th><th>Data</th><th></th></tr></thead><tbody>';
		for (let i = 0; i < tmpRecords.length; i++)
		{
			let tmpRec = tmpRecords[i];
			let tmpData = '';
			try { tmpData = JSON.stringify(JSON.parse(tmpRec.Content || '{}'));  }
			catch(e) { tmpData = tmpRec.Content || ''; }

			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpRec.IDRecord || '') + '</td>';
			tmpHtml += '<td>' + (tmpRec.IDDataset || '') + '</td>';
			tmpHtml += '<td>' + (tmpRec.IDSource || '') + '</td>';
			tmpHtml += '<td style="font-size:0.8em; color:var(--facto-text-tertiary);">' + (tmpRec.GUIDRecord || '').substring(0, 8) + '...</td>';
			tmpHtml += '<td class="facto-record-data">' + tmpData + '</td>';
			tmpHtml += '<td><button class="facto-btn facto-btn-secondary facto-btn-small" onclick="pict.PictApplication.navigateTo(\'/Record/' + tmpRec.IDRecord + '\')">View</button></td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	prevPage()
	{
		if (this.pict.AppData.Facto.RecordPage > 0)
		{
			this.pict.AppData.Facto.RecordPage--;
			this.pict.providers.Facto.loadRecords(this.pict.AppData.Facto.RecordPage).then(
				() => { this.refreshList(); });
		}
	}

	nextPage()
	{
		this.pict.AppData.Facto.RecordPage++;
		this.pict.providers.Facto.loadRecords(this.pict.AppData.Facto.RecordPage).then(
			() => { this.refreshList(); });
	}
}

module.exports = FactoFullRecordsView;

module.exports.default_configuration = _ViewConfiguration;
