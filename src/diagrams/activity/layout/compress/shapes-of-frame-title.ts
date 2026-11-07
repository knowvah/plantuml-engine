/**
 * The compression slots a `USymbolFrame` title drawn as a plain block leaves
 * (`USymbolFrame.java:153-154`: `title.drawU(ug.apply(new UTranslate(3, 1)))`
 * under the `SlotFinder`): every shape the title block draws, each through
 * `SlotFinder#draw`'s own dispatch (`klimt/compress/SlotFinder.java:84-160`).
 * A `<$sprite>` atom draws its SVG shapes (`SvgNanoParser`), so a sprite
 * title occupies its drawn ellipses and paths, not its declared box.
 *
 * A text atom keeps the caller's single title-wide `'text'` shape
 * (`shapes-of-frame.ts#frameTitleShapes`); this recorder answers only whether
 * the block drew any `UText`, and the non-text shapes.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/compress/SlotFinder.java:84-160
 */
import type { UChange } from '../../../../core/klimt/UChange.js';
import type { UGraphic } from '../../../../core/klimt/UGraphic.js';
import type { UShape } from '../../../../core/klimt/UShape.js';
import type { StringBounder } from '../../../../core/klimt/font/StringBounder.js';
import { UGraphicNo } from '../../../../core/klimt/drawing/UGraphicNo.js';
import { UTranslate } from '../../../../core/klimt/UTranslate.js';
import { UStroke } from '../../../../core/klimt/UStroke.js';
import { Back } from '../../../../core/klimt/Back.js';
import { Fore } from '../../../../core/klimt/Fore.js';
import { CopyForegroundColorToBackgroundColor } from '../../../../core/klimt/CopyForegroundColorToBackgroundColor.js';
import { UEllipse } from '../../../../core/klimt/shape/UEllipse.js';
import { UEmpty } from '../../../../core/klimt/shape/UEmpty.js';
import { UPath } from '../../../../core/klimt/shape/UPath.js';
import { UPolygon } from '../../../../core/klimt/shape/UPolygon.js';
import { URectangle } from '../../../../core/klimt/shape/URectangle.js';
import { UText } from '../../../../core/klimt/shape/UText.js';
import type { TextBlock } from '../../../../core/klimt/shape/TextBlock.js';
import type { CompressShape } from './shapes-of.js';

/** What the title block drew: its non-text slot shapes, and whether any `UText`. */
export interface TitleDrawnShapes {
  readonly shapes: readonly CompressShape[];
  readonly drewText: boolean;
  /** Every `UText` drawn, at its drawn translate: `TextLimitFinder#drawText`'s input (`SlotFinder.java:127-135`). */
  readonly texts: readonly UText[];
  readonly textOrigins: readonly { readonly x: number; readonly y: number }[];
  /** The first shape drawn, of any kind, with its draw point: what `UGraphicCompressOnXorY` anchors a move on. */
  readonly first: { readonly isText: boolean; readonly x: number; readonly y: number } | undefined;
  /** The draw point of every `draw` call, in draw order (`UGraphicCompressOnXorY#draw` moves each by its own `ct()`). */
  readonly points: readonly { readonly x: number; readonly y: number }[];
}

interface Sink {
  readonly shapes: CompressShape[];
  drewText: boolean;
  readonly texts: UText[];
  readonly textOrigins: { x: number; y: number }[];
  first: { isText: boolean; x: number; y: number } | undefined;
  readonly points: { x: number; y: number }[];
}

/** A `SlotFinder`-shaped recorder: one {@link CompressShape} per drawn shape. */
class TitleShapeRecorder extends UGraphicNo {
  constructor(
    stringBounder: StringBounder,
    translate: UTranslate,
    private readonly sink: Sink,
  ) {
    super(stringBounder, translate);
  }

  apply(change: UChange): UGraphic {
    const supported =
      change instanceof UStroke ||
      change instanceof UTranslate ||
      change instanceof Back ||
      change instanceof Fore ||
      change instanceof CopyForegroundColorToBackgroundColor;
    if (!supported) throw new Error(`TitleShapeRecorder.apply: unsupported UChange ${change.constructor.name}`);
    const translate = change instanceof UTranslate ? this.getTranslate().compose(change) : this.getTranslate();
    return new TitleShapeRecorder(this.getStringBounder(), translate, this.sink);
  }

  /** `SlotFinder#draw`'s branches; a shape it has no branch for (`ULine`, `UImage`) leaves no slot. */
  draw(shape: UShape): void {
    const x = this.getTranslate().getDx();
    const y = this.getTranslate().getDy();
    this.sink.first ??= { isText: shape instanceof UText, x, y };
    this.sink.points.push({ x, y });
    if (shape instanceof UText) {
      this.sink.drewText = true;
      this.sink.texts.push(shape);
      this.sink.textOrigins.push({ x, y });
    } else if (shape instanceof URectangle) {
      this.sink.shapes.push({ kind: 'rect', x, y, width: shape.getWidth(), height: shape.getHeight() });
    } else if (shape instanceof UPath || shape instanceof UPolygon) {
      // `drawPath`/`drawPolygon` (`:110-116,146-155`): `[x + minX, x + maxX]`, `[y + minY, y + maxY]`.
      const box = { x: x + shape.getMinX(), y: y + shape.getMinY() };
      const size = { width: shape.getMaxX() - shape.getMinX(), height: shape.getMaxY() - shape.getMinY() };
      this.sink.shapes.push({ kind: 'polygon', ...box, ...size });
    } else if (shape instanceof UEllipse) {
      this.sink.shapes.push({ kind: 'ellipse', x, y, width: shape.getWidth(), height: shape.getHeight() });
    } else if (shape instanceof UEmpty) {
      this.sink.shapes.push({ kind: 'empty', x, y, width: shape.getWidth(), height: shape.getHeight() });
    }
  }
}

/** Every shape `title` draws at `(x, y)`, recorded as `SlotFinder` sees it. */
export function titleDrawnShapes(
  title: TextBlock,
  at: { x: number; y: number },
  bounder: StringBounder,
): TitleDrawnShapes {
  const sink: Sink = { shapes: [], drewText: false, texts: [], textOrigins: [], first: undefined, points: [] };
  title.drawU(new TitleShapeRecorder(bounder, new UTranslate(at.x, at.y), sink));
  return sink;
}
