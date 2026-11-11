## Observation: a label coordinate sits on a rounding tie that only the jar's float32 origin resolves
- **Context**: cov-state-colors, the concise `A` label: `(x + x2) / 2 - dim.getWidth() / 2` is 25 - 4.0125 relative.
- **Finding**: the jar prints `x="54.012"`. The panel origin there is `20 + 5 +` the width of R's widest label (`X`, the
  deterministic measurer's float32 8.024999618530273), so the absolute x is 54.0124998; a literal origin of 33.025 gives
  54.0125002 and prints `54.013`. Tests of a panel must pass the origin the diagram would (`25 + measured width`) wherever
  a label lands on a tie.
- **Impact**: T3a/T4a get this right by construction (the diagram translates by the real left-panel width); only a unit
  test with a hand-typed origin can miss it. Not a port defect.
- **Confidence**: High (reproduced both origins)

## Observation: TimeProjected#getTimeProjection takes a nullable tick
- **Context**: `PanelsState#getTimeProjection` answers `null` for a `null` tick (PanelsState.java:80-81).
- **Finding**: T1's `TimeProjected` typed the tick `TimeTick`; it is now `TimeTick | undefined` (a wider parameter, so the
  one caller, `TimingDiagram#drawMessages`, is unaffected).
- **Impact**: T2d/T2e panels implement the wider signature.
- **Confidence**: High

## Observation: Panels/PlayerConcise args objects
- **Context**: D16, `Panels` and every subclass constructor have six parameters.
- **Finding**: `PanelsArgs {ruler, skinParam, suggestedHeight, style, notes, constraints}` is the one shape; `PanelsConciseArgs`
  and `PanelsRectangleArgs` alias it. Players take `PlayerBaseArgs` (`PlayerConciseArgs`, `PlayerRectangleArgs` alias it).
  `notes` and `constraints` are `readonly T[] | undefined` for Java's nullable lists, and the arrays the player passes
  are its live lists.
- **Impact**: T2d's `PanelsRobust`/`PlayerRobust` and T2e's classes use the same args.
- **Confidence**: High
