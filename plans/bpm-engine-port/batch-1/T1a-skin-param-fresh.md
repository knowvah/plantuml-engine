# T1a — `SkinParamFresh` for BPM

**Read:** D3; `src/core/skin/SkinParamFresh.ts` (214 lines) and its two callers
(`src/core/klimt/creole/legacy/PSystemCreole.ts`, `src/diagrams/help/{Help,HelpFactory}.ts`);
`BpmDiagram.java#getTextBlock`; `skin/SkinParam.java` (`create`, `options`, `getHtmlColor`, `shadowing`,
`getDefaultTextAlignment`, `sheet`); `skin/SkinParamUtils.java:57-59`; `skin/rose/Rose.java#getHtmlColor`;
`skin/ColorParam.java` (`activityBackground`, `activityBorder` defaults).

**Write-set:** `src/core/skin/SkinParamFresh.ts`; a port of `SkinParamUtils.getColor`/`Rose#getHtmlColor` only if
`docs/catalog.md` has none (check `src/core/skin/` first); `tests/unit/core/skin/SkinParamFresh*.test.ts`.

**Do:**
1. Add an optional options parameter mirroring `SkinParam.create(..., option)`; `options()` returns it, defaulting to the
   empty option set creole and help get today.
2. List every `ISkinParam` member T1b's three Ftiles and `BpmElement` reach (walk `FtileBox` constructor and `drawU`,
   `FtileDiamondWIP` constructor, `CircleStart`, `Display#create`). Each answers `SkinParam`'s no-value default with its
   `file:line`. Members nothing reaches keep throwing.
3. The legacy colour read: `SkinParamUtils.getColor(skinParam, null, ColorParam.activityBorder)` must yield `#A80036`
   and `activityBackground` `#FEFECE` (every drawn probe's `<polygon>`).

## Acceptance
- Given a `SkinParamFresh` built with `!option debug true`'s options, when `options().getValue(OptionKey.DEBUG)` is
  read, then it is `"true"`; built with none, it is the default creole/help see today.
- Given the legacy reads, then `activityBackground` resolves `#FEFECE` and `activityBorder` `#A80036`.
- Given the batch-1 `unknown` survey, then no creole or help row moves (`verdict-diff` exit 0, `survey-moves` lists none).

Observability N/A. Rollback Reversible.
