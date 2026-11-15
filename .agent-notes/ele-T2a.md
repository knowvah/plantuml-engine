# ele T2a observations (issue #144, 2026-11-15)

## Observation: description's dzeta measures an embed-free label as one unmargined line
- **Context**: Porting the `{{` embed into description's nodesep/ranksep (`link-edge-attrs.ts#computeLinkDzeta`).
- **Finding**: The jar's `getHorizontalDzeta`/`getVerticalDzeta` (`SvekEdge.java:1159-1203`) eat
  `labelText.calculateDimension`, the full creole block inside `marginLabel` (+2 on each axis). Ours eats
  `measureLineWithAtoms(text)`: one line, no margin. Only embed texts now take the jar's arithmetic. A horizontal
  link whose label is wider than ~330px (so `/10` beats the 35 floor) would differ by 0.2px of nodesep.
- **Impact**: A candidate cause for a horizontal-link description row with a wide or multi-line label.
- **Confidence**: Medium (read from the Java; no failing corpus row measured)

## Observation: engines may join display lines with a real newline
- **Context**: actleg2 drew `{{`, `class X`, `}}` as text after the `SvekEdge` change.
- **Finding**: Legacy activity's `labelTextOf` joins `Display#asList` with `\n` (a real newline). `parseWithNewlines`
  splits only the backslash-n escape, so a line-based walk must split real newlines too, as `buildTextBlock` does.
- **Impact**: Any helper walking `SvekEdgeLabel.text` by line must split on both.
- **Confidence**: High
