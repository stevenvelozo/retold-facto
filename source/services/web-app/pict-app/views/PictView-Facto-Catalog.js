const libPictView = require('pict-view');

class FactoCatalogView extends libPictView
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);
	}

	onAfterRender()
	{
		// Load catalog entries from API on first render
		this.pict.providers.Facto.loadCatalogEntries().then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error loading catalog: ' + pError.message, 'error');
			});
	}

	refreshList()
	{
		let tmpContainer = document.getElementById('facto-catalog-list');
		if (!tmpContainer) return;

		let tmpEntries = this.pict.AppData.Facto.CatalogEntries;
		if (!tmpEntries || tmpEntries.length === 0)
		{
			tmpContainer.innerHTML = '<p style="color:#888; font-style:italic;">No catalog entries yet. Add sources to your research catalog.</p>';
			return;
		}

		let tmpHtml = '<table><thead><tr><th>ID</th><th>Agency</th><th>Name</th><th>Type</th><th>Category</th><th>Region</th><th>Verified</th><th>Actions</th></tr></thead><tbody>';
		for (let i = 0; i < tmpEntries.length; i++)
		{
			let tmpEntry = tmpEntries[i];
			let tmpVerified = tmpEntry.Verified ? '<span style="color:#28a745;">&#10003;</span>' : '<span style="color:#ccc;">&#10007;</span>';
			tmpHtml += '<tr>';
			tmpHtml += '<td>' + (tmpEntry.IDSourceCatalogEntry || '') + '</td>';
			tmpHtml += '<td>' + (tmpEntry.Agency || '') + '</td>';
			tmpHtml += '<td>' + (tmpEntry.Name || '') + '</td>';
			tmpHtml += '<td>' + (tmpEntry.Type || '') + '</td>';
			tmpHtml += '<td>' + (tmpEntry.Category || '') + '</td>';
			tmpHtml += '<td>' + (tmpEntry.Region || '') + '</td>';
			tmpHtml += '<td style="text-align:center;">' + tmpVerified + '</td>';
			tmpHtml += '<td>';
			tmpHtml += '<button class="primary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].viewEntry(' + tmpEntry.IDSourceCatalogEntry + ')">Datasets</button> ';
			tmpHtml += '<button class="danger" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].deleteEntry(' + tmpEntry.IDSourceCatalogEntry + ')">Delete</button>';
			tmpHtml += '</td>';
			tmpHtml += '</tr>';
		}
		tmpHtml += '</tbody></table>';
		tmpContainer.innerHTML = tmpHtml;
	}

	searchCatalog()
	{
		let tmpQuery = (document.getElementById('facto-catalog-search') || {}).value || '';
		if (!tmpQuery)
		{
			// Reload all entries
			this.pict.providers.Facto.loadCatalogEntries().then(
				() =>
				{
					this.refreshList();
				});
			return;
		}

		this.pict.providers.Facto.searchCatalog(tmpQuery).then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.CatalogEntries = (pResponse && pResponse.Entries) ? pResponse.Entries : [];
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Search error: ' + pError.message, 'error');
			});
	}

	addEntry()
	{
		let tmpAgency = (document.getElementById('facto-catalog-agency') || {}).value || '';
		let tmpName = (document.getElementById('facto-catalog-name') || {}).value || '';
		let tmpType = (document.getElementById('facto-catalog-type') || {}).value || '';
		let tmpURL = (document.getElementById('facto-catalog-url') || {}).value || '';
		let tmpProtocol = (document.getElementById('facto-catalog-protocol') || {}).value || '';
		let tmpCategory = (document.getElementById('facto-catalog-category') || {}).value || '';
		let tmpRegion = (document.getElementById('facto-catalog-region') || {}).value || '';
		let tmpUpdateFrequency = (document.getElementById('facto-catalog-frequency') || {}).value || '';
		let tmpDescription = (document.getElementById('facto-catalog-description') || {}).value || '';

		if (!tmpAgency && !tmpName)
		{
			this.pict.providers.Facto.setStatus('facto-catalog-status', 'Agency or Name is required', 'warn');
			return;
		}

		this.pict.providers.Facto.createCatalogEntry(
			{
				Agency: tmpAgency,
				Name: tmpName,
				Type: tmpType,
				URL: tmpURL,
				Protocol: tmpProtocol,
				Category: tmpCategory,
				Region: tmpRegion,
				UpdateFrequency: tmpUpdateFrequency,
				Description: tmpDescription
			}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					this.pict.providers.Facto.setStatus('facto-catalog-status', 'Catalog entry created: ' + (tmpAgency || tmpName), 'ok');
					// Clear form
					let tmpFields = ['agency', 'name', 'url', 'description'];
					for (let i = 0; i < tmpFields.length; i++)
					{
						let tmpEl = document.getElementById('facto-catalog-' + tmpFields[i]);
						if (tmpEl) tmpEl.value = '';
					}
					// Reload list
					return this.pict.providers.Facto.loadCatalogEntries();
				}
				else
				{
					this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + ((pResponse && pResponse.Error) || 'Unknown error'), 'error');
				}
			}).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
			});
	}

	deleteEntry(pIDEntry)
	{
		if (!confirm('Remove this catalog entry?')) return;

		this.pict.providers.Facto.deleteCatalogEntry(pIDEntry).then(
			() =>
			{
				return this.pict.providers.Facto.loadCatalogEntries();
			}).then(
			() =>
			{
				this.refreshList();
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Entry removed', 'ok');
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
			});
	}

	viewEntry(pIDEntry)
	{
		let tmpDetailContainer = document.getElementById('facto-catalog-detail');
		if (!tmpDetailContainer) return;

		this.pict.providers.Facto.loadCatalogEntryDatasets(pIDEntry).then(
			(pResponse) =>
			{
				let tmpDatasets = (pResponse && pResponse.Datasets) ? pResponse.Datasets : [];
				let tmpHtml = '<h3 style="margin-bottom:8px; font-size:1em; color:#444;">Dataset Definitions for Entry #' + pIDEntry + '</h3>';

				if (tmpDatasets.length === 0)
				{
					tmpHtml += '<p style="color:#888; font-style:italic; margin-bottom:8px;">No dataset definitions yet.</p>';
				}
				else
				{
					tmpHtml += '<table><thead><tr><th>ID</th><th>Name</th><th>Format</th><th>Endpoint URL</th><th>Version Policy</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
					for (let i = 0; i < tmpDatasets.length; i++)
					{
						let tmpDS = tmpDatasets[i];
						let tmpStatusLabel = tmpDS.Provisioned
							? '<span style="color:#28a745;">Provisioned (Source #' + tmpDS.IDSource + ', Dataset #' + tmpDS.IDDataset + ')</span>'
							: '<span style="color:#888;">Not provisioned</span>';
						let tmpActionBtn = '';
						if (tmpDS.Provisioned)
						{
							tmpActionBtn = '<button class="primary" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].fetchDataset(' + tmpDS.IDCatalogDatasetDefinition + ', ' + pIDEntry + ')">Fetch</button>';
						}
						else
						{
							tmpActionBtn = '<button class="success" style="padding:4px 8px; font-size:0.8em;" onclick="pict.views[\'Facto-Catalog\'].provisionDataset(' + tmpDS.IDCatalogDatasetDefinition + ', ' + pIDEntry + ')">Provision</button>';
						}
						tmpHtml += '<tr>';
						tmpHtml += '<td>' + (tmpDS.IDCatalogDatasetDefinition || '') + '</td>';
						tmpHtml += '<td>' + (tmpDS.Name || '') + '</td>';
						tmpHtml += '<td>' + (tmpDS.Format || '') + '</td>';
						tmpHtml += '<td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + (tmpDS.EndpointURL || '') + '</td>';
						tmpHtml += '<td>' + (tmpDS.VersionPolicy || 'Append') + '</td>';
						tmpHtml += '<td>' + tmpStatusLabel + '</td>';
						tmpHtml += '<td>' + tmpActionBtn + '</td>';
						tmpHtml += '</tr>';
					}
					tmpHtml += '</tbody></table>';
				}

				// Add dataset definition form
				tmpHtml += '<h4 style="margin-top:12px; margin-bottom:8px; font-size:0.95em; color:#555;">Add Dataset Definition</h4>';
				tmpHtml += '<div class="inline-group">';
				tmpHtml += '<div><label for="facto-catds-name">Name</label><input type="text" id="facto-catds-name" placeholder="e.g. Monthly Earthquake Feed"></div>';
				tmpHtml += '<div><label for="facto-catds-format">Format</label>';
				tmpHtml += '<select id="facto-catds-format"><option value="csv">CSV</option><option value="json">JSON</option><option value="xml">XML</option><option value="geojson">GeoJSON</option><option value="other">Other</option></select></div>';
				tmpHtml += '</div>';
				tmpHtml += '<div class="inline-group">';
				tmpHtml += '<div><label for="facto-catds-endpoint">Endpoint URL</label><input type="text" id="facto-catds-endpoint" placeholder="https://api.example.gov/data.csv"></div>';
				tmpHtml += '<div><label for="facto-catds-versionpolicy">Version Policy</label>';
				tmpHtml += '<select id="facto-catds-versionpolicy"><option value="Append">Append</option><option value="Replace">Replace</option></select></div>';
				tmpHtml += '</div>';
				tmpHtml += '<div><label for="facto-catds-description">Description</label><input type="text" id="facto-catds-description" placeholder="Description of the dataset"></div>';
				tmpHtml += '<button class="primary" onclick="pict.views[\'Facto-Catalog\'].addDatasetDefinition(' + pIDEntry + ')">Add Dataset Definition</button>';
				tmpHtml += '<button class="secondary" onclick="document.getElementById(\'facto-catalog-detail\').innerHTML=\'\';">Close</button>';

				tmpDetailContainer.innerHTML = tmpHtml;
			}).catch(
			(pError) =>
			{
				tmpDetailContainer.innerHTML = '<p style="color:#dc3545;">Error loading datasets: ' + pError.message + '</p>';
			});
	}

	addDatasetDefinition(pIDEntry)
	{
		let tmpName = (document.getElementById('facto-catds-name') || {}).value || '';
		let tmpFormat = (document.getElementById('facto-catds-format') || {}).value || '';
		let tmpEndpointURL = (document.getElementById('facto-catds-endpoint') || {}).value || '';
		let tmpVersionPolicy = (document.getElementById('facto-catds-versionpolicy') || {}).value || 'Append';
		let tmpDescription = (document.getElementById('facto-catds-description') || {}).value || '';

		if (!tmpName)
		{
			this.pict.providers.Facto.setStatus('facto-catalog-status', 'Dataset name is required', 'warn');
			return;
		}

		this.pict.providers.Facto.addCatalogDataset(pIDEntry,
			{
				Name: tmpName,
				Format: tmpFormat,
				EndpointURL: tmpEndpointURL,
				VersionPolicy: tmpVersionPolicy,
				Description: tmpDescription
			}).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					this.pict.providers.Facto.setStatus('facto-catalog-status', 'Dataset definition added: ' + tmpName, 'ok');
					this.viewEntry(pIDEntry);
				}
				else
				{
					this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + ((pResponse && pResponse.Error) || 'Unknown error'), 'error');
				}
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
			});
	}

	provisionDataset(pIDCatalogDataset, pIDEntry)
	{
		this.pict.providers.Facto.setStatus('facto-catalog-status', 'Provisioning...', 'info');

		this.pict.providers.Facto.provisionCatalogDataset(pIDCatalogDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					let tmpMsg = 'Provisioned! Source #' + pResponse.Source.IDSource + ', Dataset #' + pResponse.Dataset.IDDataset;
					this.pict.providers.Facto.setStatus('facto-catalog-status', tmpMsg, 'ok');
					this.viewEntry(pIDEntry);
					// Refresh sources and datasets views if they exist
					if (this.pict.views['Facto-Sources'])
					{
						this.pict.providers.Facto.loadSources().then(
							() =>
							{
								this.pict.views['Facto-Sources'].refreshList();
							});
					}
					if (this.pict.views['Facto-Datasets'])
					{
						this.pict.providers.Facto.loadDatasets().then(
							() =>
							{
								this.pict.views['Facto-Datasets'].refreshList();
							});
					}
				}
				else
				{
					this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + ((pResponse && pResponse.Error) || 'Unknown error'), 'error');
				}
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
			});
	}

	fetchDataset(pIDCatalogDataset, pIDEntry)
	{
		this.pict.providers.Facto.setStatus('facto-catalog-status', 'Fetching data from endpoint...', 'info');

		this.pict.providers.Facto.fetchCatalogDataset(pIDCatalogDataset).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					let tmpMsg = 'Fetched! ' + pResponse.Ingested + ' records ingested (v' + pResponse.DatasetVersion + ', ' + pResponse.Format + ')';
					if (pResponse.IsDuplicate)
					{
						tmpMsg += ' [duplicate content detected]';
					}
					this.pict.providers.Facto.setStatus('facto-catalog-status', tmpMsg, 'ok');
					this.viewEntry(pIDEntry);
					// Refresh records view if it exists
					if (this.pict.views['Facto-Records'])
					{
						this.pict.providers.Facto.loadRecords().then(
							() =>
							{
								this.pict.views['Facto-Records'].refreshList();
							});
					}
				}
				else
				{
					this.pict.providers.Facto.setStatus('facto-catalog-status', 'Fetch error: ' + ((pResponse && pResponse.Error) || 'Unknown error'), 'error');
				}
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Fetch error: ' + pError.message, 'error');
			});
	}

	importCatalog()
	{
		let tmpTextArea = document.getElementById('facto-catalog-import-json');
		if (!tmpTextArea || !tmpTextArea.value)
		{
			this.pict.providers.Facto.setStatus('facto-catalog-status', 'Paste JSON to import', 'warn');
			return;
		}

		let tmpEntries;
		try
		{
			tmpEntries = JSON.parse(tmpTextArea.value);
		}
		catch (pParseError)
		{
			this.pict.providers.Facto.setStatus('facto-catalog-status', 'Invalid JSON: ' + pParseError.message, 'error');
			return;
		}

		this.pict.providers.Facto.importCatalog(tmpEntries).then(
			(pResponse) =>
			{
				if (pResponse && pResponse.Success)
				{
					this.pict.providers.Facto.setStatus('facto-catalog-status', 'Imported ' + pResponse.EntriesCreated + ' entries with ' + pResponse.DatasetsCreated + ' datasets', 'ok');
					tmpTextArea.value = '';
					return this.pict.providers.Facto.loadCatalogEntries();
				}
				else
				{
					let tmpError = (pResponse && pResponse.Error) || 'Unknown';
					if (tmpError === 'Unknown')
					{
						try { tmpError = 'Unexpected response: ' + JSON.stringify(pResponse).substring(0, 300); }
						catch(e) { /* ignore */ }
					}
					this.pict.providers.Facto.setStatus('facto-catalog-status', 'Import error: ' + tmpError, 'error');
				}
			}).then(
			() =>
			{
				this.refreshList();
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
			});
	}

	exportCatalog()
	{
		this.pict.providers.Facto.exportCatalog().then(
			(pResponse) =>
			{
				let tmpTextArea = document.getElementById('facto-catalog-import-json');
				if (tmpTextArea)
				{
					tmpTextArea.value = JSON.stringify(pResponse && pResponse.Entries ? pResponse.Entries : pResponse, null, 2);
				}
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Catalog exported to JSON text area', 'ok');
			}).catch(
			(pError) =>
			{
				this.pict.providers.Facto.setStatus('facto-catalog-status', 'Error: ' + pError.message, 'error');
			});
	}
}

