# T3c — Residuals and the D4 ruling

**Read:** D4, D5, D8, D11; T3b's journal row.

**Write-set:** `src/diagrams/flow/**`, `src/core/golem/**`, tests; `.agent-notes/flp-T3c.md`.

**Do:**
1. For each fixture or row T3b left open, read the Java, state the mechanism with `file:line`, and fix it. Never fit
   anything. If a multi-box fixture is not multiset-equal to any variant and you can find no port defect, stop
   (README stop 5).
2. Re-run `fixtures.mts`, `multiset.mjs` and `row-diffs.mts` on everything. A fix can surface a hidden diff.
3. File the D4 issue with the draft in `decisions.md`, filling in the measured row list and counts:
   `gh issue create --label needs-ruling --label parity`. Then add `Blocked by #<new>` to #136, with a comment, or with
   a body edit if a comment is not possible. If either call is denied, put the text in `.agent-notes/flp-T3c.md` and
   continue.
4. Journal the issue number.

## Acceptance
- Given every row and fixture, then each is conformant, an error pair, or multiset-equal and listed on the D4 issue.
- Given the D4 issue, then it names `bemixo-79-xulu250`, every multi-box fixture slug, and the three options, and it
  decides nothing.

Observability N/A. Rollback Reversible.
