# git-engine-port (gip)

**Read first, every start and after every compaction:**
1. `~/.claude/docs/reference/autonomous-execution.md`
2. this file
3. [decisions.md](decisions.md)
4. [task-contract.md](task-contract.md)
5. the current batch's `overview.md`

Then tail [decision-journal.md](decision-journal.md) to see where you stopped.

Source: GitHub issue #131. Planned unattended on 2026-11-11 at `feature/parity-queue` `d136df2eb`.

## Objective

Port `net/sourceforge/plantuml/gitlog/` (10 Java files, 1,242 lines with headers) file for file into
`src/diagrams/git/` (D1). Register it at `PSystemBuilder.java:191`. Lay it out through `@knowvah/dot-engine` in place
of `SmetanaForGit`'s Smetana calls, building the same graph (D2). Then:
- Take the **4 `@startgit` rows** to conformant, or to a structural match whose remaining geometry is named in
  `DIVERGENCES.md`'s existing Smetana entry (D9).
- Author probes past them (D7).
- Pin everything in a new `svg-git` ratchet (D8).
- Lose no conformant row in any engine, and regenerate `docs/parity-report.md`.

This is a Smetana path. The 2026-08-09 ruling (`CLAUDE.md`, "One layout engine") applies: readability first and SVG
fidelity second, no Smetana number is a target, and upstream *structure* is still mirrored. A geometry residue is
named under the standing ruling only when it is proven to be Smetana-vs-graphviz arithmetic (D9). Anything else is a
port defect.

## Starting state, measured 2026-11-11 on `d136df2eb`

No plugin registers `GIT`, so every `@startgit` source gets the "unknown diagram type" sentinel. All 4 rows sit in the
**`unknown`** cache tree (`test-results/dot-cache/unknown/`, `parity-unknown.json`), and the jar draws all 4
(`data-diagram-type="GIT"`). `measurements/git-rows.mjs` finds them (`measurements/planning-rows.json`): all diverged,
and every first diff is `svg/@background`.

| Row | Source lines | Commits | Jar boxes / paths | Canvas |
|---|---|---|---|---|
| `juzane-95-fose365` | 7 | 5 | 5 / 8 | 319×219 |
| `mebafo-26-fupu096` | 10 | 6 (one octopus `*-.---.`) | 6 / 14 | 328×164 |
| `lagapi-44-lemu042` | 98 | 75 | 35 / 74 | 543×1629 |
| `figagi-40-mila236` | 2,289 | 1,806 | 665 / 1,714 | 772×39049 |

`figagi` is a 665-node, 857-edge graph. Time its render at T3a: the survey's per-row timeout is 60 s
(`scripts/svg-parity-survey.ts:132`).

**Upstream tests:** none beyond `DiagramTypeTest.java`. Upstream has no `{{git` embedded keyword. **38 planning probes**
are in [probes/](probes/), rendered with `scripts/oracle-render.sh` on 2026-11-11 into `/tmp/gip-plan/oracle`. 34 draw
`GIT`. 4 are jar crash pages: `IllegalArgumentException` (`cov-star-alone`, `cov-star-no-space`, `cov-tab`) and
`UnsupportedOperationException` (`cov-orphan-pipe`).

**`planning/mission-guide.md` Phase 5a is wrong.** Its watch-outs (`commit id:`, `branch`, `checkout`, `cherry-pick`,
`order`) describe Mermaid's `gitGraph`. Upstream's `@startgit` reads pasted `git log --graph --oneline` output as a
character grid. The Java is the spec, and T5 rewrites the section (D1).

How to read the table below:
- **Status** says what planning established. **Read** means planning read the Java. **Probe** means a jar render on
  2026-11-11 showed it.
- Every task still opens the Java itself and finds the line.

