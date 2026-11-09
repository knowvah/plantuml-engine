/**
 * The note commands' line shapes and their position default, split out of `dispatch-support.ts` (500-line cap, dss T4a).
 * Consumed by `note-dispatch.ts`.
 */

/**
 * Single-line note: "(floating )?note (left|right)? (#color)? : text" —
 * direction, the leading `floating` keyword, and the color are each
 * optional. When direction is omitted the note defaults to floating to
 * the right of the previous activity (matches upstream PlantUML
 * behaviour). `floating`/color were missing entirely before (mission
 * add2-T2e, D6): `giteso-65-mefo026`'s `floating note right: …` and
 * `xolazi-74-vamu265`'s `note right #blue :sad note is sad` both refused
 * against this. The COLOR group mirrors `ColorParser.COLOR_REGEXP`
 * (`#\w+[-\|/]?\w+`, gradient-separator included); group 3 captures it
 * (add4-T1c: `ActivityNote.color`, `CommandNote3.java:65-67`'s
 * `simpleColor(ColorType.BACK)`), `text` is the text and `stereo` the optional `<<stereotype>>` between the colour
 * and the `:` (`StereotypePattern.optional("STEREO")`, `CommandNote3.java:69`).
 * @see net/sourceforge/plantuml/activitydiagram3/command/CommandNote3.java:60-71
 *   -- `TYPE (note|floating note)`, `POSITION (left|right)?`,
 *   `color().getRegex()`, then the literal `:`, then `NOTE (.*)` (`:81`): an
 *   empty note text matches (aar-T1b, `nabako-16-gefo071`'s `floating note: `).
 * @see net/sourceforge/plantuml/klimt/color/ColorParser.java:43-46
 */
export const RE_NOTE_SINGLE =
  /^(?:(floating)\s+)?note(?:\s+(left|right))?\s*(#\w+[-\\|/]?\w+)?\s*(?<stereo><<.+?>>)?\s*:\s*(?<text>.*)$/i;

/**
 * `(floating )?note (left|right)?` (multi-line, closed by {@link
 * RE_NOTE_END}) — direction defaults to LEFT when absent ({@link
 * defaultLeftPosition}). `floating`/color, same doc as {@link
 * RE_NOTE_SINGLE} above (`razuzu-32-faje125`'s bare `floating note
 * right`, `tajuxe-32-sexo680`'s `note left #aabbcc`).
 * `stereo` precedes `color` here, the order of `CommandNoteLong3.getRegexConcat`.
 * @see net/sourceforge/plantuml/activitydiagram3/command/CommandNoteLong3.java:131-141
 */
export const RE_NOTE_MULTI =
  /^(?:(floating)\s+)?note(?:\s+(left|right))?\s*(?<stereo><<.+?>>)?\s*(?<color>#\w+[-\\|/]?\w+)?\s*$/i;

/** `NotePosition.java:43-48` -- `defaultLeft(s)`: `null` (no `left`/`right`
 *  keyword in the source line, group 2 of {@link RE_NOTE_SINGLE}/{@link
 *  RE_NOTE_MULTI} not participating) resolves to `LEFT`, never `RIGHT`.
 *  `CommandNote3.java:123`/`CommandNoteLong3.java` both call it the same
 *  way on the same regex group. `activity-divergence-drive-3` T2a (family
 *  NOTELEFT): was an unsourced `direction === 'left' ? 'left' : 'right'`
 *  in `node-dispatch.ts`'s `tryNoteSingle`/`tryNoteMulti`, which defaulted
 *  the OTHER way. */
export function defaultLeftPosition(direction: string | undefined): 'left' | 'right' {
  return direction === 'right' ? 'right' : 'left';
}

/** `end note` / `endnote` -- single OPTIONAL space between the two words
 *  (upstream's `%s` sentinel, same convention as {@link
 *  RE_CLOSE_GROUP_LEGACY}'s `end\s?group`), not the zero-OR-MORE `\s*`
 *  {@link RE_ENDIF}/{@link RE_ENDWHILE} use. Before this (mission
 *  add2-T2e, D6) `tryNoteMulti`'s closer checked the literal string
 *  `'end note'` only, so `razuzu-32-faje125`'s one-word `endnote` closer
 *  never matched and the note body swallowed the rest of the diagram.
 * @see net/sourceforge/plantuml/activitydiagram3/command/CommandNoteLong3.java:48-49
 *   -- `Pattern2.cmpile("^end[%s]?note$")`.
 * @see net/sourceforge/plantuml/regex/Pattern2.java:57
 *   -- `%s` expands to `[\s ]` (normal or non-breaking space).
 */
export const RE_NOTE_END = /^end[\s ]?note$/i;
