# Decisions — parity-dashboard-repair

## Auto-confirmed (unattended)

Planned with `/plan-mission --unattended #108`. Nobody reviewed these. Each records
the rejected options and the evidence so the user can audit it.

### D1 — A bucket maps to a list of golden families

`RATCHET_FAMILY` and `DIFF_BASELINE_FAMILY` become `Record<string, readonly string[]>`.
Add gantt and files. `unknown` reads `['svg-utility', 'svg-description']`; counts sum,
the date is the newest. `ratchetPinsOf` keeps its filter rule per family.

- **Evidence:** `svg-description/ratchet.json` holds 145 `type: unknown` rows and
  `svg-utility` 15, with no slug overlap, and all 160 read zero in a trial census.
  The row shows 15. The issue names gantt and files, but its done-when ("every ratchet
  and diff-baseline golden that exists is shown") covers this too.
- **Rejected:** only adding gantt and files, which leaves `unknown` understated by 145
  for #113 and #119. Inverting the map to family→types, which needs more rewriting and
  still has to split `svg-description` by row.

### D2 — The guard is an explicit allowlist, not a "has a ratchet.json" test

`NON_BUCKET_FAMILIES` maps `svg-conformance`, `svg-skin` and `svg-lengthadjust` to a
reason. `unmappedGoldenFamilies(goldensDir)` returns every `svg-*` directory in neither
map nor the allowlist, every family with a `ratchet.json` absent from `RATCHET_FAMILY`
and every family with a `diff-baseline.json` absent from `DIFF_BASELINE_FAMILY` (each
unless allowlisted). The test asserts `[]` on the real directory and catches a planted
family in a temp directory.

- **Evidence:** `svg-skin` has a ratchet and no bucket; `svg-lengthadjust` holds only an
  authored baseline; `svg-conformance` holds routing and refusal.
- **Rejected:** a check on ratchet files alone, which misses a family that starts with
  only a diff-baseline or authored baseline, as `svg-lengthadjust` did.

### D3 — Census every bucket with the existing tool; repair only measured disagreements

Run all 28 buckets, committing `census-<type>.json` for each. Fix three things: the
`--json` value counted as a type, `sequenceFixtureOptions()` for sequence, and a gantt
helper with the recorded clock. Leave every other fallthrough to the `description`
helper as it is.

- **Evidence:** a trial census of all 28 ran with no code change. Pinned rows not
  reading zero: gantt 1, sequence 2, every other family 0. The fallthrough is plain
  `renderSync` through `renderFixtureSurveyStyle`, and its rows agree with their ratchets.
- **Evidence for no-engine buckets:** the issue says "every bucket". The matrix still
  shows `n/a (no engine (Dn todo))` and chronology `n/a (plantuml-ts only)` for them,
  whatever the file holds, so committing their census changes no cell, and the port
  issues (#124–#128) start from a dated file.
- **Rejected:** a dedicated helper for each engine, which is a refactor with no measured
  defect behind it. Treating census as optional for newer engines, which contradicts
  the issue.

### D4 — The `unknown` note is generated; the other notes stay prose and are audited

The `unknown` sentence is built from the survey rows and each row's cached
`data-diagram-type`. A tag counts as "we draw it" when its lowercase form is in
`registeredEngines`. All other notes stay hand-written, each backed by evidence in
`measurements/note-audit.md`.

- **Evidence:** the trial tally is 253: DESCRIPTION 79, NWDIAG 64, none 49, ACTIVITY 17,
  TIMING 13, BPM 7, HELP 7, unsupported 6, GIT 4, CLASS 2, HCL 2, FLOW 1, STATE 1,
  SEQUENCE 1. That splits into 102 drawn, 96 no engine, 49 untagged and 6 declined, which
  is the note's existing split with 109 corrected to 102. The dashboard already reads the
  committed cache (`jarUnsupportedCountsOf`), so D2 of parity-dashboard-refresh holds.
- **Rejected:** correcting the numbers by hand, which would go stale at the next survey,
  since #113, #119 and #124 all move this row and nothing gates prose. A guard test on a
  hand-written number, which fails on every correct re-survey and forces a prose edit.

### D5 — Pins are not measurements: routing, refusal, ratchet and diff-baseline stay put

Re-measure survey, census and DOT parity only. Nothing under `oracle/goldens/` is
re-pinned, and `npm test` re-verifies those gates on each run. The Freshness section
gains a sentence saying which columns are measurement dates and which are pin dates.

- **Evidence:** the issue scopes "survey and census", and its fresh-date bar names only
  those. Routing dates back to 2026-08-23 while the gate stays green daily. DOT is added
  because the issue title says "every measurement"; a trial changed its date and no row.
- **Rejected:** re-pinning everything so dates look fresh. Pins move only when a fixture
  changes, and a re-pin can silently raise a red row
  (`.agent-notes/sequence-newpage-repin-hazard.md`).

### D6 — Findings are recorded, never fixed here

A defect the fresh numbers reveal goes in `.agent-notes/` and the final report. Known
already, for the record: object has 35 pins against 64 census zero-diff rows (#115);
files and json show oracle above corpus (9/8, 50/49). Neither blocks this mission.

- **Evidence:** the issue says "No engine changes: every later issue reads these numbers."
- **Rejected:** pinning object's 29 extra rows here, which is the work of #115.

### D7 — Serial in the main checkout, one commit per task, squash per batch

**Amended 2026-11-03 by the user:** every queue mission stacks on one branch, `feature/parity-queue`,
and collapses to one commit. That replaces the mission branch and squash per batch below.

T1, T2, T3 and T5 all need `docs/parity-report.md` or a shared test seam, so nothing can
run in parallel without collapsing anyway. Keep the existing autonomous profile.

- **Evidence:** the D9 drift gate fails unless each report-changing commit regenerates
  the report. Two parallel branches would conflict on that file. The survey is
  load-sensitive and must run alone.
- **Rejected:** worktrees and parallel agents, which cost more for a size:S mission and
  add the known stdlib-symlink and Serena hazards.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: developer tooling and a static docs page, no runtime operation. The D9 drift test and the new D2 guard are the signals. |
| Traces and dashboards | N/A. `docs/parity-report.md` is itself the dashboard being repaired. |
| Rollback | **Reversible.** Revert the branch; the JSON artifacts and report revert with it. No migration. |
| Scale | N/A. Regeneration stays sub-second; a full refresh takes about 25 min, developer-run. |
| Likely failures | Survey under load writes `timeout` verdicts: detected by `verdict-diff.mjs`; rerun alone. A report not regenerated: D9 test red; run `npm run parity:dashboard`. A new golden family: guard test red; map it or allowlist it with a reason. |
| Compatibility | No published API changes. `census-<type>.json` keeps its keys, and `type` becomes the plain bucket name (no reader uses that field). The report is a generated page. |
