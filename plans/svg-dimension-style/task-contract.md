# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java and quote `file:line` before you say why a probe differs. The spine:
   - `core/TextBlockExporter.java:393-425` (`createUGraphicSVG`; the flag at `:418-421`) and `:633-634` (`styled`);
   - `UgDiagram.java:170-195` and `NewpagedDiagram.java:130-150` (who calls `styled`);
   - `skin/SkinParam.java:1216-1218` (`svgDimensionStyle`) and `:367-369` (`valueIs`);
   - `klimt/drawing/svg/SvgGraphics.java:786-806` (`finalizeRootAttributes`).

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`.
2. **Check before you build.**
   - Grep `docs/catalog.md` for the module you touch.
   - Run `ls .agent-notes | grep -iE "lengthadjust|lad-|cogr|shell|skin-param"`, and read the hits.
   - Read the `lengthAdjust` precedent in the file you touch: the flag goes beside it.
3. **Red.** For a `SkinParam` port, add a unit test first: unset → `true`, `false` and `FALSE` → `false`, `true` →
   `true`. For an engine, the gate's `OPEN` row is the red test.
4. **Green.** D1 and D2. Every new line cites its upstream `file:line`; ported methods carry a JSDoc `@see`.
5. **Measure, alone:** `npx tsx plans/svg-dimension-style/measurements/measure-sds.mts /tmp/sds-<task>.json`. No row
   may go from `EXACT` to anything else, and none may reach `OTHER`.
   - After any `src/` change, run the engine's golden and diff-baseline ratchets
     (`tests/oracle/svg-conformance/<engine>*.ratchet.test.ts`) and read the counts.
6. **Pin.** In `svg-dimension-style.authored.test.ts`, move every probe the task fixed from `OPEN` to `EXACT`, with a
   dated comment line in that test's pattern.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #193`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/sds-<task>.md` for anything unexpected, using the template in
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
