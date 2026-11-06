/**
 * The chart renderers, drawn through `UGraphicSvg` over the deterministic
 * measurer the oracles were captured with. Expected strings are the jar's, from
 * the named row's `test-results/dot-cache/chart/<slug>/in.svg`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartRenderer.java
 */
import { describe, expect, it } from 'vitest';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { stringBounder, svgGraphic } from '../mindmap/helpers/mindmap-skin.js';
import { parseChartLines } from './helpers/chart-diagram.js';

/** `TitledDiagram#getDefaultMargins`: `same(10)`. */
const MARGIN_TRANSLATE = new UTranslate(10, 10);

const line = (x1: number, y1: number, x2: number, y2: number, thickness = 0.5, color = '#181818'): string =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${color};stroke-width:${thickness};"/>`;

function draw(...lines: string[]): string {
  const ug = svgGraphic();
  parseChartLines(lines).drawU(ug.apply(MARGIN_TRANSLATE));
  return ug.getSvgString();
}

function dimension(...lines: string[]): [number, number] {
  const dim = parseChartLines(lines).calculateDimension(stringBounder());
  return [dim.getWidth(), dim.getHeight()];
}

const BABADU = ['h-axis [Q1, Q2, Q3, Q4]', 'v-axis 0 --> 100', 'bar "Revenue" [45, 62, 58, 70]', 'legend right'];
const FOSOMA = [
  'h-axis [Q1, Q2, Q3, Q4]',
  'v-axis "Value" 0 --> 100',
  'bar "Actuals" [45, 62, 58, 70] #3498db',
  'line "Forecast" [50, 65, 68, 75] #e74c3c',
  'scatter "Key Events" [48, 63, 65, 72] #9b59b6 <<circle>>',
  'legend right',
];
const RUPIVE = [
  'h-axis "Quarters" [Q1, Q2, Q3, Q4]',
  'v-axis "Revenue ($M)" 0 --> 100',
  'v2-axis "Market Share %" 0 --> 50',
  'bar "Revenue" [45, 62, 58, 70] #3498db',
  'line "Market Share" [15, 20, 18, 25] #2ecc71 v2',
  'legend right',
];

