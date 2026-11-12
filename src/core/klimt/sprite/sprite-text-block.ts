/**
 * `Sprite#asTextBlock(fontColor, forcedColor, scale, backColor)` as a `TextBlock`, reached through the creole sprite
 * atom (lsp D4). Upstream's `AtomSprite` draws a sprite by calling this very method (`AtomSprite.java:66,77`), and
 * the atom resolver (`creole-atoms-image-resolver.ts#makeAtomImageResolverFor`) is that port for every kind:
 *
 * - `SpriteMonochrome` tints with `forcedColor ?? fontColor` over `ug.getParam().getBackcolor()`, ignoring the
 *   `backColor` argument (SpriteMonochrome.java:211-219); the resolver's tint is drawn over the draw site's back
 *   colour by `drawResolvedInline` (`spriteHrefOver`), the same read.
 * - `SpriteImage` mutes the image to `forcedColor ?? fontColor` (SpriteImage.java:70-98); the resolver reads the
 *   font's `HColorSimple` as `fontColor`.
 * - `SpriteColor` draws its own colours (SpriteColor.java:125-139); `SpriteSvg` and the nano parser draw paths.
 *
 * The atom is built `insideUrl` — the atom's own switch for "no `fc.getSize2D() / 13.0` factor"
 * (`creole-atoms-measure.ts#spriteAtomScale`): that factor is `CommandCreoleSprite`'s, not the sprite's, and
 * `asTextBlock` takes `scale` as given (`EntityImageDescriptionDelegates.ts#StereotypeSpriteBlock` precedent).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/Sprite.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/atom/AtomSprite.java:55-80
 */
import type { SpriteAtomToken } from '../../creole-atoms.js';
import { makeAtomImageResolverFor } from '../../creole-atoms-image-resolver.js';
import { measureInlineAtom } from '../../creole-atoms-measure.js';
import { spriteDimsLookupFor, type SpriteRegistry } from '../../sprite-registry.js';
import { drawResolvedInline } from '../../svek/image/EntityImageDescriptionInline.js';
import type { HColorSimple } from '../color/HColorSimple.js';
import type { StringBounder } from '../font/StringBounder.js';
import { XDimension2D } from '../geom/XDimension2D.js';
import type { TextBlock } from '../shape/TextBlock.js';
import type { FontConfiguration } from '../shape/UText.js';
import type { UGraphic } from '../UGraphic.js';

/** The font family the resolver's `FontConfiguration` carries: never drawn, the sprite atom reads only its colour. */
const UNUSED_FAMILY = 'SansSerif';
/** The size the resolver's `FontConfiguration` carries: unread, `insideUrl` skips the font-ratio factor. */
const UNUSED_SIZE = 14;

/** Which sprite: the registry `getSprite(name)` resolves it from (`SkinParam#getSprite`, java:810-816). */
export interface SpriteRef {
  readonly registry: SpriteRegistry;
  readonly name: string;
}

/** `fontColor` as the resolver reads it: a font whose colour is that `HColorSimple`. */
function fontOf(fontColor: HColorSimple): FontConfiguration {
  const paint = fontColor.asPaint();
  // An `HColorSimple` paints a solid colour (`FontConfigurationBridge.ts#solidPaint`).
  if (typeof paint !== 'string') throw new Error('ClassCastException: HColorSimple painted a gradient');
  return { family: UNUSED_FAMILY, size: UNUSED_SIZE, color: paint, hColor: fontColor, styles: new Set() };
}

/**
 * `sprite.asTextBlock(fontColor, forcedColor, scale, backColor)`. `forcedColor` is a colour string as
 * `CommandCreoleSprite` hands it (`undefined` = Java's `null`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/SpriteMonochrome.java:211-227
 */
export function asTextBlock(
  sprite: SpriteRef,
  fontColor: HColorSimple,
  forcedColor: string | undefined,
  scale: number,
  backColor: HColorSimple | undefined,
): TextBlock {
  const token: SpriteAtomToken = {
    kind: 'sprite',
    name: sprite.name,
    scale,
    insideUrl: true,
    ...(forcedColor === undefined ? {} : { forcedColor }),
  };
  const font = fontOf(fontColor);
  const resolve = makeAtomImageResolverFor(sprite.registry, undefined, backColor)(font);
  const dims = spriteDimsLookupFor(sprite.registry);
  return {
    drawU(ug: UGraphic): void {
      const resolved = resolve(token, () => ug.getStringBounder());
      if (resolved !== undefined) drawResolvedInline(ug, resolved);
    },
    calculateDimension(_stringBounder: StringBounder): XDimension2D {
      const { width, height } = measureInlineAtom(token, dims, font.size);
      return new XDimension2D(width, height);
    },
  };
}
