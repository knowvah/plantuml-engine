/**
 * `CharInspector`: a cursor over a block's characters, one `peek`/`jump` at a time. Java's `char` 0 and `'\0'` are
 * both the one-character string `'\0'` here.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/utils/CharInspector.java:38-44
 */
export interface CharInspector {
  /** @see CharInspector.java:40 */
  peek(ahead: number): string;

  /** @see CharInspector.java:42 */
  jump(): void;
}
