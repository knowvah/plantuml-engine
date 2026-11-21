# U+00A0 in StringUtils.trin/trim2 (upstream 0c54c010cdf), agent "trim"

## Observation: trin/trim2 now live in one module; String#trim sites use javaTrim
- **Context**: porting `StringUtils.isTrimmable` and the U+00A0 change to `trin`/`trim2`.
- **Finding**: `src/core/string-utils-trim.ts` holds `isTrimmable`, `trin`, `trim2`; the 15 local copies and the `trin` export of `StyleParser.ts` (44 importers) now import it. Call sites upstream writes as `String#trim` use `javaTrim` (`java-number-format.ts`) instead and must keep U+00A0: `DriverTextSvg#draw` (DriverTextSvg.java:120-122, both `driver-text-svg.ts` and `svg-text-font.ts`), salt `CommandAnything` (:78), `Member` (:127-128), `FloatingDecimal` parses (salt `parseDouble`, math `parseJavaFloat`) and the legacy `StyleParser#readString` (StyleParser.java:357-358 at c9d62097ff5^).
- **Impact**: a new trim call site must pick by the Java it mirrors: `StringUtils.trin`/`getTrimmed()` -> `trin`; `.trim()` -> `javaTrim`; never JS `trim()` (it also strips U+2000-U+200A, U+3000, U+FEFF).
- **Confidence**: High

## Observation: the class parser JS-trims every line before dispatch
- **Context**: authored fixture `tests/fixtures/nbsp-trim/class-commands-members` (115 diffs before and after the trin port).
- **Finding**: `class-line-merge.ts#mergeStandaloneBraces` hands `raw.trim()` to the loop, so a class member lost a U+00A0 indent that the jar keeps (`addFieldOrMethod(s.getString())`, CommandCreateClassMultilines.java:311-316, then `String#trim`, Member.java:127-128). Members are now parsed from `state.currentRawLine` with `javaTrim`; the row is 0 diffs.
- **Impact**: other class-engine paths still read the JS-trimmed `line` (object fields, inline `class A { x }` members); a U+00A0 there may still diverge.
- **Confidence**: High for the body path; the others are untested.

## Observation: the Write tool turns \uXXXX escapes into literal characters
- **Context**: writing tests containing `'\u00A0'`, `'\u2003'`.
- **Finding**: the file on disk held the literal character, not the escape (an NBSP even ended up inside a doc comment). `LC_ALL=C grep -n '[^ -~]' <file>` finds them.
- **Impact**: check every written file for non-ASCII before committing a test that depends on an escape.
- **Confidence**: High

## Observation: class ratchet eligibility fails on mugobo-34-fede498 at c15e88523
- **Context**: running `class.golden.ratchet.test.ts`.
- **Finding**: `parity-class.json` lists `mugobo-34-fede498` with `dotEqual: false` while the svg-class ratchet manifest pins it; the eligibility test is a pure manifest check (no render), so it fails independently of any source change.
- **Impact**: the re-pin branch needs that row unpinned or its parity entry refreshed.
- **Confidence**: High
