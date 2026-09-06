# ADR 0178: Mora Toggle Block Markdown syntax

- Status: active
- Date: 2026-08-19
- Supersedes: ADR-0167 for the Mora-specific Toggle Block only

## Context

Mora needs a Notion-like Toggle Block that works in the rich editor without
making the rest of a local Markdown vault depend on an opaque app format.
Existing Obsidian and GFM callouts must remain safe compatibility surfaces.

## Decision

Mora reserves a namespaced callout marker for this block:

```markdown
> [!mora-toggle]- Title
> body
```

- `mora-toggle` is the only callout type that receives a rich-editor disclosure
  control in this phase.
- `+` means expanded and `-` means collapsed. Toggling changes only that signed
  marker through the normal Markdown autosave path.
- The title and body remain editable BlockNote content. The slash menu creates
  a new expanded Mora Toggle Block.
- Ordinary external callouts, including `[!note]+` and `[!note]-`, retain
  ADR-0167's compatibility treatment and are not reinterpreted as Mora Toggles.

## Consequences

- A saved Toggle Block is readable as portable Markdown and restores its
  disclosure state after reload.
- The format is deliberately namespaced to avoid taking ownership of arbitrary
  third-party folded callouts.
- This decision introduces no stable block ID scheme. That separate decision
  remains deferred until real Markdown round-trip evidence requires it.
