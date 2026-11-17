# class-comment-bytes (ccb)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #151 (from #114, `c4-divergence-drive` T2c). Planned unattended on 2026-11-16 at
`feature/parity-queue` `ef6baafed`.

## Objective

Make the `<!--...-->` comments of every class and object diagram equal the jar's bytes. `compareSvg` drops comments, so
every row involved is already conformant and no verdict can move; a byte gate has to hold the result.

The issue lists 6 rows because T2c compared link comments only. Planning compared every comment over all 1234
class/object golden-ratchet pins and found **154** that differ. Three upstream mechanisms cover every one:

- **D1, image dispatch (89 rows).** Only `EntityImageClass` (`EntityImageClass.java:142`) and `EntityImageDescription`
  (`:295`) write an entity comment. Objects, maps, json and states do not (`GeneralImageBuilder.java:107-242`). Ours
  writes `<!--class X-->` for all of them (`renderer-leaf.ts:139-141`).
- **D2, hidden (23 rows, the issue's 6 among them).** `SvekResult#drawU` draws hidden nodes and edges through
  `UHidden` (`SvekResult.java:85,98`). `AbstractUGraphic#draw` writes a comment before it checks hidden
  (`AbstractUGraphic.java:128-131`), and the empty group is dropped (`SvgGraphics.java:1190-1195`). So a hidden class
  or link leaves exactly its comment. Ours returns before writing anything (`renderer-leaf.ts:108`,
  `renderer.ts:246-247`). `-[hidden]-` is `goHidden`, not `invis` (`WithLinkType.java:149-150`).
- **D3, names (42 rows).** Every comment names `Entity#getName()`, the quark's own name (`Entity.java:686-688`). Ours
  splits on a fixed `.` (`renderer-group.ts:72-75`), uses the cluster's display label (`renderer.ts:185`), or the
  dotted id for USymbol entities.

This mission:

1. adds a byte gate to both golden ratchets and an authored gate for the probes (batch 1, T1a, D4);
2. writes an entity comment only where the upstream image does (T1b, D1);
3. writes the comment, and only the comment, for a hidden entity or link (T1c, D2). The issue's 6 rows reach 0 here;
4. stamps the quark name at creation and prints it in class, entity (T1d) and cluster (T1e) comments (D3);
5. files any residue, re-measures every engine and closes out (exit, squash).

## Starting state, measured 2026-11-16 on `ef6baafed`

`npx tsx plans/class-comment-bytes/measurements/measure-ccb.mts /tmp/ccb-t0.json` prints
**`rows 1242 equal 1081 differ 161 {"A-hidden":27,"B-name":45,"C-ours-extra":89}`**. The 1234 pins alone:
1080 equal, 154 differ (A 23, B 42, C 89); the probes add A 4 and B 2, the issue fixture B 1.

| Bucket | Rows | Examples | Mechanism | Task |
|---|---|---|---|---|
| C-ours-extra | 89 (74 `svg-object`) | `vozomu-86` (`object toto1`), `kavako-54` (maps), `bizasu-70` (json), `togixe-65` (`state`) | D1 | T1b |
| A-hidden | 23 | `lafama-65`, `doseko-41`, `senece-96`, `jakapi-64`, `xifuza-00`, `guxode-39`, `zekona-69` (`hide @unlinked`), `vakovo-25` | D2 | T1c |
| B-name | 42 | `lobofa-60` (`::`), `fokudo-49` (`\\`), `pexivi-54` (`none`), `curuju-86` (alias), `cokavo-95` (entity) | D3 | T1d, T1e |
| probes | 7, 6 differ | `hidden-link-classes`, `hidden-link-packages`, `hide-class-with-link`, `hidden-map-json`, `obj-hidden`, `hidden-entity-in-namespace`; `remove-class` equal; `obj-hidden` buckets as B but is D1 + D2 | D1-D3 | T1a-T1e |
| issue fixture | 1 | `c4dd-T2c/class-namespace-separator-comment` (`X::B` → `B`) | D3 | T1d |

The buckets are the measurer's shape heuristic; the mechanisms were read from the Java for at least two rows of each.
Rows with more than one mechanism show the first one only, so expect a row to move between buckets as tasks land.

**`!pragma layout elk` rows are already equal** when rendered with the ELK backend loaded (`prepareElkOnce`), as the
ratchets do. A probe without it renders no comments at all; that is the harness, not the port.

- **Pre-flight at planning:** see journal row 0.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `class-comment-bytes/pre-squash`. Never push: the user reviews, signs and pushes.

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

- **Comments:** `npx tsx plans/class-comment-bytes/measurements/measure-ccb.mts [out.json] [-v]`. It reads both ratchet
  manifests, `measurements/probes/`, from T1a on `tests/fixtures/class-comment-bytes/`, and the c4dd-T2c separator
  fixture. About 1240 renders, 2 to 3 minutes.
- **Ratchets:** `npx vitest run tests/oracle/svg-conformance/class.golden.ratchet.test.ts
  tests/oracle/svg-conformance/object.golden.ratchet.test.ts`; read the count.
- **One engine:** `npm run svg:survey -- class --out tests/oracle/svg-conformance/parity-class.json` (same for
  `object`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete the
  `svek-N.dot` files it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D5. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D5).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A row whose comments still differ after D1-D3 for another reason: read the Java, file a `queue:ready` + `parity`
  issue with both comment sequences and `file:line`, point its open-list entry at the issue, and continue.
- A uid, id or `-1`/`-2` link-id suffix that moves because a hidden link now counts (T1c): it is D2's own mechanism.
  Fix it in T1c with the Java quote.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Author more probes on the same reading, each with its oracle, and add them to the gate:
  - a hidden class with a `note` attached (`note right of B`), and a hidden note;
  - a hidden lollipop or association-class point, and a hidden `<<Group>>` USymbol package;
  - `hide` on a link's stereotype (`hide <<s>> links`, if the jar accepts it) and `-[hidden,dashed]-`;
  - a `set separator` changed mid-diagram, with classes made before and after it (D3);
  - a classifier whose code needs `escapeComment` (`class "a--b" as X`, and a name with `--` itself).
- Run the measurer over the conformant class rows that are not pinned (`luzive-62`, `sadamo-18`, `zuduxu-90`); they
  were equal at planning.
- If a D3 create site turns out to share a helper with the description or state engines, change only the class
  caller and journal the shared helper for a later mission.
- Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none public. The class AST and geo types gain an internal `quarkName`. `dist/*.d.ts` must not
  move (D5).
- **Dependencies:** nothing new.
- **Behaviour:** only SVG comment bytes in class-engine output (class, object, and class-routed `unknown`/`c4` rows),
  towards the jar. `compareSvg` cannot see them, so no verdict moves; the batch-close survey proves it.

| File | Action | Task |
|---|---|---|
| `tests/oracle/svg-conformance/class.golden.ratchet.test.ts`, `object.golden.ratchet.test.ts` | Modify | T1a |
| `tests/oracle/svg-conformance/<svgComments helper>.ts` | Create | T1a |
| `oracle/goldens/svg-class/comment-open.json`, `oracle/goldens/svg-object/comment-open.json` | Create, shrink | T1a; T1b-T1e |
| `tests/fixtures/class-comment-bytes/*.{puml,svg}` | Create (moved from `measurements/probes/`) | T1a |
| `tests/oracle/svg-conformance/class-comment-bytes.authored.test.ts` | Create | T1a; rows move to `ZERO` in T1b-T1e |
| `src/diagrams/class/renderer-group.ts` (predicate, `leafPortion`, `wrapEntity`) | Modify | T1b, T1d |
| `src/diagrams/class/renderer-leaf.ts` (`renderClassifierLeaf`) | Modify | T1b, T1c, T1d |
| `src/diagrams/class/renderer.ts` (`drawEdge`, cluster push) | Modify | T1c, T1e |
| `src/diagrams/class/class-relationship-ast.ts` (citation) | Modify | T1c |
| class parser create sites, `ast.ts`, `class-geo-types.ts`, `class-geo-namespace-types.ts`, `class-geo-builders.ts` | Modify | T1d, T1e |
| `renderer-usymbol-entity.ts` or `core/svek/DecorateEntityImage.ts` (entity comment name) | Modify | T1d |
| unit tests beside the above (find them with `grep -rln "<symbol>" tests/unit`) | Create or modify | T1b-T1e |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `planning/next-missions.md` | Modify | batch closes, T2 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: gate, dispatch, hidden, names](batch-1/overview.md) | T1a, T1b, T1c, T1d, T1e | [x] |
| [exit](batch-exit/overview.md) | T2 | [x] |
| [squash](batch-squash/overview.md) | T3 | [x] |

