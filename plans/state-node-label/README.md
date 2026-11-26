# state-node-label (snl)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #235, found by the 2026-11-23 upstream parity audit. Planned unattended on 2026-11-24 at
`feature/parity-queue` `e0fe775a5`.

## Objective

`skinparam stateDiagramEdgeLabelStyle node`, and the arrow-style keywords `node` / `nonode`, make the jar draw a
transition's label as its own node between the two states. The port draws the label on the edge, and it refuses
`-[nonode]->` with a syntax error. Make the port do what the jar does: the same grammar, the same synthesised leaf and
links, the same label image and style, and the same hide/remove cascade.

**Upstream (quote it again before you change anything):**

| What | Where |
|---|---|
| `node` / `nonode` decision | `statediagram/command/CommandLinkStateCommon.java:190-196` (`executeArg`), `:292-321` (`shouldUseNodeStyle`, `containsStyleKeyword`) |
| Synthesis: one `STATE_TRANSITION_LABEL` leaf + two links | `CommandLinkStateCommon.java:323-386` (`createTransitionWithIntermediateNode`) |
| Leaf id | `CommandLinkStateCommon.java:388-395` (`generateTransitionNodeId`: `transition_<src>_<tgt>_<label sanitised>_<currentTimeMillis>`) |
| Collision | `net/atmp/CucaDiagram.java:220-224` (`reallyCreateLeaf` throws `IllegalStateException` on an occupied quark) |
| Grammar | `CommandLinkState.java:65-67`, `CommandLinkStateReverse.java:68-70` use `CommandLinkElement.LINE_STYLE`; `descdiagram/command/CommandLinkElement.java:82-93` lists `node` and `nonode` |
| Keyword is not a colour | `decoration/WithLinkType.java:155-161` |
| The label image | `svek/GeneralImageBuilder.java:218-219` → `svek/image/EntityImageTransitionLabel.java:55-139` |
| Orphan rule | `net/atmp/CucaDiagram.java:778-831` (`isHidden`, `isRemoved`, `isOrphanedTransitionLabel`) |
| Weight | `Link.setWeight(10.0)` (`:345`, `:356`) has **no reader**: `grep -rn 'getWeight()' src/main/java/net/` finds only its declaration (`abel/Link.java:320`). The jar's DOT carries no `weight` (planning render of `snl-issue`). |

