/**
 * `RegexParsingException`: a checked exception in Java, a named `Error` here so `PSystemRegex#addBlocLines` can tell
 * it from any other throw (an `Error parsing: …` result rather than `ProtectedCommand`'s message).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/regexdiagram/RegexParsingException.java:38-44
 */
export class RegexParsingException extends Error {
  /** @see RegexParsingException.java:40-42 */
  constructor(msg: string) {
    super(msg);
    this.name = 'RegexParsingException';
  }
}
