/**
 * `CommandNumRange`: a field as `N: desc`, `A-B: desc` or `* desc`, with an
 * optional `[attributes]`. Only `len`, `rotate` and `height` are read; `color`,
 * `label`, `description` and `numbered` are parsed by `toSet` and dropped (pep D6).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/packetdiag/command/CommandNumRange.java
 */
import { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import { NwDiagram } from '../../nwdiag/NwDiagram.js';
import type { PacketDiagram } from '../PacketDiagram.js';
import { JAVA_DOT, JAVA_S, parseJavaInt, SP0 } from './packet-command-text.js';

/**
 * `^(\*|\d{1,7}(?:-\d{1,7})?)(?::)?\s+(.*?)(?:\s+\[(.*?)\])?$` in upstream's own
 * comment; the leaves are `RANGE_UNIT` before `RANGE` before `\*`, a lazy `DESC`
 * and an optional `ATTRIBUTE`.
 * @see CommandNumRange.java:76-88
 */
export const NUM_RANGE_RE = new RegExp(
  `^${SP0}` +
    String.raw`(?:(?<RANGE_UNIT>\d{1,7})(?::)?|(?<RANGE_0>\d{1,7})(?:-(?<RANGE_1>\d{1,7}))(?::)?|\*)` +
    `${JAVA_S}+(?<DESC>${JAVA_DOT}*?)` +
    `(?:${JAVA_S}*\\[(?<ATTRIBUTE>${JAVA_DOT}*?)\\])?` +
    `${SP0}$`,
  'i',
);

/** A non-integer value falls back to the default. @see CommandNumRange.java:90-98 */
function getIntAttribute(name: string, attr: ReadonlyMap<string, string>, defaultValue: number): number {
  const v = attr.get(name);
  if (v === undefined) return defaultValue;
  return parseJavaInt(v) ?? defaultValue;
}

/** @see CommandNumRange.java:100-102 */
function getLengthAttribute(attr: ReadonlyMap<string, string>): number {
  return getIntAttribute('len', attr, 1);
}

/** Read and stored, never drawn (pep D6). @see CommandNumRange.java:104-106 */
function getRotationAttribute(attr: ReadonlyMap<string, string>): number {
  return getIntAttribute('rotate', attr, 0);
}

/** @see CommandNumRange.java:108-110 */
function getHeightAttribute(attr: ReadonlyMap<string, string>): number {
  return getIntAttribute('height', attr, 1);
}

/**
 * The field's start and end bits. The digit groups are at most 7 digits, so
 * `Integer.parseInt` never throws and Java's `NumberFormatException` arms
 * (java:124-126, 131-133) are unreachable.
 * @see CommandNumRange.java:119-138
 */
function bitRange(
  system: PacketDiagram,
  groups: Record<string, string | undefined>,
  attr: ReadonlyMap<string, string>,
): [number, number] {
  const r1 = groups['RANGE_UNIT'];
  const r2 = groups['RANGE_0'];
  const r3 = groups['RANGE_1'];
  if (r1 !== undefined) {
    const start = Number(r1);
    return [start, start + getLengthAttribute(attr) - 1];
  }
  if (r2 !== undefined && r3 !== undefined) return [Number(r2), Number(r3)];
  // auto length and start position, requires diagram context
  const last = system.getLastPacketEnd();
  const start = last === undefined ? 0 : last + 1;
  return [start, start + getLengthAttribute(attr) - 1];
}

/** @see CommandNumRange.java:112-146 */
export function applyNumRange(system: PacketDiagram, match: RegExpExecArray): CommandExecutionResult {
  const groups = match.groups!;
  const desc = groups['DESC'];
  const attr = NwDiagram.toSet(groups['ATTRIBUTE']);
  const [start, end] = bitRange(system, groups, attr);
  // local height and rotation attribute for current packet block
  const height = getHeightAttribute(attr);
  const rotation = getRotationAttribute(attr);

  system.addPacketItemRange(start, end, height, desc, rotation);

  return CommandExecutionResult.ok();
}
