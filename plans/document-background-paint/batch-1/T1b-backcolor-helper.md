# T1b — `svg-backcolor.ts`: the SvgGraphics constructor's branches (D2)

Agent: typescript-pro (sonnet, effort high), worktree `dbp-T1b`. Include
[../task-contract.md](../task-contract.md). Commit: `feat(core): port the
SvgGraphics document backcolor branches (T1b)`.

## Context
`SvgGraphics`' constructor (`SvgGraphics.java:176-192`) decides the document
background once: `HColorGradient` → `createSvgGradient` + `paintBackcolor("url(#id)")`
and `backcolorString = null` (no root `background:`), ALWAYS; `null` → nothing;
otherwise root `background:` = the colour, and `paintBackcolor(color)` unless
`#00000000`, `#000000` or `#FFFFFF`. `paintBackcolor` (`:207-212`) appends a
(0,0) rect to the root `<g>`; `finalizeRootAttributes` (`:819-821`) sizes it
`format(maxX) × format(maxY)`. Two finalizers already inline this
(`assemble-svg-sequence.ts:38-80`, `assemble-svg-activity.ts:50-90`) — read
them for the exact rect markup the jar emits and the seeded gradient-id path
(`paintToSvg`, `svg-defs-seeded.ts`, `svg-defs.ts#collectDocumentDefs`).

## Task
New pure module `src/core/svg-backcolor.ts` exporting `backcolorPaint` (the
[overview](overview.md#interfaces--batch-2) signature): returns the def (gradient
only), the rect markup (or none), and the root background string (or none).
Colour comparison on the canonical hex form (`resolveColorToSvgHex` + the same
canonicalisation `assemble-svg.ts#canonicalColor` uses — reuse, do not
re-derive). No callers in this task (T2a wires it). Tests first
(`tests/unit/core/svg-backcolor.test.ts`): every branch, `white`/`#FFF`/`#ffffff`
spellings, `transparent`/`none`, `#000000`/`black`, a gradient for each policy
(`/`, `|`, `\`, `-`), a non-integer size. Expected markup = the markup the two
existing finalizers already emit for the same inputs (cite their lines).
`npm run catalog` (new module).

## Write-set
`src/core/svg-backcolor.ts`, `tests/unit/core/svg-backcolor.test.ts`, `docs/catalog.md`.

## Read-set
`src/core/assemble-svg-sequence.ts:20-80`, `src/core/assemble-svg-activity.ts:25-95`,
`src/core/assemble-svg.ts:196-240`, `src/core/paint.ts:240-260`,
`~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/SvgGraphics.java:170-212,800-822`.

## Acceptance
- Given a `Gradient`, then `def` is a `<linearGradient>` from the seeded counter, `rect` fills `url(#<that id>)`, and `rootBackground` is undefined.
- Given `#000000`, `#FFFFFF` (any spelling) or `#00000000`, then no `rect` and `rootBackground` is the colour (transparent: none).
- Given any other solid, then a (0,0) rect at the given size and `rootBackground` set.
- Given the full suite, then 0 bytes move anywhere (no callers).

Observability: N/A. Rollback: Reversible.