describe('ChartRenderer frame (T3a)', () => {
  it('babadu-29 without its legend is 480 x 410, the plot 400 wide', () => {
    expect(dimension(...BABADU.slice(0, 3))).toEqual([480, 410]);
  });

  it('babadu-29 with its legend is 583 x 410 (480 + 93 + 10)', () => {
    const [width, height] = dimension(...BABADU);
    expect(width).toBeCloseTo(583.0875, 3);
    expect(height).toBe(410);
  });

  it('the plot widens past 6 labels and y2 and a title add their space', () => {
    expect(dimension('h-axis [A,B,C,D,E,F,G,H]')[0]).toBe(20 + 40 + 480 + 20);
    expect(dimension('v2-axis')[0]).toBe(520);
    expect(dimension('h-axis "T" [A]')[1]).toBe(430);
    expect(dimension('h-axis "x" 0 --> 1')[1]).toBe(430);
    expect(dimension('v-axis "x" 0 --> 1')[1]).toBe(410);
  });

  it('draws the first axis line and tick text as babadu-29', () => {
    const svg = draw(...BABADU);
    expect(svg).toContain(line(70, 60, 70, 360));
    expect(svg.indexOf(line(70, 60, 70, 360))).toBeLessThan(svg.indexOf('<rect'));
    expect(svg).toContain('<text x="44.425" y="303.889" fill="#000" font-size="14" textLength="15.575">20</text>');
    expect(svg).toContain(line(120, 360, 120, 365));
    expect(svg).toContain('<text x="110.681" y="380.889" fill="#000" font-size="14" textLength="18.638">Q1</text>');
  });

  it('custom ticks as sotoju-04, and an out-of-range tick is skipped', () => {
    const svg = draw(
      'h-axis [Q1]',
      'v-axis 0 --> 100 ticks [0:"Poor", 50:"Average", 100:"Excellent", 150:"Skipped"]',
      'bar [30]',
    );
    expect(svg).toContain('textLength="29.575">Poor</text>');
    expect(svg).toContain('<text x="3.125" y="63.889" fill="#000" font-size="14" textLength="56.875">Excellent</text>');
    expect(svg).not.toContain('Skipped');
  });

  it('spacing as badepu-56', () => {
    const svg = draw('h-axis [Q1]', 'v-axis "Revenue ($K)" 0 --> 100 spacing 25');
    expect(svg).toContain(line(70, 285, 65, 285));
    expect(svg).toContain('<text x="44.425" y="288.889" fill="#000" font-size="14" textLength="15.575">25</text>');
    expect(svg).not.toContain('>20</text>');
  });

  it('rotates the v and v2 titles as rupive-64, less its 35 of chrome', () => {
    const svg = draw(...RUPIVE);
    expect(svg).toContain('transform="rotate(-90 27 254.319)"');
    expect(svg).toContain('transform="rotate(90 513 159.906)"');
  });

  it('draws a horizontal chart as biniba-95, outer stroke 1 and size 10', () => {
    const svg = draw(
      'orientation horizontal',
      'v-axis [Product A, Product B, Product C]',
      'h-axis "Revenue" 0 --> 100',
      'bar [75, 55, 30] #3498db',
    );
    expect(svg).toContain(line(70, 60, 70, 360, 1));
    expect(svg).toContain(line(65, 110, 70, 110, 1));
    expect(svg).toContain(
      '<text x="16.125" y="112.778" fill="#000" font-size="10" textLength="43.875">Product A</text>',
    );
    expect(svg).toContain(line(70, 360, 470, 360, 1));
    expect(svg).toContain('<text x="67.219" y="377.778" fill="#000" font-size="10">0</text>');
    expect(svg).toContain('x="70" y="80" width="300" height="60"');
  });

  it('a v-axis grid steps range / 10, whatever drawYAxis ticks at', () => {
    const svg = draw('h-axis [Q1]', 'v-axis 0 --> 100 grid');
    expect(svg).toContain(line(70, 330, 470, 330));
    expect(svg).toContain(line(70, 60, 470, 60));
  });

  it('an h-axis grid draws at category centres and on the numeric walk', () => {
    const svg = draw('h-axis [A, B] grid', 'v-axis -10 --> 10');
    expect(svg).toContain(line(170, 210, 170, 60));
    expect(svg).toContain(line(170, 210, 170, 360));
    expect(svg).toContain(line(70, 60, 70, 360));
    expect(svg).toContain(line(110, 60, 110, 360));
  });

  it('numeric h-axis labels use %.1f, an exponent when small', () => {
    const svg = draw('h-axis 0 --> 1', 'line [(0, 1), (1, 2)]');
    expect(svg).toContain('>0.1</text>');
    expect(draw('h-axis 0 --> 0.001', 'line [(0, 1)]')).toContain('>1.00e-04</text>');
  });

  it('a right-placed h title and a top-placed v title', () => {
    const right = draw('h-axis "T" [A] label-right');
    expect(right).toContain('>T</text>');
    expect(draw('h-axis "T" 0 --> 1 label-right')).toContain('>T</text>');
    expect(draw('h-axis "T" 0 --> 1')).toContain('>T</text>');
    const top = draw('v-axis "L" 0 --> 1 label-top', 'v2-axis "R" 0 --> 1 label-top');
    expect(top).toContain('>L</text>');
    expect(top).toContain('>R</text>');
    expect(top).not.toContain('rotate(');
  });

  it('spacing on h-axis labels only every Nth', () => {
    const svg = draw('h-axis [A, B, C] spacing 2');
    expect(svg).toContain('>A</text>');
    expect(svg).not.toContain('>B</text>');
    expect(svg).toContain('>C</text>');
  });

  it('a zero y range draws its ticks at the one label', () => {
    expect(draw('v-axis 5 --> 5').match(/>5<\/text>/g)).toHaveLength(6);
  });

  it('style reaches the axis', () => {
    const horizontal = draw('orientation horizontal', 'v-axis [A]', 'h-axis 0 --> 1');
    expect(horizontal).toContain('font-size="10"');
    expect(draw('orientation horizontal', 'h-axis 0 --> 1')).not.toContain('>A</text>');
  });
});

