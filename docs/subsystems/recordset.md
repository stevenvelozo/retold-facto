# Recordset Subsystem

The recordset subsystem is Facto's foundation: the tables, the managers, and the REST endpoints that govern how raw data lands in the warehouse and how its provenance is tracked. Every other subsystem (projection, mapping, audit) reads from this subsystem.

## Concepts

A **record** is a single row of raw data from a single source at a single point in time. Records are stored verbatim -- Facto does not transform them before they hit the warehouse. Transformations happen downstream in the [Projection subsystem](projection.md).

A **dataset** is a logical collection of records that share a schema and a purpose. Datasets have a `Type` (`Raw`, `Compositional`, `Projection`, or `Derived`) that determines how other subsystems treat them.

A **source** describes where records came from. One dataset can have many sources (e.g. a unified `WorldCities` dataset fed by GeoNames, OpenStreetMap, and a government registry), and one source can feed many datasets.

An **ingest job** is a batch operation that creates records. Every record carries an `IDIngestJob` so you can ask "which batch did this record come from?" and "show me every record this batch created".

A **certainty index** is a weight applied to a record expressing how confident the warehouse is in its correctness. Certainty is a float from 0.0 to 1.0 with a configurable default (0.5). Records can have multiple certainty entries along different "dimensions" (e.g. `overall`, `freshness`, `coverage`).

## Schema

### `Source`

```
IDSource            ID, primary key
GUIDSource          unique identifier
Name                human-readable name ('US Census TIGER')
Hash                slug for lookups
Type                'Government', 'Commercial', 'Academic', ...
URL                 canonical URL
Description         long text
Active              0 or 1
<audit columns>     CreateDate, UpdateDate, ...
```

### `Dataset`

```
IDDataset           ID, primary key
GUIDDataset         unique identifier
Name                human-readable name ('Census Places')
Hash                slug for lookups
Type                'Raw' | 'Compositional' | 'Projection' | 'Derived'
Description         long text
VersionPolicy       'Append' | 'Replace' | 'Upsert' | ...
CurrentVersion      integer, bumped by IngestJob
<audit columns>
```

### `DatasetSource` (many-to-many)

```
IDDatasetSource     ID, primary key
IDDataset           FK
IDSource            FK
ReliabilityWeight   float (used by ReliabilityOverwrite merge strategy)
```

### `Record`

```
IDRecord                  ID, primary key
GUIDRecord                unique identifier
IDDataset                 FK
IDSource                  FK
IDIngestJob               FK (batch that created this record)
Content                   JSON blob with the actual row data
Type                      'file-ingest', 'api-ingest', user-defined
SchemaHash                hash of the schema at ingest time
SchemaVersion             integer
Version                   version counter (dataset-scoped)
IngestDate                timestamp when the record landed
OriginCreateDate          timestamp from the source system
RepresentedTimeStampStart temporal validity start
RepresentedTimeStampStop  temporal validity end
RepresentedDuration       nullable duration
<audit columns>
```

The `Content` column is the raw row as JSON. Facto does not enforce a schema on it -- the schema belongs to the source, not to Facto. The projection subsystem is where you give it structure.

### `CertaintyIndex`

```
IDCertaintyIndex    ID, primary key
IDRecord            FK
CertaintyValue      float 0.0-1.0
Dimension           'overall' | custom domain name
Justification       text explaining where the value came from
<audit columns>
```

One record can have many `CertaintyIndex` rows -- one per dimension. The default dimension is `overall` and the default value is the `DefaultCertaintyValue` in the Facto configuration (0.5 unless overridden).

### `IngestJob`

```
IDIngestJob          ID, primary key
GUIDIngestJob        unique identifier
IDDataset            FK
IDSource             FK
Status               'Pending' | 'Running' | 'Completed' | 'Failed' | 'Cancelled'
StartDate            when the job started
EndDate              when it finished
RecordsProcessed     total rows parsed
RecordsCreated       new rows written
RecordsUpdated       existing rows modified
RecordsErrored       rows that failed
DatasetVersion       version counter this job incremented to
ContentSignature     SHA-256 of the ingested payload (dedupe key)
Log                  appended text log of events
Configuration        JSON with the parameters the job ran with
<audit columns>
```

### `RecordBinary`

Attachments associated with records (e.g. source files, screenshots):

```
IDRecordBinary       ID, primary key
IDRecord             FK
MimeType             e.g. 'image/png'
StorageKey           opaque key into your blob store
FileSize             bytes
<audit columns>
```

Facto does not own the blob store; `StorageKey` points at wherever you decided to put the actual bytes.

## Services

### `RetoldFactoRecordManager`

Registers `POST /facto/record/ingest` for batch record creation and exposes `ingestSingleRecord` for programmatic use.

```javascript
ingestSingleRecord(pRecordData, fCallback)
// pRecordData: { IDDataset, IDSource, IDIngestJob?, Content, Type, Certainty? }
// fCallback:   (pError, pCreatedRecord)
```

Creates the `Record` row and a companion `CertaintyIndex` row at the default certainty.

### `RetoldFactoIngestEngine`

The heavier of the two ingest services. Owns file-level and batch-level ingest with job tracking, versioning, and deduplication.

Key methods:

```javascript
ingestFile(pFilePath, pIDDataset, pIDSource, pOptions, fCallback)
ingestJSON(pData, pIDDataset, pIDSource, pOptions, fCallback)
ingestCSV(pCSVContent, pIDDataset, pIDSource, pOptions, fCallback)

getNextDatasetVersion(pIDDataset, fCallback)
computeContentSignature(pContent) => string
checkDuplicateSignature(pIDDataset, pSignature, fCallback)
appendJobLog(pIDIngestJob, pMessage, fCallback)
```

