# Exit

| ID | Description | Agent | Writes | Depends On | Done |
|---|---|---|---|---|---|
| T5 | Verify the done-when list, then close out | orchestrator | surveys, report, notes, README status, memory, planning docs | T4 | [x] |

## T5

`<base>` is the mission base sha named in the execution prompt. Producers run alone, with `uptime` below ~10.

```sh
npm run svg:survey
node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>
node plans/git-engine-port/measurements/git-rows.mjs tests/oracle/svg-conformance
npx jiti plans/git-engine-port/measurements/pin-git.mts
npm run svg:dashboard
npm run parity:dashboard
git diff <base> HEAD -- oracle/accepted-divergences.json   # must be empty
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- `dist/*.d.ts` is unchanged against the base, or the change is journaled. `pin-git.mts` must print `pins 0`.
- The generated `unknown` sentence (`unknownDetail`) moves on its own; check it no longer counts GIT.
- Every row left non-conformant is on the git row table (D9) or on its `needs-ruling` issue.
- Planning documents:
  - `planning/mission-guide.md`: replace "Phase 5a — Git Graph" with "Phase 5a — Git log — DONE (git-engine-port,
    #131)". Describe what `gitlog/` does (the D1 note) and drop the Mermaid `gitGraph` watch-outs.
  - `planning/roadmap.md`: item 11 reads "Git graph (`@startgitgraph`) — lane layout". Both the tag and the layout are
    wrong. Correct it to `@startgit` and strike it through, with the result.
  - `planning/next-missions.md`: add a `git-engine-port (gip)` section, with any follow-ons.
  - `docs-site/guide/why-no-smetana.md`: if it lists `@startgit` as unbuilt, update it.
  - `CLAUDE.md` says "`@startgit` (`SmetanaForGit`, unbuilt)". Changing it is the user's call, so leave it, and name it
    in the #131 comment.

Comment on #131 with the outcome, and on #136 with the counts and any new issue. Each new issue also gets its "Blocked
by" line on #136. If `gh issue comment` is denied, do not work around it: leave the text in `.agent-notes/gip-T5.md`.

Then close out:
1. Update `docs/catalog.md` if it drifts (`npm run catalog`).
2. Mark the README status and the done-when list.
3. Add a Summary section: tasks, gates with counts, verdicts before and after, authored counts, and the rows left with
   their ends.
4. **Name the CI risk.** Read the latest PR run for the slowest shard and the routing/refusal part times
   (`.claude/memory/ci-test-durations-from-blobs.md`), and state what the `figagi-40` ratchet test adds.
5. Write `.claude/memory/gip-status.md` with its `MEMORY.md` line, and note in `.claude/memory/parity-issue-queue.md`
   that #131 ran.
6. Commit `docs(gip): close out`, recording the close sha in the journal.

## Acceptance
- Given the commands above, then each exits 0 and the accepted-divergences diff is empty.
- Given the README, then every done-when box is ticked with its evidence in the journal.

Observability: N/A — no new observable operations. Rollback: Reversible.