describe('series (T3b)', () => {
  it('a bar with no colour is the style BackGroundColor, as babadu-29', () => {
    expect(draw(...BABADU)).toContain(
      '<rect x="90" y="225" width="60" height="135" fill="#F1F1F1" style="stroke:#181818;stroke-width:0.5;"/>',
    );
  });

  it('a scatter loses its explicit colour, as fosoma-37, and bars draw first', () => {
    const svg = draw(...FOSOMA);
    expect(svg).toContain('<ellipse cx="120" cy="216" rx="4" ry="4" fill="#000" style="stroke:#000;stroke-width:1;"/>');
    expect(svg).toContain('<ellipse cx="486" cy="124" rx="4.2" ry="4.2" fill="#000"');
    expect(svg.indexOf('<rect')).toBeLessThan(svg.indexOf('stroke:#E74C3C;stroke-width:2'));
    expect(svg.indexOf('stroke:#E74C3C;stroke-width:2')).toBeLessThan(svg.indexOf('<ellipse'));
  });

  it('draws grouped as tozute-42 and stacked as tixexi-49', () => {
    const groups = ['h-axis [Q1, Q2, Q3, Q4]', 'v-axis 0 --> 100', 'bar [45, 62, 58, 70] #3498db'];
    const grouped = draw(...groups, 'bar [35] #2ecc71');
    expect(grouped).toContain(
      '<rect x="80" y="225" width="40" height="135" fill="#3498DB" style="stroke:#181818;stroke-width:0.5;"/>',
    );
    expect(grouped).toContain('<rect x="120" y="255" width="40" height="105" fill="#2ECC71"');

    const stacked = draw(...groups, 'bar [25, 30] #e74c3c', 'stackMode stacked');
    expect(stacked).toContain('<rect x="90" y="225" width="60" height="135" fill="#3498DB"');
    expect(stacked).toContain('<rect x="90" y="150" width="60" height="75" fill="#E74C3C"');
  });

  it('stacks a negative downward and does not clamp zero', () => {
    const svg = draw('h-axis [A]', 'v-axis -10 --> 10', 'bar [5] #ff0000', 'bar [-5] #00ff00', 'stackMode stacked');
    expect(svg).toContain('<rect x="150" y="135" width="240" height="75" fill="#F00"');
    expect(svg).toContain('y="210" width="240" height="75" fill="#0F0"');
  });

  it('a negative bar and the zero line as reseci-41', () => {
    const svg = draw(
      'h-axis [Q1, Q2, Q3, Q4]',
      'v-axis "Profit/Loss ($K)" -50 --> 50 spacing 25',
      'bar "A" [-20, 10] #3498db',
    );
    expect(svg).toContain('<rect x="90" y="210" width="60" height="60" fill="#3498DB"');
    expect(svg).toContain('<rect x="190" y="180" width="60" height="30" fill="#3498DB"');
    expect(svg).toContain(line(70, 210, 470, 210));
  });

  it('a zero bar is skipped when single; grouped and horizontal reach URectangle.java:140-144 and throw', () => {
    expect(draw('h-axis [A]', 'bar [0]')).not.toContain('<rect');
    expect(() => draw('h-axis [A]', 'bar [0]', 'bar [0]')).toThrow('height=0');
    expect(() => draw('h-axis [A]', 'bar [0]', 'bar [0]', 'stackMode stacked')).toThrow('height=0');
    expect(() => draw('orientation horizontal', 'v-axis [A]', 'h-axis 0 --> 10', 'bar [0]')).toThrow('width=0');
  });

  it('value labels are bold size 10, with %.2f and an exponent', () => {
    const svg = draw('h-axis [A, B, C]', 'v-axis -10 --> 10', 'bar [1.5, 0.001, -2] labels');
    expect(svg).toContain('font-size="10"');
    expect(svg).toContain('font-weight="700"');
    expect(svg).toContain('>1.50</text>');
    expect(svg).toContain('>1.00e-03</text>');
    expect(svg).toContain('>-2</text>');
  });

  it('grouped, stacked and horizontal bars label too', () => {
    expect(draw('h-axis [A]', 'bar [1] labels', 'bar [2]')).toContain('>1</text>');
    expect(draw('h-axis [A]', 'bar [1] labels', 'bar [-2] labels', 'stackMode stacked')).toContain('>-2</text>');
    const horizontal = draw('orientation horizontal', 'v-axis [A]', 'h-axis 0 --> 10', 'bar [5] labels');
    expect(horizontal).toContain('>5</text>');
  });

  it('with no categories and no pairs nothing draws, and series past the categories stop', () => {
    expect(draw('bar [1]')).not.toContain('<rect');
    expect(draw('h-axis [A]', 'line [1, 2, 3]')).not.toContain('stroke-width:2');
    expect(draw('h-axis [A]', 'scatter [1, 2, 3]').match(/<ellipse/g)).toHaveLength(1);
    expect(draw('h-axis [A]', 'bar [1, 2, 3]').match(/<rect/g)).toHaveLength(1);
  });

  it('lines draw per segment, by index and by coordinate pairs', () => {
    expect(draw('h-axis [A, B]', 'line [0, 100] #ff0000')).toContain(line(170, 360, 370, 60, 2, '#F00'));
    expect(draw('h-axis 0 --> 10', 'line [(0, 0), (10, 100)] #ff0000')).toContain(line(70, 360, 470, 60, 2, '#F00'));
  });

  it('scatters by coordinate pairs, with labels, and the marker shapes', () => {
    const svg = draw('h-axis 0 --> 10', 'scatter [(5, 50)] labels');
    expect(svg).toContain('<ellipse cx="270" cy="210"');
    expect(svg).toContain('>50</text>');
    expect(draw('h-axis [A]', 'scatter [50] <<square>>')).toContain(
      '<rect x="266" y="206" width="8" height="8" fill="#000"',
    );
    expect(draw('h-axis [A]', 'scatter [50] <<triangle>>')).toContain(
      '<polygon points="270,206,266,214,274,214" fill="#000"',
    );
    expect(draw('h-axis [A]', 'scatter [50] labels')).toContain('>50</text>');
  });

  it('style sets the marker, and an unknown shape is ignored', () => {
    const svg = drawStyled('chartDiagram {\nscatter {\nMarkerColor #ff0000\nMarkerSize 10\nMarkerShape square\n}\n}', [
      'h-axis [A]',
      'scatter [50]',
    ]);
    expect(svg).toContain('<rect x="265" y="205" width="10" height="10" fill="#F00"');
    const unknown = drawStyled('chartDiagram {\nscatter {\nMarkerShape hexagon\nMarkerSize abc\n}\n}', [
      'h-axis [A]',
      'scatter [50]',
    ]);
    expect(unknown).toContain('<ellipse cx="270" cy="210" rx="4" ry="4"');
  });

  it('BarWidth inside (0, 1] is honoured, outside it 0.6 stands', () => {
    const source = ['h-axis [A]', 'bar [50]'];
    expect(drawStyled('chartDiagram {\nbar {\nBarWidth 0.5\n}\n}', source)).toContain('width="200"');
    expect(drawStyled('chartDiagram {\nbar {\nBarWidth 2\n}\n}', source)).toContain('width="240"');
    expect(drawStyled('chartDiagram {\nbar {\nBarWidth abc\n}\n}', source)).toContain('width="240"');
  });

  it('a stereotype reaches bar, line, area and scatter', () => {
    const css = '.hot {\nBackGroundColor #ff0000\nLineColor #00ff00\n}';
    expect(drawStyled(css, ['h-axis [A]', 'bar <<hot>> [50]'])).toContain('fill="#F00"');
    expect(drawStyled(css, ['h-axis [A, B]', 'line <<hot>> [50, 60]'])).toContain('stroke:#0F0;stroke-width:2');
    expect(drawStyled(css, ['h-axis [A, B]', 'area <<hot>> [50, 60]'])).toContain('fill="#F00"');
    expect(drawStyled(css, ['h-axis [A]', 'scatter <<hot>> [50]'])).toContain('<ellipse');
  });

  it('areas stack over unequal lengths, polygon then 2.0 top line, labels at y - 8', () => {
    const svg = draw('h-axis [A, B, C]', 'area [10, 20] #ff0000 labels', 'area [10, 10, 10] #00ff00 labels');
    expect(svg).toContain('stroke:#F00;stroke-width:1');
    expect(svg).toContain('stroke:#F00;stroke-width:2');
    expect(svg).toContain('stroke:#0F0;stroke-width:1');
    expect(svg.indexOf('#F00')).toBeLessThan(svg.indexOf('#0F0'));
    expect(svg).toContain('>20</text>');
    expect(draw('area [1]')).not.toContain('<polygon');
  });

  it('an area with a third series grows the cumulative', () => {
    const svg = draw('h-axis [A, B]', 'area [10] #ff0000', 'area [10, 10] #00ff00', 'area [10, 10] #0000ff');
    expect(svg).toContain('fill="#00F"');
  });

  it('a series on v2 reads y2 and a bar group reads its first', () => {
    const svg = draw('h-axis [A, B]', 'v2-axis 0 --> 10', 'line [0, 10] #ff0000 v2', 'area [0, 10] #00ff00 v2');
    expect(svg).toContain(line(170, 360, 370, 60, 2, '#F00'));
  });
});

