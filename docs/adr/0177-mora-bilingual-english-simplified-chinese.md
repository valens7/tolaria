# 0177. Mora bilingual UI: English and Simplified Chinese

Status: active

Date: 2026-08-19

Supersedes: [0087](0087-json-catalogs-and-lara-cli-localization.md)

## Context

Tolaria's localization foundation grew to a broad locale matrix backed by Lara CLI batch translation. Mora's MVP needs a smaller, reviewable language boundary: English plus Simplified Chinese. Maintaining the larger matrix would add translation credentials, automation, and review work without serving the current product scope.

## Decision

Mora supports exactly two application locales:

- English (`en`) is the canonical source and fallback.
- Simplified Chinese (`zh-CN`) is the sole additional locale.

The app keeps its dependency-free JSON-catalog runtime and the installation-local `ui_language` preference. Settings and command-palette language choices are derived from this two-item registry. Legacy or unsupported stored language values, including Traditional Chinese and prior Tolaria locales, resolve safely to English.

`en.json` and `zh-CN.json` are maintained together and validated for identical flat keysets by `pnpm l10n:validate`. Lara CLI configuration, credentials, lock data, and package dependency are removed. New copy requires an English and a reviewed Simplified Chinese value in the same change; it does not require an external translation service.

## Consequences

- The renderer ships only English and Simplified Chinese catalogs and metadata.
- System language detection selects Simplified Chinese for `zh`, `zh-CN`, `zh-Hans`, and `zh-SG`; every other system language falls back to English.
- Future expansion beyond these two locales requires a new ADR that chooses a translation and review workflow before adding any catalog.
