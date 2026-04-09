# Quick Start

This guide walks through installing Facto, initializing a warehouse, ingesting a file, writing a mapping, compiling a projection, and deploying it to an external store.

## 1. Install

```bash
npm install -g retold-facto
```

Or install locally and invoke through `npx`:

```bash
npm install retold-facto
npx retold-facto serve
```

The package provides a single CLI entry point: `retold-facto`.

## 2. Initialize the Schema

Facto stores all of its own state in a Meadow-backed database. For local development, SQLite is the simplest choice:

```bash
retold-facto init --db ./data/facto.sqlite
```

This creates the 21 Facto tables (sources, datasets, records, ingest jobs, projections, mappings, connections, catalog, schema, throughput, etc.) in the specified file.

## 3. Start the Server

```bash
retold-facto serve --db ./data/facto.sqlite --port 8386
```

Output:

```
Retold Facto server running on http://localhost:8386
  Database:    ./data/facto.sqlite
  Routes:      /1.0/*  (Meadow CRUD)
  Subsystems:  /facto/*
  Web UI:      /
```

- `/` -- the Pict web application
- `/1.0/<Entity>` -- auto-generated CRUD for every entity in the schema (e.g. `/1.0/Source`, `/1.0/Dataset`, `/1.0/Record`)
- `/facto/*` -- subsystem-specific endpoints (sources, datasets, records, ingest, projections, connections, catalog, scanner, schema)

## 4. Create a Source and a Dataset

Facto models every record as belonging to a `Dataset` that pulls from one or more `Source` records.

```bash
# Create a source
retold-facto source add "US Census TIGER" Government https://www2.census.gov/geo/tiger/

# Create a dataset
retold-facto dataset add "Census Places" Raw "US Census TIGER place boundaries"
```

Or with the REST API:

```bash
curl -X POST http://localhost:8386/1.0/Source \
	-H 'Content-Type: application/json' \
	-d '{"Name":"US Census TIGER","Type":"Government","URL":"https://www2.census.gov/geo/tiger/"}'

curl -X POST http://localhost:8386/1.0/Dataset \
	-H 'Content-Type: application/json' \
	-d '{"Name":"Census Places","Type":"Raw","Description":"TIGER place boundaries"}'
```

Note the `IDSource` and `IDDataset` values returned; you will need them in the next step.

## 5. Ingest a File

The CLI can parse a CSV or JSON file directly:

```bash
retold-facto ingest ./places.csv 1 1 file-ingest
```

Arguments: `filepath`, `IDDataset`, `IDSource`, `type`.

Behind the scenes:

1. The `IngestEngine` creates an `IngestJob` with status `Pending`
2. The file is streamed and each row becomes a `Record` with the raw columns stored in `Content` (JSON)
3. Each record gets a `CertaintyIndex` entry with the default certainty (0.5)
4. The `IngestJob` is updated with `RecordsProcessed`, `RecordsCreated`, and `Status = Completed`
5. The dataset version is incremented
6. A content signature is stored so the same file cannot be accidentally re-ingested

See the [Recordset subsystem](subsystems/recordset.md) for the full shape of records and ingest jobs.

## 6. Verify the Records

```bash
curl 'http://localhost:8386/1.0/Record?filter=FBV~IDDataset~EQ~1'
```

This uses Meadow's Filter By Values syntax to return every record in dataset 1. You can filter by any column.

## 7. Write a Mapping

A mapping is a JSON object with three keys:

- `Entity` -- the target entity name the mapping produces
- `GUIDTemplate` -- a template that produces a unique id for each output row (e.g. `"Place_{state}_{place_fips}"`)
- `Mappings` -- a map of output field names to source expressions

Example: transform raw Census rows into a `Place` entity:

```json
{
	"Entity": "Place",
	"GUIDTemplate": "Place_{state_fips}_{place_fips}",
	"Mappings":
	{
		"Name":       "{place_name}",
		"StateFIPS":  "{state_fips}",
		"PlaceFIPS":  "{place_fips}",
		"Latitude":   "number({intpt_lat})",
		"Longitude":  "number({intpt_lon})",
		"Category":   "\"CensusPlace\""
	}
}
```

