# Task contract

Every task does these steps, in order. A task file adds only what is specific to it.

1. **Read the Java first.** Open the method and the constructor that built its inputs, and quote `file:line` before you
   state why something differs.
   - The Java is in `~/git/plantuml/src/main/java/net/sourceforge/plantuml/`: `PSystemBuilder.java:132-202`,
     `eggs/PSystemPathFactory.java`, `eggs/PSystemPath.java`, `eggs/GraphicsPath.java`, `klimt/UMotif.java`,
     `klimt/shape/DotPath.java:328-338`, `klimt/geom/XPoint2D.java:71-77`, `DirectOsDiagram.java`,
     `command/PSystemSingleLineFactory.java`, `regex/Pattern2.java:92-118` (patterns are `CASE_INSENSITIVE`).
   - Read it with Read. Never edit it.
   - Check `docs/catalog.md` before you build anything. These already exist: `DirectOsDiagram`
     (`src/core/DirectOsDiagram.ts`), `singleLinePlugin`, `DotPath`, `DriverDotPathSvg`, `UGraphicSvg`, `XPoint2D`,
     `HColors`, `SecurityProfile`, `DEFAULT_SECURITY_PROFILE`, `errorSvg`.
2. **Red.** Write a failing test first.
   - Under LEGACY, the expected pages are the existing jar oracles (`tests/fixtures/factories/cov-path-*.svg`).
   - Under INSECURE, no SVG oracle exists. Assert the coordinates in `decisions.md#d2`, which were checked against the
     jar's PNG (`measurements/decode-motif.py`).
   - Render any new oracle with `scripts/oracle-render.sh <absolute-out-dir> <puml>`.
3. **Green.** Port the method.
   - Never fit a value: every constant carries its upstream `file:line`.
   - Preserve upstream names. Every ported symbol carries a JSDoc `@see` to its Java origin.
   - Do not refactor beyond what the mirror needs.
4. **Measure.** Run `npm test -- tests/oracle/svg-conformance/factories` and confirm the three `cov-path-*` rows stay at
   weightedScore 5. The full gates run at batch close.
5. **Commit.** Use Conventional Commits, lines ≤80, footer `Refs: #178`, ending with the session's attribution trailer.
   Prettier runs on commit.
6. **Notes.** Write `.agent-notes/ipe-<task>.md` for anything unexpected, in the template of `~/.claude/rules/memory.md`.

Every task:
- **Observability:** N/A, no new observable operations.
- **Rollback:** Reversible (revert the commit).
- **Agent:** the orchestrator, or a `typescript-pro` subagent with this file, `decisions.md` and the task file as its
  prompt.
- **Write-sets** are plans, not limits (CLAUDE.md, "Writing and write-sets"). Journal every file you add.

A subagent's mechanism is a claim until you have read the Java yourself (`.claude/memory/verify-agent-claims-si31.md`).
Work in the main checkout, serially, with no worktrees and no two writers at once.

## Batch close

1. At `uptime` below about 10, run the README gates.
2. Tick the overview and README, append the gate results and the close sha to the journal, and commit
   `chore(ipe): close batch <n>`.
