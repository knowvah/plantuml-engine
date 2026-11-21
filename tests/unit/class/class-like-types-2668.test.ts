/**
 * plantuml#2668, upstream `592901f0c42` (#3006): `Entity#muteToType` tests
 * membership of `CLASS_LIKE_TYPES` (Entity.java:208-213), which adds
 * PROTOCOL/STRUCT/EXCEPTION/METACLASS/STEREOTYPE/ENTITY to the old
 * seven-type set, so a relation that creates `A` as a class may be followed by
 * `metaclass A` (or protocol/struct/exception/stereotype/entity).
 *
 * The fixtures in `tests/fixtures/class-2668/` are upstream's
 * `vega/nonreg/group2668` sources (front matter stripped) and the corpus row
 * `unknown/petiku-70-fogu777`, each with its jar SVG rendered by
 * `scripts/oracle-render.sh` (a720bdd). The two upstream sources set
 * `!pragma layout smetana`, so only their model is asserted (CLAUDE.md:
 * dot-engine instead of Smetana); petiku is a graphviz row and is compared.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/abel/Entity.java:208-232
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';
import { parseClass } from './parse-helper.js';

const DIR = new URL('../../fixtures/class-2668/', import.meta.url);

function source(name: string): string {
  return readFileSync(new URL(`${name}.puml`, DIR), 'utf8');
}

function kinds(name: string): Record<string, string> {
  const lines = source(name).split('\n');
  const ast = parseClass({ lines: lines.slice(1, lines.indexOf('@enduml')), type: 'class' });
  return Object.fromEntries(ast.classifiers.map((c) => [c.id, c.kind]));
}

describe('CLASS_LIKE_TYPES: declaring a class-like type after first use (#2668)', () => {
  it('other_class_like_types.puml: protocol, struct, exception, stereotype, entity', () => {
    expect(kinds('other_class_like_types')).toMatchObject({
      Proto: 'protocol',
      Point: 'struct',
      Failure: 'exception',
      Marker: 'stereotype',
      Customer: 'entity',
      Impl: 'class',
      Shape: 'class',
      Timeout: 'class',
      Model: 'class',
      Order: 'class',
    });
  });

  it('reported_case.puml: a metaclass first used as a superclass', () => {
    expect(kinds('reported_case')).toMatchObject({ MetaSubclass: 'metaclass', MetaClass: 'metaclass' });
  });

  it('petiku-70-fogu777: CLASS -> STRUCT renders the diagram the jar draws', () => {
    const ours = renderSync(source('petiku-70-fogu777'), { measurer: new DeterministicMeasurer() });
    const jar = readFileSync(new URL('petiku-70-fogu777.svg', DIR), 'utf8');
    expect(compareSvg(ours, jar, 'deterministic').diffs).toEqual([]);
  });

  it('OBJECT is still not a source type: object -> class stays an error page', () => {
    const ours = renderSync(source('object-to-class'), { measurer: new DeterministicMeasurer() });
    // The jar page (object-to-class.svg) ends in "Bad name"; the error-page
    // envelope itself is covered by the refusal gate.
    expect(readFileSync(new URL('object-to-class.svg', DIR), 'utf8')).toContain('Bad name');
    expect(ours).toContain('Bad name');
  });
});
