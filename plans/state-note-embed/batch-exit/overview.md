# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T3 | Verify the done-when list, close out | orchestrator | surveys, report, docs, notes, README status, memory, issues | batch 2 | [x] |

## T3

`<base>` is the mission base sha named in the execution prompt. Run producers alone, with `uptime` below ~10.

```sh
npm run svg:survey   # skip only if `git diff <batch-2 close> HEAD -- src tests` is empty; journal the reuse
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx tsx plans/state-note-embed/measurements/measure-rows.mts /tmp/sne-exit.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json DIVERGENCES.md   # expected empty (D4)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- **The d.ts.** Diff `dist/*.d.ts` against the T0 snapshot (`/tmp/sne-base-dts/`). It must be empty (D6); journal
  the empty diff.
- **Planning documents.** Add a `state-note-embed (sne)` section to `planning/next-missions.md` with the follow-ons,
  and mark the two `{{ }} in a state note` items there (`:261`, `:271`) as done by #168.
- **Measurements.** Delete `measurements/probes/` rows that moved to `tests/fixtures/state-note-embed/`; keep the
  measurer pointing at the fixtures.

Comment on #168 with the outcome:
- the two held rows at 0;
- each probe's final count;
- each filed issue;
- the verdict-diff counts.

Comment on #136 with the counts, and name any issue filed here that #136 must list as `Blocked by`. If
`gh issue comment` is denied, do not work around it: leave the text in `.agent-notes/sne-T3.md`.

**Then close out:**
1. Run `npm run catalog` if `docs/catalog.md` drifts.
2. Mark the README status and the done-when list.
3. Add a Summary section to the README:
   - tasks and gates, with counts;
   - verdicts before and after, per engine;
   - the rows and probes before and after;
   - the d.ts diff (empty);
   - follow-ons.
4. **Name the CI risk.** Read the latest PR run for the slowest shard
   (`.claude/memory/ci-test-durations-from-blobs.md`).
5. Write `.claude/memory/sne-status.md` with its `MEMORY.md` line. Note in `.claude/memory/parity-issue-queue.md`
   that #168 ran.
6. Commit `docs(sne): close out`, and record the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0, `verdict-diff` shows 0 lost in every engine, and the divergence diff
  is empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
