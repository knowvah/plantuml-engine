# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Port file for file at `src/diagrams/regex/`, importing the tiles from `src/diagrams/ebnf/`
`CLAUDE.md`: "Upstream architecture is authoritative" and "Preserve upstream names". `regexdiagram/` has 10 files
(1,317 lines), 9 to port (`package-info.java` is not): `ReTokenType`, `ReToken`, `RegexParsingException`,
`GroupSplitter`, `RegexExpression`, `ShuntingYard`, `PSystemRegex`, `CommandRegexfSingleLine`, `PSystemRegexFactory`.
`src/diagrams/regex/` mirrors it flat. `PSystemRegex.java` imports 12 classes from `ebnf/` (`ETile`, `ETileAlternation`,
`ETileBox`, `ETileConcatenation`, `ETileLookAheadOrBehind`, `ETileNamedGroup`, `ETileOneOrMore`, `ETileOptional2`,
`ETileRegexGroup`, `ETileRegexGroupAllBut`, `ETileZeroOrMore`, `Symbol`). eep ported all of them (eep D4) and tested the
five regex-only ones against cached regex rows (`tests/unit/ebnf/regex-tiles.test.ts`), so regex imports them from
`src/diagrams/ebnf/`. `tests/architecture/layering.test.ts` gains `{ from: 'src/diagrams/regex/', to:
'src/diagrams/ebnf/' }` with a `why` citing `PSystemRegex.java`'s imports, the way eep's `ebnf/` → `activity/ftile/`
entry reads. The regex `ShuntingYard` is its own class (`regexdiagram/ShuntingYard.java`), not ebnf's.
**Evidence:** `wc -l regexdiagram/*.java`; the `import net.sourceforge.plantuml.ebnf.*` lines of `PSystemRegex.java`.
**Rejected:** a `src/core/railroad/` IR (eep D1: upstream has none); copying the tiles into `regex/` (a second copy
drifts, and upstream shares them).

### D2 — Substrate: ebnf's plugin shape, with per-engine dispatch copies
`PSystemRegex extends TitledDiagram` (`PSystemRegex.java:80`), as `PSystemEbnf` does in `src/diagrams/ebnf/PSystemEbnf.ts`.
`index.ts` mirrors `ebnf/index.ts` with `REGEX` and the style name `regex` (`DiagramType.java:283-284`;
`src/core/svek/diagram-type-style-name.ts:27` already has `REGEX: 'regex'`). The factory follows
`ebnf/PSystemEbnfFactory.ts`: `CommonCommands.addCommonCommands1` then `CommandRegexfSingleLine`
(`PSystemRegexFactory.java:56-60`), inside `ProtectedCommand` (`AbstractDiagram.java:173-180`). Its own copies of
`ebnf-common-commands.ts`, `ebnf-skin-param.ts` and `ebnf-style-dispatch.ts` become `regex-common-commands.ts`,
`regex-skin-param.ts` and `regex-style-dispatch.ts`, as eep D2 copied activity-legacy's and every engine in this repo
keeps its own (`grep -rln addCommonCommands1 src`). The two commented-out registrations (`CommandUseDescriptiveNames`,
`CommandLanguage`, `PSystemRegexFactory.java:58-59`) are not registered; a comment quotes them.
**Rejected:** importing ebnf's helper modules (they are typed on `PSystemEbnf`) or extracting a shared
`CommonCommands` into `src/core/`: "do not refactor while porting".
**Clarified 2026-11-10 (T2a, execution):** `regex-skin-param.ts` re-exports ebnf's `SkinParam` class instead of
copying it. Every tile D1 imports types its parameter as `ebnf-skin-param.ts#SkinParam`, a class with private fields,
which TypeScript compares nominally: a copy is not assignable, and D13 forbids retyping the tiles without a regex row.
The rejection above covers modules typed on `PSystemEbnf`; `ebnf-skin-param.ts` is typed on no diagram, and upstream
hands both engines the same `skin/SkinParam`. The other two copies (common commands, style dispatch) stay copies.

