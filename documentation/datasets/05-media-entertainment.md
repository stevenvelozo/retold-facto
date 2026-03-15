# Media & Entertainment — Dataset Descriptions

Film, TV, music, books, video games, podcasts, comics, radio, and awards. These datasets overlap with the People & Cultural Entities catalog — people here are in their role as creators of works.

---

## Movies

### IMDb Non-Commercial Datasets
- **What it is:** Seven daily-refreshed TSV files covering 10M+ titles, 13M+ people, 7M+ episodes, ratings, and crew data. The industry standard for film/TV metadata.
- **Certainty:** Very high. Authoritative source for film/TV data.
- **Download method:** Direct HTTP download of gzipped TSV files.
- **URL:** `https://datasets.imdbws.com/`
- **Files:** title.basics, title.ratings, title.crew, title.principals, title.akas, title.episode, name.basics
- **Format:** TSV (gzipped)
- **Size:** ~1.5GB compressed total
- **License:** Non-commercial use only
- **Updates:** Daily

### TMDb API
- **What it is:** 900K+ movies, 170K+ TV shows with cast, crew, images, trailers, reviews, keywords, collections.
- **Certainty:** High. Large active community, good complement to IMDb.
- **Download method:** REST API with free API key. Daily bulk ID exports available.
- **URL:** `https://developer.themoviedb.org/`
- **Format:** JSON API
- **Rate Limit:** ~40 req/10 seconds
- **License:** Free for non-commercial use

### OMDb API
- **What it is:** Simple movie/TV lookup by title or IMDb ID. Returns plot, actors, year, poster, multi-source ratings.
- **Certainty:** High.
- **Download method:** REST API with free API key (1K req/day).
- **URL:** `https://www.omdbapi.com/`
- **Format:** JSON API
- **License:** Free tier

### MovieLens Datasets
- **What it is:** Real user ratings and tags: 32M ratings, 87K+ movies, 200K+ users. Classic recommendation system benchmark.
- **Certainty:** Very high for what it is (user ratings, not metadata). Academic standard.
- **Download method:** Download ZIP from GroupLens.
- **URL:** `https://grouplens.org/datasets/movielens/`
- **Format:** CSV (in ZIP)
- **Size:** Varies by version (32M version is largest)
- **License:** Free for research/education (non-commercial)

---

## TV Shows & Series

### TVMaze API
- **What it is:** 70K+ shows with comprehensive episode data, seasons, daily schedule, and change feed.
- **Certainty:** High. Well-maintained, good coverage of international shows.
- **Download method:** REST API — no auth required for public endpoints.
- **URL:** `https://www.tvmaze.com/api`
- **Format:** JSON API (HAL/HATEOAS)
- **License:** Free for non-commercial; CC BY-SA for data

### TheTVDB API v4
- **What it is:** Series, episodes, movies, people with detailed metadata.
- **Certainty:** High. Long-running community project, widely used by media center software.
- **Download method:** REST API with free API key.
- **URL:** `https://thetvdb.github.io/v4-api/`
- **Format:** JSON API
- **License:** Free for personal/open-source

### Trakt API
- **What it is:** Viewing history tracking, ratings, watchlists. Strong cross-referencing of IMDb/TMDb/TVDB IDs.
- **Certainty:** High for cross-referencing IDs. Viewing data is user-contributed.
- **Download method:** REST API with free Client ID.
- **URL:** `https://trakt.docs.apiary.io/`
- **Format:** JSON API
- **License:** Free for non-commercial

---

## Music Albums & Recordings

