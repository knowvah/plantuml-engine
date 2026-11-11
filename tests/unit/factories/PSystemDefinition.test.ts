import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PSystemDefinition } from '../../../src/diagrams/definition/PSystemDefinition.js';
import { parseDefinition } from '../../../src/diagrams/definition/PSystemDefinitionFactory.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { sourceOf } from '../../helpers/utility-single-line.js';

const CORPUS = new URL('../../../test-results/dot-cache/unknown/', import.meta.url);

function corpus(slug: string, file: 'in.puml' | 'in.svg'): string {
  return readFileSync(new URL(`${slug}/${file}`, CORPUS), 'utf8');
}

function render(text: string): string {
  const parsed = parseDefinition(sourceOf(text));
  if (!(parsed instanceof PSystemDefinition)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return parsed.exportDiagram(0, new DeterministicMeasurer());
}

/** The `<text>` bodies of a document. */
function texts(svg: string): string[] {
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((m) => m[1]!);
}

describe('PSystemDefinition', () => {
  it.each(['banire-12-feze162', 'firiru-71-viki803'])('matches the jar with zero diffs (%s)', (slug) => {
    const { diffs } = compareSvg(render(corpus(slug, 'in.puml')), corpus(slug, 'in.svg'), 'deterministic');
    expect(diffs).toEqual([]);
  });

  it('draws only the start line (banire-12-feze162)', () => {
    expect(texts(render(corpus('banire-12-feze162', 'in.puml')))).toEqual(['@startdef(id=macro)']);
  });

  it.each([
    ['@startdef(id=e)\n@enddef', 'width:98px;height:15px'], // cov-def-empty: drawn, not the Welcome page
    ['@startdef(id=a\\nb)\n@enddef', 'width:93px;height:29px'], // cov-def-newline: a real break
    ['@startdef(id=<b>c</b>)\n@enddef', 'width:97px;height:15px'], // cov-def-creole
    ['@startdef\nx\n@enddef', 'width:61px;height:15px'], // cov-def-plain
    ['@startdef(id=abc)\nx\n@enddef', 'width:112px;height:15px'], // cov-def-id
  ])('sizes %j as the jar does', (text, size) => {
    expect(render(text)).toContain(size);
  });

  it('describes itself as (Definition)', () => {
    const parsed = parseDefinition(sourceOf('@startdef\nx\n@enddef'));
    expect(parsed instanceof PSystemDefinition && parsed.getDescription()).toBe('(Definition)');
  });
});
