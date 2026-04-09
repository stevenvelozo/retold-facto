# Audit Subsystem

Facto's audit story is deliberately small and practical: it tracks the provenance of every record, the lifecycle of every ingest job, the result of every projection merge, and the timestamps of every CRUD operation. It does **not** attempt to be a full change-data-capture system or a field-level revision history. If you need those, pair Facto with [bibliograph](https://github.com/stevenvelozo/bibliograph) (which is already a dependency for future expansion).

What the audit subsystem gives you today is enough to answer the three questions most data teams actually need to answer:

1. **Where did this record come from?** (source, ingest job, timestamp)
2. **When was this row last touched?** (create / update audit columns)
3. **Why does this projection cell have this value?** (projection certainty log)

## Three Layers of Audit

### Layer 1: Meadow Audit Columns

Every entity in the Facto schema carries the standard Meadow audit columns, automatically populated by the DAL:

| Column | Purpose |
|---|---|
| `CreateDate` | ISO timestamp when the row was inserted |
| `CreatingIDUser` | User id that inserted the row (if the caller passes one) |
| `UpdateDate` | ISO timestamp of the last update |
| `UpdatingIDUser` | User id of the last updater |
| `Deleted` | Soft-delete flag (0 or 1) |
| `DeleteDate` | When the soft-delete happened |
| `DeletingIDUser` | Who triggered the soft-delete |

These columns give you "when was this row created, updated, or deleted, and who did it" for **every** entity in the warehouse -- sources, datasets, records, ingest jobs, projections, mappings, connections, catalog entries, schemas, throughput events.

### Layer 2: Ingest Job Lifecycle

Every record is stamped with an `IDIngestJob`, and the corresponding `IngestJob` row captures the full lifecycle of the batch that created it:

| Field | Purpose |
|---|---|
| `Status` | `Pending`, `Running`, `Completed`, `Failed`, `Cancelled` |
| `StartDate` / `EndDate` | When the job ran |
| `RecordsProcessed` / `RecordsCreated` / `RecordsUpdated` / `RecordsErrored` | Counts |
| `DatasetVersion` | Which version of the dataset this job produced |
| `ContentSignature` | SHA-256 of the ingested payload (for dedupe) |
| `Log` | Appended text log of events as the job ran |
| `Configuration` | JSON with the parameters the job was started with |

To see every record that came from a specific ingest:

```bash
curl 'http://localhost:8386/1.0/Record?filter=FBV~IDIngestJob~EQ~42'
```

To see every job that ever touched a dataset:

```bash
curl 'http://localhost:8386/1.0/IngestJob?filter=FBV~IDDataset~EQ~1&sort=CreateDate%3Adesc'
```

To read the progress log for a specific job:

```bash
curl http://localhost:8386/facto/ingest/job/42
```

The log is written incrementally during ingest (`IngestEngine.appendJobLog`) so you can tail a running job in near-real-time.

### Layer 3: Projection Certainty Log

The projection engine writes a `ProjectionCertaintyLog` row for every action it takes during compile. This is the finest-grained audit trail Facto maintains.

| Field | Purpose |
|---|---|
| `IDMultiSetProjection` | Which projection pipeline performed the action |
| `RecordGUID` | The entity GUID produced by the mapping |
| `CertaintyValue` | Certainty at the time of the action |
| `SourceMappingLabel` | Human-readable label (from `ProjectionMapping.Name`) |
| `IDProjectionMapping` | FK to the specific mapping |
| `Action` | `Created`, `Merged`, `Overwritten`, `Skipped` |
| `Details` | JSON with the specific fields that were written |

This table answers the "why does this cell have this value?" question: find the `RecordGUID` in the projection output, look it up in `ProjectionCertaintyLog` filtered by projection, and read the ordered history of `Action`s that produced it.

```bash
curl 'http://localhost:8386/1.0/ProjectionCertaintyLog?filter=FBV~RecordGUID~EQ~City_US_Boston&sort=CreateDate%3Aasc'
```

## What Is Not Tracked

| What you might want | Current Facto behavior |
|---|---|
| Row-level revision history | Not tracked. Only the current row + `CreateDate` / `UpdateDate` timestamps. |
| Field-level deltas | Not tracked. |
| Query audit log (who read what) | Not tracked. Put an auth proxy in front of Facto if you need this. |
| A single unified change-capture table | Not present. Audit is spread across audit columns + ingest jobs + projection certainty log. |

