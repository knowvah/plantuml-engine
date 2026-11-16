# hcl-yaml-oracle-gap-rows (hyogr)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #142 (from #109, oracle-gap-capture). Planned unattended on 2026-11-14 at
`feature/parity-queue` `1f154d2e4`.

## Objective

#109 captured 12 `@starthcl` and 4 `@startyaml` rows that had never had a jar oracle. These are Smetana paths
(`JsonDiagram`; CLAUDE.md "One layout engine", ruling 2026-08-09). This mission:

1. **pins** the 7 hcl rows that are zero-diff on the ratchet path into `oracle/goldens/svg-hcl/` (D2);
2. **diagnoses** the 5 hcl structural matches to the jfp D3 proof standard. It fixes any mechanism the port
   controls, and names the rest in the DIVERGENCES.md Smetana row table with their measured residue (D3, D4);
3. **proves** that the 4 yaml rows are oracle twins of rows that table already names, and names them the same
   way (D5).

## Starting state, measured 2026-11-14 on `1f154d2e4`

- **Ratchet path:** `npx tsx plans/hcl-yaml-oracle-gap-rows/measurements/measure-rows.mts /tmp/hyogr-t0.json`
  prints **rows 16 zero 7 open 9 error 0** (about 2 s). Rows: [measurements/new-rows.json](measurements/new-rows.json).
- **Surveys** (generated 2026-11-15T01:06Z / 01:17Z, the dogr batch-2 survey on the same tree): `parity-hcl.json`
  15 rows, 8 conformant / 7 structural-match; `parity-yaml.json` 43 rows, 7 / 35 / 1 diverged (`bafemu`, the
  existing structural ceiling).
- **Pins:** `svg-hcl/ratchet.json` holds 1 row (`citoda-80-dimi195`); `svg-yaml/ratchet.json` 7. All 16 new rows are
  `clean` in `json-family-structural.json` and `aligned: true` in `json-family-positional.json`, at exactly the
  residue the measurer prints below. The 7 zero rows carry all-zero positional entries.
- **Gate twins:** each of the 7 zero rows has one `dot-cache`/`hcl` row in `routing-baseline.json` and in
  `refusal-baseline.json` (`style-node-background` also has twins of other types: filter on tree and type).
- **DIVERGENCES.md**, "Smetana-backed diagram types", `<details>` "Row-level table (70 rows)": names
  `hcl/jubete-32-sutu417`, `hcl/vocago-35-xodu446` and 32 yaml rows. It names none of the 9 open rows by these slugs.

### The 9 open rows

| Row | Diffs | Residue node / path / dw / dh | Lead (verify before acting) |
|---|---|---|---|
| `hcl/array-values` | 23 | 0.150 / 1.555 / 0 / 0 | sub-pixel class, like `hcl/jubete` (U-REC, U-ARROW, U-CLIP) |
| `hcl/multiple-top-level-blocks` | 59 | 0.619 / 1.068 / 0 / 0 | the same |
| `hcl/nested-object-value` | 26 | 0.425 / 1.834 / 0 / 0 | the same |
| `hcl/function-call` | 59 | 2.375 / 1.025 / 1 / 0 | `rect/@y` 2.375 (in-rank axis); source holds `templatefile("…", {})` and `tostring()`: an empty container |
| `hcl/for-expression-empty-array` | 34 | 1.500 / 1.401 / 1 / 0 | `rect/@y` 1.5; the name says the `for` expression parses to an empty array |
| `yaml/YAML-attribute-hierarchy-0` | 54 | 0.654 / 1.742 / 1 / 0 | `in.svg` byte-identical to `yaml/YAML-attribute-hierarchy` (named); `in.puml` is that row's first block |
| `yaml/YAML-attribute-hierarchy-1` | 91 | 1.100 / 2.583 / 1 / 0 | `in.puml` and `in.svg` byte-identical to `yaml/vaceci-80-lezo436` (named, same residue) |
| `yaml/YAML-list-key-value-pair-0` | 22 | 0.451 / 1.011 / 1 / 0 | `in.puml` and `in.svg` byte-identical to `yaml/YAML-list-key-value-pair` (named) |
| `yaml/YAML-space-indent-0` | 62 | 0.750 / 2.146 / 1 / 0 | `in.puml` and `in.svg` byte-identical to `yaml/YAML-space-indent` (named) |

