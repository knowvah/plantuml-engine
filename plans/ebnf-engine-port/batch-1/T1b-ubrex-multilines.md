# T1b — `UBrexCommandMultilines2`

**Read:** `command/UBrexCommandMultilines2.java` (152 lines), `command/CommandMultilines2.java`;
`src/core/command/CommandMultilines2.ts` (the `MultilineCommand<S>` contract and its adaptations),
`src/core/command/UBrexSingleLineCommand2.ts` (how a ubrex pattern is matched against one line and turned into a
`RegexResult`), `src/core/command/multiline-candidate.ts`; D3.

**Do:**

1. `UBrexCommandMultilines2.ts`: the whole class, `CommandMultilines2.ts`'s shape with the start and end patterns as
   `UnicodeBracketedExpression`s. `isValid`: `isCommandForbidden`, the `syntaxWithFinalBracket` branch, start
   `exactMatch` on the first trimmed line, `OK_PARTIAL` for one line, end `exactMatch` on the last line (after
   `trimEnd`), then `finalVerification`. `execute`: the final-bracket rejoin, `executeNow`, and a
   `NoSuchColorException` turned into `CommandExecutionResult.badColor()`.
2. Carry the same adaptations `CommandMultilines2.ts` documents (`@Explain` and `TeaVM.a()` dropped,
   `getPatternEndToto` not ported), naming them in the header.

**Tests:** a test subclass with `UBrexCommandEbnfMultilines`'s start (`「〴an_」〇*「〴an_-」 〇*〴s = 〇*〴.`) and end
(`〇+〘 〄>; 〙`) patterns: `["rule ="]` is `OK_PARTIAL`, `["rule =", "  \"a\","]` is `OK_PARTIAL`,
`["rule =", "  \"a\";"]` is `OK`, `["= x;"]` is `NOT_OK`; `executeNow` receives the trimmed lines; a thrown
`NoSuchColorException` gives `badColor`.

## Acceptance
- Given a block whose first line misses the start pattern, then `isValid` is `NOT_OK`.
- Given a block whose last line matches the end pattern, then `isValid` is `OK` and `execute` calls `executeNow` once.
- Given `npm test`, then it passes with the new file at 90/90/90.

Observability N/A. Rollback Reversible.
