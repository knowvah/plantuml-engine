/** The EBNF engine's skin, style and font over the default skin, plus a measured SVG graphic, for the unit tests. */
import { UGraphicSvg } from '../../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import { basicSvgOption } from '../../../src/core/klimt/drawing/svg/svg-graphics.js';
import type { StringBounder as DriverStringBounder } from '../../../src/core/klimt/drawing/svg/driver-text-svg.js';
import { bridgeFontConfiguration } from '../../../src/core/klimt/font/FontConfigurationBridge.js';
import type { FontConfiguration } from '../../../src/core/klimt/shape/UText.js';
import { MeasurerStringBounder } from '../../../src/core/measurer-bounder.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../src/core/style/mindmap-style-builder.js';
import type { Style } from '../../../src/core/style/Style.js';
import { SkinParam } from '../../../src/diagrams/ebnf/ebnf-skin-param.js';
import { ETile } from '../../../src/diagrams/ebnf/ETile.js';
import { ETileBox } from '../../../src/diagrams/ebnf/ETileBox.js';
import type { Symbol } from '../../../src/diagrams/ebnf/Symbol.js';

export const measurer = new DeterministicMeasurer();
export const BOUNDER = new MeasurerStringBounder(measurer);
const driverBounder: DriverStringBounder = {
  calculateDimension: (font, text) => ({ width: measurer.measure(text, font).width }),
};

export function ebnfSkinParam(skinparam: Record<string, string> = {}): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam: new Map(Object.entries(skinparam)),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

/** `EbnfEngine`'s constructor: `ETile.getStyleSignature().getMergedStyle(…)` and its font (EbnfEngine.java:67-68). */
export function ebnfStyle(skinParam: SkinParam): { style: Style; fc: FontConfiguration } {
  const style = ETile.getStyleSignature().getMergedStyle(skinParam.getCurrentStyleBuilder());
  if (style === undefined) throw new Error('no ebnf style');
  return { style, fc: bridgeFontConfiguration(style.getFontConfiguration(skinParam.getIHtmlColorSet())) };
}

export function box(value: string, symbol: Symbol, option: ReadonlyMap<string, string> = new Map()): ETileBox {
  const skinParam = ebnfSkinParam();
  const { style, fc } = ebnfStyle(skinParam);
  return new ETileBox({ value, symbol, fc, style, colorSet: skinParam.getIHtmlColorSet(), skinParam, option });
}

export function newGraphic(): UGraphicSvg {
  return UGraphicSvg.build(0, basicSvgOption(), '$version$', driverBounder, measurer);
}

/** The drawn elements, without the document wrapper. */
export function body(ug: UGraphicSvg): string {
  const svg = ug.getSvgString();
  const open = svg.indexOf('lengthAdjust="spacing">');
  if (open < 0) return '';
  return svg.substring(open + 'lengthAdjust="spacing">'.length, svg.lastIndexOf('</g>'));
}
