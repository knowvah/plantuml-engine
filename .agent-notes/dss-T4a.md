# dss-T4a observations

## Observation: a stacked note ignores its `<<stereotype>>`
- **Context**: Porting `note left <<foo>> : n` (`CommandNote3.java:76-79`) with jar probes.
- **Finding**: `FtileWithNoteOpale.java:135-138` signs the style `withTOBECHANGED(stereotype)`; `FtileWithNotes.java:105-110` (two or more notes on one instruction) does not. A second note on the same instruction turns the first into the stack, which drops its stereotype too. The first attempt (stereotype on every note) put `#AAA` on stacked notes the jar draws `#FEFFDD`.
- **Impact**: `GtileNote.stereotype` is read only by the single-note wrap (`walkNoteOpale`); `StackedNote` carries none. A bare note leaf (`FtileNoteAlone`) never reads it either.
- **Confidence**: High (jar row `activity__stereo-note`).

## Observation: the note single-line and multi-line commands order colour and stereotype differently
- **Context**: Jar error page on `note right #red <<foo>>` (multi-line).
- **Finding**: `CommandNote3` is `color`, tags, `STEREO`, `:`; `CommandNoteLong3` is tags, `STEREO`, `color` (`CommandNoteLong3.java:131-141`). The opposite order is a jar syntax error.
- **Impact**: `RE_NOTE_SINGLE`/`RE_NOTE_MULTI` use named groups `stereo`, `color`, `text` so the order lives in the regex alone.
- **Confidence**: High.

## Observation: `fork;` and `fork <<#color>>` share one command; both bars and a merge's top bar take the colour
- **Context**: `CommandFork3.java:60-64,87`.
- **Finding**: the regex is `fork;?` then an optional stereogroup. `Stereogroup#getInnerColors` keeps only `#x` (BACK) for the bar; `fork <<foo>>` names no colour, so `activityBar { .foo }` never reaches it (jar and ours agree: row `activity__stereo-fork`). `ParallelBuilderFork.java:87,111` and `ParallelBuilderMerge.java:76` hand `colors` to every `FtileBlackBlock`.
- **Impact**: `GtileFork.barColor` is set by `tileFork` after construction (the constructor is at the 5-parameter cap).
- **Confidence**: High.

## Observation: a branch's first arrow, its trailing arrow and a leading arrow-only body are read by each `if` builder from the tile, not the AST
- **Context**: `-[#color]->` as the first element of an `if` branch drew in the default colour (jar: the colour).
- **Finding**: the jar reads the diamond-to-branch colour off the branch's first tile (`Branch#getInColor`, `Branch.java:163-178`; `FtileIfDown.java:135`; `FtileIfLongHorizontal.java:211,245`; `FtileIfLongVertical.java:178`, whose last `else` uses the plain arrow colour; `FtileWhile.java:153`; `FtileRepeat.java:172`). Our branch tile never carried the first node's `inLabel`. The trailing arrow is `Branch#getOut` (`InstructionIf.java:165-197`): `endif` with no `else` gives the new empty `else` the pending arrow as its `special` while the last branch keeps it as in-link, so both colour. The AST now repeats that arrow (colour only) on the absent `else`.
- **Also**: an arrow is no instruction (`Branch.isEmpty` is `InstructionList#isEmpty`), so a branch of arrows only is empty, a leading note after an arrow still belongs to the `if`, `detach` after `endif` skips an arrow-only branch (`InstructionIf.java:204`), and `-> text;` before the first instruction relabels the branch (`Branch#getDisplayPositive`, `Branch.java:228-236`).
- **Impact**: `applyInColor`/`applyOutColor` (`tile-layout-inlabel.ts`) are the colour halves of the label appliers, called once per builder after the edge is pushed; `GtileIfDown.elseColor` carries `FtileIfDown.create`'s `elseColor`. The corpus holds no such source: the byte check moved nothing.
- **Confidence**: High (22 jar rows `activity__inline-*`).

## Observation: `partition { .foo { } }` needed a bucket, `PartitionBackgroundColor` must not get one
- **Context**: `ELEMENT_BUCKET_SNAMES` has no `partition`.
- **Finding**: adding it would make `matchElementColorKey` claim `skinparam PartitionBackgroundColor` as `elements.partition`, a second path beside `graph.partitionBackground`. `STYLE_ONLY_BUCKET_SNAMES` (`style-map-element.ts`) is consulted by the `<style>` selector resolver alone.
- **Impact**: only `<style>` sources write `elements.partition.*ByStereo`; no skinparam source moves.
- **Confidence**: High (byte check: four movers, all stereotype `LineColor` on a `<style>` source).
