# chen-eer-engine-port (ceep)

**Read these first, at every start and after every compaction:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

Source: GitHub issue #133. Planned unattended on 2026-11-11 at `feature/parity-queue` `03efe4694`.

## Objective

Port upstream's Chen EER engine, `net/sourceforge/plantuml/cheneer/` (9 files, 964 lines), file for file onto our
`CucaDiagram` base in `src/diagrams/cheneer/` (D1). Draw it through svek with the four `EntityImageChen*` images and the
subset/superset middle decor, ported into `src/core/svek/` (D2). Register it at `PSystemBuilder.java:199` (D3). Then:
- take every authored fixture to an end (D12);
- pin the fixtures in a new `svg-cheneer` ratchet and a DOT-parity gate;
- lose no conformant row in any engine;
- regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-11 on `03efe4694`

- `block-extractor.ts` has no `chen` tag and no plugin registers `CHEN_EER`, so `@startchen` renders
  "Error: unknown diagram type".
- The corpus has **no** `@startchen` row, so every row in scope is authored (D6).
- The model pieces already exist: `LeafType.CHEN_*`, `LinkMiddleDecor.SUBSET`/`SUPERSET`, `LinkType#withMiddleSubset`/
  `withMiddleSuperset`, the `chen*` `SName`s, `TextBlockInEllipse` and `UEllipse` arcs.
- The draw pieces are missing: the four leaf images, `MiddleSubset`, and the `SUBSET`/`SUPERSET` arm of
  `LinkMiddleDecor#getMiddleFactory`.

**48 planning probes** are in [probes/](probes/): 44 `cov-*`/`err-*` sources plus upstream's 4 vega fixtures
(`vega-chen-*.puml`). They were rendered with `scripts/oracle-render.sh` on 2026-11-11, one directory per probe, under
`/tmp/cee-plan/po/<slug>/`.
- 38 draw `CHEN_EER`: 33 through graphviz (one `svek-1.dot` each), 4 with one leaf and no DOT, and `cov-elk` through ELK.
- 10 are error or Welcome pages (D7).
- The jar's output is byte-stable across 4 renders (D6).

**What the jar does.** Planning read the Java for every row below; every task still opens it and finds the line.

| Behaviour | Java | Task |
|---|---|---|
| Factory: common commands 1, `RankDir`, then entity, attribute, associate, end group, simple subclass, multi subclass (first match) | `ChenEerDiagramFactory.java:56-69` | T1a |
| `ChenEerDiagram`: an owner `Stack` (`pushOwner`, `popOwner` returns false when empty, `peekOwner` returns null when empty) | `ChenEerDiagram.java:51-95` | T1a |
| `entity\|relationship ["X" as] CODE [<<st>>] [#back] {` creates or mutes a leaf and pushes the owner; a type clash says "Bad name" | `CommandCreateEntity.java` | T1b |
| An attribute needs an owner. Its id is `owner/code`, a duplicate says "Attribute already exists", it adds a length-2 link to the owner, and `{` pushes it as an owner | `CommandCreateAttribute.java` | T1b |
| `A -[card]- B`, or `=` for bold, is a length-3 link with a cardinality label; an unknown name gives "No such entity" | `CommandAssociate.java` | T1b |
| `A ->- B` is superset and `A -<- B` is subset, length 3 | `CommandSimpleSubclass.java` | T1b |
| `P ->- d\|o\|U { A, B }` makes a 25×25 circle and links; `U` puts the decor on the superclass link, `d`/`o` on the subclass links | `CommandMultiSubclass.java` | T1b |
| Images: a rect with an inner `<<weak>>` rect; a 2:1 diamond with an inner `<<identifying>>` diamond; an ellipse with `<<key>>` underline, `<<multi>>` inner ellipse and `<<derived>>` dash; a 25×25 circle | `svek/image/EntityImageChen*.java` | T2a |
| Middle decor: a half-circle arc of radius 6 plus two lines of length 10, stroke 1.5, rotated by `angle+135` or `angle-45` | `svek/extremity/MiddleSubset.java`, `SvekEdge.java:982-989` | T2b |
| DOT: `nodesep` 35, `ranksep` 60; shapes rect, ellipse and diamond; `minlen` 1 or 2; cardinality `TABLE` labels; `rankdir=LR` | `DotStringFactory.java`, `SvekEdge.java` | T2c |
| A one-leaf diagram skips graphviz | svek short-circuit, found and quoted in T2c | T2c |
| The diagram-level style falls back to `activityDiagram` | `DiagramType.java:234-296` | T2d |
| `!pragma layout elk` lays out through ELK | `CucaDiagramFileMakerElk` | T3d |

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, no worktrees** (D10).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and
  tags `chen-eer-engine-port/pre-squash`.
- Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`.
- New exports need `npm run catalog`, which is drift-gated.
- A `vitest run <paths>` that collects nothing exits 0, so read the count.
- Stay on graphviz 16.1.0 (`dot -V`, `.claude/memory/graphviz-16-1-1-local.md`).

## Baseline

Measured at planning on `03efe4694`, 2026-11-11, at load about 15, on graphviz 16.1.0:
- `npm test -- --maxWorkers=4` exits 0.
  - Files: 2212 passed, 1 skipped.
  - Tests: 47257 passed, 4 expected to fail, 7 skipped, 6 todo.
  - Coverage: statements 97.09%, branches 92.82%, functions 97.68%, lines 98.06%.
- `npm run lint` exits 0.
- Typecheck, build and `format:check` were not run at planning. T0's first batch close is their first run on the base.

## Measurement commands

The tools are in `plans/chen-eer-engine-port/measurements/`, adapted by `sed` from regex's, flow's and laep's (D6 names
each one). Read each before trusting its output, and journal any fix.

**How to run them:**
- Run with `node` or `npx jiti`, and type every command literally. The allowlist has no `bash plans/...`, no `date`
  and no shell-variable prefixes.
- Run producers **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`).
- Never `cd` below the repo root.

**The commands:**
- **Fixtures:** `npx jiti plans/chen-eer-engine-port/measurements/fixtures.mts [slug ...]` prints
  `slug<TAB>diffs<TAB>firstDiff` for every `tests/fixtures/cheneer/<slug>.puml` against its `<slug>.svg`, with error
  pairs counted (D7).
- **Jar stability (D6):** `node plans/chen-eer-engine-port/measurements/jar-variants.mjs /tmp/ceep-<task>/variants 3 <puml...>`.
- **DOT parity:** `npx jiti plans/chen-eer-engine-port/measurements/pin-cheneer-dot.mts --authored /tmp/ceep-dots [--write]`.
  T3b renders each fixture's jar DOT into `/tmp/ceep-dots/<slug>/svek-1.dot`. `planning-rows.json` is empty because no
  corpus row exists.
- **Authored baseline, from T4 on:** `npx jiti plans/chen-eer-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`.
- **Every engine, at batch close from batch 3 on:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 means a loss.
  `verdict-diff` takes a **git ref**: a directory silently yields "lost 0" (`.claude/memory/flp-status.md`).
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Render one
  source per directory when you need its DOT.

`fixtures.mts`, `pin-cheneer-dot.mts` and `build-authored-baseline.mts` import
`tests/oracle/svg-conformance/render-fixture-cheneer.ts`. T4 creates it, and T3a may create it early.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D12. Amend `decisions.md` with the date, then halt. This includes any `dist/*.d.ts`
   change beyond an added type.
5. A fixture's jar output is not byte-stable across renders (D6): an order the port cannot mirror needs a ruling.
6. `@knowvah/dot-engine` needs a change. File it in `docs/graphviz-issues/` and `TRACKER.md`, then carry on with the
   other fixtures. Halt only if nothing else can move.

**These are not stops:**
- A fixture that needs a ruling. It goes on a `needs-ruling` issue that names it, and everything else finishes.
- A file outside a task's write-set. Change it and journal why.

`oracle/accepted-divergences.json` is never edited here.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that share a mechanism, or splitting one that runs past about 15 minutes. T3c is
  expected to split into one task per diff family.
- A residual diff a fix uncovers: read the Java, and fix it in the task that owns it or add a task.
- More authored `.puml` fixtures and oracles where a command branch has no fixture.
- Reusing an existing `src/core/` port in place of a new one, or porting a missing shared helper into `src/core/` at its
  upstream package. Journal which.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D11).
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.
- Fixing an adjacent defect a probe exposes in a shared module, with its Java quote. A gain in another bucket counts for
  that bucket's issue: T5 comments there, or leaves the text in `.agent-notes/` if the comment is denied.
- ELK work that is genuinely large and separable: follow D5.

## Blast radius

- **Data model:** none.
- **API:** no public change. `dist/*.d.ts` is checked at T5. `block-extractor.ts#DiagramType` gains `'chen'`.
- **Dependencies:** nothing new. The engine reaches `@knowvah/dot-engine` through `graph-layout.ts#layoutGraph`, and ELK
  through `src/core/elk/`.
- **Routing:** `@startchen` only (D3).
- **Shared seams:** `GeneralImageBuilder.ts` gains four branches; `LinkMiddleDecor.ts` and `SvekEdge.ts` gain the subset
  arm. No engine draws `SUBSET`/`SUPERSET` today: T2b greps `withMiddleSub`/`withMiddleSuper` callers to prove it.

