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
