/** The activity note node, split out of `ast.ts` (500-line cap, dss T4a); `ast.ts` re-exports it. */

export interface ActivityNote {
  kind: 'note';
  text: string;
  position: 'left' | 'right';
  swimlane?: string;
  /** add4-T1c: `#color` (BACK, `#` kept) / `floating` (NoteType.FLOATING_NOTE); absent = omitted. @see CommandNote3.java:121-123 */
  color?: string;
  floating?: true;
  /** `<<foo>>` (`STEREO`): the label whose `.foo { }` style re-signs the note. @see CommandNote3.java:76-79 */
  stereotype?: string;
}
