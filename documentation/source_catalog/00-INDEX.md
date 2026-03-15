# Facto Source Catalog — Master Index

A comprehensive inventory of free, public datasets suitable for ingestion into the Retold Facto data warehouse. Organized into five catalogs covering ~200+ individual data sources.

---

## Catalog Files

| # | File | Category | Sources |
|---|------|----------|---------|
| 01 | [01-foundational-reference-data.md](01-foundational-reference-data.md) | Foundational Reference Data | ~60 sources |
| 02 | [02-geographic-location-data.md](02-geographic-location-data.md) | Geographic & Location Data | ~40 sources |
| 03 | [03-people-cultural-entities.md](03-people-cultural-entities.md) | People & Cultural Entities | ~35 sources |
| 04 | [04-business-industry-classification.md](04-business-industry-classification.md) | Business & Industry Classification | ~45 sources |
| 05 | [05-media-entertainment.md](05-media-entertainment.md) | Media & Entertainment | ~40 sources |

---

## Quick Reference — Top Sources by Priority

### Tier 1: Foundational Reference (ingest first)
Core standards and reference data that everything else links to.

| Dataset | Provider | Records | Format |
|---------|----------|---------|--------|
| ISO 4217 Currencies | DataHub.io | 300+ currencies | CSV |
| ISO 639-3 Languages | SIL International | 7,800+ languages | TSV |
| IANA Time Zones | IANA | 400+ zones | Text |
| Unicode Character DB | Unicode | 150,000+ characters | Text |
| UCUM Units | Regenstrief | 300+ units | XML/TSV |
| CSS/Named Colors | W3C + Community | 30,000+ colors | JSON |
| IANA TLDs | IANA | 1,500+ TLDs | Text |
| Nager.Date Holidays | Nager.Date | 100+ countries | JSON API |

### Tier 2: Foundation Geography
These provide the core geographic taxonomy everything else links to.

| Dataset | Provider | Records | Format |
|---------|----------|---------|--------|
| ISO 3166 Countries | lukes/ISO-3166 | 249 countries | CSV |
| ISO 3166-2 Subdivisions | ipregistry/iso3166 | 5,000+ subdivisions | CSV |
| GeoNames All Countries | GeoNames.org | 11M+ places | TSV |
| Countries-States-Cities DB | dr5hn (Community) | 150K+ cities | JSON/CSV |
| US Census Gazetteer (Counties) | US Census Bureau | 3,200+ counties | Text |
| US Census Gazetteer (ZCTAs) | US Census Bureau | 33,000+ ZIPs | Text |
| GeoNames Postal Codes | GeoNames.org | 1M+ postal codes | TSV |

### Tier 3: People & Creative Works
Named entities — the people, books, films, and music.

| Dataset | Provider | Records | Format |
|---------|----------|---------|--------|
| Wikidata People | Wikimedia | 10M+ persons | JSON/RDF |
| Cross-Verified Notable People | Sciences Po | 2.3M people | CSV |
| Pantheon Notable People | MIT Media Lab | 85,000+ people | CSV |
| IMDb Datasets | IMDb/Amazon | 13M people, 10M titles | TSV |
| MusicBrainz | MetaBrainz | 2.6M+ artists, 35M+ recordings | JSON/PG |
| Discogs Data Dumps | Discogs | 8M+ artists, 16M+ releases | XML |
| Open Library Authors | Internet Archive | 9M+ authors | TSV/JSON |
| OpenAlex | OurResearch | 93M+ authors, 480M+ works | JSON |
| ORCID Public Data | ORCID | 19M+ researchers | XML |

### Tier 4: Business & Economic Taxonomy
Core classification systems for business, industry, and trade.

| Dataset | Provider | Records | Format |
|---------|----------|---------|--------|
| NAICS 2022 | US Census Bureau | 1,000+ codes | XLSX |
| SIC Codes | SEC / OSHA | 1,000+ codes | HTML/Text |
| ISIC Rev. 4 | UN Statistics | 419 classes | XLS |
| SOC 2018 | BLS | 867 occupations | XLSX |
| HS Codes | WCO (Community) | 5,000+ codes | CSV |
| SEC EDGAR Companies | SEC | 10,000+ companies | JSON |
| GLEIF LEI | GLEIF | 2M+ entities | XML/CSV |

### Tier 5: Media & Entertainment
Film, TV, music, games, and literary works.

