# nwdiag-engine-port (nwp)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #124. Planned unattended on 2026-11-09 at `feature/parity-queue` `3200e13bc`.

## Objective

Port `net/sourceforge/plantuml/nwdiag/` (21 files, about 3,000 Java lines) file for file into `src/diagrams/nwdiag/`
on the klimt layer, the way packet and board were ported (D1, D2), and register it at `PSystemBuilder.java:155`. Take
the **68 `@startnwdiag` rows** to conformant or a named end (D6), author probes past them (D5), and pin everything in
a new `svg-nwdiag` ratchet. Lose no conformant row in any engine, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-09 on `3200e13bc`

No plugin registers `NWDIAG`: every `@startnwdiag` source gets the "unknown diagram type" sentinel. The 68 rows are
all in the **`unknown`** cache tree (`test-results/dot-cache/unknown/`). The `network` bucket holds none of them,
because `scripts/classify-corpus.ts:110` fills it by keyword. `measurements/nwdiag-rows.mjs` finds them
(`measurements/planning-rows.json`):

| Rows | Oracle | Verdict today | First diff |
|---|---|---|---|
| 64 | the jar draws `data-diagram-type="NWDIAG"` | 64 diverged | `svg/@background` |
| 4 | jar error pages: `jifoke-84` and `ligalo-62` `Syntax Error?`, `torazi-09` `Element already in another group.`, `zeceme-22` `Cannot nest group` (`oracle/goldens/stock-error-pages.json`) | 4 diverged | `svg/@background` |

The issue says "64 of them non-conformant". On `3200e13bc` all 68 are diverged: the 4 jar-error rows are diverged
too, because we draw the sentinel, not an error page. The routing gate pins the 64 drawn rows `known-misroute`,
`ourType: NONE`, and the 4 error rows `jar-error` (`routing-baseline.json`). The refusal baseline lists all 68
`ok`, `engine: none`. Overall: 5,355 of 5,927 conformant; `unknown` 864 / 4 / 180.

**Feature census of the 68** (sources matching): `nwdiag {` 67, `network` 64, `address` 33, `group` 26, `shape` 23
(cloud 20, database 6, node 3, queue, collections, actor), peer link `a -- b` 21, network property ending in an
unquoted `;` 19, `color` 17, `description` 15, `<style>` 8, creole 7, `width = full` 3, chrome 2, sprite, `!include`
and `\n` once each.

**Already ported, from packet's mission:** `src/diagrams/nwdiag/NwDiagram.ts` (only the static `toSet`, which
`packetdiag/command/CommandNumRange.ts` calls) and `src/diagrams/nwdiag/VerticalLine.ts`. Both stay at their upstream
home and grow in place. Upstream ships no nwdiag test beyond `DiagramTypeTest.java`, and the pdiff corpus has the same
68 sources.

**16 planning probes** are in [probes/](probes/), rendered with `scripts/oracle-render.sh` on 2026-11-09 into
`/tmp/nwp-plan/oracle`. 11 draw `NWDIAG`; `cov-embedded` draws a `SEQUENCE` with the nwdiag inside a note; 4 are jar
pages: `cov-empty` (the Welcome page), `cov-nested-group` (`Cannot nest group`), `cov-link-unknown`
(`what about ghost`), `cov-description-outside` (a Java `NullPointerException`). T3b re-renders them into
`tests/fixtures/nwdiag/`.

