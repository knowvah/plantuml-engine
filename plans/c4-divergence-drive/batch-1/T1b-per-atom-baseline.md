# T1b — Each text atom of a line sits on its own descent

**Row:** `biluko-70`, `svg/g[1]/g[5]/text[2]/@y`, ours 80.444, jar 81.111. Source label: `<back:#66fcf1><size:16><color:#0B0C10>(1)</color></size></back> talks about the`.

**Read:** `Sea.java:72-80` (`doAlign`: `pos.translateY(-height + startingAltitude)`), `AtomText.java:213-215` (`ypos = rect.getHeight() - descent`), `SheetBlock1.java:130-152`; `src/core/svek/image/EntityImageDescriptionTextBlock.ts:151-185`, `src/core/svek/image/creole-sea-line.ts`. The line bottom is shared and each atom's baseline is `bottom - its own descent`: (16-13)/4.5 = 0.667, the observed delta. D3 says reach the seam, not a new formula.

**Do:** replace the one `baselineDy` for text and emoji atoms with the per-atom value. Mind the `h < 10` floor note in `creole-sea-line.ts` (`AtomText.java:178-179`) and the descent of `<sub>` and `<sup>`, and check that no sprite offset at `:212` double-counts.

**Red:** a mixed-size line from `biluko-70`'s jar values. An authored row with `<size:8>` and `<size:20>` on one description note, with its oracle.

**Measure:** `c4`, `component`, `usecase`, `unknown`, `class` (`buildTextBlock` is shared). A row leaving conformant is stop 1. A row gaining is journaled for its bucket's issue.

## Acceptance
- Given `biluko-70`, when surveyed, then `verdict` is `conformant`, or the journal names what `compareSvg` now shows.
- Given the authored row, when compared with its oracle, then 0 diffs.
- Given the five surveys, then `lost 0` in `c4-moves.mjs` and the same check for each bucket with `verdict-diff.mjs`.

Observability N/A. Rollback Reversible.