| File | Action | Task |
|---|---|---|
| `src/diagrams/cheneer/{ChenEerDiagram,ChenEerDiagramFactory,cheneer-skin-param,common-commands-1,index}.ts`, `command/CommandEndGroup.ts` | Create | T1a |
| `src/diagrams/cheneer/command/{CommandCreateEntity,CommandCreateAttribute,CommandAssociate,CommandSimpleSubclass,CommandMultiSubclass}.ts` | Create | T1b |
| `src/core/svek/image/EntityImageChen{Entity,Relationship,Attribute,Circle}.ts`, `src/core/svek/GeneralImageBuilder.ts` | Create, Modify | T2a |
| `src/core/svek/extremity/{MiddleSubset,MiddleFactorySubset}.ts`, `src/core/decoration/LinkMiddleDecor.ts`, `src/core/svek/SvekEdge.ts`, `src/core/svek/extremity/MiddleCircleDecor.ts` | Create, Modify | T2b |
| `src/diagrams/cheneer/{cheneer-dot,layout}.ts` | Create | T2c |
| `src/diagrams/cheneer/renderer*.ts`, `src/core/assemble-svg.ts` | Create, Modify | T2d |
| `src/registered-plugins.ts`, `src/core/block-extractor.ts`, `src/core/dispatcher.ts` (if the type union lives there) | Modify | T3a |
| `tests/fixtures/cheneer/**` | Create | T3b |
| `src/diagrams/cheneer/**`, `src/core/svek/**` | Modify | T3c |
| `src/diagrams/cheneer/cheneer-elk-adapter.ts`, the `requiresElk` hook | Create, Modify | T3d |
| `oracle/goldens/svg-cheneer/**`, `oracle/goldens/cheneer/**`, `tests/oracle/svg-conformance/{cheneer.golden.ratchet.test.ts,cheneer.diff-baseline.ratchet.test.ts,render-fixture-cheneer.ts}`, `tests/oracle/cheneer-dot-parity.test.ts`, `scripts/parity-dashboard-goldens.ts` | Create, Modify | T4 |
| `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `planning/{roadmap,next-missions,mission-guide}.md`, `docs/catalog.md` | Modify | T3a to T5 |
| `tests/unit/cheneer/**`, `tests/unit/core/svek/**` | Create | T1a to T3d |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1: diagram, factory, commands](batch-1/overview.md) | T1a, T1b | [x] |
| [2: images, decor, DOT, renderer](batch-2/overview.md) | T2a, T2b, T2c, T2d | [x] |
| [3: turn on, fixtures, residuals, ELK](batch-3/overview.md) | T3a, T3b, T3c, T3d | [x] |
| [4: ratchet and DOT gate](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #133)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism (D12).
- [x] Every new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling`
  issue.
- [x] 0 conformant losses in every engine, comparing the baseline survey with the final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D12, operational readiness.
- [task-contract.md](task-contract.md): what every task does and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md) and [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/): the 48 planning probe sources.
- [measurements/](measurements/): the tools above.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief: `node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh` and `gh issue`. It was deliberately not regenerated, because the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (T5, 2026-11-12)

**Status: done.** Tasks T0-T5 complete (T3c ran as T3c1+T3c2 merged and T3c3; T4's DOT goldens were written early in
T3c so no unit test reads `/tmp`); T6 squashes. Journal rows 1-22.

**Gates (final, journal row 22):** `npm test -- --maxWorkers=4` exit 0 (2224 files, 47784 tests), typecheck, lint,
build and format:check 0. Two gate failures on the way, each fixed on the first attempt: `utility-registration.test.ts`
(row 17) and `parity-dashboard-goldens.test.ts` (row 19), both pinned lists the new engine extended.

**Verdicts, every engine:** base `03efe4694` 6067 conformant / 122 structural-match / 94 diverged / 4 oracle-error;
final the same. `verdict-diff.mjs 03efe4694`: lost 0, timeout or errored 0. No census attribute moved.

**Authored (`tests/fixtures/cheneer/`, 91):** 78 equal, 13 error pairs, 0 open. Upstream's 4 vega Chen fixtures, 44
planning probes, 35 authored at T3b, 7 ELK at T3d, 1 self-link at T3c. All 84 drawn ones are jar-stable over 3 renders.

**DOT gate:** 66 graphviz fixtures pinned in `oracle/goldens/cheneer/`, all structurally EQUAL, `size-backlog.json` empty.

**Rows left open:** none. No `DIVERGENCES.md` entry, no `needs-ruling` issue, `oracle/accepted-divergences.json`
untouched. `dist/*.d.ts` identical to the base build.

**CI risk:** the 3 new suites run 257 tests in 3.6 s locally; the slowest shard of the last CI run (43064928398) was
shard 3 at 10 m 31 s, so even at CI's 2-8x factor the addition is under ~30 s.

**Not done:** the #133/#136 comments (denied; texts in `.agent-notes/ceep-T5.md`).
