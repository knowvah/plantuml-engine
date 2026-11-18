/**
 * `PSystemPathFactory` (eggs/PSystemPathFactory.java), registered only under
 * `SecurityProfile.INSECURE` (`PSystemBuilder.java:178-179`, ipe D1). Under
 * INSECURE the jar writes a PNG; the port draws the same motif as a 50×50 SVG
 * page (D2, signed by #178). The expected points are the jar PNG's pixels
 * (`plans/insecure-path-egg/measurements/decode-motif.py`).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { render as renderAsync, renderSync } from '../../../src/index.js';
import { registry } from '../../../src/core/dispatcher.js';
import { setErrorPageObserver } from '../../../src/core/error/error-renderer.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { SecurityProfile } from '../../../src/core/security/SecurityProfile.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { pathPlugin, PSystemPathFactory } from '../../../src/diagrams/eggs/PSystemPathFactory.js';
import { sourceOf } from './plugin-harness.js';

const FIXTURES = join(import.meta.dirname, '..', '..', 'fixtures', 'factories');
const COV_PATH_SLUGS = ['cov-path-valid', 'cov-path-upper', 'cov-path-invalid'] as const;
const INSECURE = { securityProfile: SecurityProfile.INSECURE };
const NON_INSECURE_PROFILES = ['SANDBOX', 'ALLOWLIST', 'INTERNET', 'INTERNET_WITH_DOTSVG', 'LEGACY'] as const;
/** `GraphicsPath.java:74`: `EmptyImageBuilder(null, 50, 50, ...)`. */
const PAGE = '50';

function block(line: string): string {
  return `@startuml\n${line}\n@enduml\n`;
}

function render(text: string, options: object = {}): { readonly svg: string; readonly errorPage: boolean } {
  let errorPage = false;
  setErrorPageObserver(() => {
    errorPage = true;
  });
  try {
    return { svg: renderSync(text, { measurer: new DeterministicMeasurer(), ...options }), errorPage };
  } finally {
    setErrorPageObserver(undefined);
  }
}

/** The end points of the page's one `<path>`'s `C` segments. */
function pathEnds(svg: string): string[] {
  const d = /<path [^>]*d="([^"]*)"/.exec(svg)?.[1] ?? '';
  return [...d.matchAll(/C\S+ \S+ (\S+)/g)].map((m) => m[1]!);
}

describe('PSystemPathFactory.executeLine (java:51-57)', () => {
  const factory = new PSystemPathFactory();
  const accepts = (line: string): boolean =>
    factory.executeLine(sourceOf(block('x')), line, new PreprocessingArtifact()) !== undefined;

  // `^path[%s]+([0-9A-Za-z]+)$`, CASE_INSENSITIVE (Pattern2.java:114); %s is \s plus U+00A0 (Pattern2.java:56).
  it.each(['path ABCabc', 'PATH ABC', 'Path a', 'path\tabc', 'path   abc123', 'path 0'])('accepts %j', (line) => {
    expect(accepts(line)).toBe(true);
  });

  it.each(['path', 'path ', 'pathABC', 'path ABC ', 'path AB-C', 'paths ABC', 'path ſbc'])('refuses %j', (line) => {
    expect(accepts(line)).toBe(false);
  });

  it('defers the motif to export: an invalid character still builds the diagram', () => {
    expect(
      factory.executeLine(sourceOf(block('path abc123')), 'path abc123', new PreprocessingArtifact()),
    ).toBeDefined();
  });
});

describe('pathPlugin registration (D1)', () => {
  it('declares INSECURE as its only profile', () => {
    expect(pathPlugin.registeredOnlyUnder).toBe(SecurityProfile.INSECURE);
  });

  it('owns `path ABCabc` under INSECURE only', () => {
    const source = sourceOf(block('path ABCabc'));
    expect(registry.resolve(source, INSECURE).plugin).toBe(pathPlugin);
    expect(registry.resolve(source).plugin).not.toBe(pathPlugin);
    for (const securityProfile of NON_INSECURE_PROFILES) {
      expect(registry.resolve(source, { securityProfile }).plugin).not.toBe(pathPlugin);
    }
  });
});

describe('path under INSECURE (D2)', () => {
  it('draws `path ABCabc` as a 50×50 white page with one black path', () => {
    const { svg, errorPage } = render(block('path ABCabc'), INSECURE);
    expect(errorPage).toBe(false);
    expect(svg).toContain(`width="${PAGE}px" height="${PAGE}px" viewBox="0 0 ${PAGE} ${PAGE}"`);
    expect(svg).toContain('background:#FFFFFF;');
    expect(svg.match(/<path /g)).toHaveLength(1);
    expect(svg).toMatch(/<path d="M20,20 C20,20 17,17 17,17 /);
    expect(svg).toMatch(/ style="stroke:#000;stroke-width:1;" fill="none"\/>/);
    expect(pathEnds(svg)).toEqual(['17,17', '15,14', '14,11', '16,11', '19,11', '16,12']);
  });

  it("draws `PATH ABC` with the jar PNG's three points", () => {
    const { svg, errorPage } = render(block('PATH ABC'), INSECURE);
    expect(errorPage).toBe(false);
    expect(pathEnds(svg)).toEqual(['17,17', '15,14', '14,11']);
  });

  it('draws the same page through the async render()', async () => {
    const text = block('path ABCabc');
    const options = { measurer: new DeterministicMeasurer(), ...INSECURE };
    expect(await renderAsync(text, options)).toBe(renderSync(text, options));
  });

  it.each(['w'.repeat(30), 'A'.repeat(30)])('keeps the page at 50×50 when the ink leaves it (%s)', (motif) => {
    const { svg } = render(block(`path ${motif}`), INSECURE);
    expect(svg).toContain(`width="${PAGE}px" height="${PAGE}px" viewBox="0 0 ${PAGE} ${PAGE}"`);
    expect(pathEnds(svg)).toHaveLength(30);
  });
});

describe('path under INSECURE with a character outside A-Z/a-w (D3)', () => {
  it.each(['path abc123', 'path xyz'])('renders the error page for %j', (line) => {
    const { svg, errorPage } = render(block(line), INSECURE);
    expect(errorPage).toBe(true);
    expect(svg).toContain('IllegalArgumentException');
    expect(svg).not.toContain('viewBox="0 0 50 50"');
  });
});

describe('the cov-path-* pages under every other profile (D1)', () => {
  it.each(COV_PATH_SLUGS)('%s is the same error page with no options and under each non-INSECURE profile', (slug) => {
    const text = readFileSync(join(FIXTURES, `${slug}.puml`), 'utf8');
    const baseline = render(text);
    expect(baseline.errorPage).toBe(true);
    expect(baseline.svg).toContain('Syntax Error?');
    for (const securityProfile of NON_INSECURE_PROFILES) {
      expect(render(text, { securityProfile }).svg).toBe(baseline.svg);
    }
  });
});
