# version-key-tools (vkt)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #182 ("Version family: port testdot, keydistributor, keygen, keyimport, keycheck"), with the
maintainer's rulings of 2026-11-13 in its body. Planned unattended on 2026-11-21 at `feature/parity-queue`
`e490366c6`.

## Objective

Claim the five version-family commands upstream's `PSystemVersionFactory` matches and ours does not, and render
upstream's pages adapted to plantuml-engine, as ruled on #182 ("inspired by, not conformant"):

- mirror the line regexes (`PSystemVersionFactory.java:62-87`), the kind of page each one is (a black-on-white
  `GraphicStrings` text list), the header, and the order of the lines;
- make every line true for plantuml-engine, or drop it with a reason (D5);
- sign each diverging row in `oracle/accepted-divergences.json` against the ruling, with one `DIVERGENCES.md` entry.

The four rulings, quoted from the issue body:

> 1. **Inspired by, not conformant.** [...] Every row is an accepted divergence, signed against this ruling.
> 2. **`testdot`: GraphViz maps to `@knowvah/dot-engine`.** [...] renders as `<b>@knowvah/dot-engine</b> ""<version>""`.
> 3. **`testdot`: no "dot too old" branch.** [...] Don't port it as dead code.
> 4. **`testdot`: no file-generation probe.** [...] "Installation seems OK. File generation OK" goes too.

**Upstream has six regexes, not five.** The issue cites `java:62-81`; at the current pin the factory also matches the
one-argument `keycheck <key>` (`PSystemVersionFactory.java:84-87`, upstream `3a4d1675141`). The oracle draws it, so
it is in scope (D1).

## Starting state, read 2026-11-21 on `e490366c6`

- `src/diagrams/version/PSystemVersionFactory.ts:44-49` matches `authors?|about`, `version` and `stdlib` only. The
  five commands fall through: no factory claims them, so each source draws the sequence `Syntax Error?` page.
- No corpus row or `~/git/pdiff` file uses any of the five commands (grep at planning). The rows this mission
  signs are authored fixtures under `tests/fixtures/utility/`, tracked by
  `oracle/goldens/svg-utility/authored-baseline.json` (D6).
- `@knowvah/dot-engine` 2.12.3 still exports no runtime version (`dist/index.d.ts`; `exports` has no
  `./package.json`), as `.agent-notes/ufp-T3d.md` found at 2.3.0 (D4).
- Jar oracle lines, rendered at planning with `scripts/oracle-render.sh`, one file per run: see
  [decisions.md#d5](decisions.md#d5-line-by-line-text-auto-confirmed-for-maintainer-review).

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `version-key-tools/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New modules and exports need `npm run catalog` (drift-gated by `tests/architecture/catalog.test.ts`).
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Version unit tests:** `npx vitest run tests/unit/version`; read the count.
- **Authored utility rows:** `npx vitest run tests/oracle/svg-conformance/utility.diff-baseline.ratchet.test.ts`.
- **Authored baseline:** `npx jiti plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts
  <commit>` (dry run), then with `--write`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <absolute-puml>`, **one file per run** (the
  `FlashCodeUtilsZxing` lock race, `oracle/goldens/svg-utility/README.md`). Delete any `svek-N.dot` it leaves.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D8. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D8).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A D5 line text you would word differently. D5's texts are proposals for the maintainer's morning review; keep them
  unless one is untrue, and then journal the correction with the evidence.
- `keydistributor` measuring 0 diffs: it is conformant, so it gets no ledger entry (D6). Journal it.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Author more fixtures where a regex branch has no row (case, trailing whitespace, a refused near-miss such as
  `keycheck a-b`). Render each oracle one file per run.
- If the existing `version` page and the new `testdot` page disagree in a way the rulings do not settle, leave
  `version` as it is (D7) and add the question to the T3 issue comment.
- Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. No new export from `src/index.ts`; `dist/*.d.ts` must not move (D8).
- **Dependencies:** nothing new. `DOT_ENGINE_VERSION` is drift-pinned to the installed `@knowvah/dot-engine` (D4).
- **Behaviour:** six one-line sources that drew a `Syntax Error?` page now draw a version-family page. No corpus row
  uses them. `version`, `about`, `stdlib` and `license` are unchanged.

