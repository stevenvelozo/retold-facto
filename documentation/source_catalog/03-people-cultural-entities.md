# People & Cultural Entity Data Sources

Public, free datasets for notable people (authors, actors, directors, musicians), creative works (books, movies, music), and academic/scientific figures.

---

## 1. General Notable People (Cross-Domain)

### Wikidata — Full Entity Dump
- **Provider:** Wikimedia Foundation
- **URL:** https://dumps.wikimedia.org/wikidatawiki/entities/
- **Format:** JSON (gzipped, one entity per line)
- **License:** CC0 (Public Domain)
- **Description:** The entire Wikidata knowledge base — 100M+ entities including all notable people, places, works, organizations, and concepts. Each entity has labels in 300+ languages, descriptions, aliases, statements, and cross-references to Wikipedia, IMDb, MusicBrainz, Library of Congress, etc.
- **Size:** ~130GB compressed, ~1.5TB uncompressed
- **Update Frequency:** Weekly
- **Notes:** Too large for direct import. Best used by filtering for specific entity types (Q5 = human, Q11424 = film, Q7725634 = literary work, etc.) using tools like `wikidata-filter` or SPARQL queries.

### Wikidata SPARQL API (Targeted Queries)
- **Provider:** Wikimedia Foundation
- **URL:** https://query.wikidata.org/
- **Format:** JSON, CSV, TSV (via SPARQL)
- **License:** CC0
- **Description:** Query interface to extract specific subsets. E.g., all people with occupation=author, all films directed by a specific person. Results downloadable as CSV. Rate-limited but generous for research.
- **Example Queries:**
  - All authors: `SELECT ?item ?name WHERE { ?item wdt:P106 wd:Q36180. ?item rdfs:label ?name. FILTER(LANG(?name) = "en") }`
  - All film directors: `SELECT ?item ?name WHERE { ?item wdt:P106 wd:Q2526255. ?item rdfs:label ?name. FILTER(LANG(?name) = "en") }`

### Pantheon — Historically Notable People
- **Provider:** MIT Media Lab / Pantheon Project
- **URL:** https://pantheon.world/
- **Kaggle:** https://www.kaggle.com/datasets/mit/pantheon-project
- **Format:** CSV
- **License:** CC BY-SA 4.0
- **Description:** 85,000+ historically notable people curated from Wikipedia presence across 25+ languages. Includes birth/death dates, birthplace, gender, occupation taxonomy, and Historical Popularity Index (HPI).
- **Size:** ~15MB
- **Fields:** name, birthyear, deathyear, gender, birthcountry, birthcity, occupation, industry, domain, HPI, numlangs, pageviews

### Cross-Verified Notable People Database
- **Provider:** Sciences Po (French university research)
- **URL:** https://doi.org/10.1038/s41597-022-01369-4 (paper), available via Zenodo/Figshare
- **Format:** CSV
- **License:** CC BY 4.0
- **Description:** Cross-verified database of ~2.3 million notable people from 3500 BC to 2018 AD, reconciled across Wikipedia, Wikidata, and Freebase.
- **Size:** ~200MB
- **Fields:** birth, death, gender, citizenship, occupation, notability metrics

### DBpedia — Person Entities
- **Provider:** DBpedia Association
- **URL:** https://www.dbpedia.org/resources/latest-core/
- **Format:** N-Triples, TTL (RDF)
- **License:** CC BY-SA 3.0
- **Description:** Structured data extracted from Wikipedia infoboxes. Person-specific datasets include `persondata`, `person`, and biographical info with birth/death dates, nationalities, occupations.
- **Size:** ~5GB (person-related extracts)

---

## 2. Authors & Writers

### Open Library Authors Dump
- **Provider:** Internet Archive / Open Library
- **URL:** https://openlibrary.org/developers/dumps
- **Download:** `wget https://openlibrary.org/data/ol_dump_authors_latest.txt.gz`
- **Format:** TSV (tab-separated, JSON per row)
- **License:** Open (various)
- **Description:** ~6 million author records with names, birth/death dates, alternate names, bio text, and links to works. Each row contains a JSON object with full author metadata.
- **Size:** ~1GB compressed
- **Fields:** type, key, revision, last_modified, JSON blob (name, birth_date, death_date, bio, alternate_names, links, photos)

### VIAF — Virtual International Authority File
- **Provider:** OCLC
- **URL:** https://viaf.org/en/viaf/data
- **Format:** MARC, XML, linked data
- **License:** ODC-BY (Open Data Commons Attribution)
- **Description:** Aggregated authority data from 40+ national libraries worldwide. Links personal names across Library of Congress, BnF, DNB, and many others. Covers authors, artists, composers, and other creators.
- **Size:** ~20GB
- **Notes:** Data dump downloads were paused as of Aug 2024 for security updates; API still functional. Check site for current status.

### Library of Congress Name Authority File
- **Provider:** Library of Congress
- **URL:** https://authorities.loc.gov/
- **Bulk:** https://id.loc.gov/download/
- **Format:** MARC, MADS/RDF, JSON-LD, N-Triples
- **License:** Public Domain (US Government)
- **Description:** Authoritative name records for persons, organizations, and titles used by the US Library of Congress. ~10 million name authority records. Essential for disambiguating authors.
- **Size:** ~10GB (full dump)

