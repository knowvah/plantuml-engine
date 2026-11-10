# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T6 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory | T5 | [x] |

## T6

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/ebnf-engine-port/measurements/ebnf-rows.mjs tests/oracle/svg-conformance
npx jiti plans/ebnf-engine-port/measurements/pin-ebnf.mts
npx tsx scripts/svg-conformance-census.ts ebnf --json tests/oracle/svg-conformance/census-ebnf.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # only ladifa's move to retired (D8)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-ebnf.mts` must print `pins 0`. Rewrite the `ebnf` note in
`scripts/parity-dashboard-notes.ts` (`noteClass: 'notBuilt'` today) from measured numbers. Update
`DIVERGENCES.md:1973`: `ladifa` is now an error pair on the issue T4a opened, and only the two regex rows wait on an
engine. Update `planning/next-missions.md`: an `ebnf-engine-port (eep)` section with any follow-ons, and strike ebnf
from the "Unported engines' document background" item. Correct `planning/mission-guide.md` Track SI-3 and Phase 5f:
upstream has no railroad IR, the tiles live in `src/diagrams/ebnf/`, and regex imports them (D1).

Comment on #126 that the five regex-only tiles, `UBrexCommandMultilines2` and `I18n` exist and where, on #136, and on
any bucket's issue a shared fix moved. Any new issue gets its "Blocked by" line on #136 (D8). If `gh issue comment` is
denied, do not work around it: leave the text in `.agent-notes/eep-T6.md`.

Update `docs/catalog.md` if it drifts. Mark the README status and done-when list, and add a Summary section: tasks,
gates with counts, verdicts before and after, authored counts, the rows left and their ends. **Name the CI risk:** read
the latest PR run for the slowest shard and the routing/refusal part times. Write `.claude/memory/eep-status.md` with
its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md` that #125 ran. Commit `docs(eep): close out`,
recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff holds only `ladifa`'s retirement.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
