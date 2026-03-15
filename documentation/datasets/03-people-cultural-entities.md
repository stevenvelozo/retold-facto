# People & Cultural Entities — Dataset Descriptions

Named entities — the people who create, perform, research, and are notable. These datasets link heavily to the Media & Entertainment catalog for creative works.

---

## General Notable People (Cross-Domain)

### Wikidata Full Entity Dump
- **What it is:** The entire Wikidata knowledge base — 100M+ entities including all notable people, places, works, organizations, and concepts. Each entity has labels in 300+ languages, descriptions, aliases, statements, and cross-references to Wikipedia, IMDb, MusicBrainz, Library of Congress, etc.
- **Certainty:** High for well-known entities, variable for obscure ones. Community-edited with some vandalism, but self-correcting. The universal cross-reference hub.
- **Download method:** Download weekly JSON dump from Wikimedia. WARNING: This is enormous (~130GB compressed, ~1.5TB uncompressed). Best approach is to filter for specific entity types using `wikidata-filter` rather than importing the whole thing.
- **URL:** `https://dumps.wikimedia.org/wikidatawiki/entities/`
- **Format:** JSON (gzipped, one entity per line)
- **Size:** ~130GB compressed, ~1.5TB uncompressed
- **License:** CC0
- **Updates:** Weekly

### Wikidata SPARQL API
- **What it is:** Query interface to extract targeted subsets of Wikidata. Can get all people by occupation, all films by director, etc. Results downloadable as CSV.
- **Certainty:** Same as full dump — it's the same data, just queried.
- **Download method:** HTTP SPARQL queries. Rate-limited but generous for research. Results export as CSV/JSON.
- **URL:** `https://query.wikidata.org/`
- **Format:** JSON, CSV, TSV via SPARQL
- **License:** CC0

### Pantheon — Historically Notable People
- **What it is:** 85,000+ historically notable people curated from Wikipedia presence across 25+ languages. Includes birth/death dates, birthplace, gender, occupation taxonomy, and Historical Popularity Index (HPI).
- **Certainty:** High. Academic project (MIT Media Lab) with documented methodology. Good for "who is notable" but limited to people with significant Wikipedia presence.
- **Download method:** Download CSV from Kaggle (free account required) or Pantheon website.
- **URL:** `https://pantheon.world/`
- **Kaggle:** `https://www.kaggle.com/datasets/mit/pantheon-project`
- **Format:** CSV
- **Size:** ~15MB
- **License:** CC BY-SA 4.0

### Cross-Verified Notable People Database
- **What it is:** 2.3 million notable people from 3500 BC to 2018 AD, cross-verified across Wikipedia, Wikidata, and Freebase. Published as academic research (Sciences Po / Nature Scientific Data).
- **Certainty:** Very high. Peer-reviewed academic dataset with documented reconciliation methodology.
- **Download method:** Download from Zenodo/Figshare (linked from the paper DOI).
- **URL:** `https://doi.org/10.1038/s41597-022-01369-4`
- **Format:** CSV
- **Size:** ~200MB
- **License:** CC BY 4.0

### DBpedia Person Entities
- **What it is:** Structured data extracted from Wikipedia infoboxes. Person-specific datasets include biographical info with birth/death dates, nationalities, occupations.
- **Certainty:** Medium-high. Automated extraction from Wikipedia infoboxes — quality depends on Wikipedia article quality. Can have parsing errors.
- **Download method:** Download N-Triples/TTL files from DBpedia.
- **URL:** `https://www.dbpedia.org/resources/latest-core/`
- **Format:** N-Triples, TTL (RDF)
- **Size:** ~5GB (person-related extracts)
- **License:** CC BY-SA 3.0

---

## Authors & Writers

### Open Library Authors Dump
- **What it is:** ~6 million author records with names, birth/death dates, alternate names, bio text, and links to works.
- **Certainty:** Medium-high. Comprehensive but community-contributed, so data quality varies. Many duplicate/stub entries.
- **Download method:** Direct wget of gzipped TSV dump.
- **Command:** `wget https://openlibrary.org/data/ol_dump_authors_latest.txt.gz`
- **URL:** `https://openlibrary.org/developers/dumps`
- **Format:** TSV (JSON per row)
- **Size:** ~1GB compressed
- **License:** Open (various)
- **Updates:** Monthly

