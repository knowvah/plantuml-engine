# png-bounder-seam (pbs)

**Read first, every start and after every compaction:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. This file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. The current batch's `overview.md`

Tail [decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #170, which carries the maintainer ruling of 2026-11-11 (option 3). Planned unattended on 2026-11-17
at `feature/parity-queue` `44420271f`.

## Objective

Make the oracle's PNG string bounder deterministic as **oracle seam #5**, built in a `/tmp` clone of `~/git/plantuml`
and recorded as `oracle/patches/0005-oracle-png-bounder.patch` with `seamCommitCount: 5`.
- Re-capture every oracle and prove that only rows reaching `FileFormat.PNG`'s bounder move (D1, D7).
- Make the port follow: the rollback atom is sized by its PNG export (D5), and wire `print` uses the mode-following PNG
  bounder (D3, D4).
- Take #170's rows to conformant, or to their already-named divergences only.

## Starting state, read at planning on `44420271f`

- The jar lays out a `<math>`/`<latex>` rollback by its **PNG** export's size (`AtomMath.java:63-70` →
  `ScientificEquationSafe.java:116-129` → `TextBlockExporter#createUGraphicPNG`, `(int) dim`, `:335-346`). PNG's bounder
  is `new StringBounderAwt()` (`FileFormat.java:272`), outside seam #2's `this == SVG || this == SVG_DETERMINISTIC` arm
  (`FileFormat.java:185-186`).
- The port sizes the rollback by its SVG document (`src/core/klimt/creole/atom/AtomMath.ts:127-134`). Each rollback line
  is 1 px short; a wide one is narrower.
- `WireDiagram#print` also uses the PNG bounder (`WireDiagram.java:133`). The port mirrors AWT there with `jarMeasurer`,
  always (`src/diagrams/wire/WireDiagram.ts:56-70`, wire-engine-port D3).
- `oracle/dist/plantuml-oracle.jar` md5 `7066a3b4e28e696791a4bfc617efd85f` is seam #4 (`eb0f3cff7df`).
  `~/git/plantuml` is on `dot-output` at `eb0f3cff7df`, 4 seam commits on `97a5992201a`.

