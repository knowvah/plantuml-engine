# Batch 2 — the sweep (serial)

Serial, in table order: every task edits `PENDING` in `tests/architecture/legacy-name.test.ts`, and any `src/`
docstring change can drift `docs/catalog.md`. One commit per task. Run each task's targeted tests at the task and
the full gate set at the batch close (T2 and T3 also run the full suite at the task, because they change pinned
output).

| ID | Description | Agent | Writes (plus `PENDING`, `docs/catalog.md` when drifted) | Depends On | Done |
|---|---|---|---|---|---|
| [T2](T2-package-identity.md) | Package name, dist filenames, workspace refs, lockfile | executor | root config, `packages/*/package.json`, demo, docs-site config, stdlib emitters, 4 tests | T1 | [x] |
| [T3](T3-version-string.md) | `plantuml-engine version …` and its pins | executor | `version.ts`, `PSystemVersion.ts`, 3 tests, svg-utility baseline, `DIVERGENCES.md` | T2 | [x] |
| [T4](T4-src-prose-and-messages.md) | Rest of `src/`: prose, message prefixes, Symbol | executor | 15 `src` files, 3 tests | T3 | [x] |
| [T5](T5-scripts-identifiers-reports.md) | `scripts/`, D1 identifiers, generated reports | executor | 13 scripts, 7 tests/helpers, 3 reports | T4 | [x] |
| [T6](T6-test-prose.md) | Remaining test comments | executor | 15 test files | T5 | [x] |
| [T7a](T7a-user-facing-docs.md) | README, RELEASING, CLAUDE, CHANGELOG entry, docs-site, packages docs | executor | ~30 docs | T6 | [x] |
| [T7b](T7b-internal-docs.md) | docs/, oracle README, planning current-state, D2 notes | executor | ~14 docs | T7a | [ ] |

Close: full gate set green; `npm test` file/test counts = T1's close count (only pins changed, no tests added or
removed after T1) — journal any difference.
