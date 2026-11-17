/**
 * What the four Problem Frames images (`EntityImageDomain`, `EntityImageMachine`, `EntityImageDesignedDomain`,
 * `EntityImageRequirement`) read off their `Entity` and `ISkinParam`, resolved by the caller: the description engine,
 * which has no core `Entity` (decisions D1). Each image's own `@see` names the Java reads behind every field.
 */
import type { HColorOrPaint } from '../klimt/color/ColorMapper.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import type { FontConfiguration } from '../klimt/shape/UText.js';
import type { UStroke } from '../klimt/UStroke.js';

/** The resolved reads shared by the three box images (domain, machine, designed domain). */
export interface DescdiagramBoxParams {
  /** `entity.getDisplay()`, lines joined by `\n`. */
  readonly display: string;
  /** `stereotype.getLabels(guillemet)`, or `undefined` when `stereo` is null. Sized, never drawn. */
  readonly stereoLabels: readonly string[] | undefined;
  /** `FontConfiguration.create(skinParam, FontParam.<image>, stereotype)`. */
  readonly nameFont: FontConfiguration;
  /** `FontConfiguration.create(skinParam, FontParam.<image>_STEREOTYPE, stereotype)`. */
  readonly stereoFont: FontConfiguration;
  /** `SkinParamUtils.getColor(skinParam, stereo, ColorParam.<image>Border)`. */
  readonly borderColor: HColorOrPaint;
  /** `getColors().getColor(ColorType.BACK)`, else `ColorParam.<image>Background`. */
  readonly backColor: HColorOrPaint;
  /** `getThickness(LineParam.<image>Border, stereo)`, else `UStroke.withThickness(1.5)`. */
  readonly stroke: UStroke;
}

/** `getNameAndSteretypeDimension`, the same body in all three box images (e.g. `EntityImageDomain.java:103-110`). */
export function nameAndStereotypeDimension(
  name: TextBlock,
  stereo: TextBlock | undefined,
  stringBounder: StringBounder,
): XDimension2D {
  const nameDim = name.calculateDimension(stringBounder);
  const stereoDim = stereo === undefined ? new XDimension2D(0, 0) : stereo.calculateDimension(stringBounder);
  return new XDimension2D(
    Math.max(nameDim.getWidth(), stereoDim.getWidth()),
    nameDim.getHeight() + stereoDim.getHeight(),
  );
}
