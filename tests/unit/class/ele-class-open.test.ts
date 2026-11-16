/**
 * ele T3a: a class/object edge label that is one unterminated `{{` line is still an `EmbeddedDiagram` stripe
 * (`CreoleParser.java:146-170`: the walk has no line-count condition). The measure arm gated the embed on
 * `lines.length > 1`, so it reserved the text `{{` (10.6x15) while the draw arm drew the 532x227 Welcome page; the jar's
 * `svek-1.dot` for `class-open` reserves `WIDTH="534" HEIGHT="229"` (532x227 + 2x1 `marginLabel`).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import {
  getClassNestedDiagramRenderer,
  registerNestedDiagramRenderers,
  type EmbeddedRenderer,
} from '../../../src/diagrams/class/class-nested-diagram-renderer.js';
import { computeMeasuredLabelAttrs } from '../../../src/diagrams/class/class-edge-label-measure.js';
import { setLayoutInputObserver, type LayoutInputEvent } from '../../../src/core/graph-layout.js';

/** The class arrow label font: `SansSerif` 13 (`skin/plantuml.skin`). */
const FONT = { family: 'SansSerif', size: 13 };

describe('ele T3a: a single-line `{{` class edge label', () => {
  const measurer = new DeterministicMeasurer();
  let saved: EmbeddedRenderer | undefined;
  beforeEach(() => {
    saved = getClassNestedDiagramRenderer();
    registerNestedDiagramRenderers((src) => renderSync(src, { measurer }));
  });
  afterEach(() => {
    setLayoutInputObserver(undefined);
    if (saved !== undefined) registerNestedDiagramRenderers((src) => renderSync(src, { measurer }));
  });

  it('measures the Welcome page of the empty embed, not the text `{{`', () => {
    const attrs = computeMeasuredLabelAttrs('{{', FONT, measurer);
    expect([attrs.labelWidth, attrs.labelHeight]).toEqual([532, 227]);
  });

  it('reserves the jar DOT table 534x229 for class-open', () => {
    const boxes: Array<[number | undefined, number | undefined]> = [];
    setLayoutInputObserver((e: LayoutInputEvent) => {
      if (e.nestedDepth > 0) return;
      for (const edge of e.graph.edges) boxes.push([edge.attributes?.labelBoxWidth, edge.attributes?.labelBoxHeight]);
    });
    renderSync('@startuml\nclass A\nclass B\nA --> B : {{\n@enduml\n', { measurer });
    expect(boxes).toEqual([[534, 229]]);
  });
});
