# Business & Industry Classification — Dataset Descriptions

Industry codes, occupation codes, trade classifications, company registries, and economic taxonomy data. These provide the classification backbone for any business or economic data in Facto.

---

## NAICS — North American Industry Classification System

### US Census Bureau NAICS Files
- **What it is:** Official 2022 NAICS code structure with 2-digit through 6-digit industry codes (~1,000+ codes in 20 sectors). Includes crosswalks to SIC and historical revisions.
- **Certainty:** Definitive. This IS the standard.
- **Download method:** Download XLSX/PDF from Census NAICS page.
- **URL:** `https://www.census.gov/naics/`
- **Format:** XLSX, PDF
- **Size:** ~1MB
- **License:** Public Domain (US Government)

### Census NAICS Code Lists & Crosswalks
- **What it is:** NAICS-to-SIC crosswalks, NAICS-to-Census industry code crosswalks, and historical code list comparisons across revisions (2002-2022).
- **Certainty:** Very high. Official Census data.
- **Download method:** Download XLSX from Census.
- **URL:** `https://www.census.gov/topics/employment/industry-occupation/guidance/code-lists.html`
- **Format:** XLSX
- **License:** Public Domain

### GitHub NAICS CSV (Clean Extract)
- **What it is:** Clean CSV files of NAICS codes ready for programmatic use, including NAICS-to-SIC crosswalk CSVs.
- **Certainty:** High. Community-maintained from official data. Verify against Census source.
- **Download method:** Clone or download from GitHub.
- **URL:** `https://github.com/BenDoyle/NAICS` and `https://github.com/rajrao/NAICS`
- **Format:** CSV
- **Size:** ~200KB
- **License:** Open source

---

## SIC — Standard Industrial Classification

### SEC SIC Code List
- **What it is:** Complete 4-digit SIC list used by the SEC for classifying public companies. Organized by division (A-K).
- **Certainty:** Very high. Official SEC reference.
- **Download method:** Scrape from SEC website (HTML page) or find community CSV extracts.
- **URL:** `https://www.sec.gov/search-filings/standard-industrial-classification-sic-code-list`
- **Format:** HTML (scrapeable), PDF
- **Size:** ~100KB
- **License:** Public Domain (US Government)

### BLS QCEW SIC Industry Titles
- **What it is:** Complete QCEW SIC industry code and title list.
- **Certainty:** Very high. Official BLS data.
- **Download method:** Download CSV/XLSX/TXT from BLS.
- **URL:** `https://www.bls.gov/cew/classifications/industry/sic-industry-titles.htm`
- **Format:** CSV, XLSX, TXT
- **License:** Public Domain

### GitHub SIC Code CSV
- **What it is:** Clean CSV of all 4-digit SIC codes with descriptions.
- **Certainty:** High. Community extract, verify against SEC.
- **Download method:** Download from GitHub.
- **URL:** `https://github.com/saintsjd/sic4-list`
- **Format:** CSV
- **Size:** ~50KB
- **License:** Open source

---

## ISIC — International Standard Industrial Classification (UN)

### UN ISIC Rev. 4
- **What it is:** International classification system used worldwide (basis for NAICS). 4-level hierarchy: 21 sections, 88 divisions, 238 groups, 419 classes.
- **Certainty:** Definitive. UN standard.
- **Download method:** Download XLS from UN Statistics Division.
- **URL:** `https://unstats.un.org/unsd/classifications/Econ/isic`
- **Format:** PDF, XLS
- **Size:** ~500KB
- **License:** Free (UN)

### ISIC-NAICS Concordance Tables
- **What it is:** Correspondence tables between ISIC Rev.4 and NAICS, CPC, SITC, and other systems.
- **Certainty:** Very high. Official UN concordance.
- **Download method:** Download XLS from UN.
- **URL:** `https://unstats.un.org/unsd/classifications/Econ/tables`
- **Format:** XLS
- **License:** Free

---

## HS — Harmonized System (Trade/Tariff Classification)

### WCO HS Codes (Community CSV)
- **What it is:** WCO Harmonized System 6-digit international commodity codes extracted to CSV.
- **Certainty:** High. Community extract from official WCO data.
- **Download method:** Download from GitHub.
- **URL:** `https://github.com/warrantgroup/WCO-HS-Codes`
- **Format:** CSV
- **Size:** ~500KB
- **License:** Open

### GitHub HS Codes Datapackage
- **What it is:** HS codes as a Frictionless Data datapackage: 2-digit chapters, 4-digit headings, 6-digit subheadings.
- **Certainty:** High. Community-packaged from official data.
- **Download method:** Download from GitHub.
- **URL:** `https://github.com/datasets/harmonized-system`
- **Format:** CSV
- **License:** Open Data Commons PDDL

---

## SOC — Standard Occupational Classification

### BLS 2018 SOC System
- **What it is:** Complete 2018 SOC: 23 major groups, 98 minor groups, 459 broad occupations, 867 detailed occupations with titles and definitions.
- **Certainty:** Definitive. Official BLS/OMB standard.
- **Download method:** Download XLSX from BLS.
- **URL:** `https://www.bls.gov/soc/2018/`
- **Format:** XLSX, PDF
- **Size:** ~500KB
- **License:** Public Domain (US Government)

