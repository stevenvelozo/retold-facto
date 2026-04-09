# Connection Subsystem

The connection subsystem manages **external database connections** for projection deployment. Facto's own warehouse is a single database configured at startup, but projections can be deployed to any number of additional databases -- one per analytical backend, one per reporting tool, one per tenant. Each target is represented by a `StoreConnection` row and managed by the `RetoldFactoStoreConnectionManager` service.

Facto uses Meadow's connector layer for all external connections, so any backend Meadow supports is automatically a valid projection target: **SQLite**, **MySQL**, **PostgreSQL**, and **MSSQL** out of the box; other backends can be added by installing the corresponding `meadow-connection-*` module.

## Concepts

A **store connection** is a record describing how to reach an external database. It has a name, a type, and a config object. Passwords are stored in the database alongside the rest of the config but masked in API responses.

A **connector type** is the Meadow connector used to talk to the database. The `/facto/connection/available-types` endpoint returns the list of installed connectors.

A **connection test** verifies that Facto can actually connect with the supplied credentials. The test is performed against a cloned connection object in memory -- it does not commit anything.

## Schema

### `StoreConnection`

```
IDStoreConnection    ID, primary key
GUIDStoreConnection  unique identifier
Name                 human-readable label ('Analytics Postgres')
Type                 'SQLite' | 'MySQL' | 'PostgreSQL' | 'MSSQL'
Config               JSON with connector-specific fields
Status               'Untested' | 'Connected' | 'Failed'
LastTestedDate       timestamp of last connectivity test
<audit columns>      CreateDate, UpdateDate, Deleted, ...
```

### Config Shape

The `Config` column is a JSON string. Its shape depends on the connector:

**SQLite:**
```json
{
	"database": "/var/data/reports.sqlite"
}
```

**MySQL:**
```json
{
	"hostname": "analytics.internal",
	"port":     3306,
	"database": "warehouse",
	"username": "facto",
	"password": "s3cret"
}
```

**PostgreSQL:**
```json
{
	"hostname": "analytics.internal",
	"port":     5432,
	"database": "warehouse",
	"username": "facto",
	"password": "s3cret",
	"schema":   "public"
}
```

**MSSQL:**
```json
{
	"hostname": "sqlserver.internal",
	"port":     1433,
	"database": "warehouse",
	"username": "facto",
	"password": "s3cret",
	"options": { "encrypt": true }
}
```

## Service

### `RetoldFactoStoreConnectionManager`

Registers the `/facto/connection*` endpoints and enforces password masking.

Internal helpers worth knowing about:

```javascript
_maskConfig(pConfigJSON)
// Returns a config string with the password replaced by '***'.
// Used before sending Config back to clients.

_mergeConfig(pNewConfig, pStoredConfigJSON)
// Merges a client-supplied config with the stored one. If the client
// sends '***' for the password, the stored password is preserved.
// This lets the web UI edit connection config without ever having the
// real password.
```

## Security Model

1. Passwords are stored in the Facto warehouse alongside the rest of the config. Facto does not use an external secrets manager.
2. On read (`GET /facto/connections`, `GET /facto/connection/:ID`), the password field is replaced with `***` before the response is serialized.
3. On update (`POST /facto/connection/:ID`), if the client sends `***` as the password, the stored password is preserved. Otherwise the stored password is replaced.
4. On test (`POST /facto/connection/test`), the test uses the real stored password, not whatever the client sends -- unless the client is testing a brand-new connection that does not yet exist.
5. Projection deployment reads the password directly from the database, not from any API payload. A workflow dispatch that triggers a `DeploySchema` operation never sees the projection target's password.

This means the Facto warehouse **must** be protected at rest -- anyone with read access to the underlying SQLite / MySQL / Postgres database can read projection-target credentials. Use filesystem permissions, volume encryption, or a dedicated database user for the Facto warehouse accordingly.

## REST Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/connections` | List all connections with masked passwords |
| `GET` | `/facto/connection/:IDStoreConnection` | Fetch a single connection (password masked) |
| `GET` | `/facto/connection/available-types` | List supported connector types from the running Meadow installation |
| `POST` | `/facto/connection` | Create a new connection |
| `POST` | `/facto/connection/test` | Test connectivity |
| `POST` | `/facto/connection/:IDStoreConnection` | Update a connection (password preserved if `***`) |
| `DELETE` | `/facto/connection/:IDStoreConnection` | Soft-delete a connection |

## Typical Flows

### Create a New Connection

