/**
 * Feature: `renderInitial`/`renderFinal`'s `#color` override scope.
 *
 * mission G4 S11: jar's `CircleStart`/`CircleEnd` apply a `#color` override
 * (`State.color`, `Colors#getColor(BackGroundColor)`) to FILL only -- the
 * stroke stays the pseudostate's own fixed `#222222` default regardless of
 * any override. jar-verified against `ceruzi-77-give569`'s raw SVG: `state
 * start1 <<start>> #Red` renders `fill="#F00"` but
 * `style="stroke:#222222;..."` (unchanged); `state end2 <<end>> #Green`
 * renders the inner dot `fill="#008000"` with BOTH ellipses' stroke staying
 * `#222222`. Prior to this fix, `renderInitial`/`renderFinal` both passed
 * `stroke: fill`, coloring the stroke too -- a bug this test guards against.
 */
import { describe, it, expect } from 'vitest';
import { renderInitial, renderFinal, renderChoiceJunction } from '../../../src/diagrams/state/renderer-pseudostate.js';
import { defaultTheme } from '../../../src/core/theme.js';
import type { Theme } from '../../../src/core/theme.js';
import type { StateNodeGeo } from '../../../src/diagrams/state/state-geo-types.js';

function pseudoNode(kind: 'initial' | 'final', overrides: Partial<StateNodeGeo> = {}): StateNodeGeo {
  return {
    id: 'p1',
    kind,
    display: '',
    x: 0,
    y: 0,
    width: kind === 'initial' ? 20 : 22,
    height: kind === 'initial' ? 20 : 22,
    children: [],
    transitions: [],
    ...overrides,
  };
}

describe('renderInitial', () => {
  it('defaults fill and stroke to the SAME #222222 with no #color override', () => {
    const svg = renderInitial(pseudoNode('initial'), defaultTheme);
    expect(svg).toContain('fill="#222"');
    expect(svg).toContain('stroke="#222"');
  });

  it('applies a #color override to fill ONLY, stroke stays #222222', () => {
    const svg = renderInitial(pseudoNode('initial', { color: '#Red' }), defaultTheme);
    expect(svg).toContain('fill="#F00"');
    expect(svg).toContain('stroke="#222"');
    expect(svg).not.toContain('stroke="#FF0000"');
  });
});

describe('renderFinal', () => {
  it('defaults both ellipses to #222222 stroke with no #color override', () => {
    const svg = renderFinal(pseudoNode('final'), defaultTheme);
    expect(svg).toContain('fill="none"');
    expect(svg).toContain('fill="#222"');
    const strokeCount = svg.split('stroke="#222"').length - 1;
    expect(strokeCount).toBe(2);
  });

  it('applies a #color override to the inner dot fill ONLY, both strokes stay #222222', () => {
    const svg = renderFinal(pseudoNode('final', { color: '#Green' }), defaultTheme);
    expect(svg).toContain('fill="#008000"');
    const strokeCount = svg.split('stroke="#222"').length - 1;
    expect(strokeCount).toBe(2);
    expect(svg).not.toContain('stroke="#008000"');
  });
});

function themeWith(elements: NonNullable<Theme['colors']['elements']>): Theme {
  return { ...defaultTheme, colors: { ...defaultTheme.colors, elements } };
}

/** dss T3c sites 1-4: `EntityImageCircleStart.java:56-58`, `EntityImageCircleEnd.java:57-59`
 *  read `circle.start|end` BackGroundColor and LineColor; oracle rows `state__cascade-bg-*`,
 *  `state__cascade-line-*` (`#AAA` fill, `#B00` stroke). */
describe('start/end read the circle buckets', () => {
  it('start: bucket fill and stroke, inline #color still wins the fill only', () => {
    const theme = themeWith({ 'circle.start': { background: '#AAAAAA', border: '#BB0000' } });
    const svg = renderInitial(pseudoNode('initial'), theme);
    expect(svg).toContain('fill="#AAA"');
    expect(svg).toContain('stroke="#B00"');
    const inline = renderInitial(pseudoNode('initial', { color: '#Red' }), theme);
    expect(inline).toContain('fill="#F00"');
    expect(inline).toContain('stroke="#B00"');
  });

  it('end: ring and dot take the bucket, a different bucket is not read', () => {
    const theme = themeWith({
      'circle.end': { background: '#AAAAAA', border: '#BB0000' },
      'circle.start': { background: '#00FF00' },
    });
    const svg = renderFinal(pseudoNode('final'), theme);
    expect(svg).toContain('fill="#AAA"');
    expect(svg.split('stroke="#B00"').length - 1).toBe(2);
    expect(svg).not.toContain('#0F0');
  });
});

/** Site 5: `EntityImageBranch.java:62-63` signs `activityDiagram, activity, diamond`;
 *  it reads no inline colour (jar oracle: `state C <<choice>> #red` draws `#F1F1F1`). */
describe('choice reads the activity.diamond bucket', () => {
  const choice = (overrides: Partial<StateNodeGeo> = {}): StateNodeGeo => ({
    ...pseudoNode('initial', overrides),
    kind: 'choice',
    width: 24,
    height: 24,
  });
  it('defaults to the box colours', () => {
    const svg = renderChoiceJunction(choice(), defaultTheme);
    expect(svg).toContain('fill="#F1F1F1"');
    expect(svg).toContain('stroke="#181818"');
  });
  it('takes the bucket fill and stroke, ignores the state bucket and the inline colour', () => {
    const theme = themeWith({
      'activity.diamond': { background: '#AAAAAA', border: '#BB0000' },
      state: { background: '#00FF00' },
    });
    const svg = renderChoiceJunction(choice({ color: '#Red' }), theme);
    expect(svg).toContain('fill="#AAA"');
    expect(svg).toContain('stroke="#B00"');
  });
});
