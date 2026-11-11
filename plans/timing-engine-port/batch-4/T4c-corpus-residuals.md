# T4c — Residuals on the 139 `timing`-bucket rows

**Read:** T4a's journal histogram; `row-diffs.mts` output for the bucket; the Java behind each first diff;
`.claude/memory/{comparesvg-count-not-monotonic,segment-compare-beats-align-counts,measurement-artifacts-outnumber-defects}.md`.

**Do:** take mechanisms in descending row count. For each: read the Java, state the mechanism with `file:line` in the
journal, fix at the origin (`~/.claude/rules/diagnosis.md`: mechanism, origin, causal chain, ruled out), add a unit
test with the jar value, re-run `row-diffs.mts` on the affected rows and `survey-moves` on the bucket. Split into
T4c1, T4c2, … when a mechanism is its own unit. A row that cannot reach zero ends per D8 with its name and reason in the
journal; a ruling goes on a `needs-ruling` issue naming the row (if `gh issue create` is denied, leave the body in
`.agent-notes/tep-T4c.md`).

## Acceptance
- Given `timing-rows.mjs` on a fresh `timing` survey, then every drawn row is conformant or named in the journal with
  its D8 end, and the six jar-error rows are conformant.
- Given `verdict-diff` against `<base>`, then it exits 0.

Observability N/A. Rollback Reversible.
