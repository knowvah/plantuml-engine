# T2a — finalizers paint the document background through one port (D2)

Agent: typescript-pro (opus, effort high), worktree `dbp-T2a`. Include
[../task-contract.md](../task-contract.md). Commit: `fix(core): document
backcolor through the SvgGraphics branches in four finalizers (T2a)`.

## Context
`src/core/assemble-svg.ts` finalizes json/yaml/hcl (`finalizeJsonFragment`,
`jsonBackgroundRect`, `isSolidNonDefault` `:196-290`), state
(`maybeStateBackgroundRect` `:170-192`), class (`finalizeClassBody` `:146-162`,
`documentBackgroundRect` from `class/renderer-document.ts:75-95`) and
description (`finalizeDescriptionFragment` `:317-333`). None takes
`SvgGraphics`' gradient branch (`:178-183`); json-family and state draw a rect
for `#000000` where the jar does not (`:189-190`). T1b ported the branches as
`backcolorPaint` (`src/core/svg-backcolor.ts`). The file is ~466 lines: a split
into `src/core/assemble-svg-<family>.ts` is expected (push-forward; journal it).

## Task
Route the four finalizers' background through `backcolorPaint(fragment.background,
fragment.backgroundGradient, <final width>, <final height>)`, keeping each
family's existing sizing rule (json: after `exportTo`, at the exported canvas —
jff row 20; class/state/description: as today) and splice point (first child of
the content `<g>`; the def ahead of every other draw so
`svg-defs.ts#collectDocumentDefs` lifts it first). Keep each family's verified
rect markup where it differs from the helper's (cite the golden that proves it);
if the helper's markup differs from a family's for a SOLID colour, that is a
finding — report it, do not change either. The root `background:` omission for
a gradient is `document-shell.ts:205-215`'s (already there).

Tests first (`tests/unit/core/assemble-svg-*.test.ts`): per family, a gradient
fragment → def + url rect, no root background; `#000000` → no rect (json,
state), root background kept; white/transparent unchanged; a solid non-default
unchanged byte-for-byte.

## Measure
`diff-row.mts` on the `-black` rows before → after (finalizer-only, measurable
in your worktree). The `-gradient` rows need T2b's producers too: they are
measured at T2d, never by merging another task's branch into yours.

## Write-set
`src/core/assemble-svg.ts`, new `src/core/assemble-svg-*.ts` split files,
`tests/unit/core/assemble-svg*.test.ts`, `docs/catalog.md` (via `npm run catalog`).
Not `assemble-svg-sequence.ts` / `assemble-svg-activity.ts` (D2).

## Read-set
`src/core/assemble-svg.ts:140-380`, `src/core/svg-backcolor.ts`,
`src/core/klimt/document-shell.ts:195-225`, `src/core/assemble-svg-sequence.ts:20-80`,
[T2b-producers.md](T2b-producers.md) (the description split),
`~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/SvgGraphics.java:170-212,800-822`.

## Acceptance
- Given `json-black`, `yaml-black`, `state-black`, then conformant (no rect; root `background:#000000`).
- Given a fragment with `backgroundGradient`, then each of the four finalizers emits one def + one `url(#…)` rect as the content's first child and no root `background:`.
- Given every corpus row and every non-gradient dbg row, then bytes are unchanged except the `#000000` skip.
- Given the merge with T2b at T2d, then every json/yaml/state/class/object/component/usecase `-gradient` row is conformant (stop at T2d otherwise).

Observability: N/A. Rollback: Reversible.
