# T3b — Player, state and time commands

**Write-set:** `src/diagrams/timing/command/{CommandRobustConcise,CommandClock,CommandAnalog,CommandBinary,CommandDefineStateShort,CommandDefineStateLong,CommandChangeState,CommandChangeStateByPlayerCode,CommandChangeStateByTime,CommandAtTime,CommandAtPlayer}.ts`,
`tests/unit/timing/**`.

**Read:** D3, D7, D9; the eleven Java files; `src/core/command/SingleLineCommand2.ts`, `src/core/regex/*`,
`StereotypePattern.ts`, `ColorParser.ts`; one existing engine's port of a `SingleLineCommand2` subclass (for example
`src/diagrams/regex/CommandRegexfSingleLine.ts`); T1c's `TimeTickBuilder`.

**Do:**

1. Each command as its Java file: the `RegexConcat` grammar leaf for leaf (`[%pLN_.@]+`, `%g` quotes, `StereotypePattern`
   slots, the `RegexOr` of `CommandChangeState`'s seven `STATE` alternatives), `executeArg` with its error strings
   verbatim (`Unknown "X"`, and any other `CommandExecutionResult.error` text).
2. `CommandChangeState.ts` is the abstract base of the two `ChangeStateBy*` commands; keep its `getChangeState`
   helpers and their order.
3. `CommandClock`: `new BigDecimal(arg.get("PERIOD", 0))` and `getBigDecimal` (`ZERO` when absent).

**Tests (grammar and effect, per command):** each line in the planning probes that the command claims parses to the
Java captures; `X is a` for an undeclared `X` errors `Unknown "X"` (`cov-unknown-player`); `@WB` then `0 is idle` /
`+200 is Proc.` (`cov-at-player`); `@0 as :start` then `@:start` (`cov-anchors`); `compact concise "A" as A`
(`cov-compact-player`); `C is {A,B}` and `R is {Idle,Busy}` (`cov-special-states`); `C is A #pink` and
`C is B : comment` (`cov-state-colors`); `analog "Vcc" between -4.5 and 6.5 as VCC` (`cov-analog`).

## Acceptance
- Given every planning probe line in these commands' scope, then the command matches it with the Java captures and
  calls the diagram as the Java does.
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
