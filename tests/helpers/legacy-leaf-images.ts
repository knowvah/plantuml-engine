/**
 * Shared fixtures for the legacy activity leaf-image tests: a parsed `ActivityDiagram` built from a probe's or a
 * cached row's source, its leaf entities, and a klimt SVG drawn with the deterministic measurer the oracles use.
 */
import { readFileSync } from 'node:fs';
import type { Entity } from '../../src/core/abel/Entity.js';
import { parseRefusalOf } from '../../src/core/parse-refusal.js';
import type { UmlSource } from '../../src/core/block-extractor.js';
import { basicSvgOption } from '../../src/core/klimt/drawing/svg/svg-graphics-core.js';
import { UGraphicSvg } from '../../src/core/klimt/drawing/svg/u-graphic-svg.js';
import { VERSION_PLACEHOLDER } from '../../src/core/klimt/document-shell.js';
import type { StringBounder } from '../../src/core/klimt/font/StringBounder.js';
import type { UGraphic } from '../../src/core/klimt/UGraphic.js';
import { UTranslate } from '../../src/core/klimt/UTranslate.js';
import { DeterministicMeasurer } from '../../src/core/measurer-deterministic.js';
import { PreprocessingArtifact } from '../../src/core/tim/PreprocessingArtifact.js';
import { parseActivityLegacy } from '../../src/diagrams/activity-legacy/ActivityDiagramFactory.js';
import type { ActivityDiagram } from '../../src/diagrams/activity-legacy/ActivityDiagram.js';

const MEASURER = new DeterministicMeasurer();

/** What a probe adds to its lines: the `skinparam` map and the `<style>` block bodies the preprocessor extracts. */
export interface StyleInputs {
  readonly skinparam?: ReadonlyMap<string, string>;
  readonly styles?: readonly string[];
}

/**
 * Parses the lines of a `.puml` between `@startuml` and `@enduml`. `firstPosition` is the document line of the
 * first of them (the preprocessor strips `skinparam` and `<style>` lines but keeps the numbering).
 */
export function parseLegacy(puml: string, style: StyleInputs = {}, firstPosition?: number): ActivityDiagram {
  const all = puml.split('\n');
  const first = all.findIndex((l) => l.startsWith('@startuml'));
  const last = all.findIndex((l) => l.startsWith('@enduml'));
  const lines = all.slice(first + 1, last);
  const base = firstPosition ?? first + 1;
  const source: UmlSource = {
    lines,
    type: 'activity-legacy',
    linePositions: lines.map((_, i) => base + i),
    styleSource: { skinparam: style.skinparam ?? new Map<string, string>(), styles: [...(style.styles ?? [])] },
  };
  const result = parseActivityLegacy(source, new PreprocessingArtifact());
  const refusal = parseRefusalOf(result);
  if (refusal !== undefined) throw new Error(`unexpected refusal: ${refusal.message}`);
  return result as ActivityDiagram;
}

/** The text of a cached-row or probe source. */
export function readSource(path: string): string {
  return readFileSync(path, 'utf8');
}

/** The leaf with the quark name `name` (`start`, `end`, `#4`, `VerifyReservation`...). */
export function leafNamed(diagram: ActivityDiagram, name: string): Entity {
  const leaf = diagram.leafs().find((e) => e.getName() === name);
  if (leaf === undefined) throw new Error(`no leaf named ${name}`);
  return leaf;
}

/** A fresh klimt SVG graphic over the deterministic measurer. */
export function newSvgGraphic(): UGraphicSvg {
  return UGraphicSvg.build(
    0,
    basicSvgOption(),
    VERSION_PLACEHOLDER,
    { calculateDimension: (font, text) => ({ width: MEASURER.measure(text, font).width }) },
    MEASURER,
  );
}

/** The string bounder the dimensions are measured with. */
export function testStringBounder(): StringBounder {
  return newSvgGraphic().getStringBounder();
}

/** The drawing `draw` makes at `(x, y)` (the node position the renderer translates to), as the SVG body. */
export function drawnAt(x: number, y: number, draw: (ug: UGraphic) => void): string {
  const ug = newSvgGraphic();
  draw(ug.apply(new UTranslate(x, y)));
  const svg = ug.getSvgString();
  const start = svg.indexOf('<g>') >= 0 ? svg.indexOf('<g>') : svg.indexOf('<g ');
  const body = svg.slice(start);
  return body
    .replace(/^<g[^>]*>/, '')
    .replace(/<\?plantuml-src.*$/s, '')
    .replace(/<\/g><\/svg>$/, '');
}

/** The `<svg>` of a cached oracle, from its first element after the root `<g>`. */
export function oracleBody(svgPath: string): string {
  const svg = readFileSync(svgPath, 'utf8');
  const start = svg.indexOf('<g font-family');
  return svg.slice(svg.indexOf('>', start) + 1);
}
