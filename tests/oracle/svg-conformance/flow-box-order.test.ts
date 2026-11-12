/**
 * Ruling #174 (option 2, narrowed): for a FLOW reference, `compareSvg` treats
 * the leading run of box groups as unordered and keeps everything after it
 * positional. The jar draws boxes in `HashMap<Tile, ActivityBox>` identity-hash
 * order (`FlowDiagram.java:129-140`) but connectors in source order
 * (`FlowDiagram.java:141-152`).
 */
import { describe, it, expect } from 'vitest';

import { compareSvg } from './compare.js';
import { canonicalizeFlowBoxOrder, isFlowDocument } from './flow-box-order.js';
import { normalizeSvg } from './normalize.js';
import {
  countFlowBoxes,
  listAuthoredFlowSlugs,
  readAuthoredFlowFixture,
  readAuthoredFlowVariants,
  renderFixtureFlow,
} from './render-fixture-flow.js';

const BOX_STYLE = 'fill="#FEFECE" style="stroke:#A80036;stroke-width:1.5;" rx="12.5" ry="12.5"';
const LINK_STYLE = 'style="stroke:#A80036;stroke-width:1;"';

/** A box `ActivityBox.drawU` paints: the rounded rectangle, then its text block. */
function box(cx: number, cy: number, label: string): string {
  return (
    `<rect x="${cx - 20}" y="${cy - 17}" width="40" height="34" ${BOX_STYLE}/>` +
    `<text x="${cx - 10}" y="${cy + 4}" fill="#000" font-size="14">${label}</text>`
  );
}

/** A connector `FlowDiagram#drawU` paints: the line, then the 7x7 arrow ellipse. */
function link(x1: number, y1: number, x2: number, y2: number): string {
  return (
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${LINK_STYLE}/>` +
    `<ellipse cx="${x2 + 0.5}" cy="${y2 + 0.5}" rx="3.5" ry="3.5" fill="#A80036" ${LINK_STYLE}/>`
  );
}

function doc(body: string, type = 'FLOW'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" data-diagram-type="${type}" width="300" height="200"><g>${body}</g></svg>`;
}

const A = box(100, 35, 'A');
const B = box(100, 105, 'B');
const C = box(200, 105, 'C');
const AB = link(100, 52, 100, 88);
const BC = link(120, 105, 180, 105);

describe('isFlowDocument', () => {
  it('reads the root data-diagram-type, which normalizeSvg strips', () => {
    expect(isFlowDocument(doc(A))).toBe(true);
    expect(isFlowDocument(doc(A, 'ACTIVITY'))).toBe(false);
    expect(isFlowDocument(`<svg><g data-diagram-type="FLOW"/></svg>`)).toBe(false);
  });
});

describe('compareSvg on a FLOW reference (ruling #174)', () => {
  it('passes when only the box draw order differs', () => {
    const { pass, diffs } = compareSvg(doc(A + B + C + AB + BC), doc(C + A + B + AB + BC), 'deterministic');
    expect(diffs).toEqual([]);
    expect(pass).toBe(true);
  });

  it('keeps the connector section positional', () => {
    expect(compareSvg(doc(A + B + C + BC + AB), doc(A + B + C + AB + BC), 'deterministic').pass).toBe(false);
  });

  it('keeps each text bound to its own box', () => {
    const split =
      `<rect x="80" y="18" width="40" height="34" ${BOX_STYLE}/>` +
      `<rect x="80" y="88" width="40" height="34" ${BOX_STYLE}/>` +
      `<text x="90" y="39" fill="#000" font-size="14">A</text>` +
      `<text x="90" y="109" fill="#000" font-size="14">B</text>`;
    expect(compareSvg(doc(split), doc(A + B), 'deterministic').pass).toBe(false);
  });

  it('still fails a box drawn in the wrong place', () => {
    expect(compareSvg(doc(box(300, 35, 'A') + B), doc(B + A), 'deterministic').pass).toBe(false);
  });

  it('leaves every other diagram type positional', () => {
    const ours = doc(A + B + C, 'ACTIVITY');
    expect(compareSvg(ours, doc(C + A + B, 'ACTIVITY'), 'deterministic').pass).toBe(false);
  });
});

describe('canonicalizeFlowBoxOrder', () => {
  it('orders box groups by tile, row first, and keeps the tail in place', () => {
    const tree = canonicalizeFlowBoxOrder(normalizeSvg(doc(C + B + A + AB)));
    const labels = tree.children![0]!.children!.filter((n) => n.tag === 'text').map((n) => n.children![0]!.text);
    expect(labels).toEqual(['A', 'B', 'C']);
    expect(tree.children![0]!.children!.slice(-2).map((n) => n.tag)).toEqual(['line', 'ellipse']);
  });

  it('returns the tree unchanged when the drawing does not open with a box', () => {
    const tree = normalizeSvg(doc(`<text x="1" y="2">x</text>` + B + A));
    expect(canonicalizeFlowBoxOrder(tree)).toEqual(tree);
  });

  it('returns the tree unchanged when a connector sits between boxes', () => {
    const tree = normalizeSvg(doc(B + AB + A));
    expect(canonicalizeFlowBoxOrder(tree)).toEqual(tree);
  });
});

describe('the authored multi-box flow fixtures (real jar output)', () => {
  const multiBox = listAuthoredFlowSlugs().filter((slug) => {
    const { markup, golden } = readAuthoredFlowFixture(slug);
    return countFlowBoxes(markup) >= 2 && golden !== undefined && isFlowDocument(golden);
  });

  it('are the 38 the multiset tier holds', () => {
    expect(multiBox).toHaveLength(38);
  });

  for (const slug of multiBox) {
    it(`${slug}: our render is conformant with the oracle or a recorded jar layout`, () => {
      const ours = renderFixtureFlow(readAuthoredFlowFixture(slug).markup);
      const results = readAuthoredFlowVariants(slug).map((jar) => compareSvg(ours, jar, 'deterministic'));
      expect(
        results.some((r) => r.pass),
        JSON.stringify(results[0]!.diffs.slice(0, 2)),
      ).toBe(true);
    });
  }
});
