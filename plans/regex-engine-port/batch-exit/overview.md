# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/regex-engine-port/measurements/regex-rows.mjs tests/oracle/svg-conformance
npx jiti plans/regex-engine-port/measurements/pin-regex.mts
npx tsx scripts/svg-conformance-census.ts regex --json tests/oracle/svg-conformance/census-regex.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # only bakuza's and tajefa's moves to retired (D8)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`dist/*.d.ts` unchanged against the base, or journaled. `pin-regex.mts` must print `pins 0`. Rewrite the `regex` note
in `scripts/parity-dashboard-notes.ts` (`noteClass: 'notBuilt'` today) from measured numbers. Rewrite
`DIVERGENCES.md:1973`: bakuza and tajefa are now error pairs on the issue T3a opened, and no signed row waits on an
engine. Update `planning/next-missions.md`: a `regex-engine-port (rep)` section with any follow-ons, item 1 under the
eep section marked done, and regex struck from the "Unported engines' document background" item. Mark
`planning/mission-guide.md` Phase 5m done with its result, as Phase 5f is.

Comment on #126 with the outcome, on #136 with the counts and any new issue (each new issue also gets its "Blocked by"
line on #136, D8). If `gh issue comment` is denied, do not work around it: leave the text in `.agent-notes/rep-T5.md`.

Update `docs/catalog.md` if it drifts (`npm run catalog`). Mark the README status and done-when list, and add a Summary
section: tasks, gates with counts, verdicts before and after, authored counts, the rows left and their ends. **Name the
CI risk:** read the latest PR run for the slowest shard and the routing/refusal part times. Write
`.claude/memory/rep-status.md` with its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md` that #126
ran. Commit `docs(rep): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff holds only the two retirements.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
