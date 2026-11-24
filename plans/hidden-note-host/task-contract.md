# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line` before
   you say why a row differs. The spine:
   - `net/atmp/CucaDiagram.java:778-853`: `isHidden`, `isRemoved`, `isOrphanedTransitionLabel`,
     `isNoteWithSingleLinkAttachedTo`;
   - `abel/Entity.java:434-460` (`isHidden`, `isRemoved`: parents first) and `abel/Link.java:458-459`;
   - `svek/SvekResult.java:70-101` (`UHidden` on nodes and edges), `svek/SvekNode.java:408-410`,
     `svek/AbstractEntityImage.java:64-66`;
   - `svek/GraphvizImageBuilder.java:132-147`, `:238-270`, `:324-337` (which note is opale, and why it matters for
     the connector);
   - `svek/image/EntityImageNote.java:225-260` (the opale outline is part of the note's image);
   - `decoration/WithLinkType.java:100-101`, `:149-150` (`-[hidden]-` is `Link.hidden`, not `isInvisible()`).

   Grep `~/git/knowvah/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are
   starting points, not conclusions.
2. **Check before you build.**
   - Class: `computeHiddenIds` and `foldNotesInto` (`src/diagrams/class/class-directives-removal.ts:336-430`) already
     delegate. Find where `ClassifierGeo.hidden` is set (`class-geo-builders.ts:141`) and do the same for a note geo.
   - Description: `effectiveRemovedIds` (`element-grammar.ts:238-272`) is the template for the delegation loop. The
     invisible-link test the ELK adapter uses is `getType(linkId).isInvisible()` (`description-elk-adapter.ts:477-479`).
   - State: `state-hidden.ts#markHidden` and `state-directives.ts#applyingIds`.
   - Run `ls .agent-notes | grep -iE "ccb|hidden|note"` and read what matches.
   - `docs/catalog.md` before writing a helper: it may exist.
3. **Red.** Before a code change, add a failing test that asserts exact values: the hidden-id set for a parsed
   diagram, the drawn note count, or a gate row's diff count. Never assert only "is defined".
4. **Green.** Port the Java; never fit a value. Every constant carries its upstream `file:line`.
   - Preserve upstream names (`isNoteWithSingleLinkAttachedTo`); give every new symbol a JSDoc `@see` to its origin.
   - No row outside the gate may move except toward the jar.
5. **Measure, alone:** `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/hidden-note-host
   /tmp/hnh-<task>.json`, then the authored gate and `class-comment-bytes` (read the counts), then the engine's
   survey (README "Measurement commands").
6. **Pin.** Move every row the task took to 0 into `ZERO` in `hidden-note-host.authored.test.ts`, lower each OPEN
   row's `maxDiffs` and `maxComments` to today's numbers, and give every row still open a reason that is true today.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #204`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/hnh-<task>.md` for anything unexpected, using the template in
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
