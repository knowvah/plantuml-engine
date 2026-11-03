/**
 * Where the two operands of a state link's merged label block land (dss T3e).
 *
 * `SvekEdge.java:307-325` merges the `EntityImageNoteLink` block with the label block:
 * `mergeLR(noteOnly, labelOnly, CENTER)` for `Position.LEFT`, `mergeLR(labelOnly, noteOnly, CENTER)`
 * for `RIGHT`, `mergeTB(noteOnly, labelOnly, CENTER)` for `TOP`, `mergeTB(labelOnly, noteOnly, CENTER)`
 * otherwise; `:950-954` draws that one block at `labelXY` (the graphviz table corner), so the label's
 * `<text>` and the note's two `<path>`s land inside `<g class="link">`. `TextBlockHorizontal.java:78-93`
 * advances `x` by each operand's width and centres it vertically; `TextBlockVertical.java:77-99`
 * advances `y` by each operand's height and centres it horizontally.
 *
 * The reservation (the merged box handed to graphviz) is `core/edge-label-box.ts#computeMergedLabelBox`
 * and is not recomputed here. Class draws the same merge (`class/class-edge-note-box.ts`); the state
 * engine keeps its own operand offsets because its geometry types differ.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:307-325,950-954
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TextBlockVertical.java:77-99
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TextBlockHorizontal.java:78-93
 */
import type { NoteOnLinkPosition } from '../../core/edge-label-box.js';

interface Dim {
  readonly width: number;
  readonly height: number;
}

/** A point, the top-left of an operand inside the merged block. */
export interface Offset {
  readonly x: number;
  readonly y: number;
}

/** `mergeLR` / `mergeTB` of `SvekEdge.java:318-325`: whether the note leads, and along which axis. */
const NOTE_LEADS: Readonly<Record<NoteOnLinkPosition, boolean>> = {
  left: true,
  top: true,
  right: false,
  bottom: false,
};

/** Whether the note is drawn before the label (`SvekEdge.java:318-325`). */
export function noteDrawnFirst(position: NoteOnLinkPosition): boolean {
  return NOTE_LEADS[position];
}

/**
 * The offset of each operand from the merged block's top-left. `merged` is the merge's own (unfloored,
 * unshielded) dimension, the `dimtotal` of `TextBlockVertical#drawU` and the height `mergeLR` centres in.
 */
export function mergedOperandOffsets(
  position: NoteOnLinkPosition,
  note: Dim,
  label: Dim,
  merged: Dim,
): { readonly note: Offset; readonly label: Offset } {
  switch (position) {
    case 'left':
      return {
        note: { x: 0, y: (merged.height - note.height) / 2 },
        label: { x: note.width, y: (merged.height - label.height) / 2 },
      };
    case 'right':
      return {
        note: { x: label.width, y: (merged.height - note.height) / 2 },
        label: { x: 0, y: (merged.height - label.height) / 2 },
      };
    case 'top':
      return {
        note: { x: (merged.width - note.width) / 2, y: 0 },
        label: { x: (merged.width - label.width) / 2, y: note.height },
      };
    case 'bottom':
      return {
        note: { x: (merged.width - note.width) / 2, y: label.height },
        label: { x: (merged.width - label.width) / 2, y: 0 },
      };
  }
}

/** What {@link placeMergedOperands} needs: the merged block's corner and its operands' own dimensions. */
export interface MergedBlock {
  readonly position: NoteOnLinkPosition;
  /** The merged block's top-left (graphviz's table corner). */
  readonly anchor: Offset;
  readonly note: Dim;
  /** The label operand, `marginLabel` included on both sides (`SvekEdge.java:372-373`). */
  readonly label: Dim;
  readonly merged: Dim;
  readonly marginLabel: number;
  /** The label's first-line ascent: the baseline sits this far under the text's top. */
  readonly ascent: number;
}

/** The placed operands: the note's top-left, the label operand's rectangle, the label's baseline anchor. */
export interface MergedPlacement {
  readonly note: Offset;
  readonly labelBlock: Offset & Dim;
  readonly labelBaseline: Offset;
}

/**
 * Absolute placement of both operands (`TextBlockMarged#drawU` draws its block `marginLabel` in from the
 * operand corner, `SvekEdge.java:372-373`).
 */
export function placeMergedOperands(block: MergedBlock): MergedPlacement {
  const { anchor, label, marginLabel } = block;
  const offsets = mergedOperandOffsets(block.position, block.note, label, block.merged);
  const labelCorner = { x: anchor.x + offsets.label.x, y: anchor.y + offsets.label.y };
  return {
    note: { x: anchor.x + offsets.note.x, y: anchor.y + offsets.note.y },
    labelBlock: { ...labelCorner, ...label },
    labelBaseline: { x: labelCorner.x + marginLabel, y: labelCorner.y + marginLabel + block.ascent },
  };
}

/** An axis-aligned ink rectangle (`LabelInkBox`'s shape). */
export interface InkRect extends Offset, Dim {}

/** The bounding box of two ink rectangles (`LimitFinder` keeps only the min/max). */
export function unionInk(a: InkRect, b: InkRect): InkRect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return {
    x,
    y,
    width: Math.max(a.x + a.width, b.x + b.width) - x,
    height: Math.max(a.y + a.height, b.y + b.height) - y,
  };
}
