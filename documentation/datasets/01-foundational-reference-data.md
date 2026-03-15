# Foundational Reference Data — Dataset Descriptions

These are the bedrock datasets that everything else in Facto references. They should be ingested first as they provide the shared vocabularies (languages, currencies, units, time zones, colors, etc.) used by all other data.

---

## Languages

### ISO 639-3 Complete Code Tables
- **What it is:** The definitive catalog of all 7,800+ human languages with 3-letter codes, names, scope (individual/macro/special), type (living/extinct/ancient/constructed), and mappings to ISO 639-1 and 639-2.
- **Certainty:** Very high. This is the ISO standard maintained by SIL International as the Registration Authority. Updated periodically when languages are added or retired.
- **Download method:** Direct HTTP download of tab-delimited text files from SIL.
- **URL:** `https://iso639-3.sil.org/code_tables/download_tables`
- **Format:** TSV (UTF-8)
- **Size:** ~1MB
- **License:** Free
- **Files:** Code set, name index (multi-language), macrolanguage mappings, retired code mappings

### DataHub Language Codes
- **What it is:** ISO 639-1 (2-letter) and ISO 639-2 (3-letter) codes with English names and IETF language tags. A simpler subset of the full ISO 639-3.
- **Certainty:** High. Sourced from ISO standards, packaged by Frictionless Data.
- **Download method:** Direct file download from DataHub.io (CSV or JSON).
- **URL:** `https://datahub.io/core/language-codes`
- **Format:** CSV, JSON
- **Size:** ~50KB
- **License:** Public Domain

### GitHub iso-639 (Multi-Language Names)
- **What it is:** ISO 639 language codes with names in English, French, and German.
- **Certainty:** High. Community-maintained from ISO data; cross-check against official SIL tables.
- **Download method:** Clone or download from GitHub.
- **URL:** `https://github.com/haliaeetus/iso-639`
- **Format:** CSV, JSON
- **Size:** ~200KB
- **License:** MIT

### Unicode CLDR Language Data
- **What it is:** The gold standard for internationalization. Language names, script names, territory names, and locale data in 100+ languages.
- **Certainty:** Very high. Maintained by the Unicode Consortium. Used by every major OS and browser.
- **Download method:** Clone the cldr-json GitHub repo or download a release archive.
- **URL:** `https://github.com/unicode-org/cldr-json`
- **Format:** JSON
- **Size:** ~500MB (full CLDR — most of this is locale data, not just languages)
- **License:** Unicode Terms of Use (free)

### Glottolog
- **What it is:** Comprehensive catalog of 8,500+ languoids (languages, families, dialects) from the Max Planck Institute with genealogical classification, geographic coordinates, and academic references.
- **Certainty:** Very high. Academic source, peer-reviewed. More detailed than ISO 639-3 for language family trees.
- **Download method:** Download data exports from Glottolog releases on GitHub/Zenodo.
- **URL:** `https://glottolog.org/`
- **Format:** CSV, BibTeX, RDF
- **Size:** ~50MB
- **License:** CC BY 4.0

---

## Currencies

### ISO 4217 Currency Codes
- **What it is:** All ISO 4217 currency codes (current and historical) with currency name, country, numeric code, and minor unit (decimal places).
- **Certainty:** Very high. Official ISO standard data, packaged by DataHub/Frictionless Data.
- **Download method:** Direct download from DataHub.io or GitHub.
- **URL:** `https://datahub.io/core/currency-codes`
- **GitHub:** `https://github.com/datasets/currency-codes`
- **Format:** CSV, JSON
- **Size:** ~50KB
- **License:** Public Domain

### European Central Bank Exchange Rates
- **What it is:** Daily reference exchange rates for ~30 major currencies against EUR, with history back to 1999.
- **Certainty:** Very high. Official ECB data.
- **Download method:** Direct CSV/XML download from ECB website.
- **URL:** `https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html`
- **Format:** CSV, XML
- **Size:** ~5MB (all historical)
- **License:** Free

### Frankfurter API
- **What it is:** Free, open-source exchange rate API using ECB reference rates. No API key needed, no rate limits, self-hostable.
- **Certainty:** High. Derived from ECB data. Open source so verifiable.
- **Download method:** REST API calls — no auth required.
- **URL:** `https://frankfurter.dev/`
- **Format:** JSON API
- **License:** MIT

