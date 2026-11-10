/**
 * The regex factory's copied halves: `CommonCommands.addCommonCommands1`, the style dispatch and the
 * `ProtectedCommand` wrapper, as ebnf's `factory-common.test.ts` covers ebnf's copies.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommonCommands.java
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { StyleSignatureBasic } from '../../../src/core/style/StyleSignatureBasic.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { PSystemRegex } from '../../../src/diagrams/regex/PSystemRegex.js';
import { parseRegex } from '../../../src/diagrams/regex/PSystemRegexFactory.js';

const sourceOf = (lines: readonly string[], extra: Partial<UmlSource> = {}): UmlSource =>
  ({ type: 'unknown', lines, ...extra }) as unknown as UmlSource;

function parse(...lines: string[]): PSystemRegex | ParseRefusal {
  return parseRegex(sourceOf(lines), new PreprocessingArtifact());
}

function diagram(...lines: string[]): PSystemRegex {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${result.line}: ${result.message}`);
  return result;
}

function refusal(...lines: string[]): ParseRefusal {
  const result = parse(...lines);
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result;
}

describe('PSystemRegexFactory common commands', () => {
  it.each([
    'hide empty description',
    'show private,protected fields',
    'hide stereotypes',
    'set separator ::',
    'set separator none',
    '!assume transparent dark',
    'minwidth 10',
    'rotate',
    'page 2x2',
    '!pragma svgsize 10',
    '!pragma layout smetana',
    '!pragma layout elk',
    '!pragma compact',
    '',
  ])('takes %j, leaving only the regex on the stack', (line) => {
    expect(diagram(line, 'a').getStack()).toHaveLength(1);
  });

  it.each(['hide ſtereotypes', 'ſet separator ::', 'hide everything else'])(
    'hands %j, which no common command takes, to CommandRegexfSingleLine as regex text',
    (line) => {
      expect(diagram(line).getStack()).toHaveLength(1);
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

  it('reads a sprite and a legend', () => {
    const d = diagram('sprite $s {', 'FF', 'end sprite', 'legend', 'body', 'end legend', 'a');
    expect(d.getSkinParam().getSprite('s')).not.toBeNull();
    expect(d.sprites).toBe(d.getSkinParam().getSprites());
    expect(d.getStack()).toHaveLength(1);
  });

  it('refusals name the document line through linePositions', () => {
    const result = parseRegex(
      sourceOf(['@startregex', 'a{x}'], { linePositions: [0, 7] }),
      new PreprocessingArtifact(),
    );
    expect('refused' in result && result.line).toBe(7);
  });

  it('a <style> after the last line still reaches the builder the document reads', () => {
    const d = parseRegex(
      sourceOf(['a'], {
        linePositions: [1],
        stylePositions: [5],
        styleSource: { skinparam: new Map(), styles: ['document { BackGroundColor yellow }'] },
      }),
      new PreprocessingArtifact(),
    ) as PSystemRegex;
    const document = StyleSignatureBasic.of('root', 'document').getMergedStyle(
      d.getSkinParam().getCurrentStyleBuilder(),
    );
    expect(document?.value('BackGroundColor').asString()).toBe('yellow');
  });
});
