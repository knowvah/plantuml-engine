# wire-engine-port (wrp)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #128. Planned unattended on 2026-11-10 at `feature/parity-queue` `2a70cec76`.

## Objective

Port `net/sourceforge/plantuml/wire/` (20 Java files, 2,216 lines, 17 to port; D1) file for file into
`src/diagrams/wire/`, and register it at `PSystemBuilder.java:189`. Take the **18 `@startwire` rows** to conformant or a
named end (D8), author probes past them (D6), and pin everything in a new `svg-wire` ratchet (D7). Lose no conformant row
in any engine, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-10 on `2a70cec76`

No plugin registers `WIRE`: every `@startwire` source gets the "unknown diagram type" sentinel. All 18 rows are in the
**`wire`** bucket (`test-results/dot-cache/wire/`, `parity-wire.json`), all 18 are drawn by the jar, and no other cached
source opens `@startwire` or embeds `{{wire`. `measurements/wire-rows.mjs` finds them (`measurements/planning-rows.json`):
18 diverged, every first diff `svg/@background`. Overall: 5,666 conformant, 110 structural-match, 148 diverged,
3 oracle-error, of 5,927.

**Feature census of the 18:** nested components in 13, `--` columns in 13, colours in 8, `move` in 6, a bus link in 6,
horizontal links in 5, `%` coordinates in 4, `spot` in 3, `goto` in 3, link labels in 3, vertical links in 2, `print` in
1 (`migaki-17-jori275`). No `title`, `scale`, `<style>`, `skinparam`, `!theme` or `{{ }}` in any row. The longest is
`siladi-93-zovu930` (107 lines).

**Upstream tests:** none beyond `DiagramTypeTest.java`. **72 planning probes** are in [probes/](probes/), rendered with
`scripts/oracle-render.sh` on 2026-11-10 into `/tmp/wrp-plan/oracle`: 50 draw `WIRE`, `cov-embedded` draws a `SEQUENCE`,
and 21 are jar error or Welcome pages (D5). T3b copies them into `tests/fixtures/wire/`.

"Status" says what planning established. **Read** means planning read the Java. **Probe** means a jar render on
2026-11-10 showed it. Every task still opens the Java itself and finds the line.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| Each block sits at a cursor: `+10`, position, `+10`, then the height is added lazily when the next position is asked for | `WBlock.java` (`addBlock`, `getNextPosition`) | Read + Probe (`dogoso-52`, `cov-goto`, `cov-move`) | T1b |
| Indentation is `replace("    ", "\t").length()`: 2 spaces are level 2, 4 are level 1, a tab is level 1 | `WireDiagram.java:137` | Read + Probe (`cov-indent-*`) | T2a, T2b |
| `print` advances by an AWT height even under the deterministic flag: 11.777 at 10 pt, where the table gives 10 | `WireDiagram.java:133`, `FileFormat.java:185-186, 272` | Read + Probe (`migaki-17`), `jarMeasurer` measured | T2a |
| Draw order: root tree, spots, horizontal links, vertical links | `WireDiagram.java:87` | Read + Probe | T2a |
| The root draws `<text> </text>` for its empty name, in every drawn row | `WBlock.java` (`drawMe`) | Read + Probe (every row) | T1b, T3c |
| A vertical link never draws its label | `WLinkVertical.java` (`drawMe`) | Read + Probe (`cov-vlinks-all`) | T1c |
| `--`/`==` makes a link vertical, so `<=>` is horizontal and `<==>` vertical | `WOrientation.java` | Read + Probe (`cov-hlinks-all`, `cov-vlinks-all`) | T1a |
| Link starts stack (`+15` NORMAL, `+25` BUS); an explicit `(x,y)` moves the next one too | `WBlock.java` (`getNextOut*`), `WLinkType.java` | Read + Probe (`cov-link-stacking`) | T1b |
| The document grows to the ink for a reversed link | `SvgGraphics#ensureVisible` | Probe (`cov-link-reversed-h`, 366 not 361) | T3a |
| No style reaches the shapes; only the document, the colour mapper and handwriting react | `wire/` (all `HColors`/`UFontFactory`), `TitledDiagram.java:293-294` | Read + Probe (`cov-skinparam`, `cov-style`, `cov-theme`, `cov-monochrome`, `cov-dark`, `cov-handwritten`) | T3a |
| Error kinds: Welcome, `Syntax Error?`, `No such element`, `Component exists already`, `No such color`, a throw inside a command (NPE, `NumberFormatException`) | `ProtectedCommand.java`, the commands | Read + Probe (21 error probes) | T1b, T2b |
| Title, caption, legend, header, footer, `scale`, handwritten through `TitledDiagram`; style name `activityDiagram` (no `WIRE` branch) | `DiagramType.java:295`, `TitledDiagram.java` | Probe (`cov-chrome-all`, `cov-scale-2`, `cov-mainframe`) | T3a |
| `{{wire}}` inside another diagram | `EmbeddedDiagram` | Probe (`cov-embedded`, 206 × 248) | T3a |

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D10). Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha
named in the execution prompt, and tags `wire-engine-port/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>`
that collects nothing exits 0: read the count. The baseline on `2a70cec76` is in [decisions.md](decisions.md#baseline).
Stay on graphviz 16.1.0 (`dot -V`); wire never calls `dot`, but other engines' gates do.

## Measurement commands

Tools are under `plans/wire-engine-port/measurements/`, adapted from rep's and tep's, plus `verdict-diff.mjs` from
`plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the
allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, always with `--out`: `npm run svg:survey -- wire --out /tmp/wrp-<task>/parity-wire.json`. A positional type
  with no `--out` clobbers `parity.json`.
- `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/wrp-<task>`: exit 1 on a row that
  left conformant. `node plans/wire-engine-port/measurements/survey-moves.mjs /tmp/wrp-b0/parity-wire.json /tmp/wrp-<task>/parity-wire.json`:
  every moved row.
- `node plans/wire-engine-port/measurements/wire-rows.mjs /tmp/wrp-<task> --json /tmp/wrp-<task>/rows.json`: the 18 rows
  with oracle kind, verdict and first diff, and a count.
- `npx jiti plans/wire-engine-port/measurements/row-diffs.mts plans/wire-engine-port/measurements/planning-rows.json /tmp/wrp-<task>/diffs.json [slug ...]`:
  every diff, and our SVG beside the JSON.
- `npx jiti plans/wire-engine-port/measurements/fixtures.mts [slug ...]`: every `tests/fixtures/wire/<slug>.puml`
  against its `<slug>.svg`, one line each.
- `npx jiti plans/wire-engine-port/measurements/pin-wire.mts [--write]`: pin candidates, from T4 on.
- `npx jiti plans/wire-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`,
  `build-diff-baseline.mts <commit> [--write]` and `repin-routing-refusal.mts <commit> [--write]`: from T4 on.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close from batch 3. Exit 1 on a loss.
- `scripts/oracle-render.sh <absolute-out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`.

`fixtures.mts`, `pin-wire.mts` and the two baseline builders import `render-fixture-wire.ts`, which T4 creates; before T4,
create that file early (T3a may), or use `renderSync` directly. `row-diffs.mts` needs only `renderSync`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D13: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` gains or changes no acceptance here. A file outside a task's write-set is
not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D11).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a shared klimt module, with its Java quote. A gain in another bucket
  counts for that bucket's issue: T5 comments there, or leaves the text in `.agent-notes/` if denied.