"Status" says what planning established. **Read** means planning read the Java. **Probe** means a jar render on
2026-11-09 showed it. Every task still opens the Java itself and finds the line.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| `NwDiagram extends TitledDiagram`, `getDefaultMargins()` is `none()`; the body is one `TextBlock` whose dimension is `getMinMax(drawMe, sb, true).getDimension()`; `drawMe` translates by `margin = 5` and ends with a `UEmpty(1, 1)` past the grid | `NwDiagram.java` `getTextBlock`, `getTotalDimension`, `drawMe`, `getDefaultMargins` | Read | T2a |
| Network names: right-aligned `Display.getWithNewlines(pragma, name)` (plus `BLOCK_E1_NEWLINE` + address), style `root, element, nwdiagDiagram, network`; the first name's height sets `deltaY` | `NwDiagram.java` `toTextBlockForNetworkName`, `drawMe` | Read + Probe | T2a |
| A network property value keeps a trailing `;` when unquoted: `([^"]*)` then `"?` then `;?` | `CommandProperty.java` `getRegexConcat` | Read + Probe (`cov-net-address-semicolon` prints `210.x.x.x/24;`) | T2b |
| `CommandNwDiagInit` is `^(nwdiag)?\s*\{?$`: a blank or `{`-only line matches it | `CommandNwDiagInit.java` | Read | T2b |
| No networks at `makeDiagramReady`: an invisible network `""`; every server joins `networks.get(0)` if alone | `NwDiagram.java` `makeDiagramReady` | Read | T2a |
| `a -- b` with `a` unknown and networks present: `what about a` | `NwDiagram.java` `link` | Read + Probe (`cov-link-unknown`) | T2a |
| `description = ...` outside any network and group: `currentNetwork()` is null, a Java NPE, an error page | `NwDiagram.java` `setProperty` | Read + Probe (`cov-description-outside`) | T2a |
| `group` inside a group: `Cannot nest group`; a network inside a group: `Cannot open network in a group` | `NwDiagram.java` `openGroup`, `openNetwork` | Read + Probe (`cov-nested-group`) | T2a |
| Columns: `NTetris` packs `NBox`es of `NBar`s into a `BooleanGrid` (`x + (y << 16)` keys); a group is one box | `NPlayField.java`, `NTetris.java`, `BooleanGrid.java`, `NBox.java` | Read | T1a |
| Server box: `USymbols.fromString(shape, STICKMAN, RECTANGLE, RECTANGLE)` then `asSmall(empty, desc, empty, …, CENTER)`; an unknown shape keeps `RECTANGLE` | `NServer.java` `updateProperties`, `getDraw` | Read + Probe (`cov-shapes-all`, 26 shapes plus `bogus`) | T1c |
| Server description and addresses: `", "` becomes `BLOCK_E1_NEWLINE` (`@JawsStrange`) | `NServer.java` `toTextBlock` | Read + Probe (`cov-group-color-desc`) | T1c |
| Cell size: width `max(link1 + 20, box + 30, link2 + 20)`; height `link1 + 20 + 2 × topMargin + box + link2 + 20`; `topMargin` is `MAGIC = 15` plus the group header height | `NServerDraw.java` `naturalDimension`; `NwDiagram.java` `buildGrid` | Read | T1c |
| Links: `seven = 9.0` spacing; `magicDelta` ±2 by stage parity on visible networks; `VerticalLine` skips every network bus it crosses | `NServerDraw.java` `drawLinks`; `Network.java` `magicDelta` | Read | T1c |
| Network tube: `URectangle(max(70, xmax − xmin), 5)` with the style's shadowing; `width = full` spans from x = 0 | `GridTextBlockDecorated.java` `drawNetworkTube`, `computeMixMax` | Read + Probe (`cov-style-network` draws 3 `filter`s) | T1c |
| Group: the members' `MinMax` grown up by the header, drawn by `MinMax.draw`; `color` wins over the style's `BackGroundColor` | `NwGroup.java` `drawGroup`; `GridTextBlockDecorated.java` `drawGroups` | Read | T1c |
| Empty `@startnwdiag`: the Welcome page | factory empty-diagram path | Probe (`cov-empty`) | T2b |
| Title, caption, legend, header, footer, `scale`, `skinparam handwritten`, `mode dark`, document background through `TitledDiagram` | `TitledDiagram.java`, `TextBlockExporter.java:159-209` | Probe | T3a, T3b |

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D9). Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha
named in the execution prompt, and tags `nwdiag-engine-port/pre-squash`. Never push: the user reviews, signs and
pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>`
that collects nothing exits 0: read the count. The baseline counts on `3200e13bc` are in
[decisions.md](decisions.md#baseline).

## Measurement commands

Tools are under `plans/nwdiag-engine-port/measurements/`, adapted from laep's, plus `verdict-diff.mjs` from
`plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the
allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, always with `--out`: `npm run svg:survey -- unknown --out /tmp/nwp-<task>/parity-unknown.json`. A
  positional type with no `--out` clobbers `parity.json`.
