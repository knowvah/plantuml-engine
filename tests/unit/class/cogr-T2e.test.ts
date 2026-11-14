/**
 * cogr T2e: `skinparam svgDimensionStyle false` on class. `TextBlockExporter.java:308` hands the skinparam to
 * `SvgOption.withSvgDimensionStyle` (`SkinParam.java:1196`), and `SvgGraphics.java:808-811` then writes the root's
 * `style`, `width` and `height` only when it is true; the `viewBox`, `zoomAndPan`, `preserveAspectRatio` and
 * `contentStyleType` stay. Oracle: `test-results/dot-cache/class/bofebi-14-gano257/in.svg`.
 */
import { describe, it, expect } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';

function rootOf(lines: readonly string[]): string {
  const svg = renderSync(['@startuml', ...lines, '@enduml'].join('\n'), { measurer: new DeterministicMeasurer() });
  return /^<svg[^>]*>/.exec(svg)![0];
}

const BODY = ['component a {', '}', 'component b {', '}', 'a -(0- b'];

describe('skinparam svgDimensionStyle on class (cogr T2e)', () => {
  it('drops style, width and height from the root when false', () => {
    const root = rootOf(['skinparam svgDimensionStyle false', ...BODY]);
    expect(root).not.toMatch(/ style="/);
    expect(root).not.toMatch(/ width="/);
    expect(root).not.toMatch(/ height="/);
    expect(root).toMatch(/ viewBox="0 0 68 169" zoomAndPan="magnify" preserveAspectRatio="none" contentStyleType/);
  });

  it('keeps them without the skinparam', () => {
    const root = rootOf(BODY);
    expect(root).toMatch(/ style="width:68px;height:169px;background:#FFFFFF;"/);
    expect(root).toContain(' width="68px" height="169px"');
  });
});
