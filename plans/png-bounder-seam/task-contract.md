# Task contract

Every task does these, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before you
   state why something differs.
   - The Java is `~/git/plantuml/src/main/java/net/`: `FileFormat.java`, `StringBounderAwt.java`,
     `klimt/drawing/font/StringBounderFromWidthTable.java`, `math/ScientificEquationSafe.java`,
     `klimt/creole/atom/AtomMath.java`, `core/TextBlockExporter.java`, `wire/WireDiagram.java`, `wire/WBlock.java`. Read
     it with `git -C ~/git/plantuml show dot-output:<path>` or with Read; never edit it.
   - Check `docs/catalog.md` before building anything. These exist already: `DeterministicMeasurer`,
     `MeasurerStringBounder`, `measurerOf`, `jarMeasurer`, `TextBlockExporter#exportTo`,
     `GraphicStrings.createBlackOnWhiteMonospaced`, `rollbackSvg`.
2. **Red.** Write a failing test that asserts jar values. Take them from a re-captured oracle (after T2a), or from a
   `/tmp/pbs-*/` render with the seam-5 jar (before T2a). Author `cov-*.puml` where no row covers a branch, and render
   oracles with `scripts/oracle-render.sh` and an absolute out-dir.
3. **Green.** Port the method.
   - Never fit a value: every constant carries its upstream `file:line`.
   - Mirror the jar, even where it looks like a bug, and preserve upstream names.
   - Ported symbols carry a JSDoc `@see` to their Java origin.
   - Do not refactor beyond what the mirror needs.
4. **Measure, alone.** Survey the affected buckets into `/tmp/pbs-<task>/` (`--out /tmp/pbs-<task>/parity-<type>.json`, one
   type per run), then run `verdict-diff.mjs <base> /tmp/pbs-<task>`, where `<base>` is the mission base sha. Exit 1 is a loss: state its mechanism or stop. `compareSvg` short-circuits, so re-read the rows after
   a fix (`.claude/memory/comparesvg-count-not-monotonic.md`).
5. **Commit.** Conventional Commits, lines ≤80, `Refs: #170`. End the message with the session's attribution trailer.
   Prettier runs on commit. Oracle-byte commits may be large: if the pre-commit hook times out on them, use
   `--no-verify` and journal it (`instrument-space-width` row 15 precedent).
6. **Notes.** Write `.agent-notes/pbs-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task:
- **Observability:** N/A, no new observable operations.
- **Rollback:** Reversible (revert the commit).
- **Agent:** the orchestrator, or a `typescript-pro` subagent with this file, `decisions.md` and the task file as its
  prompt.
- **Write-sets** are plans, not limits.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Agents using Serena write to the main checkout, which is where this mission works, so run no two writers at once.

## Batch close

1. Run the README gates, at `uptime` below about 10.
2. From batch 2 on:
   - Run a bare `npm run svg:survey`, then `verdict-diff.mjs <base>`: 0 lost in every engine, except the drift T0 recorded. List every census attribute
     that moves away from the jar (`.claude/memory/census-away-from-jar-catches-hidden-regressions.md`).
   - The full survey rewrites `tests/oracle/svg-conformance/parity-*.json`. Run `npm run parity:dashboard` and commit
     both, or the drift gate fails (close order: survey, dashboard, drift test).
3. A newly conformant row: re-pin only that engine's equality pins, with its own tool. Never lower a never-rises ceiling
   by hand. Diff the baseline JSON after each re-pin (`.claude/memory/repin-script-raises-preexisting-red-pin.md`).
4. Tick the overview and README, append the counts and the close sha to the journal, and commit
   `chore(pbs): close batch <n>`.
