# T2a — description: the embed atom in edge labels

## Context

- **Measure.** `link-edge-attrs.ts#measureMainLabelBox` (`:251-295`) sizes the DOT label table with `buildTextBlock`,
  the description engine's line-based text block.
- **Draw.** `SvekEdge.ts#drawLabelBlock` (`:483-500`) draws the label with `buildTextBlock` too.

Neither has an embed atom, so the `comp`, `comp-open` and `uc-open` probes draw `{{` as text (README table). The jar
uses the same `SvekEdge` label path as state (`SvekEdge.java:299-300`).

## Task

When `splitEdgeLabelEmbeds` (T1a) finds an embed in the main label:
- **Measure.** Build the stacked block (text runs through `buildTextBlock`, embeds through the atom, T1a stacking).
  Use its dimension in `measureMainLabelBox`.
- **Draw.** Pass the same block to `SvekEdge` and draw it there, at the table corner + shield + margin it already
  computes.

`SvekEdgeLabel` already carries optional fields: add an optional pre-built `block`, and leave every other caller's
input unchanged. The label must be built once and handed to both measure and draw, or built identically in both
places. Pick whichever the existing code makes natural, and journal the choice.

Then reach 0 diffs on the description probes. Add a deployment-style probe (`node A` / `node B` with a `{{`
label) if `mainLabelText` has a per-symbol branch. Move every description probe into
`tests/fixtures/edge-label-embed/` with its jar `.svg`, and into the authored gate.

**Not this task:** qualifier labels (`applyQualifierLabels`) and link notes. Probe them with a `{{` and journal
whether the jar embeds there. If it does and we do not, that is the same mechanism: do it here. Otherwise, journal
the probe and move on.

## Write-set
`src/diagrams/description/link-edge-attrs.ts`, `src/diagrams/description/renderer-edge.ts`, `src/core/svek/SvekEdge.ts`,
`tests/unit/description/ele-edge-label.test.ts`, `tests/fixtures/edge-label-embed/*`, the authored test.

## Read-set
`src/diagrams/description/link-edge-attrs.ts:240-340`, `src/core/svek/SvekEdge.ts:100-230,455-500`,
`src/diagrams/description/renderer-edge.ts` (label wiring), `src/core/svek/image/EntityImageDescriptionTextBlock.ts:268-310`,
`plans/edge-label-embed/measurements/probes/{comp,comp-open,uc-open}.puml` and `jar/`.

## Acceptance
- Given `comp-open`, when rendered, then one `<image>` 532x227 and the canvas 580x398, at 0 diffs.
- Given `comp` (well-formed), then one `<image>` 61x68 and the canvas 109x239, at 0 diffs.
- Given `uc-open`, then 0 diffs.
- Given the description, component and usecase ratchets and the every-engine survey, then 0 conformant losses.

Observability is N/A. Rollback is Reversible.
