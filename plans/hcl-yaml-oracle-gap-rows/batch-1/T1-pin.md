# T1: pin the 7

**Rows:** the 7 rows in `/tmp/hyogr-t0.json` with `n === 0`: `comments-stripped`, `flat-key-value`,
`nested-resource-block`, `style-element-header`, `style-node-background`, `variable-block`,
`variable-reference-verbatim` (all `hcl`). **Why:** D2.

## Steps

1. Copy `plans/dot-oracle-gap-rows/tools/{pin-goldens.mts,pin-goldens.test.mts,tsconfig.json,vitest.config.mts}`
   into `plans/hcl-yaml-oracle-gap-rows/tools/`. Adapt, and change nothing else:
   - `MISSION = 'hcl-yaml-oracle-gap-rows'`, `GOLDEN_DIR = 'oracle/goldens/svg-hcl'`,
     `CACHE_DIR = 'test-results/dot-cache/hcl'`, `CACHE_TYPE = 'hcl'`, `GOLDEN_TYPE = 'svg-hcl'`;
   - remove the `--jar-error` path: the flag, `STOCK_ERRORS`, `GRAPHVIZ_DOCUMENT_MARK`, the jar-error branches of
     `healthyTwin`/`ratchetRows`, and `ratchetPathScorer` (it renders through `renderSync` for the dot ratchet; no
     score is needed here);
   - the usage text and the comments that name dogr's own path or `@startdot`.
   Adapt the test the same way (drop the jar-error cases), then run it with the copied config
   (`npx vitest run --config plans/hcl-yaml-oracle-gap-rows/tools/vitest.config.mts`) and read the collected count;
   run `npx tsc --noEmit -p plans/hcl-yaml-oracle-gap-rows/tools`.
2. **Red:** in `tests/oracle/svg-conformance/json-family-ratchet.ts`, add a per-type floor
   (`RATCHET_FLOOR = { json: 14, yaml: 7, hcl: 8 }`, a module-level constant with a dated comment naming hyogr/T1 and
   #142) and one test per type, `pins at least <floor> svg-<type> goldens (shrink-only)`. Run
   `npx vitest run tests/oracle/svg-conformance/hcl.golden.ratchet.test.ts` and see only the hcl floor fail
   (1 < 8).
3. Pin: `npx jiti plans/hcl-yaml-oracle-gap-rows/tools/pin-goldens.mts hyogr-T1 T1 <the 7 slugs>`. Pass the slugs
   literally. The tool refuses a twin that is not `agree` / `ok`; none of the 7 should hit that. If one does, journal
   it and leave that row for its own task.
4. Remove the 7 `hcl/<slug>` entries from `oracle/goldens/json-family-positional.json` (D2; the positional test
   requires it). Do not touch any other entry.
5. Run the four tests in task contract step 6. Update every running count that moved, each with a dated `hyogr/T1`
   comment line: the routing and refusal manifest totals (11520 at planning; +7 each), and their `pinnedAgree` /
   `pinnedRendering` counts.
6. Update `oracle/goldens/svg-hcl/README.md`'s "Current state" with a dated `hyogr` line (8 pinned; the json-family
   structural/positional pins and the Smetana ruling are now the bar for the rest), and correct its stale "no
   `parity-hcl.json`" section, which the survey now writes (push-forward).

## Acceptance
- Given `svg-hcl/ratchet.json` after T1, then it has 7 more entries with `source` `hyogr-T1`, and each slug has
  `in.puml` and `golden.svg` byte-equal to its cache.
- Given the hcl ratchet test, then all of its cases pass, including the floor at 8, and the json and yaml floors pass
  at 14 and 7.
- Given `json-family-positional.test.ts`, then it passes with 7 fewer pinned rows, and no other entry changed
  (`git diff` shows only 7 removed blocks).
- Given the routing and refusal tests, then both pass with the new counts.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
