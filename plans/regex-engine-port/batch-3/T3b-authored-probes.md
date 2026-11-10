# T3b — Authored fixtures

**Read:** D6; `tests/fixtures/ebnf/` (layout: `<slug>.puml` beside `<slug>.svg`); `plans/regex-engine-port/probes/`;
`measurements/fixtures.mts`.

**Write-set:** `tests/fixtures/regex/**`.

**Do:**

1. Copy the 38 planning probes into `tests/fixtures/regex/` and render their oracles there with
   `scripts/oracle-render.sh "$PWD/tests/fixtures/regex" tests/fixtures/regex/*.puml` (absolute out-dir:
   `.claude/memory/nwp-status.md`).
2. Author every case D6 lists that the probes miss, one `cov-*.puml` per branch, and render them the same way.
3. `npx jiti plans/regex-engine-port/measurements/fixtures.mts`: journal the count of zero, error-pair and nonzero
   fixtures, and hand every nonzero one to T3c with its first diff.

## Acceptance
- Given `fixtures.mts`, then every fixture has an oracle and a line, and the journal holds the three counts.
- Given D6's list, then each case has a fixture or a journal line saying which existing fixture covers it.

Observability N/A. Rollback Reversible.
