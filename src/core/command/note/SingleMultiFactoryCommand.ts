/**
 * `SingleMultiFactoryCommand`: a note command factory that builds the one-line flavour (`note right: text`) and
 * the block flavour (`note right` ... `end note`) of the same command.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/note/SingleMultiFactoryCommand.java:36-44
 */
import type { CommandMultilines2 } from '../CommandMultilines2.js';
import type { SingleLineCommand2 } from '../SingleLineCommand2.js';

export interface SingleMultiFactoryCommand<S> {
  createSingleLine(): SingleLineCommand2<S>;

  createMultiLine(withBracket: boolean): CommandMultilines2<S>;
}
