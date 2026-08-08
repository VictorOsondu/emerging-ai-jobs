# Contributing

Contributions are welcome when they improve role clarity, source quality, or practical usefulness.

## What's Welcome

- corrections to role descriptions
- better public sources
- new role profiles with evidence
- role comparisons where titles are being confused
- examples of work outputs, using public or synthetic material

## What Isn't

- salary speculation without a separate, sourced methodology
- vendor promotion or affiliate links
- private job descriptions or internal company material
- hype titles with no public signal
- claims that a role is "the future" without evidence

## Standards

- Plain, specific, UK English.
- Mark maturity and confidence honestly.
- Classify role origin and operating model separately from market maturity.
- Prefer primary sources: company career pages, standards, regulators, public documentation, and professional bodies.
- Use public or synthetic examples only.
- Record evidence metadata in `data/evidence.json`; do not describe a closed or unavailable posting as current.
- Use the occupation-evolution template only when AI materially redistributes tasks, oversight, or performance expectations.
- Open an issue before adding a large new category or playbook.

Read [METHODOLOGY.md](METHODOLOGY.md) before proposing a profile.

## Local Checks

After changing a profile or evidence record, regenerate the catalogue and run validation:

```sh
node scripts/render-catalogue.mjs
node scripts/validate-catalogue.mjs
npx --yes markdownlint-cli2@0.23.1
```

The external source check is intended for scheduled maintenance because job sites can rate-limit automated requests:

```sh
node scripts/check-evidence-links.mjs
```

By contributing, you agree your contribution is licensed under CC BY 4.0, in line with the [LICENSE](LICENSE).
