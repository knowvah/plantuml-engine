# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read first.** The spine:
   - the seam: `src/core/tim/StdlibRegistry.ts`, `src/core/tim/StdlibRemote.ts` (`remoteStdlib`, `joinUrl`),
     `src/core/include-resolver.ts:420-470` (`IncludeWarmupOptions`, `prepareIncludeStore`), `src/index.ts:340-400`
     (`renderSync`'s include guard, `render`);
   - the playground: `docs-site/.vitepress/theme/Playground.vue`, `docs-site/.vitepress/config.ts` (alias, data-file
     shim), `tests/e2e/playground-export.spec.ts` (the `openWith` pattern);
   - the packages: `docs/stdlib-remote.md`, `packages/stdlib-aws/README.md` ("Usage"),
     `packages/*/generated/*.d.ts`.
2. **Check before you build.** Grep `docs/catalog.md` for `stdlib` and `AssetStore`. Run
   `ls .agent-notes | grep -iE "stdlib|playground|si8|si11|si12|docs"` and read the hits.
3. **Red.** Before a behaviour change, add or change a failing test: e2e for playground behaviour, vitest for
   `playground-render.ts`. Assert on specific text or values, never on "an svg exists".
4. **Green.** Make the change. Keep every specifier static (D3).
5. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #172`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
6. **Notes.** Write `.agent-notes/ps-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new server-side operations (decisions.md, "Operational readiness").
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator. The tasks are serial and share the playground, so a subagent adds handoff cost without
  parallelism.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. If `src/` changed, run the survey and `verdict-diff.mjs <base>` (README); it must show 0 lost.
3. Tick the overview and the README, append the gate counts and the close sha to the journal, and commit.