The `bibliograph` module is listed as a `package.json` dependency with the intent of providing a richer change-log layer in the future, but it is not wired up in the current release. If you need revision history today, the pattern is:

1. Treat your raw data as immutable -- never update `Record` rows in place; instead, run a new ingest job that creates new rows.
2. Use `IngestJob.DatasetVersion` to pin queries to a snapshot.
3. For projections, store the entire comprehension on deploy (in the target store), so each deploy produces a queryable snapshot.

## Throughput Metrics

Adjacent to audit, the `ThroughputMonitor` service records per-stage performance metrics in the `ThroughputEvent` table:

```
IDThroughputEvent    ID
Stage                'ingest-parse' | 'ingest-write' | 'projection-compile' | 'projection-deploy' | ...
Count                rows or records processed
DurationMS           wall-clock time in milliseconds
Timestamp            when the event was emitted
Context              JSON with additional metadata
```

This is the table to query when you want to answer "how long did the last ingest take?" or "which projection compile is slowest?":

```bash
# Recent projection compiles sorted by duration
curl 'http://localhost:8386/1.0/ThroughputEvent?filter=FBV~Stage~EQ~projection-compile&sort=DurationMS%3Adesc&pageSize=20'
```

## Typical Audit Queries

### Who created this record?

```bash
curl http://localhost:8386/1.0/Record/15000

# {
#   "IDRecord":       15000,
#   "CreateDate":     "2026-03-01T10:14:23.123Z",
#   "CreatingIDUser": 1,
#   "IDIngestJob":    42,
#   ...
# }

curl http://localhost:8386/facto/ingest/job/42
# Returns the job's full lifecycle including the parameters and the log
```

### What datasets has this source fed?

```bash
curl 'http://localhost:8386/1.0/DatasetSource?filter=FBV~IDSource~EQ~1'
```

### What mappings did this projection use the last time it was deployed?

```bash
curl http://localhost:8386/facto/projection/5/stores
# Read the DeployedAt / DeployLog columns on the returned stores

curl 'http://localhost:8386/1.0/ProjectionMapping?filter=FBV~IDDataset~EQ~5'
# Lists every mapping currently active on the projection
```

### When was a mapping last updated?

```bash
curl http://localhost:8386/facto/projection/mapping/7
# Read UpdateDate and UpdatingIDUser from the response
```

### How many rows did each merge strategy action touch during the last compile?

```bash
curl 'http://localhost:8386/1.0/ProjectionCertaintyLog?filter=FBV~IDMultiSetProjection~EQ~5&sort=CreateDate%3Adesc&pageSize=100'

# Then group the results by the Action column client-side
```

## Auditing Across the Ultravisor Boundary

When Facto is driven by Ultravisor workflows, the audit trail spans two systems:

- **Ultravisor side** -- workflow history, dispatch log, retries, timing. Ultravisor records which workflow step called which capability on which beacon at what time.
- **Facto side** -- the standard Facto audit layers (audit columns, ingest jobs, projection certainty log). Facto records what happened inside its own process.

The join key is the workflow's correlation id, which Ultravisor passes as an input and which Facto can store in the relevant row (for example, in `IngestJob.Configuration.WorkflowID` or as a tag on the job's `Log`). If your workflows need end-to-end traceability, establish a convention for where to stash the correlation id at ingest time and query it from both sides.

## Best Practices

- **Never mutate Record rows in place.** Re-ingest instead. This keeps the audit trail clean and leverages dataset versioning.
- **Use distinct dimensions in `CertaintyIndex`.** Separate `overall`, `freshness`, and `coverage` so you can query them independently. See the [Recordset subsystem](recordset.md).
- **Attach workflow correlation ids.** If you are driving Facto from Ultravisor, put the workflow id in `IngestJob.Configuration` so cross-system queries are possible.
- **Export `ProjectionCertaintyLog` on deploy.** Before every big deploy, back up the certainty log for the current projection state so you can diff the next deploy against it.
- **Keep ThroughputEvent around.** It is small, append-only, and the only data source you have for performance regressions.

## Cross-References

- [Recordset subsystem](recordset.md) -- where `IngestJob` and `CertaintyIndex` live
- [Projection subsystem](projection.md) -- where `ProjectionCertaintyLog` is written
- [Ultravisor Integration](../ultravisor-integration.md) -- how to correlate audit across the workflow boundary
- [bibliograph](https://github.com/stevenvelozo/bibliograph) -- the richer audit layer Facto reserves for future use
