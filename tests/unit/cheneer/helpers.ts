import type { UmlSource } from '../../../src/core/block-extractor.js';
import { parseRefusalOf } from '../../../src/core/parse-refusal.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { ChenEerDiagram } from '../../../src/diagrams/cheneer/ChenEerDiagram.js';
import { parseChen } from '../../../src/diagrams/cheneer/ChenEerDiagramFactory.js';

/** A hand-built source of the Chen engine. */
export function sourceOf(...lines: string[]): UmlSource {
  return { lines, type: 'chen' };
}

/** Parses `lines`; the caller narrows the outcome. */
export function parseLines(...lines: string[]): ChenEerDiagram | ParseRefusal {
  return parseChen(sourceOf(...lines), new PreprocessingArtifact());
}

/** Parses `lines` and fails the test when the engine refuses. */
export function parseOk(...lines: string[]): ChenEerDiagram {
  const result = parseLines(...lines);
  const refusal = parseRefusalOf(result);
  if (refusal !== undefined) throw new Error(`unexpected refusal: ${refusal.message}`);
  return result as ChenEerDiagram;
}

/** Parses `lines` and fails the test unless the engine refuses. */
export function parseRefused(...lines: string[]): ParseRefusal {
  const refusal = parseRefusalOf(parseLines(...lines));
  if (refusal === undefined) throw new Error('expected a refusal');
  return refusal;
}
