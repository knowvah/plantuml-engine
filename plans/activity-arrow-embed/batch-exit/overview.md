# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, close out | orchestrator | surveys, report, docs, notes, README status, memory, issues | batch 3 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Run producers alone, with `uptime` below ~10.

```sh
npm run svg:survey   # skip only if `git diff <batch-3 close> HEAD -- src tests` is empty; journal the reuse
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx tsx plans/activity-arrow-embed/measurements/measure-probes.mts /tmp/aae-exit.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json DIVERGENCES.md   # expected empty (D4)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- **The d.ts.** Diff `dist/*.d.ts` against the T0 snapshot (`/tmp/aae-base-dts/`). It must be empty (D5); journal the
  empty diff.
- **Separable residuals.** Every OPEN row's issue exists and carries the measurement and `file:line`. If T1 found the
  1-px canvas width separable, that issue exists too.
- **Planning documents.** Add an `activity-arrow-embed (aae)` section to `planning/next-missions.md` with the follow-ons.

Comment on #188 with the outcome: the T1 mechanism in two sentences, each probe's final count, each filed issue, and
the verdict-diff counts. Comment on #136 with the counts. If `gh issue comment` is denied, do not work around it: leave
the text in `.agent-notes/aae-T5.md`.

**Then close out:**
1. Run `npm run catalog` if `docs/catalog.md` drifts.
2. Mark the README status and the done-when list.
3. Add a Summary section to the README: tasks and gates with counts; verdicts before and after per engine; probes before
   and after; the d.ts diff (empty); follow-ons.
4. **Name the CI risk.** Read the latest PR run for the slowest shard (`.claude/memory/ci-test-durations-from-blobs.md`).
5. Write `.claude/memory/aae-status.md` with its `MEMORY.md` line. Note in `.claude/memory/parity-issue-queue.md` that
   #188 ran.
6. Commit `docs(aae): close out`, and record the close sha in the journal.

## Acceptance
- Given the exit survey, when `verdict-diff.mjs <base>` runs, then it exits 0 with 0 lost in every engine.
- Given the README done-when list, when read, then every box is ticked or names the issue that holds it.
- Given `dist/*.d.ts`, when diffed against `/tmp/aae-base-dts/`, then the diff is empty.

Observability N/A. Rollback Reversible.
