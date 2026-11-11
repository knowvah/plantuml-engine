# T2a — `NwDiagram`

**Read:** `NwDiagram.java` whole; `src/diagrams/packetdiag/PacketDiagram.ts` and `src/diagrams/board/BoardDiagram.ts`
for the `TitledDiagram` shape; D2, D8, D10, D11.

**Do:** grow `src/diagrams/nwdiag/NwDiagram.ts` in place, keeping `toSet` and its regex byte for byte.

1. Fields: `servers` (`Map`, insertion order), `networks`, `groups`, `stack` (index 0 is the top), `playField`.
   `getDescription()` `(Nwdiag)`; the constructor passes `NWDIAG`.
2. `currentNetwork`, `currentGroup`, `makeDiagramReady`, `openGroup`, `openNetwork`,
   `eventuallyConnectAllStandaloneServersToHiddenNetwork`, `closeSomething`, `createNetwork`, `link`, `justAfter`,
   `veryFirstLink`, `addElement`, `alreadyInSomeGroup`, `setProperty`, with Java's error texts (D8).
   `setProperty("description")` with no group and no network throws, as the Java dereferences null (D11 names the
   port message).
3. `getTextBlock`, `getStyleDefinitionNetwork`, `toTextBlockForNetworkName` (right-aligned, `SpriteContainerEmpty`),
   `getTotalDimension` (`TextBlockUtils.getMinMax(…, true).getDimension()`), `drawMe` (`margin = 5`, the `deltaX` and
   `deltaY` passes, the grid, the trailing `UEmpty(1, 1)`), `getLinks`, `buildGrid`, `getGroupOf`,
   `getDefaultMargins`.
4. If the file passes 500 lines, move `drawMe`/`buildGrid`/`toTextBlockForNetworkName` to a sibling module that keeps
   the method names (D10), and journal it.

**Tests:** drive the methods the way the commands will, for `cov-no-wrapper` (no `nwdiag {` wrapper),
`cov-peer-links` (`veryFirstLink`, then `link` with an existing server), `cov-multi-address` (a server on three
networks), and the four errors; assert the network list (names, visibility), each server's connections and bar
stages, and for `cov-no-wrapper` the text block's dimension against the oracle's 210 × 117 (margins are `none()`, so the
canvas is the text block rounded up).

## Acceptance
- Given `link("ghost", "web01")` after a network exists, then the result is the error `what about ghost`.
- Given `openGroup` inside a group, then `Cannot nest group`; given `openNetwork` inside a group, then
  `Cannot open network in a group`.
- Given `cov-no-wrapper`'s calls, then `calculateDimension` is 209.45 × 116.5 under the deterministic measurer (the
  oracle's 210 × 117 viewBox after rounding up).
- Given `npm test`, then it passes with `NwDiagram.ts` at 90/90/90.

Observability N/A. Rollback Reversible.
