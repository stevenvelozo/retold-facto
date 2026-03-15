# Foundational Reference Data Sources

Public, free datasets for languages, currencies, standards, education, medical codes, transportation, food, environment, and other reference taxonomies.

---

## 1. Languages

### ISO 639-3 Complete Code Tables
- **Provider:** SIL International (ISO 639-3 Registration Authority)
- **URL:** https://iso639-3.sil.org/code_tables/download_tables
- **Format:** Tab-delimited text (UTF-8)
- **License:** Free
- **Description:** Complete set of 7,800+ language codes (ISO 639-3) with names, scope (individual/macro/special), type (living/extinct/ancient/constructed), and mappings to 639-1 and 639-2 codes.
- **Size:** ~1MB
- **Files:** Code set, name index (multi-language), macrolanguage mappings, retired code mappings

### DataHub Language Codes
- **Provider:** DataHub.io / Frictionless Data
- **URL:** https://datahub.io/core/language-codes
- **Format:** CSV, JSON
- **License:** Public Domain
- **Description:** ISO 639-1 (2-letter) and ISO 639-2 (3-letter) codes with English names and IETF language tags.
- **Size:** ~50KB

### GitHub iso-639 (Multi-Language Names)
- **Provider:** haliaeetus (Community)
- **URL:** https://github.com/haliaeetus/iso-639
- **Format:** CSV, JSON, Node.js module
- **License:** MIT
- **Description:** ISO 639 language codes with names in English, French, and German.
- **Size:** ~200KB

### Unicode CLDR Language Data
- **Provider:** Unicode Consortium
- **URL:** https://github.com/unicode-org/cldr-json
- **Format:** JSON
- **License:** Unicode Terms of Use (free)
- **Description:** Language names, script names, territory names, and locale data in 100+ languages. The authoritative source for internationalization data.
- **Size:** ~500MB (full CLDR)

### Glottolog
- **Provider:** Max Planck Institute
- **URL:** https://glottolog.org/
- **Format:** CSV, BibTeX, RDF
- **License:** CC BY 4.0
- **Description:** Comprehensive catalog of the world's languages, language families, and dialects. 8,500+ languoids with genealogical classification, geographic coordinates, and references.
- **Size:** ~50MB

---

## 2. Currencies

### ISO 4217 Currency Codes
- **Provider:** DataHub.io / Frictionless Data
- **URL:** https://datahub.io/core/currency-codes
- **GitHub:** https://github.com/datasets/currency-codes
- **Format:** CSV, JSON
- **License:** Public Domain
- **Description:** All ISO 4217 currency codes (current and historical) with currency name, country, numeric code, and minor unit (decimal places).
- **Size:** ~50KB
- **Fields:** Entity, Currency, AlphabeticCode, NumericCode, MinorUnit, WithdrawalDate

### Open Exchange Rates
- **Provider:** Open Exchange Rates
- **URL:** https://openexchangerates.org/
- **Format:** JSON API
- **License:** Free tier (1,000 requests/month, base USD only)
- **Description:** Live and historical exchange rates for 170+ currencies. Free tier provides hourly updates with USD base.

### European Central Bank Exchange Rates
- **Provider:** ECB
- **URL:** https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
- **Format:** CSV, XML
- **License:** Free
- **Description:** Daily reference exchange rates for ~30 major currencies against EUR. Historical data available back to 1999.
- **Size:** ~5MB (all historical)

### Frankfurter API (No Key Required)
- **Provider:** Open-source (ECB data)
- **URL:** https://frankfurter.dev/
- **Format:** JSON API
- **License:** MIT (self-hostable)
- **Description:** Free, open-source exchange rate API using ECB reference rates. No API key needed, no rate limits, CORS support, self-hostable. 30+ currencies with daily rates.

### Fixer.io / Exchange Rate API
- **Provider:** APILayer
- **URL:** https://fixer.io/
- **Format:** JSON API
- **License:** Free tier (100 requests/month)
- **Description:** Real-time and historical exchange rates for 170 currencies. Sourced from ECB and other central banks.

---

## 3. Units of Measurement

### UCUM — Unified Code for Units of Measure
- **Provider:** Regenstrief Institute
- **URL:** https://ucum.org/
- **Format:** XML
- **License:** Free
- **Description:** Comprehensive code system for units of measure used in science, engineering, and business. Unambiguous machine-parseable unit expressions.
- **Size:** ~200KB

