/**
 * eea T1d (#150, D2): a legacy activity link label is built with the diagram's `skinParam` (`SvekEdge.java:286-299`),
 * so its emoji draws the artwork (`AtomEmoji.java:66-68`, `Emoji.java:175-182`) and its sprite draws. Expected values are
 * the jar's, from `tests/fixtures/emoji-edge-artwork/legacy-activity-edge-{emoji,sprite}.svg`.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '../../fixtures/emoji-edge-artwork');
const LINK_GROUP = /<g class="link"[^>]*>(.*?)<\/g>/s;
/** The rocket's first artwork fill. */
const ROCKET_FIRST_FILL = 'fill="#A0041E"';

function linkGroup(row: string): string {
  const svg = renderSync(readFileSync(join(FIXTURES, `${row}.puml`), 'utf8'), {
    measurer: new DeterministicMeasurer(),
    assetStore: buildEmojiAssetsStore(),
  });
  return LINK_GROUP.exec(svg)![1]!;
}

describe('eea T1d: legacy activity edge label atoms', () => {
  it('draws the emoji artwork on the label', () => {
    expect(linkGroup('legacy-activity-edge-emoji')).toContain(ROCKET_FIRST_FILL);
  });

  it('draws the sprite, and the text after it at the jar x', () => {
    const group = linkGroup('legacy-activity-edge-sprite');
    expect(group).toContain('<image ');
    expect(group).toMatch(/<text x="39.114"/);
  });
});