| What the jar does | Java | Status | Task |
|---|---|---|---|
| Every source line between the tags goes into a text area. A line with a `*` is a commit; its name is the first token after stripping `-.*\|/\\` | `GitDiagramFactory#createSystem`, `GitTextArea#getAllCommits`, `CursorPosition#getCommitNameInLine` | Read + Probe (`cov-creole-name`: `**bold**` → `bold`) | T1a, T2b |
| A commit's parents are found by walking the grid down from `\|`, `\\` and `/` below it, and from `.` cells after an octopus `*-.` | `Commit#getCandidatesForDown`, `#addAbove`, `CursorPosition#getDownFromInternal` (23 ordered rules) | Read + Probe (`cov-merge-simple`, `cov-octopus`, `cov-crossing`, `cov-underscore`) | T1a |
| A comment is the text between the first `(` after the `*` and the next `)`, anywhere on the line, and is drawn only on a top node | `CursorPosition#getCommentInLine`, `MagicBox#getCommentBlock` | Read + Probe (`cov-comment-in-message`, `cov-comment-not-top`) | T1a, T2a |
| Linear runs fold into one box: a node with one parent and one child eats its child when that child also has one of each | `GNode#canEatTheNextOne`, `#eatTheNextOne`, `GNodeBuilder#merge` | Read + Probe (`cov-chain-four`: 4 commits, 3 boxes) | T1b |
| Duplicate names: `LinkedHashMap.put` keeps the first slot and swaps in the later node | `GNodeBuilder` ctor | Read + Probe (`cov-duplicate-name`) | T1b (D6) |
| Graph `ranksep=0.35`; `shape=box`, `width`/`height` = `getBigDim`/72 with no `fixedsize` and no label; edges `arrowsize=.7`, `arrowtail=none`, `arrowhead=normal` | `SmetanaForGit#initGraph`, `#createNode`, `#createEdge` | Read | T1c, T2b (D2) |
| Box = engine size, rounded 8, stroke 1.5, at `x - w/2` and a Y mirrored about the lowest box bottom; comment above, the name block centred in the rest | `SmetanaForGit#getPosition`, `#getSize`; `MagicBox#drawBorder`; `jsondiagram/Mirror` | Read + Probe | T2a, T2b |
| Edges: dashed `UStroke(2,2,1)` cubic path, then an inline `Arrow` filled with the line colour when `ep` is set | `GitCurve#drawCurve`, `jsondiagram/Arrow` | Read + Probe | T2a |
| Draw order: every box (rect, comment, name), then every edge | `SmetanaForGit#drawMe` | Probe (`juzane-95`) | T2b |
| Fonts: name monospace 15 bold, comment sans-serif 13; colours from `{root, element, gitDiagram}` (`#181818` lines, `#000` text) | `MagicBox` ctor, `#getSmallBlock` | Read + Probe | T2a |
| No command parser: `skinparam`, `<style>`, `title`, `scale`, `!theme` and `!pragma darkmode` change nothing; `!option handwritten` jiggles | `PSystemAbstractFactory`, `TitledDiagram` | Probe (`cov-skinparam` … `cov-option-handwritten`) | T2b (D4) |
| Crashes: `IllegalArgumentException` when the `*` is not followed by a space or `-`; `UnsupportedOperationException` when no walk rule matches | `Commit` ctor, `CursorPosition#getDownFromInternal` | Read + Probe | T1a (D5) |

## Branch

`feature/parity-queue` is the one branch every queue mission stacks on, and the driver has already checked it out.
- T0 commits this brief.
- One unsigned commit per task, in the **main checkout, serially, no worktrees** (D10).
- Do not create another branch, and do not merge main into this one.
- The squash batch collapses the mission to **one commit** on the mission base sha named in the execution prompt, and
  tags `git-engine-port/pre-squash`.
- Never push: the user reviews, signs and pushes.

## Quality gates (all at every batch close)

```sh
uptime   # above ~10, wait: vitest per-test timeouts fail with no diff under load
npm test -- --maxWorkers=4 && npm run typecheck && npm run lint && npm run build
npm run format:check
```

