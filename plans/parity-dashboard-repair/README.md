# parity-dashboard-repair (pdg)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then
[decisions.md](decisions.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #108. Planned unattended on 2026-11-03 at main `34bbfa41b`.

## Objective

Make `docs/parity-report.md` tell the truth, because every later queue issue
reads it. Show every ratchet and diff-baseline that exists, gate new golden
families so none is silently dropped, repair the census so it agrees with the
ratchets, re-run survey, census and DOT parity for all 28 buckets, and correct
the hand-written notes. **No engine changes: nothing under `src/` moves.**

## Starting state, measured 2026-11-03 on `34bbfa41b`

| Finding | Evidence | Task |
|---|---|---|
| gantt shows `no ratchet`; 254 pins, 11 diff-baselines (Σ 154) | `RATCHET_FAMILY` omits it | T1 |
| files shows `no ratchet`; 9 pins | same map | T1 |
| unknown shows 15 pins; really 160 | 145 more are `type: unknown` in `svg-description/ratchet.json`, which is not read for that row. **Not in the issue.** | T1 |
| census `type` is `yaml+tests/oracle/...json` in every committed file | census.ts:399 keeps the `--json` value as a type | T2 |
| sequence census would read 1141 against 1143 pins | census omits `sequenceFixtureOptions()`: `tifube-59` uses `%filename()`, `fifasu-62` a remote `<img:` | T2 |
| gantt census would read 253 against 254 pins | `sakibi-88` has a recorded clock; the `description` fallthrough drops it (640 diffs) | T2 |
| census exists for 11 of 28 buckets; 8 date from 09-20 | `census-*.json` | T4 |
| `unknown` note says 260; measured 253; 102 drawn imperfectly, not 109 | trial survey | T3 |
| activity note stale; measured 449/0/0 (`bozido-07` now conformant) | trial survey | T4, T5 |
| `PARITY-SVG.md` last generated 2026-09-20 | its `Generated:` line | T4 |

Trial survey of every bucket: **zero conformant losses, only activity moves
per-type**, `parity.json` catches up by 5 rows, DOT rows unchanged (date only),
no accepted divergence becomes retirable. A different result at T4 is a finding.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already
checked out by the driver. T0 commits this brief. One unsigned commit per task, in
the **main checkout, serially, no worktrees** (D7). Do not create another branch or
merge main into this one. The squash batch collapses the mission to **one commit**
on the mission base sha named in the execution prompt, and tags `pdg/pre-squash`.
Never push: the user reviews, signs and opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog`
(drift-gated). A `vitest run <paths>` that collects nothing exits 0: read the count.

## Measurement commands

- Survey: bare `npm run svg:survey` does all 28 plus `parity.json`. A positional
  type with no `--out` overwrites `parity.json`: always pass `-- <type> --out <path>`.
- DOT: `npx tsx scripts/dot-sync-report.ts --json tests/oracle/svg-conformance/dot-parity.json`.
- Report: `npm run svg:dashboard`, then `npm run parity:dashboard`.
- `plans/parity-dashboard-repair/measurements/`: `census-all.mjs`, `verdict-diff.mjs`,
  `pins-vs-census.mjs`, `check-fresh.mjs`. Run them with `node`; each states its usage.
  Tested against the trial data at planning time. Type commands literally: the
  allowlist has no entry for `bash plans/...`, `date`, or shell-variable prefixes.
- Producers run **alone**: nothing else on the box, `uptime` below ~10.
- `oracle/goldens/svg-conformance/` (routing, refusal) and
  `tests/oracle/svg-conformance/` (survey, census, DOT) are different directories.

## Stop conditions (halt, journal, report)

1. Any change under `src/` looks necessary. That is an engine change, out of scope.
2. A conformant row leaves conformant at T4 (`verdict-diff.mjs` reports a loss), or
   any `timeout`/`errored` verdict survives one rerun alone at load below 8.
3. A ratchet pin reads nonzero in the census after T2 and you cannot state the
   mechanism with `file:line`. Never drop or re-pin a row to make it agree.
4. Any golden needs re-pinning (`oracle/goldens/**`): this mission reads pins only.
5. `oracle/accepted-divergences.json` needs an edit or a new entry (the user signs).
6. A note would need a new divergence, or a claim you cannot back with jar output
   or a Java quote: write "not yet diagnosed", and stop only if a ruling is needed.
7. A file outside the task's write-set needs changing; the same gate fails on 2
   consecutive fix attempts; a finding contradicts D1–D7 (amend `decisions.md`
   with the date, then halt).

## Push-forward (decide, journal, continue)

- Survey or census counts differing from the trial when no row is lost: commit
  what was measured, and record the difference with its mechanism.
- Helper splits forced by the 500-line, CCN or NLOC hooks in the census or dashboard.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Rewording a note the audit disproves, or removing a dead note entry.
- Filing observations in `.agent-notes/`, including ones that belong to later issues
  (#109, #115, #119). Do not edit those issues or fix them here.
- Regenerating `docs/catalog.md` when exports change.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — branch](batch-0/overview.md) | T0 | [x] |
| [1 — repair the inputs](batch-1/overview.md) | T1, T2, T3 | [x] |
| [2 — measure](batch-2/overview.md) | T4 | [x] |
| [3 — correct the notes](batch-3/overview.md) | T5 | [x] |
| [exit](batch-exit/overview.md) | T6 | [x] |
| [squash](batch-squash/overview.md) | T7 | [x] |

## Done when (issue #108)

- [x] Every bucket's existing ratchet and diff-baseline golden is shown, with a test
      that fails if a new `oracle/goldens/svg-*` family is left unmapped. (T1, journal 2:
      gantt 254 / 11·154, files 9, unknown 160; `unmappedGoldenFamilies` gate test.)
- [x] No survey or census is older than this mission (`check-fresh.mjs`), and each
      row's note matches its measured numbers (`measurements/note-audit.md`). (Journal 11:
      58 files, stale none, missing none; T5 audit, 4 corrected, 0 blank verdicts.)
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` pass. (Journal 5, 8,
      10, 11: green at every batch close and at exit.)

## Documents

- [decisions.md](decisions.md) — D1–D7, operational readiness.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this
brief and is byte-identical to the live `.claude/settings.json`. It was deliberately not
regenerated, because editing it would break that identity (D7).

## Summary (2026-11-03, close-out)

- **Tasks:** 8 of 8 planned (T0–T7). Batches 0–3 and exit closed with all four gates green
  each time; the squash batch collapses the branch to one commit on `5af7b138b`.
- **Decisions:** D1–D7 held unchanged; 12 journal rows, 2 push-forwards (`helperFor` as a
  lookup table instead of a split, journal 3; note rewording, journal 9). None flagged for
  review. One user ruling is *suggested*, not needed: c4 `gikaju-64-bari602` is a jar error
  page the port draws (`.agent-notes/pdg-T5.md`).
- **Gates:** `npm test` 1921 files / 38215 tests, coverage 97.28 / 93.11 / 98.05; typecheck,
  lint, build exit 0 (journal 5, 8, 10, 11). `git diff --stat 5af7b138b HEAD -- src/` empty.
- **Measured vs trial:** identical row for row (T4 table); zero conformant losses, zero
  timeout/errored; `parity.json` caught up 5 rows; DOT rows unchanged.
- **Findings for later issues** (`.agent-notes/pdg-T4.md`, `pdg-T5.md`): old census files were
  pre-ratchet (activity 0/372, sequence 0/1141); mindmap 137 pins / 139 zero-diff; object 35/64
  (#115); oracle > corpus for files and json; `PARITY-SVG.md`'s preamble repeats the stale
  render-path sentence (`scripts/svg-parity-dashboard.ts`, outside this mission's write-set).
- **Not done:** the T6 status memory. The autonomous profile denies writes under
  `~/.claude/projects/.../memory/`, so this README summary and the squash commit body are the
  durable record; the user can file the memory from an interactive session.
