/**
 * odd T3a: `isBodyEnhanced` has a `CreoleParser.isTableLine` trigger (`BodierLikeClassOrObject.java:93-100`), and an
 * object takes `BodyFactory.create1` whatever its body holds (`:231-236`), so both reach `BodyEnhanced1#getArea`'s table.
 */
import { describe, expect, it } from 'vitest';

import { isEnhancedBody, splitEnhancedBlocks } from '../../../src/diagrams/class/class-body-enhanced.js';
import { jarFixtureDiffs, jarFixtureNames, renderJarFixture } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/odd-T3a';
const names = jarFixtureNames(DIR);

describe('a table body against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(15);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name)).toEqual([]);
  });

  it('draws the grid rules at stroke 1 in the font colour', () => {
    expect(renderJarFixture(DIR, 'object-table')).toMatch(/<line [^>]*stroke="#000" stroke-width="1"/);
  });
});

describe('splitEnhancedBlocks on a tree-or-table run', () => {
  it('triggers on a table line and not on one that only starts like it', () => {
    expect(isEnhancedBody(['| a |'])).toBe(true);
    expect(isEnhancedBody(['| a'])).toBe(false);
  });

  it('holds a table-opened run in the margin, and bottoms it on its last part', () => {
    const blocks = splitEnhancedBlocks(['| a |', '|_ t', '| b |']).filter((b) => b.kind !== 'rows');
    expect(blocks.map((b) => [b.kind, b.margin])).toEqual([
      ['table', { left: 10, bottom: 0 }],
      ['tree', { left: 10, bottom: 0 }],
      ['table', { left: 10, bottom: 5 }],
    ]);
  });

  it('gives a tree-opened run no margin', () => {
    const blocks = splitEnhancedBlocks(['|_ t', '| b |']).filter((b) => b.kind !== 'rows');
    expect(blocks.map((b) => [b.kind, b.margin])).toEqual([
      ['tree', undefined],
      ['table', { left: 0, bottom: 0 }],
    ]);
  });
});