- Run `npm test`, never `vitest run tests/unit`.
- New exports need `npm run catalog` (drift-gated).
- A `vitest run <paths>` that collects nothing exits 0, so read the count.
- The baseline on `d136df2eb` is in [decisions.md](decisions.md#baseline).
- Stay on graphviz 16.1.0 (`dot -V`): T1c and D9 compare dot-engine against real `dot -Tdot`.

## Measurement commands

The tools are under `plans/git-engine-port/measurements/`, adapted at planning from bpe's by name substitution, plus
`verdict-diff.mjs` from `plans/description-divergence-drive/measurements/`. Read a tool before trusting its output:
only `git-rows.mjs` was run at planning. Rules for running them:
- Run with `node` or `npx jiti`, and type commands literally: the allowlist has no `bash plans/...`, `date`, or
  shell-variable prefixes.
- Producers run **alone** (`.claude/memory/parallel-surveys-fake-timeouts.md`).
- Never `cd` below the repo root.

The commands:
- **Survey**, always with `--out`: `npm run svg:survey -- unknown --out /tmp/gip-<task>/parity-unknown.json`. A
  positional type with no `--out` clobbers `parity.json`.
- **Losses and moves:** `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/gip-<task>`
  exits 1 on a row that left conformant. `node plans/git-engine-port/measurements/survey-moves.mjs /tmp/gip-b0/parity-unknown.json /tmp/gip-<task>/parity-unknown.json`
  lists every moved row.
- **The 4 rows:** `node plans/git-engine-port/measurements/git-rows.mjs /tmp/gip-<task> --json /tmp/gip-<task>/rows.json`
  prints each with its oracle kind, verdict and first diff, and a count.
- **Every diff:** `npx jiti plans/git-engine-port/measurements/row-diffs.mts plans/git-engine-port/measurements/planning-rows.json /tmp/gip-<task>/diffs.json [slug ...]`
  writes every diff, with our SVG beside the JSON.
- **Fixtures:** `npx jiti plans/git-engine-port/measurements/fixtures.mts [slug ...]` checks every
  `tests/fixtures/git/<slug>.puml` against its `<slug>.svg`, one line each.
- **Pins, from T4 on:** `npx jiti plans/git-engine-port/measurements/pin-git.mts [--write]` lists pin candidates. As
  adapted it pins conformant rows only; T4 extends it to the structural tier (D8).
- **Baselines, from T4 on:** `build-authored-baseline.mts <commit> [--write]`, `build-diff-baseline.mts <commit> [--write]`
  and `repin-routing-refusal.mts <commit> [--write]`.
- **Every engine, at batch close from batch 3:** `npm run svg:survey`, then
  `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. Exit 1 on a loss.
- **Engine parity (D2, D9):** dump the DOT our `SmetanaForGit` hands the engine, then run real `dot -Tdot` on it
  (`.claude/memory/dot-engine-blame-needs-real-dot.md`).
- **Oracles:** `scripts/oracle-render.sh <absolute-out-dir> <puml...>`, never a hand-typed `java -jar`.

`fixtures.mts`, `pin-git.mts` and the two baseline builders import `render-fixture-git.ts`, which T4 creates. T3a may
create it early; until then, use `renderSync` directly. `row-diffs.mts` needs only `renderSync`.

## Stop conditions (halt, journal, report)

1. A conformant row leaves conformant and you cannot state its mechanism with `file:line`.
2. A ratchet pin would have to rise, or `--accept-rises` looks necessary.
3. The same gate fails on 2 consecutive fix attempts.
4. A finding contradicts D1 to D11: amend `decisions.md` with the date, then halt.
5. dot-engine and real `dot -Tdot` disagree on the DOT our port emits. File it in `docs/graphviz-issues/` with a
   `TRACKER.md` line before halting. Never edit dot-engine (`.claude/memory/dot-engine-changes-go-in-tracker.md`).

These are **not** stops:
- A row that needs a ruling. It goes on a `needs-ruling` issue naming the row, and everything else finishes.
- A file outside a task's write-set. Change it and journal why.
- `figagi-40` timing out at 60 s. Profile it, journal the time, file a dot-engine performance issue if the engine is
  where the time goes, and open a follow-on queue issue naming the row. Finish everything else.

`oracle/accepted-divergences.json` gains or changes no acceptance here.

## Push-forward (decide, journal, continue)

- Reordering tasks, merging two that turn out to share a mechanism, or splitting one that runs past about 15 minutes.
- A residual diff on these rows or fixtures: read the Java and fix it in the task that owns it, or add a task.
- More authored `.puml` fixtures and oracles where a walk rule or branch has no row.
- Helper splits forced by the 500-line, NLOC, CCN or parameter hooks (D11).
- Rerunning a timed-out vitest or survey at lower load before calling it a finding.
- Fixing an adjacent defect a probe exposes in a shared klimt or core module, with its Java quote. A gain in another
  bucket counts for that bucket's issue: T5 comments there, or leaves the text in `.agent-notes/` if denied.

## Blast radius

- **Data model:** none.
- **API:** no public change expected; `dist/*.d.ts` is checked at T5. `block-extractor.ts#DiagramType` gains `'git'`.
  It is internal, and `plantuml-ts` has no consumers.
- **Dependencies:** none new. Git layout goes through the existing `core/graph-layout.ts` → `@knowvah/dot-engine` seam.
- **SVG output** changes on purpose, for `@startgit` only.
- **Shared seams:**
  - `core/graph-layout*` gains one node kind: a box with `width`/`height` as minimums, no `fixedsize` and no label.
    It also gains a raw `ranksep` with no svek floor and no `nodesep` line (T1c). Every existing caller emits
    byte-identical DOT.
  - `src/diagrams/json/Arrow.ts` is new. `JsonCurve.ts` and `Mirror.ts` stay unchanged (D3).
  - `core/block-extractor.ts`, `registered-plugins.ts` and maybe `core/assemble-svg.ts` gain a row each.
  - The layering `ALLOWLIST` gains `git → json` (D3).

| File | Action | Task |
|---|---|---|
| `src/diagrams/git/{GitTextArea,CursorPosition,Commit}.ts` | Create | T1a |
| `src/diagrams/git/{GNode,GNodeBuilder}.ts` | Create | T1b |
| `src/core/graph-layout.types.ts`, `src/core/graph-layout-build*.ts` | Modify | T1c |
| `src/diagrams/json/Arrow.ts`, `src/diagrams/git/{MagicBox,GitCurve}.ts` | Create | T2a |
| `src/diagrams/git/{SmetanaForGit,GitDiagram,GitDiagramFactory,git-export}.ts` | Create | T2b |
| `src/diagrams/git/index.ts`, `src/registered-plugins.ts`, `src/core/{block-extractor,assemble-svg}.ts`, `tests/architecture/layering.test.ts` | Create, Modify | T3a |
| `tests/unit/git/**`, `tests/unit/core/**`, `tests/unit/json/**` | Create | T1a to T3a |
| `tests/fixtures/git/**` | Create | T3b |
| `src/diagrams/git/**`, the T1c core modules | Modify | T3c |
| `DIVERGENCES.md` (the Smetana entry's git rows) | Modify | T3c |
| `oracle/goldens/svg-git/**`, `tests/oracle/svg-conformance/{git.golden.ratchet.test.ts,git.diff-baseline.ratchet.test.ts,render-fixture-git.ts}` | Create | T4 |
| `oracle/goldens/svg-conformance/{routing,refusal}-baseline.json`, their count tests, `scripts/parity-dashboard-goldens.ts` | Modify | T4 |
| `docs/parity-report.md`, `tests/oracle/svg-conformance/parity-*.json`, `planning/{next-missions,mission-guide,roadmap}.md`, `docs/catalog.md` | Modify | T3a to T5 |

## Batches

| batch | tasks | status |
|---|---|---|
| [0 — brief and baseline](batch-0/overview.md) | T0 | [x] |
| [1 — grid parser, nodes, engine seam](batch-1/overview.md) | T1a, T1b, T1c | [x] |
| [2 — drawing, layout bridge, diagram, factory](batch-2/overview.md) | T2a, T2b | [x] |
| [3 — turn on, probes, residuals](batch-3/overview.md) | T3a, T3b, T3c | [x] |
| [4 — ratchet](batch-4/overview.md) | T4 | [x] |
| [exit](batch-exit/overview.md) | T5 | [x] |
| [squash](batch-squash/overview.md) | T6 | [x] |

## Done when (issue #131)

- [x] Every row in scope is conformant, or named in `DIVERGENCES.md` or `oracle/accepted-divergences.json` with its
  mechanism. (journal 27-30: 4 rows + 46 drawn fixtures in the git row table)
- [x] A new divergence has a forcing library or a signed ruling. A row that needs a ruling is on a `needs-ruling` issue.
  (no new divergence: every residue sits under the 2026-08-09 Smetana ruling; no row needed a ruling)
- [x] 0 conformant losses in every engine, baseline survey against final survey. (journal 12, 19, 32, 36)
- [x] Conformant rows are pinned in a ratchet, and `docs/parity-report.md` is regenerated. (journal 33-35; no
  conformant corpus row exists, the structural ones are pinned with ceilings)
- [x] `npm test`, `npm run typecheck`, `npm run lint` and `npm run build` pass. (journal 36, 37)

## Documents

- [decisions.md](decisions.md): D1 to D11, operational readiness, baseline.
- [task-contract.md](task-contract.md): what every task does and how it closes.
- [decision-journal.md](decision-journal.md): appended during execution.
- [diagrams/data-flow.md](diagrams/data-flow.md), [diagrams/component-map.md](diagrams/component-map.md).
- [probes/](probes/): the 38 planning probe sources.
- [measurements/](measurements/): the tools above and `planning-rows.json`.

**Settings:** the existing `.claude/settings.autonomous.json` covers every command in this brief (`node`, `npx jiti`,
`npm`, `scripts/oracle-render.sh`, `dot`, `gh issue`). It was deliberately not regenerated: the SessionStart hook
compares it with the live `.claude/settings.json`.

## Summary (2026-11-12, T5)

**Tasks:** T0, T1a, T1b, T1c, T2a, T2b, T3a, T3b, T3c, T4, T5 done (11 of 11 before the squash); T6 squashes. No task
was split, merged or dropped; the layering allowlist moved from T3a to T2a and the registration-test row was added at
the batch-3 close (journal 15, 31).

**Gates:** every batch close green on its second run at most (2 gate failures, both at the first run of a close, each
fixed in one attempt with its mechanism stated: journal 11, 31). Final: `npm test -- --maxWorkers=4` 2203 files /
47023 tests passed, typecheck, lint, build, format:check exit 0 (journal 36-37).

**Verdicts, base `d136df2eb` → final:** the 4 `@startgit` rows go from `diverged` (unknown-type sentinel, first diff
`svg/@background`) to juzane-95 / mebafo-26 `structural-match` (maxDelta 1.848 / 3.881) and lagapi-44 / figagi-40
`diverged` on curve cubic-piece counts only (1 / 10 paths; maxDelta 65.8 / 216.4). Overall conformant 5,708 / 5,927
unchanged, structural-match 120 → 122, 0 lost in any engine; every other bucket byte-identical in its survey rows.

**Authored:** 55 fixtures in `tests/fixtures/git/` (38 planning probes + 17 authored): 1 zero-diff, 8 jar crash
pages paired with ours (all 8 also crash the stock release jar), 45 structural-match, 1 diverged
(`cov-long-chain-after-merge`, piece count from the `\N` label width). Walk rule coverage: every rule but 178 (proven
unreachable) is reached by a fixture or row.

**Rows left and their ends:** all 50 drawn non-conformant rows are named in `DIVERGENCES.md`'s git row table under the
Smetana ruling (U-BOX, `\N` label, U-ARROW, U-CLIP, plus U-NS on lagapi/figagi), with evidence in `diagnosis/`. No
`needs-ruling` issue was needed.

**CI risk:** the latest main run's slowest shard is shard 3 at 10 m 31 s (run 43064928398). The two git ratchet files
take ~3.6 s locally (figagi's row 0.55 s against the 30 s `CI_RENDER_BUDGET_MS`); at the recorded 2-8× runner factor
that adds roughly 7-28 s to one shard. The routing/refusal walks gain 4 golden rows each.

**Follow-ons:** `planning/next-missions.md` "git-engine-port (gip)". The #131/#136 comments are in
`.agent-notes/gip-T5.md` (`gh issue comment` denied). `CLAUDE.md`'s "`@startgit` (`SmetanaForGit`, unbuilt)" is left
for the user.

