/**
 * cogr T3a: an association class with a label. `CommandLinkClass.java:165-170` ends the regex with an optional
 * `:` `LABEL_LINK` `(.+)`, and `executeArgSpecial1/2` (`:414`, `:449`) hand that label to
 * `AbstractClassOrObjectDiagram#associationClass`, where `Association#createNew` puts it on the
 * point-to-associated link (`LinkArg.build(label, length)`, `AbstractClassOrObjectDiagram.java:280-283`). Only
 * `executeArg` (`:367`) sets a `LinkArrow`, so a trailing ` >` on that label is drawn as text.
 * Oracles: `test-results/dot-cache/class/{kofogo-67-jiju461,zemeco-27-kaje686}/in.svg`.
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { setLayoutInputObserver } from '../../../src/core/graph-layout.js';
import { toSvekDot } from '../../../src/core/svek-dot-emit.js';
import { ASSOC_COUPLE_RE } from '../../../src/diagrams/class/class-assoc-couple.js';

function render(lines: readonly string[]): string {
  return renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
}

describe('association class couple with a label (cogr T3a)', () => {
  it('captures the label of a leading couple', () => {
    const m = ASSOC_COUPLE_RE.exec('(A, B) .. C : x')!;
    expect([m[1], m[2], m[3], m[4], m[5]]).toEqual(['A', 'B', '..', 'C', 'x']);
  });

  it('captures the label of a trailing couple', () => {
    const m = ASSOC_COUPLE_RE.exec('C .. (A, B) : y z')!;
    expect([m[6], m[7], m[8], m[9], m[10]]).toEqual(['C', '..', 'A', 'B', 'y z']);
  });

  it('routes CLASS and draws the label on the circle-to-class link', () => {
    const svg = render(['class A', 'class B', '(A, B) .. C : Exception']);
    expect(svg).toContain('data-diagram-type="CLASS"');
    expect(svg).toMatch(/<text [^>]*>Exception<\/text>/);
    expect(svg).toMatch(/id="apoint\d+-C"\/><text [^>]*>Exception<\/text>/);
  });

  it('draws a trailing > literally, with no magic-arrow glyph', () => {
    const svg = render(['A -> B', '(A, B) -> C : under Contract >']);
    expect(svg).toContain('textLength="97.094">under Contract ></text>');
    expect(svg).not.toContain('>under Contract</text>');
    expect(svg).not.toMatch(/<polygon[^>]*points="[^"]*"[^>]*fill="#000"[^>]*\/><text[^>]*>under/);
  });
});

describe("the association point joins its pair's group (cogr T3a)", () => {
  // `AbstractClassOrObjectDiagram.java:244-249`: `entity1.getQuark().getParent() == entity2.getQuark().getParent()`
  // puts the point in that shared parent, so the cluster holds it (kofogo-67-jiju461's oracle `svek-1.dot`).
  it('puts the circle node inside the cluster of a dotted pair', () => {
    let dot = '';
    setLayoutInputObserver(({ graph }) => {
      dot = toSvekDot(graph);
    });
    try {
      render(['ns1.A --> ns1.B', '(ns1.B, ns1.A) .. ns1.C : x']);
    } finally {
      setLayoutInputObserver(undefined);
    }
    const inside = dot.slice(dot.indexOf('subgraph cluster'), dot.indexOf('}\n}\n}'));
    expect(inside).toMatch(/shape=circle/);
    expect(inside.match(/shape=rect/g)).toHaveLength(3);
  });
});
