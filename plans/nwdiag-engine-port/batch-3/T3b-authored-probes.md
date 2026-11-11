# T3b — Authored probes

**Read:** D5, D6, D11; `tests/fixtures/board/` and `tests/fixtures/packet/` for the layout (`<slug>.puml` beside
`<slug>.svg`); `.claude/memory/graphviz-16-1-1-local.md` (nwdiag never calls `dot`, so a 16.1.1 jar renders the same
nwdiag oracle as 16.1.0 did; say so in the journal once, with the jar's `dot -V`).

**Do:**

1. Copy the 16 planning probes from `plans/nwdiag-engine-port/probes/` to `tests/fixtures/nwdiag/`, and render
   oracles with `scripts/oracle-render.sh tests/fixtures/nwdiag tests/fixtures/nwdiag/*.puml`.
2. Author the D5 list as more `cov-*.puml`, render their oracles the same way, and keep each probe to one feature so
   a diff names its mechanism.
3. `npx jiti plans/nwdiag-engine-port/measurements/fixtures.mts`: fix every nonzero fixture in its owning module, with
   the Java quote, until each is zero, a jar error page where we also error (D6), or a D6 end recorded in
   `build-authored-baseline.mts`'s `OPEN_ROWS` with its journal row.
4. Re-run the survey and `verdict-diff` after any shared-module fix.

## Acceptance
- Given `fixtures.mts`, then every fixture prints 0, `error-pair`, or a jar-error row with our error page, and the
  journal names any other row's D6 end.
- Given the D5 list, then every item has a fixture, or the journal says why the jar cannot express it.
- Given `npm test`, then it passes.

Observability N/A. Rollback Reversible.
