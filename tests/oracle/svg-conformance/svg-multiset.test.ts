import { describe, expect, it } from 'vitest';
import { isMultisetEqual, multisetDiff, multisetTags } from './svg-multiset.js';

const HEAD = '<svg data-diagram-type="FLOW"><?plantuml $version$?><defs/>';
const A = '<rect x="1"/><text x="2">A</text>';
const B = '<rect x="9"/><text x="10">B</text>';

describe('svg-multiset (flp D4, D7)', () => {
  it('splits the body on `>` and drops the plantuml processing instructions', () => {
    expect(multisetTags(`${HEAD}<g>${A}<?plantuml-src abc?></g></svg>`)).toEqual([
      '<g',
      '<rect x="1"/',
      '<text x="2"',
      'A</text',
      '</g',
      '</svg',
    ]);
  });

  it('is equal under a reordering of the boxes', () => {
    expect(isMultisetEqual(`${HEAD}<g>${A}${B}</g>`, `${HEAD}<g>${B}${A}</g>`)).toBe(true);
  });

  it('fails a broken label and names both sides', () => {
    const broken = `${HEAD}<g>${A.replace('>A<', '>X<')}${B}</g>`;
    expect(multisetDiff(broken, `${HEAD}<g>${B}${A}</g>`)).toEqual({ onlyOurs: ['X</text'], onlyTheirs: ['A</text'] });
    expect(isMultisetEqual(broken, `${HEAD}<g>${A}${B}</g>`)).toBe(false);
  });

  it('counts duplicates: one copy of a twice-drawn element is not enough', () => {
    expect(multisetDiff(`<g>${A}${A}</g>`, `<g>${A}</g>`).onlyOurs).toEqual(['<rect x="1"/', '<text x="2"', 'A</text']);
  });
});
