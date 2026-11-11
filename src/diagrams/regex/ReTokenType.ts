/**
 * `ReTokenType`: the kinds of regex token, in Java's declaration order. An as-const object whose values are the
 * enum names, so `toString` prints what Java's `Enum#toString` prints (`PARENTHESIS_OPEN`), with the enum's two
 * methods as functions, per the port's enum convention (`ebnf/Symbol.ts`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/ReTokenType.java:38-74
 */
export const ReTokenType = {
  SIMPLE_CHAR: 'SIMPLE_CHAR',
  ESCAPED_CHAR: 'ESCAPED_CHAR',
  CLASS: 'CLASS',
  QUANTIFIER: 'QUANTIFIER',
  ANCHOR: 'ANCHOR',
  GROUP: 'GROUP',
  NAMED_GROUP: 'NAMED_GROUP',
  LOOK_AHEAD: 'LOOK_AHEAD',
  LOOK_BEHIND: 'LOOK_BEHIND',
  ALTERNATIVE: 'ALTERNATIVE',
  PARENTHESIS_OPEN: 'PARENTHESIS_OPEN',
  PARENTHESIS_CLOSE: 'PARENTHESIS_CLOSE',
  CONCATENATION_IMPLICIT: 'CONCATENATION_IMPLICIT',
} as const;
export type ReTokenType = (typeof ReTokenType)[keyof typeof ReTokenType];

/** @see ReTokenType.java:54-56 */
export function isNamedGroupOrLookAheadOrLookBehind(type: ReTokenType): boolean {
  return type === ReTokenType.NAMED_GROUP || type === ReTokenType.LOOK_AHEAD || type === ReTokenType.LOOK_BEHIND;
}

/** @see ReTokenType.java:58-72 */
export function needImplicitConcatenation(token1: ReTokenType, token2: ReTokenType): boolean {
  if (isNamedGroupOrLookAheadOrLookBehind(token1)) return false;
  if (token1 === ReTokenType.ALTERNATIVE) return false;
  if (token2 === ReTokenType.ALTERNATIVE) return false;
  if (token2 === ReTokenType.QUANTIFIER) return false;
  if (token1 === ReTokenType.PARENTHESIS_OPEN) return false;
  if (token2 === ReTokenType.PARENTHESIS_CLOSE) return false;
  return true;
}