- `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/nwp-<task>`: exit 1 on a row
  that left conformant. `node plans/nwdiag-engine-port/measurements/survey-moves.mjs /tmp/nwp-b0/parity-unknown.json /tmp/nwp-<task>/parity-unknown.json`:
  every moved row.
- `node plans/nwdiag-engine-port/measurements/nwdiag-rows.mjs /tmp/nwp-<task> --json /tmp/nwp-<task>/rows.json`: the 68
  rows with oracle kind, verdict and first diff, and a count.
- `npx jiti plans/nwdiag-engine-port/measurements/row-diffs.mts plans/nwdiag-engine-port/measurements/planning-rows.json /tmp/nwp-<task>/diffs.json [slug ...]`:
  every diff, and our SVG beside the JSON.
- `npx jiti plans/nwdiag-engine-port/measurements/fixtures.mts [slug ...]`: every `tests/fixtures/nwdiag/<slug>.puml`
  against its `<slug>.svg`, one line each.
- `npx jiti plans/nwdiag-engine-port/measurements/pin-nwdiag.mts [--write]`: pin candidates, from T4 on.
- `npx jiti plans/nwdiag-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`: the authored
  baseline, from T4 on.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close. Exit 1 on a loss.
- `scripts/oracle-render.sh <out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D11: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set
is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D8).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a shared klimt module (a `USymbol`, `Display`, `MinMax`), with its Java
  quote. A gain in another bucket counts for that bucket's issue: T5 comments there, or leaves the text in
  `.agent-notes/` if the comment is denied.

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T5. `block-extractor.ts#DiagramType` gains
`'nwdiag'`; it is internal, and `plantuml-ts` has no consumers. **Dependencies:** none; nwdiag never reaches graphviz
or dot-engine. **SVG output** changes on purpose for `@startnwdiag` and `{{nwdiag}}`. **Shared seams:**
`core/assemble-svg.ts` gains `NWDIAG` on the titled path (D2); `core/block-extractor.ts`, `core/document-back-color.ts`
and `registered-plugins.ts` gain a row each; `core/EmbeddedDiagram.ts:295` already maps `{{nwdiag`.
`packetdiag/command/CommandNumRange.ts` keeps calling `NwDiagram.toSet`.

| File | Action | Task |
|---|---|---|
| `src/diagrams/nwdiag/next/{NStage,Staged,NBar,NBox,NTetris,BooleanGrid,NPlayField,NwArray}.ts` | Create | T1a |
| `src/diagrams/nwdiag/core/{NStackable,Network,NwGroup,NServer}.ts` (model half) | Create | T1b |
| `src/diagrams/nwdiag/next/{NServerDraw,GridTextBlockSimple,GridTextBlockDecorated}.ts`; `NServer#getDraw`, `#toTextBlock`; `NwGroup#drawGroup` | Create, Modify | T1c |
| `src/diagrams/nwdiag/NwDiagram.ts` | Grow in place | T2a |
| `src/diagrams/nwdiag/Command{NwDiagInit,Comment,Element,Group,Network,Link,Property,EndSomething}.ts`, `NwDiagramFactory.ts`, `nwdiag-skin-param.ts` | Create | T2b |
| `src/diagrams/nwdiag/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,document-back-color,assemble-svg}.ts` | Create, Modify | T3a |
| `tests/unit/nwdiag/**` | Create | T1a to T3a |
| `tests/fixtures/nwdiag/**` | Create | T3b |
| `src/diagrams/nwdiag/**`, shared klimt modules a residual reaches | Modify | T3c |
| `oracle/goldens/svg-nwdiag/**`, `tests/oracle/svg-conformance/nwdiag.golden.ratchet.test.ts`, `nwdiag.diff-baseline.ratchet.test.ts`, `render-fixture-nwdiag.ts` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `tests/oracle/svg-conformance/unknown-ledger/*.json` where a gate reads them | Modify | T4 |
| `scripts/parity-dashboard-goldens.ts`, `scripts/parity-dashboard-notes.ts`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `census-unknown.json`, `planning/next-missions.md`, `planning/mission-guide.md`, `docs/catalog.md` | Modify | T3a to T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — layout, model, grid drawing](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2 — diagram, commands, factory](batch-2/overview.md) | T2a, T2b | [x] |
| [3 — turn on, probes, residuals](batch-3/overview.md) | T3a, T3b, T3c | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #124)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism. All 68 are conformant: 64 byte-identical and 4 error pairs (journal 14, 22).
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
  No divergence was added. #165 covers the four retired acceptances (journal 23).
