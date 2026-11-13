# T1: seed and pin

**Rows:** all 94 in `measurements/new-rows.json`. **Why:** D2. `pin-goldens.mts` refuses a slug with no
`status: "baseline"` row (`plans/sequence-divergence-drive-3/tools/pin-goldens.mts:104-112`).

## Steps

1. Copy `plans/sequence-divergence-drive-3/tools/{pin-goldens.mts,pin-goldens.test.mts,tsconfig.json,vitest.config.mts}`
   into `plans/sequence-oracle-gap-rows/tools/`. Change `MISSION` to `'sequence-oracle-gap-rows'` and the usage path.
   Nothing else changes. Run its test with the copied config, and read the collected count.
2. **Red, then green:** write `tools/seed-baseline.mts` and `tools/seed-baseline.test.mts`.
   - Usage: `npx jiti plans/sequence-oracle-gap-rows/tools/seed-baseline.mts <close-label> <slug...>`.
   - It measures through the seams of `scripts/repin-sequence-baselines.ts`: `fixtureIncludeStore()`,
     `DeterministicMeasurer`, `renderFixtureSequence` + `sequenceFixtureOptions()`, and `weightedScore` from
     `tests/oracle/svg-conformance/compare.ts`.
   - It appends `{ type: 'sequence', slug, status, weightedScore, diffCount, measuredAt, measuredAgainstCommit }` in
     the shape of the existing rows. `status` is `"baseline"`, or `"error"` with no score for a refused render, as
     `teoz-ng-001-11` is. Check how the existing `"error"` rows are written, and match them.
   - It refuses, writing nothing, a slug that already has a row, a slug with no cache dir, or a duplicate argument.
   - It keeps `diff-baseline.json` in the order and formatting the file already has.
3. Seed all 94: `npx jiti plans/sequence-oracle-gap-rows/tools/seed-baseline.mts T1 $(node -p "require('./plans/sequence-oracle-gap-rows/measurements/new-rows.json').join(' ')")`.
   If the allowlist refuses the substitution, pass the slugs literally.
4. Pin the zero rows: `npx jiti plans/sequence-oracle-gap-rows/tools/pin-goldens.mts sogr T1 <the 86 slugs>`.
   Take the 86 from `/tmp/sogr-t0.json` (`n === 0`).
5. Run the four ratchet tests named in task contract step 7, and update every running count that moved: the golden
   entries (+86; `ratchet.json` held 1195 entries for 1171 slugs at planning, because `unknown`-tree twins share a
   slug), the diff-baseline rows (1143 → 1237), and the routing and refusal totals. The counts live
   in the tests' constants and in `oracle/goldens/svg-sequence/README.md`'s "Current state": update that section with
   a dated `sogr` line.

## Acceptance
- Given `diff-baseline.json` after T1, then it has 1237 rows, the 94 new ones measured at today's commit, and
  `teoz-ng-001-11` is `"error"`.
- Given `ratchet.json`, then it has 86 more `dot-cache` entries with `source` `sogr-T1`, and each has `in.puml` and `golden.svg`.
- Given the seed tool, when it is called with an already-seeded slug, then it exits non-zero and writes nothing.
- Given the four ratchet tests, then all pass with the new counts.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
