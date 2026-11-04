/**
 * Note nodes of the state-diagram AST -- split out of ./ast.ts (which re-exports them, keeping every import
 * path) when that file passed the repo's 500-line cap (stdd T6c).
 */

// ---------------------------------------------------------------------------

export type NotePosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * A note attached to a state (`note <pos> of <State> : text`, or the
 * bracketed/`end note` multi-line forms) or freestanding (`note as N1 ...
 * end note`). State diagrams have no relationship syntax, so a freestanding
 * note's alias has no later reference site — it exists purely so the note
 * text is captured under a stable id.
 * @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnEntity.java
 * @see ~/git/plantuml/.../command/note/CommandFactoryNote.java
 */
export interface StateNote {
  /** Generated layout id (e.g. `__note_0`) for attached notes; the
   *  user-declared alias for freestanding notes. */
  id: string;
  /** Host state id the note is attached to (attached notes only). */
  target?: string;
  /**
   * True when `target` came from falling back to the last-created state
   * rather than an explicit `of <State>` clause — mirrors the
   * `CommandFactoryNote`(bare)/`CommandFactoryNoteOnEntity`(`of`) split in
   * the class engine's note handling (see class ast.ts's `ClassNote`).
   */
  implicitTarget?: true;
  position?: NotePosition;
  /** Note body (may contain newlines for multi-line notes). */
  text: string;
  /**
   * The composite scope active when the `note` command was parsed (`''` at
   * the diagram's top level, else the owning composite's `State.id`) --
   * mission A4 Phase L iter 9. Mirrors upstream's leaf placement: a note is
   * `diagram.reallyCreateLeaf`d under `quarkInContext(...)`, which resolves
   * relative to `getCurrentGroup()` -- the SAME "current parsing scope"
   * convention `FlatLink.scopeId` (state-composite-detect.ts) already uses
   * for `'[*]'` pseudostates. Drives which svek pass
   * (state-composite-pass.ts) the note's own DOT node is emitted into.
   * @see ~/git/plantuml/.../command/note/CommandFactoryNoteOnEntity.java:329-330
   * @see ~/git/plantuml/.../command/note/CommandFactoryNote.java:192
   */
  scopeId: string;
  /**
   * mission G4 S10 (notes never render): the parse-time creation tick
   * (`nextCreationIndex`) this note's own entity was stamped with -- same
   * raw-value contract as `State.creationIndex`/`Transition.creationIndex`
   * (see those fields' own doc comments). For an ATTACHED note (`target !==
   * undefined`), upstream burns an EXTRA tick immediately before this one
   * (`CommandFactoryNoteOnEntity.java:327`'s `diagram.getUniqueSequence("GMN")`
   * -- generates the note's internal quark name, `reallyCreateLeaf` then
   * ticks AGAIN for the entity's own id) -- the burned tick's result is
   * discarded (the `GMN<n>` string only ever reaches `data-qualified-name`,
   * which `tests/oracle/svg-conformance/normalize.ts` strips before
   * comparison entirely, so this port never threads the string itself, only
   * the tick-count it consumes) -- jar-verified `gedude-95-subi666`/
   * `xodazu-26-cube992` (`id="ent0005"` after 4 prior ticks: start-pseudo,
   * state1, the `[*]-->state1` transition, the burned GMN tick). A
   * freestanding note (`CommandFactoryNote`, has an explicit `as <alias>`)
   * never generates a GMN name (`quarkInContext` uses the alias directly),
   * so it consumes exactly ONE tick. `undefined` only for a hand-built test
   * literal predating this mission.
   * @see ~/git/plantuml/.../net/atmp/CucaDiagram.java#cpt1
   */
  creationIndex?: number;
  /**
   * mission G4 S12: the note's own raw `#color`/`#back:color;...` inline
   * override -- the SAME raw grammar shape `State.color` uses (see that
   * field's own doc comment), resolved to a hex fill at RENDER time via
   * `renderer-note.ts`'s note-fill resolver (mirrors `state-render-
   * colors.ts#resolveStateFill`'s exact FILL-only precedent -- a note's
   * border/stroke is never overridden by this token, matching jar's
   * `EntityImageNote` ctor, which only reads `getColors().getColor(BACK)`).
   * A GRADIENT token (`#color1|color2`, `#color1-color2`, …) is NOT resolved
   * this iteration -- `resolveColorToSvgHex` (the SAME limitation
   * `state-render-colors.ts#resolveStateBucketBackground`'s own doc comment
   * already names for the `skinparam`-bucket path) passes it through
   * unresolved; full `Paint`/gradient threading for state notes AND state
   * boxes is a separate, larger, not-yet-built mechanism (`plans/g4-state-
   * svg/ledger.md` S12 queue).
   * @see ~/git/plantuml/.../klimt/image/EntityImageNote.java (ctor)
   */
  color?: string;
  /** stdd T3d: the raw `[[...]]` token of a multi-line note opener (`CommandFactoryNoteOnEntity.java:241-244,336`). */
  url?: string;
}
