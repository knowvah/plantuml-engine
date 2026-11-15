/**
 * `invalidColours` contract (ucol T1a, D3): the validity rule is exactly what the jar's 5,938 cached oracles emit.
 */
import { describe, it, expect } from 'vitest';

import { invalidColours } from './svg-colour-validity.js';

describe('invalidColours', () => {
  it('names an unresolved colour word in a fill attribute', () => {
    expect(invalidColours('<rect fill="zzblue"/>')).toEqual(['fill=zzblue']);
  });

  it('names a raw `name:value` key leaked into a stroke attribute', () => {
    expect(invalidColours('<path stroke="#line"/>')).toEqual(['stroke=#line']);
  });

  it('accepts every form the jar emits: #hex of 3, 4, 6 or 8 digits, none, black, white, url(#id)', () => {
    const svg =
      '<rect fill="#FFF" stroke="#ABCD"/><rect fill="#ABCDEF80" stroke="#181818"/>' +
      '<rect fill="url(#g1)" stroke="none"/><text fill="black"/><text fill="white"/><stop stop-color="#000000"/>';
    expect(invalidColours(svg)).toEqual([]);
  });

  it('rejects a hex of the wrong length', () => {
    expect(invalidColours('<rect fill="#ABCDE"/>')).toEqual(['fill=#ABCDE']);
  });

  it('scans stop-color', () => {
    expect(invalidColours('<stop stop-color="zzblue"/>')).toEqual(['stop-color=zzblue']);
  });

  it('scans fill, stroke and stop-color inside a style attribute, where the jar emits stroke', () => {
    expect(invalidColours('<path style="stroke:#181818;stroke-width:1;"/>')).toEqual([]);
    expect(invalidColours('<path style="stroke:zzblue;stroke-width:1;"/>')).toEqual(['stroke=zzblue']);
    expect(invalidColours('<path style="stroke-width:1; fill:#line"/>')).toEqual(['fill=#line']);
  });

  it('ignores properties that only share a prefix with a colour property', () => {
    expect(invalidColours('<path style="stroke-width:1.5;stroke-dasharray:7,7;fill-opacity:1"/>')).toEqual([]);
    expect(invalidColours('<rect fill-opacity="0.5"/>')).toEqual([]);
  });

  it('lists each distinct offender once, in first-seen order', () => {
    expect(invalidColours('<a fill="zzblue"/><b stroke="zzblue"/><c fill="zzblue"/>')).toEqual([
      'fill=zzblue',
      'stroke=zzblue',
    ]);
  });
});
