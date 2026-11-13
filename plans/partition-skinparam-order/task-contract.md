# Task contract

Every task in this brief follows these steps, in order. A task file adds only what is specific to that task.

1. **Read the Java first.** Open the method, and the constructor that built its inputs. Quote `file:line` before you
   state why a row differs. The Java is under `~/git/plantuml/src/main/java/net/sourceforge/plantuml/`:
   - `activitydiagram3/command/CommandPartition3.java:140-170`, and `activitydiagram3/ftile/vcompact/FtileGroup.java:85-110`
     and its `drawU`;
   - `style/FromSkinparamToStyle.java:127-133,212-266` (the converts), `style/ValueImpl.java`, `style/DarkString.java`,
     `style/StyleBuilder.java`, `style/StyleStorage.java` (the priority merge);
   - `decoration/symbol/USymbols.java:69-91`, `USymbolCard.java` (each keyword's `getSNames()`);
   - `svek/ClusterHeader.java:150-166` (the guard rows' cuca titles);
   - `src/main/resources/skin/plantuml.skin:364-368` (`activityDiagram { composite { } }`).

   Grep `src/main/java/net/`, never just `net/sourceforge/plantuml/`.
2. **Check `docs/catalog.md` before you build anything.** These already exist:
   - **The frame's style:** `withActivityCompositeStyle` and `activityCompositeStyleOf` (`src/core/activity-box-style.ts`),
     `builderAtPosition` and `lastDeclarationPosition` (`activity-box-builder-at.ts`).
   - **Readers:** `compositeStyleOf` and `withCompositeStyle` (`src/diagrams/activity/activity-composite-theme.ts`),
     `GtileGroup.compositeStyle` (`tiles/gtile-group.ts`).
   - **Paint:** `paintOf` (`src/core/activity-circle-style.ts`), `resolveColorToSvgHex`, `resolveSolidBucketColor`.
   - **Precedent:** `graph.activity.boxStyleOf` and `circleStyle` (`theme-graph-colors-b.ts`, set in `build-theme.ts`).
3. **Red.** Add a failing test that asserts jar values. Take the values from a row oracle
   (`tests/fixtures/diagram-style-scope/<row>.svg` once T1 lands, or `/tmp/pso-plan/fx/<row>.svg` before then).
4. **Green.** Port the read, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and keep dead-looking branches where the Java has them.
   - Do not refactor beyond what the mirror needs. The flat tiers stay (D2).
   - Give every ported symbol a JSDoc `@see` to its Java origin.
5. **Measure, alone:**
   `npx jiti plans/style-mode-cascades/measurements/rows.mts tests/fixtures/diagram-style-scope --diffs 3 activity__frameorder- component__frameorder- class__frameorder-`.
6. **Re-read the task's rows** after each fix. `compareSvg` short-circuits, so a fix can reveal a diff nobody has seen
   yet (`.claude/memory/comparesvg-count-not-monotonic.md`).
7. **Commit** with Conventional Commits. Lines are ≤80, the footer is `Refs: #138`, and the trailer is the harness's
   `Co-Authored-By`. Prettier runs on commit.
8. **Notes.** Write `.agent-notes/pso-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Restoring the planning oracles

If `/tmp/pso-plan/fx` is gone, run
`scripts/oracle-render.sh /tmp/pso-plan/r1 <abs>/plans/partition-skinparam-order/probes/*.puml`. Then copy every
probe `.puml` and its `/tmp/pso-plan/r1/<row>.svg` into `/tmp/pso-plan/fx/`. All 43 probes draw a diagram, and none is
an error page.

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
