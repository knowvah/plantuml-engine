# diagram-style-scope (dss)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then
[decisions.md](decisions.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

## Objective

Upstream reads a style through one rule: every declaration whose SNames are a
subset of the element's signature applies, and the last declared wins
(`StyleStorage.java:102-116`, `StyleSignatureBasic.java:194-220`), with the
diagram's name in that signature (`TitledDiagram.java:280-282`,
`DiagramType.java:234-296`). Ours scans a flat selector list with fixed
specificity tiers and no diagram type, so: `sequenceDiagram { document { … } }`
is ignored, `classDiagram { document }` paints a sequence diagram, declaration
order is wrong, and `<x>Diagram`, `root`, `element { BackgroundColor | LineColor |
FontColor }` stop short of entities and notes. Read both through the already-ported
`StyleBuilder` (D1), precomputed into the theme (D2). Probe evidence:
[fixtures.md](fixtures.md).

Starting state (main `4f653cac9`): ported builder predicts the jar's root background
on 4297/4305 corpus rows, the flat path on 4281. No surveyed conformant row depends on
the defects; 14 diverged rows set these forms and may improve.

**Target:** every authored row conformant, or at its `cascade-none` baseline, or its
residue a named mechanism filed as a follow-on; no conformant row lost in any of the 28
engines; d.ts byte-identical to b0; follow-ons 5 and 7 of "document-background-paint"
in `planning/next-missions.md` struck, plus the two bucket leaks.

## Branch

`feat/diagram-style-scope` off main `4f653cac9` (T0a creates it and commits this brief).
One unsigned commit per task in worktrees `dss/<Tn>` (`.claude/worktrees/dss-<Tn>`),
`--no-ff` task merges, one close commit per batch. **Do not merge main into the branch.**
The squash batch rebuilds one commit per batch and tags `dss/pre-squash`. The user signs
(`git rebase --force-rebase -S 4f653cac9`), pushes, opens the PR. **Never push.**

## Quality gates (all four before any close commit)

```sh
bash plans/diagram-style-scope/measurements/gates.sh <tag>
# = npm test -- --maxWorkers=4 (JSON reporter) · typecheck · lint · build
```
Collected (JSON reporter) must equal on-disk. `uptime` first; above ~10 wait or journal
why not. New/removed src module ⇒ `npm run catalog`.

