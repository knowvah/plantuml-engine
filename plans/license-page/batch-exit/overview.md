# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Re-measure every engine, check the d.ts, comment on #179, write the summary | orchestrator | `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, this brief | T2b | [x] |

## T3

1. If any `src/` change landed after batch 2's close survey, rerun `npm run svg:survey` and
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`; 0 lost in every engine. Otherwise
   batch 2's close stands; journal that.
2. `npm run parity:dashboard`. If `docs/parity-report.md` differs only in timestamps, leave it at HEAD and journal it.
3. `npm run build`, then `diff -r /tmp/lic-base-dts dist` limited to `*.d.ts`: no change (stop condition 5).
4. Comment on #179 (`gh issue comment 179 --body-file <file>`, the file kept as `plans/license-page/issue-comment.md`):
   - what landed, item by item, with the commit range;
   - the ELK outcome (D4) and the `needs-ruling` issue number if filed;
   - the three questions for the user: the copyright year 2024 vs the jar's 2027 (D2), the position of the added
     credits (D5), and whether the Themes line should credit the other core-theme authors (D6), plus the two
     "wording by Claude" lines the ruling already flags;
   - the three signed rows with their numbers, and that the issue stays open until the branch merges.
5. Write the README "Mission summary" (tasks, pre-squash commit shas, row numbers before and after, decisions flagged
   for review, follow-ups), tick the batches, run the README gates, commit.

## Acceptance
- Given the final tree, then every engine shows 0 lost against `<base>`, `dist/*.d.ts` is unchanged, and #179
  carries the summary comment.
- Given the authored ratchet, then the three license rows are signed and every other row is unchanged.

Observability N/A. Rollback Reversible.
