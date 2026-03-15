# Geographic & Location Data Sources

Public, free datasets for geographic reference data — postal codes, cities, counties, states, provinces, countries, coordinates, and administrative divisions.

---

## 1. Postal / ZIP Codes

### GeoNames Postal Codes (Worldwide)
- **Provider:** GeoNames.org
- **URL:** https://download.geonames.org/export/zip/
- **Format:** Tab-separated text files (TSV)
- **License:** Creative Commons Attribution 4.0
- **Description:** Postal codes for 100+ countries with place names, admin divisions, and lat/lng coordinates. Individual country files or `allCountries.zip` for everything.
- **Size:** ~400MB uncompressed (all countries)
- **Update Frequency:** Daily
- **Fields:** country code, postal code, place name, admin name 1-3, admin code 1-3, latitude, longitude, accuracy

### US Census Bureau ZCTA (ZIP Code Tabulation Areas)
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html
- **Format:** Pipe-delimited text
- **License:** Public Domain (US Government)
- **Description:** Official US ZIP Code Tabulation Areas with land area, water area, latitude, longitude. Derived from 2020 Census geography.
- **Size:** ~2MB
- **Fields:** GEOID, ALAND, AWATER, ALAND_SQMI, AWATER_SQMI, INTPTLAT, INTPTLONG

### SimpleMaps US ZIP Codes
- **Provider:** SimpleMaps
- **URL:** https://simplemaps.com/data/us-zips
- **Format:** CSV
- **License:** MIT (free basic version)
- **Description:** US ZIP codes with city, state, county, lat/lng, population, density, timezone. Free version has ~33,000 ZIPs.
- **Size:** ~3MB
- **Fields:** zip, lat, lng, city, state_id, state_name, county_fips, county_name, population, density, timezone

### OpenDataSoft GeoNames Postal Codes
- **Provider:** OpenDataSoft (via GeoNames)
- **URL:** https://public.opendatasoft.com/explore/dataset/geonames-postal-code/
- **Format:** CSV, JSON, GeoJSON
- **License:** CC-BY 4.0
- **Description:** Reformatted GeoNames postal code data with easy web download and API access.
- **Size:** ~200MB

---

## 2. Cities

### GeoNames All Cities
- **Provider:** GeoNames.org
- **URL:** https://download.geonames.org/export/dump/
- **Format:** Tab-separated text
- **License:** CC-BY 4.0
- **Description:** Multiple files available: `cities500.zip` (cities >500 pop), `cities1000.zip` (>1000), `cities5000.zip` (>5000), `cities15000.zip` (>15000), or `allCountries.zip` (11M+ place names).
- **Size:** cities15000 ~2MB, allCountries ~1.5GB uncompressed
- **Update Frequency:** Daily
- **Fields:** geonameid, name, asciiname, alternatenames, latitude, longitude, feature class, feature code, country code, cc2, admin1-4, population, elevation, dem, timezone, modification date

### SimpleMaps World Cities
- **Provider:** SimpleMaps
- **URL:** https://simplemaps.com/data/world-cities
- **Format:** CSV
- **License:** MIT (free basic version, ~7,300 cities; paid full version ~4.7M cities)
- **Description:** World cities with lat/lng, population, country, province, and capital status. Free version includes all capitals, major cities, and representative smaller cities.
- **Size:** ~1MB (free), ~200MB (paid)
- **Fields:** city, city_ascii, lat, lng, country, iso2, iso3, admin_name, capital, population, id

### SimpleMaps US Cities
- **Provider:** SimpleMaps
- **URL:** https://simplemaps.com/data/us-cities
- **Format:** CSV
- **License:** MIT (free basic version, ~31,000 cities)
- **Description:** US cities with county, state, lat/lng, population, density, timezone, ZIP codes.
- **Size:** ~3MB
- **Fields:** city, state_id, state_name, county_fips, county_name, lat, lng, population, density, zips, id

### OpenDataSoft World Cities (Pop >1000)
- **Provider:** OpenDataSoft (via GeoNames)
- **URL:** https://public.opendatasoft.com/explore/dataset/geonames-all-cities-with-a-population-1000/
- **Format:** CSV, JSON, GeoJSON
- **License:** CC-BY 4.0
- **Description:** ~80,000 cities worldwide with population >1000.
- **Size:** ~25MB

### Countries-States-Cities Database
- **Provider:** dr5hn (Community)
- **URL:** https://github.com/dr5hn/countries-states-cities-database
- **Format:** JSON, SQL, CSV, XML, YAML
- **License:** Open Database License (ODbL)
- **Description:** 250+ countries, 5,000+ states, 150,000+ cities with ISO codes, phone codes, currencies, languages, timezones, lat/lng.
- **Size:** ~50MB (all formats)

### DataHub World Cities
- **Provider:** DataHub.io
- **URL:** https://datahub.io/core/world-cities
- **Format:** CSV, JSON
- **License:** Public Domain
- **Description:** Major world cities extracted from GeoNames, with country and subcountry associations.
- **Size:** ~1MB

---

## 3. US Counties

