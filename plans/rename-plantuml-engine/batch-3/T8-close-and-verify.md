# T8 — close the ratchet and verify

**Task.**
1. `PENDING` must be empty. Delete the constant and its two assertions; keep the `ALLOWED` assertion.
2. Clean verification, in order, each exit code journaled:
   `rm -rf node_modules dist && npm ci` · `npm test -- --maxWorkers=4` · `npm run typecheck` · `npm run lint` ·
   `npm run build` · `npm run format:check` · `npm run catalog` (no drift) · `npm run docs:build` ·
   `npm run test:e2e` · `npm pack --dry-run`.
3. Post-check from the issue: `git grep -n "plantuml-ts" -- ':!plans' ':!.agent-notes'` — every hit is under an
   `ALLOWED` prefix (journal the per-prefix counts).
4. Draft `plans/rename-plantuml-engine/pr-body.md`:
   - title `chore: rename plantuml-ts to plantuml-engine`;
   - summary, decisions D1–D6 (one line each), the version-string pins that moved (from T3's journal);
   - **size justification**: ~520 changed lines, over the 400-line guideline — one mechanical rename, split by
     commit per surface, reviewable commit by commit;
   - **for the user after merge**: the post-mission steps in `pre-mission.md`;
   - `Closes #173`;
   - last line: `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
5. Memory: a `rpe-status.md` entry in `.claude/memory/` (one fact: mission done, branch, close sha, not pushed) and
   its `MEMORY.md` line. This is the one `.claude/` write the mission makes; P0 owns everything else there.
6. Commit `chore(rename): close the legacy-name ratchet`. Do not push.

**Write-set.** `tests/architecture/legacy-name.test.ts`; `docs/catalog.md` if drifted; `pr-body.md`;
`decision-journal.md`; `README.md` batch table; `.claude/memory/rpe-status.md` + `MEMORY.md`.

**Acceptance criteria.**
- Given `PENDING` removed, when the full suite runs, then it is green.
- Given the clean `npm ci` and every command in step 2, then all exit 0.
- Given the post-check grep, then every hit is under `ALLOWED`.
- Given `pr-body.md`, then it justifies the size, lists the user's post-mission steps, and ends with the
  attribution line.

Observability: N/A — no new observable operations. Rollback: Reversible.
