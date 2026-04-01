/**
 * Retold-Facto-ThroughputMonitor
 *
 * In-memory ring buffer that collects timestamped throughput events
 * from pipeline stages (extracted, transformed, written).
 *
 * Events are bucketed into configurable time intervals (default 1s)
 * and exposed via a REST endpoint for the temporal histogram UI.
 *
 * Usage:
 *   fable.ThroughputMonitor.recordEvent('extracted', 50);
 *   fable.ThroughputMonitor.recordEvent('transformed', 48);
 *   fable.ThroughputMonitor.recordEvent('written', 45);
 *
 *   let buckets = fable.ThroughputMonitor.getBuckets(60); // last 60 seconds
 */

'use strict';

const libFableServiceProviderBase = require('fable-serviceproviderbase');

const STAGES = ['extracted', 'transformed', 'written'];

class RetoldFactoThroughputMonitor extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		super(pFable, pOptions, pServiceHash);

		this.serviceType = 'ThroughputMonitor';

		// Configurable bucket interval in milliseconds (default 1 second)
		this._BucketIntervalMs = (pOptions && pOptions.BucketIntervalMs) || 1000;

		// Ring buffer of events: { timestamp, stage, count }
		this._Events = [];

		// Maximum events to keep (prevents unbounded memory growth)
		this._MaxEvents = (pOptions && pOptions.MaxEvents) || 100000;

		// Pipeline run tracking
		this._ActiveRun = null;
		this._RunHistory = [];
	}

	// ─────────────────────────────────────────────
	//  Event recording
	// ─────────────────────────────────────────────

	/**
	 * Record a throughput event.
	 *
	 * @param {string} pStage — 'extracted', 'transformed', or 'written'
	 * @param {number} pCount — number of records in this event
	 * @param {string} [pDatasetName] — optional dataset label
	 */
	recordEvent(pStage, pCount, pDatasetName)
	{
		if (STAGES.indexOf(pStage) < 0)
		{
			this.log.warn(`ThroughputMonitor: unknown stage "${pStage}"`);
			return;
		}

		this._Events.push(
		{
			timestamp: Date.now(),
			stage:     pStage,
			count:     pCount || 0,
			dataset:   pDatasetName || '',
		});

		// Trim ring buffer
		if (this._Events.length > this._MaxEvents)
		{
			this._Events = this._Events.slice(this._Events.length - this._MaxEvents);
		}
	}

	// ─────────────────────────────────────────────
	//  Run lifecycle
	// ─────────────────────────────────────────────

	/**
	 * Mark the start of a pipeline run.  Clears previous events.
	 */
	startRun(pRunLabel)
	{
		if (this._ActiveRun)
		{
			this.endRun();
		}

		this._Events = [];
		this._ActiveRun =
		{
			label:     pRunLabel || 'run-' + Date.now(),
			startTime: Date.now(),
			endTime:   null,
		};
	}

	/**
	 * Mark the end of a pipeline run and flush events to the database.
	 */
	endRun()
	{
		if (this._ActiveRun)
		{
			this._ActiveRun.endTime = Date.now();
			this._RunHistory.push(this._ActiveRun);
			if (this._RunHistory.length > 10)
			{
				this._RunHistory.shift();
			}

			// Persist events to the ThroughputEvent table
			this._flushToDatabase(this._ActiveRun);
		}
		this._ActiveRun = null;
	}

	/**
	 * Batch-write all buffered events to the ThroughputEvent table.
	 * Uses the MeadowSQLiteProvider's better-sqlite3 database handle.
	 */
	_flushToDatabase(pRun)
	{
		if (!this._Events || this._Events.length === 0)
		{
			return;
		}

		let tmpDB = this._getDatabase();
		if (!tmpDB)
		{
			this.log.warn('ThroughputMonitor: no database available for persistence');
			return;
		}

		let tmpLabel = pRun.label || '';
		let tmpStartTime = pRun.startTime || 0;

		try
		{
			let tmpStmt = tmpDB.prepare(
				'INSERT INTO ThroughputEvent (RunLabel, RunStartTime, Timestamp, Stage, Count, Dataset) VALUES (?, ?, ?, ?, ?, ?)');

			let tmpInsertMany = tmpDB.transaction(
				(pEvents) =>
				{
					for (let i = 0; i < pEvents.length; i++)
					{
						let tmpEvent = pEvents[i];
						tmpStmt.run(tmpLabel, tmpStartTime, tmpEvent.timestamp, tmpEvent.stage, tmpEvent.count, tmpEvent.dataset || '');
					}
				});

			tmpInsertMany(this._Events);
			this.log.info(`ThroughputMonitor: flushed ${this._Events.length} events for run "${tmpLabel}"`);
		}
		catch (pError)
		{
			this.log.warn(`ThroughputMonitor: flush error: ${pError.message}`);
		}
	}

	/**
	 * Get the better-sqlite3 database handle from the MeadowSQLiteProvider.
	 */
	_getDatabase()
	{
		if (!this.fable.servicesMap || !this.fable.servicesMap.MeadowSQLiteProvider)
		{
			return null;
		}
		let tmpProvider = Object.values(this.fable.servicesMap.MeadowSQLiteProvider)[0];
		return tmpProvider && tmpProvider._database ? tmpProvider._database : null;
	}

	/**
	 * Query persisted runs from the database.
	 *
	 * @param {number} [pLimit=20] — max runs to return
	 * @returns {Array} — [{ label, startTime, eventCount, datasets }]
	 */
	getPersistedRuns(pLimit)
	{
		let tmpDB = this._getDatabase();
		if (!tmpDB)
		{
			return [];
		}

		let tmpLimit = pLimit || 20;
		try
		{
			let tmpRows = tmpDB.prepare(
				`SELECT RunLabel, RunStartTime, COUNT(*) as EventCount, GROUP_CONCAT(DISTINCT Dataset) as Datasets
				 FROM ThroughputEvent
				 GROUP BY RunLabel, RunStartTime
				 ORDER BY RunStartTime DESC
				 LIMIT ?`).all(tmpLimit);

			return tmpRows.map(
				(pRow) =>
				({
					label:      pRow.RunLabel,
					startTime:  pRow.RunStartTime,
					eventCount: pRow.EventCount,
					datasets:   (pRow.Datasets || '').split(',').filter((pD) => pD.length > 0),
				}));
		}
		catch (pError)
		{
			this.log.warn(`ThroughputMonitor: query error: ${pError.message}`);
			return [];
		}
	}

	/**
	 * Load events for a specific historical run, optionally filtered by dataset.
	 *
	 * @param {string} pRunLabel — run label to load
	 * @param {string} [pDataset] — optional dataset filter
	 * @returns {object} — same format as getBuckets()
	 */
	getPersistedRunBuckets(pRunLabel, pDataset)
	{
		let tmpDB = this._getDatabase();
		if (!tmpDB)
		{
			return { buckets: [], stages: STAGES, interval: this._BucketIntervalMs, maxValue: 0, datasets: [] };
		}

		try
		{
			let tmpParams = [pRunLabel || ''];
			let tmpSql = 'SELECT Timestamp, Stage, Count, Dataset FROM ThroughputEvent WHERE RunLabel = ?';
			if (pDataset)
			{
				tmpSql += ' AND Dataset = ?';
				tmpParams.push(pDataset);
			}
			tmpSql += ' ORDER BY Timestamp';

			let tmpRows = tmpDB.prepare(tmpSql).all(...tmpParams);

			if (!tmpRows || tmpRows.length === 0)
			{
				return { buckets: [], stages: STAGES, interval: this._BucketIntervalMs, maxValue: 0, datasets: [] };
			}

			// Reconstruct events
			let tmpEvents = tmpRows.map(
				(pRow) => ({ timestamp: pRow.Timestamp, stage: pRow.Stage, count: pRow.Count, dataset: pRow.Dataset }));

			// Find time range
			let tmpMinTime = tmpEvents[0].timestamp;
			let tmpMaxTime = tmpEvents[tmpEvents.length - 1].timestamp;
			let tmpDuration = tmpMaxTime - tmpMinTime + this._BucketIntervalMs;
			let tmpInterval = this._BucketIntervalMs;
			let tmpBucketCount = Math.ceil(tmpDuration / tmpInterval);

			let tmpBuckets = [];
			for (let i = 0; i < tmpBucketCount; i++)
			{
				tmpBuckets.push(
				{
					time:        tmpMinTime + (i * tmpInterval),
					extracted:   0,
					transformed: 0,
					written:     0,
					total:       0,
				});
			}

			// Collect unique datasets
			let tmpDatasetSet = {};

			for (let i = 0; i < tmpEvents.length; i++)
			{
				let tmpEvent = tmpEvents[i];
				let tmpBucketIndex = Math.floor((tmpEvent.timestamp - tmpMinTime) / tmpInterval);
				if (tmpBucketIndex >= 0 && tmpBucketIndex < tmpBuckets.length)
				{
					tmpBuckets[tmpBucketIndex][tmpEvent.stage] += tmpEvent.count;
					tmpBuckets[tmpBucketIndex].total += tmpEvent.count;
				}
				if (tmpEvent.dataset)
				{
					tmpDatasetSet[tmpEvent.dataset] = true;
				}
			}

			let tmpMaxValue = 0;
			for (let i = 0; i < tmpBuckets.length; i++)
			{
				tmpMaxValue = Math.max(tmpMaxValue, tmpBuckets[i].extracted, tmpBuckets[i].transformed, tmpBuckets[i].written);
			}

			return {
				buckets:  tmpBuckets,
				stages:   STAGES,
				interval: tmpInterval,
				maxValue: tmpMaxValue,
				datasets: Object.keys(tmpDatasetSet),
			};
		}
		catch (pError)
		{
			this.log.warn(`ThroughputMonitor: query error: ${pError.message}`);
			return { buckets: [], stages: STAGES, interval: this._BucketIntervalMs, maxValue: 0, datasets: [] };
		}
	}

	/**
	 * Get per-dataset breakdown for a run.
	 *
	 * @param {string} pRunLabel — run label
	 * @returns {Array} — [{ dataset, extracted, transformed, written, total }]
	 */
	getPersistedRunDatasetBreakdown(pRunLabel)
	{
		let tmpDB = this._getDatabase();
		if (!tmpDB)
		{
			return [];
		}

		try
		{
			let tmpRows = tmpDB.prepare(
				`SELECT Dataset, Stage, SUM(Count) as Total
				 FROM ThroughputEvent
				 WHERE RunLabel = ? AND Dataset != ''
				 GROUP BY Dataset, Stage
				 ORDER BY Dataset, Stage`).all(pRunLabel || '');

			if (!tmpRows || tmpRows.length === 0) return [];

			// Pivot: rows are (Dataset, Stage, Total) → objects are { dataset, extracted, transformed, written }
			let tmpMap = {};
			for (let i = 0; i < tmpRows.length; i++)
			{
				let tmpRow = tmpRows[i];
				let tmpDataset = tmpRow.Dataset;
				let tmpStage = tmpRow.Stage;
				let tmpTotal = tmpRow.Total;

				if (!tmpMap[tmpDataset])
				{
					tmpMap[tmpDataset] = { dataset: tmpDataset, extracted: 0, transformed: 0, written: 0, total: 0 };
				}
				tmpMap[tmpDataset][tmpStage] = tmpTotal;
				tmpMap[tmpDataset].total += tmpTotal;
			}

			return Object.values(tmpMap);
		}
		catch (pError)
		{
			this.log.warn(`ThroughputMonitor: breakdown error: ${pError.message}`);
			return [];
		}
	}

	// ─────────────────────────────────────────────
	//  Bucketed query
	// ─────────────────────────────────────────────

	/**
	 * Get time-bucketed throughput data.
	 *
	 * @param {number} [pDurationSeconds=60] — how far back to look
	 * @returns {object} — { buckets: [...], stages, interval, activeRun }
	 */
	getBuckets(pDurationSeconds)
	{
		let tmpDuration = (pDurationSeconds || 60) * 1000;
		let tmpNow      = Date.now();
		let tmpInterval = this._BucketIntervalMs;

		// Determine the right-edge anchor for the window:
		//   Active run  → anchor to "now" so live events always appear at the right edge.
		//   No active run → anchor to the last recorded event so bars stay right-aligned
		//                   and don't float into dead space on the right as time passes.
		let tmpAnchor = tmpNow;
		if (!this._ActiveRun && this._Events.length > 0)
		{
			tmpAnchor = this._Events[this._Events.length - 1].timestamp;
		}

		// Align to a clock-boundary so bucket indices are stable across consecutive
		// polls — the same event always lands in the same bucket, no rebucketing jitter.
		let tmpAlignedAnchor = Math.floor(tmpAnchor / tmpInterval) * tmpInterval;
		let tmpBucketCount   = Math.ceil(tmpDuration / tmpInterval);
		let tmpStart         = tmpAlignedAnchor - (tmpBucketCount - 1) * tmpInterval;
		let tmpBuckets     = [];

		for (let i = 0; i < tmpBucketCount; i++)
		{
			let tmpBucketStart = tmpStart + (i * tmpInterval);
			tmpBuckets.push(
			{
				time:        tmpBucketStart,
				extracted:   0,
				transformed: 0,
				written:     0,
			});
		}

		// Fill buckets from events
		for (let i = 0; i < this._Events.length; i++)
		{
			let tmpEvent = this._Events[i];
			if (tmpEvent.timestamp < tmpStart)
			{
				continue;
			}

			let tmpBucketIndex = Math.min(Math.floor((tmpEvent.timestamp - tmpStart) / tmpInterval), tmpBuckets.length - 1);
			if (tmpBucketIndex >= 0 && tmpBucketIndex < tmpBuckets.length)
			{
				tmpBuckets[tmpBucketIndex][tmpEvent.stage] += tmpEvent.count;
			}
		}

		// Find max value for scaling
		let tmpMaxValue = 0;
		for (let i = 0; i < tmpBuckets.length; i++)
		{
			let tmpBucket = tmpBuckets[i];
			tmpMaxValue = Math.max(tmpMaxValue, tmpBucket.extracted, tmpBucket.transformed, tmpBucket.written);
			// Also track stacked total
			tmpBucket.total = tmpBucket.extracted + tmpBucket.transformed + tmpBucket.written;
		}

		return {
			buckets:   tmpBuckets,
			stages:    STAGES,
			interval:  tmpInterval,
			maxValue:  tmpMaxValue,
			activeRun: this._ActiveRun,
			totalEvents: this._Events.length,
		};
	}

	/**
	 * Get cumulative totals per stage.
	 */
	getTotals()
	{
		let tmpTotals = { extracted: 0, transformed: 0, written: 0 };

		for (let i = 0; i < this._Events.length; i++)
		{
			let tmpEvent = this._Events[i];
			if (tmpTotals.hasOwnProperty(tmpEvent.stage))
			{
				tmpTotals[tmpEvent.stage] += tmpEvent.count;
			}
		}

		return tmpTotals;
	}

	/**
	 * Clear all events.
	 */
	reset()
	{
		this._Events = [];
		this._ActiveRun = null;
	}
}

module.exports = RetoldFactoThroughputMonitor;