### US Census Bureau Counties Gazetteer
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html
- **Format:** Pipe-delimited text
- **License:** Public Domain (US Government)
- **Description:** All 3,200+ US counties and county equivalents with FIPS codes, names, land/water area, centroid coordinates.
- **Size:** ~500KB
- **Fields:** USPS, GEOID, ANSICODE, NAME, ALAND, AWATER, ALAND_SQMI, AWATER_SQMI, INTPTLAT, INTPTLONG

### US Census Bureau TIGER/Line County Boundaries
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html
- **Format:** Shapefile, KML, GeoJSON
- **License:** Public Domain
- **Description:** Cartographic boundary files for all US counties with geographic boundaries.
- **Size:** ~20MB (national file)

### USDA Economic Research Service County Data
- **Provider:** USDA ERS
- **URL:** https://www.ers.usda.gov/data-products/county-level-data-sets/
- **Format:** Excel (XLS)
- **License:** Public Domain
- **Description:** County-level data on population, income, poverty, education, employment, farming.
- **Size:** ~5MB per dataset

---

## 4. States & Provinces

### US Census Bureau States Gazetteer
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html
- **Format:** Pipe-delimited text
- **License:** Public Domain
- **Description:** US states and territories with FIPS codes, area measurements, centroid coordinates.
- **Size:** ~5KB

### Natural Earth Admin 1 — States, Provinces
- **Provider:** Natural Earth Data
- **URL:** https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-1-states-provinces/
- **Format:** Shapefile (with DBF attribute tables extractable to CSV)
- **License:** Public Domain
- **Description:** First-level administrative divisions (states, provinces, regions) for every country worldwide. Includes FIPS, ISO, HASC codes, names with diacriticals, and name variants.
- **Size:** ~14MB (1:10m scale)
- **Coverage:** Global — all countries

### ISO 3166-2 Subdivision Codes
- **Provider:** ipregistry (Community, via ISO data)
- **URL:** https://github.com/ipregistry/iso3166
- **Format:** CSV
- **License:** CC BY-SA 4.0
- **Description:** Complete ISO 3166-2 subdivision codes (states, provinces, regions, districts) for all countries with parent relationships, names, and language codes.
- **Size:** ~2MB

### IP2Location ISO 3166-2 Subdivision Codes
- **Provider:** IP2Location
- **URL:** https://www.ip2location.com/free/iso3166-2
- **Format:** CSV
- **License:** CC BY-SA 4.0 (free for personal use)
- **Description:** ISO 3166-2 subdivision codes with country mappings.
- **Size:** ~1MB

---

## 5. Countries

### ISO 3166 Countries with Regional Codes
- **Provider:** Luke Duncalfe (Community, via ISO/UN data)
- **URL:** https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes
- **Format:** CSV, JSON, XML
- **License:** MIT
- **Description:** ISO 3166-1 country list merged with UN Geoscheme regional codes: alpha-2, alpha-3, numeric codes, region, sub-region, intermediate region.
- **Size:** ~50KB
- **Fields:** name, alpha-2, alpha-3, country-code, iso_3166-2, region, sub-region, intermediate-region, region-code, sub-region-code

### Natural Earth Admin 0 — Countries
- **Provider:** Natural Earth Data
- **URL:** https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/
- **Format:** Shapefile
- **License:** Public Domain
- **Description:** 258 country polygons with ISO/FIPS codes, sovereignty, economy level, income group, Wikipedia link, population estimates.
- **Size:** ~5MB (1:10m)

### World Countries (Stefan Gabos)
- **Provider:** Stefan Gabos (Community)
- **URL:** https://stefangabos.github.io/world_countries/
- **Format:** CSV, JSON, PHP, MySQL, MSSQL, XML
- **License:** LGPL-3.0
- **Description:** Country names in 24 languages with alpha-2, alpha-3, and numeric ISO 3166 codes. Includes national flags.
- **Size:** ~1MB

### DataHub Comprehensive Country Codes
- **Provider:** DataHub.io
- **URL:** https://datahub.io/core/country-codes
- **Format:** CSV, JSON
- **License:** Public Domain
- **Description:** Comprehensive dataset combining ISO 3166, ITU dialing codes, ISO 4217 currency codes, languages, geonames ID, EDGAR codes, and many more in a single file.
- **Size:** ~500KB
- **Fields:** 40+ fields including FIFA, IOC, ISO 3166, ITU, MARC, WMO, DS, dial, EDGAR, FIPS, GAUL, Geoname ID, currency codes, languages, capital, area, population, continent, TLD, phone code

### REST Countries API
- **Provider:** REST Countries
- **URL:** https://restcountries.com/
- **Format:** JSON API
- **License:** Mozilla Public License 2.0
- **Description:** Free REST API for country data including name, capital, region, subregion, population, area, languages, currencies, borders, flags, timezones.
- **Fields:** 30+ fields per country

---

## 6. Administrative Divisions (Global)

### GADM — Global Administrative Areas
- **Provider:** GADM
- **URL:** https://gadm.org/download_world.html
- **Format:** Shapefile, GeoPackage, R (sp/sf), KMZ
- **License:** Free for academic/non-commercial use
- **Description:** Administrative boundaries for all countries at multiple levels (country, state, district, sub-district, etc.). The most detailed global admin boundary dataset available.
- **Size:** ~1GB
- **Levels:** Up to 5 levels of administrative division

