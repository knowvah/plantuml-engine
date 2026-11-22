# embedded-diagram-preprocess (edp)

**At every start and after every compaction, read these first:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

**Source:** GitHub issue #185 (found by `class-oracle-gap-rows` T4f, #140). Planned unattended on 2026-11-21 at
`feature/parity-queue` `ed104a1f6`.

## Objective

Close #185 the way its ruling anticipated: upstream has shipped the fix, so the two rows are re-measured, found
conformant, and pinned. No divergence is recorded. The port also gets upstream's own regression fixtures for the fix,
and its one remaining difference inside an embed: the source label `[From block (line N) ]` on an embedded error page.

The ruling (issue body, 2026-11-16) chose option C: keep preprocessing `{{ }}` bodies and record the two rows as an
accepted divergence. It ends:

> When upstream ships it, the two rows should turn conformant: re-measure then.

**Upstream has shipped it.** `58b9b3d53ee` "Preprocess the body of a one-line embedded diagram (#3016)" is an ancestor
of the oracle pin `a720bdd` (1.2026.11beta1; `oracle/pin.json` `previousPin.why` names #3016 and #185). At the pin,
`EmbeddedDiagram`'s constructor builds `new BlockUml(noDefinitions(pathSystem), pathSystem, strings,
Defines.createEmpty(), previous, StandardCharsets.UTF_8)` (`EmbeddedDiagram.java:89-103`). A non-null
`DefinitionsContainer` makes `BlockUml` run `TimLoader` (`BlockUml.java:149-160`). So the jar now embeds the same
167×136 themed diagram we draw.

This mission:

1. pins `nacave-78-dijo807` and `subdiagram-theme-1` in the svg-class ratchet (T1a, D1, D2);
2. ports upstream's `vega/nonreg/group3015` fixtures as a jar-compared test that also compares the nested payload
   (T1b, D3);
3. labels an embed's source `block`, as `BlockUml.convert` does (`BlockUml.java:119-127`), so an embedded error page
   prints `[From block (line N) ]` (T1c, D4);
4. re-measures every engine and closes out (exit, squash).

## Starting state, read 2026-11-21 on `ed104a1f6`

- **Survey** (`tests/oracle/svg-conformance/parity-class.json`, generated 2026-11-21T19:26Z): both rows are
  `conformant`, `dotEqual: true`, `layoutEqual: true`.
- **Oracle** (`test-results/dot-cache/class/<slug>/in.svg`, re-captured 2026-11-21 against `a720bdd`): root
  215×313, one `<image width="167" height="136">`. Before the re-pin the jar drew 461 high with its 532×284 error
  page embedded.
- **Census** (`census-class.json`, stale: generated 2026-11-10 at `570284a92`): still `diffCount: 42` for both.
- **Ratchet** (`oracle/goldens/svg-class/ratchet.json`): 1150 entries; neither slug is pinned.
- **Twin baselines:** `routing-baseline.json` `agree` and `refusal-baseline.json` `ok` for both `dot-cache/class`
  rows (measured 2026-11-03), so `pin-goldens.mts`'s pre-checks pass.
- **Ledger / DIVERGENCES.md:** neither names either row. The ledger gate
  (`emitter.golden.test.ts:132-160`) would refuse an in-force entry for a survey-conformant row, so the ruling's
  option-C entry cannot be written now (D1).

Planning probes (scratch in `/tmp`, not committed; journal row 0): the five `group3015` sources, plus three authored
probes (outer `!$who` used inside a one-line embed, `!includedef` inside an embed, and a bad directive), were rendered
with `scripts/oracle-render.sh` and compared to `renderSync` with `DeterministicMeasurer`. All eight matched at n=0
at top level. Seven also matched at n=0 when the decoded nested `data:image/svg+xml` payloads were compared. The
bad-directive probe differs inside the payload in three ways:

| nested difference | cause | this mission |
|---|---|---|
| `Python syntax error: expected end of line but found 'bar'` vs our `Syntax Error? (Assumed diagram type: sequence)` | the Python preprocessor (#214) | no: #214 |
| `PlantUML version $version$ / $git.commit.id$` vs `plantuml-engine version 0.2.0 / unknown` | own error-page banner (ruling 2026-10-08/10-10) | no: named for the maintainer (D5) |
| `[From block (line 2) ]` vs `[From string (line 2) ]`, box width 129.4 vs 130.887 | `BlockUml.convert`'s `"block"` (`BlockUml.java:121`) vs our `SOURCE_STRING_DESCRIPTION` | **yes: T1c** |

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on; the driver has already checked it out.
- T0 commits this brief. One unsigned commit per task, in the **main checkout, serially, no worktrees**.
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission into **one commit** on the mission base sha named in the execution prompt,
  and tags `embedded-diagram-preprocess/pre-squash`. Never push: the user reviews, signs and pushes.

## Quality gates (all of them at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`. A `vitest run <paths>` that collects nothing exits 0: read the count.
- New exports need `npm run catalog` (drift-gated). Survey moves change `docs/parity-report.md`: run
  `npm run parity:dashboard` at every batch close.
