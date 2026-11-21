/**
 * The part of upstream's `TContext` that decides whether a Python chunk runs
 * as Python or as before Python existed, with the fix proposed for
 * plantuml/plantuml#3032 (upstream 908fb9df265): a `!name = value` line,
 * without '$', stays the legacy assignment it was when the diagram has no
 * other Python and uses the name in its text.
 *
 * This port has no Python preprocessor (#214). The chunks are built beside
 * the body, not in its place (`PythonChunks.ts`), and only the
 * `!name = value` lines ask for the decision (`CodeIteratorAffectation`):
 *
 * - routed legacy, the line runs as upstream's `executeLegacyAffectation`
 *   (`TContext.java:562-572`, :566), with the deprecation warning;
 * - routed Python, it runs through the legacy preprocessor as before Python,
 *   without the warning, until #214 ports the interpreter.
 *
 * A `!name(...)` legacy call already runs as a plain line here, which is
 * what upstream's routing gives it when legacy (`TContext.java:363-366`).
 *
 * Line numbers are upstream's `TContext.java` at 908fb9df265.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/TContext.java
 */
import { nameAssignedWithoutDollar } from '../text/PythonLine.js';
import type { FunctionsSet } from './FunctionsSet.js';
import { collapse, typeWithPython, type PythonSources } from './PythonChunks.js';
import type { StringLocated } from './StringLocated.js';
import type { TFunctionType } from './TFunctionType.js';
import { isLetterOrEmojiOrUnderscoreOrDigit } from './TLineType.js';
import { VariableManager } from './VariableManager.js';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/TContext.java */
export class TContextPython {
  /** The bodies read so far, their Python lines collapsed: see legacyLines. @see TContext.java:407-408 `bodies` */
  private readonly bodies: (readonly StringLocated[])[] = [];

  /** For each Python chunk, the diagram line of each of its code lines. @see TContext.java:410-411 */
  private readonly pythonSources: PythonSources = new Map();

  /**
   * PORT ONLY: the chunk each diagram line belongs to. Upstream's iterators
   * hand the chunk itself to `executeOneLineNotSafe`; here the line reaches
   * `CodeIteratorAffectation` on its own, so its chunk is looked up by the
   * line's location (the iterators may rebuild the line, never relocate it).
   */
  private readonly chunkOfLine = new Map<object, StringLocated>();

  constructor(private readonly functionsSet: FunctionsSet) {}

  /**
   * Groups the Python lines of a body in chunks. The body of the diagram or of
   * an included file is kept, not the body of a legacy function or procedure,
   * which is a part of one of them.
   *
   * Upstream also collapses a function body when it runs, which changes
   * nothing: its Python lines are already chunks, and `collapse` keeps a chunk
   * as it is (PythonChunks.java:68-71). Here a function body holds the raw
   * lines again, so it is not collapsed a second time.
   *
   * @see TContext.java:209-222 `collapsePython` (:214)
   */
  collapsePython(body: readonly StringLocated[], ftype: TFunctionType | undefined): void {
    if (ftype !== undefined) return;
    const before = new Set(this.pythonSources.keys());
    this.bodies.push(collapse(body, this.pythonSources));
    for (const [chunk, lines] of this.pythonSources)
      if (!before.has(chunk)) for (const line of lines) this.chunkOfLine.set(keyOf(line), chunk);
  }

  /**
   * The line of upstream's chunk that `line` comes from, when that chunk runs
   * as before Python ({@link legacyLines}); undefined when it runs as Python.
   *
   * Upstream finds the lines of a chunk in an IdentityHashMap
   * (TContext.java:411, read at :474). `CodeIteratorInnerComment` rebuilds a chunk whose
   * text ends with an inner comment (`StringLocated.removeInnerComment`), and
   * the rebuilt chunk is not found: it runs as Python. So does it here.
   */
  legacyLineOf(line: StringLocated): StringLocated | undefined {
    const chunk = this.chunkOfLine.get(keyOf(line));
    if (chunk === undefined || chunk.removeInnerComment() !== chunk) return undefined;
    const lines = this.legacyLines(chunk);
    return lines?.find((l) => keyOf(l) === keyOf(line));
  }

