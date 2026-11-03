/**
 * dss T3c: the bucket readers (`state-bucket-colors.ts`) and the zone tiers
 * layered on `state-render-colors.ts` / `renderer-box-zones.ts`.
 *
 * Java: `EntityImageStateCommon.java:75-96` (name, description, body signatures),
 * `RoundedSouth.java:60-64` (transparent / zero corner draw no path),
 * `EntityImageState.java:131-142` (equal zones draw one shape).
 */
import { describe, it, expect } from 'vitest';
import { stateBucketColor } from '../../../src/diagrams/state/state-bucket-colors.js';
import {
  resolveStateBodyFill,
  resolveStateFillBucketed,
  resolveStateFontColor,
} from '../../../src/diagrams/state/state-render-colors.js';
import { leafSouthZoneDrawn, resolveLeafZoneFills } from '../../../src/diagrams/state/renderer-box-zones.js';
import { defaultTheme, deepMergeTheme } from '../../../src/core/theme.js';
import type { Theme } from '../../../src/core/theme.js';

function withElements(elements: NonNullable<Theme['colors']['elements']>): Theme {
  return deepMergeTheme(defaultTheme, { colors: { elements } });
}

describe('stateBucketColor', () => {
  it('is undefined for an absent bucket or role', () => {
    expect(stateBucketColor(defaultTheme, 'circle.start', 'background')).toBeUndefined();
    expect(stateBucketColor(withElements({ note: { border: '#BB0000' } }), 'note', 'background')).toBeUndefined();
  });
  it('resolves a colour name to its SVG hex', () => {
    expect(stateBucketColor(withElements({ note: { background: 'red' } }), 'note', 'background')).toBe('#FF0000');
  });
  it('ignores a gradient value', () => {
    const gradient = { kind: 'gradient', from: '#000000', to: '#FFFFFF', policy: '|' } as never;
    expect(stateBucketColor(withElements({ note: { background: gradient } }), 'note', 'background')).toBeUndefined();
  });
});

describe('resolveStateBodyFill', () => {
  it('draws nothing at the skin default (body is transparent, plantuml.skin:279-281)', () => {
    expect(resolveStateBodyFill({}, defaultTheme)).toBeUndefined();
  });
  it('takes the body bucket above the state bucket', () => {
    const theme = withElements({ 'state.body': { background: '#CCCCCC' }, state: { background: '#00FF00' } });
    expect(resolveStateBodyFill({}, theme)).toBe('#CCCCCC');
  });
  it('a state-bucket background reaches the body (RoundedSouth is drawn)', () => {
    expect(resolveStateBodyFill({}, withElements({ state: { background: '#00FF00' } }))).toBe('#00FF00');
  });
  it('an explicitly transparent body draws nothing', () => {
    expect(resolveStateBodyFill({}, withElements({ 'state.body': { background: 'transparent' } }))).toBeUndefined();
  });
  it('the inline colour wins for every zone (Cluster.java:459-463)', () => {
    expect(resolveStateBodyFill({ color: '#Red' }, withElements({ 'state.body': { background: '#CCCCCC' } }))).toBe(
      '#FF0000',
    );
  });
});

describe('zone tiers', () => {
  it('fill: zone bucket above state bucket, below the stereotype tier', () => {
    const theme = deepMergeTheme(
      withElements({ 'state.name': { background: '#AAAAAA' }, state: { background: '#00FF00' } }),
      {
        colors: { graph: { stateBackgroundColorByStereo: { x: '#FF0000' } } },
      },
    );
    expect(resolveStateFillBucketed({}, theme, '#F1F1F1', 'state.name')).toBe('#AAAAAA');
    expect(resolveStateFillBucketed({}, theme, '#F1F1F1')).toBe('#00FF00');
    expect(resolveStateFillBucketed({ stereotype: 'X' }, theme, '#F1F1F1', 'state.name')).toBe('#FF0000');
  });
  it('font: zone bucket above state bucket', () => {
    const theme = withElements({ 'state.description': { font: '#222222' }, state: { font: '#333333' } });
    expect(resolveStateFontColor({}, theme, '#000000', 'state.description')).toBe('#222222');
    expect(resolveStateFontColor({}, theme, '#000000', 'state.name')).toBe('#333333');
  });
});

describe('leaf zones', () => {
  const zoned = withElements({
    'state.name': { background: '#AAAAAA' },
    'state.description': { background: '#BBBBBB' },
  });
  it('are undefined when both zones resolve alike (one shape)', () => {
    expect(resolveLeafZoneFills({}, defaultTheme)).toBeUndefined();
  });
  it('differ -> north/south fills', () => {
    expect(resolveLeafZoneFills({}, zoned)).toEqual({ north: '#AAAAAA', south: '#BBBBBB' });
  });
  it('the south path is drawn for differing zones', () => {
    expect(leafSouthZoneDrawn({}, zoned)).toBe(true);
    expect(leafSouthZoneDrawn({}, defaultTheme)).toBe(false);
  });
  it('a transparent south, <<sdlreceive>> and a zero corner draw no south path', () => {
    const transparent = withElements({
      'state.name': { background: '#AAAAAA' },
      'state.description': { background: 'transparent' },
    });
    expect(leafSouthZoneDrawn({}, transparent)).toBe(false);
    expect(leafSouthZoneDrawn({ stereotype: 'sdlreceive' }, zoned)).toBe(false);
    const square = deepMergeTheme(zoned, { colors: { graph: { stateCascadeRoundCorner: 0 } } });
    expect(leafSouthZoneDrawn({}, square)).toBe(false);
  });
});
