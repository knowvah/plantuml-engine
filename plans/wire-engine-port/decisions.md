# Decisions

All recorded unattended; the user audits them here.

## Auto-confirmed (unattended)

### D1 — Port file for file at `src/diagrams/wire/`; `Block.java` and `WCursor.java` are not ported
`CLAUDE.md`: "Upstream architecture is authoritative" and "Preserve upstream names". `wire/` has 20 Java files (2,216
lines). `src/diagrams/wire/` mirrors it flat, and 17 are ported: `WArrowDirection`, `WLinkType`, `WOrientation`, `Spot`,
`WPrint`, `WBlock`, `WLinkHorizontal`, `WLinkVertical`, `WireDiagram`, `WireDiagramFactory`, and the seven `Command*`
classes (`package-info.java` and `readme.md` have no code).

**`Block.java` (214 lines) and `WCursor.java` (53) are not ported.** Nothing references either class anywhere in
upstream: `grep -rnE "\bWCursor\b" src/main src/test` finds only its own file; `grep -rn "wire\.Block" src/main src/test`
finds only prose (`wire/readme.md:4,7`, `package-info.java:4`, "Wire or Block Diagram"), and inside `wire/` the only
`Block` type used is `WBlock`. `WireDiagram` uses `WBlock` (`WireDiagram.java:59`). No source can reach
them, so no jar oracle could verify a port: a test would only assert our reading of the Java. **This is the one
scope call a reviewer may want to reverse;** adding them later is a self-contained task. T1a records the two greps in
the journal so the call stays auditable.

`planning/mission-guide.md:147,154-156` speculates that wire may reuse `golem/`; `wire/` imports nothing from `golem`. T5
corrects the guide. The issue's "Phase 5l" has no section there, only that mention.
**Rejected:** porting the two classes with synthetic tests (unverifiable and shipped in the bundle for nothing); a
single-file engine (upstream's seams are the spec).

### D2 — Substrate: regex's plugin shape, with per-engine dispatch copies
`WireDiagram extends TitledDiagram` (`WireDiagram.java:57`), as `PSystemRegex` does. `index.ts` mirrors
`src/diagrams/regex/index.ts` with `WIRE`. `WireDiagramFactory` follows `PSystemRegexFactory.ts`:
`CommonCommands.addCommonCommands1` and then, in order, `CommandComponent`, `CommandSpot`, `CommandGoto`, `CommandMove`,
`CommandWLink`, `CommandNewColumn`, `CommandPrint` (`WireDiagramFactory.java:56-65`). Order decides:
`CommandNewColumn` is `-+`, and every engine keeps its own copy of the dispatch helpers (`grep -rln addCommonCommands1
src`), so `wire-common-commands.ts`, `wire-skin-param.ts` and `wire-style-dispatch.ts` copy `timing`'s or `regex`'s.

Seams, one row each: `src/core/block-extractor.ts` (`'wire'` in `DiagramType`, the start-tag map, and `PORT_TO_UPSTREAM`
as `UpstreamDiagramType.WIRE`); `src/registered-plugins.ts` (`registry.register(wirePlugin); // java:189`, between
`timingPlugin`'s java:187 and `jsonPlugin`'s java:190, after the `HelpFactory` slot); `src/core/assemble-svg.ts`
(`DIAGRAM_TYPE_WIRE` on the titled path beside `DIAGRAM_TYPE_REGEX`, near :326-329). `src/core/document-back-color.ts`
needs **no** row: `WIRE` has no branch in `DiagramType#getStyleName`, whose final line is `return SName.activityDiagram` (`DiagramType.java:295`),
which `document-back-color.ts:58-59` already mirrors as `STYLE_NAME_OTHERWISE`. `cov-style` shows `root { BackGroundColor }` reaching the document. `EmbeddedDiagram.ts:300` already maps `wire`.
**Rejected:** importing another engine's helpers (`tests/architecture/layering.test.ts`) or extracting a shared
`CommonCommands` ("do not refactor while porting").

### D3 — `print` measures with AWT, always, whatever measurer the render carries
`WireDiagram.java:133`: `final StringBounder stringBounder = FileFormat.PNG.getDefaultStringBounder();`. The oracle's
deterministic seam covers only SVG: `FileFormat.java:185-186`, `System.getProperty("PLANTUML_DETERMINISTIC_TEXT") != null
&& (this == SVG || this == SVG_DETERMINISTIC)`. PNG falls through to `new StringBounderAwt()` (`FileFormat.java:272`). So
the cursor advance after a `print` is a real AWT line height even under the deterministic flag, while the text's own
`textLength` and the drawn glyph box come from the table.

Evidence: `migaki-17-jori275` prints `This is me10` at `y=147.778` and `This is me20` at `y=159.555`, a step of **11.777**;
the table's height at 10 pt is 10 (the `<rect height="10">` under every 10 pt label). `jarMeasurer.measure('x',
{size: 10}).height` is **11.777344** (planning, 2026-11-10), and `jarMeasurer` is this repo's AWT reproduction
(`src/core/measurer-jar.ts:96`, D12 of the dual-measurer journal).

So `WireDiagram#print` builds `new MeasurerStringBounder(jarMeasurer)` and passes it to `WBlock#print`, in every render,
never the injected measurer, with a comment quoting `WireDiagram.java:133` and `FileFormat.java:185-186`. Everything else
measures with the render's measurer, as the Java does through `ug.getStringBounder()`. `cov-print-multiline`,
`cov-print-size` and `cov-print-creole` are the oracles for a block taller than one line.
**Rejected:** the injected measurer (`migaki` drifts 1.777 px per print); a fitted 11.777 constant (`CLAUDE.md`: never fit
a value; the seam already exists); a new divergence (no library forces one).

