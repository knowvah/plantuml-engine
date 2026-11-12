/**
 * The Chen fixtures and their jar renders: `tests/fixtures/cheneer/<slug>.{puml,svg}` (ceep T3b, rendered with
 * `scripts/oracle-render.sh`) and the jar's `svek-1.dot`, pinned at `oracle/goldens/cheneer/<slug>/` (ceep T4).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ChenEerDiagram } from '../../../src/diagrams/cheneer/ChenEerDiagram.js';
import { parseOk } from './helpers.js';

const FIXTURES = join(import.meta.dirname, '../../fixtures/cheneer');
const DOT_GOLDENS = join(import.meta.dirname, '../../../oracle/goldens/cheneer');
const PUML_SUFFIX = '.puml';
const ELK_SLUG_PREFIX = 'cov-elk';

/** A fixture's `.puml` source. */
export function probeSource(slug: string): string {
  return readFileSync(join(FIXTURES, `${slug}${PUML_SUFFIX}`), 'utf8');
}

/** The jar's `svek-1.dot` of a fixture. */
export function oracleDot(slug: string): string {
  return readFileSync(join(DOT_GOLDENS, slug, 'svek-1.dot'), 'utf8');
}

/** The jar's SVG of a fixture. */
export function oracleSvg(slug: string): string {
  return readFileSync(join(FIXTURES, `${slug}.svg`), 'utf8');
}

/** A fixture parsed by the Chen engine, without its `@startchen`/`@endchen` lines (the block extractor strips them). */
export function parseProbe(slug: string): ChenEerDiagram {
  const lines = probeSource(slug).split('\n');
  return parseOk(...lines.filter((l) => !/^@(start|end)chen/.test(l)));
}

function fixtureSlugs(): string[] {
  return readdirSync(FIXTURES)
    .filter((f) => f.endsWith(PUML_SUFFIX))
    .map((f) => f.slice(0, -PUML_SUFFIX.length))
    .sort();
}

/** Every fixture the jar drew with graphviz (its `svek-1.dot` is pinned). */
export function graphvizProbeSlugs(): string[] {
  return fixtureSlugs().filter((slug) => existsSync(join(DOT_GOLDENS, slug, 'svek-1.dot')));
}

/** Every fixture the jar laid out with ELK (`!pragma layout elk`): `cov-elk` and `cov-elk-*`. */
export function elkProbeSlugs(): string[] {
  return fixtureSlugs().filter((slug) => slug.startsWith(ELK_SLUG_PREFIX));
}

/** Every fixture the jar drew as `CHEN_EER` without ELK (the `cov-elk*` ones are {@link elkProbeSlugs}). */
export function chenDrawnProbeSlugs(): string[] {
  return fixtureSlugs().filter(
    (slug) => !slug.startsWith(ELK_SLUG_PREFIX) && oracleSvg(slug).includes('data-diagram-type="CHEN_EER"'),
  );
}