| File | Action | Task |
|---|---|---|
| `src/core/version.ts` (`DOT_ENGINE_VERSION`), `tests/unit/core/version.test.ts` | Modify | T1a |
| `src/diagrams/version/PSystemVersionFactory.ts` (regexes, header JSDoc) | Modify | T1a, T1b, T1c |
| `src/diagrams/version/PSystemVersion.ts` (`createTestDot`, `createKeyDistributor`, header JSDoc) | Modify | T1a |
| `src/diagrams/version/PSystemKeygen.ts` | Create | T1b |
| `src/diagrams/version/PSystemKeycheck.ts` | Create | T1c |
| `tests/unit/version/{PSystemVersion,PSystemVersionFactory,PSystemKeygen,PSystemKeycheck}.test.ts` | Modify / Create | T1a-T1c |
| `src/diagrams/version/LicenseInfo.ts`, `src/core/utils/SignatureUtils.ts` (D8 comments), `docs/catalog.md` | Modify | T1d |
| `tests/fixtures/utility/cov-{testdot,keydistributor,keygen,keyimport,keycheck}*.{puml,svg}` | Create | T2a |
| `plans/utility-factories-port/measurements/T3-cov/build-authored-baseline.mts`, `oracle/goldens/svg-utility/authored-baseline.json` | Modify | T2a |
| `oracle/accepted-divergences.json`, `DIVERGENCES.md` | Modify | T2b |
| `planning/next-missions.md` | Modify | T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: the six commands](batch-1/overview.md) | T1a, T1b, T1c, T1d | [x] |
| [2: rows and accounting](batch-2/overview.md) | T2a, T2b | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #182)

- [x] All five commands (six regexes) render our page, each with a unit test asserting its lines.
- [x] `DIVERGENCES.md` has one entry for the five, citing the 2026-11-13 rulings.
- [x] Each diverging authored row is signed in `oracle/accepted-divergences.json` (D6).
- [x] The D8 comments say what is true now (`PSystemVersionFactory.ts:8`, `PSystemVersion.ts:19-20` and `:166`,
      `LicenseInfo.ts:15`, `SignatureUtils.ts:4`).
- [x] No other row's verdict moves: `verdict-diff.mjs <base>` reports 0 lost in every engine.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D8, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx jiti`, `npx vitest`, `npm`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated, because
the SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-21)

**Tasks:** all 9 done (T0, T1a-T1d, T2a, T2b, T3, T4). Batches 0, 1, 2 and
exit closed (`a84b6033e`, `01738d37a`, `3fbbc5f1b`, `166903941`). The per-task history is on
`version-key-tools/pre-squash`. 17 journal rows; none is open, and no stop condition fired.

**Decisions taken during execution** (journal rows 4-13): the brief's PSystemKeygen/PSystemKeycheck line citations
were 35 lines off (GPL header), so the code cites the real lines; `createKeyDistributor` does not call
`retrieveDistributor()` (D3: no dead `else`); the error-page detectors were fixed at the shared primitive (row 11, a
diagnosis); only the new rows were inserted into `authored-baseline.json` (row 12); the source comments' placeholder
DIVERGENCES heading was corrected (row 13). Flagged for review: the D5 texts (see `issue-comment.md`) and the D7
question.

**Gates (exit, final tree):** `npm test -- --maxWorkers=4` 2338 files (1 skipped) / 50682 passed, 6 expected fail,
coverage 96.99/92.57/97.48/98.03; typecheck, lint, build and format:check 0.

**Verdicts, base `e490366c6` → exit:** lost 0, timeout or errored 0 in every engine (`verdict-diff.mjs`). The survey ran
at batch 2's close on `4ad883ef0`, whose `src/ tests/ scripts/ oracle/ docs/` tree equals the final one; every
`parity-*.json` moved only `generatedAt`. `docs/parity-report.md` unchanged.

**The rows** (authored, `oracle/goldens/svg-utility/authored-baseline.json`):

| slug | diffs | weighted | verdict |
|---|---|---|---|
| `cov-testdot`, `cov-testdot-upper-trailing` | 23 | 29 | signed, ruling 1 |
| `cov-keydistributor` | 0 | 0 | conformant, no ledger entry (D6) |
| `cov-keygen`, `cov-keyimport`, `cov-keyimport-key` | 23 | 28 | signed, ruling 1 |
| `cov-keycheck`, `cov-keycheck-one-arg` | 9 | 9 | signed, ruling 1 |
| `cov-keycheck-refuse-dash`, `cov-keyimport-refuse-dash` | 5 | 5 | jar errors + we error (2026-10-10 rule) |

The ledger diff against the base adds exactly seven `authored-utility/*` entries and retires none.

**d.ts:** byte-identical to the T0 snapshot (D8).

**Follow-ons:** the D7 question for #182 (`issue-comment.md`, not posted: the execution prompt did not ask for it);
`build-authored-baseline.mts` SPECS and three stale error-row pins (`.agent-notes/vkt-T2a.md`). See
`planning/next-missions.md`, section "version-key-tools (vkt)". No issue filed: no question blocked a row.

**CI risk:** low. New unit tests and ten authored rows (each rendered three times by the ratchet); seven test/script
error-page detectors now call one helper, re-run in full (`refusal-coverage` parts, factories and utility ratchets,
`pin-corpus-tree-measure` test: 889 passed). `version.test.ts` fails on a dot-engine bump that forgets
`DOT_ENGINE_VERSION`, by design.