### D4 — Mirror upstream's quirks
Port each as the jar does it, with a one-line comment quoting the Java:
- **The root draws a stray text.** `WBlock#drawMe` runs for the root too; its name is `""`, `Display.create("")`
  yields one empty line, and the jar writes `<text x="15" y="19.333" fill="#000" font-size="12"> </text>` (no
  `textLength`) after everything the root contains, in every drawn row.
- **`Spot`s, `hlinks` and `vlinks` draw in that order, after the block tree** (`WireDiagram#drawMe`).
- **`WLinkVertical` never draws its label**: `getTextBlock()` exists and `drawMe` does not call it (`cov-vlinks-all`).
- **`WOrientation`:** `--`/`==` anywhere in the style is vertical, so `<=>` is horizontal and `<==>` vertical.
- **`WLinkType`:** `-` wins over `=` (`WLinkType.java`), and `CommandWLink`'s style regex is
  `(\<?[-=]{1,2}\>|\<?[-=]{1,2})`, so `a ---> b` is a syntax error (`cov-link-bad-style`).
- **`computeIndentationLevel`:** `indent.replace("    ", "\t").length()`. Two spaces are level **2**, four are level
  1, a tab is level 1 (`cov-indent-2-spaces` crashes, `cov-indent-4-spaces` and `cov-indent-tab` draw 161×181).
- **`addBlock` checks a duplicate at every level it recurses through**, before descending, so a nested name equal to
  a root name is `Component exists already` (`cov-duplicate-nested-root-name`), while equal names under two different
  parents are fine (`cov-duplicate-sibling-parents`).
- **`getMaxDimension`:** a block with children and a nonzero `forcedWidth` keeps the forced size even when smaller
  (`cov-forced-with-children`); a leaf treats 0 as 100 per axis (`cov-zero-dim`).
