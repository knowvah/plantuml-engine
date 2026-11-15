# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Verify the done-when list, probe the other label pipelines, close out | orchestrator | surveys, report, docs, notes, README status, memory, issues | batch 3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt. Run producers alone, with `uptime` below ~10.

```sh
npm run svg:survey   # skip only if `git diff <batch-3 close> HEAD -- src tests` is empty; journal the reuse
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx tsx plans/edge-label-embed/measurements/measure-probes.mts /tmp/ele-exit.json
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json DIVERGENCES.md   # expected empty (D4)
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- **The d.ts.** Diff `dist/*.d.ts` against the T0 snapshot (`/tmp/ele-base-dts/`). It must be empty (D6); journal
  the empty diff.
- **Other label pipelines (D1).** Author probes with a well-formed and an unterminated `{{` in:
  - a sequence message (`A -> B : {{\nclass X\n}}`);
  - an activity-3 arrow label (`-> {{ … }};`);
  - a timing message, and a chen ER relationship label if `cheneer` has one.

  Render the oracles. For each that diverges, file one `queue:ready` + `parity` issue with the measurement, the
  jar's builder `file:line`, and ours. Do not fix them here.
- **`actleg-open`.** Measure it and file a `queue:ready` issue. The jar renders a dedication-bannered Welcome page
  for the whole document (the jar `.svg` is in `measurements/probes/jar/`); ours renders no banner. Read the Java
  that picks that page before writing the issue's mechanism line.
- **Planning documents.** Add an `edge-label-embed (ele)` section to `planning/next-missions.md` with the
  follow-ons.

Comment on #144 with the outcome:
- xetase pinned;
- each probe's final count;
- each filed issue;
- the verdict-diff counts.

Comment on #136 with the counts. If `gh issue comment` is denied, do not work around it: leave the text in
`.agent-notes/ele-T4.md`.

**Then close out:**
1. Run `npm run catalog` if `docs/catalog.md` drifts.
2. Mark the README status and the done-when list.
3. Add a Summary section to the README:
   - tasks and gates, with counts;
   - verdicts before and after, per engine;
   - the probes before and after;
   - the d.ts diff (empty);
   - follow-ons.
4. **Name the CI risk.** Read the latest PR run for the slowest shard
   (`.claude/memory/ci-test-durations-from-blobs.md`).
5. Write `.claude/memory/ele-status.md` with its `MEMORY.md` line. Note in `.claude/memory/parity-issue-queue.md`
   that #144 ran.
6. Commit `docs(ele): close out`, and record the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0, `verdict-diff` shows 0 lost in every engine, and the
  divergence diff is empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
