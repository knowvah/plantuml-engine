# Task contract

Every task in this brief follows these steps, in order. A task file adds only what is specific to that task.

1. **Read the Java first.** Open the method, and the constructor that built its inputs. Quote `file:line` before you
   state why a row differs. The sequence Java is under
   `~/git/plantuml/src/main/java/net/sourceforge/plantuml/sequencediagram/`; upstream draws every sequence diagram
   with teoz (`SequenceDiagram.java:311-312`), so the tiles under `teoz/` are the spec. Grep `src/main/java/net/`,
   never just `net/sourceforge/plantuml/`. The README table's leads are where to start, not conclusions.
2. **Check `docs/catalog.md` before you build anything.** The sequence modules already port most tiles: grep the
   catalog and `src/diagrams/sequence/` for the Java class name (`@see` tags cite it), for example `GroupingTile.java`
   (16 files), `NotesTile.java` (5), `AtomOpenIconic`.
3. **Red.** Add a failing test under `tests/unit/sequence/sogr-<task>.test.ts` that asserts jar values, taken from the
   row's oracle (`test-results/dot-cache/sequence/<slug>/in.svg`). Assert specific attributes, not "renders".
4. **Green.** Port the mechanism, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and keep dead-looking branches where the Java has them.
   - Do not refactor beyond what the mirror needs.
   - Give every ported symbol a JSDoc `@see` to its Java origin.
5. **Measure, alone:** `npx tsx plans/sequence-oracle-gap-rows/measurements/measure-rows.mts /tmp/sogr-<task>.json`.
   The task's rows must reach `n=0`, and the other rows must not move. Use `diff-one.mts <slug>` for detail.
6. **Re-read the task's rows** after each fix. `compareSvg` short-circuits, so a fix can reveal a diff nobody has seen
   yet (`.claude/memory/comparesvg-count-not-monotonic.md`).
7. **Pin** each row that reached zero:
   `npx jiti plans/sequence-oracle-gap-rows/tools/pin-goldens.mts sogr <task> <slug...>`. Then run
   `npx vitest run tests/oracle/svg-conformance/sequence.golden.ratchet.test.ts tests/oracle/svg-conformance/sequence.diff-baseline.ratchet.test.ts tests/oracle/svg-conformance/routing-conformance.test.ts tests/oracle/svg-conformance/refusal-coverage.test.ts`
   and update the running counts those tests assert, if a count moved.
8. **Commit** with Conventional Commits. Lines are ≤80, the footer is `Refs: #139`, and the trailer is the harness's
   `Co-Authored-By`. Prettier runs on commit.
9. **Notes.** Write `.agent-notes/sogr-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Authored rows (T2a, and any push-forward)

1. Write `<abs>/test-results/dot-cache/sequence/sogr-<group>-<case>/in.puml`.
2. Render it twice: `scripts/oracle-render.sh /tmp/sogr-orc/r1 <abs puml>` and again into `/tmp/sogr-orc/r2`. The two
   SVGs must be byte-identical (stop 6). Copy `r1`'s SVG to `in.svg` beside the source, and add an empty `.done` as the
   neighbouring rows have.
3. The jar must draw a diagram. An authored row that the jar refuses shows the jar's grammar, not ours: drop it, or
   keep it as an error pair only if a stock-error ratchet already covers that shape.
4. Seed its `diff-baseline.json` row with the T1 seed tool, and add its routing and refusal twins the way #109 added
   theirs (`git show fe7a1c13f -- oracle/goldens/svg-conformance/routing-baseline.json` shows the shape).
5. Pin it once it reaches zero (step 7).

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
