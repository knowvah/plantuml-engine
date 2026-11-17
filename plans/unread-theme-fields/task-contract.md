# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Quote `file:line` before you change anything. The spine:
   - upstream: `svek/image/EntityImageDescription.java:150-166` (grep `~/git/plantuml/src/main/java/net/`, never just
     `net/sourceforge/plantuml/`);
   - ours: `src/core/theme-graph-colors-b.ts:376-392`, `src/core/theme.ts:295-310,345-360`,
     `src/core/style-map-simple-fields.ts:1-60,125-140`, `src/diagrams/description/renderer-entity.ts:195-210`,
     `src/core/style-element-scope.ts` (the `actor-business`/`usecase-business` buckets).
2. **Check before you build.** Run `git grep -nE "businessActorFill|businessUsecaseFill" -- src tests scripts docs-site`
   and compare with the README's file table. Run `ls .agent-notes | grep -iE "scr|dss-T3a"` and read the hits.
3. **Red.** Add the absence tests (D2) and watch them fail on the base.
4. **Green.** Make the D1 deletions. Preserve upstream names; keep every `@see`.
5. **Measure, alone.** Run the description pins (README) and read the count; then `npm run typecheck`.
6. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #156`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
7. **Notes.** Write `.agent-notes/utf-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator. The mission is small enough that a subagent adds handoff cost without parallelism.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. At the exit close only: `npm run svg:survey`, then
   `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It must show 0 movers in every
   engine.
3. At the exit close only: `npm run parity:dashboard`. Revert a `parity-*.json` whose only change is `generatedAt`;
   commit the rest with `docs/parity-report.md` and `docs-site/parity.md`.
4. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
