# document-background-paint (dbp)

**Read first, every start and after every compaction:**
`~/.claude/docs/reference/autonomous-execution.md`, then this file, then
[decisions.md](decisions.md), then the current batch's `overview.md`. Tail
[decision-journal.md](decision-journal.md) for where you stopped.

## Objective

A `<style> document { BackgroundColor … }` gradient emits invalid SVG
(`background:red/blue`, `fill="red/blue"`) in activity, class, component,
object, usecase, state, sequence, json and yaml, and makes mindmap throw; a
black one draws a rect the jar does not (json, yaml, state). Upstream paints the
document background in one place, `SvgGraphics`' constructor
(`SvgGraphics.java:176-192`): gradient → `<linearGradient>` + `url(#…)` rect,
no root `background:`; solid → root background, rect unless white/black/transparent.
Fix it at the origin (D1: the style path recovers the gradient like skinparam
does), port the constructor once for the finalizers that lack it (D2), and
mirror the wbs carrier in mindmap/salt (D3). Absorbs the jff follow-ons
(`planning/next-missions.md` "jff follow-ons" a, b, c). Probe evidence:
[fixtures.md](fixtures.md).

Starting state (main `fe794c0a9`): see `fixtures.md` "Probe matrix".

**Target:** every in-scope authored row conformant (or its residue a named,
non-background mechanism); no conformant row lost in any of the 28 engines;
d.ts byte-identical to b0; jff follow-ons a/b/c struck; timing/ebnf/regex and
the sequence/activity helper convergence filed as follow-ons.

## Branch

`feat/document-background-paint` off main `fe794c0a9` (T0a creates it and commits
this brief). One unsigned commit per task in worktrees `dbp/<Tn>`
(`.claude/worktrees/dbp-<Tn>`), `--no-ff` task merges, one close commit per
batch. **Do not merge main into the branch.** The squash batch rebuilds one
commit per batch and tags `dbp/pre-squash`. The user signs
(`git rebase --force-rebase -S fe794c0a9`), pushes, opens the PR. **Never push.**

## Quality gates (all four before any close commit)

```sh
bash plans/document-background-paint/measurements/gates.sh <tag>
# = npm test -- --maxWorkers=4 (JSON reporter) · typecheck · lint · build
```
Collected (JSON reporter) must equal on-disk. `uptime` first; above ~10 wait
or journal why not. New/removed src module ⇒ `npm run catalog`.

- `$T` = `plans/document-background-paint/tools/`, `$M` = `plans/document-background-paint/measurements/`.
- All engines: `LOAD_MAX=8 SVG_PARITY_TIMEOUT_MS=900000 SVG_PARITY_CONCURRENCY=3 bash $M/chain.sh <bN-eng>`; diff with `node $T/verdict-diff.mjs <prev> <next>` (rerun any timeout at load < 8 before calling it a mover).
- One row: `npx tsx $T/diff-row.mts <engine>-<case>`; all rows: `npx tsx $T/diff-row.mts --all [--json <out>]`.
- Extended mode: `npx tsx $T/extended-baseline.mts --check $M/extended-baseline.json`.
- Oracle renders: `scripts/oracle-render.sh <ABSOLUTE out-dir> <puml>` only.
- Batch close: [close-procedure.md](close-procedure.md).

## Stop conditions (halt, journal, report)

1. A task needs a file outside its write-set, or one a same-batch task owns.
2. The same gate fails on 2 consecutive fix attempts, or one code location changes 3 times without resolving the same check — halt with the diagnosis artifact (mechanism, origin `file:line`, causal chain, ruled out).
3. A finding contradicts D1–D6: amend `decisions.md` (dated), then halt.
4. A conformant row in any of the 28 engines leaves conformant (all-engine chain at every close; after T1b — no callers — 0 movers anywhere).
5. Any byte moves on a pinned golden of a corpus row WITHOUT a `<style>` document background; any pin, ceiling or document-background verdict worsens.
6. Any diff against `$M/b0-plantuml-ts.d.ts.txt`; a new `RenderFragment` field.
7. An "already OK" engine (gantt, wbs, files, nwdiag) is non-conformant at T0b — scope change, ask.
8. A fitted constant or behaviour without an upstream `file:line` in the same commit.
9. An oracle by a hand-typed `java -jar`; a hand-edited fixture `.svg`; any edit to dot-engine, the plantuml fork, the oracle jar or cached oracle bytes; any push.
10. A new runtime dependency; DOM/async/Node built-ins, `Date`, `Date.now()` or `Math.random()` in `src/`; a gradient id not from the seeded counter.
11. Collected ≠ on-disk after a `--maxWorkers=4` rerun, or a survey timeout at load below 8.
12. An unported engine (timing, ebnf, regex) would need code — record a follow-on, never port inline.

