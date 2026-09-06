# Mora Cloud-first Handoff

**Date:** 2026-09-06
**Base SHA:** `bcd7fee6bdd67c5019a80f6cecf7d9eeb432195a`
**Code authority:** GitHub repository `valens7/tolaria`, branch `main`. The commit containing this document is the handoff version; use its GitHub SHA rather than a Google Drive timestamp.

## Authority and writer rule

- **Notion** is the canonical product truth: requirements, decisions, experience contracts, and acceptance gates.
- **GitHub** is the only authority for committed source, history, CI, release tags, and release artifacts.
- **Google Drive** is reference/transport storage only. It is not a Git merge mechanism and does not decide which source is newest.
- A non-sync local clone is a temporary build and runtime workspace. `/Applications/Mora.app` is runtime reality and must be traced to a tag/SHA.
- The current Product Convergence writer lease ends when this handoff commit is pushed. The next writer must start from its SHA and use a separate bounded branch/commit.

## Product Convergence scope completed in this handoff

### Checked-in source implementation

- Mora Home is the source default and offers direct Memos, English Learning, and Notes entrances.
- Memos Home has compact capture, date-grouped cards, local tag filtering, text search, and an existing-Memo route into the existing BlockNote Shared Editor.
- Capture uses the existing Vault writer and creates one ordinary Markdown Memo in `10 Sources/10 Memos`; `type: Memo` and `memo_id` remain in that same file.
- Existing Memo editing returns to the same Memos context. No editor, storage layer, database, Vault, or identity contract was recreated.
- The existing, uncommitted Mora Toggle P0 from the historical worktree is reconciled into Git: `/Toggle`, editable title/body, collapse state, Markdown `> [!mora-toggle]+/-`, save/reload, and English/Simplified Chinese labels.
- Existing English Learning source-first work is retained in Git but deliberately not extended.

### Deliberately deferred

- English Learning production module home and actual spoken Read Aloud.
- Notes product module/home (only its shared-foundation readiness exists).
- Memos minimal Review / Resurface and any richer personalization.
- Product-level N → N+1 OTA regression for the new Shell/Memos surface.
- Human dogfood, visual/brand acceptance, notarization, and any unrelated release-infrastructure expansion.

### macOS runtime validation still required

1. Build and install the handoff SHA as a Mora bundle.
2. Open a real selected Mora Vault and execute `Capture → Timeline → Tag/Search → Edit → reopen`.
3. Confirm the shell’s visual and interaction quality in Finder/Dock, including the Toggle interaction.
4. Only after a product build exists, run the already-established private-dogfood N → N+1 OTA regression against the same Vault, same `.md`, and same `memo_id`.

This state is a **Mora Memos Product Dogfood Candidate in source**, not `Daily-use Stable`.

## Quality evidence and temporary exception

The approved CodeScene/Codacy exception is limited to Shell/Brand and Memos V1 and expires 2026-09-09. It does not weaken future default gates.

Compensating gates for this handoff: locale validation, TypeScript typecheck, normal project ESLint, focused/full unit tests, real-disk Playwright, production build, Rust tests, and attempted local security checks. CodeScene is unavailable; Codacy’s PMD runtime and Trivy database are environment/network constrained. The checked-in Codacy ESLint configuration also references unavailable plugins, while Biome reports legacy violations outside the handoff’s changed lines; neither is represented as a passing security scan. Record a later full Codacy/Trivy run against the handoff SHA rather than silently treating this exception as permanent.

### Independent clean-clone evidence

The non-sync clone `/Users/valens/Documents/Codex/mora-clean-ef7db0d` was cloned from GitHub, fast-forwarded to source SHA `9844bf1a4acc0aa04d35acfd1fd927f44b68f9d3`, and rebuilt without reading the Drive workspace:

- `pnpm@10.24.0 install --frozen-lockfile` completed from the committed lockfile.
- `pnpm test`: 522 files / 5,326 tests passed; release-version tests: 6 / 6 passed.
- `pnpm build`: passed.
- `cargo test --manifest-path src-tauri/Cargo.toml`: 1,152 / 1,152 tests passed on the final retry.

The first full Rust attempt had one timeout in its self-spawned Codex stdin probe; its focused retry and the next complete Rust run both passed. This is retained as a transient automated-test-environment observation, not represented as a Mora product or Vault failure.

## Drive workspace classification

The Drive root is `/Users/valens/Documents/AOV Drive/20 AOV PMO/20 墨澜 Mora/40 Mora Application`. No Drive content was deleted until the Git handoff and clean-clone validation passed. The classification separates source/reference assets from regenerable artifacts.

