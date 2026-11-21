/**
 * The one error `YamlParser` throws: every failure of the YAML subset, with
 * the line it was found on (counted from 1, 0 while unknown). The parser
 * re-throws a line-less one with the line it was reading.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/yaml/parser/YamlSyntaxException.java:37-57
 */
export class YamlSyntaxException extends Error {
  private readonly line: number;

  /** @param line the line of the error, counted from 1; omitted means unknown (0). */
  constructor(message: string, line?: number) {
    super(line === undefined ? message : `${message} (line ${line})`);
    this.name = 'YamlSyntaxException';
    this.line = line ?? 0;
  }

  /** The line of the error, counted from 1, or 0 when unknown. */
  getLine(): number {
    return this.line;
  }
}
