/**
 * Builds port `Style`s from the jar-dumped storage fixtures in
 * `../fixtures/`, and reads them back into the same JSON shape for
 * comparison.
 *
 * The fixtures are dumped by `../fixtures/probe/` (reflection over
 * `StyleBuilder.storage` / `Style.map` / `ValueImpl.value`, then
 * `Idea.getStyle()` on every parsed idea): the old-engine stock jar
 * (97a5992) over the 1.2026.11beta1 oracle jar's `plantuml.skin`. Each stored style is
 * `{ snames, level, star, stereotypes, values: { PName: [value1, value2,
 * priority] } }`: `snames` in `EnumSet` (ordinal) order, `stereotypes`
 * sorted, `level` -1 for "no level" (StyleKey.java:56).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Style } from '../../../../../src/core/style/Style.js';
import { StyleSignatureBasic } from '../../../../../src/core/style/StyleSignatureBasic.js';
import { Specificity } from '../../../../../src/core/style/Specificity.js';
import { ValueImpl } from '../../../../../src/core/style/ValueImpl.js';
import { enumSetOrder } from '../../../../../src/core/style/StyleKey.js';
import { PNAMES, type PName } from '../../../../../src/core/style/PName.js';
import type { SName } from '../../../../../src/core/style/SName.js';
import type { Value } from '../../../../../src/core/style/Value.js';

/** `[value1, value2, priority]` of one `DarkString`. */
export type DumpedValue = readonly [string | null, string | null, number];

export interface DumpedStyle {
  readonly snames: readonly SName[];
  readonly level: number;
  readonly star: boolean;
  readonly stereotypes: readonly string[];
  readonly values: Readonly<Partial<Record<PName, DumpedValue>>>;
}

export interface DumpedIdea {
  readonly branch: 'regular' | 'reverse';
  readonly label: string;
  readonly level: number;
  readonly style: DumpedStyle;
}

export interface DumpedScenario {
  readonly storage: readonly DumpedStyle[];
  readonly ideas: readonly DumpedIdea[];
}

const FIXTURES = new URL('../fixtures/', import.meta.url);

function readFixture(name: string): unknown {
  return JSON.parse(readFileSync(fileURLToPath(new URL(name, FIXTURES)), 'utf8'));
}

/** The jar's storage after loading `plantuml.skin` alone (`* r` source). */
export function skinStorageDump(): readonly DumpedStyle[] {
  return readFixture('plantuml-skin-storage.json') as readonly DumpedStyle[];
}

/** Per scenario: the jar's full storage and every idea's `Idea.getStyle()`. */
export function ideaScenarioDump(name: 'depth' | 'stereo'): DumpedScenario {
  return (readFixture('mindmap-idea-styles.json') as Record<string, DumpedScenario>)[name] as DumpedScenario;
}

/**
 * The dumps hold the old engine's single-int priority (97a5992): the parse counter, +1000
 * (`DELTA_PRIORITY_FOR_STEREOTYPE`) once for any stereotype selector, and for `Idea.getStyle()`
 * a starred value's `STEP_BY_PARENT * 1000` lift (int-wrapped to 1411065408) less
 * `STEP_BY_PARENT` per ancestor. c9d62097ff5 keeps the parse order and replaces the lifts by
 * `Specificity` tiers, which order these dumped scenarios exactly as the ints did (one
 * stereotype at most per selector, shallow trees), so the int is the comparison currency: a
 * stored value's int becomes its `Specificity`, and a resolved value's `Specificity` is read
 * back to the int the old jar printed.
 */
const LEGACY_DELTA_PRIORITY_FOR_STEREOTYPE = 1000;
/** `WElement.STEP_BY_PARENT` (97a5992 WElement.java:110). */
const LEGACY_STEP_BY_PARENT = 10001000;
/** `STEP_BY_PARENT * 1000` as a Java int (97a5992 Idea.java:97). */
const LEGACY_FIRST_DELTA = Math.imul(LEGACY_STEP_BY_PARENT, 1000);
/** `Integer.MAX_VALUE`, the old forced-override priority (97a5992 Style.java:191). */
const LEGACY_FORCED = 2147483647;

