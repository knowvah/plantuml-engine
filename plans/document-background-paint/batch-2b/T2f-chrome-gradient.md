# T2f — chrome paints an inherited document gradient (D7)

Agent: typescript-pro (opus, effort high), worktree `dbp-T2f`. Include
[../task-contract.md](../task-contract.md). Commit: `fix(core): chrome blocks
paint an inherited document gradient (T2f)`.

## Context
Every chrome element's style signature contains `document`, so a bare
`document { BackgroundColor … }` (or `skinparam backgroundColor`,
`FromSkinparamToStyle.java:180`) cascades to it. `TextBlockBordered.drawU`
(`klimt/shape/TextBlockBordered.java`):
`if (backgroundColor == null || backgroundColor.isTransparent() || backgroundColor.equals(ug.getDefaultBackground())) back = HColors.none(); else back = backgroundColor;`.
A solid equals the default background, so no rect. `HColorGradient` overrides no
`equals` and `asColor` builds a new instance, so a gradient is never equal: the jar
draws `<rect … fill="url(#id)" style="stroke:none;"/>` as the block's first child,
sharing the document def's id. Measured `sequence-chrome-gradient`: header, title,
caption, footer and legend each carry it. Ours: `annotations/blocks.ts#borderBoxStyle`
(`:157-159`) compares `resolveColorToSvgHex(style.backgroundColor)` to
`style.documentBackground`: both flatten `red/blue` equal, so `none`.

## Task
Read the method bodies first (`Style.java:353-370`, `TextBlockBordered`, `blocks.ts`,
`chrome-mainframe.ts:104,163`, the def path `svg-defs.ts#collectDocumentDefs`, `paint.ts`).
A chrome `backgroundColor` that parses as a gradient (`HColorSet.java:78-119`; reuse
`resolveColorPaint`, never a second parse) never collapses to none and paints
`url(#id)` with its def, deduped into one def exactly as the jar (`SvgGraphics.java:393`:
one id). A more specific selector still wins (`document { BackgroundColor red/blue; title { BackgroundColor yellow } }`).
Check mainframe against its row; the jar decides. Tests first, citing the row or the Java.

## Measure
`diff-row.mts` on every `*-title-gradient`, `*-chrome-gradient`, `*-title-skinparam-gradient`
and `*-mainframe-gradient` row before → after. The `{mindmap,wbs,gantt,salt}-title-gradient`
rows also need T2e's rect ordering: report their remaining diffs, do not chase them.

## Write-set
`src/core/annotations/*` (a 500-line split inside it is allowed), their unit tests
under `tests/unit/`. `src/index.ts` or `src/core/svg-defs*.ts` needed: stop and report the
exact symbol. Not `TextBlockExporter.ts`, `assemble-svg*.ts` or the engines (T2e).

## Acceptance
- Given `sequence-chrome-gradient`, `class-chrome-gradient` and the cuca/json `-title-gradient` rows, then conformant (one def, no duplicate).
- Given a solid `document` or `skinparam` background with chrome, then byte-identical.
- Given `class/bosada-42-voti559`, `class/bofaxe-86-mizu331` (a text search's corpus candidates), then report their before → after; any other corpus mover is reported with its mechanism.

Observability: N/A. Rollback: Reversible.
