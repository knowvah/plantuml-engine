/**
 * `CommandBoardPlus`: a run of `+` (empty starts an activity), optional
 * spaces, then the label. A `SingleLineCommand2` built with `doTrim = false`
 * (`super(false, ...)`, CommandBoardPlus.java:51), so it matches the line AS
 * WRITTEN: `  +  B` is an activity labelled `+  B` (`cov-grid-whitespace`).
 * Transcribed with Java's classes: `%s` is Java's ASCII `\s` plus U+00A0
 * (`Pattern2.java:57`), and `.` excludes Java's five line terminators.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/board/CommandBoardPlus.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/SingleLineCommand2.java:60-73
 */
import type { CommandExecutionResult } from '../../../core/command/CommandExecutionResult.js';
import type { BoardDiagram } from '../BoardDiagram.js';

/** `%s` inside a class. @see Pattern2.java:57 */
const SPACE_CHARS = String.raw` \t\n\x0B\f\r `;
/** Java's `.` without DOTALL. */
const JAVA_DOT = String.raw`[^\n\r\u0085  ]`;

/**
 * `RegexLeaf.start()`, `PLUS ([+]*)`, `spaceZeroOrMore()`, `LABEL ([^%s].*)`, `end()`.
 * @see CommandBoardPlus.java:54-59
 */
export const BOARD_PLUS_RE = new RegExp(`^(?<PLUS>[+]*)[${SPACE_CHARS}]*(?<LABEL>[^${SPACE_CHARS}]${JAVA_DOT}*)$`, 'i');

/** @see CommandBoardPlus.java:67-73 */
export function applyBoardPlus(diagram: BoardDiagram, match: RegExpExecArray): CommandExecutionResult {
  const plus = match.groups!['PLUS']!;
  const label = match.groups!['LABEL']!;
  return diagram.addLine(plus, label);
}
