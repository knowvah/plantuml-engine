/**
 * dei-T4: `domain` and `requirement` in the description factory (`CommandCreateDomain`,
 * `DescriptionDiagramFactory.java:137`), drawn by the core Problem Frames images (`GeneralImageBuilder.java:235-256`).
 * Oracles are the jar's: the authored `dei-domain-*`/`dei-requirement` goldens and `unknown/rukitu-26-seme622`.
 */
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';
import { parseDescription } from '../../../src/diagrams/description/parser.js';
import type { DescriptionDiagramAST } from '../../../src/diagrams/description/ast.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { renderFixtureSurveyStyle } from '../../oracle/svg-conformance/render-fixture.js';

const AUTHORED = 'oracle/goldens/svg-description/component';
const TOLERANCE_CLASS = 'deterministic';

function diffsOf(puml: string, golden: string): unknown[] {
  const { svg } = renderFixtureSurveyStyle(readFileSync(puml, 'utf8'), new DeterministicMeasurer());
  return compareSvg(svg, readFileSync(golden, 'utf8'), TOLERANCE_CLASS).diffs;
}

function parse(...lines: string[]): ReturnType<typeof parseDescription> {
  return parseDescription({ lines } as never);
}

function ast(...lines: string[]): DescriptionDiagramAST {
  const result = parse(...lines);
  if (!('nodes' in result)) throw new Error(`refused: ${JSON.stringify(result)}`);
  return result;
}

describe('domain and requirement against the jar', () => {
  it.each(['dei-domain-each', 'dei-domain-group', 'dei-domain-group-link', 'dei-requirement', 'dei-requirement-lone'])(
    '%s draws the jar bytes',
    (slug) => {
      expect(diffsOf(`${AUTHORED}/${slug}/in.puml`, `${AUTHORED}/${slug}/golden.svg`)).toEqual([]);
    },
  );

  it('unknown/rukitu-26-seme622: two Problem Frames groups, left to right', () => {
    const dir = 'test-results/dot-cache/unknown/rukitu-26-seme622';
    expect(diffsOf(`${dir}/in.puml`, `${dir}/in.svg`)).toEqual([]);
  });

  it('a domain with no stereotype is the jar crash: an error page here too (EntityImageDomain.java:83)', () => {
    const svg = renderSync('@startuml\ndomain "Plain" as P0\n@enduml', { measurer: new DeterministicMeasurer() });
    expect(svg).not.toContain('data-diagram-type="DESCRIPTION"');
    expect(svg).toContain('NullPointerException');
  });
});

describe('CommandCreateDomain in description', () => {
  it('makes a leaf with its stereotype, and a group with the null-usymbol package decoration', () => {
    const tree = ast(
      'domain "Ctrl" as M <<Machine>> {',
      'domain "Motor" as D1 <<Causal>>',
      '}',
      'requirement "Need" as R',
    );
    const group = tree.nodes[0]!;
    expect(group).toMatchObject({
      id: 'M',
      display: 'Ctrl',
      symbol: 'package',
      groupType: 'domain',
      declaredAsGroup: true,
    });
    expect(group.children[0]).toMatchObject({ id: 'D1', leafType: 'domain', stereotype: ['Causal'] });
    expect(tree.nodes[1]).toMatchObject({ id: 'R', display: 'Need', leafType: 'requirement' });
  });

  it('refuses a code that exists: "Object already exists : <code>"', () => {
    expect(parse('domain "A" as A <<Causal>>', 'domain "B" as A <<Causal>>')).toMatchObject({
      kind: 'execution',
      message: 'Object already exists : A',
    });
  });

  it('needs a quoted display and an alphanumeric code (CommandCreateDomain.java:65-77)', () => {
    expect(parse('domain A as A')).toMatchObject({ kind: 'syntax' });
    expect(parse('domain "A" as A-1')).toMatchObject({ kind: 'syntax' });
  });

  it('drops the generic part of the display', () => {
    expect(ast('domain "Name<T>" as N <<Lexical>>').nodes[0]!.display).toBe('Name');
  });
});