- Never write under `src/`, `tests/`, `docs/` or `oracle/` while a gate is running.
- `npm run codeql` is a pre-PR gate (CLAUDE.md), not per commit; the user runs it before pushing.

## Measurement commands

Type every command literally. Run producers **alone**, and never `cd` below the repo root.

- **The two rows:** `npm run svg:survey -- class --out tests/oracle/svg-conformance/parity-class.json`, then read both
  records. Without `--out`, a positional type overwrites `parity.json`.
- **Class pins:** `npx vitest run tests/oracle/svg-conformance/class.golden.ratchet.test.ts`; read the count.
- **Every engine, at batch close:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>` (a **git ref**). Exit 1 = a loss.
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`. Delete the
  `svek-N.dot` files it leaves in the out dir.

## Stop conditions (halt, journal, report)

1. A conformant row in any engine, or a pinned golden, leaves its bar and you cannot state its mechanism with
   `file:line`.
2. A pinned golden would have to be re-captured or removed.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D5. Amend `decisions.md` with the date, then halt.
5. Any `dist/*.d.ts` change (D4).
6. A fix needs a write to `@knowvah/dot-engine`, `~/git/graphviz` or `~/git/plantuml`. File the finding instead.

**These are not stops:**
- A file outside a task's write-set inside this repository. Change it and journal why.
- Either row is not zero-diff in the class ratchet even though the survey says conformant. That is a finding for T1a:
  diagnose it per `~/.claude/rules/diagnosis.md`, fix it if the mechanism is in the class engine, or leave the row
  unpinned and file an issue with the diff. Do not pin a non-zero row.
- A `group3015` fixture that is not n=0 (outer or nested). Diagnose it; fix it in this mission if it is the embed
  path, otherwise file it and mark that case `it.fails` with the issue number.
- A question only a maintainer can rule on: file a `needs-ruling` issue with the evidence, continue with the rest.

## Push-forward (decide, journal, continue)

- Refresh `census-class.json` if its stale `diffCount: 42` keeps the dashboard's "census 0-diff" column wrong for
  these rows. Use the census's own `--json` mode (`scripts/svg-conformance-census.ts`, `svg-conformance-census-json.ts`),
  and commit it only if every other row's change is explained.
- Grep `tests/corpus`, `~/git/pdiff/` and the dot-cache for other one-line `{{\n!` embeds. Render each and journal its
  verdict. A newly conformant, unpinned class row goes through T1a's tool.
- Update a stale `EmbeddedDiagram.java:N` citation in a file this mission edits. Do not sweep all 41 citing files (D3).
- Rerun a timed-out vitest or survey at lower load before calling the timeout a finding.

## Blast radius

- **Data model / API:** none. T1c adds a field to `InternalRenderOptions`, which `src/index.ts` does not re-export;
  `dist/*.d.ts` must not move (D4).
