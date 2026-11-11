# T2d — `PanelsRobust`, `PlayerRobust`

**Write-set:** `src/diagrams/timing/graphic/PanelsRobust.ts`, `src/diagrams/timing/PlayerRobust.ts`, `tests/unit/timing/**`.

**Read:** D6, D7, D16; `graphic/PanelsRobust.java` (344 lines: `allStates` order, `getStatesAt`, the step waveform,
the `{A,B}` band, the left panel listing every state), `PlayerRobust.java`; `AbstractStatePlayer#getStatesLabel`.

**Do:**

1. `PanelsRobust.ts`: the Java, method for method; split long methods by name (D16). The state order on the left
   panel is the Java's `allStates` order (declared `has` states first, then first appearance), not sorted.
2. `PlayerRobust.ts`: `buildPlayerPanels`, the `robust` SName.

**Tests:** `cov-robust-basic`, `cov-define-states` (`has Idle,Busy,Off` and `has "Long Label" as LL`),
`cov-special-states` (robust half: `{...}`, `{?}`, `{Idle,Busy}`), `cov-state-colors` (robust half), `cov-at-player`:
the waveform path, left-panel labels and their y positions equal the oracle's.

## Acceptance
- Given those probes' oracles, when a robust player draws both panels, then every path, line and text coordinate equals
  the oracle's.
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
