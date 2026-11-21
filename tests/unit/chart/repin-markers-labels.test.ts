/**
 * Upstream c7e65a2d642 (#2965, scatter marker colour), f4c38043a26 (#2974,
 * scatter label colour) and 692fbcce686 (line series labels).
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';

const chart = (body: string): string => `@startchart\nh-axis [Q1, Q2]\nv-axis 0 --> 100\n${body}\n@endchart`;

describe('scatter marker colour (c7e65a2d642)', () => {
  it('uses the inline colour, not black', () => {
    const svg = renderSync(chart('scatter [10, 20] #9b59b6'));
    expect(svg).toContain('fill="#9B59B6" style="stroke:#9B59B6;stroke-width:1;"');
    expect(svg).not.toContain('<ellipse cx="50" cy="0" rx="4" ry="4" fill="#000"');
  });

  it('colours the labels with the inline colour (f4c38043a26)', () => {
    const svg = renderSync(chart('scatter [10, 20] #9b59b6 labels'));
    expect(svg).toMatch(/<text [^>]*fill="#9B59B6"[^>]*font-weight="700">10<\/text>/);
  });
});

describe('line series labels (692fbcce686)', () => {
  it('draws the bold value above each point', () => {
    const svg = renderSync(chart('line [10, 20] #e74c3c labels'));
    expect(svg).toMatch(/font-size="10"[^>]*font-weight="700">10<\/text>/);
    expect(svg).toMatch(/font-size="10"[^>]*font-weight="700">20<\/text>/);
  });

  it('draws none without labels', () => {
    expect(renderSync(chart('line [10, 20] #e74c3c'))).not.toContain('font-weight="700">10<');
  });
});

describe('v-axis space measures the widest tick label (f8e62ccdc42)', () => {
  const widthOf = (svg: string): number => Number(/<svg [^>]*width="([0-9.]+)px"/.exec(svg)![1]);

  it('keeps 40 px for short labels and widens for a wide custom tick', () => {
    const base = '@startchart\nh-axis [Q1, Q2]\n';
    const narrow = renderSync(`${base}v-axis 0 --> 100\nbar [10, 20] #3498db\n@endchart`);
    const wide = renderSync(
      `${base}v-axis 0 --> 100 ticks [0:"Poor", 50:"Average", 100:"Excellent"]\nbar [10, 20] #3498db\n@endchart`,
    );
    expect(widthOf(narrow)).toBe(501);
    expect(widthOf(wide)).toBe(533);
  });
});

describe('grid lines on the ticks of their own axis (781d73f9b1f)', () => {
  const gridStyle = 'style="stroke:#181818';
  const hLines = (svg: string): number[] =>
    [...svg.matchAll(new RegExp(`<line x1="70" y1="([0-9.]+)" x2="470" y2="\\1" ${gridStyle}`, 'g'))].map((m) =>
      Number(m[1]),
    );

  it('draws a v-axis grid on the five ticks, not ten intervals', () => {
    const svg = renderSync('@startchart\nh-axis [Q1, Q2]\nv-axis 0 --> 100 grid\nbar [10, 20] #3498db\n@endchart');
    // 360 is both the x axis and the first grid line.
    expect(hLines(svg)).toEqual([360, 360, 300, 240, 180, 120, 60]);
  });

  it('draws one h-axis grid line per category, once', () => {
    const svg = renderSync('@startchart\nh-axis [Q1, Q2] grid\nv-axis 0 --> 100\nbar [10, 20] #3498db\n@endchart');
    const vLines = [...svg.matchAll(new RegExp(`<line x1="([0-9.]+)" y1="60" x2="\\1" y2="360" ${gridStyle}`, 'g'))];
    // 70 is the y axis.
    expect(vLines.map((m) => Number(m[1]))).toEqual([70, 170, 370]);
  });
});
