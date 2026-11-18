/**
 * state-note-multiline.ts — the multi-line note reader's embed step (sne T2b, issue #168).
 *
 * Every multi-line state note (`note … of`, `note as N`, `note on link`) is a multi-line command upstream, read by
 * `PSystemCommandFactory#isMultilineCommandOk` (`PSystemCommandFactory.java:268-286`). Its reader takes a line that
 * opens an embedded diagram together with every line through the matching `}}` as ONE step
 * (`addOneSingleLineManageEmbedded2`, `:288-307`), so an `end note` inside `{{ … }}` is body, and an unterminated
 * `{{` takes the rest of the block: the command then never completes, no other command takes its first line, and the
 * diagram is a `Syntax Error?` at that line (`:169-175`). This module gives the state parser that step, through the
 * core's port of it (`core/command/multiline-candidate.ts`), and the refusal.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/command/PSystemCommandFactory.java:169-175,268-307
 */
import { StringLocated } from '../../core/tim/StringLocated.js';
import { BlocLines } from '../../core/utils/BlocLines.js';
import { getEmbeddedType } from '../../core/EmbeddedDiagram.js';
import { addOneSingleLineManageEmbedded2 } from '../../core/command/multiline-candidate.js';
import { refuse, type ParseRefusal } from '../../core/parse-refusal.js';
import type { UmlSource } from '../../core/block-extractor.js';
import type { ParseState } from './state-parse-state.js';

/**
 * The index after the embedded block line `i` opens (through its matching `}}`, or past the last line when none),
 * else `undefined`. `lines` are the walk's non-blank lines: a blank line neither opens nor closes an embed.
 */
export function embedBlockEnd(lines: readonly string[], i: number): number | undefined {
  if (getEmbeddedType(lines[i]!) === null) return undefined;
  const lineAt = (k: number): StringLocated => new StringLocated(lines[k]!, undefined);
  return addOneSingleLineManageEmbedded2(lineAt, lines.length, i, BlocLines.create()).nextIndex;
}

/** Where the open note's command began: its document position and its index in the block. */
export interface NoteOpener {
  readonly position: number;
  readonly index: number;
}

/** `isMultilineCommandOk` ran out of lines with the note still open: `getCandidate` finds no command for its first
 *  line, so `executeFewLines` answers `Syntax Error?` there, the trace counting that line (`:169-175`). */
export function unclosedNoteRefusal(opener: NoteOpener): ParseRefusal {
  return refuse('syntax', opener.position, opener.index + 1, 'Syntax Error?');
}

/** The walk's non-blank lines and each one's index in the block. */
export interface NoteWalkLines {
  readonly lines: readonly string[];
  readonly origIndex: readonly number[];
}

/** dss T3f: a blank line inside a note body is a line of the note (`BlocLines` holds every line); the walk visits the
 *  non-blank ones, so the gap before `next` is added here. No-op outside a note. Moved here from `parser.ts` (sne
 *  T2b). */
export function pushBlankNoteLines(ps: ParseState, block: UmlSource, previous: number, next: number): void {
  if (ps.pendingNote === null) return;
  for (let k = previous + 1; k < next; k++) ps.pendingNote.textLines.push(block.lines[k]!);
}

/**
 * The walk's note step for line `i`: the blank lines before it join an open note, and when the note is open and line
 * `i` opens an embedded block, every line of that block is note body ({@link embedBlockEnd}), an `end note` among
 * them too. Returns the index of the block's last line, or `undefined` when line `i` is left to the note closer and
 * the command dispatch.
 */
export function stepNoteLine(ps: ParseState, block: UmlSource, walk: NoteWalkLines, i: number): number | undefined {
  const { lines, origIndex } = walk;
  pushBlankNoteLines(ps, block, origIndex[i - 1]!, origIndex[i]!);
  const end = ps.pendingNote === null ? undefined : embedBlockEnd(lines, i);
  if (end === undefined) return undefined;
  for (let k = i; k < end; k++) {
    if (k > i) pushBlankNoteLines(ps, block, origIndex[k - 1]!, origIndex[k]!);
    ps.pendingNote!.textLines.push(block.lines[origIndex[k]!]!);
  }
  return end - 1;
}

/** After a dispatched line: where the open note's command began. A note open now was opened by this line (an open
 *  note's lines never reach the dispatch), else the previous answer stands. */
export function noteOpenerAfter(
  ps: ParseState,
  previous: NoteOpener | undefined,
  position: number,
  index: number,
): NoteOpener | undefined {
  return ps.pendingNote === null ? previous : { position, index };
}

/** A note still open when the walk ends never completed its multi-line command: {@link unclosedNoteRefusal}. */
export function pendingNoteRefusal(ps: ParseState, opener: NoteOpener | undefined): ParseRefusal | null {
  return ps.pendingNote !== null && opener !== undefined ? unclosedNoteRefusal(opener) : null;
}
