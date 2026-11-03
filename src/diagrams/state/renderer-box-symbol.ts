/**
 * The `<<O-O>>` symbol of a state box (G8), split out of `renderer-box.ts` (500-line cap, dss T3c).
 * `renderer-box.ts` re-exports both functions, so every importer is unchanged.
 */
import { ellipse, line } from '../../core/svg.js';
import { STATE_BORDER_STROKE_WIDTH } from './state-render-colors.js';

/** `EntityImageState#drawSymbol` (`EntityImageState.java:174-181`) with
 *  `smallRadius = 3`, `smallLine = 3`, `smallMarginX = 7`, `smallMarginY = 4`
 *  (`:71-74`): the box's bottom-right corner is walked back by
 *  `4*smallRadius + smallLine + smallMarginX` (22) in x and
 *  `2*smallRadius + smallMarginY` (10) in y -- the SAME 10 px
 *  `state-sizing.ts#OO_SYMBOL_DELTA` reserves on both axes -- then two
 *  `2*smallRadius` circles and a `smallLine`-long horizontal connector are
 *  drawn. `ug.apply(borderColor)` sets only the FOREGROUND, so the circles
 *  keep the box's own background fill. jar-verified `resido-15-reza040`'s
 *  `comp3` (box 7,14.611 72x50): ellipses at cx=60/69 cy=57.611 r=3, line
 *  63,57.611 -> 66,57.611, all `stroke:#181818;stroke-width:0.5`.
 * @see ~/git/plantuml/.../svek/image/EntityImageState.java#drawSymbol */
const OO_SMALL_RADIUS = 3;
const OO_SMALL_LINE = 3;
const OO_SMALL_MARGIN_X = 7;
const OO_SMALL_MARGIN_Y = 4;

/** `Stereotype#isWithOOSymbol` (`Stereotype.java:119-121`) -- the SAME
 *  predicate `state-sizing.ts#isWithOOSymbol` reserves space with. */
export function isOOSymbolStereotype(stereotype: string | undefined): boolean {
  return stereotype !== undefined && stereotype.toUpperCase() === 'O-O';
}

export function renderOOSymbol(right: number, bottom: number, fill: string, stroke: string): string {
  const x = right - (4 * OO_SMALL_RADIUS + OO_SMALL_LINE + OO_SMALL_MARGIN_X);
  const y = bottom - (2 * OO_SMALL_RADIUS + OO_SMALL_MARGIN_Y);
  // `ellipse`'s own paint bag is keyed by the HYPHENATED SVG attribute name
  // (unlike `rect`/`line`'s camelCase `TextStyle`) -- see
  // `renderer-border-point.ts`'s identical note.
  const paint = { fill, stroke, 'stroke-width': STATE_BORDER_STROKE_WIDTH };
  const cy = y + OO_SMALL_RADIUS;
  return (
    ellipse(x + OO_SMALL_RADIUS, cy, OO_SMALL_RADIUS, OO_SMALL_RADIUS, paint) +
    ellipse(x + OO_SMALL_LINE + 3 * OO_SMALL_RADIUS, cy, OO_SMALL_RADIUS, OO_SMALL_RADIUS, paint) +
    line(x + 2 * OO_SMALL_RADIUS, cy, x + 2 * OO_SMALL_RADIUS + OO_SMALL_LINE, cy, {
      stroke,
      strokeWidth: STATE_BORDER_STROKE_WIDTH,
    })
  );
}
