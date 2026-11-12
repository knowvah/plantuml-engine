# Task contract

Every task in this brief does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before
   you state why a row differs. The Java is `~/git/plantuml/src/main/java/net/sourceforge/plantuml/gitlog/` (10 files),
   plus `jsondiagram/{Arrow,Mirror}.java` for T2a. For the layout behind `SmetanaForGit`, read the graphviz C at
   `~/git/graphviz/lib/`, not `gen/` or `smetana/`. Grep `src/main/java/net/`, not just `net/sourceforge/plantuml/`.
2. **Check `docs/catalog.md` before building anything.** These already exist: `TitledDiagram`, `Display` (`create`,
   `getWithNewlines`), `Mirror` (`inv`, `invGit`), `XPoint2D`, `XDimension2D` (`mergeTB`, `delta`), `UPath`,
   `UStroke`, `URectangle` (`rounded`), `UTranslate`, `TextBlockUtils.empty`, `UFontFactory` (`monospace`,
   `sansSerif`), `UFontFace`, `FontConfiguration`, `HorizontalAlignment`, `StyleSignatureBasic`, `UGraphicSvg`,
   `UGraphicHandwritten`, `core/graph-layout.ts#layoutGraph`, and `src/diagrams/bpm/bpm-export.ts` (the export to copy).
3. **Red.** Add a failing test under `tests/unit/git/` (or `tests/unit/core/` for T1c, `tests/unit/json/` for
   `Arrow.ts`) that asserts jar values. Take them from a cached `test-results/dot-cache/unknown/<slug>/in.svg`, a
   planning probe oracle (`/tmp/gip-plan/oracle/`), or a fixture oracle. Where no row covers the branch, author a
   `cov-*.puml` under `tests/fixtures/git/` and render it with `scripts/oracle-render.sh <absolute-out-dir> <puml>`.
   Geometry the engine decides (positions, splines, box sizes) is not a unit-test target (D9). Assert structure, order,
   text, fonts, colours and the arithmetic upstream applies to the engine's numbers.
4. **Green.** Port the method. Never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names.
   - Keep dead-looking branches where the Java has them (D1 lists the only exceptions).
   - Do not refactor beyond what the mirror needs.
   - Ported symbols carry a JSDoc `@see` to their Java origin.
5. **Measure, alone.** From T3a on:
   - Survey `unknown` into `/tmp/gip-<task>/`.
   - Run `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base> /tmp/gip-<task>`. Exit 1 is a
     loss: state its mechanism, or stop.
   - Run `survey-moves.mjs /tmp/gip-b0/parity-unknown.json /tmp/gip-<task>/parity-unknown.json` to see what moved.
   - Run `git-rows.mjs /tmp/gip-<task>` for the 4 rows, and `fixtures.mts` once fixtures exist.

   Before T3a the new files are unreachable from `renderSync`, so the unit tests are the measure. T1c is the exception,
   because it touches a shared seam: from T1c on, every batch close runs the full survey (task contract, "Batch close").
   If `/tmp` was cleared, rerun T0's restore lines.
6. **Re-read the task's rows** with `row-diffs.mts` once T3a has run. `compareSvg` short-circuits, so a fix can reveal
   a diff nobody has seen (`.claude/memory/comparesvg-count-not-monotonic.md`). A row or fixture that did not reach
   zero gets a journal line: which mechanism remains, and which task owns it.
7. **Commit** with Conventional Commits: lines ≤80, no attribution, `Refs: #131`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/gip-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task: Observability N/A, since there are no new observable operations. Rollback: Reversible (revert the commit).
Agent: the orchestrator, or a `typescript-pro` subagent given this file, `decisions.md` and the task file as its
prompt. Write-sets are plans: change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Agents using Serena write to the main checkout, which is where this mission works, so never run two writers at once.

## Batch close

1. Run the gates in the README, with `uptime` below ~10.
2. From batch 1 on (T1c touches `core/graph-layout`), run `npm run svg:survey`, then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. 0 lost in every engine.
   - List every census attribute that moved away from the jar
     (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The full survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit
     both, or the drift gate fails. The close order is survey, dashboard, drift test.
3. If a row becomes conformant in another engine, re-pin only that engine's equality pins, with its own tool. Never
   lower a never-rises ceiling to 0 by hand.
4. Tick the overview and README, append the counts to the journal with the close sha, and commit
   `chore(gip): close batch <n>`.
