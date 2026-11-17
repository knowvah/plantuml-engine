/**
 * eea T1b (#150, D1): the registry-backed atom resolver carries the emoji artwork, and `buildTextBlock` draws it.
 * Upstream's `Emoji.retrieve` is one global table (`Emoji.java:111-118`), so every creole line -- an edge label's
 * `create0` (`SvekEdge.java:286-299`) included -- draws an `AtomEmoji` through `Emoji#drawU` (`AtomEmoji.java:66-68`,
 * `Emoji.java:175-182`). The registry is this port's render-scoped equivalent of that table.
 */
import { describe, expect, it } from 'vitest';

import { makeAtomImageResolverFor } from '../../../src/core/creole-atoms-image-resolver.js';
import { internalEmojiStoreFrom } from '../../../src/core/internal-emoji-store.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { buildTextBlock } from '../../../src/core/svek/image/EntityImageDescriptionSupport.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import type { FontConfiguration } from '../../../src/core/klimt/shape/UText.js';
import { UGraphicSvg } from '../../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import { basicSvgOption } from '../../../src/core/klimt/drawing/svg/svg-graphics.js';
import type { StringBounder as DriverStringBounder } from '../../../src/core/klimt/drawing/svg/driver-text-svg.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';

/** `<:rocket:>`'s codepoint (`Emoji.ts`). */
const ROCKET = '1f680';
/** The rocket's first artwork fill, from `tests/fixtures/emoji-edge-artwork/desc-edge-emoji-only.svg`. */
const ROCKET_FIRST_FILL = 'fill="#A0041E"';
const FONT: FontConfiguration = { family: 'sans-serif', size: 13, color: '#000000', styles: new Set() };
const measurer = new DeterministicMeasurer();
const driverBounder: DriverStringBounder = {
  calculateDimension(font, text) {
    return { width: measurer.measure(text, font).width };
  },
};

const emojiStore = internalEmojiStoreFrom(buildEmojiAssetsStore());

function drawn(text: string, withStore: boolean): string {
  const registry = createSpriteRegistry(undefined, withStore ? emojiStore : undefined);
  const resolver = makeAtomImageResolverFor(registry)(FONT);
  const ug = UGraphicSvg.build(0, basicSvgOption(), '$version$', driverBounder, measurer);
  buildTextBlock(text, FONT, HorizontalAlignment.LEFT, resolver).drawU(ug);
  return ug.getSvgString();
}

describe('makeAtomImageResolverFor — emojiArtwork', () => {
  it("returns the store's SVG for a codepoint", () => {
    const resolver = makeAtomImageResolverFor(createSpriteRegistry(undefined, emojiStore))(FONT);
    expect(resolver.emojiArtwork?.(ROCKET)).toBe(emojiStore.get(ROCKET));
    expect(resolver.emojiArtwork?.(ROCKET)).toContain(ROCKET_FIRST_FILL);
  });

  it('is undefined with no emoji store, and with no registry', () => {
    expect(makeAtomImageResolverFor(createSpriteRegistry())(FONT).emojiArtwork).toBeUndefined();
    expect(makeAtomImageResolverFor(undefined)(FONT).emojiArtwork).toBeUndefined();
  });
});

describe('buildTextBlock — an emoji atom', () => {
  it('draws the artwork, not a text run, when the resolver carries it (Emoji.java:175-182)', () => {
    const svg = drawn('a <:rocket:>', true);
    expect(svg).toContain(ROCKET_FIRST_FILL);
    expect(svg.match(/<path /g)).toHaveLength(emojiStore.get(ROCKET)!.match(/<path /g)!.length);
    expect([...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1])).toEqual(['a']);
  });

  it('keeps the platform-glyph run with no store (DIVERGENCES.md, "Emoji shorthand")', () => {
    const svg = drawn('a <:rocket:>', false);
    expect(svg).not.toContain(ROCKET_FIRST_FILL);
    expect(svg).not.toContain('<path ');
  });
});
