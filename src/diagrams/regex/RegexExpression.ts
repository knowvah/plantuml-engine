/**
 * `RegexExpression`: the regex tokenizer. `parse` walks a {@link CharInspector} one branch at a time, in Java's
 * fixed order — the order decides (`isStartAnchor` before `isEscapedChar`, `isStartPosixGroup` before `[`, the
 * octal and unicode escapes before `isStartClass`).
 *
 * Adaptation: Java's 20-branch `if` chain is the {@link BRANCHES} table (the CCN cap, rep D11); each row keeps its
 * Java line. Java's `char` 0 is the one-character string `'\0'` that `CharInspector#peek` returns. Errors: a
 * {@link RegexParsingException} for the four messages Java raises, and a plain `Error` named after the Java
 * exception for everything else (`CharInspectorImpl#jump` past the end, the unreachable `IllegalStateException`s).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/RegexExpression.java:43-431
 */
import type { CharInspector } from '../../core/utils/CharInspector.js';
import { ReToken } from './ReToken.js';
import { ReTokenType } from './ReTokenType.js';
import { RegexParsingException } from './RegexParsingException.js';

/** Java's `'\0'` / `char` 0, the end sentinel `peek` returns. */
const NUL = '\0';

/** `result.matches("^\\{[0-9,]+\\}$")`: `String#matches` is anchored. @see RegexExpression.java:263 */
const BRACED_QUANTIFIER = /^\{[0-9,]+\}$/;

/** `Character.isLetter(char)` on one UTF-16 unit (false on a lone surrogate), rep D9. */
const LETTER = /^\p{L}$/u;

/** `readUnicodeOrOctalEscape(it, 4)`: `\0` and three more. @see RegexExpression.java:92 */
const OCTAL_ESCAPE_LENGTH = 4;
/** `readUnicodeOrOctalEscape(it, 5)`: `\u` and four more. @see RegexExpression.java:95 */
const UNICODE_ESCAPE_LENGTH = 5;

/** The characters `isEscapedChar` accepts after a backslash. @see RegexExpression.java:271-273 */
const ESCAPABLE = new Set(['.', '*', '\\', '?', '^', '$', '|', '(', ')', '[', ']', '{', '}', '<', '>']);
/** The letters `isStartAnchor` accepts after a backslash. @see RegexExpression.java:408-409 */
const ANCHOR_LETTERS = new Set(['A', 'Z', 'z', 'G', 'b', 'B']);

/** One row of `parse`'s `if` chain: its test, then what it appends. */
interface Branch {
  readonly test: (it: CharInspector, current: string) => boolean;
  readonly read: (it: CharInspector, result: ReToken[], current: string) => void;
}

/** A branch that appends a token of `type` built from `read`. */
function token(
  test: (it: CharInspector, current: string) => boolean,
  type: ReTokenType,
  read: (it: CharInspector) => string,
): Branch {
  return { test, read: (it, result) => result.push(new ReToken(type, read(it))) };
}

/** A branch for a lookaround or named group: its token, then a synthetic `PARENTHESIS_OPEN[(]`. */
function opener(test: (it: CharInspector) => boolean, read: (it: CharInspector) => ReToken): Branch {
  return {
    test,
    read: (it, result) => {
      result.push(read(it));
      result.push(new ReToken(ReTokenType.PARENTHESIS_OPEN, '('));
    },
  };
}

/** A one-character token: append it and `jump`. */
function single(ch: string, type: ReTokenType): Branch {
  return {
    test: (_it, current) => current === ch,
    read: (it, result) => {
      result.push(new ReToken(type, ch));
      it.jump();
    },
  };
}