## Done when (issue #151)

- [x] The comments of every class and object golden-ratchet pin equal the jar's bytes, or the row is in an open list
      naming a filed issue with its mechanism.
- [x] The issue's 6 rows and its separator fixture compare byte-equal in comments.
- [x] A byte test holds it: both ratchets assert comment equality, and the authored gate holds the probes.
- [x] No new divergence. `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged.
- [x] 0 conformant losses in every engine, baseline survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D5, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-ccb.mts` and `probes/` (7 `.puml`, each with its jar `.svg` beside it).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx vitest`, `npm`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated, because the
SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-16)

**Tasks:** T0, T1a, T1b, T1c, T1d, T1e, T2 done (7 of 7 before the squash), plus one push-forward probe commit and
batch-close commits for batches 0, 1 and exit. The history is on `class-comment-bytes/pre-squash`. 12 journal rows
before the squash; none is flagged for a ruling.

**Gates (exit, journal row 11):** `npm test` 2295 files / 49163 passed, coverage 96.96/92.54/97.43/97.99; typecheck,
lint, build and format:check 0. Every batch close ran the full set, and none failed.

**Verdicts, base `ef6baafed` → exit:** no verdict or diff count moved in any survey file (only `generatedAt`).
`verdict-diff`: 0 lost, 0 timeout or errored. Class 871/3/0 and object 81/0/0 after every `src/` task.

**Comment rows:** at the start, 1242 rows, 161 differing (154 of the 1234 pins: D1 89, D2 23, D3 42; the issue's 6
among D2). At exit, both `comment-open.json` lists are empty: every pin's comments equal its golden's, held by both
ratchets. The authored gate has 19 rows (18 probes and the issue fixture), 17 at zero; the 2 open rows are #203. All
955 cached class/object dot-cache rows compare equal in comments.

**Mechanism:** D1, only `EntityImageClass` and `EntityImageDescription` write an entity comment
(`GeneralImageBuilder.java:107-242`; `entityImageCommentKind`). D2, a hidden node or edge draws under `UHidden` after
its comment is written (`SvekResult.java:82-101`, `AbstractUGraphic.java:128-131`), and a hidden link still takes its
id (`SvekEdge.java:944`, pinned by `hidden-link-shared-id`). D3, every comment prints the quark name fixed at creation
(`Quark.java:84-121`, `CucaDiagram.java:248-283`), now `Classifier.quarkName`/`Namespace.quarkName`. The group name
landed in T1d, because a collapsed group's leaf keeps the group's name.

**d.ts:** byte-identical to the T0 snapshot. `DIVERGENCES.md` and `oracle/accepted-divergences.json` are unchanged
(D5).

**Follow-ons:** #203 (a name after a separator change is re-resolved by the new separator), #204 (a note on a hidden
class is drawn). See `planning/next-missions.md`, section "class-comment-bytes (ccb)".

**CI risk:** one regex pass per ratchet render already made, 19 gate renders and 16 unit renders, about 1 s locally.
`makeClassifier` gained a required `quarkName` argument (5 callers, one test).
