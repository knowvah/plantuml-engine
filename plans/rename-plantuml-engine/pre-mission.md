# P0 (before execution) and post-mission steps

Interactive, with the user. Not executed by the autonomous run (D6).

## P0 — before the brief runs

| # | Step | Check |
|---|---|---|
| 1 | `git remote set-url origin https://github.com/knowvah/plantuml-engine.git` | `git remote -v` shows the new URL; `git fetch` exits 0 |
| 2 | `git switch main && git pull --ff-only` | `git rev-parse main` = `git rev-parse origin/main` |
| 3 | Install [settings.autonomous.json](settings.autonomous.json) into `.claude/settings.autonomous.json` and `.claude/settings.json` (identical today) | `autoMemoryDirectory` = `/Users/scottseely/git/knowvah/plantuml-engine/.claude/memory` in both |
| 4 | `.claude/skills/issue-queue/SKILL.md`, `.claude/tools/{rulings-page.mts,report.test.mjs,driver_realgit.sh,driver_smoke.sh}`: absolute paths → `plantuml-engine`; prose name → `plantuml-engine` | `grep -rn plantuml-ts .claude --exclude-dir=memory --exclude-dir=mission-logs` is empty |
| 5 | The 23 `.claude/memory/*.md` files: change only mentions of the **path** or the **repo URL** (issue scope); leave the name in prose and file slugs | `grep -rnE "knowvah/plantuml-ts" .claude/memory` is empty |
| 6 | `rm -r ~/git/knowvah/plantuml-ts` (holds only an empty `.claude/memory/`, re-created by step 3's stale key) | directory gone |
| 7 | Restart the Claude Code session from `~/git/knowvah/plantuml-engine` | memory loads from the new path |

Then: `~/.claude/hooks/autonomous-toggle.sh on .` and execute this brief.

## Post-mission — the user

1. `~/.claude/settings.json:403` (path-keyed `npm run visual:upload` rule) and `:410` (repo-visibility note):
   `plantuml-ts` → `plantuml-engine`.
2. `~/.claude/hooks/complexity-ignore:16-26`: the globs name `~/git/plantuml-ts/…` and
   `~/git/knowvah/plantuml-ts/…`. After the move they no longer exempt `src/core/math/*` and
   `src/diagrams/class/class-notes.ts`.
3. Review the branch, sign the commits, push, open the PR with `plans/rename-plantuml-engine/pr-body.md`.
4. After merge: `git grep -n "plantuml-ts" -- ':!plans' ':!.agent-notes'` shows only `ALLOWED` paths.

Out of scope (other repos; GitHub redirects their links): plantuml-plugins' README clone URL, dot-engine docs.
