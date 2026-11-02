/**
 * dbp T2c: salt carries a gradient `document` background to the shell.
 *
 * Upstream: `TitledDiagram#calculateBackColor` (`TitledDiagram.java:280-289`)
 * returns the gradient; `SvgGraphics`' constructor emits the def + `url(#id)`
 * rect and leaves `backcolorString` null (`SvgGraphics.java:178-183`), so the
 * root `style` has no `background:`. Oracle: the authored jar row
 * `tests/fixtures/document-background/salt-gradient.svg`.
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const salt = (background: string): string =>
  `@startsalt\n<style>\ndocument {\n  BackgroundColor ${background}\n}\n</style>\n{\n  [OK]\n}\n@endsalt`;
const render = (background: string): string => renderSync(salt(background), { measurer: new DeterministicMeasurer() });
const rootStyle = (svg: string): string => /<svg[^>]*\sstyle="([^"]*)"/.exec(svg)?.[1] ?? '';

describe('salt document background gradient (TitledDiagram.java:280-289, SvgGraphics.java:178-183)', () => {
  it('has no root background: for a style gradient and paints the url() rect', () => {
    const svg = render('red/blue');
    expect(rootStyle(svg)).not.toContain('background:');
    const id = /<linearGradient [^>]*id="([^"]+)"/.exec(svg)?.[1] ?? '';
    expect(id).not.toBe('');
    expect(svg).toContain('<stop stop-color="#F00" offset="0%"/><stop stop-color="#00F" offset="100%"/>');
    expect(svg).toContain(`fill="url(#${id})"`);
  });

  it('keeps a solid colour on the root background (unchanged)', () => {
    const svg = render('black');
    expect(rootStyle(svg)).toContain('background:#000000;');
    expect(svg).not.toContain('<linearGradient');
  });
});
