# Task contract (every task)

1. Start: `git status` clean, on `chore/rename-plantuml-engine`, and the previous task's commit is HEAD.
2. Find occurrences with `git grep -nIE "plantuml-ts|plantuml_ts|PlantumlTs|PlantUmlTs|PLANTUML_TS" -- <paths>`.
   Edit each by reading the line, not by blind `sed` across the repo: the right replacement depends on the role.
   | Role | Replacement |
   |---|---|
   | npm name / import specifier | `@knowvah/plantuml-engine` |
   | project name in prose | `plantuml-engine` |
   | GitHub URL | `https://github.com/knowvah/plantuml-engine` |
   | local path | `~/git/knowvah/plantuml-engine` |
   | dist filename | `plantuml-engine.{js,cjs,d.ts}` |
   | identifier | D1 spelling |
3. Remove the task's swept paths from `PENDING` in `tests/architecture/legacy-name.test.ts`.
4. Run the task's targeted tests, then the full gate set when the task says so. Re-run `npm run catalog` when a
   `src/` docstring changes and the catalog drift test is red.
5. Do not touch D2/D3 records (see `decisions.md`); an apparent need is STOP 3.
6. Commit: Conventional Commits, ≤72-char subject, `chore(rename): …`, a body when >3 files, footer
   `Refs: #173`, then the `Co-Authored-By:` trailer from the session. Unsigned. Never push.
7. Append one journal row: task, commit sha, commands run with exit codes and counts, any write-set growth and why.

Observability for every task: N/A — no new observable operations; the ratchet test is the standing signal.
Rollback for every task: Reversible (revert the commit).
