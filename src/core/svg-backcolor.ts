/**
 * The document background, decided once the way `SvgGraphics`' constructor
 * decides it -- a pure port of its three-way split so every finalizer that
 * has no verified copy of its own (json family, state, class, description)
 * calls ONE implementation instead of re-deriving the branches.
 *
 * `sequence` and `activity` keep their own verified copies
 * (`assemble-svg-sequence.ts#sequenceBackgroundRect`,
 * `assemble-svg-activity.ts#activityBackgroundRect`); they are not migrated
 * (decisions.md D2: no refactor while porting).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/SvgGraphics.java:176-192
 */

import { resolveColorToSvgHex } from './klimt/color/HColorSet.js';
import { paintToSvg } from './paint.js';
import type { Gradient } from './paint.js';
import { rect } from './svg.js';

/** What the constructor decides about the document background. */
export interface Backcolor {
  /** The `<linearGradient>` def; gradient only. The caller places it in the body,
   *  where `svg-defs.ts#collectDocumentDefs` lifts it into `<defs>` (the seeded
   *  def counter then renames its id), as the two verified finalizers do. */
  readonly def?: string;
  /** The (0,0) whole-canvas rect `paintBackcolor` appends to the root `<g>`. */
  readonly rect?: string;
  /** The root `style="...background:...;"` colour (`backcolorString`). */
  readonly rootBackground?: string;
}

/** `SvgGraphics.java:187-189`: the three resolved colours for which the
 *  constructor calls NO `paintBackcolor`. Resolved hex, compared as strings
 *  like the Java does (`color.equals(...)`). */
const TRANSPARENT_HEX = '#00000000';
const BLACK_HEX = '#000000';
const WHITE_HEX = '#FFFFFF';
const UNPAINTED_HEX: ReadonlySet<string> = new Set([TRANSPARENT_HEX, BLACK_HEX, WHITE_HEX]);

/** This port's un-resolved spelling of the jar's `#00000000`
 *  (`resolveColorToSvgHex('none')` returns `none`). */
const NONE_SPELLING = 'none';

/**
 * Port of `SvgGraphics`' constructor background branches plus the markup of
 * `paintBackcolor`; the rect is sized by the caller to the final canvas
 * (`finalizeRootAttributes`, `:819-821`: `format(maxX)` x `format(maxY)`, i.e.
 * the document-scale-1 `fmt` that `rect` applies -- NOT a truncation).
 *
 * - `gradient` set (`HColorGradient`, `:178-183`): the def plus a `url(#id)`
 *   rect, ALWAYS painted, and `backcolorString = null` -- no root background.
 *   `background` is not consulted.
 * - both undefined (`backcolor == null`, `:184-185`): nothing.
 * - otherwise (`:186-192`): `backcolorString` is the colour, so the root
 *   carries it -- except `#00000000`, which `finalizeRootAttributes` omits
 *   (`:805-806`). The rect is painted unless the colour is `#00000000`,
 *   `#000000` or `#FFFFFF`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/SvgGraphics.java:176-192,207-212,805-806,819-821
 */
export function backcolorPaint(
  background: string | undefined,
  gradient: Gradient | undefined,
  width: number,
  height: number,
): Backcolor {
  if (gradient !== undefined) {
    const { fill, def } = paintToSvg(gradient);
    // `paintToSvg` types `def` optional (plain strings carry none); a Gradient always does.
    return { ...(def === undefined ? {} : { def }), rect: backcolorRect(fill, width, height) };
  }
  if (background === undefined) return {};
  const color = background === NONE_SPELLING ? TRANSPARENT_HEX : resolveColorToSvgHex(background);
  const rootBackground = color === TRANSPARENT_HEX ? undefined : color;
  if (UNPAINTED_HEX.has(color)) return rootBackground === undefined ? {} : { rootBackground };
  return { rect: backcolorRect(color, width, height), rootBackground: color };
}

/** `paintBackcolor` (`:207-212`): `setFillColor(back)`, `setStrokeColor(null)`, a
 *  rect at (0,0). The same `rect(0, 0, w, h, { fill, stroke: 'none', strokeWidth: 1 })`
 *  call `assemble-svg-sequence.ts#maybeSequenceBackgroundRect` (`:53-60`; gradient `sequenceBackgroundRect` `:71-77`) and
 *  `assemble-svg-activity.ts#maybeActivityBackgroundRect` (`:62-69`; gradient `activityBackgroundRect` `:86-97`) make, so the
 *  fragment form is identical; the document pass normalises it to the jar's form. */
function backcolorRect(fill: string, width: number, height: number): string {
  return rect(0, 0, width, height, { fill, stroke: 'none', strokeWidth: 1 });
}
