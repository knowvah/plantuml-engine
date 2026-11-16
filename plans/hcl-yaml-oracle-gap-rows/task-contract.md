# Task contract

Every task in this brief follows these steps, in order. A task file adds only what is specific to that task.

1. **Read the source first.** For a mechanism, open the Java method and the constructor that built its inputs, and
   quote `file:line` before you state why a row differs. The json family is
   `net/sourceforge/plantuml/jsondiagram/` (`SmetanaForJson.java`, `TextBlockJson.java`, `JsonDiagram.java`); the
   hcl parser is `net/sourceforge/plantuml/hcl/` (`HclParser.java`, `HclTerm.java`). Grep `src/main/java/net/`,
   never just `net/sourceforge/plantuml/`. For graphviz behaviour read the C at `~/git/graphviz/lib/`
   (`common/shapes.c`, `common/splines.c`, `common/arrows.c`); for Smetana's side read `gen/lib/` as the record of
   what Smetana does, never as a port target (CLAUDE.md, "One layout engine"). The README's leads are where to start.
2. **Check before you build.** Grep `docs/catalog.md`, `src/diagrams/json/`, `src/diagrams/hcl/`, `.agent-notes/`
   (`ls .agent-notes | grep -iE "jfp|jff|ddc|jse|ogc|hyogr"`), `plans/json-family-parity/diagnosis/` (the ledger and
   `yaml-hcl.md`) and `docs/graphviz-issues/TRACKER.md`. A mechanism may already be diagnosed or filed.
3. **Red.** Before a code change, add a failing test that asserts jar values from the row's oracle
   (`test-results/dot-cache/<type>/<slug>/in.svg`). Assert specific attributes. T1 is red through the ratchet floor
   it raises before pinning; T2a/T2b/T3 make no code change unless they find a port defect.
4. **Green.** Port the mechanism, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
   - Do not refactor beyond what the mirror needs.
5. **Measure, alone:** `npx tsx plans/hcl-yaml-oracle-gap-rows/measurements/measure-rows.mts /tmp/hyogr-<task>.json`.
   No row's diff count or residue may rise. After any `src/` change also run
   `npx tsx plans/json-family-followons/tools/residue.mts --all` and
   `npx vitest run tests/oracle/svg-conformance/json-family-positional.test.ts tests/oracle/svg-conformance/json-family-structural.test.ts tests/oracle/svg-conformance/json.golden.ratchet.test.ts tests/oracle/svg-conformance/yaml.golden.ratchet.test.ts tests/oracle/svg-conformance/hcl.golden.ratchet.test.ts`,
   and read the count.
6. **Pin** each row that reached zero:
   `npx jiti plans/hcl-yaml-oracle-gap-rows/tools/pin-goldens.mts hyogr-<task> <task> <slug...>`. Drop the row's
   `json-family-positional.json` entry, raise the hcl floor in `json-family-ratchet.ts`, then run
   `npx vitest run tests/oracle/svg-conformance/hcl.golden.ratchet.test.ts tests/oracle/svg-conformance/json-family-positional.test.ts tests/oracle/svg-conformance/routing-conformance.test.ts tests/oracle/svg-conformance/refusal-coverage.test.ts`
   and update the running counts those tests assert, with a dated comment line in each test's existing pattern
   (`routing-conformance.test.ts:1095-1097`).
7. **Commit** with Conventional Commits. Lines are ≤80, the footer is `Refs: #142`, and the trailer is the harness's
   `Co-Authored-By`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/hyogr-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the gates in the README, with `uptime` below ~10.
2. If the batch pinned, run `npm run parity:dashboard` and commit `docs/parity-report.md`, or the drift gate fails.
3. From batch 2 on:
   - Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`.
     It must show 0 lost in every engine.
   - List every census attribute that moved away from the jar
     (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit both.
4. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
