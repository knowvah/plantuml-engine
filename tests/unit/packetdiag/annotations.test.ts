/** Annotation commands reach `PacketDiagram#annotations`, not the fields. */
import { describe, expect, it } from 'vitest';
import { isEmpty } from '../../../src/core/annotations/index.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { PacketDiagram } from '../../../src/diagrams/packetdiag/PacketDiagram.js';
import { parsePacket } from '../../../src/diagrams/packetdiag/PacketDiagramFactory.js';

function parseOk(lines: string[]): PacketDiagram {
  const parsed = parsePacket({ lines, type: 'packetdiag' }, new PreprocessingArtifact());
  if ('refused' in parsed) throw new Error(`refused at line ${String(parsed.line)}: ${parsed.message}`);
  return parsed;
}

describe('parsePacket — annotation commands', () => {
  it('single-line `title X` populates annotations.title, not a field', () => {
    const diagram = parseOk(['title My Packet', '0-15: Source Port']);
    expect(diagram.annotations.title.display).toEqual(['My Packet']);
    expect(
      diagram
        .getPacketGrid()
        .flat()
        .map((b) => b.getLabel()),
    ).toEqual(['Source Port']);
  });

  it('multi-line `legend ... end legend` populates annotations.legend, not a field', () => {
    const diagram = parseOk(['0-15: Source Port', 'legend', 'a legend line', 'end legend']);
    expect(diagram.annotations.legend.display).toEqual(['a legend line']);
    expect(diagram.getPacketGrid().flat()).toHaveLength(1);
  });

  it('an annotation-free source leaves the annotations empty', () => {
    expect(isEmpty(parseOk(['0-15: Source Port']).annotations)).toBe(true);
  });
});
