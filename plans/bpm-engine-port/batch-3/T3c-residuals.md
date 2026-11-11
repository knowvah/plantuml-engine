# T3c — Residuals

**Read:** D8, D12; the T3a and T3b journal rows; `row-diffs.mts` and `fixtures.mts` output.

**Write-set:** `src/diagrams/bpm/**`, the T1 modules, their tests.

**Do:** for each row or fixture not at zero and not an error pair, find the first diff, read the Java that draws it,
fix it with a quote, and re-measure both tools. Split into T3c-1, T3c-2, ... per mechanism; each is its own commit.
A residual whose mechanism needs a ruling goes on a `needs-ruling` issue naming the row (D12); everything else finishes.

## Acceptance
- Given `bpm-rows.mjs` on a fresh `unknown` survey, then every row is conformant or carries a D12 end in the journal.
- Given `fixtures.mts`, then every fixture is zero, an error pair, or named with its end.
- Given the full survey, then `verdict-diff` against `<base>` exits 0.

Observability N/A. Rollback Reversible.
