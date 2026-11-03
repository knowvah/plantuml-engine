/**
 * dss T3f: `TextBlockExporter.Builder#calculateMargin`
 * (`core/TextBlockExporter.java:510-516`) over `CucaDiagram#getDefaultMargins()`
 * `(0, 5, 5, 0)` (`CucaDiagram.java:741-745`). Expected values are the jar's
 * (rows `state__x-margin-*`).
 */
import { describe, expect, it } from 'vitest';

import type { UmlSource } from '../../../src/core/block-extractor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { defaultTheme, type Theme } from '../../../src/core/theme.js';
import { layoutState } from '../../../src/diagrams/state/layout.js';
import { parseState } from '../../../src/diagrams/state/parser.js';
import { renderState } from '../../../src/diagrams/state/renderer.js';
import type { StateGeometry } from '../../../src/diagrams/state/state-geo-types.js';

const SIDES = { top: 3, right: 7, bottom: 11, left: 13 };

function geometry(theme: Theme, ...lines: string[]): StateGeometry {
  const block: UmlSource = { lines, type: 'state' };
  const parsed = parseState(block);
  if ('refused' in parsed) throw new Error(parsed.message);
  return layoutState(parsed, theme, new DeterministicMeasurer());
}

const withMargin: Theme = { ...defaultTheme, diagramMargin: SIDES };

describe('state document margin', () => {
  it('keeps today values and adds no field when nothing sets a margin', () => {
    const geo = geometry(defaultTheme, 'state A');
    expect(geo.documentMargin).toBeUndefined();
    expect(geo.states[0]!.x).toBe(7);
    expect(geo.states[0]!.y).toBe(7);
    expect(renderState(geo, defaultTheme).documentMargin).toBeUndefined();
  });

  it('grows the canvas by each side and moves the drawing by (left, top)', () => {
    const plain = geometry(defaultTheme, 'state A');
    const geo = geometry(withMargin, 'state A');
    // default (0, 5, 5, 0) -> (3, 7, 11, 13): width +15, height +9.
    expect(geo.totalWidth).toBe(plain.totalWidth + 15);
    expect(geo.totalHeight).toBe(plain.totalHeight + 9);
    expect(geo.states[0]!.x).toBe(7 + 13);
    expect(geo.states[0]!.y).toBe(7 + 3);
    expect(geo.preChromeWidth).toBe(plain.preChromeWidth);
    expect(renderState(geo, withMargin).documentMargin).toEqual(SIDES);
  });

  it('applies under a mainframe, outside the frame ink', () => {
    const framed = ['mainframe M', 'state A'];
    const plain = geometry(defaultTheme, ...framed);
    const geo = geometry(withMargin, ...framed);
    expect(geo.documentMargin).toEqual(SIDES);
    expect(geo.frameInk).toEqual(plain.frameInk);
    expect(geo.preChromeWidth).toBe(plain.preChromeWidth);
    expect(geo.states[0]!.x).toBe(plain.states[0]!.x + 13);
    expect(geo.totalWidth).toBe(plain.totalWidth + 15);
  });
});

describe('state diagram border (`TextBlockExporter#maybeDrawBorder`)', () => {
  it('hands the resolved skinparam colour to the shell', () => {
    const theme: Theme = {
      ...defaultTheme,
      colors: { ...defaultTheme.colors, graph: { ...defaultTheme.colors.graph, diagramBorderColor: 'red' } },
    };
    expect(renderState(geometry(theme, 'state A'), theme).diagramBorderColor).toBe('#FF0000');
  });

  it('adds no field when unset', () => {
    expect(renderState(geometry(defaultTheme, 'state A'), defaultTheme).diagramBorderColor).toBeUndefined();
  });
});
