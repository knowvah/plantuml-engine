/** Drives `parseTiming` over a whole source, as `renderSync` hands a block to a plugin (T4a wires the plugin). */
import { readFileSync } from 'node:fs';
import { buildBlockUmls } from '../../../../src/core/BlockUmlBuilder.js';
import type { UmlSource } from '../../../../src/core/block-extractor.js';
import type { ParseRefusal } from '../../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../../src/core/tim/PreprocessingArtifact.js';
import { parseTiming } from '../../../../src/diagrams/timing/TimingDiagramFactory.js';
import type { TimingDiagram } from '../../../../src/diagrams/timing/TimingDiagram.js';
import { svgElements } from './timing.js';

export const PROBES = 'plans/timing-engine-port/probes';
export const TIMING_CACHE = 'test-results/dot-cache/timing';

/** The block's preprocessed interior plus the style sources the interpreter pulled out (`src/index.ts#umlSourceOfBlock`). */
export function timingSource(text: string): UmlSource {
  const block = buildBlockUmls(text)[0];
  if (block?.ok !== true) throw new Error(`no block in ${text}`);
  return {
    ...block.source,
    rawStyles: block.preprocessed.styles,
    stylePositions: block.preprocessed.stylePositions,
    skinparamAssignments: block.preprocessed.skinparamAssignments,
    styleSource: block.preprocessed,
    rawSourceLines: block.rawSource.map((s) => s.getString()),
    seedSourceLines: block.seedSource,
  };
}

export function probeText(slug: string): string {
  return readFileSync(`${PROBES}/${slug}.puml`, 'utf8');
}

/** `parseTiming` over a source's text, its `!option`s lifted into the artifact as the pipeline does. */
export function parseText(text: string, zone?: string): TimingDiagram | ParseRefusal {
  const source = timingSource(text);
  const artifact = new PreprocessingArtifact();
  for (const [key, value] of source.styleSource?.options ?? []) artifact.getOption().define(key, value);
  return parseTiming(source, artifact, undefined, zone);
}

/** The diagram, or a failed assertion naming the refusal. */
export function diagramOf(text: string, zone?: string): TimingDiagram {
  const result = parseText(text, zone);
  if ('refused' in result) throw new Error(`refused at ${result.line}: ${result.message}`);
  return result;
}

/** The zone the planning host rendered the oracles in (decisions.md D4); `use date format` formats in it. */
export const ORACLE_ZONE = 'America/Chicago';

/** Every probe/fixture SVG under `tests/fixtures/timing`: the jar's drawn elements, chrome-free. */
export function oracleBody(path: string): string[] {
  return svgElements(readFileSync(`tests/fixtures/timing/${path}`, 'utf8'));
}
