import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { compareSvg } from '../../oracle/svg-conformance/compare.js';

/**
 * stdd T5b, notes. Oracles under `tests/fixtures/stdd-T5b/` are `scripts/oracle-render.sh` renders.
 * - a one-line note is `Display.getWithNewlines(pragma, note)` (`CommandFactoryNoteOnEntity.java:300-303`):
 *   a literal `\n` breaks the line.
 * - `B --> N` to a `note as N`: `getOrCreateLeaf` finds the note leaf, and `GraphvizImageBuilder#isOpalisable`
 *   (`GraphvizImageBuilder.java:134-147`) makes the single link the note's Opale notch: no `<g class="link">`,
 *   no state `N`.
 * - a syntax error names the failing line's DOCUMENT position (`PSystemError.java:239`), not the previous.
 * - `note on link #red`: `CucaNote.build(display, position, colors)` (`CommandFactoryNoteOnLink.java:217-218`),
 *   the BACK colour is the rose note's fill (`Style#getSymbolContext`, `Style.java:371-373`).
 */

const FIXTURES = 'tests/fixtures/stdd-T5b';
const CACHE = 'test-results/dot-cache/state';
const measurer = new DeterministicMeasurer();

function render(puml: string): string {
  return renderSync(puml, { measurer, jarCompatibleStyleInput: true } as Parameters<typeof renderSync>[1]);
}

function fixtureDiffs(name: string): unknown[] {
  const ours = render(readFileSync(`${FIXTURES}/${name}.puml`, 'utf8'));
  return compareSvg(ours, readFileSync(`${FIXTURES}/${name}.svg`, 'utf8'), 'deterministic').diffs;
}

describe('stdd T5b: notes', () => {
  it('a one-line note breaks at a literal \\n', () => {
    const svg = render(readFileSync(`${FIXTURES}/note-oneline-newline.puml`, 'utf8'));
    expect(svg).toMatch(/>first<\/text>/);
    expect(svg).toMatch(/>second<\/text>/);
    expect(fixtureDiffs('note-oneline-newline')).toEqual([]);
  });

  it('`B --> N` to a `note as N` attaches the note and draws no link and no state N', () => {
    const svg = render(readFileSync(`${FIXTURES}/note-as-endpoint.puml`, 'utf8'));
    expect(svg).not.toContain('class="link"');
    expect(svg.match(/data-qualified-name="N"/g)).toHaveLength(1);
    expect(fixtureDiffs('note-as-endpoint')).toEqual([]);
  });

  it('two implicit notes on one state keep the jar ids', () => {
    expect(fixtureDiffs('note-implicit-second')).toEqual([]);
  });

  it('a syntax error page names the failing line, not the previous one', () => {
    // The jar prints the file name where it has one; the survey's error rows compare by rule, so the line is the test.
    const svg = render(readFileSync(`${FIXTURES}/error-previous-line.puml`, 'utf8'));
    expect(svg).toContain('(line 3) ]');
    expect(svg).toMatch(/<text [^>]*text-decoration="wavy underline"[^>]*>foo bar baz<\/text>/);
  });

  it('fotigo-12: `note on link #red` / `#blue` fill the link notes', () => {
    const puml = readFileSync(`${CACHE}/fotigo-12-gufu949/in.puml`, 'utf8');
    const svg = render(puml);
    expect(svg.match(/fill="#F00"/g)).toHaveLength(2);
    expect(svg.match(/fill="#00F"/g)).toHaveLength(2);
    const diffs = compareSvg(svg, readFileSync(`${CACHE}/fotigo-12-gufu949/in.svg`, 'utf8'), 'deterministic').diffs;
    expect(diffs).toEqual([]);
  });
});
