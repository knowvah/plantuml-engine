# packet-engine-port (pep)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #117. Planned unattended on 2026-11-05 at `feature/parity-queue` `a1427cdf2`.

## Objective

Replace `src/diagrams/packetdiag/` with a file-for-file port of `net/sourceforge/plantuml/packetdiag/` on the klimt layer, the way chart was ported (D1, D2). Take the **6 `packet` rows** to conformant, bring in upstream's **62 `vega/packet` sources** as authored fixtures (D4), probe past both, and pin everything in a new `svg-packet` ratchet. Lose no conformant row in any engine, and regenerate `docs/parity-report.md`. A row that cannot reach the jar ends by D7, never unnamed.

## Starting state, measured 2026-11-05 on `a1427cdf2`

A fresh `npm run svg:survey -- packet --out /tmp/...` gives 6 rows, **0 conformant, 0 structural-match, 6 diverged**, first diff `svg/g[1]/text[1]/@text-anchor` on all six: the issue's numbers still hold. No ratchet exists. The routing gate pins all 6 as `known-misroute` with `ourType: NONE`, stale since the plugin draws them as `PACKET` (chart's T5 precedent). `src/diagrams/packetdiag/` is 611 lines of a parse, layout and string-render pipeline that was never faithful: its own comments call the 0.5 stroke "this port's own visual choice", where it is `element { LineThickness 0.5 }` (`skin/plantuml.skin:93`).

`row-diffs` on the 6: `packet-auto-position` 47, `packet-colwidth-8` 30, `packet-rtl` 39, `packet-spanning-field` 47, `packet-tall-field` 45, `packet-tcp-header` 87.

Upstream `src/test/resources/vega/packet/` holds 62 `.puml`; through today's engine `probe-dir` puts **0 of 62 at zero**. Through `scripts/oracle-render.sh` on 2026-11-05, **57 draw `PACKET` and 5 are jar error pages** (`R07.01-Range_Error1`, `R07.02-Range_Error2`, `R11.01-len_0`, `R23.01-error`, `error-with-exception`).

"Status" says what planning established. **Read** means the Java and the oracle agree. **Probe** means a jar render on 2026-11-05 showed it. Every task still opens the Java itself.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| `PacketDiagram extends TitledDiagram`; the body is one `TextBlock`: indicators across, then the block grid row by row | `PacketDiagram.java:80`, `getTextBlock:148-212` | Read | T1b, T1c |
| Canvas 735 wide on `packet-tcp-header`: 17 indicators × `bitWidth` 42, plus margin 10 each side and `+1`. `bitWidth = FontSize × 3`, set in `build()` after layout | `adjustBitWidth:463-466`, `calculateDimension:152-180` | Read + Probe | T1b, T3a |
| Height sums each row's **last** block height, not its maximum (`rowHeight = dim.getHeight()`) | `PacketDiagram.java:164-173` | Read | T1c |
| Indicator ticks are `<path d="M10,24 L10,56">`, not `<line>`: `nwdiag.VerticalLine` draws a `UPath` with no fill | `PacketIndicator.java:198-214`, `nwdiag/VerticalLine.java` `drawU` | Read + Probe | T1a, T1c |
| Full tick every `colWidth / 4` bits (all of them under 4), a number every `scaleInterval`, default `colWidth / 2`, clamped to `[1, colWidth]` | `getFullIndicatorInterval:260-262`, `updateScaleInterval:273-278`, `build:374-382` | Read | T1b |
| Numbers are `CreoleMode.NO_CREOLE`, centred by `-width / 2`; the number's height is always measured, drawn or not | `PacketIndicator.java:127-142`, `:180-183` | Read | T1c |
| Text has `textLength` and no `text-anchor`: the label is a creole `SIMPLE_LINE` `Display` centred by `mergeTB`, stroke and fill from `root.element.packetdiagDiagram.rectangle` | `PacketBlock.java:227-231`, `getStyle`, `getShapeTextBlock` | Read + Probe | T1c |
| A label wider than its block is cut char by char and gets `...` | `PacketBlock.java:233-253` | Read | T1c, T3c |
| A field spanning rows splits into full-row blocks plus a remainder; `rowCnt = width / colWidth` after the reset | `adjustLayout:411-458`, `fitPacketInRow:474-487` | Read | T1b |
| `leftOpen`, `rightOpen` and `openerStroke` are set and **never drawn**: split blocks are closed rectangles | `PacketBlock.java:78`, `getShapeTextBlock` | Read | T1c |
| `rotate` is parsed and stored, then dropped: `toPacketBlock` never passes `textRotation`. `R12.01-rotate_270` draws `A` upright | `PacketDiagram.java:342-346`, `toPacketBlock:521-528` | Read + Probe | T1b |
| The start bit is never a position: `1-10: server` draws from x=10 like bit 0. Only the width is laid out | `PacketItem.ofRange:516-519`, `R17.01-color` | Read + Probe | T1b |
| `[color=..., textcolor=..., linecolor=...]`, `label`, `description`, `numbered` are parsed by `toSet` and ignored: only `len`, `rotate`, `height` are read | `CommandNumRange.java` `getIntAttribute` callers; `R17.01-color` fills `#F1F1F1` | Read + Probe | T2a |
| Attributes come from `NwDiagram.toSet`, pattern `\s*(\w+)\s*=\s*("([^"]*)"\|[^\s,]+)` | `nwdiag/NwDiagram.java:288-303` | Read | T1a |
| `skin rose` reaches the rect: `#FEFECE`, stroke `#A80036` at 1, a shadow filter | merged style; `R18.01-skin` | Probe | T3b |
| `4-2: x` is a jar crash page (`IllegalArgumentException`); `* A [len = 0]` is a jar error | `R07.01`, `R11.01`, vega `error-with-exception` | Probe | T3b |

