/**
 * parse-state-notes.ts -- the note commands' state mutation, split out of `parse-state.ts` (500-line cap, dss T3a added
 * `note on link` colours). Regex classification lives in `note-grammar.ts`; node/link creation and `lastEntityId`
 * stay on the shared `ParseState` helpers.
 */
import { extractNodeStereotype, makeNode, resolveNewlineEscapes } from './parse-helpers.js';
import { removeEmptyColumns } from './note-columns.js';
import {
  noteAttachment,
  resolvePosition,
  type NoteDecor,
  type NoteOpenMatch,
  type NotePosition,
} from './note-grammar.js';
import { emitNode, nextCreationIndex, type ParseState } from './parse-state.js';

// ---------------------------------------------------------------------------
// Note commands (CommandFactoryNote / CommandFactoryNoteOnEntity /
// CommandFactoryNoteOnLink) — regex classification lives in note-grammar.ts;
// state mutation (node/link creation, lastEntityId) stays here.
// ---------------------------------------------------------------------------

/** Notes are ordinary leaves upstream (EntityImageNote/svek) — `emitNode`
 *  already updates `lastEntityId` since a note node never sets
 *  `declaredAsGroup`. */
function emitNoteLeaf(state: ParseState, id: string, text: string, decor?: NoteDecor): void {
  // A note's text is a Display like any other, so `\n`/`\r`/`\l` escapes
  // split it into lines (`Display.getWithNewlines`, which every note command
  // routes its text through). Without this a `note left: a\nb\nc` measured
  // as ONE very wide line — berufi-69-dara369's note came out 447.24×23
  // against the jar's 194.39×49 (S1L-e).
  // CommandFactoryNoteOnEntity.java:331-336: `note.setStereotype(stereotype)`,
  // `note.setColors(colors)`.
  const labels = decor?.stereotype === undefined ? [] : (extractNodeStereotype(decor.stereotype)?.stereotypes ?? []);
  emitNode(
    state,
    makeNode(
      id,
      resolveNewlineEscapes(text),
      'note',
      labels.length > 0 ? labels : undefined,
      decor?.color,
      undefined,
      undefined,
      { url: decor?.url },
    ),
  );
}

/** Upstream's own wording, verbatim — `CommandFactoryNoteOnEntity.java:301`. */
const NOTHING_TO_NOTE_TO = 'Nothing to note to';
const NO_SUCH_COLOR = 'No such color';

/** `CommandFactoryNoteOnEntity.java:327`: `diagram.getUniqueSequence("GMN")`
 *  draws one value from the shared `cpt1` counter (the quark name
 *  `GMN<n>`) BEFORE `reallyCreateLeaf` (:329) assigns the leaf's own uid. */
function emitGeneratedNoteLeaf(state: ParseState, id: string, text: string, decor: NoteDecor): void {
  nextCreationIndex(state);
  emitNoteLeaf(state, id, text, decor);
}

/**
 * CommandFactoryNoteOnEntity.executeInternal (:295-323): resolves cl1 (the
 * `of X` target, or `getLastEntity()` when CODE is omitted) BEFORE creating
 * the note leaf. The "Nothing to note to" branch (CODE omitted AND no
 * `lastEntity`) is now refused by `executeNoteOpen` below, BEFORE this
 * function is ever called (T8b, unknown-bucket-routing-repair) — matching
 * upstream's EXECUTION_ERROR abort of the whole attempt (`PSystemCommandFactory
 * .java:169-175`), not a silent no-op. The `resolvedTarget === undefined`
 * arm here is now a type-narrowing guard only (TypeScript cannot see that
 * the caller already ruled it out) — the reachable case left in scope is
 * upstream's OTHER branch: an explicit `of X` that does not resolve
 * ("Not known: X"), which stays a silent skip — narrower than upstream,
 * out of scope (no assigned fixture exercises it).
 */
function attachNoteToEntity(
  state: ParseState,
  position: NotePosition,
  targetId: string | undefined,
  text: string,
  decor: NoteDecor,
): void {
  const resolvedTarget = targetId ?? state.lastEntityId;
  if (resolvedTarget === undefined || !state.nodesById.has(resolvedTarget)) return;
  // CommandFactoryNoteOnEntity.java:322: `if (kermor && cl1.isGroup())
  // { cl1.addNote(display, position, colors); return; }` -- under
  // `!pragma kermor on`, a note attached to a GROUP entity is stored
  // directly on the Entity (read back by ClusterDotStringKermor via
  // `Cluster.getCucaNote`, `getNotes(position).get(0)`), never as a separate
  // note leaf + edge. Only TOP/BOTTOM are read (`useAlphaAndBeta`).
  const target = state.nodesById.get(resolvedTarget);
  if (state.ast.kermor === true && target?.declaredAsGroup === true) {
    const slot = resolvePosition(position, state.ast.rankdir);
    if (slot === 'top' || slot === 'bottom') {
      target.kermorNotes ??= {};
      if (target.kermorNotes[slot] === undefined) {
        target.kermorNotes[slot] = resolveNewlineEscapes(text);
        if (decor.color !== undefined) (target.kermorNoteColors ??= {})[slot] = decor.color;
      }
    }
    return;
  }
  const pos = resolvePosition(position, state.ast.rankdir);
  // `CommandFactoryNoteOnEntity.java:327`: the note's quark name is `GMN<n>`, `n` being the
  // `getUniqueSequence("GMN")` value `emitGeneratedNoteLeaf` draws next from the shared counter.
  const noteId = `GMN${state.uidCounter + 1}`;
  emitGeneratedNoteLeaf(state, noteId, text, decor);
  const link = noteAttachment(pos, resolvedTarget, noteId);
  // CommandFactoryNoteOnEntity.java:342-360: a real `new Link(...)` (goDashed
  // LinkType), consuming its own `lnkN` uid from the shared counter -- see
  // DescriptiveLink.creationIndex's doc comment.
  state.ast.links.push({
    ...link,
    style: 'dashed',
    arrowHead: 'none',
    creationIndex: nextCreationIndex(state),
  });
}

