## Observation: timing's chrome state lives on TimingChrome, not TimingDiagram
- **Context**: wiring title/legend/caption/header/footer/scale through the common commands; `TimingDiagram.ts` is at the 500-line cap.
- **Finding**: `TimingChrome.ts` (port-only abstract base of `TimingDiagram`, extends `TitledDiagram`) holds `annotations`, `scale` and the
  `sprites` getter, as `NwDiagram`/`PSystemRegex` hold them. `TimingDiagram` still has exactly 500 lines.
- **Impact**: T4a reads `diagram.annotations`, `diagram.scale`, `diagram.sprites`, `getWarnings()`; add no members to `TimingDiagram.ts` without moving one out.
- **Confidence**: High

## Observation: refusal lines are document lines, the jar's minus one
- **Context**: checking the jar error probes and the four D8 corpus rows through `parseTiming`.
- **Finding**: `ParseRefusal.line` is `linePositions[i]`, which counts `@startuml` as line 0. The jar's `line 4` of `cov-unknown-player` is 3;
  the D8 rows (jar lines 10, 11, 20, 11) refuse at 9 (`Syntax Error?`), 10 (`No such element: A`), 19 (`No such participant WB`), 10 (`What time?`).
- **Impact**: any T4a/T4b assertion on a timing refusal line subtracts one from the jar's.
- **Confidence**: High

## Observation: `scale N as M pixels` is not a common scale command; `use date format` needs the oracle zone in tests
- **Context**: common commands 1 are registered first and include the `scale` commands.
- **Finding**: `matchScaleCommand` does not claim `scale 100 as 50 pixels`, so `CommandScalePixel` gets it and `diagram.scale` stays unset
  (`factory-common.test.ts`). `cov-date-format` draws `20-07-03` only with zone `America/Chicago` (decisions.md D4); `parseTiming`'s fourth
  argument is that zone.
- **Impact**: T4a passes `renderClock(options).zone` as `parseTiming`'s `zone`; T4b's date-format fixtures use the capture-clock zone.
- **Confidence**: High

## Observation: CommandDefineStateShort's `states === undefined` branch cannot be taken
- **Context**: re-reading T3b command coverage (`CommandDefineStateShort.ts` branches 75%).
- **Finding**: the `STATES` leaf is `((,(...))*)`, which always participates, so `arg.get('STATES', 0)` is `''`, never `undefined`; Java's `if (states != null)`
  has no false branch either. The one uncovered branch is that mirrored guard.
- **Impact**: none on output; the file reads 100% lines/functions, 75% branches.
- **Confidence**: Medium

## Observation: a null `MESSAGE`, `TimeTick` or constraint label is Java's null, not an empty string
- **Context**: `CommandTimeMessage`, `CommandConstraint`, `CommandHighlight` pass `arg.get("MESSAGE", 0)` and unresolved ticks straight through.
- **Finding**: `TimeMessage`'s and `TimeConstraint`'s label types widened to `string | null` (so `Display.getWithNewlines(pragma, null)` is `Display.NULL`, not the
  `Quark` overload an `undefined` would hit); `updateNow` takes `TimeTick | undefined`. An unresolved tick reaches `createTimeMessage`/`highlight` as `undefined`
  (a `!` in the command, D7): `highlight :nope to 10` crashes only when drawn, as the jar does (`when` is null at `TimeTick.getTime()`).
- **Impact**: a jar crash page for these is a draw-time `TypeError`, not a parse refusal.
- **Confidence**: High
