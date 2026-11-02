/**
 * dbp T2c: mindmap carries a gradient `document` background.
 *
 * Upstream: `TitledDiagram#calculateBackColor` returns any `HColor` and
 * `transparent()` for null (`TitledDiagram.java:280-289`); `SvgGraphics`'
 * constructor takes the gradient branch (`SvgGraphics.java:178-183`):
 * `createSvgGradient` + a `url(#id)` rect, `backcolorString = null` so the
 * root `style` carries no `background:`. Oracle: the authored jar row
 * `tests/fixtures/document-background/mindmap-gradient.svg`.
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const mindmap = (background: string): string =>
  `@startmindmap\n<style>\ndocument {\n  BackgroundColor ${background}\n}\n</style>\n* root\n** child\n@endmindmap`;
const render = (background: string): string =>
  renderSync(mindmap(background), { measurer: new DeterministicMeasurer() });
const rootStyle = (svg: string): string => /<svg[^>]*\sstyle="([^"]*)"/.exec(svg)?.[1] ?? '';

describe('mindmap document background gradient (TitledDiagram.java:280-289, SvgGraphics.java:178-183)', () => {
  it('renders a style gradient as a def + url() rect with no root background', () => {
    const svg = render('red/blue');
    expect(svg).not.toContain('ClassCastException');
    expect(svg).toContain('data-diagram-type="MINDMAP"');
    expect(rootStyle(svg)).not.toContain('background:');
    expect(svg).toMatch(
      /<linearGradient [^>]*id="([^"]+)"><stop stop-color="#F00" offset="0%"\/><stop stop-color="#00F" offset="100%"\/>/,
    );
    const id = /<linearGradient [^>]*id="([^"]+)"/.exec(svg)?.[1] ?? '';
    expect(svg).toContain(`<rect x="0" y="0" width="173" height="75" fill="url(#${id})" style="stroke:none;"/>`);
  });

  it('keeps a solid colour on the root background (unchanged)', () => {
    const svg = render('black');
    expect(rootStyle(svg)).toContain('background:#000000;');
    expect(svg).not.toContain('<linearGradient');
  });
});
