# state-note-embed (sne)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #168 (filed from #127 tep T4d, confirmed by #128 wrp T3c). Planned unattended on
2026-11-17 at `feature/parity-queue` `e5e5763a3`.

## Objective

In the jar a `{{ … }}` block in a state note is one embedded diagram: `EntityImageNote.java:117` builds the body
with `BodyFactory.create3`, `BodyEnhanced2` keeps the block as one display run, and `CreoleParser#createSheetSlow`
turns it into one `EmbeddedDiagram` atom. `Opale.java:127` (and `EntityImageNote.java:288` for a plain note) draws
that body at `(marginX1, marginY)` = `(6, 5)`, so the atom is one `<image>`. This port sizes the note correctly but
draws the block's source lines as note text. This mission:

1. draws an entity note's embed as an `<image>`, and pins the two held rows at 0 (batch 1);
2. ports the same embed into `note on link`, and makes an unterminated `{{` in a state note a syntax error as the jar
   does (batch 2);
3. holds every probe as an authored fixture with its jar oracle.

## Starting state, measured 2026-11-17 on `e5e5763a3`

`npx tsx plans/state-note-embed/measurements/measure-rows.mts /tmp/sne-t0.json` prints
**rows 10 zero 0 open 10 error 0**. Probes and their jar oracles: [measurements/probes/](measurements/probes/).

| Row | What | Diffs (weighted) | `<image>` ours/jar | Canvas ours/jar |
|---|---|---|---|---|
| `timing/cov-embedded-state` (held, authored) | `{{` timing in `note right of` | 1 (55) | 0/1 | equal, 285x146 |
| `wire/cov-embedded-state-note` (held, authored) | `{{wire` in `note right of` | 1 (53) | 0/1 | equal, 209x162 |
| `composite` | embed in a note inside `state C { }` | 1 (27) | 0/1 | equal |
| `free` | `note as N` with an embed, linked | 1 (27) | 0/1 | equal |
| `lr` | `left to right`, `note bottom of`, `{{` usecase | 1 (27) | 0/1 | equal |
| `mixed` | text, embed, text | 2 (28) | 0/1 | equal |
| `sep` | text, `--` separator, embed | 1 (41) | 0/1 | equal |
| `two` | two embeds, outer `skinparam classBackgroundColor` | 1 (54) | 0/2 | equal |
| `link` | `note on link` with an embed | 27 (53) | 0/1 | 114x240 / 134x269 |
| `open` | `text` then an unterminated `{{` | 6 (123) | 0/0 | 660x271 / 384x120 (jar error page) |

- Every entity-note canvas already matches: `measureNote` sizes through `buildNoteBody`, whose `CreoleParser` path
  builds the `EmbeddedDiagram` atom. Only the draw is wrong: `renderer-note.ts#renderNoteTextLines` draws
  `buildRenderLines`, the state creole block, which has no embed stripe.
- `link` is wrong in size and draw: `state-transition-label.ts:332-345` measures and draws the link note as text.
- `open`: the jar answers `Syntax Error?` at line 3. `PSystemCommandFactory#isMultilineCommandOk` counts the `{{`
  as a nesting level (`src/core/command/multiline-candidate.ts` ports it), so `end note` never closes the note.
- `compareSvg` stops at a `childCount` mismatch: assert `<image>` count, size and position explicitly in tests.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `state-note-embed/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Pinning moves `docs/parity-report.md`: run
  `npm run parity:dashboard` at every batch close that pinned.
- Never write under `src/`, `tests/`, `docs/` or `plans/` while a gate is running.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Rows and probes:** `npx tsx plans/state-note-embed/measurements/measure-rows.mts [out.json] [extra.puml...]`.
- **State survey:** `npm run svg:survey -- state --out tests/oracle/svg-conformance/parity-state.json`. Without
  `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Held-row baselines:** `npx jiti plans/timing-engine-port/measurements/build-authored-baseline.mts <commit> --write`
  and `npx jiti plans/wire-engine-port/measurements/build-authored-baseline.mts <commit> --write`.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D7. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D6).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A probe whose residual is a different mechanism from the note embed (D1, "separable"): measure it, file a
  `queue:ready` + `parity` issue with the measurement and `file:line`, add `Blocked by #N.` to #136 if `gh` allows
  (else say so in the #136 comment), name it in the journal, continue.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Authoring extra probes (`note top of`, a `{{salt` note, a note `#color`, an embed inside a `note as N` in a
  composite) and their oracles when a mechanism needs them; each joins the authored gate.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.
- Deleting a now-false comment that says state notes cannot embed (e.g. `oracle/goldens/svg-timing/README.md:36`,
  `scripts/parity-dashboard-notes.ts:90`).

## Blast radius

- **Data model / API:** none. New fields on the internal `NoteSpec` / `StateNodeGeo` only; `dist/*.d.ts` must not
  move (D6).
