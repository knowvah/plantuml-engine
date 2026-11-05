# T2a — Commands and factory

**Read:** `packetdiag/command/*.java` (all 8), `PacketDiagramFactory.java:69-93`, `command/CommonCommands.java#addCommonCommands1`, `chart/ChartDiagramFactory.ts` and `chart/command/*.ts` (the port's command shape), cep D6 on transcribing `RegexLeaf` (`plans/chart-engine-port/decisions.md`).

**Do:**

1. One file per command, each exporting its pattern built from the `RegexConcat` leaves in order. `RegexLeaf.spaceZeroOrMore` is `[ \t\n\x0B\f\r ]*`, not `\s`; the patterns are `CASE_INSENSITIVE` without `UNICODE_CASE`, so JS `i` without `u`.
2. `CommandNumRange`: the three-way `RegexOr` in order (`RANGE_UNIT` before `RANGE` before `\*`), lazy `DESC`, optional `ATTRIBUTE`, and `getIntAttribute`'s fallback on a non-integer. Only `len`, `rotate`, `height` are read (D6). `Integer.parseInt` on 7 digits never overflows; keep the `NumberFormatException` arms as Java has them. `executeArg` calls `NwDiagram.toSet` (T1a).
3. `CommandPacketDiagStart` matches `(packetdiag)?\s*\{?` and `CommandPacketDiagEnd` `\s*\}?\s*`: both match an empty line, and `CommandPacketDiagEnd` a lone `}` anywhere. Mirror the registration order in `initCommandsList`, `addCommonCommands1` first.
4. `PacketDiagramFactory.ts` mirrors `ChartDiagramFactory.ts` (D2) with `DiagramType.PACKET`.

## Acceptance
- Given each of the 62 vega sources, when parsed, then the 5 jar-error sources (`R07.01`, `R07.02`, `R11.01`, `R23.01`, `error-with-exception`) fail or crash and the other 57 parse; line numbers of the refusals match the oracle's `Error line` in `/tmp/pkt-plan/vega-render.log` (re-render with `scripts/oracle-render.sh` if `/tmp` was cleared).
- Given `* A [len = 4]` after `0-7: X`, then the item spans 8 to 11; given `5: Y [len=abc]`, then `len` falls back to 1.
- Given `colwidth = 1234`, then the line is refused (`\d{1,3}`); given `scale_direction = RTL`, then it is accepted case-insensitively.

Observability N/A. Rollback Reversible.