/** A stored (parse-time) value's dumped int as its `Specificity`. */
function specificityFromDump(priority: number, stereotypeCount: number): Specificity {
  if (stereotypeCount === 0) return Specificity.atOrder(priority);
  return Specificity.atOrder(priority - LEGACY_DELTA_PRIORITY_FOR_STEREOTYPE).withStereotypeCount(stereotypeCount);
}

/** `Specificity#toString` ("override" | "o" | "o,stereo=c" | "o,stereo=c,ancestor=r") as the old int. */
function legacyPriority(specificity: string): number {
  if (specificity === 'override') return LEGACY_FORCED;
  const m = /^(-?\d+)(?:,stereo=(\d+))?(?:,ancestor=(-?\d+))?$/.exec(specificity);
  if (m === null) throw new Error(`not a Specificity: ${specificity}`);
  const stereo = Number(m[2] ?? '0') > 0 ? LEGACY_DELTA_PRIORITY_FOR_STEREOTYPE : 0;
  const cascade = m[3] === undefined ? 0 : (LEGACY_FIRST_DELTA + Number(m[3]) * LEGACY_STEP_BY_PARENT) | 0;
  return Number(m[1]) + stereo + cascade;
}

/** A counter that always yields `order` (feeds `ValueImpl.dark`). */
function fixedOrder(order: number): { getNextInt(): number } {
  return { getNextInt: () => order };
}

/** One `ValueImpl` holding exactly the dumped `DarkString`, under a selector of `stereotypeCount` stereotypes. */
export function valueFromDump([value1, value2, priority]: DumpedValue, stereotypeCount = 0): Value {
  const specificity = specificityFromDump(priority, stereotypeCount);
  const order = stereotypeCount === 0 ? priority : priority - LEGACY_DELTA_PRIORITY_FOR_STEREOTYPE;
  if (value1 === null) return ValueImpl.dark(value2 as string, fixedOrder(order)).withStereotypeCount(stereotypeCount);
  const regular = ValueImpl.regular(value1, specificity);
  // regular + dark combine keeping the regular specificity (DarkString.java:59-62)
  if (value2 === null) return regular;
  return regular.mergeWith(ValueImpl.dark(value2, fixedOrder(order)));
}

/** The signature a `Context.push` declaration would carry. */
export function signatureFromDump(d: Omit<DumpedStyle, 'values'>): StyleSignatureBasic {
  let sig = StyleSignatureBasic.of(...d.snames);
  if (d.level !== -1) sig = sig.addLevel(d.level);
  for (const s of d.stereotypes) sig = sig.addStereotype(s);
  if (d.star) sig = sig.addStar();
  return sig;
}

export function styleFromDump(d: DumpedStyle): Style {
  const map = new Map<PName, Value>();
  for (const name of PNAMES) {
    const v = d.values[name];
    if (v !== undefined) map.set(name, valueFromDump(v, d.stereotypes.length));
  }
  return new Style(signatureFromDump(d), map);
}

/** Reads `value.toString()` (`DarkString#toString`, "v1/v2 (specificity)") back into a tuple. */
function dumpValue(v: Value): DumpedValue {
  const m = /^(.*)\/(.*) \(([^()]+)\)$/.exec(v.toString());
  if (m === null) throw new Error(`not a DarkString: ${v.toString()}`);
  const orNull = (s: string | undefined): string | null => (s === 'null' || s === undefined ? null : s);
  return [orNull(m[1]), orNull(m[2]), legacyPriority(m[3] as string)];
}

/** The inverse of {@link styleFromDump}, for whole-style comparison. */
export function dumpStyle(style: Style): DumpedStyle {
  const key = style.getSignature().getKey();
  const values: Partial<Record<PName, DumpedValue>> = {};
  for (const name of PNAMES) if (style.hasValue(name)) values[name] = dumpValue(style.value(name));
  return {
    snames: enumSetOrder(key.snames),
    level: key.level,
    star: key.isStared,
    stereotypes: [...style.getSignature().getStereotypes()].sort(),
    values,
  };
}