- `$T` = `plans/diagram-style-scope/tools/`, `$M` = `plans/diagram-style-scope/measurements/`.
- All engines: `LOAD_MAX=8 SVG_PARITY_TIMEOUT_MS=900000 SVG_PARITY_CONCURRENCY=3 bash $M/chain.sh <bN-eng>`; diff with `node $T/verdict-diff.mjs <prev> <next>` (rerun any timeout at load < 8 before calling it a mover).
- Corpus bytes: `npx tsx $T/svg-hashes.mts --all <out.json> <prev.json>` (a `<bN>-hashes.json` per close; the verdict diff cannot see a diverged row's bytes).
- One row: `npx tsx $T/diff-row.mts <engine>__<group>-<case>`; all rows: `npx tsx $T/diff-row.mts --all [--json <out>]`.
- Extended mode: `npx tsx $T/extended-baseline.mts --check $M/extended-baseline.json`.
- Oracle renders: `scripts/oracle-render.sh <ABSOLUTE out-dir> <puml>` only.
- Batch close: [close-procedure.md](close-procedure.md).

## Stop conditions (halt, journal, report)

**While the user is away, D8 in `decisions.md` decides which of these still halt:** 3, 12, 13 and 1 inside `src/` no longer do; 7, 8, 9, 10 do.

1. A task needs a file outside its write-set, or one a same-batch task owns.
2. The same gate fails on 2 consecutive fix attempts, or one code location changes 3 times without resolving the same check — halt with the diagnosis artifact (mechanism, origin `file:line`, causal chain, ruled out).
3. A finding contradicts D1–D6, including anything from T0c's audit: amend `decisions.md` (dated), then halt.
4. A conformant row in any of the 28 engines leaves conformant.
5. Any byte moves on a corpus row or pinned golden whose `preprocessed.styles` is empty and `preprocessed.skin` is unset (D3, D3b; a move means the gate is broken). One exception (D7): a state row moved solely by appending composite note geos, each journaled.
6. Any pin, ceiling or authored-row count worsens.
7. Any diff against `$M/b0-plantuml-ts.d.ts.txt`; a new `Theme`, `ElementColors` or `RenderFragment` field.
8. A fitted constant, behaviour or element signature without an upstream `file:line` in the same commit.
9. An oracle by a hand-typed `java -jar`; a hand-edited fixture `.svg`; any edit to dot-engine, the plantuml fork, the oracle jar or cached oracle bytes; any push.
10. A new runtime dependency; DOM/async/Node built-ins, `Date`, `Date.now()` or `Math.random()` in `src/`.
11. Collected ≠ on-disk after a `--maxWorkers=4` rerun, or a survey timeout at load below 8.
12. The builder throws anything other than `StyleParsingException`, or a malformed `<style>` block changes output other than a document colour it declared (D6, D6a).
13. A T3 or T4 task's reader work grows past about 15 sites in one task beyond T0c's audit: the task is mis-scoped, split it.

## Push-forward (decide, journal, continue)

- Re-pinning at closes (orchestrator only) when every changed row moved toward the jar.
- A corpus row with a `<style>` block or `skin` line that moves toward the jar: journal its mechanism, re-pin.
- Adding a signature to T2a's table between merges, with its Java citation (orchestrator).
- Helper/file splits forced by the 500-line / complexity hooks inside a task's own directory (journal the new file).
- Re-pointing a unit test that asserted the old specificity tiers, the `classDiagram`-on-object leak or a wrong fill, reason in the commit body.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Regenerating `docs/catalog.md` when exports change.
- A row stuck on a defect outside this mission (dark mode's other diffs, board's body): pin its count, name the mechanism, file a follow-on.
- A newly found property or selector form outside bg, line and font: record in the journal + next-missions, do not fix.

## Execution rules

- Batches run in order; tasks inside a batch in parallel only where `overview.md` says so, each in its own worktree (memory `batch-parallelism-needs-worktrees`; `mkwt.sh` symlinks the gitignored assets, memory `worktree-survey-needs-stdlib`).
- Every agent prompt = the task file + [task-contract.md](task-contract.md). Worktree agents never use Serena edit tools (memory `agents-write-main-via-serena`).
- Verify every hand-back from the worktree (`git log`, the measured numbers), never from the report alone — an empty or "placeholder" hand-back is common (memory `subagent-handback-single-shot`).
- Do not merge a task that moves bytes while a chain is measuring the main checkout.
- Probe past the rows before each close (memory `probe-past-authored-rows`); grow scope with an authored row and journal it (D8).
- Journal every decision, mover and halt with its commit.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — baseline, rows, audit](batch-0/overview.md) | T0a, T0b, T0c, T0d, close | [x] (stop 3 ruled 2026-11-02: D1a–D7 approved) |
| [1 — document background](batch-1/overview.md) | T1a, T1b, close | [x] |
| [2 — shared element cascade](batch-2/overview.md) | T2a, close | [x] |
| [3 — engine readers](batch-3/overview.md) | T3a, T3b, T3c, T3d, T3e, close | [ ] |
| [4 — activity LineColor](batch-4/overview.md) | T4a, close | [ ] |
| [exit](batch-exit/overview.md) | final measurement, docs, follow-ons, memory | [ ] |
| [squash](batch-squash/overview.md) | one commit per batch, tag `dss/pre-squash` | [ ] |

## Documents

- [decisions.md](decisions.md) — D1–D6 (user-approved 2026-11-02).
- [task-contract.md](task-contract.md) — the contract every agent prompt includes.
- [close-procedure.md](close-procedure.md) — standard batch close.
- [fixtures.md](fixtures.md) — probe results, row groups, counts per checkpoint.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/component-map.md](diagrams/component-map.md), [diagrams/data-flow.md](diagrams/data-flow.md).

## Prior context (read only what a task points at)

- `.agent-notes/document-bg-selector-scope.md`, `.agent-notes/dbp-execution.md`, `.agent-notes/dbp-T2f.md`.
- `plans/document-background-paint/` — the tooling and conventions this brief copies.
- `src/core/style/mindmap-style-builder.ts` — the builder; `src/diagrams/mindmap/MindMapDiagram.ts:105-116` — its `calculateBackColor`.
- Memories: `squash-per-batch-at-end`, `gate-merges-on-full-set-and-typecheck`, `conformance-harness-mirrors-index-ts`, `census-away-from-jar-catches-hidden-regressions`, `dbp-status`.
