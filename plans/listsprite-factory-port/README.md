# listsprite-factory-port (lsp)

**Read these first, at every start and after every compaction:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

Source: GitHub issue #134. Planned unattended on 2026-11-12 at `feature/parity-queue` `b7cbbcc47`.

## Objective

Port upstream's `ListSpriteDiagramFactory` (`klimt/sprite/ListSpriteDiagramFactory.java`, `ListSpriteDiagram.java`,
`CommandListSprite.java`, 250 lines) file for file into `src/core/klimt/sprite/` (D1). Register it at
`PSystemBuilder.java:170` and give `@startsprites` its own tag (D2). Then:
- take every fixture to an end (D9): zero diffs, an error pair, a named divergence, or a `needs-ruling` issue;
- pin the two corpus rows and the authored fixtures in the `svg-factories` family (D3);
- lose no conformant row in any engine;
- regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-12 on `b7cbbcc47`

- No plugin claims `SPRITES`. `@startsprites` is not in `block-extractor.ts#START_SUFFIX_MAP`, so it renders
  "unknown diagram type". A multi-line `@startuml` with a `listsprite` line renders our refusal page.
- **Two corpus rows** reach this factory: `folutu-01-xuzo995` and `nujapi-78-mota753` (stdlib `!include`s, then
  `listsprites`). Both are `diverged`, 43 diffs, in `parity-unknown.json`. Their oracles are
  `test-results/dot-cache/unknown/<slug>/in.svg`, typed `HELP`, six 48×48 PNG sprites in name order.
- `tests/fixtures/utility/cov-refuse-listsprite.puml` (`listsprite` twice) is two lines, so it misses the single-line
  gate and reaches this factory too. It is ufp's parity-gap row (`planning/next-missions.md` ufp follow-on 4).
- The pieces that exist: the sprite commands (`sprite-commands.ts#matchSpriteCommand`), `SpriteRegistry`, the sprite
  kinds and PNG encoder, the creole sprite atom (`creole-atoms-image-resolver.ts#makeAtomImageResolverFor`),
  `TextBlockUtils.mergeTB`, `FontConfiguration.blackBlueTrue`, `TitledDiagram`, the chrome and scale export.
- The pieces that are missing: `getAllSpriteNames`, `Sprite#asTextBlock` as a `TextBlock`, the factory, the diagram,
  `CommandListSprite`, the plugin.

**29 planning probes** are in [probes/](probes/), all `cov-sprites-*`. They were rendered with
`scripts/oracle-render.sh` on 2026-11-12, one directory per probe, under `/tmp/lsp-plan/po/<slug>/`.
- 24 draw a `data-diagram-type="HELP"` page.
- 5 are error or Welcome pages: `err-garbage`, `err-listsprite-arg`, `uml-garbage-then-listsprite` (errors) and
  `startsprites-empty`, `startsprites-blank` (Welcome) (D6).
- All 29 are byte-identical over 3 renders (D7).
- Ours is an error page on all 29 (`measureAuthoredFactories`: `weErrored` true, 5 to 12 diffs each).

**What the jar does.** Planning read the Java for every row; every task still opens it and quotes the line.

| Behaviour | Java | Task |
|---|---|---|
| Factory: `addCommonCommands1`, `addCommonCommands2`, `addCommonScaleCommands`, then `CommandListSprite` (first match wins, so 2 and scale add nothing new) | `ListSpriteDiagramFactory.java:52-58`, `CommonCommands.java:55-60` | T1a |
| `listsprites?` alone on the line, case-insensitive; `executeArg` is `ok()` and changes nothing | `CommandListSprite.java:50-71` | T1a |
| The diagram is typed `HELP`, not `SPRITES`; description `(Sprites)` | `ListSpriteDiagram.java:59-65` | T1a |
| Names come from `getAllSpriteNames`: a `TreeSet` of the registry keys only (no internal sprites) | `SkinParam.java:802-804` | T1b |
| Each sprite: `asTextBlock(BLACK, null, 1.0, null)` over its name, `Display.create(n)` in `blackBlueTrue(sansSerif(14))`, merged top-to-bottom, centred | `ListSpriteDiagram.java:82-88` | T1b |
| Flow: `x += w + 30`; past `x > 1024` wrap with `y += rowHeight + 50`; dimension `(maxX, y + rowHeight)` | `ListSpriteDiagram.java:76-104` | T1b |
| Export: `TitledDiagram` chrome, margin, scale, `data-diagram-type="HELP"`, style name `activityDiagram` | `TextBlockExporter.java:159-209`, `DiagramType.java:234-296` | T2a |
| `@startsprites` → `SPRITES`; `@startuml` lists `SPRITES` last | `DiagramType.java:193-200` | T2a |
| An empty diagram is the Welcome page; a bad line is "Syntax Error?" | `PSystemCommandFactory.java:117-170` | T2a |

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, no worktrees** (D10).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and
  tags `listsprite-factory-port/pre-squash`.
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