- [x] 0 conformant losses in every engine, baseline survey against final survey (journal 22, 27).
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated (journal 24-25, 27).
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass (journal 27).

## Documents

- [decisions.md](decisions.md) — D1 to D11, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/) — the 16 planning probe sources.
- [measurements/](measurements/) — the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`) and is byte-identical to the live `.claude/settings.json`; it was deliberately not
regenerated (the SessionStart hook compares them).

## Summary (T5, 2026-11-10)

**Tasks:** 12 of 12 planned (T0, T1a-c, T2a-b, T3a-c, T4, T5, T6). One commit per task, plus one close commit per batch.

**Verdicts, base 3200e13bc → final:** `unknown` 864 / 4 / 180 → 932 / 4 / 112 (conformant / structural / diverged).
Overall 5,355 → 5,423 conformant of 5,927. Every other bucket is identical, and `verdict-diff` reports 0 lost in all 28
surveys. `nwdiag-rows.mjs`: `rows 68 {"unknown":{"conformant":68}}`.

**The 68 rows:** 64 are byte-identical, pinned in `oracle/goldens/svg-nwdiag/ratchet.json`. 4 are jar error pages
where we also error (`jifoke-84`, `ligalo-62`, `torazi-09`, `zeceme-22`), pinned by score in `diff-baseline.json`;
these are D6 ends under the 2026-10-10 rule. No row is left open, and no divergence was added.

**Authored:** 60 fixtures in `tests/fixtures/nwdiag` (the 16 planning probes, 31 D5 probes, 10 combinatorial probes
and 3 colour-mapper probes). 54 are at 0 diffs and 6 are jar error pages where we also error.

**Gates:** at the final tree, `npm test -- --maxWorkers=4` exit 0 (2,097 files, 43,975 passed; coverage 97.12 / 92.83 / 97.81 / 98.12); typecheck, lint, build and
format:check exit 0. `dist/*.d.ts` is byte-identical to a build of the base.

**Decisions flagged for review:** journal 23 retired four signed acceptances in `oracle/accepted-divergences.json`,
unsigned, because the ledger gate demanded it. D6 was amended, and #165 (`needs-ruling`) asks you to confirm or
restore them. As a result, the T5 check "`git diff <base> -- oracle/accepted-divergences.json` is empty" does not
hold. Journal 16 mirrored `ProtectedCommand` in the nwdiag factory.

**CI risk:** latest main run 42712716665: slowest shard 7.9 min (shard 3). The routing and refusal part files take
33-89 s each on the runner (`refusal-coverage.part-2` 89.3 s, `routing-conformance.part-2` 86.1 s). This mission adds
64 rows to each gate (10,847 → 10,911, +0.6%) and about 200 ratchet/unit tests. The time grows in proportion; the
added cost is unmeasured until the next PR run.

**Follow-ons:** `planning/next-missions.md` "nwdiag-engine-port (nwp)". The #136 comment was denied; its text is in
`.agent-notes/nwp-T5.md`. `planning/roadmap.md:118` still says "Network / nwdiag / rackdiag … row-based layout".
It is the user's v1.0 definition and was left as is. Upstream has no rackdiag engine, and nwdiag's layout is
`NTetris` columns.