### Natural Earth Admin Boundaries (All Levels)
- **Provider:** Natural Earth Data
- **URL:** https://www.naturalearthdata.com/downloads/
- **Format:** Shapefile
- **License:** Public Domain
- **Description:** Admin 0 (countries), Admin 1 (states/provinces), and boundary lines at three scale levels (1:10m, 1:50m, 1:110m).
- **Size:** ~100MB total

---

## 7. Geographic Coordinates & Geocoding

### GeoNames Full Export
- **Provider:** GeoNames.org
- **URL:** https://download.geonames.org/export/dump/
- **Format:** TSV
- **License:** CC-BY 4.0
- **Description:** 11+ million geographic names with coordinates, elevation, timezone, feature classification, alternate names in many languages.
- **Size:** ~1.5GB uncompressed

### OpenStreetMap Nominatim
- **Provider:** OpenStreetMap Foundation
- **URL:** https://nominatim.openstreetmap.org/ (API)
- **Format:** JSON, XML API
- **License:** ODbL
- **Description:** Free geocoding/reverse geocoding API based on OpenStreetMap data. Rate-limited to 1 req/sec.

### Geoapify Cities Download
- **Provider:** Geoapify
- **URL:** https://www.geoapify.com/download-all-the-cities-towns-villages/
- **Format:** CSV, GeoJSON
- **License:** ODbL (OpenStreetMap derived)
- **Description:** All cities, towns, villages and hamlets worldwide extracted from OpenStreetMap. Includes population, lat/lng, admin hierarchy.
- **Size:** ~500MB

---

## 8. US-Specific Geography

### US Census Bureau Places Gazetteer
- **Provider:** US Census Bureau
- **URL:** https://www2.census.gov/geo/docs/maps-data/data/gazetteer/
- **Format:** Pipe-delimited text
- **License:** Public Domain
- **Description:** Census-designated places, incorporated places, and census county divisions for all 50 states plus DC and PR.
- **Size:** ~5MB

### US Census Bureau Congressional Districts
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html
- **Format:** Pipe-delimited text
- **License:** Public Domain
- **Description:** Congressional district boundaries and centroids for the current Congress.

### US Census Bureau School Districts
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html
- **Format:** Pipe-delimited text
- **License:** Public Domain
- **Description:** Unified, elementary, and secondary school district boundaries.

### US Census Bureau Census Tracts
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html
- **Format:** Pipe-delimited text
- **License:** Public Domain
- **Description:** All ~84,000 census tracts with area and centroid coordinates.

### TIGER/Line Relationship Files
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/geographies/reference-files/time-series/geo/relationship-files.2020.html
- **Format:** Pipe-delimited text
- **License:** Public Domain
- **Description:** Cross-reference tables between geographic entities (ZCTA-to-county, tract-to-county, place-to-county, etc.).

---

## 9. Time Zones

### IANA Time Zone Database (tz / Olson)
- **Provider:** IANA
- **URL:** https://www.iana.org/time-zones
- **Format:** Text (source format)
- **License:** Public Domain
- **Description:** The canonical source for timezone data used by virtually all operating systems and programming languages. Contains all timezone rules, historical transitions, and leap second data.
- **Size:** ~500KB

### Timezone Boundary Builder
- **Provider:** Evan Siroky (Community)
- **URL:** https://github.com/evansiroky/timezone-boundary-builder
- **Format:** GeoJSON, Shapefile
- **License:** ODbL
- **Description:** Geographic boundaries of IANA time zones, derived from OpenStreetMap. Use to determine timezone from lat/lng coordinates.
- **Size:** ~100MB

### GeoNames Time Zones
- **Provider:** GeoNames.org
- **URL:** https://download.geonames.org/export/dump/timeZones.txt
- **Format:** TSV
- **License:** CC-BY 4.0
- **Description:** Mapping of timezone IDs to GMT offsets and DST offsets, with country codes.
- **Size:** ~30KB

---

## 10. Telephone / Area Codes

### DataHub Country Codes (includes dialing codes)
- **Provider:** DataHub.io
- **URL:** https://datahub.io/core/country-codes
- **Format:** CSV, JSON
- **License:** Public Domain
- **Description:** International dialing codes included in comprehensive country code dataset.

### libphonenumber Metadata
- **Provider:** Google
- **URL:** https://github.com/google/libphonenumber
- **Format:** XML, Protocol Buffers
- **License:** Apache 2.0
- **Description:** Comprehensive phone number metadata for all countries, including formatting rules, area code patterns, and validation rules.
- **Size:** ~10MB

### NPA NXX (North American Area Codes)
- **Provider:** NANPA (via community datasets)
- **URL:** https://www.nationalnanpa.com/reports/reports_cocodes_702.html
- **Format:** CSV
- **License:** Public data (FCC mandated)
- **Description:** Complete list of North American area codes (NPA), exchange codes (NXX), and their assignments.
