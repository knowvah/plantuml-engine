# bep (board-engine-port) observations

## Observation: scaled chrome text double-rounds on klimt titled engines
- **Context**: T3b, `cov-scale-2-{footer,header,legend}` at 1 diff each.
- **Finding**: A `drawBodyAt` fragment without `numbersDeferred` gets its chrome strings formatted at scale 1, then `TextBlockExporter.ts#scaleToken` multiplies the formatted value and rounds again. `ftr` at size 10 is 8.8125 → "8.813" → ×2 = 17.626; the jar formats 17.625 once. Setting `numbersDeferred` when `isExportScaled` (as description does) fixes it: `applyChrome` draws deferred and `exportTo` formats once.
- **Impact**: packet, mindmap and wbs reproduce it today (measured 2026-11-05); chart, salt and gantt share the code shape. Follow-on 1 in `planning/next-missions.md`, bep section.
- **Confidence**: High

## Observation: CommandBoardPlus does not trim
- **Context**: T2, the brief said "matched on the trimmed line".
- **Finding**: `CommandBoardPlus` calls `super(false, ...)` (doTrim false, CommandBoardPlus.java:51). An indented `  +  B` is a new activity labelled `+  B` in the jar (`cov-grid-whitespace` oracle). Other `SingleLineCommand2(false, ...)` users exist upstream; check the constructor before assuming `trin`.
- **Impact**: briefs that say "trimmed" for a SingleLineCommand2 need the constructor checked.
- **Confidence**: High

## Observation: an "x;y" key never collides under String.hashCode in practice
- **Context**: T4 coverage of `BArray`'s equals callback.
- **Finding**: no two distinct `"x;y"` keys with x, y in 0..399 share a `String.hashCode`; `javaHashSetOrder`'s equals is unreachable for board keys. `Object.is` is passed instead of a lambda.
- **Impact**: none on output; explains why no board test reaches a same-hash bucket compare.
- **Confidence**: High