## Blast radius

**Data model:** none. **API:** no public change expected; `dist/*.d.ts` checked at T5. `block-extractor.ts#DiagramType`
gains `'wire'`; it is internal, and `plantuml-ts` has no consumers. **Dependencies:** none; wire never reaches graphviz
or dot-engine. **SVG output** changes on purpose for `@startwire` and `{{wire}}`. **Shared seams:**
`core/assemble-svg.ts` gains `WIRE` on the titled path; `core/block-extractor.ts` and `registered-plugins.ts` gain a row
each. No layering allowlist entry: wire imports only `core/`.

| File | Action | Task |
|---|---|---|
| `src/diagrams/wire/{WArrowDirection,WLinkType,WOrientation}.ts` | Create | T1a |
| `src/diagrams/wire/{WBlock,WPrint,Spot}.ts` | Create | T1b |
| `src/diagrams/wire/{WLinkHorizontal,WLinkVertical}.ts` | Create | T1c |
| `src/diagrams/wire/WireDiagram.ts` | Create | T2a |
| `src/diagrams/wire/{Command*,WireDiagramFactory,wire-common-commands,wire-skin-param,wire-style-dispatch}.ts` | Create | T2b |
| `src/diagrams/wire/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,assemble-svg}.ts` | Create, Modify | T3a |
| `tests/unit/wire/**` | Create | T1a to T3a |
| `tests/fixtures/wire/**` | Create | T3b |
| `src/diagrams/wire/**`, a klimt or creole module a residual reaches | Modify | T3c |
| `oracle/goldens/svg-wire/**`, `tests/oracle/svg-conformance/{wire.golden.ratchet.test.ts,wire.diff-baseline.ratchet.test.ts,render-fixture-wire.ts}` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `scripts/parity-dashboard-goldens.ts` | Modify | T4 |
| `scripts/parity-dashboard-{notes,matrix}.ts`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `census-wire.json`, `planning/{next-missions,mission-guide,roadmap}.md`, `docs/catalog.md` | Modify | T3a to T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — enums, blocks, links](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2 — diagram, commands, factory](batch-2/overview.md) | T2a, T2b | [x] |
| [3 — turn on, probes, residuals](batch-3/overview.md) | T3a, T3b, T3c | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #128)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md) — D1 to D13, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/) — the 72 planning probe sources.
- [measurements/](measurements/) — the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`, `gh issue`); it was deliberately not regenerated (the SessionStart hook compares it
with the live `.claude/settings.json`).

## Summary

Tasks: T0 to T5 done of T0 to T6; T6 (the squash) follows this commit. Planned 12 tasks, with batches 3 and 4 closed in
one gate run; nothing was skipped.

Gates at this close: `npm test` exit 0 (46,126 passed, 4 expected fail; coverage 97.17 / 92.87 / 97.85 / 98.15),
typecheck, lint, build and format:check pass. `verdict-diff` against `2a70cec76` exit 0, lost 0.

Verdicts: `wire` 0 / 0 / 18 -> 18 / 0 / 0; overall 5,666 -> 5,684 conformant of 5,927 (diverged 148 -> 130).
Authored: 113 fixtures, 112 at 0 diffs or jar error pairs. One open row, `cov-embedded-state-note`, on #168.
`dist/*.d.ts` identical to the base. `oracle/accepted-divergences.json` unchanged; no divergence added.

**CI risk:** the wire ratchets add 251 test cases and routing and refusal each gain 18 golden twins. The latest CI run
with shard data (`42712716665`, 2026-11-09, before this branch) took 8 m 16 s on the slowest shard (shard 3) and 18 m 54 s in
all. Per-test blobs have a 1-day retention, so its routing and refusal part times could not be read. Expect the slowest
shard to rise by well under a minute; a timeout there with no diff is a runner-load flake, not a regression.

Issue comments for #128 and #136 are unposted (denied by the classifier); text in `.agent-notes/wrp-T5.md`.