### QUDT Ontology (Quantities, Units, Dimensions, Types)
- **Provider:** QUDT.org
- **URL:** https://www.qudt.org/
- **GitHub:** https://github.com/qudt/qudt-public-repo
- **Format:** RDF/OWL, JSON-LD
- **License:** CC BY 4.0
- **Description:** Ontology for quantities, units, dimensions, and data types. Covers SI units, imperial, and domain-specific units.
- **Size:** ~50MB

---

## 4. Calendars & Holidays

### Nager.Date Public Holidays API
- **Provider:** Nager.Date
- **URL:** https://date.nager.at/
- **Format:** JSON API
- **License:** MIT
- **Description:** Public holidays for 100+ countries with date, name, type (public/bank/optional), and subdivision coverage. Historical and future dates.
- **API:** `https://date.nager.at/api/v3/publicholidays/{year}/{countryCode}`

### Google Calendar Holiday Calendars
- **Provider:** Google
- **URL:** Available via Google Calendar API
- **Format:** iCal, JSON API
- **License:** Free (API key required)
- **Description:** Holiday calendars for most countries, accessible via Google Calendar API.

### TimeAndDate.com Holidays (Reference)
- **Provider:** TimeAndDate.com
- **URL:** https://www.timeanddate.com/holidays/
- **Format:** Web (reference)
- **License:** Free for reference, commercial API available
- **Description:** Comprehensive holiday database for every country, with religious, national, and observance categories.

---

## 5. Education

### IPEDS — Integrated Postsecondary Education Data System
- **Provider:** NCES (National Center for Education Statistics)
- **URL:** https://nces.ed.gov/ipeds/
- **Data Center:** https://nces.ed.gov/ipeds/datacenter/
- **Format:** CSV (zipped), Access database
- **License:** Public Domain (US Government)
- **Description:** Annual data from every US college, university, and technical/vocational institution: enrollment, completions, finances, institutional characteristics, financial aid, human resources.
- **Size:** ~500MB (all years/surveys)
- **Update Frequency:** Annual, multiple survey components

### CIP Codes — Classification of Instructional Programs
- **Provider:** NCES
- **URL:** https://nces.ed.gov/ipeds/cipcode/
- **Format:** Web searchable, downloadable
- **License:** Public Domain
- **Description:** Taxonomy of instructional programs (academic majors/fields of study) used by IPEDS. 6-digit codes in ~60 2-digit families.
- **Size:** ~200KB

### World Universities (Wikidata)
- **Provider:** Wikimedia Foundation
- **URL:** https://query.wikidata.org/ (SPARQL)
- **Format:** CSV via SPARQL export
- **License:** CC0
- **Description:** Query all universities worldwide with founding year, country, enrollment, coordinates, and links.
- **Query:** `SELECT ?uni ?name ?country WHERE { ?uni wdt:P31 wd:Q3918. ?uni rdfs:label ?name. FILTER(LANG(?name) = "en") }`

### QS / THE / ARWU Rankings (Reference)
- **Provider:** Various ranking organizations
- **URL:** https://www.topuniversities.com/ (QS), https://www.timeshighereducation.com/ (THE)
- **Format:** Web (some CSV exports available)
- **License:** Free for reference (full data requires licensing)
- **Description:** World university rankings with scores by criteria. Limited free data; full datasets require commercial license.

---

## 6. Medical & Health

### ICD-10-CM Diagnosis Codes
- **Provider:** CMS / CDC
- **URL:** https://www.cms.gov/medicare/coding-billing/icd-10-codes
- **CDC:** https://www.cdc.gov/nchs/icd/icd-10-cm/files.html
- **Format:** XML, text, PDF
- **License:** Public Domain (US Government)
- **Description:** Complete ICD-10-CM (Clinical Modification) code set used for medical diagnosis coding in the US. ~72,000 codes organized in 21 chapters.
- **Size:** ~50MB
- **Update Frequency:** Annual (October fiscal year)

### ICD-10-PCS Procedure Codes
- **Provider:** CMS
- **URL:** https://www.cms.gov/medicare/coding-billing/icd-10-codes
- **Format:** XML, text
- **License:** Public Domain
- **Description:** ICD-10-PCS procedure codes for inpatient hospital procedures. ~78,000 codes.
- **Size:** ~30MB

