# T2a — Commands, factory, `FlowDiagram` model

**Read:** D1, D3, D4, D5, D8; `flowdiagram/{CommandLineSimple,CommandLink,FlowDiagramFactory,FlowDiagram}.java`;
`src/diagrams/bpm/{BpmDiagramFactory,CommandMerge,BpmDiagram}.ts` (the template); the port's `RegexLeaf.start/end`,
`spaceOneOrMore`, the `%g` translation, and the case-insensitive flag in `src/core/regex/`.

**Write-set:** `src/diagrams/flow/{CommandLineSimple,CommandLink,FlowDiagramFactory,FlowDiagram}.ts`,
`tests/unit/flow/**`.

**Do:**
1. `CommandLineSimple`: `start`, optional `([nsew])` plus one or more spaces, `(\w+)`, one or more spaces,
   `[%g](.*)[%g]`, `end`. `CommandLink`: the same, without the label. The default orientation is `SOUTH`, else
   `TileGeometry.fromString`.
2. `FlowDiagramFactory#initCommandsList` is `[CommandLineSimple, CommandLink]`, in that order. `parseFlow` copies
   `parseBpm`'s walk (no `CommonCommands`, `Syntax Error?` on the first line no command takes).
3. `FlowDiagram extends TitledDiagram`, `'FLOW'`.
   - `lineSimple`: the first call builds the `TilesField` and clears the boxes, and later calls `createTile(lastTile,
     orientation)`.
   - `linkSimple` and `getTileById`: the first match in insertion order (D4); a miss throws `IllegalArgumentException`
     with the id.
   - `tilesBoxes` is a `Map<Tile, ActivityBox>`.
   - `getDescription()` matches `BpmDiagram`'s form with `Flow Diagram`.
4. Errors (D5): a command that throws must reach the crash page exactly as bpm's throws do. Read how `BpmDiagram`'s
   `IllegalArgumentException` path surfaces, and reuse it.
5. Record D1's greps for `getInnerPosition` and `getMinMax(StringBounder)`, and keep them only if the port's
   `TextBlock` interface declares them.

## Acceptance
- Given each D5 error probe, then `parseFlow` refuses (syntax kinds) or the diagram throws (crash kinds) with the Java
  exception's name.
- Given `S 20 "B"`, `s "A"` and `  10 "A"`, then they parse as the jar did (`cov-upper-orientation`,
  `cov-orientation-only`, `cov-leading-space`).
- Given `bemixo`'s source, then 9 boxes and 9 paths are built, and the path list is in source order.

Observability N/A. Rollback Reversible.
