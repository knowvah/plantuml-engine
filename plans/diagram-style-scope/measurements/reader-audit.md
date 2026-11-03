# T0c reader audit

Measured on `13f231c40` (b0, no `src/` change committed). Java paths are relative to
`~/git/plantuml/src/main/java/net/sourceforge/plantuml/`. TS paths are relative to `src/`.

## Instrument

`compareSvg`'s count is not usable here: on `state__cascade-*` it pairs the wrong entities (see section 3), and it
short-circuits on a child-count mismatch. So every number below comes from a scratch colour walker: each `<rect|path|
polygon|ellipse|line|text>` keyed by enclosing group id + tag + ordinal, comparing `fill` and `stroke` only, with the
document rect removed (T1a's job).

"Skips the bucket" is measured, not grepped. A temporary hook at T2a's merge point (`build-theme.ts`, after segments,
before Stage 4; reverted) wrote `buildMindmapStyleBuilder(pre)` values into `theme.colors.elements[bucket]` under D3's
rule, a stand-in for T2a. A site is listed in section 2 only if it still differs from the jar with that value written.
"Reached" means the same row went to 0.

Rows: 117 `cascade` rows. Probes past the rows: 186 authored `.puml` with jar oracles (activity lanes, loops, SDL; state
flat notes, pseudostates, history, concurrent, clusters; class notes, kinds, lollipops; object kinds; 24 description
symbols, 10 cluster symbols, links; D2, D3, D5 cases; nested). A site marked `probe` fails a probe, not a `cascade` row.

| engine | colour diffs today (`<x>Diagram` / `element` / `root`), bg + line + font | same, with buckets written |
|---|---|---|
| component | 38 / 11 / 9 | 1 / 0 / 0 |
| usecase | 19 / 8 / 7 | 1 / 0 / 0 |
| class | 6 / 6 / 6 | 1 / 1 / 1 |
| object | 14 / 2 / 2 | 12 / 0 / 0 |
| state (baseline 3 = the missing note) | 18 / 32 / 20 | 18 / 30 / 18 |
| activity | 71 / 60 / 13 | 62 / 53 / 13 |
| sequence, json, yaml | 0 / 0 / 0 | 0 / 0 / 0 |

Sequence, json and yaml already read a `StyleBuilder` directly (`diagrams/sequence/sequence-skin-param.ts`, 9 and 3 files
importing it under `diagrams/sequence` and `diagrams/json`). The walker confirms `fixtures.md`'s "document background only".

## 1. Signature table

`R,E` = `SName.root, SName.element`. "Bucket" = the entry in `core/skinparam-element-buckets.ts` or
`style-map-element.ts:CLUSTER_BUCKET_SNAMES`, or what is read instead when there is none.

Port spelling matters: `class_`, `package_`, `interface_` (`core/style/SName.ts`). A harness error passing `'package'`
matched nothing and lost `component/lotofa-28-rudo664`.

### Description (component, usecase): `DiagramType.java:250-251` `if (this == DESCRIPTION) return SName.componentDiagram;`