| Dataset | Provider | Records | Format |
|---------|----------|---------|--------|
| IMDb Title + People | IMDb/Amazon | 10M titles, 13M people | TSV |
| TMDb API | TMDb | 900K+ movies, 160K+ TV | JSON API |
| MusicBrainz Releases | MetaBrainz | 4.7M releases | JSON/PG |
| Discogs Releases | Discogs | 16M+ releases | XML |
| Open Library Editions | Internet Archive | 30M+ editions | TSV/JSON |
| Project Gutenberg | PG | 73,000+ books | CSV/RDF |
| Podcast Index | Podcast Index | 4M+ podcasts | JSON API |
| IGDB | Twitch | 200K+ games | JSON API |

### Tier 6: Domain-Specific Reference
Specialized reference data for specific use cases.

| Dataset | Provider | Records | Format |
|---------|----------|---------|--------|
| USDA FoodData Central | USDA | 400,000+ foods | CSV/JSON |
| ICD-10-CM Codes | CMS/CDC | 72,000+ codes | XML/Text |
| NPI Registry | CMS/NPPES | 8M+ providers | CSV |
| NDC Drug Directory | FDA | 300,000+ drugs | Text |
| OurAirports | OurAirports | 75,000+ airports | CSV |
| NOAA Climate Data | NOAA | 100,000+ stations | CSV |
| IPEDS Education Data | NCES | 7,000+ institutions | CSV |
| Lahman Baseball DB | SABR | 100K+ player-seasons | CSV |
| World Bank Indicators | World Bank | 1,600+ indicators | CSV/API |

---

## Data Format Legend

| Format | Description | Ease of Ingestion |
|--------|-------------|-------------------|
| CSV | Comma-separated values | Easiest |
| TSV | Tab-separated values | Easy |
| JSON | JavaScript Object Notation | Easy |
| XLSX | Excel spreadsheet | Easy (convert to CSV) |
| XML | Extensible Markup Language | Medium |
| Text (pipe/fixed) | Pipe-delimited or fixed-width text | Medium |
| SQL | Database dump (PostgreSQL, MySQL) | Medium |
| RDF/N-Triples | Semantic web / linked data | Hard |
| MARC | Library catalog format | Hard |
| Shapefile | Geographic vector data | Specialized |

---

## License Guide

| License | Commercial Use | Attribution | Notes |
|---------|---------------|-------------|-------|
| Public Domain / CC0 | Yes | No | Unrestricted |
| CC BY 4.0 | Yes | Yes | Must credit source |
| CC BY-SA 4.0 | Yes | Yes | Derivatives must share-alike |
| MIT | Yes | Yes (in code) | Very permissive |
| ODbL | Yes | Yes | Database-specific open license |
| US Government | Yes | No | Federal works are public domain |
| Non-Commercial Only | No | Varies | IMDb datasets, some others |

---

## Suggested Ingestion Order

1. **Currencies** — ISO 4217 (300 records, foundational reference)
2. **Languages** — ISO 639-3 (7,800 languages, foundational reference)
3. **Time Zones** — IANA tz database (400+ zones)
4. **Countries** — ISO 3166-1 (249 records, foundation for geography)
5. **Subdivisions** — ISO 3166-2 (states, provinces — 5,000+ records)
6. **Cities** — GeoNames cities15000 or Countries-States-Cities DB
7. **Postal Codes** — GeoNames postal codes (links to cities)
8. **NAICS / SIC** — Industry codes (foundation for business classification)
9. **SOC** — Occupation codes (complement to industry)
10. **IMDb People + Titles** — Film/TV people and works
11. **MusicBrainz Artists + Releases** — Music people and releases
12. **Open Library Authors + Works** — Book authors and works
13. **Discogs Artists + Releases** — Additional music coverage
14. **Pantheon / Cross-Verified DB** — Cross-domain notable people
15. **Video Games (IGDB/RAWG)** — Game titles and metadata
16. **Podcasts (Podcast Index)** — Podcast shows and episodes
17. **Remaining domain-specific datasets** — as needed

---

## Notes

- All datasets listed are **free for at least non-commercial use** as of early 2026
- URLs and availability should be verified before bulk ingestion
- Some datasets (Wikidata, OpenAlex, ORCID) are very large (100GB+) and may need filtering before import
- API-based sources should be accessed via the Facto catalog fetch system rather than bulk download
- Consider data freshness — some datasets update daily (GeoNames, IMDb), others annually (Census, IPEDS)
- The **foundational reference data** should be loaded first as other datasets reference it (currencies, languages, timezones)