- **`newColumn`, `wgoto`, `addBlock` and `print` at a level with no child** dereference `getLastChild()`, which is
  `null`: an NPE in the jar (`cov-indent-too-deep`, `cov-newcolumn-too-deep`, `cov-print-too-deep`, `cov-indent-no-parent`).
  The port keeps `getLastChild(): WBlock | undefined` and a non-null assertion so the same call throws (D5).
- **`getAbsolutePosition` on the root** returns `position` and ignores `supx`/`supy` (`parent == null`).
- **`futureOutHorizontal`/`futureOutVertical`** remember the last link's start, so an explicit `(x,y)` also moves where
  the next link without coordinates starts (`cov-link-stacking`).
- **A reversed link draws negative lengths** and the document grows to the ink, not to the block tree:
  `cov-link-reversed-h` is 366 wide where the same blocks are 361 (`SvgGraphics#ensureVisible`, already in
  `UGraphicSvg`).
- **Labels:** horizontal NORMAL paints a white rectangle under the text (`WLinkHorizontal#drawMe`), BUS does not. Both
  colours come from `getWhite()`, which flips in dark mode. `dimText.getHeight() > 0` skips an empty label.
- **`Spot`** defaults to `HColors.RED` and draws `UEllipse.build(5, 5)` at `-2,-2`.
- **Colours are hard-coded** through `HColors.BLACK.withDark(HColors.WHITE)`; see D13.
- **`addBlock`'s `name.contains(".")` throw** is unreachable through `CommandComponent` (`[\w]+`); keep it with a
  comment.
- `getDescription()` is `Wire Diagram`.
**Rejected:** tidying any of them: no forcing library, so an unruled divergence.

