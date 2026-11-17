# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line`
   before you say why a probe differs. The spine:
   - `svek/GeneralImageBuilder.java:140-210` (`createEntityImageBlock`, the `USECASE` branches at `:169-175`);
   - `svek/image/EntityImageDescription.java:111-215` (constructor; `styleTitle` at `:142-153`, its reads at
     `:160-175`);
   - `abel/Entity.java:755-767` (`getCurrentStyleBuilder`, the `isSkinParamUsed` gate);
   - `style/FromSkinparamToStyle.java:166-170` (`title*` skinparams → bare `title`);
   - `style/StyleSignatureBasic.java:188` (`matchAll`) and the method ending at `:220` (`snames.containsAll`): how a
     bare `title` declaration matches a longer element signature.

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are starting
   points, not conclusions.
2. **Check before you build.**
   - Grep `docs/catalog.md` for the module you touch.
   - Run `ls .agent-notes | grep -iE "usecase|c4dd|title|entity-style"`, and read the hits.
3. **Red.** Before a code change, add a failing unit test that asserts the jar's value from a probe's oracle: the
   exact stroke colour and width, or the default where the jar keeps it.
4. **Green.** Port the mechanism (D1), and never fit a value: every constant carries its upstream `file:line`.
   - Preserve upstream names, and give every ported symbol a JSDoc `@see` to its origin.
5. **Measure, alone:** `npx tsx plans/usecase-title-style/measurements/measure-uts.mts /tmp/uts-<task>.json`. No row's
   diff count may rise.
   - After any `src/` change, run both description ratchets and read the counts.
   - Then run the `usecase`, `component`, `c4` and `unknown` surveys with `--out` (README).
6. **Pin.** In `usecase-title-style.authored.test.ts`, move every probe the task fixed from `OPEN` to `ZERO`, with a
   dated comment line in that test's pattern.
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #148`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/uts-<task>.md` for anything unexpected, using the template in
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
