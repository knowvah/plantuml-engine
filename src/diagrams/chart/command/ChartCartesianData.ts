/**
 * ChartCartesianData — the data of a bar, line, area or scatter between brackets
 * (22ed6b6b822): values, optionally keyed (`[Jan: 10, Feb: 20]`), or coordinate
 * pairs for a line or a scatter (`[(1, 2), (3, 4)]`). An empty value is a missing
 * one. JSON-like data is accepted: brackets, braces or parentheses around the
 * items and around a pair, double or single quotes around values and keys.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/ChartCartesianData.java
 */
import { javaTrim } from '../../../core/java-number-format.js';
import type { ChartValue } from '../ChartSeries.js';
import { checkDelimiters, isOpening, stripDelimiters, unquote } from './ChartDataItems.js';
import * as ChartNumber from './ChartNumber.js';

/** The parsed data, or the first error. @see ChartCartesianData.java:61-66 */
export interface ChartCartesianData {
  readonly values: readonly ChartValue[];
  readonly xValues: readonly number[];
  /** One per value, `undefined` without key. */
  readonly keys: readonly (string | undefined)[];
  /** True when the items are coordinate pairs: the y are then in `values`. */
  readonly pairs: boolean;
  /** True when every value has a key. */
  readonly keyed: boolean;
  readonly error: string | undefined;
}

/** The fields `parse` fills, item after item. */
interface Builder {
  values: ChartValue[];
  xValues: number[];
  keys: (string | undefined)[];
  pairs: boolean;
  keyed: boolean;
}

/** @see ChartCartesianData.java:72-115 */
export function parseCartesianData(dataIn: string | undefined, pairsAllowed: boolean): ChartCartesianData {
  const result: Builder = { values: [], xValues: [], keys: [], pairs: false, keyed: false };
  const fail = (error: string): ChartCartesianData => ({ ...result, error });
  const mismatch = checkDelimiters(dataIn);
  if (mismatch !== undefined) return fail(mismatch);
  const data = stripDelimiters(dataIn);
  if (data === undefined || javaTrim(data) === '') return { ...result, error: undefined };

  const items = split(data, ',');
  if (items === undefined) return fail('Unbalanced quotes or brackets in data');
  for (const [i, raw] of items.entries()) {
    const error = addItem(result, i, javaTrim(raw), pairsAllowed);
    if (error !== undefined) return fail(error);
  }
  return { ...result, error: undefined };
}

/** One item: its key, then a value or a pair. @see ChartCartesianData.java:84-113 */
function addItem(result: Builder, i: number, written: string, pairsAllowed: boolean): string | undefined {
  const keyed = keyOf(written);
  if ('error' in keyed) return keyed.error;
  const { key, item } = keyed;
  if (i === 0) result.keyed = key !== undefined;
  else if ((key !== undefined) !== result.keyed) return 'Either every value has a key (key: value), or none has';
  result.keys.push(key);
  const pair = item !== '' && isOpening(item.charAt(0));
  const refused = checkPair({ pair, key, written, item }, pairsAllowed);
  if (refused !== undefined) return refused;
  if (i === 0) result.pairs = pair;
  else if (pair !== result.pairs) return 'Either every item is a coordinate pair (x, y), or none is';
  return pair ? addPair(result, item) : addValue(result, item);
}

/** The key before a `:`, and the item after it. @see ChartCartesianData.java:85-93 */
function keyOf(written: string): { key: string | undefined; item: string } | { error: string } {
  const parts = split(written, ':')!;
  if (parts.length > 2) return { error: `Too many ':' in "${written}": quote the key` };
  if (parts.length !== 2) return { key: undefined, item: written };
  const key = unquote(javaTrim(parts[0]!));
  const item = javaTrim(parts[1]!);
  if (key === '') return { error: `Empty key before the value ${item}` };
  return { key, item };
}

/** A pair takes no key, and only where pairs are allowed. @see ChartCartesianData.java:99-102 */
function checkPair(
  c: { pair: boolean; key: string | undefined; written: string; item: string },
  pairsAllowed: boolean,
): string | undefined {
  if (c.pair && c.key !== undefined) return `A coordinate pair cannot have a key: "${c.written}"`;
  if (c.pair && !pairsAllowed) return `Coordinate pairs are not allowed here: "${c.item}"`;
  return undefined;
}

/** @see ChartCartesianData.java:122-133 */
function addValue(result: Builder, item: string): string | undefined {
  const text = javaTrim(unquote(item));
  if (text === '') {
    result.values.push(undefined);
    return undefined;
  }
  const value = ChartNumber.parse(text);
  if (value === undefined) return `Invalid number "${text}"`;
  result.values.push(value);
  return undefined;
}

/** @see ChartCartesianData.java:135-149 */
function addPair(result: Builder, item: string): string | undefined {
  const mismatch = checkDelimiters(item);
  if (mismatch !== undefined) return mismatch.replace('around data', 'around a coordinate pair');
  const coords = split(stripDelimiters(item)!, ',');
  if (coords === undefined || coords.length !== 2) return `Invalid coordinate pair "${item}"`;
  const x = ChartNumber.parse(javaTrim(unquote(javaTrim(coords[0]!))));
  const y = ChartNumber.parse(javaTrim(unquote(javaTrim(coords[1]!))));
  if (x === undefined || y === undefined) return `Invalid coordinate pair "${item}"`;
  result.xValues.push(x);
  result.values.push(y);
  return undefined;
}

/** A closing bracket, brace or parenthesis. @see ChartCartesianData.java:172 */
function isClosing(c: string): boolean {
  return c === ']' || c === '}' || c === ')';
}

/** `split`'s scan: the open quote, the bracket depth, the item so far. */
interface SplitState {
  quote: string;
  depth: number;
  current: string;
}

/**
 * Splits on a separator outside quotes and nested brackets; `undefined` when
 * unbalanced.
 * @see ChartCartesianData.java:160-189
 */
function split(s: string, separator: string): string[] | undefined {
  const result: string[] = [];
  const state: SplitState = { quote: '', depth: 0, current: '' };
  for (const c of s) {
    const step = scan(state, c, separator);
    if (step === 'unbalanced') return undefined;
    if (step === 'separator') {
      result.push(state.current);
      state.current = '';
    } else state.current += c;
  }
  if (state.quote !== '' || state.depth !== 0) return undefined;
  result.push(state.current);
  return result;
}

/** One character of `split`'s loop. @see ChartCartesianData.java:166-182 */
function scan(state: SplitState, c: string, separator: string): 'append' | 'separator' | 'unbalanced' {
  if (state.quote !== '') {
    if (c === state.quote) state.quote = '';
  } else if (opensQuote(c, state.current)) state.quote = c;
  else if (isOpening(c)) state.depth++;
  else if (isClosing(c)) {
    state.depth--;
    if (state.depth < 0) return 'unbalanced';
  } else if (c === separator && state.depth === 0) return 'separator';
  return 'append';
}

/** `c == '"' || (c == '\'' && startsText(current))`. @see ChartCartesianData.java:169 */
function opensQuote(c: string, current: string): boolean {
  return c === '"' || (c === "'" && startsText(current));
}

/** A single quote opens a text only where one starts: `Driver's: 5` needs no quoting. @see ChartCartesianData.java:193-200 */
function startsText(current: string): boolean {
  const before = javaTrim(current);
  if (before === '') return true;
  const last = before.charAt(before.length - 1);
  return last === ':' || last === ',' || isOpening(last);
}
