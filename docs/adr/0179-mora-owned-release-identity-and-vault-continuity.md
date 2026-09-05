---
type: ADR
id: "0179"
title: "Mora-owned release identity and vault continuity"
status: active
date: 2026-09-06
---

## Context

Mora is distributed from a Tolaria-derived codebase, but its installed application, updater trust root, and local preferences must be owned by Mora. A user must be able to replace version N with version N+1 without changing the independently chosen local Markdown Vault.

## Decision

**Mora uses its own bundle identifier (`com.alphaoneplus.mora`), deep-link scheme (`mora`), updater signing key, release feed, and installation-local configuration namespace.** The Vault registry is stored outside the application bundle under the Mora namespace. Release packaging may replace the app bundle only; it must never create, migrate, rename, or delete a selected Vault or its Markdown files.

## Consequences

- A single installed `Mora.app` can receive signed updates from the Mora-owned GitHub release feed.
- The selected Vault path survives ordinary app replacement and restart, while note contents remain their own on-disk source of truth.
- Existing Tolaria settings are not silently imported into Mora, preventing a Mora update from treating a Tolaria installation as its data store.
- Apple Developer signing and notarization remain an additional public-distribution requirement; they are not a prerequisite for private signed updater verification.