describe('legend and annotations (T3c)', () => {
  it('places the right legend past y2, as rupive-64', () => {
    expect(draw(...RUPIVE)).toContain(
      '<rect x="520" y="60" width="12" height="12" fill="#3498DB" style="stroke:#3498DB;stroke-width:1;"/>',
    );
  });

  it.each([
    ['left', 2],
    ['top', 2],
    ['bottom', 2],
  ])('draws a %s legend with mixed series', (position, min) => {
    const svg = draw(
      'h-axis [A, B]',
      'bar "b" [1, 2]',
      'line "l" [1, 2]',
      'area "a" [1, 2]',
      'scatter "s" [1, 2]',
      'scatter "s2" [1, 2] <<square>>',
      'scatter "s3" [1, 2] <<triangle>>',
      `legend ${position}`,
    );
    expect(svg.match(/>s3<\/text>/g)).toHaveLength(1);
    expect(svg.match(/width="12" height="12"/g)!.length).toBeGreaterThanOrEqual(min);
  });

  it('a left or top legend moves the plot', () => {
    const [w] = dimension('h-axis [A]', 'bar "b" [1]', 'legend left');
    expect(w).toBeGreaterThan(480);
    const [, h] = dimension('h-axis [A]', 'bar "b" [1]', 'legend bottom');
    expect(h).toBeGreaterThan(410);
    expect(dimension('h-axis [A]', 'legend left')).toEqual([490, 410]);
    expect(draw('h-axis [A]', 'legend left')).not.toContain('width="12"');
  });

  it('a legend reads an explicit colour and a style colour', () => {
    const svg = draw(
      'h-axis [A]',
      'bar "b" [1] #ff0000',
      'line "l" [1] #00ff00',
      'area "a" [1] #0000ff',
      'legend right',
    );
    expect(svg).toContain('width="12" height="12" fill="#F00"');
    expect(svg).toContain('stroke:#0F0;stroke-width:2');
    expect(svg).toContain('width="12" height="12" fill="#00F"');
  });

  it('draws minapa-49 arrow and arrowless annotations', () => {
    const svg = draw(
      'h-axis [Q1, Q2, Q3, Q4, Q5]',
      'v-axis 0 --> 100',
      'bar "Sales" [45, 62, 58, 70, 83] #3498db',
      'line "Target" [50, 55, 60, 65, 70] #ff7f0e',
      'annotation "Peak sales" at (Q5, 83) <<arrow>>',
      'annotation "Target line" at (Q3, 60)',
      'legend right',
    );
    expect(svg).toContain('<polygon points="430,116,425,124,435,124" fill="#181818"');
    expect(svg).toContain(
      '<text x="236.925" y="171.889" fill="#000" font-size="14" textLength="66.15">Target line</text>',
    );
  });

  it('an annotation at an unknown label draws nothing', () => {
    expect(draw('h-axis [A]', 'annotation "gone" at (B, 5)')).not.toContain('gone');
  });

  it('a numeric x maps across the plot, an arrow near the top points up', () => {
    const numeric = draw('h-axis [A]', 'annotation "n" at (50, 50)');
    expect(numeric).toContain('>n</text>');
    const up = draw('h-axis [A]', 'annotation "n" at (A, 100) <<arrow>>');
    expect(up).toContain('<polygon points="270,65,265,73,275,73"');
  });

  it('horizontal annotations: numeric and categorical', () => {
    const svg = draw(
      'orientation horizontal',
      'v-axis [A, B]',
      'h-axis 0 --> 100',
      'annotation "c" at (A, 50)',
      'annotation "n" at (50, 25)',
    );
    expect(svg).toContain('>c</text>');
    expect(svg).toContain('>n</text>');
  });
});

/** A source with a `<style>` block, as the factory's style dispatch reads it. */
function drawStyled(style: string, lines: string[]): string {
  const ug = svgGraphic();
  parseChartLines(lines, style).drawU(ug.apply(MARGIN_TRANSLATE));
  return ug.getSvgString();
}