---

## Units of Measurement

### UCUM — Unified Code for Units of Measure
- **What it is:** Machine-parseable code system for 300+ units of measure used in science, engineering, and business.
- **Certainty:** Very high. Maintained by Regenstrief Institute. Used in HL7/FHIR medical standards.
- **Download method:** Download XML from the UCUM website.
- **URL:** `https://ucum.org/`
- **Format:** XML
- **Size:** ~200KB
- **License:** Free

### QUDT Ontology
- **What it is:** Ontology covering SI, imperial, and domain-specific units with quantities and dimensions.
- **Certainty:** High. Academic/standards-body maintained.
- **Download method:** Clone from GitHub or download release archives.
- **URL:** `https://github.com/qudt/qudt-public-repo`
- **Format:** RDF/OWL, JSON-LD
- **Size:** ~50MB
- **License:** CC BY 4.0

---

## Calendars & Holidays

### Nager.Date Public Holidays API
- **What it is:** Public holidays for 100+ countries with date, name, type (public/bank/optional), and subdivision coverage. Historical and future dates.
- **Certainty:** High. Well-maintained open-source project. Cross-check against official government sources for critical use.
- **Download method:** REST API calls per country/year — no auth required.
- **URL:** `https://date.nager.at/`
- **API pattern:** `https://date.nager.at/api/v3/publicholidays/{year}/{countryCode}`
- **Format:** JSON API
- **License:** MIT

---

## Education

### IPEDS — Integrated Postsecondary Education Data System
- **What it is:** Annual data from every US college, university, and vocational institution: enrollment, completions, finances, institutional characteristics, financial aid, human resources.
- **Certainty:** Very high. US Government mandatory reporting system via NCES.
- **Download method:** Download CSV/Access files from the IPEDS Data Center. Multiple survey components per year.
- **URL:** `https://nces.ed.gov/ipeds/datacenter/`
- **Format:** CSV (zipped), Access database
- **Size:** ~500MB (all years/surveys)
- **License:** Public Domain (US Government)

### CIP Codes — Classification of Instructional Programs
- **What it is:** Taxonomy of instructional programs (academic majors/fields of study) used by IPEDS. 6-digit codes in ~60 2-digit families.
- **Certainty:** Very high. Official NCES classification.
- **Download method:** Download from NCES website.
- **URL:** `https://nces.ed.gov/ipeds/cipcode/`
- **Format:** Web searchable, downloadable
- **Size:** ~200KB
- **License:** Public Domain

---

## Medical & Health

### ICD-10-CM Diagnosis Codes
- **What it is:** Complete ICD-10-CM code set (~72,000 codes in 21 chapters) used for medical diagnosis coding in the US.
- **Certainty:** Very high. Official CMS/CDC standard.
- **Download method:** Download XML/text files from CMS or CDC.
- **URL:** `https://www.cms.gov/medicare/coding-billing/icd-10-codes`
- **Format:** XML, text, PDF
- **Size:** ~50MB
- **License:** Public Domain (US Government)
- **Updates:** Annual (October fiscal year)

### ICD-10-PCS Procedure Codes
- **What it is:** ~78,000 procedure codes for inpatient hospital procedures.
- **Certainty:** Very high. Official CMS standard.
- **Download method:** Download from CMS alongside ICD-10-CM.
- **URL:** `https://www.cms.gov/medicare/coding-billing/icd-10-codes`
- **Format:** XML, text
- **Size:** ~30MB
- **License:** Public Domain

### NDC — National Drug Code Directory
- **What it is:** All commercially distributed drugs with NDC numbers, proprietary names, dosage forms, routes, active ingredients, and labeler information.
- **Certainty:** Very high. Official FDA data, updated weekly.
- **Download method:** Download pipe-delimited text or Excel from FDA.
- **URL:** `https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory`
- **Format:** Text (pipe-delimited), Excel
- **Size:** ~50MB
- **License:** Public Domain (US Government)

