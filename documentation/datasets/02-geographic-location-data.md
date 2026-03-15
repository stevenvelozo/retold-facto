# Geographic & Location Data — Dataset Descriptions

Core geographic taxonomy that provides the spatial backbone for Facto. Countries, subdivisions, cities, postal codes, and coordinates that nearly every other dataset links into.

---

## Postal / ZIP Codes

### GeoNames Postal Codes (Worldwide)
- **What it is:** Postal codes for 100+ countries with place names, administrative divisions, and lat/lng coordinates. Available as individual country files or a single `allCountries.zip`.
- **Certainty:** High. Community-maintained with daily updates. Quality varies by country — excellent for US/EU, sparser for developing countries.
- **Download method:** Direct HTTP download of zip files containing TSV.
- **URL:** `https://download.geonames.org/export/zip/`
- **Format:** TSV
- **Size:** ~400MB uncompressed (all countries)
- **License:** CC BY 4.0
- **Updates:** Daily

### US Census Bureau ZCTA (ZIP Code Tabulation Areas)
- **What it is:** Official US ZIP Code Tabulation Areas with land/water area and centroid coordinates from the 2020 Census.
- **Certainty:** Very high. Official US Census data. Note: ZCTAs are Census approximations of USPS ZIP codes — they don't update as frequently as USPS changes delivery routes.
- **Download method:** Download pipe-delimited text from Census Gazetteer files.
- **URL:** `https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html`
- **Format:** Pipe-delimited text
- **Size:** ~2MB
- **License:** Public Domain (US Government)

### SimpleMaps US ZIP Codes
- **What it is:** 33,000 US ZIPs with city, state, county, lat/lng, population, density, timezone.
- **Certainty:** High. Well-maintained commercial product with a free basic version.
- **Download method:** Direct CSV download from SimpleMaps (free version).
- **URL:** `https://simplemaps.com/data/us-zips`
- **Format:** CSV
- **Size:** ~3MB
- **License:** MIT (free basic version)

---

## Cities

### GeoNames All Cities
- **What it is:** Multiple tiers available: cities500 (>500 pop), cities1000, cities5000, cities15000, or allCountries (11M+ place names). Each entry has coordinates, population, timezone, feature classification, and alternate names.
- **Certainty:** High. Community-maintained with daily updates. Population figures may lag actual counts by a few years.
- **Download method:** Direct HTTP download of zip files containing TSV.
- **URL:** `https://download.geonames.org/export/dump/`
- **Format:** TSV
- **Size:** cities15000 ~2MB, allCountries ~1.5GB uncompressed
- **License:** CC BY 4.0
- **Updates:** Daily

### SimpleMaps World Cities
- **What it is:** World cities with lat/lng, population, country, province, and capital status. Free version has ~7,300 cities including all capitals and major cities.
- **Certainty:** High. Commercially maintained. Free version covers major cities well; paid version (~4.7M cities) is very comprehensive.
- **Download method:** Direct CSV download.
- **URL:** `https://simplemaps.com/data/world-cities`
- **Format:** CSV
- **Size:** ~1MB (free), ~200MB (paid)
- **License:** MIT (free version)

### SimpleMaps US Cities
- **What it is:** ~31,000 US cities with county, state, lat/lng, population, density, timezone, ZIP codes.
- **Certainty:** High.
- **Download method:** Direct CSV download.
- **URL:** `https://simplemaps.com/data/us-cities`
- **Format:** CSV
- **Size:** ~3MB
- **License:** MIT (free version)

### Countries-States-Cities Database
- **What it is:** 250+ countries, 5,000+ states, 150,000+ cities with ISO codes, phone codes, currencies, languages, timezones, lat/lng. Available in every format imaginable.
- **Certainty:** High. Very actively maintained community project (dr5hn). Cross-references well against official sources.
- **Download method:** Clone from GitHub or download release archives.
- **URL:** `https://github.com/dr5hn/countries-states-cities-database`
- **Format:** JSON, SQL, CSV, XML, YAML
- **Size:** ~50MB (all formats)
- **License:** ODbL

### DataHub World Cities
- **What it is:** Major world cities from GeoNames with country and subcountry associations.
- **Certainty:** Medium-high. Subset of GeoNames data, smaller but convenient.
- **Download method:** Direct download from DataHub.io.
- **URL:** `https://datahub.io/core/world-cities`
- **Format:** CSV, JSON
- **Size:** ~1MB
- **License:** Public Domain

---

## US Counties

