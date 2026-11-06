/**
 * `skinparam mode dark` in the engines that read `theme.colors` (smc T2b, T2c, D2): every element colour comes
 * from the builder at its signature, mapped as `ColorMapper.DARK_MODE` paints it (`ColorMapper.java:68-72`,
 * `TitledDiagram.java:292-294`); a colour with no `@media` partner keeps itself. Jar values come from the oracle SVGs
 * in `tests/fixtures/diagram-style-scope/`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { renderSync } from '../../../src/index.js';
import { DIAGRAM_STYLE_SCOPE_ROOT } from '../../oracle/svg-conformance/diagram-style-scope.js';

const NOTE_FILL = 'fill="#714137"'; // plantuml.skin `note` @media dark BackGroundColor
const BOX_FILL = 'fill="#313139"'; // plantuml.skin `root` @media dark BackGroundColor
const TEXT_FILL = 'fill="#FFF"'; // plantuml.skin `root` @media dark FontColor
const LIGHT_NOTE_FILL = 'fill="#FEFFDD"';
const LIGHT_BOX_FILL = 'fill="#F1F1F1"';
const FONT_SIZE_12 = 'font-size="12"';

function fixture(name: string, ext: 'puml' | 'svg'): string {
  return readFileSync(join(DIAGRAM_STYLE_SCOPE_ROOT, `${name}.${ext}`), 'utf8');
}

const NOTE_ROWS = [
  'activity__mode-dark',
  'activity__mode-dark-style',
  'class__mode-dark',
  'class__mode-dark-style',
  'object__mode-dark',
  'object__mode-dark-style',
  'component__mode-dark',
  'component__mode-dark-style',
  'usecase__mode-dark',
  'usecase__mode-dark-style',
  'state__mode-dark',
  'state__mode-dark-style',
] as const;

const BOX_ROWS = [
  'component__mode-dark',
  'component__mode-dark-style',
  'usecase__mode-dark',
  'usecase__mode-dark-style',
  'state__mode-dark',
  'state__mode-dark-style',
] as const;

describe('skinparam mode dark in the theme-reading engines', () => {
  it.each(NOTE_ROWS)('%s: the note takes its @media dark fill and text', (name) => {
    expect(fixture(name, 'svg')).toContain(NOTE_FILL);
    const svg = renderSync(fixture(name, 'puml'));
    expect(svg).toContain(NOTE_FILL);
    expect(svg).toContain(TEXT_FILL);
    expect(svg).not.toContain(LIGHT_NOTE_FILL);
  });

  it.each(BOX_ROWS)('%s: the element box takes the dark root fill', (name) => {
    expect(fixture(name, 'svg')).toContain(BOX_FILL);
    const svg = renderSync(fixture(name, 'puml'));
    expect(svg).toContain(BOX_FILL);
    expect(svg).not.toContain(LIGHT_BOX_FILL);
  });

  it('component__probe-dark keeps `database { FontSize 12 }` beside the dark colours', () => {
    expect(fixture('component__probe-dark', 'svg')).toContain(FONT_SIZE_12);
    const svg = renderSync(fixture('component__probe-dark', 'puml'));
    expect(svg).toContain(FONT_SIZE_12);
    expect(svg).toContain(BOX_FILL);
  });

  it('component__probe-dark-element paints the text white under an element background', () => {
    const svg = renderSync(fixture('component__probe-dark-element', 'puml'));
    expect(svg).toContain(TEXT_FILL);
    expect(svg).not.toContain('fill="#000"');
  });

  it('class: the spotClass badge takes `spot { spotClass { BackgroundColor #2E5233 } }` (plantuml.skin:644-646)', () => {
    const svg = renderSync('@startuml\nskinparam mode dark\nclass A\n@enduml');
    expect(svg).toContain('fill="#2E5233"');
  });

  it('activity: an action and a diamond draw white text under `root { FontColor white }` (plantuml.skin:566)', () => {
    const svg = renderSync('@startuml\nskinparam mode dark\nstart\n:a;\nif (x) then (y)\n:b;\nendif\nstop\n@enduml');
    expect(svg).toContain('fill="#FFF"');
    expect(svg).not.toContain('fill="#000"');
  });
});
