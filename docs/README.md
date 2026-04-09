# Retold Facto

> A data warehouse and knowledge graph for the Retold ecosystem

Retold Facto is the persistence and transform layer that sits between raw data sources and the analytical stores, search indexes, and reporting systems that consume them. It is built as a Fable service that hosts an Orator REST server, a Meadow-backed data access layer, a pair of Pict web applications for browser-based management, and an optional Ultravisor beacon for workflow-driven orchestration.

Facto is the answer to a specific problem: **you have a lot of data from a lot of sources with different schemas, different reliability, different update cadences, and different downstream consumers, and you need a single place to store it, audit its provenance, transform it, and publish it.** The core design decisions follow from that problem:

- **Raw before refined.** Every record lands in the warehouse verbatim, tagged with the source it came from, the ingest job that produced it, and a certainty value. Projections are computed downstream from the raw records, not in place of them.
- **Mappings as data.** How you flatten raw records into an analytical shape is itself a first-class entity -- a row in the `ProjectionMapping` table with a `MappingConfiguration` JSON blob. You can edit mappings through the web UI, version them, export them, and re-run them.
- **Everything is Meadow.** The schema is a stricture JSON file. Every entity gets automatic CRUD endpoints, queryable filters, and connector flexibility. Swap SQLite for MySQL for PostgreSQL without touching the business logic.
- **Workflows, not cron jobs.** Facto can register as an Ultravisor beacon and expose its ingest / transform / deploy operations as workflow capabilities. Ultravisor handles the scheduling, retry, and distribution; Facto handles the work.

The twelve service managers inside Facto each own a small, focused piece of the system:

1. **RetoldFactoSourceManager** -- source CRUD and activation
2. **RetoldFactoDatasetManager** -- dataset CRUD and type filtering
3. **RetoldFactoRecordManager** -- record ingest and certainty assignment
4. **RetoldFactoIngestEngine** -- file-based and batch-based ingest with job tracking
5. **RetoldFactoProjectionEngine** -- projection compilation, deployment, and querying (the largest subsystem)
6. **RetoldFactoCatalogManager** -- catalog entries and provisioning helpers
7. **RetoldFactoStoreConnectionManager** -- external database connections with masked passwords
8. **RetoldFactoSchemaManager** -- schema versioning and MicroDDL compilation
9. **RetoldFactoSourceFolderScanner** -- README-driven folder discovery
10. **RetoldFactoDataLakeService** -- offline data lake primitives
11. **ThroughputMonitor** -- per-stage performance metrics
12. **RetoldFactoBeaconProvider** -- Ultravisor beacon registration (optional)

## Features

- **Raw Warehouse** -- 21 tables covering sources, datasets, records, ingest jobs, binary attachments, and certainty metadata
- **Batch Ingest** -- `IngestEngine` with file scanning, job tracking, content-signature dedupe, and automatic dataset versioning
- **Projection Compilation** -- `ProjectionEngine` applies `Mappings` JSON to raw records and produces de-duped comprehensions
- **Merge Strategies** -- Five built-in strategies (`WriteAll`, `FirstWriteWins`, `ReliabilityOverwrite`, `MergeAndReinforce`, `FieldFillOnly`) for combining records from multiple sources
- **Projection Deployment** -- Flat output materialized to any Meadow-supported backend (SQLite, MySQL, PostgreSQL, MSSQL)
- **Web UI** -- Two Pict browser applications: a compact `pict-app` and a full-featured `pict-app-full` with per-entity editors and projection flow diagrams
- **Source Catalog** -- Research-grade catalog entries, folder scanning via README conventions, and automatic provisioning
- **Optional Beacon** -- Register as an Ultravisor beacon and expose `FactoData`, `FactoTransform`, and `FactoDeploy` capabilities
- **Path Safety** -- All filesystem operations use sanitized paths relative to the configured data directory

## When to Use It

Reach for Facto when you need:

- A single warehouse for records from heterogeneous sources with provenance tracking
- A declarative transform pipeline that produces analytical projections without writing ETL code
- A REST surface and a web UI for managing sources, datasets, records, projections, and mappings
- An Ultravisor-integratable target for workflow-driven data operations
- A place to experiment with multi-source merge strategies and certainty-weighted joins

Skip it if your data pipeline is a single-source ETL from one CSV to one database -- you can do that with Meadow directly and skip the projection/certainty/catalog overhead.

## Relationship with Ultravisor

Facto and Ultravisor are designed to work together, but neither requires the other:

- **Facto standalone** -- `retold-facto serve` starts the REST server, loads the schema, and opens the web UI. Ingest runs when you POST to it, projections compile when you invoke the compile endpoint, and deployment happens on demand.
- **Facto + Ultravisor** -- `retold-facto serve --beacon <url>` additionally registers the beacon with an Ultravisor coordinator. Workflow operations can then dispatch `FactoData`, `FactoTransform`, and `FactoDeploy` capabilities to the beacon instead of calling REST endpoints directly.

The beacon mode is most useful in distributed deployments where several Facto instances run close to their data sources and an Ultravisor coordinator orchestrates the pipeline that flows through them. See [Ultravisor Integration](ultravisor-integration.md) for the full contract.

## Learn More

- [Quick Start](quickstart.md) -- install, init, serve, and run your first ingest
- [Architecture](architecture.md) -- process layout, class hierarchy, and data-flow diagrams
- [API Reference](api-reference.md) -- every REST endpoint, grouped by subsystem
- [Ultravisor Integration](ultravisor-integration.md) -- beacon capabilities and workflow patterns
- **Subsystem guides:**
  - [Recordset](subsystems/recordset.md) -- records, certainty, and ingest jobs
  - [Projection](subsystems/projection.md) -- compilation, merge strategies, deployment
  - [Mapping](subsystems/mapping.md) -- the transform DSL and how to write one
  - [Connection](subsystems/connection.md) -- external projection store management
  - [Audit](subsystems/audit.md) -- what is tracked and how to query it
