/**
 * The per-run and table emitters every state text path shares (`renderStateRuns`, `renderStateTable`),
 * split out of `renderer-box.ts` (stdd T5a, 500-line cap): `AtomText#drawU`'s runs with `Sea`'s baseline,
 * and `AtomTable#drawU`'s cells and rules. Pure move; `renderer-box.ts` re-exports both.
 */
import { line, text, linkWrap, image, ellipse, rect } from '../../core/svg.js';
import type { CreoleRunBullet } from '../../core/svek/image/creole-text-run-types.js';
import type { StateTableGeo, StateTextRun } from './state-sizing-creole.js';
import type { CreoleRunImage } from '../../core/svek/image/creole-text-lines.js';
import { creoleRunImageHref } from '../../core/svek/image/creole-run-sprite.js';
import type { Paint } from '../../core/paint.js';

/** `FontStyle` set -> the SVG `text-decoration` attribute value -- mirrors
 *  `core/klimt/drawing/svg/driver-text-svg.ts#textDecorationOf` (same
 *  keywords, same join order), duplicated for the same reason
 *  `class/renderer-classifier-rows.ts#memberAtomDecoration` documents: the
 *  state renderer has no `UDriver`/`UGraphic` seam to share one from. */
function runDecoration(run: StateTextRun): string | undefined {
  const parts: string[] = [];
  if (run.underline) parts.push('underline');
  if (run.strike) parts.push('line-through');
  return parts.length > 0 ? parts.join(' ') : undefined;
}

/**
 * SI30 D2/D3: `Sea`'s own baseline reconstruction (`creole-sea-line.ts`'s
 * own doc comment) -- `lineTop + lineHeight - unmutedSize/4.5 + dy`. stdd T4b:
 * the seam now carries `CreoleTextRun.unmutedSize` for a `<sup>`/`<sub>` run
 * (muted by 3, `FontPosition.java:51-60`), so the descent term is the size
 * `Sea` measured with; exact for every run (exposant-03, juvagu-33).
 */
function runBaseline(lineTop: number, lineHeight: number, run: StateTextRun): number {
  // stdd T4b: the UNMUTED size (`CreoleTextRun.unmutedSize`), as `creole-sea-line.ts`'s `dy` contract states;
  // exposant-03/juvagu-33: the jar's `<sub>`/`<sup>` baseline sits 3/4.5 above the muted-size reconstruction.
  return lineTop + lineHeight - (run.unmutedSize ?? run.size) / 4.5 + run.dy;
}

/**
 * A `<math>`/`<latex>` run's image -- `AtomMath#drawU`'s own
 * `ug.draw(svg)`/`ug.draw(image)` (`AtomMath.java:78-97`), drawn at the
 * atom's own `Position`, which `SheetBlock1#drawU` translates to before
 * calling it (`SheetBlock1.java:212-217`). `image.top` is that position's
 * own y inside the line, so `lineTop + top` is the box corner; there is no
 * baseline term, because an image has no baseline (`AtomMath
 * #getStartingAltitude` returns 0, `AtomMath.java:73-75`).
 *
 * `svg-shapes.ts#image` is the repo's ONE `<image>` emitter, and its
 * attribute order is `SvgGraphics#svgImageDataUri`'s.
 */
function runImage(img: CreoleRunImage, x: number, lineTop: number, style: RunStyle): string {
  // unwind2-S11: a `<$sprite>` draws its raster box, tinted over the
  // element's back (`creole-run-sprite.ts`).
  const href = creoleRunImageHref(img, style.fill, style.back);
  return image(x, lineTop + img.top, img.rasterWidth ?? img.width, img.rasterHeight ?? img.height, href);
}

/** What a run is drawn with: the font family/colour and, for a sprite's
 *  tint, the `Back` the owner applied (`EntityImageStateCommon#applyColor`,
 *  `EntityImageStateCommon.java:131-140`). */
interface RunStyle {
  readonly fontFamily: string;
  readonly fill: string;
  readonly back?: Paint;
  /** stdd T1d: the whole block is bold (a package title, `plantuml.skin:72-76`). */
  readonly fontWeight?: '700';
}

/**
 * One creole line's styled runs, left to right, x-advancing by each run's
 * OWN measured width -- the SAME per-`<text>`-element sequence the jar
 * emits (`AtomText#drawU` once per atom; jar-verified `xasoka-58-temi462`
 * and `papifi-44-caxo706`). A `[[url]]` run wraps in its own `<a href>`
 * (`class/renderer-classifier-rows.ts#renderRowAtoms`'s identical rule).
 * `run.color` is set only when the creole resolved one, so the caller's
 * `StateFontColor` cascade still supplies the default.
 *
 * SI30 D3: each run now draws at its OWN `font-size` (`run.size`) and its
 * own `<sup>`/`<sub>`-adjusted baseline ({@link runBaseline}) instead of one
 * shared `style.fontSize`/`y` for the whole line -- the per-run `<size:N>`
 * fix this task's own report names (a `<size:20>` NORMAL run inside an
 * otherwise-14pt line now draws at 20, not the line's shared size).
 * `lineTop`/`lineHeight` are the line's own top edge and `Sea`-computed
 * height (`state-sizing-creole.ts#StateStyledTextLine.height`).
 */
