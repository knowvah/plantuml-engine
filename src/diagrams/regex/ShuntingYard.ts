/**
 * `ShuntingYard`: the regex engine's own shunting yard (not ebnf's), from the implicitly concatenated tokens to the
 * postfix queue `PSystemRegex#addBlocLines` replays. Lookarounds and named groups ride the operator stack and leave
 * it when their `)` closes. A token still on the stack at the end goes to the queue, where `PSystemRegex` reports an
 * unbalanced `(` as `Error parsing: PARENTHESIS_OPEN[(]`.
 *
 * Java's `ArrayDeque` is an array used at its front (`addFirst` → `unshift`, `removeFirst` → `shift`, `peekFirst`
 * → `[0]`); `removeFirst` on an empty deque throws `NoSuchElementException` (rep D5 kind 3: `a)b`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/ShuntingYard.java:45-111
 */
import type { ReToken } from './ReToken.js';
import { isNamedGroupOrLookAheadOrLookBehind, ReTokenType } from './ReTokenType.js';

/** The token types that go straight to the output queue. @see ShuntingYard.java:56-69 */
const OPERANDS: ReadonlySet<ReTokenType> = new Set([
  ReTokenType.SIMPLE_CHAR,
  ReTokenType.ESCAPED_CHAR,
  ReTokenType.GROUP,
  ReTokenType.CLASS,
  ReTokenType.ANCHOR,
  ReTokenType.QUANTIFIER,
]);

export class ShuntingYard {
  private readonly ouputQueue: ReToken[] = [];
  private readonly operatorStack: ReToken[] = [];

  /** @see ShuntingYard.java:50-100 */
  constructor(it: Iterator<ReToken>) {
    for (let next = it.next(); next.done !== true; next = it.next()) this.shunt(next.value);
    while (this.operatorStack.length > 0) {
      const token = this.removeFirst();
      this.ouputQueue.push(token);
    }
  }

  /**
   * The loop body's `if` chain. The six operand branches are one set test: each only queues its token, and
   * `isNamedGroupOrLookAheadOrLookBehind` (`:62`) matches none of their types, so the order is kept.
   * @see ShuntingYard.java:56-90
   */
  private shunt(token: ReToken): void {
    const type = token.getType();
    if (OPERANDS.has(type)) {
      this.ouputQueue.push(token);
    } else if (isNamedGroupOrLookAheadOrLookBehind(type)) {
      this.operatorStack.unshift(token);
    } else if (type === ReTokenType.CONCATENATION_IMPLICIT) {
      // push it onto the operator stack.
      this.operatorStack.unshift(token);
    } else if (type === ReTokenType.ALTERNATIVE) {
      while (this.thereIsAConcatenationAtTheTopOfTheOperatorStack()) this.ouputQueue.push(this.removeFirst());
      // push it onto the operator stack.
      this.operatorStack.unshift(token);
    } else if (type === ReTokenType.PARENTHESIS_OPEN) {
      this.operatorStack.unshift(token);
    } else if (type === ReTokenType.PARENTHESIS_CLOSE) {
      this.closeParenthesis();
    } else {
      throw new Error(`UnsupportedOperationException: ${token.toString()}`);
    }
  }

  /** The `)` branch; Java's `first` is never read. @see ShuntingYard.java:80-86 */
  private closeParenthesis(): void {
    while (this.operatorStack[0] !== undefined && this.operatorStack[0].getType() !== ReTokenType.PARENTHESIS_OPEN)
      this.ouputQueue.push(this.removeFirst());
    const _first = this.removeFirst();
    const top = this.operatorStack[0];
    if (top !== undefined && isNamedGroupOrLookAheadOrLookBehind(top.getType()))
      this.ouputQueue.push(this.removeFirst());
  }

  /** `ArrayDeque#removeFirst`: `NoSuchElementException` when empty. */
  private removeFirst(): ReToken {
    const first = this.operatorStack.shift();
    if (first === undefined) throw new Error('NoSuchElementException');
    return first;
  }

  /** @see ShuntingYard.java:102-105 */
  private thereIsAConcatenationAtTheTopOfTheOperatorStack(): boolean {
    const top = this.operatorStack[0];
    return top !== undefined && top.getType() === ReTokenType.CONCATENATION_IMPLICIT;
  }

  /** `Collections.unmodifiableList(ouputQueue)`. @see ShuntingYard.java:107-109 */
  getOuputQueue(): readonly ReToken[] {
    return this.ouputQueue;
  }
}
