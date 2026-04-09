# API Reference

Facto exposes two parallel REST surfaces:

1. **`/1.0/<Entity>`** -- auto-generated Meadow CRUD endpoints for every entity in the schema (created by `meadow-endpoints` from the stricture JSON)
2. **`/facto/*`** -- subsystem-specific endpoints registered by each service manager

This reference groups endpoints by subsystem. For the Meadow CRUD conventions (filtering, sorting, bulk operations, page size, etc.) see the [meadow-endpoints](https://github.com/stevenvelozo/meadow-endpoints) documentation.

## Meadow CRUD

For every entity in the schema, `meadow-endpoints` generates:

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/1.0/<Entity>` | List (supports `FBV~Column~Op~Value` filter expressions, page / pageSize, sort) |
| `GET` | `/1.0/<Entity>/:ID` | Read a single row |
| `POST` | `/1.0/<Entity>` | Create a row |
| `PUT` | `/1.0/<Entity>/:ID` | Update a row |
| `DELETE` | `/1.0/<Entity>/:ID` | Soft-delete a row |
| `GET` | `/1.0/<Entity>/Count` | Row count (with optional filter) |

Entities: `Source`, `SourceDocumentation`, `Dataset`, `DatasetSource`, `Record`, `RecordBinary`, `CertaintyIndex`, `IngestJob`, `SourceCatalogEntry`, `CatalogDatasetDefinition`, `MultiSetProjection`, `ProjectionStore`, `ProjectionMapping`, `ProjectionCertaintyLog`, `StoreConnection`, `FactoSchema`, `SchemaDocumentation`, `SchemaVersion`, `ThroughputEvent`.

## Source Manager (`/facto/source/*`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/source/by-hash/:Hash` | Look up a source by its human-readable hash |
| `GET` | `/facto/sources/active` | List only active (not soft-deleted, not deactivated) sources |
| `PUT` | `/facto/source/:IDSource/activate` | Mark a source as active |
| `PUT` | `/facto/source/:IDSource/deactivate` | Mark a source as inactive |

## Dataset Manager (`/facto/dataset/*`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/dataset/:IDDataset` | Fetch a dataset with its full metadata |
| `GET` | `/facto/dataset/by-hash/:Hash` | Look up a dataset by hash |
| `GET` | `/facto/datasets/by-type/:Type` | List datasets filtered by type (`Raw`, `Compositional`, `Projection`, `Derived`) |
| `GET` | `/facto/datasets/types` | List the allowed dataset types |

## Record Manager (`/facto/record/*`)

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/facto/record/ingest` | Batch-ingest an array of records into a dataset. Body: `{ Records, IDDataset, IDSource, Type, DefaultCertainty }`. Returns `{ Ingested, Errors }`. |

See the [Recordset subsystem](subsystems/recordset.md) for the record shape and certainty semantics.

## Ingest Engine (`/facto/ingest/*`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/ingest/jobs` | List all ingest jobs, optionally filtered by dataset, source, or status |
| `GET` | `/facto/ingest/job/:IDIngestJob` | Fetch a job's full metadata and log |
| `GET` | `/facto/ingest/statuses` | List the allowed ingest statuses |
| `POST` | `/facto/ingest/file` | Ingest a file uploaded as multipart/form-data or by server-side path |
| `POST` | `/facto/ingest/job` | Create a new empty ingest job (for subsequent record-level posts) |

## Projection Engine (`/facto/projection*` and `/facto/projections*`)

The projection engine has the largest REST surface because it owns compilation, mapping CRUD, deployment, and querying.

### Discovery and Summary

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/projections` | List every dataset of type `Projection` |
| `GET` | `/facto/projections/summary` | Aggregate counts (projections, mappings, stores) |
| `GET` | `/facto/datasets/by-type/Projection` | Same as `/facto/projections` |

### Query

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/facto/projections/query` | Run a parameterized query against a projection store |
| `POST` | `/facto/projections/aggregate` | Run an aggregation query |
| `POST` | `/facto/projections/certainty` | Analyze certainty distribution for a projection |
| `POST` | `/facto/projections/compare` | Compare two projections side-by-side |

### Schema and Store

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/projection/:IDDataset/schema` | Fetch the current schema for a projection |
| `POST` | `/facto/projection/:IDDataset/save-schema` | Save a schema edit |
| `GET` | `/facto/projection/:IDDataset/stores` | List projection stores configured for a dataset |
| `POST` | `/facto/projection/:IDDataset/deploy` | Deploy the projection to an external store. Body: `{ IDStoreConnection, TargetTableName }` |

### Mappings

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/projection/:IDDataset/mappings` | List mappings for a dataset |
| `GET` | `/facto/projection/mapping/:IDProjectionMapping` | Fetch a single mapping |
| `POST` | `/facto/projection/:IDDataset/mapping` | Create a new mapping |
| `POST` | `/facto/projection/mapping/:IDProjectionMapping/update` | Update an existing mapping |
| `POST` | `/facto/projection/:IDDataset/discover-fields` | Auto-discover the projection schema from a sample of records |
| `POST` | `/facto/projection/:IDDataset/import` | Import a mapping configuration from JSON |

### Comprehensions

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/projection/:IDDataset/comprehensions` | List the compiled comprehensions for a dataset |
| `GET` | `/facto/projection/:IDDataset/comprehension/:Filename` | Fetch a single compiled comprehension |

See the [Projection subsystem](subsystems/projection.md) and [Mapping subsystem](subsystems/mapping.md) for the semantics.

## Catalog Manager (`/facto/catalog/*`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/catalog/entries` | List catalog entries |
| `GET` | `/facto/catalog/entry/:ID` | Fetch a single catalog entry |
| `GET` | `/facto/catalog/export` | Export the full catalog as JSON |
| `GET` | `/facto/catalog/search` | Search catalog entries |
| `GET` | `/facto/catalog/source-links` | List source relationships for a catalog entry |
| `POST` | `/facto/catalog/entry` | Create a catalog entry |
| `POST` | `/facto/catalog/entry/:ID/update` | Update an existing catalog entry |
| `POST` | `/facto/catalog/dataset/:IDEntry` | Provision the dataset described by a catalog entry |
| `POST` | `/facto/catalog/import` | Import a catalog from JSON |

## Store Connection Manager (`/facto/connection*`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/connections` | List all store connections (passwords masked) |
| `GET` | `/facto/connection/:IDStoreConnection` | Fetch a single connection |
| `GET` | `/facto/connection/available-types` | List the supported connector types |
| `POST` | `/facto/connection` | Create a new connection |
| `POST` | `/facto/connection/test` | Test connectivity against an existing or prospective connection |
| `POST` | `/facto/connection/:IDStoreConnection` | Update a connection (password preserved if client sends `***`) |
| `DELETE` | `/facto/connection/:IDStoreConnection` | Soft-delete a connection |

See the [Connection subsystem](subsystems/connection.md) for the full configuration shape and security model.

## Source Folder Scanner (`/facto/scanner/*`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/scanner/paths` | List configured scan paths |
| `GET` | `/facto/scanner/datasets` | List datasets discovered by scanning |
| `GET` | `/facto/scanner/dataset/:Name` | Fetch a specific discovered dataset |
| `POST` | `/facto/scanner/dataset/:Name/provision` | Provision a discovered dataset (create Source and Dataset rows) |
| `POST` | `/facto/scanner/dataset/:Name/ingest` | Provision and run the full ingest pipeline for a discovered dataset |

## Schema Manager (`/facto/schema*`)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/schemas/active` | List active schemas |
| `GET` | `/facto/schema/:IDSchema` | Fetch a schema |
| `GET` | `/facto/schema/:IDSchema/documentation` | Fetch schema documentation |
| `POST` | `/facto/schema` | Create a schema |
| `POST` | `/facto/schema/:IDSchema/update` | Update a schema |
| `POST` | `/facto/schema/:IDSchema/documentation` | Attach documentation to a schema |
| `POST` | `/facto/schema/compile` | Compile MicroDDL text into a Meadow schema |
| `POST` | `/facto/schema/preview-sql` | Preview the DDL that would be produced for a given Meadow schema |

## Application Class (`RetoldFacto`)

`RetoldFacto` extends `fable-serviceproviderbase` and exposes the following developer-facing methods:

### Model Management

| Method | Purpose |
|---|---|
| `loadModel(pModelName, pModelObject, pStorageProvider, fCallback)` | Load a schema model from a JavaScript object |
| `loadModelFromFile(pModelName, pModelPath, pModelFilename, fCallback)` | Load a schema model from a stricture JSON file |
| `rebuildFullModel()` | Rebuild the merged schema after a model load |

### Schema

| Method | Purpose |
|---|---|
| `createSchema(fCallback)` | Execute `FACTO_SCHEMA_SQL` against the current database |
| `isEndpointGroupEnabled(pGroupName)` | Returns `true` if a named endpoint group is enabled in `options.Endpoints` |

### Lifecycle

| Method | Purpose |
|---|---|
| `onBeforeInitialize(fCallback)` | Lifecycle hook, inherited from Fable |
| `onInitialize(fCallback)` | Lifecycle hook, inherited from Fable |
| `onAfterInitialize(fCallback)` | Lifecycle hook, inherited from Fable |
| `initializeService(fCallback)` | Initialize Meadow, Orator, and all subsystem managers |
| `initializePersistenceEngine(fCallback)` | Initialize Meadow connectors and load the schema |
| `startService(fCallback)` | Start the Orator HTTP server |
| `stopService(fCallback)` | Stop the Orator HTTP server and disconnect the beacon (if registered) |

### Utility

| Method | Purpose |
|---|---|
| `generateHash(pInput)` | Generate a stable slug from a string |

## Subsystem Manager Methods

Most subsystem managers expose only `connectRoutes(pOratorServiceServer)` as their public API (the routes themselves are the interface). The three that expose rich internal methods worth calling from code:

### `RetoldFactoRecordManager`

- `ingestSingleRecord(pRecordData, fCallback)` -- create a single `Record` with its `CertaintyIndex` entry

### `RetoldFactoIngestEngine`

- `ingestFile(pFilePath, pIDDataset, pIDSource, pOptions, fCallback)`
- `ingestJSON(pData, pIDDataset, pIDSource, pOptions, fCallback)`
- `ingestCSV(pCSVContent, pIDDataset, pIDSource, pOptions, fCallback)`
- `getNextDatasetVersion(pIDDataset, fCallback)`
- `computeContentSignature(pContent)` -- SHA-256 of ingested content used for dedupe
- `checkDuplicateSignature(pIDDataset, pSignature, fCallback)`
- `appendJobLog(pIDIngestJob, pMessage, fCallback)`

### `RetoldFactoProjectionEngine`

- `compileProjection(pIDDataset, pConfig, fCallback)`
- `deploySchema(pIDDataset, pIDStoreConnection, pTargetTableName, fCallback)`
- `discoverProjectionFields(pIDDataset, fCallback)`
- `importProjectionMapping(pIDDataset, pMappingJSON, fCallback)`

### `RetoldFactoBeaconProvider`

- `connectBeacon(pBeaconConfig, fCallback)` -- register with an Ultravisor coordinator
- `disconnectBeacon(fCallback)` -- unregister cleanly

See [Ultravisor Integration](ultravisor-integration.md) for the beacon config shape and the capabilities registered.

## Response Conventions

Every Facto subsystem endpoint follows the same response shape:

```json
{ "Success": true, "Data": { /* ... */ } }
```

Or on failure:

```json
{ "Success": false, "Error": "Human-readable message" }
```

Meadow CRUD endpoints use their own (longer-standing) conventions -- see the meadow-endpoints docs for the full reference.
