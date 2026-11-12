# T1b: the sprite page

**Writes:** `src/core/sprite-registry.ts` (`getAllSpriteNames`), `src/core/klimt/sprite/sprite-text-block.ts`,
`src/core/klimt/sprite/ListSpriteDiagram.ts` (`getTextBlock`),
`tests/unit/core/klimt/sprite/{ListSpriteDiagram,sprite-text-block}.test.ts`, `tests/unit/core/sprite-registry*.test.ts`.

**Read:**
- `klimt/sprite/ListSpriteDiagram.java:67-106`, `skin/SkinParam.java:799-816`;
- `klimt/creole/atom/AtomSprite.java:55-80` and every `asTextBlock` in `klimt/sprite/Sprite{Monochrome,Color,Image,Svg}.java`
  (D4: `SpriteMonochrome.java:211-219` reads `ug.getParam().getBackcolor()`);
- `klimt/shape/TextBlockUtils.java#mergeTB`, `klimt/creole/Display.java#create`;
- `src/core/creole-atoms-image-resolver.ts:472-495` and `resolveSpriteAtom`, `src/core/annotations/blocks-creole.ts:165-206`;
- `decisions.md` D4, D5, D8.

**Do:**
1. `getAllSpriteNames(registry)`: `[...registry.byName.keys()].sort()` (D5). Test `cov-sprites-mixed-order`'s order:
   `9nine HD Zeta _under alpha foo1 mdiHeadset`.
2. `sprite-text-block.ts`: `asTextBlock(sprite, fontColor, forcedColor, scale, backColor): TextBlock`, through the
   creole sprite atom (D4). First confirm each sprite kind's arguments map; where one does not, port that kind's
   `asTextBlock` and journal it.
3. `ListSpriteDiagram#getTextBlock`: the anonymous `TextBlock`'s `layout(stringBounder, ug)` loop, verbatim: name block
   `Display.create(n).create(FontConfiguration.blackBlueTrue(UFontFactory.sansSerif(14)), LEFT, skinParam)`, sprite
   block over it with `mergeTB(..., CENTER)`, `x += w + 30`, wrap past 1024 with `y += rawHeight + 50`, dimension
   `(totalWidth, y + rawHeight)`. Every constant cites `ListSpriteDiagram.java:<line>`.

## Acceptance
- Given `cov-sprites-uml-mono`, then the page is 78×45, the 15×10 image sits at `x=16.106 y=10`, and `foo1` at
  `x=10 y=30.889` (`/tmp/lsp-plan/po/cov-sprites-uml-mono/`; margin 10 from `TitledDiagram`).
- Given `cov-sprites-wrap`, then the twelve sprites draw six per row, images at `y=10` and `y=77`, the first of each
  row at `x=64.725`.
- Given `cov-sprites-creole-name`, then `foo` and an underlined `bar` are two text runs.
- Given `cov-sprites-svg` and `cov-sprites-jar-sprite`, then the sprite draws as a `<path>`, not an `<image>`.

Observability is N/A: there are no new observable operations. Rollback is Reversible: revert the commit.
