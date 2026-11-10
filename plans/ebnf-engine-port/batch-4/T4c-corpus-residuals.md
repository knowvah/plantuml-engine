# T4c — Corpus residuals

**Read:** T4a's journal histogram; the Java behind each first diff; D8, D10.

**Do:** take the 44 rows to zero or a D8 end, one mechanism at a time.

1. Group the rows by first diff from `row-diffs.mts`. For each group, read the Java that draws that element, state the
   mechanism with `file:line`, fix it at its origin, and re-run `row-diffs.mts` on the group: a fix can reveal a diff
   the short-circuit hid (task contract step 5).
2. Expect shared-module work: 20 rows carry comments (`FloatingNote` → `Opale`, `SheetBlock2`), 8 carry `title`, one
   `<style>` and one `scale`. A defect in a shared klimt or style module is fixed there, and the full survey at batch
   close checks every engine.
3. Split into sub-tasks (`T4c-1`, `T4c-2`, …) when a mechanism runs past about 15 minutes, one commit each. A
   `typescript-pro` subagent may take one mechanism with this file, the task contract and the rows as its prompt; read
   the Java yourself before accepting its mechanism.
4. A row that cannot reach zero ends by D8, never unnamed: a forcing library in `DIVERGENCES.md`, a `needs-ruling`
   issue naming the row, or a separable `queue:ready` issue with "Blocked by #<new>" added to #136.

## Acceptance
- Given `ebnf-rows.mjs` on the batch-close survey, then every row is conformant or named in the journal with its D8 end.
- Given `verdict-diff <base>`, then 0 lost in every engine.
- Given `npm test`, then it passes.

Observability N/A. Rollback Reversible.
