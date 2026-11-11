# T2e — `PanelsBinary`, `PanelsClock`, `PanelsAnalog`, `PlayerBinary`, `PlayerClock`, `PlayerAnalog`

**Write-set:** `src/diagrams/timing/graphic/{PanelsBinary,PanelsClock,PanelsAnalog}.ts`,
`src/diagrams/timing/{PlayerBinary,PlayerClock,PlayerAnalog}.ts`, `tests/unit/timing/**`.

**Read:** D3, D5, D6, D7, D16; the six Java files; T1b's `TimeSeries` and `DeduceFormat`.

**Do:**

1. `PlayerBinary.ts`: `values` as a `TreeMap<TimeTick, ChangeState>` sorted array where `put` replaces (D6); `high`/`low`
   and `1`/`0` as the Java maps them.
2. `PlayerClock.ts`: `period`, `pulse`, `offset` as `BigDecimal` (D3); the eight-argument constructor as an args object
   (D16). `PanelsClock.ts`: `isHighAt` on `doubleValue()` arithmetic exactly as java:109 and its helpers compute it.
3. `PlayerAnalog.ts`: `TimeSeries`, `setMin`/`setMax` from `between A and B`, `ticks` multiple, height.
   `PanelsAnalog.ts`: the polyline, the value labels through `DeduceFormat`, the axis ticks.
4. `PanelsBinary.ts`.

**Tests:** `cov-binary`, `cov-clock-pulse-offset` (period 50; period 50 pulse 15 offset 10), `vega-clock-decimal-period-offset`
(period 12.5 offset 0.1), `cov-analog` (range `-4.5 … 6.5`, `ticks num on multiple 3`, `20 pixels height`),
`cov-ticks-every`: paths and labels equal the oracle's.

## Acceptance
- Given those probes' oracles, when each player draws its panels, then every path and text coordinate equals the
  oracle's.
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