### Project Gutenberg Catalog
- **Provider:** Project Gutenberg
- **URL:** https://www.gutenberg.org/ebooks/offline_catalogs.html
- **CSV:** https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv.gz
- **Format:** CSV, RDF/XML
- **License:** Public Domain (catalog metadata)
- **Description:** Catalog of 70,000+ free ebooks with author names, titles, subjects, languages, and download links. CSV updated weekly, RDF updated daily.
- **Size:** CSV ~14MB, RDF ~100MB
- **Fields:** Text#, Type, Issued, Title, Language, Authors, Subjects, LoCC, Bookshelves

---

## 3. Film — Directors, Actors, Crew

### IMDb Non-Commercial Datasets
- **Provider:** IMDb (Amazon)
- **URL:** https://developer.imdb.com/non-commercial-datasets/
- **Download:** https://datasets.imdbws.com/
- **Format:** TSV (gzipped)
- **License:** Non-commercial use only (IMDb terms)
- **Description:** Seven dataset files covering titles, people, ratings, and episode relationships. Updated daily.
- **Size:** ~1GB compressed total
- **Files:**
  - `name.basics.tsv.gz` — ~12M people: name, birth/death year, primary profession, known-for titles
  - `title.basics.tsv.gz` — ~10M titles: type (movie/tvSeries/short/etc.), primary title, original title, year, runtime, genres
  - `title.crew.tsv.gz` — Directors and writers per title
  - `title.principals.tsv.gz` — Top-billed cast/crew per title with character names
  - `title.ratings.tsv.gz` — Average rating and vote count per title
  - `title.akas.tsv.gz` — Alternate titles by region/language
  - `title.episode.tsv.gz` — Episode-to-series relationships

### TMDb — The Movie Database API
- **Provider:** The Movie Database
- **URL:** https://developer.themoviedb.org/
- **Format:** JSON API
- **License:** Free for non-commercial use (API key required, free registration)
- **Description:** Community-built movie and TV database with 900K+ movies, 160K+ TV shows, and millions of people. Rich metadata: cast, crew, images, trailers, reviews, keywords, collections.
- **API Rate Limit:** 50 requests/second
- **Kaggle Exports:** https://www.kaggle.com/datasets/asaniczka/tmdb-movies-dataset-2023-930k-movies

### OMDb API
- **Provider:** OMDb (Open Movie Database)
- **URL:** https://www.omdbapi.com/
- **Format:** JSON API
- **License:** Free tier (1,000 requests/day with API key)
- **Description:** Movie and TV data sourced from IMDb and other sources. Simple API for lookups by title or IMDb ID.

---

## 4. Musicians & Music Artists

### MusicBrainz Database
- **Provider:** MetaBrainz Foundation
- **URL:** https://musicbrainz.org/doc/MusicBrainz_Database/Download
- **JSON Dumps:** https://musicbrainz.org/doc/Development/JSON_Data_Dumps
- **Format:** PostgreSQL dump, JSON (tar.xz per entity type)
- **License:** CC0 (Public Domain) for most data, CC BY-NC-SA for some
- **Description:** Open music encyclopedia with 2M+ artists, 3M+ releases, 30M+ recordings, 1.5M+ labels. Includes relationships, tags, genres, ISRCs, and links to Discogs, Wikidata, AllMusic.
- **Size:** ~30GB (full PostgreSQL), ~5GB (JSON dumps)
- **Entity Types:** Artist, Release, Recording, Release Group, Label, Area, Event, Instrument, Place, Series, Work

### Discogs Data Dumps
- **Provider:** Discogs
- **URL:** https://data.discogs.com/
- **S3:** https://discogs-data-dumps.s3.us-west-2.amazonaws.com/index.html
- **Format:** XML (gzipped)
- **License:** CC0 (Public Domain)
- **Description:** Monthly dumps of the entire Discogs database: artists, releases, labels, and master releases. 8M+ artists, 16M+ releases covering vinyl, CD, digital, and all physical formats.
- **Size:** ~10GB compressed
- **Update Frequency:** Monthly
- **Community Tools:** `discogs-xml2db` (GitHub) for importing into MySQL/PostgreSQL

### Spotify Web API
- **Provider:** Spotify
- **URL:** https://developer.spotify.com/documentation/web-api/
- **Format:** JSON API
- **License:** Free tier (API key required, rate-limited)
- **Description:** Access to Spotify's catalog: artists, albums, tracks, audio features (tempo, key, energy, danceability), playlists, and search. Good for enriching artist data with popularity metrics and audio analysis.
- **Notes:** Cannot bulk-download catalog; must query per entity. Best for enrichment, not primary data source.

### Last.fm API
- **Provider:** Last.fm (CBS Interactive)
- **URL:** https://www.last.fm/api
- **Format:** JSON/XML API
- **License:** Free (API key required)
- **Description:** Music metadata and listening data: artist info, album info, track info, tags, similar artists, top tracks, listener counts, play counts.