### D3 — Tile style is frozen in the constructor from `skin` and `<style>` only
`PSystemRegex`'s constructor runs `new StyleExtractor(source.iterator2())`, `applyStyles(skinParam)`, and only then
merges `ETile.getStyleSignature()` into `this.style`, `fontConfiguration`, `colorSet` and `lineColor`
(`PSystemRegex.java:82-97`). Every tile is built from those fields, before any `skinparam` command has run. Probes:
`cov-skinparam` (`skinparam defaultFontColor red`, `defaultFontSize 18`, `backgroundColor yellow`) draws black 14 px
text on a yellow document; `cov-style-regex` (`regex { LineColor red; FontColor blue; FontSize 16; BackGroundColor
yellow }`) changes only the document background (the tiles' signature is `root, element, ebnf`); `cov-style-element`
(`element { LineColor green }`) turns every stroke `#008000`; `cov-theme` (`!theme cerulean`) reaches the tiles
(`#2683B9`, white 14.583 px text). So: `StyleExtractor` collects every `<style>` block wherever it sits
(`StyleExtractor.java:69-75`) and the `skin` line, and `applyStyles` mutes them into the builder
(`StyleExtractor.java:114-138`); `skinparam` lines reach only what is read later from `getSkinParam()` (the document
background, the handwritten warning). T2a ports this order: import `StyleExtractor` from
`src/diagrams/json/StyleExtractor.ts` (`PSystemRegex.java` imports `jsondiagram.StyleExtractor`), with a second
layering entry `src/diagrams/regex/` → `src/diagrams/json/`; where `applyStyles` has no port at that home, add it
there, keeping the json family's call sites unchanged. How a `!theme`'s inlined `<style>` and `skinparam` lines reach
our preprocessor's `styleSource` is T2a's to read and journal; `cov-theme` is the oracle.
**Not extended:** the "honour ignored styling" carve-out covers json/yaml/hcl/files only, and its memory says "do not
extend the carve-out to other engines without asking". Regex mirrors the jar's freeze; no issue is filed for it.
**Rejected:** building tile style from the full skinparam map (`cov-skinparam` shows the jar ignores it).

### D4 — Mirror upstream's quirks
Port each as the jar does it, with a one-line comment quoting the Java:
- every source line is its own `addBlocLines` call on one shared `stack`, and `getTextBlock` draws only
  `stack.peekFirst()` (`PSystemRegex.java:113`): `cov-multi-line` (`abc` then `x|y`) draws only `x|y`, 96 × 89; the
  commented-out `while (stack.size() > 1) concatenation()` stays a comment;
- an empty stack reaches `peekFirst.calculateDimension` and throws a `NullPointerException` outside any command
  (`cov-title-only`, a Java crash page): we throw and render our error page (D5);
- `codoju-71-buko966`'s `language de` and `useDescriptiveNames true` are regex lines, not options: the commands are
  commented out (`PSystemRegexFactory.java:58-59`);
- `readQuantifier` accepts a trailing `?` and then rejects every braced form that has one, since
  `^\{[0-9,]+\}$` does not match `{2,3}?` (`RegexExpression.java:244-265`; `cov-lazy`: `Bad quantifier {2,3}?`);
  `+?`, `*?` and `??` pass;
- `parseBracedMin`/`parseBracedMax` return `-1` on a `NumberFormatException` (`{1,2,3}`, an `int` overflow) and `0`
  for an empty minimum (`{,5}`) (`PSystemRegex.java:269-305`);
- `isStartNamedCapturingGroup` answers false without a closing `>` or with a non-letter, so `(?<abc` and `(?<>a)` fall
  to `readOpenParenthesis` and their `?` empties the stack (`cov-unclosed-named`, `cov-named-empty`:
  `NoSuchElementException`), and `Unclosed named capturing group` is unreachable from `parse`; keep it;
- `skipComment` builds a `comment` it never reads; `ShuntingYard`'s `first` is unread; `isSimpleLetter`'s fall-through
  `throw new IllegalStateException()` (`RegexExpression.java:107`) is unreachable after `isStartClass`; keep all three;
- `concatenation`'s commented-out `arg2 instanceof ETileConcatenation` branch ("This does not work for (A[B])(C)",
  `PSystemRegex.java:344`) stays a comment; `xovema-14-refe049` is that source;
- `getDescription()` is `(Regular Expression)` (`PSystemRegex.java:99-101`).
**Rejected:** tidying any of them: no forcing library, so an unruled divergence.

### D5 — Errors mirror the jar's, not its page
Four kinds, each probed:
1. Empty `@startregex`: the Welcome page through the dispatcher's empty-description path (`cov-empty`), as eep D13.
2. A `RegexParsingException` is `CommandExecutionResult.error("Error parsing: " + message)` at its line
   (`PSystemRegex.java:172-174`): `Bad quantifier …` (`cov-bad-quantifier`, `cov-lazy`), `Unclosed comment`,
   `Unexpected end of data` (`cov-escape-truncated`, `cov-unicode-unclosed`), and a token left in the output queue
   (`cov-unbalanced-open`: `PARENTHESIS_OPEN[(]`, `ReToken#toString`).
