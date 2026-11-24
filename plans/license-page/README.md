# license-page (lic)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #179 ("License: the license page describes plantuml-engine, not the PlantUML jar"), with
the user's ruling of 2026-11-12 in its body and two comments (2026-11-13 scope widening, 2026-11-18 themes note).
Planned unattended on 2026-11-24 at `feature/parity-queue` `7f7e14cbe`.

## Objective

Make the `license` page (`@startuml` / `license` / `@enduml`, and the `licence` and `LICENSE` spellings) print the
text the ruling fixes, in upstream's order, through upstream's `License` structure (`header1`, `header2`, `end3`,
`addMit`). Then sign the three changed rows in `oracle/accepted-divergences.json` and add a `DIVERGENCES.md` entry.

Upstream line numbers below are at the pinned checkout `~/git/knowvah/plantuml` (re-pinned in PR #269). The issue's
own citations are one line early in places (`addMit` is `:243`, not `:242`); the table uses the pinned lines.

The ruling has seven items. Each becomes one block of `src/diagrams/version/License.ts`:

| # | Ruling item | Upstream lines it replaces | Our lines today |
|---|---|---|---|
| 1 | header and copyright | `License.java:115-119` (free header), `:132-136` (copyright, project info) | `License.ts:221`, `:41`, `:233` |
| 2 | donation lines dropped | `:138-151` (support block, qrcode line, `""`/`" "` pair) | `:44-54`, `:234-238` |
| 3 | MIT first line | `:243` (`addMit`) | `:59` |
| 4 | advertising paragraph dropped | `:191-196` | `:83-89`, `:246` |
| 5 | images paragraph, SVG only | `:199-206` | `:248-255` |
| 6 | GraphViz lines | `:218-225` (both arms + `(see …graphviz-dot )`) | `:106-119`, `:261` |
| 7 | third-party credits | `:227-236` | `:118-132` |

**Two parts depend on facts at execution time, not on a decision here:**

- **The ELK credit line.** The ruling says: "If elk-engine hasn't replaced elkjs when this issue runs, file a
  `needs-ruling` issue rather than crediting an engine we don't ship." At planning, `package.json:85` depends on
  `"elkjs": "0.12.1"` and nothing depends on `@knowvah/elk-engine` (#265, adopting it, is still `queue:ready`). T1
  checks again and follows the ruling either way (D4).
- **The copyright year.** The ruling's header text says `Ported from PlantUML, (C) Copyright 2009-2024, Arnaud
  Roques`. The pinned jar prints `2009-2027` (`License.java:133`, re-pinned in PR #269). T1 prints the ruling's text
  verbatim, and T3's issue comment asks the user whether to keep 2024 (D2).

## Starting state, read 2026-11-24 on `7f7e14cbe`

- `License.ts` is the MIT edition of upstream (D13 of `utility-factories-port`): 71 lines on the NONE licence page
  (`tests/unit/version/License.test.ts:173`).
- The only caller of `getText1`/`getText2` is `PSystemLicense.ts:86-88`. `getTextFull` has no caller in `src/`.
  `about` and `version` read only `License#toString()` ("MIT"), which does not change.
- Authored rows (`oracle/goldens/svg-utility/authored-baseline.json`, measured 2026-10-14 at `650f08bcc`):
  `cov-license`, `cov-licence`, `cov-license-upper` each 87 diffs, weighted score 145, `status: baseline`, no ledger
  entry. `cov-refuse-license` (7 / 7) is the sequence error page and must not move.
- `tests/unit/core/PlainStringsDiagram.test.ts` pins the **jar's** lines in its own `LICENSE_LINES` constant. It does
  not read `License.ts` and must not change.
- Every credit the ruling keeps or adds is shipped: `katex` (`src/core/latex.ts`), `pako`
  (`src/core/klimt/sprite/png-encoder.ts`), `@xmldom/xmldom` (`src/core/klimt/sprite/sax/sax-events.ts`), and the
  `package.json:84-87` dependencies.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt, and
  tags `license-page/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- A changed export needs `npm run catalog` (drift-gated by `tests/architecture/catalog.test.ts`).
- Never write under `src/`, `tests/`, `docs/`, `oracle/` or `plans/` while a gate is running.
- The complexity hook blocks a file over 500 lines or a function over 30 NLOC.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Version unit tests:** `npx vitest run tests/unit/version`; read the count.
- **Authored utility rows:** `npx vitest run tests/oracle/svg-conformance/utility.diff-baseline.ratchet.test.ts`.
- **Authored baseline:** `npx jiti plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts
  <commit>` (dry run), then the same with `--write`.
- **Ledger gates:** `npx vitest run tests/oracle/svg-conformance/emitter.golden.test.ts
  tests/architecture/divergences-ledger.test.ts`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles** (only if one must be re-rendered): `scripts/oracle-render.sh <absolute-out-dir> <absolute-puml>`, **one
  file per run** (the `FlashCodeUtilsZxing` lock race, `oracle/goldens/svg-utility/README.md:44`).

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A jar oracle (`tests/fixtures/utility/cov-licen*.svg`) would have to be re-captured or removed. The jar's page does
   not change in this mission; only ours does.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D7. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change or a new dependency.
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, `~/git/graphviz` or `~/git/knowvah/plantuml`.

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- The ELK condition (D4): file the `needs-ruling` issue, omit the line, journal it, continue.
- A wording question the ruling does not settle (D2, D5, D6): keep the ruling's text, put the question in T3's issue
  comment, continue.

## Push-forward (decide, journal, continue)

- Keep upstream's `header2(text, licenseInfo, withQrcode)` signature although the body no longer reads `withQrcode`
  (D3); name the unused parameter as lint requires and say why in its JSDoc.
- Delete line tables nothing reads any more (`SUPPORT_US`, `QRCODES`, `SPONSORED`, `ARCHIVE`, `IGY`); grep first.
- Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none public. `License`, `LicenseBuild` and `ORACLE_BUILD` are not exported from
  `src/index.ts`. `LicenseBuild` loses `isThereArchive` (D3). `dist/*.d.ts` must not move.
- **Dependencies:** nothing new.
- **Behaviour:** only the `license` page text. The page gets shorter (no qrcode row, no donation or advertising
  lines), so its size and every line's y change. `about`, `version`, `keygen` and the rest are unchanged.

| File | Action | Task |
|---|---|---|
| `src/diagrams/version/License.ts` | Modify | T1 |
| `tests/unit/version/License.test.ts`, `tests/unit/version/PSystemLicense.test.ts` | Modify | T1 |
| `src/diagrams/version/PSystemLicense.ts` (header doc only, if it describes the qrcode row) | Modify | T1 |
| `plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts` (`cov-license` reason) | Modify | T2a |
| `oracle/goldens/svg-utility/authored-baseline.json` (three license rows) | Modify | T2a |
| `oracle/accepted-divergences.json`, `DIVERGENCES.md` | Modify | T2b |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: the page text](batch-1/overview.md) | T1 | [x] |
| [2: rows and accounting](batch-2/overview.md) | T2a, T2b | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #179)

- [x] The page prints exactly the ruling's text, in upstream's order, with every line the ruling does not list
      unchanged (`License.test.ts` asserts the full NONE-licence line list).
- [x] The ELK line follows D4: credited only if `@knowvah/elk-engine` has replaced `elkjs`; otherwise omitted and a
      `needs-ruling` issue filed.
- [x] `DIVERGENCES.md` has an entry for the `license` page, "kept by user ruling (2026-11-12)", quoting the upstream
      lines each change replaces.
- [x] `cov-license`, `cov-licence` and `cov-license-upper` are signed in `oracle/accepted-divergences.json` against
      the ruling, and no other row's verdict moves: `verdict-diff.mjs <base>` reports 0 lost in every engine.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass.

## Documents

- [decisions.md](decisions.md): D1 to D7, operational readiness, auto-confirmed decisions, pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx jiti`, `npx vitest`, `npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the
SessionStart hook compares it with the live `.claude/settings.json`.

## Mission summary (2026-11-24)

**Tasks:** 5 of 5 planned (T0, T1, T2a, T2b, T3), then the T4 squash. Pre-squash commits (tag
`license-page/pre-squash`): `c3f8cfd11` brief, `c9d02c804` batch 0 close, `50bf68248` T1, `8b52f6e92` T2a,
`338e8e32c` T2b, `4e899040e` T1 fix (typecheck), `70d7341b8` batches 1+2 close, then the T3 commit.

**Rows:** `cov-license`, `cov-licence`, `cov-license-upper` went from 87 diffs / weighted 145 (`status: baseline`, D13
reason) to 159 / 188, re-pinned with the ruling's reason and signed in `oracle/accepted-divergences.json`
(`authored-utility/<slug>`, accepted 2026-11-12 by the user). `cov-refuse-license` is unchanged. `verdict-diff.mjs
7f7e14cbe`: 0 lost in every engine. The page is 581 x 767, 63 lines, no image.

**Decisions flagged for review:**
- D4: the ELK line is omitted (`elkjs` 0.12.1 still ships, #265 open) and **#282** filed (`needs-ruling`, `parity`).
- D2 (2024 vs 2027), D5 (added credits after Twemoji), D6 (Themes line) and the wording-by-Claude lines are asked on
  #179 (`issue-comment.md`).
- Journal row 8: batch 1's close folded into batch 2's, because the authored ratchet inside `npm test` stays red
  until T2a re-pins.
- Journal row 7: `PSystemLicenseFactory.test.ts`, outside the write-set, pinned the old page size and copyright line.
- Journal row 9: only the three rows written in `authored-baseline.json`; the tool's 7 -> 5 drift on 19 refuse/noise
  rows is pre-existing (controlled experiment), left for a cleanup (`.agent-notes/vkt-T2a.md`).

**Gates:** batch 0 close and the batches 1+2 close, all green on the second run after one typecheck fix (journal rows
11-12). `dist/*.d.ts` unchanged.

**Follow-ups:** #282 (ELK credit); the answers to the four questions on #179; the stale refuse-row pins in
`build-authored-baseline.mts`.
