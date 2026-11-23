/**
 * `PSystemVersionFactory` (version/PSystemVersionFactory.java): `about` /
 * `author` / `authors` (java:52), `version` (java:55, the port's own values —
 * decisions.md D14), bare `stdlib` (java:59), `testdot` (java:62),
 * `keydistributor` (java:65), `keygen` (java:68), `keyimport [key]` (java:72)
 * and both `keycheck` forms (java:77, :84) through the single-line gate.
 */
import { describe, expect, it } from 'vitest';
import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { CompleteSvg } from '../../../src/core/dispatcher.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { parseRefusalOf, refuse } from '../../../src/core/parse-refusal.js';
import { defaultTheme } from '../../../src/core/theme.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { DOT_ENGINE_VERSION } from '../../../src/core/version.js';
import { PSystemKeycheck } from '../../../src/diagrams/version/PSystemKeycheck.js';
import { PSystemKeygen } from '../../../src/diagrams/version/PSystemKeygen.js';
import { PSystemVersion } from '../../../src/diagrams/version/PSystemVersion.js';
import type { VersionFamilyDiagram } from '../../../src/diagrams/version/PSystemVersionFactory.js';
import { PSystemVersionFactory, versionPlugin } from '../../../src/diagrams/version/PSystemVersionFactory.js';

const measurer = new DeterministicMeasurer();

function sourceOf(text: string): UmlSource {
  const block = buildBlockUmls(text)[0];
  if (block?.ok !== true) throw new Error(`no block in ${text}`);
  return { ...block.source, seedSourceLines: block.seedSource };
}

function diagramOf(line: string): VersionFamilyDiagram | undefined {
  return new PSystemVersionFactory().executeLine(
    sourceOf(`@startuml\n${line}\n@enduml`),
    line,
    new PreprocessingArtifact(),
  );
}

function linesOf(line: string): readonly string[] | undefined {
  const diagram = diagramOf(line);
  return diagram instanceof PSystemVersion ? diagram.getLines() : undefined;
}

/** The SVG of the page the factory builds for `line`. */
function pageOf(line: string): string | undefined {
  return diagramOf(line)?.exportDiagram(0, measurer);
}

function renderOf(line: string): string {
  const diagram = versionPlugin.parse(sourceOf(`@startuml\n${line}\n@enduml`));
  if (parseRefusalOf(diagram) !== undefined) throw new Error('refused');
  const geometry = versionPlugin.layoutSync(diagram as VersionFamilyDiagram, defaultTheme, measurer);
  return (versionPlugin.render(geometry, defaultTheme) as CompleteSvg).completeSvg;
}