Upstream commits: `353ed4a55` (#2368, base), `7127e9d91` (#2906, orphan rule), `fc7def70a` (#3012, arrow style on
the label), `4753cfe26` (#2988, `nonode`), `174a3d196` (#2917, Smetana hide).

**Port today (found at planning; quote it again before you change it):**

| | Where | What |
|---|---|---|
| P1 | `src/diagrams/state/state-transitions.ts:57-58` | A **local** `STYLE_WORD` copy of `LINE_STYLE`, without `nonode`. Upstream state uses `CommandLinkElement.LINE_STYLE` itself. |
| P2 | `src/core/link-style-regex.ts:8-16` | The shared `STYLE_KEY1/2`, `UBREX_KEY1/2` lack `nonode` (`CommandLinkElement.java:82-86` has it). |
| P3 | `src/core/decoration/WithLinkType.ts:158-166` | `node` → `goNodeStyle`; `nonode` falls through to `getColorOrWhite` (a colour). |
| P4 | `src/diagrams/state/ast.ts` (`Transition.arrowStyle` doc) | Says node style is "a layout decision, not a parser one". Upstream decides it in the command. Wrong; T3 corrects it. |
| P5 | `src/core/abel/LeafType.ts:63` | `STATE_TRANSITION_LABEL` exists, with no user. No `StateKind` for it. |
| P6 | `src/diagrams/state/state-hidden.ts` | Hide marks nodes and transitions; no orphan rule. |
| P7 | `src/core/dispatcher-types.ts:42-46` | The shared `ParseOptions` already carries `clock`, and `statePlugin.parse` forwards `options` to `parseState` (`state/index.ts:23-25`). Nothing in state reads it yet. |

## Starting state, measured 2026-11-24 on `e0fe775a5`

`npx tsx plans/hidden-note-host/measurements/measure.mts plans/state-node-label/measurements/probes` prints
**rows 31 zero 2 open 29 throw 0**. Full table: [measurements/plan-baseline.txt](measurements/plan-baseline.txt). Every probe has its oracle from
`scripts/oracle-render.sh`.

| Rows | Today | Owner |
|---|---|---|
| `snl-vega-transition-label-orphaned-by-remove-both-sides`, `-orphaned-by-remove-source` | 0 diffs (every label is removed with its host) | must stay 0 |
| `snl-issue-nonode`, `snl-nonode-plain-state`, `snl-nonode-desc` (component) | port: syntax error; jar draws | T2 |
| `snl-issue`, `snl-arrow-node`, `-arrow-node-upper`, `-skinparam-lower`, `-style-red-dashed-node`, `-style-node-first`, `-unlabelled`, `-up`, `-left`, `-multiline`, `-self`, `-start-end`, `-composite`, `-duplicate`, `snl-vega-transition-label` | label on the edge (24 to 55 diffs) | T3 + T4 |
| `snl-vega-nonode-override` | syntax error | T2, then T3 + T4 |
| `snl-vega-transition-label-arrow-style`, `snl-skinparam-font`, `snl-style-statediagram-arrow`, `snl-stereotype` | label on the edge | T3 + T4, then T5 |
| `snl-vega-transition-label-orphaned-by-hide`, `-orphaned-by-remove`, `-remove-then-restore`, `snl-hide-label-host` | label on the edge | T3 + T4, then T6 |
| `snl-vega-smetana-hide` (`!pragma layout smetana`) | label on the edge | T6, geometry under the dot-engine ruling (D6) |
| `snl-elk` (`!pragma layout elk`) | label on the edge | T7: fix or file (D6) |

**Measured jar facts the design rests on:**

- `snl-duplicate` (`A --> B : go` twice): the jar draws **two** label nodes, `ent0003` and `ent0006`, with ids ending
  `…288` and `…293`: the clock moved between the commands. A constant clock would collide and the jar's
  `reallyCreateLeaf` would throw (D1).
- The label draws `<rect … rx="2.5" fill="none" style="stroke:none;"/>` and a `<text>`, with **no**
  `<g class="entity">` around them: `EntityImageTransitionLabel#drawU` (`:117-133`) never starts a group.
- The first link (decors NONE/NONE) is `data-link-type="association"`, path id `A-transition_…`; the second keeps the
  arrow, `data-link-type="dependency"`, path id `transition_…-to-B`. For `-left->` the ids are
  `transition_…-A` and `B-backto-transition_…` (both links inverted).
- The jar's DOT for `snl-issue`: the label is `shape=rect` (no `style=rounded`), `width=0.311979,height=0.291667`,
  both edges `minlen=1`, no `weight`.
- `snl-stereotype` (`A --> B <<hot>> : go`): the label is `#000`, size 13. The node path never sets the transition's
  stereotype (`:323-386`); the leaf's stereotype is `<<transition>>`.
- `snl-skinparam-font`: `#F00`, size 18. `snl-style-statediagram-arrow`: `#F00`, bold. The label font is the merged
  `ARROW + stateDiagram + <<transition>>` style (`EntityImageTransitionLabel.java:65-70`).
- `snl-hide-label-host` (`hide` the target): the jar keeps only `A` visible, page 157 x 71, and **no** link comment at
  all. The same source without node style keeps the edge (196 high, edge in DOT). T6 must find why (D5).

**Separable, filed at T0:** `A --> B :  ` (an empty label after the colon) is a jar error at that line, node style or
not; the port draws it (planning render, `/tmp/p235/blank.puml`). Unrelated to #235. T0 files it.

**Corpus.** No corpus row uses `EdgeLabelStyle`, `[node]` or `[nonode]` (grep over `tests/corpus`). Every survey row
must therefore stay put. `nonode` added to the shared grammar (T2) reaches activity, class, sequence, gantt and timing
links too, as it does upstream.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `state-node-label/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Run `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `plans/` while a gate is running.
- The complexity hook blocks a file over 500 lines or a function over 30 NLOC. `state-transition-label.ts` (526) is
  **already over**: leave it no longer. `state/parser.ts` (478) and `layout.ts` (463) are close. Put new logic in new
  small modules (decisions.md D3).
- `npm run svg:survey` takes about 16 minutes. Run it in the background and wait on a marker in its log.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Probes:** `npx tsx plans/hidden-note-host/measurements/measure.mts <dir> [out.json]`. Before T1, `<dir>` is
  `plans/state-node-label/measurements/probes`; from T1 on it is `tests/fixtures/state-node-label`. Until T1 lands D2,
  every node-style row carries at least one id and one comment diff from the clock digits.
- **Authored gate:** `npx vitest run tests/oracle/svg-conformance/state-node-label.authored.test.ts`; read the count.
- **DOT:** the oracle leaves `svek-N.dot` beside each svg; compare the port's DOT for a row with it before you touch
  geometry (`.claude/memory/` and `.agent-notes/` name the dump helpers; `grep -rl 'svek-' scripts | head`). Delete any
  `svek-N.dot` the oracle leaves in a committed fixture dir.
- **Engines:** `npm run svg:survey -- state --out tests/oracle/svg-conformance/parity-state.json` (same for
  `component`, `class`, `activity`, `sequence`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar, and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change or a new dependency.
6. A fix needs a write to `@knowvah/dot-engine`, `@knowvah/elk-engine`, elkjs, `~/git/graphviz` or
   `~/git/knowvah/plantuml`. File the finding instead.
7. A row would need a new `DIVERGENCES.md` entry or a signed row in `oracle/accepted-divergences.json`.
8. D2's normalisation would change the verdict or diff count of any survey row (it must be inert outside
   `transition_…` ids).

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- A unit test that asserts today's edge-drawn label under node style, or that `nonode` is a colour/syntax error.
  Rewrite it to the jar's behaviour and journal each one.
- A residual with a separable mechanism: measure it, file a `queue:ready` + `parity` issue with the measurement and
  `file:line`, give the row that `reason`, and continue.
- A residual only a maintainer can end: file a `needs-ruling` issue with the evidence, name it in the row's `reason`,
  and continue.

## Push-forward (decide, journal, continue)

- Author extra probes for a branch you touch, each with its oracle from `scripts/oracle-render.sh`. Each joins the
  gate. Candidates:
  - `A -[#red,node]-> B : go` with `skinparam ArrowColor blue` (the filtered style reaching both links);
  - a quoted state `state "Long name" as L` with `L --> B : go` (the id uses `getName()`, not the display);
  - a label with punctuation and creole, `A --> B : **go** (now)` (sanitised id, creole display);
  - `A --> B : go` inside a concurrent region (`--` separator);
  - `A --> B : go` plus `note on link` (the note's host is the second link, or nothing: read
    `CommandFactoryNoteOnLink` before you decide);
  - `hide <<transition>>` (the leaf's own stereotype) and `remove <<transition>>`;
  - `-[nonode]->` in an activity-legacy, class and sequence arrow (shared grammar, T2);
  - `!pragma layout smetana` with the plain `snl-issue` source.
- Fix what such a probe exposes inside the mission when the fix is under ~20 lines, has a `file:line` origin, and
  moves no conformant row. Journal it. Otherwise file it.
- Rerun a timed-out vitest or survey at lower load before you call the timeout a finding.

## Blast radius

- **Data model / API:** none public. `StateKind` gains `'transitionLabel'`. `ParseOptions` is unchanged (it has
  `clock`). `dist/*.d.ts` must not move (check whether `StateKind` reaches it).
- **Dependencies:** nothing new.
- **Behaviour:** node-style sources draw the label as a node; `nonode` parses in every engine whose grammar uses
  `LINE_STYLE` and is never a colour. The SVG comparator normalises the clock digits of `transition_…` ids (D2). No
  corpus row uses either, so every survey row must stay put.

| File | Action | Task |
|---|---|---|
| `tests/oracle/svg-conformance/normalize.ts`, `svg-comments.ts` (+ their tests) | Modify | T1 |
| `tests/fixtures/state-node-label/*.{puml,svg}` (31 rows + push-forward) | Create | T1 |
| `tests/oracle/svg-conformance/state-node-label.authored.test.ts` | Create | T1, every task |
| `src/core/link-style-regex.ts`, `src/core/decoration/WithLinkType.ts`, `src/diagrams/state/state-transitions.ts` | Modify | T2 |
| other port copies of the `LINE_STYLE` key list (T2 enumerates them) | Modify | T2 |
| `src/diagrams/state/state-node-style.ts` (new: `shouldUseNodeStyle`, `createTransitionWithIntermediateNode`, `generateTransitionNodeId`) | Create | T3 |
| `src/diagrams/state/ast.ts`, `state-parse-state.ts` (clock + leaf counter), the transition handler, `parser.ts#initParseState` (read `options.clock`) | Modify | T3 |
| `src/core/svek/image/EntityImageTransitionLabel.ts` (new) | Create | T4, T5 |
| `src/diagrams/state/state-leaf-node.ts`, `state-dot-graph.ts`, the state node renderer, `renderer-group.ts` | Modify | T4 |
| `src/diagrams/state/state-hidden.ts` and the state remove path | Modify | T6 |
| `tests/unit/state/*.test.ts` (new files per task) | Create | T2 to T6 |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md` | Modify | batch closes, T7 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline, file the separable row](batch-0/overview.md) | T0 | [x] |
| [1: gate + clock normalisation](batch-1/overview.md) | T1 | [x] |
| [2: `nonode` grammar](batch-2/overview.md) | T2 | [x] |
| [3: synthesise the leaf and links](batch-3/overview.md) | T3 | [x] |
| [4: label image and style](batch-4/overview.md) | T4, T5 | [x] |
| [5: hide / remove cascade](batch-5/overview.md) | T6 | [x] |
| [exit](batch-exit/overview.md) | T7 | [x] |
| [squash](batch-squash/overview.md) | T8 | [x] |

## Done when (issue #235)

- [x] `snl-issue` and `snl-issue-nonode` (the issue's two repros) reach 0 diffs and 0 comment mismatches.
- [x] The upstream vega fixtures the issue names reach 0: `7127e9d91`'s three (`snl-vega-transition-label`,
      `-orphaned-by-hide`, `-orphaned-by-remove`), `fc7def70a`'s `-arrow-style`, and `snl-vega-nonode-override`. So do
      `-remove-then-restore` and the two controls `-remove-both-sides` / `-remove-source`. (The issue's fourth,
      `state_node_label`, is the Smetana row below.)
- [x] The authored hide/remove and styled-label probes reach 0, or name a filed issue with `file:line`.
- [x] `snl-vega-smetana-hide` draws what the jar draws (the label hidden with its host, the same element set), with
      its geometry delta recorded under the dot-engine ruling (D6).
- [x] `snl-elk` is fixed or filed (D6).
- [x] 0 conformant losses in every engine, base survey against final survey. `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` pass;
      `dist/*.d.ts` unchanged.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, auto-confirmed decisions, pre-flight.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `plan-baseline.txt`, `plan-baseline.json`, and `probes/` (31 `.puml` + `jar/*.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `java`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated: the SessionStart hook
compares it with the live `.claude/settings.json`.

## Mission summary (2026-11-24)

**Tasks:** T0-T7 done as planned, T8 (squash) follows. T6's orphan rule landed in batch 3 instead of batch 5 (journal
row 17): once T3 created the leaf, the two remove controls needed it to stay at zero.

**Gate** (`tests/oracle/svg-conformance/state-node-label.authored.test.ts`, 43 rows: the 31 planning probes, 3 T2
push-forward probes, 9 T4/T5 push-forward probes):

| After | ZERO | OPEN | SMETANA |
|---|---|---|---|
| T1 | 2 | 28 | 1 |
| T2 | 8 | 25 | 1 |
| T3 (+T6 rule) | 11 | 22 | 1 |
| T4/T5 | 39 | 2 | 2 |
| T7 | 39 | 2 | 2 |

**Open rows and reasons:**
- `snl-style-statediagram-arrow` (1 diff, `font-weight`): #292, `parity` + `needs-ruling`. The arrow-font cascade is
  class-scoped for every engine (`style-cascade-class-snames.ts:13`); a state-scoped `Theme` field would change the
  published d.ts (stop 5). The port's plain edge label has the same gap.
- `snl-elk` (25 diffs, 2 comments): #293, `queue:ready` + `parity`. State has no ELK path; the pragma draws dot.
- SMETANA `snl-vega-smetana-hide` (35/2) and `snl-pf-smetana-issue` (33/2): ruling 2026-08-09. Element sets equal the
  jar's (label hidden/removed with its host); the delta is Smetana geometry and the jar's Smetana SVG writing no link
  comments.

**Filed:** #291 (blank label after `:` draws, jar errors; `queue:ready`), #292, #293. #136 lists all three as blockers.
#236 has a comment naming what it can reuse.

**Decisions flagged for review:**
- Row 6: stop 8 proven by exhaustive grep (no oracle svg or corpus source contains `transition_`) instead of a T1 survey.
- Row 16: `emitTransition` split into `emitTransition` + `addLink` so the node-style branch ticks both ctors, then both
  `getInv`, as upstream does (lnk6/lnk7 for `-left->`).
- Row 19: batch 3 closed on the state survey only (only `src/diagrams/state/` changed); every-engine surveys ran at
  batches 2 and 4.
- Row 26: the gate and fixtures landed with T5's commit, so T4's commit alone would fail the gate.
- Row 28: activity rerun with `SVG_PARITY_TIMEOUT_MS=240000` after warm-up timeouts under load.

**Quality gates (final):** journal row 29: `npm test` 51374 passed, lint, typecheck, format:check, build green;
`dist/*.d.ts` unchanged; every engine 0 lost against `e0fe775a5`.

**Tests rewritten:** none; no existing test asserted the edge-drawn label or `nonode` as a colour/syntax error.