### NDC — National Drug Code Directory
- **Provider:** FDA
- **URL:** https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory
- **Format:** Text (pipe-delimited), Excel
- **License:** Public Domain (US Government)
- **Description:** All commercially distributed drugs with NDC numbers, proprietary names, dosage forms, routes, active ingredients, and labeler information.
- **Size:** ~50MB
- **Update Frequency:** Weekly

### NPI — National Provider Identifier
- **Provider:** CMS / NPPES
- **URL:** https://download.cms.gov/nppes/NPI_Files.html
- **Format:** CSV (zipped)
- **License:** Public Domain (US Government)
- **Description:** All healthcare providers in the US with NPI numbers, names, specialties, practice locations, and organizational affiliations. 8M+ records.
- **Size:** ~8GB
- **Update Frequency:** Weekly

### FDA Drug Approvals (Drugs@FDA)
- **Provider:** FDA
- **URL:** https://www.fda.gov/drugs/drug-approvals-and-databases/drugsfda-data-files
- **Format:** Text (zipped)
- **License:** Public Domain
- **Description:** Historical drug approval data: application numbers, brand/generic names, active ingredients, approval dates, dosage forms.
- **Size:** ~10MB

### RxNorm
- **Provider:** NLM (National Library of Medicine)
- **URL:** https://www.nlm.nih.gov/research/umls/rxnorm/docs/rxnormfiles.html
- **Format:** RRF (Rich Release Format, pipe-delimited)
- **License:** UMLS license (free registration required)
- **Description:** Normalized names and codes for clinical drugs, linking NDC, brand names, generic names, ingredients, and dose forms.
- **Size:** ~500MB

### openFDA API (Drugs, Devices, Food)
- **Provider:** FDA
- **URL:** https://open.fda.gov/apis/
- **Download:** https://open.fda.gov/data/downloads/
- **Format:** JSON API, bulk JSON downloads
- **License:** Public Domain (US Government)
- **Description:** REST API for drugs, devices, food adverse events, recalls, and labeling. No API key for basic use (1,000 req/day without key, 120K/day with free key). Bulk downloads also available.

### WHO Essential Medicines List
- **Provider:** World Health Organization
- **URL:** https://www.who.int/groups/expert-committee-on-selection-and-use-of-essential-medicines/essential-medicines-lists
- **Format:** PDF, web
- **License:** Free (WHO)
- **Description:** Model list of essential medicines used worldwide as a reference for national formularies.

---

## 7. Food & Agriculture

### USDA FoodData Central
- **Provider:** USDA
- **URL:** https://fdc.nal.usda.gov/download-datasets/
- **Format:** CSV, JSON
- **License:** CC0 (Public Domain)
- **Description:** 400,000+ food entries with nutrient profiles (150+ nutrients per food). Five data types: Foundation Foods, SR Legacy, Branded Foods, FNDDS, and Experimental Foods.
- **Size:** ~2GB (all types)
- **Update Frequency:** Periodic

### FAO FAOSTAT
- **Provider:** Food and Agriculture Organization (UN)
- **URL:** https://www.fao.org/faostat/en/
- **Format:** CSV (via bulk download)
- **License:** CC BY-NC-SA 3.0 IGO
- **Description:** Global agricultural production, trade, food balance sheets, food security, land use, emissions, and prices for 245+ countries.
- **Size:** Varies by dataset (~1GB total)

### USDA Plants Database
- **Provider:** USDA NRCS
- **URL:** https://plants.usda.gov/
- **Format:** CSV (downloadable), web
- **License:** Public Domain
- **Description:** Database of plants of the US with names, distributions, characteristics, images, and conservation status.

---

## 8. Transportation

### OpenFlights Airport Database
- **Provider:** OpenFlights
- **URL:** https://openflights.org/data
- **Format:** CSV (DAT)
- **License:** Open Database License
- **Description:** 10,000+ airports worldwide with IATA/ICAO codes, name, city, country, lat/lng, altitude, timezone, DST info.
- **Size:** ~1MB
- **Fields:** AirportID, Name, City, Country, IATA, ICAO, Latitude, Longitude, Altitude, Timezone, DST, Tz, Type, Source

