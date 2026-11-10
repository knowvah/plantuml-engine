# T4b — Authored probes

**Read:** D7, D8, D13; `tests/fixtures/nwdiag/` and `tests/fixtures/board/` for the layout (`<slug>.puml` beside
`<slug>.svg`).

**Do:**

1. Copy the 23 planning probes from `plans/ebnf-engine-port/probes/` to `tests/fixtures/ebnf/`, and render oracles with
   `scripts/oracle-render.sh tests/fixtures/ebnf tests/fixtures/ebnf/*.puml` (four are jar error pages; the exit code
   is non-zero for them).
2. Author the D7 list as more `cov-*.puml`, render their oracles the same way, and keep each probe to one feature so a
   diff names its mechanism.
3. `npx jiti plans/ebnf-engine-port/measurements/fixtures.mts`: fix every nonzero fixture in its owning module, with
   the Java quote, until each is zero, an `error-pair` (D13), or a D8 end recorded in `build-authored-baseline.mts`'s
   `OPEN_ROWS` with its journal row.
4. Re-run the `ebnf` survey and `verdict-diff` after any shared-module fix.

## Acceptance
- Given `fixtures.mts`, then every fixture prints 0 or `error-pair`, and the journal names any other row's D8 end.
- Given the D7 list, then every item has a fixture, or the journal says why the jar cannot express it.
- Given `npm test`, then it passes.

Observability N/A. Rollback Reversible.