| Row (#170) | Rollbacks | Other mechanism (stays) |
|---|---|---|
| `unknown/cunotu-47-bute165` | 1 | none |
| `unknown/marese-34-xaro137` | 7 | none |
| `unknown/pecafo-64-rili177` | 3 | none |
| `unknown/vocalo-20-dixu237` | 1 | none |
| `unknown/xanuke-94-tope429` | 1 | none |
| `unknown/kebadi-11-fula439` | 1 | `\boxempty` KaTeX parse error (`DIVERGENCES.md`) |
| `unknown/rozesu-56-suve592` | 3 | `^`, `_` KaTeX parse errors (`DIVERGENCES.md`) |
| `unknown/roxita-24-tixu731` | 1 (sets canvas width 356) | JLaTeXMath shared `SymbolAtom` state, image 34 (`DIVERGENCES.md`) |

**No authored fixture has a creole rollback.** Planning decoded every committed oracle's `<image>` payloads: an exact
rollback document (`measurements/classify-movers.mjs`'s `ROLLBACK_DOCUMENT`) appears in exactly these 8 rows. The
authored `cov-math-unknown`/`cov-latex-unknown` are standalone `@startmath`/`@startlatex`, which export through
`getSvg` (`ScientificEquationSafe.java:145-151`) and never reach the PNG bounder. T2c authors creole rollback fixtures.

## Branch

`feature/parity-queue` is already checked out. T0 commits this brief.
- One unsigned commit per task, in the **main checkout**, serially, with no worktrees.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and
  tags `png-bounder-seam/pre-squash`.
- Never push, and never write `~/git/plantuml` (D8).

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

Use `npm test`, never `vitest run tests/unit`. New exports need `npm run catalog`, which is drift-gated. Stay on graphviz
16.1.0 (`dot -V`).

## Measurement commands

The tools are in `plans/png-bounder-seam/measurements/`. Type commands literally: the allowlist has no
`oracle/build-oracle.sh`, no `java` and no env-var prefixes, which is why these `node` wrappers exist. Producers run
**alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- **Build:** `node plans/png-bounder-seam/measurements/build-seam5.mjs` runs `oracle/build-oracle.sh` with
  `PLANTUML_FORK=/tmp/plantuml-seam5` and writes `/tmp/pbs-jar/plantuml-seam5.jar`. It restores the reference jar in
  `oracle/dist` byte for byte, and exits 1 if it cannot.
- **Re-capture:** `node plans/png-bounder-seam/measurements/recapture.mjs -- <recapture-oracles args>` runs
  `scripts/recapture-oracles.ts` with `PLANTUML_FORK` set for the `--write` drift guard.
- **Chunk coverage:** `npx jiti plans/png-bounder-seam/measurements/manifest-count.mts '<glob>' ...` prints targets per
  `--only` chunk, and exits 0 only if the chunks cover the 16,783-target manifest exactly once.
- **Classify:** `node plans/png-bounder-seam/measurements/classify-movers.mjs <report.json> [--json out.json]` sorts each
  CHANGED row into `rollback`, `wire-print` or `unexpected`, and exits 1 on `unexpected` or FAILED.
- **Scratch render:** `node plans/png-bounder-seam/measurements/render-seam5.mjs <absolute-out-dir> <puml...> [--jar path]`
  renders through the seam-5 jar with `oracle-render.sh`'s flags and keeps the svg. It does not touch
  `oracle/capture-clock.json`. With `--jar oracle/dist/plantuml-oracle.jar` it reproduced `cov-math-unknown.svg` byte for
  byte at planning.
- **Survey:** inside a task, always pass `--out`: `npm run svg:survey -- unknown --out /tmp/pbs-<task>/parity-unknown.json`
  (likewise `wire`, `class`, `sequence`, `state`). A positional type with no `--out` clobbers `parity.json`. Only batch
  close runs the bare survey, which rewrites the tracked surveys.
- **Losses:** `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> [/tmp/pbs-<task>]` exits 1 on
  a row that left conformant and lists every moved row. `<base>` is the mission base sha, and the directory defaults to the
  tracked surveys.
- **Oracle renders:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. D7: a stable `unexpected` mover, or a rollback/wire-print row whose diff reaches past what the PNG bounder sizes.
2. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
3. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
4. The same gate fails on 2 consecutive fix attempts.
5. A finding contradicts D1 to D8: amend `decisions.md` with the date, then halt.
6. Anything would write `~/git/plantuml`, push, or change `oracle/accepted-divergences.json`.

A row that needs a ruling is **not** a stop: put it on a `needs-ruling` issue naming the row, and finish everything else. A
file outside a task's write-set is not a stop either: change it and journal why. If the gradle build cannot run (offline,
missing JDK), the environment is the problem: journal it and halt as blocked. Do not work around it.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that share a mechanism, or splitting one that runs past about 15 minutes.
- Re-rendering a suspected-noise row more times before calling it stable.
- Authoring `cov-*.puml` fixtures (`tests/fixtures/factories/`, `tests/fixtures/wire/`) where a branch has no row: a rollback
  in a wire `print`, `<math>` inside a note, a bold rich-text `print`.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.

## Blast radius

- **Data model:** none.
- **API:** no public change; `RenderOptions` untouched (D3).
- **Oracle:** `oracle/pin.json`, a new patch, and re-captured bytes for PNG-bounder rows only (D7).
- **Dependencies:** none added.
- **SVG output:** conformance-mode output changes for rollback atoms and wire `print`. In production, rollback sizing
  follows the AWT PNG export (D5) and wire is unchanged.

| File | Action | Task |
|---|---|---|
| `/tmp/plantuml-seam5` (clone, `FileFormat.java`) | Create (outside repo) | T1a |
| `oracle/patches/0005-oracle-png-bounder.patch`, `oracle/pin.json`, `oracle/README.md` | Create, Modify | T1a |
| oracle bytes under `test-results/dot-cache/**`, `oracle/goldens/svg-*/**`, `tests/fixtures/**/*.svg` (movers only) | Modify | T2a |
| `src/core/png-string-bounder.ts` | Create | T2b |
| `src/diagrams/wire/WireDiagram.ts`, `WireDiagramFactory.ts`, `index.ts` | Modify | T2b |
| `src/core/klimt/creole/atom/AtomMath.ts`, `src/core/math/ScientificEquationSafe.ts` | Modify | T2c |
| `tests/unit/core/png-string-bounder.test.ts`, `tests/unit/wire/**`, `tests/unit/factories/rollback.test.ts`, `tests/unit/core/klimt/creole/atom/AtomMath.test.ts` | Create, Modify | T2b, T2c |
| ratchet baselines (`oracle/goldens/svg-factories/diff-baseline.json` and any other a row leaves) | Modify | T3 |
| `DIVERGENCES.md`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `planning/mission-guide.md`, `docs/catalog.md`, `.claude/memory/*` | Modify | T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — seam #5 and verification](batch-1/overview.md) | T1a, T1b | [x] |
| [2 — oracle bytes and the port](batch-2/overview.md) | T2a, T2b, T2c | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #170, option 3)

- [x] Seam #5 is committed in `/tmp/plantuml-seam5`, `0005-oracle-png-bounder.patch` is recorded, and
  `pin.json#seamCommitCount` is 5.
- [x] A full `--verify` re-capture moved only `rollback` and `wire-print` rows (D7). The classifier output is saved under
  `measurements/`.
- [x] `cunotu`, `marese`, `pecafo`, `vocalo` and `xanuke` are conformant. `kebadi`, `rozesu` and `roxita` diverge only by
  their named `DIVERGENCES.md` mechanisms. Every wire row and fixture that was at 0 is still at 0.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] `DIVERGENCES.md`'s "Not a divergence: rollback atoms are sized by the PNG export" paragraph says resolved, and
  `docs/parity-report.md` is regenerated.
