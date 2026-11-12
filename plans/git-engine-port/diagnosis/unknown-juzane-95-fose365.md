# unknown/juzane-95-fose365 — structural-match, residue 0.750 / 1.848 / 0 / 1

Mechanisms: U-BOX, `\N` label, U-ARROW, U-CLIP (`mechanisms.md`).

**Step 1, hand trace of `SmetanaForGit#initGraph`.** `GNodeBuilder` keeps 5 nodes, no fold (T1b). `getBigDim` =
`mergeTB(comment, names).delta(8, 2)` (`MagicBox.java:85-90`); text widths from `DeterministicMeasurer`, comment block
13 tall, name block 15:

| node | GNode | comment | getBigDim | `""+(w/72)` (trace) | our DOT |
|---|---|---|---|---|---|
| N0 | a0f65180 | origin/cds/issue700 (top) | max(111.313, 62.531)+8 × 13+15+2 = 119.313 × 30 | 1.657125 | 1.6571180555555556 × 0.4166666666666667 |
| N1 | 23a9f435 | — | 70.531 × 17 | 0.979597 | 0.9796006944444444 × 0.2361111111111111 |
| N2 | 9037d534 | HEAD -> master, origin/master (top) | 185.206 × 30 | 2.572306 | 2.572309070163303 × 0.4166666666666667 |
| N3 | 91fc1c7b | — | 68.844 × 17 | 0.956167 | 0.9561631944444444 × 0.2361111111111111 |
| N4 | 4fe6df1e | — | 66.313 × 17 | 0.921014 | 0.9210069444444444 × 0.2361111111111111 |

(The trace uses the 3-dp `textLength`s; the DOT carries the full measure.) Edges, `nodes` order × `getDowns()`
order: N0→N1, N1→N3, N2→N3, N3→N4, each `arrowsize=.7, arrowtail=none, arrowhead=normal`. Graph: `ranksep=0.35`
only. **Our DOT = SmetanaForGit's graph.**

**Step 2.** `d9.mts`: dot-engine vs `dot -Tdot` max node Δ 0.0037, point Δ 0.0049 (2-dp print). **dot-engine =
`dot -Tdot`.**

**Step 3.** Jar-size experiment: 5/5 node x equal the jar, 4/4 edges the jar's piece count. Residue: box widths
119.313 vs 119 and 70.531 vs 71 (U-BOX), comment-less heights 24.5 vs 24 (`\N` label, svg height 220 vs 219),
edge 1 arrow 8.468 vs 7.377 (U-ARROW) and its ends 0.482 / 0.365 vs 0.203 / 0.048 from the boxes (U-CLIP).
