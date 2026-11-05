# object-divergence-drive (odd)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #115. Planned unattended on 2026-11-05 at `feature/parity-queue` `c10ae4f18`.

## Objective

Take the **16 open `object` rows** to conformant, and pin every conformant `object` row in the `svg-object` ratchet, the 30 unpinned ones included. Lose no conformant row in any engine, and regenerate `docs/parity-report.md`. A row that cannot reach the jar ends by D8, never unnamed.

## Starting state, measured 2026-11-05 on `c10ae4f18`

A fresh `npm run svg:survey -- object` equals the committed file: 81 rows, 65 conformant, 8 structural-match, 8 diverged. The issue's 16 open rows still stand, and its comment's `robitu-34-vupe367` is conformant and unpinned. **Pins:** 35 of 65.

"Status" says what planning established. **Read** means the Java and the arithmetic agree with the row. **Lead** means the upstream side was read, or an experiment narrowed it, but the port's side was not instrumented. Open the code and confirm a lead before fixing it.

| Row (diffs today) | Mechanism | Status | Task |
|---|---|---|---|
| `lisepi-64` (2), `gubene-80` (8, part) | `user` is `ent0004` and the link `lnk3` in the jar. `CommandCreateMap.java` `executeNow` runs `new Link(...)` inside the row loop; `Link.java:135` and `Entity.java:171` draw from one counter. Our linked map row in `class-map-commands.ts` carries no `creationIndex` | Read | T1a |
| `gatefi-65` (2), `style-stereotype-on-arrow-7` (2) | Canvas 1 px wide on maps with no rows. `TextBlockMap#drawU` loops over nothing, so no `ULine` reaches `x + w`; `LimitFinder.java:184-188` bounds the rect at `x + w - 1` | Read; our sizer's route is a lead | T1b |
| `sivapa-41` (16), `satuco-50` (23) | Arrowhead on the source end. Jar probes on 2026-11-05: `left to right direction` with a single-dash port edge fails; TB, `-->`, and class leaves all give 0 diffs. `class-edge-geo.ts` `matchesFromTo = dotSwap === reversed` contradicts the comment above it. `SvekEdge.java:636-655` reverses the path and never moves a decor | Lead | T1c |
| `gubene-80` | `header { FontColor red; BackGroundColor palegreen }` at the top of `<style>`: jar text `#F00` and a `#98FB98` `path` header. `EntityImageObject.java` `getStyleHeader` merges `root.element.objectDiagram.object.header`, so a bare `header` selector matches. Nested `object { header {` already works (`lisepi-64`) | Read; our read is a lead | T2a |
| `tenalu-53` (22) | Fill `#F08080` against `#ADD8E6`: `skinparam object { <<Foo1>> { BackgroundColor } }` reaches the jar's merged style with the stereotype (`EntityImageObject.java` `getStyle`, `withTOBECHANGED`) | Read | T2a |
| `lunike-70` (205) | `aws-orange` has `skinparam object { AttributeFontSize 11 }` (`puml-theme-aws-orange.puml:456`); `FromSkinparamToStyle.java:201` `addConFont("objectAttribute", SName.object)` makes it the object's `FontSize`, so the jar's name is 11 where ours is 12 | Read | T2b |
| `tenalu-53` | Box 2 px short under a font below 10: `AtomText.java:179-181` `if (h < 10) h = 10`. Jar grid: object name block 14 tall for sizes 6, 8, 9, 10 and 15 at 11 | Read | T2c |
| `tenalu-53` | `y` 7.167: `LimitFinder.java` `drawText` `y -= dim.getHeight() - 1.5`, so a 12 px stereotype's ink top is 1.167 above the box, past the rect's 1. This is the dss follow-on 22 offset, also noted on 3 json leaves | Read | T2c |
| `nulixu-97` (13), `sibika-09` (13), `vocute-12` (13) | Under `classAttributeIconSize`, rows step `size + 1` and text centres in the row: `PlacementStrategyVisibility.java` `getPositions`, `2 + y + (maxHeight12 - height1) / 2` and `y + (maxHeight12 - height2) / 2`. Pitch 15, 17, 21 and offset 0.5, 1.5, 3.5 match all three rows | Read | T2d |
| `pikuba-31` (113) | `isBodyEnhanced` has a `CreoleParser.isTableLine` trigger (`BodierLikeClassOrObject.java:93-100`). `class-body-enhanced.ts:21-26` says it has zero corpus reach and skips it: this row reaches it. `Object o1` draws the table too and `OBJECT` is not `LIKE_CLASS` (`LeafType.java:85-88`), so it reaches the table another way | Read for `entity`; lead for `object` | T3a |
| `maxosa-84` (41) | `BodierMap#getBody` passes `style.wrapWidth()` through `TextBlockMap.java:176-178`. `measureMapCell` does not wrap; `class-json-sizing.ts:338-341` is the sibling that does | Read | T3b |
| `togixe-65` (71) | `state state` under `allow_mixing`: `CommandCreateElementFull2.java:239-241` gives `LeafType.STATE`, and `GeneralImageBuilder.java:130-143` returns `EntityImageState`. We draw a class box with a circle | Read | T3c |
| `zicope-62` (24), `zuvila-56` (8) | A map cell holding `{{` draws an `<image>`, through `Display` to `CreoleParser.java:152`. `measureMapCell` draws the literal text | Lead | T3d |

