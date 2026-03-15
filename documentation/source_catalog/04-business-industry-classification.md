# Business & Industry Classification Data Sources

Public, free datasets for industry codes, occupation codes, trade classifications, company registries, and economic taxonomy data.

---

## 1. NAICS — North American Industry Classification System

### US Census Bureau NAICS Files
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/naics/
- **Format:** XLSX, PDF
- **License:** Public Domain (US Government)
- **Description:** Official 2022 NAICS code structure with 2-digit through 6-digit industry codes. Includes code changes from prior revisions, crosswalks to SIC, and full definitions.
- **Size:** ~1MB
- **Coverage:** ~1,000+ 6-digit codes organized in 20 sectors

### Census NAICS Code Lists & Crosswalks
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/topics/employment/industry-occupation/guidance/code-lists.html
- **Format:** XLSX
- **License:** Public Domain
- **Description:** NAICS-to-Census industry code crosswalks, NAICS-to-SIC crosswalks, and historical code list comparisons across revisions (2002, 2007, 2012, 2017, 2022).

### NAICS Association Free List
- **Provider:** NAICS Association
- **URL:** https://www.naics.com/
- **Format:** XLSX (downloadable), web searchable
- **License:** Free to use
- **Description:** Complete 2022 NAICS codes with short title descriptions, searchable online or downloadable.
- **Size:** ~200KB

### GitHub NAICS CSV (Clean Extract)
- **Provider:** BenDoyle / rajrao (Community)
- **URL:** https://github.com/BenDoyle/NAICS and https://github.com/rajrao/NAICS
- **Format:** CSV
- **License:** Open source
- **Description:** Clean CSV files of NAICS codes ready for programmatic use. rajrao's repo also includes NAICS-to-SIC and SIC-to-NAICS crosswalk CSV files.
- **Size:** ~200KB

---

## 2. SIC — Standard Industrial Classification

### SEC SIC Code List
- **Provider:** US Securities and Exchange Commission
- **URL:** https://www.sec.gov/search-filings/standard-industrial-classification-sic-code-list
- **Format:** HTML (scrapeable), PDF
- **License:** Public Domain (US Government)
- **Description:** Complete SIC code list used by the SEC for classifying public companies. 4-digit codes organized by division (A-K).
- **Size:** ~100KB

### OSHA SIC Manual
- **Provider:** Occupational Safety and Health Administration
- **URL:** https://www.osha.gov/data/sic-manual
- **Format:** HTML (searchable web interface)
- **License:** Public Domain (US Government)
- **Description:** Full 1987 SIC manual with keyword search and hierarchical browsing. Includes detailed descriptions for each 2, 3, and 4-digit code.

### EHSO Complete SIC List
- **Provider:** EHSO.com
- **URL:** https://ehso.com/siccodes.php
- **Format:** HTML
- **License:** Free to use
- **Description:** Complete SIC code listing on a single page, convenient for scraping or reference.

### GitHub SIC Code CSV (Clean Extract)
- **Provider:** saintsjd (Community)
- **URL:** https://github.com/saintsjd/sic4-list
- **Format:** CSV
- **License:** Open source
- **Description:** Clean CSV of all 4-digit SIC codes with descriptions, ready for database import.
- **Size:** ~50KB

### BLS QCEW SIC Industry Titles
- **Provider:** Bureau of Labor Statistics
- **URL:** https://www.bls.gov/cew/classifications/industry/sic-industry-titles.htm
- **Format:** CSV, XLSX, TXT
- **License:** Public Domain
- **Description:** Complete QCEW SIC industry code and title list, downloadable in multiple formats.

---

## 3. ISIC — International Standard Industrial Classification (UN)

### UN Statistics Division ISIC Rev. 4
- **Provider:** United Nations Statistics Division
- **URL:** https://unstats.un.org/unsd/classifications/Econ/isic
- **Format:** PDF, XLS
- **License:** Free (UN data)
- **Description:** International classification system used worldwide (basis for NAICS). 4-level hierarchy: sections (A-U), divisions (2-digit), groups (3-digit), classes (4-digit).
- **Size:** ~500KB
- **Coverage:** 21 sections, 88 divisions, 238 groups, 419 classes

