# T1 — legacy-name ratchet test

**Context.** D4. Follow the house style of the existing fitness functions in `tests/architecture/` (read
`tests/architecture/packages-peer-range.test.ts` and one other for how they read repo files). Tests may use Node
built-ins; only `src/` is browser-only.

**Task.** Create `tests/architecture/legacy-name.test.ts`:
- `LEGACY = /plantuml-ts|plantuml_ts|PlantumlTs|PlantUmlTs|PLANTUML_TS/`.
- `ALLOWED_PREFIXES: readonly string[]` — entries ending `/` are directory prefixes, others exact paths. Exactly:
  `plans/`, `.agent-notes/`, `docs/graphviz-issues/`, `docs/upstream-plantuml-issues/`, `oracle/patches/`,
  `CHANGELOG.md`, `code-review-tasks.md`, `planning/mission-index.md`, `planning/next-missions.md`,
  `planning/mission-a2-class/`, `planning/mission-a3-class-superset/`, `planning/mission-desc-routed/`,
  `planning/mission-render-fidelity/`, `oracle/accepted-divergences.json`, `tests/architecture/legacy-name.test.ts`.
  Each entry carries a one-line comment naming its decision (D2 / D3 / self).
- `PENDING: readonly string[]` — every other tracked text file that matches today. Compute it, don't copy it:
  [pending-at-planning.txt](pending-at-planning.txt) (132 paths) is the planning-time list for comparison only;
  T0 removed nothing from it except the `.pyc` (binary, never listed).
- File list from `git ls-files -z` (via `execFileSync`); skip binary files (a NUL byte in the first 8 KiB) and
  `ALLOWED` paths before reading.
- Tests: (a) no matching file outside `ALLOWED ∪ PENDING` — the failure message lists each offending path with its
  first matching line number; (b) every `PENDING` entry still matches — failure message "stale PENDING entry: <path>";
  (c) no `PENDING` entry is also under `ALLOWED`.

**Write-set.** `tests/architecture/legacy-name.test.ts`.
**Read-set.** `tests/architecture/packages-peer-range.test.ts`; `decisions.md#d2`, `#d4`.

**Interface contract (consumed by T2–T8).** `PENDING` is a sorted array literal of repo-relative paths, one per line,
so each task's removal is a clean line deletion. T8 deletes the constant and assertion (b)/(c).

**Acceptance criteria.**
- Given a scratch file containing `plantuml-ts` outside both lists (test it by temporarily adding one, then delete
  it), when the test runs, then it fails naming that path.
- Given a `PENDING` entry whose file no longer matches, when the test runs, then it fails with
  "stale PENDING entry".
- Given today's tree, when it runs, then it passes, and `PENDING.length` equals the planning list's 132 (or the
  journal explains the difference).
- Given the full suite, then it adds ≤2 s wall (one `git ls-files`, ~3,000 small reads after the prefix filter).

Observability: N/A — no new observable operations. Rollback: Reversible.
