/**
 * The registered chart plugin end to end through `renderSync`: the margin, chrome,
 * scale, colour mappers and warnings `index.ts` mirrors from the wbs plugin (D2).
 * Expected dimensions are the jar's, `babadu-29`'s and the planning probes'.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/core/TextBlockExporter.java:153-209
 */
import { describe, expect, it } from 'vitest';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { renderSync } from '../../../src/index.js';

const measurer = new DeterministicMeasurer();
const render = (...lines: string[]): string =>
  renderSync(['@startchart', ...lines, '@endchart'].join('\n'), { measurer });
const rootOf = (svg: string): string => svg.slice(0, svg.indexOf('>') + 1);

const BODY = ['h-axis [Q1, Q2, Q3, Q4]', 'v-axis 0 --> 100', 'bar "Revenue" [45, 62, 58, 70]'];

describe('chartPlugin', () => {
  it('draws through the new engine at margin 10 and +1, as babadu-29', () => {
    const root = rootOf(render(...BODY, 'legend right'));
    expect(root).toContain('data-diagram-type="CHART"');
    expect(root).toContain('width="604px" height="431px" viewBox="0 0 604 431"');
    expect(root).toContain('background:#FFFFFF');
  });

  it('scale 2 gives 1002 x 862, as the planning probe', () => {
    expect(rootOf(render(...BODY, 'scale 2'))).toContain('width="1002px" height="862px"');
  });

  it('rotate and page are accepted', () => {
    expect(rootOf(render(...BODY, 'rotate', 'page 2x2'))).toContain('width="501px" height="431px"');
  });

  it('title chrome adds its band, as sotoju-04', () => {
    const svg = render('title Performance', ...BODY);
    expect(rootOf(svg)).toContain('width="501px" height="466px"');
    expect(svg).toContain('<line x1="70" y1="95" x2="70" y2="395" style="stroke:#181818;stroke-width:0.5;"/>');
  });

  it('a chrome scale carries through the fragment', () => {
    expect(rootOf(render('title T', ...BODY, 'scale 2'))).toContain('data-diagram-type="CHART"');
  });

  it('a mainframe frames the block', () => {
    expect(render('mainframe M', ...BODY)).toContain('>M</text>');
  });

  it('a skinparam background and a gradient reach the root', () => {
    expect(rootOf(render('skinparam backgroundColor #ff0000', ...BODY))).toContain('background:#FF0000');
    expect(render('skinparam backgroundColor red/blue', ...BODY)).toContain('<linearGradient');
  });

  it('lengthAdjust reaches the root group', () => {
    expect(render('skinparam lengthAdjust spacingAndGlyphs', ...BODY)).toContain('lengthAdjust="spacingAndGlyphs"');
  });

  it('a syntax error is our own error page', () => {
    expect(render('grid v-axis')).toContain('Syntax Error?');
  });

  it('mode dark, monochrome and reversecolor change the mapper', () => {
    const coloured = [...BODY, 'bar "C" [10, 20, 30, 40] #3498db'];
    const blue = 'fill="#3498DB"';
    expect(render(...coloured)).toContain(blue);
    expect(render('skinparam monochrome true', ...coloured)).not.toContain(blue);
    expect(render('skinparam monochrome true', ...coloured)).toContain('fill="#818181"');
    expect(render('skinparam monochrome reverse', ...coloured)).not.toContain(blue);
    expect(render('skinparam reversecolor dark', ...coloured)).not.toContain(blue);
    expect(render('skinparam reversecolor rgb', ...coloured)).not.toContain(blue);
    expect(render('skinparam reversecolor nosuch', ...coloured)).toContain(blue);
  });

  it('handwritten wraps the drawing', () => {
    expect(render('skinparam handwritten true', ...BODY)).toContain('data-diagram-type="CHART"');
  });

  it('!option handwritten reaches the drawing, as skinparam handwritten does (UgDiagram.java:117-121)', () => {
    const plain = render(...BODY);
    expect(plain).toContain('<line x1=');
    expect(render('!option handwritten true', ...BODY)).not.toContain('<line x1=');
    expect(render('skinparam handwritten true', ...BODY)).not.toContain('<line x1=');
    expect(render('!option handwritten false', ...BODY)).toContain('<line x1=');
  });

  it('a NaN coordinate is the jar crash, not a drawing (MinMaxMutable.java:80-85)', () => {
    expect(render('h-axis [A, B]', 'v-axis 0 --> 10', 'line [NaN, 1]')).not.toContain('data-diagram-type="CHART"');
    expect(render('h-axis [A, B]', 'v-axis 5 --> 5', 'line [5, 6]')).not.toContain('data-diagram-type="CHART"');
  });

  it('a style Margin overrides the default', () => {
    const svg = render('<style>', 'document {', 'Margin 20', '}', '</style>', ...BODY);
    expect(rootOf(svg)).toContain('width="521px" height="451px"');
  });

  it('a deprecated skinparam adds its warning banner', () => {
    expect(render('skinparam padding 2', ...BODY)).toMatch(
      /font-family="monospace">Please\suse\sCSS\sstyle\sinstead\sof\sskinparam\spadding<\/text>/,
    );
  });
});