### US Census Bureau Counties Gazetteer
- **What it is:** All 3,200+ US counties and county equivalents with FIPS codes, names, land/water area, centroid coordinates.
- **Certainty:** Very high. Official US Census Bureau data.
- **Download method:** Download pipe-delimited text from Census Gazetteer files.
- **URL:** `https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html`
- **Format:** Pipe-delimited text
- **Size:** ~500KB
- **License:** Public Domain (US Government)

### US Census Bureau TIGER/Line County Boundaries
- **What it is:** Cartographic boundary files for all US counties with geographic polygon boundaries.
- **Certainty:** Very high. Official Census geographic data.
- **Download method:** Download shapefile/KML/GeoJSON from Census.
- **URL:** `https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html`
- **Format:** Shapefile, KML, GeoJSON
- **Size:** ~20MB
- **License:** Public Domain

### USDA Economic Research Service County Data
- **What it is:** County-level data on population, income, poverty, education, employment, farming.
- **Certainty:** Very high. Official USDA data.
- **Download method:** Download Excel files from USDA ERS.
- **URL:** `https://www.ers.usda.gov/data-products/county-level-data-sets/`
- **Format:** Excel
- **Size:** ~5MB per dataset
- **License:** Public Domain

---

## States & Provinces

### US Census Bureau States Gazetteer
- **What it is:** US states and territories with FIPS codes, area measurements, centroid coordinates.
- **Certainty:** Very high.
- **Download method:** Same as Counties Gazetteer.
- **URL:** `https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html`
- **Format:** Pipe-delimited text
- **Size:** ~5KB
- **License:** Public Domain

### Natural Earth Admin 1 — States, Provinces
- **What it is:** First-level administrative divisions (states, provinces, regions) for every country worldwide with FIPS, ISO, HASC codes and name variants.
- **Certainty:** Very high. Public domain, widely used in cartography and GIS.
- **Download method:** Download shapefile from Natural Earth.
- **URL:** `https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/`
- **Format:** Shapefile (DBF extractable to CSV)
- **Size:** ~14MB (1:10m scale)
- **License:** Public Domain

### ISO 3166-2 Subdivision Codes
- **What it is:** Complete ISO 3166-2 subdivision codes for all countries with parent relationships, names, and language codes.
- **Certainty:** High. Community-maintained from ISO data.
- **Download method:** Clone or download from GitHub.
- **URL:** `https://github.com/ipregistry/iso3166`
- **Format:** CSV
- **Size:** ~2MB
- **License:** CC BY-SA 4.0

---

## Countries

### ISO 3166 Countries with Regional Codes
- **What it is:** 249 countries with ISO 3166-1 alpha-2, alpha-3, numeric codes merged with UN Geoscheme regional codes (region, sub-region, intermediate region).
- **Certainty:** Very high. Gold standard for country data. Community-maintained from ISO/UN sources.
- **Download method:** Clone or download from GitHub.
- **URL:** `https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes`
- **Format:** CSV, JSON, XML
- **Size:** ~50KB
- **License:** MIT

### Natural Earth Admin 0 — Countries
- **What it is:** 258 country polygons with ISO/FIPS codes, sovereignty, economy level, income group, population estimates.
- **Certainty:** Very high. Public domain standard in cartography.
- **Download method:** Download shapefile from Natural Earth.
- **URL:** `https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/`
- **Format:** Shapefile
- **Size:** ~5MB (1:10m)
- **License:** Public Domain

### DataHub Comprehensive Country Codes
- **What it is:** 40+ fields per country combining ISO 3166, ITU dialing codes, ISO 4217 currencies, languages, GeoNames ID, EDGAR codes, FIFA, IOC, and more.
- **Certainty:** High. Aggregated from multiple authoritative sources.
- **Download method:** Direct download from DataHub.io.
- **URL:** `https://datahub.io/core/country-codes`
- **Format:** CSV, JSON
- **Size:** ~500KB
- **License:** Public Domain

### REST Countries API
- **What it is:** Free REST API for 30+ fields per country including name, capital, region, population, area, languages, currencies, borders, flags, timezones.
- **Certainty:** High. Community-maintained, well-tested.
- **Download method:** REST API calls — no auth required.
- **URL:** `https://restcountries.com/`
- **Format:** JSON API
- **License:** Mozilla Public License 2.0

---

## Administrative Divisions (Global)

### GADM — Global Administrative Areas
- **What it is:** Administrative boundaries for all countries at up to 5 levels (country, state, district, sub-district, etc.). The most detailed global admin boundary dataset available.
- **Certainty:** Very high. Academic standard for administrative geography.
- **Download method:** Download from GADM website (per-country or world file).
- **URL:** `https://gadm.org/download_world.html`
- **Format:** Shapefile, GeoPackage, R, KMZ
- **Size:** ~1GB
- **License:** Free for academic/non-commercial use

