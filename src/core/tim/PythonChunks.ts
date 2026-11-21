/**
 * Groups the Python lines of a body into chunks, as upstream does before the
 * legacy preprocessor looks at them.
 *
 * - A `!python` ... `!endpy` block is one chunk.
 * - A run of consecutive `!` lines of type `PYTHON` is one chunk; a text line
 *   deeper than a block such a run opened (a line ending with a colon)
 *   belongs to it.
 *
 * A chunk is one {@link StringLocated} whose text is {@link PYTHON_MARKER}
 * followed by its code, and `sources` maps it to the diagram lines it comes
 * from (upstream's `pythonSources`).
 *
 * PORT NOTE (#214). This port has no Python preprocessor, so the chunks do
 * not replace the lines the legacy preprocessor executes: `TContext` still
 * runs the body as it was. The chunks only serve the routing of `!name =
 * value` by the plantuml/plantuml#3032 fix (`TContextPython.ts`), which reads
 * which lines share a chunk, the text lines left outside every chunk, and the
 * chunk's own text where `CodeIteratorInnerComment` would rebuild it. The code
 * of a text line a block absorbs is upstream's `textToPython(text)`, a
 * `puml._text(...)` call this port does not build: such a chunk holds a line
 * that is neither an assignment nor a legacy call, which already makes the
 * diagram a Python diagram (`TContext.java:497-509`), so its text is never
 * read. The raw text stands in for it.
 *
 * Line numbers are upstream's at 908fb9df265 (the #3032 fix).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/tim/PythonChunks.java
 */
import { startsWithEscapedBang, startsWithInterpolation } from '../text/PythonLine.js';
import { StringLocated } from './StringLocated.js';
import { getFromLineWithPython, PYTHON_MARKER, type TLineTypeWithPython } from './TLineType.js';

/** Java's `\s`: `[ \t\n\x0B\f\r]`. @see PythonChunks.java:62-63 */
const START = /^[ \t\n\x0B\f\r]*!python[ \t\n\x0B\f\r]*$/u;
const END = /^[ \t\n\x0B\f\r]*!endpy[ \t\n\x0B\f\r]*$/u;

/** For each chunk, the diagram line of each of its code lines (upstream's `pythonSources`). */
export type PythonSources = Map<StringLocated, readonly StringLocated[]>;

/** A line that opened a block: its indentation, and whether it is a class statement.
 * @see PythonChunks.java:208-217 `Header` */
interface Header {
  readonly indent: number;
  readonly isClass: boolean;
}

/** The type upstream's `StringLocated.getType()` gives the line. */
export function typeWithPython(sl: StringLocated): TLineTypeWithPython {
  return getFromLineWithPython(sl.getString());
}

/**
 * Replaces the Python lines of a body by chunks.
 * @see PythonChunks.java:78-178 `collapse`
 */
export function collapse(body: readonly StringLocated[], sources: PythonSources): readonly StringLocated[] {
  // Fast path: a diagram without Python pays nothing.
  if (!body.some((sl) => sl.getString().includes('!'))) return body;

  const result: StringLocated[] = [];
  let i = 0;
  while (i < body.length) {
    const first = body[i]!;
    const s = first.getString();
    if (START.test(s)) i = pythonBlock(body, i, result, sources);
    else if (END.test(s)) {
      result.push(error(first, '!endpy without !python', sources));
      i++;
    } else if (isGutterLine(first)) i = gutterRun(body, i, result, sources);
    else {
      result.push(first);
      i++;
    }
  }
  return result;
}

/** `!python` ... `!endpy`, taken as it is. Returns the index after the block.
 * @see PythonChunks.java:94-111 */
function pythonBlock(body: readonly StringLocated[], start: number, result: StringLocated[], sources: PythonSources) {
  const first = body[start]!;
  const lines: StringLocated[] = [];
  let code = '';
  // an indented "!python" indents its block: that indentation is removed from each line
  const indent = leadingSpaces(first.getString());
  let i = start + 1;
  while (i < body.length && !END.test(body[i]!.getString())) {
    code += `${removeIndent(body[i]!.getString(), indent)}\n`;
    lines.push(body[i]!);
    i++;
  }
  if (i >= body.length) {
    result.push(error(first, '!python without !endpy', sources));
    return i;
  }
  result.push(chunk(first, code, lines, sources));
  return i + 1; // skips !endpy
}

/** A run of gutter lines, with the text lines deeper than a block it opened. Returns the index after the run.
 * @see PythonChunks.java:115-171 */
function gutterRun(body: readonly StringLocated[], start: number, result: StringLocated[], sources: PythonSources) {
  const run: GutterRun = { code: '', lines: [], headers: [] };
  let i = start;
  while (i < body.length) {
    const sl = body[i]!;
    if (isGutterLine(sl) || isIndentedGutterLine(sl)) {
      const python = gutter(sl.getString());
      addCode(run, sl, python);
      trackHeaders(run.headers, python);
      i++;
      continue;
    }
    const next = run.headers.length === 0 ? undefined : absorbedText(body, i, run);
    if (next === undefined) break;
    i = next;
  }
  result.push(chunk(body[start]!, run.code, run.lines, sources));
  return i;
}

