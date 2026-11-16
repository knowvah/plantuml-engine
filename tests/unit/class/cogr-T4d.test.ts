/**
 * cogr T4d: Twemoji artwork in a `card [ ]` body. `AtomEmoji` (`klimt/creole/atom/AtomEmoji.java`) draws the emoji's
 * artwork, coloured or not; `EntityImageDescription` builds `desc` with the artwork store, which the class leaf path
 * did not hand it, so it drew the platform glyph (a 21px `<text>`). Oracle:
 * `test-results/dot-cache/class/gecaxa-13-jedi612/in.svg`: entity `c1` has 8 `<text>` (all 14px, black) and 54 `<path>`
 * (9 swans x 6).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';

const source = readFileSync('test-results/dot-cache/class/gecaxa-13-jedi612/in.puml', 'utf8');
const svg = renderSync(source, { measurer: new DeterministicMeasurer(), assetStore: buildEmojiAssetsStore() });
const c1 = /data-qualified-name="c1".*?<\/g>/s.exec(svg)?.[0] ?? '';

describe('emoji artwork in a card body (cogr T4d)', () => {
  it('draws each emoji, coloured or not, as 6 artwork paths', () => {
    expect((c1.match(/<path/g) ?? []).length).toBe(54);
  });

  it('keeps only the 8 black 14px text runs of the jar', () => {
    const texts = [...c1.matchAll(/<text [^>]*fill="([^"]*)"[^>]*font-size="(\d+)"/g)].map((m) => [m[1], m[2]]);
    expect(texts).toEqual(Array.from({ length: 8 }, () => ['#000', '14']));
  });
});
