# TE1 — `end merge` reads the activity signature

Agent: typescript-pro, worktree `dss-TE1`. Include [../task-contract.md](../task-contract.md). Found by the exit probe (D8: a defect on the read path is fixed, with a row each).
Commit: `fix(diagrams): end merge reads the activity signature (TE1)`.

## Evidence
`ParallelBuilderMerge.java:80,96-99,110` reads `getStyleSignature()`, which is `root,element,activityDiagram,activity` (`AbstractParallelFtilesBuilder.java:73-75`), for its in and out connections' `Rainbow.build` and for the closing `FtileDiamond`'s border and back. `ParallelBuilderFork.java:86,119` and Split read `getStyleSignatureArrow()`. Ours gives a merge's connectors the arrow colour and its diamond the `diamond` signature.
Jar, measured: `root { LineColor #0A0 } arrow { LineColor #00A }` on `fork … end merge`, ours `#00A`, jar `#0A0`; `activity { LineColor #0AA; BackgroundColor #FEE }`, ours connectors `#181818`, jar `#0AA`; `diamond { LineColor #A50; BackgroundColor #5AF }`, ours paints the diamond, jar `#181818`/`#F1F1F1`. No `<style>`: `skinparam ArrowColor #F00` ours `#F00`, jar `#181818`; `skinparam ActivityBorderColor #F00` ours `#181818`, jar `#F00`; `skinparam ActivityDiamond{Border,Background}Color` ours paints, jar does not.
Probes with jar output: `/private/tmp/claude-501/-Users-scottseely-git-knowvah-plantuml-ts/4337da08-dafe-4c34-8d56-dab9c6298e26/scratchpad/fin3/src/mrg*` and `/private/tmp/claude-501/-Users-scottseely-git-knowvah-plantuml-ts/4337da08-dafe-4c34-8d56-dab9c6298e26/scratchpad/fin3/out/` (read only). 24 of 35 differ; `split … end split` and `end fork {x}` already match, and must stay matching.

## Task
Read the method bodies above and `getRainbow(def)`: inline `-[#c]->` stays above the default, as in the probe with two inline colours. Route a merge's connectors, arrowheads and closing diamond through the activity signature's colours (`theme.colors.elements`, buckets in `src/core/style-element-scope.ts`). Add a row per group as `tests/fixtures/diagram-style-scope/activity__merge-<case>.{puml,svg}` with oracles from `scripts/oracle-render.sh`; the orchestrator pins them, so do not edit the pin file or `ROW_COUNT`.

## Stop 5
A no-`<style>` source moves here, excepted by D8 row by row, only jar-ward. Report each corpus mover with its before and after diff count, measured in the survey's mode (jarCompatibleStyleInput, include store, sprite assets, DeterministicMeasurer, filename `in.puml`).

## Write-set
`src/diagrams/activity/**`, `tests/unit/activity/**`, `tests/fixtures/diagram-style-scope/activity__merge-*`; `src/core/style-element-scope.ts` only if a bucket is missing, with its citation.

## Acceptance
- Given every probe above, then 0 diffs against its jar output.
- Given activity's 449 conformant corpus rows and every other authored row, then held, and no pinned row rises.
- Given an inline colour on a merge branch, then the inline colour wins (unit test citing `ParallelBuilderMerge.java:82,111`).
