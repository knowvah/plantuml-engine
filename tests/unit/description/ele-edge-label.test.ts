/**
 * ele T2a: a description link text with a `{{` line is a `CreoleParser` embed stripe (`CreoleParser.java:146-170`),
 * in the main label's DOT table (`SvekEdge.java:504-507`), in a quantifier's table (`:330-340`), and in the
 * dzeta that sets nodesep (`:1159-1179`). Expected values are the jar's `svek-1.dot` for each fixture under
 * `tests/fixtures/edge-label-embed/` (`scripts/oracle-render.sh`).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { NestedDiagramRenderer } from '../../../src/core/EmbeddedDiagram.js';
import { getNestedDiagramRenderer, registerNestedDiagramRenderer } from '../../../src/core/nested-diagram-registry.js';
import { createNestedDiagramRenderer } from '../../../src/diagrams/class/class-nested-diagram-renderer.js';
import {
  buildLinkEdgeAttributes,
  computeGraphSpacing,
  type EdgeFontSpecs,
} from '../../../src/diagrams/description/link-edge-attrs.js';
import type { DescriptiveLink } from '../../../src/diagrams/description/ast.js';

/** The arrow label and cardinality font: `SansSerif` 13 (`skin/plantuml.skin`). */
const FONT = { family: 'SansSerif', size: 13 };
const FONTS: EdgeFontSpecs = { label: FONT, cardinality: FONT };
/** dot's `nodesep` is in inches: 72 points each. */
const POINTS_PER_INCH = 72;

const link = (fields: Partial<DescriptiveLink>): DescriptiveLink =>
  ({ from: 'A', to: 'B', length: 2, arrowHead: 'filled', ...fields }) as DescriptiveLink;

describe('ele T2a: description edge texts with an embedded diagram', () => {
  let saved: NestedDiagramRenderer | undefined;
  const measurer = new DeterministicMeasurer();
  beforeEach(() => {
    saved = getNestedDiagramRenderer();
    registerNestedDiagramRenderer(createNestedDiagramRenderer((src) => renderSync(src, { measurer })));
  });
  afterEach(() => {
    if (saved !== undefined) registerNestedDiagramRenderer(saved);
  });

  it('reserves the Welcome page plus 2x1 for an unterminated `{{` (comp-open svek-1.dot 534x229)', () => {
    const attrs = buildLinkEdgeAttributes(link({ label: '{{' }), FONTS, measurer);
    expect([attrs.labelBoxWidth, attrs.labelBoxHeight]).toEqual([534, 229]);
  });

  it('reserves the nested class plus 2x1 for a well-formed embed (comp svek-1.dot 63x70)', () => {
    const attrs = buildLinkEdgeAttributes(link({ label: '{{\\nclass X\\n}}' }), FONTS, measurer);
    expect([attrs.labelBoxWidth, attrs.labelBoxHeight]).toEqual([63, 70]);
  });

  it('reserves the Welcome page, unmargined, for a `{{` quantifier (comp-qual taillabel 532x227)', () => {
    const attrs = buildLinkEdgeAttributes(link({ firstLabel: '{{', secondLabel: 'x' }), FONTS, measurer);
    expect([attrs.tailLabelWidth, attrs.tailLabelHeight]).toEqual([532, 227]);
  });

  it('widens nodesep by the margined embed on a horizontal link (comp-h-open nodesep=0.758333)', () => {
    const { nodeSep } = computeGraphSpacing([link({ length: 1, label: '{{' })], FONT, measurer);
    // `getHorizontalDzeta`: 532 + 2x1 marginLabel + decor 2 + 10 (arrow) = 546; `/ 10` (DotStringFactory).
    expect(nodeSep).toBeCloseTo(546 / 10, 10);
    expect((nodeSep / POINTS_PER_INCH).toFixed(6)).toBe('0.758333');
  });
});
