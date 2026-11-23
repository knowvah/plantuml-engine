# Task contract

Every task follows these steps in order. A task file adds only what is specific to it.

1. **Read the source first.** Open the Java method and quote `file:line` before you change anything. The spine, at
   the pin `a720bdd` (`git -C ~/git/plantuml show a720bdd:<path>`; the checkout is on `dot-output`, whose
   `EmbeddedDiagram.java` equals the pin's):
   - `EmbeddedDiagram.java:89-127` (constructor, `noDefinitions`), `:146-147` (`from`);
   - `BlockUml.java:119-127` (`convert`, `"block"`), `:149-160` (TimLoader gate);
   - upstream's fix and its fixtures: `git -C ~/git/plantuml show 58b9b3d53ee`
     (`src/test/resources/vega/nonreg/group3015/`);
   - ours: `src/index.ts:300-325`, `src/diagrams/class/class-nested-diagram-renderer.ts`,
     `src/core/nested-previous.ts`, `src/core/EmbeddedDiagram.ts`, `src/core/tim/ReadLineReader.ts:30-60`,
     `src/core/BlockUmlBuilder.ts:137-147`, `src/core/error/error-diagrams.ts:115-130`,
     `src/core/internal-render-options.ts`.

   Grep `~/git/plantuml/src/main/java/net/`, never just `net/sourceforge/plantuml/`.
2. **Check before you build.** Grep `docs/catalog.md` for `EmbeddedDiagram`, `readLines` and `InternalRenderOptions`.
   Run `ls .agent-notes | grep -iE "cogr-T4|edp|embed"`, and read the hits (`cogr-T4.md` has the planning-era
   mechanism).
3. **Red.** Before a code change, add or change a failing test. T1a's red is the ratchet entry itself: the ratchet
   test runs on the new pins.
4. **Green.** Make the change the decision names. Preserve upstream names; keep every `@see`.
5. **Measure, alone.** After any `src/` change, run the class pins (README), then the class survey with `--out`.
   Every class row keeps its verdict.
6. **Commit** with Conventional Commits: lines ≤80, footer `Refs: #185`, and the harness's `Co-Authored-By` trailer.
   Prettier runs on commit.
7. **Notes.** Write `.agent-notes/edp-<task>.md` for anything unexpected, using the template in
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
3. Run `npm run parity:dashboard`, and commit `docs/parity-report.md` and the `parity-*.json` files. Revert a
   `parity-*.json` whose only change is `generatedAt`.
4. Tick the overview and the README, append the counts and the close sha to the journal, and commit.