### OurAirports
- **Provider:** OurAirports
- **URL:** https://ourairports.com/data/
- **Format:** CSV
- **License:** Public Domain
- **Description:** Nightly updated CSV dumps of airports, runways, navaids, frequencies, countries, and regions. More comprehensive than OpenFlights.
- **Size:** ~5MB
- **Files:** airports.csv, runways.csv, navaids.csv, airport-frequencies.csv, countries.csv, regions.csv

### OpenFlights Airline Database
- **Provider:** OpenFlights
- **URL:** https://openflights.org/data
- **Format:** CSV
- **License:** Open Database License
- **Description:** 6,000+ airlines with IATA/ICAO codes, name, callsign, country, active status.
- **Size:** ~500KB

### OpenFlights Route Database
- **Provider:** OpenFlights
- **URL:** https://openflights.org/data
- **Format:** CSV
- **License:** Open Database License
- **Description:** 67,000+ routes between 3,300+ airports, with airline, source, destination, codeshare, and stops info.
- **Size:** ~3MB

### UN/LOCODE — Ports & Trade Locations
- **Provider:** UNECE
- **URL:** https://unece.org/trade/uncefact/unlocode
- **Format:** CSV, text
- **License:** Free (UN)
- **Description:** 100,000+ locations in 249 countries used in international trade: ports, airports, inland freight locations. 5-character codes (country + 3-letter location).
- **Size:** ~20MB

### US DOT Airline On-Time Performance
- **Provider:** Bureau of Transportation Statistics
- **URL:** https://www.transtats.bts.gov/
- **Format:** CSV
- **License:** Public Domain (US Government)
- **Description:** Flight-level data for US domestic flights: carriers, origin/destination, delays, cancellations. Monthly updates, data since 1987.
- **Size:** ~500MB per year

### NHTSA Vehicle Make/Model Database
- **Provider:** National Highway Traffic Safety Administration (US DOT)
- **URL:** https://vpic.nhtsa.dot.gov/api/
- **Format:** JSON, CSV, XML API
- **License:** Public Domain (US Government)
- **Description:** Vehicle make, model, year, body type, and VIN decoding data via 25+ API endpoints. No API key required. Standalone database also available in SQL Server/PostgreSQL format for offline use.
- **Size:** Covers all US-market vehicles

---

## 9. Environmental & Climate

### NOAA Climate Data Online (CDO)
- **Provider:** NOAA NCEI
- **URL:** https://www.ncei.noaa.gov/cdo-web/
- **Format:** CSV
- **License:** Public Domain (US Government)
- **Description:** Historical weather and climate data from 100,000+ weather stations worldwide. Temperature, precipitation, wind, snowfall, and more.
- **Size:** Varies (petabytes in total; download by station/date range)

### NOAA Global Historical Climatology Network (GHCN)
- **Provider:** NOAA NCEI
- **URL:** https://www.ncei.noaa.gov/products/land-based-station/global-historical-climatology-network-daily
- **Format:** Fixed-width text, CSV
- **License:** Public Domain
- **Description:** Daily climate summaries from 100,000+ stations in 180+ countries. Core variables: max/min temp, precipitation, snowfall.
- **Size:** ~30GB

### EPA Air Quality Data
- **Provider:** US Environmental Protection Agency
- **URL:** https://aqs.epa.gov/aqsweb/airdata/download_files.html
- **Format:** CSV (zipped)
- **License:** Public Domain (US Government)
- **Description:** Criteria pollutant monitoring data (PM2.5, ozone, CO, SO2, NO2, lead) from AQS monitoring stations across the US.
- **Size:** ~1GB per year

### NASA Earth Observation Data
- **Provider:** NASA Earthdata
- **URL:** https://earthdata.nasa.gov/
- **Format:** Various (HDF, NetCDF, GeoTIFF)
- **License:** Public Domain (US Government)
- **Description:** Satellite-derived earth science data: land surface temperature, vegetation indices, sea level, ice sheets, atmospheric data.
- **Size:** Petabytes (access by product/region/date)

---

## 10. Standards & Internet

