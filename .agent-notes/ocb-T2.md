## Observation: `transform`'s `%s` is JS `\s`, and the jar's is not
- **Context**: Porting `CommandCreateClass`'s empty body tail `[%s]*\{[%s]*\}` (issue #223, class-oneline-body T2).
- **Finding**: `src/core/regex/Pattern2.ts#transform` expands `%s` to `\s `, which in JS also matches U+2000-U+200A, U+2028/9, U+3000 and U+FEFF. Java's `\s` (no UNICODE_CHARACTER_CLASS) is `[ \t\n\x0B\f\r]`. The jar refuses `class A {U+2003}`; a `transform`-built pattern would draw it. The brace tail therefore spells `%s` as `[ \t\n\x0B\f\r ]` (`JAVA_S`, `class-declaration-extractors.ts`), as `listsprite-common-commands.ts:32` already does.
- **Impact**: any new grammar where a Unicode space changes the match outcome needs the Java spelling, not `compileUpstream`/`transform`. Fixture: `tests/fixtures/class-oneline-body/ocb-empty-emspace`.
- **Confidence**: High (jar oracle and stock check, `status=ERROR lineNumber=2`).

## Observation: the error-page width follows the version line when no Welcome block is drawn
- **Context**: Pinning error rows under the mission's D3 bar (only the version text and the `[From]` box are exempt).
- **Finding**: A source of 5 or more lines draws no Welcome block (`PSystemError#getTotalLineCountLessThan5`). The version line is then the widest text, so `svg/@width` and `viewBox` differ by 26px (ours 345.975 wide, the jar's 371.25). Rows with the Welcome block are unaffected. #283 (needs-ruling) asks whether the footer exemption covers this.
- **Impact**: any authored error row with 5 or more lines fails a footer-only bar until #283 is ruled on; expect 7 diffs, not 5.
- **Confidence**: High.

## Observation: rule 9 (allowmixing) and description rule 14 are catch-alls wider than upstream
- **Context**: T2b sibling triage.
- **Finding**: Class rule 9 (`class-descriptive-leaf-command.ts`, `^(?:mix_)?(LEAF)\s+\S`) took any rest, including a `{…}` tail that `CommandCreateElementFull2` (`java:120-124`) has no leaf for; it now declines a brace tail. Description `KEYWORD_RE` (`parse-helpers.ts:414`) still takes any rest, so `circle Z { a }` draws a leaf named `Z { a }` where the jar refuses (#284).
- **Impact**: once the class engine declines a line, the description catch-all may claim it. Check engine selection when narrowing a class gate.
- **Confidence**: High (traced in `description/parser.ts` dispatch, tracing removed).
