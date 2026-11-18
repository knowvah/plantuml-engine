# Task contract

Every task follows these steps, in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line`
   before you state why a row differs. The spine is:
   - `svek/image/EntityImageNote.java:110-118` (body build), `:166-181` (size), `:193-288` (draw);
   - `svek/image/Opale.java:105-127` (the Opale note draws the body at `marginX1, marginY`);
   - `cucadiagram/BodyEnhanced2.java:84-134` (blocks, `addOneSingleLineManageEmbedded2`);
   - `klimt/creole/legacy/CreoleParser.java:142-175` (`createSheetSlow`, the embed branch);
   - `EmbeddedDiagram.java:77-152` (`createAndSkip`, `calculateDimensionSlow`), `:165-213` (`drawU`, `getImageSvg`);
   - `klimt/creole/SheetBlock1.java:115-232` (stripe stacking and draw);
   - T2a: `svek/image/EntityImageNoteLink.java:61-77` and the Rose note component it builds;
   - T2b: `command/PSystemCommandFactory.java:230-290` (`isMultilineCommandOk`) and the state note command factory.

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are where to
   start, not conclusions.
2. **Check before you build.**
   - Grep `docs/catalog.md`, `src/core/svek/edge-label-embed.ts`, `src/core/EmbeddedDiagram.ts`,
     `src/core/nested-diagram-registry.ts`, `src/diagrams/state/state-label-style.ts` (`labelStripes`) and
     `state-renderer-transitions.ts` (`buildLabelStripesMarkup`).
   - `ls .agent-notes | grep -iE "embed|xetase|ele-|sne-"`, and read `.agent-notes/xetase-embedded-diagram-label.md`.
3. **Red.** Before a code change, add a failing test that asserts jar values from the row's or probe's oracle: the
   `<image>` width, height, x and y, and the canvas. Assert specific attributes, never just "an image exists".
4. **Green.** Port the mechanism, and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug.
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
   - Embed-free notes must not change (D2).
5. **Measure, alone:** `npx tsx plans/state-note-embed/measurements/measure-rows.mts /tmp/sne-<task>.json`. No row's
   diff count may rise.
   - After any `src/` change, also run
     `npx vitest run tests/oracle/svg-conformance/state.golden.ratchet.test.ts tests/oracle/state-dot-parity.test.ts`
     and read the count.
   - Then run `npm run svg:survey -- state --out tests/oracle/svg-conformance/parity-state.json`.
6. **Pin.**
   - Add every probe the task covers to `tests/fixtures/state-note-embed/` with its jar `.svg`, and to the authored
     gate (D5).
   - Update any running counts a gate asserts, with a dated comment line in that test's existing pattern.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #168`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/sne-<task>.md` for anything unexpected, using the template in
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
