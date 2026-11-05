/**
 * `PacketDiagramFactory` and the eight packet commands: what each line does
 * to the diagram, and which lines the jar refuses.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/PacketDiagramFactory.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandNumRange.java
 */
import { describe, expect, it } from 'vitest';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { PacketDiagram } from '../../../src/diagrams/packetdiag/PacketDiagram.js';
import { parsePacket } from '../../../src/diagrams/packetdiag/PacketDiagramFactory.js';

function parse(...lines: string[]): PacketDiagram | ParseRefusal {
  return parsePacket({ lines, type: 'packetdiag' }, new PreprocessingArtifact());
}

function parsed(...lines: string[]): PacketDiagram {
  const result = parse(...lines);
  if ('refused' in result) throw new Error(`refused line ${String(result.line)}: ${result.message}`);
  return result;
}

function widths(diagram: PacketDiagram): number[][] {
  return diagram.getPacketGrid().map((row) => row.map((block) => block.getWidth()));
}

describe('PacketDiagramFactory', () => {
  it('accepts the packetdiag wrapper, braces and blank lines', () => {
    const diagram = parsed('packetdiag {', '', '  0-15: Source Port', '}');
    expect(widths(diagram)).toEqual([[16]]);
  });

  it('accepts a bare { and a lone } anywhere', () => {
    expect(widths(parsed('{', '0-7: A', '}', '8-15: B'))).toEqual([[8, 8]]);
  });

  it('places * fields after the last end, len wide', () => {
    const diagram = parsed('0-7: X', '* A [len = 4]');
    expect(diagram.getLastPacketEnd()).toBe(11);
  });

  it('starts * at bit 0 on an empty diagram', () => {
    expect(parsed('* A').getLastPacketEnd()).toBe(0);
  });

  it('falls back to len 1 on a non-integer len', () => {
    expect(parsed('5: Y [len=abc]').getLastPacketEnd()).toBe(5);
  });

  it('reads len on a single bit', () => {
    expect(parsed('5: Y [len=3]').getLastPacketEnd()).toBe(7);
  });

  it('accepts a single bit with no colon', () => {
    expect(parsed('5 Y').getLastPacketEnd()).toBe(5);
  });

  it('keeps a quoted attribute value, and reads height', () => {
    const diagram = parsed('0-15: A [height = 2, color="pale green"]');
    expect(diagram.getPacketGrid()[0]![0]!.getHeight()).toBe(2);
  });

  it('applies colwidth, node_height, scale_interval, scale_direction and same_height', () => {
    const diagram = parsed(
      'colwidth = 8;',
      'node_height = 40',
      'scale_interval=2',
      'scale_direction = RTL',
      'same_height = TRUE',
      '0-3: A [height=2]',
      '4-7: B',
    );
    expect(diagram.getColWidth()).toBe(8);
    expect(diagram.isUseDefaultScaleInterval()).toBe(false);
    expect(diagram.getPacketGrid()[0]!.map((b) => [b.getLabel(), b.getHeight()])).toEqual([
      ['B', 2],
      ['A', 2],
    ]);
  });

  it('refuses colwidth of four digits', () => {
    expect(parse('colwidth = 1234')).toMatchObject({ refused: true, line: 0, message: 'Syntax Error?' });
  });

  it('refuses a field with no description (R23.01-error)', () => {
    expect(parse('packetdiag {', '   foo: Source Port', '}')).toMatchObject({ refused: true, line: 1 });
  });

  it('errors on a scale_interval past int range', () => {
    expect(parse('scale_interval = 99999999999')).toMatchObject({
      refused: true,
      line: 0,
      message: 'Scale interval invalid',
    });
  });

  it('crashes on a zero-width field, as Java int % 0 does (R07.02, R11.01)', () => {
    expect(() => parse('4-3: x')).toThrow('ArithmeticException: / by zero');
    expect(() => parse('* A [len = 0]')).toThrow('ArithmeticException: / by zero');
  });

  it('runs the common commands first', () => {
    const diagram = parsed('title T', 'scale 2', '0-15: A');
    expect(diagram.scale).toBeDefined();
    expect(diagram.annotations.title).toBeDefined();
  });
});