Register it against the dataset:

```bash
curl -X POST http://localhost:8386/facto/projection/1/mapping \
	-H 'Content-Type: application/json' \
	-d '{
		"Name": "Census Place Mapping",
		"IDSource": 1,
		"MappingConfiguration": {
			"Entity": "Place",
			"GUIDTemplate": "Place_{state_fips}_{place_fips}",
			"Mappings": {
				"Name": "{place_name}",
				"StateFIPS": "{state_fips}",
				"PlaceFIPS": "{place_fips}",
				"Latitude": "number({intpt_lat})",
				"Longitude": "number({intpt_lon})"
			}
		}
	}'
```

See the [Mapping subsystem](subsystems/mapping.md) for the full expression language and field types.

## 8. Create an External Store Connection

Before you can deploy a projection, Facto needs to know where to deploy it. Create a `StoreConnection` record for your analytical database:

```bash
curl -X POST http://localhost:8386/facto/connection \
	-H 'Content-Type: application/json' \
	-d '{
		"Name": "Analytics Postgres",
		"Type": "PostgreSQL",
		"Config": {
			"hostname": "analytics-db.internal",
			"port":     5432,
			"database": "warehouse",
			"username": "facto",
			"password": "s3cret"
		}
	}'

# Test the connection
curl -X POST http://localhost:8386/facto/connection/test \
	-H 'Content-Type: application/json' \
	-d '{"IDStoreConnection": 1}'
```

Passwords are masked in API responses. See the [Connection subsystem](subsystems/connection.md) for the full connector matrix and security model.

## 9. Deploy the Projection

Tell Facto to compile the mapping and write the result into the target store:

```bash
curl -X POST http://localhost:8386/facto/projection/1/deploy \
	-H 'Content-Type: application/json' \
	-d '{
		"IDStoreConnection": 1,
		"TargetTableName":   "census_places"
	}'
```

This:

1. Loads the mapping from `ProjectionMapping`
2. Runs `TabularTransform` over every record in the dataset
3. Applies the configured merge strategy for records with matching GUIDs
4. Writes a `ProjectionCertaintyLog` entry for each action (Created, Merged, Overwritten)
5. Creates the `census_places` table in the target Postgres instance (if it doesn't exist)
6. Inserts the comprehension rows
7. Returns a deployment report

See the [Projection subsystem](subsystems/projection.md) for the full lifecycle and merge strategy reference.

## 10. Scan a Folder of Datasets (Optional)

If you are cataloging many datasets, each represented by a folder with a research `README.md`, the folder scanner can discover them all at once:

```bash
retold-facto scan ./my-data
retold-facto scan provision ./my-data
retold-facto scan ingest ./my-data
```

The scanner recognizes the 12-section research README format used in `documentation/source_research/`. Each README describes a source, the dataset it produces, and any parsing options. Provisioning creates the corresponding `Source` and `Dataset` rows; ingesting runs the full pipeline.

## 11. Register as an Ultravisor Beacon (Optional)

If you want Ultravisor workflows to drive Facto instead of hitting its REST API directly, start the server in beacon mode:

```bash
retold-facto serve \
	--db ./data/facto.sqlite \
	--port 8386 \
	--config ./beacon-config.json
```

With `beacon-config.json`:

```json
{
	"Facto":
	{
		"Beacon":
		{
			"Enabled":    true,
			"ServerURL":  "http://ultravisor-coordinator:8000",
			"Name":       "facto-east-1",
			"Password":   "beacon-secret"
		}
	}
}
```

Ultravisor workflows can then dispatch `FactoData`, `FactoTransform`, and `FactoDeploy` capabilities to the beacon. See [Ultravisor Integration](ultravisor-integration.md) for the full capability contract.

## 12. Next Steps

- [Architecture](architecture.md) -- understand how the twelve subsystems fit together
- [API Reference](api-reference.md) -- every REST endpoint grouped by subsystem
- [Subsystem guides](subsystems/recordset.md) -- deep dives on recordset, projection, mapping, connection, and audit
- [Ultravisor Integration](ultravisor-integration.md) -- the beacon contract and workflow patterns
