/**
 * Tells a legacy preprocessor line from a Python line, by hand (no regex).
 * Every line given here is already known to contain a `!`; the rules are those
 * of section 6 of upstream's PYTHON_PREPROCESSOR.md.
 *
 * This port has no Python preprocessor (#214). The class is ported for the
 * routing the legacy preprocessor still does: which `!name = value` lines are
 * legacy affectations (`TLineType.java:179`), which lines upstream groups into
 * Python chunks (`TLineType.java:182-266`, `PythonChunks.java`), and which of
 * those chunks the fix proposed for plantuml/plantuml#3032 runs as legacy
 * (`TContext.java:473`). `unescapeBang` belongs to the Python interpreter's
 * text lines and is not ported.
 *
 * Line numbers are upstream's at 6524b446188 (the #3032 fix).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/text/PythonLine.java
 */
import { isJavaWhitespaceAt } from '../java-whitespace.js';
import { isLetterOrEmojiOrUnderscoreOrDigit } from '../tim/TLineType.js';

/** True for a text line that starts with the escape "!!".
 * @see PythonLine.java:66-70 `startsWithEscapedBang` */
export function startsWithEscapedBang(s: string): boolean {
  return s.startsWith('!!', skipSpaces(s, 0));
}

/**
 * "!{a} -> !{b}": a line that starts with an interpolation is PlantUML text,
 * never a directive nor a Python line.
 * @see PythonLine.java:72-80 `startsWithInterpolation`
 */
export function startsWithInterpolation(s: string): boolean {
  return s.startsWith('!{', skipSpaces(s, 0));
}

/** "!@macro": a decorator, on the line before a "!def" or a "!class".
 * @see PythonLine.java:82-86 `isDecoratorLine` */
export function isDecoratorLine(s: string): boolean {
  const i = afterBang(s);
  return i >= 0 && i < s.length && s.charAt(i) === '@';
}

/** @see PythonLine.java:88-90 */
const PYTHON_KEYWORDS: ReadonlySet<string> = new Set([
  'def',
  'for',
  'try',
  'pass',
  'lambda',
  'del',
  'raise',
  'global',
  'nonlocal',
  'elif',
  'except',
  'break',
  'continue',
  'class',
]);

/**
 * A word that only exists in Python ("!def", "!for", ...), or a word that
 * exists in both languages ("!if", "!while", "!else") on a line that ends with
 * a colon.
 * @see PythonLine.java:92-107 `isKeywordLine`
 */
export function isKeywordLine(s: string): boolean {
  const i = afterBang(s);
  if (i < 0) return false;
  const word = s.substring(i, identifierEnd(s, i));
  if (PYTHON_KEYWORDS.has(word)) return true;
  if (word === 'if' || word === 'while' || word === 'else') return endsWithColon(s);
  return false;
}

/**
 * `!$x = 1`, `!local $x = 1`, `!global x = 1` and `!x ?= 1` are legacy;
 * `!x = 1` is not (it is a Python statement upstream).
 * @see PythonLine.java:109-139 `isLegacyAffectation`
 */
export function isLegacyAffectation(s: string): boolean {
  const start = afterBang(s);
  if (start < 0) return false;
  const { at, explicitScope } = afterScope(s, start);
  const dollar = at < s.length && s.charAt(at) === '$';
  const nameStart = dollar ? at + 1 : at;
  const idEnd = identifierEnd(s, nameStart);
  if (idEnd === nameStart) return false;
  return endsAsAffectation(s, skipSpaces(s, idEnd), dollar || explicitScope);
}

/**
 * The name of "!x = 1", a name assigned without "$", or undefined for any
 * other line. Such a line is Python, but in a diagram that has no other Python
 * and uses the name in its text, it stays the legacy assignment it was before
 * Python existed (see `TContextPython.legacyLines`).
 * @see PythonLine.java:141-161 `nameAssignedWithoutDollar`
 */
export function nameAssignedWithoutDollar(s: string): string | undefined {
  const i = afterBang(s);
  if (i < 0) return undefined;
  const end = identifierEnd(s, i);
  if (end === i) return undefined;
  const equal = skipSpaces(s, end);
  if (equal >= s.length || s.charAt(equal) !== '=') return undefined;
  // "!x == 1" is a comparison
  if (equal + 1 < s.length && s.charAt(equal + 1) === '=') return undefined;
  return s.substring(i, end);
}

