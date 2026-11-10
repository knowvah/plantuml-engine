/**
 * `ShuntingYard`: Dijkstra's shunting yard over a rule's tokens, producing the postfix queue `EbnfEngine` replays.
 * A comment token rides the operator stack and leaves it as `COMMENT_ABOVE` when the operand it follows is
 * emitted, or as `COMMENT_BELOW` when an operator pops it. An unclosed `[`, `{` (or `}-`) clears the queue.
 *
 * Java's `ArrayDeque` is an array used at its front (`addFirst` → `unshift`, `removeFirst` → `shift`,
 * `peekFirst` → `[0]`); `removeFirst` on an empty deque throws `NoSuchElementException`, and `peekFirst()
 * .getSymbol()` on an empty one a `NullPointerException`, both caught by `EbnfExpression#getUDrawable`. The
 * unused `thereIsAFunctionAtTheTopOfTheOperatorStack` is ported with the rest.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/ebnf/ShuntingYard.java:45-181
 */
import { getPriority, isFunction, isOperator, Symbol } from './Symbol.js';
import { Token } from './Token.js';

export class ShuntingYard {
  private readonly ouputQueue: Token[] = [];
  private readonly operatorStack: Token[] = [];

  /** @see ShuntingYard.java:50-138 */
  constructor(it: Iterator<Token>) {
    for (let next = it.next(); next.done !== true; next = it.next()) this.shunt(next.value);
    while (this.operatorStack.length > 0) {
      const token = this.removeFirst();
      const symbol = token.getSymbol();
      if (
        symbol === Symbol.OPTIONAL ||
        symbol === Symbol.REPETITION_ONE_OR_MORE ||
        symbol === Symbol.REPETITION_ZERO_OR_MORE
      ) {
        this.ouputQueue.length = 0;
        return;
      }
      if (symbol === Symbol.COMMENT_TOKEN) this.ouputQueue.push(new Token(Symbol.COMMENT_BELOW, token.getData()));
      else this.ouputQueue.push(token);
    }
  }

  /** The loop body's `if` chain, in Java's order. @see ShuntingYard.java:56-121 */
  private shunt(token: Token): void {
    const symbol = token.getSymbol();
    if (
      symbol === Symbol.LITERAL ||
      symbol === Symbol.TERMINAL_STRING1 ||
      symbol === Symbol.TERMINAL_STRING2 ||
      symbol === Symbol.SPECIAL_SEQUENCE
    ) {
      this.ouputQueue.push(token);
      this.flushCommentsAbove();
    } else if (symbol === Symbol.COMMENT_TOKEN) {
      this.operatorStack.unshift(token);
    } else if (symbol === Symbol.NOT) {
      this.operatorStack.unshift(new Token(Symbol.CONCATENATION, null));
      this.operatorStack.unshift(token);
    } else if (isOperator(symbol)) {
      while (
        this.thereIsAnOperatorAtTheTopOfTheOperatorStackWithGreaterPrecedence(token) ||
        this.thereIsAnCommentOnTopOfTheOperatorStack()
      )
        this.ouputQueue.push(this.operatorStack_removeFirstBelow());
      this.operatorStack.unshift(token);
    } else this.shuntBracket(token);
  }

  /** The bracket branches of the `if` chain. @see ShuntingYard.java:74-121 */
  private shuntBracket(token: Token): void {
    const symbol = token.getSymbol();
    if (symbol === Symbol.GROUPING_OPEN) {
      this.operatorStack.unshift(token);
    } else if (symbol === Symbol.GROUPING_CLOSE) {
      while (this.peekFirstSymbol() !== Symbol.GROUPING_OPEN)
        this.ouputQueue.push(this.operatorStack_removeFirstBelow());
      if (this.peekFirstSymbol() === Symbol.GROUPING_OPEN) this.removeFirst();
    } else if (symbol === Symbol.OPTIONAL_OPEN) {
      this.operatorStack.unshift(new Token(Symbol.OPTIONAL, null));
    } else if (symbol === Symbol.OPTIONAL_CLOSE) {
      this.closeFunction(Symbol.OPTIONAL, null);
    } else if (symbol === Symbol.REPETITION_OPEN) {
      this.operatorStack.unshift(new Token(Symbol.REPETITION_ZERO_OR_MORE, null));
    } else if (symbol === Symbol.REPETITION_CLOSE) {
      this.closeFunction(Symbol.REPETITION_ZERO_OR_MORE, null);
    } else if (symbol === Symbol.REPETITION_MINUS_CLOSE) {
      this.closeFunction(Symbol.REPETITION_ZERO_OR_MORE, new Token(Symbol.REPETITION_ONE_OR_MORE, null));
    } else {
      throw new Error(`UnsupportedOperationException: ${token.toString()}`);
    }
  }

