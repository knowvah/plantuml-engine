/**
 * ChartDataItems — the bracket, quote and item helpers the chart data parsers
 * share, and the single list item `CommandChartItem` reads (5ee1a051948). A key
 * holding a comma, a colon or a '#' must be quoted; keys and values may be quoted
 * with double or single quotes (66c9c180697). `parse` reads the bracketed data of
 * a pie or a radar: `[Nitrogen: 78, Oxygen: 21 #DC3912, "Rare gases, others": 1]`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/chart/command/ChartDataItems.java
 */
import { parseDouble } from '../../../core/java-number-format.js';
import { javaTrim } from '../../../core/java-number-format.js';
import type { HColorSet } from '../../../core/klimt/color/HColorSet.js';
import { NoSuchColorException } from '../../../core/klimt/color/NoSuchColorException.js';
import type { HColor } from '../../../core/style/Value.js';
import type { ChartSeries, ChartValue } from '../ChartSeries.js';

/**
 * The data, captured with its enclosing brackets, braces or parentheses (checked by
 * the parsers). Java's `.` excludes its five line terminators.
 * @see ChartDataItems.java:76
 */
export const BRACKETED = String.raw`([\[\{\(][^\n\r\u0085  ]*[\]\}\)])`;

/** One parsed item: its key, value and colour, or the error that refused it. */
export interface ChartDataItem {
  readonly key: string | undefined;
  readonly value: ChartValue;
  readonly color: HColor | undefined;
}

/** `parseSingle`'s outcome: Java's `ChartDataItems` with one item, or its `getError()`. */
export type ChartDataItemResult = { readonly item: ChartDataItem } | { readonly error: string };

/** The data of a pie or a radar, or the error that refused it. @see ChartDataItems.java:61-66 */
export interface ChartDataItems {
  readonly keys: readonly (string | undefined)[];
  readonly values: readonly ChartValue[];
  readonly colors: readonly (HColor | undefined)[];
  /** Every item has a key. */
  readonly keyed: boolean;
  /** An item has a colour. */
  readonly hasColor: boolean;
  readonly error: string | undefined;
}

/** `parse`'s result as it fills. */
type ItemsBuilder = { -readonly [K in Exclude<keyof ChartDataItems, 'error'>]: ChartDataItems[K] } & {
  keys: (string | undefined)[];
  values: ChartValue[];
  colors: (HColor | undefined)[];
};

/** @see ChartDataItems.java:81-105 */
export function parseDataItems(dataIn: string | undefined, colorSet: HColorSet): ChartDataItems {
  const result: ItemsBuilder = { keys: [], values: [], colors: [], keyed: false, hasColor: false };
  const fail = (error: string): ChartDataItems => ({ ...result, error });
  const mismatch = checkDelimiters(dataIn);
  if (mismatch !== undefined) return fail(mismatch);
  const data = stripDelimiters(dataIn);
  if (data === undefined || javaTrim(data) === '') return { ...result, error: undefined };

  const items = split(data, ',');
  if (items === undefined) return fail('Unbalanced quotes in data');
  for (const [i, raw] of items.entries()) {
    const error = addTo(result, i, javaTrim(raw), colorSet);
    if (error !== undefined) return fail(error);
  }
  return { ...result, error: undefined };
}

/** One item of `parse`'s loop. @see ChartDataItems.java:94-102 */
function addTo(result: ItemsBuilder, i: number, item: string, colorSet: HColorSet): string | undefined {
  const added = add(item, colorSet);
  if ('error' in added) return added.error;
  const { key, value, color } = added.item;
  result.keys.push(key);
  result.values.push(value);
  result.colors.push(color);
  if (color !== undefined) result.hasColor = true;
  if (i === 0) result.keyed = key !== undefined;
  else if ((key !== undefined) !== result.keyed) return 'Either every value has a key (key: value), or none has';
  return undefined;
}

/** Gives its keys and colours to a series built from these values. @see ChartDataItems.java:262-267 */
export function applyTo(data: ChartDataItems, series: ChartSeries): void {
  if (data.keyed) series.setKeys(data.keys as readonly string[]);
  if (data.hasColor) series.setItemColors(data.colors);
}

/**
 * A list of labels, as in `a-axis [Dev, "Ops, Run", QA]`; `undefined` when a
 * quote is not closed.
 * @see ChartDataItems.java:234-245
 */
export function parseLabels(data: string | undefined): string[] | undefined {
  if (data === undefined || javaTrim(data) === '') return [];
  const parts = split(data, ',');
  if (parts === undefined) return undefined;
  return parts.map((part) => unquote(javaTrim(part)));
}