The two empty-container leads touch DIVERGENCES' "empty-container **label** half" item (closed without code by
jff D2), but node Δ above 1 px is larger than any row that item names. That is a lead, not a mechanism: T2a starts
from the Java.

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, with no worktrees** (D7).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `hcl-yaml-oracle-gap-rows/pre-squash`.
- Never push. The user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`.
- New exports need `npm run catalog`, which is drift-gated.
- A `vitest run <paths>` that collects nothing exits 0, so read the count.
- Pinning moves `docs/parity-report.md` (pinned count, last-pin date): run `npm run parity:dashboard` at **every**
  batch close that pinned, not only after a survey (dogr journal row 5).
- Never write under `src/`, `tests/` or `docs/` while a gate is running.

## Baseline

Measured at planning on `1f154d2e4`: see journal row 0.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **The 16 rows:** `npx tsx plans/hcl-yaml-oracle-gap-rows/measurements/measure-rows.mts [out.json] [type/slug...]`.
- **One row's residue by attribute:** `npx tsx plans/json-family-followons/tools/residue.mts hcl <slug>`.
- **One row's diffs:** `npx tsx plans/json-family-followons/tools/diff-one.mts hcl <slug> [--structural]`.
- **Pin:** the T1 tool in `plans/hcl-yaml-oracle-gap-rows/tools/` (see [batch-1/T1-pin.md](batch-1/T1-pin.md)).
- **hcl / yaml survey only:** `npm run svg:survey -- hcl --out tests/oracle/svg-conformance/parity-hcl.json` (same
  for `yaml`). Without `--out`, a positional type overwrites `parity.json`.
- **Every engine, at batch close from batch 2 on:** run `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 means a loss.
  `verdict-diff` takes a **git ref**.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.
- **Native graphviz (D3 part 2 only):** `dot -Tdot <file.dot>` on the DOT our engine solves. It is evidence about
  dot-engine, never an oracle for a golden.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, a pinned json/yaml/hcl golden, a `json-family-structural.json` clean row, or a
   `json-family-positional.json` ceiling leaves its bar, and you cannot state its mechanism with `file:line`.
