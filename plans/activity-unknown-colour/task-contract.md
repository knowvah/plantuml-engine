# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and the constructor that built its inputs. Quote `file:line` before
   you say why a probe differs. The spine:
   - `klimt/color/HColorSet.java:58-76` (`getColorOrWhite`, `getColorOrNull`, `getColor`), `:78-120` (`parseColor`);
   - `decoration/Rainbow.java:109-118` (`build`), `decoration/HtmlColorAndStyle.java:86-106` (`build`, `getColor` at
     `:100`);
   - `command/SingleLineCommand2.java:166-182` (`NoSuchColorException` → `badColor()`);
   - `klimt/color/Colors.java:95-115` (bare part → `getColor` at `:103`; `name:value` → `getColorOrNull` at `:112`).

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`. The README's leads are starting
   points, not conclusions.
2. **Check before you build.**
   - Read `colorOrNeutral`'s doc (`src/core/klimt/color/HColorSet.ts:360-377`) and its three activity callers
     (`activity-scoped-colors.ts:26-27`, `dispatch-stereogroup.ts:84-85,102`).
   - Run `ls .agent-notes | grep -iE "colou?r|ucol-|neutral"` and read what matches.
3. **Red.** Before a code change, add a failing unit test that asserts the exact value: `#D3D3D3` for the unresolved
   token at the site, and today's value for a resolvable token beside it. Never assert only "is valid".
4. **Green.** Apply D2 at the task's site, and never fit a value: every constant carries its upstream `file:line`.
   - Preserve upstream names; give every touched symbol a JSDoc `@see` to its origin.
   - Resolvable tokens must not change: no activity pin may move.
5. **Measure, alone:** `npx tsx plans/activity-unknown-colour/measurements/measure.mts tests/fixtures/unresolved-colour
   /tmp/auc-<task>.json`. No `ZERO` row may rise above 0. Then run the activity ratchets
   (`npx vitest run tests/oracle/svg-conformance/activity`) and read the count, then the activity survey with `--out`.
6. **Pin.** In `unresolved-colour.authored.test.ts`, drop `pending` from every `NEUTRAL` row the task landed (D3).
7. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #189`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
8. **Notes.** Write `.agent-notes/auc-<task>.md` for anything unexpected, using the template in
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
