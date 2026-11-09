/**
 * `PSystemCommandFactory#isMultilineCommandOk` and `addOneSingleLineManageEmbedded2`: how the dispatcher reads a
 * multi-line command. A command that answered `OK_PARTIAL` to its first line is fed one more line per round (an
 * embedded `{{ ... }}` block counts as one line, nesting included) until it answers `OK` (the block), `NOT_OK` (no
 * block: the dispatcher tries the next command), or the lines run out (no block). A command that is a
 * `CommandDecoratorMultine` gives up after `getNbMaxLines()` partial answers.
 *
 * Upstream clones the iterator and copies its state back on success; here the caller passes the index and gets
 * the next index back, so a `NOT_OK` leaves nothing to undo.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:223-309
 */
import { EmbeddedDiagram, getEmbeddedType } from '../EmbeddedDiagram.js';
import type { StringLocated } from '../tim/StringLocated.js';
import { BlocLines } from '../utils/BlocLines.js';
import { CommandControl } from './CommandControl.js';
import type { HasNbMaxLines, MultilineCommand } from './CommandMultilines2.js';

/** The lines a multi-line command accepted and the index of the line after them. */
export interface MultilineStep {
  readonly lines: BlocLines;
  readonly nextIndex: number;
}

/** `cmd instanceof CommandDecoratorMultine`. */
function nbMaxLinesOf(cmd: object): number | undefined {
  const capped = cmd as Partial<HasNbMaxLines>;
  return typeof capped.getNbMaxLines === 'function' ? capped.getNbMaxLines() : undefined;
}

/**
 * `addOneSingleLineManageEmbedded2`: the line at `index`, or, when it opens an embedded diagram, every line up to
 * its matching end (an unterminated block takes the rest of the source).
 * @see PSystemCommandFactory.java:288-307
 */
function addOneSingleLineManageEmbedded2(
  lineAt: (i: number) => StringLocated,
  count: number,
  index: number,
  linesIn: BlocLines,
): MultilineStep {
  let lines = linesIn.add(lineAt(index));
  let next = index + 1;
  if (getEmbeddedType(lineAt(index).getString()) === null) return { lines, nextIndex: next };

  let nested = 1;
  while (next < count) {
    const s = lineAt(next++);
    lines = lines.add(s);
    if (getEmbeddedType(s.getString()) !== null) nested++;
    else if (s.getTrimmed().getString() === EmbeddedDiagram.EMBEDDED_END) {
      nested--;
      if (nested === 0) return { lines, nextIndex: next };
    }
  }
  return { lines, nextIndex: next };
}

/**
 * `isMultilineCommandOk`, starting at the first line (`index`), which the command already called `OK_PARTIAL`.
 * `undefined` is Java `null`.
 * @see PSystemCommandFactory.java:268-286
 */
export function isMultilineCommandOk<S>(
  lineAt: (i: number) => StringLocated,
  count: number,
  index: number,
  cmd: MultilineCommand<S>,
): MultilineStep | undefined {
  let lines = BlocLines.create();
  let next = index;
  let nb = 0;
  while (next < count) {
    const step = addOneSingleLineManageEmbedded2(lineAt, count, next, lines);
    lines = step.lines;
    next = step.nextIndex;
    const result = cmd.isValid(lines);
    if (result === CommandControl.NOT_OK) return undefined;

    if (result === CommandControl.OK) return { lines, nextIndex: next };

    nb++;
    const max = nbMaxLinesOf(cmd);
    if (max !== undefined && nb > max) return undefined;
  }
  return undefined;
}
