/**
 * `ChartDiagramFactory`: registration order, the common commands after the chart
 * ones, and the refusals the jar's planning probes showed.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/ChartDiagramFactory.java
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import { isDisplayPositionedNull, isEmpty } from '../../../src/core/annotations/index.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { parseChart } from '../../../src/diagrams/chart/ChartDiagramFactory.js';
import type { ChartDiagram } from '../../../src/diagrams/chart/ChartDiagram.js';

const sourceOf = (lines: readonly string[], extra: Partial<UmlSource> = {}): UmlSource =>
  ({ type: 'chart', lines, ...extra }) as unknown as UmlSource;

function parse(...lines: string[]): ChartDiagram | ParseRefusal {
  return parseChart(sourceOf(lines), new PreprocessingArtifact());
}

function diagram(...lines: string[]): ChartDiagram {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${result.line}: ${result.message}`);
  return result;
}

function refusal(...lines: string[]): ParseRefusal {
  const result = parse(...lines);
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result;
}

describe('parseChart', () => {
  it('grid v-axis is a syntax refusal at that line, as the planning probe', () => {
    const r = refusal('h-axis [A]', 'grid v-axis');
    expect([r.kind, r.line, r.message]).toEqual(['syntax', 1, 'Syntax Error?']);
  });

  it('bar v2 is a syntax refusal', () => {
    expect(refusal('bar [1,2] v2').kind).toBe('syntax');
  });

  it('an execution error carries the message', () => {
    const r = refusal('bar [x]');
    expect([r.kind, r.message]).toEqual(['execution', 'Invalid number format in bar data']);
  });

  it('accepts rotate, page and scale, and sets scale', () => {
    const d = diagram('rotate', 'page 2x2', 'page 2 3', 'scale 2', 'bar [1]');
    expect(d.scale).toBeDefined();
    expect(d.getSeries()).toHaveLength(1);
  });

  it('page 0x1 errors, and a page past int crashes', () => {
    expect(refusal('page 0x1').message).toBe('Argument must be positive');
    expect(refusal('page 1x0').message).toBe('Argument must be positive');
    expect(() => parse('page 2147483648x1')).toThrow(/NumberFormatException/);
    expect(() => parse('minwidth 2147483648')).toThrow(/NumberFormatException/);
  });

  it('legend positions are the chart command, and leave the chrome legend alone', () => {
    const d = diagram('legend right', 'legend bottom');
    expect(d.getLegendPosition()).toBe('BOTTOM');
    expect(isDisplayPositionedNull(d.annotations.legend)).toBe(true);
    expect(isEmpty(d.annotations)).toBe(true);
  });

  it('a bare legend opener reaches the common multiline command', () => {
    const d = diagram('legend', 'body', 'end legend', 'legend right');
    expect(isDisplayPositionedNull(d.annotations.legend)).toBe(false);
    expect(d.getLegendPosition()).toBe('RIGHT');
  });

  it('title reaches the chrome annotations', () => {
    const d = diagram('title T', 'h-axis [A]');
    expect(isDisplayPositionedNull(d.annotations.title)).toBe(false);
    expect(d.getXAxisLabels()).toEqual(['A']);
  });

  it.each([
    'hide empty description',
    'show empty description',
    'hide public members',
    'show private,protected fields',
    'hide members',
    'hide stereotypes',
    'hide class circle',
    'show "x y" empty methods',
    'hide <<foo>> fields',
    'set separator ::',
    '!assume transparent dark',
    'minwidth 10',
    '   ',
  ])('accepts and ignores %j', (line) => {
    const d = diagram(line, 'bar [1]');
    expect(d.getSeries()).toHaveLength(1);
  });

  it.each(['hide ſtereotypes', 'ſet separator ::', 'hide everything else', 'nonsense'])(
    'refuses %j where Java does',
    (line) => {
      expect(refusal(line).kind).toBe('syntax');
    },
  );

  it('tolerates start and end lines in a hand-built source', () => {
    expect(diagram('@startchart', 'bar [1]', '@endchart').getSeries()).toHaveLength(1);
  });

  it('reads a sprite', () => {
    const d = diagram('sprite $s {', 'FF', 'end sprite', 'sprite $t [2x1/4] {', '00', '}');
    expect(d.getSkinParam().getSprite('t')).not.toBeNull();
  });

  it('refusals name the document line through linePositions', () => {
    const result = parseChart(sourceOf(['nonsense'], { linePositions: [7] }), new PreprocessingArtifact());
    expect('refused' in result && result.line).toBe(7);
  });

  it('a style syntax error refuses with its message', () => {
    const r = parseChart(
      sourceOf(['bar [1]'], { styleSource: { skinparam: new Map(), styles: ['node { { }'] } }),
      new PreprocessingArtifact(),
    );
    expect(r).toMatchObject({ refused: true, kind: 'execution', line: 0 });
    expect('refused' in r && r.message.startsWith('Error in style definition: ')).toBe(true);
  });

  it('adds the skinparam deprecation warnings', () => {
    const r = parseChart(
      sourceOf(['bar [1]'], { styleSource: { skinparam: new Map([['Padding', '2']]), styles: [] } }),
      new PreprocessingArtifact(),
    );
    if ('refused' in r) throw new Error('refused');
    expect(r.getWarnings()).toHaveLength(1);
  });
});
