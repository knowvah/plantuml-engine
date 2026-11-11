/** Shared fixtures for the timing unit tests. */
import { BigDecimal } from '../../../../src/core/decimal/BigDecimal.js';
import { DeterministicMeasurer } from '../../../../src/core/measurer-deterministic.js';
import { TimeTick } from '../../../../src/diagrams/timing/TimeTick.js';
import { TimingFormat } from '../../../../src/diagrams/timing/TimingFormat.js';
import type { TimingSkinParam } from '../../../../src/diagrams/timing/timing-klimt.js';
import type { HColorSimple } from '../../../../src/core/klimt/color/HColorSimple.js';
import { Pragma } from '../../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../../src/core/style/mindmap-style-builder.js';
import { SkinParam } from '../../../../src/diagrams/timing/timing-skin-param.js';

/** A timing skin param over the default style, with the `skinparam`s given. */
export function timingSkinParam(styleText?: string, skinparams: Record<string, string> = {}): TimingSkinParam {
  const style = createMindmapSkinParam({});
  if (styleText !== undefined) style.executeStyle(styleText);
  return new SkinParam({
    style,
    skinparam: new Map(Object.entries(skinparams)),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

/** The measurer the conformance oracle used (`-DPLANTUML_DETERMINISTIC_TEXT=true`). */
export function oracleMeasurer(): DeterministicMeasurer {
  return new DeterministicMeasurer();
}

/** `new TimeTick(new BigDecimal(text), format)`. */
export function tick(text: string, format: TimingFormat = TimingFormat.DECIMAL): TimeTick {
  return new TimeTick(new BigDecimal(text), format);
}

/** The drawn elements of a `UGraphicSvg`, in order, as the jar prints them (`<line/>`, `<path/>`, `<polygon/>`, `<rect/>`, `<text>`). */
export function svgElements(svg: string): string[] {
  return svg.match(/<(?:line|path|polygon|rect|ellipse)\b[^>]*\/>|<text\b[^>]*>[^<]*<\/text>/g) ?? [];
}

/** A colour as the SVG paint the jar prints for it (`#E2E2F0`), whatever its dark variant. */
export function paint(color: object | undefined): string | undefined {
  if (color === undefined) return undefined;
  const result = (color as HColorSimple).asPaint();
  if (typeof result !== 'string') throw new Error('expected a plain colour, got a gradient');
  return result;
}