## Push-forward (decide, journal, continue)

- Re-pinning at closes (orchestrator only) when every changed row moved toward the jar: verdicts improving, newly byte-identical rows, parity files.
- Helper/file splits forced by the 500-line / complexity hooks inside a task's own directory (journal the new file).
- Re-pointing a unit test that asserted the raw `red/blue` string or the extra black rect, reason in the commit body.
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Regenerating `docs/catalog.md` when exports change (`svg-backcolor.ts` is new).
- A corpus row that already carries a `<style>` document gradient/black and moves toward the jar: journal with its mechanism, re-pin.
- Probe-matrix engines outside the 12 (board, packet, chart, chronology) showing a defect only in authored rows: record in the journal + next-missions, do not fix.

## Execution rules

- Batches run in order; tasks inside a batch in parallel only where `overview.md` says so, each in its own worktree (memory `batch-parallelism-needs-worktrees`; `mkwt.sh` symlinks the gitignored assets, memory `worktree-survey-needs-stdlib`).
- Every agent prompt = the task file + [task-contract.md](task-contract.md). Worktree agents never use Serena edit tools (memory `agents-write-main-via-serena`).
- Verify every hand-back from the worktree (`git log`, the measured numbers), never from the report alone — an empty or "placeholder" hand-back is common (memory `subagent-handback-single-shot`).
- The merge gate set misses `tests/architecture/` and `tests/unit/oracle/`; run them at every merge (jff journal rows 17, 29).
- Journal every decision, mover and halt with its commit.

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — baseline, fixtures, ratchet](batch-0/overview.md) | T0a, T0b, close | [x] |
| [1 — style origin, backcolor helper](batch-1/overview.md) | T1a, T1b, close | [x] |
| [2 — finalizers, producers, klimt carriers](batch-2/overview.md) | T2a, T2b, T2c, T2d (close) | [x] |
| [2b — chrome gradient, klimt-carrier rect](batch-2b/overview.md) (D7, user ruling) | T2p, T2e, T2f, close | [x] |
| [exit](batch-exit/overview.md) | final measurement, docs, follow-ons, memory | [x] |
| [squash](batch-squash/overview.md) | one commit per batch, tag `dbp/pre-squash` | [x] |

## Documents

- [decisions.md](decisions.md) — D1–D6 (user-approved 2026-10-31).
- [task-contract.md](task-contract.md) — the contract every agent prompt includes.
- [close-procedure.md](close-procedure.md) — standard batch close.
- [fixtures.md](fixtures.md) — probe matrix, fixture list, counts per checkpoint.
- [decision-journal.md](decision-journal.md) — appended during execution.
- [diagrams/component-map.md](diagrams/component-map.md), [diagrams/data-flow.md](diagrams/data-flow.md).

## Prior context (read only what a task points at)

- `plans/json-family-followons/` — the tooling and conventions this brief copies; journal rows 20-22 (back-colour rect, `#000000`).
- `.agent-notes/jff-execution.md` (the back-colour rect is painted by `SvgGraphics`, not `addBackcolor`).
- `src/core/assemble-svg-{sequence,activity}.ts` — the two finalizers that already mirror both branches.
- Memories: `squash-per-batch-at-end`, `gate-merges-on-full-set-and-typecheck`, `conformance-harness-mirrors-index-ts`, `honour-ignored-styling-extension`, `jff-status`.

## Final status (2026-11-02)

DONE. Tasks: T0a, T0b, T1a, T1b, T2a, T2b, T2c, T2e, T2f + T2p, all merged. Two user
rulings: T1a's write-set extended (journal 14); batch 2b added (D7, journal 25).

| checkpoint | dbg conformant / total | Σ diffCount | 28-engine losses |
|---|---|---|---|
| b0 | 18 / 42 | 346 | — |
| b1 | 21 / 43 | 340 | 0 |
| b2 | 37 / 43 | 274 | 0 |
| final (b2b) | 79 / 85 | 274 | 0 |

The 6 open rows are board/packet/chart (journal 7; follow-on). d.ts identical to b0;
extended baseline 0 MOVED; jff follow-ons a/b/c struck, wbs family E closed. Follow-ons
are in `planning/next-missions.md`. Final gates: 1899 collected = on-disk, 0 failed.
