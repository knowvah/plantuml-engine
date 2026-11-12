# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T4 | Verify the done-when list, then close out | orchestrator | surveys, report, docs, notes, README status, memory | T3 | [x] |

## T4

`<base>` is the mission base sha named in the execution prompt. Run producers alone, with `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
npx jiti plans/creole-math-factories-port/measurements/fixtures.mts <every cov-sprites-* slug>
npx jiti plans/listsprite-factory-port/measurements/corpus-rows.mts
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- `dist/*.d.ts` is unchanged against the T0 snapshot (`/tmp/lsp-base-dts/`), or the change is journaled.
- `scripts/parity-dashboard.ts#D7_FOOTNOTE_MEMBERS` names `SPRITES`; drop it now that an engine exists, unless a test
  pins the list (then journal it as a follow-on).
- Every fixture left open is named in `DIVERGENCES.md` or on its issue (D9).
- Planning documents:
  - `planning/roadmap.md`: mark the ListSprite factory done if the roadmap lists it.
  - `planning/mission-guide.md`: tick #134's entry as "ListSprite: DONE (listsprite-factory-port, #134)".
  - `planning/next-missions.md`: strike ufp follow-on 4 and add a `listsprite-factory-port (lsp)` section with the
    follow-ons, including D1's copied common commands and skin param.

Comment on #134 with the outcome, and on #136 with the counts and any issue filed. If `gh issue comment` is denied, do
not work around it: leave the text in `.agent-notes/lsp-T4.md`.

**Then close out:**
1. Run `npm run catalog` if `docs/catalog.md` drifts.
2. Mark the README status and the done-when list.
3. Add a Summary section to the README: tasks and gates with counts; verdicts before and after; authored counts by
   class (equal, error pair, open); the corpus rows; the rows left open, each with its end.
4. **Name the CI risk.** Read the latest PR run for the slowest shard (`.claude/memory/ci-test-durations-from-blobs.md`).
5. Write `.claude/memory/lsp-status.md` with its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md`
   that #134 ran.
6. Commit `docs(lsp): close out`, and record the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0, and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked, with its evidence in the journal.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
