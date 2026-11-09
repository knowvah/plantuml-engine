/**
 * `WormMutation` and the two `Worm` end-point moves a rainbow arrow is drawn
 * with: each extra colour is the worm shifted sideways by one `mutation` step.
 * Points are plain `{x, y}`; upstream's `Worm` is an ordered point list.
 *
 * Upstream throws where this port returns `undefined`: a zero-length or
 * diagonal segment has no `Direction` (`utils/Direction.java:110-128`,
 * `fromVector` -> null / `IllegalArgumentException`), and a direction pair
 * missing from `getDefinition` is a `requireNonNull` NPE
 * (`WormMutation.java:127`). `Worm#addPoint` drops a repeated point
 * (`Worm.java:264-268`), so upstream never holds a zero-length segment.
 */

export interface WormPoint {
  readonly x: number;
  readonly y: number;
}

/** `klimt/UTranslate` -- only the members `WormMutation` uses. */
export interface WormTranslate {
  readonly dx: number;
  readonly dy: number;
}

/** `WormMutation.java:44-198`. */
export interface WormMutation {
  /** `WormMutation#getFirst` (`:93-95`). */
  readonly first: WormTranslate;
  /** `WormMutation#getLast` (`:89-91`). */
  readonly last: WormTranslate;
  /** `WormMutation#size` (`:97-99`). */
  readonly size: number;
  /** `WormMutation#isDxNegative` (`:186-188`). */
  readonly isDxNegative: boolean;
  /** `WormMutation#getTextTranslate` (`:178-184`), as the x shift. */
  textTranslateDx(size: number): number;
  /** `WormMutation#mute` (`:190-196`). */
  mute(original: readonly WormPoint[]): WormPoint[];
}

/** `Direction#getShortCode` over `Direction.fromVector` (`Worm.java:285-292`); `undefined` where upstream throws. */
function directionCode(p1: WormPoint, p2: WormPoint): string | undefined {
  if (p1.x === p2.x && p1.y === p2.y) return undefined;
  if (p1.x === p2.x) return p2.y > p1.y ? 'D' : 'U';
  if (p1.y === p2.y) return p2.x > p1.x ? 'R' : 'L';
  return undefined;
}

/** `Worm#getDirectionsCode` (`Worm.java:285-292`). */
export function getDirectionsCode(points: readonly WormPoint[]): string | undefined {
  let result = '';
  for (let i = 0; i < points.length - 1; i++) {
    const code = directionCode(points[i]!, points[i + 1]!);
    if (code === undefined) return undefined;
    result += code;
  }
  return result;
}

/** `WormMutation#getDefinition` (`:101-124`); `null` upstream is `undefined` here. */
const DEFINITIONS: ReadonlyMap<string, string> = new Map([
  ['D', '33'],
  ['U', '33'],
  ['L', '55'],
  ['R', '55'],
  ['RD', '123'],
  ['RU', '543'],
  ['LD', '187'],
  ['DL', '345'],
  ['DR', '765'],
  ['UL', '321'],
  ['UR', '781'],
]);

/** `WormMutation#translation` (`:133-153`). */
function translation(type: number, delta: number): WormTranslate {
  switch (type) {
    case 1:
      return { dx: 0, dy: -delta };
    case 2:
      return { dx: delta, dy: -delta };
    case 3:
      return { dx: delta, dy: 0 };
    case 4:
      return { dx: delta, dy: delta };
    case 5:
      return { dx: 0, dy: delta };
    case 6:
      return { dx: -delta, dy: delta };
    case 7:
      return { dx: -delta, dy: 0 };
    case 8:
      return { dx: -delta, dy: -delta };
    default:
      throw new Error(`WormMutation: no translation type ${type}`);
  }
}

/** `UTranslate#reverse`. */
function reverseTranslate(t: WormTranslate): WormTranslate {
  return { dx: -t.dx, dy: -t.dy };
}

/** `UTranslate#isAlmostSame` (`UTranslate.java:80-82`): `||`, not `&&`. */
function isAlmostSame(a: WormTranslate, b: WormTranslate): boolean {
  return a.dx === b.dx || a.dy === b.dy;
}

