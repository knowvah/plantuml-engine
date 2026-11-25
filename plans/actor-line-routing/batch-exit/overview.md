# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Re-measure every engine, regenerate the reports, check the d.ts, file and attribute the residuals, comment on #191 | orchestrator | `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, the gate, this brief | T3 | [x] |

## T4

1. If any `src/` change landed after batch 2's close survey, rerun `npm run svg:survey` and
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It must show 0 lost in every
   engine. Otherwise batch 2's close stands; journal that.
2. Run `npm run parity:dashboard`. If `docs/parity-report.md` differs only in timestamps, leave it at HEAD and journal
   it.
3. Run `npm run build`, then `diff -r /tmp/alr-base-dts dist`, limited to `*.d.ts`. There must be no change (stop
   condition 5).
4. **File D6's dashed-line finding** (`gh issue create --label queue:ready --label parity`). Include
   `actor X #line.dashed` + `usecase U` and the `#line.dotted` twin, the diffs (`svg/@width` 107 vs 108, usecase `cx`
   -0.5), the jar's stroke style (`stroke-dasharray:7,7`), upstream's `file:line` that sizes the dashed actor, and ours.
   Set `alr-dashed`'s reason to the new number. Add `Blocked by #<new>.` to #136 only if you can edit it; otherwise say
   so in the #191 comment, as earlier missions did.
5. **Comment on #284** with `alr-order` (`actor X order 10 #line:red`): since T2 the description catch-all claims it,
   and the jar's description refuses it (`measurements/jar-error-check.txt`).
6. **Final gate measurement.** Run `npx tsx plans/hidden-note-host/measurements/measure.mts
   tests/fixtures/actor-line-routing /tmp/alr-final.json`, then the authored gate. In the README "Mission summary",
   record the `ZERO`/`ERROR_PAGE`/`OPEN` counts and every open row with its reason.
7. **Comment on #191** with `gh issue comment 191 --body-file <file>`. Include:
   - the mechanism, ours and upstream's, with `file:line`, and the D5 `create` fix;
   - the gate before and after;
   - any issue filed, and the rows held on #283 and #284;
   - that the issue stays open until the branch merges.
8. Write the README "Mission summary": tasks, pre-squash commit shas, gate counts, decisions flagged for review, and
   follow-ups. Tick the batches, run the README gates, and commit.

## Acceptance
- Given the final tree, then every engine shows 0 lost against `<base>`, `dist/*.d.ts` is unchanged, and #191 carries
  the summary comment.
- Given the gate, then `alr-issue` and `alr-line-red` are ZERO rows, and each OPEN row's reason is true today.

Observability: N/A. Rollback: Reversible.
