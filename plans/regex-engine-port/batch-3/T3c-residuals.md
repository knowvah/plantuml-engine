# T3c — Residuals

**Read:** T3a's and T3b's journal rows (the first-diff histogram, the nonzero fixtures); the task contract; D3, D4,
D8, D13.

**Write-set:** `src/diagrams/regex/**`; a shared module a residual reaches (`src/diagrams/ebnf/**` only under D13,
klimt modules with their Java quote), and their tests.

**Do:** for each nonzero row or fixture, find where our output first departs from the jar's, read that Java, fix it at
its origin, and re-run `row-diffs.mts` / `fixtures.mts` on it. Group rows that share a mechanism into one commit. A
row that cannot reach zero ends per D8, and the journal names its end. After any edit under `src/diagrams/ebnf/`, run
`npx vitest run tests/oracle/svg-conformance/ebnf.golden.ratchet.test.ts` and read the test count.

## Acceptance
- Given the 46 rows, then each is conformant or has a D8 end in the journal.
- Given `fixtures.mts`, then every fixture is zero, an error pair, or has a D8 end in the journal.
- Given the `svg-ebnf` ratchet, then it still passes at 0 diffs.

Observability N/A. Rollback Reversible.
