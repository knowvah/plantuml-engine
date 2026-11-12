/**
 * `renderFlow` against the jar: `cov-single`, `bemixo-79-xulu250` and
 * `cov-option-handwritten` (planning oracles, `plans/flow-engine-port/probes/`).
 * Multi-box output is compared as a multiset of elements (flp D4).
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import { FlowDiagram } from '../../../src/diagrams/flow/FlowDiagram.js';
import { parseFlow } from '../../../src/diagrams/flow/FlowDiagramFactory.js';
import { renderFlow } from '../../../src/diagrams/flow/flow-export.js';
import { sourceOf } from '../../helpers/utility-single-line.js';

function fragment(body: string) {
  const parsed = parseFlow(sourceOf(`@startflow\n${body}\n@endflow`));
  if (!(parsed instanceof FlowDiagram)) throw new Error(`refused: ${parseRefusalOf(parsed)?.message}`);
  return renderFlow(parsed, new DeterministicMeasurer());
}

/** The drawn elements of an SVG body, one string per element. */
function elements(body: string): string[] {
  return [...body.matchAll(/<(?:rect|line|ellipse)[^>]*\/>|<text[^>]*>[^<]*<\/text>/g)].map((m) => m[0]);
}

/** `bemixo-79-xulu250`'s cached jar body (`test-results/dot-cache/unknown/`), in the jar's draw order of that run. */
const BEMIXO_JAR = [
  '<rect x="57.319" y="88" width="85.363" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="67.319" y="108.889" fill="#000" font-size="14" textLength="65.363" font-family="serif">FINDHW()</text>',
  '<rect x="207.619" y="368" width="184.762" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="217.619" y="388.889" fill="#000" font-size="14" textLength="164.762" font-family="serif">is dynamic data for this C?</text>',
  '<rect x="66.987" y="18" width="66.025" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="76.987" y="38.889" fill="#000" font-size="14" textLength="46.025" font-family="serif">START</text>',
  '<rect x="52.725" y="368" width="94.55" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="62.725" y="388.889" fill="#000" font-size="14" textLength="74.55" font-family="serif">return result</text>',
  '<rect x="403.725" y="368" width="192.55" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="413.725" y="388.889" fill="#000" font-size="14" textLength="172.55" font-family="serif">Find Data on the heap for C</text>',
  '<rect x="56.575" y="158" width="86.85" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="66.575" y="178.889" fill="#000" font-size="14" textLength="66.85" font-family="serif">GetTable()</text>',
  '<rect x="395.981" y="298" width="208.038" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="405.981" y="318.889" fill="#000" font-size="14" textLength="188.038" font-family="serif">Can the buffer accommodate?</text>',
  '<rect x="80.419" y="228" width="39.163" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="90.419" y="248.889" fill="#000" font-size="14" textLength="19.163" font-family="serif">i=0</text>',
  '<rect x="26.825" y="298" width="146.35" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>',
  '<text x="36.825" y="318.889" fill="#000" font-size="14" textLength="126.35" font-family="serif">is i==TopologySize?</text>',
  '<line x1="100" y1="52" x2="100" y2="88" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="100.5" cy="88.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
  '<line x1="100" y1="122" x2="100" y2="158" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="100.5" cy="158.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
  '<line x1="100" y1="192" x2="100" y2="228" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="100.5" cy="228.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
  '<line x1="100" y1="262" x2="100" y2="298" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="100.5" cy="298.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
  '<line x1="100" y1="332" x2="100" y2="368" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="100.5" cy="368.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
  '<line x1="147.275" y1="385" x2="207.619" y2="385" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="208.119" cy="385.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
  '<line x1="392.381" y1="385" x2="403.725" y2="385" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="404.225" cy="385.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
  '<line x1="500" y1="368" x2="500" y2="332" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="500.5" cy="332.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
  '<line x1="395.981" y1="315" x2="173.175" y2="315" style="stroke:#A80036;stroke-width:1;"/>',
  '<ellipse cx="173.675" cy="315.5" rx="3.5" ry="3.5" fill="#A80036" style="stroke:#A80036;stroke-width:1;"/>',
];

const BEMIXO = [
  '10 "START"',
  's 20 "FINDHW()"',
  's 30 "GetTable()"',
  's 40 "i=0"',
  's 50 "is i==TopologySize?"',
  's 60 "return result"',
  'e 70 "is dynamic data for this C?"',
  'e 80 "Find Data on the heap for C"',
  'n 90 "Can the buffer accommodate?"',
  'w 50',
].join('\n');

describe('renderFlow', () => {
  it('draws cov-single byte for byte: 201x71 on #FFFFFF with 0 margins', () => {
    expect(fragment('10 "START"')).toEqual({
      body:
        '<rect x="66.987" y="18" width="66.025" height="34" fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"/>' +
        '<text x="76.987" y="38.889" fill="#000" font-size="14" textLength="46.025" font-family="serif">START</text>',
      width: 201,
      height: 71,
      diagramType: 'FLOW',
      background: '#FFFFFF',
    });
  });

  it('draws bemixo-79-xulu250 as a multiset of the jar body, 605x421 (flp D4)', () => {
    const f = fragment(BEMIXO);
    expect([f.width, f.height]).toEqual([605, 421]);
    const ours = elements(f.body);
    expect(ours.join('')).toBe(f.body);
    expect([...ours].sort()).toEqual([...BEMIXO_JAR].sort());
  });

  it('draws the boxes in insertion order, then the paths in source order (flp D4)', () => {
    const labels = elements(fragment(BEMIXO).body)
      .filter((e) => e.startsWith('<text'))
      .map((e) => e.replace(/<[^>]*>/g, ''));
    expect(labels.slice(0, 3)).toEqual(['START', 'FINDHW()', 'GetTable()']);
    const firstLine = elements(fragment(BEMIXO).body).findIndex((e) => e.startsWith('<line'));
    expect(firstLine).toBe(18);
  });

  // Derived from FlowDiagram.java:125-127 and 197-200, not a jar render; T3b's
  // north-west fixture checks the same layout against an oracle.
  it('shifts by minX/minY when a box goes north-west of the root', () => {
    const f = fragment('10 "A"\nn 20 "B"\nw 30 "C"');
    expect([f.width, f.height]).toEqual([401, 141]);
    expect(f.body).toContain('<line x1="300" y1="88" x2="300" y2="52"');
  });

  it('has no margins and describes itself (FlowDiagram.java:85-87, 206-209)', () => {
    const d = parseFlow(sourceOf('@startflow\n10 "A"\n@endflow')) as FlowDiagram;
    expect(d.getDefaultMargins().getTop()).toBe(0);
    expect(d.getTextBlock()).toBe(d);
  });
});
