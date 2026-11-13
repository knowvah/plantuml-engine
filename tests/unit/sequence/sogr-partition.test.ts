/**
 * sogr T2a: `partition` is a `GroupingType` (`CommandGrouping.java:67`,
 * `GroupingType.java:55-56`) built into a `PartitionTile`
 * (`teoz/TileBuilder.java:154-163`), not a `GroupingTile`. Expected values are
 * the jar's (`scripts/oracle-render.sh`, deterministic text) on
 * `test-results/dot-cache/sequence/teoz-ng-001-11` and the
 * `sogr-partition-*` rows.
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderFixtureSequence, sequenceFixtureOptions } from '../../oracle/svg-conformance/render-fixture-sequence.js';
import { attrsOf, tagsOf, type TagAttrs } from '../../helpers/svg-tags.js';

const SOURCE = ['@startuml', 'partition p', 'a->b', 'end', '', 'group', 'a->c', 'end group', '@enduml'].join('\n');

function render(markup: string): string {
  return renderFixtureSequence(markup, new DeterministicMeasurer(), sequenceFixtureOptions());
}

/** The `<rect>` tags that carry the partition's `width`, i.e. spanning the diagram. */
function partitionRects(svg: string): TagAttrs[] {
  return tagsOf(svg, 'rect').filter((r) => r['x'] === '10' && r['y'] === '51');
}

describe('partition frame (teoz-ng-001-11)', () => {
  const svg = render(SOURCE);

  it('draws the border-to-border rect, background pass then both component passes', () => {
    const rects = partitionRects(svg);
    expect(rects.map((r) => [r['width'], r['height'], r['stroke'], r['fill']])).toEqual([
      ['111.287', '45', 'none', 'none'],
      ['111.287', '45', '#000', 'none'],
      ['111.287', '45', '#000', 'none'],
    ]);
    expect(rects[1]!['stroke-width']).toBe('1.5');
  });

  it('centres the bold 13 title over the border span', () => {
    const titles = [...svg.matchAll(/<text [^>]*>p<\/text>/g)].map((m) => attrsOf(m[0]));
    expect(titles.map((t) => [t['x'], t['y'], t['font-size'], t['font-weight']])).toEqual([
      ['62.028', '65.111', '13', '700'],
      ['62.028', '65.111', '13', '700'],
    ]);
  });

  it('leaves the plain group beside it a tabbed frame', () => {
    expect(svg).toContain('<path d="M13,114 L91.231,114');
  });
});

/**
 * An untitled `partition` (no COMMENT group) has a null comment, and
 * `PartitionTile#titleBlock` throws on it: `Display.create(null)`
 * (`PartitionTile.java:85`) -> the jar's crash page (oracle
 * `test-results/dot-cache/unknown/teoz-ng-001-10`). We throw at the same
 * tile, which renders our error page.
 */
describe('untitled partition (teoz-ng-001-10)', () => {
  const UNTITLED = ['@startuml', 'partition', 'a->b', 'end', '@enduml'].join('\n');

  it('throws building the partition tile, as the jar does', () => {
    expect(() => render(UNTITLED)).toThrow(/PartitionTile/);
  });

  it('still draws a partition whose comment is only colours away from crashing: `partition #pink p`', () => {
    expect(render(['@startuml', 'partition #pink p', 'a->b', 'end', '@enduml'].join('\n'))).toContain('>p</text>');
  });

  it('throws for `partition #pink`, whose COMMENT group is absent too', () => {
    expect(() => render(['@startuml', 'partition #pink', 'a->b', 'end', '@enduml'].join('\n'))).toThrow(
      /PartitionTile/,
    );
  });
});