  /**
   * The shared body of the `]`, `}` and `}-` branches: pop operators and comments, check the opener, queue it (or
   * `replacement`, `}-`'s `REPETITION_ONE_OR_MORE`), then the comments above. @see ShuntingYard.java:86-117
   */
  private closeFunction(opener: Symbol, replacement: Token | null): void {
    while (this.thereIsAnOperatorAtTheTopOfTheOperatorStack() || this.thereIsAnCommentOnTopOfTheOperatorStack())
      this.ouputQueue.push(this.operatorStack_removeFirstBelow());
    const first = this.removeFirst();
    if (first.getSymbol() !== opener) throw new Error('IllegalStateException');
    this.ouputQueue.push(replacement ?? first);
    this.flushCommentsAbove();
  }

  /** `while (thereIsAnCommentOnTopOfTheOperatorStack()) ouputQueue.add(operatorStack_removeFirstAbove());` */
  private flushCommentsAbove(): void {
    while (this.thereIsAnCommentOnTopOfTheOperatorStack()) this.ouputQueue.push(this.operatorStack_removeFirstAbove());
  }

  /** `ArrayDeque#removeFirst`: `NoSuchElementException` when empty. */
  private removeFirst(): Token {
    const first = this.operatorStack.shift();
    if (first === undefined) throw new Error('NoSuchElementException');
    return first;
  }

  /** `operatorStack.peekFirst().getSymbol()`: a `NullPointerException` when empty. */
  private peekFirstSymbol(): Symbol {
    const top = this.operatorStack[0];
    if (top === undefined) throw new Error('NullPointerException');
    return top.getSymbol();
  }

  /** @see ShuntingYard.java:140-145 */
  private operatorStack_removeFirstAbove(): Token {
    const result = this.removeFirst();
    if (result.getSymbol() === Symbol.COMMENT_TOKEN) return new Token(Symbol.COMMENT_ABOVE, result.getData());
    return result;
  }

  /** @see ShuntingYard.java:147-152 */
  private operatorStack_removeFirstBelow(): Token {
    const result = this.removeFirst();
    if (result.getSymbol() === Symbol.COMMENT_TOKEN) return new Token(Symbol.COMMENT_BELOW, result.getData());
    return result;
  }

  /** @see ShuntingYard.java:154-157 */
  private thereIsAnCommentOnTopOfTheOperatorStack(): boolean {
    const top = this.operatorStack[0];
    return top !== undefined && top.getSymbol() === Symbol.COMMENT_TOKEN;
  }

  /** Never called upstream. @see ShuntingYard.java:159-162 */
  thereIsAFunctionAtTheTopOfTheOperatorStack(): boolean {
    const top = this.operatorStack[0];
    return top !== undefined && isFunction(top.getSymbol());
  }

  /** @see ShuntingYard.java:164-167 */
  private thereIsAnOperatorAtTheTopOfTheOperatorStack(): boolean {
    const top = this.operatorStack[0];
    return top !== undefined && isOperator(top.getSymbol());
  }

  /** @see ShuntingYard.java:169-175 */
  private thereIsAnOperatorAtTheTopOfTheOperatorStackWithGreaterPrecedence(token: Token): boolean {
    const top = this.operatorStack[0];
    return (
      top !== undefined && isOperator(top.getSymbol()) && getPriority(top.getSymbol()) > getPriority(token.getSymbol())
    );
  }

  /** `Collections.unmodifiableList`. @see ShuntingYard.java:177-179 */
  getOuputQueue(): readonly Token[] {
    return this.ouputQueue;
  }
}
