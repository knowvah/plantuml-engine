# T3b — Authored fixtures

**Read:** D4, D5, D6; [../probes/](../probes/); `tests/fixtures/wire/` for the layout (`<slug>.puml` beside its
`<slug>.svg`); `.claude/memory/error-page-conformance-rule.md`.

**Write-set:** `tests/fixtures/bpm/**`.

**Do:**
1. Copy every planning probe except `cov-duplicate-merge-id` (D4) into `tests/fixtures/bpm/`.
2. Author D6's list: topology, routes, labels, options. Every new probe that crashes the jar is still a fixture (a D5
   error pair).
3. Render with `scripts/oracle-render.sh /abs/path/tests/fixtures/bpm <puml...>` so each `<slug>.svg` sits beside its
   source. Render any probe whose topology has more than one route **three times** and keep it only if the three are
   byte-identical (D4); a nondeterministic probe stays out, journaled.
4. `npx jiti plans/bpm-engine-port/measurements/fixtures.mts` once; journal the counts (zero, error-pair, open). Open
   fixtures are T3c's queue.

## Acceptance
- Given `tests/fixtures/bpm/`, then every `.puml` has a `.svg` beside it and none is `cov-duplicate-merge-id`.
- Given `fixtures.mts`, then it prints one line per fixture and a total, journaled.

Observability N/A. Rollback Reversible.
