/**
 * The part of upstream's `PythonLine` the legacy preprocessor's routing needs
 * so far: which `!name = value` lines stay legacy affectations
 * (`TLineType.java:179`). The rest of the class (statement, keyword and
 * decorator lines, the `!!` escape) belongs to the Python preprocessor
 * (upstream 0537b558644), which is not ported yet.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/text/PythonLine.java
 */
import { isJavaWhitespaceAt } from '../java-whitespace.js';
import { isLetterOrEmojiOrUnderscoreOrDigit } from '../tim/TLineType.js';

/**
 * `!$x = 1`, `!local $x = 1`, `!global x = 1` and `!x ?= 1` are legacy;
 * `!x = 1` is not (it is a Python statement upstream).
 * @see PythonLine.java `isLegacyAffectation`
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