| Classification | Paths / contents | Action |
| --- | --- | --- |
| **A — Git canonical source** | Tracked source within `tolaria-mora-clean` (`src/`, `src-tauri/`, `tests/`, `docs/`, manifests, workflows). | GitHub only is authoritative. Move the future active clone outside Drive; do not use Drive timestamps to reconcile source. |
| **B — Drive reference asset** | `10 本地原型/`, `donors/`, design/reference material, `docs/`, `20 Codex Skill/`, and useful scripts under `30 脚本/`. | Preserve in Drive. Prototype is reference-only, never a production source authority. |
| **C — Regenerable local artifact** | `node_modules/`, `.pnpm-store/`, `dist/`, `test-results/`, `playwright-report/`, `src-tauri/target/`, `.tooling/node-*`, compiler/package caches, logs, Finder `Icon` metadata. | Exclude from Git and Drive. Recreate in a non-sync clone or CI. |
| **D — Historical snapshot** | `dogfood-release/` and explicitly labelled release evidence. | Retain or archive only while it supplies release evidence not already available in GitHub Releases/CI. |
| **E — Requires review** | Root-level loose `src/`, `src-tauri/`, package manifests, and `30 脚本/` outputs until compared; old clone source until its unique code is proven imported. | Do not delete. Confirm unique assets/source and either move to B/D or remove only when the source is safely in Git. |

### Existing clone disposition

- `tolaria-mora-clean` is the currently reconciled Drive mirror. Its generated C paths were removed; it must not become the future active development workspace.
- `tolaria-fork` and `tolaria-fork.backup-20260906-release-continuity` had no commits but contained unique Toggle P0 source and ADRs. That source is reconciled by this handoff. They are preserved historical snapshots and are candidates to archive, not automatic deletion.
- `tolaria-mora-clean.clone-incomplete-20260906` had no source commit and only Finder/incomplete Git metadata after comparison. It was removed as a verified C artifact after the handoff clone passed.

### Completed Drive artifact cleanup

After the independent rebuild passed, the following verified C paths were removed from the Drive root: root `node_modules/`, `.pnpm-store/`, `dist/`, `.tooling/node-v22.23.2-darwin-arm64/`, `src-tauri/target/`; and the corresponding `node_modules/`, `.pnpm-store/`, `dist/`, `test-results/`, and `src-tauri/target/` paths within `tolaria-mora-clean`. The incomplete clone was then separately inspected: it contained no source, commits, refs, local configuration, or assets—only incomplete Git metadata and a Finder icon—and was removed. Historical `tolaria-fork` snapshots, prototypes, and release evidence were not deleted.

## Clean-clone rebuild procedure

Use a **non-sync** folder, for example `~/Developer/Mora` (not Google Drive, iCloud, Dropbox, OneDrive, or other sync roots).

```bash
git clone https://github.com/valens7/tolaria.git ~/Developer/Mora
cd ~/Developer/Mora
git checkout main
corepack prepare pnpm@10.24.0 --activate
corepack pnpm install --frozen-lockfile
corepack pnpm l10n:validate
corepack pnpm test
corepack pnpm lint
corepack pnpm build
cargo test --manifest-path src-tauri/Cargo.toml
```

Prerequisites:

- Node `22.23.2` is the verified local runtime. The shell’s Node `20.11.0` caused Vitest worker incompatibility; invoke the Node 22/Corepack toolchain explicitly if the shell is still on Node 20.
- `package.json` declares `pnpm@10.24.0`; do not use ambient pnpm 11 for the lockfile.
- Rust/Cargo and the macOS Tauri build prerequisites are needed only for native build/test.
- Playwright needs a compatible Chromium binary (`corepack pnpm exec playwright install chromium` if it is not already cached). Real-disk E2E uses disposable fixture Vault copies, never the canonical user Vault.

No source, signing key, Vault content, or private credential should be required from the old Drive clone to build, test, or develop this repository.

## Work that remains local Mac / Codex-only

- Tauri/macOS native compilation, Finder/Dock launch, and human UI dogfood.
- Selected-Vault filesystem behavior, file watcher behavior, OS permissions, Keychain access, signing/notarization edge cases.
- Private-dogfood app installation, actual updater download/restart, and N → N+1 continuity verification.
- Any task requiring an Apple credential or a private updater signing key.

## Work that can move to ChatGPT Web / GitHub

- Read Notion contracts and reconcile requirements, gaps, and acceptance evidence.
- Review GitHub source/branches/SHAs, prepare bounded implementation plans, review PRs, and monitor CI/release readiness.
- Make bounded GitHub edits/PRs where the available cloud workflow can run them.
- Maintain documentation reconciliation and drive-reference inventories.
- Run CI-safe lint/type/test/build/security checks in GitHub Actions.

With Notion, Google Drive reference access, and GitHub repository/CI access connected, ChatGPT Web has sufficient authority for those cloud-capable tasks. It cannot replace the macOS-only runtime work above.

## Next-owner start gate

Before any source write:

1. Read the mentioned Canonical Notion pages and this handoff.
2. Confirm GitHub `main` HEAD equals the handoff SHA.
3. Work in a non-sync local clone or a GitHub branch—not a Google Drive working tree.
4. Confirm a single writer and a bounded scope.
5. Commit, test, push, and hand off by SHA.

The recommended next owner is **ChatGPT Web for planning/review/cloud work**, with **Codex on a local Mac only for the native build, signed app, real Vault, and human-dogfood steps**.
