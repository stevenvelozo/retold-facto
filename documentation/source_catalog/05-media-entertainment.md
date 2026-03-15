# Facto Source Catalog — 05: Media & Entertainment

Datasets covering movies, TV shows, music, books, video games, podcasts, comics, radio, theater, and awards.

---

## 1. Movies

### IMDb Non-Commercial Datasets
- **Provider:** IMDb / Amazon
- **URL:** https://datasets.imdbws.com/
- **Documentation:** https://developer.imdb.com/non-commercial-datasets/
- **Format:** Gzipped TSV, refreshed daily
- **License:** Non-commercial use only
- **Files:**
  - `title.basics.tsv.gz` — tconst, titleType, primaryTitle, originalTitle, isAdult, startYear, endYear, runtimeMinutes, genres
  - `title.ratings.tsv.gz` — tconst, averageRating, numVotes
  - `title.crew.tsv.gz` — tconst, directors, writers
  - `title.principals.tsv.gz` — tconst, ordering, nconst, category, job, characters
  - `title.akas.tsv.gz` — localized titles with region/language
  - `title.episode.tsv.gz` — episode-to-series mapping with season/episode numbers
  - `name.basics.tsv.gz` — nconst, primaryName, birthYear, deathYear, primaryProfession, knownForTitles
- **Size:** ~10M+ titles, ~13M+ people, ~7M+ episodes. ~1.5GB compressed total.

### TMDb (The Movie Database) API
- **Provider:** TMDb
- **URL:** https://developer.themoviedb.org/reference/intro/getting-started
- **Format:** REST API, JSON
- **License:** Free for non-commercial use; attribution required
- **Description:** 900K+ movies, 170K+ TV shows. Endpoints for search, discover, details, credits, images, videos, reviews. Daily bulk ID export files available.
- **Auth:** Free API key required
- **Rate Limits:** ~40 requests/10 seconds

### OMDb API (Open Movie Database)
- **Provider:** OMDb (Community)
- **URL:** https://www.omdbapi.com/
- **Format:** REST API, JSON/XML
- **License:** Free tier (1,000 daily requests)
- **Description:** Movie/series lookup by title or IMDb ID. Returns plot, actors, year, poster, ratings from IMDb/Rotten Tomatoes/Metacritic.
- **Auth:** Free API key required

### MovieLens Datasets
- **Provider:** GroupLens Research (University of Minnesota)
- **URL:** https://grouplens.org/datasets/movielens/
- **Format:** ZIP archives containing CSV files
- **License:** Free for research and education (non-commercial)
- **Versions:**
  - **MovieLens 32M** — 32M ratings, 2M tag applications, 87,585 movies, 200,948 users
  - **MovieLens 25M** — 25M ratings, 62,000 movies
  - **MovieLens 100K** — 100K ratings, 1,700 movies (classic benchmark)
- **Description:** Real user ratings and tags, widely used for recommendation system research.

### Wikidata Films (SPARQL)
- **Provider:** Wikimedia Foundation
- **URL:** https://query.wikidata.org/sparql
- **Format:** JSON, CSV, TSV via SPARQL
- **License:** CC0
- **Description:** Hundreds of thousands of film entities with director (P57), cast (P161), publication date (P577), genre (P136), IMDb ID (P345), TMDb ID (P4947). Universal cross-reference hub.

---

## 2. TV Shows & Series

### IMDb Episodes
- **URL:** https://datasets.imdbws.com/title.episode.tsv.gz
- **Format:** Gzipped TSV
- **License:** Non-commercial
- **Description:** Episode-level data linking episodes to parent series with season/episode numbers. Cross-reference with title.basics for metadata.
- **Size:** ~7M+ episode records

### TVMaze API
- **Provider:** TVMaze
- **URL:** https://www.tvmaze.com/api
- **Format:** REST API, JSON (HAL/HATEOAS)
- **License:** Free for non-commercial; CC BY-SA for data
- **Endpoints:** Show search, show detail, all episodes, seasons, daily schedule, change feed
- **Size:** 70K+ shows with comprehensive episode data
- **Auth:** None for public API

