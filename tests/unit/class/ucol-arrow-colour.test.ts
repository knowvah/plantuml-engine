/**
 * ucol T2a (issue #145, M1): a class link's arrow-style colour token goes through
 * `HColorSet.instance().getColorOrWhite(s)` (`WithLinkType.java:161-163`), so a token the jar cannot parse draws
 * `HColors.WHITE`. Expected values are the jar's, from `tests/fixtures/unresolved-colour/class-arrow.svg`.
 */
import { describe, it, expect } from 'vitest';

import { parseArrowStyleOverrides } from '../../../src/diagrams/class/class-arrow-grammar.js';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const linkOf = (arrow: string): string[] => {
  const svg = renderSync(`@startuml\nclass A\nclass B\nA ${arrow} B\n@enduml\n`, {
    measurer: new DeterministicMeasurer(),
  });
  return [...svg.matchAll(/<(?:path|polygon)[^>]*>/g)].map((m) => m[0]).slice(-2);
};

describe('class arrow-style colour token (M1)', () => {
  it('an unresolvable token is getColorOrWhite: WHITE', () => {
    expect(parseArrowStyleOverrides('-[#zzblue]->').color).toBe('FFFFFF');
  });

  it('a resolvable token keeps its stored form', () => {
    expect(parseArrowStyleOverrides('-[#red]->').color).toBe('red');
    expect(parseArrowStyleOverrides('-[#red,dashed]->')).toEqual({ color: 'red', lineStyle: 'dashed' });
  });

  it('the last colour token wins, so #red,#zzblue is WHITE', () => {
    expect(parseArrowStyleOverrides('-[#red,#zzblue]->').color).toBe('FFFFFF');
  });

  it('draws the jar path stroke and arrowhead fill/stroke #FFF for -[#zzblue]->', () => {
    const [path, head] = linkOf('-[#zzblue]->');
    expect(path).toContain('stroke="#FFF"');
    expect(head).toContain('fill="#FFF"');
    expect(head).toContain('stroke:#FFF;');
  });
});