```bash
curl -X POST http://localhost:8386/facto/connection \
	-H 'Content-Type: application/json' \
	-d '{
		"Name": "Analytics Postgres",
		"Type": "PostgreSQL",
		"Config":
		{
			"hostname": "analytics.internal",
			"port":     5432,
			"database": "warehouse",
			"username": "facto",
			"password": "s3cret"
		}
	}'

# {
#   "Success": true,
#   "Connection":
#   {
#     "IDStoreConnection": 1,
#     "Name": "Analytics Postgres",
#     "Type": "PostgreSQL",
#     "Config":
#     {
#       "hostname": "analytics.internal",
#       "port":     5432,
#       "database": "warehouse",
#       "username": "facto",
#       "password": "***"
#     },
#     "Status": "Untested"
#   }
# }
```

Note the masked password in the response.

### Test a Connection

```bash
curl -X POST http://localhost:8386/facto/connection/test \
	-H 'Content-Type: application/json' \
	-d '{"IDStoreConnection": 1}'

# {
#   "Success": true,
#   "Status": "Connected",
#   "LastTestedDate": "2026-04-09T21:05:30.123Z",
#   "ServerInfo": {
#     "version": "PostgreSQL 15.4",
#     "database": "warehouse"
#   }
# }
```

Or test a brand-new connection that hasn't been saved:

```bash
curl -X POST http://localhost:8386/facto/connection/test \
	-H 'Content-Type: application/json' \
	-d '{
		"Type": "MySQL",
		"Config":
		{
			"hostname": "new-host.internal",
			"port":     3306,
			"database": "reports",
			"username": "test",
			"password": "test"
		}
	}'
```

### Update a Connection Without Re-Typing the Password

```bash
# Change the hostname but keep the stored password
curl -X POST http://localhost:8386/facto/connection/1 \
	-H 'Content-Type: application/json' \
	-d '{
		"Config":
		{
			"hostname": "new-analytics.internal",
			"port":     5432,
			"database": "warehouse",
			"username": "facto",
			"password": "***"
		}
	}'
```

The `***` sentinel tells the server "do not change the stored password; just update the other fields".

### Available Connector Types

```bash
curl http://localhost:8386/facto/connection/available-types

# {
#   "Success": true,
#   "Types": [
#     { "Type": "SQLite",    "Module": "meadow-connection-sqlite" },
#     { "Type": "MySQL",     "Module": "meadow-connection-mysql" },
#     { "Type": "PostgreSQL","Module": "meadow-connection-postgres" }
#   ]
# }
```

The list reflects the connector modules currently installed in the Facto Node environment. Install additional connectors with `npm install meadow-connection-<name>` and restart.

### Use a Connection for Deployment

Connections are referenced by the projection engine during deploy:

```bash
curl -X POST http://localhost:8386/facto/projection/5/deploy \
	-H 'Content-Type: application/json' \
	-d '{"IDStoreConnection":1,"TargetTableName":"world_cities_canonical"}'
```

The projection engine:

1. Loads `StoreConnection` row 1 (with the real password)
2. Instantiates the corresponding Meadow connector
3. Connects to the target database
4. Creates the target table if necessary
5. Bulk-inserts the compiled comprehension
6. Updates `ProjectionStore.Status = Deployed`

## Adding a New Connector Type

To add a new database backend:

1. Install the connector module: `npm install meadow-connection-<name>`
2. Register the connector with Meadow at startup (handled automatically when the module is installed)
3. Restart Facto
4. The new type appears in `/facto/connection/available-types`
5. Create a `StoreConnection` row with the new `Type`

Facto does not need any code changes -- the Meadow connector layer is what does the actual talking.

## Relationship With Ultravisor

Connections themselves are not exposed as Ultravisor capabilities. However, the `FactoDeploy.DeploySchema` capability takes an `IDStoreConnection` as input, so an Ultravisor workflow that deploys a projection must know which connection id to dispatch. The typical pattern is:

1. A workflow author creates the `StoreConnection` rows through the REST API (or the web UI) at deploy time.
2. The workflow definitions reference those connections by id.
3. The workflow runs, dispatching `FactoDeploy.DeploySchema` with `{ IDDataset, IDStoreConnection, TargetTableName }`.
4. Facto reads the real credentials from its warehouse and connects to the target.

The password never leaves the Facto warehouse, even through the beacon.

## Cross-References

- [Projection subsystem](projection.md) -- uses `StoreConnection` as the target for deploy operations
- [Ultravisor Integration](../ultravisor-integration.md) -- `FactoDeploy.DeploySchema` references connections by id
- [meadow](https://github.com/stevenvelozo/meadow) -- the connector layer that makes multiple backends possible
- [meadow-connection-sqlite](https://github.com/stevenvelozo/meadow-connection-sqlite)
- [meadow-connection-mysql](https://github.com/stevenvelozo/meadow-connection-mysql)
