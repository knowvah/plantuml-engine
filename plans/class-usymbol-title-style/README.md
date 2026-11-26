# class-usymbol-title-style (cuts)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #195, found by the usecase-title-style mission (#148) as a push-forward probe.
Planned unattended on 2026-11-25 at `feature/parity-queue` `15ed8340b`.

## Objective

In a class diagram with `allowmixing`, `skinparam titleBorderColor red` / `titleBorderThickness 2` strokes a usecase
and an actor `#F00` at 2 in the jar. We draw `#181818` at 0.5, and the leaves are sized for the thinner stroke
(`skin-title-allowmixing`, 61 diffs, pinned `OPEN` in `usecase-title-style.authored.test.ts`). Make the class engine
read these leaves' styles as the jar does.

The issue's leads, confirmed at planning:

- `GeneralImageBuilder.java:162-180` builds `EntityImageDescription` for `CIRCLE`, `DESCRIPTION`, `USECASE` and
  `USECASE_BUSINESS`, whatever the diagram. So every mixed-in description leaf of a class diagram is one: usecase,
  actor, component, database, rectangle, node, cloud, circle. The issue names two; the planning probes show the same
  gap on all of them.
- `EntityImageDescription.java:142-151` merges `styleTitle`, `{root, element, classDiagram, <symbol SNames>, title}`
  with the stereotype, on `getEntity().getCurrentStyleBuilder()` (`Entity.java:760-772`), then
  `eventuallyOverride(colors)`. `forecolor` (`:159`), `backcolor` (`:161-163`), `deltaShadow` (`:167`) and `stroke`
  (`:168`) come from it, and the `Fashion` built from them (`:177`) also sizes the leaf.
- `skinparam title*` becomes a bare `title` style (`FromSkinparamToStyle.java:166-169`), which matches that
  signature.

**Our mechanism (found at planning; quote it again before you change it):**

| | Where | What |
|---|---|---|
| M1 | `src/diagrams/class/renderer-usymbol-entity-style.ts#resolveForecolor` (`:169-183`), `#resolveStroke` (`:192-203`), `#resolveBackcolor` (`:121-135`) | Read flat `theme.colors.elements` tiers. They have no surface for a bare `title` style, and no notion of the entity's builder, so a `<style>` after the leaf wrongly reaches it (`style-after`). |
| M2 | `class-layout-leaf-shapes.ts:65` (usecase/actor), `class-layout-generic-classifier.ts:92` (other leaves) | The sizer passes no `entitySizing.thickness`, so `measureEntityLeaf` (`leaf-sizing-entity.ts:187-190,263`) sizes for the default stroke. |
| M3 | `class-layout-leaf-shapes.ts:117-120` | An actor's ink walk (`measureUsecaseOrActorLeafInk`) measures the default stroke too. |

