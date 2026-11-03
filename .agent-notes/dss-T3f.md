## Observation: state runs three parser passes, and an attached note is on the third
- **Context**: dss T3f, row `state__probe-note-in-link-after`: `ent` ids differed on a note followed by any link.
- **Finding**: `StateDiagramFactory.java:97-100` gives `CommandFactoryNoteOnEntity` `ParserPass.THREE`; links and link notes are TWO (`:105`, `CommandLinkStateCommon.java:71`). So every attached note's entity (`GMN` tick, entity tick, `Link` tick) comes after every link in the document. The port had merged TWO and THREE under a claim that no fixture needed it. `CucaDiagram#startingPass` (`:160-166`) also resets `lastEntity` per pass, so `A --> B` then `note left : k` refuses "Nothing to note to" in state and the jar falls to sequence.
- **Impact**: `Pass` is now `'one'|'two'|'three'`; a new state command must list all three if it is structural. `lastEntity` on THREE is the last declaration replayed, never a link's state.
- **Confidence**: High (jar probes, rows).

## Observation: a note's Opale needs one link, a node host and one bezier; otherwise a dashed line is drawn
- **Context**: rows `state__probe-note-in-{same-side,out-host,on-cluster}`.
- **Finding**: `GraphvizImageBuilder.java:133-148,245-259` plus `SvekEdge.java:769-770,833-834`. A note on a cluster composite has no `SvekNode` host, so it is a plain box with a dashed `<g class="link">` whose path id is `GMN<n>-<host>` (or `<host>-GMN<n>` for right/bottom), `lnk` = note tick + 1. `state-note-layout.ts#groupNotes` (one node per same-side host, copied from class) was never true for state and is gone.
- **Impact**: `state-note-lines.ts#noteLinesOf` owns this. `Entity.isAutarkic` also reads note links: a note in `A` on a state outside `A` makes `A` a cluster.
- **Confidence**: High (rows 0 diffs).

## Observation: a note body keeps relative indent, blank lines and trailing spaces
- **Context**: `state/joleju-94-maru748`, `state/xeziki-47-zomo866`, `state/xupefu-98-roni234`.
- **Finding**: `parser.ts#nonBlankLines` trims and drops blanks; the note commands read `BlocLines#removeEmptyColumns` (`BlocLines.java:234-263`) on the raw lines. A leading space then draws as an `x` shift (`DriverTextSvg.java:114-126`), and a link note must take the same line builder (`state-note-layout.ts#buildRenderLines`), since its old plain split drew the space inside `textLength`.
- **Impact**: any other multi-line state command reading trimmed lines is suspect (`CommandMultilines2`).
- **Confidence**: High.

## Observation: a `||` separator inks past the composite box
- **Context**: `state__probe-note-in-concurrent-bars`, height 120 vs 124 with no note at all.
- **Finding**: `ConcurrentStates.java:75-89` draws a `ULine` `DASH` past the content; `LimitFinder.java:179-182` folds both ends, no inset. `layout-ink-extent.ts#addNodeInk` did not.
- **Impact**: any `||` composite whose separator reaches the document's bottom.
- **Confidence**: High.

## Observation: open state defects found here, unrelated to colours and not fixed
- **Context**: probes around T3f, all with jar oracles in scratch.
- **Finding**: (1) A note used as a link endpoint (`note as N`, `B --> N`): the parser auto-creates a state `N`; the jar links to the note and an Opale can result. 0 corpus sources hold it. `dlabel` 23 diffs, `dlabel3` 20. (2) A cluster composite with `--` regions (`state A { B -- C }`, `D --> B`, no note at all): 20 diffs; the jar draws region members flat with no wrapper, `state-composite-cluster.ts#buildConcurrentRegionLeaf` draws a dashed-rect fallback. A note in such a region inherits it (33 diffs). (3) `state/dajipi-09-doki542` 7 remaining: note and state `[[url]]` wrappers (`childCount`), not positions.
- **Impact**: separate tracked missions.
- **Confidence**: High for (1), (2) measured; (3) from the diff paths.

## Observation: the session scratchpad is shared between agents
- **Context**: `git archive` into `<scratchpad>/base`, which already held another agent's baseline.
- **Finding**: names like `base`, `before.json`, `after.json` collide across tasks of one session.
- **Impact**: use a per-task subfolder (`<scratchpad>/T3f/`).
- **Confidence**: High.

## Observation: `!theme plain` is a style margin; a state box reads no LineThickness
- **Context**: `state/somuke-94-buzi673`, `state/sugico-41-vase848`, 142 diffs each.
- **Finding**: `themes/puml-theme-plain.puml:36-43` sets `root { LineThickness 1; Margin 5 }`. Reading `theme.diagramMargin` (`TextBlockExporter.java:510-516`) takes both to 4. The 4 left are `stroke-width` 0.5 vs 1 on the two leaf `rect`/`line` pairs: `renderer-box.ts` draws `STATE_BORDER_STROKE_WIDTH`, and no state reader takes `LineThickness`.
- **Impact**: a state follow-on; every `!theme` that sets `LineThickness` carries it.
- **Confidence**: High for the margin (measured), Medium for the thickness root (diff paths plus the theme line; the Java read path not traced).

## Observation: a style margin also applies under a mainframe, outside the frame ink
- **Context**: row `state__x-margin-mainframe`.
- **Finding**: `calculateMargin` has no mainframe branch. `frameInk` stays in the frame's own coordinates; only the drawing moves by `(left, top)`, and `chrome-export.ts` removes and re-applies it around chrome.
- **Impact**: `class/layout-ink-extent.ts`'s comment "Not applied under a mainframe" does not describe a different result: `class` + `mainframe` + `root { Margin 10 }` measured 0 diffs in scratch.
- **Confidence**: High.
