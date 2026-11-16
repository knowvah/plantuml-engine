# T2b — legacy activity: the embed atom in edge labels

## Context

`activity-legacy-edge-text.ts#buildEdgeTexts` (`:187`) builds the legacy activity edge's texts, and
`activity-legacy/renderer-edge.ts` hands them to `SvekEdge`. Legacy activity is a cuca diagram, so the jar uses the
same `SvekEdge.java:299-300` label path. The `-->[{{…}}]` probes `actleg2` and `actleg2-open` draw no `<image>`.
Their 3 diffs undercount, because `compareSvg` stops at the `childCount` mismatch (README).

## Task

Apply T2a's block (T1a helper, the optional `block` on `SvekEdgeLabel`) to the legacy activity label: measure for the
DOT table, and draw. Reach 0 diffs on `actleg2` and `actleg2-open`. Move both into `tests/fixtures/edge-label-embed/`
and the authored gate.

**`actleg-open` is not this task.** It is `"a" --> "b" : {{` in legacy activity, and the jar renders a
dedication-bannered Welcome page for the whole document. That is a parse-level behaviour, not an edge label. Leave
it for T4.

## Write-set
`src/diagrams/activity-legacy/activity-legacy-edge-text.ts`, `src/diagrams/activity-legacy/renderer-edge.ts`,
`tests/unit/activity-legacy/ele-edge-label.test.ts`, `tests/fixtures/edge-label-embed/*`, the authored test.

## Read-set
`src/diagrams/activity-legacy/activity-legacy-edge-text.ts` (all), `src/diagrams/activity-legacy/renderer-edge.ts:1-80`,
T2a's `SvekEdge.ts` change, `plans/edge-label-embed/measurements/probes/actleg2*.puml` and `jar/`.

## Acceptance
- Given `actleg2`, when rendered, then one `<image>` 61x68 and the canvas 98x255, at 0 diffs.
- Given `actleg2-open`, then one `<image>` 532x227 and the canvas 569x414, at 0 diffs.
- Given the activity-legacy ratchet and the every-engine survey, then 0 conformant losses.

Observability is N/A. Rollback is Reversible.
