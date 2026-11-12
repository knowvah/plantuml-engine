# T3: pin it in `svg-factories`

**Writes:**
- `tests/oracle/svg-conformance/render-fixture-factories.ts` (`FACTORIES_SLUGS` 41 → 43, a `// ListSprite
  (PSystemBuilder.java:170)` group), `factories.diff-baseline.ratchet.test.ts` (`FACTORIES_SLUG_COUNT`), the "41" in
  `factories.golden.ratchet.test.ts`'s doc;
- `oracle/goldens/svg-factories/{README.md,ratchet.json,diff-baseline.json,authored-baseline.json,<slug>/}`;
- `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` (the two rows only);
- `oracle/goldens/svg-utility/authored-baseline.json` (`cov-refuse-listsprite`, if it moved);
- `plans/listsprite-factory-port/measurements/{pin-factories,repin-factories-baseline,repin-factories-routing,build-authored-baseline}.mts`;
- `docs/parity-report.md`.

**Read:**
- `oracle/goldens/svg-factories/README.md`; the four cmf tools in `plans/creole-math-factories-port/measurements/`;
- `plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts` (`cov-refuse-listsprite`'s reason);
- the T4 rows of `plans/creole-math-factories-port/decision-journal.md`;
- `.claude/memory/{repin-script-raises-preexisting-red-pin,new-corpus-tree-trips-two-gates}.md`.

**Do:**
1. Copy the four cmf tools into this plan's `measurements/` (D3). Keep cmf's reason tables; add a reason per nonzero
   `cov-sprites-*` row (an error pair or a D9 citation). Journal each copy and edit.
2. Add the two corpus slugs to `FACTORIES_SLUGS`. Pin each zero-diff one with `pin-factories.mts`; put a nonzero one
   in `diff-baseline.json` through `repin-factories-baseline.mts` with its mechanism.
3. Run `repin-factories-routing.mts` (read it, then `--write`). Diff both baselines afterwards: the only rows that may
   change are the two slugs, and none may get worse (stop 2).
4. `build-authored-baseline.mts <HEAD sha>`, read it, then `--write`. Every `cov-sprites-*` row is in it.
5. `cov-refuse-listsprite` (svg-utility authored): measure it. If it fell, lower its baseline with the utility tool and
   replace its "parity gap, follow-on 4" reason with the new end. Diff the JSON: any other row that rose is stop 2.
6. Update `oracle/goldens/svg-factories/README.md` (population 43, the ListSprite group). `npm run parity:dashboard`.
7. Time the factories suites locally at `uptime` below ~10, and journal the wall time (CI risk).

## Acceptance
- Given `npm test`, then the factories ratchet suites pass and collect the expected counts (read them).
- Given one `cov-sprites-*` fixture's name deliberately broken (local, not committed), then the authored ratchet fails
  on that fixture.
- Given the routing and refusal baselines, then only the two slugs changed, and neither got worse.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
