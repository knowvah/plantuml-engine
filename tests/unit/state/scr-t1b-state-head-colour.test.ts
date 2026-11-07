/**
 * scr-T1b -- `SvekEdge#drawU` builds `Rainbow.build(styleLine, set)` over the merged `{root, element, stateDiagram,
 * arrow}` style (`SvekEdge.java:873-877`), whose `HeadColor` paints the head's stroke and fill
 * (`ExtremityArrow.java:93-100`); a transparent one draws the head as a line in the line colour
 * (`SvekEdge.java:1113-1118`, `ExtremityArrow.java:106-111`). Expected values are the jar's, from the `state__head-*`
 * oracles in `tests/fixtures/diagram-style-scope/`.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const DIR = 'tests/fixtures/diagram-style-scope';

function render(row: string): string {
  return renderSync(readFileSync(`${DIR}/${row}.puml`, 'utf8'), { measurer: new DeterministicMeasurer() });
}

describe('state arrow HeadColor from the merged arrow style', () => {
  it.each(['state__head-arrow', 'state__head-element', 'state__head-skinparam'])('%s paints both heads #F00', (row) => {
    const heads = [...render(row).matchAll(/<polygon points="[^"]*" fill="([^"]*)" style="stroke:([^;]*);/g)];
    expect(heads.map((m) => [m[1], m[2]])).toEqual([
      ['#F00', '#F00'],
      ['#F00', '#F00'],
    ]);
  });

  it('draws a transparent head as a line in the line colour', () => {
    const svg = render('state__head-transparent');
    expect(svg).not.toContain('<polygon');
    expect(svg).toContain('<line x1="32" y1="116.84" x2="32" y2="111.84" style="stroke:#181818;stroke-width:1;"/>');
  });
});
