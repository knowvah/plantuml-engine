# ugs-T1b — scaled USymbol group draws in layout units

## Observation: class ELK path ignores `scale` entirely
- **Context**: push-forward probe of the ELK USymbol cluster path under `scale 2` (ugs T1b, #149).
- **Finding**: `!pragma layout elk` + `scale 2` renders the class document unscaled — root `width` 291 vs jar 582 for
  `node N {}`/`database D {}`/`rectangle R {}`, and 68 vs 136 for two plain classes (206 diffs). At `scale 1` the same
  sources are 0 diffs. `renderer-elk.ts`/`class-elk-layout.ts#layoutClassElk` never resolve a scale factor; only the
  svek path calls `resolveClassScaleFactor` + `scaleClassGeometry` (`layout.ts:487-490`).
- **Impact**: any class/ELK fixture with `scale` diverges wholesale; separate from #149 (filed in ugs T2).
- **Confidence**: High

## Observation: class ELK refuses `package X <<Node>>`
- **Context**: same probe.
- **Finding**: `package N <<Node>> {}` under `!pragma layout elk` renders our error page "stereotyped packages not yet
  supported in class diagrams"; the keyword form (`node N {}`) works.
- **Impact**: ELK probes of USymbol groups must use the keyword form.
- **Confidence**: High

## Observation: renderNamespaceUSymbol now owns the scale
- **Context**: D1.
- **Finding**: `renderNamespaceUSymbol` unscales geo + theme when `theme.scaleK !== 1` and passes `scale: k` to
  `renderDrawableToFragment`; callers pass the round corner UNSCALED (`renderer.ts#renderNamespace`). Any new caller
  handing a pre-scaled corner would double it.
- **Impact**: the folder/rect paths still apply their own `scaleK`; only the USymbol path changed.
- **Confidence**: High
