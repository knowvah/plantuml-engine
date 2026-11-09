/**
 * `BlocLines`: the lines one command spans, immutable (every "mutator" answers a fresh copy). Single-line
 * commands in this port take one `StringLocated` (`SingleLineCommand2.ts`); the multi-line commands
 * (`CommandMultilines2`) take this.
 *
 * Not ported, with the reason: `load(SFile | InputStream)` (file and stream IO, never reached from the
 * browser-safe library), `expandsNewline` (`StringLocated#expandsNewline`, the Jaws triple-separator split, has no
 * port), `getWithNewlines` (the `Display.getWithNewlines3` copy has no caller), `inspector` and
 * `inspectorWithNewlines` (`CharInspectorImpl` has no port). A caller that needs one ports it here.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/utils/BlocLines.java:56-413
 */
import { cleanList, type MultilinesStrategy } from '../command/MultilinesStrategy.js';
import { Display } from '../klimt/creole/Display.js';
import { BackSlash } from '../text/BackSlash.js';
import type { LineLocation } from '../tim/LineLocation.js';
import { StringLocated } from '../tim/StringLocated.js';

/** @see BlocLines.java:326-328 */
export function isSpaceOrTab(c: string): boolean {
  return c === ' ' || c === '\t';
}

/** `nbStartingSpace`. @see BlocLines.java:318-324 */
export function nbStartingSpace(s: string): number {
  let nb = 0;
  while (nb < s.length && isSpaceOrTab(s.charAt(nb))) nb++;
  return nb;
}

/** `firstColumnRemovable`. @see BlocLines.java:251-264 */
function firstColumnRemovable(data: readonly StringLocated[]): boolean {
  let allEmpty = true;
  for (const s of data) {
    if (s.getString().length === 0) continue;

    allEmpty = false;
    if (!isSpaceOrTab(s.getString().charAt(0))) return false;
  }
  return !allEmpty;
}

/** `removeStartingSpaces`. @see BlocLines.java:330-342 */
function removeStartingSpaces(arg: StringLocated, nbStarting: number): StringLocated {
  if (arg.getString().length === 0) return arg;

  let i = 0;
  while (i < nbStarting && i < arg.getString().length && isSpaceOrTab(arg.getString().charAt(i))) i++;

  if (i === 0) return arg;

  return arg.substring(i, arg.getString().length);
}

export class BlocLines implements Iterable<StringLocated> {
  private readonly lines: readonly StringLocated[];

  /** `private BlocLines(List)`; the factories below are its callers. @see BlocLines.java:120-122 */
  private constructor(lines: readonly StringLocated[]) {
    this.lines = lines;
  }

  /** `[a][b]`. @see BlocLines.java:61-69 */
  toString(): string {
    return this.lines.map((line) => '[' + line.getString() + ']').join('');
  }

  /** @see BlocLines.java:71-77 */
  asList(): readonly string[] {
    return this.lines.map((line) => line.getString());
  }

  /** @see BlocLines.java:104-106 */
  static from(lines: readonly StringLocated[]): BlocLines {
    return new BlocLines([...lines]);
  }

  /** `toDisplay`, i.e. `Display.createFoo(lines)`. @see BlocLines.java:124-128 */
  toDisplay(): Display {
    return Display.createFoo(this.lines);
  }

  /** @see BlocLines.java:130-134 */
  static single(single: StringLocated): BlocLines {
    return new BlocLines([single]);
  }

  /** @see BlocLines.java:136-140 */
  static singleString(single: string): BlocLines {
    return new BlocLines([new StringLocated(single, undefined)]);
  }

  /** @see BlocLines.java:142-148 */
  static fromArray(array: readonly string[]): BlocLines {
    return new BlocLines(array.map((s) => new StringLocated(s, undefined)));
  }

  /** @see BlocLines.java:158-160 */
  static create(): BlocLines {
    return new BlocLines([]);
  }

  /** @see BlocLines.java:162-166 */
  add(s: StringLocated): BlocLines {
    return new BlocLines([...this.lines, s]);
  }

  /** @see BlocLines.java:168-172 */
  addString(s: string): BlocLines {
    return new BlocLines([...this.lines, new StringLocated(s, undefined)]);
  }

  /** @see BlocLines.java:174-180 */
  getLinesAsStringForSprite(): string[] {
    return this.lines.map((s) => s.getString());
  }

  /** @see BlocLines.java:182-184 */
  size(): number {
    return this.lines.length;
  }

  /** `List#get(int)`: out of range throws. @see BlocLines.java:186-188 */
  getAt(i: number): StringLocated {
    const line = this.lines[i];
    if (line === undefined)
      throw new RangeError('Index ' + String(i) + ' out of bounds for length ' + String(this.lines.length));
    return line;
  }

  /** `null` is `undefined`. @see BlocLines.java:190-195 */
  getFirst(): StringLocated | undefined {
    return this.lines[0];
  }

