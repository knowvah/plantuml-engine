# T3c — Remaining commands, `CommandFootboxIgnored`, common commands, `TimingDiagramFactory`

**Write-set:** `src/diagrams/timing/command/{CommandTimeMessage,CommandNote,CommandNoteLong,CommandConstraint,CommandScalePixel,CommandHideTimeAxis,CommandHighlight,CommandModeCompact,CommandTicks,CommandPixelHeight,CommandUseDateFormat}.ts`,
`src/diagrams/timing/{TimingDiagramFactory,timing-common-commands}.ts`, `src/core/command/CommandFootboxIgnored.ts`,
`tests/unit/timing/**`.

**Read:** D2, D4, D9; the eleven Java files, `TimingDiagramFactory.java`, `command/CommandFootboxIgnored.java`,
`command/CommonCommands.java#addCommonCommands1`; `src/diagrams/regex/{PSystemRegexFactory,regex-common-commands}.ts`
(the factory and dispatch shape, `ProtectedCommand`); `src/core/command/CommandMultilines2.ts` (for `CommandNoteLong`);
`src/core/link-style-regex.ts` (`LINE_STYLE`, `CommandTimeMessage`'s `ARROW_STYLE`); the sequence engine's
`CommandArrow.getColorOrStylePattern` port, if any, for `CommandConstraint` (else port the pattern beside the command,
citing `sequencediagram/command/CommandArrow.java`).

**Do:**

1. Each command as its Java file, grammar leaf for leaf, error text verbatim. `CommandScalePixel`'s units
   (`[smhdDyY]`) multiply as the Java does. `CommandUseDateFormat` calls `useDateFormat`, which uses T1a's pattern check
   and returns `Bad date format`.
2. `src/core/command/CommandFootboxIgnored.ts`: the regex form, beside its `UBrex` twin.
3. `timing-common-commands.ts`: a copy of the closest engine's `addCommonCommands1` dispatch (D2).
4. `TimingDiagramFactory.ts`: `createEmptyDiagram` and `initCommandsList` in the batch overview's order, inside
   `ProtectedCommand`, with the `CommandStopAt` line as a comment.

**Tests:** the factory parses every planning probe that draws `TIMING` without error, and the four error probes as the
jar classifies them (`cov-unknown-player` at line 4; `cov-bad-date-format` errors); `cov-empty` reaches the Welcome
path; drawing the parsed `cov-concise-basic`, `cov-messages`, `cov-notes`, `cov-highlight` and `cov-scale-unit` onto
`UGraphicSvg` gives the oracle body (the first end-to-end checks; a residual is journaled for T4c).

## Acceptance
- Given the 40 probes the jar draws as `TIMING`, when parsed, then none errors; given `cov-unknown-player`,
  `cov-bad-date-format` and `cov-date-julian`, then each errors at the jar's line or throws where the jar crashes
  (`cov-starttiming-tag` is T4a's, D10).
- Given `npm test`, then it passes with the new files covered ≥90 %.

Observability N/A. Rollback Reversible.
