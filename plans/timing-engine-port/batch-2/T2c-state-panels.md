# T2c — `Panels`, `PanelsState`, concise/rectangle/no-left panels, the shapes, `PlayerConcise`, `PlayerRectangle`

**Write-set:** `src/diagrams/timing/graphic/{Panels,PanelsState,PanelsConcise,PanelsRectangle,PanelsNoLeft,HexaShape,PentaAShape,PentaBShape,PentaAShapeRectangle,PentaBShapeRectangle}.ts`,
`src/diagrams/timing/{PlayerConcise,PlayerRectangle}.ts`, `tests/unit/timing/**`.

**Read:** D6, D7, D13, D16; those twelve Java files (`graphic/Panels.java` 192 lines, `PanelsState.java` 300);
`PlayerConcise.java`, `PlayerRectangle.java`; T2a's `Player` and T2b's `TimeConstraint`.

**Do:**

1. `graphic/Panels.ts`: the abstract base (constraints, notes, suggested height, style), `getTimeProjection`, note
   drawing above/below (`Position.TOP`/`BOTTOM`).
2. `graphic/PanelsState.ts`: the shared state-panel drawing: one shape per change interval, `{hidden}`, `{...}`, `{-}`,
   `{?}` and `{A,B}` as the Java branches on them, comments, colours.
3. `PanelsConcise`, `PanelsRectangle`, `PanelsNoLeft`, `HexaShape`, `PentaAShape`, `PentaBShape`,
   `PentaAShapeRectangle`, `PentaBShapeRectangle`: each as its Java file.
4. `PlayerConcise.ts`, `PlayerRectangle.ts`: `buildPlayerPanels`, the `concise`/`rectangle` SName.

**Tests:** `cov-concise-basic`, `cov-rectangle`, `cov-special-states` (concise half), `cov-state-colors` (concise half),
`cov-relative-time`: the drawn hexagons, pentagons and text equal the oracle's, built through the ruler and players
directly.

## Acceptance
- Given those probes' oracles, when a concise or rectangle player draws its right panel, then every polygon and text
  coordinate equals the oracle's.
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