- **Dependencies:** nothing new.
- **Behaviour:** only an embedded diagram that renders as an error page changes. Its source label reads `block` where
  it read `string` (or the host's filename). Every top-level page and every embed that renders a real diagram is
  unchanged.

| File | Action | Task |
|---|---|---|
| `plans/embedded-diagram-preprocess/tools/pin-goldens.mts` (copy of cogr's, `MISSION` bumped) | Create | T1a |
| `oracle/goldens/svg-class/{nacave-78-dijo807,subdiagram-theme-1}/{golden.svg,in.puml}` | Create | T1a |
| `oracle/goldens/svg-class/ratchet.json` (append 2) | Modify | T1a |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json` (2 `goldens` twin rows each) | Modify | T1a |
| `tests/fixtures/embedded-diagram-3015/*.puml`, `*.svg` | Create | T1b |
| `tests/unit/core/embedded-diagram-preprocess-3015.test.ts` | Create | T1b |
| `src/core/EmbeddedDiagram.ts` (module JSDoc: constructor citation) | Modify | T1b |
| `src/core/internal-render-options.ts` (source-description field + accessor) | Modify | T1c |
| `src/index.ts:314-321` (nested render passes the `block` description) | Modify | T1c |
| `src/core/BlockUmlBuilder.ts`, `src/core/error/error-diagrams.ts:123`, `src/core/tim/ReadLineReader.ts` | Modify | T1c |
| a T1c unit test (embedded error page reads `[From block (line N) ]`) | Create | T1c |
| `tests/oracle/svg-conformance/parity-*.json`, `docs/parity-report.md` | Modify | batch closes |
| `planning/next-missions.md` (cogr follow-on 1; new edp section) | Modify | T2 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0: brief, baseline](batch-0/overview.md) | T0 | [x] |
| [1: pin, fixtures, block label](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [exit](batch-exit/overview.md) | T2 | [x] |
| [squash](batch-squash/overview.md) | T3 | [x] |

## Done when (issue #185)

- [x] `nacave-78-dijo807` and `subdiagram-theme-1` are pinned in the svg-class ratchet, zero-diff, and the class
      ratchet passes with 1152 entries.
- [x] Neither row is in `oracle/accepted-divergences.json` or `DIVERGENCES.md` (D1).
- [x] The five `group3015` fixtures render n=0 against their jar oracles, outer and nested payload.
- [x] An embedded error page prints `[From block (line N) ]`, held by a unit test against a jar oracle.
- [x] 0 conformant losses in every engine, baseline survey against final survey.
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass.

## Documents

- [decisions.md](decisions.md): D1 to D5, operational readiness, auto-confirmed decisions.
- [task-contract.md](task-contract.md): what every task does, and how a batch closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npx vitest`, `npm`, `scripts/oracle-render.sh`, `gh issue`). It is deliberately not regenerated, because the
SessionStart hook compares it with the live `.claude/settings.json`.

## Summary (2026-11-22)

**Tasks:** T0, T1a, T1b, T1c, T2 done; T3 (squash) follows. Batches 0, 1 and exit closed. 14 journal rows before the
squash; none is open or flagged. One batch-1 gate fix (journal row 9). The per-task history is on
`embedded-diagram-preprocess/pre-squash`.

**Gates (exit, journal row 14):** `npm test` 2339 files / 50701 passed (6 expected fail, 7 skipped, 6 todo), coverage
96.99/92.57/97.48/98.03; typecheck, lint, build and format:check 0. Batch 1's first run had 2 failures: the
`dot-sync-fixtures` enumerator test read only `cogr-` pins (fixed), and the planned dashboard regeneration.

**Verdicts, base `ed104a1f6` → exit:** lost 0, timeout or errored 0, in every engine. Every `parity-*.json` changed only
`generatedAt`. Class is 872 / 2 / 0.

**The rows:** `nacave-78-dijo807` and `subdiagram-theme-1` were survey-conformant at the base but unpinned, and the
census still said 42 diffs. They are now pinned, 0 diffs the ratchet's way, with 1152 class ratchet entries. Neither is
in `oracle/accepted-divergences.json` or `DIVERGENCES.md` (D1). `census-class.json` was refreshed (0-diff 1114 → 1151;
every move explained, journal row 11).

**Embeds:** upstream's five `group3015` cases and the outer-variable probe are n=0 on the page and in the nested payload.
A mutation that feeds the nested parser unpreprocessed directives fails exactly the three shapes #3016 fixed. A broken
embed's error page prints `[From block (line 2) ]`, with its box 129.4 wide, as the jar draws it. Its only remaining
nested difference is the version banner (D5).

**d.ts:** byte-identical to the T0 snapshot.

**Follow-ons:** D5 (the embedded error page's banner, open on #185); the 41-file `EmbeddedDiagram.java:N` re-citation;
`EmbeddedDiagram#getNeutrons` returns a neutron at a720bdd where the port throws. See `planning/next-missions.md`,
section "embedded-diagram-preprocess (edp)". No issue filed.

**CI risk:** low. One internal render option and one `PreprocessOptions` field were added. The routing and refusal
baselines gained 2 rows each, with `routing-conformance.test.ts` and `refusal-coverage.test.ts` counts +2. The refreshed
census moves the dashboard's class census column.