/**
 * A single item, as written on a line of a list: it is not split on commas, so a
 * key may hold one without quotes, as in `Rare gases, others: 1`.
 * @see ChartDataItems.java:111-121
 */
export function parseSingle(item: string, colorSet: HColorSet): ChartDataItemResult {
  if (split(item, ':') === undefined) return { error: `Unbalanced quotes in: ${item}` };
  return add(javaTrim(item), colorSet);
}

/** @see ChartDataItems.java:127-165 */
function add(itemIn: string, colorSet: HColorSet): ChartDataItemResult {
  let item = itemIn;
  let key: string | undefined = undefined;
  const parts = split(item, ':')!;
  if (parts.length > 2) return { error: `Too many ':' in "${item}": quote the key` };
  if (parts.length === 2) {
    key = unquote(javaTrim(parts[0]!));
    if (key === '') return { error: `Empty key in "${item}"` };
    item = javaTrim(parts[1]!);
  }
  let color: HColor | undefined = undefined;
  const sharp = item.indexOf('#');
  if (sharp >= 0) {
    const colorName = javaTrim(item.substring(sharp));
    item = javaTrim(item.substring(0, sharp));
    try {
      color = colorSet.getColor(colorName);
    } catch (e) {
      if (!(e instanceof NoSuchColorException)) throw e;
      return { error: `Unknown color ${colorName}` };
    }
  }
  return valueOf(key, javaTrim(unquote(item)), color);
}

/** `parseFiniteDouble` on a non-empty text (efe6d85e5f3); an empty one is a missing value. @see ChartDataItems.java:153-159 */
function valueOf(key: string | undefined, text: string, color: HColor | undefined): ChartDataItemResult {
  if (text === '') return { item: { key, value: undefined, color } };
  const value = parseFiniteDouble(text);
  if (value === undefined) return { error: `Invalid number "${text}"` };
  return { item: { key, value, color } };
}

/**
 * `Double.parseDouble` that also refuses `NaN`, `Infinity` and numbers too large
 * for a double (`1e999`): none can be drawn, and an axis fitted to them never
 * ends. `undefined` for Java's `NumberFormatException` (plantuml/plantuml#3030,
 * efe6d85e5f3, mirrored ahead of a release by user ruling).
 * @see ChartDataItems.java:167-175 (efe6d85e5f3)
 */
export function parseFiniteDouble(text: string): number | undefined {
  const value = parseDouble(text);
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return value;
}

/** The error when the brackets, braces or parentheses around data do not match. @see ChartDataItems.java:168-175 */
export function checkDelimiters(data: string | undefined): string | undefined {
  if (data !== undefined && data.length >= 2 && isOpening(data.charAt(0))) {
    const close = data.charAt(data.length - 1);
    if (closing(data.charAt(0)) !== close) return `Mismatched '${data.charAt(0)}' and '${close}' around data`;
  }
  return undefined;
}

/** The data without the brackets, braces or parentheses around it. @see ChartDataItems.java:178-183 */
export function stripDelimiters(data: string | undefined): string | undefined {
  if (
    data !== undefined &&
    data.length >= 2 &&
    isOpening(data.charAt(0)) &&
    closing(data.charAt(0)) === data.charAt(data.length - 1)
  )
    return data.substring(1, data.length - 1);
  return data;
}

/** @see ChartDataItems.java:185-187 */
export function isOpening(c: string): boolean {
  return c === '[' || c === '{' || c === '(';
}

/** @see ChartDataItems.java:189-195 */
function closing(open: string): string {
  if (open === '{') return '}';
  if (open === '(') return ')';
  return ']';
}

/** @see ChartDataItems.java:197-199 */
function isQuote(c: string): boolean {
  return c === '"' || c === "'";
}

/**
 * Splits on a separator outside quotes; `undefined` when a quote is not closed. A
 * single quote only opens at the start of an item, so `Children's: 5` needs no quoting.
 * @see ChartDataItems.java:202-225
 */
function split(s: string, separator: string): string[] | undefined {
  const result: string[] = [];
  let current = '';
  let quote = '';
  for (const c of s) {
    if (quote === '' && (c === '"' || (c === "'" && javaTrim(current) === ''))) quote = c;
    else if (c === quote) quote = '';
    if (c === separator && quote === '') {
      result.push(current);
      current = '';
    } else {
      current += c;
    }
  }
  if (quote !== '') return undefined;
  result.push(current);
  return result;
}

/** @see ChartDataItems.java:227-231 */
export function unquote(s: string): string {
  if (s.length >= 2 && isQuote(s.charAt(0)) && s.charAt(s.length - 1) === s.charAt(0))
    return s.substring(1, s.length - 1);
  return s;
}
