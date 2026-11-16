# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line`
   before you say why a probe differs. The spine:
   - `klimt/drawing/svg/SvgGraphics.java:467-474` (`format`: every number times the scale, formatted once);
   - `core/TextBlockExporter.java:165-177,198-209` (the scaled `UGraphic`, `computeScaleFactor`);
   - `svek/Cluster.java:290-374` (`drawU`, the `ClusterDecoration` it builds, the stroke at `:402-442`);
   - `svek/ClusterDecoration.java:66-92`, and each `decoration/symbol/USymbol*.java#asBig` a probe draws;
   - `svek/ClusterHeader.java:73-96,152-220` (title and stereo blocks, the title signature);
   - ours: `class-scale-geo.ts:84-101`, `class-namespace-usymbol-shape.ts:239-257,382-423`, `renderer.ts:44-78`,
     `class-cluster-header.ts:268-322`, `class-namespace-shape.ts#placeHeaderStereo`, the leaf precedent
     `renderer-usymbol-entity.ts:311-357`, and `svg-format.ts:135-155`.

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are starting
   points, not conclusions.
2. **Check before you build.**
   - Grep `docs/catalog.md` for the module you touch.
   - Run `ls .agent-notes | grep -iE "scale|usymbol|cluster|cdd-B8|gogr|T4c"`, and read the hits.
3. **Red.** Before a code change, add a failing unit test that asserts a value from a probe's oracle, such as a
   scaled literal (`scale-node`'s polygon corner `32`), the title `y`, or the header stereo's `font-size` and
   `textLength`.
4. **Green.** Port the mechanism (D1, D2), and never fit a value: every constant carries its upstream `file:line`.
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
5. **Measure, alone:** `npx tsx plans/usymbol-group-scale/measurements/measure-ugs.mts /tmp/ugs-<task>.json`. No row's
   diff count may rise.
   - After any `src/` change, run the class ratchets (README) and read the counts.
   - Then run the `class`, `object` and `unknown` surveys with `--out` (README). Every row must keep its verdict.
6. **Pin.** In `usymbol-group-scale.authored.test.ts`, move every probe the task fixed from `OPEN` to `ZERO`, with a
   dated comment line in that test's pattern.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #149`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/ugs-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It
   must show 0 lost in every engine.
3. List every census attribute that moved away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
4. Run `npm run parity:dashboard`, and commit `docs/parity-report.md` with the `parity-*.json` files.
5. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
