/**
 * eea T1c (#150, D2): a quantifier is built with the label's `skinParam` (`SvekEdge.java:328-340`), so its sprites
 * size it. The reserved widths are the jar's DOT tables for `tests/fixtures/emoji-edge-artwork/desc-quantifier-sprite`
 * (`taillabel` WIDTH="18", `headlabel` WIDTH="43"; `appendTable`'s `(int)` casts, `SvekEdge.java:504-507`).
 */
import { describe, expect, it } from 'vitest';

import { measureQuantifierBlock } from '../../../../src/core/svek/quantifier-block.js';
import { resolveCardinalityFont } from '../../../../src/core/arrow-label-font.js';
import { defaultTheme } from '../../../../src/core/theme.js';
import { DeterministicMeasurer } from '../../../../src/core/measurer-deterministic.js';
import { createSpriteRegistry, addSprite, spriteDimsLookupFor } from '../../../../src/core/sprite-commands.js';
import { SpriteMonochrome } from '../../../../src/core/klimt/sprite/SpriteMonochrome.js';
import { sizingAtomImageResolverFor } from '../../../../src/core/svek/image/leaf-sizing-entity.js';

/** The fixture's `sprite $s [8x8/16]`. */
const SPRITE_SIDE = 8;
const JAR_TAIL_WIDTH = 18;
const JAR_HEAD_WIDTH = 43;

function registryWithS(): ReturnType<typeof createSpriteRegistry> {
  const registry = createSpriteRegistry();
  const sprite = new SpriteMonochrome(SPRITE_SIDE, SPRITE_SIDE, 16);
  for (let y = 0; y < SPRITE_SIDE; y++) for (let x = 0; x < SPRITE_SIDE; x++) sprite.setGray(x, y, 15);
  addSprite(registry, 's', sprite);
  return registry;
}

describe('measureQuantifierBlock — inline atoms', () => {
  const font = resolveCardinalityFont(defaultTheme);
  const measurer = new DeterministicMeasurer();
  const resolverFor = sizingAtomImageResolverFor(spriteDimsLookupFor(registryWithS()));

  it('reserves the sprite in the table, as the jar does', () => {
    expect(measureQuantifierBlock('<$s> 1', font, measurer, resolverFor).reservedWidth).toBe(JAR_TAIL_WIDTH);
    expect(measureQuantifierBlock('many <$s>', font, measurer, resolverFor).reservedWidth).toBe(JAR_HEAD_WIDTH);
  });

  it('reserves nothing for a sprite with no resolver', () => {
    expect(measureQuantifierBlock('<$s> 1', font, measurer).reservedWidth).toBeLessThan(JAR_TAIL_WIDTH);
  });
});