module.exports = FactoCatalogView;

module.exports.default_configuration =
{
	ViewIdentifier: 'Facto-Catalog',
	DefaultRenderable: 'Facto-Catalog',
	DefaultDestinationAddress: '#Facto-Section-Catalog',
	Templates:
	[
		{
			Hash: 'Facto-Catalog',
			Template: /*html*/`
<div class="accordion-row">
	<div class="accordion-number">0</div>
	<div class="accordion-card" id="facto-card-catalog">
		<div class="accordion-header" onclick="pict.views['Facto-Layout'].toggleSection('facto-card-catalog')">
			<span class="accordion-title">Source Catalog</span>
			<span class="accordion-preview">Research and catalog data sources</span>
			<span class="accordion-toggle">&#9660;</span>
		</div>
		<div class="accordion-body">
			<p style="margin-bottom:12px; color:#666; font-size:0.9em;">Research and catalog potential data sources before provisioning them as runtime Sources and Datasets.</p>

			<!-- Search -->
			<div class="inline-group" style="margin-bottom:12px;">
				<div style="flex:3;">
					<input type="text" id="facto-catalog-search" placeholder="Search catalog by name, agency, category, or description..." style="margin-bottom:0;">
				</div>
				<div style="flex:0 0 auto; display:flex; align-items:flex-end;">
					<button class="primary" style="margin-bottom:0;" onclick="pict.views['Facto-Catalog'].searchCatalog()">Search</button>
				</div>
			</div>

			<!-- Entries list -->
			<div id="facto-catalog-list"></div>

			<!-- Dataset definitions detail (appears when clicking "Datasets" on an entry) -->
			<div id="facto-catalog-detail" style="margin-top:12px;"></div>

			<!-- Add entry form -->
			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Add Catalog Entry</h3>
			<div class="inline-group">
				<div>
					<label for="facto-catalog-agency">Agency / Organization</label>
					<input type="text" id="facto-catalog-agency" placeholder="e.g. US Geological Survey (USGS)">
				</div>
				<div>
					<label for="facto-catalog-name">Portal Name</label>
					<input type="text" id="facto-catalog-name" placeholder="e.g. USGS Water Services">
				</div>
			</div>
			<div class="inline-group">
				<div>
					<label for="facto-catalog-type">Type</label>
					<select id="facto-catalog-type">
						<option value="API">API</option>
						<option value="File">File</option>
						<option value="FTP">FTP</option>
						<option value="Web">Web</option>
						<option value="Database">Database</option>
						<option value="Other">Other</option>
					</select>
				</div>
				<div>
					<label for="facto-catalog-protocol">Protocol</label>
					<select id="facto-catalog-protocol">
						<option value="HTTPS">HTTPS</option>
						<option value="HTTP">HTTP</option>
						<option value="FTP">FTP</option>
						<option value="SFTP">SFTP</option>
						<option value="Local">Local</option>
					</select>
				</div>
				<div>
					<label for="facto-catalog-category">Category</label>
					<input type="text" id="facto-catalog-category" placeholder="e.g. Science, Finance">
				</div>
			</div>
			<div class="inline-group">
				<div>
					<label for="facto-catalog-url">Base URL</label>
					<input type="text" id="facto-catalog-url" placeholder="https://api.example.gov">
				</div>
				<div>
					<label for="facto-catalog-region">Region</label>
					<input type="text" id="facto-catalog-region" placeholder="e.g. US, Global">
				</div>
				<div>
					<label for="facto-catalog-frequency">Update Frequency</label>
					<select id="facto-catalog-frequency">
						<option value="Continuous">Continuous</option>
						<option value="Daily">Daily</option>
						<option value="Weekly">Weekly</option>
						<option value="Monthly">Monthly</option>
						<option value="Quarterly">Quarterly</option>
						<option value="Yearly">Yearly</option>
						<option value="Unknown">Unknown</option>
					</select>
				</div>
			</div>
			<div>
				<label for="facto-catalog-description">Description</label>
				<input type="text" id="facto-catalog-description" placeholder="Brief description of this data source">
			</div>
			<button class="primary" onclick="pict.views['Facto-Catalog'].addEntry()">Add Catalog Entry</button>

			<!-- Import / Export -->
			<h3 style="margin-top:16px; margin-bottom:8px; font-size:1em; color:#444;">Import / Export</h3>
			<textarea id="facto-catalog-import-json" rows="4" style="width:100%; font-family:monospace; font-size:0.85em; padding:8px; border:1px solid #ccc; border-radius:4px; margin-bottom:8px;" placeholder="Paste JSON array of catalog entries here..."></textarea>
			<button class="primary" onclick="pict.views['Facto-Catalog'].importCatalog()">Import JSON</button>
			<button class="secondary" onclick="pict.views['Facto-Catalog'].exportCatalog()">Export Catalog</button>

			<div id="facto-catalog-status" class="status" style="display:none;"></div>
		</div>
	</div>
</div>
`
		}
	],
	Renderables:
	[
		{
			RenderableHash: 'Facto-Catalog',
			TemplateHash: 'Facto-Catalog',
			DestinationAddress: '#Facto-Section-Catalog'
		}
	]
};
