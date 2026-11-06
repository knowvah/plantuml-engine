/**
 * `parseChart`'s diagram arm, for this engine's own unit tests and the shared
 * sprite-parser test: an unexpected refusal fails naming its line and message.
 */
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { parseChart } from '../../../src/diagrams/chart/ChartDiagramFactory.js';
import type { ChartDiagram } from '../../../src/diagrams/chart/ChartDiagram.js';

export function parseChartAst(source: UmlSource): ChartDiagram {
  const parsed = parseChart(source, new PreprocessingArtifact());
  if ('refused' in parsed) {
    throw new Error(`chart refused this source at line ${String(parsed.line)} (${parsed.kind}): ${parsed.message}`);
  }
  return parsed;
}