### MusicBrainz Database
- **What it is:** 2.6M+ artists, 4.7M+ releases, 35M+ recordings. The most comprehensive open music encyclopedia with strict editorial standards.
- **Certainty:** Very high. Professional moderation, strict data standards. Gold standard for open music metadata.
- **Download method:** PostgreSQL dumps (full DB, ~30GB) or JSON dumps per entity type (~5GB) from MusicBrainz FTP. REST API available at 1 req/sec.
- **URL:** `https://musicbrainz.org/doc/MusicBrainz_Database/Download`
- **JSON Dumps:** `http://ftp.musicbrainz.org/pub/musicbrainz/data/json-dumps/`
- **Format:** PostgreSQL dump, JSON (tar.xz)
- **License:** CC0 (core), CC BY-NC-SA (supplemental)
- **Updates:** Twice weekly

### Discogs Monthly Data Dumps
- **What it is:** 9M+ artists, 16M+ releases covering all formats. Massive user-contributed discography with detailed tracklists, credits, labels.
- **Certainty:** Very high. Particularly strong on physical releases, obscure labels, and non-English music.
- **Download method:** Download gzipped XML from Discogs data page or S3 bucket.
- **URL:** `https://data.discogs.com/`
- **S3:** `https://discogs-data-dumps.s3.us-west-2.amazonaws.com/index.html`
- **Files:** releases (~950MB gz), artists (~320MB gz), labels, masters
- **Format:** XML (gzipped)
- **Size:** ~10GB compressed total
- **License:** CC0
- **Updates:** Monthly

### AcousticBrainz (Archived)
- **What it is:** 29.5M audio analysis submissions (tempo, key, mood, genre predictions, timbral features) linked to MusicBrainz recordings.
- **Certainty:** High for what it is. Project discontinued 2022 but data preserved. No updates.
- **Download method:** Download archived dumps.
- **URL:** `https://acousticbrainz.org/download`
- **Format:** JSON (zstd), CSV
- **License:** CC0

### ListenBrainz
- **What it is:** Open listening history (user scrobbles) indexed against MusicBrainz.
- **Certainty:** High. Official MetaBrainz project.
- **Download method:** Download full and incremental daily dumps.
- **URL:** `https://listenbrainz.org/data/`
- **Format:** Data dumps
- **License:** CC BY-SA / CC0

---

## Books & Literary Works

### Open Library Bulk Dumps
- **What it is:** 30M+ editions, 9M+ authors, 22M+ works. Comprehensive bibliographic database with ISBNs, publishers, subjects, cover images.
- **Certainty:** Medium-high. Very comprehensive but community-contributed with quality variations.
- **Download method:** Direct wget of gzipped TSV dumps. Monthly updates.
- **URL:** `https://openlibrary.org/developers/dumps`
- **Format:** TSV (JSON per row, gzipped)
- **Size:** Editions ~5GB, Works ~3GB, Authors ~1GB (all compressed)
- **License:** Open (various)

### Project Gutenberg Catalog
- **What it is:** 73,000+ free ebook metadata: title, author, subject, language, download links.
- **Certainty:** Very high.
- **Download method:** Direct download.
- **CSV:** `https://www.gutenberg.org/cache/epub/feeds/pg_catalog.csv.gz`
- **RDF:** `https://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2`
- **Format:** CSV (~14MB), RDF/XML (~100MB compressed)
- **License:** Public Domain

### Library of Congress MARC Records
- **What it is:** ~25 million bibliographic records covering books, serials, manuscripts, maps, music, sound recordings, visual materials.
- **Certainty:** Very high. Definitive US library catalog.
- **Download method:** Download MARC 21 files from LC.
- **URL:** `https://www.loc.gov/cds/products/marcDist.php`
- **Format:** MARC 21 (UTF-8 and XML)
- **License:** Public Domain (US Government)

### Goodreads Datasets (Archived)
- **What it is:** Archived Goodreads data. UCSD Book Graph is the most comprehensive: 2.36M books, 876K users, 229M interactions.
- **Certainty:** Medium. Archived snapshots — no longer updated since Goodreads API was shut down.
- **Download method:** Download from Kaggle or UCSD project page.
- **URLs:**
  - Kaggle (11K books): `https://www.kaggle.com/datasets/jealousleopard/goodreadsbooks`
  - Kaggle (100K): `https://www.kaggle.com/datasets/mdhamani/goodreads-books-100k`
  - UCSD Book Graph: `https://mengtingwan.github.io/data/goodreads.html`
