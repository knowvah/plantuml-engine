/**
 * The arrow helpers of `StringUtils` that the cuca link commands share: `manageArrowForCuca`, `getArrowDirection`,
 * `getQueueDirection`. (Description's `link-grammar.ts` keeps its own private copy of `getQueueDirection`.)
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/StringUtils.java:245-314
 */
import { Direction } from './abel/Direction.js';

/** `Matcher#replaceFirst("-", "--")`. @see StringUtils.java:253 */
function doubleFirstDash(s: string): string {
  return s.replace('-', '--');
}

/** @see StringUtils.java:245-256 */
export function manageArrowForCuca(sIn: string): string {
  const dir = getArrowDirection(sIn);
  let s = sIn.replaceAll('=', '-');
  s = s.replaceAll(/\w*/g, '');
  if (dir === Direction.LEFT || dir === Direction.RIGHT) s = s.replaceAll(/-+/g, '-');

  if (s.length === 2 && (dir === Direction.UP || dir === Direction.DOWN)) s = doubleFirstDash(s);

  return s;
}

/** `IllegalArgumentException` upstream when `s` neither ends with `>` nor starts with `<`. @see StringUtils.java:271-282 */
export function getArrowDirection(s: string): Direction {
  if (s.endsWith('>')) return getQueueDirection(s.substring(0, s.length - 1));

  if (s.startsWith('<')) {
    if (s.length === 2) return Direction.LEFT;

    return Direction.UP;
  }
  throw new Error('IllegalArgumentException: ' + s);
}

/** @see StringUtils.java:284-317 */
export function getQueueDirection(sIn: string): Direction {
  // #lizard forgives -- faithful port of upstream's substring cascade (StringUtils.java:284-317).
  if (sIn.includes('<') || sIn.includes('>')) throw new Error('IllegalArgumentException: ' + sIn);

  const s = sIn.toLowerCase();
  if (s.includes('left')) return Direction.LEFT;
  if (s.includes('right')) return Direction.RIGHT;
  if (s.includes('up')) return Direction.UP;
  if (s.includes('down')) return Direction.DOWN;
  if (s.includes('l')) return Direction.LEFT;
  if (s.includes('r')) return Direction.RIGHT;
  if (s.includes('u')) return Direction.UP;
  if (s.includes('d')) return Direction.DOWN;
  if (s.length === 1) return Direction.RIGHT;

  return Direction.DOWN;
}