Probe sources and oracles are in `/tmp/pkt-plan/` only for planning; T3b re-renders them into `tests/fixtures/packet/`.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**. Do not create another branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and tags `packet-engine-port/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports need `npm run catalog` (drift-gated). A `vitest run <paths>` that collects nothing exits 0: read the count. The baseline counts on `a1427cdf2` are in [decisions.md](decisions.md#baseline).

## Measurement commands

Tools are under `plans/packet-engine-port/measurements/`, plus `verdict-diff.mjs` from `plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, always with `--out`: `npm run svg:survey -- packet --out /tmp/pep-<task>/parity-packet.json`. A positional type with no `--out` clobbers `parity.json`.
- `node plans/packet-engine-port/measurements/packet-moves.mjs /tmp/pep-b0/parity-packet.json /tmp/pep-<task>/parity-packet.json`: moved rows; exit 1 on a loss.
- `npx jiti plans/packet-engine-port/measurements/row-diffs.mts /tmp/pep-<task>/parity-packet.json /tmp/pep-<task>/diffs.json [slug ...]`: every diff, and our SVG beside the JSON.
- `npx jiti plans/packet-engine-port/measurements/probe.mts <in.puml> <oracle.svg> [limit]`: one source against its oracle.
- `npx jiti plans/packet-engine-port/measurements/probe-dir.mts tests/fixtures/packet`: every `<slug>.puml` beside its `<slug>.svg`, one line each.
- `npx jiti plans/packet-engine-port/measurements/pin-packet.mts [--write]`: pin candidates.
- `npx jiti plans/packet-engine-port/measurements/build-authored-baseline.mts <commit> [--write]`: the authored baseline, from T4 on.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every engine, at batch close. Exit 1 on a loss.
- `scripts/oracle-render.sh <out-dir> <puml...>` for an oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary. The packet rows of `svg-lengthadjust/authored-baseline.json` and `document-background.json` are expected to **fall**; a rise there is this stop.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D9: amend `decisions.md` with the date, then halt.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- Authored `.puml` fixtures and oracles where a branch has no corpus row or vega source.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D8).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's issue: T5 comments there.

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T5. `PacketDiagramAST` and `PacketGeometry` are internal, and `plantuml-ts` has no consumers. **Dependencies:** none; this engine never reaches graphviz or dot-engine. **SVG output** changes on purpose. **Shared seams:** a new `src/diagrams/nwdiag/` holding only `VerticalLine.ts` and `NwDiagram.ts#toSet`, with two layering allowlist entries (D3); `{{packetdiag}}` through `core/EmbeddedDiagram.ts`; `core/assemble-svg.ts` may need `PACKET` on the titled path, as chart did.

