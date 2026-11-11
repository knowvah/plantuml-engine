/**
 * `Symbol`: the EBNF token kinds (Wikipedia's EBNF table) plus `REGEX_GROUP` for the regex engine.
 * An as-const object with the enum's three methods as functions, per the port's enum convention.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/Symbol.java:38-89
 */
export const Symbol = {
  LITERAL: 'LITERAL',
  DEFINITION: 'DEFINITION', // =
  CONCATENATION: 'CONCATENATION', // ,
  TERMINATION: 'TERMINATION', // ;
  ALTERNATION: 'ALTERNATION', // |
  OPTIONAL_OPEN: 'OPTIONAL_OPEN', // [
  OPTIONAL_CLOSE: 'OPTIONAL_CLOSE', // ]
  OPTIONAL: 'OPTIONAL',
  REPETITION_SYMBOL: 'REPETITION_SYMBOL', // *
  REPETITION_OPEN: 'REPETITION_OPEN', // {
  REPETITION_CLOSE: 'REPETITION_CLOSE', // }
  REPETITION_MINUS_CLOSE: 'REPETITION_MINUS_CLOSE', // }-
  REPETITION_ZERO_OR_MORE: 'REPETITION_ZERO_OR_MORE',
  REPETITION_ONE_OR_MORE: 'REPETITION_ONE_OR_MORE',
  GROUPING_OPEN: 'GROUPING_OPEN', // (
  GROUPING_CLOSE: 'GROUPING_CLOSE', // )
  TERMINAL_STRING1: 'TERMINAL_STRING1', // " "
  TERMINAL_STRING2: 'TERMINAL_STRING2', // ' '
  COMMENT_TOKEN: 'COMMENT_TOKEN', // (* *)
  COMMENT_BELOW: 'COMMENT_BELOW', // (* *)
  COMMENT_ABOVE: 'COMMENT_ABOVE', // (* *)
  SPECIAL_SEQUENCE: 'SPECIAL_SEQUENCE', // ? ?
  NOT: 'NOT', // EXCEPTION -
  // Special for regex
  REGEX_GROUP: 'REGEX_GROUP',
} as const;
export type Symbol = (typeof Symbol)[keyof typeof Symbol];

/** Java throws `UnsupportedOperationException` for a non-operator. @see Symbol.java:69-79 */
export function getPriority(symbol: Symbol): number {
  switch (symbol) {
    case Symbol.REPETITION_SYMBOL:
      return 3;
    case Symbol.CONCATENATION:
      return 2;
    case Symbol.ALTERNATION:
      return 1;
  }
  throw new Error('UnsupportedOperationException');
}

/** @see Symbol.java:81-83 */
export function isOperator(symbol: Symbol): boolean {
  return symbol === Symbol.CONCATENATION || symbol === Symbol.ALTERNATION || symbol === Symbol.REPETITION_SYMBOL;
}

/** @see Symbol.java:85-87 */
export function isFunction(symbol: Symbol): boolean {
  return symbol === Symbol.OPTIONAL || symbol === Symbol.REPETITION_ZERO_OR_MORE;
}
