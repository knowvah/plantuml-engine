# dss-T3d observations

## Observation: a frame's signature needs a key apart from the flat symbol bucket
- **Context**: Routing activity frames through T2a's `rectangle`/`card` rows.
- **Finding**: `skinparam rectangleBackgroundColor` fills `elements.rectangle` with no `<style>` in the source, so a reader cannot tell it from a merged value. The jar takes whichever of it and `PartitionBackgroundColor` came last; the flat path has always answered Partition. Reading the bucket first would flip the rect-then-Partition order away from the jar. `compositeBucketOf` (`composite.<symbol>`) is written only behind the gate.
- **Impact**: T4a reads frame lines from `elements[compositeBucketOf(symbol)].border`; `elements.partition` no longer exists.
- **Confidence**: High (jar probes in both orders).

## Observation: no-style frame skinparams lose their order
- **Context**: Same probes.
- **Finding**: `skinparam PartitionBackgroundColor #B` then `skinparam rectangleBackgroundColor #A` on `rectangle R`: jar `#AAA`, ours `#BBB`; same for FontColor. Under D3 the source stays on the flat path, which holds no order.
- **Impact**: Fixing it needs the gate opened for these keys or a new Theme field. Left open.
- **Confidence**: High for the bytes.

## Observation: `<style>` is positional in activity, a bucket is not
- **Context**: Byte-check mover `unknown/dijapi-54-jiza111`.
- **Finding**: Two `<style>` blocks around two `while`s: the jar paints the first diamond `#E0FFFF`, the second `#FFC0CB`, since `InstructionWhile.java:102` keeps the builder current at the command (`ActivityDiagram3.java:398`). The scope snapshot is the last builder, so ours paints both `#FFC0CB`. D2's stated consequence.
- **Impact**: 227 -> 226: the second diamond is right, the first stays wrong under a different colour.
- **Confidence**: High.

## Observation: parser gaps on activity colour tiers
- **Context**: Probing the inline and stereotype tiers against the jar.
- **Finding**: `note left <<foo>> : n` (`CommandNote3.java:71-80`) and `fork <<#red>>` (`CommandFork3.java:60-64,87`, read at `FtileBlackBlock.java:105-106`) draw in the jar and refuse in ours, routing to a syntax-error page. `:a| <<foo>>` is a jar syntax error and draws in ours. `partition { .foo { } }` writes no flat bucket (`ELEMENT_BUCKET_SNAMES` has no `partition`) and `skinparam activityFontColor<<foo>>` writes no `fontByStereo` (jar `#DDD`/`#EEE` and `#BBB`, ours keep the plain colour).
- **Impact**: Each needs its own row; none of them moves on a reader change.
- **Confidence**: High for the bytes; the two flat writers from a theme dump, not from a fix.

## Observation: `FontColor transparent` needs `color: null`, not a colour string
- **Context**: A jar probe on transparent values.
- **Finding**: `DriverTextSvg.java:92-93` draws no text; `driver-text-svg.ts` guards on `font.color === null`. Activity's configurations carried `#00000000`, which printed `fill="none"` text. A reader that builds a `FontConfiguration` from a resolved string has the same gap.
- **Impact**: The other engines' rows with a transparent font (`component__probe-font-transparent`) may share it.
- **Confidence**: High for activity, Medium for the others.