### VIAF — Virtual International Authority File
- **What it is:** Aggregated authority data from 40+ national libraries worldwide. Links personal names across Library of Congress, BnF, DNB, and many others.
- **Certainty:** Very high. Gold standard for name authority — this is what librarians use to disambiguate authors.
- **Download method:** Data dump downloads were paused as of Aug 2024 for security updates. API still functional. Check site for current bulk download status.
- **URL:** `https://viaf.org/en/viaf/data`
- **Format:** MARC, XML, linked data
- **Size:** ~20GB
- **License:** ODC-BY

### Library of Congress Name Authority File
- **What it is:** ~10 million authoritative name records for persons, organizations, and titles used by the Library of Congress. Essential for disambiguating authors.
- **Certainty:** Very high. Definitive US authority file.
- **Download method:** Bulk download from id.loc.gov.
- **URL:** `https://id.loc.gov/download/`
- **Format:** MARC, MADS/RDF, JSON-LD, N-Triples
- **Size:** ~10GB
- **License:** Public Domain (US Government)

### Project Gutenberg Catalog
- **What it is:** Catalog of 70,000+ free ebooks with author names, titles, subjects, languages, and download links.
- **Certainty:** Very high for the catalog metadata. Covers public domain works only.
- **Download method:** Direct download of CSV or RDF.
- **CSV:** `https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv.gz`
- **RDF:** `https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2`
- **Format:** CSV (~14MB), RDF/XML (~100MB)
- **License:** Public Domain
- **Updates:** CSV weekly, RDF daily

---

## Film — Directors, Actors, Crew

### IMDb Non-Commercial Datasets
- **What it is:** Seven TSV files covering 10M+ titles, 13M+ people, ratings, and episode relationships. Updated daily.
- **Certainty:** Very high for film/TV data. The industry standard. Non-commercial license is a constraint.
- **Download method:** Direct HTTP download of gzipped TSV files.
- **URL:** `https://datasets.imdbws.com/`
- **Files:** name.basics, title.basics, title.crew, title.principals, title.ratings, title.akas, title.episode
- **Format:** TSV (gzipped)
- **Size:** ~1.5GB compressed total
- **License:** Non-commercial use only
- **Updates:** Daily

### TMDb — The Movie Database API
- **What it is:** Community-built movie and TV database with 900K+ movies, 170K+ TV shows. Rich metadata: cast, crew, images, trailers, reviews, keywords, collections.
- **Certainty:** High. Large active community. Good complement to IMDb with more permissive terms.
- **Download method:** REST API with free API key. Daily bulk ID export files also available.
- **URL:** `https://developer.themoviedb.org/`
- **Format:** JSON API
- **Rate Limit:** ~40 req/10 seconds
- **License:** Free for non-commercial use

### OMDb API
- **What it is:** Movie and TV data lookups by title or IMDb ID. Returns plot, actors, year, poster, ratings from IMDb/Rotten Tomatoes/Metacritic.
- **Certainty:** High. Pulls from IMDb and other sources.
- **Download method:** REST API with free API key (1K requests/day).
- **URL:** `https://www.omdbapi.com/`
- **Format:** JSON API
- **License:** Free tier (1K daily)

---

## Musicians & Music Artists

### MusicBrainz Database
- **What it is:** Open music encyclopedia: 2.6M+ artists, 3M+ releases, 35M+ recordings, 1.5M+ labels. Includes relationships, tags, genres, ISRCs, and links to Discogs, Wikidata, AllMusic.
- **Certainty:** Very high. The gold standard for open music metadata. Professionally moderated with strict editing guidelines.
- **Download method:** Download PostgreSQL dumps (full DB) or JSON dumps (per entity type) from MusicBrainz FTP. REST API also available (1 req/sec).
- **URL:** `https://musicbrainz.org/doc/MusicBrainz_Database/Download`
- **JSON Dumps:** `http://ftp.musicbrainz.org/pub/musicbrainz/data/json-dumps/`
- **Format:** PostgreSQL dump (~30GB), JSON dumps (~5GB)
- **License:** CC0 (core data), CC BY-NC-SA (some supplemental)
- **Updates:** Twice weekly

