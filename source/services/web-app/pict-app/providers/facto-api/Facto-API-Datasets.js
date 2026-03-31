module.exports =
{
	// ================================================================
	// Dataset Operations
	// ================================================================

	loadDatasets: function()
	{
		return this.api('GET', '/1.0/Datasets/0/100').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.Datasets = Array.isArray(pResponse) ? pResponse : [];
			});
	},

	createDataset: function(pDatasetData)
	{
		return this.api('POST', '/1.0/Dataset', pDatasetData).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadDatasetStats: function(pIDDataset)
	{
		return this.api('GET', `/facto/dataset/${pIDDataset}/stats`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadDatasetSources: function(pIDDataset)
	{
		return this.api('GET', `/facto/dataset/${pIDDataset}/sources`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	linkDatasetSource: function(pIDDataset, pIDSource, pReliabilityWeight)
	{
		return this.api('POST', `/facto/dataset/${pIDDataset}/source`,
			{
				IDSource: pIDSource,
				ReliabilityWeight: pReliabilityWeight || 1.0
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadDatasetRecords: function(pIDDataset, pBegin, pCap)
	{
		return this.api('GET', `/facto/dataset/${pIDDataset}/records/${pBegin || 0}/${pCap || 50}`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	// ================================================================
	// Record Operations
	// ================================================================

	loadRecords: function(pPage)
	{
		let tmpPageSize = this.pict.AppData.Facto.RecordPageSize;
		let tmpBegin = (pPage || 0) * tmpPageSize;
		return this.api('GET', `/1.0/Records/${tmpBegin}/${tmpPageSize}`).then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.Records = Array.isArray(pResponse) ? pResponse : [];
			});
	},

	expandDateFilter: function(pDateStr, pIsEnd)
	{
		if (!pDateStr || typeof pDateStr !== 'string')
		{
			return null;
		}
		let tmpTrimmed = pDateStr.trim();
		if (!tmpTrimmed)
		{
			return null;
		}

		// Year only: YYYY
		let tmpYearMatch = tmpTrimmed.match(/^(\d{4})$/);
		if (tmpYearMatch)
		{
			return pIsEnd ? tmpYearMatch[1] + '-12-31' : tmpYearMatch[1] + '-01-01';
		}

		// Year-Month: YYYY-MM
		let tmpMonthMatch = tmpTrimmed.match(/^(\d{4})-(\d{1,2})$/);
		if (tmpMonthMatch)
		{
			let tmpYear = parseInt(tmpMonthMatch[1], 10);
			let tmpMonth = parseInt(tmpMonthMatch[2], 10);
			if (tmpMonth < 1 || tmpMonth > 12)
			{
				return null;
			}
			let tmpMonthStr = String(tmpMonth).padStart(2, '0');
			if (pIsEnd)
			{
				let tmpLastDay = new Date(tmpYear, tmpMonth, 0).getDate();
				return tmpYear + '-' + tmpMonthStr + '-' + String(tmpLastDay).padStart(2, '0');
			}
			return tmpYear + '-' + tmpMonthStr + '-01';
		}

		// Full date: YYYY-MM-DD
		let tmpDayMatch = tmpTrimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
		if (tmpDayMatch)
		{
			let tmpMonth = parseInt(tmpDayMatch[2], 10);
			let tmpDay = parseInt(tmpDayMatch[3], 10);
			if (tmpMonth < 1 || tmpMonth > 12 || tmpDay < 1 || tmpDay > 31)
			{
				return null;
			}
			return tmpDayMatch[1] + '-' + String(tmpMonth).padStart(2, '0') + '-' + String(tmpDay).padStart(2, '0');
		}

		return null;
	},

	loadFilteredRecords: function(pPage, pSourceIDs, pDateFrom, pDateTo, pDatasetIDs)
	{
		let tmpPageSize = this.pict.AppData.Facto.RecordPageSize;
		let tmpBegin = (pPage || 0) * tmpPageSize;

		// Split selected datasets into raw vs projection
		let tmpRawDatasetIDs = [];
		let tmpProjectionDatasets = [];
		let tmpAllDatasets = this.pict.AppData.Facto.Datasets || [];

		if (Array.isArray(pDatasetIDs) && pDatasetIDs.length > 0)
		{
			for (let i = 0; i < pDatasetIDs.length; i++)
			{
				let tmpID = parseInt(pDatasetIDs[i], 10);
				let tmpDataset = tmpAllDatasets.find(function(d) { return d.IDDataset === tmpID; });
				if (tmpDataset && tmpDataset.Type === 'Projection')
				{
					tmpProjectionDatasets.push(tmpDataset);
				}
				else
				{
					tmpRawDatasetIDs.push(tmpID);
				}
			}
		}

		let tmpPromises = [];

		// Query raw records from the Record table
		if (tmpRawDatasetIDs.length > 0 || tmpProjectionDatasets.length === 0)
		{
			let tmpFilterParts = [];

			if (Array.isArray(pSourceIDs) && pSourceIDs.length > 0)
			{
				tmpFilterParts.push('FBV~IDSource~INN~' + pSourceIDs.join(','));
			}
			if (tmpRawDatasetIDs.length > 0)
			{
				tmpFilterParts.push('FBV~IDDataset~INN~' + tmpRawDatasetIDs.join(','));
			}

			let tmpExpandedFrom = this.expandDateFilter(pDateFrom, false);
			let tmpExpandedTo = this.expandDateFilter(pDateTo, true);
			if (tmpExpandedFrom)
			{
				tmpFilterParts.push('FBV~IngestDate~GE~' + encodeURIComponent(tmpExpandedFrom));
			}
			if (tmpExpandedTo)
			{
				tmpFilterParts.push('FBV~IngestDate~LE~' + encodeURIComponent(tmpExpandedTo));
			}

			let tmpURL;
			if (tmpFilterParts.length > 0)
			{
				tmpURL = '/1.0/Records/FilteredTo/' + tmpFilterParts.join('~') + '/' + tmpBegin + '/' + tmpPageSize;
			}
			else
			{
				tmpURL = '/1.0/Records/' + tmpBegin + '/' + tmpPageSize;
			}

			// Only query raw records if no projection-only filter is active
			if (tmpProjectionDatasets.length === 0 || tmpRawDatasetIDs.length > 0)
			{
				tmpPromises.push(this.api('GET', tmpURL));
			}
		}

		// Query each projection dataset from its own Meadow endpoint
		for (let i = 0; i < tmpProjectionDatasets.length; i++)
		{
			let tmpProjName = tmpProjectionDatasets[i].Name;
			let tmpProjURL = '/1.0/' + tmpProjName + 's/' + tmpBegin + '/' + tmpPageSize;
			tmpPromises.push(
				this.api('GET', tmpProjURL).then(
					function(pRecords)
					{
						// Normalize projection records to look like Record entities
						// so the table can display them consistently
						if (!Array.isArray(pRecords)) return [];
						return pRecords.map(function(pRec)
						{
							return {
								IDRecord: pRec['ID' + tmpProjName] || 0,
								IDDataset: tmpProjectionDatasets[i].IDDataset,
								IDSource: 0,
								GUIDRecord: pRec['GUID' + tmpProjName] || '',
								Content: JSON.stringify(pRec),
								Type: 'projection',
								IngestDate: pRec.CreateDate || ''
							};
						});
					}).catch(function() { return []; })
			);
		}

		return Promise.all(tmpPromises).then(
			(pResults) =>
			{
				let tmpMerged = [];
				for (let i = 0; i < pResults.length; i++)
				{
					if (Array.isArray(pResults[i]))
					{
						tmpMerged = tmpMerged.concat(pResults[i]);
					}
				}
				this.pict.AppData.Facto.Records = tmpMerged;
			});
	},

	ingestRecords: function(pRecords, pIDDataset, pIDSource)
	{
		return this.api('POST', '/facto/record/ingest',
			{
				Records: pRecords,
				IDDataset: pIDDataset,
				IDSource: pIDSource
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadRecordCertainty: function(pIDRecord)
	{
		return this.api('GET', `/facto/record/${pIDRecord}/certainty`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	addRecordCertainty: function(pIDRecord, pCertaintyValue, pDimension, pJustification)
	{
		return this.api('POST', `/facto/record/${pIDRecord}/certainty`,
			{
				CertaintyValue: pCertaintyValue,
				Dimension: pDimension || 'overall',
				Justification: pJustification || ''
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadRecordVersions: function(pIDRecord)
	{
		return this.api('GET', `/facto/record/${pIDRecord}/versions`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	// ================================================================
	// Ingest Job Operations
	// ================================================================

	// ================================================================
	// Count Helpers (for filter UI)
	// ================================================================

	loadSourceCounts: function()
	{
		let tmpSources = this.pict.AppData.Facto.Sources;
		if (!Array.isArray(tmpSources) || tmpSources.length === 0)
		{
			return Promise.resolve();
		}
		let tmpPromises = tmpSources.map(
			(pSource) =>
			{
				return this.loadSourceSummary(pSource.IDSource).then(
					(pSummary) =>
					{
						if (pSummary && typeof pSummary.RecordCount !== 'undefined')
						{
							pSource.RecordCount = pSummary.RecordCount;
						}
						else
						{
							pSource.RecordCount = 0;
						}
					}).catch(
					() =>
					{
						pSource.RecordCount = 0;
					});
			});
		return Promise.all(tmpPromises);
	},

	loadDatasetCounts: function()
	{
		let tmpDatasets = this.pict.AppData.Facto.Datasets;
		if (!Array.isArray(tmpDatasets) || tmpDatasets.length === 0)
		{
			return Promise.resolve();
		}
		let tmpPromises = tmpDatasets.map(
			(pDataset) =>
			{
				return this.loadDatasetStats(pDataset.IDDataset).then(
					(pStats) =>
					{
						if (pStats && typeof pStats.RecordCount !== 'undefined')
						{
							pDataset.RecordCount = pStats.RecordCount;
						}
						else
						{
							pDataset.RecordCount = 0;
						}
					}).catch(
					() =>
					{
						pDataset.RecordCount = 0;
					});
			});
		return Promise.all(tmpPromises);
	},

	// ================================================================
	// Ingest Job Operations
	// ================================================================

	loadIngestJobs: function()
	{
		return this.api('GET', '/facto/ingest/jobs').then(
			(pResponse) =>
			{
				this.pict.AppData.Facto.IngestJobs = (pResponse && pResponse.Jobs) ? pResponse.Jobs : [];
			});
	},

	createIngestJob: function(pIDSource, pIDDataset, pConfiguration)
	{
		return this.api('POST', '/facto/ingest/job',
			{
				IDSource: pIDSource,
				IDDataset: pIDDataset,
				Configuration: pConfiguration || {}
			}).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	startIngestJob: function(pIDIngestJob)
	{
		return this.api('PUT', `/facto/ingest/job/${pIDIngestJob}/start`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	completeIngestJob: function(pIDIngestJob, pCounters, pStatus)
	{
		let tmpBody = Object.assign({}, pCounters || {});
		if (pStatus)
		{
			tmpBody.Status = pStatus;
		}
		return this.api('PUT', `/facto/ingest/job/${pIDIngestJob}/complete`, tmpBody).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	loadIngestJobDetails: function(pIDIngestJob)
	{
		return this.api('GET', `/facto/ingest/job/${pIDIngestJob}`).then(
			(pResponse) =>
			{
				return pResponse;
			});
	},

	// ================================================================
	// FilteredTo URL Parser/Builder
	// ================================================================

	// Operator mappings between JS operators and URL shortcodes
	_FILTER_OP_TO_URL:
	{
		'=': 'EQ', '!=': 'NE', '>': 'GT', '>=': 'GE', '<': 'LT', '<=': 'LE',
		'LIKE': 'LK', 'IN': 'INN', 'NOT IN': 'NI', 'IS NULL': 'IN', 'IS NOT NULL': 'NN'
	},

	_FILTER_URL_TO_OP:
	{
		'EQ': '=', 'NE': '!=', 'GT': '>', 'GE': '>=', 'LT': '<', 'LE': '<=',
		'LK': 'LIKE', 'INN': 'IN', 'NI': 'NOT IN', 'IN': 'IS NULL', 'NN': 'IS NOT NULL'
	},

	// Known FilteredTo instructions (4-part tilde groups)
	_FILTER_INSTRUCTIONS: { 'FBV': 'AND', 'FBVOR': 'OR', 'FBL': 'AND', 'FSF': 'SORT', 'FOP': 'AND', 'FOPOR': 'OR', 'FCP': 'AND', 'FCC': 'AND', 'FCB': 'AND' },

	/**
	 * Build a FilteredTo URL segment from an array of filter objects.
	 *
	 * @param {Array} pFilters - [{Column, Operator, Value, Connector}]
	 *        Operator should be a URL shortcode (EQ, GE, INN, etc.)
	 *        Connector is optional, defaults to FBV (AND)
	 * @returns {string} e.g. "FBV~IDSource~INN~1,3~FBV~IngestDate~GE~2025-01-01"
	 */
	buildFilteredToString: function(pFilters)
	{
		if (!Array.isArray(pFilters) || pFilters.length === 0) return '';

		let tmpParts = [];
		for (let i = 0; i < pFilters.length; i++)
		{
			let tmpFilter = pFilters[i];
			let tmpInstruction = tmpFilter.Connector === 'OR' ? 'FBVOR' : 'FBV';
			let tmpOperator = tmpFilter.Operator || 'EQ';
			let tmpValue = (tmpFilter.Value !== undefined && tmpFilter.Value !== null) ? String(tmpFilter.Value) : '';
			tmpParts.push(tmpInstruction + '~' + tmpFilter.Column + '~' + tmpOperator + '~' + tmpValue);
		}
		return tmpParts.join('~');
	},

	/**
	 * Parse a FilteredTo URL segment into an array of filter objects.
	 *
	 * @param {string} pFilterString - e.g. "FBV~IDSource~INN~1,3~FBV~IngestDate~GE~2025-01-01"
	 * @returns {Array} [{Column, Operator, Value, Connector}]
	 *          Operator is the URL shortcode (EQ, GE, INN, etc.)
	 */
	parseFilteredToString: function(pFilterString)
	{
		if (!pFilterString || typeof pFilterString !== 'string') return [];

		let tmpParts = pFilterString.split('~');
		let tmpFilters = [];
		let tmpIdx = 0;

		while (tmpIdx < tmpParts.length)
		{
			let tmpInstruction = tmpParts[tmpIdx];

			// Check if this is a recognized instruction
			if (this._FILTER_INSTRUCTIONS.hasOwnProperty(tmpInstruction))
			{
				// Read the next 3 parts: Column, Operator, Value
				let tmpColumn = (tmpIdx + 1 < tmpParts.length) ? tmpParts[tmpIdx + 1] : '';
				let tmpOperator = (tmpIdx + 2 < tmpParts.length) ? tmpParts[tmpIdx + 2] : 'EQ';
				let tmpValue = (tmpIdx + 3 < tmpParts.length) ? decodeURIComponent(tmpParts[tmpIdx + 3]) : '';

				tmpFilters.push(
				{
					Column: tmpColumn,
					Operator: tmpOperator,
					Value: tmpValue,
					Connector: this._FILTER_INSTRUCTIONS[tmpInstruction]
				});

				tmpIdx += 4;
			}
			else
			{
				// Skip unrecognized parts
				tmpIdx++;
			}
		}

		return tmpFilters;
	},

	/**
	 * Build a full browser route for filtered Records.
	 *
	 * @param {Array} pFilters - [{Column, Operator, Value}]
	 * @param {number} pBegin - Offset (default 0)
	 * @param {number} pCap - Page size (default from AppData)
	 * @returns {string} e.g. "/Records/FilteredTo/FBV~IDSource~INN~1,3/0/50"
	 */
	buildRecordsFilterRoute: function(pFilters, pBegin, pCap)
	{
		let tmpPageSize = pCap || this.pict.AppData.Facto.RecordPageSize || 50;
		let tmpBegin = pBegin || 0;

		if (!Array.isArray(pFilters) || pFilters.length === 0)
		{
			return '/Records';
		}

		let tmpFilterStr = this.buildFilteredToString(pFilters);
		return '/Records/FilteredTo/' + tmpFilterStr + '/' + tmpBegin + '/' + tmpPageSize;
	},

	/**
	 * Build filter objects from the current Records page UI state.
	 * Reads sources, datasets, and dates and returns a flat filter array.
	 *
	 * @param {Array} pSourceIDs - Selected source IDs
	 * @param {Array} pDatasetIDs - Selected dataset IDs
	 * @param {string} pDateFrom - Date from string (YYYY, YYYY-MM, or YYYY-MM-DD)
	 * @param {string} pDateTo - Date to string
	 * @returns {Array} [{Column, Operator, Value}]
	 */
	buildRecordFiltersFromState: function(pSourceIDs, pDatasetIDs, pDateFrom, pDateTo)
	{
		let tmpFilters = [];

		if (Array.isArray(pSourceIDs) && pSourceIDs.length > 0)
		{
			tmpFilters.push({ Column: 'IDSource', Operator: 'INN', Value: pSourceIDs.join(',') });
		}

		if (Array.isArray(pDatasetIDs) && pDatasetIDs.length > 0)
		{
			tmpFilters.push({ Column: 'IDDataset', Operator: 'INN', Value: pDatasetIDs.join(',') });
		}

		let tmpExpandedFrom = this.expandDateFilter(pDateFrom, false);
		let tmpExpandedTo = this.expandDateFilter(pDateTo, true);
		if (tmpExpandedFrom)
		{
			tmpFilters.push({ Column: 'IngestDate', Operator: 'GE', Value: tmpExpandedFrom });
		}
		if (tmpExpandedTo)
		{
			tmpFilters.push({ Column: 'IngestDate', Operator: 'LE', Value: tmpExpandedTo });
		}

		return tmpFilters;
	},

	/**
	 * Extract Records UI state from parsed filter objects.
	 *
	 * @param {Array} pFilters - [{Column, Operator, Value}]
	 * @returns {object} { SourceIDs, DatasetIDs, DateFrom, DateTo }
	 */
	extractRecordStateFromFilters: function(pFilters)
	{
		let tmpState = { SourceIDs: [], DatasetIDs: [], DateFrom: '', DateTo: '' };

		for (let i = 0; i < pFilters.length; i++)
		{
			let tmpFilter = pFilters[i];
			if (tmpFilter.Column === 'IDSource' && (tmpFilter.Operator === 'INN' || tmpFilter.Operator === 'EQ'))
			{
				tmpState.SourceIDs = tmpFilter.Value.split(',').map(function(v) { return parseInt(v, 10); }).filter(function(v) { return !isNaN(v); });
			}
			else if (tmpFilter.Column === 'IDDataset' && (tmpFilter.Operator === 'INN' || tmpFilter.Operator === 'EQ'))
			{
				tmpState.DatasetIDs = tmpFilter.Value.split(',').map(function(v) { return parseInt(v, 10); }).filter(function(v) { return !isNaN(v); });
			}
			else if (tmpFilter.Column === 'IngestDate' && tmpFilter.Operator === 'GE')
			{
				tmpState.DateFrom = tmpFilter.Value;
			}
			else if (tmpFilter.Column === 'IngestDate' && tmpFilter.Operator === 'LE')
			{
				tmpState.DateTo = tmpFilter.Value;
			}
		}

		return tmpState;
	}
};