### D5 — Errors mirror the jar's, not its page
Probed kinds (`measurements` below; `error-page` rule, `.claude/memory/error-page-conformance-rule.md`):
1. Empty `@startwire`: the Welcome page through the dispatcher's empty path (`cov-empty`).
2. `Syntax Error?`: `cov-component-no-space-bracket`, `cov-component-nonascii`, `cov-goto-negative` (`goto` is `\d+`,
   unlike `move`'s `-?\d+`), `cov-link-bad-style`, `cov-syntax-error`.
3. `CommandExecutionResult.error`: `No such element <name>` (`cov-link-unknown-{left,right,nested}`, `cov-spot-unknown`),
   `Component exists already` (`cov-duplicate-name`, `cov-duplicate-nested-root-name`).
4. `NoSuchColorException` → `No such color` (`cov-component-bad-colour`, `cov-link-bad-colour`, `cov-spot-bad-colour`).
5. A throw inside a command reaches `ProtectedCommand`'s page: `java.lang.NumberFormatException` from `Integer.parseInt`
   (`cov-component-overflow`), `NullPointerException` (the four D4 rows and `cov-indent-2-spaces`). The port must throw in
   each case rather than return `NaN` or `undefined`: its error page and the jar's then pair as conformant.
Matching an error page's text or geometry is not a target; `fixtures.mts` counts the pair as `error-pair`.

### D6 — Fixtures: the 18 rows, the 72 planning probes, then authored probes
Upstream ships no wire fixture beyond `DiagramTypeTest.java`. The 18 rows reach no chrome, no `scale`, no `<style>`, no
`skinparam`, no error kind and only one `print` row, so `CLAUDE.md`'s "author `.puml` fixtures" applies. The 72 probes in
`probes/` are the floor (50 draw `WIRE`, `cov-embedded` draws a `SEQUENCE`, 21 are jar error or Welcome pages). T3b adds
what they miss: each chrome element alone and with `scale 2`; `skinparam dpi 200`; a second `!theme`; `!option handwritten
true`; a sprite and a creole table inside `print` and inside a link label; `print` with curly quotes (`[%g]`); `goto` and
`move` after `print`; a spot on a forced-with-children block; a `print` in a block taller than its forced height; `'`
and `/' '/` comments and blank lines between commands; a link whose `(x,y)` is on the destination-side form; `--` at
depth two; `{{wire}}` in a class note and a state note.
**Rejected:** stopping at the 18 rows.

### D7 — Ratchet: `svg-wire`, laid out like `svg-regex`
Wire has its own corpus bucket, so goldens go flat under `oracle/goldens/svg-wire/<slug>/` with `ratchet.json` entries
`{ slug, addedAt, source: 'dot-cache' }` (`measurements/pin-wire.mts`). Copy `regex.golden.ratchet.test.ts`,
`regex.diff-baseline.ratchet.test.ts` and `render-fixture-regex.ts` with `wire` substituted, reading
`tests/fixtures/wire` for authored rows. No DOT eligibility: wire has no svek stage (`scripts/dot-parity-rows.ts:75`). T4
re-pins the 18 `known-misroute` routing rows `agree`, `ourType: WIRE`, and the refusal rows' `engine` with
`measurements/repin-routing-refusal.mts`, moving the count assertions by exactly the rows moved.

### D8 — What ends a row
In order: conformant; a jar error page where we also error (ruling 2026-10-10, `docs/svg-conformance.md`); a named
divergence with a forcing library; a `needs-ruling` issue naming the row; a separable `queue:ready` issue with a "Blocked
by" line added to #136. **No row ends unnamed.** Planning found no forcing library: wire never reaches graphviz, Smetana,
KaTeX or the `{{ }}` oracle seam. All 18 rows are drawn by the jar and none appears in `oracle/accepted-divergences.json`
or `stock-error-pages.json`, so no acceptance moves here.

### D9 — Java semantics
- `Integer.parseInt` (width and height): throw past `2147483647`; there is a private `parseJavaInt` in
  `src/core/klimt/sprite/sax/sax-style.ts:256` (returns `undefined`, so wrap it to throw; do not reach across modules
  for a private).
- `Double.parseDouble` on `goto`/`move` and on `parseWidth`/`parseHeight` tokens: only digit forms reach it (the regexes),
  so `Number()` is exact, including `+20` and `-5`.
- `String.replace(CharSequence, CharSequence)` replaces all: `replaceAll('    ', '\t')`, not `replace`.
- `StringTokenizer(value, "%")` gives the two non-empty tokens around `%` (`100%-5` → `100`, `-5`); the regex guarantees
  two.
- `name.replace('_', ' ')` is every occurrence: `replaceAll`.
- `[\w]` is ASCII in Java without `UNICODE_CHARACTER_CLASS` (`cov-component-nonascii`), as in JS.
- `Map`/`List` order: `children`, `spots`, `hlinks`, `vlinks` are insertion-ordered lists.

### D10 — Serial, main checkout, one commit per task
The batches build one engine upward; worktrees need symlinked assets and skip git hooks
(`.claude/memory/agents-write-main-via-serena.md`, `worktrees-skip-git-hooks.md`). New files sit unreferenced until T3a,
so `npm test` stays green through batches 1 and 2. **Rejected:** parallel worktrees (`WireDiagram.ts` is shared), and one
big commit (the journal cites per-task commits through `pre-squash`).

### D11 — Hooks: split by upstream method, keep names
The hooks cap files at 500 lines, functions at 30 NLOC, CCN 10, 5 parameters. `WLinkHorizontal#drawBusArrow` and
`WLinkVertical#drawBusArrow` are four-branch path builders: keep the Java method name on the entry point, and give each
branch a named helper or a table entry with its Java line in a comment. The seven-argument link constructors and
`WireDiagram#vlink`/`hlink` (eight arguments) take one args object, as `ETileBoxArgs` does for `ETileBox`'s seven
(regex D13, `ETileBox.java:96-97`); `WBlock`'s five-argument constructor and `addBlock` fit. Files written through the shell
skip the hook: run `lizard` by hand (`.claude/memory/cep-status.md`).

### D12 — `{{wire}}` goes through the existing embedded path
`EmbeddedDiagram.ts:300` already maps `wire`. Once T3a adds `'wire'` to `block-extractor.ts`, the embedded path reaches
the plugin as `{{regex}}` reached rep's; `cov-embedded` (a sequence note, 206 × 248) is the oracle.

### D13 — Style: the engine reads nothing; only the document and the colour mapper react
Every `HColor` in `wire/` is `HColors.BLACK`/`WHITE` with `withDark`, a user colour, or `RED`; every `UFont` is
`UFontFactory.sansSerif(12)` or `(10)`. No `skinparam` or `<style>` value is read by `wire/`. Probes: `cov-skinparam`
(`backgroundColor yellow`, `defaultFontColor red`, `defaultFontSize 18`, `ArrowColor green`) changes only the document
background; `cov-style`'s `root { FontColor; LineColor }` and an unknown `wireDiagram` block change nothing but
`root { BackGroundColor }`; `cov-theme` (`!theme cerulean`) reaches only the export scale (126.042 × 168); `cov-monochrome`
greys every colour (`#F00` → `#4C4C4C`) through the colour mapper; `cov-dark` (`skinparam mode dark`, `SkinParam.isDark`,
`TitledDiagram.java:293-294`) flips `withDark` and the background to `#1B1B1B`; `cov-handwritten` prints the
`!option handwritten` banner and jiggles through `UGraphicHandwritten`, as regex does. So the engine passes `getSkinParam()`
only to `Display#create` (sprites and pragma), as the Java does.
**Not extended:** the "honour ignored styling" carve-out covers json/yaml/hcl/files only.
**Rejected:** honouring skinparams on the shapes: no forcing library.

## Operational readiness (auto-confirmed)

| Question | Answer |
|---|---|
| SLIs and alerts | None: a browser-safe library with no runtime service. The survey, census and ratchets are the signal. |
| Traces and dashboards | N/A. `docs/parity-report.md` is regenerated; the `wire` note in `scripts/parity-dashboard-notes.ts` and `wire: 'D12 todo'` in `scripts/parity-dashboard-matrix.ts` are rewritten from measured numbers. |
| Rollback | **Reversible.** Revert the squashed commit. No migration. |
| Scale | The block tree and link list are linear in source lines; the longest row (`siladi-93-zovu930`) is 107 lines. The ratchet grows by 18 golden rows plus the authored count; routing and refusal gain 18 golden twins each. T5 names the CI risk. |
| Likely failures | Survey under load writes `timeout`: rerun alone. `print` measured with the injected measurer: every later `y` in a `print` row drifts (D3). Routing count assertions moved by the wrong number. `getLastChild` or `parseInt` returning instead of throwing (D5). |
| Compatibility | No public API change expected; `dist/*.d.ts` checked at T5. SVG changes on purpose, and `plantuml-ts` has no consumers to protect (`.claude/memory/plantuml-ts-has-no-consumers.md`). |

## Baseline

Measured on `2a70cec76`, 2026-11-10, at planning. Committed `parity-*.json`: `wire` 0 / 0 / 18 (every first diff
`svg/@background`); overall 5,666 conformant, 110 structural-match, 148 diverged, 3 oracle-error, of 5,927. Local `dot -V`:
`16.1.0 (20260904.0139)`.

**Phase 8, 2026-11-10 22:46-22:58, on `2a70cec76`, load average 8-69 (outside processes): green.**
`npm test -- --maxWorkers=4` **exit 0**: 45,625 passed, 0 failed, 4 expected fail, 7 skipped, 6 todo, in 2,159 files
(2,158 passed, 1 skipped), 447.43 s; coverage 97.2 / 92.91 / 97.92 / 98.18 (statements / branches / functions / lines).
`npm run typecheck`, `npm run lint`, `npm run build` and `npm run format:check` (with this brief in the tree) exit 0.
**This green run is the baseline.** The working tree held only this brief and the planning progress file.
