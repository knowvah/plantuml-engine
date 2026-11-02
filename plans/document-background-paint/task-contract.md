# Task contract (every dbp task)

Every task spec includes this file by reference. Read it first.

## Context shared by every task
plantuml-ts is a faithful TypeScript port of PlantUML; the Java at
`~/git/plantuml/src/main/java/net/` is the spec. The document background is
painted by one upstream place: `klimt/drawing/svg/SvgGraphics.java:176-212`
(constructor + `paintBackcolor`), sized in `finalizeRootAttributes` (`:800-822`).
Its colour comes from `TitledDiagram#calculateBackColor` (`TitledDiagram.java:280-289`)
or the skinparam. Ours: theme (`src/core/style-map-*.ts`, `skinparam-key-handlers-table-a.ts`)
→ each engine's renderer → `RenderFragment` (`src/core/dispatcher-types.ts`)
→ `src/core/assemble-svg*.ts` finalizers → `src/core/klimt/document-shell.ts`.
The mission frame: [decisions.md](decisions.md), D1–D6.

Read each method body you touch and the constructor that built its inputs;
quote `file:line` for every constant and branch. Never fit a value.

Oracles: authored rows at `tests/fixtures/document-background/<engine>-<case>.{puml,svg}`.
Render ours with `renderSync` (`src/index.ts`) under `withJarCompatibleStyleInput`
(`src/core/internal-render-options.ts`) and `DeterministicMeasurer`
(`src/core/measurer-deterministic.ts`); compare with `compareSvg`
(`tests/oracle/svg-conformance/compare.ts`), or run
`npx tsx plans/document-background-paint/tools/diff-row.mts <engine>-<case>`.
A new oracle only via `scripts/oracle-render.sh <ABSOLUTE out-dir> <puml>`.

## Rules
- Mirror upstream structure; reuse what exists (`parseColor`, `paintToSvg`, the wbs carrier). Do not refactor while fixing.
- Preserve upstream names; each touched exported symbol keeps or gains a JSDoc `@see` to its Java origin.
- Check `docs/catalog.md` before writing a helper.
- Tests first (TDD): expected values cite the Java (`file:line`) or a jar oracle; assert specific values. Coverage 90/90/90 on what you add.
- Diagnosis mode on every discrepancy (`~/.claude/rules/diagnosis.md`): mechanism, origin `file:line`, causal chain, ruled out — before any edit.

## Boundaries
- Write only your write-set. A needed file outside it: stop and report (exception: a 500-line split inside your own directory — say so in the hand-back).
- Never dot-engine, the plantuml fork, the oracle jar, cached oracle bytes, `oracle/accepted-divergences.json`, or any pin/golden/baseline/parity file unless your write-set names it. Never a hand-typed `java -jar`; never hand-edit a fixture `.svg`.
- No Serena edit tools (they write the MAIN checkout); no `git stash`; never push; no background process left running; never `cd` above or outside your worktree.
- No new runtime dependency; `src/` never imports a Node built-in, `process.env`, DOM, network, `Date`, `Math.random()`. Gradient ids from the seeded def counter only.
- Load is often high: vitest with `--maxWorkers=2 --coverage.enabled=false`; "Test timed out" with no diff is load — rerun.
- Quality bar: your tests green, `npm run typecheck`, eslint + `npx prettier --write <your files>` (worktrees may skip git hooks). If you add/remove a `src/` export: `npm run catalog` and include `docs/catalog.md`.
- Observability: N/A — no new observable operations. Rollback: Reversible (revert the task commit).

## Commit
One commit, Conventional Commits (`fix(core): …`, `fix(json): …`, `test(oracle): …`),
≤72-char subject, body = mechanism + Java files read; no attribution lines.
Unsigned, in the worktree.

## Hand-back (one block)
commit SHA · files changed (line counts) · Java read (file:line) · tests (count,
all green?) · typecheck/lint/catalog · `diff-row.mts` before → after (diff count,
conformant) for every row the spec names · the document-background ratchet
result · any other row that moved, with its mechanism · anything stubbed,
skipped or moved · open questions. Return only the structured result — no
preamble, no trailing summary.
