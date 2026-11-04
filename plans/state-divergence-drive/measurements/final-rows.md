# Final rows -- state rows still open at T6d close (2026-11-04)

Survey `/tmp/stdd-b6-final.json`: 297 conformant, 0 structural-match, 2 diverged of 299 (`npm run svg:survey -- state`,
`row-diffs.mts`, `classify.mjs`, re-run per the batch-6 overview). Every other row of `b6-rows.md` reached zero in T6a-T6d.

| row | first diff | mechanism (`file:line`) | end |
|---|---|---|---|
| `xetase-70-zaza808` | `svg/@viewBox[2]` 144 against 667 (38 diffs) | the `{{ }}` edge label is an `EmbeddedDiagram` atom upstream (`Display#create0` -> `CreoleParser`, `EmbeddedDiagram.java`), drawn as an `<image width="532" height="227">` of the nested Welcome page; every engine measures edge labels through the flat creole seam (`core/edge-label-box.ts`), which has no embedded-diagram atom | genuinely large and separable: issue #144 (`parity`, `queue:ready`, blocked by #136) with the measurement and the fix sketch (journal row 38) |
| `viroxo-69-fito663` | `svg/@viewBox[2]` 223 against 226 (93 diffs, every one a 2-17 px x shift inside `comp1`) | our DOT equals the jar's `svek-1.dot` (`dotEqual` true) and real `dot -Tdot` 16.1.0 reproduces the jar to the pixel; `@knowvah/dot-engine` 2.4.0 places the cluster's `rank=sink` port node, `ee` anchor and inner nodes differently (start 17 px left of `chk` against 4; cluster 109 against 112 wide) | library-forced: `docs/graphviz-issues/39-border-point-cluster-sink-port-node-placement.md` + `TRACKER.md` line; `DIVERGENCES.md` "State diagrams" entry (journal rows 42-44) |

Rows the earlier batches named but that closed in batch 6 (for the record): `gopudo-91` (creole `Bullet`, T6d), `tucotu-42`
(`frame` composite, T6c), `bitaxo-18`, `bujuta-44`, `mimaga-15`, `rinisi-79`, `nijugi-19`, `xipela-98`, `kotagu-43`,
`pesita-10`, `dogeji-46`, `viguto-81`, `xexika-61` (T6c), `butigu-57`, `diteme-18`, `vogimu-84`, `polodo-05`, `rijoki-89`
(T6b), `jijuze-43`, `darime-88`, `lumamo-63`, `jetuse-93`, `fejuja-91`, `mosigo-88`, `nimana-36`, `nimise-04`,
`dikipu-79`, `nevezi-29` (T6a).
