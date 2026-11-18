# Task contract

Every task does these steps, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method, and quote `file:line` before you state why something differs.
   - The Java is in `~/git/plantuml/src/main/java/net/sourceforge/plantuml/`: `theme/ThemeUtils.java` (all of it,
     `:76-217`), `tim/EaterTheme.java:55-95`, `tim/TContext.java:726-755`, `help/CommandHelpTheme.java:59-93`,
     `preproc/Stdlib.java:98-114`. The data is `~/git/plantuml/src/main/resources/themes/`.
   - Read it with Read. Never edit it.
   - Check `docs/catalog.md` before you build anything. These already exist: `withStdlib`, `stdlibStore`
     (`src/core/tim/StdlibStore.ts`), `combineAssetStores` (`src/core/asset-store.ts`), `MapIncludeStore`,
     `EMPTY_INCLUDE_STORE` (`src/core/tim/IncludeStore.ts`), `parseOptionsOf` (`src/core/render-options.ts`),
     `fixtureIncludeStore` (`tests/helpers/fixture-include-store.ts`).
2. **Red.** Write a failing test first. Prefer existing jar fixtures to synthesized sources.
3. **Green.** Make the change.
   - Generated files (`src/core/themes-source.ts`, `src/core/themes-builtin*.ts`, `packages/themes-*/generated/*`) are
     changed only by rerunning their generator, never by hand.
   - Every ported symbol carries a JSDoc `@see` to its Java origin. Preserve upstream names.
   - Do not refactor beyond what the task needs.
4. **Measure.** Run the task's focused tests with `npx vitest run <paths> --coverage.enabled=false`. A subset run under
   `npm test -- <path>` fails the global coverage threshold even when every test passes.
5. **Commit.** Use Conventional Commits, lines ≤80, footer `Refs: #180`, ending with the session's attribution trailer.
   Prettier runs on commit.
6. **Notes.** Write `.agent-notes/top-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task:
- **Observability:** N/A, no new observable operations. The only new signal is the existing `Cannot load theme` error
  page.
- **Rollback:** Reversible (revert the commit).
- **Agent:** the orchestrator, or a `typescript-pro` subagent given this file, `decisions.md` and the task file as its
  prompt.
- **Write-sets** are plans, not limits (CLAUDE.md, "Writing and write-sets"). Journal every file you add.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Work in the main checkout, serially, with no worktrees and no two writers at once.

## File-size hazards (the hook blocks at 500 lines)

Line counts at planning:

| File | Lines |
|---|---|
| `src/core/theme.ts` | 501, so do not edit it (D4) |
| `src/core/include-resolver.ts` | 495 |
| `src/index.ts` | 490 |
| `src/core/build-theme.ts` | 434 |
| `src/core/dispatcher-types.ts` | 412 |

Extract a helper module rather than grow any of these past 500.

## Batch close

1. At `uptime` below about 10, run the README gates.
2. Tick the overview and README, append the gate results and the close sha to the journal, and commit
   `chore(top): close batch <n>`.
