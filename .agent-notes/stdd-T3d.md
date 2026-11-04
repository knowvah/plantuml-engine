# stdd T3c/T3d — state composites and small reads (2026-11-04)

## Observation: SvgGraphics re-opens the active `<a>` inside every nested group
- **Context**: `[[url]]` on a composite state (kenuci-20, dajipi-09, dapunu-39).
- **Finding**: `SvgGraphics#startGroup` calls `closeTopActiveLinkIfNeeded()` then `addTopOpenedLinkIfNeeded()`
  (`klimt/drawing/svg/SvgGraphics.java`, `startGroup`/`openLink`/`closeLink`), so a child entity, a `<g class="link">`
  and even the `<!--link ... -->` comment drawn while a parent's url is open each get their OWN `<a>` copy of that
  url, unless the child opens its own. `renderer.ts#StateRenderCtx.activeUrl` mirrors this.
- **Impact**: any engine porting `ug.startUrl` around a group with nested groups must thread the active link down.
- **Confidence**: High (jar `in.svg` of the three fixtures).

## Observation: a leaf's name block is aligned by the `state` style, a composite's title by `state.name`
- **Context**: dapuko-98 two-line leaf name, second line at x=29 (jar) vs centred (ours).
- **Finding**: `EntityImageStateCommon.java:75-78` creates the name with `getStyleState().getHorizontalAlignment()`
  (`root { HorizontalAlignment left }`), and centres the BLOCK (`EntityImageState.java:150-152`);
  `InnerStateAutonom.java:91` and `ClusterHeader.java:156` use the `name` zone (`HorizontalAlignment center`).
- **Impact**: multi-line leaf names are left-aligned inside a centred block; composite titles centre per line.
- **Confidence**: High.

## Observation: `state X {` resets the group's stereotype; a single-line note ignores its url
- **Context**: pesita-10 (`State AA <<O-O>>` then `state AA {` draws no symbol); dajipi notes.
- **Finding**: `CommandCreatePackageState.java:178-179` `p.setStereotype(stereogroup.buildStereotype())` is unconditional
  (`null` without a stereotype). `CommandFactoryNoteOnEntity.java:180-183`: the single-line note form parses `[[url]]`
  and never applies it; only the multi-line opener does (`:241-244,336`).
- **Impact**: the parser mirrors both; do not "fix" either as a port bug.
- **Confidence**: High.
