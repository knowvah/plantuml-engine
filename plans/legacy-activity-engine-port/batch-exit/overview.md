# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Final survey, docs, issue comments, summary | orchestrator | docs and the brief | T4 | [x] |

## T5

1. Gates at `uptime` below ~10, then `npm run svg:survey` and `verdict-diff.mjs <base>`: lost 0. `legacy-rows.mjs` on
   the committed surveys: the final count per verdict.
2. Survey wall time before and after (the T0 and final `svg:survey` logs), journalled.
3. `npm run build`, then `diff -r /tmp/laep-b0/dts dist` restricted to `*.d.ts` (T0 saved the base's). Only an
   added plugin symbol may appear (stop 4). If `/tmp` was cleared, journal that the check could not run.
4. `DIVERGENCES.md`: a row per new divergence with its forcing library, if any. `planning/next-missions.md`: a laep
   section with the follow-ons (D2's duplicated state images and the shared `GraphvizImageBuilder`, any separable
   issue filed).
5. `docs/parity-report.md` regenerated; `npm run catalog` if exports changed.
6. Comment on #123 with the summary; on #121 and #119 if their rows closed here; on any `needs-ruling` or
   `queue:ready` issue filed (with its "Blocked by" line on #136). If a comment is denied, put its text in
   `plans/legacy-activity-engine-port/unposted-<issue>-comment.md`.
7. Fill the README's Summary (tasks, verdicts per bucket, authored count, gates, decisions to audit, rows left, CI
   risk) and tick "Done when".

## Acceptance
- Given the final survey, then lost 0 in every engine and each of the 124 rows is conformant or has a D8 end.
- Given the README, then its Summary and "Done when" are filled from measured numbers.

Observability: N/A — no new observable operations. Rollback: Reversible.
