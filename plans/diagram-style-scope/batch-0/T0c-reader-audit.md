# T0c — reader audit

Agent: typescript-pro (opus, effort high), worktree `dss-T0c`. Include [../task-contract.md](../task-contract.md).
Commit: `docs(dss): reader audit (T0c)`. Changes no `src/` file; temporary tracing stays uncommitted.

## Context
D2 writes builder values into `theme.colors.elements[sname]`. That helps only readers that read
the bucket. This audit sizes Batches 3–4 before any engine work starts. Scratch probes go in your scratchpad.

## Report (`measurements/reader-audit.md`)
1. **Signature table.** For each element the `cascade` rows draw, by engine: its Java `getStyleSignature` (quote
   `file:line`), the SNames, and the existing `theme.colors.elements` bucket, or "none". Include notes, clusters, package
   frames, activity's swimlanes, partitions and arrows, state's start/end circles, json/yaml nodes. Grep
   `src/main/java/net/`, not just `net/sourceforge/plantuml/`.
2. **Bucket-skipping readers.** For each engine, every site that draws those elements' fill, stroke or text without
   consulting that bucket: `file:line`, what it reads instead, and the row it fails. Count per engine.
3. **State width.** `state__cascade-bg-diag`: a rect width 115 vs 170. The full diagnosis artifact.
4. **Nested `{{ }}`.** Do inherited skinparams (`withPrevious`, `nested-previous.ts`) reach `preprocessed.declarationOrder`?
   Measured with `class__scope-nested-embed`.
5. **Timing.** Cost of building the builder plus all signature lookups for one `<style>` document, median and worst over the corpus rows with a `<style>`.
6. **Verdict on D1–D5.** Anything measured that contradicts one, quoted. Do not soften it; a contradiction is the orchestrator's stop 3.

## Write-set
`plans/diagram-style-scope/measurements/reader-audit.md`.

## Read-set
[../decisions.md](../decisions.md), `src/core/theme-element-resolve.ts`, `src/core/style-map-element.ts:100-180`,
`src/core/style-cascade-class-snames.ts`, `src/core/style/mindmap-style-builder.ts`, `src/core/nested-previous.ts`, and the
readers the table leads you to.

## Acceptance
- Given each element in the `cascade` rows, then the table gives its signature with a Java `file:line`.
- Given each engine in Batches 3–4, then the report counts its bucket-skipping sites.
- Given state's width and the nested order, then each has a mechanism, not a guess.

Observability: N/A. Rollback: Reversible.
