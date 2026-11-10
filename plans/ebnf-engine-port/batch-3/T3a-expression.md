# T3a — Tokens, shunting yard, engine, expression

**Read:** `ebnf/Symbol.java` (priorities), `Token.java`, `ShuntingYard.java` (181 lines, incl. how comment tokens
become `COMMENT_ABOVE`/`COMMENT_BELOW` at :120-152), `EbnfEngine.java` (171), `EbnfExpression.java` (274); D10, D12.

**Do:**

1. `Symbol.ts` (a string enum or `const` object with `getPriority`), `Token.ts`, `ShuntingYard.ts`.
2. `EbnfEngine.ts`: the stack as an array used at its front (`addFirst`/`removeFirst`/`peekFirst`), every operation,
   `repetitionSymbol`'s `"×"` label at `fontConfiguration.bigger(-2)` and the `"0"` → `ETileOptional2` wrap,
   `alternation`/`concatenation`'s three merge branches, `getTextBlock` (`Syntax error!` unless exactly one tile),
   `commentAbove`/`commentBelow` throwing on an empty stack (D10).
3. `EbnfExpression.ts`: the tokenizer loop in Java order (D12 allows a table only with order and lines kept),
   `readString`, `readLitteral`, `readComment`, `isLetterOrDigit` (`Character.isLetterOrDigit` is Unicode: use
   `\p{L}|\p{Nd}`-equivalent and journal which Java categories it covers), `protect`, `getUDrawable` (the
   `TitleBox` + notes + `withMargin(main, 0, 0, 10, 15)` merge, the empty-rule `ETileWithCircles(new ETileEmpty())`,
   the catch-all `Syntax error!`), `getNoteAbove`/`getNoteBelow` through `FloatingNote` with
   `Display.getWithNewlines(pragma, …)`. Keep `isCompact` (D10).

**Tests:** tokenise `digit1 = s, (* note a *) {"0", "1"} (* note b *);` and assert the token list; the shunting yard's
output queue for `a | b, c` and `( a | b ), c` (precedence from `Symbol.getPriority`); `getUDrawable` for
`butiti-18-tava797` drawn through `UGraphicSvg` equals the oracle body below the document chrome; `bad = "a" , , ;`
draws `Syntax error!` at `cov-syntax-error`'s 100 × 49 text block; `nothing = ;` draws `cov-empty-rule`'s body; an
unterminated `"abc;` throws from `CharInspectorImpl#jump` (`cov-unterminated`); `foo @ "a";` gives `isEmpty()`.

## Acceptance
- Given `butiti-18-tava797`'s rule, then `getUDrawable`'s primitives equal the oracle's, notes included.
- Given `cov-repetition-symbol`, then `3 * "x"` and `0 * "y"` draw the oracle's two rules.
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
