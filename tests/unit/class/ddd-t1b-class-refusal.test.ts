/**
 * ddd-T1b: the class factory refuses what upstream's refuses, so the next
 * factory answers (`PSystemBuilder.java:136-140`). Jar values: dot-cache unknown
 * fubuja-64-vane162, minece-51-xape147, gepuko-44-gizi401.
 */
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseClass } from '../../../src/diagrams/class/parser.js';

const type = (src: string): string | undefined =>
  /data-diagram-type="(\w+)"/.exec(renderSync(src, { measurer: new DeterministicMeasurer() }))?.[1];

describe('CommandPackage: an empty name with no alias', () => {
  it.each([['package {'], ['package #green {'], ['package <<x>> {']])('%s refuses', (line) => {
    const out = parseClass({ lines: [line, 'a', '}'], type: 'class' } as never);
    expect(out).toMatchObject({ refused: true, kind: 'execution', message: 'Error in name' });
  });

  it('a named package stays class', () => {
    expect(type('@startuml\npackage x {\nclass a\n}\n@enduml')).toBe('CLASS');
  });

  it('fubuja-64: the source goes to description', () => {
    expect(type('@startuml\npackage {\n() item10\n}\nlev0 ---> item10\n@enduml')).toBe('DESCRIPTION');
  });
});

describe('CommandCreateElementFull2 before CommandLinkClass', () => {
  it('a keyword-led link ending in a quote refuses', () => {
    const out = parseClass({
      lines: ['Person "1" *-- "*" Person : "parent" contains "children"'],
      type: 'class',
    } as never);
    expect(out).toMatchObject({ refused: true, kind: 'execution' });
  });

  it('the source goes to description, links drawn', () => {
    const svg = renderSync('@startuml\nPerson "1" *-- "*" Person : "parent" contains "children"\n@enduml', {
      measurer: new DeterministicMeasurer(),
    });
    expect(svg).toContain('data-diagram-type="DESCRIPTION"');
  });

  it('a link with no keyword stays class', () => {
    expect(type('@startuml\nFoo "1" *-- "*" Bar : "a"\n@enduml')).toBe('CLASS');
  });
});
