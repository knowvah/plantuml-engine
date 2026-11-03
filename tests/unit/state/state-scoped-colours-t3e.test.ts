/**
 * dss T3e: the state readers T3c left (reader-audit sites 13-19), end to end through the authored
 * rows (`tests/fixtures/diagram-style-scope/state__*`). Each literal is the count the jar's own SVG
 * holds (counted from the row's oracle; the test also asserts the golden holds it, so a re-captured
 * oracle cannot drift silently), so the test fails if a reader skips its bucket.
 *
 *   13 note on link        `EntityImageNoteLink.java:64` -> `ComponentType.java:98-99` (`sequenceDiagram, note`)
 *   14 fork, join          `EntityImageSynchroBar.java:62-63,81-84` (`activityDiagram, activityBar`)
 *   15-17 history          `EntityImagePseudoState.java:70-71,87-97` (`stateDiagram, diamond`)
 *   18 concurrent rule     `ConcurrentStates.java:111-120` (`stateDiagram, state`, LineColor)
 *   19 sdlreceive text     `EntityImageState2.java:80-86,98-99` (`stateDiagram, state`)
 */
import { describe, it, expect } from 'vitest';
import { readScopeFixture } from '../../oracle/svg-conformance/diagram-style-scope.js';
import { renderDbgMarkup } from '../../oracle/svg-conformance/document-background.js';

function count(svg: string, needle: string): number {
  return svg.split(needle).length - 1;
}

/** `needle` occurs `expected` times in the jar's oracle and in ours. */
function expectJarCount(row: string, needle: string, expected: number): void {
  const { markup, golden } = readScopeFixture(row);
  expect(count(golden, needle)).toBe(expected);
  expect(count(renderDbgMarkup(markup), needle)).toBe(expected);
}

describe('fork and join read the activityBar signature (site 14)', () => {
  it('element { BackgroundColor } fills the bars and the leaves: 6 #AAA fills (jar)', () => {
    expectJarCount('state__pseudo-bg-element', 'fill="#AAA"', 6);
  });
  it('root { BackgroundColor } likewise: 7 #AAA fills (jar)', () => {
    expectJarCount('state__pseudo-bg-root', 'fill="#AAA"', 7);
  });
});

describe('sdlreceive text reads the state signature (site 19)', () => {
  it.each(['diag', 'element', 'root'])('%s { FontColor }: the one #00B text is the sdlreceive label (jar)', (scope) => {
    expectJarCount(`state__pseudo-font-${scope}`, '#00B', 1);
  });
});

describe('history reads the diamond signature (sites 15-17)', () => {
  it.each([
    ['diag', 13],
    ['element', 11],
    ['root', 13],
  ] as const)('%s { BackgroundColor }: #AAA count', (scope, expected) => {
    expectJarCount(`state__hist-bg-${scope}`, '#AAA', expected);
  });
  it.each(['diag', 'element', 'root'])('%s { LineColor }: 33 #B00 (jar)', (scope) => {
    expectJarCount(`state__hist-line-${scope}`, '#B00', 33);
  });
  it.each(['diag', 'element', 'root'])('%s { FontColor }: 8 #00B (jar)', (scope) => {
    expectJarCount(`state__hist-font-${scope}`, '#00B', 8);
  });
});

describe('the concurrent rule reads the state LineColor (site 18)', () => {
  it('stateDiagram { LineColor }: 22 #B00 including the dashed separator (jar)', () => {
    expectJarCount('state__conc-line-diag', '#B00', 22);
  });
});

describe('a note on a link reads the sequenceDiagram note signature (site 13)', () => {
  it('element { BackgroundColor, LineColor, FontColor }: the link note draws #AAA, #BBB, #CCC (probe, jar counts)', () => {
    const row = 'state__probe-note-link';
    expectJarCount(row, '#AAA', 9);
    expectJarCount(row, '#BBB', 22);
    expectJarCount(row, '#CCC', 6);
  });
  it.each([
    ['state__flatnote-bg-diag', '#AAA', 8],
    ['state__flatnote-bg-element', '#AAA', 8],
    ['state__flatnote-bg-root', '#AAA', 10],
    ['state__flatnote-font-diag', '#00B', 5],
    ['state__flatnote-font-element', '#00B', 6],
    ['state__flatnote-font-root', '#00B', 6],
    ['state__flatnote-line-diag', '#B00', 11],
    ['state__flatnote-line-element', '#B00', 13],
    ['state__flatnote-line-root', '#B00', 13],
  ] as const)('%s: %s occurs %i times (jar)', (row, needle, expected) => {
    expectJarCount(row, needle, expected);
  });
});
