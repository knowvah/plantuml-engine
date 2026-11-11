/**
 * `WireDiagramFactory`: command order, and the jar's error kinds (wrp D5).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/wire/WireDiagramFactory.java:49-72
 */
import { describe, expect, it } from 'vitest';
import type { UmlSource } from '../../../src/core/block-extractor.js';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import { initCommandsList, parseWire } from '../../../src/diagrams/wire/WireDiagramFactory.js';
import type { WireDiagram } from '../../../src/diagrams/wire/WireDiagram.js';
import { svgOf } from './helpers.js';

const PROTECTED = /^You should send a mail to plantuml@gmail\.com with this log \(V.*\) /;

function parse(...lines: string[]): WireDiagram | ParseRefusal {
  return parseWire({ lines, type: 'wire' } as unknown as UmlSource, new PreprocessingArtifact());
}

function refusalOf(...lines: string[]): ParseRefusal {
  const result = parse(...lines);
  if (!('refused' in result)) throw new Error('expected a refusal');
  return result;
}

function diagramOf(...lines: string[]): WireDiagram {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused: ${result.message}`);
  return result;
}

function drawing(...lines: string[]): string {
  return svgOf((ug) =>
    diagramOf(...lines)
      .getTextBlock()
      .drawU(ug),
  );
}

describe('initCommandsList', () => {
  it('registers the common commands, then the seven in upstream order (java:56-65)', () => {
    expect(initCommandsList().map((c) => c.name)).toEqual([
      'CommonCommands.addCommonCommands1',
      'CommandComponent',
      'CommandSpot',
      'CommandGoto',
      'CommandMove',
      'CommandWLink',
      'CommandNewColumn',
      'CommandPrint',
    ]);
  });
});

describe('parseWire dispatch', () => {
  it('tolerates the start and end tags of a hand-built source', () => {
    expect(drawing('@startwire', '* a [10x10]', '@endwire')).toContain('width="10"');
  });

  it('keeps indentation for the wire commands: a tab nests', () => {
    // a at 10,20; b inside a at (10,20)+(10,20).
    expect(drawing('* a', '\t* b [20x20]')).toContain('<rect x="20" y="40" width="20" height="20"');
  });

  it('four spaces nest; two spaces are level 2 and throw (cov-indent-2-spaces)', () => {
    expect(drawing('* a', '    * b [20x20]')).toContain('<rect x="20" y="40"');
    const refusal = refusalOf('* a', '  * b');
    expect(refusal.kind).toBe('execution');
    expect(refusal.message).toMatch(PROTECTED);
  });

  it("'--' is a new column, not a link", () => {
    expect(drawing('* a [40x40]', '--', '* b [40x40]')).toContain('<rect x="70" y="20"');
  });

  it('-- at depth one is a new column inside the last block', () => {
    expect(drawing('* a', '\t* c [10x10]', '\t--', '\t* d [10x10]')).toContain('<rect x="50" y="40"');
  });

  it('a blank line is a nope', () => {
    expect(drawing('* a [10x10]', '', '* b [10x10]')).toContain('<rect x="10" y="50" width="10"');
  });

  it('runs print, goto, move, spot and the two link orientations', () => {
    const svg = drawing(
      '* a [100x100]',
      '* b [100x100]',
      'goto(300,300)',
      '* c [10x10]',
      'move(10,10)',
      'print("hello")',
      'spot a',
      'a -> c : h',
      'a --> b : v',
    );
    expect(svg).toContain('hello');
    expect(svg).toContain('<ellipse');
    expect(svg.match(/<line/g)).toHaveLength(2);
  });
});

describe('the jar error kinds (wrp D5)', () => {
  it('Syntax Error? for an unclaimed line', () => {
    expect(refusalOf('* a[10x10]')).toMatchObject({ kind: 'syntax', message: 'Syntax Error?' });
  });

  it.each([
    ['a -> z', '* a', 'No such element z'],
    ['z -> a', '* a', 'No such element z'],
    ['spot z', '* a', 'No such element z'],
  ])('%j is No such element', (line, first, message) => {
    expect(refusalOf(first, line)).toMatchObject({ kind: 'execution', message });
  });

  it('a nested name equal to a root name is Component exists already', () => {
    expect(refusalOf('* a', '\t* a')).toMatchObject({ kind: 'execution', message: 'Component exists already' });
  });

  it('a duplicate at the root is Component exists already', () => {
    expect(refusalOf('* a', '* a')).toMatchObject({ kind: 'execution', message: 'Component exists already' });
  });

  it.each(['* a #nosuchcolor', 'spot a #nosuchcolor', 'a -> a #nosuchcolor'])('%j is a bad colour', (line) => {
    const first = line.startsWith('*') ? [] : ['* a'];
    expect(refusalOf(...first, line).message.toLowerCase()).toContain('no such color');
  });

  it('a width past int is a protected NumberFormatException, not Infinity or a throw', () => {
    const refusal = refusalOf('* a [99999999999x5]');
    expect(refusal.kind).toBe('execution');
    expect(refusal.message).toMatch(PROTECTED);
    expect(refusal.message).toContain('NumberFormatException');
  });

  it.each([
    ['goto(1,1) at a missing level', ['\tgoto(1,1)']],
    ['move(1,1) at a missing level', ['\tmove(1,1)']],
    ['-- at a missing level', ['\t--']],
    ['print at a missing level', ['\tprint("x")']],
    ['a block at a missing level', ['* a', '\t\t* b']],
  ])('%s is a protected NullPointerException', (_name, lines) => {
    const refusal = refusalOf(...lines);
    expect(refusal.kind).toBe('execution');
    expect(refusal.message).toMatch(PROTECTED);
  });
});

describe('the common commands (CommonCommands.java:55-59)', () => {
  it('accepts title, scale, hide and pragma before the wire commands', () => {
    const diagram = diagramOf(
      'title hello',
      'scale 2',
      'hide empty description',
      '!pragma layout smetana',
      'rotate',
      '* a',
    );
    expect(diagram.scale).toEqual({ kind: 'simple', factor: 2 });
    expect(diagram.isUseSmetana()).toBe(true);
  });

  it('set namespaceSeparator acts on the diagram', () => {
    expect(diagramOf('set namespaceSeparator ::', '* a').getNamespaceSeparator()).toBe('::');
  });
});