### Natural Earth Admin Boundaries (All Levels)
- **What it is:** Admin 0 (countries), Admin 1 (states/provinces), and boundary lines at three scale levels.
- **Certainty:** Very high.
- **Download method:** Download shapefiles from Natural Earth.
- **URL:** `https://www.naturalearthdata.com/downloads/`
- **Format:** Shapefile
- **Size:** ~100MB total
- **License:** Public Domain

---

## Geographic Coordinates & Geocoding

### GeoNames Full Export
- **What it is:** 11M+ geographic names with coordinates, elevation, timezone, feature classification, alternate names in many languages.
- **Certainty:** High. Very comprehensive, community-maintained with daily updates.
- **Download method:** Download `allCountries.zip` from GeoNames dump directory.
- **URL:** `https://download.geonames.org/export/dump/`
- **Format:** TSV
- **Size:** ~1.5GB uncompressed
- **License:** CC BY 4.0

### Geoapify Cities Download
- **What it is:** All cities, towns, villages and hamlets worldwide extracted from OpenStreetMap with population, lat/lng, admin hierarchy.
- **Certainty:** Medium-high. Derived from OSM, which is community-maintained and varies in completeness by region.
- **Download method:** Download from Geoapify.
- **URL:** `https://www.geoapify.com/download-all-the-cities-towns-villages/`
- **Format:** CSV, GeoJSON
- **Size:** ~500MB
- **License:** ODbL (OSM-derived)

---

## US-Specific Geography

### US Census Gazetteer Files (Places, Congressional Districts, School Districts, Tracts)
- **What it is:** Multiple gazetteer files covering Census places, Congressional districts, school districts, and ~84,000 census tracts with area and centroid coordinates.
- **Certainty:** Very high. Official US Census Bureau.
- **Download method:** Download pipe-delimited text files from Census.
- **URL:** `https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html`
- **Format:** Pipe-delimited text
- **Size:** ~5MB (places), smaller for others
- **License:** Public Domain

### TIGER/Line Relationship Files
- **What it is:** Cross-reference tables between geographic entities (ZCTA-to-county, tract-to-county, place-to-county, etc.).
- **Certainty:** Very high.
- **Download method:** Download from Census.
- **URL:** `https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.2020.html`
- **Format:** Pipe-delimited text
- **License:** Public Domain

---

## Time Zones

### IANA Time Zone Database
- **What it is:** THE canonical timezone data used by virtually all operating systems and programming languages. Contains all timezone rules, historical transitions, and leap second data.
- **Certainty:** Definitive. This IS the standard.
- **Download method:** Download tarball from IANA.
- **URL:** `https://www.iana.org/time-zones`
- **Format:** Text (source format)
- **Size:** ~500KB
- **License:** Public Domain

### Timezone Boundary Builder
- **What it is:** Geographic polygon boundaries of IANA time zones, derived from OpenStreetMap. Use to determine timezone from lat/lng coordinates.
- **Certainty:** High. Well-maintained, widely used.
- **Download method:** Download from GitHub releases.
- **URL:** `https://github.com/evansiroky/timezone-boundary-builder`
- **Format:** GeoJSON, Shapefile
- **Size:** ~100MB
- **License:** ODbL

### GeoNames Time Zones
- **What it is:** Mapping of timezone IDs to GMT/DST offsets with country codes. A simple lookup table.
- **Certainty:** High. Derived from IANA data.
- **Download method:** Direct file download.
- **URL:** `https://download.geonames.org/export/dump/timeZones.txt`
- **Format:** TSV
- **Size:** ~30KB
- **License:** CC BY 4.0

---

## Telephone / Area Codes

### libphonenumber Metadata
- **What it is:** Comprehensive phone number metadata for all countries: formatting rules, area code patterns, validation rules.
- **Certainty:** Very high. Maintained by Google, used in Android and across Google products.
- **Download method:** Clone from GitHub.
- **URL:** `https://github.com/google/libphonenumber`
- **Format:** XML, Protocol Buffers
- **Size:** ~10MB
- **License:** Apache 2.0

### NPA NXX (North American Area Codes)
- **What it is:** Complete list of North American area codes (NPA), exchange codes (NXX), and their assignments.
- **Certainty:** High. Based on FCC-mandated public data from NANPA.
- **Download method:** Download from NANPA reports page.
- **URL:** `https://www.nationalnanpa.com/reports/reports_cocodes_702.html`
- **Format:** CSV
- **License:** Public data (FCC mandated)
