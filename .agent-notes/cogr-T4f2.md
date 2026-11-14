## Observation: an empty creole stripe is one space, not zero atoms
- **Context**: cogr T4f2 (dobefe-98-moji323), trailing `\n` of an edge label holding a `{{ }}` block.
- **Finding**: `StripeSimple#getAtoms` (`StripeSimple.java:124-128`) adds a `" "` atom to an empty stripe, so the jar draws `<text> </text>` and the line is 3.576 wide at 13px, which shifts a centred sibling. `wrappedLabelRows` (class edge labels) drew an empty `<text>` of width 0; it now yields `[' ']`.
- **Impact**: every class multi-line edge label with a blank line changes by that width; no pinned golden moved (class ratchet 1160, all pass).
- **Confidence**: High.

## Observation: a link-label embed's image counts in the ink box
- **Context**: same row; the whole diagram sat 12.153 right of the jar's.
- **Finding**: `LimitFinder#drawImageSvg` (`LimitFinder.java:201-204`) bounds the image corner to corner, and the label's `TextBlockMarged` margin spans the widest stripe; `class-ink-box.ts` and `class-ink-edge-label-margin.ts` read only text lines. The title is wider than the diagram here, so the missing ink moved the centring.
- **Impact**: other label images (lone sprite `labelImage`) are still not in the ink box; no row shows it.
- **Confidence**: Medium (derived from one row).