/**
 * A text line deeper than the open block belongs to it (blank lines are
 * ignored): the index after it, or undefined when the run ends here.
 * @see PythonChunks.java:136-167
 */
function absorbedText(body: readonly StringLocated[], from: number, run: GutterRun): number | undefined {
  const j = skipBlankLines(body, from);
  if (j >= body.length) return undefined;
  const text = body[j]!.getString();
  // The gutter takes one column: a text line is Python code indented by one column less.
  const indent = leadingSpaces(text) - 1;
  if (text.charAt(0) === '\t' && !isBangLine(text)) {
    // tabs are not allowed in the indentation: the Python lexer reports it
    addCode(run, body[j]!, `\t${text.trim()}`);
    return j + 1;
  }
  popHeaders(run.headers, indent);
  if (run.headers.length === 0 || isBangLine(text)) return undefined;
  // upstream: `puml._text_in_class()` directly in a class, else `textToPython(text.trim())` (see the file header)
  if (typeWithPython(body[j]!) !== 'COMMENT_SIMPLE') addCode(run, body[j]!, `${' '.repeat(indent)}${text.trim()}`);
  return j + 1;
}

/** The chunk a gutter run builds, and the blocks it has opened. */
interface GutterRun {
  code: string;
  readonly lines: StringLocated[];
  readonly headers: Header[];
}

function skipBlankLines(body: readonly StringLocated[], from: number): number {
  let j = from;
  while (j < body.length && body[j]!.getString().trim().length === 0) j++;
  return j;
}

/** Closes the blocks opened at `indent` or deeper. */
function popHeaders(headers: Header[], indent: number): void {
  while (headers.length > 0 && headers[headers.length - 1]!.indent >= indent) headers.pop();
}

function addCode(run: GutterRun, sl: StringLocated, code: string): void {
  run.code += `${code}\n`;
  run.lines.push(sl);
}

/** Removes up to `indent` leading spaces: the indentation of the "!python" line.
 * @see PythonChunks.java:180-186 `removeIndent` */
function removeIndent(line: string, indent: number): string {
  let n = 0;
  while (n < indent && n < line.length && line.charAt(n) === ' ') n++;
  return line.substring(n);
}

/** A chunk that only reports an error on its line, when it runs: a misplaced `!python` or `!endpy`.
 * @see PythonChunks.java:188-206 `error` */
function error(at: StringLocated, message: string, sources: PythonSources): StringLocated {
  return chunk(at, `puml.error("${message}")\n`, [at], sources);
}

/** Remembers the blocks opened so far: a line that ends with a colon opens one.
 * @see PythonChunks.java:219-229 `trackHeaders` */
function trackHeaders(headers: Header[], python: string): void {
  if (python.trim().length === 0) return;
  const indent = leadingSpaces(python);
  popHeaders(headers, indent);
  if (python.trim().endsWith(':')) headers.push({ indent, isClass: python.trim().startsWith('class ') });
}

/** @see PythonChunks.java:231-236 `leadingSpaces` */
function leadingSpaces(s: string): number {
  let n = 0;
  while (n < s.length && (s.charAt(n) === ' ' || s.charAt(n) === '\t')) n++;
  return n;
}

/** A chunk built by {@link collapse}: its text starts with {@link PYTHON_MARKER}.
 * @see PythonChunks.java `isChunk` */
function isChunk(sl: StringLocated): boolean {
  return sl.getString().startsWith(PYTHON_MARKER);
}

/** A raw "!" line of type Python (a chunk is not one). @see PythonChunks.java `isGutterLine` */
function isGutterLine(sl: StringLocated): boolean {
  return !isChunk(sl) && typeWithPython(sl) === 'PYTHON';
}

/** "!    return x": inside a run, an indented line after the gutter continues the block.
 * @see PythonChunks.java `isIndentedGutterLine` */
function isIndentedGutterLine(sl: StringLocated): boolean {
  const s = sl.getString();
  if (isChunk(sl) || s.length < 2 || s.charAt(0) !== '!' || s.charAt(1) !== ' ') return false;
  return typeWithPython(sl) === 'PLAIN';
}

/**
 * A line whose first non-blank character is a `!`: a Python line or a
 * directive, which ends the text lines of a block. A line that starts with an
 * interpolation or with the escape `!!` is a text line.
 * @see PythonChunks.java:398-407 `isBangLine`
 */
function isBangLine(text: string): boolean {
  return text.trim().startsWith('!') && !startsWithInterpolation(text) && !startsWithEscapedBang(text);
}

/** Removes the one-column gutter: the text after the first `!`. @see PythonChunks.java:409-412 `gutter` */
function gutter(s: string): string {
  return s.substring(s.indexOf('!') + 1);
}

/** @see PythonChunks.java:414-420 `chunk` */
function chunk(first: StringLocated, code: string, lines: readonly StringLocated[], sources: PythonSources) {
  const result = new StringLocated(PYTHON_MARKER + code, first.getLocation());
  sources.set(result, lines);
  return result;
}