- **Format:** CSV
- **License:** Research/non-commercial

---

## Video Games

### IGDB API
- **What it is:** Games, platforms, genres, companies, characters, game engines — all with rich filtering via Apicalypse query language.
- **Certainty:** High. Backed by Twitch/Amazon. The primary game database API.
- **Download method:** REST API with Twitch OAuth (free Twitch developer account).
- **URL:** `https://api-docs.igdb.com/`
- **Format:** JSON API
- **License:** Free for non-commercial

### RAWG API
- **What it is:** 500,000+ games with descriptions, genres, release dates, store links, ESRB ratings, playtime, Metacritic scores, screenshots, DLCs.
- **Certainty:** High. Large database, well-maintained.
- **Download method:** REST API with free API key.
- **URL:** `https://rawg.io/apidocs`
- **Format:** JSON API
- **License:** Free for personal/startup use

### Giant Bomb API
- **What it is:** Wiki-style database: games, characters, concepts, franchises, companies, platforms.
- **Certainty:** High. Long-running, editorially maintained.
- **Download method:** REST API with free API key (200 req/resource/hour).
- **URL:** `https://www.giantbomb.com/api/documentation/`
- **Format:** JSON/XML API
- **License:** Non-commercial only

### MobyGames API
- **What it is:** Oldest and most detailed video game database, covering games across all platforms from the 1970s to present.
- **Certainty:** Very high for historical games. Particularly strong on pre-2000 titles.
- **Download method:** REST API with free API key (360 req/hour, 1/sec).
- **URL:** `https://www.mobygames.com/info/api/`
- **Format:** JSON API
- **License:** Non-commercial (free tier)

### Steam Web API + SteamSpy
- **What it is:** Full list of Steam apps, store details, and community-estimated owner counts.
- **Certainty:** High for Steam-specific data. SteamSpy estimates are approximations.
- **Download method:**
  - Steam: REST API with free Steam API key. `GET /ISteamApps/GetAppList/v2/` for full app list.
  - SteamSpy: REST API, no auth, 1 req/sec.
- **URLs:**
  - Steam: `https://steamcommunity.com/dev`
  - SteamSpy: `https://steamspy.com/api.php`
- **Format:** JSON API
- **License:** Free (Steam API key) / None (SteamSpy)

---

## Podcasts

### Podcast Index API
- **What it is:** 4.5M+ podcasts indexed. The largest open podcast directory, community-driven, pro-open-web.
- **Certainty:** High. Actively maintained, supports Podcasting 2.0 features.
- **Download method:** REST API with free API key + secret.
- **URL:** `https://podcastindex-org.github.io/docs-api/`
- **Registration:** `https://api.podcastindex.org/`
- **Format:** JSON API
- **License:** Free and open

### iTunes Search API
- **What it is:** Apple Podcasts search — search for podcasts and look up episodes.
- **Certainty:** High for Apple-listed podcasts.
- **Download method:** REST API — no auth required. ~20 calls/min.
- **URL:** `https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html`
- **Format:** JSON API
- **License:** Free

### Listen Notes API
- **What it is:** 3.7M+ podcasts, 190M+ episodes with genre classification, listen scores, audience demographics.
- **Certainty:** High.
- **Download method:** REST API with API key (free plan available, limited).
- **URL:** `https://www.listennotes.com/api/docs/`
- **Format:** JSON API
- **License:** Free plan (limited)

---

## Comics & Graphic Novels

### Comic Vine API
- **What it is:** Largest comic book database: issues, characters, volumes, publishers, story arcs, teams, creators across all publishers.
- **Certainty:** High. Long-running, comprehensive.
- **Download method:** REST API with free API key (200 req/resource/hour).
- **URL:** `https://comicvine.gamespot.com/api/documentation`
- **Format:** JSON/XML API
- **License:** Non-commercial only

