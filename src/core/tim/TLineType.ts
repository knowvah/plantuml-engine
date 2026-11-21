/**
 * The `TLineType` CLASSIFIER -- the regex cascade that decides which TIM
 * directive (if any) a raw source line is.
 *
 * `StringLocated.ts` (batch SI5a-2a) declared the `TLineType` *value space*
 * only, explicitly deferring the ~250-line classifier ("Value space only --
 * NOT the classifier"). `TContext#executeOneLineNotSafe` and every
 * `CodeIterator*` in the chain dispatch on `StringLocated#getType()`, so the
 * classifier is a hard prerequisite of batch 4 and is ported here.
 *
 * Signature divergence (deliberate): upstream's `getFromLineInternal` takes a
 * `StringLocated` and calls `getString()` / `containsExclamationMark()` on it.
 * Taking the raw string instead keeps the module dependency one-directional
 * (`StringLocated.ts` -> `TLineType.ts`), avoiding a runtime import cycle that
 * upstream's JVM classloader tolerates but ESM does not. Both members it used
 * are derivable from that string, so nothing is lost.
 *
 * Unicode divergence (deliberate): upstream's identifier pattern spells "any
 * astral character" as the two UTF-16 surrogate ranges
 * (high then low UTF-16 surrogate ranges), because Java regexes match code
 * units. JS regexes with the `u` flag match CODE POINTS, so the same set is
 * spelled `\u{10000}-\u{10FFFF}` here -- the identical character set, not a
 * widening.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/text/TLineType.java
 */

import type { TLineType } from './StringLocated.js';
import {
  isDecoratorLine,
  isKeywordLine,
  isLegacyAffectation,
  isStatementLine,
  startsWithInterpolation,
} from '../text/PythonLine.js';

/** `Pattern2`'s `%s` macro: normal or non-breaking space.
 * @see ~/git/plantuml/.../regex/Pattern2.java */
const SPACE_CLASS = '[\\s\\u00A0]';

/** @see ~/git/plantuml/.../text/TLineType.java#IDENTIFIER_WITH_UNICODE_SURROGATES_SUPPORT */
const IDENTIFIER = '[\\p{L}\\u{10000}-\\u{10FFFF}_][\\p{L}\\u{10000}-\\u{10FFFF}_0-9]*';

/** @see ~/git/plantuml/.../text/TLineType.java#simpleKeyword */
function simpleKeyword(word: string): RegExp {
  return new RegExp(`^${SPACE_CLASS}*${word}\\b`, 'u');
}

const PATTERN_LEGACY_DEFINE = new RegExp(`^${SPACE_CLASS}*!define${SPACE_CLASS}+${IDENTIFIER}\\(`, 'u');

const PATTERN_LEGACY_DEFINELONG = new RegExp(`^${SPACE_CLASS}*!definelong${SPACE_CLASS}+${IDENTIFIER}\\b`, 'u');

const PATTERN_AFFECTATION_DEFINE = new RegExp(`^${SPACE_CLASS}*!define${SPACE_CLASS}+${IDENTIFIER}\\b`, 'u');

const PATTERN_AFFECTATION = new RegExp(
  `^${SPACE_CLASS}*!${SPACE_CLASS}*(local|global)?${SPACE_CLASS}*\\$?${IDENTIFIER}${SPACE_CLASS}*\\??=`,
  'u',
);

const PATTERN_COMMENT_SIMPLE1 = new RegExp(`^${SPACE_CLASS}*'`, 'u');

const PATTERN_COMMENT_SIMPLE2 = new RegExp(`^${SPACE_CLASS}*/'.*'/${SPACE_CLASS}*$`, 'su');

const PATTERN_COMMENT_LONG_START = new RegExp(`^${SPACE_CLASS}*/'`, 'u');

const PATTERN_IFDEF = simpleKeyword('!ifdef');

/**
 * `simpleKeyword("!undef")`: the trailing `\b` fails between `f` and `i`, so
 * `!undefine FOO` is NOT a directive -- it stays a PLAIN line (the jar renders
 * it as a syntax error; tests/fixtures/unwind-U3/undefine-alias-error.svg).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/text/TLineType.java:87
 */
const PATTERN_UNDEF = simpleKeyword('!undef');

const PATTERN_IFNDEF = simpleKeyword('!ifndef');

const PATTERN_ASSERT = simpleKeyword('!assert');

const PATTERN_IF = simpleKeyword('!if');

