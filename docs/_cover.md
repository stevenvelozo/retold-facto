# Retold Facto

> A data warehouse and knowledge graph for the Retold ecosystem

Ingest records from anywhere, track their provenance and certainty, compile them into projections via declarative mappings, and deploy those projections to any Meadow-supported backend. Run it standalone, as a Pict web application, or as an Ultravisor beacon exposing ingest / transform / deploy as workflow capabilities.

- **Records + Certainty** -- Every record carries source provenance, ingest-job lineage, and a configurable certainty index
- **Ingest Engine** -- CSV, JSON, folder-scan, and API ingest with dedupe, versioning, and job tracking
- **Projection Engine** -- Compile raw records into flat projections via declarative mappings and five merge strategies
- **Connection Manager** -- SQLite, MySQL, PostgreSQL, and MSSQL projection targets via Meadow connectors
- **Source Catalog** -- Research-grade catalog with README-based folder discovery
- **Ultravisor Beacon** -- Optional beacon mode exposes FactoData, FactoTransform, and FactoDeploy as workflow capabilities

[Overview](README.md)
[Quick Start](quickstart.md)
[Architecture](architecture.md)
[Ultravisor Integration](ultravisor-integration.md)
[GitHub](https://github.com/stevenvelozo/retold-facto)