/** `parse`'s `if` chain, in Java's order. @see RegexExpression.java:52-107 */
const BRANCHES: readonly Branch[] = [
  token(isStartAnchor, ReTokenType.ANCHOR, readAnchor), // :52-54
  {
    // :55-58
    test: isEscapedChar,
    read: (it, result) => {
      result.push(new ReToken(ReTokenType.ESCAPED_CHAR, it.peek(1)));
      it.jump();
      it.jump();
    },
  },
  single('|', ReTokenType.ALTERNATIVE), // :59-61
  token(isStartPosixGroup, ReTokenType.CLASS, readGroupPosix), // :62-64
  token((_it, current) => current === '[', ReTokenType.GROUP, readGroup), // :65-67
  { test: isStartComment, read: (it) => skipComment(it) }, // :68-69
  opener(isStartLookAhead, readLookAhead), // :70-73
  opener(isStartLookBehind, readLookBehind), // :74-77
  opener(isStartNamedCapturingGroup, readNamedGroup), // :78-81
  { test: isStartOpenParenthesis, read: (it, result) => result.push(readOpenParenthesis(it)) }, // :82-84
  single(')', ReTokenType.PARENTHESIS_CLOSE), // :85-87
  token(isStartQuantifier, ReTokenType.QUANTIFIER, readQuantifier), // :88-90
  token(isStartOctalEscape, ReTokenType.CLASS, (it) => readUnicodeOrOctalEscape(it, OCTAL_ESCAPE_LENGTH)), // :91-93
  token(isStartUnicodeEscape, ReTokenType.CLASS, (it) => readUnicodeOrOctalEscape(it, UNICODE_ESCAPE_LENGTH)), // :94-96
  token(isStartUnicodeClass, ReTokenType.CLASS, readUnicodeClass), // :97-99
  token(isStartClass, ReTokenType.CLASS, readClass), // :100-102
  {
    // :103-105
    test: (_it, current) => isSimpleLetter(current),
    read: (it, result, current) => {
      result.push(new ReToken(ReTokenType.SIMPLE_CHAR, current));
      it.jump();
    },
  },
];

/** @see RegexExpression.java:45-112 */
export function parse(it: CharInspector): ReToken[] {
  const result: ReToken[] = [];
  while (true) {
    const current = it.peek(0);
    if (current === NUL) break;
    const branch = BRANCHES.find((b) => b.test(it, current));
    // `else { throw new IllegalStateException(); }`: unreachable, since `isStartClass` and `isSimpleLetter` cover
    // every character between them; kept as Java has it (rep D4). @see RegexExpression.java:106-107
    if (branch === undefined) throw new Error('IllegalStateException');
    branch.read(it, result, current);
  }
  return result;
}

/** Java's static class, for callers that read `RegexExpression.parse`. */
export const RegexExpression = { parse } as const;

/** @see RegexExpression.java:115-120 */
function isStartLookAhead(it: CharInspector): boolean {
  const current0 = it.peek(0);
  return current0 === '(' && it.peek(1) === '?' && (it.peek(2) === '=' || it.peek(2) === '!');
}

/** @see RegexExpression.java:122-127 */
function isStartLookBehind(it: CharInspector): boolean {
  const current0 = it.peek(0);
  return current0 === '(' && it.peek(1) === '?' && it.peek(2) === '<' && (it.peek(3) === '=' || it.peek(3) === '!');
}

/** @see RegexExpression.java:129-134 */
function isStartOpenParenthesis(it: CharInspector): boolean {
  return it.peek(0) === '(';
}

/** @see RegexExpression.java:136-141 */
function isStartPosixGroup(it: CharInspector): boolean {
  return it.peek(0) === '[' && it.peek(1) === '[' && it.peek(2) === ':';
}

/**
 * False without a closing `>` or on a non-letter, so `(?<abc` and `(?<>a)` fall to `readOpenParenthesis` (rep D4).
 * @see RegexExpression.java:143-159
 */
function isStartNamedCapturingGroup(it: CharInspector): boolean {
  if (it.peek(0) === '(' && it.peek(1) === '?' && it.peek(2) === '<') {
    let i = 3;
    while (it.peek(i) !== NUL) {
      if (it.peek(i) === '>' && i === 3) return false;
      if (it.peek(i) === '>') return true;
      if (!LETTER.test(it.peek(i))) return false;
      i++;
    }
  }
  return false;
}