### TheTVDB API (v4)
- **Provider:** TheTVDB
- **URL:** https://thetvdb.github.io/v4-api/
- **Format:** REST API, JSON
- **License:** Free for personal/open-source
- **Endpoints:** Series search, series detail, episodes by season, movies, people
- **Auth:** Free API key required

### Trakt API
- **Provider:** Trakt.tv
- **URL:** https://trakt.docs.apiary.io/
- **Format:** REST API, JSON
- **License:** Free for non-commercial
- **Description:** Viewing history tracking, ratings, watchlists. Strong cross-referencing of IMDb/TMDb/TVDB IDs. Trending/popular endpoints.
- **Auth:** Free Client ID required

### TMDb TV Endpoints
- **URL:** https://developer.themoviedb.org/reference/getting-started
- **Format:** REST API, JSON
- **License:** Free with attribution
- **Description:** 170K+ TV shows with season/episode detail, cast/crew, aggregate credits.
- **Auth:** Free API key

---

## 3. Music Albums & Recordings

### MusicBrainz Database
- **Provider:** MetaBrainz Foundation
- **Downloads:** https://musicbrainz.org/doc/MusicBrainz_Database/Download
- **JSON Dumps:** http://ftp.musicbrainz.org/pub/musicbrainz/data/json-dumps/
- **API:** https://musicbrainz.org/doc/MusicBrainz_API (1 req/sec)
- **Format:** PostgreSQL dumps, JSON dumps, REST API (JSON/XML)
- **License:** Core data CC0; supplemental data CC BY-NC-SA 3.0
- **Size:** ~2.6M artists, ~4.7M releases, ~35.2M recordings, 6M+ cover art images
- **Description:** The most comprehensive open music encyclopedia. Entities: Artist, Release Group, Release, Recording, Work, Label, Area, Event, Series. Dumps twice weekly.

### Discogs Monthly Data Dumps
- **Provider:** Discogs
- **URL:** https://data.discogs.com/
- **S3 Index:** https://discogs-data-dumps.s3.us-west-2.amazonaws.com/index.html
- **Format:** Gzipped XML, monthly
- **License:** CC0
- **Files:**
  - `discogs_{date}_releases.xml.gz` — ~950MB compressed
  - `discogs_{date}_artists.xml.gz` — ~320MB compressed
  - `discogs_{date}_labels.xml.gz`
  - `discogs_{date}_masters.xml.gz`
- **Size:** ~16M+ releases, ~9M+ artists
- **Description:** Massive user-contributed discography covering all formats (vinyl, CD, digital, cassette). Detailed tracklists, credits, labels, format info.

### Spotify Web API
- **Provider:** Spotify
- **URL:** https://developer.spotify.com/documentation/web-api
- **Format:** REST API, JSON
- **License:** Free for development; Spotify Developer Terms
- **Endpoints:** Search (albums/artists/tracks), artist detail, artist albums, album tracks, audio features (tempo, key, energy, danceability)
- **Auth:** OAuth 2.0; free Spotify developer account

### Last.fm API
- **Provider:** Last.fm / CBS Interactive
- **URL:** https://www.last.fm/api
- **Format:** REST API, JSON/XML
- **License:** Free for non-commercial
- **Endpoints:** artist.getInfo, artist.getTopAlbums, artist.getTopTracks, album.getInfo, track.search, chart endpoints, tag browsing
- **Auth:** Free API key required

### AcousticBrainz (Archived)
- **Provider:** MetaBrainz Foundation
- **URL:** https://acousticbrainz.org/download
- **Format:** JSON (zstandard compressed), CSV
- **License:** CC0
- **Size:** 29.5M audio analysis submissions
- **Description:** Audio feature analysis (tempo, key, mood, genre predictions, timbral features) linked to MusicBrainz recordings. Project discontinued 2022 but all data preserved.

