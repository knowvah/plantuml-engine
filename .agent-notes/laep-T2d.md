## Observation: the jar drops a link whose leaf sits inside an autarkic group
- **Context**: rendering probe `lap-inner-brace` (`(*) --> {`, `A --> B`, `}`, `--> (*)`) with `scripts/oracle-render.sh`.
- **Finding**: stderr shows `IllegalStateException` at `Bibliotekon.getNodeUid` (Bibliotekon.java:137) via `SvekEdge.java:249`. The `--> (*)` link starts at `B`, which the root pass never prints; `GraphvizImageBuilder.java:260` catches, logs and drops it. The SVG is still produced (end circle beside start, one edge). The exception is expected output, not a failed render.
- **Impact**: a stack trace on stderr from `oracle-render.sh` is not a failure for this engine; the port mirrors the skip in `activity-legacy-dot.ts#buildEdges`.
- **Confidence**: High

## Observation: an inner activity nested in an inner activity crashes the jar
- **Context**: probe `(*) --> {`, `A --> {`, `B --> C`, `}`, `}`, `--> (*)`.
- **Finding**: the jar draws an error page (`UnsupportedOperationException`, `Entity.checkGroup` via `Cluster.getStyle`, Cluster.java:388), after printing two svek DOTs.
- **Impact**: ours errors too (conformant by the error-page ruling); do not try to draw it.
- **Confidence**: High
