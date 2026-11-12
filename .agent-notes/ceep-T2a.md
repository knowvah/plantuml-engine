## Observation: Style#getStroke(Colors) is not ported
- **Context**: porting EntityImageChen*.drawU, which calls `getStyle().getStroke(getEntity().getColors())`.
- **Finding**: `src/core/style/Style.ts` header lists `getStroke(Colors)` as not ported. The Java is
  `colors.getSpecificLineStroke()` else `getStroke()` (Style.java:322-328); `Colors#getSpecificLineStroke` exists.
  Inlined as `getStroke` in `src/core/svek/image/EntityImageChenSupport.ts`.
- **Impact**: a later task needing the same overload should hoist it onto `Style` rather than copy it again.
- **Confidence**: High

## Observation: ChenEerSkinParam lacked a member of LeafImageSkinParam
- **Context**: passing `diagram.getSkinParam()` to the Chen images (`AbstractEntityImage` takes `LeafImageSkinParam`).
- **Finding**: `LeafImageSkinParam` requires `useOctagonForActivity`, which batch 1's Chen skin param omitted
  ("activity-only"). Added the member as SkinParam.java:1031-1047 writes it. No Chen image calls it.
- **Impact**: none for output; T2c/T2d can pass the skin param straight to the images and to
  `createEntityImageBlockInternal`.
- **Confidence**: High

## Observation: the ID group prints as a bare `<g>` in the jar and in ours
- **Context**: asserting the oracle fragments of the four images.
- **Finding**: `UGroup.singletonMap(ID, quark.toStringPoint())` yields `<g>` with no attributes in the oracle SVG, and
  `UGraphicSvg` prints the same. `tests/helpers/legacy-leaf-images.ts#drawnAt` mis-strips such a group (it removes the
  first bare `<g>`), so `tests/helpers/chen-leaf-images.ts#drawnBody` cuts at the root `<g font-family` instead.
- **Impact**: reuse `drawnBody` for any Chen image test; no URL is reachable (no Chen command sets one), so the
  `startUrl`/`closeUrl` branch of `drawU` is ported but untested.
- **Confidence**: High
