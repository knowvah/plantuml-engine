# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line`
   before you say why a row differs. The spine:
   - `svek/SvekResult.java:70-101` (`drawU`: clusters, nodes under `UHidden`, edges under `UHidden`);
   - `klimt/drawing/AbstractUGraphic.java:120-146`, `klimt/drawing/svg/UGraphicSvg.java:95-175`,
     `klimt/drawing/svg/SvgGraphics.java:1120-1130,1190-1195,1263-1290`;
   - `svek/SvekEdge.java:830-846`, `abel/Link.java:105-121,177-186,458-459`, `decoration/WithLinkType.java:95-160`;
   - `svek/Cluster.java:298-311`, `svek/image/EntityImageClass.java:141-156`, `svek/image/EntityImageDescription.java:290-300`;
   - `svek/GeneralImageBuilder.java:100-245` (the image dispatch), `abel/Entity.java:686-688`, `plasma/Quark.java`,
     `plasma/Plasma.java`, `net/atmp/CucaDiagram.java:244-283`;
   - ours: `src/diagrams/class/renderer.ts:170-270`, `renderer-leaf.ts:60-150`, `renderer-group.ts:60-170`,
     `renderer-usymbol-entity.ts:311+`, `src/core/svek/DecorateEntityImage.ts:275-330`,
     `class-relationship-ast.ts:185-205`, and the description precedent `description/layout-helpers-types.ts:275-284`.

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are starting
   points, not conclusions.
2. **Check before you build.**
   - Grep `docs/catalog.md` for the module you touch, and for `quark`/`separator` before writing a name helper.
   - Run `ls .agent-notes | grep -iE "c4dd|cdd-T7|cdd-T31|hidden|namespace|separator"`, and read the hits.
3. **Red.** Before a code change, add a failing unit test that asserts a comment from a row's oracle, for example the
   exact `<!--class Foo1-->` sequence of `lafama-65-zoci799`, or a probe's.
4. **Green.** Port the mechanism (D1, D2, D3), and never fit a value. Preserve upstream names, and give every ported
   symbol a JSDoc `@see` to its origin. Every comment goes through `escapeComment` (lint-enforced).
5. **Measure, alone:** `npx tsx plans/class-comment-bytes/measurements/measure-ccb.mts /tmp/ccb-<task>.json`. No row
   that was equal may differ, and no row's difference may grow.
   - After any `src/` change, run both ratchets (README) and read the counts.
   - Then run the `class` and `object` surveys with `--out` (README). Every row must keep its verdict.
6. **Pin.** Remove every row the task fixed from `comment-open.json` (class and object), and move fixed gate rows from
   `OPEN` to `ZERO` with a dated comment line in that test's pattern. A row still open names its mechanism.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #151`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/ccb-<task>.md` for anything unexpected, using the template in
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
