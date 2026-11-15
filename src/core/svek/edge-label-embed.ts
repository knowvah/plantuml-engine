/**
 * edge-label-embed.ts — a svek link label whose display holds a `{{ … }}` line (ele T1a, issue #144).
 *
 * Upstream builds every link label with `link.getLabel().create0(…, CreoleMode.SIMPLE_LINE, …)`
 * (`SvekEdge.java:299-300`). `Display#create0` hands the lines to `CreoleParser#createSheetSlow`
 * (`CreoleParser.java:142-170`), whose loop turns a line where `EmbeddedDiagram.getEmbeddedType` hits into ONE
 * `EmbeddedDiagram` atom stripe: `EmbeddedDiagram.createAndSkip` consumes the same iterator through the matching
 * `}}` (`EmbeddedDiagram.java:97-115`). `SheetBlock1#initMap` then stacks the stripes (`SheetBlock1.java:115-171`).
 *
 * This module is the engine-neutral half of that: the walk ({@link splitEdgeLabelEmbeds}), the atom
 * ({@link edgeLabelEmbedAtom}) and the stacking arithmetic ({@link stackEdgeLabelStripes}). Each engine keeps its own
 * text-run measure and draw, so a label with no embed line never reaches this module (D2). It lives in core because
 * `tests/architecture/layering.test.ts` rule 2 keeps state, description and legacy activity from importing class's
 * `class-edge-label-embed.ts`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/legacy/CreoleParser.java:142-170
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/EmbeddedDiagram.java:97-152
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/creole/SheetBlock1.java:115-194
 */
import {
  EmbeddedDiagram,
  createAndSkipLines,
  getEmbeddedType,
  type NestedDiagramRenderer,
} from '../EmbeddedDiagram.js';
import { getNestedDiagramRenderer } from '../nested-diagram-registry.js';
import { HorizontalAlignment } from '../klimt/geom/HorizontalAlignment.js';
import type { StringBounder } from '../klimt/font/StringBounder.js';
import type { TextBlock } from '../klimt/shape/TextBlock.js';
import type { ISkinSimple } from '../style/ISkinSimple.js';
import { XDimension2D } from '../klimt/geom/XDimension2D.js';
import { UTranslate } from '../klimt/UTranslate.js';
import type { UGraphic } from '../klimt/UGraphic.js';

/** One run of a label's display lines: plain text lines, or one embed's `@start<type> … @end<type>` source. */
export type EdgeLabelSegment =
  | { readonly kind: 'text'; readonly lines: readonly string[] }
  | { readonly kind: 'embed'; readonly source: readonly string[] };

/**
 * `CreoleParser#createSheetSlow`'s walk (`CreoleParser.java:146-170`): a line that opens an embed hands the SAME
 * iterator to `createAndSkip` (`EmbeddedDiagram.java:97-115`), which consumes through the matching outer `}}`, or
 * through the last line when there is none. `undefined` when no line opens an embed: the caller keeps its text path.
 */
export function splitEdgeLabelEmbeds(lines: readonly string[]): readonly EdgeLabelSegment[] | undefined {
  const segments: EdgeLabelSegment[] = [];
  const it = lines[Symbol.iterator]();
  let text: string[] = [];
  let found = false;
  for (let step = it.next(); step.done !== true; step = it.next()) {
    const type = getEmbeddedType(step.value);
    if (type === null) {
      text.push(step.value);
      continue;
    }
    found = true;
    if (text.length > 0) segments.push({ kind: 'text', lines: text });
    text = [];
    segments.push({ kind: 'embed', source: createAndSkipLines(type, it) });
  }
  if (!found) return undefined;
  if (text.length > 0) segments.push({ kind: 'text', lines: text });
  return segments;
}

/** A renderer for when none is registered: its throw takes `EmbeddedDiagram`'s catch arm, 42x42 and logged
 *  (`EmbeddedDiagram.java:148-152`), as `state-composite-description-block.ts#nestedRenderer` does. */
const UNREGISTERED_RENDERER: NestedDiagramRenderer = {
  render(): TextBlock {
    throw new Error('edge label: no nested-diagram renderer is registered');
  },
};

/**
 * The stripe's one atom: `EmbeddedDiagram.from(skinParam, source)` (`EmbeddedDiagram.java:117-119`) through the
 * registered `NestedDiagramRenderer`. Its dimension is the nested document's own SVG size (`:129-133`); a failed render
 * is 42x42 (`:148-152`); a recursion-guard trip propagates (`EmbeddedDiagramDepthError`).
 */
export function edgeLabelEmbedAtom(source: readonly string[], skinParam: ISkinSimple | null): TextBlock {
  return EmbeddedDiagram.from(skinParam, source, getNestedDiagramRenderer() ?? UNREGISTERED_RENDERER);
}