describe('PSystemVersionFactory#executeLine (java:49-90)', () => {
  it('about, author and authors build the authors page, any case, trailing whitespace allowed', () => {
    for (const line of ['about', 'author', 'authors', 'ABOUT', 'Authors \t'])
      expect(linesOf(line)?.[3], JSON.stringify(line)).toBe('<u>Original idea</u>: Arnaud Roques');
  });

  it('stdlib builds the stdlib page', () => {
    for (const line of ['stdlib', 'STDLIB', 'stdlib  ']) expect(linesOf(line)?.[0], line).toBe('<b>adaml');
  });

  it('version builds the version page, any case, trailing whitespace allowed (java:55-56)', () => {
    for (const line of ['version', 'VERSION', 'Version \t'])
      expect(linesOf(line)?.[2], JSON.stringify(line)).toBe('<b>Build Time</b> ""Unknown compile time""');
  });

  it('testdot builds the testdot page, any case, trailing whitespace allowed (java:62-63)', () => {
    for (const line of ['testdot', 'TESTDOT  ', 'TestDot\t'])
      expect(linesOf(line)?.[1], JSON.stringify(line)).toBe(`<b>@knowvah/dot-engine</b> ""${DOT_ENGINE_VERSION}""`);
  });

  it('keydistributor builds the keydistributor page, any case, trailing whitespace allowed (java:65-66)', () => {
    for (const line of ['keydistributor', 'KEYDISTRIBUTOR', 'KeyDistributor \t'])
      expect(linesOf(line), JSON.stringify(line)).toEqual(['No license found']);
  });

  it('keygen and keyimport build the keygen page, any case, any key, trailing whitespace allowed (java:68-76)', () => {
    const keygen = pageOf('keygen');
    expect(keygen).toContain('>(Unknown compile time)</text>');
    for (const line of ['KEYGEN', 'keygen \t', 'keyimport', 'keyimport abc123', 'KEYIMPORT ABC123', 'keyimport\tz9 ']) {
      expect(diagramOf(line), JSON.stringify(line)).toBeInstanceOf(PSystemKeygen);
      expect(pageOf(line), JSON.stringify(line)).toBe(keygen);
    }
  });

  it('keycheck <sig> <key> and keycheck <key> build the keycheck page, any case (java:77-87)', () => {
    const keycheck = pageOf('keycheck abc123 def456');
    expect(keycheck).toContain('>No license key was checked: plantuml-engine reads none.</text>');
    for (const line of ['keycheck abc123', 'KEYCHECK ABC123', 'keycheck\tabc123  def456\t', 'KeyCheck z9 ']) {
      expect(diagramOf(line), JSON.stringify(line)).toBeInstanceOf(PSystemKeycheck);
      expect(pageOf(line), JSON.stringify(line)).toBe(keycheck);
    }
  });

  it('refuses near misses, and anything else', () => {
    for (const line of [
      'versions',
      ' version',
      ' testdot',
      'testdots',
      'test dot',
      'keydistributors',
      'keygens',
      'keygen abc',
      'keyimportabc',
      'keyimport a-b',
      'keyimport abc def',
      'keyimport abc_1',
      'keycheck',
      'keycheck ',
      'keycheckabc',
      'keycheck a-b',
      'keycheck a b c',
      'keycheck a_b',
      ' keycheck a',
      'abouts',
      ' about',
    ])
      expect(diagramOf(line), JSON.stringify(line)).toBeUndefined();
  });
});

describe('versionPlugin', () => {
  it("is a 'sequence' candidate", () => {
    expect(versionPlugin.type).toBe('sequence');
  });

  it('renders the about page as a complete document', () => {
    const svg = renderOf('about');
    // 239 (the jar's page) + 12: the port-author credit line (user ruling 2026-10-14).
    // Width re-pinned 393 -> 410 for issue #173 ruling 2026-11-11: the version line is the widest.
    expect(svg).toContain('width="410px" height="251px"');
    expect(svg).toContain('text-decoration="underline">Original idea</text>');
  });

  it('renders the stdlib page as govuca-53-mili511 does: 589 x 1655', () => {
    expect(renderOf('stdlib')).toContain('width="589px" height="1655px"');
  });

  it('renders the version page with the logo bottom-right', () => {
    const svg = renderOf('version');
    expect(svg).toContain('font-weight="700">Installation seems OK. File generation OK</text>');
    expect(svg).toMatch(/<image width="80" height="71" x="[\d.]+" y="\d+"/);
  });

  it('renders each page the same three times', () => {
    for (const line of ['about', 'stdlib', 'version'])
      expect(new Set([0, 1, 2].map(() => renderOf(line))).size).toBe(1);
  });

  it('renders the testdot and keydistributor pages with no image', () => {
    expect(renderOf('testdot')).toContain(`font-family="monospace">${DOT_ENGINE_VERSION}</text>`);
    expect(renderOf('keydistributor')).toContain('>No license found</text>');
    for (const line of ['testdot', 'keydistributor']) expect(renderOf(line)).not.toContain('<image');
  });

  it("refuses testdots with the gate's Syntax Error?", () => {
    expect(versionPlugin.parse(sourceOf('@startuml\ntestdots\n@enduml'))).toEqual(
      refuse('syntax', 1, 1, 'Syntax Error?'),
    );
  });

  it('refuses a 4-line source below every real refusal', () => {
    expect(parseRefusalOf(versionPlugin.parse(sourceOf('@startuml\nabout\nabout\n@enduml')))?.commandScore).toBe(
      Number.NEGATIVE_INFINITY,
    );
  });
});
