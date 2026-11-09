/**
 * Shared fixtures for the legacy activity DOT tests: a cached oracle row (`test-results/dot-cache/<bucket>/<slug>`:
 * `in.puml` and the jar's `svek-1.dot`), the DOT our engine builds for its source, and the structural comparison the
 * DOT-parity gates use.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { UmlSource } from '../../src/core/block-extractor.js';
import { buildBlockUmls } from '../../src/core/BlockUmlBuilder.js';
import { renderSync } from '../../src/index.js';
import { registerNestedDiagramRenderers } from '../../src/diagrams/class/class-nested-diagram-renderer.js';
import { inheritingRenderFn } from '../../src/core/nested-previous.js';
import { parseRefusalOf } from '../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../src/core/tim/PreprocessingArtifact.js';
import { parseActivityLegacy } from '../../src/diagrams/activity-legacy/ActivityDiagramFactory.js';
import { DeterministicMeasurer } from '../../src/core/measurer-deterministic.js';
import { MeasurerStringBounder } from '../../src/core/measurer-bounder.js';
import { toSvekDot } from '../../src/core/svek-dot-emit.js';
import { setLayoutInputObserver, type DotInputGraph } from '../../src/core/graph-layout.js';
import { layoutActivityLegacy } from '../../src/diagrams/activity-legacy/layout.js';
import type { ActivityDiagram } from '../../src/diagrams/activity-legacy/ActivityDiagram.js';
import {
  buildActivityLegacyDot,
  type ActivityLegacyDot,
} from '../../src/diagrams/activity-legacy/activity-legacy-dot.js';
import { compareStructural, dotInputToStructural, parseSvekDot, type StructuralDiff } from '../oracle/svek-dot.js';
import { parseLegacy, type StyleInputs } from './legacy-leaf-images.js';

const CACHE = join(import.meta.dirname, '../../test-results/dot-cache');

/** The measurer the oracles' text widths come from (`-DPLANTUML_DETERMINISTIC_TEXT=true`). */
export const MEASURER = new DeterministicMeasurer();

/** The source of a cached row (`in.puml`), as written. */
export function rowSource(bucket: string, slug: string): string {
  return readFileSync(join(CACHE, bucket, slug, 'in.puml'), 'utf8');
}

/** The jar's `svek-1.dot` of a cached row. */
export function oracleDotOf(bucket: string, slug: string): string {
  return readFileSync(join(CACHE, bucket, slug, 'svek-1.dot'), 'utf8');
}

/**
 * Parses `source` the way `renderSync` hands it to a plugin: preprocessed (comments, `skinparam`, `<style>`, `!define`
 * gone from the lines and collected in the style source), typed as the legacy activity engine's.
 */
export function parseThroughPreprocessor(source: string): ActivityDiagram {
  const block = buildBlockUmls(source)[0]!;
  if (!block.ok) throw new Error(`preprocessor failure: ${JSON.stringify(block.failure)}`);
  const umlSource: UmlSource = {
    ...block.source,
    type: 'activity-legacy',
    rawStyles: block.preprocessed.styles,
    stylePositions: block.preprocessed.stylePositions,
    skinparamAssignments: block.preprocessed.skinparamAssignments,
    styleSource: block.preprocessed,
  };
  // As `prepareBlock` does: a `{{ }}` in a label renders through `renderSync`, measured by the same bounder.
  registerNestedDiagramRenderers(
    inheritingRenderFn(block.preprocessed.skinparam, (nested) => renderSync(nested, { measurer: MEASURER })),
  );
  const result = parseActivityLegacy(umlSource, new PreprocessingArtifact());
  const refusal = parseRefusalOf(result);
  if (refusal !== undefined) throw new Error(`unexpected refusal: ${refusal.message}`);
  return result as ActivityDiagram;
}

/** The DOT input our engine builds for `diagram`. */
export function dotOf(diagram: ActivityDiagram): ActivityLegacyDot {
  return buildActivityLegacyDot({ diagram, stringBounder: new MeasurerStringBounder(MEASURER), measurer: MEASURER });
}

/** Our DOT text for `puml`, as the Svek-DOT emitter writes it. */
export function ourDotText(puml: string, style?: StyleInputs): string {
  return toSvekDot(dotOf(parseLegacy(puml, style)).graph);
}

/** The structural comparison of a cached row against our DOT for its source. */
export function compareRow(bucket: string, slug: string): StructuralDiff {
  const ours = dotOf(parseThroughPreprocessor(rowSource(bucket, slug))).graph;
  return compareStructural(parseSvekDot(oracleDotOf(bucket, slug)), dotInputToStructural(ours));
}

/** The jar's `svek-N.dot` files of a cached row, in `N` order (a row with an autarkic group has two). */
export function oracleDotsOf(bucket: string, slug: string): string[] {
  return readdirSync(join(CACHE, bucket, slug))
    .filter((name) => /^svek-\d+\.dot$/.test(name))
    .sort((a, b) => Number(/\d+/.exec(a)![0]) - Number(/\d+/.exec(b)![0]))
    .map((name) => readFileSync(join(CACHE, bucket, slug, name), 'utf8'));
}

/** The graphs `layoutGraph` is handed while `diagram` is laid out (simplifier passes first), in call order. */
export function layoutCallsOf(diagram: ActivityDiagram): DotInputGraph[] {
  const graphs: DotInputGraph[] = [];
  setLayoutInputObserver(({ graph }) => graphs.push(graph));
  try {
    layoutActivityLegacy(diagram, MEASURER);
  } finally {
    setLayoutInputObserver(undefined);
  }
  return graphs;
}

/**
 * Every `svek-N.dot` of a cached row against the N-th `layoutGraph` call of our layout, structurally. A row whose
 * call count differs from its file count yields no pairing (an empty list).
 */
export function compareRowPasses(bucket: string, slug: string): StructuralDiff[] {
  const ours = layoutCallsOf(parseThroughPreprocessor(rowSource(bucket, slug)));
  const oracle = oracleDotsOf(bucket, slug);
  if (ours.length !== oracle.length) return [];
  return oracle.map((dot, index) => compareStructural(parseSvekDot(dot), dotInputToStructural(ours[index]!)));
}
