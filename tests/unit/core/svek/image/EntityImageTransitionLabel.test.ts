import { describe, expect, it } from 'vitest';

import {
  drawTransitionLabel,
  transitionLabelDimension,
  TRANSITION_LABEL_MARGIN,
  TRANSITION_LABEL_ROUND_CORNER,
  TRANSITION_LABEL_SHAPE,
} from '../../../../../src/core/svek/image/EntityImageTransitionLabel.js';

// EntityImageTransitionLabel.java:59 (MARGIN 4), :89-98 (dimension), :117-133 (drawU), :135-138 (RECTANGLE).
describe('EntityImageTransitionLabel', () => {
  it('is the text block plus 4 on every side: go at 13 is 22.4625 x 21 (snl-issue jar)', () => {
    expect(TRANSITION_LABEL_MARGIN).toBe(4);
    expect(transitionLabelDimension({ width: 14.4625, height: 13 })).toEqual({ width: 22.4625, height: 21 });
  });

  it('is a plain DOT rectangle, rounded 5 when drawn', () => {
    expect(TRANSITION_LABEL_SHAPE).toBe('rect');
    expect(TRANSITION_LABEL_ROUND_CORNER).toBe(5);
  });

  it('draws an unfilled, unstroked frame, then the text at the centred offset, with no group', () => {
    const calls: [number, number][] = [];
    const svg = drawTransitionLabel(20.77, 117, { width: 14.4625, height: 13 }, (left, top) => {
      calls.push([left, top]);
      return '<text/>';
    });
    expect(svg).toBe(
      '<rect x="20.77" y="117" width="22.463" height="21" fill="none" stroke="none" rx="2.5" ry="2.5"/><text/>',
    );
    expect(calls).toEqual([[24.77, 121]]);
    expect(svg).not.toContain('<g');
  });
});
