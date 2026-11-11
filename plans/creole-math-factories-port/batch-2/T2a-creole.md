# T2a — `PSystemCreole` and its factory

Read [D2](../decisions.md#d2--one-package-per-upstream-package-plugins-as-the-utility-factories-register) and
[task-contract.md](../task-contract.md).

**Java:** `klimt/creole/legacy/PSystemCreole.java` (`getTextBlock`, :80-86), `PSystemCreoleFactory.java`,
`skin/SkinParam.java#sheet`. The factory ignores the `startLine` argument, and every line (including `title`, `scale`, `<style>`,
any `skinparam`) is just a creole line (`cov-creole-title`, 218×99). Fonts: `UFontFactory.serif(14)`,
`FontConfiguration.blackBlueTrue`. `SkinParam.create(getMd5map(), PathSystem.fetch(), DiagramType.SEQUENCE,
Pragma.createEmpty(), option)` is a fresh skin param, so no diagram command can reach it. Check how the existing creole
users supply their skin param. The planning prototype used `wire-skin-param.ts#SkinParam` with `Pragma.createEmpty()` and matched
7 rows at 0 diffs; a minimal `ISkinSimple` of your own is an equally valid seam (no engine-private imports, `tests/architecture/layering.test.ts`).

**Write:** `src/core/klimt/creole/legacy/PSystemCreole.ts`, `PSystemCreoleFactory.ts`, `tests/unit/factories/PSystemCreole.test.ts`.

`PSystemCreole extends UgDiagram` (`src/core/UgDiagram.ts`): `getTextBlock` builds `Display.create(lines)`, then
`skinParam.sheet(fc, LEFT, CreoleMode.FULL).createSheet(display)`, wrapped in `new SheetBlock1(sheet, LineBreakStrategy.NONE, atomOps,
ClockwiseTopRightBottomLeft.none())`. Plugin shape: the `singleLinePlugin` precedent, `factoryBase: 'PSystemBasicFactory'`, using
T1a's `createSystem`.

**Interface output** (consumed by T3a): `creolePlugin: SyncPlugin`. Export type: not a `TitledDiagram`, no `data-diagram-type`
(`bibeso-63-kazo655`).

## Acceptance
- Given `bibeso-63-kazo655`, when rendered through the plugin, then `compareSvg` against its oracle is zero diffs.
- Given `cov-creole-title`, then `title foo` is drawn as a text line and the canvas is 218×99.
- Given `gapeji-48-keze681` (a creole list), then zero diffs.

Observability: N/A — no new observable operations. Rollback: Reversible.