/** @see RegexExpression.java:161-166 */
function isStartComment(it: CharInspector): boolean {
  return it.peek(0) === '(' && it.peek(1) === '?' && it.peek(2) === '#';
}

/** Java's `comment` builder is never read (rep D4); `_comment` here for the unused-variable lint. @see RegexExpression.java:168-183 */
function skipComment(it: CharInspector): void {
  it.jump();
  it.jump();
  it.jump();
  let _comment = '';
  while (true) {
    if (it.peek(0) === NUL) throw new RegexParsingException('Unclosed comment');
    if (it.peek(0) === ')') {
      it.jump();
      return;
    }
    _comment += it.peek(0);
    it.jump();
  }
}

/** @see RegexExpression.java:185-191 */
function readLookAhead(it: CharInspector): ReToken {
  it.jump();
  it.jump();
  const ch = it.peek(0);
  it.jump();
  return new ReToken(ReTokenType.LOOK_AHEAD, `?${ch}`);
}

/** @see RegexExpression.java:193-200 */
function readLookBehind(it: CharInspector): ReToken {
  it.jump();
  it.jump();
  it.jump();
  const ch = it.peek(0);
  it.jump();
  return new ReToken(ReTokenType.LOOK_BEHIND, `?<${ch}`);
}

/**
 * `Unclosed named capturing group` is unreachable from `parse`: `isStartNamedCapturingGroup` has already seen the
 * `>`; kept (rep D4). @see RegexExpression.java:202-217
 */
function readNamedGroup(it: CharInspector): ReToken {
  it.jump();
  it.jump();
  it.jump();
  let namedGroup = '';
  while (true) {
    if (it.peek(0) === NUL) throw new RegexParsingException('Unclosed named capturing group');
    if (it.peek(0) === '>') {
      it.jump();
      return new ReToken(ReTokenType.NAMED_GROUP, namedGroup);
    }
    namedGroup += it.peek(0);
    it.jump();
  }
}

/** @see RegexExpression.java:219-235 */
function readOpenParenthesis(it: CharInspector): ReToken {
  const current0 = it.peek(0);
  it.jump();
  let result = current0;
  if (it.peek(0) === '?' && it.peek(1) === ':') {
    it.jump();
    it.jump();
    result += '?:';
  }
  if (it.peek(0) === '?' && it.peek(1) === '!') {
    it.jump();
    it.jump();
    result += '?!';
  }
  return new ReToken(ReTokenType.PARENTHESIS_OPEN, result);
}

/** @see RegexExpression.java:237-242 */
function isStartQuantifier(it: CharInspector): boolean {
  const current0 = it.peek(0);
  return current0 === '*' || current0 === '+' || current0 === '?' || current0 === '{';
}

/**
 * Accepts a trailing `?`, then rejects every braced form that has one (`{2,3}?` fails the anchored test), rep D4.
 * @see RegexExpression.java:244-266
 */
function readQuantifier(it: CharInspector): string {
  const current0 = it.peek(0);
  it.jump();
  let tmp = current0;
  if (current0 === '{')
    while (it.peek(0) !== NUL) {
      const ch = it.peek(0);
      tmp += ch;
      it.jump();
      if (ch === '}') break;
    }
  if (it.peek(0) === '?') {
    tmp += '?';
    it.jump();
  }
  if (tmp.startsWith('{') && !BRACED_QUANTIFIER.test(tmp)) throw new RegexParsingException(`Bad quantifier ${tmp}`);
  return tmp;
}

/** @see RegexExpression.java:268-278 */
function isEscapedChar(it: CharInspector): boolean {
  return it.peek(0) === '\\' && ESCAPABLE.has(it.peek(1));
}

