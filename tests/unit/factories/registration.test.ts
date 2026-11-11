import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

const CORPUS = new URL('../../../test-results/dot-cache/unknown/', import.meta.url);

function corpus(slug: string, file: 'in.puml' | 'in.svg'): string {
  return readFileSync(new URL(`${slug}/${file}`, CORPUS), 'utf8');
}

function render(text: string): string {
  return renderSync(text, { measurer: new DeterministicMeasurer() });
}

/** The rows T3a makes conformant through `renderSync` (creole 7, def 2, help 4). */
const CONFORMANT = [
  'bibeso-63-kazo655',
  'fisoma-58-kobo261',
  'gapeji-48-keze681',
  'pizepu-20-bero680',
  'potezi-53-doku302',
  'sukuje-36-libo212',
  'xavefa-87-tabi094',
  'banire-12-feze162',
  'firiru-71-viki803',
  'ficame-31-lece592',
  'kesexi-71-dubu320',
  'mefure-90-gitu244',
  'xasanu-61-guze787',
];

describe('cmf factories through renderSync', () => {
  it.each(CONFORMANT)('%s matches the jar', (slug) => {
    expect(compareSvg(render(corpus(slug, 'in.puml')), corpus(slug, 'in.svg'), 'deterministic').diffs).toEqual([]);
  });

  it('@startmath and @startlatex write the Batik document: no plantuml-src, no data-diagram-type', () => {
    for (const text of ['@startmath\nx^2\n@endmath', '@startlatex\nx^2\n@endlatex']) {
      const svg = render(text);
      expect(svg.startsWith('<?xml version="1.0"?>\n<!DOCTYPE svg')).toBe(true);
      expect(svg).not.toContain('plantuml-src');
      expect(svg).not.toContain('data-diagram-type');
    }
  });

  it('help routes through @startuml after every UML engine refuses, typed HELP', () => {
    expect(render('@startuml\nhelp type\n@enduml')).toContain('data-diagram-type="HELP"');
  });

  it('an empty @startcreole is the Welcome page; an empty @startdef draws its start line', () => {
    expect(render('@startcreole\n@endcreole')).toContain('Welcome to PlantUML!');
    expect(render('@startdef(id=e)\n@enddef')).toContain('>@startdef(id=e)</text>');
  });
});
