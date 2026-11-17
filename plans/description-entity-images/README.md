# description-entity-images (dei)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #147 (split from #113, its D7). Planned unattended on 2026-11-16 at `feature/parity-queue`
`9741efc32`.

## Objective

Three `unknown`-bucket rows need description-diagram entity images that nothing else in the corpus reaches. Today every
one of them is a **Syntax Error page** in our port, because the description parser has no command for the keyword. The
jar draws a diagram (`data-diagram-type="DESCRIPTION"`) for all three.

| Row | Keyword | Ours today | Upstream command | Upstream image |
|---|---|---|---|---|
| `unknown/gacoxo-93-guti295` | `json` in a nested group (groups left unclosed at `@enduml`) | Syntax Error, line 5 | `CommandCreateJson`, `CommandCreateJsonSingleLine` (`DescriptionDiagramFactory.java:130-131`) | `svek/image/EntityImageJson.java` |
| `unknown/liripi-72-kefa167` | `map` inside `component { }` inside `Package { }` | Syntax Error, line 8 | `CommandCreateMap` (`DescriptionDiagramFactory.java:129`) | `svek/image/EntityImageMap.java` |
| `unknown/rukitu-26-seme622` | `domain` (5 stereotypes, one group) and `requirement` (leaf and group) | Syntax Error, line 5 | `descdiagram/CommandCreateDomain.java` (`DescriptionDiagramFactory.java:137`) | `descdiagram/EntityImage{Domain,DesignedDomain,Machine,Requirement}.java`, `BoxedCharacter.java`; dispatch `svek/GeneralImageBuilder.java:235-255` (map `:183`, json `:186`) |

This mission:

1. authors fixtures and oracles for the shapes the three rows do not reach, and a measurer (batch 1);
2. ports `json` into description (batch 2);
3. ports `map` into description (batch 3);
4. ports `domain` and `requirement` with their four images (batch 4);
5. pins the three rows and the authored fixtures, re-measures every engine and files what is separable (exit).

## Starting state, measured 2026-11-16 on `9741efc32`

- `tests/oracle/svg-conformance/parity-unknown.json`: 1048 rows, 972 conformant, 60 diverged, 16 structural-match. The
  three rows are `diverged`, `dotEqual: false`, `firstDiff: svg/@background` (our error page is black).
- `npx jiti scripts/svg-parity-survey.ts --render-one test-results/dot-cache/unknown/<slug>` prints a Syntax Error
  page for each row: `gacoxo` at `json JSON {`, `liripi` at `map "Mappings" as maps #acffa0 {`, `rukitu` at
  `domain "Monitor" as M <<Machine>> {`.
- Unclosed groups already work: the `gacoxo` source with its `json` block replaced by `rectangle X` routes to
  DESCRIPTION and renders without error. The `json` command is the only missing piece there.
- `component C` + `json J { "a":1 }` (no corpus row) is a Syntax Error in ours too; the class factory, which upstream
  tries first (`PSystemBuilder.java:136,138`), rejects `component`, so the jar's description factory takes it.
- No upstream test or doc fixture uses `domain` or `requirement`, and none uses `map` in a description diagram
  (grep of `~/git/plantuml` outside `src/main/java`, 2026-11-16). Batch 1 authors them.

- **Pre-flight at planning (2026-11-16, `9741efc32`):** `npm test -- --maxWorkers=4` 2279 files passed (1 skipped),
  48909 tests, coverage 96.94/92.55/97.45/97.97; `npm run lint` 0. `typecheck`, `build` and `format:check` first run in
  T0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `description-entity-images/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Pinning moves `docs/parity-report.md`: run
  `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Rows and fixtures:** `npx tsx plans/description-entity-images/measurements/measure-dei.mts [out.json]` (written in
  T1a). One line per row: slug, verdict, diff count, first diff.
- **One row, ours:** `npx jiti scripts/svg-parity-survey.ts --render-one test-results/dot-cache/unknown/<slug>`.
- **One engine:** `npm run svg:survey -- unknown --out tests/oracle/svg-conformance/parity-unknown.json` (same for
  `component`, `usecase`, `state`, `class`, `object`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete the
  `svek-N.dot` files it leaves in the out dir unless the step needs them.
- **Authored fixture registration:** `oracle/goldens/svg-description/README.md` § "How an authored fixture reaches the
  parity corpus" (steps 1-5, `npx tsx scripts/dot-sync-report.ts <type>` then the survey).

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D7. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D7).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A residual on one of the three rows that is a different mechanism from the images and commands this mission ports
  (D6, "separable"): measure it, file a `queue:ready` + `parity` issue with the measurement and `file:line`, name it in
  the journal, continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Authoring extra fixtures for a branch you port (a `json` with an array of objects, a `map` row with `*->` to another
  entity, `domain` with an unknown stereotype, `requirement` with a colour or URL), each with its oracle.