`ingestFile` orchestrates the full pipeline:

1. Compute the next dataset version.
2. Compute the content signature and check for duplicates.
3. Create an `IngestJob` with `Status = Pending`.
4. Parse the file (via `meadow-integration`'s `FileParser`).
5. Stream rows into `Record` + `CertaintyIndex`.
6. Update the job with counts and `Status = Completed`.
7. Return the job id and summary.

## REST Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/facto/record/ingest` | Batch record creation |
| `GET` | `/facto/ingest/jobs` | List ingest jobs (with filtering) |
| `GET` | `/facto/ingest/job/:IDIngestJob` | Fetch a job with its full metadata and log |
| `GET` | `/facto/ingest/statuses` | List the allowed ingest statuses |
| `POST` | `/facto/ingest/file` | Upload or specify a file for ingest |
| `POST` | `/facto/ingest/job` | Create a new empty ingest job |
| `GET` | `/1.0/Record` | Meadow CRUD list with filtering |
| `GET` | `/1.0/Record/:ID` | Fetch a single record |
| `POST` | `/1.0/Record` | Insert a record directly (bypasses the ingest engine) |
| `PUT` | `/1.0/Record/:ID` | Update a record |
| `DELETE` | `/1.0/Record/:ID` | Soft-delete a record |

## Typical Flows

### Ingesting a CSV

```bash
curl -X POST http://localhost:8386/facto/ingest/file \
	-H 'Content-Type: application/json' \
	-d '{
		"FilePath":  "/data/drops/census-places-2026.csv",
		"IDDataset": 1,
		"IDSource":  1,
		"Type":      "file-ingest"
	}'

# {
#   "Success": true,
#   "IDIngestJob": 42,
#   "RecordsProcessed": 31824,
#   "RecordsCreated":   31824,
#   "Duration":         "00:00:14.312"
# }
```

### Reading Records From a Dataset

```bash
# All records in dataset 1
curl 'http://localhost:8386/1.0/Record?filter=FBV~IDDataset~EQ~1'

# Only records from the most recent ingest job
curl 'http://localhost:8386/1.0/Record?filter=FBV~IDIngestJob~EQ~42'

# Records with certainty > 0.8 (requires a join — use /facto/projections/query for this kind of thing)
```

### Updating an Ingest Job's Status

```bash
curl -X PUT http://localhost:8386/1.0/IngestJob/42 \
	-H 'Content-Type: application/json' \
	-d '{
		"Status":           "Completed",
		"RecordsProcessed": 31824,
		"RecordsCreated":   31824
	}'
```

### Manually Boosting Certainty for a Record

```bash
curl -X POST http://localhost:8386/1.0/CertaintyIndex \
	-H 'Content-Type: application/json' \
	-d '{
		"IDRecord":      15000,
		"CertaintyValue": 0.95,
		"Dimension":     "manual-review",
		"Justification": "Verified against source-of-truth registry 2026-03-01"
	}'
```

Multiple `CertaintyIndex` rows on the same record coexist -- they represent different dimensions of confidence. Downstream queries can average them, take a max, or pick the dimension they care about.

## Dedupe Strategy

Before writing anything, the ingest engine computes a SHA-256 `ContentSignature` over the payload and checks `IngestJob.ContentSignature` for an existing match against the same dataset. If the signature matches, the job is rejected with `Skipped: true` and no records are written. This is a safety net against accidentally re-ingesting the same drop file twice; it is not a row-level dedupe (for that, the projection subsystem's merge strategies are the answer).

## Versioning

Every `IngestJob` increments `Dataset.CurrentVersion` by one. This gives you a monotonically increasing version number per dataset that you can use to pin queries to a specific snapshot ("show me dataset 1 at version 7"). The version is stamped on each `Record.Version` so you can filter queries by it.

Version policies (`Append`, `Replace`, `Upsert`) control what the ingest engine does with the previous version's records:

- **Append** -- leave previous records in place, add the new ones (default).
- **Replace** -- soft-delete all previous records in the dataset before writing the new ones.
- **Upsert** -- for each new record, look up a matching row by a key field and update in place or insert.

## Observability

Each ingest job's `Log` column is an append-only text field where the engine writes progress messages ("Parsed 10000 rows", "Writing batch 15 of 64", etc.). Fetching the job via `GET /facto/ingest/job/:IDIngestJob` returns the full log, which is the first place to look when an ingest fails.

The `ThroughputMonitor` service records per-stage counts and durations in the `ThroughputEvent` table, which you can query through `/1.0/ThroughputEvent` for performance analysis.

## Beacon Capability

When Facto is running with `--beacon`, the ingest operations are also reachable through the Ultravisor `FactoData` capability:

- `CreateSource`, `CreateDataset`, `CreateIngestJob`
- `CreateRecord`, `ReadRecords`
- `UpdateIngestJob`

A workflow can dispatch these in sequence to perform an end-to-end ingest pipeline -- see the [ultravisor-suite-harness](/apps/ultravisor-suite-harness/) for the exact five-step pattern.

## Cross-References

- [Projection subsystem](projection.md) -- reads raw records and produces flattened projections
- [Mapping subsystem](mapping.md) -- the DSL that drives record → projection transformation
- [Audit subsystem](audit.md) -- how recordset operations are tracked over time
- [Ultravisor Integration](../ultravisor-integration.md) -- beacon capabilities for remote ingest