### ISIC-NAICS Concordance Tables
- **Provider:** UN Statistics Division
- **URL:** https://unstats.un.org/unsd/classifications/Econ/tables
- **Format:** XLS
- **License:** Free
- **Description:** Correspondence tables between ISIC Rev.4 and NAICS, CPC, SITC, and other systems.

---

## 4. HS — Harmonized System (Trade/Tariff Classification)

### US International Trade Commission HTS
- **Provider:** US International Trade Commission
- **URL:** https://hts.usitc.gov/
- **Format:** PDF, searchable web, API
- **License:** Public Domain (US Government)
- **Description:** US Harmonized Tariff Schedule — the US implementation of the international HS system with 10-digit tariff codes, duty rates, and product descriptions.

### WCO HS Codes (Community)
- **Provider:** Warrant Group / WCO (Community extract)
- **URL:** https://github.com/warrantgroup/WCO-HS-Codes
- **Format:** CSV
- **License:** Open
- **Description:** WCO Harmonized System codes extracted to CSV format. 6-digit international HS codes for commodity classification.
- **Size:** ~500KB

### GitHub HS Codes Datapackage
- **Provider:** datasets (Community)
- **URL:** https://github.com/datasets/harmonized-system
- **Format:** CSV
- **License:** Open Data Commons PDDL
- **Description:** HS codes as a Frictionless Data datapackage, including 2-digit chapters, 4-digit headings, and 6-digit subheadings.

### WTO Tariff Download Facility
- **Provider:** World Trade Organization
- **URL:** https://www.wto.org/english/tratop_e/tariffs_e/tariff_data_e.htm
- **Format:** Excel, XML, CSV
- **License:** Free (WTO member data)
- **Description:** Applied and bound tariff data by country, HS code, product group.

---

## 5. SOC — Standard Occupational Classification

### BLS 2018 SOC System
- **Provider:** Bureau of Labor Statistics
- **URL:** https://www.bls.gov/soc/2018/
- **Format:** XLSX, PDF
- **License:** Public Domain (US Government)
- **Description:** Complete 2018 SOC system: 23 major groups, 98 minor groups, 459 broad occupations, 867 detailed occupations. Includes titles, definitions, and hierarchical structure.
- **Size:** ~500KB

### O*NET-SOC Taxonomy
- **Provider:** O*NET Resource Center (US DOL)
- **URL:** https://www.onetcenter.org/taxonomy.html
- **Format:** XLSX, database
- **License:** Public Domain (US Government)
- **Description:** Extended SOC taxonomy used by O*NET with detailed occupation data, skills, abilities, work activities, and more for each occupation.
- **Size:** ~50MB (full O*NET database)

### Census Occupation Code Lists
- **Provider:** US Census Bureau
- **URL:** https://www.census.gov/topics/employment/industry-occupation/guidance/code-lists.html
- **Format:** XLSX
- **License:** Public Domain
- **Description:** Census occupation codes with crosswalks to SOC, plus historical code comparisons.

---

## 6. CPC — Central Product Classification (UN)

### UN CPC Ver. 2.1
- **Provider:** United Nations Statistics Division
- **URL:** https://unstats.un.org/unsd/classifications/Econ/cpc
- **Format:** PDF, XLS
- **License:** Free (UN data)
- **Description:** International product classification covering goods and services. 5-level hierarchy used for international trade statistics.

---

## 7. SITC — Standard International Trade Classification

### UN SITC Rev. 4
- **Provider:** United Nations Statistics Division
- **URL:** https://unstats.un.org/unsd/classifications/Econ/sitc
- **Format:** PDF, XLS
- **License:** Free (UN data)
- **Description:** Trade classification used in UN Comtrade. 5-digit codes for commodities in international trade.

---

## 8. Company Registries & Corporate Data

### SEC EDGAR Company Database
- **Provider:** US Securities and Exchange Commission
- **URL:** https://www.sec.gov/search-filings/edgar-application-programming-interfaces
- **Format:** JSON API, bulk ZIP downloads
- **License:** Public Domain (US Government)
- **Description:** All US publicly traded companies with CIK numbers, ticker symbols, SIC codes, state of incorporation, filing history. Bulk archives: `companyfacts.zip` (XBRL financial data), `submissions.zip` (filing metadata).
- **Size:** companyfacts.zip ~10GB, submissions.zip ~8GB
- **API:** https://data.sec.gov — no auth required, 10 req/sec

