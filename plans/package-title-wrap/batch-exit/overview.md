# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Re-measure every engine, regenerate the reports, check the d.ts, comment on #219 | orchestrator | `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, this brief | T2c | [x] |

## T3

1. If any `src/` change landed after batch 2's close survey, rerun `npm run svg:survey` and
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`; 0 lost in every engine. Otherwise
   batch 2's close stands; journal that.
2. `npm run parity:dashboard`. If `docs/parity-report.md` differs only in timestamps, leave it at HEAD and journal it.
3. `npm run build`, then `diff -r /tmp/ptw-base-dts dist` limited to `*.d.ts`: no change (stop condition 5).
4. Final gate measurement: `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/package-title-wrap
   /tmp/ptw-final.json`; record the summary line and every open row with its reason in the README "Mission summary".
5. Comment on #219 (`gh issue comment 219 --body-file <file>`): the three mechanisms with `file:line` (ours and
   upstream), that the issue's "renderer wraps" / "skinparam conformant" statements did not hold on `7f359ac55`, the
   gate summary before and after, any issue filed under push-forward, and that the issue stays open until the branch
   merges.
6. Write the README "Mission summary" (tasks, pre-squash commit shas, gate counts, decisions flagged for review,
   follow-ups), tick the batches, run the README gates, commit.

## Acceptance
- Given the final tree, then every engine shows 0 lost against `<base>`, `dist/*.d.ts` is unchanged, and #219 carries
  the summary comment.
- Given the gate, then `ptw-issue` is a ZERO row and each OPEN row's reason is true today.

Observability N/A. Rollback Reversible.
