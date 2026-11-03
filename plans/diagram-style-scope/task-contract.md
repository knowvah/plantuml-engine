# Task contract (every dss task)

Every task spec includes this file by reference. Read it first.

## Context shared by every task
plantuml-ts is a faithful TypeScript port of PlantUML; the Java at
`~/git/plantuml/src/main/java/net/` is the spec. A style value upstream is
`StyleSignatureBasic.of(<snames>).getMergedStyle(builder).value(<PName>)`
(`style/StyleStorage.java:102-116`, `style/StyleSignatureBasic.java:194-220`). Ours:
`src/core/build-theme.ts` → `theme.colors.{background,backgroundGradient,elements}` →
each engine's readers. The mission frame: [decisions.md](decisions.md), D1–D6.

Read each method body you touch and the constructor that built its inputs; quote
`file:line` for every constant, branch and signature. Never fit a value.

Oracles: authored rows at `tests/fixtures/diagram-style-scope/<engine>__<group>-<case>.{puml,svg}`.
Measure with `npx tsx plans/diagram-style-scope/tools/diff-row.mts <row>` (`--all` for every
row). A `cascade-*` row's bar is its delta over that engine's `<engine>__cascade-none`
row (at b0: json 49, yaml 22, unrelated to this mission; state 46, which T3c takes to 0, D7). A new oracle only via
`scripts/oracle-render.sh <ABSOLUTE out-dir> <puml>`.

## Rules
- Mirror upstream structure; reuse what exists. Do not refactor while fixing.
- Preserve upstream names; each touched exported symbol keeps or gains a JSDoc `@see` to its Java origin.
- Check `docs/catalog.md` before writing a helper.
- Tests first (TDD): expected values cite the Java (`file:line`) or a jar oracle; assert specific values. Coverage 90/90/90 on what you add.
- Diagnosis mode on every discrepancy (`~/.claude/rules/diagnosis.md`): mechanism, origin `file:line`, causal chain, ruled out — before any edit.

## Boundaries
- Write only your write-set. A needed file outside it: stop and report (exception: a 500-line split inside your own directory — say so in the hand-back).
- A signature missing from `src/core/style-element-scope.ts` (T3, T4): report it with its Java `file:line`; the orchestrator adds it between merges.
- Never dot-engine, the plantuml fork, the oracle jar, cached oracle bytes, `oracle/accepted-divergences.json`, or any pin/golden/baseline/parity file unless your write-set names it. Never a hand-typed `java -jar`; never hand-edit a fixture `.svg`.
- No Serena edit tools (they write the MAIN checkout); no `git stash`; never push; no background process left running; never `cd` above or outside your worktree.
- No new runtime dependency; `src/` never imports a Node built-in, `process.env`, DOM, network, `Date`, `Math.random()`. No new `Theme`, `ElementColors` or `RenderFragment` field.
- Load is often high: vitest with `--maxWorkers=2 --coverage.enabled=false`; "Test timed out" with no diff is load — rerun.
- Quality bar: your tests green, `npm run typecheck`, eslint + `npx prettier --write <your files>` (worktrees may skip git hooks). If you add/remove a `src/` export and `docs/catalog.md` is in your write-set: `npm run catalog`; otherwise name the change for the orchestrator.
- Observability: N/A — no new observable operations. Rollback: Reversible (revert the task commit).

## Byte check (every task that changes `src/`)
Hash `renderSync` for every `test-results/dot-cache/<engine>/*/in.puml` of your engines before
and after, in jar-compatible mode. Report each mover with its mechanism. A mover with empty
`preprocessed.styles` and unset `preprocessed.skin` is stop 5 (D3b; D7 excepts T3c's note geos). Prove it from measurements, do not infer it.

## Commit
One commit, Conventional Commits (`fix(core): …`, `fix(diagrams): …`, `test(oracle): …`),
≤72-char subject, body = mechanism + Java files read; no attribution lines.
Unsigned, in the worktree.

## Hand-back (one block)
commit SHA · files changed (line counts) · Java read (file:line) · tests (count, all green?) ·
typecheck/lint/catalog · `diff-row.mts` before → after for every row the spec names · the
diagram-style-scope ratchet result · byte-check movers with mechanisms · anything stubbed, skipped
or moved · open questions. Your final message must be this block, not a placeholder. Return only
the structured result — no preamble, no trailing summary.