3. Any other throw inside the command is `ProtectedCommand`'s message (`cov-underflow-star`, `cov-underflow-alt`,
   `cov-unbalanced-close`, `cov-unclosed-named`, `cov-named-empty`: `NoSuchElementException` from `removeFirst` on
   an empty deque; `cov-posix-all`: `IllegalStateException` from `CharInspectorImpl#jump` past the end). The port's
   deque must throw where Java's `ArrayDeque#removeFirst` does, not return `undefined`.
4. A throw outside commands (`cov-title-only`): a crash page in the jar, our error page here.
Per `.claude/memory/error-page-conformance-rule.md`, matching an error page's text or geometry is not a target;
`fixtures.mts` counts a jar error page against ours as `error-pair`.

### D6 — Fixtures: the 46 cached rows, the 38 planning probes, then authored probes
Upstream ships no regex fixture beyond `DiagramTypeTest.java`, so `CLAUDE.md`'s "author `.puml` fixtures" applies. The
38 probes in `probes/` are the floor (26 draw `REGEX`, `cov-embedded` draws a `SEQUENCE`, 12 are jar error pages).
T3b adds what they miss: each chrome element alone and with `scale 2`; a mainframe; `!theme` on a second stdlib theme;
`skinparam monochrome true` and `skinparam handwritten true`; `<style>` `element` with `FontName`, `FontColor`,
`LineThickness`, `Shadowing`, `RoundCorner`, `BackGroundColor`; braced `{,5}`, `{,}`, `{1,2,3}`, `{99999999999}`,
`{12` with no `}`, `{}`; a quantifier on a lookahead and on a named group; alternation inside a lookbehind; groups
`[]`, `[^]`, `[a-]`, `[-a]`, `[\]]`, `[[:alpha:]x]`; `\Q…\E`, `\x{1F600}`, `\p{IsLatin}`; creole-looking text
(`**a**`, `<b>x</b>`) as literal characters; a blank line between two regex lines; a line `titlex`; every
`useDescriptiveNames` key in `ETileBox`'s `VALUE_MAP` under `de` and `zh-CN`; `{{regex}}` in a class note.
**Rejected:** stopping at the 46 rows: they reach one error kind (`Bad quantifier`), one chrome element (`title`), no `scale`,
no `<style>`, no `skinparam` and no multi-line source.

### D7 — Ratchet: `svg-regex`, laid out like `svg-ebnf`
Regex has its own corpus bucket, so goldens go flat under `oracle/goldens/svg-regex/<slug>/` with `ratchet.json`
entries `{ slug, addedAt, source: 'dot-cache' }` (`measurements/pin-regex.mts`). Copy `ebnf.golden.ratchet.test.ts`,
`ebnf.diff-baseline.ratchet.test.ts` and `render-fixture-ebnf.ts` with `regex` substituted, reading
`tests/fixtures/regex` for authored rows. No DOT eligibility: regex has no svek stage. T4 re-pins the 44
`known-misroute` routing rows `agree`, `ourType: REGEX`, and the refusal rows' `engine`, moving the count assertions by
exactly the rows moved; the two jar-error rows (D8) are pinned by score in `diff-baseline.json`.

### D8 — What ends a row, and `bakuza`/`tajefa`
In order: conformant; a jar error page where we also error (ruling 2026-10-10, `docs/svg-conformance.md`); a named
divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a
"Blocked by" line added to #136. **No row ends unnamed.** Planning found no forcing library: regex never reaches
graphviz, Smetana, KaTeX or the `{{ }}` oracle seam on its own.

