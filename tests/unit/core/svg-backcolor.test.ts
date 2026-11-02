import { describe, expect, it } from 'vitest';
import type { Gradient } from '../../../src/core/paint.js';
import { collectDocumentDefs } from '../../../src/core/svg-defs.js';
import { backcolorPaint } from '../../../src/core/svg-backcolor.js';

/**
 * Expected markup is what the two verified finalizers already emit for the same
 * inputs: `assemble-svg-sequence.ts#maybeSequenceBackgroundRect` (:53-60) and
 * `assemble-svg-activity.ts#maybeActivityBackgroundRect` (:62-69) for a solid,
 * `sequenceBackgroundRect` (:71-77) / `activityBackgroundRect` (:86-97) for a
 * gradient -- all the one call `rect(0, 0, w, h, { fill, stroke: 'none',
 * strokeWidth: 1 })` in the fragment form (`fill="#F00" stroke="none"`).
 * Branches: SvgGraphics.java:176-192 (constructor), :207-212 (paintBackcolor),
 * :805-806 (root `background:`), :819-821 (rect size = format(maxX) x format(maxY)).
 */
const W = 200;
const H = 100;

const rectOf = (fill: string, width = W, height = H): string =>
  `<rect x="0" y="0" width="${String(width)}" height="${String(height)}" fill="${fill}" stroke="none"/>`;

describe('backcolorPaint -- solid (SvgGraphics.java:186-192)', () => {
  it('paints a (0,0) rect and sets the root background for an ordinary colour', () => {
    expect(backcolorPaint('red', undefined, W, H)).toEqual({ rect: rectOf('#F00'), rootBackground: '#FF0000' });
  });

  it('resolves a hex spelling to the same result as the name', () => {
    expect(backcolorPaint('#ff0000', undefined, W, H)).toEqual(backcolorPaint('red', undefined, W, H));
  });

  it('resolves a named colour (grey) to its jar hex', () => {
    expect(backcolorPaint('grey', undefined, W, H)).toEqual({ rect: rectOf('#808080'), rootBackground: '#808080' });
  });

  it.each(['white', '#FFF', '#ffffff', '#FFFFFF', 'WHITE'])(
    'paints no rect for white spelled %s but keeps the root background',
    (spelling) => {
      expect(backcolorPaint(spelling, undefined, W, H)).toEqual({ rootBackground: '#FFFFFF' });
    },
  );

  it.each(['black', '#000', '#000000'])(
    'paints no rect for black spelled %s but keeps the root background',
    (spelling) => {
      expect(backcolorPaint(spelling, undefined, W, H)).toEqual({ rootBackground: '#000000' });
    },
  );

  it.each(['transparent', 'none', '#00000000'])(
    'paints no rect and no root background for transparent spelled %s',
    (spelling) => {
      expect(backcolorPaint(spelling, undefined, W, H)).toEqual({});
    },
  );

  it('keeps a translucent colour distinct from #00000000 (rect painted)', () => {
    const result = backcolorPaint('#FF000080', undefined, W, H);
    expect(result.rootBackground).toBe('#FF000080');
    expect(result.rect).toContain('width="200" height="100"');
  });

  it('sizes the rect format(maxX) x format(maxY): non-integers keep up to 3 decimals, no truncation', () => {
    expect(backcolorPaint('red', undefined, 100.5, 33.3333).rect).toBe(rectOf('#F00', 100.5, 33.333));
  });

  it('prints a zero size as 0 (SvgGraphics#format x == 0.0)', () => {
    expect(backcolorPaint('red', undefined, 0, 0).rect).toBe(rectOf('#F00', 0, 0));
  });
});

describe('backcolorPaint -- null (SvgGraphics.java:184-185)', () => {
  it('draws nothing when there is no colour and no gradient', () => {
    expect(backcolorPaint(undefined, undefined, W, H)).toEqual({});
  });
});

describe('backcolorPaint -- gradient (SvgGraphics.java:178-183)', () => {
  const VECTORS: readonly (readonly [Gradient['policy'], string])[] = [
    ['/', 'x1="0%" y1="0%" x2="100%" y2="100%"'],
    ['|', 'x1="0%" y1="50%" x2="100%" y2="50%"'],
    ['\\', 'x1="0%" y1="100%" x2="100%" y2="0%"'],
    ['-', 'x1="50%" y1="0%" x2="50%" y2="100%"'],
  ];

  it.each(VECTORS)(
    'policy %s: def is the matching <linearGradient>, rect fills url(#id), no root background',
    (policy, vector) => {
      const result = backcolorPaint(undefined, { color1: 'red', color2: 'blue', policy }, W, H);
      const id = /<linearGradient id="([^"]+)"/.exec(result.def ?? '')?.[1];
      expect(id).toBeDefined();
      expect(result.def).toContain(vector);
      expect(result.def).toContain('<stop offset="0%" stop-color="#F00"/>');
      expect(result.def).toContain('<stop offset="100%" stop-color="#00F"/>');
      expect(result.rect).toBe(rectOf(`url(#${id ?? ''})`));
      expect(result.rootBackground).toBeUndefined();
    },
  );

  it('paints the gradient even when the solid colour is white, black or transparent (always painted)', () => {
    const gradient: Gradient = { color1: 'white', color2: 'black', policy: '|' };
    for (const background of ['#FFFFFF', 'black', 'transparent', undefined]) {
      const result = backcolorPaint(background, gradient, W, H);
      expect(result.rect).toMatch(/fill="url\(#g[^)]+\)"/);
      expect(result.rootBackground).toBeUndefined();
    }
  });

  it('sizes the gradient rect like the solid rect (non-integer, no truncation)', () => {
    const result = backcolorPaint(undefined, { color1: 'red', color2: 'blue', policy: '/' }, 100.5, 33.3333);
    expect(result.rect).toMatch(/^<rect x="0" y="0" width="100\.5" height="33\.333" /);
  });

  it('lets the document pass lift the def into <defs> and seed its id, keeping the rect reference in step', () => {
    const { def, rect } = backcolorPaint(undefined, { color1: 'red', color2: 'blue', policy: '/' }, W, H);
    const collected = collectDocumentDefs((def ?? '') + (rect ?? ''), '');
    const defId = /<linearGradient id="([^"]+)"/.exec(collected.defs)?.[1];
    expect(defId).toBeDefined();
    expect(collected.body).toBe(rectOf(`url(#${defId ?? ''})`));
    expect(collected.body).not.toContain('<linearGradient');
  });
});
