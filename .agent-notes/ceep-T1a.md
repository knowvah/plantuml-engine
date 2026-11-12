## Observation: getDotStrings IS reached through svek (D1 premise is partly wrong)
- **Context**: T1a, quoting the grep D1 asks for (AbstractEntityDiagram members unreached by Chen).
- **Finding**: `CucaDiagramFileMakerSvek.java:83` passes `diagram.getDotStringSkek()` to the image builder, and `net/atmp/CucaDiagram.java:399-415` builds it from `getDotStrings()`, keeping the `nodesep`/`ranksep` (and `layout`) entries. `DotStringFactory.java:140-144` then replaces their values, so only their presence and order reach the DOT. `getDescription` (Pipe/SourceStringReader/SourceFileReaderAbstract only) and `packSomePackage` (ClassDiagram.java:85, DescriptionDiagram.java:94 only) are unreached.
- **Impact**: D1's decision (extend CucaDiagram, no AbstractEntityDiagram class) holds, but ChenEerDiagram must port `getDotStrings` (AbstractEntityDiagram.java:60-71, incl. the GRAPH_ATTRIBUTES pragma line, which getDotStringSkek then filters out). T2c reads `getDotStringSkek()`, not a hard-coded pair.
- **Confidence**: High

## Observation: Chen registers the regex CommandRankDir, not UBrexCommandRankDir
- **Context**: ChenEerDiagramFactory.java:60 adds `new CommandRankDir()`; activity uses `UBrexCommandRankDir`.
- **Finding**: the port had only the UBrex form. `CommandRankDir` (regex, `left[%s]to[%s]right`) was ported to `src/core/command/CommandRankDir.ts`; the two differ on whitespace (`left  to right direction` with two spaces).
- **Impact**: other engines whose Java factory registers `CommandRankDir` (state, description, class) still use their own inline handling; not touched.
- **Confidence**: High
