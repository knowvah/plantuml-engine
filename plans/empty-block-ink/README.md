# empty-block-ink (ebi)

**At every start and after every compaction, read these first:**

1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #187, ruled by the maintainer on 2026-11-16 (the ruling is in the issue body). Planned
unattended on 2026-11-21 at `feature/parity-queue` `177d1d9e8`.

## Objective

Carry out the #187 ruling, and nothing beyond it:

1. **Mechanism 2: land the faithful `LimitFinder` port (K).** An empty json block's ink ends at `x + w - 1` /
   `y + h - 1` (`LimitFinder#drawRectangle`, `LimitFinder.java:184-188`), because it draws only its rectangle. A
   non-empty block reaches `x + w` / `y + h` through each cell's `UEmpty` (`TextBlockMarged.java:83`,
   `LimitFinder#drawEmpty` `:159-162`). Today `document-dimensions.ts:84-85` pushes `x + w` / `y + h` for every node
   (D1).
2. **Move the ceilings the ruling names:** tighten the 10 that move toward the jar, and raise
   `authored:json/empty-nested`'s dw 0 → 1 with its residue named U-REC (D2).
3. **Mechanism 1: no code.** Correct the DIVERGENCES.md "Smetana-backed diagram types" sentence to the measured
   mechanism, and name the two hcl rows in the row table (D3).

## Starting state, measured 2026-11-21 on `177d1d9e8`

`npx tsx plans/json-family-followons/tools/residue.mts --all` (about 3 s; node / path / dw / dh):

| Row | HEAD | With K (probe, reverted) | Pinned today |
|---|---|---|---|
| `hcl/function-call` | 2.375 / 1.025 / 1 / 0 | 2.375 / 1.025 / **0** / 0 | yes, dw 1 |
| `hcl/for-expression-empty-array` | 1.500 / 1.401 / 1 / 0 | 1.500 / 1.401 / **0** / 0 | yes, dw 1 |
| `json/debako-68-sice023`, `dometa-86-jepe218`, `kicati-76-guvi771`, `letada-23-sisi815`, `sevaji-38-xita618`, `vogeku-38-soxe333` | 4.444 / 6.302 / 0 / 1 | 4.444 / 6.302 / 0 / **0** | yes, dh 1 |
| `json/jidata-48-kire666` | 4.375 / 6.308 / 3 / 5 | 4.375 / 6.308 / **2** / **4** | yes, 3 / 5 |
| `authored:json/nested-arrays` | 3.262 / 2.933 / 3 / 1 | 3.262 / 2.933 / 3 / **0** | **no** |
| `authored:json/empty-nested` | 9.375 / 9.901 / 0 / 9 | 9.375 / 9.901 / **1** / 9 | **no** |

The probe was `const k = n.rows.length === 0 ? -1 : 0` on both maxima. It moved exactly these 11 rows and no other
row of `--all` (196 lines, conformant rows included), matching the #187 measurement made on `1f154d2e4`.

- Neither authored row has a `json-family-positional.json` entry, so no gate holds them today. D2 adds both.
- All 11 rows are `clean` in `oracle/goldens/json-family-structural.json`.
- DIVERGENCES.md: "Row-level table (73 rows)"; "node |Δ| < 1 px on 47 of 69 aligned rows"; the "Measured result"
  paragraph says the two hcl rows "await a ruling on #187"; the "Plus two smaller items" paragraph holds the false
  sentence (`''` "already reproduces Smetana's outcome, no text extent").
- `documentDimensions` has one caller, `src/diagrams/json/layout.ts:423`. yaml and hcl share it, and so does
  every embedded `{{json}}`/`{{yaml}}` image and the state engine's json leaves (`src/diagrams/state/*json*`). The
  every-engine survey at exit is the guard for those.

## Branch

`feature/parity-queue` is the branch every queue mission stacks on, and the driver has already checked it out.

- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, with no worktrees** (D5).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `empty-block-ink/pre-squash`.
- Never push. The user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). D1 adds none.
- Never write under `src/`, `tests/`, `docs/` or `plans/` while a gate is running.

## Baseline

Measured at planning on `177d1d9e8`: journal row 0.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **Residue, every json-family row:** `npx tsx plans/json-family-followons/tools/residue.mts --all [--json <out>]`.
- **One row by attribute:** `npx tsx plans/json-family-followons/tools/residue.mts <json|yaml|hcl> <slug> [--authored]`.
- **One row's diffs:** `npx tsx plans/json-family-followons/tools/diff-one.mts <type> <slug> [--structural]`.
- **Every engine, at exit:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**; exit 1 = a loss).
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, a pinned golden, a `json-family-structural.json` clean row, or a
   `json-family-positional.json` ceiling leaves its bar, and you cannot state its mechanism with `file:line`.
2. A positional ceiling would have to rise **other than** `authored:json/empty-nested` dw 0 → 1 (the ruling), or a
   pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D6, or the #187 ruling. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D6).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`.

**These are not stops:**

- A file outside a task's write-set inside this repository. Change it and journal why.
- `authored:json/empty-nested`'s node / dh residue failing D4's proof. File a `needs-ruling` issue with the
  evidence, name it in the journal, and continue.
- A unit or snapshot test that asserted the old `x + w` document size for a rowless node. Re-derive its expected
  value from the Java (quote `file:line`) and update it in T1.

