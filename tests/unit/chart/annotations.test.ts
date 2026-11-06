/**
 * The common title commands beside the chart's own `legend <position>`.
 * `CommandChartLegend` registers before `CommandMultilinesLegend` and
 * `CommandLegend`, so `legend right` is never chrome text.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagramFactory.java:65-79
 */
import { describe, it, expect } from 'vitest';
import { isEmpty } from '../../../src/core/annotations/index.js';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { parseChartAst } from './parse-chart-ast.js';

function src(lines: string[]): UmlSource {
  return { lines, type: 'chart' };
}

describe('parseChart: the common annotation commands', () => {
  it('a single-line title reaches annotations.title', () => {
    const d = parseChartAst(src(['title My Chart', 'bar "sales" [10, 20]']));
    expect(d.annotations.title.display).toEqual(['My Chart']);
    expect(d.getSeries()).toHaveLength(1);
  });

  it('legend right is the chart position, not chrome text', () => {
    const d = parseChartAst(src(['legend right', 'bar "sales" [10, 20]']));
    expect(d.getLegendPosition()).toBe('RIGHT');
    expect(isEmpty(d.annotations)).toBe(true);
  });

  it('a multi-line legend block is chrome, and leaves the position NONE', () => {
    const d = parseChartAst(src(['bar "sales" [10, 20]', 'legend', 'a legend line', 'end legend']));
    expect(d.annotations.legend.display).toEqual(['a legend line']);
    expect(d.getLegendPosition()).toBe('NONE');
    expect(d.getSeries()).toHaveLength(1);
  });

  it('a single-line caption is chrome', () => {
    const d = parseChartAst(src(['caption a caption', 'bar "sales" [10, 20]']));
    expect(d.annotations.caption.display).toEqual(['a caption']);
    expect(d.getSeries()).toHaveLength(1);
  });

  it('a source with no chrome has empty annotations', () => {
    expect(isEmpty(parseChartAst(src(['bar "sales" [10, 20]'])).annotations)).toBe(true);
  });
});
