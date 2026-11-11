# T2a — `PSystemRegex`

**Read:** `regexdiagram/PSystemRegex.java` in full (372 lines); `jsondiagram/StyleExtractor.java:54-156`;
`TitledDiagram.java`; `src/diagrams/ebnf/PSystemEbnf.ts`, `ebnf-skin-param.ts`, `PSystemEbnfFactory.ts` (how the
`SkinParam` is built and handed in); `src/diagrams/json/StyleExtractor.ts`, `json-skin-param.ts` (the
`jsonFamilyJarStyleSource` cut, which is the json family's `applyStyles`); the tiles' constructors in
`src/diagrams/ebnf/`; the probes `cov-skinparam`, `cov-style-regex`, `cov-style-element`, `cov-theme`,
`cov-multi-line`, `cov-merge-boxes`, `cov-braced-all`, `cov-title-only`; D1, D3, D4, D5, D9, D11, D13.

**Write-set:** `src/diagrams/regex/{PSystemRegex,regex-skin-param}.ts`, `src/diagrams/json/StyleExtractor.ts` (only to
add `applyStyles` at its upstream home), `tests/architecture/layering.test.ts` (D1's and D3's entries),
`tests/unit/regex/PSystemRegex.test.ts`.

**Do:**

1. `regex-skin-param.ts`: a copy of `ebnf-skin-param.ts` (D2), plus what D3 needs: the style builder the constructor
   reads holds the default skin, the `skin` line and every `<style>` block, and **no** `skinparam`; the document reads
   the full one later. Journal how `!theme`'s `<style>` and `skinparam` lines arrive in `styleSource`, with
   `cov-theme`'s oracle as the check.
2. `PSystemRegex.ts`: the constructor (`:82-97`), `getDescription`, `getTextBlock` (`UTranslate(5, 5)`, `delta(10)`,
   `addBackcolor(tb, null)` as `PSystemEbnf.ts` treats it), `addBlocLines` with the 16-branch dispatch split per D11,
   `addImplicitConcatenation`, `pushEtileBox` (through `ETileBoxArgs`, with `getPreprocessingArtifact().getOption()`),
   `pushRegexGroup`, `lookAheadOrBehind`, `namedGroup`, the four repetition methods, `repetitionBraced` with
   `stripBraces`/`parseBracedMin`/`parseBracedMax`/`isBracedMaxUnbounded`, `alternation`, `concatenation`,
   `isConcatenation1Mergeable`, `isBoxMergeable`. `stack` is a deque whose `removeFirst` throws when empty (D5).
3. Mirror D4's quirks with their comments.

**Tests** (jar values from the cached SVGs and probe oracles):
- `leluxe-05-lava324` (`abc`) builds one merged `ETileBox` `abc`; `cov-merge-boxes` builds the oracle's box texts.
- `cov-multi-line` draws only `x|y`, and `calculateDimension` gives the oracle's 96 × 89 less the document margins
  (find the margin in `TitledDiagram`, do not fit it).
- `cov-braced-all`'s tiles: `{0,}` is a `ETileZeroOrMore`, `{0,1}` an `ETileOptional2`, `{0,3}` an `ETileOptional2`
  around a labelled `ETileOneOrMore`, `{3}` a labelled `ETileOneOrMore`; `{0}` and `{0,0}` take the `*` branch.
- `parseBracedMin('{,5}')` is 0; `parseBracedMax('{1,2,3}')` and `parseBracedMin('{99999999999}')` are -1.
- `a*` with `skinparam defaultFontColor red` keeps the default font colour; with `<style> element { LineColor green }`
  the box stroke is `#008000` (D3).
- `addBlocLines` on `a{x}` returns the error `Error parsing: Bad quantifier {x}`; on `*` it throws (D5 kind 3); an
  empty diagram's `getTextBlock` throws.

## Acceptance
- Given the 44 drawn rows' lines fed through `addBlocLines`, then every one returns ok, and bakuza's and tajefa's line
  returns `Error parsing: Bad quantifier {([^{}`.
- Given `tests/architecture/layering.test.ts`, then it passes with exactly the two new entries, each with a `why`.

Observability N/A. Rollback Reversible.
