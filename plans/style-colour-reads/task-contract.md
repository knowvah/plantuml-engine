# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before
   you state why a row differs. Grep `src/main/java/net/`, not just `net/sourceforge/plantuml/`. The citations in the
   README table and in `decisions.md` were read on 2026-11-06. A task's **Read** list also holds starting points
   nobody opened in planning, so treat those as leads until you can quote them. Check `docs/catalog.md` before
   building anything.
2. **Red.** Add a failing test under the module's own test directory that asserts jar values, taken from an authored
   row's oracle `.svg` in `tests/fixtures/diagram-style-scope/`. A new branch with no row gets one, added to
   `measurements/gen-rows.mjs` and rendered the T0 way.
3. **Green.** Fix at the origin. Never fit a value: every constant carries its upstream `file:line`. Mirror the jar,
   even where it looks like a bug. Preserve upstream names, and do not refactor beyond what the mirror needs.
4. **Measure, alone.** `rows.mts` over the task's prefixes, then the buckets its seam reaches, each surveyed into
   `/tmp/scr-<task>/` and compared with `ubt-moves.mjs` against the T0 copy in `/tmp/scr-b0/`. Exit 1 is a loss:
   state its mechanism or stop. If `/tmp` was cleared, rerun T0's `git show` lines.
5. **Re-read the task's rows** with `rows.mts --diffs 10`. `compareSvg` short-circuits, so a fix can reveal a diff
   nobody has seen. A row that did not reach zero gets a journal line: which mechanism remains, and which task owns
   it. Lower its pin to the new count (the pin shrinks only).
6. **Commit** with Conventional Commits, lines ≤80, no attribution, `Refs: #122`. Prettier runs on commit (D8).
7. **Notes.** Write `.agent-notes/scr-<task>.md` for anything unexpected, in the template of
   `~/.claude/rules/memory.md`.

Every task: Observability N/A — no new observable operations. Rollback Reversible (revert the commit). Agent:
orchestrator or a `typescript-pro` subagent with this file, `decisions.md` and the task file as its prompt.
Write-sets are plans.

A subagent's mechanism is a claim until you have read the Java yourself
(`.claude/memory/verify-agent-claims-si31.md`). Agents using Serena write to the main checkout, which is where this
mission works, so run no two writers at once. Do not leave a background agent running when a turn ends: a headless
run exits about 10 minutes later and kills it (`.claude/memory/headless-background-agent-killed.md`).

## Batch close

1. The four gates and `npm run format:check`, at `uptime` below ~10.
2. `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`: 0 lost
   in every engine. List every census attribute moving away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
3. A rise in `npx jiti plans/description-divergence-drive/measurements/measure-diff-baseline.mts` is stop 2 unless a
   correct fix explains it, journaled with its mechanism; tighten only where a value fell.
4. `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope`: journal the
   `rows N open M` line.
5. Regenerate `docs/parity-report.md` after the survey (`npm run parity:dashboard`) when the drift test needs it.
6. Tick the overview and README, append the counts to the journal with the close sha, and commit
   `chore(scr): close batch <n>`.
