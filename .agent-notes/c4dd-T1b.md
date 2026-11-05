## Observation: buildTextBlock was three defects, not one
- **Context**: One descent per line in `drawAtoms`.
- **Finding**: Edge labels went through a line model with no `Sea`: a shared baseline, `<sub>`/`<sup>` neither muted nor grown, and sprites bottom-aligned on the raw height rather than the floored box. `layoutLineThroughSea` covers all three.
- **Impact**: Note and leaf bodies were already right because `BodyFactory.create3` has real `Sea`; an edge label diff on a mixed line is no longer a separate family.
- **Confidence**: High (6 authored rows at 0 diffs).

## Observation: emoji artwork does not reach buildTextBlock
- **Context**: `emoji-mixed-edge`.
- **Finding**: `<:rocket:>` on an edge label draws its platform-glyph text run even with an emoji store; the jar draws artwork (childCount 12 vs 6). `descAtomOps` has the seam, `buildTextBlock` does not.
- **Impact**: Owned by T4a.
- **Confidence**: High.
