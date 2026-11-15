## Observation: survey "conformant" includes error pages that are not byte-zero
- **Context**: Planning #141 (dot rows #109 captured), measuring the 55 survey-conformant rows on the dot ratchet path.
- **Finding**: 8 of the 55 are jar error pages. `scripts/lib/survey-error-verdict.ts:48-55` marks them conformant when we draw our own error page, but `compareSvg` reads 9-10 diffs each, so the zero-diff dot ratchet cannot pin them as-is.
- **Impact**: "N conformant rows to pin" in a queue issue can overcount what a zero-diff ratchet accepts. Check `id="graph0"` (dot) or `stock-error-pages.json` before planning a pin.
- **Confidence**: High

## Observation: native graphviz here measures text with the textlayout plugin
- **Context**: Probing why `Node A` is 0.75 pt wider in ours than in the jar for `quoted-labels`.
- **Finding**: Local `dot -v` lists `textlayout`. `textspan.c:91-92` tries `gvtextlayout` before `estimate_textspan_size`, and `textspan_lut.c:20` says the estimate stores no kerning. Native `dot -Tsvg` on the row's DOT matches the jar byte-for-byte on node geometry.
- **Impact**: A dot-engine LUT width can differ from the jar's graphviz wherever host-font kerning applies. Not yet proven as the mechanism; dogr T2 owns it.
- **Confidence**: Medium
