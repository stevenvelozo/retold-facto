/**
 * Retold Facto - Schema Manager Service
 *
 * Manages schema definitions, versioning, documentation, and dataset linking.
 * Provides endpoints for schema CRUD beyond the auto-generated Meadow endpoints,
 * including documentation management, versioning, and MicroDDL compilation.
 *
 * @author Steven Velozo <steven@velozo.com>
 */
const libFableServiceProviderBase = require('fable-serviceproviderbase');

const defaultSchemaManagerOptions = (
	{
		RoutePrefix: '/facto'
	});

class RetoldFactoSchemaManager extends libFableServiceProviderBase
{
	constructor(pFable, pOptions, pServiceHash)
	{
		let tmpOptions = Object.assign({}, defaultSchemaManagerOptions, pOptions);
		super(pFable, tmpOptions, pServiceHash);

		this.serviceType = 'RetoldFactoSchemaManager';
	}

	/**
	 * Compute a simple hash of a DDL/schema definition string.
	 *
	 * Uses bitwise shift operations to produce a deterministic hash,
	 * prefixed with 'ddl-' and rendered as a hex string.
	 *
	 * @param {string} pText - The text to hash
	 * @returns {string} The computed hash string (e.g. 'ddl-1a2b3c')
	 */
	_computeSchemaHash(pText)
	{
		let tmpHash = 0;
		for (let i = 0; i < pText.length; i++)
		{
			tmpHash = ((tmpHash << 5) - tmpHash + pText.charCodeAt(i)) | 0;
		}
		return 'ddl-' + Math.abs(tmpHash).toString(16);
	}

	/**
	 * Parse a MicroDDL text into a structured schema object.
	 *
	 * Symbol map:
	 *   @ = ID (AutoIdentity)
	 *   % = GUID (AutoGUID)
	 *   $ = String
	 *   * = Text (large string)
	 *   # = Numeric
	 *   . = Decimal
	 *   & = DateTime
	 *   ^ = Boolean / Deleted
	 *
	 * @param {string} pDDL - The MicroDDL text
	 * @returns {object} Parsed schema with Tables map
	 */
	_parseMicroDDL(pDDL)
	{
		let tmpLines = pDDL.split('\n');
		let tmpTables = {};
		let tmpCurrentTable = null;

		let tmpSymbolMap =
		{
			'@': { DataType: 'ID', MeadowType: 'AutoIdentity' },
			'%': { DataType: 'GUID', MeadowType: 'AutoGUID' },
			'$': { DataType: 'String', MeadowType: 'String' },
			'*': { DataType: 'Text', MeadowType: 'String' },
			'#': { DataType: 'Numeric', MeadowType: 'Numeric' },
			'.': { DataType: 'Decimal', MeadowType: 'Numeric' },
			'&': { DataType: 'DateTime', MeadowType: 'String' },
			'^': { DataType: 'Boolean', MeadowType: 'Deleted' }
		};

		for (let i = 0; i < tmpLines.length; i++)
		{
			let tmpLine = tmpLines[i].trim();

			// Skip blank lines and comments
			if (!tmpLine || tmpLine.startsWith('//') || tmpLine.startsWith('--'))
			{
				continue;
			}

			// Skip join references
			if (tmpLine.startsWith('->'))
			{
				continue;
			}

			// Table declaration
			if (tmpLine.startsWith('!'))
			{
				let tmpTableName = tmpLine.substring(1).trim();
				tmpCurrentTable =
				{
					TableName: tmpTableName,
					Columns: []
				};
				tmpTables[tmpTableName] = tmpCurrentTable;
				continue;
			}

			// Column definition
			let tmpSymbol = tmpLine.charAt(0);
			if (tmpSymbolMap.hasOwnProperty(tmpSymbol) && tmpCurrentTable)
			{
				let tmpRest = tmpLine.substring(1).trim();
				let tmpParts = tmpRest.split(/\s+/);
				let tmpColumnName = tmpParts[0] || '';
				let tmpSize = tmpParts[1] || 'Default';

				tmpCurrentTable.Columns.push(
				{
					Column: tmpColumnName,
					DataType: tmpSymbolMap[tmpSymbol].DataType,
					Size: tmpSize
				});
			}
		}

		return { Tables: tmpTables };
	}

