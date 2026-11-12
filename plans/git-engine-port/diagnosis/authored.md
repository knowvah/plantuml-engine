# authored fixtures — D9 evidence, one line each (gip T3c)

From `d9.mts` (`d9-2026-11-11.tsv`). Columns: step 2 (dot-engine vs `dot -Tdot`), step 3 (jar-size experiment), residue
node / path / dw / dh. Every fixture's step 1 is the same builder as the rows (`mechanisms.md`); DOTs in
`/tmp/gip-t3c/dot/authored/`. Mechanisms: every drawn fixture carries U-BOX and the `\N` label (all names here are
1-8 characters, so most boxes sit on the 32.5-wide `\N` minimum); fixtures with edges add U-ARROW and U-CLIP.
`cov-long-chain-after-merge` is `diverged` on one path's piece count, which the jar-size experiment removes
(`mechanisms.md`, "Path piece counts"). `cov-option-handwritten` has no `<rect>` (jiggled polygons): step 2 holds,
and its residue is the same box/curve arithmetic seen through `UGraphicHandwritten`.

| fixture | step 2 | step 3 | residue |
|---|---|---|---|
| authored/cov-bad-grid | engine=dot nodes 0.0002 edges 0.0000 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/0 | residue 13.750 / 0.000 / 19 / 0 |
| authored/cov-blank-lines | engine=dot nodes 0.0002 edges 0.0000 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/0 | residue 13.750 / 0.000 / 19 / 0 |
| authored/cov-chain-four | engine=dot nodes 0.0004 edges 0.0016 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/2 | residue 1.000 / 1.101 / 0 / 1 |
| authored/cov-chain-six | engine=dot nodes 0.0002 edges 0.0031 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/2 | residue 16.500 / 8.827 / 16 / 1 |
| authored/cov-chain-two | engine=dot nodes 0.0004 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 1.000 / 0.625 / 0 / 1 |
| authored/cov-comment-empty | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.048 / 7 / 0 |
| authored/cov-comment-folded | engine=dot nodes 0.0003 edges 0.0016 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/2 | residue 12.500 / 4.318 / 7 / 1 |
| authored/cov-comment-in-message | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 1.548 / 2 / 0 |
| authored/cov-comment-not-top | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/2 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-comment-paren-before | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 0.876 / 1 / 0 |
| authored/cov-comment-tag | engine=dot nodes 0.0017 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 0.876 / 1 / 0 |
| authored/cov-comment-two-groups | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 1.548 / 2 / 0 |
| authored/cov-comment-unclosed | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-creole-comment | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 3.548 / 6 / 0 |
| authored/cov-creole-name | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 0.673 / 0 / 1 |
| authored/cov-creole-unicode | engine=dot nodes 0.0003 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/2 | residue 11.500 / 0.876 / 0 / 1 |
| authored/cov-crossing | engine=dot nodes 0.0002 edges 0.0028 countMismatch 0 | jarsize: nodeX≠jar 0/5, pieces≠jar 0 (ours 0)/6 | residue 11.750 / 10.782 / 13 / 2 |
| authored/cov-dash-merge | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/4 | residue 11.500 / 7.117 / 11 / 1 |
| authored/cov-duplicate-name | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/2 | residue 11.500 / 9.271 / 7 / 1 |
| authored/cov-ellipsis | engine=dot nodes 0.0002 edges 0.0000 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/0 | residue 13.750 / 0.000 / 19 / 0 |
| authored/cov-empty | no-graph |  |  |
| authored/cov-fold-octopus | engine=dot nodes 0.0031 edges 0.0048 countMismatch 0 | jarsize: nodeX≠jar 0/7, pieces≠jar 0 (ours 0)/8 | residue 2.000 / 2.343 / 0 / 2 |
| authored/cov-indent-shift | engine=dot nodes 0.0002 edges 0.0000 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/0 | residue 21.750 / 0.000 / 27 / 0 |
| authored/cov-indent | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-long-chain-after-merge | engine=dot nodes 0.0002 edges 0.0047 countMismatch 0 | jarsize: nodeX≠jar 0/5, pieces≠jar 0 (ours 1)/5 | residue 12.500 / 11.652 (+1 unaligned paths) / 11 / 2 |
| authored/cov-long-name | engine=dot nodes 0.0025 edges 0.0025 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 0.657 / 1 / 1 |
| authored/cov-merge-simple | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/4, pieces≠jar 0 (ours 0)/4 | residue 16.250 / 15.040 / 20 / 1 |
| authored/cov-no-message | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-octopus-3 | engine=dot nodes 0.0037 edges 0.0048 countMismatch 0 | jarsize: nodeX≠jar 0/5, pieces≠jar 0 (ours 0)/6 | residue 1.500 / 2.211 / 0 / 1 |
| authored/cov-octopus-4 | engine=dot nodes 0.0013 edges 0.0048 countMismatch 0 | jarsize: nodeX≠jar 0/6, pieces≠jar 0 (ours 0)/7 | residue 1.500 / 2.359 / 1 / 1 |
| authored/cov-octopus-5 | engine=dot nodes 0.0013 edges 0.0047 countMismatch 0 | jarsize: nodeX≠jar 0/7, pieces≠jar 0 (ours 0)/8 | residue 1.500 / 1.921 / 2 / 1 |
| authored/cov-octopus-dashes | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/3 | residue 11.500 / 6.919 / 7 / 1 |
| authored/cov-octopus | engine=dot nodes 0.0002 edges 0.0033 countMismatch 0 | jarsize: nodeX≠jar 0/5, pieces≠jar 0 (ours 0)/6 | residue 20.250 / 18.101 / 24 / 1 |
| authored/cov-one | engine=dot nodes 0.0004 edges 0.0000 countMismatch 0 | jarsize: nodeX≠jar 0/1, pieces≠jar 0 (ours 0)/0 | residue 0.500 / 0.000 / 0 / 0 |
| authored/cov-option-handwritten | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | no rects (handwritten) |  |
| authored/cov-pragma-dark | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-preproc-var | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-rule-162 | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 8.500 / 4.220 / 7 / 1 |
| authored/cov-scale-200 | engine=dot nodes 0.0500 edges 0.0484 countMismatch 0 | jarsize: nodeX≠jar 0/202, pieces≠jar 0 (ours 0)/268 | residue 67.500 / 67.121 / 0 / 67 |
| authored/cov-scale | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-skinparam | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-style | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-theme | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-title | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 4.220 / 7 / 1 |
| authored/cov-two-tops | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/3, pieces≠jar 0 (ours 0)/2 | residue 11.750 / 10.782 / 15 / 1 |
| authored/cov-underscore | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/5, pieces≠jar 0 (ours 0)/5 | residue 11.500 / 10.720 / 12 / 1 |
| authored/cov-unicode | engine=dot nodes 0.0002 edges 0.0005 countMismatch 0 | jarsize: nodeX≠jar 0/2, pieces≠jar 0 (ours 0)/1 | residue 11.500 / 2.220 / 3 / 1 |
