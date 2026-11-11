# T2a — Base tiles

**Read:** `ebnf/ETile.java`, `CornerCurved.java`, `Zigzag.java`, `Brace.java`, `TextBlockable.java`,
`ETileEmpty.java`, `ETileBox.java` (whole, incl. `VALUE_MAP` at :78-90 and `getDrawValue` at :258-264),
`TitleBox.java`; `src/core/klimt/shape/TextBlockMemoized.ts`, `UPath.ts`, `ULine.ts`; D5, D6, D10, D12.

**Do:**

1. `ETile.ts`: the abstract class, the six line helpers (an arrow is drawn only when `x2 > x1 + minimunSizeForArrow`
   in `drawHlineDirected`), the four arrow `UPath`s, the comment defaults as no-ops (D10), `getRepetitionLabel`.
2. `CornerCurved.ts`, `Zigzag.ts`, `Brace.ts`: whole classes; every constant with its line (`Brace`'s `cinq = 5`).
3. `TextBlockable.ts`, `ETileEmpty.ts`, `TitleBox.ts` (bold `fc.add(FontStyle.BOLD)`, text at
   `height − descent`).
4. `ETileBox.ts`: text + 10 box, `rounded(10)` for the terminal symbols (read which `Symbol`s draw rounded and which
   square or italic in `drawU`), notes above and below with `+ 20`, centring, `mergeWith`, `getRepetitionLabel`
   returning the value, `getDrawValue` through `I18n` with `!option useDescriptiveNames` / `language` read from the
   `ConfigurationStore<OptionKey>` the engine passes (find the port's equivalent of `preprocessing.getOption()` in
   `src/core/tim/PreprocessingArtifact.ts`). Options object for the 7-argument constructor (D12).

**Tests:** an `ETileBox` for `"0"` and for `digit` against `butiti-18-tava797`'s oracle: box `rect` x, y, width,
height, `rx`, and the `text` x/y; `getH1`/`getH2` split the box height in half; a box with a note above is taller by
the note height + 20. `ETileBox` for `"."` with `useDescriptiveNames` draws `AnyChar` (`cov-descriptive-names`).
`TitleBox("digit1")` is bold and its baseline matches the oracle's title `text` y. Arrow paths match the oracle's
`polygon`/`path` points.

## Acceptance
- Given `butiti-18-tava797`'s terminal box, then width, height and corner radius equal the oracle's.
- Given `!option useDescriptiveNames true` and a terminal `\d`, then the box text is `Digit`; without the option, `\d`.
- Given `npm test`, then it passes with every new file at 90/90/90.

Observability N/A. Rollback Reversible.
