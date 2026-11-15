# Decisions

These are pre-made. A finding that contradicts one is stop 4: amend the decision here with the date, then halt.

| ID | Decision | One line |
|---|---|---|
| D1 | Scope | the 16 #109 hcl/yaml rows in `measurements/new-rows.json` |
| D2 | Zero-diff pins | a mission copy of dogr's pin tool, adapted to `svg-hcl`, pins the 7 at T1; the positional pin drops them |
| D3 | Where a Smetana delta is recorded | the DIVERGENCES.md Smetana row-level table, one row per slug with residue and mechanisms |
| D4 | Proof standard | jfp D3 for every hcl row; fix a port-controlled mechanism; file a dot-engine ≠ `dot` finding; never fit |
| D5 | The 4 yaml rows | oracle twins of named rows: prove byte identity of source, oracle and our render, then name them |
| D6 | Public API | no `dist/*.d.ts` change |
| D7 | Execution | serial, main checkout, no worktrees; one commit per task; squash at the end |

### D1: Scope
The 16 rows are the `bucket: "hcl"` and `bucket: "yaml"` rows of `plans/oracle-gap-capture/measurements/new-rows.json`.
The yaml `-N` rows are per-block splits made by `classify-corpus.ts` (#142). Other hcl/yaml rows are out of scope,
including `yaml/bafemu-96-luji978` (the existing structural ceiling) and the `unknown/` twins of `hcl/jubete` and
`hcl/vocago` (#119, already named).

### D2: Zero-diff pins
`plans/dot-oracle-gap-rows/tools/pin-goldens.mts` copies `in.puml`/`in.svg` into the golden directory, checks byte
equality with the cache, appends a `ratchet.json` entry and clones the `dot-cache` routing and refusal twins as
`tree: goldens`. T1 copies it with its test and config into `plans/hcl-yaml-oracle-gap-rows/tools/` and adapts it:
- `GOLDEN_DIR` `oracle/goldens/svg-hcl`, cache tree `test-results/dot-cache/hcl`, `CACHE_TYPE` `hcl`, clone type
  `svg-hcl` (the existing `citoda-80-dimi195` clones in both baselines show the shape);
- the `--jar-error` path and its stock-error-page reading are removed: no hcl row in scope is an error page;
- the twin must be `agree` (routing) / `ok` (refusal), as dogr's non-error path already requires.

The tool does not check zero-diff itself; the json-family ratchet (`json-family-ratchet.ts`) does, on the same
`renderFixtureJson` call the measurer uses.

`json-family-positional.test.ts:41-46` fails on any pinned positional row that a golden ratchet calls conformant
("drop them"). T1 removes the 7 all-zero entries in the same commit. That is not loosening: the golden ratchet's
zero-diff bar is stricter than an all-zero positional ceiling (`json-family-positional.ts:395`, "implicit all-zero
ceiling").

`json-family-ratchet.ts` has no count guard, so nothing would notice a pin being dropped. T1 adds a per-type floor
(`json` 14, `yaml` 7, `hcl` 8 after T1), raised before pinning as the red step.

**Rejected: hand-editing `ratchet.json` and the two baselines.** The tool's byte check is the evidence that the
goldens are the oracles. **Rejected: a generic multi-type pin tool under `scripts/`.** Build tooling no task asked
for.

### D3: Where a Smetana delta is recorded
The json family's accepted Smetana residue lives in DIVERGENCES.md, "Smetana-backed diagram types", in the
`<details>` row-level table (70 rows: `row | residue (node / path / dw / dh) | mechanisms | ledger`). It sits under
the standing ruling of 2026-08-09. `oracle/accepted-divergences.json` holds no json/yaml/hcl row, so the table is the
precedent. A row added there:
- carries the residue `measure-rows.mts` prints (equal to its `json-family-positional.json` entry);
- names mechanisms only from the closed set the entry defines (U-REC, U-CLIP, U-ARROW, U-NS) or from a new
  source quoted with `file:line` in both the Smetana transpile and the graphviz C;
- points its ledger column at this mission's journal row (`plans/hcl-yaml-oracle-gap-rows/decision-journal.md`
  row N).
The `<summary>` count and the "Measured result" prose that counts rows are updated with it.

Adding a row to this table is not a new divergence (cogr D4 precedent: "adds such a row to the existing Smetana entry
rather than opening a new divergence"), provided the row's elements, labels, colours and structure match. The
structural pin (`clean`) and `aligned: true` already assert that for all 16 rows, and #136 will check it again.

**Rejected: one `accepted-divergences.json` entry per row.** No json-family precedent, and the entry schema is a
signed per-row exception, where these rows fall under a standing ruling.

### D4: Proof standard
For each of the 5 hcl rows, the label "Smetana" needs both parts of jfp D3
(`plans/json-family-parity/decisions.md:58-76`):
1. **our engine input is effectively the jar's.** Node and record field sizes recovered from the oracle's rects equal
   ours through `createNode` / `getDotLabelMap` / `getDotLabelArray` (`SmetanaForJson.java:233-260,265-295`). The
   label text legitimately differs by the `XPAD` compensation (DIVERGENCES worked example A5/T7).
2. **dot-engine equals real `dot -Tdot` 16.1.0** on our exact input.

Then the residue is Smetana vs graphviz C, recorded per D3. The counterfactual probes E and E+S1
(`plans/json-family-parity/diagnosis/yaml-hcl.md:36-40`) attribute the residue to U-REC / U-ARROW / U-CLIP; the
`hcl/jubete` ledger row (`yaml-hcl.md:78`) is the model.

If part 1 fails, the mechanism is the port's: open the Java (`net/sourceforge/plantuml/jsondiagram/`; for hcl, the parser in
`net/sourceforge/plantuml/hcl/` (`HclParser.java`, `HclTerm.java`); grep `src/main/java/net/`), quote it, port it test-first, and re-measure every json,
yaml and hcl row. If part 2 fails, file `docs/graphviz-issues/<NN>-*.md` and a `TRACKER.md` line before the task
closes, and leave the row open. Do not change dot-engine (stop 6).

Magnitude is never evidence: node Δ 2.375 does not by itself mean "not sub-pixel class" or "U-NS". A per-row
correction, a constant chosen to close a row, or a tolerance change is fitting.

### D5: The 4 yaml rows
At planning (`cmp`):
- `YAML-list-key-value-pair-0` and `YAML-space-indent-0`: `in.puml` and `in.svg` byte-identical to the named rows
  without `-0`;
- `YAML-attribute-hierarchy-0`: `in.svg` byte-identical to `YAML-attribute-hierarchy`. Its `in.puml` is that row's
  first `@startyaml` block, without the second block and the trailing issue URL;
- `YAML-attribute-hierarchy-1`: `in.puml` and `in.svg` byte-identical to `yaml/vaceci-80-lezo436` (named).

T3 also proves that our render of each pair is byte-identical (`renderFixtureJson` with the deterministic measurer,
compared as strings). It then names the 4 under the table in the shape of the existing `unknown/jubete` paragraph
(DIVERGENCES.md, after the table: "filed a second time ... byte-identical `in.puml` and `in.svg` (`cmp`, date) and
the same survey `maxDelta`, so the same Smetana delta names them"). If a render differs, the row is not a twin: it
gets T2's full D4 diagnosis instead, in its own commit.

### D6: Public API
No change is expected to anything a consumer sees. T0 snapshots `dist/*.d.ts`, and T4 diffs it and expects no change
(stop 5).

### D7: Execution
Tasks share `DIVERGENCES.md`, the positional pin and the baselines, so the mission runs serially in the main
checkout. The orchestrator writes, or one `typescript-pro` subagent at a time whose prompt is `task-contract.md`, this
file and the task file. There are no worktrees and never two writers at once. Each task makes one unsigned commit
with the footer `Refs: #142`, and T5 squashes them.

## Operational readiness

- **Observability:** N/A. A pure library, with no new operations, services or I/O.
- **Rollback:** Reversible. Revert the squash commit; nothing migrates.
- **Scalability:** 7 more goldens add 7 `renderFixtureJson` calls to the hcl ratchet (16 rows measure in about 2 s in
  total). The routing and refusal suites each gain 7 clones.
- **Failure modes:**
  1. A T2 fix under `src/diagrams/json/` moves yaml or json rows. Detected by the json/yaml/hcl ratchets, the
     structural and positional pins, and the every-engine survey; a move away from the jar is stop 1.
  2. A pin round leaves the routing or refusal running counts stale. Detected by `routing-conformance.test.ts` and
     `refusal-coverage.test.ts` in the same gate run.
  3. A pin leaves `docs/parity-report.md` stale. Detected by `tests/unit/scripts/parity-dashboard.test.ts`.
- **Backwards compatibility:** no public type, option or output contract changes.

## Auto-confirmed (unattended)

Planned on 2026-11-14 by `/plan-mission --unattended next --branch feature/parity-queue`, with no maintainer present.
The queue selected #142: no `queue:planned` issue is open; #136 (lower-numbered) is blocked by open issues, #142 among
them; #142 has no "Blocked by" line.

**D2, recommendation taken:** a mission copy of dogr's pin tool, adapted to `svg-hcl`, plus a ratchet floor.
- **Rejected:** hand edits; a generic tool (see D2).

**D3, recommendation taken:** the DIVERGENCES.md row table.
- **Rejected:** per-row `accepted-divergences.json` entries (see D3).

**D4, recommendation taken:** jfp D3 proof per row; fix only port-controlled mechanisms.
- **Rejected: name all 9 from the planning residue alone.** #142 says "re-measure", and CLAUDE.md forbids repeating a
  mechanism from a ledger or a brief. The two rows above 1 px node Δ have no precedent in the table.
- **Rejected: park the issue.** The Smetana ruling already applies (#142, "Ruling that applies"), and #142 says
  what done means.

**D5, recommendation taken:** prove the twins and name them, after the `unknown/jubete` precedent (#119).
- **Rejected: a full D4 diagnosis of rows whose source, oracle and render equal a diagnosed row.** It would repeat a
  ledger row byte for byte.

**Why this is not a parking case:** #142 says what done means. The standing ruling covers the Smetana residue. No
public type changes, and nothing is irreversible. A row that needs a ruling goes on its own issue and the rest of the
mission continues.

**D1, D6, D7:** each follows from the measurements and the project rules, and is recorded above with its evidence.
