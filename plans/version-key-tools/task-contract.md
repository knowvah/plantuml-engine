# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and quote `file:line` before you change anything. The spine:
   - `version/PSystemVersionFactory.java:47-95`, `version/PSystemVersion.java:67-89`, `:234-258`,
     `version/PSystemKeygen.java`, `version/PSystemKeycheck.java`, `dot/GraphvizUtils.java:83-158`,
     `version/LicenseInfo.java:138-166`, `version/License.java:374-395`, `flashcode/FlashCodeFactory.java:42-58`;
   - ours: `src/diagrams/version/{PSystemVersionFactory,PSystemVersion,PSystemLicense,LicenseInfo,License}.ts`,
     `src/core/version.ts`, `src/core/flashcode/`, `src/core/UgSimpleDiagram.ts`,
     `src/core/klimt/shape/GraphicStrings.ts`.

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`.
2. **Check before you build.** Grep `docs/catalog.md` for the symbol. Read `.agent-notes/ufp-T1f.md`,
   `ufp-T3d.md`, `ufp-T3-cov.md` and `vkt-plan.md`.
3. **Red.** Add a failing test that asserts the page's lines in order, importing `versionString`,
   `fullDescription`, `COMPILE_TIME_STRING` and `DOT_ENGINE_VERSION` from `src/core/version.ts` rather than typing
   their values. `tests/unit/version/PSystemVersion.test.ts` is the form.
4. **Green.** Implement per D1-D5. Preserve upstream names; every ported symbol carries an `@see` to its Java origin,
   and every constant its `file:line`. Every branch D3 leaves out is cited in JSDoc with its Java lines.
5. **Measure, alone.** After any `src/` change run the version unit tests and the authored utility ratchet (README),
   and read the counts. No existing authored row may change its score.
6. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #182`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
7. **Notes.** Write `.agent-notes/vkt-<task>.md` for anything unexpected, using the template in
   `~/.claude/rules/memory.md`.

**Every task:**
- Observability is N/A: there are no new observable operations.
- Rollback is Reversible: revert the commit.
- Agent: the orchestrator. Every batch-1 task writes `PSystemVersionFactory.ts`, so the tasks are serial and a
  subagent adds handoff cost without parallelism.
- Write-sets are plans. Change another file in this repository when the work needs it, and journal why.
- Complexity limits are hook-enforced (30 NLOC, CCN 10, 5 params). Line tables go in module-level constants, as
  `PSystemVersion.ts` does for `AUTHORS`.

## Batch close

1. Run the README gates, with `uptime` below ~10.
2. Run `npm run svg:survey`, then `node plans/description-divergence-drive/measurements/verdict-diff.mjs <base>`. It
   must show 0 lost in every engine. Revert every `parity-*.json` whose only change is `generatedAt`.
3. Run `npm run parity:dashboard`; commit `docs/parity-report.md` only if it changed.
4. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
