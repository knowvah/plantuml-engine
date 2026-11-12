/**
 * `asTextBlock` through the creole sprite atom (lsp D4): the box is the sprite's own size times `scale`, with no
 * creole font ratio.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/sprite/SpriteMonochrome.java:211-227
 */
import { describe, expect, it } from 'vitest';
import { HColors } from '../../../../../src/core/klimt/color/HColors.js';
import { asTextBlock } from '../../../../../src/core/klimt/sprite/sprite-text-block.js';
import { SpriteMonochrome } from '../../../../../src/core/klimt/sprite/SpriteMonochrome.js';
import { DeterministicMeasurer } from '../../../../../src/core/measurer-deterministic.js';
import { addSprite, createSpriteRegistry, getAllSpriteNames } from '../../../../../src/core/sprite-registry.js';
import { stringBounderFor } from '../../../../../src/core/UgDiagram.js';

function registryWith(...names: string[]): ReturnType<typeof createSpriteRegistry> {
  const registry = createSpriteRegistry();
  for (const name of names) addSprite(registry, name, new SpriteMonochrome(15, 10, 16));
  return registry;
}

describe('asTextBlock', () => {
  const sb = stringBounderFor(new DeterministicMeasurer());

  it.each([
    [1, 15, 10],
    [2, 30, 20],
    [0.5, 7.5, 5],
  ])('scale %d measures the sprite at %d x %d (getWidth() * scale)', (scale, w, h) => {
    const block = asTextBlock(
      { registry: registryWith('foo'), name: 'foo' },
      HColors.BLACK,
      undefined,
      scale,
      undefined,
    );
    const dim = block.calculateDimension(sb);
    expect([dim.getWidth(), dim.getHeight()]).toEqual([w, h]);
  });

  it('an unknown name measures 0 x 0', () => {
    const block = asTextBlock({ registry: registryWith(), name: 'nope' }, HColors.BLACK, 'red', 1, HColors.WHITE);
    const dim = block.calculateDimension(sb);
    expect([dim.getWidth(), dim.getHeight()]).toEqual([0, 0]);
  });
});

describe('getAllSpriteNames', () => {
  it('sorts the registry keys by UTF-16 code unit, as TreeSet<String> (SkinParam.java:801-804)', () => {
    expect(getAllSpriteNames(registryWith('mdiHeadset', 'foo1', 'alpha', '_under', 'Zeta', 'HD', '9nine'))).toEqual([
      '9nine',
      'HD',
      'Zeta',
      '_under',
      'alpha',
      'foo1',
      'mdiHeadset',
    ]);
  });

  it('lists only the diagram`s own sprites, never the internal store', () => {
    expect(getAllSpriteNames(createSpriteRegistry())).toEqual([]);
  });
});
