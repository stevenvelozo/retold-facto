# Mapping Subsystem

Mappings are the DSL that tells Facto how to turn raw records into projection entities. A mapping is a JSON object with three top-level keys -- `Entity`, `GUIDTemplate`, and `Mappings` -- and is stored in the `ProjectionMapping.MappingConfiguration` column. At compile time, the projection engine reads mappings for the target dataset and passes each one to `meadow-integration`'s `TabularTransform` service, which applies the expressions to every record in turn and produces a comprehension (a map from entity GUID to merged body).

This subsystem has the smallest code footprint but the biggest conceptual role: it is the place where schema shape changes from "raw source columns" to "canonical analytical fields".

## The Mapping Shape

```json
{
	"Entity":       "City",
	"GUIDTemplate": "City_{country_iso}_{asciiname}",
	"Mappings":
	{
		"Name":        "{name}",
		"Country":     "{country_iso}",
		"Population":  "number({population})",
		"Latitude":    "number({latitude})",
		"Longitude":   "number({longitude})",
		"Category":    "\"PopulatedPlace\""
	}
}
```

### `Entity`

A human-readable label that describes what the mapping produces. Used for logging, `ProjectionCertaintyLog.SourceMappingLabel`, and to group output records in the comprehension. Does **not** have to match a table name -- it is a conceptual name, not a schema reference.

### `GUIDTemplate`

A template string that computes a unique identifier for each output row. Every record that produces the same `GUIDTemplate` output is treated as the same entity and merged via the projection's merge strategy. This is how "a city from GeoNames" and "a city from OpenStreetMap" collapse into "a single canonical city entity".

Template syntax:

- `{column}` is substituted with the value of `column` from the parsed input record
- Literal characters are passed through verbatim
- Expressions can be chained: `"City_{country}_{name}_{population}"` works fine

Best practices:

- Pick a GUID template that is stable across sources (`country_code + name` usually beats `lat + lon` because small floating-point differences break ties)
- Normalize the template's inputs upstream if possible (trim, lowercase, strip accents)
- Prefer natural keys over synthetic ones -- you want two different sources to produce the same GUID for the same real-world thing

### `Mappings`

A map from output field names (the columns in the projection) to source expressions (how to compute the value). The key is the output name; the value is the expression.

Expression forms:

| Form | Example | Meaning |
|---|---|---|
| Column reference | `"{name}"` | Copy the `name` column verbatim |
| Literal string | `"\"PopulatedPlace\""` | Insert the literal string `PopulatedPlace` |
| Numeric coercion | `"number({population})"` | Parse the column as a number |
| Date coercion | `"date({created_at})"` | Parse the column as a date/time |
| Concatenation | `"{first_name} {last_name}"` | Concatenate two columns with a space |
| Conditional | `"if({active}, \"yes\", \"no\")"` | If-then-else |
| Custom | `"customFn({column})"` | Call a custom function registered with `TabularTransform` |

The exact set of supported expressions is defined by the `TabularTransform` service in `meadow-integration` -- see its documentation for the full list.

## Multi-Entity Mappings

A single input file can produce multiple output entities by registering multiple mappings against the same dataset. Each mapping has its own `Entity` and `GUIDTemplate` and produces its own stream of records, all of which flow through the projection pipeline and land (potentially) in different target tables.

The canonical example is the `bookstore` fixture used by `ultravisor-suite-harness`:

- `mapping_books_book.json` -- Book entity: `GUIDTemplate: "Book_{id}"`, maps `title`, `isbn`, `language`, etc.
- `mapping_books_author.json` -- Author entity: `GUIDTemplate: "Author_{normalized_name}"`, splits the comma-delimited `authors` column into separate Author records
- `mapping_books_BookAuthorJoin.json` -- BookAuthorJoin entity: `GUIDTemplate: "BookAuthor_{book_id}_{author_name}"`, produces one record per (book, author) pair

This is how you normalize a wide denormalized input into a relational projection.

## Storage

Mappings are stored in `ProjectionMapping`:

```
IDProjectionMapping    ID
IDDataset              FK (which projection this mapping feeds)
IDSource               FK (which source the mapping parses)
IDProjectionStore      FK (which target the output lands in)
Name                   human-readable label
MappingConfiguration   JSON: { Entity, GUIDTemplate, Mappings }
SchemaVersion          integer (bump when you change the expressions)
FlowDiagramState       JSON (visual state for the web UI's flow editor)
Active                 0 or 1
```

Because mappings are just rows in the warehouse, they can be:

- **Edited through the web UI** -- the full-featured Pict app has an `ObjectEditor` view for `ProjectionMapping` with a visual flow diagram
- **Versioned** -- bump `SchemaVersion` when you change the expressions, keep the old row around for audit
- **Exported / imported** -- `GET /facto/projection/mapping/:ID` returns the JSON; `POST /facto/projection/:IDDataset/import` imports it
- **Swapped without code changes** -- you can update a production mapping live without restarting Facto

## Execution

Mapping execution happens inside the projection engine's compile flow. For each record in the dataset, the engine:

1. Loads all active mappings for the dataset
2. For each mapping, calls `TabularTransform.transformRecord(record, mapping.MappingConfiguration)`
3. `TabularTransform` substitutes `{column}` references, applies conversions, and produces `(guid, entity)`
4. The engine merges `entity` into the comprehension at position `guid` using the projection's merge strategy
5. The engine writes a `ProjectionCertaintyLog` row describing the action

## REST Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/facto/projection/:IDDataset/mappings` | List mappings for a dataset |
| `GET` | `/facto/projection/mapping/:IDProjectionMapping` | Fetch a mapping |
| `POST` | `/facto/projection/:IDDataset/mapping` | Create a new mapping |
| `POST` | `/facto/projection/mapping/:IDProjectionMapping/update` | Update an existing mapping |
| `POST` | `/facto/projection/:IDDataset/import` | Import a mapping configuration from JSON |
| `POST` | `/facto/projection/:IDDataset/discover-fields` | Auto-discover the projection schema from a record sample |

### Creating a Mapping

```bash
curl -X POST http://localhost:8386/facto/projection/5/mapping \
	-H 'Content-Type: application/json' \
	-d '{
		"Name":     "GeoNames City Mapping",
		"IDSource": 1,
		"MappingConfiguration": {
			"Entity":       "City",
			"GUIDTemplate": "City_{country_iso}_{asciiname}",
			"Mappings": {
				"Name":       "{name}",
				"Country":    "{country_iso}",
				"Latitude":   "number({latitude})",
				"Longitude":  "number({longitude})",
				"Population": "number({population})"
			}
		}
	}'
```

### Discovering Fields From a Sample

If you have records but no mapping, `discover-fields` samples the record content and suggests a schema:

```bash
curl -X POST http://localhost:8386/facto/projection/5/discover-fields \
	-H 'Content-Type: application/json' \
	-d '{"SampleSize": 100}'

# {
#   "Success": true,
#   "Fields": [
#     { "Name": "name",        "Type": "String", "Cardinality": 100 },
#     { "Name": "country_iso", "Type": "String", "Cardinality": 3   },
#     { "Name": "latitude",    "Type": "Number", "Cardinality": 100 },
#     { "Name": "population",  "Type": "Number", "Cardinality": 100 }
#   ]
# }
```

Use this to scaffold a mapping when you do not know the source schema ahead of time.

## Beacon Capability

Mappings can be executed remotely via the `FactoTransform.ApplyMapping` capability. This is a **pure function**: it takes records and a mapping configuration and returns the comprehension, with no side effects on the Facto warehouse.

```json
{
	"Capability": "FactoTransform",
	"Action":     "ApplyMapping",
	"Input":
	{
		"Records": [
			{ "name": "London", "country_iso": "GB", "latitude": "51.5", "longitude": "-0.1", "population": "9000000" },
			{ "name": "Paris",  "country_iso": "FR", "latitude": "48.8", "longitude": "2.3",  "population": "2200000" }
		],
		"MappingConfiguration": {
			"Entity":       "City",
			"GUIDTemplate": "City_{country_iso}_{name}",
			"Mappings": {
				"Name":       "{name}",
				"Country":    "{country_iso}",
				"Population": "number({population})"
			}
		}
	},
	"Output":
	{
		"Comprehension":
		{
			"City_GB_London": { "Name": "London", "Country": "GB", "Population": 9000000 },
			"City_FR_Paris":  { "Name": "Paris",  "Country": "FR", "Population": 2200000 }
		},
		"BadRecords":     [],
		"ParsedRowCount": 2,
		"UniqueCount":    2
	}
}
```

This lets an Ultravisor workflow use Facto as a transform-only worker without storing anything in the warehouse. Useful for distributed pipelines where the transform step and the storage step are on different machines.

## Best Practices

- **One mapping per source.** Don't try to make a single mapping handle two source schemas -- register two mappings instead. Each mapping can be edited, versioned, and disabled independently.
- **Be explicit about types.** `number({population})` is clearer and safer than relying on `{population}` to stay a string. Explicit coercions surface bad data early.
- **Keep GUID templates stable.** Once a mapping is in production, avoid changing its `GUIDTemplate` -- doing so means every historical record is considered a new entity and the projection effectively restarts from scratch.
- **Version breaking changes.** Bump `SchemaVersion` when you change field names or types so the audit trail makes sense.
- **Use the flow diagram.** The full web UI renders each mapping as a flow diagram from input columns to output fields. It is the easiest way to spot missing fields, typos, and accidental over-substitution.
- **Test mappings in isolation.** Before wiring a mapping into a production projection, run it through the `FactoTransform.ApplyMapping` beacon (or a local unit test) against a handful of sample records.

## Cross-References

- [Projection subsystem](projection.md) -- the engine that runs mappings
- [Recordset subsystem](recordset.md) -- the records mappings transform
- [Connection subsystem](connection.md) -- where mapping output lands
- [Ultravisor Integration](../ultravisor-integration.md) -- `FactoTransform.ApplyMapping`
- [meadow-integration](https://github.com/stevenvelozo/meadow-integration) -- `TabularTransform` documentation and the full expression language