  /** `lines.get(lines.size() - 1)`: an empty list throws. @see BlocLines.java:197-199 */
  getLast(): StringLocated {
    return this.getAt(this.lines.length - 1);
  }

  /** @see BlocLines.java:201-205 */
  cleanList(strategy: MultilinesStrategy): BlocLines {
    return new BlocLines(cleanList(strategy, this.lines));
  }

  /** @see BlocLines.java:207-214 */
  trim(): BlocLines {
    return new BlocLines(this.lines.map((s) => s.getTrimmed()));
  }

  /** @see BlocLines.java:216-223 */
  removeEmptyLines(): BlocLines {
    return new BlocLines(this.lines.filter((s) => s.getString().length !== 0));
  }

  /** @see BlocLines.java:234-248 */
  removeEmptyColumns(): BlocLines {
    if (!firstColumnRemovable(this.lines)) return this;

    let copy = [...this.lines];
    do {
      copy = copy.map((s) => (s.getString().length > 0 ? s.substring(1, s.getString().length) : s));
    } while (firstColumnRemovable(copy));
    return new BlocLines(copy);
  }

  /** `s.charAt(s.length() - 1)` on an empty last line throws. @see BlocLines.java:266-269 */
  getLastChar(): string {
    const s = this.getLast().getString();
    if (s.length === 0) throw new RangeError('index 0, length 0');
    return s.charAt(s.length - 1);
  }

  /** @see BlocLines.java:271-283 */
  removeStartingAndEnding(data: string, removeAtEnd: number): BlocLines {
    if (this.lines.length === 0) return this;

    const copy = [...this.lines];
    copy[0] = new StringLocated(data, undefined);
    const n = copy.length - 1;
    if (removeAtEnd > 0) {
      const s = copy[n]!;
      copy[n] = s.substring(0, s.getString().length - removeAtEnd);
    }
    return new BlocLines(copy);
  }

  /** @see BlocLines.java:285-294 */
  overrideLastLine(last: string): BlocLines {
    if (this.lines.length === 0) return this;

    const copy = [...this.lines];
    const n = copy.length - 1;
    copy[n] = new StringLocated(last, copy[n]!.getLocation());
    return new BlocLines(copy);
  }

  /** @see BlocLines.java:296-303 */
  toSingleLineWithHiddenNewLine(): BlocLines {
    let sb = '';
    for (const line of this.lines) sb += line.getString() + BackSlash.hiddenNewLine();
    return BlocLines.singleString(sb.substring(0, sb.length - 1));
  }

  /** @see BlocLines.java:305-316 */
  trimSmart(referenceLine: number): BlocLines {
    if (this.lines.length <= referenceLine) return this;

    const copy = [...this.lines];
    const nbStarting = nbStartingSpace(copy[referenceLine]!.getString());
    for (let i = referenceLine; i < copy.length; i++) copy[i] = removeStartingSpaces(copy[i]!, nbStarting);
    return new BlocLines(copy);
  }

  /** `copy.subList(margeStart, size - margeEnd)`. @see BlocLines.java:344-348 */
  subExtract(margeStart: number, margeEnd: number): BlocLines {
    return new BlocLines(this.lines.slice(margeStart, this.lines.length - margeEnd));
  }

  /** @see BlocLines.java:350-352 */
  subList(start: number, end: number): BlocLines {
    return new BlocLines(this.lines.slice(start, end));
  }

  /** @see BlocLines.java:354-356 */
  [Symbol.iterator](): Iterator<StringLocated> {
    return this.lines[Symbol.iterator]();
  }

  /** @see BlocLines.java:358-372 */
  eventuallyMoveBracket(): BlocLines {
    if (this.size() < 2) return this;

    const first = this.getAt(0).getTrimmed().getString();
    const second = this.getAt(1).getTrimmed().getString();
    if (!first.endsWith('{') && second === '{') {
      const vline = this.getAt(0).append(' {');
      return new BlocLines([vline, ...this.lines.slice(2)]);
    }
    return this;
  }

  /** @see BlocLines.java:374-388 */
  eventuallyMoveAllEmptyBracket(): BlocLines {
    const result: StringLocated[] = [];
    for (const line of this.lines) {
      if (line.getTrimmed().getString() === '{') {
        if (result.length > 0) {
          const pos = result.length - 1;
          result[pos] = result[pos]!.append(' {');
        }
      } else result.push(line);
    }
    return new BlocLines(result);
  }

  /** @see BlocLines.java:390-397 */
  removeFewChars(nb: number): BlocLines {
    const result: StringLocated[] = [];
    result.push(this.getAt(0).substring(nb).getTrimmed());
    result.push(...this.lines.slice(1, this.lines.length - 1));
    const last = this.getLast();
    result.push(last.substring(0, last.length() - nb).getTrimmed());
    return new BlocLines(result);
  }

  /** `null` is `undefined`. @see BlocLines.java:407-411 */
  getLocation(): LineLocation | undefined {
    if (this.lines.length === 0) return undefined;
    return this.lines[0]!.getLocation();
  }
}
