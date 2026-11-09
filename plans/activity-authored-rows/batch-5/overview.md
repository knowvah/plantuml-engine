# Batch 5 — glyphs, creole, LaTeX

Text drawn through seams other engines share: the spot glyph table, the creole parser and its sprite, emoji,
qrcode and `<back:>` atoms, and KaTeX. A fix here can move every bucket that draws creole, so each task surveys
them all.

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| [T5a](T5a-spot-glyphs.md) | `(X)` outlines for every letter and digit (item 13) | orchestrator | `activity-spot-glyph-data.ts`; tests | batch 4 | [x] |
| [T5b](T5b-creole-sprites.md) | Creole, sprites, emoji, qrcode, `<back:>` filters, gradients; the lone-sprite group title | orchestrator or `typescript-pro` | creole atoms, sprite placement, activity label text; tests | T5a | [x] |
| [T5c](T5c-latex-rows.md) | LaTeX rows: verify every diff follows from the image, then name them (D5) | orchestrator | `DIVERGENCES.md`; fixes where a diff does not follow | T5b | [x] |

Close: the task contract's batch close, surveying every bucket (shared seams).

Observability: N/A — no new observable operations. Rollback: Reversible (revert the batch commits).
