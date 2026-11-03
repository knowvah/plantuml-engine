# T3b — class and object readers

Agent: typescript-pro (sonnet, effort high), worktree `dss-T3b`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(diagrams): class and object read the scoped element colours (T3b)`.

## Context
Planning deltas: class bg 3, line 2, font 1 in every form (notes, package frames); object bg 4/2/2, line 5/0/0, font 5/0/0. Object entities use `objectDiagram` (`EntityImageObject#getStyleSignature`) while the document uses `classDiagram`. Class already reads `style-cascade-class*.ts`; keep that seam and correct what the audit names.

## Task
All audit class sites 1–6 and object sites 1–3, probe-only ones included (user ruling 2026-11-02). `object__cascade-bg-diag` moved here from T2a: the leak is `renderer-classifier-colors.ts:52`. Route each bucket-skipping site the audit lists through the resolved element colour, keeping stereotype and
inline-colour tiers above it. Mirror the Java at each site; a site whose Java reads a different signature than the audit
says is a finding. Tests first, citing the row or the Java.

## Added by D8 (orchestrator, b1 close)
`class__nested-skinparam-note-then-style` and `class__nested-style-then-skinparam` draw our syntax error page (line of `</style>`) where the jar
renders the embed: a `<style>` inside a class body's `{{ }}`. Without `<style>` the same body is fine, so the `}` closing `note {` looks to end the class
body early (`class-command-containers.ts:109`). Unconfirmed: read `CommandMultilines2.java:79-...` and how `CommandCreateClassMultilines` finds its END with
an embed open, then mirror it. `.agent-notes/dss-execution.md` also holds class `skinparam noteBackgroundColor` (`renderer-note-background.ts`), jar `#BBB`, ours
`#FEFFDD`, with no `<style>`: fix it (D8), stop 5 excepted row by row for that jar-ward move, with its own row. Also `class__x-theme-gradient`.

## Measured after T2a (orchestrator, b2 close)
- `class__cascade-bg-*` ×4: package frame, site 1. Folder-family cluster fill is still `none`, jar `#00F`: read `group.package`, `group.folder` (`class__probe-pkg-cluster`, `-usym-cluster`). T2a fixed `resolveClusterUSymbolPaint` to read `group.<keyword>` first.
- `class__kinds-*`: baseline 4 on `kinds-none` (`text[3]` x/textLength, undiagnosed), plus site 1, plus site 6 (stereotype text `#00B`).
- `class__notes-bg-diag` 2, `-font-diag` 1: sites 2, 3, which should read `note.link` (written, no reader).
- `spotClass { LineColor; FontColor }` reaches `interface`'s spot, jar does not (`class__probe-spot-own`). `graph.spotCascade*` suspected, not instrumented.
- `class__d3-theme-*` 87-90, `class__x-theme-gradient` 94: canvas height 68 vs 84, 0 colour diffs among the first ones. Suspected `root { Margin }` unread by class: unverified, diagnose it. Colours and gradient come after the height.
- `class__d3-skin-rose-element` 1: `@filter`, Shadowing: out of scope, name it.
- `object__cascade-*-diag*`, `object__kinds-*-classdiag`: sites 1-3, the `classCascade*` leak.

## Rows
`class__cascade-bg-*`, `class__{notes,kinds,generic}-*`, `class__nested-*`, `class__d3-*`, `class__x-*`, `class__probe-*`, `object__cascade-*`, `object__kinds-*`, `object__d5-*`.

Probe rows at b2: `pkg-cluster` 2, `spot-own` 2, `usym-cluster` 1.

## Write-set
`src/diagrams/class/*`, `src/core/style-cascade-class*.ts`, `tests/unit/class/*`.

## Read-set
`plans/diagram-style-scope/measurements/reader-audit.md` (your engine's section), [../decisions.md](../decisions.md) D2, D3, `src/core/style-element-scope.ts`, `src/core/theme-element-resolve.ts`.

## Acceptance
- Given the class and object `cascade` rows and `class__element-order-*`, then 0 extra diffs.
- Given `object__cascade-bg-diag` (`classDiagram` selector), then object entities keep their default, as the jar does.
- Given `objectDiagram { BackgroundColor }` on an object row, then objects take it and the document does not.
- Given every corpus row of the engine, then conformant held and any byte mover passes the gate (D3b), named with its mechanism.

Observability: N/A. Rollback: Reversible.
