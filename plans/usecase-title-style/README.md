# usecase-title-style (uts)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #148 (from #114, `c4-divergence-drive` T2a). Planned unattended on 2026-11-16 at
`feature/parity-queue` `c1bad5104`.

## Objective

`skinparam titleBorderColor red` / `titleBorderThickness 2` strokes a usecase ellipse `#F00` at 2 in the jar. We draw it
`#181818` at 0.5. The issue's leads are confirmed at planning:

- `GeneralImageBuilder.java:169-175` builds `EntityImageDescription` for `USECASE` and `USECASE_BUSINESS`. The
  `new EntityImageUseCase(...)` lines are commented out, and nothing else in `src/main/java/net/` constructs it: the
  class is dead upstream.
- `EntityImageDescription.java:142-153` signs `styleTitle` as `{root, element, componentDiagram, <symbol SNames>,
  title}` and merges it on `getEntity().getCurrentStyleBuilder()` (`Entity.java:755-763`: the entity's own builder,
  or the diagram's last one when `isSkinParamUsed()`). `forecolor`, `backcolor`, `roundCorner`, `deltaShadow`, `stroke`
  all come from `styleTitle` (`:160-171`). A bare `title` style (`FromSkinparamToStyle.java:166-169`) matches it.
- Ours models usecase on the dead class, in two places in
  `src/diagrams/description/description-entity-style.ts`:
  - `descriptionEntityStyle` sets `title = style` for a usecase (`:161-164`, citing `EntityImageUseCase.java:202-209`);
  - `annotateEntityStyles` reads a usecase from the diagram's last builder (`:212-215`, citing
    `EntityImageUseCase.java:198`).
- The renderer already reads `entityStyle.title` for every symbol (`renderer-entity.ts:157-233`). No renderer change
  is expected.

This mission:

1. moves the 6 planning probes into an authored gate, all `OPEN` (batch 1, T1a);
2. ports the `EntityImageDescription` reading for usecase, with its unit test, and moves the rows to `ZERO` (T1b);
3. re-measures every engine and closes out (exit, squash).

## Starting state, measured 2026-11-16 on `c1bad5104`

`npx tsx plans/usecase-title-style/measurements/measure-uts.mts /tmp/uts-t0.json` prints **rows 6 zero 0 open 6
error 0**:

| Probe | Diffs | Ours → jar | Mechanism |
|---|---|---|---|
| `skin-title` (the issue's fixture) | 2 | `U` stroke `#181818`/0.5 → `#F00`/2 | signature lacks `title` |
| `style-title` (`<style> title { }` form) | 2 | same | signature lacks `title` |
| `skin-title-business` (`(U)`, `(B)/`, `titleBackgroundColor`) | 8 | both ellipses `#F1F1F1`, `#181818`/0.5 → `#FEE`, `#F00`/2 | signature lacks `title` |
| `skin-title-stereo` (`BorderColor<<S>>`) | 3 | width 0.5 → 2 on both usecases; `V` stroke → `#F00` | signature lacks `title` |
| `style-usecase-title` (`usecase { title { } }`) | 8 | default → `#EFE`, `#00F`/3 | signature lacks `title` |
| `style-after-usecase` (`<style>` after `usecase U`, no skinparam) | 2 | ours `#EEF`/`#00F` → jar default | last builder, not the entity's |

**Planning experiment (reverted, not committed):** dropping both `isUsecase` special cases took all 6 probes to 0
diffs. `npm run svg:survey -- usecase|component --out /tmp/…` moved no verdict (usecase 93 conformant + 1
oracle-error, component 276 conformant). The 80 description test files (1264 tests) passed. The unknown bucket and the
full `npm test` were not run with the patch; T1b runs them.

- **Pre-flight at planning (2026-11-16, `c1bad5104`):** `npm test -- --maxWorkers=4` 2285 files passed (1 skipped),
  48986 tests, coverage 96.95/92.52/97.43/97.98; `npm run lint` 0. `typecheck`, `build` and `format:check` first run in
  T0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `usecase-title-style/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Survey moves change `docs/parity-report.md`: run
  `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/usecase-title-style/measurements/measure-uts.mts [out.json] [extra.puml...]` (reads
  `measurements/probes/` and, from T1a on, `tests/fixtures/usecase-title-style/`). One line per row: name, diff count,
  first diff, then every `<ellipse>`'s `fill/style` in ours and in the jar.
- **One engine:** `npm run svg:survey -- usecase --out tests/oracle/svg-conformance/parity-usecase.json` (same for
  `component`, `unknown`, `c4`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Ratchets:** `npx vitest run tests/oracle/svg-conformance/description.golden.ratchet.test.ts` and
  `description.diff-baseline.ratchet.test.ts`; read the count.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete the
  `svek-N.dot` files it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D4. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D4).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A residual on a probe that is a different mechanism from D1 (D2, "separable"): measure it, file a `queue:ready` +
  `parity` issue with the measurement and `file:line`, move the row to `OPEN` naming it, continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Authoring extra probes on the same reading, each with its oracle, joining the gate: a usecase with `#back:`/`#line:`
  colours under `skinparam titleBorderColor` (`eventuallyOverride(colors)`, `EntityImageDescription.java:153`), a
  `skinparam usecaseBorderColor` beside the title skinparams (which wins), `titleBorderRoundCorner`, a usecase inside a
  `rectangle { }`, a `usecase` in an `@startuml` with `allowmixing`.
- Correcting comments in `src/` that cite `EntityImageUseCase` as live (`layout-dot-tree.ts:189-191`,
  `layout-helpers.ts:248-250`) to `EntityImageDescription`. `DecorateEntityImage.ts:267` lists Java files a ported
  generic method covers; leave it.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. `DescriptionEntityStyle` keeps its shape; only the `title` value for a usecase and the
  builder it merges on change. `dist/*.d.ts` must not move (D4).
- **Dependencies:** nothing new.
- **Behaviour:** every usecase / business usecase in a description diagram now reads `{…, usecase, title}` on the
  entity's builder. A style block declared *after* a usecase no longer reaches it unless a `skinparam` appears anywhere
  (`Entity.java:761-762`). The planning experiment moved no usecase or component verdict.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/usecase-title-style/*.{puml,svg}` | Create (moved from `measurements/probes/`) | T1a |
| `tests/oracle/svg-conformance/usecase-title-style.authored.test.ts` | Create | T1a; rows move to `ZERO` in T1b |
| `src/diagrams/description/description-entity-style.ts` | Modify | T1b |
| `tests/unit/description/description-entity-style.test.ts` (or the existing test that covers `descriptionEntityStyle`) | Create or modify | T1b |
| `src/diagrams/description/layout-dot-tree.ts`, `layout-helpers.ts` (comments only) | Modify | T1b, push-forward |
| `tests/oracle/svg-conformance/parity-*.json`, `census-*.json`, `docs/parity-report.md`, `planning/next-missions.md` | Modify | batch closes, T2 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate, port](batch-1/overview.md) | T1a, T1b | [x] |
| [exit](batch-exit/overview.md) | T2 | [x] |
| [squash](batch-squash/overview.md) | T3 | [x] |

## Done when (issue #148)

- [ ] `skin-title` (the issue's fixture) and `style-title` (its `<style> title { }` form) compare clean with their
      oracles, pinned in the authored gate. The other 4 probes are at 0 or on a filed issue (D2).
- [ ] No new divergence. `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged.
- [ ] 0 conformant losses in every engine, baseline survey against final survey. `docs/parity-report.md` regenerated.
- [ ] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D4, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-uts.mts` and `probes/` (6 `.puml` + jar `.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook compares it with
the live `.claude/settings.json`.

## Summary (2026-11-16)

**Tasks:** T0, T1a, T1b, T2 done (4 of 4 before the squash). One commit per task, plus a batch-close commit for batches
0 and 1; the history is on `usecase-title-style/pre-squash`. 12 journal rows before the squash; none flagged for a
ruling.

**Gates (exit, journal row 10):** `npm test` 2287 files / 49003 passed, coverage 96.95/92.52/97.43/97.98; typecheck,
lint, build, format:check 0. Every batch close ran the full set; none failed.

**Verdicts, base `c1bad5104` → exit:** no verdict or diff count moved in any survey file (only `generatedAt`).
`verdict-diff`: 0 lost, 0 timeout or errored. Description ratchets 758 passed.

**Probes:** at the start, 6 rows, 0 at zero. At exit, 12 rows (6 push-forward probes authored on the same reading),
11 at zero. The open row `skin-title-allowmixing` (61, unchanged from the base) is the class engine's own path: #195.

**Mechanism:** `GeneralImageBuilder.java:169-175` builds `EntityImageDescription` for `USECASE`/`USECASE_BUSINESS`, so a
usecase signs `styleTitle` with `title` (`EntityImageDescription.java:142-153`) on the entity's builder
(`Entity.java:755-767`). `description-entity-style.ts` dropped its two `EntityImageUseCase` special cases (`isUsecase`
removed). No renderer change was needed.

**d.ts:** byte-identical to the T0 snapshot. `DIVERGENCES.md` and `oracle/accepted-divergences.json` unchanged (D4).

**Follow-ons:** #195; `planning/next-missions.md`, section "usecase-title-style (uts)". Census note (journal row 8):
the committed `census-unknown.json` is stale (measured at `028c79c9c`); 2 error-page rows read higher there,
unrelated to this mission.

**CI risk:** 12 more renders in the authored gate and 3 unit tests, under 1 s locally.