### NPI — National Provider Identifier
- **What it is:** All 8M+ healthcare providers in the US with NPI numbers, names, specialties, practice locations, and organizational affiliations.
- **Certainty:** Very high. Official CMS/NPPES registry.
- **Download method:** Download full CSV replacement file (zipped) from CMS. Also available as weekly incremental updates.
- **URL:** `https://download.cms.gov/nppes/NPI_Files.html`
- **Format:** CSV (zipped)
- **Size:** ~8GB
- **License:** Public Domain (US Government)
- **Updates:** Weekly

### RxNorm
- **What it is:** Normalized names and codes linking NDC, brand names, generic names, ingredients, and dose forms for clinical drugs.
- **Certainty:** Very high. NLM standard, widely used in healthcare IT.
- **Download method:** Download from NLM after free UMLS registration.
- **URL:** `https://www.nlm.nih.gov/research/umls/rxnorm/docs/rxnormfiles.html`
- **Format:** RRF (pipe-delimited)
- **Size:** ~500MB
- **License:** UMLS license (free registration required)

### openFDA API
- **What it is:** Drugs, devices, food adverse events, recalls, and labeling data from the FDA.
- **Certainty:** Very high. Official FDA data.
- **Download method:** REST API (no key for 1K req/day, free key for 120K/day) or bulk JSON downloads.
- **URL:** `https://open.fda.gov/apis/`
- **Bulk downloads:** `https://open.fda.gov/data/downloads/`
- **Format:** JSON API, bulk JSON
- **License:** Public Domain (US Government)

---

## Food & Agriculture

### USDA FoodData Central
- **What it is:** 400,000+ food entries with nutrient profiles (150+ nutrients per food). Five data types: Foundation Foods, SR Legacy, Branded Foods, FNDDS, and Experimental Foods.
- **Certainty:** Very high. Official USDA data.
- **Download method:** Download CSV or JSON archives from USDA.
- **URL:** `https://fdc.nal.usda.gov/download-datasets/`
- **Format:** CSV, JSON
- **Size:** ~2GB (all types)
- **License:** CC0 (Public Domain)

### FAO FAOSTAT
- **What it is:** Global agricultural production, trade, food balance sheets, food security, land use, emissions, and prices for 245+ countries.
- **Certainty:** Very high. Official UN FAO data.
- **Download method:** Bulk CSV download from FAOSTAT interface.
- **URL:** `https://www.fao.org/faostat/en/`
- **Format:** CSV
- **Size:** ~1GB total
- **License:** CC BY-NC-SA 3.0 IGO

---

## Transportation

### OpenFlights Airports, Airlines & Routes
- **What it is:** 10,000+ airports with IATA/ICAO codes and coordinates, 6,000+ airlines, 67,000+ routes.
- **Certainty:** Medium-high. Community-maintained, not always current. Cross-check with OurAirports for freshness.
- **Download method:** Direct CSV download from OpenFlights website.
- **URL:** `https://openflights.org/data`
- **Format:** CSV
- **Size:** Airports ~1MB, Airlines ~500KB, Routes ~3MB
- **License:** Open Database License

### OurAirports
- **What it is:** Nightly updated CSV dumps of 75,000+ airports, runways, navaids, frequencies, countries, and regions.
- **Certainty:** High. More comprehensive and fresher than OpenFlights. Community-maintained with nightly builds.
- **Download method:** Direct CSV download.
- **URL:** `https://ourairports.com/data/`
- **Format:** CSV
- **Size:** ~5MB
- **License:** Public Domain
- **Files:** airports.csv, runways.csv, navaids.csv, airport-frequencies.csv, countries.csv, regions.csv

### UN/LOCODE — Ports & Trade Locations
- **What it is:** 100,000+ trade locations (ports, airports, inland freight) in 249 countries with 5-character codes.
- **Certainty:** Very high. Official UN standard.
- **Download method:** Download from UNECE website.
- **URL:** `https://unece.org/trade/uncefact/unlocode`
- **Format:** CSV, text
- **Size:** ~20MB
- **License:** Free (UN)

### NHTSA Vehicle Make/Model Database
- **What it is:** Vehicle make, model, year, body type, and VIN decoding data for all US-market vehicles via 25+ API endpoints.
- **Certainty:** Very high. Official US DOT data.
- **Download method:** REST API — no auth required. Standalone SQL database also available.
- **URL:** `https://vpic.nhtsa.dot.gov/api/`
- **Format:** JSON, CSV, XML API
- **License:** Public Domain (US Government)

