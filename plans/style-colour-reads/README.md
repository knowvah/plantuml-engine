# style-colour-reads (scr)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then [decisions.md](decisions.md), then
[task-contract.md](task-contract.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

Source: GitHub issue #122. Planned unattended on 2026-11-06 at `feature/parity-queue` `8fe32c695`.

## Objective

Close the colour reads and tidying that dss left behind (its follow-ons 17 to 22, `planning/next-missions.md`). Each
in-scope row ends conformant or named with its mechanism (D9). Lose no conformant row in any engine, pin every
conformant row, and regenerate `docs/parity-report.md`.

## Starting state, measured 2026-11-06 on `8fe32c695`

Baseline gates on `8fe32c695`, run 2026-11-06 at planning: `npm test` 2053 files passed (1 skipped), 42769 tests
passed; `lint` exits 0. The issue's numbers are dated, so every item was re-measured with 100 authored rows
(`measurements/gen-rows.mjs`, oracles by `scripts/oracle-render.sh`, counts by
`plans/style-mode-cascades/measurements/rows.mts`, saved as `measurements/planning-rows.json`). **15 rows are open, in
4 mechanism families.** 85 are at 0 and become guards. No corpus row is open on these mechanisms: of the cached
sources that use `kermor`, `HeadColor`, `FontColor transparent` or `skinparam noteBackgroundColor` (3, 11, 5, 9), all
are conformant.

| Family | Open rows (diffs) | Evidence (read 2026-11-06) | Task |
|---|---|---|---|
| F1 kermor group note | `component__kgn-style-comp` 2, `-style-seq` 2, `-stereo-style` 2, `-bottom-colour` 2 | `Cluster#getCucaNote` builds `EntityImageNoteLink(note.getDisplay(), note.getColors(), …)` (`Cluster.java:393-399`), signed `ComponentType.NOTE` = `{root, element, sequenceDiagram, note}` (`EntityImageNoteLink.java:61-65`, `ComponentType.java:98-99`). Ours: `renderer-cluster-note.ts#drawKermorGroupNote` reads the `note` bucket through a probe node with no colour | T1a |
| F2 state arrow `HeadColor` | `state__head-arrow` 4, `-element` 4, `-skinparam` 4, `-transparent` 1 | `SvekEdge.java:873-892` builds `Rainbow.build(styleLine, …)`, which reads `PName.HeadColor` (`Rainbow.java:84-94`); a link colour replaces both. `drawRainbow` (`SvekEdge.java:1108-1135`) draws a line, not the head, when the head is transparent. Class, component and usecase rows are at 0; ours reads only `stateDiagram { arrow { HeadColor } }` (`state-link-style.ts:96`) | T1b |
| F3 state note under `skinparam noteBackgroundColor` | `state__noteskin-bg` 2, `-bg-floating` 2, `-bg-link` 2 | Every other engine's row is at 0, class included (dss item 20's class half is closed). Mechanism not yet traced | T1c |
| F4 sequence `FontColor transparent` | `sequence__transparent-font` 15, `-note` 39 (our error page: `note style resolved no FontColor`), `-participant` 1, `-arrow` 1 (a `<text>` the jar omits) | `DriverTextSvg.java:92-93` returns without drawing when the font colour is transparent; the text is still measured. Ours throws at `sequence-note-width.ts:99` and draws the participant and arrow text | T1d |