### O*NET-SOC Taxonomy
- **What it is:** Extended SOC taxonomy with detailed skills, abilities, work activities, and more for each occupation. The richest publicly available occupation data.
- **Certainty:** Very high. Official US DOL product.
- **Download method:** Download from O*NET Resource Center.
- **URL:** `https://www.onetcenter.org/taxonomy.html`
- **Format:** XLSX, database
- **Size:** ~50MB (full O*NET)
- **License:** Public Domain (US Government)

---

## Company Registries & Corporate Data

### SEC EDGAR Company Database
- **What it is:** All US publicly traded companies with CIK numbers, ticker symbols, SIC codes, state of incorporation, filing history. Includes XBRL financial data (companyfacts.zip) and filing metadata (submissions.zip).
- **Certainty:** Definitive for US public companies.
- **Download method:** Bulk ZIP downloads from SEC or REST API (no auth, 10 req/sec).
- **URL:** `https://www.sec.gov/search-filings/edgar-application-programming-interfaces`
- **CIK-Ticker mapping:** `https://www.sec.gov/files/company_tickers.json`
- **Tickers with exchanges:** `https://www.sec.gov/files/company_tickers_exchange.json`
- **Format:** JSON API, bulk ZIP
- **Size:** companyfacts.zip ~10GB, submissions.zip ~8GB, tickers ~2MB
- **License:** Public Domain (US Government)

### GLEIF Golden Copy (Legal Entity Identifiers)
- **What it is:** 2M+ Legal Entity Identifiers globally with entity names, addresses, registration details, and ownership/relationship data.
- **Certainty:** Very high. Official GLEIF data, regulatory standard.
- **Download method:** Download from GLEIF website, AWS Open Data, or REST API.
- **URL:** `https://www.gleif.org/en/lei-data/gleif-golden-copy/download-the-golden-copy`
- **AWS:** `https://registry.opendata.aws/lei/`
- **Format:** XML, CSV, JSON API
- **Size:** ~500MB
- **License:** CC0
- **Updates:** Daily

### US SAM.gov Entity Data
- **What it is:** All government contractors registered in SAM with DUNS/UEI, NAICS codes, addresses, cage codes.
- **Certainty:** Very high. Official GSA data.
- **Download method:** Download CSV from SAM.gov.
- **URL:** `https://sam.gov/data-services/Entity%20Registration/Public%20V2?privacy=Public`
- **Format:** CSV
- **Size:** ~5GB
- **License:** Public Domain (US Government)

---

## Stock / Financial Markets

### NASDAQ Trader Symbol Directory
- **What it is:** All NASDAQ-traded and exchange-traded securities with symbols, names, market category, test issue flags.
- **Certainty:** Very high. Official NASDAQ data.
- **Download method:** Direct download of pipe-delimited text.
- **URL:** `https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqtraded.txt`
- **Format:** Pipe-delimited text
- **Size:** ~3MB
- **License:** Free for personal use

---

## Government Agency Codes

### USAspending Agency Codes CSV
- **What it is:** All federal and sub-tier agency names and codes used in federal spending data.
- **Certainty:** Very high. Official US Treasury data.
- **Download method:** Direct CSV download, no auth.
- **URL:** `https://files.usaspending.gov/reference_data/agency_codes.csv`
- **Format:** CSV
- **Size:** ~100KB
- **License:** Public Domain

---

## GICS — Global Industry Classification Standard

### MSCI Official GICS Structure
- **What it is:** 4-level hierarchy: 11 sectors, 25 industry groups, 74 industries, 163 sub-industries.
- **Certainty:** Definitive for the structure. Note: company-to-GICS mappings are paid.
- **Download method:** Download XLSX from MSCI.
- **URL:** `https://www.msci.com/indexes/index-resources/gics`
- **Format:** XLSX
- **License:** Free download (structure only; company mappings are proprietary)

---

## Nonprofit / Tax-Exempt Organizations

### IRS Exempt Organizations Business Master File
- **What it is:** All IRS-determined tax-exempt organizations with EIN, name, address, ruling date, activity codes, and filing requirements.
- **Certainty:** Very high. Official IRS data.
- **Download method:** Download delimited text (ZIP) from IRS bulk downloads.
- **URL:** `https://www.irs.gov/charities-non-profits/tax-exempt-organization-search-bulk-data-downloads`
- **Format:** Delimited text (ZIP)
- **Size:** ~500MB
- **License:** Public Domain (US Government)
- **Updates:** Monthly

---

## Crosswalk / Bridge Tables

Key concordance tables connecting classification systems:

| Crosswalk | Provider | URL | Format |
|-----------|----------|-----|--------|
| NAICS-to-SIC | GitHub (rajrao) | `https://github.com/rajrao/NAICS` | CSV |
| SIC-to-NAICS | GitHub (rajrao) | `https://github.com/rajrao/NAICS` | CSV |
| NAICS-SIC (JSON) | GitHub (TorchlightSoftware) | `https://github.com/TorchlightSoftware/naics-sic-crosswalk` | JSON |
| ISIC-to-NAICS | US Census Bureau | `https://www.census.gov/topics/employment/industry-occupation/guidance/code-lists.html` | XLSX |
| SOC Crosswalks | BLS | `https://www.bls.gov/emp/documentation/crosswalks.htm` | Various |