/** Two `jump`s past the closing `:`, which throw past the end (`[[:alpha:]`). @see RegexExpression.java:280-295 */
function readGroupPosix(it: CharInspector): string {
  it.jump();
  it.jump();
  it.jump();
  let result = ':';
  while (it.peek(0) !== NUL) {
    const ch = it.peek(0);
    it.jump();
    result += ch;
    if (ch === ':') break;
  }
  it.jump();
  it.jump();
  return result;
}

/** @see RegexExpression.java:297-317 */
function readGroup(it: CharInspector): string {
  const current0 = it.peek(0);
  if (current0 !== '[') throw new Error('IllegalStateException');
  it.jump();
  let result = '';
  while (it.peek(0) !== NUL) {
    let ch = it.peek(0);
    it.jump();
    if (ch === ']') break;
    result += ch;
    if (ch === '\\') {
      ch = it.peek(0);
      it.jump();
      result += ch;
    }
  }
  return result;
}

/** @see RegexExpression.java:319-334 */
function readUnicodeClass(it: CharInspector): string {
  const current0 = it.peek(0);
  if (current0 !== '\\') throw new Error('IllegalStateException');
  it.jump();
  let result = current0;
  while (it.peek(0) !== NUL) {
    const ch = it.peek(0);
    it.jump();
    result += ch;
    if (ch === '}') return result;
  }
  throw new RegexParsingException('Unexpected end of data');
}

/** @see RegexExpression.java:336-351 */
function readUnicodeOrOctalEscape(it: CharInspector, nb: number): string {
  const current0 = it.peek(0);
  if (current0 !== '\\') throw new Error('IllegalStateException');
  it.jump();
  let result = current0;
  for (let i = 0; i < nb; i++) {
    const ch = it.peek(0);
    if (ch === NUL) throw new RegexParsingException('Unexpected end of data');
    result += ch;
    it.jump();
  }
  return result;
}

/** @see RegexExpression.java:353-366 */
function readClass(it: CharInspector): string {
  const current0 = it.peek(0);
  if (current0 === '.') {
    it.jump();
    return current0;
  }
  if (current0 === '\\') {
    it.jump();
    const result = current0 + it.peek(0);
    it.jump();
    return result;
  }
  throw new Error('IllegalStateException');
}

/** @see RegexExpression.java:368-375 */
function isStartClass(it: CharInspector): boolean {
  const current0 = it.peek(0);
  return current0 === '.' || current0 === '\\';
}

/** @see RegexExpression.java:377-383 */
function isStartUnicodeClass(it: CharInspector): boolean {
  if (it.peek(0) === '\\' && it.peek(1) === 'p' && it.peek(2) === '{') return true;
  if (it.peek(0) === '\\' && it.peek(1) === 'x' && it.peek(2) === '{') return true;
  return false;
}

/** @see RegexExpression.java:385-389 */
function isStartUnicodeEscape(it: CharInspector): boolean {
  return it.peek(0) === '\\' && it.peek(1) === 'u';
}

/** @see RegexExpression.java:391-395 */
function isStartOctalEscape(it: CharInspector): boolean {
  return it.peek(0) === '\\' && it.peek(1) === '0';
}

/** @see RegexExpression.java:397-401 */
function isSimpleLetter(ch: string): boolean {
  return ch !== '\\' && ch !== '.';
}

/** @see RegexExpression.java:403-414 */
function isStartAnchor(it: CharInspector): boolean {
  const current0 = it.peek(0);
  if (current0 === '^' || current0 === '$') return true;
  return current0 === '\\' && ANCHOR_LETTERS.has(it.peek(1));
}

/** @see RegexExpression.java:416-429 */
function readAnchor(it: CharInspector): string {
  const current0 = it.peek(0);
  if (current0 === '^' || current0 === '$') {
    it.jump();
    return current0;
  }
  if (current0 === '\\') {
    it.jump();
    const result = current0 + it.peek(0);
    it.jump();
    return result;
  }
  throw new Error('IllegalStateException');
}
