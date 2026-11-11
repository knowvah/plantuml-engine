import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { availableFontFamilyNames } from '../../../src/diagrams/help/CommandHelpFont.js';
import { getAllThemeNames } from '../../../src/diagrams/help/CommandHelpTheme.js';
import { Help } from '../../../src/diagrams/help/Help.js';
import { renderHelp } from '../../../src/diagrams/help/help-export.js';
import { parseHelp } from '../../../src/diagrams/help/HelpFactory.js';
import { sourceOf } from '../../helpers/utility-single-line.js';

const CORPUS = new URL('../../../test-results/dot-cache/unknown/', import.meta.url);

function corpus(slug: string, file: 'in.puml' | 'in.svg'): string {
  return readFileSync(new URL(`${slug}/${file}`, CORPUS), 'utf8');
}

function help(text: string): Help {
  const parsed = parseHelp(sourceOf(text));
  if (!(parsed instanceof Help)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return parsed;
}

function decode(s: string): string {
  return s.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}

/** The `<text>` bodies of a document or fragment. */
function texts(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => decode(m[1]!));
}

function jarSize(svg: string): string {
  return /width:(\d+)px;height:(\d+)px/.exec(svg)!.slice(1).join('x');
}

describe('Help', () => {
  it.each(['ficame-31-lece592', 'kesexi-71-dubu320', 'mefure-90-gitu244', 'xasanu-61-guze787'])(
    '%s: the same text runs and size as the jar',
    (slug) => {
      const jar = corpus(slug, 'in.svg');
      const fragment = renderHelp(help(corpus(slug, 'in.puml')), new DeterministicMeasurer());
      expect(texts(fragment.body)).toEqual(texts(jar));
      expect(`${fragment.width}x${fragment.height}`).toBe(jarSize(jar));
      expect(fragment.diagramType).toBe('HELP');
      expect(fragment.background).toBe('#FFFFFF');
    },
  );

  it('ficame-31-lece592 is 179x2513', () => {
    const fragment = renderHelp(help(corpus('ficame-31-lece592', 'in.puml')), new DeterministicMeasurer());
    expect([fragment.width, fragment.height]).toEqual([179, 2513]);
  });

  it('two commands concatenate (cov-help-two: 189x1649)', () => {
    const diagram = help('@startuml\nhelp type\nhelp theme\n@enduml');
    const lines = diagram.getLines();
    expect(lines.indexOf('<b>Help on themes')).toBeGreaterThan(lines.indexOf('<b>Help on types'));
    const fragment = renderHelp(diagram, new DeterministicMeasurer());
    expect([fragment.width, fragment.height]).toEqual([189, 1649]);
  });

  it('help is case-insensitive and trailing spaces pass (cov-help-upper, cov-help-trailing)', () => {
    expect(help('@startuml\nHELP   COLOR\n@enduml').getLines()[0]).toBe('<b>Help on colors');
    expect(help('@startuml\nhelp type  \n@enduml').getLines()[0]).toBe('<b>Help on types');
  });

  it('help font draws its three header lines and no font names (D8; cikoge-60-riti614)', () => {
    expect(availableFontFamilyNames()).toEqual([]);
    expect(help(corpus('cikoge-60-riti614', 'in.puml')).getLines()).toEqual([
      '<b>Help on font',
      ' ',
      ' The possible font on your system are :',
    ]);
  });

  it('lists the bundled themes, _none_ first (kesexi-71-dubu320: 44 names)', () => {
    expect(getAllThemeNames()[0]).toBe('_none_');
    expect(getAllThemeNames()).toHaveLength(44);
  });

  it.each([
    ['@startuml\ntitle foo\nhelp type\n@enduml', 1], // cov-help-title
    ['@startuml\nscale 2\nhelp type\n@enduml', 1], // cov-help-scale
    ['@startuml\nskinparam backgroundColor yellow\nhelp type\n@enduml', 1], // cov-help-skinparam
    ['@startuml\n<style>\nroot { BackGroundColor red }\n</style>\nhelp type\n@enduml', 1], // cov-help-style
    ['@startuml\nhelp foo\n@enduml', 1], // cov-help-bad
    ['@startuml\nhelp\n@enduml', 1], // cov-help-bare
    ['@startuml\nhelp type\n\nhelp theme\n@enduml', 2], // a blank line is not a command
  ])('refuses %j at upstream line %i: no CommonCommands', (text, k) => {
    expect(parseHelp(sourceOf(text))).toMatchObject({ refused: true, message: 'Syntax Error?', consumed: k });
  });

  it('describes itself as (Help) with margin 0', () => {
    const diagram = help('@startuml\nhelp type\n@enduml');
    expect(diagram.getDescription()).toBe('(Help)');
    expect(diagram.getDefaultMargins().getTop()).toBe(0);
  });
});
