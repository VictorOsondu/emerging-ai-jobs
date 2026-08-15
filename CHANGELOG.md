# Changelog

This project follows [Semantic Versioning](https://semver.org/).

## [0.4.0] - 2026-08-15

### Added

- Forward-Deployed AI Engineer role profile at `High` confidence, backed by three current exact-title postings from Cohere, Cursor, and Mistral with archive links.
- First published playbook: AI Evaluation Specialist, following the playbook standard.

## [0.3.2] - 2026-08-15

### Added

- Five new evidence records verified against live sources with archive links: Reflection AI risk-and-governance and NIST AI RMF for the governance and assurance roles, Decagon agent development for Agent Operations Specialist, Databricks AI transformation for AI Transformation Manager, and OpenAI AI support for the customer-support evolution.
- First standards-based evidence record (NIST AI RMF 1.0), diluting the job-posting-only evidence base.

### Changed

- Restored Agent Operations Specialist to `Medium` confidence on a current closely matching signal.
- Scheduled evidence link checks now file or update a GitHub issue on failure instead of failing silently.
- The weekly check requests Wayback snapshots for active sources that lack an archive link.
- README badge and review dates are now derived from the evidence register's audit date during rendering.

## [0.3.1] - 2026-08-15

### Changed

- Re-audited all 33 evidence records against live sources, job-board APIs, and the Wayback Machine.
- Marked ten postings that closed since the previous audit as historical observations, including all previously current AI Governance Lead sources.
- Downgraded confidence where current-signal rules require it: AI Governance Lead, Prompt Engineer, Customer Support Specialist, and Software Engineer to `Medium`; Agent Operations Specialist to `Early signal`.
- Backfilled Wayback Machine archive links for evidence records and requested fresh snapshots for still-active sources.
- Rendered archive links in the generated evidence register.

## [0.3.0] - 2026-08-08

### Added

- A work-evolution methodology separating role origin, operating model, market maturity, and evidence confidence.
- Structured profile metadata and a machine-readable evidence register.
- Catalogue generation, schema validation, confidence checks, freshness checks, and scheduled external-source monitoring.
- Occupation-evolution profile template.
- Pilot evolution profiles for AI-first software engineering, agent-supervised customer support, and AI-augmented research analysis.

### Changed

- Expanded the catalogue from emerging titles to AI-native roles and established occupations being redesigned around AI.
- Re-audited existing evidence, retained closed sources as historical observations, and replaced sources used for current-confidence claims.
- Generated README and source-register tables from canonical data.

## [0.2.0] - 2026-07-25

### Added

- Dated, role-level evidence register with primary job postings and public-sector research.
- Supporting evidence links in every role profile.

### Changed

- Clarified confidence levels and reclassified roles where current postings show stronger adoption.
- Kept workflow-design and synthetic-data titles explicitly emerging where title evidence remains mixed.

## [0.1.0] - 2026-07-24

### Added

- Lean launch of the Emerging AI Jobs catalogue.
- Ten initial role profiles.
- Job profile and role comparison templates.
- Emerging job playbook standard.
- Sources and verification notes.
- Security and contribution guidance.
- Added GitHub's published AI programme-lead and enablement practices as named public evidence for the AI Enablement Lead and AI Transformation Manager responsibility bundles.

### Notes

- Version starts at 0.x while role profiles are field-tested and source quality improves.
