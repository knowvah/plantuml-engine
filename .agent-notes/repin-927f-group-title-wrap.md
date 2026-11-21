# Group title wrap (upstream 927f7531ddf, f29aa9bd058)

## Observation: no shared ClusterHeader title function across families
- **Context**: porting `ClusterHeader.java:129` `create9(..., style.wrapWidth())`.
- **Finding**: the group title is built in four places: description `renderer-cluster.ts#buildHeader` -> `EntityImageDescriptionClusterTitle.ts#buildClusterTitle` (real `Display#create9`), class `class-namespace-title-runs.ts#namespaceTitleLines` (folder/rect/empty leaf, hand-built runs) plus `class-namespace-usymbol-shape.ts` (`buildTextBlock`), legacy activity `core/svek/ClusterHeader.ts`, and state's own `state-composite-header.ts`. A state composite title does NOT wrap in the jar (`Cluster.drawUState` draws its own title), so state needed no change.
- **Impact**: any further `ClusterHeader` title change needs all four sites.
- **Confidence**: High

## Observation: class folder titles centre each stripe
- **Context**: `package_maximum_width` (group2995) wrapped title.
- **Finding**: the title block is a `SheetBlock1` with the title style's CENTER, placed at `(4, 2)` by `USymbolFolder#asBig`; each stripe is centred on the block width. The port's folder paths drew every line at the block's left; now centred (`renderNamespaceFolder`, `renderFolderLeaf`, `folderTitlePlacement`). Jar-checked also without wrap on a `\n` title (`package "short\nmuch longer line here"`): 0 diffs.
- **Impact**: multi-line class package titles.
- **Confidence**: High

## Observation: description folder leaf ignores a style-only MaximumWidth in the DOT size
- **Context**: authored `<style> package { MaximumWidth 100 }` + an empty `package "..." {}` in a description diagram.
- **Finding**: the jar draws it as an `EntityImageDescription` folder leaf whose desc wraps; the port's renderer wraps it but `leaf-sizing.ts#measureFolderLeaf` sizes the DOT node unwrapped (3.73in vs the jar's 1.497in). With `skinparam wrapWidth 100` the row is conformant, so only the style-only path is missing. Pre-existing, not part of 927f/f29a.
- **Impact**: 64 diffs on that authored row; a separate fix in description leaf sizing.
- **Confidence**: Medium (DOT compared by hand; mechanism inferred from skinparam vs style behaviour)

## Observation: catalog drift at 031df9d66
- **Context**: `npm run catalog` after adding `class-namespace-title-wrap.ts`.
- **Finding**: the regenerated catalog also added `PythonLine.ts` and `VariableAlias.ts`, which were missing at the base commit.
- **Impact**: the catalog drift gate would fail on the base commit.
- **Confidence**: High