The description engine already reads the merged style for the same image (`description-entity-style.ts`, done for
usecase by #148). The class engine already has the seam: `services.styleBuilder(generation)` and
`Classifier.styleGeneration`.

## Starting state, measured 2026-11-25 on `15ed8340b`

`npx tsx plans/hidden-note-host/measurements/measure.mts plans/class-usymbol-title-style/measurements/probes` prints
**rows 20 zero 5 open 15 throw 0**. Full table: [measurements/plan-baseline.txt](measurements/plan-baseline.txt).
Every probe has its oracle from `scripts/oracle-render.sh`; none is an error page.

| Rows | Today | Expected owner |
|---|---|---|
| `component` 8, `database` 4, `rectangle` 2, `node-cloud` 10, `diagram-title` 2, `style-usecase-title` 1 | stroke colour/width | T2 |
| `title-back` 6 (`titleBackgroundColor` fill), `inline-back` 3 (bare `#pink` must still win) | fill, stroke | T2 |
| `style-after` 3 (`<style>` after the leaf; the jar keeps the default) | ours takes the late style | T2 |
| `issue` 61 (= uts `skin-title-allowmixing`), `style-title` 57, `usecase-border` 59, `business` 71 | stroke + size | T2 + T3 |
| `stereo` 88 | stroke, then 85 diffs of stereotype sizing with no title skinparam | T2, then filed (D2) |
| `title-shadow` 6 | no shadow drawn; size half is #260 | T2 push-forward, then #260 |
| `ctl-plain`, `title-font`, `embed-class`, `embed-desc`, `embed-group` | 0 diffs | must stay 0 |

**Planning experiment** (reverted; decisions.md D1 "Evidence" and "Trap"): the D1 reads took 12 of the first 17 probes
to 0. The plain-actor rows were left 1–1.5 px low (M3). The class survey with the patch lost no conformant row except
through the module-state trap, which the `embed-*` rows now guard.

**Found at planning, separable (D2), filed at exit:**
- `usecase U <<S>>` in a class diagram is sized wrong with no title skinparam at all (85 diffs).
- The jar refuses `usecase U #line:blue` (and `actor`/`component`, `#line.dashed`, `#pink;line:blue`, `##blue`) in a
  class diagram with `No such color` (`CommandCreateElementFull2.java:289-292`). The port draws them.

**Corpus.** No class corpus row has a `title*` skinparam with a description leaf. The class survey and verdict-diff
guard the rest: 872 conformant + 2 structural-match at base.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `class-usymbol-title-style/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `plans/` while a gate is running.
- The complexity hook blocks a file over 500 lines or a function over 30 NLOC. Put the annotator in its own small
  module. `class-geo-builders.ts` (493) and `class-layout-generic-classifier.ts` (481) are **close**: add at most the
  field copy and the one thickness read there, or move a helper out first. `class-layout-leaf-shapes.ts` (440),
  `class-classifier-ast.ts` (403), `renderer-usymbol-entity.ts` (370) and `class/index.ts` (149) have room.
- `npm run svg:survey` takes about 16 minutes at normal load. Run it in the background and wait on a marker in its log.
  At load above ~20 it times out whole worker blocks: rerun with `SVG_PARITY_TIMEOUT_MS=240000
  SVG_PARITY_CONCURRENCY=4` before you call a timeout a finding.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/hidden-note-host/measurements/measure.mts <dir> [out.json]`. Before T1, `<dir>` is
  `plans/class-usymbol-title-style/measurements/probes`; from T1 on it is `tests/fixtures/class-usymbol-title-style`.
- **Gates:** `npx vitest run tests/oracle/svg-conformance/class-usymbol-title-style.authored.test.ts
  tests/oracle/svg-conformance/usecase-title-style.authored.test.ts`; read the count.
- **Engines:** `npm run svg:survey -- class --out tests/oracle/svg-conformance/parity-class.json` (same for `usecase`,
  `component`, `object`, `unknown`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete any
  `svek-N.dot` it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar, and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D4. Examples: the jar draws a class description leaf from a style other than
   `styleTitle`, or a flat tier holds a role the merged style cannot answer on a conformant row and the object-style
   hybrid (D1, rejected options) does not resolve it. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change or a new dependency.
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, elkjs, `~/git/graphviz` or
   `~/git/knowvah/plantuml`. File the finding instead.
7. A row would need a new `DIVERGENCES.md` entry or a signed row in `oracle/accepted-divergences.json`.

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- A unit test that asserts today's flat-tier answer for a mixed-in leaf where the jar differs. Rewrite it to the
  jar's value, and journal each one.
- A residual with a separable mechanism (D2): measure it, file a `queue:ready` + `parity` issue with the measurement
  and `file:line`, give the row that `reason`, and continue.
- A residual only a maintainer can end: file a `needs-ruling` issue with the evidence, name it in the row's `reason`,
  and continue.

## Push-forward (decide, journal, continue)

- Author extra probes for a branch you touch, each with its oracle from `scripts/oracle-render.sh`. Each one joins the
  gate. Candidates:
  - `circle C` and `() "I" as I` under the title skinparams (`LeafType.CIRCLE`, `GeneralImageBuilder.java:162-163`);
  - `hexagon H`, `package P` as an empty leaf, `queue`, `stack` under the title skinparams;
  - `!pragma layout elk` with the issue's source (the ELK adapter calls `buildUSymbolEntityParams` too,
    `class-elk-adapter.ts:200`);
  - `skinparam titleBorderColor<<S>> blue` on a stereotyped usecase;
  - `scale 2` with the issue's source (the stroke is scaled, `theme.scaleK`);
  - `actor/ AB` with `<style> actor { business { LineColor green } }` (`ACTOR_BUSINESS_TITLE`).
- `deltaShadow` from `styleTitle` (T2 step 3).
- Fix what such a probe exposes inside the mission when the fix is under ~20 lines, has a `file:line` origin, and
  moves no conformant row. Journal it. Otherwise file it.
- Rerun a timed-out vitest or survey at lower load before you call the timeout a finding.

## Blast radius

- **Data model / API:** none public. `Classifier` / `ClassifierGeo` (internal) gain one field holding a `Style`.
  `dist/*.d.ts` must not move.
- **Dependencies:** nothing new.
- **Behaviour:** class-diagram description leaves now take their line colour, stroke, fill and size from the merged
  `styleTitle` on the entity's own builder. Rows under `title*` skinparams/styles, a late `<style>`, or element styles
  the flat tiers missed move towards the jar. Nothing else may move; the class survey, the goldens and verdict-diff
  guard it.

| File | Action | Task |
|---|---|---|
| `tests/fixtures/class-usymbol-title-style/*.{puml,svg}` (19 rows + push-forward) | Create | T1 |
| `tests/oracle/svg-conformance/class-usymbol-title-style.authored.test.ts` | Create | T1, T2, T3 |
| `tests/oracle/svg-conformance/usecase-title-style.authored.test.ts` (`skin-title-allowmixing` → `ZERO`) | Modify | T2, T3 |
| `src/diagrams/class/class-usymbol-title-style.ts` (`annotateUSymbolTitleStyles`) | Create | T2 |
| `src/diagrams/description/description-entity-style.ts` (share `symbolSNames`; or move it to `core/decoration/symbol/usymbol-resolve.ts`) | Modify | T2 |
| `src/diagrams/class/index.ts` (`layoutSync`) | Modify | T2 |
| `src/diagrams/class/class-classifier-ast.ts`, `class-geo-types.ts`, `class-geo-builders.ts` (the field and its copy) | Modify | T2 |
| `src/diagrams/class/renderer-usymbol-entity-style.ts`, `renderer-usymbol-entity.ts` (readers; shared predicate) | Modify | T2 |
| `src/diagrams/class/class-layout-leaf-shapes.ts`, `class-layout-generic-classifier.ts` (sizer, actor ink) | Modify | T3 |
| `tests/unit/class/class-usymbol-title-style.test.ts` | Create | T2, T3 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate](batch-1/overview.md) | T1 | [x] |
| [2: port `styleTitle`](batch-2/overview.md) | T2, T3 | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #195)

