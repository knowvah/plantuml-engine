# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line`
   before you say why a probe differs. The spine:
   - `klimt/color/HColorSet.java:58-76` (`getColorOrWhite`, `getColorOrNull`, `getColor`), `:78-120` (`parseColor`:
     transparent, automatic, `?a:b` scheme, gradient separators);
   - `decoration/WithLinkType.java:126-165` (`applyStyle`, `applyOneStyle`, the colour branch at `:161-163`);
   - `klimt/color/Colors.java:95-124` (the `name:value` branch at `:105-115`);
   - `klimt/color/ColorParser.java` (`simpleColor(mainType)`, which builds `Colors` from a command capture);
   - `style/ValueImpl.java:92-108` (`asColor`).

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are starting
   points, not conclusions.
2. **Check before you build.**
   - Grep `docs/catalog.md`, `src/core/klimt/color/HColorSet.ts`, `src/core/abel/Colors.ts`,
     `src/core/decoration/WithLinkType.ts` and `src/core/style/ValueImpl.ts`.
   - Read `.agent-notes/si26-jar-unresolvable-colour-token-is-white.md`.
   - Run `ls .agent-notes | grep -iE "colou?r|g1c|ucol-"`.
3. **Red.** Before a code change, add a failing unit test that asserts the jar's value from the probe's oracle: the
   exact `fill`/`stroke` the jar drew, or that the field is unset where the jar used the default. Never assert only
   "is valid".
4. **Green.** Port the mechanism (D2), and never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug (`Colors.java:113` clearing an earlier value).
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
   - Resolvable tokens must not change: no class or description pin may move.
5. **Measure, alone:** `npx tsx plans/unresolved-colour/measurements/measure-colours.mts probes /tmp/ucol-<task>.json`.
   No row's diff count may rise.
   - After any `src/` change, also run the touched engine's ratchet and read the count, e.g.
     `npx vitest run tests/oracle/svg-conformance/class.golden.ratchet.test.ts`.
   - Then run that engine's survey with `--out`.
6. **Pin.**
   - In `unresolved-colour.authored.test.ts`, move every probe the task fixed from `OPEN` to `ZERO`, and drop its
     `invalid: true` (D5).
   - Update any running counts a gate asserts, with a dated comment line in that test's existing pattern.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #145`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/ucol-<task>.md` for anything unexpected, using the template in
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
