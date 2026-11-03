# Decisions (user-approved 2026-11-02)

| ID | Decision | One line |
|---|---|---|
| D1 | Source of truth: the ported `StyleBuilder` | Document background and elements both read `StyleSignatureBasic.of(…).getMergedStyle(builder)`. |
| D2 | Delivery: precompute into the existing theme | `theme.colors.background` + `theme.colors.elements[sname]`; no new `Theme` field. |
| D3 | Gate: sources with a `<style>` block or `skin` line | Every other source is byte-identical. |
| D4 | Diagram type: required `buildTheme` parameter | `plugin.type` → `getStyleName` table; per-element signature table with Java `file:line`. |
| D5 | Flat code: narrow removal | `resolveDocumentBackground` goes; `collectElementStyleBuckets` stops collapsing a foreign prefix for three colours; the rest stays. |
| D6 | Malformed `<style>`: fall back | Catch `StyleParsingException`, keep today's output, file the jar-error defect. |

Out of scope, filed at exit: dark mode's other diffs; monochrome/reverse root
background; `FontSize`, `LineThickness`, `RoundCorner`, `Shadowing` cascades;
malformed `<style>` jar error pages.

Conventions, as dbp: per-task worktrees (`mkwt.sh`), unsigned commits, `--no-ff`
merges, squash per batch at the end, the user signs and pushes; never dot-engine, the
fork, the jar, cached oracle bytes.

## D1 — the source

Upstream merges every style whose SNames are a subset of the signature, in storage
order, last value winning (`StyleStorage.java:102-116`, `StyleSignatureBasic.java:194-220`).
The port exists (`src/core/style/`) and gantt/mindmap/salt/wbs already read it.
Rejected: extending `resolveStyleCascade` (`style-map-tag-cascade.ts:113`): `StyleMap`
keeps a re-declared selector at its first position, so
`classDiagram { note } note { } classDiagram { note }` gives `#BBB` where the jar gives
`#CCC`. Measured: builder 4297/4305 corpus document backgrounds vs flat 4281; probes
109/111, the 2 misses being json + skinparam, which `plugin.styleInput` strips in jar mode.
Reuse `buildMindmapStyleBuilder` as named: no rename while porting.

## D2 — delivery

`Theme` and `ElementColors` are in the public d.ts (`dist/plantuml-ts.d.ts`), so a new
field is stop 7. Threading the builder through the render context would touch about 40
reader files that only receive `theme`. So `buildTheme` writes the resolved values to
the existing `background`, `backgroundGradient` and `elements[sname].{background,border,font}`,
as class's `computeClassStyleCascadeOverrides` already does. Stereotype and inline-colour
tiers stay above. A reader that skips the bucket is fixed individually (T3, T4).

**Consequence.** A snapshot per bucket cannot vary per instance; signatures with a
stereotype stay on their existing tiers.

## D3 — gate

Applies only when `preprocessed.styles` is non-empty or `preprocessed.skin` is set.
- **Elements:** write only a value that differs from the default-skin builder's for the
  same signature; an unchanged value keeps the flat path (theme-dark, engine defaults).
- **Document background:** authoritative under the gate, even when the value equals the
  default: `skinparam backgroundColor #AAAAAA` then `<style> document { BackgroundColor white }`
  is white in the jar (row `*__order-skin-then-white`). One exception: `skinparam mode dark`
  when the builder returns the default keeps `theme-dark`'s colour (row
  `sequence__scope-dark-unrelated-style`). Amendment by the executor is stop 3.

## D4 — diagram type

`buildTheme(preprocessed, options, diagramType)`, required, so the compiler finds all 5
`render-fixture-*.ts` harnesses and 8 test callers. `styleNameOf(plugin.type)` mirrors
`DiagramType.java:234-296`, including hcl → `yamlDiagram`, chronology → `ganttDiagram`,
description → `componentDiagram`, and the final `return SName.activityDiagram` (files,
board; rows `*__selector-activitydiagram`). Element signatures come from each element's own
Java: object entities use `objectDiagram` while object documents render as `CLASS` and use
`classDiagram`.

## D5 — flat code

Removed: `resolveDocumentBackground`, `DOCUMENT_BACKGROUND_SELECTOR_PRECEDENCE`, the false
"more-scoped outranks broader" comment (`style-map-element.ts:452-461`), `documentBg`,
`documentBackgroundColors`, `styleMapMergeBase` (`style-map-theme.ts`). `resolveSkinparam`'s
`solidBackgroundMergeBase` stays: a no-`<style>` source still needs it.
`collectElementStyleBuckets` stops collapsing a foreign diagram prefix for
background/border/font, closing `objectDiagram { note }` on class and `classDiagram { state }`
on state. Font sizes, stereotypes and `rootElementBackground` stay.

## D6 — malformed `<style>`

