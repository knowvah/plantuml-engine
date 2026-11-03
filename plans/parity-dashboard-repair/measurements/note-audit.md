# Note audit — `scripts/parity-dashboard-notes.ts` against the 2026-11-03 numbers (pdg-T5)

One row per `ROW_NOTES` entry and class text, plus the preamble claims T5 names.
Evidence is a command and its output on the T4 tree (`59a78915c`), jar output, or a
`file:line` quote. Verdict: **holds** or **corrected** (the new sentence is in the
notes file). Census families come from `npx tsx scripts/svg-conformance-census.ts <type>
--families`; survey first-diff tallies from `tests/oracle/svg-conformance/parity-<type>.json`.

## Row notes

| row | claim | evidence | verdict |
|---|---|---|---|
| json, yaml, hcl | class `smetana` (laid out by Smetana upstream, dot-engine here) | `DIVERGENCES.md:17` "Smetana-backed diagram types — laid out by dot-engine, geometry differs"; `:25` names `jsondiagram/SmetanaForJson.java`; CLAUDE.md "One layout engine" | holds |
| ditaa | no engine; PlantUML writes a PNG even when asked for SVG | `xxd -l 8 test-results/dot-cache/ditaa/*/in.svg` → `8950 4e47 0d0a 1a0a` (`.PNG....`) for both fixtures; survey verdict `oracle-error: cached in.svg not well-formed XML` on both | holds |
| ebnf, regex, timing, wire | class `notBuilt` | `src/registered-plugins.ts` registers no ebnf/regex/timing/wire plugin (33 registrations, listed in the T3 journal); survey: ebnf 44 diverged, regex 46, timing 120 diverged + 6 error-page conformant, wire 18 — every `firstDiff` is `svg/@background` (our error page against the jar's diagram) | holds |
| network | keyword-filled, no nwdiag; 1 description (conformant) + 2 legacy `(*) -->` activity we do not parse; real nwdiag under `unknown` | jar tags: `denevo-18` DESCRIPTION, `janezo-95` and `rozemi-46` ACTIVITY; `grep -cE '^\(\*\)\|-->'` = 1 on each activity source, 0 on the description one; survey: denevo conformant, the two activity rows diverged; `routing-baseline.json`: both `ourType: NONE, known-misroute`; `refusal-baseline.json`: both `weErrored: true, known-gap`; `grep -l 'data-diagram-type="NWDIAG"' test-results/dot-cache/unknown/*/in.svg \| wc -l` = 64 | holds |
| board | fill `#D3D3D3` vs `#C0C0C0`; text placement and canvas size differ | render of `gasaxu-65` via `renderSync`: ours `fill="#D3D3D3"` 1550×380px, jar `fill="#C0C0C0"` 1562×373px; census families reach all 4 fixtures: `svg/g/rect/@fill` 61, `svg/g/text/@y` 61, `@dominant-baseline` 61, `@textLength` 61, `svg/@width` `@height` `@viewBox` 4 each; survey `firstDiff` `svg/g[1]/rect[1]/@fill` on all 4 | holds |
| c4 | drawn by the description engine; first difference is usually a boundary box's corner rounding | `parity-dashboard-matrix.ts` `ENGINE_OVERRIDE.c4 = 'description'`; survey `firstDiff`: `rect[1]/@rx` on 6 of the 9 diverged rows, `filter[1]/@id` 1, `path/@stroke-dasharray` 1, `error-page` 1 (`gikaju-64`, see pdg-T5 notes) | holds |
| chart | "line styling, text anchoring and canvas size differ" | census families reach all 29: `svg/g/line/@x1 @x2 @y1 @y2` 437 each (positions), `text/@text-anchor @x @y @font-size` 302, `@dominant-baseline` 287, `svg/@width @height @viewBox` 29; survey `firstDiff`: `line/@stroke-width` 15, `line/@stroke` 12, `text/@dominant-baseline` 2 | corrected: lines sit at other coordinates with other stroke styling; text anchored and sized differently; canvas differs |
| component | mostly stroke, fill and path differences; four LaTeX fixtures, KaTeX vs JLaTeXMath, permanent | census families: `path/@d` 15 fixtures / 299 diffs, `path/@stroke` 14, `g[childCount]` 13, `polygon/@stroke` 13, `polygon/@fill` 11, `text/@fill` 10; `grep -lE '<latex>\|<math>' test-results/dot-cache/component/*/in.puml` = 4 (`gevozu-46`, `kezodo-14`, `sunuju-01`, `vimulo-11`), all `structural-match`; `DIVERGENCES.md:280` "LaTeX rendering engine — KaTeX, not JLaTeXMath (permanent)" | holds |
| object | "mostly small fill and text-width differences" | census families (16 non-conformant rows): `svg/@viewBox` 10, `svg/@width` 9, `text/@y` 9 / 55, `rect/@height` 7, `svg/@height` 6, `rect/@width` 6, `path/@d` 6 / 165, `line/@y1 @y2` 6; survey `firstDiff`: 8 structural (none), `@fill` 2, `@textLength` 2 — fill is a minority | corrected: mostly geometry (canvas size, text y, box heights, path data) |
| packet | text anchored with `textLength`; jar draws `<path>` where we draw `<line>` | `packet-tcp-header`: jar `<path>` 17, `<line>` 0, `textLength` 16; ours `<path>` 0, `<line>` 17, `textLength` 0; census families reach all 6: `text/@text-anchor @x @y` 53, `svg/g/line` 94 (element-level), `text/@textLength` 36; survey `firstDiff` `text[1]/@text-anchor` on all 6 | holds |
| state | layout matches on most fixtures; largest groups: element ids, text widths, path data, classes | `layoutEqual`: true 253, false 16, n/a 4 (of 273); census families: `path/@id` 63 fixtures, `text/@x` 54, `text/@textLength` 47, `text/@y` 47, `g[childCount]` 46, `path/@d` 45 / 1584, `g/@id` 35; survey `firstDiff`: `@id` 51, `@textLength` 18, `@class` 16, `childCount` 14 — classes are a survey first-diff, not a census-wide group | corrected: adds the 253/269 figure; groups now ids, text positions and widths, child counts, path data |
| usecase | "mostly fill, text-size and structure"; one malformed oracle | census families: `text/@x` 12 / 130, `svg/@viewBox` 10, `text/@y` 9, `g[childCount]` 8, `svg/@width` 8, `path/@d` 6, `@textLength` 6; `@fill` only 3; survey: `fepuvo-06-rugi981` `oracle-error: cached in.svg not well-formed XML: 9682B` (the one row) | corrected: text position, canvas size, path data and structure |
| unknown | generated (D4) | `unknownDetail` over `parity-unknown.json` + cached `data-diagram-type`: 253 = 102 drawn / 96 no engine / 49 untagged / 6 declined; the test asserts total = structural + diverged on disk | holds (generated) |
| chronology | class `jarDeclines` | matrix row reads `n/a (plantuml-ts only)`: the one cached `in.svg` is `PSystemUnsupported`'s page (`isJarUnsupportedPage`) | holds |
| activity | (was) "one structural match is an older reading; survey measures all 449 conformant" | T4 survey `449 / 0 / 0 (14 error)`; the row carries no mark, so the entry was dead | corrected: entry deleted |

## Class texts and shared sentences

| text | claim | evidence | verdict |
|---|---|---|---|
| `smetana` | Smetana = PlantUML's Java translation of Graphviz 2.38; dot-engine follows current Graphviz; elements/labels/colours/structure match, routing and spacing differ | `DIVERGENCES.md:17,72-74` ("graphviz 2.38 (Smetana) vs modern graphviz arithmetic", dot-engine 16.1.0 column); json survey 14 / 35 / 1: 35 structural matches against 1 diverged | holds |
| `notBuilt` | no engine, fixtures get an error page | every no-engine row's `firstDiff` is `svg/@background` (our error page's root attributes against the jar's drawing); refusal rows `weErrored: true` | holds |
| `openDefect` | an engine exists; remaining differences are bugs, no library forces them | each `openDefect` row above has a registered engine (`engineCell`); the one library-forced part (component's LaTeX, KaTeX) is named in the row's own sentence | holds (with the component caveat already stated) |
| `mixed` | sources the classifier could not assign; causes differ | the generated sentence lists 4 causes with 14 jar tags | holds |
| `jarDeclines` | jar answers "Diagram not supported by this release" while we draw | `parity-dashboard-inputs.ts` `JAR_UNSUPPORTED_PAGE_RE`, `PSystemUnsupported.java:62` cited there; chronology oracle count 1 = unsupported count 1 | holds |
| `ERROR_SUFFIX_NOTE` | `(N error)` rows are conformant: both sides draw an error page | over all 29 survey files: 96 rows carry `errorPage: true`, 0 of them non-conformant | holds |

## Preamble and Freshness

| claim | evidence | verdict |
|---|---|---|
| "the ratchet and census render through the low-level `renderFixture*` helpers" | entry points: `render-fixture-class.ts:194-195` (`renderClassFixture` → `renderSync`), `render-fixture.ts:52` (description via `renderFixtureSurveyStyle` → `renderSync`), `render-fixture-gantt.ts:66`, `-mindmap.ts:59`, `-salt.ts:64`, `-wbs.ts:55`, `-files.ts:58`, `-utility.ts:96` all `renderSync`; low-level: `render-fixture-class.ts:113-117` (`renderFixtureClass`, used for object), `-state.ts:65-66`, `-sequence.ts:162-174`, `-activity.ts:147-150`, `-json.ts:55,118` | corrected: names both groups |
| class ratchet/census exceed class's oracle (723) because they include the CLASS-routed `unknown` rows | `census-class.json` trees: `class` 723 + `unknown` 287 = 1010; ratchet 1003 pins | added |
| which Freshness dates are measurements vs pins (D5) | DOT/survey/census files carry `generatedAt` written at regeneration; ratchet `addedAt`, diff-baseline/routing/refusal `measuredAt` are written at pin time (`parity-dashboard-goldens.ts`) | added |