Measured at planning on `b7cbbcc47`, 2026-11-12, on graphviz 16.1.0: see [decision-journal.md](decision-journal.md)
row 0 for the `npm test -- --maxWorkers=4` and `npm run lint` results. Typecheck, build and `format:check` were not
run at planning; T0's batch close is their first run on the base.

## Measurement commands

No new planning tools: the cmf and ceep tools already fit (D3). Read each before trusting its output, and journal any
fix. Run with `node` or `npx jiti`, type every command literally (the allowlist has no `bash plans/...`, no `date`,
no shell-variable prefixes), run producers **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`), and never
`cd` below the repo root.

- **Fixtures:** `npx jiti plans/creole-math-factories-port/measurements/fixtures.mts cov-sprites-...` prints
  `slug<TAB>diffs<TAB>firstDiff` for `tests/fixtures/factories/<slug>.puml` against `<slug>.svg`, error pairs counted.
  Pass the `cov-sprites-*` slugs (`ls tests/fixtures/factories`) to keep cmf's rows out of the table.
- **Jar stability (D7):** `node plans/chen-eer-engine-port/measurements/jar-variants.mjs /tmp/lsp-<task>/variants 3 <puml...>`.
- **Corpus rows:** `npx jiti plans/listsprite-factory-port/measurements/corpus-rows.mts` measures the two rows through
  `measureFactoriesSlug`. At planning both print `errored: true` (our refusal page).
- **Every engine, at batch close from batch 2 on:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 means a loss.
  `verdict-diff` takes a **git ref**: a directory silently yields "lost 0" (`.claude/memory/flp-status.md`).
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D11. Amend `decisions.md` with the date, then halt. This includes any `dist/*.d.ts`
   change beyond an added type.
5. A fixture's jar output is not byte-stable across renders (D7).
6. Registering the plugin changes which error page the jar's ordering picks for a row that is conformant today, and the
   change moves it away from the jar (D2).

**These are not stops:**
- A fixture that needs a ruling. It goes on a `needs-ruling` issue that names it, and everything else finishes.
- A file outside a task's write-set. Change it and journal why.

`oracle/accepted-divergences.json` is never edited here.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that share a mechanism, or splitting one that runs past about 15 minutes. T2c is
  expected to split into one task per diff family.
- A residual diff a fix uncovers: read the Java, fix it in the task that owns it or add a task.
- More authored `.puml` fixtures and oracles where a branch has no fixture (each sprite kind, each chrome element).
- Porting `asTextBlock` per sprite kind if D4's reuse of the creole sprite atom does not hold. Journal the evidence.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D11).
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.
- Fixing an adjacent defect a probe exposes in a shared module, with its Java quote. A gain in another bucket counts for
  that bucket's issue: T4 comments there, or leaves the text in `.agent-notes/` if the comment is denied.

## Blast radius

- **Data model:** none.
- **API:** no public change. `dist/*.d.ts` is checked at T4. `block-extractor.ts#DiagramType` gains `'sprites'`.
- **Dependencies:** nothing new. No layout engine: the page is a flow of text blocks.
- **Routing:** `@startsprites`, and `@startuml` sources every earlier factory refuses (D2).
- **Shared seams:** `sprite-registry.ts` gains `getAllSpriteNames` (additive). Error-page choice among `@startuml`
  candidates gains one candidate at java:170 (D2).

| File | Action | Task |
|---|---|---|
| `src/core/klimt/sprite/{CommandListSprite,ListSpriteDiagram,ListSpriteDiagramFactory,listsprite-common-commands,listsprite-skin-param}.ts` | Create | T1a |
| `src/core/sprite-registry.ts`, `src/core/klimt/sprite/{ListSpriteDiagram,sprite-text-block}.ts` | Modify, Create | T1b |
| `src/core/klimt/sprite/listsprite-export.ts`, `ListSpriteDiagramFactory.ts` (plugin), `src/registered-plugins.ts`, `src/core/block-extractor.ts`, `src/core/diagram-type-set.ts` (comment), `tests/unit/utility-registration.test.ts` | Create, Modify | T2a |
| `tests/fixtures/factories/cov-sprites-*` | Create | T2b |
| `src/core/klimt/sprite/**`, shared modules a residual reaches | Modify | T2c |
| `tests/oracle/svg-conformance/render-fixture-factories.ts`, `oracle/goldens/svg-factories/**`, `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, `oracle/goldens/svg-utility/authored-baseline.json`, `plans/listsprite-factory-port/measurements/*` | Modify, Create | T3 |
| `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `planning/{roadmap,next-missions,mission-guide}.md`, `docs/catalog.md` | Modify | T2a to T4 |
| `tests/unit/core/klimt/sprite/**` | Create | T1a to T2c |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1: factory, commands, diagram](batch-1/overview.md) | T1a, T1b | [x] |
| [2: turn on, fixtures, residuals](batch-2/overview.md) | T2a, T2b, T2c | [x] |
| [3: ratchet](batch-3/overview.md) | T3 | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #134)

- [x] Every fixture of the type is conformant, or named in `DIVERGENCES.md` with a forcing library or a signed ruling.
  A row that needs a ruling is on a new `needs-ruling` issue and is not decided here (D9).
- [x] 0 conformant losses in every engine, comparing the baseline survey with the final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D11, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md) and [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/): the 29 planning probe sources.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief: `node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh` and `gh issue`. It was deliberately not regenerated, because the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-12)

**Status: done.** T0 to T4 complete (T2c ran as one sub-task, T2c1). T3 ran before the batch-2 gate run (journal row 8),
so one gate and survey run closed batches 2 and 3. T5 squashes.

| | Before (`b7cbbcc47`) | After |
|---|---|---|
| `folutu-01-xuzo995`, `nujapi-78-mota753` | diverged, 43 diffs each (our refusal page) | conformant, pinned in `svg-factories` |
| `unknown` bucket | 969 conformant / 63 diverged / 16 structural | 971 / 61 / 16 |
| every other engine | — | unchanged; `verdict-diff`: lost 0, timeout/errored 0 |
| `svg-factories` | 41 slugs, 17 pins | 43 slugs, 19 pins |
| `cov-refuse-listsprite` (svg-utility authored) | parity gap, weighted 192 | 0 diffs, gap closed |

**Authored:** 47 `cov-sprites-*` fixtures (29 planning probes + 18 authored): 42 zero-diff, 5 error pairs, 0 open.
All 42 drawn pages are byte-stable over three jar renders (D7). No row needed a ruling; no `DIVERGENCES.md` entry was
added, and `oracle/accepted-divergences.json` is unchanged.

**Gates (last run, `0a4f97483`, load ~3-5):** `npm test -- --maxWorkers=4` exit 0, 2229 files / 1 skipped, 47969
passed, 4 expected fail; coverage st 96.94 / br 92.55 / fn 97.46 / ln 97.96. `typecheck`, `lint`, `build` and
`format:check` exit 0. `dist/*.d.ts` identical to the T0 snapshot. Gate fixes: 2 (journal rows 4 and 9), each one
attempt.

**Decisions:** 9 journal rows. Worth a reviewer's eye: the layering allowlist entry for the re-exported ebnf
`SkinParam` (row 4); `CommandSpriteBase64` moved from the sequence engine to `src/core/` (row 7); the T4 survey was not
rerun because `src/` and `scripts/` are unchanged since the batch-2 survey (row 10).

**Open:** none for #134. Follow-ons are in `planning/next-missions.md` (lsp section). The #134 and #136 comments were
denied; their text is in `.agent-notes/lsp-T4.md`.

**CI risk:** low. On the latest PR run (43056792224) the slowest shard took 10m21s (shard 3). This mission adds about
150 tests; the factories suites run 448 tests in 5.2 s locally. Per-test blobs from that run have expired (1-day
retention), so this is a job-level reading.
