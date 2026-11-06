/** An empty `ChartDiagram` over an empty style source, for the state and renderer tests. */
import { parseChart } from '../../../../src/diagrams/chart/ChartDiagramFactory.js';
import { Pragma } from '../../../../src/core/skin/Pragma.js';
import { createSpriteRegistry } from '../../../../src/core/sprite-registry.js';
import { createMindmapSkinParam } from '../../../../src/core/style/mindmap-style-builder.js';
import { PreprocessingArtifact } from '../../../../src/core/tim/PreprocessingArtifact.js';
import { SkinParam } from '../../../../src/diagrams/chart/chart-skin-param.js';
import { ChartDiagram } from '../../../../src/diagrams/chart/ChartDiagram.js';

export function chartSkinParam(skinparam: ReadonlyMap<string, string> = new Map()): SkinParam {
  return new SkinParam({
    style: createMindmapSkinParam({}),
    skinparam,
    sprites: createSpriteRegistry(),
    pragma: Pragma.createEmpty(),
  });
}

export function emptyChartDiagram(): ChartDiagram {
  return new ChartDiagram({ lines: [] }, new PreprocessingArtifact(), chartSkinParam());
}

/** A parsed source: its lines, and a `<style>` block body when given. */
export function parseChartLines(lines: readonly string[], style?: string): ChartDiagram {
  const styleSource = style === undefined ? undefined : { skinparam: new Map<string, string>(), styles: [style] };
  const result = parseChart(
    { lines: [...lines], type: 'chart', ...(styleSource === undefined ? {} : { styleSource }) },
    new PreprocessingArtifact(),
  );
  if ('refused' in result) throw new Error(`refused line ${String(result.line)}: ${result.message}`);
  return result;
}