`compareSvg` short-circuits, so expect residual diffs under every row above.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**. Do not create another branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and tags `object-divergence-drive/pre-squash`. Never push: the user reviews, signs and opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog` (drift-gated). A `vitest run <paths>` that collects nothing exits 0: read the count. Baseline on `c10ae4f18`: 40983 passed in 1968 files, coverage 97.29/93.1/98.01.

## Measurement commands

Tools are under `plans/object-divergence-drive/measurements/`, plus `verdict-diff.mjs` from `plans/description-divergence-drive/measurements/`. Run with `node` or `npx jiti`. Type commands literally: the allowlist has no `bash plans/...`, `date`, or shell-variable prefixes. Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- Survey, about 35 s, always with `--out`: `npm run svg:survey -- object --out /tmp/odd-<task>/parity-object.json`. A positional type with no `--out` clobbers `parity.json`.
- `node plans/object-divergence-drive/measurements/object-moves.mjs /tmp/odd-b0/parity-object.json /tmp/odd-<task>/parity-object.json`: moved rows; exit 1 on a loss.
- `npx jiti plans/object-divergence-drive/measurements/row-diffs.mts /tmp/odd-<task>/parity-object.json /tmp/odd-<task>/diffs.json [slug ...]`: every diff of the rows, and our SVG beside the JSON.
- `npx jiti plans/object-divergence-drive/measurements/probe.mts <in.puml> <oracle.svg> [limit]`: one authored source against its oracle.
- `npx jiti plans/object-divergence-drive/measurements/pin-object.mts [--write]`: pin candidates; dry run today prints `pins 30`.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every engine, at batch close. Exit 1 on a loss.
- `scripts/oracle-render.sh <out-dir> <puml>` for an authored oracle, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D10: amend `decisions.md` with the date, then halt.
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other rows; halt only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, or merging two whose rows turn out to share a mechanism.
- A residual diff a fix uncovers on these rows. Read the Java and fix it in the task that owns it, or add a task.
- Authored `.puml` fixtures and oracles where a branch has no corpus row.
- A correct fix that raises another row's diff count (`compareSvg` is not monotonic): journal the row with its mechanism.
- Helper splits forced by the 500-line, CCN or NLOC hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's issue: T5 comments there.

## Blast radius

**Data model:** none. **API:** no public change; `dist/*.d.ts` checked at T5. **Dependencies:** none. **SVG output** changes on purpose; `plantuml-ts` has no consumers to protect. The seams other engines read are `class-body-enhanced.ts` (class, usecase), the class edge decor pairing (T1c), and `<style>` header reads (json, map, object): `verdict-diff.mjs` names any row they move.

| File | Action | Task |
|---|---|---|
| `src/diagrams/class/class-map-commands.ts` | Modify | T1a |
| `src/diagrams/class/class-map-sizing.ts`, `class-object-sizing.ts` | Modify | T1b, T2c, T3b, T3d |
| `src/diagrams/class/class-edge-geo.ts` | Modify | T1c |
| `src/diagrams/class/object-kind-style.ts`, `renderer-classifier-box.ts`, `renderer-classifier-colors.ts` | Modify | T2a, T2b |
| `src/core/skinparam-key-handlers-table-*.ts` or the bucket they feed | Modify | T2b |
| `src/diagrams/class/class-object-map-header.ts` | Modify | T2c |
| `src/diagrams/class/class-object-fields.ts`, `class-member-rows.ts` | Modify | T2d, T3a |
| `src/diagrams/class/class-body-enhanced.ts` | Modify | T3a |
| `src/diagrams/class/class-layout-helpers.ts`, `renderer.ts`, a new state-leaf module | Modify, Create | T3c |
| `src/diagrams/class/class-body-enhanced-embeds.ts` | Read, maybe Modify | T3d |
| `tests/oracle/svg-conformance/object.golden.ratchet.test.ts`, `oracle/goldens/svg-object/**`, `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` | Modify | T4b |
| `tests/oracle/svg-conformance/parity-*.json`, `census-object.json`, `docs/parity-report.md`, `scripts/parity-dashboard-notes.ts`, `planning/next-missions.md` | Modify | T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — map links and canvas](batch-1/overview.md) | T1a-T1c | [x] |
| [2 — object style and header](batch-2/overview.md) | T2a-T2d | [x] |
| [3 — bodies and leaves](batch-3/overview.md) | T3a-T3d | [x] |
| [4 — probes past the rows, then pins](batch-4/overview.md) | T4a, T4b | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [ ] |

## Done when (issue #115)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md) — D1 to D10, operational readiness.
- [task-contract.md](task-contract.md) — what every task does and how it closes.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated: editing it would break that identity (the SessionStart hook compares them).

## Summary

Tasks: T0 to T5, 14 of 14. T2a with T2b and T3b with T3d merged, each pair one seam (journal rows 6, 11).

Verdicts on `object`, base to final: 65/8/8 to **81/0/0**. Pins 35 to **81**. Other engines: class 831 to 833 (`lefoli-46`, `godage-48`), 0 lost everywhere; `state`, `unknown`, `usecase`, `json` unchanged.

Gates on the final tree: 41256 passed in 1980 files, coverage 97.3/93.1/98.02, typecheck, lint, build 0.

Rows left: none of the 16. Past the rows: `unknown/dulone-62` and `unknown/losote-76` could go conformant and are held as signed (#143), on the new needs-ruling #152; the `ports-decors` probe is `docs/graphviz-issues/41`, dot-engine, no corpus row.

Decisions flagged for review: journal row 16, ruling #143 taking precedence over a mirror T4a built and backed out. `src/diagrams/class/class-state-leaf.ts` adds three layering allowlist entries, class to state (D7).

Known follow-up: the brief's comment on #140 about the two class rows was not posted, see journal row 17.
