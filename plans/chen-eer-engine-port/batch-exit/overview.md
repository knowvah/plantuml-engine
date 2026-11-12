# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, docs, notes, README status, memory | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Run producers alone, with `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/chen-eer-engine-port/measurements/fixtures.mts
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty (D12)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- `dist/*.d.ts` is unchanged against a base build, or the change is journaled.
- The generated `unknown` sentence no longer counts `CHEN_EER` as unregistered.
- Every fixture left open is named in `DIVERGENCES.md` or on its issue (D12).
- Planning documents:
  - `planning/roadmap.md`: strike through item 14 (Chen EER) and add the result.
  - `planning/mission-guide.md`: issue #133 cites "Phase 5h". Tick it as "Chen EER: DONE (chen-eer-engine-port, #133)".
  - `planning/next-missions.md`: add a `chen-eer-engine-port (ceep)` section with the follow-ons. These include D2's
    duplication of the common commands and the skin param, plus any T3d issue.

Comment on #133 with the outcome, and on #136 with the counts and any issue filed. If `gh issue comment` is denied, do
not work around it: leave the text in `.agent-notes/ceep-T5.md`.

**Then close out:**
1. Run `npm run catalog` if `docs/catalog.md` drifts.
2. Mark the README status and the done-when list.
3. Add a Summary section to the README:
   - tasks, and gates with counts;
   - verdicts before and after;
   - authored counts by class (equal, error pair, open);
   - DOT gate counts;
   - the rows left open, each with its end.
4. **Name the CI risk.** Read the latest PR run for the slowest shard (`.claude/memory/ci-test-durations-from-blobs.md`).
5. Write `.claude/memory/ceep-status.md` with its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md`
   that #133 ran.
6. Commit `docs(ceep): close out`, and record the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0, and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
