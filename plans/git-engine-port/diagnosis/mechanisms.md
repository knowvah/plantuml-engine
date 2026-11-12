# git — the Smetana-vs-graphviz mechanisms behind every residue (gip T3c, D9)

Measured 2026-11-11 on `feature/parity-queue` after T3b, graphviz `dot` 16.1.0, `DeterministicMeasurer`.
Tools (copied here from `/tmp/gip-t3c/`): `d9.mts` (all three D9 steps + residue per row), `prec.mts` (dot-engine
vs real dot, each value against its own last printed digit), `jarsize.mts` + `pos.mjs` (the jar-size experiment).
Raw output: `d9-2026-11-11.tsv`.

## Step 1 — engine input equals `SmetanaForGit`'s graph

`SmetanaForGit#initGraph` (`SmetanaForGit.java:145-183`): `agopen` + `ranksep=0.35` only; per `GNode` in
`GNodeBuilder` order a node `N<num>` with `shape=box`, `height=""+(h/72)`, `width=""+(w/72)` from
`MagicBox#getBigDim`, no `fixedsize`, no `label` (`:199-212`); per node per `getDowns()` an edge child → parent
with `arrowsize=.7`, `arrowtail=none`, `arrowhead=normal` (`:185-197`). Our port builds exactly that graph
(`src/diagrams/git/SmetanaForGit.ts#initGraph`, the `box` node kind and `smetanaRankSep`, T1c). The DOT the
engine receives is dumped by `d9.mts` through `setLayoutInputObserver` into `/tmp/gip-t3c/dot/<bucket>/<slug>.dot`.
Hand trace for `unknown/juzane-95-fose365` in `unknown-juzane-95-fose365.md`.

## Step 2 — dot-engine equals real `dot -Tdot` 16.1.0

`prec.mts <puml> <our.dot>`: every node centre and every spline control point / `ep` of dot-engine's engine frame
is within half a unit of the last digit `dot -Tdot` prints for it (dot prints ~5 significant digits, so figagi's
y ≈ 38969 is printed as an integer and the bound there is 0.5):

| row | values checked | outside own print precision |
|---|---|---|
| figagi-40-mila236 | 11184 | 0 |
| lagapi-44-lemu042 | 482 | 0 |
| authored/cov-scale-200 | 3084 | 0 |
| every other row / drawn fixture | `d9.mts`: max node Δ ≤ 0.0038, max point Δ ≤ 0.0049 (2-dp print) | 0 |

No stop 5.

## Step 3 — the residue, by mechanism

**Jar-size experiment** (`jarsize.mts`, `pos.mjs`; experiment only, nothing ported): real `dot` 16.1.0 on OUR graph
with each box's size replaced by the JAR's drawn box (`width`, `height` = rect + comment `moveY`, `fixedsize`,
`label=""`). Result: on juzane, mebafo and **every drawn fixture** (incl. the 202-commit `cov-scale-200`) every node
x equals the jar's and every edge has the jar's cubic-piece count — the whole residue is box size plus the arrow and
clip arithmetic below. On lagapi (29/35 nodes) and figagi (665/665) node x still differs by up to 62 / 86 px at
equal sizes: U-NS.

| mechanism | Smetana (2.38 transpile) | graphviz 16.1.0 (= dot-engine) | graphviz change | measured |
|---|---|---|---|---|
| **U-BOX** box size rounding (the box analog of U-REC) | `poly_init`: `width = POINTS(ND_width(n)); height = POINTS(ND_height(n));` (`gen/lib/common/shapes__c.java:253-254`), `POINTS(a) = ROUND(a*72)` (`smetana/core/Macro.java:1560-1562`) | `width = INCH2PS(ND_width(n)); height = INCH2PS(ND_height(n));` (`lib/common/shapes.c:1975-1976`), unrounded | `2b255ca79` "common poly_init: Remove unnecessary rounding of width and height" (2023-04-02, 8.0.4) | juzane N0 declared 119.3125 → jar 119, ours 119.313; N1 70.531 → 71 vs 70.531 |
| **`\N` label** (no `label` set, both sides) | `storeline` "WE CHEAT": `size.x = 0.0; size.y = (int)(lp.fontsize * 1.20)` = (0, 16) for Times 14 (`gen/lib/common/labels__c.java:117-122`), then `PAD(dimen)` (`shapes__c.java:290`) → minimum 16 × 24 | `storeline` measures the node name (`N0`, `N1`, …) with `textspan_size` (`lib/common/labels.c:26-42`; dot-engine: the LUT Times metrics) → "N0" 16.5 × 16.5, + `PAD` (`shapes.c:2006-2008`, `macros.h:29`) → minimum 32.5 × 24.5 (`N100`: 46.5 wide) | — (Smetana never measured text) | every box with no comment: jar 24 tall, ours 24.5 (dh 0.5 per rank; `cov-scale-200` dh 67); 2-character names (`a1`, `r0`): jar box = declared (≈ 21-25), ours 32.5 → node Δ 11.5, dw 7 on the 2-commit probes |
| **U-ARROW** arrow length | 10 · arrowsize = 7 (`arrows__c.java:231-248`) | penwidth-aware (`arrows.c:1190-1227`) | `cfb1cc1a3` (7.0.0) | juzane edge 1: jar tip − last point 7.377, ours 8.468 |
| **U-CLIP** spline clip | last point kept OUTSIDE (`splines__c.java:213-220`) | last point INSIDE (`splines.c:136-142`) | `b03040389` (7.0.0) | juzane edge 1 starts 0.203 (jar) vs 0.482 (ours) below the box; tip 0.048 vs 0.365 above the next |
| **U-NS** in-rank position | network-simplex result (tie-sensitive), `position__c.java` | same algorithm (`lib/dotgen/position.c`), different ties | — | lagapi 29/35, figagi 665/665 node x differ at the JAR's own box sizes (max 62 / 86 px) |

### Path piece counts (the three `diverged` rows)

`lagapi-44` (1 path), `figagi-40` (10 paths) and `authored/cov-long-chain-after-merge` (1 path) have curves with a
different number of cubic pieces from the jar, so `compareSvg` cannot align them (`path[i]/@d` length) and the
survey says `diverged`. Every other element is numeric-only. Mechanism, per row:

- `cov-long-chain-after-merge`: the 2-rank edge `m1 → c3`. At the jar's box sizes real `dot` routes it as ONE
  straight cubic (`pos="e,29,122.37 29,195.61 29,179.66 29,150.43 29,130.86"`, `/tmp/gip-t3c/lcam-jarsize.dot`),
  exactly the jar's `M39,46.012 C39,62.273 39,92.904 39,112.61`. At our sizes (the `\N` label widens `m1`, `c3` to
  32.5) the virtual node is no longer collinear and graphviz emits 3 pieces. Cause: `\N` label + U-BOX.
- `lagapi-44` edge 15 (`N12 → N13`, jar 3 pieces, ours 2) and `figagi-40`'s 9 of 10: real `dot` at the jar's sizes
  gives OUR piece count, and the endpoints sit elsewhere (lagapi N13: x 156 vs jar 94). Cause: U-NS. figagi's 10th
  path follows the sizing case above (its count matches the jar at jar sizes).

No residue fits outside these five mechanisms, so nothing here is a port defect and no `needs-ruling` issue is
needed (D9 step 3).