### SEC EDGAR CIK-Ticker Mapping
- **Provider:** SEC
- **URL:** https://www.sec.gov/files/company_tickers.json
- **Format:** JSON
- **License:** Public Domain
- **Description:** Current mapping of all CIK numbers to ticker symbols and company names.
- **Size:** ~2MB

### OpenCorporates
- **Provider:** OpenCorporates
- **URL:** https://opencorporates.com/
- **Format:** JSON API
- **License:** Open Database License (API), various per jurisdiction
- **Description:** Largest open database of companies in the world — 200M+ companies from 140+ jurisdictions. Free API with rate limits.
- **API Rate Limit:** Varies by plan (free tier available)

### US SAM.gov Entity Data
- **Provider:** General Services Administration
- **URL:** https://sam.gov/data-services/Entity%20Registration/Public%20V2?privacy=Public
- **Format:** CSV
- **License:** Public Domain (US Government)
- **Description:** All entities registered in the US System for Award Management — government contractors with DUNS/UEI, NAICS codes, addresses, and cage codes.
- **Size:** ~5GB

---

## 9. Patent Classification

### USPTO CPC (Cooperative Patent Classification)
- **Provider:** US Patent and Trademark Office
- **URL:** https://www.uspto.gov/web/patents/classification/cpc/html/cpc.html
- **Format:** XML, text
- **License:** Public Domain (US Government)
- **Description:** Cooperative Patent Classification scheme (joint USPTO/EPO system). Hierarchical codes for classifying patent technology.

### IPC — International Patent Classification (WIPO)
- **Provider:** World Intellectual Property Organization
- **URL:** https://www.wipo.int/classifications/ipc/en/
- **Format:** XML, PDF
- **License:** Free (WIPO)
- **Description:** International Patent Classification used by patent offices worldwide. 8 sections, ~70,000 entries.

---

## 10. Stock / Financial Market Data

### SEC Company Tickers & Exchanges
- **Provider:** SEC
- **URL:** https://www.sec.gov/files/company_tickers_exchange.json
- **Format:** JSON
- **License:** Public Domain
- **Description:** All tickers with exchange information and CIK numbers.

### NASDAQ Trader Symbol Directory
- **Provider:** NASDAQ
- **URL:** https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqtraded.txt
- **Format:** Pipe-delimited text
- **License:** Free for personal use
- **Description:** All NASDAQ-traded and exchange-traded securities with symbols, names, market category, test issue flags.
- **Size:** ~3MB

---

## 11. Government Agency Codes

### US Government Manual Agency Listing
- **Provider:** Government Publishing Office
- **URL:** https://www.usgovernmentmanual.gov/
- **Format:** Web, API
- **License:** Public Domain
- **Description:** All federal agencies, departments, and independent establishments with organizational hierarchy.

### Federal Agency Directory (USA.gov)
- **Provider:** GSA
- **URL:** https://www.usa.gov/federal-agencies
- **Format:** Web
- **License:** Public Domain
- **Description:** Comprehensive directory of US federal agencies with contact info and descriptions.

### USAspending Agency Codes CSV
- **Provider:** US Treasury / USAspending.gov
- **URL:** https://files.usaspending.gov/reference_data/agency_codes.csv
- **Format:** CSV
- **License:** Public Domain
- **Description:** All federal agency and sub-tier agency names and codes used in federal spending data. Direct CSV download, no auth needed.
- **Size:** ~100KB

---

## 12. Tax Jurisdiction Data

### IRS Tax Statistics — State/ZIP Data
- **Provider:** Internal Revenue Service
- **URL:** https://www.irs.gov/statistics/soi-tax-stats-individual-income-tax-statistics-zip-code-data-soi
- **Format:** CSV, Excel
- **License:** Public Domain (US Government)
- **Description:** Individual income tax data aggregated by state and ZIP code, including income ranges, deductions, credits.