- **Dependencies:** nothing new. The atom is `core/svek/edge-label-embed.ts#edgeLabelEmbedAtom` (ele, #144), drawn
  through `UImageSvg` (DIVERGENCES.md:1361, retired).
- **Behaviour:** only notes whose display holds a line where `getEmbeddedType` hits (D2), plus the unterminated-`{{`
  parse (T2b). Embed-free notes keep today's path, guarded by the state ratchet and the every-engine survey.

| File | Action | Task |
|---|---|---|
| `src/diagrams/state/state-note-layout.ts`, `renderer-note.ts` (`materializeNoteSpec`), `state-geo-types.ts` | Modify | T1a |
| `tests/unit/state/sne-note-stripes.test.ts` | Create | T1a |
| `src/diagrams/state/renderer-note.ts` (draw), `state-renderer-transitions.ts`, new `state-embed-draw.ts` | Modify / Create | T1b |
| `tests/fixtures/state-note-embed/*.{puml,svg}`, `tests/oracle/svg-conformance/state-note-embed.authored.test.ts` | Create | T1b, rows added T2a/T2b |
| `oracle/goldens/svg-{timing,wire}/authored-baseline.json`, `tests/oracle/svg-conformance/{timing,wire}.diff-baseline.ratchet.test.ts` | Modify | T1b |
| `src/diagrams/state/state-transition-label.ts`, `renderer-note.ts#renderNoteOnLink`, `state-renderer-transitions.ts` | Modify | T2a |
| `src/diagrams/state/state-commands-notes.ts` (or the state note multiline reader), its unit test | Modify / Create | T2b |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `docs/catalog.md`, `planning/next-missions.md` | Modify | batch closes, T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: entity notes (the rows)](batch-1/overview.md) | T1a, T1b | [x] |
| [2: note on link, unterminated `{{`](batch-2/overview.md) | T2a, T2b | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #168)

- [x] `timing/cov-embedded-state` and `wire/cov-embedded-state-note` are at 0 diffs, held at 0 in their authored
  baselines, and gone from each gate's `OPEN_ROWS`.
- [x] Every probe is at 0 diffs in the authored gate (an error pair counts, per the 2026-10-10 rule), or its residual
  is on a filed issue the journal names with its measured mechanism (D1).
- [x] No new divergence (D4).
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D7, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `measure-rows.mts` and `probes/` (8 `.puml` + jar `.svg`).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx jiti`, `npm`, `scripts/oracle-render.sh`, `gh issue`). Deliberately not regenerated: the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-17)

**Tasks:** 6 of 6 done (T0, T1a, T1b, T2a, T2b, T3); T4 squashes. One commit per task plus a close
commit per batch. Decisions journaled: 25 rows; none flagged for review. One issue filed (#209); no `needs-ruling`.

**Gates** (batch 2 close, `501e0c2a5`): `npm test` 2302 files passed (1 skipped) / 49496 tests, coverage
96.96/92.55/97.43/98.00; typecheck, lint, build, format:check exit 0. Base: 2299 files / 49458 tests.

**Verdicts, per engine:** unchanged in every engine against `e5e5763a3` (`verdict-diff.mjs`: lost 0, timeout or
errored 0; every `parity-*.json` fixture field identical bar `generatedAt`). State 299/299 before and after.

**Rows and probes:**

| Row | Before (diffs, `<image>` ours/jar) | After |
|---|---|---|
| `timing/cov-embedded-state` | 1, 0/1 | 0, 1/1 |
| `wire/cov-embedded-state-note` | 1, 0/1 | 0, 1/1 |
| `composite`, `free`, `lr`, `sep` | 1 each, 0/1 | 0, 1/1 |
| `mixed` | 2, 0/1 | 0, 1/1 |
| `two` | 1, 0/2 | 0, 2/2 |
| `link` | 27, 0/1, canvas 114x240 vs 134x269 | 0, 1/1 |
| `open` | 6, we draw where the jar errors | error pair at line 3 |
| authored `sep-title`, `sep-double`, `top`, `color`, `salt`, `link-composite`, `link-label`, `link-mixed`, `embed-endnote` | — | 0 each |
| authored `open-free`, `open-link`, `open-plain` | — | error pairs (lines 3, 5, 3) |

**d.ts:** `dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` byte-identical to the T0 snapshot (D6).

**Divergences:** `oracle/accepted-divergences.json` and `DIVERGENCES.md` unchanged (D4).

**Follow-ons:** #209 (an embed-free state note's `--` separator draws as text; the stripe path's block walk already
handles it behind D2's embed guard).

**CI risk:** low. The latest PR run (44141954530) had shard 3 slowest at 10m05s; this mission adds ~45 tests, the
heaviest being the 20-row authored gate (each row one render with a nested diagram).
