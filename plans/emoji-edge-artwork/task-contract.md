# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line`
   before you say why a probe differs. The spine:
   - `svek/SvekEdge.java:286-299` (the label's `create0`) and `:328-340` (the quantifiers, same `skinParam`);
   - `klimt/creole/legacy/StripeSimple.java:245-270` (`addEmoji`), `klimt/creole/atom/AtomEmoji.java:50-69`,
     `emoji/Emoji.java:111-118,175-182`;
   - ours: `EntityImageDescriptionTextBlock.ts:144-226,268-316` (`drawAtoms`, `buildTextBlock`),
     `EntityImageDescriptionEmoji.ts:46-60` (`drawEmojiAtom`), `EntityImageDescriptionDelegates.ts:200-300`
     (`descAtomOps`, the precedent), `creole-atoms.ts:205-230`, `creole-atoms-image-resolver.ts:472-495`,
     `internal-emoji-store.ts:52-75`, `SvekEdge.ts:433-443,490-515`, `quantifier-block.ts`.

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are starting
   points, not conclusions.
2. **Check before you build.**
   - Grep `docs/catalog.md` for the module you touch.
   - Run `ls .agent-notes | grep -iE "emoji|c4dd|creole|r2a|s1l-wave3"`, and read the hits. The s1l-wave3 note matters
     most here: wire the sizer and the renderer, never only one.
3. **Red.** Before a code change, add a failing unit test that asserts a value from a probe's oracle, for example the
   label group's child count, or the first artwork `<path>`'s `d` or `fill`.
4. **Green.** Port the mechanism (D1, D2), and never fit a value: every constant carries its upstream `file:line`.
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
5. **Measure, alone:** `npx tsx plans/emoji-edge-artwork/measurements/measure-eea.mts /tmp/eea-<task>.json`. No row's
   diff count may rise.
   - After any `src/` change, run the description ratchet (README) and read the count.
   - Then run the `component`, `usecase`, `c4` and `activity` surveys with `--out` (README), and `class` after T1b.
     Every row must keep its verdict.
6. **Pin.** In `emoji-edge-artwork.authored.test.ts`, move every probe the task fixed from `OPEN` to `ZERO`, with a
   dated comment line in that test's pattern.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #150`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/eea-<task>.md` for anything unexpected, using the template in
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