- [x] `skin-title-allowmixing` (the issue's row) is `ZERO` in the uts gate.
- [x] Every `T2`/`T3` row in the table above is `ZERO`, or `OPEN` with a mechanism (`file:line`) and a filed issue.
- [x] The five controls stay at 0 diffs.
- [x] The two separable findings are filed (or fixed under push-forward), and #136 names them or the #195 comment
      says it could not.
- [x] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass;
      `dist/*.d.ts` unchanged.

## Documents

- [decisions.md](decisions.md): D1 to D4, operational readiness, auto-confirmed decisions, pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `plan-baseline.txt` and `probes/` (20 `.puml` + `jar/*.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `java`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated: the SessionStart hook
compares it with the live `.claude/settings.json`.

## Mission summary (2026-11-25)

**Tasks:** T0-T4 done as planned, plus push-forward (seven extra probes; the `stereo` sizing fixed under the ~20-line
rule instead of filed). T5 squashes. Per-task commits (pre-squash, tag `class-usymbol-title-style/pre-squash`):
`3078694b9` T0 brief, `cb7b289ac` T1 gate, `07ff49d97` T2 draw, `2c3542d34` T3 sizer, `f9277c9de` T3 push-forward
probes, `52f100bbb` batch-2 close, `977a456d5` T4 stereo sizing, then the exit commit.

**Gate:** 19 rows at T1 (5 zero / 14 open) -> 26 rows (24 zero / 2 open). Open: `empty-package` 4 (#297: a
different image, `EntityImageEmptyPackage`), `title-shadow` 4 (#260: canvas omits the shadow; the shadow itself is
drawn now). uts `skin-title-allowmixing` 61 -> ZERO (uts OPEN now empty). Controls `ctl-plain`, `title-font`,
`embed-class`, `embed-desc`, `embed-group` at 0 throughout.

**Every engine:** 0 conformant lost vs `15ed8340b` (class 872 + 2 structural-match unchanged). `dist/*.d.ts`
unchanged. `docs/parity-report.md` / parity JSON moved timestamps only (left at HEAD).

**Decisions to review (journal):** row 8 (field copy via `mergedStyleFields`, outside the write-set), row 11 (three
ratchets raised inside T2, lowered to ZERO by T3), row 13 (usecase/actor sizer and actor ink walk now share one
`LeafSizingSubject`), row 19 (D2's stereotype finding fixed rather than filed).

**Filed:** #296 (class descriptive leaf `name:value` colour refusal), #297 (empty package title style); #136 now
names both. #195 comment posted; it stays open until merge.

**Follow-ups:** #296, #297, #260. `leaf-sizing-entity.ts#measureUsecaseOrActorLeaf`/`...Ink` no longer have a
production caller (tests still use them).
