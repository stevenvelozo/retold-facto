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
	}
};
