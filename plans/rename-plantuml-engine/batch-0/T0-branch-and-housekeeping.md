# T0 — branch, brief, housekeeping

**Context.** Nothing in the repo imports `scripts/__pycache__/compile-themes.cpython-313.pyc`; it is a CPython
byte-cache of `scripts/compile-themes.py` committed by accident, and it carries the old name as bytes.

**Task.**
1. Verify P0: `git remote get-url origin` ends `knowvah/plantuml-engine.git`; `git rev-parse main origin/main`
   agree. If not, STOP 6.
2. `git switch -c chore/rename-plantuml-engine origin/main`.
3. Run the baseline gates (README) and journal the counts (files, tests, coverage) — later tasks compare test
   counts against them.
4. Commit the brief: `chore(rename): mission brief for the plantuml-engine rename`.
5. `git rm --cached -r scripts/__pycache__` (delete the file too), add `__pycache__/` to `.gitignore` (check it is
   not already covered by `git check-ignore -v scripts/__pycache__/x.pyc`). Commit:
   `chore(scripts): stop tracking the python byte-cache`.

**Write-set.** `.gitignore`; `scripts/__pycache__/compile-themes.cpython-313.pyc` (delete);
`plans/rename-plantuml-engine/**` (journal).
**Read-set.** `.gitignore`; `git grep -n compile-themes` (confirm nothing loads the `.pyc`).

**Acceptance criteria.**
- Given `main` = `origin/main`, when T0 runs, then `chore/rename-plantuml-engine` exists off it and the journal
  records baseline gate exit codes and counts.
- Given the tracked `.pyc`, when T0 commits, then `git ls-files '*__pycache__*'` is empty and
  `git check-ignore scripts/__pycache__/a.pyc` matches.

Observability: N/A — no new observable operations. Rollback: Reversible.
