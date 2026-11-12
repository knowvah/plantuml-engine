/**
 * `@startgit` through `renderSync`: the plugin at `PSystemBuilder.java:191`,
 * the `TitledDiagram` exporter, and the error pages for the jar's crashes.
 */
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

function render(body: string): string {
  return renderSync(`@startgit\n${body}\n@endgit`, { measurer: new DeterministicMeasurer() });
}

/** Our own error page carries the port's version banner (ruling 2026-10-10). */
const OWN_ERROR_PAGE = /plantuml-ts version [^<]*<\/text>/;

describe('git plugin', () => {
  it('draws a GIT document on a white background', () => {
    const svg = render('* a1 msg\n* r0 root');
    expect(svg).toContain('data-diagram-type="GIT"');
    expect(svg).toContain('background:#FFFFFF;');
    expect(svg).toContain('font-family="monospace">a1</text>');
  });

  it('draws the 21x21 empty canvas for an empty body (cov-empty)', () => {
    const svg = renderSync('@startgit\n@endgit', { measurer: new DeterministicMeasurer() });
    expect(svg).toContain('data-diagram-type="GIT"');
    expect(svg).toContain('width="21px" height="21px" viewBox="0 0 21 21"');
  });

  it.each([
    ['cov-star-no-space', '*a1 msg\n* r0 root'],
    ['cov-tab', '*\ta1 msg\n* r0 root'],
    ['cov-orphan-pipe', '* a1 msg\n|\n'],
  ])('renders our error page where the jar crashes (%s)', (_slug, body) => {
    const svg = render(body);
    expect(svg).not.toContain('data-diagram-type="GIT"');
    expect(svg).toMatch(OWN_ERROR_PAGE);
  });

  it('ignores skinparam, <style> and title lines (cov-skinparam, cov-style, cov-title; gip D4)', () => {
    const plain = render('* a1 msg\n* r0 root');
    expect(render('skinparam ArrowColor red\n* a1 msg\n* r0 root')).toBe(plain);
    expect(render('<style>\ngitDiagram {\n  LineColor red\n}\n</style>\n* a1 msg\n* r0 root')).toBe(plain);
    expect(render('title Hello\n* a1 msg\n* r0 root')).toBe(plain);
  });
});
