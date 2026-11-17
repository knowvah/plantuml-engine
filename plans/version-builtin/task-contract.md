# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and quote `file:line` before you change anything. The spine:
   - `tim/builtin/GetVersion.java:63-66`, `version/Version.java:47-62`, `preproc/Defines.java:66-69`;
   - ours: `src/core/tim/builtin/GetVersion.ts`, `TimEnvironment.ts:110-142`, `src/core/version.ts`,
     `src/core/preprocessor.ts:332-348`, `src/core/tim/TContext.ts:98`;
   - accounting: `docs/svg-conformance.md` ("The divergence accounting model"), `oracle/accepted-divergences.json`
     (the #143 entries as the form), `DIVERGENCES.md:2049-2061` ("Error pages print this port's version").

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`.
2. **Check before you build.** Grep `docs/catalog.md` for `version` and `TimEnvironment`. Run
   `ls .agent-notes | grep -iE "version|tim|aar|T5c"`, and read the hits.
3. **Red.** Before a code change, add or change a failing test that asserts the new value, importing `VERSION` or
   `versionString` from `src/core/version.ts` rather than typing `'0.2.0'`.
4. **Green.** Make the change in D1. Preserve upstream names; keep every `@see`.
5. **Measure, alone.** After any `src/` change, run the activity pins (README) and read the counts, then the activity
   survey with `--out`. Every row except `rekefe-90-baju604` keeps its verdict and diff count.
6. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #155`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
7. **Notes.** Write `.agent-notes/vb-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator. The mission is small enough that a subagent adds handoff cost without parallelism.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It
   must show 0 lost in every engine.
3. Run `npm run parity:dashboard`, and commit `docs/parity-report.md`, `docs-site/parity.md` and the `parity-*.json`
   files. Revert a `parity-*.json` whose only change is `generatedAt`.
4. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