const PATTERN_DECLARE_RETURN_FUNCTION = new RegExp(
  `^${SPACE_CLASS}*!(unquoted\\s|final\\s)*function${SPACE_CLASS}+\\$?${IDENTIFIER}`,
  'u',
);

const PATTERN_DECLARE_PROCEDURE = new RegExp(
  `^${SPACE_CLASS}*!(unquoted\\s|final\\s)*procedure${SPACE_CLASS}+\\$?${IDENTIFIER}`,
  'u',
);

const PATTERN_ELSE = simpleKeyword('!else');

const PATTERN_ELSEIF = simpleKeyword('!elseif');

const PATTERN_ENDIF = simpleKeyword('!endif');

const PATTERN_WHILE = simpleKeyword('!while');

const PATTERN_ENDWHILE = simpleKeyword('!endwhile');

const PATTERN_FOREACH = simpleKeyword('!foreach');

const PATTERN_ENDFOREACH = simpleKeyword('!endfor');

const PATTERN_END_FUNCTION = new RegExp(`^${SPACE_CLASS}*!end${SPACE_CLASS}*(function|definelong|procedure)\\b`, 'u');

const PATTERN_RETURN = simpleKeyword('!return');

const PATTERN_THEME = simpleKeyword('!theme');

const PATTERN_INCLUDE = new RegExp(`^${SPACE_CLASS}*!include${SPACE_CLASS}*(url|_many|_once)?\\b`, 'u');

const PATTERN_INCLUDE_DEF = simpleKeyword('!includedef');

const PATTERN_IMPORT = simpleKeyword('!import');

const PATTERN_STARTSUB = simpleKeyword('!startsub');

const PATTERN_ENDSUB = simpleKeyword('!endsub');

const PATTERN_INCLUDESUB = simpleKeyword('!includesub');

const PATTERN_LOG = simpleKeyword('!log');

const PATTERN_DUMP_MEMORY = simpleKeyword('!dump_memory');

const PATTERN_OPTION = simpleKeyword('!option');

/**
 * Ordered directive cascade -- FIRST match wins, so the order here is
 * load-bearing and mirrors upstream's `if` chain exactly (e.g.
 * `PATTERN_LEGACY_DEFINE` must precede `PATTERN_AFFECTATION_DEFINE`, or
 * `!define FOO(x) ...` would classify as a plain `!define` affectation).
 * Only reached once the line is known to contain a `!`.
 */
const EXCLAMATION_CASCADE: readonly (readonly [RegExp, TLineType])[] = [
  [PATTERN_LEGACY_DEFINE, 'LEGACY_DEFINE'],
  [PATTERN_LEGACY_DEFINELONG, 'LEGACY_DEFINELONG'],
  [PATTERN_AFFECTATION_DEFINE, 'AFFECTATION_DEFINE'],
  [PATTERN_AFFECTATION, 'AFFECTATION'],
  [PATTERN_IFDEF, 'IFDEF'],
  [PATTERN_UNDEF, 'UNDEF'],
  [PATTERN_IFNDEF, 'IFNDEF'],
  [PATTERN_ASSERT, 'ASSERT'],
  [PATTERN_IF, 'IF'],
  [PATTERN_DECLARE_RETURN_FUNCTION, 'DECLARE_RETURN_FUNCTION'],
  [PATTERN_DECLARE_PROCEDURE, 'DECLARE_PROCEDURE'],
  [PATTERN_ELSE, 'ELSE'],
  [PATTERN_ELSEIF, 'ELSEIF'],
  [PATTERN_ENDIF, 'ENDIF'],
  [PATTERN_WHILE, 'WHILE'],
  [PATTERN_ENDWHILE, 'ENDWHILE'],
  [PATTERN_FOREACH, 'FOREACH'],
  [PATTERN_ENDFOREACH, 'ENDFOREACH'],
  [PATTERN_END_FUNCTION, 'END_FUNCTION'],
  [PATTERN_RETURN, 'RETURN'],
  [PATTERN_THEME, 'THEME'],
  [PATTERN_INCLUDE, 'INCLUDE'],
  [PATTERN_INCLUDE_DEF, 'INCLUDE_DEF'],
  [PATTERN_IMPORT, 'IMPORT'],
  [PATTERN_STARTSUB, 'STARTSUB'],
  [PATTERN_ENDSUB, 'ENDSUB'],
  [PATTERN_INCLUDESUB, 'INCLUDESUB'],
  [PATTERN_LOG, 'LOG'],
  [PATTERN_DUMP_MEMORY, 'DUMP_MEMORY'],
  [PATTERN_OPTION, 'OPTION'],
];