### ListenBrainz
- **Provider:** MetaBrainz Foundation
- **URL:** https://listenbrainz.org/data/
- **Documentation:** https://listenbrainz.readthedocs.io/en/latest/users/listenbrainz-dumps.html
- **Format:** Data dumps (full and incremental daily)
- **License:** CC BY-SA / CC0
- **Description:** Open listening history data (user scrobbles) indexed against MusicBrainz. Useful for recommendation systems.

---

## 4. Books & Literary Works

### Open Library Bulk Dumps
- **Provider:** Internet Archive
- **URL:** https://openlibrary.org/developers/dumps
- **API:** https://openlibrary.org/developers/api
- **Format:** TSV with JSON records (gzipped); REST API returns JSON
- **License:** Open (varies by field)
- **Size:** ~30M+ editions, ~9M+ authors, ~22M+ works
- **Description:** Comprehensive bibliographic database with ISBNs, titles, authors, publishers, subjects, cover images. Monthly bulk dumps plus real-time REST API.

### Project Gutenberg Catalog
- **Provider:** Project Gutenberg
- **URL:** https://www.gutenberg.org/ebooks/offline_catalogs.html
- **CSV:** https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv.gz
- **RDF:** https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2
- **Format:** CSV (~14MB), RDF/XML (~100MB compressed)
- **License:** Public Domain
- **Size:** ~73,000+ ebooks
- **Description:** Metadata catalog for all Project Gutenberg ebooks (title, author, subject, language, download links). Full texts also freely downloadable.

### Library of Congress MARC Records
- **Provider:** Library of Congress
- **URL:** https://www.loc.gov/cds/products/marcDist.php
- **Format:** MARC 21 (UTF-8 and XML)
- **License:** Public Domain (US Government)
- **Size:** ~25 million records
- **Description:** Bibliographic records covering books, serials, manuscripts, maps, music, sound recordings, visual materials.

### Google Books API
- **Provider:** Google
- **URL:** https://developers.google.com/books/docs/v1/getting_started
- **Format:** REST API, JSON
- **License:** Free with API key
- **Description:** Massive books index: title, author, publisher, publication date, description, page count, categories, ISBNs, cover images, preview links.
- **Auth:** Free API key (Google Cloud Console)

### CrossRef API
- **Provider:** CrossRef
- **URL:** https://api.crossref.org/
- **Documentation:** https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- **Format:** REST API, JSON
- **License:** Free, open access (metadata is public)
- **Size:** 165M+ scholarly works with DOIs
- **Description:** Bibliographic metadata for scholarly publications: title, authors, journal, DOI, references, funding, license. No auth required; include contact email for polite pool.

### Goodreads Datasets (Archived)
- **Provider:** Various (Kaggle, UCSD)
- **URLs:**
  - https://www.kaggle.com/datasets/jealousleopard/goodreadsbooks (~11K books)
  - https://www.kaggle.com/datasets/mdhamani/goodreads-books-100k (100K books)
  - UCSD Book Graph: https://mengtingwan.github.io/data/goodreads.html (~2.36M books, 876K users, 229M interactions)
- **Format:** CSV
- **License:** Research/non-commercial
- **Description:** Archived Goodreads data including book metadata, user ratings, reviews, and shelving data. UCSD Book Graph is particularly comprehensive.

---

## 5. Video Games

### IGDB API
- **Provider:** Twitch / Amazon
- **URL:** https://api-docs.igdb.com/
- **Format:** REST API (Apicalypse query language), JSON
- **License:** Free for non-commercial
- **Endpoints:** Games, platforms, genres, companies, characters, game engines — all with rich filtering
- **Auth:** Twitch OAuth client credentials (free Twitch developer account)

### RAWG API
- **Provider:** RAWG.io
- **URL:** https://rawg.io/apidocs
- **Format:** REST API, JSON
- **License:** Free for personal/startup use; attribution required
- **Size:** 500,000+ games
- **Description:** Extensive metadata: descriptions, genres, release dates, store links, ESRB ratings, playtime, Metacritic scores, system requirements, screenshots, DLCs, franchises.
- **Auth:** Free API key required

