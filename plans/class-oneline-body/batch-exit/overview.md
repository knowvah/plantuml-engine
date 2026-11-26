# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Re-measure every engine, regenerate the reports, check the d.ts, comment on #223 | orchestrator | `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, this brief | T2b | [x] |

## T3

1. If any `src/` change landed after batch 2's close survey, rerun `npm run svg:survey` and
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It must show 0 lost in every
   engine. Otherwise batch 2's close stands; journal that.
2. Run `npm run parity:dashboard`. If `docs/parity-report.md` differs only in timestamps, leave it at HEAD and journal
   it.
3. Run `npm run build`, then `diff -r /tmp/ocb-base-dts dist`, limited to `*.d.ts`. There must be no change (stop
   condition 5).
4. Final gate measurement: run `npx tsx plans/hidden-note-host/measurements/measure.mts
   tests/fixtures/class-oneline-body /tmp/ocb-final.json`, then the authored gate. In the README "Mission summary",
   record the `ERROR_PAGE`/`ZERO`/`OPEN` counts and every open row with its reason.
5. Comment on #223 with `gh issue comment 223 --body-file <file>`. Include:
   - the mechanism with `file:line`, ours and upstream's;
   - the gate before and after;
   - the two unit tests that asserted the over-accept;
   - any issue filed under T2b;
   - that the issue stays open until the branch merges.
6. Write the README "Mission summary": tasks, pre-squash commit shas, gate counts, decisions flagged for review, and
   follow-ups. Tick the batches, run the README gates, and commit.

## Acceptance
- Given the final tree, then every engine shows 0 lost against `<base>`, `dist/*.d.ts` is unchanged, and #223 carries
  the summary comment.
- Given the gate, then the issue's three rows are `ERROR_PAGE` rows, and each OPEN row's reason is true today.

Observability N/A. Rollback Reversible.
