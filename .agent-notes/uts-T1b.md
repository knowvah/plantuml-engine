## Observation: a usecase is an EntityImageDescription, not EntityImageUseCase
- **Context**: uts T1b (#148), porting the usecase title style.
- **Finding**: `GeneralImageBuilder.java:169-175` builds `EntityImageDescription` for `USECASE`/`USECASE_BUSINESS`; `EntityImageUseCase` is never constructed in `src/main/java/net/`. A usecase reads `styleTitle` (`{…, usecase[, business], title}`) on the entity's builder (`Entity.java:755-767`). Dropping the usecase special cases in `description-entity-style.ts` moved no usecase/component/c4/unknown verdict or diff count.
- **Impact**: any remaining code or comment citing `EntityImageUseCase` as live describes a dead class; check before porting from it.
- **Confidence**: High

## Observation: class-engine description leaves read flat tiers, not merged styles
- **Context**: uts T1b push-forward probe `skin-title-allowmixing`.
- **Finding**: with `allowmixing`, the class engine strokes a usecase/actor through `renderer-usymbol-entity-style.ts#resolveForecolor`/`#resolveStroke` (flat `theme.colors.elements` tiers), so any style only reachable through the `StyleBuilder` (e.g. `title*` skinparams, `FromSkinparamToStyle.java:166-169`) is missed. 61 diffs; filed #195.
- **Impact**: description-engine style fixes do not carry over to mixed-in leaves of a class diagram.
- **Confidence**: High

## Observation: stylePaint returns the long hex form
- **Context**: writing T1b's unit test.
- **Finding**: `stylePaint(style, 'LineColor')` for `red` returns `#FF0000`; the SVG writer shortens it to `#F00` in the output. Assert long forms in unit tests that read styles directly.
- **Impact**: avoids a false red when asserting oracle colours on a `Style`.
- **Confidence**: High