/** Runs a fully-resolved single-line note command, or opens a pending
 *  multi-line block for the parser loop to accumulate lines into. */
/**
 * `CommandFactoryNoteOnLink#executeInternal`: `diagram.getLastLink()`, error
 * out when there is none, then `link.addNote(CucaNote.build(display,
 * position, colors))`.
 *
 * The note is a FIELD, never appended to `link.label` (mission
 * `edge-label-box-followups` D1): upstream keeps `Link#getNote()` separate
 * and `SvekEdge.java:307-326` merges a note IMAGE into the label block --
 * `EntityImageNoteLink`'s own padding is ~31x20 larger than the raw text, so
 * folding the text in under-reserved every `note on link` box in the corpus
 * (`fogiku-22-gone205` 51x15 against the jar's 80x33).
 *
 * `Link#addNote` is a plain `this.note = note` (`abel/Link.java:332-334`) --
 * NOT an append -- so a second `note on link` targeting the same last link
 * REPLACES the first, including its position. Mirrored by assignment.
 *
 * `position ?? 'bottom'` is upstream's own default, applied here (the
 * executor) rather than in the grammar: `Position position = Position.BOTTOM;
 * if (arg.get("POSITION", 0) != null) position = Position.valueOf(...)`.
 */
function attachNoteToLastLink(
  state: ParseState,
  text: string,
  position: NotePosition | undefined,
  color: string | undefined,
): void {
  const link = state.ast.links[state.ast.links.length - 1];
  if (link === undefined) return;
  link.linkNote = text;
  link.linkNotePosition = position ?? 'bottom';
  // `Link#addNote` replaces the whole `CucaNote`, colours included.
  if (color === undefined) delete link.linkNoteColor;
  else link.linkNoteColor = color;
}

/**
 * T8b (unknown-bucket-routing-repair): upstream's shared `executeInternal`
 * (`CommandFactoryNoteOnEntity.java:295-303`) resolves cl1 BEFORE the note
 * (or its pending block) is ever created — CODE omitted AND no
 * `lastEntity` returns `CommandExecutionResult.error("Nothing to note to")`.
 * Checked HERE, at the OPEN line, for both the single-line and multi-line
 * forms — the multi-line form's actual upstream check runs at `end note`/
 * `}` once the body is known, but the body plays no part in this
 * condition, and the refusal's line number is not otherwise observable
 * through the routing/refusal gates (D3; mirrors the identical choice in
 * `class/class-command-notes.ts`'s `refuseNothingToNoteTo`, T7).
 */
function needsNothingToNoteTo(state: ParseState, targetId: string | undefined): boolean {
  return targetId === undefined && state.lastEntityId === undefined;
}

/** The `on-entity-single` and `on-entity-open` arms of `executeNoteOpen`,
 *  split out to keep that function under the project's NLOC cap. Both share
 *  the same "Nothing to note to" guard — see `needsNothingToNoteTo`'s doc. */
function executeNoteOnEntityOpen(
  state: ParseState,
  m: Extract<NoteOpenMatch, { kind: 'on-entity-single' | 'on-entity-open' }>,
): void {
  if (needsNothingToNoteTo(state, m.targetId)) {
    state.executionError = NOTHING_TO_NOTE_TO;
    return;
  }
  if (m.kind === 'on-entity-single') {
    attachNoteToEntity(state, m.position, m.targetId, m.text, m.decor);
    return;
  }
  state.pendingNote = {
    kind: 'on-entity',
    terminator: m.terminator,
    lines: [],
    position: m.position,
    targetId: m.targetId,
    decor: m.decor,
  };
}

export function executeNoteOpen(state: ParseState, m: NoteOpenMatch): void {
  if (m.kind === 'on-link-single') {
    attachNoteToLastLink(state, m.text, m.position, m.color);
    return;
  }
  if (m.kind === 'on-link-open') {
    state.pendingNote = {
      kind: 'on-link',
      terminator: 'endnote',
      lines: [],
      position: m.position,
      color: m.color,
    };
    return;
  }
  // `getIHtmlColorSet().getColor(s)` takes one colour, not the attribute form (`CommandFactoryNote.java:201-203`).
  if ((m.kind === 'floating-single' || m.kind === 'floating-open') && /[;:]/.test(m.decor.color ?? '')) {
    state.executionError = NO_SUCH_COLOR;
    return;
  }
  if (m.kind === 'floating-single') {
    emitNoteLeaf(state, m.id, m.text, m.decor);
    return;
  }
  if (m.kind === 'floating-open') {
    state.pendingNote = { kind: 'floating', terminator: 'endnote', lines: [], id: m.id, decor: m.decor };
    return;
  }
  executeNoteOnEntityOpen(state, m);
}

/** CommandMultilines2.executeNow: fires once the terminator line is seen,
 *  joining the accumulated body lines into the note's Display text. */
export function closePendingNote(state: ParseState): void {
  const pending = state.pendingNote;
  if (pending === undefined) return;
  state.pendingNote = undefined;
  if (pending.kind === 'on-link') {
    attachNoteToLastLink(state, removeEmptyColumns(pending.lines).join('\n'), pending.position, pending.color);
    return;
  }
  const text = removeEmptyColumns(pending.lines).join('\n');
  if (pending.kind === 'floating') {
    emitNoteLeaf(state, pending.id, text, pending.decor);
    return;
  }
  attachNoteToEntity(state, pending.position, pending.targetId, text, pending.decor);
}
