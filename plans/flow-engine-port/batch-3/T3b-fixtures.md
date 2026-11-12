# T3b — Fixtures

**Read:** D4, D5, D6; `tests/fixtures/bpm/` (the layout to copy); `measurements/jar-variants.mjs`.

**Write-set:** `tests/fixtures/flow/**`.

**Do:**
1. Copy all 41 probes from [../probes/](../probes/) into `tests/fixtures/flow/`.
2. Author D6's list, named `cov-*`.
3. Render every fixture with `node plans/flow-engine-port/measurements/jar-variants.mjs /tmp/flp-T3b/variants 8 tests/fixtures/flow/*.puml`.
   Copy `run1/<slug>.svg` to `tests/fixtures/flow/<slug>.svg`. For each `geometry` slug, also keep one SVG per distinct
   layout as `<slug>.v2.svg`, `<slug>.v3.svg`, and so on.
4. Commit `variants.json` beside the fixtures as `tests/fixtures/flow/variants.json`. T4's multiset tier reads it, along
   with each source's box count (D6: classify by box count, not observed stability).
5. Run `fixtures.mts` and `multiset.mjs` over every fixture, and journal the counts:
   - equal: one-box rows and error pairs;
   - multiset-equal: multi-box rows;
   - open.

## Acceptance
- Given every one-box fixture and error pair, then `fixtures.mts` reports 0 diffs, or the pair is two error pages.
- Given every multi-box fixture, then `multiset.mjs` exits 0 against its `.svg` or one of its `.vN.svg` files.
- Given the journal, then each open fixture has a mechanism and an owning task (T3c).

Observability N/A. Rollback Reversible.