2. A pinned golden would have to be re-captured or removed, or a positional ceiling would have to rise.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D7. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D6).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml` (CLAUDE.md, "Writing and
   write-sets"). File the finding instead (D4).

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- A row whose residue is not Smetana arithmetic and not a port defect the Java settles (for example a new class of
  difference only a maintainer can rule on). File a `needs-ruling` issue with the evidence, name the row in the
  journal, and continue. Do not decide it here (#142, "Done when").
- A residual diff that a fix uncovers, provided its mechanism is the task's. Fix it in the same task.

## Push-forward (decide, journal, continue)

- Probe code for D3 (Smetana-size emulation, `penwidth=0`, DOT dumps) under `/tmp`; it is never committed to `src/`.
- Tightening a `json-family-positional.json` ceiling that a fix shrank (shrink-only; reseed with `residue.mts --json`).
- Splitting T2a or T2b if their rows turn out to have two mechanisms, each with its own commit.
- Correcting the stale "Current state" prose in `oracle/goldens/svg-hcl/README.md` (it still says the ratchet is
  empty and that no `parity-hcl.json` exists).
- Rerunning a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model:** none. `svg-hcl/ratchet.json` gains 7 rows in its existing `{ slug, addedAt, source }` shape;
  `json-family-positional.json` loses 7 all-zero entries (its test requires it). Only this repo's tests read them.
- **API:** none, unless T2a finds a port defect in `src/diagrams/json/` or `src/diagrams/hcl/` (D6).
- **Dependencies:** nothing new.
- **Behaviour:** none, unless T2a/T2b land a fix. A change under `src/diagrams/json/` reaches every json, yaml and
  hcl row (yaml and hcl share json's layout and renderer), so the structural and positional pins and the
  every-engine survey are the guard.

| File | Action | Task |
|---|---|---|
| `plans/hcl-yaml-oracle-gap-rows/tools/*` (pin tool, its test, config) | Create | T1 |
| `oracle/goldens/svg-hcl/ratchet.json`, `<slug>/{in.puml,golden.svg}` | Modify / Create | T1 (T2a, T2b if a fix zeroes a row) |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` | Modify | T1 (pin clones) |
| `oracle/goldens/json-family-positional.json` | Modify | T1 (drop 7), T2a/T2b (tighten) |
| `tests/oracle/svg-conformance/json-family-ratchet.ts` (per-type floor) | Modify | T1 |
| `tests/oracle/svg-conformance/{routing-conformance,refusal-coverage}.test.ts` (running counts) | Modify | T1 |
| `oracle/goldens/svg-hcl/README.md` | Modify | T1 |
| `DIVERGENCES.md` (Smetana row table) | Modify | T2a, T2b, T3 |
| `src/diagrams/json/*`, `src/diagrams/hcl/*`, `tests/unit/json/hyogr-*.test.ts` | Modify / Create, only if T2a/T2b find a port defect | T2a, T2b |
| `docs/graphviz-issues/<NN>-*.md`, `docs/graphviz-issues/TRACKER.md` | Create / Modify, only if dot-engine ≠ `dot` | T2a, T2b |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md`, `tests/oracle/svg-conformance/PARITY-SVG.md`, `docs/catalog.md`, `planning/next-missions.md` | Modify | batch closes, T4 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: pin the 7 hcl rows](batch-1/overview.md) | T1 | [x] |
| [2: diagnose and name the 9](batch-2/overview.md) | T2a, T2b, T3 | [x] |
| [exit](batch-exit/overview.md) | T4 | [x] |
| [squash](batch-squash/overview.md) | T5 | [x] |

## Done when (issue #142)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism, or on a new `needs-ruling` issue that the journal names.
- [x] A new divergence has a forcing library or a signed ruling.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D7, operational readiness, and the auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md) and [diagrams/component-map.md](diagrams/component-map.md).
- [measurements/](measurements/): `new-rows.json` (the 16 rows) and `measure-rows.mts`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx tsx`,
`npx jiti`, `npm`, `dot`, `scripts/oracle-render.sh`, `gh issue`). It was deliberately not regenerated, because the
SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-15)

**Tasks:** T0, T1, T2a, T2b, T3 and T4 done (6 of 6 before the squash). Commits: the brief, 3 batch closes, T1 plus 1 gate fix, T2a, T2b, T3 and the close-out. Then T5 squashes them.

**Gates:** all five passed at each batch close and at exit. One gate fix: a conformant-row count outside T1's write-set, 22 → 29 (journal row 5). Tests 48770 → 48780 passed (+7 hcl ratchet cases, +3 floors). Coverage holds at 96.95 / 92.54 / 97.47 / 97.98.

**The 16 rows, before → after:**
- 7 zero-diff and unpinned → pinned in `svg-hcl/ratchet.json` (1 → 8, floor 8).
- 3 open → named Smetana in the DIVERGENCES row table (70 → 73 rows): U-REC, U-ARROW, U-CLIP, with D4 parts 1 and 2 proven.
- 4 open → named as byte twins of named rows (source, oracle and render).
- 2 open → still open, on **#187** (needs-ruling): the empty-container label rationale, and a `LimitFinder` ink fix that would raise one ceiling.

`measure-rows.mts` at exit reads rows 16, zero 7, open 9, error 0. The residue is unchanged, since `src/` is untouched.

**Verdicts per engine, baseline → final:** identical in all 29 survey files. hcl 8 / 7 / 0, yaml 7 / 35 / 1, json 14 / 35 / 1; every other engine unchanged. `verdict-diff`: lost 0, faults 0. No non-timestamp field moved.

**d.ts:** `dist/plantuml-engine.d.ts` and `dist/image-providers.d.ts` are byte-identical to the T0 snapshot (D6). `oracle/accepted-divergences.json`: unchanged.

**Follow-ons:**
- #187.
- The DIVERGENCES.md triple concatenation (`82b9128ea`).
- Edge `penwidth` is not forwarded to dot-engine (probe-only impact).

All three are in `planning/next-missions.md`.

**CI risk:** low. On the latest PR run (43611999165) the slowest shard took 9m20s against a 15-minute cap. This mission adds 7 ratchet renders (about 1 s locally), 3 floor tests and 14 baseline clones.

