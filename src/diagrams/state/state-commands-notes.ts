/**
 * Note-family command rules for the state parser — split out of
 * `state-commands.ts` purely for the project's 500-line file cap (the note
 * family is self-contained: no other rule in `state-commands.ts` reads
 * `NotePosition` or any `state-notes.js` export). Spread into `COMMANDS` at
 * the same priority position (between the plain-state declaration rule and
 * the standalone `CODE : text` rule) — see `state-commands.ts`'s ordering
 * doc for why order matters.
 * @see ~/git/plantuml/.../statediagram/StateDiagramFactory.java
 */

import type { NotePosition } from './ast.js';
import type { Command } from './state-commands.js';
import { currentScope, noteScopeId, nextCreationIndex, type ParseState } from './state-parse-state.js';
import {
  NOTE_COLOR_CAPTURE,
  NOTE_STEREO,
  NOTE_TARGET,
  NOTE_URL,
  NOTE_ON_LINK_RE,
  NOTE_ON_LINK_MULTI_RE,
  addNote,
  addFreestandingNote,
  applyNoteOnLink,
  stripQuotes,
} from './state-notes.js';

/** Parse an optional `left|right|top|bottom` capture, defaulting to BOTTOM
 *  (`CommandFactoryNoteOnLink.java:203`) — shared by rules 12/12b. */
function linkNotePosition(raw: string | undefined): NotePosition {
  return (raw?.toLowerCase() as NotePosition | undefined) ?? 'bottom';
}

/** Upstream's own wording, verbatim — `CommandFactoryNoteOnEntity.java:301`. */
const NOTHING_TO_NOTE_TO = 'Nothing to note to';

/**
 * T9b (unknown-bucket-routing-repair): "no `of <State>` AND no
 * `lastEntity`" guard shared in SPIRIT by rules 10/11 — both dispatch
 * through the ONE upstream `CommandFactoryNoteOnEntity#executeInternal`
 * (`command/note/CommandFactoryNoteOnEntity.java:293-303`), which resolves
 * `cl1` to `diagram.getLastEntity()` when `idShort == null` and returns
 * `CommandExecutionResult.error("Nothing to note to")` when THAT is also
 * null — an EXECUTION-error refusal that aborts the whole state attempt
 * (`command/PSystemCommandFactory.java:169-175`), not a silent no-op.
 * Registered for state at `statediagram/StateDiagramFactory.java:97-100`.
 * Rule 11 (below) inlines the equivalent check on its own ALREADY-resolved
 * `target` local instead of calling this — TypeScript cannot narrow
 * `target: string | undefined` to `string` for `addNote`'s call across a
 * separate helper call, only across a same-scope `if`.
 */
function needsNothingToNoteTo(ps: ParseState, target: string | undefined): boolean {
  return target === undefined && ps.lastEntity === null;
}

/** `CommandFactoryNoteOnEntity.java:304-307`: `quarkInContext(true, idShort)`
 *  then `Not known` on a quark holding no entity. A bare name resolves through
 *  `countByName(full) == 1` unless that one entity is the current group, whose
 *  own `child(full)` is empty (`CucaDiagram.java:267-274`); a name no entity has
 *  fails the same way. Dotted names and a name several entities share take paths
 *  the by-name index cannot answer, so they stay accepted: under-refusing keeps
 *  today's output, over-refusing would lose a diagram the jar draws. */
function noteTargetError(ps: ParseState, target: string): string | undefined {
  const name = stripQuotes(target);
  if (ps.separator !== null && name.includes(ps.separator)) return undefined;
  return isKnownNoteHost(ps, name) ? undefined : `Not known: ${name}`;
}

/** {@link noteTargetError}'s bare-name test. */
function isKnownNoteHost(ps: ParseState, name: string): boolean {
  const states = ps.globalByName.get(name) ?? [];
  if (states.length === 1 && states[0] === currentScope(ps).owner) return false;
  return states.length > 0 || (ps.ast.notes ?? []).some((n) => n.id === name);
}

/** Upstream's refusal for a note's target on pass THREE, or `undefined`. */
function attachedNoteError(ps: ParseState, target: string | undefined): string | undefined {
  if (needsNothingToNoteTo(ps, target)) return NOTHING_TO_NOTE_TO;
  return target === undefined ? undefined : noteTargetError(ps, target);
}