### Giant Bomb API
- **Provider:** Giant Bomb / Fandom
- **URL:** https://www.giantbomb.com/api/documentation/
- **Format:** REST API, JSON/XML
- **License:** Non-commercial only
- **Description:** Wiki-style database: games, characters, concepts, franchises, companies, platforms, reviews.
- **Auth:** Free API key required
- **Rate Limits:** 200 requests/resource/hour

### MobyGames API
- **Provider:** MobyGames
- **URL:** https://www.mobygames.com/info/api/
- **Format:** REST API, JSON
- **License:** Non-commercial (free tier); paid plans available
- **Description:** Oldest and most detailed video game database, covering games across all platforms from the 1970s to present.
- **Rate Limits:** 360 requests/hour, max 1/second

### Steam Web API + SteamSpy
- **Steam API:** https://steamcommunity.com/dev
  - `GET /ISteamApps/GetAppList/v2/` — full list of all Steam apps
  - `GET /appdetails?appids={id}` — store details
  - Auth: Free Steam API key
- **SteamSpy:** https://steamspy.com/api.php
  - Owner estimates, genre browsing, top games
  - `GET /api.php?request=all&page={n}` — all games, 1000/page
  - Auth: None; Rate: 1 req/sec (1 req/60sec for `all`)

### Kaggle Video Game Datasets
- **URLs:**
  - Steam Games Dataset 2025: https://www.kaggle.com/datasets/artermiloff/steam-games-dataset
  - RAWG Game Dataset: https://www.kaggle.com/datasets/jummyegg/rawg-game-dataset
  - Video Games Sales: https://www.kaggle.com/datasets/sidtwr/videogames-sales-dataset
- **Format:** CSV
- **License:** Various
- **Description:** Pre-extracted snapshots useful for analytics without API rate limits.

---

## 6. Podcasts

### Podcast Index API
- **Provider:** Podcast Index LLC
- **URL:** https://podcastindex-org.github.io/docs-api/
- **Registration:** https://api.podcastindex.org/
- **Format:** REST API, JSON
- **License:** Free and open
- **Size:** ~4.5M+ podcasts indexed
- **Endpoints:** Search by term, podcast by feed ID, episodes by feed ID, recent feeds, category list
- **Description:** The largest open podcast directory. Community-driven, pro-open-web. Supports Podcasting 2.0 features (chapters, transcripts, value tags).
- **Auth:** Free API key + API secret required

### iTunes Search API (Apple Podcasts)
- **Provider:** Apple
- **URL:** https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html
- **Format:** REST API, JSON
- **License:** Free
- **Endpoints:** `GET /search?term={query}&media=podcast`, `GET /lookup?id={itunesId}&entity=podcastEpisode`
- **Rate Limits:** ~20 calls/minute
- **Auth:** None required

### Listen Notes API
- **Provider:** Listen Notes
- **URL:** https://www.listennotes.com/api/docs/
- **Format:** REST API, JSON
- **License:** Free plan available (limited)
- **Size:** 3.7M+ podcasts, 190M+ episodes
- **Description:** Podcast search engine with genre classification, listen scores, audience demographics. Test mode (no key) at `listen-api-test.listennotes.com`.

---

## 7. Comics & Graphic Novels

### Comic Vine API
- **Provider:** Comic Vine / Fandom
- **URL:** https://comicvine.gamespot.com/api/documentation
- **Format:** REST API, JSON/XML
- **License:** Non-commercial only
- **Endpoints:** Issues, characters, volumes, publishers, story arcs, teams, creators — search and detail
- **Description:** Largest comic book database online. Covers all publishers (Marvel, DC, Image, Dark Horse, etc.).
- **Auth:** Free API key required
- **Rate Limits:** 200 requests/resource/hour