---

## 5. Books & Literary Works

### Open Library Editions Dump
- **Provider:** Internet Archive / Open Library
- **URL:** https://openlibrary.org/developers/dumps
- **Download:** `wget https://openlibrary.org/data/ol_dump_editions_latest.txt.gz`
- **Format:** TSV (JSON per row)
- **License:** Open
- **Description:** ~20 million edition records with ISBNs, publishers, publish dates, page counts, subjects, cover images, and links to authors.
- **Size:** ~5GB compressed

### Open Library Works Dump
- **Provider:** Internet Archive / Open Library
- **Download:** `wget https://openlibrary.org/data/ol_dump_works_latest.txt.gz`
- **Format:** TSV (JSON per row)
- **License:** Open
- **Description:** ~25 million "work" records (a work represents a book across all its editions). Links editions together and includes subjects, descriptions.
- **Size:** ~3GB compressed

### Open Library API
- **Provider:** Internet Archive
- **URL:** https://openlibrary.org/developers/api
- **Format:** JSON API
- **License:** Open
- **Description:** REST API for lookups by ISBN, OCLC, LCCN, or Open Library ID. Returns book metadata, covers, availability.

### Google Books API
- **Provider:** Google
- **URL:** https://developers.google.com/books
- **Format:** JSON API
- **License:** Free (API key, 1,000 requests/day free)
- **Description:** Search and retrieve book metadata from Google Books: title, authors, publisher, published date, description, categories, page count, ISBN, preview links.

### ISBN Ranges (International ISBN Agency)
- **Provider:** International ISBN Agency
- **URL:** https://www.isbn-international.org/range_file_generation
- **Format:** XML
- **License:** Free
- **Description:** Official ISBN range allocations by country/language group, used to parse and validate ISBNs.

### Library of Congress MARC Records
- **Provider:** Library of Congress
- **URL:** https://www.loc.gov/cds/products/
- **Format:** MARC 21
- **License:** Public Domain
- **Description:** Millions of catalog records for books, serials, maps, music, and more. MARC format can be converted to JSON/CSV with standard tools.

---

## 6. Academic & Scientific People

### OpenAlex
- **Provider:** OurResearch
- **URL:** https://docs.openalex.org/
- **S3 Snapshot:** s3://openalex (public, no auth required)
- **Format:** JSON (gzipped, on S3), REST API
- **License:** CC0 (Public Domain)
- **Description:** Fully open index of 250M+ scholarly works, 90M+ authors, 100K+ institutions, 125K+ sources (journals, repos), and 65K+ concepts. Successor to Microsoft Academic Graph.
- **Size:** ~350GB (S3 snapshot)
- **API:** https://api.openalex.org/ — free, no key required, generous rate limits

### ORCID Public Data File
- **Provider:** ORCID
- **URL:** https://orcid.figshare.com/articles/dataset/ORCID_Public_Data_File_2024/27151305
- **Format:** XML (gzipped tar)
- **License:** CC0 (Public Domain)
- **Description:** Annual snapshot of all public ORCID records — 18M+ researcher profiles with names, affiliations, works, education, employment history, and external identifiers (DOI, Scopus, ResearcherID).
- **Size:** ~100GB
- **Update Frequency:** Annual (latest: 2024)

### Semantic Scholar API
- **Provider:** Allen Institute for AI
- **URL:** https://api.semanticscholar.org/
- **Dataset:** https://www.semanticscholar.org/product/api
- **Format:** JSON API, bulk dataset
- **License:** Free (API key for higher limits)
- **Description:** Academic paper search and citation graph with 200M+ papers, 80M+ authors. Includes citation contexts, abstracts, topics, and influence scores.
- **API Rate Limit:** 1 request/second (unauthenticated), 10/second (with key)

### CrossRef API
- **Provider:** CrossRef
- **URL:** https://api.crossref.org/
- **Format:** JSON API
- **License:** Public Domain (metadata)
- **Description:** Metadata for 140M+ scholarly works registered with DOIs. Includes authors, titles, journals, citations, funders, licenses. Polite pool with good rate limits.
- **API Rate Limit:** 50 requests/second (with contact email in User-Agent)

---

## 7. General Knowledge Bases (Multi-Domain)

### Freebase (Archived)
- **Provider:** Google (archived by community)
- **URL:** https://developers.google.com/freebase/ (documentation)
- **Data:** Available on archive.org and academic torrents
- **Format:** N-Triples (RDF)
- **License:** CC BY 2.5
- **Description:** Archived collaborative knowledge base with 46M+ entities covering people, places, things, media. No longer updated but valuable historical reference. Data migrated to Wikidata.
- **Size:** ~400GB uncompressed

### Wikipedia Dumps
- **Provider:** Wikimedia Foundation
- **URL:** https://dumps.wikimedia.org/
- **Format:** XML, SQL
- **License:** CC BY-SA 4.0
- **Description:** Complete dumps of all Wikipedia editions. Useful for extracting biographical articles, filmographies, discographies, and bibliographies with full text.
- **Size:** English Wikipedia ~22GB compressed (articles only)
- **Update Frequency:** Biweekly
