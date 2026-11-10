/**
 * `CommandProperty`: `address`, `color`, `width` or `description`, `=`, then a
 * value. `VALUE` is `([^"]*)` between two optional quotes, so an UNQUOTED value
 * keeps a trailing `;` (`address = 210.x.x.x/24;` is `210.x.x.x/24;`, nwp D8).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/nwdiag/CommandProperty.java
 */
import type { CommandExecutionResult } from '../../core/command/CommandExecutionResult.js';
import { concat, SP0 } from './nwdiag-command-text.js';
import type { NwDiagram } from './NwDiagram.js';

/** @see CommandProperty.java:54-67 */
export const PROPERTY_RE = concat(
  SP0,
  '(?<NAME>address|color|width|description)',
  SP0,
  '=',
  SP0,
  '"?',
  '(?<VALUE>[^"]*)',
  '"?',
  SP0,
  ';?',
);

/** @see CommandProperty.java:69-72 */
export function applyProperty(diagram: NwDiagram, match: RegExpExecArray): CommandExecutionResult {
  return diagram.setProperty(match.groups!['NAME']!, match.groups!['VALUE']!);
}