  /**
   * The lines of a Python chunk when they are run as before Python existed, or
   * undefined. Every line must be one of:
   * - "!name(...)" where name is a legacy function or procedure declared in
   *   the diagram;
   * - "!name = value", without '$', when the diagram has no other Python (see
   *   {@link isPythonDiagram}) and one of the names so assigned is in a text
   *   line, where the legacy preprocessor replaces it.
   * The decision is taken when the chunk runs, because the chunk is built
   * before the legacy declarations of the file are read.
   * @see TContext.java:456-490 `legacyLines` (:473)
   */
  private legacyLines(chunk: StringLocated): readonly StringLocated[] | undefined {
    const lines = this.pythonSources.get(chunk);
    if (lines === undefined || lines.length === 0) return undefined;
    const names: string[] = [];
    for (const line of lines) {
      const name = nameAssignedWithoutDollar(line.getString());
      if (name !== undefined) names.push(name);
      else if (!this.isLegacyCall(line.getString())) return undefined;
    }
    if (names.length === 0) return lines;
    if (this.isPythonDiagram() || !this.isInText(names)) return undefined;
    return lines;
  }

  /**
   * True when the diagram, as far as it is read, uses Python for something
   * else than the lines of {@link legacyLines}: a chunk with any other line (a
   * Python statement, a !python block), or a !{expr} in a text line.
   * @see TContext.java:492-509 `isPythonDiagram` (:497)
   */
  private isPythonDiagram(): boolean {
    for (const lines of this.pythonSources.values())
      for (const line of lines)
        if (nameAssignedWithoutDollar(line.getString()) === undefined && !this.isLegacyCall(line.getString()))
          return true;
    for (const body of this.bodies)
      for (const line of body)
        if (mayContainInterpolation(line.getString()) && line.getString().includes('!{')) return true;
    return false;
  }

  /**
   * True when one of the names is a word of a text line of the diagram, as far
   * as it is read, or of a legacy call, which is read as a text line too.
   * @see TContext.java:510-524 `isInText` (:514)
   */
  private isInText(names: readonly string[]): boolean {
    for (const body of this.bodies)
      for (const line of body)
        if (typeWithPython(line) === 'PLAIN' && containsWords(line.getString(), names)) return true;
    for (const lines of this.pythonSources.values())
      for (const line of lines)
        if (this.isLegacyCall(line.getString()) && containsWords(line.getString(), names)) return true;
    return false;
  }

  /** @see TContext.java:550-560 `isLegacyCall` */
  private isLegacyCall(line: string): boolean {
    const s = line.trim();
    if (!s.startsWith('!')) return false;
    let end = 1;
    while (end < s.length && (LETTER_OR_DIGIT.test(s.charAt(end)) || s.charAt(end) === '_')) end++;
    if (end === 1 || end >= s.length || s.charAt(end) !== '(') return false;
    return this.functionsSet.doesFunctionExist(s.substring(1, end));
  }
}

/** `Character.isLetterOrDigit`, on one UTF-16 unit. */
const LETTER_OR_DIGIT = /[\p{L}\p{Nd}]/u;

/** A line's location, or the line itself when it has none. */
function keyOf(line: StringLocated): object {
  return line.getLocation() ?? line;
}

/**
 * `StringLocated.mayContainInterpolation`: the three characters `!`, `{`, `}`
 * are in the line. FoxSignature gives each of them a bit of its own
 * (FoxSignature.java:46-60), so the test is exact.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/text/StringLocated.java:278-287
 */
function mayContainInterpolation(s: string): boolean {
  return s.includes('!') && s.includes('{') && s.includes('}');
}

/** @see TContext.java:526-531 `containsWord(String, List)` */
function containsWords(s: string, words: readonly string[]): boolean {
  return words.some((word) => containsWord(s, word));
}

/**
 * "t" is a word of "is (t)" and of "a\\nt", not of "t1" or "AMS_t": where
 * VariableManager.getVarnameAt finds a variable.
 * @see TContext.java:533-548 `containsWord(String, String)` (:537)
 */
export function containsWord(s: string, word: string): boolean {
  let i = s.indexOf(word);
  while (i >= 0) {
    const end = i + word.length;
    const startsWord =
      i === 0 || !isLetterOrEmojiOrUnderscoreOrDigit(s.charAt(i - 1)) || VariableManager.justAfterBackslashN(s, i);
    if (startsWord && (end === s.length || !isLetterOrEmojiOrUnderscoreOrDigit(s.charAt(end)))) return true;
    i = s.indexOf(word, i + 1);
  }
  return false;
}