### Marvel Comics API
- **Provider:** Marvel Entertainment
- **URL:** https://developer.marvel.com/documentation/generalinfo
- **Format:** REST API (GET only), JSON
- **License:** Free for non-commercial; attribution required
- **Endpoints:** Characters, comics, series, creators, events, stories
- **Description:** Official Marvel data covering the full Marvel Comics universe.
- **Auth:** Free API key + hash authentication

### Grand Comics Database (GCD)
- **Provider:** GCD (nonprofit)
- **URL:** https://www.comics.org/
- **Downloads:** https://www.comics.org/download/ (SQLite3 dumps)
- **Format:** SQLite3 database dumps; CSV per-issue exports
- **License:** CC BY
- **Description:** International volunteer-run database covering all printed comics worldwide. Series, issues, stories, publishers, cover art metadata. One of the most comprehensive comic databases.

### SuperHero API
- **Provider:** Community
- **URL:** https://superheroapi.com/
- **Open-source:** https://akabab.github.io/superhero-api/api/
- **Format:** REST API, JSON
- **License:** Free
- **Description:** Multi-universe superhero data (Marvel, DC, others): power stats, biography, appearance, connections. ~730 characters.
- **Auth:** Free API key (or none for open-source version)

---

## 8. Radio & Broadcast

### FCC Broadcast Station Databases
- **Provider:** Federal Communications Commission (US)
- **URL:** https://www.fcc.gov/media/radio/cdbs-database-public-files
- **All Datasets:** https://www.fcc.gov/general/download-fcc-datasets
- **AM Query:** https://www.fcc.gov/media/radio/am-query
- **FM Query:** https://www.fcc.gov/media/radio/fm-query
- **TV Query:** https://www.fcc.gov/media/television/tv-query
- **Format:** Pipe-delimited text files; web query with export
- **License:** Public Domain (US Government)
- **Description:** Complete database of all licensed AM, FM, and TV broadcast stations in the US: call signs, frequencies, coordinates, licensee info, power, antenna patterns, facility status.

### RadioBrowser API
- **Provider:** Community (open-source)
- **URL:** https://api.radio-browser.info/
- **Documentation:** https://docs.radio-browser.info/
- **Format:** REST API, JSON/XML/CSV
- **License:** Free and open-source
- **Endpoints:** Search by name/country/language/tag, station detail, countries list, languages list, tags list
- **Size:** 40,000+ internet radio stations worldwide
- **Description:** Community-maintained database of internet radio stations with stream URLs, codec info, bitrate, language, country, tags.
- **Auth:** None required

---

## 9. Theater & Performing Arts

### Internet Broadway Database (IBDB)
- **Provider:** The Broadway League
- **URL:** https://www.ibdb.com/
- **Format:** Web-based (no public API)
- **License:** Free to browse
- **Description:** Official source for Broadway theater information: production statistics, dates, cast/crew credits, song lists, awards, photos, gross/attendance data. All Broadway productions from earliest records to present.
- **Note:** No public API. For programmatic access, use Wikidata SPARQL queries as an alternative.

### Wikidata Performing Arts (SPARQL)
- **Provider:** Wikimedia Foundation
- **URL:** https://query.wikidata.org/sparql
- **WikiProject:** https://www.wikidata.org/wiki/Wikidata:WikiProject_Performing_arts
- **Format:** SPARQL endpoint, JSON/CSV/TSV
- **License:** CC0
- **Description:** Theatrical works, operas, ballets, musicals, performances, venues, performers. Properties include cast (P161), director (P57), location (P276), date (P577). Enriched by Swiss Theatre Collection and other archives.

---

## 10. Awards & Recognition

### Academy Awards (Oscars)
- **Official:** https://awardsdatabase.oscars.org/ (web search only)
- **GitHub (CSV):** https://github.com/DLu/oscar_data — all nominations with IMDb IDs
- **GitHub (JSON):** https://github.com/delventhalz/json-nominations — complete JSON list
- **Kaggle:** https://www.kaggle.com/datasets/unanimad/the-oscar-award (1927-2025)
- **Format:** CSV, JSON
- **License:** Open/community
- **Description:** All Oscar nominations and winners from 1927 to present with cross-references to IMDb IDs.