| element | Java | signature | bucket |
|---|---|---|---|
| leaf of any USymbol | `svek/image/EntityImageDescription.java:111-112` `of(SName.root, SName.element, getStyleName(), symbol.getSNames())` | `R,E,componentDiagram,<symbol>` | `<symbol>` |
| `[C]` | `decoration/symbol/USymbolComponent2.java:55` | `component` | `component` |
| `interface I`, `()` | `USymbolInterface.java:46-48` `new SName[] { SName.interface_ }` (jar: `component/zosuje-43-zebi775`'s `interface { BackgroundColor greenYellow }` paints it) | `interface_` | `interface` |
| `database` / `cloud` / `actor` | `USymbolDatabase.java:57`, `USymbolCloud.java:63`, `USymbolActor.java:53` | own name | same |
| `(Do)` | `svek/GeneralImageBuilder.java:169-170` `new EntityImageDescription` (`:171` comments out `EntityImageUseCase`), `USymbolUsecase.java:67` | `usecase` | `usecase` |
| cluster with symbol (`package`, `rectangle`) | `svek/Cluster.java:290-291` `of(SName.root, SName.element, diagramStyleName, SName.group, symbol.getSNames())`; `USymbols.java:86,91` | `R,E,componentDiagram,group,<symbol>` | **shares `<symbol>` with the leaf** (D2 verdict) |
| cluster title | `svek/ClusterHeader.java:159-160` `..., uSymbol.getSNames(), SName.composite, SName.title` | `...,<symbol>,composite,title` | `<symbol>.titleFont` |
| note | `svek/image/EntityImageNote.java:188-189` `of(SName.root, SName.element, getStyleName(), SName.note)`; `getStyleName` `svek/AbstractEntityImage.java:95-96` | `R,E,componentDiagram,note` | `note` |
| arrow | `svek/SvekEdge.java:817-819` `of(SName.root, SName.element, diagramType().getStyleName(), SName.arrow)` | `R,E,componentDiagram,arrow` | none; `graph.descriptionCascadeArrowColor` |
| arrow label | `svek/GraphvizImageBuilder.java:234-235` `getDefaultStyleDefinitionArrow(...).getFontConfiguration` | same | none; `graph.arrowFontColor` |

### Class: `DiagramType.java:241-242` `if (this == CLASS) return SName.classDiagram;`

| element | Java | signature | bucket |
|---|---|---|---|
| class, interface, enum, abstract | `svek/image/EntityImageClass.java:162-163` `of(SName.root, SName.element, SName.classDiagram, SName.class_)` | `R,E,classDiagram,class_` | none; `graph.classCascade*` |
| header | `EntityImageClassHeader.java:79-80` `..., SName.class_, SName.header` | `...,class_,header` | none; `graph.classCascadeHeader*` |
| spot | `EntityImageClassHeader.java:204` `of(SName.root, SName.element, SName.spot, SName.spotClass)` (`:202,206,208` siblings) | no diagram name | `spotclass` etc. |
| note | `EntityImageNote.java:188-189` | `R,E,classDiagram,note` | `note` |
| package frame | `Cluster.java:292-293` `of(SName.root, SName.element, diagramStyleName, SName.package_, SName.group)` (`:290-291` with a symbol) | `R,E,classDiagram,package_,group` | `package`, `graph.packageBackground` |
| arrow | `SvekEdge.java:817-819` | `R,E,classDiagram,arrow` | none; `graph.classCascadeArrowColor` |
| `() lp` | `GeneralImageBuilder.java:154-155`, `EntityImageLollipopInterface.java:69-70` `of(SName.root, SName.element, getStyleName(), SName.circle)` | `R,E,classDiagram,circle` | none |
| note on link (all svek engines) | `EntityImageNoteLink.java:64` `ComponentType.NOTE.getStyleSignature()` -> `skin/ComponentType.java:98-99` `of(SName.root, SName.element, SName.sequenceDiagram, SName.note)` | `R,E,sequenceDiagram,note` | **shares `note`** (D2 verdict) |
| stereotype text | `EntityImageClassHeader.java:131` `FontConfiguration.create(getSkinParam(), FontParam.CLASS_STEREOTYPE, stereotype)`: legacy, no `Style` | none | none |

### Object: jar writes `data-diagram-type="CLASS"` for `object O`, so document, notes and arrows use `classDiagram`

| element | Java | signature | bucket |
|---|---|---|---|
| object | `EntityImageObject.java:123-124` `of(SName.root, SName.element, SName.objectDiagram, SName.object)` | `R,E,objectDiagram,object` | `object` |
| map | `EntityImageMap.java:137-138` | `R,E,objectDiagram,map` | `map` |
| json | `EntityImageJson.java:139-140` | `R,E,objectDiagram,json` | `json` |
| note, arrow | as class | `classDiagram` | `note`; `graph.classCascadeArrowColor` |

### State: `DiagramType.java:238-239` `if (this == STATE) return SName.stateDiagram;`

| element | Java | signature | bucket |
|---|---|---|---|
| leaf | `EntityImageStateCommon.java:61-62` `of(SName.root, SName.element, SName.stateDiagram, SName.state)`; `EntityImageState.java:89-92` adds `SName.name`, `SName.description` | `R,E,stateDiagram,state[,name\|description]` | `state` |
| composite | `Cluster.java:288-289` `..., SName.state, SName.group`; zones `Cluster.java:464-470` `STYLE.addSName(SName.name)`, `description`, `SName.body`; title `ClusterHeader.java:156-157` | `...,state,group\|name\|description\|body` | `state`, one value for all zones |
| start | `EntityImageCircleStart.java:56-58` `..., getDiagramType().getStyleName(), SName.circle, SName.start` | `R,E,stateDiagram,circle,start` | none |
| end | `EntityImageCircleEnd.java:57-59` `..., SName.circle, SName.end` | `R,E,stateDiagram,circle,end` | none |
| `<<choice>>` | `GeneralImageBuilder.java:150-151`, `EntityImageBranch.java:62-63` `of(SName.root, SName.element, SName.activityDiagram, SName.activity, SName.diamond)` | **`activityDiagram`** `,activity,diamond` | none for this signature |
| fork, join | `EntityImageSynchroBar.java:62-63` `..., SName.activityDiagram, SName.activityBar` | **`activityDiagram`** `,activityBar` | `activitybar` |
| history | `EntityImagePseudoState.java:70-71` `..., getStyleName(), SName.diamond` | `R,E,stateDiagram,diamond` | none |
| concurrent separator | `svek/ConcurrentStates.java:115-116` `..., SName.stateDiagram, SName.state` | `R,E,stateDiagram,state` | `state` (site reads `colors.border`) |
| note | `EntityImageNote.java:188-189` | `R,E,stateDiagram,note` | `note` |
| arrow | `SvekEdge.java:817-819` | `R,E,stateDiagram,arrow` | none; `graph.stateArrowLineColor` |

### Activity (every signature names `SName.activityDiagram`)

| element | Java | signature | bucket |
|---|---|---|---|
| action | `activitydiagram3/ftile/vertical/FtileBox.java:98` `..., SName.activityDiagram, SName.activity` | `R,E,activityDiagram,activity` | `activity` |
| diamond | `ftile/vcompact/cond/ConditionalBuilder.java:102`, `ftile/FtileFactoryDelegator.java:79-80` `..., SName.activity, SName.diamond` | `...,activity,diamond` | `diamond` |
| fork bar | `ftile/vertical/FtileBlackBlock.java:98` `..., SName.activityBar` | `...,activityBar` | `activitybar` |
| note | `ftile/vcompact/FtileWithNoteOpale.java:89`, `FtileNoteAlone.java:77`, `FtileWithNotes.java:84` `..., SName.note` | `...,note` | `note` |
| arrow | `ftile/FtileFactoryDelegator.java:83-84`, `ParallelBuilderSplit.java:73` `..., SName.arrow` | `...,arrow` | none |
| start / stop / end / spot | `ftile/vcompact/VCompactFactory.java:109,101,97,105` `..., SName.circle, SName.<leaf>` | `...,circle,<leaf>` | none; `graph.activity.circleStyle` |
| swimlane | `ftile/Swimlanes.java:127`, `ftile/LaneDivider.java:72` `..., SName.swimlane` | `...,swimlane` | `swimlane` |
| partition | `ftile/vcompact/FtileGroup.java:89-90` `..., symbol.getSNames(), SName.composite`; `command/CommandPartition3.java:91`, `USymbols.java:87` `new USymbolFrame(SName.partition)` | `...,partition,composite` | none; `graph.partition*` |
| group | same, `USymbols.java:81` `new USymbolFrame(SName.group)` | `...,group,composite` | `group` (not read here) |
| goto | `ftile/Swimlanes.java:248,270` `..., SName.goto_` | `...,goto_` | none |

### Sequence, json, yaml (no bucket-skipping site; they read the builder)

| element | Java | signature |
|---|---|---|
| participant / actor / database | `sequencediagram/ParticipantType.java:57,60,75` | `R,E,sequenceDiagram,<kind>` |
| arrow | `sequencediagram/AbstractMessage.java:76` | `...,arrow` |
| note | `sequencediagram/NoteStyle.java:73` | `...,note` |
| group, group header | `sequencediagram/Grouping.java:62,68` | `...,group`, `...,groupHeader` |
| ref | `sequencediagram/Reference.java:67,71` | `...,reference`, `...,referenceHeader` |
| lifeline, activation, divider | `skin/ComponentType.java` branches `PARTICIPANT_LINE`, `ACTIVATION_BOX_*`, `DIVIDER` | `...,lifeLine`, `...,activationBox`, `...,separator` |
| json/yaml node | `jsondiagram/TextBlockJson.java:150,269`, `:148` for headers, `:113` `diagramType` | `R,E,jsonDiagram\|yamlDiagram,node`, `...,header,node` |
| json/yaml arrow | `jsondiagram/SmetanaForJson.java:119` | `R,E,<type>,arrow` |

## 2. Sites that skip or mis-read the bucket

A site is one reader expression; a row can fail on many elements through one site.

### Activity: 17 sites (9 in `cascade` rows, 8 probe-only). T3d: 7. T4a: 10.

Fonts are reached: `activity__cascade-font-*` 9/9/7 -> 0 through `activity-text-style.ts:143`. Start and stop circles are
reached through `core/activity-circle-style.ts`. Swimlane fill, border and title are reached
(`activity-style-defaults-swimlane.ts:54,69,110`). Do not touch them.

| # | site (`diagrams/activity/`) | reads instead | fails | task |
|---|---|---|---|---|
| 1 | `activity-renderer-shapes.ts:116` box fill (consumers `:144,:272`, `activity-renderer-signal-shapes.ts:205`) | `graph.activity.background ?? colors.nodeBackground` | `activity__cascade-bg-*` | T3d |
| 2 | `activity-renderer-shapes.ts:119` bar fill and stroke (`activity-renderer-bars.ts:65-68`) | `graph.activity.barColor ?? ACTIVITY_BAR_FILL` | `activity__cascade-bg-*` | T3d |
| 3 | `activity-renderer-if-shapes.ts:252` diamond fill | `graph.activity.diamondBackground ?? background ?? nodeBackground` | `activity__cascade-bg-*` | T3d |
| 4 | `activity-renderer-note-shapes.ts:20` note fill | `colors.noteBackground` | `activity__cascade-bg-*` | T3d |
| 5 | `activity-renderer-terminals.ts:254` spot fill | `colors.nodeBackground` | probe `activity__loops-bg-*` | T3d |
| 6 | `activity-renderer-composite.ts:70` partition back | `graph.partitionBackground ?? 'none'` | probe `activity__lanes-bg-*` | T3d |
| 7 | `activity-renderer-composite.ts:72` partition title | `graph.partitionFontColor ?? '#000'` | probe `activity__lanes-font-*`, all three forms | T3d |
| 8 | `activity-renderer-shapes.ts:117` box border | `graph.activity.border ?? colors.border` | `activity__cascade-line-diag*` | T4a |
| 9 | `activity-renderer-if-shapes.ts:253` diamond border | `graph.activity.diamondBorder ?? border ?? colors.border` | `activity__cascade-line-diag*` | T4a |
| 10 | `activity-renderer-shapes.ts:168` note border | `colors.border` | `activity__cascade-line-diag*` | T4a |
| 11 | `renderer.ts:250` arrow line | `colors.arrow` | `activity__cascade-line-{diag,diag-element,element}` | T4a |
| 12 | `activity-style-defaults.ts:498` arrow head (`renderer.ts:251,373`) | `colors.arrowHead ?? colors.arrow` | same | T4a |
| 13 | `activity-renderer-bars.ts:119` split line | `colors.arrow` | probe `activity__loops-line-{diag,element}` | T4a |
| 14 | `activity-renderer-composite.ts:71` partition border | `graph.partitionBorder ?? '#000'` | probe `activity__lanes-line-*`, **`root` too** | T4a |
| 15 | `activity-renderer-terminals.ts:191,195` end cross | `actColors.endFill` (`CIRCLE_INK`), not `circleStyle` | probe `activity__loops-line-*`, **`root` too** | T4a |
| 16 | `activity-renderer-terminals.ts:257` spot border | `colors.border` | probe `activity__loops-line-diag` | T4a |
| 17 | `activity-renderer-terminals.ts:293` goto | `colors.border` (`Swimlanes.java:248`) | not probed | T4a |

Mechanism for "`root` already works": `build-theme.ts:rootCascadeSkinparams` sends `root { LineColor }` to `colors.border`
and `colors.arrow`, which sites 8-12 fall through to. `element` reaches `colors.border` too (sites 8-10 pass there) and not
`colors.arrow`, which is the 40. 49 = 40 arrow diffs + 5 boxes + 2 diamonds + 2 note paths.

### State: 19 sites (9 in `cascade` rows, 3 note sites behind the missing note, 7 probe-only)

Reached: leaf and composite fill, border and title through `state-render-colors.ts:51,82,93`.

| # | site (`diagrams/state/`) | reads instead | fails |
|---|---|---|---|
| 1 | `renderer-pseudostate.ts:57` start fill | literal `PSEUDO_ANCHOR_COLOR` | `state__cascade-bg-*` |
| 2 | `renderer-pseudostate.ts:58` start stroke | same literal | `state__cascade-line-*` |
| 3 | `renderer-pseudostate.ts:71` end disc fill | same literal | `state__cascade-bg-*` |
| 4 | `renderer-pseudostate.ts:73-74` end strokes | same literal | `state__cascade-line-*` |
| 5 | `renderer-pseudostate.ts:107` choice fill | literal `STATE_DEFAULT_BACKGROUND`. Signature is `activityDiagram`: `stateDiagram { BackgroundColor }` must NOT reach it, `element` and `root` must. `state-render-colors.ts:9` says it shares `EntityImageStateCommon.STYLE`: false, `EntityImageBranch.java:62-63` | `state__cascade-bg-{element,root}`, probe `state__d5-activitydiag-*` |
| 6 | `renderer-composite-box.ts:216-287` `buildCoreLayers`: no body path on an autonom composite. Only `renderClusterMeasured:438-439` draws it. `Cluster.java:469-470` `addSName(SName.body)`, skin `body { BackGroundColor transparent }` | nothing | `state__cascade-bg-*`, probe `state__{conc,hist,cluster}-bg-*` |
| 7 | `state-renderer-transitions.ts:187` edge line | `graph.stateArrowLineColor ?? colors.arrow` | `state__cascade-line-{diag-element,element}` |
| 8 | `state-renderer-transitions.ts:188` edge head | `graph.stateArrowHeadColor ?? ...` | same |
| 9 | `state-renderer-transitions.ts:133,139` edge label colour | `core/arrow-label-font.ts:76` `graph.arrowFontColor` | `state__cascade-font-{diag,diag-element}` |
| 10 | `renderer-note.ts:239,273` note fill | literal `NOTE_FILL` | probe `state__flatnote-bg-*`; live in `cascade` once section 3 is fixed |
| 11 | `renderer-note.ts:250-251,275-276` note stroke | `colors.border` | probe `state__flatnote-line-diag`; same |
| 12 | `renderer-note.ts:223` note text | literal `#000000` | probe `state__flatnote-font-*`; same |
| 13 | `renderer-note.ts:353-354,375` note on link | literals, `colors.border`. Signature `sequenceDiagram`, so `stateDiagram {...}` must not reach it | probe `state__flatnote-bg-{element,root}` |
| 14 | `renderer-pseudostate.ts:93` fork, join | `resolveActivityBar*Color ?? SYNCHRO_BAR_COLOR` | probe `state__pseudo-bg-{element,root}` |
| 15 | `renderer-pseudostate.ts:158` history fill | literal | probe `state__hist-bg-*` |
| 16 | `renderer-pseudostate.ts:159` history stroke | `colors.border` | probe `state__hist-line-diag` |
| 17 | `renderer-pseudostate.ts:167,175` history text | literal `#000000` | probe `state__hist-font-*` |
| 18 | `renderer.ts:185` concurrent separator | `colors.border` (`ConcurrentStates.java:120` reads `state`) | probe `state__conc-line-diag` |
| 19 | `renderer-box.ts:402` sdlreceive text | literal `#000000` | probe `state__pseudo-font-*` |

### Description (component + usecase): 3 sites (1 skip, 2 mis-read)

Everything else is reached: all 24 leaf symbols, all 10 cluster symbols, notes, arrow line. Component 38 -> 1, usecase 19 -> 1.

| # | site (`diagrams/description/`) | reads instead | fails |
|---|---|---|---|
| 1 | `renderer-edge.ts:29,33` label colour | `core/arrow-label-font.ts:76` `graph.arrowFontColor` | `{component,usecase}__cascade-font-{diag,diag-element}` |
| 2 | `renderer-cluster.ts:185` cluster fill | reads `elements[symbol]`, the leaf's value, before `elements.group`. **This is a regression source once T2a writes**, see D2 | corpus `foboxa-33-menu312`, `nibige-54-voki590`, `zosuje-43-zebi775`; probe `component__d2-rect-then-group` |
| 3 | `renderer-cluster.ts:202` cluster border | same | same family |

### Class: 6 sites (1 in `cascade` rows, 5 probe-only)

Notes are reached (`class__cascade-{bg,line,font}-*` 3/2/1 -> 1/0/0). Classifier, arrow and spot already pass.

| # | site (`diagrams/class/`) | reads instead | fails |
|---|---|---|---|
| 1 | `class-namespace-shape.ts:155` package fill | `graph.packageBackground ?? PACKAGE_CLUSTER_BACKGROUND_DEFAULT`, not `elements.package` | `class__cascade-bg-*` |
| 2 | `renderer-note-link-box.ts:70` note-on-link fill | `elements.note`: wrong signature, `classDiagram {...}` reaches it where the jar does not | probe `class__notes-bg-diag` |
| 3 | `renderer-note-link-box.ts:101` -> `renderer-note-lines.ts:170` note-on-link text | `graph.noteCascadeFontColor`: `classDiagram {...}` reaches it where the jar does not | probe `class__notes-font-diag` |
| 4 | `renderer-assoc-lollipop.ts:127` lollipop fill | `graph.classBackground` | probe `class__generic-bg-diag` |
| 5 | `renderer-assoc-lollipop.ts:128` lollipop stroke | `colors.border` | probe `class__generic-line-diag` |
| 6 | `renderer-classifier-row-font-color.ts:27` stereotype label | paints the cascade colour where `EntityImageClassHeader.java:131` reads no style, so the jar keeps `#000` | probe `class__kinds-font-*` |

### Object: 3 sites, all in `cascade` rows (reads the bucket, falls to the wrong tier)

`objectDiagram { BackgroundColor | LineColor | FontColor }` is reached: probe `object__kinds-*-diag` -> 0. The failure is the
fallback: `classCascade*` is built from `CLASS_SNAMES`, which contains `classdiagram`, and an object's signature does not.

| # | site (`diagrams/class/`) | reads instead | fails |
|---|---|---|---|
| 1 | `renderer-classifier-colors.ts:262` -> `:52` fill | `classDefaultBackground`: `graph.classCascadeBackground` | `object__cascade-bg-{diag,diag-element}` |
| 2 | `renderer-classifier-colors.ts:334` border | `graph.classCascadeBorder` | `object__cascade-line-{diag,diag-element}` |
| 3 | `renderer-classifier-row-font-color.ts:27` text | `graph.classCascadeFontColor` | `object__cascade-font-{diag,diag-element}` |

### Counts

| engine | task | in `cascade` rows | probe-only | total |
|---|---|---|---|---|
| activity | T3d + T4a | 9 | 8 | 17 |
| state | T3c | 9 | 10 | 19 |
| component + usecase | T3a | 1 | 2 (corpus and probe, needed by T2a) | 3 |
| class | T3b | 1 | 5 | 6 |
| object | T3b | 3 | 0 | 3 |
| sequence, json, yaml | none | 0 | 0 | 0 |

Stereotype and inline tiers: `sequence__d2-stereo` 0 diffs; no corpus row moved away once the cluster key exists (D2 verdict).

## 3. State width: `state__cascade-bg-diag`, rect width 115 vs 170

**Mechanism.** The composite pipeline lays the note out and never draws it. `note left of A` is a DOT node, but no
`StateNodeGeo` exists for it, so the document's ink box excludes it and the canvas is 55 px short. It has nothing to do with
style: `state__cascade-none` has the same 115.

**Origin.** `diagrams/state/state-composite-geo.ts:403` `materializeSpecs(specs, ...)`: `specs` comes from
`state-composite-pass.ts` `buildTopLevelPass`, which pushes `ast.states` and pseudo nodes only. The note materialiser is flat
only: `diagrams/state/layout.ts:166` `geos.push(...buildFlatNoteGeos(ast, ctx))`; `renderer-note.ts` states "the composite
pipeline's own materialization is a separate, unbuilt piece".

**Causal chain.**
1. `state-composite-pass.ts` `addScopeNotes('', ctx, acc)` adds `__note_0` to DOT. Traced: `result.width` 161.12, node
   `__note_0` x=0 w=28.23, `A` x=63.12. Identical in width to the jar's `sh0010 width=0.392101` (28.23 pt).
2. `specs` traced: `A`, `C`, `__initial__`, `__final__`. No note.
3. `layout.ts:350-352` `applyStateDocumentMargin` computes dims and shift from `geo.states` ink. Leftmost ink is `A`, so
   shift -55.12 and width 115.
4. The document rect takes that width. `svg/@width 115 vs 170` already sits in the baseline; `rect[1]/@width` shows up only
   on rows that paint a rect, which is why it looked like a `bg-diag` / `bg-root` defect.

**Controlled experiment** (temporary, reverted). Append `buildFlatNoteGeos(ast, ...)` in `layoutComposite`:
- `state__cascade-none`: width 170, **46 diffs -> 0**. The whole baseline is this one omission: the missing `ent0012` shifts
  `compareSvg`'s pairing, so every coordinate in the row reads as a diff.
- `state__cascade-bg-diag`: width 170, rect 170, 7 diffs, all from sites 1, 3, 6, 10.
- All 273 state corpus rows: conformant 95 -> 95. **One mover**, `state/dajipi-09-doki542`, 10 -> 8.

**Ruled out.**
- Style or document paint: `state__cascade-none` has no `<style>` and the same 115.
- The rect's own width logic: it equals `svg/@width` on both sides.
- DOT input: same note node size as the jar's; `result.width` includes it.
- Note parsing: `ast.notes` holds it, `scopeId ''`, target `A`.
- Theme, measurer: the experiment changes neither and reaches exact conformance.

**Consequences.**
- `task-contract.md` calls the 46 "unrelated to this mission". It is one defect, and it hides T3c's bar: `compareSvg` reports
  3 extra diffs on `state__cascade-bg-diag` where the walker finds 7, and none on note colours.
- Without this fix, `state__cascade-bg-{diag,root}` can never equal `state__cascade-none`: +2 (rect width, child count).
- T3c's write-set covers it, but `dajipi-09-doki542` has no `<style>` and no `skin` line, so the literal rule is **stop 5**
  though the row moves toward the jar. Orchestrator's ruling needed.
- Composite-scoped notes (`scopeId !== ''`) are not in this experiment's scope; `buildFlatNoteGeos` skips them.

## 4. Nested `{{ }}`

**Answer: no.** `withPrevious` (`core/nested-previous.ts:70-74`) replaces `skinparam` only; `declarationOrder` is untouched.

Measured for `class__scope-nested-embed` (no outer skinparam):
`{"skinparam":[],"styles":0,"order":{"skinparam":[],"styles":[]}}`. Nested background `#FFFFFF` in both, as its outer `<style>`
must not cross. With an outer `skinparam noteBackgroundColor #BBBBBB`:
`{"skinparam":[["notebackgroundcolor","#BBBBBB"]],"order":{"skinparam":[],"styles":[]}}`.

**Mechanism.** The builder converts inherited keys anyway. `mindmap-style-builder.ts` `declarationsOf`: `order?.skinparam.get(key)
?? -1`, so an inherited key sorts first and runs through `SkinParam#setParam` -> `FromSkinparamToStyle`. Upstream does not:
`TitledDiagram.java:109-110` `this.skinParam.copyAllFrom(previous)` -> `skin/SkinParam.java:217-218`
`this.params.putAll(previous.values())`, no conversion, so the nested style storage never sees it. The port's `STYLE_ONLY_KEYS`
only covers `backgroundcolor`, so T1a's document read is safe and T2a's element read is not.

**Measured regression** (scratch `nc-style`: outer `skinparam noteBackgroundColor #BBBBBB`; a nested class diagram with a `<style>`,
so D3's gate opens):

| | nested note fill |
|---|---|
| jar | `#FEFFDD` |
| today | `#FEFFDD` |
| builder on `withPrevious` output, D2 write | **`#BBB`** |
| builder given only keys in `declarationOrder.skinparam`, D2 write | `#FEFFDD` |

A key both set keeps its counter entry, so the filter keeps the nested diagram's own `setParam`. T1a and T2a should build from that
filtered map. `declarationOrder === undefined` (older test literals) keeps today's "all before all".

Pre-existing, not this mission's: `skinparam classBackgroundColor` inherited paints a nested class `#BBB` on the flat path, jar
`#F1F1F1` (gate shut, `STYLE_ONLY_KEYS` "audited, not exhaustive"). A nested `<style>` in a class body `{{ }}` draws our error page
(jar renders); in an activity `:{{ }};` it is hoisted to the outer diagram (jar `#CCC`, ours `#E2E2F0`).

## 5. Timing

Builder plus 59 unique signatures x 3 `value()` reads per document, no `preprocess`. All 493 corpus rows with non-empty
`pre.styles` or `pre.skin` (of 4911). One process, load 7-15.

| pass | median | p95 | worst |
|---|---|---|---|
| cold, first pass | 0.30 ms | 0.88 ms | 8.23 ms |
| warm, second pass | 0.29 ms | 0.84 ms | 2.88 ms (`component/reroca-56-safi108`, `!theme carbon-gray`, 212 skinparams) |

Warm split: build median 0.03 ms, worst 2.44 ms; lookups median 0.257 ms, worst 0.545 ms. D3's default-skin comparison doubles the
lookups unless memoised, about +0.26 ms median. No concern. 0 throws across all 493.

## 6. Verdict on D1-D5 (and D6)

### D1: holds, one contradiction in its input

Builder values match the jar for every element across all `cascade` forms, including the hard ones: `object` under `classDiagram`
default, state choice under `stateDiagram` default, `element` and `root` reaching both.

Contradicted: "Reuse `buildMindmapStyleBuilder` as named". Handed `withPrevious` output it converts inherited skinparams the jar
does not (section 4, `#BBB` vs `#FEFFDD`). The call site must filter.

### D2: contradicted

Quote: "`buildTheme` writes the resolved values to the existing `background`, `backgroundGradient` and
`elements[sname].{background,border,font}`".

One `sname` key cannot hold two signatures. Writing `elements[<symbol>]` from the leaf signature, with `renderer-cluster.ts:185`
preferring it:

| corpus row (conformant today) | colour diffs with the write | jar | ours |
|---|---|---|---|
| `component/foboxa-33-menu312` | 0 -> 3 | `#00F` (`group`) | `#008000` (`element`) |
| `component/nibige-54-voki590` | 0 -> 3 | `#00F` | `#008000` |
| `component/zosuje-43-zebi775` | 0 -> 2 | `#FFE4C4` | `#98FB98` |

That is **stop 4** at T2a. Same collision elsewhere: `note` vs note on link (`sequenceDiagram`, `class__notes-bg-diag`); state's
choice (`activityDiagram`) vs history (`stateDiagram,diamond`).

Measured remedy, no new field: `elements` is `Partial<Record<string, ElementColors>>` (`core/theme.ts:442`), so a distinct key works.
A `group.<symbol>` key from `Cluster.java:290-291`'s signature, read first by `clusterBackground` and `clusterBorder`: corpus 143 rows,
**5 moved, all toward the jar, 0 away**; `component__d2-rect-then-group` 1 -> 0. The rows that improve: `component/banatu-09-koce254`
4 -> 0, `state/lonuti-97-voko521` 8 -> 0, `state/nijugi-19-jazi166` 8 -> 7, `state/niveno-60-tiro789` 16 -> 11, `state/sumiri-68-suvo696`
8 -> 2. Sequence, json, yaml 123 rows: 0 moved.

This needs `diagrams/description/renderer-cluster.ts` in T2a's write-set; T3a owns it and merges after.

### D3: contradicted for elements; headline disagrees with its body

Quote: "write only a value that differs from the default-skin builder's for the same signature; an unchanged value keeps the flat
path". Where the last declaration equals the default, the flat path holds a stale value:

| probe | jar | with D3 as written |
|---|---|---|
| `classDiagram { note #A } note { #B } classDiagram { note #FEFFDD }` | `#FEFFDD` | `#BBB` |
| `note { #AAA } root { #FEFFDD }` | `#FEFFDD` | `#AAA` |
| `component { #AAA } element { #f1f1f1 }` | `#F1F1F1` | `#AAA` |
| `skinparam componentBackgroundColor #AAA`, `root { #f1f1f1 }` | `#F1F1F1` | `#AAA` |
| `state { LineColor #AAA } element { LineColor #181818 }` | `#181818` | `#AAA` |

D3 already says this of the document ("authoritative under the gate, even when the value equals the default"). No regression: all are
wrong today. `class__element-order-*` still go to 0 only because their colours are not the default.

Accidental escape: the comparison is string-sensitive. Skin `#f1f1f1` vs `#F1F1F1` "differs", which passes
`component__d3-*-default`, and `class__element-order-skin-then-default`'s `#F1F1F1`. Comparing parsed colours would break those.

Measured amendment: also write when the flat path already holds that bucket's role (`elements[bucket][role] !== undefined`). Every row
above and `bab` -> 0; corpus unchanged (the same 5 toward, plus the 3 cluster rows of D2 until that is fixed).

Headline vs body: "sources with a `<style>` block or `skin` line" vs "`preprocessed.styles` is non-empty". **27 corpus rows** are gated
through `!theme` alone with no `<style>` and no `skin` line (`pre.styles` holds the theme's blocks). Contract and stop 5 use the headline. Measured
exposure: element write moves 0 of them. Document: builder equals the jar on 26/27, except `json/bitepo-72-vija933` (`transparent` vs
`#FFFFFF`), read from raw `preprocess` rather than through `plugin.styleInput`, the class D1 names, not rechecked.

### D4: holds

"Element signatures come from each element's own Java" is the right rule and the table needs it: state's choice and bars use
`activityDiagram`, note on link uses `sequenceDiagram`, spots use none. A `classDiagram` table must also carry object, map and json:
`class__d5-objectdiag-bare` (a `CLASS` document mixing `class` and `object`) fails if the table is split by row engine. hcl, chronology
and board were not measured here.

### D5: holds, incomplete

"`collectElementStyleBuckets` stops collapsing a foreign diagram prefix" does not close an own-prefix leak:
`classDiagram { object { BackgroundColor #AAA } }` on `object O`: jar `#F1F1F1`, ours `#AAA` (`object__d5-classdiag-object`).
`classDiagram` is the document's own name and foreign to the object's signature. "Foreign" has to mean foreign to the bucket's
signature. `state__scope-state-classdiagram`, `class__scope-note-objectdiagram`, `usecase__d5-usecasediag` stay open until this lands: the
simulation did not implement D5. `collectElementStyleBuckets(styleMap)` (`style-map-element.ts:334`) needs the diagram type; caller
`style-map-theme.ts:114` is in T2a's write-set.

### D6: holds

Builder throws `StyleParsingException` on exactly `sequence__scope-malformed-brace` of 256 rows, nothing else; 0 throws on 493 corpus rows;
`sequence__scope-unknown-sname` does not throw.

## 7. Conflicts with the task specs

1. T2a acceptance "Given `object__cascade-bg-diag` (`classDiagram` selector), then object entities keep their default" is not reachable
   from T2a's write-set: the leak is `renderer-classifier-colors.ts:52` via `classCascadeBackground`. Measured with buckets written: 4 -> 2,
   both object rects. Move it to T3b.
2. T2a needs `renderer-cluster.ts` (D2), or it loses 3 conformant rows.
3. T3c acceptance "each equals `state__cascade-none`" is unreachable for `bg-{diag,root}` without section 3. With section 3 the baseline itself
   drops to 0, and pinned baselines move.
4. T4a's Context says "`root` already works"; activity sites 14 and 15 fail under `root`.
5. T4a acceptance "activity's 449 conformant corpus rows": 0 of the 449 contain `<style>` and 2 pass the gate (`!theme` or `skin`), so holding them proves little about `LineColor`. The authored rows and probes are the evidence.
6. Sites `description/renderer-edge.ts:29` and `state-renderer-transitions.ts:133` read `resolveArrowLabelFont` in `core/`, outside T3a and T3c.
   Both can override locally from `elements.arrow.font` (only the colour differs), so no write-set change is needed.

## 8. Defects found, outside this mission

- `hexagon k` (description leaf): jar draws its `polygon`, ours draws only the text (`component__syms-none`; `renderer-entity.ts:233`
  `hexagonPolygon: null`).
- `note on link` on a description link: jar draws two paths and a text in the link group, ours has none (`component__links-none`).
- `note on link` text on a state link missing (`state__flatnote-none`, `lnk4/text[2]`).
- `<<sdlreceive>>` and state history text, class stereotype text: listed above as sites.
- The `{{ }}` `<style>` hoisting and class-body error page in section 4.
- `state-render-colors.ts:9` and `renderer-pseudostate.ts:103`: "`EntityImageBranch` shares `EntityImageStateCommon.STYLE`" is false (`EntityImageBranch.java:62-63`).