### IANA Registries
- **Provider:** Internet Assigned Numbers Authority
- **URL:** https://www.iana.org/
- **Format:** CSV, XML, text
- **License:** Public Domain
- **Description:** Authoritative registries for:
  - **TLDs:** https://data.iana.org/TLD/tlds-alpha-by-domain.txt — all top-level domains
  - **MIME Types:** https://www.iana.org/assignments/media-types/ — all registered MIME types
  - **Time Zones:** https://www.iana.org/time-zones — the tz database
  - **Port Numbers:** https://www.iana.org/assignments/service-names-port-numbers/ — TCP/UDP port assignments
  - **Character Sets:** https://www.iana.org/assignments/character-sets/ — all registered character encodings
  - **Language Subtags:** https://www.iana.org/assignments/language-subtag-registry/ — IETF BCP 47 language tags

### IEEE OUI (MAC Address Vendor Prefixes)
- **Provider:** IEEE
- **URL:** https://standards-oui.ieee.org/oui/oui.csv
- **Format:** CSV
- **License:** Free
- **Description:** Mapping of MAC address prefixes (OUI) to hardware vendors. 30,000+ vendor registrations.
- **Size:** ~5MB

### IETF RFC Index
- **Provider:** IETF
- **URL:** https://www.rfc-editor.org/rfc-index.txt
- **Format:** Text, XML
- **License:** Public Domain
- **Description:** Index of all 9,000+ RFCs with titles, authors, dates, and status.
- **Size:** ~5MB

---

## 11. Unicode & Character Data

### Unicode Character Database (UCD)
- **Provider:** Unicode Consortium
- **URL:** https://www.unicode.org/ucd/
- **Format:** Text (semicolon-delimited)
- **License:** Unicode Terms of Use (free)
- **Description:** Complete data for all 150,000+ Unicode characters: names, categories, scripts, blocks, decomposition, case mapping, bidirectional properties.
- **Size:** ~30MB

### Unicode Emoji Data
- **Provider:** Unicode Consortium
- **URL:** https://unicode.org/Public/emoji/
- **Format:** Text
- **License:** Unicode Terms of Use
- **Description:** All standardized emoji with names, categories, skin tone variants, sequences, and ZWJ combinations.
- **Size:** ~1MB

### unicode-emoji-json (Ready-to-Use)
- **Provider:** muan (Community)
- **URL:** https://github.com/muan/unicode-emoji-json
- **Format:** JSON
- **License:** MIT
- **Description:** Unicode emoji data from unicode.org as easily consumable JSON files. 3,600+ emoji with names, groups, and skin tone info.
- **Size:** ~500KB

### Unicode CLDR (Full)
- **Provider:** Unicode Consortium
- **URL:** https://github.com/unicode-org/cldr-json
- **Releases:** https://cldr.unicode.org/index/downloads
- **Format:** JSON, XML
- **License:** Unicode Terms of Use (free)
- **Description:** The gold standard for internationalization data. Includes localized country names, language names, currency names, number formats, date formats, calendar data, measurement systems, and more in 100+ locales.
- **Size:** ~500MB

---

## 12. Sports

### Wikidata Sports Queries
- **Provider:** Wikimedia Foundation
- **URL:** https://query.wikidata.org/
- **Format:** CSV, JSON via SPARQL
- **License:** CC0
- **Description:** Query for athletes, teams, leagues, venues, competitions. Examples:
  - All Olympic medalists: `?person wdt:P1344 ?olympics. ?olympics wdt:P31 wd:Q159821.`
  - All FIFA World Cup matches
  - All NBA/NFL/MLB players

### Lahman Baseball Database
- **Provider:** SABR (Society for American Baseball Research)
- **URL:** https://sabr.org/lahman-database/
- **Format:** CSV, SQL, SQLite
- **License:** CC BY-SA 3.0
- **Description:** Complete MLB batting, pitching, fielding stats from 1871 to present. ~30 tables covering 100K+ player-seasons with biographical data, awards, hall of fame voting.
- **Size:** ~50MB

### Retrosheet (Baseball)
- **Provider:** Retrosheet
- **URL:** https://www.retrosheet.org/game.htm
- **Format:** CSV, text (event files)
- **License:** Free for non-commercial use
- **Description:** Play-by-play data for every MLB game since 1871. Includes rosters, game logs, schedules, and biographical data for all players.
- **Size:** ~500MB