### Discogs Data Dumps
- **What it is:** Monthly dumps of entire Discogs database: 8M+ artists, 16M+ releases covering vinyl, CD, digital, and all physical formats.
- **Certainty:** Very high. Massive community effort (Discogs is the primary record-collecting database). Particularly strong on physical releases and obscure labels.
- **Download method:** Download gzipped XML from Discogs data page or S3 bucket.
- **URL:** `https://data.discogs.com/`
- **S3:** `https://discogs-data-dumps.s3.us-west-2.amazonaws.com/index.html`
- **Format:** XML (gzipped)
- **Size:** ~10GB compressed
- **License:** CC0
- **Updates:** Monthly

---

## Books & Literary Works

### Open Library Editions & Works Dumps
- **What it is:** ~20M edition records (ISBNs, publishers, page counts) and ~25M work records (a work = a book across all editions).
- **Certainty:** Medium-high. Very comprehensive but community-contributed with quality variations. Many stub/duplicate records.
- **Download method:** Direct wget of gzipped TSV dumps.
- **Editions:** `wget https://openlibrary.org/data/ol_dump_editions_latest.txt.gz` (~5GB compressed)
- **Works:** `wget https://openlibrary.org/data/ol_dump_works_latest.txt.gz` (~3GB compressed)
- **URL:** `https://openlibrary.org/developers/dumps`
- **Format:** TSV (JSON per row)
- **License:** Open
- **Updates:** Monthly

### ISBN Ranges
- **What it is:** Official ISBN range allocations by country/language group for parsing and validating ISBNs.
- **Certainty:** Very high. Official International ISBN Agency data.
- **Download method:** Download XML from ISBN International.
- **URL:** `https://www.isbn-international.org/range_file_generation`
- **Format:** XML
- **License:** Free

---

## Academic & Scientific People

### OpenAlex
- **What it is:** Fully open index of 250M+ scholarly works, 90M+ authors, 100K+ institutions. Successor to Microsoft Academic Graph.
- **Certainty:** Very high. CC0 licensed, actively maintained, widely used in scientometrics.
- **Download method:** Download from public S3 bucket (no auth needed) or use REST API (free, no key required).
- **S3:** `s3://openalex` (public)
- **API:** `https://api.openalex.org/`
- **Format:** JSON (gzipped on S3)
- **Size:** ~350GB (S3 snapshot)
- **License:** CC0

### ORCID Public Data File
- **What it is:** Annual snapshot of all public ORCID records — 18M+ researcher profiles with names, affiliations, works, education, employment history.
- **Certainty:** Very high. Official ORCID data.
- **Download method:** Download from Figshare.
- **URL:** `https://orcid.figshare.com/articles/dataset/ORCID_Public_Data_File_2024/27151305`
- **Format:** XML (gzipped tar)
- **Size:** ~100GB
- **License:** CC0
- **Updates:** Annual

### Semantic Scholar API
- **What it is:** 200M+ papers, 80M+ authors with citation graph, abstracts, topics, and influence scores.
- **Certainty:** Very high. Allen Institute for AI, academic quality.
- **Download method:** REST API (1 req/sec unauthenticated, 10/sec with key) or bulk dataset.
- **URL:** `https://api.semanticscholar.org/`
- **Format:** JSON API
- **License:** Free

### CrossRef API
- **What it is:** Metadata for 140M+ scholarly works with DOIs: authors, titles, journals, citations, funders, licenses.
- **Certainty:** Very high. The DOI registration agency's own metadata.
- **Download method:** REST API — no auth required. Include contact email in User-Agent for polite pool (50 req/sec).
- **URL:** `https://api.crossref.org/`
- **Format:** JSON API
- **License:** Public Domain (metadata)

---

## General Knowledge Bases

### Freebase (Archived)
- **What it is:** Archived collaborative knowledge base with 46M+ entities covering people, places, things, media. No longer updated but valuable historical reference.
- **Certainty:** Medium. Archived since 2016, data migrated to Wikidata. Still useful as a historical snapshot.
- **Download method:** Available on archive.org and academic torrents.
- **Format:** N-Triples (RDF)
- **Size:** ~400GB uncompressed
- **License:** CC BY 2.5

### Wikipedia Dumps
- **What it is:** Complete dumps of all Wikipedia editions. Useful for extracting biographical articles, filmographies, discographies.
- **Certainty:** Medium-high. Community-edited encyclopedia — very good for well-known topics, variable for obscure ones.
- **Download method:** Download from Wikimedia dumps site.
- **URL:** `https://dumps.wikimedia.org/`
- **Format:** XML, SQL
- **Size:** English ~22GB compressed (articles only)
- **License:** CC BY-SA 4.0
- **Updates:** Biweekly
