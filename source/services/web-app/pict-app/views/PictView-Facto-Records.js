const libPictView = require('pict-view');

class FactoRecordsView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		this.pict.providers.Facto.loadRecords(0).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error loading records: ' + pError.message, {type: 'error'});
			});
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('facto-records-list');
		if (!tmpContainer) return;

		let tmpRecords = this.pict.AppData.Facto.Records;
		if (!tmpRecords || tmpRecords.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No records ingested yet.</p>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Type</th><th>Dataset</th><th>Source</th><th>Version</th><th>Ingest Date</th><th>Content Preview</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpRecords.length; i++)
		{
			let tmpRecord = tmpRecords[i];
			let tmpPreview = (tmpRecord.Content || '').substring(0, 60);
			if ((tmpRecord.Content || '').length > 60) tmpPreview += '...';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpRecord.IDRecord || '') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.Type || '') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.IDDataset || '') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.IDSource || '') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.Version || '1') + '</td>';
			tmpHtml += '<td>' + (tmpRecord.IngestDate || '') + '</td>';
			tmpHtml += '<td style="max-width:250px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-family:monospace; font-size:0.85em;">' + tmpPreview + '</td>';
			tmpHtml += '<td><button class="secondary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Records\'].viewCertainty(' + tmpRecord.IDRecord + ')">Certainty</button></td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';

		// Pagination controls
		let tmpPage = this.pict.AppData.Facto.RecordPage || 0;
		tmpHtml += '<div style="margin-top:12px; display:flex; gap:8px; align-items:center;">';
		if (tmpPage > 0)
		{
			tmpHtml += '<button class="secondary" style="padding:4px 12px; font-size:0.85em;" onclick="pict.views[\'Facto-Records\'].changePage(' + (tmpPage - 1) + ')">&#9664; Previous</button>';
		}
		tmpHtml += '<span style="color:#888; font-size:0.85em;">Page ' + (tmpPage + 1) + '</span>';
		if (tmpRecords.length >= this.pict.AppData.Facto.RecordPageSize)
		{
			tmpHtml += '<button class="secondary" style="padding:4px 12px; font-size:0.85em;" onclick="pict.views[\'Facto-Records\'].changePage(' + (tmpPage + 1) + ')">Next &#9654;</button>';
		}
		tmpHtml += '</div>';

		tmpContainer.innerHTML = tmpHtml;
	}

	changePage(pPage)
	{
		this.pict.AppData.Facto.RecordPage = pPage;
		this.pict.providers.Facto.loadRecords(pPage).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}

	viewCertainty(pIDRecord)
	{
		this.pict.providers.Facto.loadRecordCertainty(pIDRecord).then(
			(pResponse) =>
			{
				if (!pResponse || !pResponse.CertaintyIndices || pResponse.CertaintyIndices.length === 0)
				{
					this.pict.views['Pict-Section-Modal'].toast('No certainty indices for record #' + pIDRecord, {type: 'info'});
					return;
				}
				let tmpParts = [];
				for (let i = 0; i < pResponse.CertaintyIndices.length; i++)
				{
					let tmpCI = pResponse.CertaintyIndices[i];
					tmpParts.push(tmpCI.Dimension + ': ' + tmpCI.CertaintyValue);
				}
				this.pict.views['Pict-Section-Modal'].toast('Record #' + pIDRecord + ' certainty: ' + tmpParts.join(', '), {type: 'info'});
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}
}

module.exports = FactoRecordsView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Records',
	DefaultRenderable: 'Facto-Records',
	DefaultDestinationAddress: '#Facto-Section-Records',
	Templates:
	[
		{
			Hash: 'Facto-Records',
			Template: /*html*/`
<div class="accordion-row">
	<div class="accordion-number">3</div>
	<div class="accordion-card" id="facto-card-records">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-records')">
			<span class="accordion-title">Records</span>
			<span class="accordion-preview">Browse ingested records</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Individual data records with versioning, certainty indices, and temporal metadata.</p>
			<div id="facto-records-list"></div>
		</div>
	</div>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Records',
			TemplateHash: 'Facto-Records',
			DestinationAddress: '#Facto-Section-Records'
		}
	]
};