---

## Environmental & Climate

### NOAA Global Historical Climatology Network (GHCN)
- **What it is:** Daily climate summaries from 100,000+ stations in 180+ countries. Core variables: max/min temp, precipitation, snowfall.
- **Certainty:** Very high. Official NOAA data.
- **Download method:** FTP/HTTP download of fixed-width text files.
- **URL:** `https://www.ncei.noaa.gov/products/land-based-station/global-historical-climatology-network-daily`
- **Format:** Fixed-width text, CSV
- **Size:** ~30GB
- **License:** Public Domain

### EPA Air Quality Data
- **What it is:** Criteria pollutant monitoring data (PM2.5, ozone, CO, SO2, NO2, lead) from AQS stations across the US.
- **Certainty:** Very high. Official EPA data.
- **Download method:** Download zipped CSV files by year from EPA.
- **URL:** `https://aqs.epa.gov/aqsweb/airdata/download_files.html`
- **Format:** CSV (zipped)
- **Size:** ~1GB per year
- **License:** Public Domain (US Government)

---

## Standards & Internet

### IANA Registries
- **What it is:** Authoritative registries for TLDs, MIME types, time zones, port numbers, character sets, and language subtags.
- **Certainty:** Very high. These ARE the standards.
- **Download method:** Direct HTTP download of individual registry files.
- **URLs:**
  - TLDs: `https://data.iana.org/TLD/tlds-alpha-by-domain.txt`
  - MIME Types: `https://www.iana.org/assignments/media-types/`
  - Time Zones: `https://www.iana.org/time-zones`
  - Ports: `https://www.iana.org/assignments/service-names-port-numbers/`
  - Character Sets: `https://www.iana.org/assignments/character-sets/`
  - Language Subtags: `https://www.iana.org/assignments/language-subtag-registry/`
- **Format:** CSV, XML, text
- **License:** Public Domain

### IEEE OUI (MAC Address Vendor Prefixes)
- **What it is:** Mapping of MAC address prefixes (OUI) to hardware vendors. 30,000+ registrations.
- **Certainty:** Very high. Official IEEE registry.
- **Download method:** Direct CSV download.
- **URL:** `https://standards-oui.ieee.org/oui/oui.csv`
- **Format:** CSV
- **Size:** ~5MB
- **License:** Free

### IETF RFC Index
- **What it is:** Index of all 9,000+ RFCs with titles, authors, dates, and status.
- **Certainty:** Very high. Official IETF.
- **Download method:** Direct text/XML download.
- **URL:** `https://www.rfc-editor.org/rfc-index.txt`
- **Format:** Text, XML
- **Size:** ~5MB
- **License:** Public Domain

---

## Unicode & Character Data

### Unicode Character Database (UCD)
- **What it is:** Complete data for all 150,000+ Unicode characters: names, categories, scripts, blocks, decomposition, case mapping, bidirectional properties.
- **Certainty:** Very high. THE standard.
- **Download method:** Download from Unicode.org.
- **URL:** `https://www.unicode.org/ucd/`
- **Format:** Text (semicolon-delimited)
- **Size:** ~30MB
- **License:** Unicode Terms of Use (free)

### Unicode Emoji Data
- **What it is:** All standardized emoji with names, categories, skin tone variants, sequences, and ZWJ combinations.
- **Certainty:** Very high. Official Unicode standard.
- **Download method:** Download from Unicode.org.
- **URL:** `https://unicode.org/Public/emoji/`
- **Format:** Text
- **Size:** ~1MB
- **License:** Unicode Terms of Use

### unicode-emoji-json
- **What it is:** 3,600+ emoji as easily consumable JSON. Community repackaging of Unicode data.
- **Certainty:** High. Derived from official data but verify version alignment.
- **Download method:** Clone or download from GitHub.
- **URL:** `https://github.com/muan/unicode-emoji-json`
- **Format:** JSON
- **Size:** ~500KB
- **License:** MIT

---

## Sports

