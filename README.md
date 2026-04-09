# Retold Facto

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

A data warehouse and knowledge graph for the Retold ecosystem. Facto ingests records from arbitrary sources, tracks their provenance and certainty, compiles them into projections via declarative mappings, and deploys those projections to any Meadow-supported backend. It runs as a standalone REST server, a Pict web application, and -- optionally -- as an [Ultravisor](https://github.com/stevenvelozo/ultravisor) beacon exposing its ingest / transform / deploy operations as workflow capabilities.

## Features

- **Records + Certainty** -- Every ingested record carries source provenance, schema version, ingest-job lineage, and a configurable `CertaintyIndex` entry so downstream queries can filter on confidence
- **Ingest Engine** -- Batch ingests from CSV, JSON, folder scans, or direct API calls; tracks `IngestJob` status, dedupes with content signatures, and auto-increments dataset versions
- **Projection Engine** -- Compiles raw records into flat, denormalized projections using declarative `Mappings` JSON and five built-in merge strategies (WriteAll, FirstWriteWins, ReliabilityOverwrite, MergeAndReinforce, FieldFillOnly)
- **Connection Manager** -- First-class support for SQLite, MySQL, PostgreSQL, and MSSQL projection targets via Meadow connectors; masked-password safe API
- **Mapping DSL** -- `Entity + GUIDTemplate + Mappings` JSON descriptors drive `meadow-integration`'s `TabularTransform` for flattening, comprehension, and de-duplication
- **Source Catalog** -- Research-grade catalog with `SourceCatalogEntry`, `CatalogDatasetDefinition`, and a folder scanner that discovers datasets from `README.md` files
- **Multi-Entity Web UI** -- Two Pict browser applications (`pict-app` and `pict-app-full`) provide source, dataset, record, projection, mapping, and connection management
- **Ultravisor Beacon** -- Optional beacon mode exposes three capabilities (`FactoData`, `FactoTransform`, `FactoDeploy`) so workflows can orchestrate Facto remotely
- **Meadow Native** -- Schema is defined in a single stricture JSON file; REST endpoints for every entity come for free via `meadow-endpoints`
- **Orator Native** -- Built on the standard Retold Orator + Restify stack; every subsystem exposes its own REST surface

## Installation

```bash
npm install retold-facto
# or globally for the CLI
npm install -g retold-facto
```

## Quick Start

```bash
# Initialize the default SQLite schema
retold-facto init

# Start the server (default :8386)
retold-facto serve

# Start on a custom port with a custom database
retold-facto serve --port 9000 --db /var/data/facto.sqlite

# Scan a folder of README-based dataset definitions
retold-facto scan ./my-data
```

Open `http://localhost:8386/` for the web UI, or hit the REST API at `/1.0/*` (auto-generated Meadow CRUD) and `/facto/*` (subsystem endpoints).

## CLI

```bash
retold-facto <command> [options]

Commands:
  serve [default]              Start the REST API + Pict web UI
  init                         Create the default schema (21 tables)
  ingest <file> [dataset-id] [source-id] [type]
                               Parse and ingest a CSV/JSON file
  source list | add            Source CRUD shortcuts
  dataset list | add           Dataset CRUD shortcuts
  scan <folder>                Discover datasets from README-annotated folders
  scan provision <folder>      Provision discovered datasets into Facto
  scan ingest <folder>         Ingest discovered datasets end-to-end

Options:
  -c, --config <file>          JSON configuration file
  -p, --port <port>            API server port (default 8386)
  -d, --db <path>              SQLite database path (default ./data/facto.sqlite)
  -s, --scan-path <path>       Add a scan path (repeatable)
  -l, --log [path]             Write a log file
```

## Subsystems

Facto is composed of twelve service managers layered over Meadow. Each one owns a subset of the schema and a subset of the REST surface:

| Subsystem | Purpose | Docs |
|---|---|---|
| **Recordset** | Records, CertaintyIndex, IngestJob lifecycle | [docs/subsystems/recordset.md](docs/subsystems/recordset.md) |
| **Projection** | MultiSetProjection, ProjectionStore, merge strategies, deployment | [docs/subsystems/projection.md](docs/subsystems/projection.md) |
| **Mapping** | `Entity + GUIDTemplate + Mappings` transform descriptors | [docs/subsystems/mapping.md](docs/subsystems/mapping.md) |
| **Connection** | External database connections for projection targets | [docs/subsystems/connection.md](docs/subsystems/connection.md) |
| **Audit** | Timestamped CRUD columns, ingest job logs, certainty logs | [docs/subsystems/audit.md](docs/subsystems/audit.md) |

## Ultravisor Integration

Facto can register as an [Ultravisor](https://github.com/stevenvelozo/ultravisor) beacon and expose its operations as workflow capabilities:

- **`FactoData`** -- Source / Dataset / Record / IngestJob / ProjectionStore CRUD
- **`FactoTransform`** -- Apply a mapping to a batch of records (pure function, no side effects)
- **`FactoDeploy`** -- Deploy a projection schema to an external store

In a typical Retold deployment, Ultravisor orchestrates pipelines that dispatch these capabilities to one or more Facto beacons running close to their data sources. See [docs/ultravisor-integration.md](docs/ultravisor-integration.md) for the full beacon contract and workflow patterns.

Facto also runs perfectly well without Ultravisor -- beacon mode is optional.

## Documentation

- [Overview](docs/README.md)
- [Quick Start](docs/quickstart.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api-reference.md)
- [Ultravisor Integration](docs/ultravisor-integration.md)
- **Subsystems**
  - [Recordset](docs/subsystems/recordset.md)
  - [Projection](docs/subsystems/projection.md)
  - [Connection](docs/subsystems/connection.md)
  - [Mapping](docs/subsystems/mapping.md)
  - [Audit](docs/subsystems/audit.md)

## Testing

```bash
npm test                 # Mocha TDD unit tests
npm run test-browser     # Puppeteer headless browser tests
```

## Building

```bash
npm run build
npm run build-codemirror
```

## Related Packages

- [meadow](https://github.com/stevenvelozo/meadow) -- ORM / query DSL
- [meadow-endpoints](https://github.com/stevenvelozo/meadow-endpoints) -- auto-generated REST CRUD
- [meadow-integration](https://github.com/stevenvelozo/meadow-integration) -- `TabularTransform` and `CertaintyAccumulator` used by the projection engine
- [orator](https://github.com/stevenvelozo/orator) -- REST server framework
- [pict](https://github.com/stevenvelozo/pict) -- MVC framework for the web UI
- [stricture](https://github.com/stevenvelozo/stricture) -- schema definition language (MicroDDL)
- [ultravisor](https://github.com/stevenvelozo/ultravisor) -- workflow orchestrator (optional beacon target)
- [ultravisor-beacon](https://github.com/stevenvelozo/ultravisor-beacon) -- beacon protocol client
- [bibliograph](https://github.com/stevenvelozo/bibliograph) -- (dependency; reserved for richer audit logging)

## License

MIT

## Contributing

Pull requests welcome. See the [Retold Contributing Guide](https://github.com/stevenvelozo/retold/blob/main/docs/contributing.md) for the code of conduct, contribution process, and testing requirements.