	/**
	 * Connect REST API routes for schema management.
	 *
	 * @param {object} pOratorServiceServer - The Orator service server instance
	 */
	connectRoutes(pOratorServiceServer)
	{
		let tmpRoutePrefix = this.options.RoutePrefix;

		// GET /facto/schemas/active -- list all active (non-deleted) schemas
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/schemas/active`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.FactoSchema)
				{
					pResponse.send({ Error: 'Schema DAL not initialized', Schemas: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.FactoSchema.query.clone()
					.addFilter('Deleted', 0)
					.addFilter('Active', 1)
					.setCap(500);

				this.fable.DAL.FactoSchema.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error listing active schemas: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Schemas: [] });
							return fNext();
						}
						pResponse.send({ Active: true, Count: pRecords.length, Schemas: pRecords });
						return fNext();
					});
			});

		// GET /facto/schema/:IDSchema/summary -- get a schema with its stats
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/schema/:IDSchema/summary`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchema)
				{
					pResponse.send({ Error: 'Schema DAL not initialized' });
					return fNext();
				}

				let tmpAnticipate = this.fable.newAnticipate();
				let tmpResult = { IDSchema: tmpIDSchema, Schema: false, DocumentationCount: 0, VersionCount: 0, DatasetCount: 0 };

				// Load the schema record
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						let tmpQuery = this.fable.DAL.FactoSchema.query.clone()
							.addFilter('IDSchema', tmpIDSchema);
						this.fable.DAL.FactoSchema.doRead(tmpQuery,
							(pError, pQuery, pRecord) =>
							{
								if (!pError && pRecord)
								{
									tmpResult.Schema = pRecord;
								}
								return fStep();
							});
					});

				// Count documentation entries
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.FactoSchemaDocumentation)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.FactoSchemaDocumentation.query.clone()
							.addFilter('IDSchema', tmpIDSchema)
							.addFilter('Deleted', 0);
						this.fable.DAL.FactoSchemaDocumentation.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.DocumentationCount = pCount;
								}
								return fStep();
							});
					});

				// Count versions
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.FactoSchemaVersion)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.FactoSchemaVersion.query.clone()
							.addFilter('IDSchema', tmpIDSchema)
							.addFilter('Deleted', 0);
						this.fable.DAL.FactoSchemaVersion.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.VersionCount = pCount;
								}
								return fStep();
							});
					});

				// Count datasets linked to this schema
				tmpAnticipate.anticipate(
					(fStep) =>
					{
						if (!this.fable.DAL.Dataset)
						{
							return fStep();
						}
						let tmpQuery = this.fable.DAL.Dataset.query.clone()
							.addFilter('IDSchema', tmpIDSchema)
							.addFilter('Deleted', 0);
						this.fable.DAL.Dataset.doCount(tmpQuery,
							(pError, pQuery, pCount) =>
							{
								if (!pError)
								{
									tmpResult.DatasetCount = pCount;
								}
								return fStep();
							});
					});

				tmpAnticipate.wait(
					(pError) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send(tmpResult);
						return fNext();
					});
			});

		// PUT /facto/schema/:IDSchema/activate -- mark a schema as active
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/schema/:IDSchema/activate`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchema)
				{
					pResponse.send({ Error: 'Schema DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.FactoSchema.query.clone()
					.addRecord({ IDSchema: tmpIDSchema, Active: 1 });

				this.fable.DAL.FactoSchema.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error activating schema ${tmpIDSchema}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Schema: pRecord });
						return fNext();
					});
			});

		// PUT /facto/schema/:IDSchema/deactivate -- mark a schema as inactive
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/schema/:IDSchema/deactivate`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchema)
				{
					pResponse.send({ Error: 'Schema DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.FactoSchema.query.clone()
					.addRecord({ IDSchema: tmpIDSchema, Active: 0 });

				this.fable.DAL.FactoSchema.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error deactivating schema ${tmpIDSchema}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Schema: pRecord });
						return fNext();
					});
			});

		// GET /facto/schema/:IDSchema/documentation -- list documentation for a schema
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/schema/:IDSchema/documentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter', Documentation: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchemaDocumentation)
				{
					pResponse.send({ Error: 'SchemaDocumentation DAL not initialized', Documentation: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.FactoSchemaDocumentation.query.clone()
					.addFilter('IDSchema', tmpIDSchema)
					.addFilter('Deleted', 0);

				this.fable.DAL.FactoSchemaDocumentation.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error listing documentation for schema ${tmpIDSchema}: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Documentation: [] });
							return fNext();
						}
						pResponse.send({ IDSchema: tmpIDSchema, Count: pRecords.length, Documentation: pRecords });
						return fNext();
					});
			});

		// POST /facto/schema/:IDSchema/documentation -- create a documentation record
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/schema/:IDSchema/documentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchemaDocumentation)
				{
					pResponse.send({ Error: 'SchemaDocumentation DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpRecord =
				{
					IDSchema: tmpIDSchema,
					Name: tmpBody.Name || 'Untitled',
					DocumentType: tmpBody.DocumentType || 'markdown',
					MimeType: tmpBody.MimeType || 'text/markdown',
					Content: tmpBody.Content || '',
					Description: tmpBody.Description || ''
				};

				let tmpQuery = this.fable.DAL.FactoSchemaDocumentation.query.clone()
					.addRecord(tmpRecord);

				this.fable.DAL.FactoSchemaDocumentation.doCreate(tmpQuery,
					(pError, pQuery, pQueryRead, pCreatedRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error creating documentation for schema ${tmpIDSchema}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Documentation: pCreatedRecord });
						return fNext();
					});
			});

		// GET /facto/schema/:IDSchema/documentation/:IDSchemaDocumentation -- read a single doc
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/schema/:IDSchema/documentation/:IDSchemaDocumentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				let tmpIDDoc = parseInt(pRequest.params.IDSchemaDocumentation, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1 || isNaN(tmpIDDoc) || tmpIDDoc < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema or IDSchemaDocumentation parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchemaDocumentation)
				{
					pResponse.send({ Error: 'SchemaDocumentation DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.FactoSchemaDocumentation.query.clone()
					.addFilter('IDSchemaDocumentation', tmpIDDoc)
					.addFilter('IDSchema', tmpIDSchema)
					.addFilter('Deleted', 0);

				this.fable.DAL.FactoSchemaDocumentation.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError)
						{
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						if (!pRecord)
						{
							pResponse.send({ Error: `Documentation ${tmpIDDoc} not found for schema ${tmpIDSchema}` });
							return fNext();
						}
						pResponse.send({ Documentation: pRecord });
						return fNext();
					});
			});

		// PUT /facto/schema/:IDSchema/documentation/:IDSchemaDocumentation -- update a doc
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/schema/:IDSchema/documentation/:IDSchemaDocumentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				let tmpIDDoc = parseInt(pRequest.params.IDSchemaDocumentation, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1 || isNaN(tmpIDDoc) || tmpIDDoc < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema or IDSchemaDocumentation parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchemaDocumentation)
				{
					pResponse.send({ Error: 'SchemaDocumentation DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpUpdateRecord = { IDSchemaDocumentation: tmpIDDoc };
				if (tmpBody.hasOwnProperty('Name')) tmpUpdateRecord.Name = tmpBody.Name;
				if (tmpBody.hasOwnProperty('Content')) tmpUpdateRecord.Content = tmpBody.Content;
				if (tmpBody.hasOwnProperty('Description')) tmpUpdateRecord.Description = tmpBody.Description;

				let tmpQuery = this.fable.DAL.FactoSchemaDocumentation.query.clone()
					.addRecord(tmpUpdateRecord);

				this.fable.DAL.FactoSchemaDocumentation.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pUpdatedRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error updating documentation ${tmpIDDoc}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Documentation: pUpdatedRecord });
						return fNext();
					});
			});

		// DELETE /facto/schema/:IDSchema/documentation/:IDSchemaDocumentation -- soft-delete a doc
		pOratorServiceServer.doDel(`${tmpRoutePrefix}/schema/:IDSchema/documentation/:IDSchemaDocumentation`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				let tmpIDDoc = parseInt(pRequest.params.IDSchemaDocumentation, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1 || isNaN(tmpIDDoc) || tmpIDDoc < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema or IDSchemaDocumentation parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchemaDocumentation)
				{
					pResponse.send({ Error: 'SchemaDocumentation DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.FactoSchemaDocumentation.query.clone()
					.addRecord({ IDSchemaDocumentation: tmpIDDoc, Deleted: 1, DeleteDate: new Date().toISOString() });

				this.fable.DAL.FactoSchemaDocumentation.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error deleting documentation ${tmpIDDoc}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, Deleted: tmpIDDoc });
						return fNext();
					});
			});

		// POST /facto/schema/:IDSchema/documentation/upload -- upload a file (image, pdf, etc.)
		// Body: { Filename, ContentType, Data } where Data is base64-encoded file content
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/schema/:IDSchema/documentation/upload`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter' });
					return fNext();
				}

				let tmpFilename = pRequest.body && pRequest.body.Filename;
				let tmpData = pRequest.body && pRequest.body.Data;
				if (!tmpFilename || !tmpData)
				{
					pResponse.send({ Error: 'Filename and Data (base64) are required' });
					return fNext();
				}

				let tmpPath = require('path');
				let tmpFS = require('fs');

				// Sanitize filename: keep only alphanumeric, hyphens, underscores, dots
				let tmpSafeFilename = tmpFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
				// Prefix with timestamp to avoid collisions
				let tmpTimestamp = Date.now();
				let tmpFinalFilename = tmpTimestamp + '-' + tmpSafeFilename;

				// Build target directory: data/schema-docs/{IDSchema}/
				let tmpDataDir = this.fable.settings.DataDirectory || tmpPath.join(process.cwd(), 'data');
				let tmpSchemaDocsDir = tmpPath.join(tmpDataDir, 'schema-docs', String(tmpIDSchema));

				// Ensure directory exists
				tmpFS.mkdirSync(tmpSchemaDocsDir, { recursive: true });

				// Decode base64 and write
				let tmpBuffer = Buffer.from(tmpData, 'base64');
				let tmpFilePath = tmpPath.join(tmpSchemaDocsDir, tmpFinalFilename);

				tmpFS.writeFile(tmpFilePath, tmpBuffer,
					(pError) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error writing file ${tmpFilePath}: ${pError}`);
							pResponse.send({ Error: 'Failed to write file: ' + pError.message });
							return fNext();
						}

						let tmpURL = `${tmpRoutePrefix}/schema/${tmpIDSchema}/documentation/files/${tmpFinalFilename}`;
						pResponse.send({ Success: true, URL: tmpURL, Filename: tmpFinalFilename });
						return fNext();
					});
			});

		// GET /facto/schema/:IDSchema/documentation/files/:Filename -- serve an uploaded file
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/schema/:IDSchema/documentation/files/:Filename`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				let tmpFilename = pRequest.params.Filename;
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1 || !tmpFilename)
				{
					pResponse.send(404, { Error: 'Not found' });
					return fNext();
				}

				let tmpPath = require('path');
				let tmpFS = require('fs');

				// Sanitize to prevent path traversal
				let tmpSafeFilename = tmpPath.basename(tmpFilename);
				let tmpDataDir = this.fable.settings.DataDirectory || tmpPath.join(process.cwd(), 'data');
				let tmpFilePath = tmpPath.join(tmpDataDir, 'schema-docs', String(tmpIDSchema), tmpSafeFilename);

				if (!tmpFS.existsSync(tmpFilePath))
				{
					pResponse.send(404, { Error: 'File not found' });
					return fNext();
				}

				// Determine content type from extension
				let tmpExt = tmpPath.extname(tmpSafeFilename).toLowerCase();
				let tmpContentTypes =
				{
					'.png': 'image/png',
					'.jpg': 'image/jpeg',
					'.jpeg': 'image/jpeg',
					'.gif': 'image/gif',
					'.webp': 'image/webp',
					'.svg': 'image/svg+xml',
					'.pdf': 'application/pdf',
					'.md': 'text/markdown',
					'.txt': 'text/plain'
				};
				let tmpContentType = tmpContentTypes[tmpExt] || 'application/octet-stream';

				let tmpFileData = tmpFS.readFileSync(tmpFilePath);
				pResponse.setHeader('Content-Type', tmpContentType);
				pResponse.setHeader('Content-Length', tmpFileData.length);
				pResponse.writeHead(200);
				pResponse.write(tmpFileData);
				pResponse.end();
				return fNext();
			});

		// GET /facto/schema/:IDSchema/versions -- list schema versions
		pOratorServiceServer.doGet(`${tmpRoutePrefix}/schema/:IDSchema/versions`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter', Versions: [] });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchemaVersion)
				{
					pResponse.send({ Error: 'SchemaVersion DAL not initialized', Versions: [] });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.FactoSchemaVersion.query.clone()
					.addFilter('IDSchema', tmpIDSchema)
					.addFilter('Deleted', 0)
					.addSort({ Column: 'Version', Direction: 'Descending' });

				this.fable.DAL.FactoSchemaVersion.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error listing versions for schema ${tmpIDSchema}: ${pError}`);
							pResponse.send({ Error: pError.message || pError, Versions: [] });
							return fNext();
						}
						pResponse.send({ IDSchema: tmpIDSchema, Count: pRecords.length, Versions: pRecords });
						return fNext();
					});
			});

		// POST /facto/schema/:IDSchema/save -- save schema definition with versioning
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/schema/:IDSchema/save`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.FactoSchema)
				{
					pResponse.send({ Error: 'Schema DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpSchemaDefinition = (typeof tmpBody.SchemaDefinition === 'string') ? tmpBody.SchemaDefinition : '';
				let tmpManyfestDefinition = (typeof tmpBody.ManyfestDefinition === 'string') ? tmpBody.ManyfestDefinition : '';

				// Load the current schema record
				let tmpQuery = this.fable.DAL.FactoSchema.query.clone()
					.addFilter('IDSchema', tmpIDSchema);

				this.fable.DAL.FactoSchema.doRead(tmpQuery,
					(pError, pQuery, pRecord) =>
					{
						if (pError || !pRecord || !pRecord.IDSchema)
						{
							pResponse.send({ Error: 'Schema not found' });
							return fNext();
						}

						// Update the schema fields
						pRecord.SchemaDefinition = tmpSchemaDefinition;
						pRecord.ManyfestDefinition = tmpManyfestDefinition;
						pRecord.Version = (pRecord.Version || 0) + 1;
						pRecord.SchemaHash = this._computeSchemaHash(tmpSchemaDefinition);

						let tmpUpdateQuery = this.fable.DAL.FactoSchema.query.clone()
							.addRecord(pRecord);

						this.fable.DAL.FactoSchema.doUpdate(tmpUpdateQuery,
							(pUpdateError, pUpdateQuery, pQueryRead, pUpdatedRecord) =>
							{
								if (pUpdateError)
								{
									this.fable.log.error(`SchemaManager error updating schema ${tmpIDSchema}: ${pUpdateError}`);
									pResponse.send({ Error: pUpdateError.message || pUpdateError });
									return fNext();
								}

								// Snapshot into a SchemaVersion record
								if (!this.fable.DAL.FactoSchemaVersion)
								{
									pResponse.send({ Success: true, Schema: pUpdatedRecord });
									return fNext();
								}

								let tmpVersionRecord =
								{
									IDSchema: tmpIDSchema,
									Version: pUpdatedRecord.Version,
									SchemaDefinition: tmpSchemaDefinition,
									ManyfestDefinition: tmpManyfestDefinition,
									SchemaHash: pUpdatedRecord.SchemaHash
								};

								let tmpVersionQuery = this.fable.DAL.FactoSchemaVersion.query.clone()
									.addRecord(tmpVersionRecord);

								this.fable.DAL.FactoSchemaVersion.doCreate(tmpVersionQuery,
									(pVersionError, pVersionQuery, pVersionQueryRead, pVersionRecord) =>
									{
										if (pVersionError)
										{
											this.fable.log.error(`SchemaManager error creating version for schema ${tmpIDSchema}: ${pVersionError}`);
										}
										pResponse.send({ Success: true, Schema: pUpdatedRecord, SchemaVersion: pVersionRecord || false });
										return fNext();
									});
							});
					});
			});

		// PUT /facto/schema/:IDSchema/compile -- compile MicroDDL text
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/schema/:IDSchema/compile`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema parameter' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpDDL = tmpBody.DDL;
				if (typeof tmpDDL !== 'string' || tmpDDL.length === 0)
				{
					pResponse.send({ Error: 'DDL text is required in the request body' });
					return fNext();
				}

				let tmpParsedSchema = this._parseMicroDDL(tmpDDL);
				let tmpSchemaHash = this._computeSchemaHash(tmpDDL);

				pResponse.send({ Success: true, IDSchema: tmpIDSchema, SchemaHash: tmpSchemaHash, ParsedSchema: tmpParsedSchema });
				return fNext();
			});

		// PUT /facto/schema/:IDSchema/link-dataset/:IDDataset -- link a dataset to this schema
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/schema/:IDSchema/link-dataset/:IDDataset`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1 || isNaN(tmpIDDataset) || tmpIDDataset < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema or IDDataset parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Error: 'Dataset DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Dataset.query.clone()
					.addRecord({ IDDataset: tmpIDDataset, IDSchema: tmpIDSchema });

				this.fable.DAL.Dataset.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error linking dataset ${tmpIDDataset} to schema ${tmpIDSchema}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, IDSchema: tmpIDSchema, IDDataset: tmpIDDataset, Dataset: pRecord });
						return fNext();
					});
			});

		// PUT /facto/schema/:IDSchema/unlink-dataset/:IDDataset -- unlink a dataset from this schema
		pOratorServiceServer.doPut(`${tmpRoutePrefix}/schema/:IDSchema/unlink-dataset/:IDDataset`,
			(pRequest, pResponse, fNext) =>
			{
				let tmpIDSchema = parseInt(pRequest.params.IDSchema, 10);
				let tmpIDDataset = parseInt(pRequest.params.IDDataset, 10);
				if (isNaN(tmpIDSchema) || tmpIDSchema < 1 || isNaN(tmpIDDataset) || tmpIDDataset < 1)
				{
					pResponse.send({ Error: 'Invalid IDSchema or IDDataset parameter' });
					return fNext();
				}

				if (!this.fable.DAL || !this.fable.DAL.Dataset)
				{
					pResponse.send({ Error: 'Dataset DAL not initialized' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Dataset.query.clone()
					.addRecord({ IDDataset: tmpIDDataset, IDSchema: 0 });

				this.fable.DAL.Dataset.doUpdate(tmpQuery,
					(pError, pQuery, pQueryRead, pRecord) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error unlinking dataset ${tmpIDDataset} from schema ${tmpIDSchema}: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}
						pResponse.send({ Success: true, IDSchema: tmpIDSchema, IDDataset: tmpIDDataset, Dataset: pRecord });
						return fNext();
					});
			});

		// ================================================================
		// Analyze Records - Discover schema from sample record content
		// ================================================================
		pOratorServiceServer.doPost(`${tmpRoutePrefix}/schemas/analyze-records`,
			(pRequest, pResponse, fNext) =>
			{
				if (!this.fable.DAL || !this.fable.DAL.Record)
				{
					pResponse.send({ Error: 'Record DAL not initialized' });
					return fNext();
				}

				let tmpBody = pRequest.body || {};
				let tmpIDDataset = parseInt(tmpBody.IDDataset, 10) || 0;
				let tmpIDSource = parseInt(tmpBody.IDSource, 10) || 0;
				let tmpSampleSize = Math.min(parseInt(tmpBody.SampleSize, 10) || 50, 200);

				if (!tmpIDDataset && !tmpIDSource)
				{
					pResponse.send({ Error: 'IDDataset or IDSource is required' });
					return fNext();
				}

				let tmpQuery = this.fable.DAL.Record.query.clone();
				tmpQuery.addFilter('Deleted', 0);
				if (tmpIDDataset) tmpQuery.addFilter('IDDataset', tmpIDDataset);
				if (tmpIDSource) tmpQuery.addFilter('IDSource', tmpIDSource);
				tmpQuery.setCap(tmpSampleSize);

				this.fable.DAL.Record.doReads(tmpQuery,
					(pError, pQuery, pRecords) =>
					{
						if (pError)
						{
							this.fable.log.error(`SchemaManager error reading records for analysis: ${pError}`);
							pResponse.send({ Error: pError.message || pError });
							return fNext();
						}

						let tmpRecords = pRecords || [];
						if (tmpRecords.length === 0)
						{
							pResponse.send({ Error: 'No records found matching the criteria', Fields: [], RecordsAnalyzed: 0 });
							return fNext();
						}

						// Analyze each record's content
						let tmpFieldMap = {};
						let tmpRecordsAnalyzed = 0;

						let tmpManyfest = this.fable.newManyfest();

						for (let i = 0; i < tmpRecords.length; i++)
						{
							let tmpContentData = null;
							try
							{
								tmpContentData = JSON.parse(tmpRecords[i].Content);
							}
							catch (e)
							{
								continue;
							}
							if (!tmpContentData || typeof tmpContentData !== 'object') continue;

							tmpRecordsAnalyzed++;

							// Use Manyfest to discover all addresses
							let tmpDiscovered = tmpManyfest.objectAddressGeneration.generateAddressses(tmpContentData);
							let tmpAddresses = Object.keys(tmpDiscovered);

							for (let j = 0; j < tmpAddresses.length; j++)
							{
								let tmpAddr = tmpAddresses[j];
								let tmpEntry = tmpDiscovered[tmpAddr];

								if (!tmpFieldMap[tmpAddr])
								{
									tmpFieldMap[tmpAddr] =
									{
										Address: tmpAddr,
										Hash: tmpAddr,
										Name: this._prettifyFieldName(tmpAddr),
										DataType: tmpEntry.DataType || 'String',
										SampleValues: [],
										Frequency: 0,
										InSchema: true
									};
								}

								tmpFieldMap[tmpAddr].Frequency++;

								// Collect sample values (up to 5)
								if (tmpEntry.Default !== undefined && tmpEntry.Default !== null && tmpEntry.Default !== '' && tmpFieldMap[tmpAddr].SampleValues.length < 5)
								{
									let tmpVal = tmpEntry.Default;
									if (typeof tmpVal === 'object') tmpVal = JSON.stringify(tmpVal);
									if (typeof tmpVal === 'string' && tmpVal.length > 100) tmpVal = tmpVal.substring(0, 100) + '\u2026';
									tmpFieldMap[tmpAddr].SampleValues.push(tmpVal);
								}
							}
						}

						// Enhanced type inference
						let tmpFields = Object.values(tmpFieldMap);
						for (let i = 0; i < tmpFields.length; i++)
						{
							let tmpField = tmpFields[i];
							// Skip non-leaf types
							if (tmpField.DataType === 'Object' || tmpField.DataType === 'Array') continue;
							// Skip fields with no samples
							if (tmpField.SampleValues.length === 0) continue;

							tmpField.DataType = this._inferEnhancedType(tmpField.SampleValues, tmpField.DataType);
						}

						// Sort fields: leaf primitives first (alphabetical), then objects/arrays
						tmpFields.sort(
							(a, b) =>
							{
								let tmpAIsContainer = (a.DataType === 'Object' || a.DataType === 'Array') ? 1 : 0;
								let tmpBIsContainer = (b.DataType === 'Object' || b.DataType === 'Array') ? 1 : 0;
								if (tmpAIsContainer !== tmpBIsContainer) return tmpAIsContainer - tmpBIsContainer;
								return a.Address.localeCompare(b.Address);
							});

						// Exclude container types from InSchema by default
						for (let i = 0; i < tmpFields.length; i++)
						{
							if (tmpFields[i].DataType === 'Object' || tmpFields[i].DataType === 'Array')
							{
								tmpFields[i].InSchema = false;
							}
						}

						pResponse.send({ Fields: tmpFields, RecordsAnalyzed: tmpRecordsAnalyzed });
						return fNext();
					});
			});

		this.fable.log.info(`SchemaManager routes connected at ${tmpRoutePrefix}/schema(s)/*`);
	}

	/**
	 * Convert a dot-path address to a human-readable name.
	 * e.g. "metadata.author_name" → "Author Name"
	 */
	_prettifyFieldName(pAddress)
	{
		// Take the last segment of the address
		let tmpParts = pAddress.split('.');
		let tmpLast = tmpParts[tmpParts.length - 1];
		// Remove array indices
		tmpLast = tmpLast.replace(/\[\d+\]/g, '');
		// Replace underscores and hyphens with spaces, then title-case
		return tmpLast
			.replace(/[_-]/g, ' ')
			.replace(/([a-z])([A-Z])/g, '$1 $2')
			.replace(/\b\w/g, function(c) { return c.toUpperCase(); })
			.trim() || pAddress;
	}

	/**
	 * Enhanced type inference from sample values.
	 */
	_inferEnhancedType(pSampleValues, pBaseType)
	{
		if (!pSampleValues || pSampleValues.length === 0) return pBaseType;

		// If already a Number from Manyfest, try to distinguish Integer vs Float
		if (pBaseType === 'Number')
		{
			let tmpAllIntegers = true;
			for (let i = 0; i < pSampleValues.length; i++)
			{
				let tmpVal = pSampleValues[i];
				if (typeof tmpVal === 'number' && !Number.isInteger(tmpVal))
				{
					tmpAllIntegers = false;
					break;
				}
			}
			return tmpAllIntegers ? 'Integer' : 'Float';
		}

		// If String, try to detect if all values are actually numbers, booleans, or dates
		if (pBaseType === 'String')
		{
			let tmpAllNumbers = true;
			let tmpAllIntegers = true;
			let tmpAllBooleans = true;
			let tmpAllDates = true;
			let tmpDatePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}([ T]\d{1,2}:\d{2}(:\d{2})?)?/;

			for (let i = 0; i < pSampleValues.length; i++)
			{
				let tmpVal = String(pSampleValues[i]).trim();
				if (tmpVal === '') continue;

				// Number check
				if (isNaN(parseFloat(tmpVal)) || !isFinite(tmpVal))
				{
					tmpAllNumbers = false;
					tmpAllIntegers = false;
				}
				else if (tmpVal.indexOf('.') >= 0)
				{
					tmpAllIntegers = false;
				}

				// Boolean check
				let tmpLower = tmpVal.toLowerCase();
				if (tmpLower !== 'true' && tmpLower !== 'false' && tmpLower !== 'yes' && tmpLower !== 'no' && tmpLower !== '1' && tmpLower !== '0')
				{
					tmpAllBooleans = false;
				}

				// Date check
				if (!tmpDatePattern.test(tmpVal))
				{
					tmpAllDates = false;
				}
			}

			if (tmpAllBooleans) return 'Boolean';
			if (tmpAllIntegers && tmpAllNumbers) return 'Integer';
			if (tmpAllNumbers) return 'Float';
			if (tmpAllDates) return 'DateTime';
		}

		return pBaseType;
	}
}

module.exports = RetoldFactoSchemaManager;
module.exports.serviceType = 'RetoldFactoSchemaManager';
module.exports.default_configuration = defaultSchemaManagerOptions;