### nflverse (NFL)
- **Provider:** nflverse community
- **URL:** https://github.com/nflverse/nflverse-data/releases
- **Format:** CSV, Parquet, RDS
- **License:** MIT
- **Description:** NFL play-by-play data back to 1999: rosters, injuries, draft picks, contracts. Updated nightly during season.
- **Size:** Millions of plays across 25+ seasons

### nba_api (NBA)
- **Provider:** swar (Community)
- **URL:** https://github.com/swar/nba_api
- **Format:** JSON via Python API client
- **License:** MIT
- **Description:** Client for NBA.com APIs: players, teams, game logs, shot charts, all historical data. Full NBA.com stats coverage.

### Football (Soccer) Open Data
- **Provider:** Various community projects
- **URL:** https://github.com/openfootball and https://footballcsv.github.io/
- **Format:** CSV, JSON
- **License:** Public Domain
- **Description:** Open football (soccer) data: leagues, teams, matches, results from major leagues worldwide. International results from 1872 to present.
- **Size:** ~50MB

### Olympic History
- **Provider:** Kaggle (Community)
- **URL:** https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results
- **Format:** CSV
- **License:** CC0
- **Description:** 120 years of Olympic data (1896-2016): 271,000+ rows of athlete/event/medal data across all Summer and Winter games.
- **Size:** ~35MB

---

## 13. Colors

### W3C/CSS Named Colors
- **Provider:** W3C
- **URL:** https://www.w3.org/TR/css-color-4/#named-colors
- **Format:** Specification (extractable)
- **License:** W3C License (free)
- **Description:** 148 named CSS colors with hex values, RGB values, and names.

### meodai/color-names (30K+ Named Colors)
- **Provider:** meodai (Community)
- **URL:** https://github.com/meodai/color-names
- **API:** https://meodai.github.io/color-name-api/
- **Format:** JSON, CSV
- **License:** MIT
- **Description:** 30,000+ handpicked color names with hex values. Includes a REST API for color name lookups.
- **Size:** ~2MB

### Crayola / X11 / General Colors
- **Provider:** Various community datasets
- **URL:** https://github.com/codebrainz/color-names
- **Format:** CSV
- **License:** Various open licenses
- **Description:** Named color databases including Crayola, X11, Pantone-like, and web colors with hex/RGB values.
- **Size:** ~100KB

### RAL Classic Colors
- **Provider:** Community (GitHub Gist)
- **URL:** https://gist.github.com/lunohodov/1995178
- **Format:** CSV
- **License:** Free
- **Description:** RAL Classic industrial color table with LRV and CMYK values. ~215 European standard colors.
- **Size:** ~15KB

---

## 14. Religion & Demographics Data

### ARDA — Association of Religion Data Archives
- **Provider:** Penn State University
- **URL:** https://thearda.com/
- **Format:** Various (SPSS, Stata, CSV)
- **License:** Free (account required)
- **Description:** 900+ surveys, membership reports, and collections on American and international religion. 232 country profiles with religious composition data.

### Pew Research Religion Datasets
- **Provider:** Pew Research Center
- **URL:** https://www.pewresearch.org/religion-datasets/
- **Format:** SPSS, Excel
- **License:** Free (account required)
- **Description:** Religious Landscape Studies (US), international religion surveys, global religious composition estimates 2010-2020 for all countries.

---

## 15. Demographics

### UN World Population Prospects
- **Provider:** United Nations
- **URL:** https://population.un.org/wpp/Download/Standard/CSV/
- **Format:** CSV
- **License:** Free (UN data)
- **Description:** Population estimates and projections (1950-2100) for all countries by age, sex, fertility, mortality, and migration.
- **Size:** ~500MB

### World Bank Open Data
- **Provider:** World Bank
- **URL:** https://data.worldbank.org/
- **Format:** CSV, Excel, API
- **License:** CC BY 4.0
- **Description:** 1,600+ indicators for 200+ countries: GDP, population, health, education, infrastructure, trade, employment, poverty. Time series data from 1960 to present.
- **Size:** Varies per indicator
- **API:** https://api.worldbank.org/v2/

### US Census American Community Survey (ACS)
- **Provider:** US Census Bureau
- **URL:** https://data.census.gov/
- **Format:** CSV, API
- **License:** Public Domain (US Government)
- **Description:** Detailed demographic, social, economic, and housing data for US geographies. 1-year and 5-year estimates at national, state, county, tract, and block group levels.
- **API:** https://api.census.gov/data.html