**Already closed, re-measured at 0 (guards, pinned at T0):** item 17's link-note side (ddd), item 18
(`component__probe-cond-root` 0, pinned), item 19's `xeziki-47` and `fikuga-98` (stdd), item 20's class
`noteBackgroundColor`, item 21 (#116-#118), item 22's `sacupe-57`, `zonamu-61`, `fupumu-08` (ddd) and the map/object
stereotype offset (`object__stereo-*` 0). From the dss notes: `hexagon #pink "label"`, cluster title styles,
stereotype label colours, `skinparam defaultFontColor`, `note left <<foo>>`, `fork <<#red>>`, and `FontColor transparent`
in every engine but sequence. The duplicate `hexagonPolygonPoints` is gone.

**Closed at planning, recorded by T2a:** item 20's nested-class `#000` path. The oracle's nested export takes
`stringBounder.getFileFormat()` (`EmbeddedDiagram.java:130,171`), which the seam's bounder reports as
`SVG_DETERMINISTIC` (`FileFormat.java:185-192`), so `DriverCenteredCharacterSvg.java:65-69` writes a `<text>` spot.
The stock jar draws the same glyph path we draw, coordinates identical (rendered 2026-11-06). Seam artefact, not a defect.

**Needs a ruling (D7):** item 22's `businessActorFill` and `businessUsecaseFill` are written and never read, and they
sit on the public `Theme` in `dist/plantuml-ts.d.ts:4618-4619`. T2a files a `needs-ruling` issue.

## Branch

`feature/parity-queue`, the one branch every queue mission stacks on, already checked out by the driver. T0 commits
this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees** (D8). Do not create another
branch or merge main into this one. The squash batch collapses the mission to **one commit** on the mission base sha
named in the execution prompt, and tags `style-colour-reads/pre-squash`. Never push: the user reviews, signs and
opens the PR for the whole branch.

## Quality gates (all four at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

`npm test`, never `vitest run tests/unit`. New exports may need `npm run catalog` (drift-gated). A `vitest run
<paths>` that collects nothing exits 0: read the count.

## Measurement commands

Tools are reused from earlier briefs. Run with `node` or `npx jiti`. Type commands literally: the allowlist has no
`bash plans/...`, no `java`, no `date`, and no shell-variable prefixes. Producers run **alone**
(`.claude/memory/parallel-surveys-fake-timeouts.md`). Never `cd` below the repo root.

- `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --diffs 5 <prefix ...>`:
  each row's diff count and its first diffs. `--json <out>` writes the pin's shape.
- `node plans/style-mode-cascades/measurements/stock-check.mjs <file.puml ...>`: the stock jar's verdict.
- `node plans/style-colour-reads/measurements/gen-rows.mjs <dir>`, then `scripts/oracle-render.sh <dir> <dir>/*.puml`:
  the authored rows and their oracles (T0, and any row a task adds).
- Survey a bucket, always with `--out`: `npm run svg:survey -- state --out /tmp/scr-<task>/parity-state.json`.
  A positional type with no `--out` clobbers `parity.json`.
- `node plans/unknown-bucket-triage/measurements/ubt-moves.mjs /tmp/scr-b0/parity-<type>.json /tmp/scr-<task>/parity-<type>.json`:
  moved rows; exit 1 on a loss.
- `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: every
  engine, at batch close. Exit 1 on a loss.
- `npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D9: amend `decisions.md` with the date, then halt. This includes any
   `dist/*.d.ts` change (D7).
5. `@knowvah/dot-engine` needs a change. File it (`docs/graphviz-issues/` and `TRACKER.md`) and carry on with other
   rows; halt only if nothing else can move.

A row that needs a ruling is **not** a stop: it goes on a `needs-ruling` issue naming the row, and everything else
finishes. `oracle/accepted-divergences.json` is never edited here (the user signs). A file outside a task's write-set
is not a stop: change it and journal why.

## Push-forward (decide, journal, continue)

- Reordering tasks, or merging two whose rows turn out to share a mechanism.
- A residual diff a fix uncovers: `compareSvg` short-circuits, so expect some. Read the Java and fix it in the task
  that owns it, or add a task.
- More authored rows where a branch has no row, generated and rendered the T0 way (add them to `gen-rows.mjs`).
- A correct fix that raises another row's diff count (`compareSvg` is not monotonic): journal the row with its
  mechanism.
- Helper splits forced by the 500-line, CCN or NLOC hooks.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes, with its Java quote. A gain in another bucket counts for that bucket's
  issue: T3 comments there.
- A mechanism that is genuinely large and separable: file a `queue:ready` issue, add a "Blocked by" line to #136
  (D9), and journal the measurement that proves it.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief, baseline, authored rows](batch-0/overview.md) | T0 | [x] |
| [1 — the four open families](batch-1/overview.md) | T1a-T1d | [x] |
| [2 — tidying and the ruling](batch-2/overview.md) | T2a | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #122)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its mechanism.
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D9, operational readiness.
- [task-contract.md](task-contract.md): what every task does and how it closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief and is
byte-identical to the live `.claude/settings.json`. It was deliberately not regenerated, because editing it would
break that identity (the SessionStart hook compares them).

## Summary (2026-11-06)

**Tasks:** 7 of 7 planned (T0, T1a-T1d, T2a, T3), then the T4 squash. One gate-fix commit per gate failure:
T0's row-count constant and batch 1's catalog drift.

**Rows, family by family (all 15 in scope at 0, pinned in `oracle/goldens/diagram-style-scope.json`):**
- F1 kermor group note: `component__kgn-style-comp`, `-style-seq`, `-stereo-style`, `-bottom-colour` 2 → 0 (T1a).
- F2 state `HeadColor`: `state__head-arrow`, `-element`, `-skinparam` 4 → 0, `-transparent` 1 → 0 (T1b).
- F3 state note skinparam: `state__noteskin-bg`, `-bg-floating`, `-bg-link` 2 → 0 (T1c).
- F4 sequence transparent font: `sequence__transparent-font` 15, `-note` 39, `-participant` 1, `-arrow` 1 → 0 (T1d).

**dss rows:** `rows 1172 open 54` at T0, `rows 1172 open 39` at exit. The 39: 12 stockError pins, 26 json/yaml Smetana
rows (D1 left out), `activity__probe-legacy` (#123). **Pins added:** 100 authored rows at T0; 15 lowered to 0.

**Verdicts per engine:** unchanged in all 29 survey files vs `8fe32c695` (`verdict-diff`: lost 0, no mover, no
timeout). No corpus row was open on these mechanisms (D1), so none moved.

**Gates (batch 2 close, final code):** `npm test` 2057 files passed (1 skipped), 42886 tests; typecheck, lint, build,
format:check exit 0. `dist/*.d.ts` byte-identical to the base build; `oracle/accepted-divergences.json` unchanged.

**Decisions flagged for review:** journal 9 (T1b carries the merged `HeadColor` under a theme symbol key, keeping the
d.ts identical; the public `stateArrowHeadColor` stays as the hand-built-theme fallback); journal 19 (planning's
"identical glyph" was 0.001 off at two coordinates, recorded as such); journal 23 (the batch 1 survey stands for exit).

**Ruling issue:** #156 (`needs-ruling`, `parity`): drop or keep the unread `businessActorFill`/`businessUsecaseFill`.
No row is blocked by it. The #122 summary comment was denied by the auto-mode classifier; its text is in
`unposted-122-comment.md`.

**CI risk:** the dss ratchet grew by T0's 100 rows (1074 → 1174 tests); measured 6.50 s before and 6.44 s after on the
dev box (journal 3), so no measurable cost here, but CI runners are slower.

**Follow-ons:** `planning/next-missions.md`, "style-colour-reads (scr)": #156, the state arrow tag-tier `HeadColor`,
and the captured spot glyph's 0.001 offset.
