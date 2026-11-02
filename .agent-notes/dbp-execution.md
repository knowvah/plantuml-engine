# dbp execution

## Observation: a chrome block paints an inherited gradient, never an inherited solid
- **Context**: Probing title × document gradient against the jar.
- **Finding**: `TextBlockBordered.drawU` collapses the fill on `equals(ug.getDefaultBackground())`. `HColorGradient` overrides no `equals` and `ValueImpl#asColor` builds a new instance, so the skip never holds for a gradient. Header, title, caption, footer and legend each draw a `url(#id)` rect sharing the document's def.
- **Impact**: Any "fill equals background" shortcut flattening both sides to a string misses this.
- **Confidence**: High (jar rows `*-title-gradient`, `*-chrome-gradient`).

## Observation: authored rows passing did not mean the feature was done
- **Context**: All 12 in-scope engines were conformant at the B2 merge.
- **Finding**: 27 layer-interaction probes (title, chrome, border × gradient, solid) exposed two more defect families, one reaching every engine with chrome. T1a's only regression (style gradient then skinparam solid) also had no row: every ratchet stayed green.
- **Impact**: Probe the interactions before closing, not just the matrix the brief lists.
- **Confidence**: High.

## Observation: T0b's `hcl-*` rows do not exercise the hcl paint
- **Context**: D4 expected extended-mode movers; `extended-baseline --check` showed 0.
- **Finding**: Body `a = 1` hits the "does not sound like HCL data" page in both modes, and no baseline row carries an hcl gradient. A valid JSON or `resource` body paints correctly in extended mode (direct probe).
- **Impact**: 0 MOVED on the extended baseline is not evidence for the hcl gradient.
- **Confidence**: High.

## Observation: a text search over-matched corpus candidates
- **Context**: Sizing the chrome-gradient defect's corpus exposure.
- **Finding**: `class/bosada-42-voti559` and `bofaxe-86-mizu331` matched, but their gradient is inside a `/' '/` comment; T2f's hash check shows 0 corpus movers.
- **Impact**: Measure exposure with a render hash, not a grep.
- **Confidence**: High.