/** `Bullet#drawU` (`Bullet.java:63-71`): the font colour as fill and background, stroke thickness 0; order 0 is a
 *  5x5 ellipse translated 3 px in, a deeper order a 3.5 square at `1 + 8 * order`, each at the atom's own top
 *  (`SheetBlock1.java:212-217`). gopudo-91's `* a list`: `<ellipse cx="17.5" cy="42.5" rx="2.5" ry="2.5" fill="#000"/>`. */
function bulletMarkup(bullet: CreoleRunBullet, x: number, lineTop: number, fill: string): string {
  const top = lineTop + bullet.top;
  if (bullet.order === 0) return ellipse(x + 3 + 2.5, top + 2.5, 2.5, 2.5, { fill });
  return rect(x + 1 + 8 * bullet.order, top, 3.5, 3.5, { fill });
}

/** One text run's `<text>` (`AtomText#drawU`), inside its `<a>` when the run carries a url. */
function runTextMarkup(run: StateTextRun, x: number, y: number, style: RunStyle): string {
  const decoration = runDecoration(run);
  const drawn = text(x + (run.drawDx ?? 0), y, run.text, {
    fill: run.color ?? style.fill,
    fontFamily: style.fontFamily,
    fontSize: run.size,
    lengthAdjust: 'spacing',
    textLength: run.drawWidth ?? run.width,
    ...(run.bold || style.fontWeight !== undefined ? { fontWeight: '700' as const } : {}),
    ...(run.italic ? { fontStyle: 'italic' as const } : {}),
    ...(decoration !== undefined ? { textDecoration: decoration } : {}),
  });
  return run.url !== undefined ? linkWrap(drawn, { url: run.url, tooltip: run.url }) : drawn;
}

export function renderStateRuns(
  runs: readonly StateTextRun[],
  startX: number,
  lineTop: number,
  lineHeight: number,
  style: RunStyle,
): string {
  let x = startX;
  let out = '';
  for (const run of runs) {
    // `AtomText#drawU`'s tab-stop skip (`AtomText.java:216-221`) -- see
    // `StateTextRun.dx`'s own doc comment.
    x += run.dx ?? 0;
    if (run.image !== undefined) {
      out += runImage(run.image, x, lineTop, style);
      x += run.image.width;
      continue;
    }
    if (run.bullet !== undefined) {
      out += bulletMarkup(run.bullet, x, lineTop, run.color ?? style.fill);
      x += run.width;
      continue;
    }
    if (run.text === '') continue;
    out += runTextMarkup(run, x, runBaseline(lineTop, lineHeight, run), style);
    x += run.width;
  }
  return out;
}

/** The ambient `UStroke` a table's rules are drawn with: its thickness and
 *  dash pattern (`UStroke`, the same pair a state border carries). */
export interface TableRuleStroke {
  readonly strokeWidth: number;
  readonly strokeDasharray?: string;
}

/**
 * A creole TABLE stripe (`AtomTable#drawU`, `AtomTable.java:106-158`):
 * every cell's own runs at its `Position` (LEFT-aligned, no padding), then
 * the grid -- one horizontal rule per row boundary spanning the full table
 * width, one vertical rule per column boundary spanning the full height.
 * `x`/`y` are the table's own origin, i.e. the block's top-left PLUS
 * `AtomWithMargin`'s own `marginY1` (`AtomWithMargin.java:65`).
 * jar-verified `kinuca-03-nice683` byte-for-byte (cells at x=12/63.363/
 * 114.725, baselines 43.889/57.889/71.889, rules at y=33/47/61/75 and
 * x=12/63.363/114.725/166.087, `stroke:#000;stroke-width:1`).
 */
export function renderStateTable(
  table: StateTableGeo,
  x: number,
  y: number,
  style: {
    readonly fontFamily: string;
    readonly fontSize: number;
    readonly fill: string;
    readonly ascent: number;
    /** stdd T5a, ubt-T2b: the ambient `UStroke` the grid rules take -- a note's own
     *  `style.getStroke()` (`EntityImageNote.java:292-297`, 0.5), a leaf state's
     *  (`EntityImageState.java:130-132`), else {@link TABLE_RULE_WIDTH}. */
    readonly ruleStroke?: TableRuleStroke;
  },
): string {
  let out = '';
  for (const cell of table.cells) {
    // `lineTop = y + cell.y`, `lineHeight = style.fontSize` reproduces the
    // pre-SI30 `y + cell.y + style.ascent` baseline byte-for-byte for every
    // NORMAL cell run (`runBaseline`'s own doc comment) -- a table cell
    // carries no `<sup>`/`<sub>` in this corpus, so this is the SAME number,
    // not a new one.
    out += renderStateRuns(cell.runs, x + cell.x, y + cell.y, style.fontSize, {
      fontFamily: style.fontFamily,
      fill: style.fill,
    });
  }
  const lastX = x + (table.colX[table.colX.length - 1] as number);
  const lastY = y + (table.rowY[table.rowY.length - 1] as number);
  const stroke = { stroke: style.fill, ...(style.ruleStroke ?? { strokeWidth: TABLE_RULE_WIDTH }) };
  for (const ry of table.rowY) out += line(x, y + ry, lastX, y + ry, stroke);
  for (const cx of table.colX) out += line(x + cx, y, x + cx, lastY, stroke);
  return out;
}

/** `AtomTable#drawU`'s grid rules are drawn with the ambient `UStroke`,
 *  which for a creole block is the 1px default (`UStroke.simple()`) --
 *  jar-verified `kinuca-03-nice683`'s `stroke-width:1`. */
const TABLE_RULE_WIDTH = 1;
