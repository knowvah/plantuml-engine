/**
 * `CommandCreateElementFull` as one command: the Java's regex and `executeArg`,
 * which the rules before this one approximate shape by shape. It runs last, so
 * it only answers a line none of them claimed: `:Main Admin: as Admin`,
 * `(a b)/ as (c)`, `plain as alias`, and the lazy STEREOTYPE of
 * `:joe:/ <<xxx>> #green -[#blue]-> (action)/ <<yyy>> #orange`, which runs to
 * the last `>>` and makes that whole line ONE element.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/descdiagram/command/CommandCreateElementFull.java:83-115,231-350
 */
import { KEYWORD_TO_SYMBOL, type USymbol } from '../../core/descriptive-keywords.js';
import {
  ALL_TYPES,
  CODE,
  CODE_WITH_QUOTE,
  DISPLAY,
  DISPLAY_WITHOUT_QUOTE,
  compileUpstream,
  elementTail,
  optionalStereotype,
} from '../../core/command/CommandCreateElementFull.js';
import { COLORS_REGEXP } from '../../core/klimt/color/ColorParser.js';
import type { Command } from './command-table-types.js';
import { cleanId, extractTags, finalizeDisplay, makeNode, stereotypeOfRun } from './parse-helpers.js';
import { emitNode, type ParseState } from './parse-state.js';

/**
 * `getRegexConcat`, behind `isForbidden`'s whole-line test as a lookahead
 * (`FORBIDDEN_PATTERN`, `CommandCreateElementFull.java:134-139`).
 * @see CommandCreateElementFull.java:83-115
 */
const RE_ELEMENT_FULL = compileUpstream(
  String.raw`^(?![\p{L}0-9_.]+$)(?:(?<SYMBOL>${ALL_TYPES}|\(\))[%s]+)?(?<COLOR2>${COLORS_REGEXP})?[%s]*(?:` +
    `(?<CODE1>${CODE_WITH_QUOTE})|` +
    `(?<DISPLAY2>${DISPLAY})${optionalStereotype('STEREOTYPE2')}as[%s]+(?<CODE2>${CODE})|` +
    `(?<CODE3>${CODE})${optionalStereotype('STEREOTYPE3')}as[%s]*(?<DISPLAY3>${DISPLAY})|` +
    `(?<DISPLAY4>${DISPLAY_WITHOUT_QUOTE})${optionalStereotype('STEREOTYPE4')}as[%s]+(?<CODE4>${CODE})` +
    `)${elementTail()}`,
);

/** `getCharEncoding`, `CommandCreateElementFull.java:365-367`. */
function charEncoding(raw: string | undefined): string | undefined {
  return raw !== undefined && raw.length > 2 ? raw[0] : undefined;
}

/** The trailing `/` of a business variant comes off the display before its quote-strip (java:243-244,255-256). */
function withoutBusinessSlash(raw: string | undefined, close: string): string | undefined {
  return raw?.endsWith(`${close}/`) === true ? raw.slice(0, -1) : raw;
}

/** `symbol`, deduced as `executeArg` does (java:237-268). */
function deduceSymbol(keyword: string | undefined, code: string, display: string | undefined): USymbol {
  const codeChar = charEncoding(code);
  const displayChar = charEncoding(display);
  const has = (char: string): boolean => codeChar === char || displayChar === char;
  const endsWith = (suffix: string): boolean =>
    keyword?.endsWith('/') === true || display?.endsWith(suffix) === true || code.endsWith(suffix);
  if (code.startsWith('()')) return 'interface';
  if (has('(')) return endsWith(')/') ? 'usecase-business' : 'usecase';
  if (has(':')) return endsWith(':/') ? 'actor-business' : 'actor';
  if (has('[')) return 'component';
  // symbol == null: LeafType.DESCRIPTION with actorStyle().toUSymbol() (java:271-274).
  return keyword === undefined ? 'actor' : (KEYWORD_TO_SYMBOL.get(keyword.toLowerCase()) ?? 'actor');
}

function executeElementFull(state: ParseState, match: RegExpExecArray): void {
  const g = match.groups!;
  const code = g['CODE1'] ?? g['CODE2'] ?? g['CODE3'] ?? g['CODE4']!;
  const display = g['DISPLAY2'] ?? g['DISPLAY3'] ?? g['DISPLAY4'];
  const symbol = deduceSymbol(g['SYMBOL'], code, display);
  const id = cleanId(code);
  const close = symbol === 'usecase-business' ? ')' : ':';
  const shown = withoutBusinessSlash(display, close) ?? id;
  const run = g['STEREOTYPE'] ?? g['STEREOTYPE2'] ?? g['STEREOTYPE3'] ?? g['STEREOTYPE4'];
  const stereotype = run === undefined ? undefined : stereotypeOfRun(run);
  const tags = extractTags(g['TAGS1'] ?? g['TAGS2'] ?? '').tags;
  emitNode(
    state,
    makeNode(
      id,
      finalizeDisplay(shown),
      symbol,
      stereotype?.stereotypes,
      g['COLOR'] ?? g['COLOR2'],
      tags.length > 0 ? tags : undefined,
      stereotype?.sprite,
      { url: g['URL'] },
    ),
  );
}

/**
 * The keyword rule's two reads of this regex. The notation of the code or display beats the keyword
 * (`rectangle :a b: as c` draws an actor, java:241-266; jar: tests/fixtures/ddd-T1a), and a `:display:` before
 * `as` is the DISPLAY2 form the keyword rule's alias table has no arm for.
 */
export function keywordLineSymbol(line: string, keyword: USymbol): USymbol {
  const g = RE_ELEMENT_FULL.exec(line)?.groups;
  if (g === undefined) return keyword;
  const code = g['CODE1'] ?? g['CODE2'] ?? g['CODE3'] ?? g['CODE4']!;
  const display = g['DISPLAY2'] ?? g['DISPLAY3'] ?? g['DISPLAY4'];
  return charEncoding(code) === undefined && charEncoding(display) === undefined && !code.startsWith('()')
    ? keyword
    : deduceSymbol(g['SYMBOL'], code, display);
}

/** Runs `executeArg` when the line's display is the `:display:` DISPLAY2 form. */
export function tryColonDisplayForm(state: ParseState, line: string): boolean {
  const match = RE_ELEMENT_FULL.exec(line);
  if (match?.groups?.['DISPLAY2']?.startsWith(':') !== true) return false;
  executeElementFull(state, match);
  return true;
}

export const ELEMENT_FULL_COMMAND: Command = {
  pattern: RE_ELEMENT_FULL,
  execute: executeElementFull,
};
