# Task contract

Every task in this brief follows these steps, in order. A task file adds only what is specific to that task.

1. **Read the Java first.** Open the method, and the constructor that built its inputs. Quote `file:line` before you
   state why a row differs. The class Java is `classdiagram/` and `classdiagram/command/`, drawn through `svek/` and
   `abel/`, and `net/atmp/CucaDiagram.java` sits **outside** `net/sourceforge/plantuml/`. Grep `src/main/java/net/`,
   never just `net/sourceforge/plantuml/`. The README table's leads are where to start, not conclusions.
2. **Check before you build.** Grep `docs/catalog.md` and `src/` for the Java class name (`@see` tags cite it), and
   read `.agent-notes/` for the mechanism (`grep -l <JavaClass> .agent-notes/*.md`). Class has had nine divergence
   drives: most svek images and creole atoms are already ported, often in `src/core/svek/` or `src/core/klimt/`
   rather than `src/diagrams/class/`. Description sometimes ports a seam class lacks (T2e is one); reuse the ported
   upstream class, never a second copy.
3. **Red.** Add a failing test under `tests/unit/class/cogr-<task>.test.ts` that asserts jar values, taken from the
   row's oracle (`test-results/dot-cache/class/<slug>/in.svg`). Assert specific attributes, not "renders".
4. **Green.** Port the mechanism, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and keep dead-looking branches where the Java has them.
   - Do not refactor beyond what the mirror needs.
   - Give every ported symbol a JSDoc `@see` to its Java origin.
5. **Measure, alone:** `npx tsx plans/class-oracle-gap-rows/measurements/measure-rows.mts /tmp/cogr-<task>.json`.
   The task's rows must reach `n=0`, and no other row may rise. Then run the class ratchet
   (`npx vitest run tests/oracle/svg-conformance/class.golden.ratchet.test.ts`, about 1000 cases) and read its count.
6. **Re-read the task's rows** after each fix. `compareSvg` short-circuits, so a fix can reveal a diff nobody has seen
   yet (`.claude/memory/comparesvg-count-not-monotonic.md`).
7. **Pin** each row that reached zero:
   `npx jiti plans/class-oracle-gap-rows/tools/pin-goldens.mts cogr-<task> <task> <slug...>`. Then run
   `npx vitest run tests/oracle/svg-conformance/class.golden.ratchet.test.ts tests/oracle/svg-conformance/routing-conformance.test.ts tests/oracle/svg-conformance/refusal-coverage.test.ts`
   and update the running counts those tests assert, if a count moved.
8. **Commit** with Conventional Commits. Lines are ≤80, the footer is `Refs: #140`, and the trailer is the harness's
   `Co-Authored-By`. Prettier runs on commit.
9. **Notes.** Write `.agent-notes/cogr-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Authored rows (push-forward only)

1. Write `<abs>/oracle/goldens/svg-class/cogr-<task>-<case>/in.puml` (flat, no type level), per
   `oracle/goldens/svg-class/README.md`, "How an AUTHORED fixture reaches the parity corpus".
2. Render it twice: `scripts/oracle-render.sh /tmp/cogr-orc/r1 <abs puml>` and again into `/tmp/cogr-orc/r2`. The two
   SVGs must be byte-identical (stop 6). Copy `r1`'s SVG to `golden.svg` beside the source.
3. The jar must draw a diagram. An authored row that the jar refuses shows the jar's grammar, not ours: drop it.
4. Run `npx jiti scripts/dot-sync-report.ts class`, then the class-only survey
   (`npm run svg:survey -- class --out tests/oracle/svg-conformance/parity-class.json`), then measure it.
5. Append it to `ratchet.json` with `source: "authored"` once it reaches zero.

## Batch close

1. Run the gates in the README, with `uptime` below ~10.
2. From batch 2 on:
   - Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`.
     It must show 0 lost in every engine.
   - List every census attribute that moved away from the jar
     (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit both,
     or the drift gate fails.
3. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