/**
 * The words that are never Python after "!", for {@link isStatementLine}: the
 * Python block markers, the legacy preprocessor directives and the diagram
 * commands that start with "!".
 * @see PythonLine.java:164-177
 */
const NOT_PYTHON_WORDS: ReadonlySet<string> = new Set([
  'python',
  'endpy',
  'define',
  'definelong',
  'enddefinelong',
  'undef',
  'ifdef',
  'ifndef',
  'if',
  'elseif',
  'else',
  'endif',
  'while',
  'endwhile',
  'foreach',
  'endfor',
  'function',
  'procedure',
  'unquoted',
  'final',
  'end',
  'endfunction',
  'endprocedure',
  'return',
  'include',
  'includeurl',
  'include_many',
  'include_once',
  'include_sprites',
  'includedef',
  'includesub',
  'import',
  'startsub',
  'endsub',
  'theme',
  'log',
  'dump_memory',
  'option',
  'assert',
  'local',
  'pragma',
  'assume',
  'exit',
]);

/**
 * The last rule of section 6: a "!" followed, after optional blanks, by an
 * identifier, a digit, "(" or "[" is Python. The words of
 * {@link NOT_PYTHON_WORDS} are excluded. To be tested after every legacy
 * directive.
 * @see PythonLine.java:179-198 `isStatementLine`
 */
export function isStatementLine(s: string): boolean {
  const i = afterBang(s);
  if (i < 0 || i >= s.length) return false;
  const c = s.charAt(i);
  if (c === '(' || c === '[' || (c >= '0' && c <= '9')) return true;
  if (!isIdentifierStart(c)) return false;
  return !NOT_PYTHON_WORDS.has(s.substring(i, identifierEnd(s, i)));
}

/** `local`/`global` followed by a variable name moves past the scope word. */
function afterScope(s: string, i: number): { at: number; explicitScope: boolean } {
  const end = identifierEnd(s, i);
  const word = s.substring(i, end);
  if (word !== 'local' && word !== 'global') return { at: i, explicitScope: false };
  const next = skipSpaces(s, end);
  // "!global x" alone is the Python statement, "!global x = 1" would be legacy
  if (next > end && next < s.length && (s.charAt(next) === '$' || isIdentifierStart(s.charAt(next))))
    return { at: next, explicitScope: true };
  return { at: i, explicitScope: false };
}

/** `?=` is always legacy; a plain `=` only with a '$' or an explicit scope. */
function endsAsAffectation(s: string, i: number, legacyName: boolean): boolean {
  if (i >= s.length) return false;
  if (s.charAt(i) === '?') return i + 1 < s.length && s.charAt(i + 1) === '=';
  return s.charAt(i) === '=' && legacyName;
}

/** @see PythonLine.java:200-205 `endsWithColon` */
function endsWithColon(s: string): boolean {
  let e = s.length;
  while (e > 0 && isJavaWhitespaceAt(s, e - 1)) e--;
  return e > 0 && s.charAt(e - 1) === ':';
}

/** Index of the first character after "!" (blanks before and after skipped), or -1. */
function afterBang(s: string): number {
  const i = skipSpaces(s, 0);
  if (i >= s.length || s.charAt(i) !== '!') return -1;
  return skipSpaces(s, i + 1);
}

function skipSpaces(s: string, from: number): number {
  let i = from;
  while (i < s.length && isJavaWhitespaceAt(s, i)) i++;
  return i;
}

/** `Character.isLetter(ch) || ch == '_' || Character.isSurrogate(ch)`, on one UTF-16 unit. */
function isIdentifierStart(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return /\p{L}/u.test(ch) || ch === '_' || (code >= 0xd800 && code <= 0xdfff);
}

function identifierEnd(s: string, from: number): number {
  let i = from;
  if (i >= s.length || !isIdentifierStart(s.charAt(i))) return i;
  while (i < s.length && isLetterOrEmojiOrUnderscoreOrDigit(s.charAt(i))) i++;
  return i;
}
