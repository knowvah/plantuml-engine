# T2b — `PSystemDefinition` and its factory

Read [task-contract.md](../task-contract.md).

**Java:** `definition/PSystemDefinition.java` (:84-88 `getTextBlock`), `definition/PSystemDefinitionFactory.java`,
`UgSimpleDiagram.java`. It draws **only the start line** through `Display.getWithNewlines(Pragma.createEmpty(), startLine)`,
sans-serif 14, `FontConfiguration.create(font, HColors.BLACK, HColors.BLACK, null)`, with `new SpriteContainerEmpty()`. Body
lines are stored and never read. `doCommandLine` keeps them anyway (Mirror the jar's shape; keep the field).
`initDiagram`'s `if (getDiagramType() == DiagramType.DEFINITION)` is always true here: keep it, with a comment.

**Write:** `src/diagrams/definition/PSystemDefinition.ts`, `PSystemDefinitionFactory.ts`, `tests/unit/factories/PSystemDefinition.test.ts`.

`PSystemDefinition extends UgSimpleDiagram` (`src/core/UgSimpleDiagram.ts`). `Display.getWithNewlines` already exists. A `\n` in
the start line is a real break (`cov-def-newline`, 93×29). Creole markup in the start line is honoured (`cov-def-creole`, 3 text runs).

**Interface output** (consumed by T3a): `definitionPlugin: SyncPlugin`.

## Acceptance
- Given `banire-12-feze162` (`@startdef(id=macro)` with a body), when rendered through the plugin, then zero diffs and the page shows
  only `@startdef(id=macro)`.
- Given `cov-def-empty`, then it draws 98×15, not the Welcome page.
- Given `firiru-71-viki803`, then zero diffs.

Observability: N/A — no new observable operations. Rollback: Reversible.
