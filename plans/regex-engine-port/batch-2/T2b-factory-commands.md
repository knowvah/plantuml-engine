# T2b — `CommandRegexfSingleLine` and `PSystemRegexFactory`

**Read:** `regexdiagram/PSystemRegexFactory.java` (69), `CommandRegexfSingleLine.java` (81);
`command/PSystemCommandFactory.java` (the empty-diagram and `Syntax Error?` paths); `command/ProtectedCommand.java`,
`core/AbstractDiagram.java:173-180`; `src/diagrams/ebnf/PSystemEbnfFactory.ts`, `ebnf-common-commands.ts`,
`ebnf-style-dispatch.ts`, `CommandEBnfSingleLine.ts`; `src/core/command/SingleLineCommand2.ts`; D2, D4, D5.

**Write-set:** `src/diagrams/regex/{CommandRegexfSingleLine,PSystemRegexFactory,regex-common-commands,regex-style-dispatch}.ts`,
`tests/unit/regex/PSystemRegexFactory.test.ts`, `tests/unit/regex/CommandRegexfSingleLine.test.ts`.

**Do:**

1. `CommandRegexfSingleLine` on `SingleLineCommand2` with `RegexLeaf.start()`, `spaceZeroOrMore`, `LINE` `(.*)`,
   `end()`, and `executeArg` handing one `StringLocated` to `addBlocLines` as `BlocLines.from`.
2. `regex-common-commands.ts` and `regex-style-dispatch.ts`: copies of ebnf's (D2) typed on `PSystemRegex`, keeping
   the `SKINPARAM_WARNINGS` texts (`cov-mode-dark` draws the handwritten warning).
3. `PSystemRegexFactory.ts`: common commands first, then `CommandRegexfSingleLine`, every `execute` inside
   `executeProtected` (D5 kind 3); the two commented-out registrations as a comment (D2); the empty source takes the
   Welcome path (D5 kind 1). Because `(.*)` takes every line the common commands decline, a regex source never meets
   `Syntax Error?`; test that.

**Tests:** the factory on each of the 46 rows' sources returns a diagram, except bakuza and tajefa, refused at line 2
with `Error parsing: Bad quantifier {([^{}`; each error probe (D5) refused at the line its oracle names with the
oracle's message kind; `cov-empty` takes the empty-diagram path; `codoju-71-buko966` keeps `language de` as a regex
line; `cov-chrome-all` sets title, caption, legend, header and footer and draws `a(b|c)*`.

## Acceptance
- Given bakuza and tajefa, then the refusal is at line 2 with the jar's message (D8 relies on it).
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
