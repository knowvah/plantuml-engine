import { describe, expect, it } from 'vitest';
import { HColors } from '../../../../src/core/klimt/color/HColors.js';
import { HColorSimple } from '../../../../src/core/klimt/color/HColorSimple.js';
import { HorizontalAlignment } from '../../../../src/core/klimt/geom/HorizontalAlignment.js';
import { ActivityColorParam as ColorParam } from '../../../../src/core/skin/ColorParam.js';
import { SkinParamFresh } from '../../../../src/core/skin/SkinParamFresh.js';
import { getColor } from '../../../../src/core/skin/SkinParamUtils.js';
import { OptionKey } from '../../../../src/core/tim/EaterOption.js';

/** The hex an `HColorSimple` paints, for the jar values in `cov-merge-only.svg`. */
function hexOf(color: unknown): string {
  if (!(color instanceof HColorSimple)) throw new Error('not an HColorSimple');
  const paint = color.asPaint();
  if (typeof paint !== 'string') throw new Error('not a flat paint');
  return paint.toUpperCase();
}

describe('SkinParamFresh as BpmDiagram#getTextBlock builds it', () => {
  it('answers options().getValue from the preprocessing options it was built with', () => {
    const skin = new SkinParamFresh(undefined, new Map([[OptionKey.DEBUG, 'true']]));
    expect(skin.options().getValue(OptionKey.DEBUG)).toBe('true');
    expect(skin.options().getValue(OptionKey.HANDWRITTEN)).toBeNull();
  });

  it('answers null for every option when built with none, as creole and help get', () => {
    expect(new SkinParamFresh().options().getValue(OptionKey.DEBUG)).toBeNull();
  });

  it('answers getHtmlColor null, so Rose falls back to the ColorParam default', () => {
    const skin = new SkinParamFresh();
    expect(skin.getHtmlColor(ColorParam.activityBorder, undefined, false)).toBeNull();
    expect(hexOf(getColor(skin, undefined, ColorParam.activityBackground))).toBe('#FEFECE');
    expect(hexOf(getColor(skin, undefined, ColorParam.activityBorder))).toBe('#A80036');
  });

  it('answers getDefaultTextAlignment with its argument, since no defaulttextalignment value exists', () => {
    const skin = new SkinParamFresh();
    expect(skin.getDefaultTextAlignment(HorizontalAlignment.CENTER)).toBe(HorizontalAlignment.CENTER);
    expect(skin.getDefaultTextAlignment(HorizontalAlignment.LEFT)).toBe(HorizontalAlignment.LEFT);
  });
});

describe('SkinParamUtils.getColor', () => {
  it('returns the first param the skin answers, before any default', () => {
    const red = HColors.RED;
    const skin = { getHtmlColor: (p: { name: string }) => (p.name === 'activityBorder' ? red : null) };
    expect(getColor(skin, undefined, ColorParam.activityBackground, ColorParam.activityBorder)).toBe(red);
  });

  it('throws on a gradient default, which no ColorParam constant has', () => {
    const gradient = { name: 'x', defaultValue: { kind: 'gradient' } as never, isBackground: false };
    expect(() => getColor(new SkinParamFresh(), undefined, gradient)).toThrow('ColorParam x has a gradient default');
  });
});
