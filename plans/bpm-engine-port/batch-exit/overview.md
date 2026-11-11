# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, with `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/bpm-engine-port/measurements/bpm-rows.mjs tests/oracle/svg-conformance
npx jiti plans/bpm-engine-port/measurements/pin-bpm.mts
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty (D12)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- `dist/*.d.ts` is unchanged against the base, or the change is journaled. `pin-bpm.mts` must print `pins 0`.
- The generated `unknown` sentence (`unknownDetail`) moves on its own; check it no longer counts BPM.
- Name every row left open, in `DIVERGENCES.md` or on its issue (D12).
- Planning documents:
  - `planning/roadmap.md`: add a struck-through BPM line beside item 17, with the result.
  - `planning/mission-guide.md`: add a short "Phase — BPM — DONE (bpm-engine-port, #130)" section. The issue cites a
    phase section that does not exist.
  - `planning/next-missions.md`: add a `bpm-engine-port (bpe)` section, with any follow-ons.

Comment on #130 with the outcome, and on #136 with the counts and any new issue. Each new issue also gets its "Blocked
by" line on #136. If `gh issue comment` is denied, do not work around it: leave the text in `.agent-notes/bpe-T5.md`.

Then close out:
1. Update `docs/catalog.md` if it drifts (`npm run catalog`).
2. Mark the README status and the done-when list.
3. Add a Summary section: tasks, gates with counts, verdicts before and after, authored counts, and the rows left with
   their ends.
4. **Name the CI risk.** Read the latest PR run for the slowest shard and the routing/refusal part times
   (`.claude/memory/ci-test-durations-from-blobs.md`).
5. Write `.claude/memory/bpe-status.md` with its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md`
   that #130 ran.
6. Commit `docs(bpe): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