### Marvel Comics API
- **What it is:** Official Marvel data: characters, comics, series, creators, events, stories.
- **Certainty:** Very high. Official Marvel source.
- **Download method:** REST API with free API key + hash authentication.
- **URL:** `https://developer.marvel.com/documentation/generalinfo`
- **Format:** JSON API
- **License:** Free for non-commercial

### Grand Comics Database (GCD)
- **What it is:** International volunteer-run database covering all printed comics worldwide. Series, issues, stories, publishers.
- **Certainty:** High. Very comprehensive, especially for non-US comics.
- **Download method:** Download SQLite3 dumps or CSV exports.
- **URL:** `https://www.comics.org/download/`
- **Format:** SQLite3, CSV
- **License:** CC BY

---

## Radio & Broadcast

### FCC Broadcast Station Databases
- **What it is:** All licensed AM, FM, and TV broadcast stations in the US: call signs, frequencies, coordinates, licensee info, power.
- **Certainty:** Very high. Official FCC regulatory data.
- **Download method:** Download pipe-delimited text from FCC or query via web interface.
- **URL:** `https://www.fcc.gov/general/download-fcc-datasets`
- **Format:** Pipe-delimited text
- **License:** Public Domain (US Government)

### RadioBrowser API
- **What it is:** 40,000+ internet radio stations worldwide with stream URLs, codec info, bitrate, language, country, tags.
- **Certainty:** Medium-high. Community-maintained, stream URLs may go stale.
- **Download method:** REST API — no auth required.
- **URL:** `https://api.radio-browser.info/`
- **Format:** JSON/XML/CSV API
- **License:** Free and open-source

---

## Awards & Recognition

### Academy Awards (Oscars)
- **What it is:** All Oscar nominations and winners from 1927 to present with cross-references to IMDb IDs.
- **Certainty:** Very high. Well-maintained community datasets based on official records.
- **Download method:** Download CSV/JSON from GitHub or Kaggle.
- **URLs:**
  - GitHub (CSV with IMDb IDs): `https://github.com/DLu/oscar_data`
  - GitHub (JSON): `https://github.com/delventhalz/json-nominations`
  - Kaggle: `https://www.kaggle.com/datasets/unanimad/the-oscar-award`
- **Format:** CSV, JSON
- **License:** Open/community

### Grammy Awards
- **What it is:** Winners and nominees 1965-2024.
- **Certainty:** High. Community-compiled from official records.
- **Download method:** Download from Kaggle (free account).
- **URL:** `https://www.kaggle.com/datasets/unanimad/grammy-awards`
- **Format:** CSV
- **License:** Community/open

### Emmy Awards
- **What it is:** Nominations and winners 1949-2019.
- **Certainty:** High. Community-compiled.
- **Download method:** Download from Kaggle.
- **URL:** `https://www.kaggle.com/datasets/unanimad/emmy-awards`
- **Format:** CSV
- **License:** Community

### Nobel Prize API
- **What it is:** Complete data on all Nobel Prizes and laureates. Updated at announcement time.
- **Certainty:** Very high. Official Nobel Prize Foundation API.
- **Download method:** REST API — no auth required.
- **URL:** `https://nobelprize.readme.io/reference/getting-started`
- **Format:** JSON/CSV API
- **License:** CC0

### Pulitzer Prize Data
- **What it is:** All Pulitzer Prize winners and finalists by category.
- **Certainty:** High. Available via semi-official JSON API and community scraper.
- **Download method:** REST API or Node.js scraper for CSV output.
- **API:** `https://pulitzer.org/cache/api/1/finalist/all/{tid}/raw.json`
- **Scraper:** `https://github.com/jonseitz/pulitzer-scraper`
- **Format:** JSON, CSV
- **License:** Open/community
