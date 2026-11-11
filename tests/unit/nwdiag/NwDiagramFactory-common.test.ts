/**
 * `NwDiagramFactory`'s `CommonCommands.addCommonCommands1` half, the style
 * dispatch and the `ProtectedCommand` wrapper, as chart's factory test covers
 * the same copied code.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/CommonCommands.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/ProtectedCommand.java
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { NwDiagram } from '../../../src/diagrams/nwdiag/NwDiagram.js';
import { parseNwdiag } from '../../../src/diagrams/nwdiag/NwDiagramFactory.js';

const sourceOf = (lines: readonly string[], extra: Partial<UmlSource> = {}): UmlSource =>
  ({ type: 'nwdiag', lines, ...extra }) as unknown as UmlSource;

function parse(...lines: string[]): NwDiagram | ParseRefusal {
  return parseNwdiag(sourceOf(lines), new PreprocessingArtifact());
}

function diagram(...lines: string[]): NwDiagram {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${result.line}: ${result.message}`);
  return result;
}

function refusal(...lines: string[]): ParseRefusal {
  const result = parse(...lines);
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result;
}

describe('NwDiagramFactory common commands', () => {
  it.each([
    'hide empty description',
    'show private,protected fields',
    'hide stereotypes',
    'set separator ::',
    '!assume transparent dark',
    'minwidth 10',
    'rotate',
    'page 2x2',
    'page 2 3',
  ])('accepts and ignores %j', (line) => {
    expect([...diagram(line, 'network n {', 'a', '}').getServers().keys()]).toEqual(['a']);
  });

  it.each(['hide ſtereotypes', 'ſet separator ::', 'hide everything else'])('refuses %j where Java does', (line) => {
    expect(refusal(line).kind).toBe('syntax');
  });

  it('page 0x1 errors; an int overflow is a ProtectedCommand execution error, not a crash', () => {
    expect(refusal('page 0x1').message).toBe('Argument must be positive');
    const r = refusal('minwidth 2147483648');
    expect([r.kind, r.line]).toEqual(['execution', 0]);
    expect(r.message).toMatch(/^You should send a mail to plantuml@gmail\.com .* NumberFormatException/);
  });

  it('reads a sprite and a legend', () => {
    const d = diagram('sprite $s {', 'FF', 'end sprite', 'legend', 'body', 'end legend', 'a');
    expect(d.getSkinParam().getSprite('s')).not.toBeNull();
  });

  it('refusals name the document line through linePositions', () => {
    const result = parseNwdiag(sourceOf(['a -- b [x]'], { linePositions: [7] }), new PreprocessingArtifact());
    expect('refused' in result && result.line).toBe(7);
  });

  it('a style syntax error refuses with its message', () => {
    const r = parseNwdiag(
      sourceOf(['a'], { styleSource: { skinparam: new Map(), styles: ['node { { }'] } }),
      new PreprocessingArtifact(),
    );
    expect(r).toMatchObject({ refused: true, kind: 'execution', line: 0 });
    expect('refused' in r && r.message.startsWith('Error in style definition: ')).toBe(true);
  });

  it('adds the skinparam deprecation warnings', () => {
    const d = parseNwdiag(
      sourceOf(['a'], { styleSource: { skinparam: new Map([['Padding', '2']]), styles: [] } }),
      new PreprocessingArtifact(),
    ) as NwDiagram;
    expect(d.getWarnings()).toHaveLength(1);
    expect(d.getSkinParam().getValue('padding')).toBe('2');
    expect(d.isHandwritten()).toBe(false);
  });
});