A stray `}`: the jar draws an error page, ours draws the diagram, the builder throws
`StyleParsingException`. `buildTheme` catches exactly that exception and keeps the flat
path: output unchanged. Row `sequence__scope-malformed-brace` pins today's non-zero count.
Any other exception propagates (stop 12). Filed as a follow-on (mindmap's handling:
`MindMapDiagramFactory.ts:191-192`).

## Amendments APPROVED by the user 2026-11-02 (stop 3 ruling)

Source: `measurements/reader-audit.md` §4, §6, §7. These override D1–D3 and D5 above where they differ.
Re-measured by the orchestrator without T0c's hooks where marked ✓. Also ruled: T0c's probe-only sites
are in scope, pinned as authored rows (T0d), and state splits into T3c and T3e.

**D1a — builder input.** Quote contradicted: "Reuse `buildMindmapStyleBuilder` as named". Upstream's
inherited params never convert: `TitledDiagram.java:109-110` `copyAllFrom(previous)` →
`SkinParam.java:217-218` `this.params.putAll(previous.values())`, no `setParam`. Ours: `withPrevious`
(`nested-previous.ts:70-74`) merges them into `skinparam`, and `declarationsOf`'s `?? -1`
(`mindmap-style-builder.ts`) converts them. Nested note: jar `#FEFFDD` ✓; D2's write `#BBB` (T0c).
Ruling: keep the name, and build from only the keys in `declarationOrder.skinparam`; no order
(older test literals) keeps today's reading.

**D2a — a second key.** Quote contradicted: "`elements[sname].{background,border,font}`". One key cannot
hold two signatures: leaf `EntityImageDescription.java:111-112` vs cluster `Cluster.java:290-291`, and
`renderer-cluster.ts:185` reads `elements[symbol]` first. `foboxa-33-menu312`: jar cluster `#00F`, leaf
`#008000` ✓; the write gives both `#008000`, which loses 3 conformant rows (T0c: `foboxa-33-menu312`,
`nibige-54-voki590`, `zosuje-43-zebi775`), stop 4 at T2a. Ruling: no new field; `elements` is
`Partial<Record<string, ElementColors>>` (`theme.ts:442`), so `group.<symbol>` is a distinct key, read
first by `clusterBackground`/`clusterBorder`. T0c simulation: 5 movers, all toward the jar, 0 away. The
same device for note on link (`sequenceDiagram`) and state choice vs history. `renderer-cluster.ts` joins
T2a's write-set and leaves T3a's.

**D3a — stale flat value.** Quote contradicted: "an unchanged value keeps the flat path". When the last
declaration equals the default, the flat bucket keeps an earlier one: `note { #AAA } root { #FEFFDD }` jar
`#FEFFDD` ✓, ours has `#AAA` ✓; `component { #AAA } element { #f1f1f1 }` jar `#F1F1F1` ✓, ours `#AAA` ✓.
Ruling: also write when the flat path already holds that role (`elements[bucket][role] !== undefined`).

**D3b — the gate's name.** Headline "a `<style>` block or `skin` line" vs body `preprocessed.styles`
non-empty: 27 `!theme`-only corpus rows pass (T0c). Ruling: the body is the rule; stop 5 and the task
contract read "non-empty `preprocessed.styles` or `preprocessed.skin`".

**D5a — "foreign".** `classDiagram { object }` on `object O`: jar `#F1F1F1`, ours `#AAA` (T0c).
`classDiagram` is the document's own name and foreign to the object's signature. Ruling: foreign means
foreign to the bucket's signature; `collectElementStyleBuckets` takes the diagram type.

**D7 — state's composite notes.** `state-composite-geo.ts:403` materialises `specs`, which hold no
note, though `state-composite-pass.ts` adds the note to DOT; `buildFlatNoteGeos` is called only from
`layout.ts:166`. Jar draws the note. Appending the geos: `state__cascade-none` 46 → 0 ✓,
`state__cascade-bg-diag` 7 ✓; state corpus 95 → 95 conformant, one mover, `dajipi-09-doki542` 10 → 8, no
`<style>` (T0c), which is stop 5 as written. Ruling: fix it in T3c with stop 5 excepted for rows moved
only by this geo append, each journaled. Task contract's "unrelated to this mission" is struck for state.

**D6a (user ruling 2026-11-02, stop 12).** D5 removes the only flat code that read a `<style>` document
colour, so D6's "output unchanged" cannot hold when a malformed block declares one:
`document { BackgroundColor red } note { FontSize } }` is `#FF0000` before T1a, `#FFFFFF` after, jar root `#000000`.
Ruling: D5 stands. A malformed block contributes no document colour; the root falls to the flat path's other
sources or the default. Neither output is the jar's; the error-page follow-on is the real fix. Row
`sequence__scope-malformed-colour` pins it. Element colours under D6 keep the flat path unchanged.

