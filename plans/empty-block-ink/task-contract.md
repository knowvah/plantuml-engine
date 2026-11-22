# Task contract

Every task follows these steps, in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs, and quote `file:line`
   before you state why a row differs: `net/sourceforge/plantuml/jsondiagram/` (`JsonDiagram.java`,
   `TextBlockJson.java`, `SmetanaForJson.java`) and `klimt/drawing/LimitFinder.java`. Grep `src/main/java/net/`,
   never just `net/sourceforge/plantuml/`. For graphviz read `~/git/graphviz/lib/common/shapes.c`; read Smetana's
   `gen/lib/` only as the record of what Smetana does.
2. **Check before you build.** `.agent-notes/hyogr-T2a.md`, `plans/hcl-yaml-oracle-gap-rows/decision-journal.md`
   row 6, `plans/json-family-parity/diagnosis/`, and `docs/catalog.md`.
3. **Red.** Before a code change, add a failing test that asserts specific values: synthetic `JsonNodeGeo` inputs for
   the branch, plus one jar value from a committed oracle (`tests/fixtures/json/nested-arrays.svg`, `height="144px"`).
4. **Green.** Port the mechanism; never fit a value. Every constant carries its upstream `file:line`, and every
   ported symbol a JSDoc `@see`. Do not refactor beyond what the mirror needs.
5. **Measure, alone.** `npx tsx plans/json-family-followons/tools/residue.mts --all > /tmp/ebi-<task>.txt` and diff
   it against the README table. Then run
   `npx vitest run tests/oracle/svg-conformance/json-family-positional.test.ts tests/oracle/svg-conformance/json-family-structural.test.ts tests/oracle/svg-conformance/json.golden.ratchet.test.ts tests/oracle/svg-conformance/yaml.golden.ratchet.test.ts tests/oracle/svg-conformance/hcl.golden.ratchet.test.ts tests/unit/json`
   and read the count.
6. **Commit** in Conventional Commits: lines ≤80, footer `Refs: #187`, the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
7. **Notes.** Write `.agent-notes/ebi-<task>.md` for anything unexpected (template in `~/.claude/rules/memory.md`).

**Every task:** observability N/A (no new operations); rollback Reversible (revert the commit); agent is the
orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file. Write-sets
are plans: change another file in this repository when the work needs it, and journal why. A subagent's mechanism is
a claim until you have read the source yourself. Never run two writers at once.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
