# T2b — Commands, factory, dispatch helpers

**Read:** the seven `wire/Command*.java` and `wire/WireDiagramFactory.java` (whole files);
`command/SingleLineCommand2.java:60-135` (`doTrim`), `command/ProtectedCommand.java`, `klimt/color/HColorSet.java`
(`getColor`); `src/diagrams/regex/{CommandRegexfSingleLine,PSystemRegexFactory,regex-common-commands,regex-skin-param,regex-style-dispatch}.ts`
and `src/diagrams/timing/timing-skin-param.ts` (pick the closer shape for a diagram with no style-driven drawing); D2,
D5, D9.

**Write-set:** `src/diagrams/wire/{CommandComponent,CommandSpot,CommandGoto,CommandMove,CommandWLink,CommandNewColumn,CommandPrint,WireDiagramFactory,wire-common-commands,wire-skin-param,wire-style-dispatch}.ts`,
`tests/unit/wire/{commands,WireDiagramFactory,factory-common}.test.ts`.

**Do:**

1. Each command is a `SingleLineCommand2<WireDiagram>` with `super(false, …)`: indentation is significant (D4). Check the
   existing pipeline keeps a source line's leading whitespace to the command, and fix it at the seam if not, with the
   Java quote (tep found the title commands matched the untrimmed line, `SingleLineCommand2.java:94`).
2. Regexes verbatim, group counts included: `CommandSpot`'s `X`/`Y` are `RegexLeaf(2, …)`, `arg.get('X', 0)`. `goto`'s
   `(\d+)` has no sign and `move`'s `(-?\d+)` does (`cov-goto-negative`). `CommandComponent` needs `spaceOneOrMore`
   before `[` (`cov-component-no-space-bracket`).
3. Width and height parse with a Java-`int` parse that throws past `2147483647` (D5, D9). A colour goes through
   `HColorSet.instance().getColor`, which throws `NoSuchColorException`; the existing `SingleLineCommand2` path renders it.
4. `CommandWLink`: `Display.NULL` when `MESSAGE` is absent, else `Display.getWithNewlines(diagram.getPragma(), message)`;
   `WOrientation.from` chooses `vlink` or `hlink`.
5. The factory: `addCommonCommands1`, then the seven commands in D2's order, inside `ProtectedCommand`. A throw from
   a command must become an error page, never a throw out of `renderSync` (D5).

**Tests:** each regex against every accepted and rejected spelling from the probes; `cov-print-quotes`' greedy `(.*)`; the
factory's error result for each of D5's kinds.

## Acceptance
- Given `  * b` under `* a`, when parsed, then the level is 2 and the render is an error page (`cov-indent-2-spaces`).
- Given `\t* b` under `* a`, when parsed, then `b` is a child of `a` (`cov-indent-tab`).
- Given `* a [99999999999x5]`, when parsed, then a parse-int error surfaces as an error page, not `Infinity` or a throw.

Observability N/A. Rollback Reversible.
