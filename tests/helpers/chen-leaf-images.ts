/**
 * Shared fixtures for the Chen EER leaf-image and middle-decor tests: a parsed `ChenEerDiagram` built from a
 * planning probe's source, its leaves, and a klimt SVG drawn with the deterministic measurer the oracles use.
 */
import { readFileSync } from 'node:fs';
import type { Entity } from '../../src/core/abel/Entity.js';
import type { UGraphic } from '../../src/core/klimt/UGraphic.js';
import { UTranslate } from '../../src/core/klimt/UTranslate.js';
import type { ChenEerDiagram } from '../../src/diagrams/cheneer/ChenEerDiagram.js';
import { parseOk } from '../unit/cheneer/helpers.js';
import { newSvgGraphic } from './legacy-leaf-images.js';

export { testStringBounder } from './legacy-leaf-images.js';

/** The Chen fixtures (ceep T3b): `<slug>.puml` and its jar render `<slug>.svg`. */
const FIXTURES_DIR = new URL('../fixtures/cheneer/', import.meta.url);

/** Parses `tests/fixtures/cheneer/<slug>.puml` (the lines between `@startchen` and `@endchen`). */
export function parseProbe(slug: string): ChenEerDiagram {
  const all = readFileSync(new URL(`${slug}.puml`, FIXTURES_DIR), 'utf8').split('\n');
  const first = all.findIndex((l) => l.startsWith('@startchen'));
  const last = all.findIndex((l) => l.startsWith('@endchen'));
  return parseOk(...all.slice(first + 1, last));
}

/** The leaf with the quark name `name` (`A`, `Id`, ...). */
export function leafNamed(diagram: ChenEerDiagram, name: string): Entity {
  const leaf = diagram.leafs().find((e) => e.getName() === name);
  if (leaf === undefined) throw new Error(`no leaf named ${name}`);
  return leaf;
}

/** The SVG body `draw` makes at `(x, y)`: everything inside the root `<g font-family ...>`. */
export function drawnBody(x: number, y: number, draw: (ug: UGraphic) => void): string {
  const ug = newSvgGraphic();
  draw(ug.apply(new UTranslate(x, y)));
  const svg = ug.getSvgString();
  const root = svg.indexOf('<g font-family');
  return svg
    .slice(svg.indexOf('>', root) + 1)
    .replace(/<\?plantuml-src.*$/s, '')
    .replace(/<\/g><\/svg>$/, '');
}

/** The jar's SVG of a fixture (`tests/fixtures/cheneer/<slug>.svg`). */
export function oracleSvg(slug: string): string {
  return readFileSync(new URL(`${slug}.svg`, FIXTURES_DIR), 'utf8');
}
