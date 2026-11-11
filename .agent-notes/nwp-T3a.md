## Observation: klimt factories crash where the jar reports an execution error
- **Context**: nwp T3a, `cov-description-outside` (a nwdiag `description = ...` outside any network).
- **Finding**: upstream wraps every command in `ProtectedCommand` (`core/AbstractDiagram.java:174`, `command/ProtectedCommand.java:54-77`), so a `Throwable` inside `executeArg` becomes `CommandExecutionResult.error("You should send a mail to plantuml@gmail.com with this log (V<version>) " + t)` at the command's line. `packetdiag/PacketDiagramFactory.ts` (and the chart/board factories built on it) let the throw escape, so we draw a crash page over the whole source instead. nwdiag's factory now mirrors `ProtectedCommand` (`protectedDispatch`).
- **Impact**: error pages are conformant as pairs, so no gate sees it; a cleanup PR could port `ProtectedCommand` once for every klimt factory.
- **Confidence**: High

## Observation: oracle-render.sh writes relative to each input's directory
- **Context**: re-rendering probes into `tests/fixtures/nwdiag/`.
- **Finding**: `scripts/oracle-render.sh tests/fixtures/nwdiag tests/fixtures/nwdiag/*.puml` put the SVGs in `tests/fixtures/nwdiag/tests/fixtures/nwdiag/` — the jar's `-o` is resolved against each input file's directory.
- **Impact**: pass an absolute out-dir (`$PWD/tests/fixtures/nwdiag`).
- **Confidence**: High