export const NOTE_COMMANDS: readonly Command[] = [
  // -------------------------------------------------------------------------
  // 10. Multi-line attached note opener: note <pos> [of <State>] [<<s>>]
  //     [#color] [[[url]]] — ending in `{` (bracket form, closed by `}`)
  //     or nothing (closed by `end note`). The single-line form (rule 11)
  //     ends in a MANDATORY `: text` tail that this pattern's optional
  //     trailing `{` cannot satisfy, so there is no overlap between them.
  //     Dispatches on BOTH passes (see the `Command.passes` doc above) --
  //     upstream's real ParserPass.THREE eligibility is instead enforced
  //     at the closer (parser.ts's `noteFinalizePass`).
  //     mission G4 S12: `#color` is now CAPTURED (match[3]) -- the trailing
  //     brace-closer capture shifts from match[3] to match[4] accordingly.
  //     T9b: shares upstream's `executeInternal` with rule 11 -- the SAME
  //     "Nothing to note to" guard applies (`needsNothingToNoteTo`'s doc
  //     above), but checked ONLY on pass 'three': the earlier passes still
  //     open `pendingNote` unconditionally so the body keeps being swallowed
  //     on EVERY pass (`parser.ts#handlePendingNoteLine`) -- an earlier
  //     check would read `ps.lastEntity` before pass-'two'-only commands
  //     (e.g. a transition's implicit state creation) earlier on this SAME
  //     line position have run, which could refuse a source upstream's
  //     ParserPass.THREE would accept. Refusing on pass 'three' aborts the
  //     whole parse before that pass's walk needs `pendingNote` again, so
  //     skipping the open there is safe.
  // @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnEntity.java
  // -------------------------------------------------------------------------
  {
    pattern: new RegExp(
      String.raw`^note\s+(left|right|top|bottom)(?:\s+of\s+` +
        NOTE_TARGET +
        `)?` +
        NOTE_STEREO +
        NOTE_COLOR_CAPTURE +
        NOTE_URL +
        String.raw`\s*(\{)?\s*$`,
      'i',
    ),
    passes: ['one', 'two', 'three'],
    execute(ps, match, pass) {
      const position = match[1]!.toLowerCase() as NotePosition;
      const target = match[2];
      if (pass === 'three') {
        ps.executionError = attachedNoteError(ps, target);
        if (ps.executionError !== undefined) return;
      }
      ps.pendingNote = {
        kind: 'attached',
        target: target ?? ps.lastEntity ?? undefined,
        implicitTarget: target === undefined,
        position,
        textLines: [],
        ...(match[3] !== undefined ? { color: match[3] } : {}),
        ...(match[4] !== undefined ? { closer: 'brace' } : {}),
      };
    },
  },

  // -------------------------------------------------------------------------
  // 11. Single-line attached note: note <pos> [of <State>] [<<s>>][#c][[u]] : text
  //     `of <State>` absent -> attaches to the last created entity.
  //     Upstream CommandFactoryNoteOnEntity is ParserPass.THREE for state
  //     diagrams (`StateDiagramFactory.java:97-100`).
  //     mission G4 S12: `#color` is now CAPTURED (match[3]) -- the trailing
  //     text capture shifts from match[3] to match[4] accordingly.
  // @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnEntity.java:92-116 (regex)
  //      :293-303 (idShort==null -> getLastEntity(); null -> EXECUTION_ERROR,
  //      T9b -- see `needsNothingToNoteTo`'s doc above)
  // -------------------------------------------------------------------------
  {
    pattern: new RegExp(
      String.raw`^note\s+(left|right|top|bottom)(?:\s+of\s+` +
        NOTE_TARGET +
        `)?` +
        NOTE_STEREO +
        NOTE_COLOR_CAPTURE +
        NOTE_URL +
        String.raw`\s*:\s*(.+)$`,
      'i',
    ),
    passes: ['three'],
    execute(ps, match) {
      ps.executionError = attachedNoteError(ps, match[2]);
      if (ps.executionError !== undefined) return;
      const target = match[2] ?? ps.lastEntity!;
      // mission G4 S10: burned GMN quark-name tick -- see
      // `StateNote.creationIndex`'s own doc comment.
      nextCreationIndex(ps);
      const id = addNote(ps.ast, match[1]!.toLowerCase() as NotePosition, target, match[4]!.trim(), {
        implicitTarget: match[2] === undefined,
        scopeId: noteScopeId(ps),
        creationIndex: nextCreationIndex(ps),
        ...(match[3] !== undefined ? { color: match[3] } : {}),
      });
      nextCreationIndex(ps); // the note's `Link` -- see `finalizePendingNote`'s doc
      ps.lastEntity = id;
    },
  },

  // -------------------------------------------------------------------------
  // 12. `note [pos] on|of link [#color] : text` — attaches to the last
  //     transition parsed WITHIN the currently open scope. Position is
  //     OPTIONAL (defaults to BOTTOM — CommandFactoryNoteOnLink.java:203).
  //     CommandFactoryNoteOnLink#isEligibleFor -> ParserPass.TWO only.
  //     `#color` stays NON-capturing here (unchanged this iteration) --
  //     see `NOTE_COLOR_CAPTURE`'s own doc comment (state-notes.ts).
  // @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnLink.java
  // -------------------------------------------------------------------------
  {
    pattern: NOTE_ON_LINK_RE,
    passes: ['two'],
    execute(ps, match) {
      applyNoteOnLink(currentScope(ps).transitions, match[2]!.trim(), linkNotePosition(match[1]));
    },
  },

  // -------------------------------------------------------------------------
  // 12b. Multi-line `note [pos] on|of link [#color]` opener — same target/
  //      position rule as rule 12, closed by `end note`. Dispatches on BOTH
  //      passes (opens/swallows the block regardless of pass, same as rules
  //      10/13); `noteFinalizePass` gates the actual `applyNoteOnLink` call
  //      to pass TWO only.
  // @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnLink.java:93-102
  // -------------------------------------------------------------------------
  {
    pattern: NOTE_ON_LINK_MULTI_RE,
    passes: ['one', 'two', 'three'],
    execute(ps, match) {
      ps.pendingNote = {
        kind: 'link',
        transitions: currentScope(ps).transitions,
        position: linkNotePosition(match[1]),
        textLines: [],
      };
    },
  },

  // -------------------------------------------------------------------------
  // 13. Multi-line freestanding note opener: note as <alias> [<<s>>] [#c]
  //     (… end note). Unattached. Dispatches on BOTH passes (see the
  //     `Command.passes` doc above); real ParserPass.ONE eligibility
  //     (CommandFactoryNote's base-class default -- no override) is
  //     enforced at the closer (parser.ts's `noteFinalizePass`).
  //     mission G4 S12: `#color` is now CAPTURED (match[2]).
  // @see ~/git/plantuml/.../command/note/CommandFactoryNote.java:77-89
  // -------------------------------------------------------------------------
  {
    pattern: new RegExp(
      String.raw`^note\s+as\s+` + NOTE_TARGET + NOTE_STEREO + NOTE_COLOR_CAPTURE + String.raw`\s*$`,
      'i',
    ),
    passes: ['one', 'two', 'three'],
    execute(ps, match) {
      ps.pendingNote = {
        kind: 'freestanding',
        alias: match[1]!,
        textLines: [],
        ...(match[2] !== undefined ? { color: match[2] } : {}),
      };
    },
  },

  // -------------------------------------------------------------------------
  // 14. Single-line freestanding note: note "text" as <alias> [<<s>>][#c].
  //     Creates the note leaf immediately; there is no `end note` to wait
  //     for — a distinct upstream command from 10/11/13
  //     (CommandFactoryNote's singleLine, not CommandFactoryNoteOnEntity).
  //     No `isEligibleFor` override -> base-class default PASS ONE only.
  //     mission G4 S12: `#color` is now CAPTURED (match[3]).
  // @see ~/git/plantuml/.../command/note/CommandFactoryNote.java:91-107
  // -------------------------------------------------------------------------
  {
    pattern: new RegExp(
      String.raw`^note\s+"([^"]+)"\s+as\s+` + NOTE_TARGET + NOTE_STEREO + NOTE_COLOR_CAPTURE + String.raw`\s*$`,
      'i',
    ),
    passes: ['one'],
    execute(ps, match) {
      const id = addFreestandingNote(ps.ast, match[2]!, match[1]!, noteScopeId(ps), {
        creationIndex: nextCreationIndex(ps),
        ...(match[3] !== undefined ? { color: match[3] } : {}),
      });
      ps.lastEntity = id;
    },
  },
] satisfies readonly Command[];