### Lahman Baseball Database
- **What it is:** Complete MLB batting, pitching, fielding stats from 1871 to present. ~30 tables covering 100K+ player-seasons with biographical data, awards, hall of fame voting.
- **Certainty:** Very high. Gold standard for baseball analytics, maintained by SABR.
- **Download method:** Download CSV/SQL/SQLite from SABR.
- **URL:** `https://sabr.org/lahman-database/`
- **Format:** CSV, SQL, SQLite
- **Size:** ~50MB
- **License:** CC BY-SA 3.0

### Retrosheet (Baseball)
- **What it is:** Play-by-play data for every MLB game since 1871. Includes rosters, game logs, schedules.
- **Certainty:** Very high. Definitive source for historical baseball play-by-play.
- **Download method:** Download event files from Retrosheet.
- **URL:** `https://www.retrosheet.org/game.htm`
- **Format:** CSV, text (event files)
- **Size:** ~500MB
- **License:** Free for non-commercial use

### nflverse (NFL)
- **What it is:** NFL play-by-play data back to 1999: rosters, injuries, draft picks, contracts. Updated nightly during season.
- **Certainty:** High. Community-maintained but very actively developed and widely used.
- **Download method:** Download CSV/Parquet from GitHub releases.
- **URL:** `https://github.com/nflverse/nflverse-data/releases`
- **Format:** CSV, Parquet
- **Size:** GB-scale across all seasons
- **License:** MIT

### Football (Soccer) Open Data
- **What it is:** Open football (soccer) data: leagues, teams, matches, results from major leagues worldwide. International results from 1872 to present.
- **Certainty:** Medium-high. Community-maintained, coverage varies by league.
- **Download method:** Clone from GitHub.
- **URL:** `https://github.com/openfootball` and `https://footballcsv.github.io/`
- **Format:** CSV, JSON
- **Size:** ~50MB
- **License:** Public Domain

### Olympic History (Kaggle)
- **What it is:** 120 years of Olympic data (1896-2016): 271,000+ rows of athlete/event/medal data.
- **Certainty:** High for historical data. Stops at 2016, needs supplementing for recent games.
- **Download method:** Download from Kaggle (free account required).
- **URL:** `https://www.kaggle.com/datasets/heesoo37/120-years-of-olympic-history-athletes-and-results`
- **Format:** CSV
- **Size:** ~35MB
- **License:** CC0

---

## Colors

### meodai/color-names
- **What it is:** 30,000+ handpicked color names with hex values. Includes a REST API.
- **Certainty:** High for the domain. Community-curated, comprehensive.
- **Download method:** Clone from GitHub or use REST API.
- **URL:** `https://github.com/meodai/color-names`
- **Format:** JSON, CSV
- **Size:** ~2MB
- **License:** MIT

### RAL Classic Colors
- **What it is:** RAL Classic industrial color table with LRV and CMYK values. ~215 European standard colors.
- **Certainty:** High. Standard industrial color codes.
- **Download method:** Download from GitHub Gist.
- **URL:** `https://gist.github.com/lunohodov/1995178`
- **Format:** CSV
- **Size:** ~15KB
- **License:** Free

---

## Demographics

### UN World Population Prospects
- **What it is:** Population estimates and projections (1950-2100) for all countries by age, sex, fertility, mortality, and migration.
- **Certainty:** Very high. Official UN data.
- **Download method:** Direct CSV download from UN.
- **URL:** `https://population.un.org/wpp/Download/Standard/CSV/`
- **Format:** CSV
- **Size:** ~500MB
- **License:** Free (UN data)

### World Bank Open Data
- **What it is:** 1,600+ indicators for 200+ countries: GDP, population, health, education, infrastructure, trade, employment, poverty. Time series from 1960.
- **Certainty:** Very high. Official World Bank data.
- **Download method:** CSV/Excel download or REST API.
- **URL:** `https://data.worldbank.org/`
- **API:** `https://api.worldbank.org/v2/`
- **Format:** CSV, Excel, JSON API
- **Size:** Varies per indicator
- **License:** CC BY 4.0

### US Census American Community Survey
- **What it is:** Detailed demographic, social, economic, and housing data for US geographies at national/state/county/tract/block group levels.
- **Certainty:** Very high. Official US Census Bureau data.
- **Download method:** CSV download or REST API.
- **URL:** `https://data.census.gov/`
- **API:** `https://api.census.gov/data.html`
- **Format:** CSV, JSON API
- **License:** Public Domain (US Government)
