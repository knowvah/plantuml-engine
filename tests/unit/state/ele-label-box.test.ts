/**
 * ele T1b: a state link label whose display holds a `{{ … }}` line reserves the stacked block in its DOT table
 * (`SvekEdge.java:504-507`): text lines through the state creole block, the embed at the nested document's own size
 * (`EmbeddedDiagram.java:129-133`), stacked per `SheetBlock1#initMap`. Expected boxes are the jar's `svek-1.dot`
 * `TABLE WIDTH/HEIGHT` for each fixture (`scripts/oracle-render.sh`).
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import type { NestedDiagramRenderer } from '../../../src/core/EmbeddedDiagram.js';
import { getNestedDiagramRenderer, registerNestedDiagramRenderer } from '../../../src/core/nested-diagram-registry.js';
import { createNestedDiagramRenderer } from '../../../src/diagrams/class/class-nested-diagram-renderer.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import {
  labelDisplayBlock,
  labelOpensWithEmbed,
  measureStateLabelBox,
} from '../../../src/diagrams/state/state-label-style.js';

/** The state arrow label font: `SansSerif` 13 (`skin/plantuml.skin`, `arrow { FontSize 13 }`). */
const FONT = { family: 'SansSerif', size: 13 };
const WELL_FORMED = '{{\\nclass X\\n}}';
const MIXED = 'text\\n{{\\nclass X\\n}}\\nmore';

describe('ele T1b: measureStateLabelBox with an embedded diagram', () => {
  let saved: NestedDiagramRenderer | undefined;
  const measurer = new DeterministicMeasurer();
  beforeEach(() => {
    saved = getNestedDiagramRenderer();
    registerNestedDiagramRenderer(createNestedDiagramRenderer((src) => renderSync(src, { measurer })));
  });
  afterEach(() => {
    if (saved !== undefined) registerNestedDiagramRenderer(saved);
  });

  it('reserves the Welcome page plus 2x6 for an unterminated `{{` self-loop (xetase svek-1.dot 544x239)', () => {
    const box = measureStateLabelBox('{{', FONT, measurer, true);
    expect([box.reservedWidth, box.reservedHeight]).toEqual([544, 239]);
  });

  it('reserves the nested class plus 2x1 on an ordinary link (state svek-2.dot 63x70)', () => {
    const box = measureStateLabelBox(WELL_FORMED, FONT, measurer, false);
    expect([box.reservedWidth, box.reservedHeight]).toEqual([63, 70]);
  });

  it('reserves the nested class plus 2x6 on a self-loop (state-self svek-1.dot 73x80)', () => {
    const box = measureStateLabelBox(WELL_FORMED, FONT, measurer, true);
    expect([box.reservedWidth, box.reservedHeight]).toEqual([73, 80]);
  });

  it('stacks text lines above and below the embed (state-mixed svek-3.dot 63x96)', () => {
    const box = measureStateLabelBox(MIXED, FONT, measurer, false);
    expect([box.reservedWidth, box.reservedHeight]).toEqual([63, 96]);
  });

  it('shifts a narrower stripe by the whole difference for RIGHT (SheetBlock1.java:188-189, coef 1)', () => {
    const style = { alignment: HorizontalAlignment.RIGHT, classAttributeIconSize: 10 };
    const display = labelDisplayBlock(
      'a much longer line of text\\n{{\\nclass X\\n}}',
      { font: FONT, measurer },
      style,
    );
    const [text, image] = display.stripes!.items;
    expect(text!.dx).toBe(0);
    expect(image!.kind).toBe('image');
    expect(image!.dx).toBe(display.stripes!.width - (image!.kind === 'image' ? image!.width : 0));
    expect(image!.dy).toBe(text!.kind === 'text' ? text!.line.height : NaN);
  });

  it('keeps an embed-free label on the flat creole path', () => {
    const display = labelDisplayBlock(
      'plain',
      { font: FONT, measurer },
      { alignment: HorizontalAlignment.CENTER, classAttributeIconSize: 10 },
    );
    expect(display.stripes).toBeUndefined();
    expect(labelOpensWithEmbed('plain')).toBe(false);
    expect(labelOpensWithEmbed('{{')).toBe(true);
    expect(labelOpensWithEmbed(MIXED)).toBe(false);
  });
});
