/**
 * Strict unrecognised-line refusal through `PacketDiagramFactory`.
 *
 * `getCandidate` returns `null` once the common commands and the eight packet
 * commands have declined, and `executeFewLines` builds `"Syntax Error?"`
 * (`command/PSystemCommandFactory.java:169-175`). The location is the
 * offending line, and the trace counts it (`it.next()` runs before
 * `it.getTrace()`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/PacketDiagramFactory.java:75-85
 */
import { describe, expect, it } from 'vitest';
import type { ParseRefusal } from '../../../src/core/parse-refusal.js';
import { PreprocessingArtifact } from '../../../src/core/tim/PreprocessingArtifact.js';
import type { PacketDiagram } from '../../../src/diagrams/packetdiag/PacketDiagram.js';
import { parsePacket } from '../../../src/diagrams/packetdiag/PacketDiagramFactory.js';

function parse(lines: string[]): PacketDiagram | ParseRefusal {
  return parsePacket({ lines, type: 'packetdiag' }, new PreprocessingArtifact());
}

function parseRefused(lines: string[]): ParseRefusal {
  const parsed = parse(lines);
  if (!('refused' in parsed)) throw new Error('expected parsePacket to refuse this source, but it parsed');
  return parsed;
}

describe('parsePacket — strict refusal', () => {
  it('refuses a line no registered command recognises, kind syntax', () => {
    const r = parseRefused(['garbage line']);
    expect([r.kind, r.message, r.commandScore]).toEqual(['syntax', 'Syntax Error?', 0]);
  });

  it('names the 0-based offending line and counts it toward consumed', () => {
    const r = parseRefused(['0-7: A', 'garbage line', '8-15: B']);
    expect([r.line, r.consumed]).toEqual([1, 2]);
  });

  it('counts blank lines toward consumed before an unrecognised line', () => {
    const r = parseRefused(['', '', 'garbage line']);
    expect([r.line, r.consumed]).toEqual([2, 3]);
  });

  it('accepts blank lines interleaved with fields (CommandNope)', () => {
    const parsed = parse(['0-7: A', '', '8-15: B']);
    if ('refused' in parsed) throw new Error(`unexpected refusal: ${parsed.message}`);
    expect(parsed.getLastPacketEnd()).toBe(15);
  });

  it('accepts a title line (CommonCommands.addTitleCommands)', () => {
    const parsed = parse(['title T', '0-7: A']);
    if ('refused' in parsed) throw new Error(`unexpected refusal: ${parsed.message}`);
    expect(parsed.annotations.title.display).toEqual(['T']);
  });
});
