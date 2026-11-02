/**
 * dbp-T2b: the class producer forwards a document gradient on the fragment and
 * does NOT draw a solid `documentBackgroundRect` for it -- the jar's
 * `SvgGraphics` constructor takes the gradient branch (`SvgGraphics.java:178-183`:
 * def + `url(#id)` rect, `backcolorString = null`) instead of the solid one
 * (`:186-192`), so the finalizer paints the gradient rect, not a `red/blue` fill.
 */
import { describe, expect, it } from 'vitest';

import { renderClass } from '../../../src/diagrams/class/renderer.js';
import type { ClassGeometry } from '../../../src/diagrams/class/layout.js';
import { defaultTheme, deepMergeTheme } from '../../../src/core/theme.js';

const GRADIENT = { color1: 'red', color2: 'blue', policy: '/' } as const;

const GEO: ClassGeometry = { totalWidth: 300, totalHeight: 200, edges: [], namespaces: [], leaves: [] };

describe('renderClass — document gradient (dbp-T2b)', () => {
  const gradientTheme = {
    ...defaultTheme,
    colors: { ...defaultTheme.colors, background: 'red/blue', backgroundGradient: GRADIENT },
  };

  it('carries theme.colors.backgroundGradient on the fragment', () => {
    expect(renderClass(GEO, gradientTheme).backgroundGradient).toEqual(GRADIENT);
  });

  it('draws no solid documentBackgroundRect for a gradient', () => {
    const fragment = renderClass(GEO, gradientTheme);
    expect('documentBackgroundRect' in fragment).toBe(false);
  });

  it('keeps the solid rule for a non-default colour: no gradient field, rect colour kept', () => {
    const fragment = renderClass(GEO, deepMergeTheme(defaultTheme, { colors: { background: 'gray' } }));
    expect('backgroundGradient' in fragment).toBe(false);
    expect(fragment.documentBackgroundRect).toBe('#808080');
  });
});
