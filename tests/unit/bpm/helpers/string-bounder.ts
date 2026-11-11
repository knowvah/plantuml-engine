import { basicSvgOption } from '../../../../src/core/klimt/drawing/svg/svg-graphics.js';
import { UGraphicSvg } from '../../../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import type { StringBounder } from '../../../../src/core/klimt/font/StringBounder.js';
import type { DeterministicMeasurer } from '../../../../src/core/measurer-deterministic.js';

/** The klimt `StringBounder` a `UGraphicSvg` over `measurer` hands out. */
export function stringBounderOf(measurer: DeterministicMeasurer): StringBounder {
  const driver = {
    calculateDimension: (font: { family: string; size: number }, text: string) => measurer.measure(text, font),
  };
  return UGraphicSvg.build(0, basicSvgOption(), '$version$', driver, measurer).getStringBounder();
}
