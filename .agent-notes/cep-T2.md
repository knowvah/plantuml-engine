## Observation: gantt and salt transcribe CommandPage too narrowly
- **Context**: Porting `addCommonCommands1` for the chart factory (cep T2c).
- **Finding**: `CommandPage.java:61` has `x*`, so `page 2 3` and `page 23` match. `GanttDiagramFactory.ts:73` and `PSystemSaltFactory.ts` require one `x` and treat the command as a no-op, so they also skip `page 0x1`'s `Argument must be positive`.
- **Impact**: Those two engines refuse or accept differently from the jar on these lines. Not changed by cep; a cleanup for their own bucket.
- **Confidence**: High (read the Java; the two engines' behaviour not probed against the jar)

## Observation: other private double parsers remain
- **Context**: D4 moved Java's number text into `core/java-number-format.ts`.
- **Finding**: `sax-text-image-use-decode.ts` and `style-line-style.ts` keep private `parseDouble`-shaped parsers, left alone per D4.
- **Impact**: A later refactor could point them at the core module.
- **Confidence**: High
