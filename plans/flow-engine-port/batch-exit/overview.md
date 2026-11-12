# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, with `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/flow-engine-port/measurements/flow-rows.mjs tests/oracle/svg-conformance
npx jiti plans/flow-engine-port/measurements/pin-flow.mts
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json tests/oracle/svg-conformance/compare.ts   # must be empty (D4)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- `dist/*.d.ts` is unchanged against the base, or the change is journaled. `pin-flow.mts` must print `pins 0`.
- The generated `unknown` sentence (`unknownDetail`) moves on its own. Check that it no longer counts FLOW as
  unregistered.
- Name every row left open in `DIVERGENCES.md` or on its issue (D11). Add a short `DIVERGENCES.md` note under the
  unknown/utility section that points at the D4 issue as **pending a ruling**, not accepted.
- Planning documents:
  - `planning/roadmap.md`: add a struck-through FLOW line, with the result.
  - `planning/mission-guide.md`: the issue cites a "Phase 5p". Add or tick it as "Flow — DONE (flow-engine-port, #132)".
  - `planning/next-missions.md`: add a `flow-engine-port (flp)` section, with the D4 issue as the follow-on.

Comment on #132 with the outcome, and on #136 with the counts and the D4 issue. If `gh issue comment` is denied, do not
work around it: leave the text in `.agent-notes/flp-T5.md`.

Then close out:
1. Update `docs/catalog.md` if it drifts (`npm run catalog`).
2. Mark the README status and the done-when list.
3. Add a Summary section: tasks, gates with counts, verdicts before and after, authored counts by class (equal,
   multiset, error), and the rows left with their ends.
4. **Name the CI risk.** Read the latest PR run for the slowest shard and the routing/refusal part times
   (`.claude/memory/ci-test-durations-from-blobs.md`).
5. Write `.claude/memory/flp-status.md` with its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md`
   that #132 ran and which issue D4 filed.
6. Commit `docs(flp): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the D4 diff is empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
