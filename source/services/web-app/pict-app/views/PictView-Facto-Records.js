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
				let tmpPanel = document.getElementById('facto-certainty-panel');

				if (!pResponse || !pResponse.CertaintyIndices || pResponse.CertaintyIndices.length === 0)
				{
					if (tmpPanel) tmpPanel.innerHTML = this._renderCertaintyEmpty(pIDRecord);
					else this.pict.views['Pict-Section-Modal'].toast('No certainty data for record #' + pIDRecord, {type: 'info'});
					return;
				}

				let tmpHtml = this._renderCertaintyPanel(pIDRecord, pResponse.CertaintyIndices);
				if (tmpPanel)
				{
					tmpPanel.innerHTML = tmpHtml;
					tmpPanel.style.display = 'block';
				}
				else
				{
					// Insert panel after the records list
					let tmpList = document.getElementById('facto-records-list');
					if (tmpList)
					{
						let tmpDiv = document.createElement('div');
						tmpDiv.id = 'facto-certainty-panel';
						tmpDiv.innerHTML = tmpHtml;
						tmpList.parentNode.insertBefore(tmpDiv, tmpList.nextSibling);
					}
				}
			}).catch(
			(pError) =>
			{
				this.pict.views['Pict-Section-Modal'].toast('Error: ' + pError.message, {type: 'error'});
			});
	}

	closeCertaintyPanel()
	{
		let tmpPanel = document.getElementById('facto-certainty-panel');
		if (tmpPanel)
		{
			tmpPanel.style.display = 'none';
		}
	}

	_renderCertaintyEmpty(pIDRecord)
	{
		return /*html*/`
			<div style="border:1px solid var(--facto-border); border-radius:6px; padding:16px; margin-top:16px; background:var(--facto-bg-surface);">
				<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
					<h4 style="margin:0; color:var(--facto-text-heading);">Certainty — Record #${pIDRecord}</h4>
					<button class="secondary" style="padding:2px 10px; font-size:0.8em;" onclick="pict.views['Facto-Records'].closeCertaintyPanel()">Close</button>
				</div>
				<p style="color:var(--facto-text-secondary); font-style:italic; margin:0;">No certainty indices recorded for this record. Run a multi-set projection merge to generate field-level certainty scores.</p>
			</div>`;
	}

	_renderCertaintyPanel(pIDRecord, pIndices)
	{
		// Group indices by field name
		let tmpFields = {};
		for (let i = 0; i < pIndices.length; i++)
		{
			let tmpCI = pIndices[i];
			let tmpDimension = tmpCI.Dimension || '';

			// Parse dimension format: "field:{FieldName}:{dimension}"
			let tmpMatch = tmpDimension.match(/^field:(.+):(presence|ratio|composite)$/);
			if (tmpMatch)
			{
				let tmpFieldName = tmpMatch[1];
				let tmpDimType = tmpMatch[2];
				if (!tmpFields[tmpFieldName])
				{
					tmpFields[tmpFieldName] = { presence: 0, ratio: 0, composite: 0, justification: null };
				}
				tmpFields[tmpFieldName][tmpDimType] = tmpCI.CertaintyValue;
				if (tmpCI.Justification && !tmpFields[tmpFieldName].justification)
				{
					try { tmpFields[tmpFieldName].justification = JSON.parse(tmpCI.Justification); }
					catch (e) { /* ignore parse errors */ }
				}
			}
		}

		let tmpFieldNames = Object.keys(tmpFields);
		if (tmpFieldNames.length === 0)
		{
			// Fall back to raw display for non-field-level indices
			return this._renderCertaintyRaw(pIDRecord, pIndices);
		}

		// Compute record-level composite
		let tmpCompositeSum = 0;
		for (let i = 0; i < tmpFieldNames.length; i++)
		{
			tmpCompositeSum += tmpFields[tmpFieldNames[i]].composite;
		}
		let tmpRecordComposite = tmpFieldNames.length > 0 ? tmpCompositeSum / tmpFieldNames.length : 0.5;

		// Build the panel HTML
		let tmpHtml = /*html*/`
			<div style="border:1px solid var(--facto-border); border-radius:6px; padding:16px; margin-top:16px; background:var(--facto-bg-surface);">
				<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
					<h4 style="margin:0; color:var(--facto-text-heading);">Certainty — Record #${pIDRecord}</h4>
					<button class="secondary" style="padding:2px 10px; font-size:0.8em;" onclick="pict.views['Facto-Records'].closeCertaintyPanel()">Close</button>
				</div>
				<div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; padding:10px; background:var(--facto-bg-elevated); border-radius:4px;">
					<span style="font-weight:600; color:var(--facto-text-heading);">Record Composite</span>
					${this._renderBar(tmpRecordComposite, 200)}
					<span style="font-weight:600; font-size:1.1em; color:${this._certaintyColor(tmpRecordComposite)};">${(tmpRecordComposite * 100).toFixed(1)}%</span>
				</div>
				<table style="width:100%; border-collapse:collapse;">
					<thead>
						<tr style="border-bottom:2px solid var(--facto-border);">
							<th style="text-align:left; padding:6px 8px; color:var(--facto-text-heading);">Field</th>
							<th style="text-align:left; padding:6px 8px; color:var(--facto-text-heading);">Presence</th>
							<th style="text-align:left; padding:6px 8px; color:var(--facto-text-heading);">Ratio</th>
							<th style="text-align:left; padding:6px 8px; color:var(--facto-text-heading);">Composite</th>
							<th style="text-align:center; padding:6px 8px; color:var(--facto-text-heading);">Sources</th>
						</tr>
					</thead>
					<tbody>`;

		for (let i = 0; i < tmpFieldNames.length; i++)
		{
			let tmpFN = tmpFieldNames[i];
			let tmpF = tmpFields[tmpFN];
			let tmpJ = tmpF.justification || {};
			let tmpSources = (tmpJ.agreeing || 0) + '✓';
			if (tmpJ.conflicting > 0)
			{
				tmpSources += ' ' + tmpJ.conflicting + '✗';
			}

			tmpHtml += /*html*/`
						<tr style="border-bottom:1px solid var(--facto-border-subtle);">
							<td style="padding:6px 8px; font-family:monospace; font-size:0.9em; color:var(--facto-text);">${tmpFN}</td>
							<td style="padding:6px 8px;">${this._renderBar(tmpF.presence, 100)} <span style="font-size:0.85em; color:var(--facto-text-secondary);">${(tmpF.presence * 100).toFixed(0)}%</span></td>
							<td style="padding:6px 8px;">${this._renderBar(tmpF.ratio, 100)} <span style="font-size:0.85em; color:var(--facto-text-secondary);">${(tmpF.ratio * 100).toFixed(0)}%</span></td>
							<td style="padding:6px 8px;">${this._renderBar(tmpF.composite, 100)} <span style="font-weight:600; font-size:0.85em; color:${this._certaintyColor(tmpF.composite)};">${(tmpF.composite * 100).toFixed(0)}%</span></td>
							<td style="padding:6px 8px; text-align:center; font-size:0.85em; color:var(--facto-text-secondary);">${tmpSources}</td>
						</tr>`;
		}

		tmpHtml += /*html*/`
					</tbody>
				</table>
				<div style="margin-top:10px; font-size:0.8em; color:var(--facto-text-tertiary);">
					<strong>Presence</strong> = cross-dataset corroboration &nbsp;|&nbsp;
					<strong>Ratio</strong> = within-dataset frequency &nbsp;|&nbsp;
					<strong>Composite</strong> = weighted (${((tmpFields[tmpFieldNames[0]] && tmpFields[tmpFieldNames[0]].justification && tmpFields[tmpFieldNames[0]].justification.weights) ? (tmpFields[tmpFieldNames[0]].justification.weights.presence * 100).toFixed(0) + '/' + (tmpFields[tmpFieldNames[0]].justification.weights.ratio * 100).toFixed(0) : '70/30')}) &nbsp;|&nbsp;
					✓ = agreeing sources &nbsp; ✗ = conflicting sources
				</div>
			</div>`;

		return tmpHtml;
	}

	_renderCertaintyRaw(pIDRecord, pIndices)
	{
		let tmpHtml = /*html*/`
			<div style="border:1px solid var(--facto-border); border-radius:6px; padding:16px; margin-top:16px; background:var(--facto-bg-surface);">
				<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
					<h4 style="margin:0; color:var(--facto-text-heading);">Certainty — Record #${pIDRecord}</h4>
					<button class="secondary" style="padding:2px 10px; font-size:0.8em;" onclick="pict.views['Facto-Records'].closeCertaintyPanel()">Close</button>
				</div>`;

		for (let i = 0; i < pIndices.length; i++)
		{
			let tmpCI = pIndices[i];
			tmpHtml += /*html*/`
				<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
					<span style="font-family:monospace; font-size:0.85em; min-width:180px; color:var(--facto-text);">${tmpCI.Dimension}</span>
					${this._renderBar(tmpCI.CertaintyValue, 150)}
					<span style="font-size:0.85em; font-weight:600; color:${this._certaintyColor(tmpCI.CertaintyValue)};">${(tmpCI.CertaintyValue * 100).toFixed(1)}%</span>
				</div>`;
		}

		tmpHtml += '</div>';
		return tmpHtml;
	}

	_renderBar(pValue, pWidth)
	{
		let tmpPct = Math.max(0, Math.min(1, pValue)) * 100;
		let tmpColor = this._certaintyColor(pValue);
		let tmpBgColor = 'var(--facto-bg-elevated)';
		return '<div style="display:inline-block; width:' + pWidth + 'px; height:14px; background:' + tmpBgColor + '; border-radius:3px; overflow:hidden; vertical-align:middle;">'
			+ '<div style="width:' + tmpPct + '%; height:100%; background:' + tmpColor + '; border-radius:3px; transition:width 0.3s;"></div>'
			+ '</div>';
	}

	_certaintyColor(pValue)
	{
		if (pValue >= 0.7) return 'var(--facto-success)';
		if (pValue >= 0.4) return 'var(--facto-warning)';
		return 'var(--facto-error)';
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
