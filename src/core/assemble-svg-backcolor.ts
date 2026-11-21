/**
 * assemble-svg-backcolor.ts -- the body markup of `SvgGraphics`' constructor
 * paint for the four finalizers that share `svg-backcolor.ts#backcolorPaint`
 * (decisions.md D2: json/yaml/hcl, state, class, description). Its own module
 * so `assemble-svg.ts` and `assemble-svg-json.ts` both import it without a
 * cycle (dbp-T2a, 500-line split).
 */
import { backcolorPaint } from './svg-backcolor.js';
import type { Gradient } from './paint.js';

/**
 * The def (gradient only) followed by the (0,0) rect, as one string for the
 * content `<g>`'s first child. The def precedes the rect and every other draw,
 * so `svg-defs.ts#collectDocumentDefs` lifts it first and the seeded counter
 * gives it index 0, as the constructor mints it before any draw
 * (`SvgGraphics.java:181,393`). `''` when the constructor paints nothing
 * (`null`, `#00000000`, `#000000`, `#FFFFFF`, `:184-191`). The root
 * `background:` stays `document-shell.ts#assembleDocumentShell`'s, which
 * already omits it for a gradient (`backcolorString = null`, `:179`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/SvgGraphics.java:176-192,207-212
 */
export function backcolorMarkup(
  background: string | undefined,
  gradient: Gradient | undefined,
  width: number,
  height: number,
): string {
  const paint = backcolorPaint(background, gradient, width, height);
  return (paint.def ?? '') + (paint.rect ?? '');
}

/** The background `<rect>` `SvgGraphicsCore#paintBackcolor` writes as the
 *  klimt body's first child (non-default backgrounds only): the canvas origin,
 *  the fill (a hex, or `url(#id)` for a gradient), and `stroke:none`. */
const LEADING_BACKGROUND_RECT_RE =
  /^<rect x="0" y="0" width="\d+" height="\d+" fill="(#[0-9A-Fa-f]{3,8}|url\(#[^)"]+\))" style="stroke:none;"\/>/;

/** A gradient backcolor's rect fill (`SvgGraphics.java:178-183`: `"url(#" + id + ")"`). */
export const URL_PAINT_PREFIX = 'url(#';

/**
 * codd-T4: the jar's background rect belongs to the FINAL canvas, not to the
 * klimt body. `UgDiagram#getExporter` (`UgDiagram.java:169-178`) runs
 * `addChrome` (title, caption, ...) and only then `TextBlockUtils
 * .addBackcolor`, so the rect spans the chrome-composed canvas and precedes
 * the title group (`component/sugaca-11-boma467`). A klimt body's own rect,
 * sized to the margin-less block, is split off here and handed to the
 * assembler as `documentBackgroundRect` (the class engine's N48 mechanism).
 */
export function splitLeadingBackgroundRect(body: string): { body: string; documentBackgroundRect?: string } {
  const match = LEADING_BACKGROUND_RECT_RE.exec(body);
  if (match === null) return { body };
  return { body: body.slice(match[0].length), documentBackgroundRect: match[1]! };
}