### Grammy Awards
- **Kaggle:** https://www.kaggle.com/datasets/unanimad/grammy-awards
- **Kaggle (Extended):** https://www.kaggle.com/datasets/johnpendenque/grammy-winners-and-nominees-from-1965-to-2024
- **Format:** CSV
- **License:** Community/open
- **Description:** Grammy winners and nominees 1965-2024: category, artist, work, year.

### Emmy Awards
- **Official:** https://www.televisionacademy.com/awards/awards-search (web only)
- **Kaggle:** https://www.kaggle.com/datasets/unanimad/emmy-awards (1949-2019)
- **Format:** CSV
- **License:** Community
- **Description:** Historical Emmy nominations and winners data.

### Nobel Prize API
- **Provider:** Nobel Prize Foundation
- **URL:** https://nobelprize.readme.io/reference/getting-started
- **Developer Zone:** https://www.nobelprize.org/about/developer-zone-2/
- **Format:** REST API, JSON/CSV
- **License:** CC0 (free, open data)
- **Endpoints:** `GET /2.1/nobelPrizes` (all prizes), `GET /2.1/laureates` (all laureates), detail by ID
- **Description:** Complete data on all Nobel Prizes and laureates (persons and organizations). Updated at announcement time.
- **Auth:** None required

### Pulitzer Prize Data
- **Official:** https://www.pulitzer.org/prize-winners-by-year (web)
- **API:** `https://pulitzer.org/cache/api/1/finalist/all/{tid}/raw.json` (by category term ID)
- **Scraper:** https://github.com/jonseitz/pulitzer-scraper (Node.js, outputs CSV)
- **Format:** JSON (API), CSV (scraped)
- **License:** Open/community
- **Description:** All Pulitzer Prize winners and finalists by category.

### Wikidata Awards (SPARQL — All Major Awards)
- **URL:** https://query.wikidata.org/sparql
- **License:** CC0
- **Description:** All major awards modeled in Wikidata. Query winners via P166 (award received). Covers: Academy Awards (Q19020), Grammy (Q41254), Emmy (Q123737), Tony (Q191874), BAFTA, Golden Globe, Hugo, Nebula, Booker, and hundreds more. Cross-links to IMDb, TMDb, MusicBrainz.

---

## Cross-Reference Identifiers

Key identifiers to maintain for entity resolution across media datasets:

| Identifier | Domain | Format | Used By |
|------------|--------|--------|---------|
| IMDb tconst | Film/TV titles | tt0000001 | IMDb, TMDb, Wikidata, Trakt |
| IMDb nconst | Film/TV people | nm0000001 | IMDb, TMDb, Wikidata |
| TMDb ID | Film/TV | Numeric | TMDb, Wikidata, Trakt |
| MusicBrainz MBID | Music | UUID | MusicBrainz, ListenBrainz, AcousticBrainz |
| Discogs ID | Music | Numeric | Discogs, MusicBrainz |
| Spotify URI | Music | spotify:artist:xxx | Spotify, MusicBrainz |
| ISBN-10/13 | Books | Numeric | Open Library, Google Books, CrossRef |
| DOI | Scholarly | 10.xxxx/xxxx | CrossRef, OpenAlex, Semantic Scholar |
| OLID | Books | OLxxxxxxx | Open Library |
| Wikidata QID | Universal | Qxxxxxxx | Wikidata (links to all above) |
| IGDB ID | Games | Numeric | IGDB, Twitch |
| GCD ID | Comics | Numeric | Grand Comics Database |
| Podcast GUID | Podcasts | UUID | Podcast Index |
| Apple iTunes ID | Multi-media | Numeric | iTunes Search, Apple Podcasts |
