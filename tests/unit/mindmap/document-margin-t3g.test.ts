/**
 * T3g: mindmap's `TextBlockExporter.Builder#calculateMargin` reads the merged
 * `root,document` style's `Margin`, else `getDefaultMargins()` (`same(10)`)
 * (`TextBlockExporter.java:510-516`). Expected canvases are the jar's:
 * `tests/fixtures/diagram-style-scope/mindmap__x-margin-*.svg`.
 */
import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const BODY = '* root\n** a\n** b';
const mindmap = (css: string, extra = ''): string =>
  `@startmindmap\n${css === '' ? '' : `<style>\n${css}\n</style>\n`}${extra}${BODY}\n@endmindmap`;
const canvas = (src: string): string => {
  const svg = renderSync(src, { measurer: new DeterministicMeasurer() });
  return /<svg[^>]*viewBox="([^"]*)"/u.exec(svg)?.[1] ?? '';
};

describe('mindmap document Margin', () => {
  it('no Margin keeps the default same(10)', () => {
    expect(canvas(mindmap(''))).toBe('0 0 152 129');
  });

  it('`document { Margin 20 }` (jar mindmap__x-margin-document: 172x149)', () => {
    expect(canvas(mindmap('document { Margin 20 }'))).toBe('0 0 172 149');
  });

  it('`root { Margin 20 }` reaches the document and the root node (jar mindmap__x-margin-root: 192x189)', () => {
    expect(canvas(mindmap('root { Margin 20 }'))).toBe('0 0 192 189');
  });

  it('`document { Margin 5 12 }` is top/bottom 5, left/right 12 (jar mindmap__x-margin-sides: 156x119)', () => {
    expect(canvas(mindmap('document { Margin 5 12 }'))).toBe('0 0 156 119');
  });

  it('`root { Margin 10 }` is the default', () => {
    expect(canvas(mindmap('root { Margin 10 }'))).toBe('0 0 152 129');
  });

  it('a title composes inside the margin', () => {
    const plain = canvas(mindmap('document { Margin 20 }'));
    const titled = canvas(mindmap('document { Margin 20 }', 'title T\n'));
    const [, , w, h] = titled.split(' ').map(Number);
    const [, , pw, ph] = plain.split(' ').map(Number);
    expect(w).toBeGreaterThanOrEqual(pw ?? 0);
    expect(h).toBeGreaterThan(ph ?? 0);
  });
});
