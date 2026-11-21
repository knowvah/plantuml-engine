# Upstream #2846 (399471171e8) CommandPackage two-branch regex

## Observation: class `package` lines CommandPackage refuses fall to CommandPackageWithUSymbol
- **Context**: porting the CODE_BAREWORD/QUOTED_DISPLAY RegexOr.
- **Finding**: `ClassDiagramFactory.java:127-130` registers CommandPackage, CommandEndPackage, CommandPackageEmpty, CommandPackageWithUSymbol in that order. `package foo-bar {` (any char outside `[\p{L}\p{N}_.$]`) now reaches CommandPackageWithUSymbol, which displays the stereotype UNGATED (`<<Frame>>` drawn as «Frame», not a frame shape) and stamps the `package` keyword's USymbol (an empty one collapses to a package leaf). The port's class rule 5b' now carries `package`. `+package foo-bar {` matches no class command (jar: syntax error).
- **Impact**: only `class/curuju-86-laci922` and `class/soxufo-20-labi810` (`package Purchase as Pu {`) take the new route in the corpus; same output either way.
- **Confidence**: High (jar probes)

## Observation: `package "" as p {` is ACTIVITY's (CommandPartition3), and the description port over-accepts it
- **Context**: re-pinned jar draws `empty-package-title.puml` as "Syntax Error? (Assumed diagram type: activity)" at line 3.
- **Finding**: `CommandPartition3.java:77-90` takes `package "" as p {` (NAME `.*?` = `"" as p`); a two-line empty `package "" as p {`/`}` renders ACTIVITY. The description port's `CONTAINER_OPEN_RE` (`parse-helpers.ts`, `(.*?)` head) accepts the line although upstream's CommandPackageWithUSymbol head (`DISPLAY1 [%g].+?[%g]`, CODE8 `[%g][^%g]+[%g]`, CODE9 `[^#%s{}%g]*`) refuses it, so ours reports "Assumed diagram type: component" and the two-line form renders DESCRIPTION.
- **Impact**: description container head needs a faithful CommandPackageWithUSymbol port (separate task).
- **Confidence**: High

## Observation: class gaps surfaced by the group2846 fixtures
- **Context**: `bug.puml` / `correct_code.puml` (`+package ... <<Frame>> {`) keep 9 diffs; `skinparam packageStyle rectangle` + `package foo-bar {` 2 diffs.
- **Finding**: (1) the visibility icon `ClusterHeader.java:130-138` merges into the title is drawn only on the folder path, not on USymbol `asBig` clusters (frame). (2) a CommandPackageWithUSymbol `package` group's USymbol is `packageStyle.toUSymbol()` at parse time (`USymbols.java:103-104`); the class port keeps keyword `package`, so under `rect` it draws the package_ style stroke (#000/1.5) instead of RECTANGLE's (#181818/1). packageStyle node/card/... is unported in class altogether.
- **Confidence**: High (observed diffs), mechanism read from Java

## Observation: oracle-render.sh nests output under a relative out-dir
- **Context**: `scripts/oracle-render.sh tests/fixtures/x tests/fixtures/x/*.puml`.
- **Finding**: the svgs landed in `tests/fixtures/x/tests/fixtures/x/`. An absolute out-dir (`/tmp/...`) with the same relative puml paths did not nest. Pass an absolute out-dir.
- **Confidence**: High