### State Tax Authority Listings
- **Provider:** Federation of Tax Administrators
- **URL:** https://www.taxadmin.org/state-tax-agencies
- **Format:** Web
- **License:** Free
- **Description:** Links and info for all US state tax authorities.

---

## 13. GICS — Global Industry Classification Standard

### MSCI Official GICS Structure
- **Provider:** MSCI / S&P Dow Jones Indices
- **URL:** https://www.msci.com/indexes/index-resources/gics
- **Format:** XLSX
- **License:** Free download (proprietary structure, company mappings are paid)
- **Description:** Official GICS hierarchy: 11 sectors, 25 industry groups, 74 industries, 163 sub-industries.

### Kaggle GICS Dataset
- **Provider:** Community (Kaggle)
- **URL:** https://www.kaggle.com/datasets/merlos/gics-global-industry-classification-standard
- **Format:** CSV
- **License:** Community dataset (free account required)
- **Description:** Complete GICS hierarchy with codes, titles, and definitions.

---

## 14. UNSPSC — Product & Service Classification

### Data.gov UNSPSC Codes
- **Provider:** US Government
- **URL:** https://catalog.data.gov/dataset/unspsc-codes-93778
- **Format:** CSV
- **License:** Public Domain
- **Description:** UNSPSC 5-level hierarchical codes (Segment, Family, Class, Commodity, Business Function) for classifying products and services.

### UNDP Official UNSPSC
- **Provider:** United Nations Development Programme
- **URL:** https://www.undp.org/unspsc
- **Format:** Browsable, downloadable
- **License:** Free (registration may be required)
- **Description:** Current official version of the UNSPSC classification, maintained by the UN.

---

## 15. Legal Entity Identifiers (LEI)

### GLEIF Golden Copy
- **Provider:** Global Legal Entity Identifier Foundation
- **URL:** https://www.gleif.org/en/lei-data/gleif-golden-copy/download-the-golden-copy
- **AWS Open Data:** https://registry.opendata.aws/lei/
- **API:** https://www.gleif.org/en/lei-data/gleif-api
- **Format:** XML, CSV, JSON API
- **License:** CC0 (Public Domain)
- **Description:** 2+ million Legal Entity Identifiers globally with entity names, addresses, registration details, and ownership/relationship data. Updated daily.
- **Size:** ~500MB

---

## 16. Nonprofit / Tax-Exempt Organizations

### IRS Exempt Organizations Business Master File
- **Provider:** Internal Revenue Service
- **URL:** https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf
- **Bulk Downloads:** https://www.irs.gov/charities-non-profits/tax-exempt-organization-search-bulk-data-downloads
- **Format:** Delimited text (ZIP)
- **License:** Public Domain (US Government)
- **Description:** All IRS-determined tax-exempt organizations with EIN, name, address, ruling date, activity codes, and filing requirements. Updated monthly.
- **Size:** ~500MB

### ProPublica Nonprofit Explorer
- **Provider:** ProPublica
- **URL:** https://projects.propublica.org/nonprofits/
- **Format:** Web, API
- **License:** Free
- **Description:** 1.8M+ nonprofit Form 990 filings since 2013, searchable with revenue, assets, and executive compensation data.

---

## 17. Crosswalk / Bridge Tables

These concordance tables connect different classification systems to each other.

| Crosswalk | Provider | URL | Format |
|-----------|----------|-----|--------|
| NAICS-to-SIC | GitHub (rajrao) | https://github.com/rajrao/NAICS | CSV |
| SIC-to-NAICS | GitHub (rajrao) | https://github.com/rajrao/NAICS | CSV |
| NAICS-SIC (JSON) | GitHub (TorchlightSoftware) | https://github.com/TorchlightSoftware/naics-sic-crosswalk | JSON |
| ISIC-to-NAICS | US Census Bureau | https://www.census.gov/topics/employment/industry-occupation/guidance/code-lists.html | XLSX |
| HS-to-CPC | World Bank WITS | https://wits.worldbank.org/referencedata.html | Web download |
| SOC Crosswalks | BLS | https://www.bls.gov/emp/documentation/crosswalks.htm | Various |
| ISIC Rev.4-to-Rev.5 | UN Statistics Division | https://unstats.un.org/unsd/classifications/Econ/tables | XLSX |
