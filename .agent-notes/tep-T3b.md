## Observation: PLAYER_CODE lives in command/player-code.ts until T3c
- **Context**: five of T3b's neighbours read `CommandTimeMessage.PLAYER_CODE` (CommandTimeMessage.java:56); that class is T3c's.
- **Finding**: T3b added `command/player-code.ts` (`PLAYER_CODE`, `String.raw` of `([\p{L}_][%pLN_.]*)`). T3c's `CommandTimeMessage.ts`
  should `export const PLAYER_CODE` by re-export (upstream's `public static final`), and `CommandConstraint`, `CommandNote`,
  `CommandNoteLong` import it from either place.
- **Impact**: do not redeclare the pattern.
- **Confidence**: High

## Observation: `+N` with no current time is absolute, so a null tick needs an unknown code or clock
- **Context**: testing the `diagram.addTime(null, null)` NullPointerException path of `CommandChangeStateByTime` (java:100-109).
- **Finding**: `TimeTickBuilder#parseTimeTick` (digit branch) answers `value` unchanged when `now == null`, so `+5 is x` is a tick at 5.
  A null tick comes only from `nope*2` (unknown clock) or `:nope` (unknown code, no delta). The port's ruler throws `TypeError`
  where Java throws `NullPointerException` (the message is not a target, D9); `diagram.now` is set to the null first, as Java does.
- **Impact**: row `vufija-57-xoda292` (`@clkfoo*1`, line 11) goes through `CommandAtTime`'s "What time?" instead, not this path.
- **Confidence**: High

## Observation: explainArg (`@Explain`) is not ported for the eleven commands
- **Context**: all eleven Java classes carry an `explainArg`; `CommandChangeState#describeState` and `TimeTickBuilder#describeTime`
  exist only for it.
- **Finding**: dropped as every other engine's explain helpers are (batch 1 journal row 3 left `describeTime` unported);
  `SingleLineCommand2#explainArg` defaults to `undefined`. No render output depends on it.
- **Impact**: if an `explain` feature is ever ported, all eleven need their `explainArg` and the two helpers.
- **Confidence**: High
