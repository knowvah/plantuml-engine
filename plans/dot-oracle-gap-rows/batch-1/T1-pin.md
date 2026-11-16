# T1: pin the 47

**Rows:** the 47 rows in `/tmp/dogr-t0.json` with `n === 0` (none of them is a jar error page). **Why:** D2.

## Steps

1. Copy `plans/class-oracle-gap-rows/tools/{pin-goldens.mts,pin-goldens.test.mts,tsconfig.json,vitest.config.mts}`
   into `plans/dot-oracle-gap-rows/tools/`. Adapt, and change nothing else:
   - `MISSION = 'dot-oracle-gap-rows'`, `GOLDEN_DIR = 'oracle/goldens/svg-dot'`, clone `type: 'svg-dot'`;
   - the cache tree is `dot` only: drop the `unknown` tree, its subdirectory and its routing-type assertion
     (dot routes `NONE` / `NONE`);
   - the ratchet entry is `{ slug, addedAt, source }`, the shape `svg-dot/ratchet.json` already has;
   - the usage text and the comments that name the class tool's own path.
   Adapt the test the same way, then run it with the copied config
   (`npx vitest run --config plans/dot-oracle-gap-rows/tools/vitest.config.mts`) and read the collected count.
2. **Red:** in `tests/oracle/svg-conformance/dot.golden.ratchet.test.ts`, raise `pins the whole known @startdot
   corpus` from 5 to 52, and run it to see it fail.
3. Pin: `npx jiti plans/dot-oracle-gap-rows/tools/pin-goldens.mts dogr-T1 T1 <the 47 slugs>`. Take the slugs from
   `/tmp/dogr-t0.json`. If the allowlist refuses a command substitution, pass them literally.
   - The tool refuses a twin that is not `agree` / `ok`. None of the 47 should hit that. If one does, journal it and
     leave it for its own task.
4. Run the three tests in task contract step 6. Update every running count that moved, each with a dated
   `dogr/T1` comment line: the routing and refusal manifest totals (11465 at planning; +47 each), and their
   `pinnedAgree` / `pinnedRendering` counts.
5. Update `oracle/goldens/svg-dot/README.md`'s "Current state" with a dated `dogr` line. Correct its stale graphviz
   version (every golden says 16.1.0) and the "No `parity-dot.json`" item, and the matching sentence in the ratchet
   test's header (push-forward).

## Acceptance
- Given `ratchet.json` after T1, then it has 47 more entries with `source` `dogr-T1`, and each slug has `in.puml` and
  `golden.svg` byte-equal to its cache.
- Given the dot ratchet test, then all of its cases pass, and the corpus count reads 52.
- Given the routing and refusal tests, then both pass with the new counts.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
