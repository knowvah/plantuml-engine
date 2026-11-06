/**
 * `skinparam mode dark` in a sequence diagram (smc T2a, D2): `ColorMapper.DARK_MODE`
 * swaps each style colour for its `@media` partner (`ColorMapper.java:68-72`,
 * `TitledDiagram.java:292-294`); a colour with no partner keeps itself. Jar values come
 * from the oracle SVGs in `tests/fixtures/diagram-style-scope/`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DIAGRAM_STYLE_SCOPE_ROOT } from '../../oracle/svg-conformance/diagram-style-scope.js';

const JAR_LIFELINE_STROKE = 'stroke:#E7E7E7;stroke-width:0.5;stroke-dasharray:5,5;';
const JAR_PARTICIPANT_BOX = 'fill="#222" style="stroke:#E7E7E7;stroke-width:0.5;"';
const JAR_TEXT_FILL = 'fill="#FFF" font-size="14">A</text>';
const JAR_NOTE_FILL = 'fill="#714137"';

function fixture(name: string, ext: 'puml' | 'svg'): string {
  return readFileSync(join(DIAGRAM_STYLE_SCOPE_ROOT, `${name}.${ext}`), 'utf8');
}

describe('sequence skinparam mode dark', () => {
  const svg = renderSync(fixture('sequence__mode-dark', 'puml'));

  it('draws the jar values, which the oracle carries', () => {
    const oracle = fixture('sequence__mode-dark', 'svg');
    for (const token of [JAR_LIFELINE_STROKE, JAR_PARTICIPANT_BOX, JAR_TEXT_FILL, JAR_NOTE_FILL])
      expect(oracle).toContain(token);
  });

  it('maps the lifeline stroke to its dark partner', () => {
    expect(svg).toContain(JAR_LIFELINE_STROKE);
  });

  it('maps the participant fill, stroke and text', () => {
    expect(svg).toContain(JAR_PARTICIPANT_BOX);
    expect(svg).toContain(JAR_TEXT_FILL);
  });

  it('maps the note fill', () => {
    expect(svg).toContain(JAR_NOTE_FILL);
  });
});

describe('sequence mode dark with an explicit colour that has no partner', () => {
  it('keeps the explicit canvas colour while the style colours still map', () => {
    const svg = renderSync(fixture('sequence__scope-dark-skinparam-white', 'puml'));
    expect(svg).toContain('background:#FFFFFF;');
    expect(svg).toContain(JAR_PARTICIPANT_BOX);
  });

  it('draws as the plain dark participant', () => {
    const svg = renderSync(fixture('sequence__scope-dark-style', 'puml'));
    expect(svg).toContain(JAR_PARTICIPANT_BOX);
  });
});