- [x] #170 has a comment with the two fork hand-off commands (D8). `npm test`, `npm run typecheck`, `npm run lint` and
  `npm run build` pass.

## Baseline

Phase 8, 2026-11-17, on `44420271f`: see [decision-journal.md](decision-journal.md) row 0.

## Documents

- [decisions.md](decisions.md): D1 to D8, operational readiness.
- [task-contract.md](task-contract.md): what every task does and how it closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): the five tools above.

**Settings:** `.claude/settings.autonomous.json` covers every command here (`node`, `npx jiti`, `npm`, `git`,
`scripts/oracle-render.sh`, `gh issue`). It was deliberately not regenerated: the SessionStart hook compares it with the live
`.claude/settings.json`.

## Summary

- **Tasks:** T0, T1a, T1b, T2a, T2b, T2c, T3 done as planned; T4 squashes. One gate-fix commit (`2befcf793`,
  `isw-measurer` fitness test). Reordered: `pin.json` before the T1a build (journal row 2).
- **Verdicts:** cunotu, marese, pecafo, vocalo, xanuke `structural-match -> conformant`, pinned in `svg-factories`
  (21 -> 26). kebadi, rozesu, roxita keep only their named mechanisms (roxita 7 -> 1, rozesu 51 -> 10). Wire 18/18;
  every authored wire fixture that was at 0 is at 0. Full survey: 0 lost in every engine.
- **Decisions:** D1-D8 held. Judgment calls journaled: the mode signal is `StringBounder#getFileFormat` rather than
  T2c's literal `measurerOf` route (row 7); the class-note rollback gap filed as #210 rather than fixed here (row 7);
  the final survey is close-b2's, since T3 changed no rendering code (row 9).
- **Gates:** `npm test`, `typecheck`, `lint`, `build`, `format:check` green at every batch close and at exit.
- **Follow-ups:** apply patch 0005 to the fork (#170 comment); #210.
