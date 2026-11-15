# T3a — class/object: an unterminated `{{` edge label lays out wrongly

## Context (measured at planning, mechanism NOT known)

Class already embeds in edge labels (`class-edge-label-embed.ts`), and the well-formed `class` probe is at 0 diffs.
The unterminated probes draw the right image (532x227) but a different layout:

| Probe | Canvas ours / jar | First diffs |
|---|---|---|
| `class-open` | 555x247 / 576x407 (188 diffs) | `rect[1]` at (247.32, 34) vs (7, 7) |
| `obj-open` | 555x247 / 569x378 (40 diffs) | canvas height |

The jar's taller canvas suggests that it stacks A and B with the 227-tall label between ranks, while ours does not
grow the rank gap the same way. That is a lead, not a mechanism. This is diagnosis mode
(`~/.claude/rules/diagnosis.md`): produce the mechanism / origin / causal chain / ruled-out artefact before any fix.

## Task

1. **Compare the DOT first.** Render `class-open` with `scripts/oracle-render.sh /tmp/ele-t3a <probe>` to get the jar's
   `svek-1.dot`, and dump ours (the class engine's svek DOT emission; see `tests/oracle/class-dot-parity*` or the
   survey's DOT capture for how). If the DOT differs, the origin is in
   `class-edge-label-measure.ts#computeMeasuredLabelAttrs` or `class-layout-edge-labels.ts`. If the DOT is equal and
   the geometry differs, it is dot-engine: file under `docs/graphviz-issues/` + `TRACKER.md` (stop condition 6
   forbids writing dot-engine).
2. Fix the port-side mechanism with a red test first. Check whether the unterminated path's split differs from the
   well-formed one: for example `scanEmbeddedElementBlock` versus `createAndSkip` absorbing the rest. An embed
   segment with no text before or after may also take a different measure arm.
3. Move `class`, `class-open` and `obj-open` into `tests/fixtures/edge-label-embed/` and the authored gate.
   - **Fixed:** assert 0 diffs.
   - **Separable (D1):** assert a never-rises baseline, with the filed issue as its `reason`.

## Write-set
`src/diagrams/class/class-edge-label-measure.ts`, `class-layout-edge-labels.ts`, `class-edge-label-embed.ts`,
`class-edge-label-attach.ts` (whichever the mechanism lands in), `tests/unit/class/ele-class-open.test.ts`,
`tests/fixtures/edge-label-embed/*`, the authored test; optionally `docs/graphviz-issues/<NN>-*.md` + `TRACKER.md`.

## Read-set
`src/diagrams/class/class-edge-label-embed.ts` (all), `class-edge-label-measure.ts`, `class-layout-edge-labels.ts`,
`src/diagrams/class/class-embedded-block.ts`, `plans/edge-label-embed/measurements/probes/{class,class-open,obj-open}.puml`
and `jar/`.

## Acceptance
- Given `class-open` and `obj-open`, when rendered, then 0 diffs; or the journal holds the full diagnosis artefact
  and a filed issue, and the authored gate holds the measured count.
- Given `class` (well-formed), then it stays at 0 diffs.
- Given the class and object ratchets, then all pins stay zero-diff.

Observability is N/A. Rollback is Reversible.