Consequences: T2a's `object__cascade-bg-diag` acceptance moves to T3b (leak is
`renderer-classifier-colors.ts:52`, outside T2a); T4a's "`root` already works" is struck (activity sites
14, 15). Reader sites total: state 19, activity 17, class 6, object 3, description 3; state crosses
stop 13's "about 15".

## D8 — standing ruling while the user is away (user, 2026-11-02, after T1a)

The user is unavailable for the rest of the run. In the user's words, the default answer to questions is
"follow the oracle/Java and yes, do the extra work". Overrides the brief where they differ:

- **Questions.** Do not wait. Answer by the Java and the jar, journal the question and the answer. "Ask the
  user before growing scope" now reads: grow it, as an authored row with a jar oracle, and journal it.
- **Write scope.** A task may add files inside `src/` to its write-set, plus the test files that cover them
  (executor's reading of "the plantuml-ts source code directory"; TDD needs the tests). Count each added file in
  the ledger below. Raise a flag at the 5th: journal row, end report, push notification. A flag is not a halt.
- **500 lines.** Over the limit, split the file, in any directory. Split files do not count toward the 5.
- **Stops that were questions** (3, 12, 13, and 1 inside `src/`): amend `decisions.md` or split the task, journal,
  continue. A contradiction resolves to what the Java and jar do.
- **Stops that are measurements** (2, 4, 5, 6, 11): keep diagnosing and fix the cause. A conformant row is
  identical to the jar, so losing one is a defect, never a judgment call. Halt only with the diagnosis artifact, when
  the fix budget is spent.
- **Unchanged, the ruling does not reach them:** stops 7, 8, 9, 10. Never push, never sign, no d.ts change, no new
  `Theme` field or runtime dependency, no edit to dot-engine, the fork, the jar or oracle bytes, no fitted value.
  Write-set files outside `src/` still follow the contract. If one of these blocks the work, halt.
- **Scope of "the extra work".** Defects found on the bg, line and font read path are fixed, with a row each. On a
  source with no `<style>` or `skin`, stop 5 is excepted row by row, as D7 did, and only for a jar-ward move. The
  user-approved out-of-scope list above stays filed: this ruling answers questions, it does not reverse a decision.

**Ledger of files added to a write-set (flag at 5; splits uncounted; corrected 2026-11-02: an edited file counts, not only a new one):**
T1b, a task the probes added: `src/core/preprocessor-collector.ts`, `tests/unit/preprocessor.test.ts` (2). T2a: `src/core/document-back-color.ts`, `src/core/skin-loader.ts`, `src/diagrams/class/class-namespace-usymbol-shape.ts`, and four required-argument test edits, `swimlane-census.ts`, `compress/invariant.test.ts`, `object-kind-style.test.ts`, `transition-label-ink.test.ts` (7). **Total 9. Flag raised at T2a's merge (journal row 27).** T3a's and T3e's scope grew in the spec, inside their own directories, so those add nothing here. T3d: `src/core/style-element-scope.ts` (1), a new key for existing signatures. T3a: `src/core/svek/hexagon-polygon.ts`, `src/core/svek/SvekEdge.ts`, `src/core/klimt/drawing/svg/driver-path-svg.ts`, `src/core/decoration/symbol/usymbol-resolve.ts` (4). T3b: `src/core/legacy-stereotype-font.ts`, `src/core/object-skin-default.ts`, `src/core/TextBlockExporter.ts`, `src/core/assemble-svg.ts`, `src/core/build-theme.ts`, `tests/unit/object/renderer.test.ts`, `tests/unit/core/style-element-scope.test.ts`, `tests/unit/core/unwind2-s5-theme-order.test.ts` (8). T3g: `src/diagrams/class/renderer-classifier-rows.ts`, `src/diagrams/class/renderer-classifier-box.ts`, `tests/unit/core/unwind2-s5-theme-order.test.ts` (3). T3f: `src/core/annotations/commands.ts`, `src/core/svek/image/Opale.ts`, `src/core/dispatcher-types.ts`, `tests/unit/class/renderer.test.ts`, `tests/unit/core/assemble-svg-backcolor.test.ts` (5). T4a: `src/core/style-map-element.ts`, `src/core/skinparam-stereo-keys.ts` (2). TE1: none. TE2, whose spec named `src/**` under D8: `src/core/klimt/color/HColorSet.ts`, `paint.ts`, `skinparam-key-handlers{,-add-magic,-shared,-table-a,-table-b}.ts`, `skinparam-key-normalize.ts`, `style-cascade-class.ts`, `style-element-scope.ts`, `style-map-element.ts`, `svg-shapes.ts`, `svg-shapes-text.ts`, `theme-element-resolve.ts`, `document-back-color.ts`, `src/diagrams/files/index.ts` (16). **Total 48.**