/**
 * Classify one raw source line.
 *
 * @see ~/git/plantuml/.../text/TLineType.java#getFromLineInternal
 */
export function getFromLineInternal(s: string): TLineType {
  if (PATTERN_COMMENT_SIMPLE1.test(s)) return 'COMMENT_SIMPLE';

  if (PATTERN_COMMENT_SIMPLE2.test(s)) return 'COMMENT_SIMPLE';

  if (PATTERN_COMMENT_LONG_START.test(s) && !s.includes("'/")) return 'COMMENT_LONG_START';

  if (!s.includes('!')) return 'PLAIN';

  for (const [pattern, type] of EXCLAMATION_CASCADE) if (pattern.test(s)) return type;

  return 'PLAIN';
}

/** {@link TLineType} plus upstream's `PYTHON`, which this port's execution never sees (#214). */
export type TLineTypeWithPython = TLineType | 'PYTHON';

/**
 * Upstream's classifier since the Python preprocessor (0537b558644), at
 * 6524b446188: `!x = 1`, `!def ...:`, `!f(1)` are `PYTHON`.
 *
 * {@link getFromLineInternal} stays the classifier that EXECUTES the line,
 * as before Python, because this port has no Python preprocessor (#214). This
 * one only tells which lines upstream groups into Python chunks, for the
 * routing of `!name = value` (`PythonChunks.ts`, `TContextPython.ts`). The
 * two agree on every line upstream does not call `PYTHON`, except the
 * `!name = value` lines the pre-Python `PATTERN_AFFECTATION` still matches.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/text/TLineType.java:149-269
 */
export function getFromLineWithPython(s: string): TLineTypeWithPython {
  if (PATTERN_COMMENT_SIMPLE1.test(s) || PATTERN_COMMENT_SIMPLE2.test(s)) return 'COMMENT_SIMPLE';
  if (PATTERN_COMMENT_LONG_START.test(s) && !s.includes("'/")) return 'COMMENT_LONG_START';
  if (!s.includes('!')) return 'PLAIN';
  if (s.startsWith(PYTHON_MARKER)) return 'PYTHON';
  if (startsWithInterpolation(s)) return 'PLAIN';
  return exclamationWithPython(s);
}

/** The `!` half of {@link getFromLineWithPython}, from `PATTERN_LEGACY_DEFINE` on (TLineType.java:170-269). */
function exclamationWithPython(s: string): TLineTypeWithPython {
  const define = cascadeMatch(s, 0, AFFECTATION_INDEX);
  if (define !== undefined) return define;
  if (isLegacyAffectation(s)) return 'AFFECTATION';
  if (isKeywordLine(s) || isDecoratorLine(s)) return 'PYTHON';
  const directive = cascadeMatch(s, AFFECTATION_INDEX + 1, EXCLAMATION_CASCADE.length);
  if (directive !== undefined) return directive;
  return isStatementLine(s) ? 'PYTHON' : 'PLAIN';
}

/** The first of `EXCLAMATION_CASCADE[from, to)` that matches. */
function cascadeMatch(s: string, from: number, to: number): TLineType | undefined {
  for (let i = from; i < to; i++) if (EXCLAMATION_CASCADE[i]![0].test(s)) return EXCLAMATION_CASCADE[i]![1];
  return undefined;
}

/** Marker put at the start of a collapsed Python chunk.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/text/TLineType.java:71 */
export const PYTHON_MARKER = '!python\n';

/** Where upstream's `PythonLine.isLegacyAffectation` replaced the pre-Python `PATTERN_AFFECTATION`
 * (TLineType.java:179-183). */
const AFFECTATION_INDEX = EXCLAMATION_CASCADE.findIndex(([, type]) => type === 'AFFECTATION');

/** @see ~/git/plantuml/.../text/TLineType.java#isQuote */
export function isQuote(ch: string): boolean {
  return ch === '"' || ch === "'";
}

/** @see ~/git/plantuml/.../text/TLineType.java#isLatinDigit */
export function isLatinDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

/** @see ~/git/plantuml/.../text/TLineType.java#isLetterOrEmojiOrUnderscoreOrDigit */
export function isLetterOrEmojiOrUnderscoreOrDigit(ch: string): boolean {
  if (ch === '') return false;

  const code = ch.charCodeAt(0);
  const isEmoji = code >= 0xd800 && code <= 0xdfff;
  return /\p{L}/u.test(ch) || ch === '_' || isLatinDigit(ch) || isEmoji;
}
