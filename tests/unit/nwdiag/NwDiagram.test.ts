/** `NwDiagram.toSet`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/NwDiagram.java:288-303 */
import { describe, expect, it } from 'vitest';
import { NwDiagram } from '../../../src/diagrams/nwdiag/NwDiagram.js';

describe('NwDiagram.toSet', () => {
  it('reads bare and quoted values', () => {
    expect([...NwDiagram.toSet('len = 4, color="pale green", rotate=270')]).toEqual([
      ['len', '4'],
      ['color', 'pale green'],
      ['rotate', '270'],
    ]);
  });

  it('is empty for undefined', () => {
    expect(NwDiagram.toSet(undefined).size).toBe(0);
  });

  it('keeps the last value of a repeated name', () => {
    expect(NwDiagram.toSet('len=2 len=5').get('len')).toBe('5');
  });

  it('keeps an empty quoted value', () => {
    expect(NwDiagram.toSet('label=""').get('label')).toBe('');
  });

  it('skips text that is not a pair', () => {
    expect([...NwDiagram.toSet('junk, len=3')]).toEqual([['len', '3']]);
  });
});
