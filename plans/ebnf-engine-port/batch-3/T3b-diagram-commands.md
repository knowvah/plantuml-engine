# T3b — Diagram, commands, factory

**Read:** `ebnf/PSystemEbnf.java` (114), `PSystemEbnfFactory.java` (71), `CommandEBnfSingleLine.java`,
`UBrexCommandEbnfMultilines.java`, `UBrexCommandComment.java`, `CommandCommentMultilines.java`,
`CommandCommentMultilines2.java`, `CommandNoteMultilines.java`; `command/PSystemCommandFactory.java` (the
empty-diagram and `Syntax Error?` paths); `src/diagrams/nwdiag/NwDiagramFactory.ts` and `NwDiagram.ts` (the
`TitledDiagram` + common-commands shape), `src/diagrams/activity-legacy/ActivityDiagramFactory.ts:83-150` (the
`ubrex`/`singleLine`/`multiLine` wrappers); D2, D4, D13.

**Do:**

1. `PSystemEbnf.ts`: `extends TitledDiagram`, `getDescription` `(EBNF)`, `addBlocLines` (pragma `COMPACT`,
   `blines.inspector()`, `Unparsable expression`), `addNote` with `colors` (D4), `getTextBlock` (the empty-list
   `syntaxError`, the `mergeTB(…, LEFT)` stack, `addBackcolor(…, null)`).
2. The six commands, each on its upstream base: `CommandEBnfSingleLine` on `SingleLineCommand2` (its `RegexConcat`
   transcribed with `%s` and `%pLN` the way `SingleLineCommand2` callers in `src/diagrams/` already do);
   `UBrexCommandEbnfMultilines` on T1b's `UBrexCommandMultilines2` with `KEEP_STARTING_QUOTE`, `Trim.BOTH`;
   `UBrexCommandComment` on `UBrexSingleLineCommand2`; the two comment multilines and `CommandNoteMultilines` on
   `CommandMultilines2` (`removeFewChars(2)` / `(3)`, `REMOVE_STARTING_QUOTE`, `subExtract(1, 1)`,
   `removeEmptyColumns`). `explainArg`/`explainNow` only if this port's base classes carry `explain`.
3. `PSystemEbnfFactory.ts` and `ebnf-skin-param.ts`: common commands first, then the five in `initCommandsList` order;
   `CommandNoteMultilines` is not registered (D4); the empty source gives the Welcome page (D13); a line no command
   takes gives `Syntax Error?` with its line.

**Tests:** the factory on each of the 44 rows' sources returns a diagram, except `ladifa-97-keme950`, refused at line
5 with `Syntax Error?`; `cov-no-equals` refused at line 2; `cov-unparsable` refused with `Unparsable expression`;
`cov-empty` takes the empty-diagram path; `cov-comment-standalone` yields one rule and three notes in order; a
multi-line rule (`cov-multiline-rule`) reaches `addBlocLines` as one block of four lines; `CommandNoteMultilines`
executed directly adds a note with its colour.

## Acceptance
- Given `ladifa-97-keme950`, then the factory refuses line 5 with Java's `Syntax Error?` text (D8 relies on it).
- Given `cov-comment-standalone`, then the diagram holds its notes and its rule in source order, as many notes as the
  oracle draws (count them in `/tmp/eep-plan/oracle/cov-comment-standalone.svg`; planning did not).
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
