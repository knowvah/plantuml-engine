# T1: pin the 111

**Rows:** the 111 zero rows in `/tmp/cogr-t0.json` (`n === 0`). **Why:** D2.

## Steps

1. Copy `plans/class-divergence-drive/tools/{pin-goldens.mts,pin-goldens.test.mts,tsconfig.json,vitest.config.mts}`
   into `plans/class-oracle-gap-rows/tools/`. Change `MISSION` to `'class-oracle-gap-rows'`, the usage path, and the
   comments that name the cdd tool's own path. Nothing else changes. Run its test with the copied config
   (`npx vitest run --config plans/class-oracle-gap-rows/tools/vitest.config.mts`) and read the collected count.
2. Pin: `npx jiti plans/class-oracle-gap-rows/tools/pin-goldens.mts cogr-T1 T1 <the 111 slugs>`. Take the slugs
   from `/tmp/cogr-t0.json`. If the allowlist refuses a command substitution, pass them literally.
   - The tool refuses a twin that is not `agree` / `ok`. None of the 111 should hit that (only `kofogo` and `zemeco`
     are `known-misroute`, and both are open). If one does, journal it and leave it for its own task.
3. Run the three tests in task contract step 7. Update every running count that moved:
   - the class golden entries (+111; `ratchet.json` held 1005 entries at planning: 720 `class`, 283 `unknown`, 2 `c4`);
   - the routing and refusal totals, in the tests' constants and their dated comment blocks
     (`routing-conformance.test.ts:270-309` shows the per-pin comment pattern).
4. Update `oracle/goldens/svg-class/README.md`'s "Current state" with a dated `cogr` line.

## Acceptance
- Given `ratchet.json` after T1, then it has 111 more entries with `source` `cogr-T1`, and each slug has `in.puml` and
  `golden.svg` byte-equal to its cache.
- Given the class ratchet test, then all of its cases pass, 111 more than at T0.
- Given the routing and refusal tests, then both pass with the new counts.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
