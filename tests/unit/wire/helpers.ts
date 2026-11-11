/** A wire `SkinParam` over the default style, and the deterministic measurer, for the wire unit tests. */
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { WireDiagram } from '../../../src/diagrams/wire/WireDiagram.js';
import { ColorMapper } from '../../../src/core/klimt/color/ColorMapper.js';
import { VERSION_PLACEHOLDER } from '../../../src/core/klimt/document-shell.js';
import { basicSvgOption } from '../../../src/core/klimt/drawing/svg/svg-graphics-core.js';
import { UGraphicSvg } from '../../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import type { UGraphic } from '../../../src/core/klimt/UGraphic.js';
import { MeasurerStringBounder } from '../../../src/core/measurer-bounder.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { Pragma } from '../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../src/core/style/mindmap-style-builder.js';
import { SkinParam } from '../../../src/diagrams/wire/wire-skin-param.js';

export const measurer = new DeterministicMeasurer();
export const stringBounder = new MeasurerStringBounder(measurer);

export function wireSkinParam(): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam: new Map<string, string>(),
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

/** Draws on a real SVG graphic and returns the document: the assertions are the jar's own fragments. */
export function svgOf(draw: (ug: UGraphic) => void, colorMapper: ColorMapper = ColorMapper.IDENTITY): string {
  const driver = {
    calculateDimension(font: { readonly family: string; readonly size: number }, text: string) {
      return { width: measurer.measure(text, font).width };
    },
  };
  const ug = UGraphicSvg.build(0, basicSvgOption({ colorMapper }), VERSION_PLACEHOLDER, driver, measurer);
  draw(ug);
  return ug.getSvgString();
}

/** A fresh `WireDiagram` over the default style. */
export function wireDiagram(): WireDiagram {
  return new WireDiagram(
    { lines: [], type: 'wire' } as unknown as UmlSource,
    new PreprocessingArtifact(),
    wireSkinParam(),
  );
}
