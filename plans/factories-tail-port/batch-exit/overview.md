# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Verify the done-when list, then close out | orchestrator | surveys, report, docs, notes, README status, memory | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt. Run producers alone, with `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/factories-tail-port/measurements/fixtures.mts <every mission slug>
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- `dist/*.d.ts` must be unchanged against the T0 snapshot (`/tmp/ftp-base-dts/`), or its only change is `'crash'` added
  to a union. Journal which.
- `scripts/parity-dashboard.ts#D7_FOOTNOTE_MEMBERS`: if it names `CRASH` and no test pins the list, drop it. If a test
  pins the list, journal a follow-on (lsp follow-on 3 precedent).
- Every fixture left open must be named in `DIVERGENCES.md` (#169) or on the Path ruling issue (D9).
- Planning documents:
  - `planning/roadmap.md`: mark the four factories known (Path: ruling pending, with its issue number).
  - `planning/mission-guide.md`: add "Welcome, ListFonts, Crash and Path factories — DONE (factories-tail-port,
    #135)" with the Path issue.
  - `planning/next-missions.md`: add a `factories-tail-port (ftp)` section with its follow-ons. Include:
    - every earlier plan's `fixtures.mts` still matches `plantuml-ts` (D3);
    - T1d, if it was reverted;
    - the crash-report page (`ReportLog`), still unported by the existing ruling.

Comment on #135 with the outcome. Comment on #136 with the counts and the Path issue. If `gh issue comment` is denied,
do not work around it: leave the text in `.agent-notes/ftp-T4.md`.

**Then close out:**
1. Run `npm run catalog` if `docs/catalog.md` drifts.
2. Mark the README status and the done-when list.
3. Add a Summary section to the README:
   - tasks and gates, with counts;
   - verdicts before and after;
   - authored counts by class (equal, error pair, #169, open);
   - the corpus rows;
   - the rows left open, each with its end.
4. **Name the CI risk.** Read the latest PR run for the slowest shard (`.claude/memory/ci-test-durations-from-blobs.md`).
5. Write `.claude/memory/ftp-status.md` with its `MEMORY.md` line. Note in `.claude/memory/parity-issue-queue.md` that
   #135 ran.
6. Commit `docs(ftp): close out`, and record the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0, and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