## Push-forward (decide, journal, continue)

- Probe code (Smetana-size emulation, counterfactuals) under `/tmp`; never committed to `src/`.
- Tightening any other `json-family-positional.json` ceiling that K shrinks, shrink-only.
- Retiring an `oracle/accepted-divergences.json` entry whose row K makes conformant (an embedded yaml/json image).
  The ledger gate requires it; quote the entry's id in the journal.
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model:** none. `json-family-positional.json` keeps its row shape: 9 rows tightened, 2 `authored:` rows added.
- **API:** none. `documentDimensions` keeps its signature; no export changes (D6).
- **Dependencies:** nothing new.
- **Behaviour:** a json/yaml/hcl document whose rightmost or bottommost ink is an empty block shrinks by 1 px on that
  axis, as the jar's does. That includes embedded json/yaml images in other engines.

| File | Action | Task |
|---|---|---|
| `src/diagrams/json/document-dimensions.ts` | Modify | T1 |
| `tests/unit/json/document-dimensions.test.ts` | Create | T1 |
| `oracle/goldens/json-family-positional.json` | Modify | T1 |
| `DIVERGENCES.md` | Modify | T2 |
| `planning/next-missions.md` | Modify | T2, T3 |
| `tests/oracle/svg-conformance/{parity,census}-*.json`, `docs/parity-report.md`, `tests/oracle/svg-conformance/PARITY-SVG.md` | Modify | T3 |
| `oracle/accepted-divergences.json` | Modify, only per push-forward | T3 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: the LimitFinder port and its ceilings](batch-1/overview.md) | T1 | [x] |
| [2: the empty-label sentence and the row table](batch-2/overview.md) | T2 | [x] |
| [exit](batch-exit/overview.md) | T3 | [x] |
| [squash](batch-squash/overview.md) | T4 | [x] |

## Done when (issue #187 ruling)

- [x] K is landed: a rowless node's ink ends at `x + w - 1` / `y + h - 1`, with `LimitFinder.java:184-188` cited.
- [x] The 10 ceilings that move toward the jar are tightened; `authored:json/empty-nested` is pinned at dw 1, named
      U-REC.
- [x] The DIVERGENCES.md sentence states the measured mechanism (graphviz's single-space field plus PAD, 19.75 × 25.5,
      against Smetana's 15 × 17), and the two hcl rows are in the row table.
- [x] 0 conformant losses in every engine, baseline survey against final survey; `docs/parity-report.md` regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D6, operational readiness, and the auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md) and [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npm`, `scripts/oracle-render.sh`, `gh issue`). It was deliberately not regenerated, because the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-21)

- **Tasks:** T0 to T3 done as planned; T4 (squash) closes the mission. Decisions journaled: 9 rows; one flagged for
  review, the 3 stale DIVERGENCES table rows corrected outside the brief's text (row 5).
- **K:** `document-dimensions.ts` pushes `x + w - 1` / `y + h - 1` for a rowless node (`INK_MAX_CORNER_RECT_ONLY`,
  `LimitFinder.java:184-188`); 5 unit tests, including the `nested-arrays` oracle height 144px.
- **The 11 rows** (node / path / dw / dh, before → after): `hcl/function-call` 2.375 / 1.025 / 1 / 0 → … / 0 / 0;
  `hcl/for-expression-empty-array` 1.500 / 1.401 / 1 / 0 → … / 0 / 0; json debako, dometa, kicati, letada, sevaji,
  vogeku 4.444 / 6.302 / 0 / 1 → … / 0 / 0; `json/jidata` 4.375 / 6.308 / 3 / 5 → … / 2 / 4;
  `authored:json/nested-arrays` 3.262 / 2.933 / 3 / 1 → … / 3 / 0; `authored:json/empty-nested`
  9.375 / 9.901 / 0 / 9 → … / 1 / 9 (U-REC). No other `residue.mts --all` line moved. All 11 are pinned.
- **DIVERGENCES.md:** the empty-label sentence is corrected to the measured mechanism, both hcl rows are in the table
  (75 rows; node |Δ| < 1 px on 49 of 72 aligned rows), and the #187 clause is resolved.
- **D4:** `authored:json/empty-nested`'s node / dh residue is not the U-CLIP class under E+S1+L
  (1.000 / 1.078 / 0 / 1), so it went to **#229** (`needs-ruling`).
- **Every engine:** `npm run svg:survey`, then `verdict-diff.mjs 177d1d9e8`: lost 0, timeout or errored 0, no verdict
  moved. In all 29 `parity-*.json` files only `generatedAt` changed, so no census attribute moved toward or away from
  the jar, and no `accepted-divergences.json` entry needed retiring. `docs/parity-report.md`: timestamps only.
- **d.ts:** `dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` are byte-identical to T0 (D6).
- **Gates (final):** `npm test -- --maxWorkers=4` 2340 files passed (1 skipped), 50716 tests passed, 6 expected fail,
  7 skipped, 6 todo; coverage 96.99 / 92.57 / 97.48 / 98.03. typecheck, lint, build and format:check exit 0.
- **Follow-ons** (in `planning/next-missions.md`): #229; a table/pin consistency gate for the DIVERGENCES Smetana
  table, plus a re-diagnosis of `yaml/bafemu` and `jozapu`.