/** The nested render measures with its own diagram's bounder, so the atom never reads the one it is handed. */
const EMBED_BOUNDER: StringBounder = {
  calculateDimension: () => new XDimension2D(0, 0),
};

/** An atom's `calculateDimension` (`EmbeddedDiagram.java:126-152`), memoized on the atom. */
export function edgeLabelEmbedDimension(atom: TextBlock): { width: number; height: number } {
  const dim = atom.calculateDimension(EMBED_BOUNDER);
  return { width: dim.getWidth(), height: dim.getHeight() };
}

/** `SheetBlock1#getCoef(HorizontalAlignment)` (`SheetBlock1.java:181-194`): CENTER 2, RIGHT 1, else 0. */
function getCoef(alignment: HorizontalAlignment | undefined): number {
  if (alignment === HorizontalAlignment.CENTER) return 2;
  if (alignment === HorizontalAlignment.RIGHT) return 1;
  return 0;
}

/** What {@link stackEdgeLabelStripes} returns: the block's dimension and each stripe's offset from its top-left. */
export interface StackedEdgeLabel {
  readonly width: number;
  readonly height: number;
  readonly offsets: readonly { readonly dx: number; readonly dy: number }[];
}

/**
 * `SheetBlock1#initMap` (`SheetBlock1.java:115-171`): each stripe starts where the previous one ended (`y += height`,
 * `:139-143`), the block is as wide as its widest stripe (`:150-153`, `calculateDimension` `:203-206`), and a narrower
 * stripe shifts right by `(maxWidth - own) / coef` (`:155-166`). An embed stripe is not a `StripeSimple`, so its coef
 * is the sheet's alignment (`:173-178`); a text stripe's cell alignment is the same sheet alignment.
 */
export function stackEdgeLabelStripes(
  stripes: readonly { readonly width: number; readonly height: number }[],
  align: HorizontalAlignment | undefined,
): StackedEdgeLabel {
  const width = stripes.reduce((max, s) => Math.max(max, s.width), 0);
  const coef = getCoef(align);
  let y = 0;
  const offsets = stripes.map((s) => {
    const diff = width - s.width;
    const offset = { dx: diff > 0 && coef > 0 ? diff / coef : 0, dy: y };
    y += s.height;
    return offset;
  });
  return { width, height: y, offsets };
}

/**
 * ele T2a: a label's stripes as one `TextBlock`, for an engine that measures and draws its label through a text
 * block (`SvekEdge#drawLabelBlock`, description's DOT box). A text segment is one engine-built block of its lines;
 * stacking a multi-line segment as one stripe is the same arithmetic as `SheetBlock1`'s per-line stripes, since each
 * line is already aligned inside the segment by the same coef (`SheetBlock1.java:155-166`).
 */
class EdgeLabelSheetBlock implements TextBlock {
  constructor(
    private readonly stripes: readonly TextBlock[],
    private readonly align: HorizontalAlignment | undefined,
  ) {}

  private stack(stringBounder: StringBounder): StackedEdgeLabel {
    return stackEdgeLabelStripes(
      this.stripes.map((s) => {
        const dim = s.calculateDimension(stringBounder);
        return { width: dim.getWidth(), height: dim.getHeight() };
      }),
      this.align,
    );
  }

  /** `SheetBlock1#calculateDimension` (`SheetBlock1.java:203-206`): the widest stripe by the summed heights. */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    const { width, height } = this.stack(stringBounder);
    return new XDimension2D(width, height);
  }

  /** `SheetBlock1#drawU` (`SheetBlock1.java:224-232`): each stripe at its own offset. */
  drawU(ug: UGraphic): void {
    const { offsets } = this.stack(ug.getStringBounder());
    this.stripes.forEach((stripe, i) => stripe.drawU(ug.apply(new UTranslate(offsets[i]!.dx, offsets[i]!.dy))));
  }
}

/**
 * The label block of display `lines` when one opens an embed, else `undefined` (D2: the engine keeps its text block).
 * `textBlock` builds a text segment's block the way the engine builds a whole label today.
 */
export function edgeLabelSheetBlock(
  lines: readonly string[],
  textBlock: (lines: readonly string[]) => TextBlock,
  align: HorizontalAlignment | undefined,
): TextBlock | undefined {
  const segments = splitEdgeLabelEmbeds(lines);
  if (segments === undefined) return undefined;
  const stripes = segments.map((s) => (s.kind === 'text' ? textBlock(s.lines) : edgeLabelEmbedAtom(s.source, null)));
  return new EdgeLabelSheetBlock(stripes, align);
}
