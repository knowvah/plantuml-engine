# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Verify the done-when list, then close out | orchestrator | surveys, report, README status, memory, issue comments | T2a | [x] |

## T3

`<base>` is the mission base sha named in the execution prompt. Producers run alone, `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --json /tmp/scr-final/rows.json
npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json
npm run build
git diff <base> HEAD --stat -- dist
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

1. Every in-scope row from the README table is conformant, or has a journal row naming its end per D9. List them in
   the README summary, family by family.
2. `oracle/accepted-divergences.json` is unchanged. `dist/*.d.ts` is identical to the base build (stop 4 otherwise).
3. The dss pin holds every row at or under its T0 count. Any corpus row that went conformant is pinned in its own
   bucket's ratchet. Journal each pin.
4. `docs/parity-report.md` regenerated (drift test green). `docs/catalog.md` regenerated if it drifts.
5. Update `planning/next-missions.md`: strike dss follow-ons 17-22 with what closed each (the README's "Already
   closed" list gives the earlier missions), and add a `style-colour-reads (scr)` section with any follow-ons.
6. Comment on #122 with the summary, and on any issue whose rows `verdict-diff` shows moving. A new `queue:ready`
   issue gets a "Blocked by" line on #136 (D9). If `gh` is denied, put each comment's text in the journal.
7. Add a Summary section to the README: tasks, gates with counts, verdicts before and after per engine, dss rows
   before and after (`rows N open M`), pins added, decisions flagged for review, and the ruling issue. **Name the CI
   risk:** the dss ratchet's runtime grew by T0's rows (journaled).
8. Write `.claude/memory/scr-status.md` with its `MEMORY.md` line, and note in
   `.claude/memory/parity-issue-queue.md` that #122 ran. Commit `docs(scr): close out`, and record the close sha in
   the journal.

## Acceptance
- Given the commands above, then each exits 0, and the accepted-divergences and d.ts diffs are empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
