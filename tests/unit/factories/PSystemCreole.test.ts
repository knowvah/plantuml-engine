import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseCreole } from '../../../src/core/klimt/creole/legacy/PSystemCreoleFactory.js';
import { PSystemCreole } from '../../../src/core/klimt/creole/legacy/PSystemCreole.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { sourceOf } from '../../helpers/utility-single-line.js';

const CORPUS = new URL('../../../test-results/dot-cache/unknown/', import.meta.url);

function corpus(slug: string, file: 'in.puml' | 'in.svg'): string {
  return readFileSync(new URL(`${slug}/${file}`, CORPUS), 'utf8');
}

function render(text: string): string {
  const parsed = parseCreole(sourceOf(text));
  if (!(parsed instanceof PSystemCreole)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return parsed.exportDiagram(0, new DeterministicMeasurer());
}

describe('PSystemCreole', () => {
  it.each(['bibeso-63-kazo655', 'gapeji-48-keze681'])('matches the jar with zero diffs (%s)', (slug) => {
    const { diffs } = compareSvg(render(corpus(slug, 'in.puml')), corpus(slug, 'in.svg'), 'deterministic');
    expect(diffs).toEqual([]);
  });

  it('writes no data-diagram-type: not a TitledDiagram (bibeso-63-kazo655)', () => {
    expect(corpus('bibeso-63-kazo655', 'in.svg')).not.toContain('data-diagram-type');
    expect(render(corpus('bibeso-63-kazo655', 'in.puml'))).not.toContain('data-diagram-type');
  });

  it('draws title, scale, skinparam and style lines as creole text (cov-creole-title: 218x99)', () => {
    const svg = render(
      [
        '@startcreole',
        'title foo',
        'scale 2',
        'skinparam backgroundColor yellow',
        '<style>',
        'root { BackGroundColor red }',
        '</style>',
        'hello',
        '@endcreole',
      ].join('\n'),
    );
    expect(svg).toContain('width:218px;height:99px');
    expect(svg).toContain('>title foo</text>');
    expect(svg).toContain('>skinparam backgroundColor yellow</text>');
  });

  it('answers Empty description for a bare block (cov-creole-empty)', () => {
    expect(parseCreole(sourceOf('@startcreole\n@endcreole'))).toMatchObject({
      refused: true,
      message: 'Empty description',
    });
  });

  it('describes itself as (Creole)', () => {
    const parsed = parseCreole(sourceOf('@startcreole\na\n@endcreole'));
    expect(parsed instanceof PSystemCreole && parsed.getDescription()).toBe('(Creole)');
  });

  it('writes target="" on a link: no skin param reaches the non-titled export (cov-creole-url)', () => {
    expect(render('@startcreole\n[[http://a.b c]]\n@endcreole')).toContain('<a target="" href="http://a.b"');
  });
});
