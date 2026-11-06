/**
 * Whether a note command's target exists when the command runs. Split from `class-notes.ts` (500-line cap).
 */
import { refuse } from '../../core/parse-refusal.js';
import { resolveExistingId } from './class-existing-entity.js';
import type { ParseState } from './class-parse-state.js';
import { splitEndpointPort, stripQuotes } from './class-relationship-parser.js';

/**
 * `CommandFactoryNoteOnEntity#executeInternal` (`:304-307`): `quark.getData() == null` is `error("Not known: " + idShort)`,
 * at the command's line, so a target declared later is no target. Only a multi-line form can name a member (`C::x`,
 * `CommandFactoryTipOnEntity`), whose host is what must exist; a single-line form looks the whole text up.
 */
export function refuseUnknownNoteTarget(
  state: ParseState,
  target: string | undefined,
  implicit: boolean,
  singleLine = false,
): boolean {
  if (implicit || target === undefined) return false;
  const name = stripQuotes(target);
  const split = splitEndpointPort(name);
  const isTip = !singleLine && split.port !== undefined;
  const host = isTip ? split.id : name;
  const known =
    resolveExistingId(state, host) !== undefined ||
    state.ast.namespaces.some((ns) => ns.id === host) ||
    state.ast.notes.some((note) => note.id === host);
  if (known) return false;
  const at = state.currentLine ?? 0;
  // `CommandFactoryTipOnEntity.java:207-209`: the tip's own wording.
  state.executionRefusal = refuse('execution', at, at, isTip ? 'Nothing to note to' : `Not known: ${host}`);
  return true;
}