- Porting a sibling upstream behaviour the touched command reaches (`CommandCreateJsonSingleLine`, map `*->` links,
  `CommandCreateDomain`'s URL capture), even with no corpus row.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** `DescriptiveNode` (`src/diagrams/description/ast.ts:31`) gains a leaf-kind field and payloads
  (D2). It is engine-internal; `dist/*.d.ts` must not move (D7).
- **Routing:** description now accepts four keywords. Upstream tries class before description and description before
  state (`PSystemBuilder.java:136-139`); class already owns `json` and `map`, so only sources the class factory rejects
  can change engine. A row today rendered by **state** (which also owns `json`) and also fully accepted by description
  would move. The every-engine survey and `verdict-diff` guard this.
- **Dependencies:** nothing new.

| File | Action | Task |
|---|---|---|
| `plans/description-entity-images/measurements/measure-dei.mts` | Create | T1a |
| `oracle/goldens/svg-description/component/dei-*/{in.puml,golden.svg}` | Create | T1a (pinned at the exit) |
| `src/core/svek/image/EntityImageJson.ts` (extend), `src/core/svek/image/TextBlockCucaJSon.ts` | Modify, Create | T2a |
| `src/diagrams/description/{ast,command-table,parser,parse-state}.ts`, `layout-dot-tree.ts`, `renderer-entity.ts`, new `command-json.ts` | Modify, Create | T2b |
| `src/core/command/BodierMap.ts`, `src/core/svek/image/EntityImageMap.ts` | Create | T3a |
| description parse, layout and render files as T2b, new `command-map.ts` | Modify, Create | T3b |
| `src/diagrams/description/command-domain.ts`, cluster style for `GroupType.DOMAIN`/`REQUIREMENT` | Create, Modify | T4a |
| `src/core/descdiagram/BoxedCharacter.ts`, `src/core/descdiagram/boxed-glyph-data.ts`, `src/core/descdiagram/EntityImageDomain.ts` | Create | T4b |
| `src/core/descdiagram/EntityImage{Machine,DesignedDomain,Requirement}.ts` | Create | T4c |
| `oracle/goldens/svg-description/ratchet.json`, `oracle/goldens/svg-description/unknown/<3 rows>/` | Modify, Create | T5 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md`, `planning/next-missions.md` | Modify | batch closes, T5 |

Every task adds its own unit tests: core modules under `tests/unit/core/<same path>`, description under `tests/unit/description/`.

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: fixtures and measurer](batch-1/overview.md) | T1a | [x] |
| [2: json](batch-2/overview.md) | T2a, T2b | [x] |
| [3: map](batch-3/overview.md) | T3a, T3b | [x] |
| [4: domain and requirement](batch-4/overview.md) | T4a, T4b, T4c | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #147)

- [x] `gacoxo-93-guti295`, `liripi-72-kefa167` and `rukitu-26-seme622` are conformant and `dotEqual: true` in
  `parity-unknown.json`, and pinned in `oracle/goldens/svg-description/ratchet.json`. Or a residual is separable and on
  a filed issue the journal names with its mechanism (D6).
- [x] Every authored `dei-*` fixture is conformant and pinned, or its residual is on a filed issue.
- [x] No new divergence (D5). `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged.
- [x] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D7, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx jiti`, `npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook compares
it with the live `.claude/settings.json`.

## Summary

**Executed 2026-11-16, unattended, on `feature/parity-queue` from `9741efc32`.** Tasks 9 of 9 planned (T0, T1a, T2a,
T2b, T3a, T3b, T4a, T4b, T4c) plus T5; the squash (T6) follows this commit.

- **Rows, start → exit:** `gacoxo-93-guti295`, `liripi-72-kefa167`, `rukitu-26-seme622`: Syntax Error page (diverged,
  `dotEqual: false`) → conformant, `dotEqual: true`, pinned. `parity-unknown.json` 972/60/16 → 975/57/16.
- **Authored:** ten `dei-*` fixtures (eight planned, plus `dei-requirement-lone` for the degenerate single-leaf path and
  `dei-domain-group-link` for the null-usymbol cluster border), all conformant, dotEqual and pinned;
  `parity-component.json` 266 → 276 conformant. Description ratchet 717 → 730 pins.
- **Verdicts:** every-engine survey vs `9741efc32`: 0 lost, 0 timeout (three surveys at batch closes, one rerun at
  lower load after another session drove load to 68).
- **Gates (exit):** `npm test` 2285 files, 48986 tests, coverage 96.95/92.52/97.43/97.98; typecheck, lint, build,
  format:check all 0. d.ts byte-identical (D7). `DIVERGENCES.md` / `accepted-divergences.json` unchanged (D5).
- **Decisions:** D4 amended (glyph font is `sansSerif(12)`, not size 8; decision unchanged). 23 journal rows; flagged
  for review: rows 17 (D4 premise judged a correction, not stop 4) and 22 (follow-on issue not filed).
- **Defects found and fixed at the origin:** `LimitFinder` lacked upstream's `UCenteredCharacter` no-op branch; the
  degenerate single-leaf path ignored leaf-type images; domain/requirement groups reached `Cluster` with the PACKAGE
  symbol instead of null (edge clipped 20px short).
- **Follow-ons** (`planning/next-missions.md` § description-entity-images): Problem Frames legacy skinparams (jar
  honours `skinparam domainBackgroundColor` etc.; NOT filed, `gh issue create` was denied in this run); D1 shared-seam
  mission (class map, state json onto the core images).
- **CI risk:** the routing/refusal gate counts and the dot-sync component list were re-derived; any parallel branch that
  adds description goldens will conflict on those counts.
