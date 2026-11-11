# T1a — The tokenizer

**Read:** `regexdiagram/{ReTokenType,ReToken,RegexParsingException,RegexExpression}.java` in full (431 lines for
`RegexExpression`); `utils/CharInspectorImpl.java` (`peek`, `jump`); `src/core/utils/CharInspector.ts`,
`CharInspectorImpl.ts`, `BlocLines.ts#inspector`; D4, D5, D9, D11.

**Write-set:** `src/diagrams/regex/{ReTokenType,ReToken,RegexParsingException,RegexExpression}.ts`,
`tests/unit/regex/RegexExpression.test.ts`, `tests/unit/regex/ReTokenType.test.ts`.

**Do:**

1. `ReTokenType` with both static helpers, `ReToken` with Java's `toString`, `RegexParsingException` as an `Error`
   subclass with `name` set, so T2a can tell it from any other throw (D5 kinds 2 and 3).
2. `RegexExpression.parse` with every predicate and reader as its own function, in Java's branch order
   (`RegexExpression.java:45-112`), each with `@see`. Keep the unreachable `throw new IllegalStateException()` at
   `:107` and the unread `comment` builder in `skipComment` (D4).
3. Mirror D9: `Character.isLetter` as `/\p{L}/u` on one UTF-16 unit; `String.matches("^\\{[0-9,]+\\}$")` anchored;
   `'\0'` as the end sentinel `peek` returns.

**Tests** (token lists asserted as `toString` strings):
- `A(?=abc)BC(?!not)DE` (`cecave-79-napo327`) gives `LOOK_AHEAD[?=]`, `PARENTHESIS_OPEN[(]` and `LOOK_AHEAD[?!]`.
- `A(?<tld>BCD)Z` (`tubepu-44-gigu535`) gives `NAMED_GROUP[tld]`, then `PARENTHESIS_OPEN[(]`.
- `(?:` gives `PARENTHESIS_OPEN[(?:]`; `[[:digit:]]` gives `CLASS[:digit:]`; `\0377` gives `CLASS[\0377]`;
  `￿` gives `CLASS[￿]`; `\p{L}` gives `CLASS[\p{L}]`; `\b` gives `ANCHOR[\b]`; `\.` gives `ESCAPED_CHAR[.]`.
- `a{2,3}?` throws `RegexParsingException` `Bad quantifier {2,3}?` (`cov-lazy`); `a+?` gives `QUANTIFIER[+?]`.
- `a(?#abc` throws `Unclosed comment`; `\u12` and `\p{L` throw `Unexpected end of data`.
- `[[:alpha:]` throws a non-`RegexParsingException` error from `CharInspectorImpl#jump` (`cov-posix-all`).
- `(?<abc` and `(?<>a)` give `PARENTHESIS_OPEN[(]` then `QUANTIFIER[?]` (D4).
- `àé€😀` gives five `SIMPLE_CHAR` tokens, the emoji as two units (D9).

## Acceptance
- Given each `probes/*.puml` regex line, when parsed, then the outcome kind (tokens, `RegexParsingException` with the
  jar's message, or another throw) matches the probe's oracle in `/tmp/rep-plan/oracle/`.
- Given `lizard` on the new files, then no function exceeds 30 NLOC or CCN 10.

Observability N/A. Rollback Reversible.
