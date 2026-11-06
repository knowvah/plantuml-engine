## Observation: issue comments the pep T5 close could not post
- **Context**: pep T5 asks for comments on #124 and on the issue owning any shared-fix gain; `gh issue comment` was denied by the auto-mode classifier (External System Writes) on 2026-11-05
- **Finding**: two comments are pending, texts below, for the user to post or approve
- **Impact**: #124's planner should know `src/diagrams/nwdiag/` exists; #121's should know `limazo-01-ximu737` is a promotion candidate
- **Confidence**: High

### For #124
packet-engine-port (#117) created `src/diagrams/nwdiag/VerticalLine.ts` (the whole upstream class, `skip` set and `arcTo` branch included) and `src/diagrams/nwdiag/NwDiagram.ts`, which exports `NwDiagram` with only the static `toSet` and its pattern `p` (`NwDiagram.java:288-303`). Packet reaches both at their upstream home through two layering allowlist entries. Grow `NwDiagram.ts` in place when porting this engine rather than adding a second copy. One upstream behaviour to expect: a `VerticalLine` with a single skip strictly between `y1` and `y2` draws nothing. `VerticalLine.java:74-77` `continue`s past `ug.draw` after the arc, and `drawn` is already true. The port mirrors it, and `tests/unit/nwdiag/VerticalLine.test.ts` pins it.

### For #121
packet-engine-port (#117) moved activity `limazo-01-ximu737` from diverged to conformant (diff count 9 to 0), through a shared creole fix. `CreoleParser.ts` classified every stripe in FULL mode, while Java passes the sheet's creole mode (`CreoleParser.java:113`). The arrow label `#going to end` is a SIMPLE_LINE sheet, so FULL read it as a numbered-list item (`CreoleStripeSimpleParser.java:139-144` is FULL-only). A controlled render of all 5927 cached fixtures, with and without the fix, moves exactly this one row, toward the jar. Its style and text census pins were re-pinned to the jar's values. Its `diff-baseline.json` ceiling stays at 22 with a live 0, a promotion candidate for this issue's `pin-goldens.mts`.
