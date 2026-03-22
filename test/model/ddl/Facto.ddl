!Source
@IDSource
%GUIDSource
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
$Name 200
$Type 64
$URL 512
$Protocol 32
*Description
*Configuration
^Active

!SourceDocumentation
@IDSourceDocumentation
%GUIDSourceDocumentation
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDSource -> IDSource
$Name 200
$DocumentType 64
$MimeType 128
$StorageKey 256
*Description
*Content

!Dataset
@IDDataset
%GUIDDataset
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
$Name 200
$Type 32
*Description
$SchemaHash 64
#SchemaVersion
*SchemaDefinition
$VersionPolicy 16

!DatasetSource
@IDDatasetSource
%GUIDDatasetSource
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDDataset -> IDDataset
#IDSource -> IDSource
.ReliabilityWeight 5,4

!Record
@IDRecord
%GUIDRecord
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDDataset -> IDDataset
#IDSource -> IDSource
$Type 64
$SchemaHash 64
#SchemaVersion
#Version
#IDIngestJob
&IngestDate
&OriginCreateDate
#RepresentedTimeStampStart
#RepresentedTimeStampStop
#RepresentedDuration
*Content

!RecordBinary
@IDRecordBinary
%GUIDRecordBinary
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDRecord -> IDRecord
$MimeType 128
$StorageKey 256
#FileSize

!CertaintyIndex
@IDCertaintyIndex
%GUIDCertaintyIndex
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDRecord -> IDRecord
.CertaintyValue 5,4
$Dimension 128
*Justification

!IngestJob
@IDIngestJob
%GUIDIngestJob
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDSource -> IDSource
#IDDataset -> IDDataset
$Status 32
&StartDate
&EndDate
#RecordsProcessed
#RecordsCreated
#RecordsUpdated
#RecordsErrored
*Configuration
*Log
#DatasetVersion
$ContentSignature 128

!SourceCatalogEntry
@IDSourceCatalogEntry
%GUIDSourceCatalogEntry
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
$Agency 200
$Name 200
$Type 64
$URL 512
$Protocol 32
$Category 128
$Region 128
$UpdateFrequency 64
*Description
*Notes
^Verified

!CatalogDatasetDefinition
@IDCatalogDatasetDefinition
%GUIDCatalogDatasetDefinition
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDSourceCatalogEntry -> IDSourceCatalogEntry
$Name 200
$Format 32
$MimeType 128
$EndpointURL 512
*Description
*ParseOptions
*AuthRequirements
$VersionPolicy 16
^Provisioned
#IDSource
#IDDataset

!MultiSetProjection
@IDMultiSetProjection
%GUIDMultiSetProjection
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDDataset -> IDDataset
#IDProjectionStore -> IDProjectionStore
$Name 200
*Description
*PipelineConfiguration
^Active

!ProjectionCertaintyLog
@IDProjectionCertaintyLog
%GUIDProjectionCertaintyLog
&CreateDate
#CreatingIDUser
&UpdateDate
#UpdatingIDUser
^Deleted
&DeleteDate
#DeletingIDUser
#IDMultiSetProjection -> IDMultiSetProjection
$RecordGUID 256
.CertaintyValue 5,4
$SourceMappingLabel 200
#IDProjectionMapping -> IDProjectionMapping
$Action 32
*Details
