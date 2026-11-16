/**
 * cogr T3b: association-point link ids under a custom namespace separator. `Link#idCommentForSvg`
 * (`abel/Link.java:106-113`) names each end by `Entity#getName()` -- the quark's own name, not the qualified one
 * (`Entity.java:686-688`, `Quark.java:84-86`) -- so with `set namespaceSeparator \\` the ids are `Card-apoint7`,
 * `apoint7-to-Tag`, `apoint7-CardTag`. Oracle: `test-results/dot-cache/class/kibinu-30-pese048/in.svg`.
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const SOURCE = [
  '@startuml',
  'set namespaceSeparator \\\\',
  'CardBundle\\\\Card "1" --> "1..*" TagBundle\\\\Tag',
  '(CardBundle\\\\Card,TagBundle\\\\Tag) .. TagBundle\\\\CardTag',
  '@enduml',
].join('\n');

function pathIds(source: string): string[] {
  const svg = renderSync(source, { measurer: new DeterministicMeasurer() });
  return [...svg.matchAll(/<path [^>]*\bid="([^"]*)"/g)].map((m) => m[1]!);
}

describe('association-point link ids under set namespaceSeparator (cogr T3b)', () => {
  it('names each end by its leaf, as the jar does', () => {
    expect(pathIds(SOURCE).filter((id) => id.includes('apoint'))).toEqual([
      'Card-apoint7',
      'apoint7-to-Tag',
      'apoint7-CardTag',
    ]);
  });

  it('keeps the leaf split on the default separator', () => {
    const ids = pathIds(['@startuml', 'ns.A --> ns.B', '(ns.A, ns.B) .. ns.C', '@enduml'].join('\n'));
    expect(ids.filter((id) => id.includes('apoint')).every((id) => !id.includes('ns.'))).toBe(true);
  });

  // `AbstractClassOrObjectDiagram.java:326-330`: a repeat coupling inverts the older circle's class link
  // (`getInv()`), so its end names swap with it (bunuce-10-vere519: `R1-apoint6`).
  it('swaps the end names of an inverted class link', () => {
    const ids = pathIds(['@startuml', 'A-B', '(A,B) .. R1', 'R2 .. (A,B)', '@enduml'].join('\n'));
    expect(ids.filter((id) => id.startsWith('R1-apoint'))).toHaveLength(1);
    expect(ids.some((id) => id === 'R1-R1')).toBe(false);
  });
});
