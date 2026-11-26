# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and quote `file:line` before you say why a row differs. The spine:
   - `statediagram/command/CommandLinkStateCommon.java:157-395` (`executeArg`, `shouldUseNodeStyle`,
     `containsStyleKeyword`, `createTransitionWithIntermediateNode`, `generateTransitionNodeId`);
   - `statediagram/command/CommandLinkState.java:55-80`, `CommandLinkStateReverse.java:55-85` (the regexes);
   - `descdiagram/command/CommandLinkElement.java:77-93` (`KEY1`, `KEY2`, `LINE_STYLE`);
   - `decoration/WithLinkType.java:110-170` (`applyStyle`, `goNodeStyle`, `nonode`);
   - `svek/GeneralImageBuilder.java:210-225`, `svek/image/EntityImageTransitionLabel.java:55-139`;
   - `net/atmp/CucaDiagram.java:196-235` (`cleanId`, `reallyCreateLeaf`), `:778-831` (hide/remove/orphan);
   - `abel/Link.java:100-150,320-326,450-465` (`idCommentForSvg`, `getInv`, weight, hidden ends);
   - `svek/SvekResult.java:75-100` (hidden nodes and edges drawn under `UHidden`).

   Grep `~/git/knowvah/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's tables are
   leads, not conclusions.
2. **Check before you build.**
   - `src/core/abel/LeafType.ts` has `STATE_TRANSITION_LABEL`. `src/core/decoration/WithLinkType.ts` has
     `goNodeStyle`/`useNodeStyle`. `src/core/clock.ts` has `Clock`, `DEFAULT_CLOCK`, `renderClock`.
   - `src/diagrams/state/state-link-add.ts#emitTransition` is the one place a transition is added (ticks, dedup).
   - `src/diagrams/state/state-link-style.ts#TransitionLink` builds the decors and `idCommentForSvg`.
   - `src/core/svek/image/` holds the shared images; read one small one (`EntityImageNote.ts` or `CircleStart.ts`)
     for the house shape.
   - `class-oneline-body.authored.test.ts` and `object-colour-refusal.authored.test.ts` are templates for the gate.
   - Run `ls .agent-notes | grep -iE "snl|state|hide|clock|stdd|link-style"` and read what matches.
   - Check `docs/catalog.md` before writing a helper: it may exist.
3. **Red.** Before a code change, add a failing test that asserts exact values: an AST shape (kinds, ids, decors,
   lengths, creation indexes), a DOT attribute, an SVG element, or a gate row's diff count. Never assert only "is
   defined".
4. **Green.** Port the Java; never fit a value. Every pattern and constant carries its upstream `file:line`.
   - Preserve upstream names. Give every new symbol a JSDoc `@see` to its origin.
   - No row outside the gate may move except toward the jar.
5. **Measure, alone.** Run `npx tsx plans/hidden-note-host/measurements/measure.mts tests/fixtures/state-node-label
   /tmp/snl-<task>.json`. Then run the authored gate and read the count. Then run the state and component surveys
   (README "Measurement commands"), plus every other engine whose grammar the task touched.
6. **Pin.** Move every row the task finished into the gate's `ZERO` list. Lower each OPEN row's `maxDiffs` to today's
   number, and give every row still open a reason that is true today (owner task, or filed issue).
7. **Commit** in Conventional Commits: lines ≤80, footer `Refs: #235`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/snl-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability: N/A. There are no new observable operations.
- Rollback: Reversible. Revert the commit.
- Agent: the orchestrator, or a `typescript-pro` subagent whose prompt is this file, `decisions.md` and the task file.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

A subagent's mechanism is a claim until you have read the source yourself (`.claude/memory/verify-agent-claims-si31.md`).
Never run two writers at once.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run `npm run svg:survey` in the background, then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It must show 0 lost in every engine.
3. List every census attribute that moved away from the jar
   (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
4. Run `npm run parity:dashboard`. Commit `docs/parity-report.md` with the `parity-*.json` files. If only
   `generatedAt` changed, leave them at HEAD and journal that.
5. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
