/**
 * `PSystemListFonts{,Factory}` (font/*.java): `listfont`/`listfonts`, then the
 * header and a blank line, then one line per host font. The host list is the
 * #169 seam (`availableFontFamilyNames`, none), so the page is the header.
 *
 * Jar values: ftp planning probe `cov-listfonts-bare` -- the two header runs
 * (`   ` at x=5, `Fonts available:` 16-pt bold at x=14.9, y=17.444,
 * textLength 112.1) and the `" "` line at y=30.333.
 */
import { describe, expect, it } from 'vitest';
import { availableFontFamilyNames } from '../../../src/core/available-font-family-names.js';
import { buildBlockUmls } from '../../../src/core/BlockUmlBuilder.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { PSystemListFonts } from '../../../src/diagrams/font/PSystemListFonts.js';
import { listFontsPlugin, PSystemListFontsFactory } from '../../../src/diagrams/font/PSystemListFontsFactory.js';
import { renderSync } from '../../../src/index.js';

function sourceOf(text: string): UmlSource {
  const block = buildBlockUmls(text)[0];
  if (block?.ok !== true) throw new Error(`no block in ${text}`);
  return { ...block.source, seedSourceLines: block.seedSource };
}

function textRuns(svg: string): string[] {
  return [...svg.matchAll(/<text [^>]*>[^<]*/g)].map((m) => m[0]);
}

describe('PSystemListFontsFactory.executeLine (PSystemListFontsFactory.java:46-56)', () => {
  const factory = new PSystemListFontsFactory();
  const source = sourceOf('@startuml\nlistfonts\n@enduml');
  const artifact = new PreprocessingArtifact();

  it.each(['listfont', 'listfonts', 'LISTFONTS', 'listfont Hello', 'listfonts  Hello  ', 'ListFonts x'])(
    'accepts %j',
    (line) => expect(factory.executeLine(source, line, artifact)).toBeInstanceOf(PSystemListFonts),
  );

  it.each(['listfontsX', 'listfonts\tX', 'list fonts', 'listfontss'])('refuses %j', (line) =>
    expect(factory.executeLine(source, line, artifact)).toBeUndefined(),
  );

  it('describes itself as (List fonts) and draws the header and a blank line', () => {
    const diagram = factory.executeLine(source, 'listfonts', artifact)!;
    expect(diagram.getDescription()).toBe('(List fonts)');
  });
});

describe('the #169 seam', () => {
  it('answers no host font family', () => {
    expect(availableFontFamilyNames()).toEqual([]);
  });
});

describe('listFontsPlugin page', () => {
  it('parses the single-line source', () => {
    expect(listFontsPlugin.parse(sourceOf('@startuml\nlistfonts\n@enduml'))).toBeInstanceOf(PSystemListFonts);
  });

  it('draws the jar header runs and no font line', () => {
    const svg = renderSync('@startuml\nlistfonts\n@enduml', { measurer: new DeterministicMeasurer() });
    expect(svg).not.toContain('data-diagram-type');
    const runs = textRuns(svg);
    expect(runs).toHaveLength(3);
    expect(runs[0]).toContain('x="5" y="18.333"');
    expect(runs[0]).toContain('textLength="9.9"');
    expect(runs[1]).toContain('x="14.9" y="17.444"');
    expect(runs[1]).toContain('font-size="16" textLength="112.1" font-weight="700">Fonts available:');
    expect(runs[2]).toContain('x="5" y="30.333"');
  });

  it('listfontsX is not this factory', () => {
    expect(renderSync('@startuml\nlistfontsX\n@enduml')).not.toContain('Fonts available:');
  });
});
