# T1b — The three activity Ftiles BPM draws

**Read:** D2, D11; `activitydiagram3/ftile/{AbstractFtile,Hexagon}.java`;
`activitydiagram3/ftile/vertical/{FtileCircleStart,FtileDiamondWIP,FtileDiamond,FtileBox}.java`;
`svek/image/CircleStart.java`; this port's `src/diagrams/activity/ftile/{AbstractFtile,BoxStyle,FtileGeometry}.ts`,
`ftile/vertical/FtileBoxOld.ts` (the sheet pipeline), `src/core/svek/image/CircleStart.ts`.

**Write-set:** `src/diagrams/activity/ftile/Hexagon.ts`, `ftile/AbstractFtile.ts` (only members these reach),
`ftile/vertical/{FtileCircleStart,FtileDiamondWIP,FtileDiamond,FtileBox}.ts`, `tests/unit/activity/ftile/**`.

**Do:**
1. Port `Hexagon` (`hexagonHalfSize`, `asPolygon(shadowing)`, and whatever else the class holds — whole class, it is
   small).
2. Port the four Ftiles with upstream names. `Swimlane` is `undefined` throughout (BPM passes `null`); keep the
   `getSwimlanes`/`getSwimlaneIn`/`getSwimlaneOut` members only if `AbstractFtile.ts` declares them — otherwise journal
   that the slice stops where `FtileBoxOld`'s did.
3. `FtileBox`: style `root, element, activityDiagram, activity` `withTOBECHANGED(stereotype)`; padding, round corner,
   shadowing, font, minimum width and wrap width from the style; the sheet through `skinParam.sheet(...)`,
   `SheetBlock1`, `SheetBlock2` with `MyStencil`; the `OptionKey.DEBUG` rectangle (`FtileBox.java:201-206`).
   `SkinParamColors` override: BPM never passes one; keep the branch.
4. Test each against probe fragments: the start circle (`cx=35 cy=41 r=10`, `#F1F1F1`/`#181818`, 0.5),
   the diamond (`12` half size, `#FEFECE`/`#A80036`), `login`'s box (`45.425×32`, `rx=12.5`, text at `+10,+19.333`),
   a creole label (`cov-docked-creole`), a two-line label (`cov-docked-newline`), the debug rectangle
   (`cov-option-debug`).

No existing file under `src/diagrams/activity/` other than `ftile/AbstractFtile.ts` changes; activity output cannot move.

## Acceptance
- Given `FtileBox.create(fresh skin, Display "login", …, BoxStyle.PLAIN, …)`, when drawn at the origin, then the rect is
  45.425×32 with `rx=12.5` and the text sits at `x=10 y=19.333` with `textLength=25.425`.
- Given `FtileDiamond`, then its polygon is `12,0 24,12 12,24 0,12 12,0` with the legacy colours and stroke 0.5.
- Given `FtileCircleStart`, then its dimension is 20×20 and it draws one ellipse r=10.
- Given `!option debug true`, then `FtileBox#drawU` draws the 2 px blue rectangle first.

Observability N/A. Rollback Reversible.