**`bakuza-41-bulo451` and `tajefa-31-pefi801`.** Both are signed "jar errors, we draw" entries in
`oracle/accepted-divergences.json`; the jar's line 2 is `Error parsing: Bad quantifier {([^{}`
(`stock-error-pages.json`). Once T3a registers the engine, `readQuantifier` raises the same `RegexParsingException`
here, so we error where the jar does, the survey prints both conformant, and
`tests/oracle/svg-conformance/emitter.golden.test.ts` goes red until the entries move to `retired`. nwp (#165) and eep
(#166) met the same case. Do what they did: move both entries to `retired` with `retiredBy: "regex-engine-port T3a,
unsigned: the maintainer signs at review (#126)"`, and open **one** `needs-ruling` issue that names both rows, what
the jar and the port now draw, the gate that forced the move, how to undo it, and links #110 (item 5), #165 and #166.
The issue asks for exactly this and says "don't let them block it", so it is not a stop. **Never add or change an
acceptance, and never re-sign.** `DIVERGENCES.md:1973` is rewritten at T5.
**Rejected:** leaving both entries in force and the gate red (halts against the issue's instruction); re-signing them
(reserved for the maintainer).

### D9 — Collection and character semantics
`stack` and `operatorStack` are `ArrayDeque`s used as stacks (`addFirst`/`removeFirst`/`peekFirst`); every other
collection is an `ArrayList`; no output depends on hash order. `CharInspector#peek` returns a UTF-16 unit, as Java's
`char`: a non-BMP character is two `SIMPLE_CHAR` tokens that `mergeWith` joins into one box (`cov-unicode-text`).
`Character.isLetter(char)` (`RegexExpression.java:152`, `GroupSplitter.java:55`) is `/\p{L}/u` on one unit (false on
a lone surrogate). `String.matches` is an anchored test. `Integer.parseInt` throws past `2147483647` and on a sign or
empty string, as the ebnf factory's `INT_MAX` check does.

### D10 — Serial, main checkout, one commit per task
The batches build one engine upward; worktrees need symlinked assets and skip git hooks
(`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced until
T3a, so `npm test` stays green through batches 1 and 2. **Rejected:** parallel worktrees (two tasks would share
`PSystemRegex.ts`), and one big commit (the journal cites per-task commits through `pre-squash`).

### D11 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters. `RegexExpression.parse` is a 20-branch
`if` chain and `PSystemRegex#addBlocLines` a 16-branch one. Break them into named helpers that keep the Java method's
name on the entry point, with `@see` on each; a table may replace a branch chain only if every branch keeps its order
and Java line in a comment, because order decides (`isStartAnchor` before `isEscapedChar`, `isStartPosixGroup` before
`[`, the octal and unicode escapes before `isStartClass`). `ETileRegexGroup`'s five-argument constructor fits.
Files written through the shell skip the hook: run `lizard` by hand (`.claude/memory/cep-status.md`).

### D12 — `{{regex}}` goes through the existing embedded path
`EmbeddedDiagram.ts:297` already maps the `regex` keyword. Once T3a adds `'regex'` to `block-extractor.ts`, the
embedded path reaches the new plugin as `{{ebnf}}` reached eep's; `cov-embedded` (a sequence note, 361 × 233) is the
oracle. A difference there is T3c's.

### D13 — Use the ported seams, change nothing in `src/diagrams/ebnf/` without a regex row
`CharInspector`/`CharInspectorImpl`/`BlocLines#inspector` (`src/core/utils/`), `I18n`, `ETileBox`'s `ETileBoxArgs`
(seven Java arguments, `ETileBox.java:96-97`), `ETileBox#mergeWith`/`getSymbol`, `ETileConcatenation#getFirst`/
`overideFirst` all exist. A tile edit is allowed only with a regex row or probe that shows the difference and the Java
quote, and must keep `svg-ebnf` at 0 diffs (its ratchet runs in `npm test`).

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated; the `regex` note in `scripts/parity-dashboard-notes.ts` (`notBuilt` today) is rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit; restore the two entries from `retired` if the maintainer says so (D8). No migration. |
| Scale | Each line is a tile tree linear in its token count; the longest row (`zobaxa-88-gedu220`) is one ~1,500-character line. The ratchet grows by up to 44 golden rows plus the authored count; routing and refusal gain 44 golden twins each. T5 names the CI risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. A tile edit moves an `svg-ebnf` row: its ratchet names it. Routing count assertions moved by the wrong number. The deque returning `undefined` where Java throws (D5). |
| Compatibility | No public API change; `dist/*.d.ts` identical, checked at T5. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |

## Baseline

Measured on `e19963225`, 2026-11-10, at planning. Committed `parity-*.json`: `regex` 0 / 0 / 46 (44 first diff
`svg/@background`, 2 `error-page`); overall 5,468 conformant of 5,927 (eep's close). Local `dot -V`:
`16.1.0 (20260904.0139)`.

**Phase 8, 2026-11-10 14:45-14:57, on `e19963225`, load average 10-18 (outside processes): green.**
`npm test -- --maxWorkers=4` **exit 0**: 44,316 passed, 0 failed, 4 expected fail, 7 skipped, 6 todo, in 2,111 files
(2,110 passed, 1 skipped), 541.80 s; coverage 97.14 / 92.84 / 97.84 / 98.14 (statements / branches / functions /
lines). `npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` (with this brief in the tree)
exit 0. **This green run is the baseline.** The working tree held only this brief and the planning progress file.
