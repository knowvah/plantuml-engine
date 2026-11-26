/**
 * A refused class block (`ParseState.pendingBodyRefusal`): its body lines are discarded, and the refusal lands on the
 * block's closing line, where upstream reports a multi-line command's `EXECUTION_ERROR`
 * (`command/PSystemCommandFactory.java:218-225`; `PSystemError#getLineLocation`, `error/PSystemError.java:102-104`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:180-186,218-225
 */
import { isJsonBodyComplete } from '../../core/command/CommandCreateJson.js';
import { refuse } from '../../core/parse-refusal.js';
import type { ParseState } from './class-parse-state.js';

/** `CommandMultilines2`'s END for every class block (`^\s*\}\s*$`). */
const BLOCK_END = /^\}\s*$/;

/**
 * Consume one line of a refused body. On the closing line (for a json block, the `}` that completes its JSON) the
 * deferred refusal becomes `executionRefusal`, with the result's score (`PSystemCommandFactory.java:183`,
 * `result.getScore()`; 0 when the refusal carries none).
 */
export function consumeRefusedBodyLine(state: ParseState, line: string): void {
  const pending = state.pendingBodyRefusal;
  if (pending === undefined) return;
  // A json block ends where its JSON completes, not on an inner `}` (`CommandCreateJson.java:155-162`).
  const jsonLines = pending.jsonLines;
  if (!BLOCK_END.test(line) || (jsonLines !== undefined && !isJsonBodyComplete(jsonLines))) {
    jsonLines?.push(line);
    return;
  }
  const at = state.currentLine ?? 0;
  state.executionRefusal = refuse('execution', at, at, pending.message, pending.score);
  state.pendingBodyRefusal = undefined;
}
