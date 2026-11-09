import type { UmlSource } from '../../../src/core/block-extractor.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { ActivityDiagram } from '../../../src/diagrams/activity-legacy/ActivityDiagram.js';
import { parseActivityLegacy } from '../../../src/diagrams/activity-legacy/ActivityDiagramFactory.js';

/** A hand-built source of the legacy activity engine. */
export function sourceOf(...lines: string[]): UmlSource {
  return { lines, type: 'activity-legacy' };
}

/** Parses `lines`; the caller narrows the outcome. */
export function parseLines(...lines: string[]): ActivityDiagram | ParseRefusal {
  return parseActivityLegacy(sourceOf(...lines), new PreprocessingArtifact());
}

/** Parses `lines` and fails the test when the engine refuses. */
export function parseOk(...lines: string[]): ActivityDiagram {
  const result = parseLines(...lines);
  const refusal = parseRefusalOf(result);
  if (refusal !== undefined) throw new Error(`unexpected refusal: ${refusal.message}`);
  return result as ActivityDiagram;
}

/** A fresh, empty diagram. */
export function emptyDiagram(): ActivityDiagram {
  return parseOk();
}
