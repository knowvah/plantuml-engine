/**
 * `CharInspectorImpl`: walks a `BlocLines` line by line over each line's trimmed text, skipping empty lines on
 * `jump`. Java's constructor is package-private and only `BlocLines#inspector`/`#inspectorWithNewlines` call it.
 *
 * Mutable cursor: `line` and `pos` advance in place on `jump`, as Java's fields do.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/utils/CharInspectorImpl.java:38-84
 */
import type { BlocLines } from './BlocLines.js';
import type { CharInspector } from './CharInspector.js';

/** Java's `'\0'`, which `peek` returns past a line's end and, as `char` 0, once exhausted. */
const NUL = '\0';

export class CharInspectorImpl implements CharInspector {
  private readonly data: BlocLines;
  private readonly insertNewlines: boolean;
  private line = 0;
  private pos = 0;

  /** @see CharInspectorImpl.java:45-48 */
  constructor(input: BlocLines, insertNewlines: boolean) {
    this.data = input;
    this.insertNewlines = insertNewlines;
  }

  /** `if (line == -1) return 0;` then `'\0'` past the line. @see CharInspectorImpl.java:50-58 */
  peek(ahead: number): string {
    if (this.line === -1) return NUL;
    const currentLine = this.getCurrentLine();
    if (this.pos + ahead >= currentLine.length) return NUL;
    return currentLine.charAt(this.pos + ahead);
  }

  /** @see CharInspectorImpl.java:60-64 */
  private getCurrentLine(): string {
    if (this.insertNewlines) return this.data.getAt(this.line).getTrimmed().getString() + '\n';
    return this.data.getAt(this.line).getTrimmed().getString();
  }

  /** Java throws `IllegalStateException` when already exhausted. @see CharInspectorImpl.java:66-80 */
  jump(): void {
    if (this.line === -1) throw new Error('IllegalStateException');
    this.pos++;
    if (this.pos >= this.getCurrentLine().length) {
      this.line++;
      this.pos = 0;
    }
    while (this.line < this.data.size() && this.getCurrentLine().length === 0) this.line++;
    if (this.line >= this.data.size()) this.line = -1;
  }
}
