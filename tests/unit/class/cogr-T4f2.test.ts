/**
 * cogr T4f2: a class edge label holding a `{{ }}` block draws the embedded diagram as one image atom
 * (`CreoleParser.java:150-170`, `EmbeddedDiagram.createAndSkip` `:97-114`), stacked with the label's other lines in
 * `SheetBlock1` (`SheetBlock1.java:104-148`, each stripe centred in the widest). Oracle:
 * `test-results/dot-cache/class/dobefe-98-moji323` -- `svek-1.dot` label `WIDTH="94" HEIGHT="192"` (a 92x151 image
 * plus the lines `API`, `Details:` and the trailing empty one, 13 each, plus the 1px label margin), and the link
 * group's `API` / `Details:` texts, the `<image width="92" height="151" x="80.009" y="143">`, then the blank text.
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

const measurer = new DeterministicMeasurer();
const ROW = 'test-results/dot-cache/class/dobefe-98-moji323/in.puml';

function linkGroup(svg: string): string {
  const start = svg.indexOf('<!--link B to A-->');
  return svg.slice(start, svg.indexOf('</g>', start));
}

describe('class edge label with an embedded diagram (cogr T4f2)', () => {
  const svg = renderSync(readFileSync(ROW, 'utf8'), { measurer });
  const group = linkGroup(svg);

  it('draws the embed as one image of the nested render size, between its text lines', () => {
    expect(group).toMatch(/<image width="92" height="151" x="80\.009" y="143" /);
    const order = [...group.matchAll(/<(text|image)\b/g)].map((m) => m[1]);
    expect(order).toEqual(['text', 'text', 'image', 'text']);
  });

  it('does not draw the embed source lines as text', () => {
    expect(group).not.toContain('a-&gt;b:req');
    expect(group).not.toContain('{{');
    expect(group).toContain('>API</text>');
    expect(group).toContain('>Details:</text>');
  });

  it('sizes the page like the oracle', () => {
    expect(svg).toMatch(/height="396px"/);
  });

  it('keeps a label without an embed on the text path', () => {
    const plain = renderSync('@startuml\nclass A\nclass B\nA -> B : x\\ny\n@enduml', { measurer });
    expect(plain).not.toContain('<image');
  });
});