/** `WormMutation(String definition, double delta)` (`:126-131`). */
function fromDefinition(definition: string, delta: number): WormTranslate[] {
  return [...definition].map((c) => translation(Number.parseInt(c, 10), delta));
}

/** `WormMutation#createFromLongSignature` (`:61-79`). */
function fromLongSignature(signature: string, delta: number): WormTranslate[] | undefined {
  const result: WormTranslate[] = [];
  for (let i = 0; i < signature.length - 1; i++) {
    const definition = DEFINITIONS.get(signature.substring(i, i + 2));
    if (definition === undefined) return undefined;
    let tmp = fromDefinition(definition, delta);
    if (i === 0) result.push(tmp[0]!);
    else if (!isAlmostSame(result[result.length - 1]!, tmp[0]!)) tmp = tmp.map(reverseTranslate);
    result.push(tmp[1]!);
    if (i === signature.length - 2) result.push(tmp[2]!);
  }
  return result;
}

/** `WormMutation.MinMax` (`:155-176`): `max` starts at `Double.MIN_VALUE` (the smallest POSITIVE double). */
function extremeDx(translations: readonly WormTranslate[]): number {
  let min = Number.MAX_VALUE;
  let max = Number.MIN_VALUE;
  for (const { dx } of translations) {
    if (dx > max) max = dx;
    if (dx < min) min = dx;
  }
  return Math.abs(max) > Math.abs(min) ? max : min;
}

/**
 * `WormMutation#create(Worm, double)` (`:52-59`).
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/WormMutation.java
 */
export function createWormMutation(points: readonly WormPoint[], delta: number): WormMutation | undefined {
  const signature = getDirectionsCode(points);
  if (signature === undefined) return undefined;
  const definition = DEFINITIONS.get(signature);
  const translations =
    definition === undefined ? fromLongSignature(signature, delta) : fromDefinition(definition, delta);
  if (translations === undefined || translations.length < points.length) return undefined;
  return {
    first: translations[0]!,
    last: translations[translations.length - 1]!,
    size: translations.length,
    isDxNegative: translations[0]!.dx < 0,
    textTranslateDx: (size) => extremeDx(translations) * (size - 1),
    mute: (original) => original.map((p, i) => ({ x: p.x + translations[i]!.dx, y: p.y + translations[i]!.dy })),
  };
}

/**
 * `Worm#moveFirstPoint` (`Worm.java:186-213`): the first point moves by
 * `move`, and the second with it when they share the moved axis.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/Worm.java:186-213
 */
export function moveFirstPoint(points: readonly WormPoint[], move: WormTranslate): WormPoint[] {
  const { dx, dy } = move;
  if (dx !== 0 && dy !== 0) throw new Error(`Worm#moveFirstPoint: diagonal move ${dx},${dy}`);
  const [p0, p1] = [points[0]!, points[1]!];
  const x1 = dx !== 0 && p0.x === p1.x ? p1.x + dx : p1.x;
  const y1 = dy !== 0 && p0.y === p1.y ? p1.y + dy : p1.y;
  return [{ x: p0.x + dx, y: p0.y + dy }, { x: x1, y: y1 }, ...points.slice(2)];
}

/**
 * `Worm#moveLastPoint` (`Worm.java:215-242`): the mirror of {@link moveFirstPoint}.
 * @see net/sourceforge/plantuml/activitydiagram3/ftile/Worm.java:215-242
 */
export function moveLastPoint(points: readonly WormPoint[], move: WormTranslate): WormPoint[] {
  const { dx, dy } = move;
  if (dx !== 0 && dy !== 0) throw new Error(`Worm#moveLastPoint: diagonal move ${dx},${dy}`);
  const n = points.length;
  const [p8, p9] = [points[n - 2]!, points[n - 1]!];
  const x8 = dx !== 0 && p8.x === p9.x ? p8.x + dx : p8.x;
  const y8 = dy !== 0 && p8.y === p9.y ? p8.y + dy : p8.y;
  return [...points.slice(0, n - 2), { x: x8, y: y8 }, { x: p9.x + dx, y: p9.y + dy }];
}
