/**
 * The timing factory's copied halves: `CommonCommands.addCommonCommands1`, the style dispatch and the
 * `ProtectedCommand` wrapper, as regex's `factory-common.test.ts` covers regex's copies (every engine keeps its
 * own, tep D2).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommonCommands.java
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PragmaKey } from '../../../src/core/skin/PragmaKey.js';
import { StyleSignatureBasic } from '../../../src/core/style/StyleSignatureBasic.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { TimingDiagram } from '../../../src/diagrams/timing/TimingDiagram.js';
import { parseTiming } from '../../../src/diagrams/timing/TimingDiagramFactory.js';
import { positionOf } from '../../../src/diagrams/timing/timing-style-dispatch.js';

const sourceOf = (lines: readonly string[], extra: Partial<UmlSource> = {}): UmlSource =>
  ({ type: 'unknown', lines, ...extra }) as unknown as UmlSource;

function parse(...lines: string[]): TimingDiagram | ParseRefusal {
  return parseTiming(sourceOf(lines), new PreprocessingArtifact());
}

function diagram(...lines: string[]): TimingDiagram {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${result.line}: ${result.message}`);
  return result;
}

function refusal(...lines: string[]): ParseRefusal {
  const result = parse(...lines);
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result;
}

describe('TimingDiagramFactory common commands', () => {
  it.each([
    'hide empty description',
    'show private,protected fields',
    'hide stereotypes',
    'set separator ::',
    'set separator none',
    'set namespaceseparator null',
    '!assume transparent dark',
    'minwidth 10',
    'rotate',
    'page 2x2',
    '!pragma svgsize 10',
    '!pragma layout smetana',
    '!pragma layout elk',
    '!pragma compact',
    '',
  ])('takes %j: the diagram has no player', (line) => {
    expect(diagram(line, 'concise "C" as C').getPlayer('C')).toBeDefined();
  });

  it('`set separator` and `!pragma layout` act on the TitledDiagram', () => {
    expect(diagram('set separator ::').getNamespaceSeparator()).toBe('::');
    expect(diagram('set separator none').getNamespaceSeparator()).toBeUndefined();
    expect([diagram('!pragma layout smetana').isUseSmetana(), diagram('!pragma layout elk').isUseElk()]).toEqual([
      true,
      true,
    ]);
    expect(diagram('!pragma compact on').getPragma().getValue(PragmaKey.COMPACT)).toBe('on');
  });

  it.each(['hide ſtereotypes', 'ſet separator ::'])(
    'hands %j, which no common command takes, on: a syntax error',
    (line) => {
      expect(refusal(line).message).toBe('Syntax Error?');
    },
  );

  it('page 0x1 and the renamed graphviz_dot pragma error; an int overflow is a ProtectedCommand error', () => {
    expect(refusal('page 0x1').message).toBe('Argument must be positive');
    expect(refusal('!pragma graphviz_dot jdot').message).toBe(
      "This directive has been renamed to '!pragma layout smetana'. Please update your diagram.",
    );
    expect(refusal('!pragma graphviz_dot smetana').message).toBe(
      "This directive has been renamed to '!pragma layout smetana'. Please update your diagram.",
    );
    const r = refusal('minwidth 2147483648');
    expect([r.kind, r.line]).toEqual(['execution', 0]);
    expect(r.message).toMatch(/^You should send a mail to plantuml@gmail\.com .* NumberFormatException/);
  });

  it('reads a sprite, a legend, a title and a scale', () => {
    const d = diagram('sprite $s {', 'FF', 'end sprite', 'title T', 'scale 2', 'legend', 'body', 'end legend');
    expect(d.getSkinParam().getSprite('s')).not.toBeNull();
    expect(d.sprites).toBe(d.getSkinParam().getSprites());
    expect(d.scale).toEqual({ kind: 'simple', factor: 2 });
    expect(d.annotations.legend.display).toBeDefined();
  });

  it('`scale 100 as 50 pixels` is not a scale command: it reaches CommandScalePixel and leaves `scale` unset', () => {
    const d = diagram('scale 100 as 50 pixels');
    expect(d.scale).toBeUndefined();
  });

  it('refusals name the document line through linePositions', () => {
    const result = parseTiming(sourceOf(['@startuml', '???'], { linePositions: [0, 7] }), new PreprocessingArtifact());
    expect('refused' in result && result.line).toBe(7);
  });

  it('a <style> after the last line still reaches the builder the document reads', () => {
    const d = parseTiming(
      sourceOf(['concise "C" as C'], {
        linePositions: [1],
        stylePositions: [5],
        styleSource: { skinparam: new Map(), styles: ['document { BackGroundColor yellow }'] },
      }),
      new PreprocessingArtifact(),
    ) as TimingDiagram;
    const document = StyleSignatureBasic.of('root', 'document').getMergedStyle(
      d.getSkinParam().getCurrentStyleBuilder(),
    );
    expect(document?.value('BackGroundColor').asString()).toBe('yellow');
  });

  it('a rejected <style> block is an execution error at line 0', () => {
    const result = parseTiming(
      sourceOf(['concise "C" as C'], {
        linePositions: [1],
        stylePositions: [0],
        styleSource: { skinparam: new Map(), styles: ['node { { }'] },
      }),
      new PreprocessingArtifact(),
    );
    expect('refused' in result && [result.kind, result.line]).toEqual(['execution', 0]);
  });

  it('the skinparam deprecation warnings are added in source order', () => {
    const d = parseTiming(
      sourceOf(['concise "C" as C'], {
        styleSource: {
          skinparam: new Map([
            ['Handwritten', 'true'],
            ['padding', '2'],
            ['other', '1'],
          ]),
          styles: [],
        },
      }),
      new PreprocessingArtifact(),
    ) as TimingDiagram;
    expect(d.getWarnings().map((w) => w.getMessage()[0])).toEqual([
      "Please use '!option handwritten true' to enable handwritten ",
      'Please use CSS style instead of skinparam padding',
    ]);
  });
});

describe('timing-style-dispatch positionOf', () => {
  it('a hand-built source (no linePositions) reads as every declaration before its first line', () => {
    expect(positionOf(sourceOf(['a']), 0)).toBe(Number.POSITIVE_INFINITY);
  });

  it('a line the preprocessor dropped from the map is before every declaration', () => {
    expect(positionOf(sourceOf(['a'], { linePositions: [] }), 0)).toBe(-1);
  });

  it('a mapped line is its document position', () => {
    expect(positionOf(sourceOf(['a'], { linePositions: [4] }), 0)).toBe(4);
  });
});