| File | Action | Task |
|---|---|---|
| `src/diagrams/nwdiag/VerticalLine.ts`, `src/diagrams/nwdiag/NwDiagram.ts`, `tests/architecture/layering.test.ts` | Create, Modify | T1a |
| `src/diagrams/packetdiag/PacketDiagram.ts`, `packet-skin-param.ts` | Create | T1b |
| `src/diagrams/packetdiag/PacketBlock.ts`, `PacketIndicator.ts`; `PacketDiagram.ts#getTextBlock` | Create, Modify | T1c |
| `src/diagrams/packetdiag/command/Command*.ts`, `PacketDiagramFactory.ts` | Create | T2a |
| `src/diagrams/packetdiag/index.ts` | Rewrite | T3a |
| `src/diagrams/packetdiag/{ast,parser,layout,renderer}.ts` | **Delete** | T3a |
| `tests/unit/packetdiag/**` | Rewrite and delete | T1a to T3a |
| `tests/unit/{utility-registration,sprite-parsers,annotations-style,block-extractor}.test.ts`, `tests/unit/core/{document-back-color,EmbeddedDiagram,diagram-type-set}.test.ts`, `src/core/assemble-svg.ts` | Modify if they break | T3a |
| `oracle/goldens/document-background.json`, `oracle/goldens/svg-lengthadjust/authored-baseline.json` | Modify (shrink) | T3a |
| `tests/fixtures/packet/**` | Create | T3b, T3c |
| `oracle/goldens/svg-packet/**`, `tests/oracle/svg-conformance/packet.golden.ratchet.test.ts`, `packet.diff-baseline.ratchet.test.ts`, `render-fixture-packet.ts` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their two count tests | Modify | T4 |
| `scripts/parity-dashboard-goldens.ts`, `scripts/parity-dashboard-notes.ts:121`, `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `census-packet.json`, `planning/next-missions.md`, `docs/catalog.md` | Modify | T4, T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — nwdiag seams, diagram, blocks](batch-1/overview.md) | T1a-T1c | [x] |
| [2 — commands and factory](batch-2/overview.md) | T2a | [x] |
| [3 — turn on, vega, probes](batch-3/overview.md) | T3a-T3c | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #117)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism. (6/6 cached rows conformant; 132 of 146 fixtures at 0, the 14 others jar errors where we also error: journal rows 24, 30)
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue. (No new divergence, no row needed a ruling)
- [x] 0 conformant losses in every engine, baseline survey against final survey. (`verdict-diff a1427cdf2`: lost 0, journal rows 25, 33)
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated. (`svg-packet` 6 pins, `pin-packet.mts` prints `pins 0`: journal row 30)
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. (journal rows 33, 34)

## Documents

- [decisions.md](decisions.md) — D1 to D9, operational readiness, baseline.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated: editing it would break that identity (the SessionStart hook compares them).

## Summary (2026-11-05)

- **Tasks:** T0, T1a, T1b+T1c (merged: `build()` constructs T1c's `PacketIndicator`), T2a, T3a, T3b, T3c, T4, T5 done; T6 squashes. 9 of 9 planned units.
- **Verdicts:** `packet` 0/0/6 → 6/0/0, all 6 pinned in `svg-packet`. Across every engine: 0 lost, 7 gained (packet 6, activity `limazo-01-ximu737` through the creole-mode fix).
- **Fixtures:** 62 vega sources (57 draw, all at 0; 5 jar errors, we error) and 84 authored `cov-*` (75 draw, all at 0; 9 jar errors, we error). `authored-baseline.json`: 146 rows, 132 at 0, 14 `jarError`.
- **Shared fixes, each at its origin:** core `Fashion` ported whole and `Style#getSymbolContext` added (`Style.java:270-286`); `CreoleParser` passes its creole mode to stripe classification (`CreoleParser.java:113`) and NO_CREOLE returns plain text (`CreoleStripeSimpleParser.java:86-90`). A controlled render of all 5927 cached fixtures moves only `limazo-01` for the creole change, toward the jar.
- **Gates:** final run 2000 files, 41999 passed, 4 expected fail, coverage 97.33/93.2/97.96; typecheck, lint, build, format:check exit 0. Batch 3 needed two fix attempts (activity census equality pins, then restoring a never-rises ceiling the re-pin tool had lowered to 0): journal rows 27-29.
- **Decisions flagged for review:** journal rows 4 (the brief's `VerticalLine` acceptance contradicted the Java), 7 (core `Fashion`/`Style` outside the write-set), 17 (refusal `consumed` counts the offending line, unlike chart), 31 (packet fixtures render with the survey's asset store).
- **Rows left:** none; no `needs-ruling` issue, no new queue issue.
- **Not done:** the T5 comments on #124 and #121 were denied by the auto-mode classifier (External System Writes); their texts are in `.agent-notes/pep-T5.md` for the user to post.
- **CI risk:** `svg-packet` adds 6 golden and 146 authored ratchet rows, small against cep's 193; the slowest shard was 564 s on #153, unmeasured since. Follow-ons in `planning/next-missions.md` under pep.

