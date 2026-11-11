## Observation: #136 still needs its `Blocked by #169` line
- **Context**: cmf T3g filed the D8 ruling issue #169 ("Ruling needed: help font lists host fonts", labels `parity`, `needs-ruling`).
- **Finding**: appending `Blocked by #169.` to #136's body (`gh issue edit 136 --body-file ...`) was denied by the session's permission classifier. The line to add, after `Blocked by #164.`, is exactly: `Blocked by #169.`
- **Impact**: #136's final check does not yet name #169; a maintainer adds the line.
- **Confidence**: High.

## Observation: DIVERGENCES.md carries a self-splice from #121 (aar)
- **Context**: cmf T3g, adding the per-row KaTeX section.
- **Finding**: between `df7d4d91c` (1,360 lines) and `82b9128ea` (2,115 lines) the file was spliced into itself: line ~368 ends mid-sentence ("…for `set $x = \sqrt{y+z}$ and $i = 1") and the whole document header follows on the same line, then `## General` repeats three times (lines 15, 389, 759), each copy slightly different. The pattern fits a JS `String#replace` whose replacement held `$`-sequences (`` $` `` / `$'` insert the text before/after the match).
- **Impact**: readers see three near-copies of the General section; cmf appended its section at the end of the file rather than inside a damaged copy. A dedicated cleanup should restore the pre-splice text from `df7d4d91c` plus later additions.
- **Confidence**: High (line counts per commit, the mid-line header).

## Observation: two ruling issues filed by cmf T3g
- **Context**: rows left non-conformant after the factory port.
- **Finding**: #169 (help font host list, D8) and #170 (creole rollbacks sized by the PNG export's host AWT fonts; JLaTeXMath's shared `SymbolAtom` state). Both labelled `parity` + `needs-ruling`. #136 should list `Blocked by #169.` and `Blocked by #170.`; editing #136 was denied to this session.
- **Impact**: rows cunotu, marese, pecafo, vocalo, xanuke, kebadi, rozesu, roxita, raxanu, cikoge wait on those rulings.
- **Confidence**: High.
