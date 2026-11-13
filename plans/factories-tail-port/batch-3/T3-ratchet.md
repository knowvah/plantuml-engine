# T3: pin it in `svg-factories`

**Writes:**
- `tests/oracle/svg-conformance/render-fixture-factories.ts`: `FACTORIES_SLUGS` 43 → 49, with groups
  `// Welcome (PSystemBuilder.java:133)` and `// ListFonts (PSystemBuilder.java:148)`;
- `factories.diff-baseline.ratchet.test.ts` (`FACTORIES_SLUG_COUNT`), and the count in
  `factories.golden.ratchet.test.ts`'s doc;
- `oracle/goldens/svg-factories/{README.md,ratchet.json,diff-baseline.json,authored-baseline.json,<slug>/}`;
- `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` (the 6 rows only), and the count assertions in
  `routing-conformance.test.ts` and `refusal-coverage.test.ts` (lsp journal row 9);
- `plans/factories-tail-port/measurements/{pin-factories,repin-factories-baseline,repin-factories-routing,build-authored-baseline}.mts`;
- `DIVERGENCES.md`: the #169 entry's row list gains the 4 corpus rows and the drawn `cov-listfont*` fixtures;
- `docs/parity-report.md`.

**Read:**
- `oracle/goldens/svg-factories/README.md`;
- the four lsp tools in `plans/listsprite-factory-port/measurements/`, and lsp T3
  (`plans/listsprite-factory-port/batch-3/T3-ratchet.md`) with its journal rows 8 and 9;
- `.claude/memory/{repin-script-raises-preexisting-red-pin,new-corpus-tree-trips-two-gates}.md`.

**Do:**
1. Copy lsp's four tools into this plan's `measurements/` (D3).
   - Fix any `plantuml-ts` banner regex in them.
   - Keep the reason tables, and add a reason for each nonzero row: an error pair, or #169 for `cov-listfont*`.
   - Journal each copy and each edit.
2. Add the 6 corpus slugs.
   - Pin the 2 Welcome rows with `pin-factories.mts`.
   - Put the 4 ListFonts rows in `diff-baseline.json` with `repin-factories-baseline.mts`, with the reason
     `DIVERGENCES.md` "`help font` lists no fonts" (#169, D4).
3. Run `repin-factories-routing.mts`: read it first, then `--write`. Diff both baselines afterwards.
   - Only the 6 slugs may change, and their goldens clones. None may get worse (stop 2).
   - The Welcome rows' stale `known-gap` becomes `ok`. The ListFonts rows' `weErrored` becomes false.
4. Run `build-authored-baseline.mts <HEAD sha>`, read the result, then `--write`. Every mission fixture must be in it.
5. Update the #169 entry in `DIVERGENCES.md`, the factories README (population 49, the two groups), and
   `npm run parity:dashboard`.
6. Time the factories suites locally, with `uptime` below ~10, and journal the wall time (CI risk).

## Acceptance
- Given `npm test`, then the factories ratchet suites pass and collect the expected counts. Read the counts.
- Given one mission fixture deliberately broken (locally, not committed), then the authored ratchet fails on that
  fixture.
- Given the routing and refusal baselines, then only the 6 slugs changed, and none got worse.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
