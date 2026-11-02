/**
 * assemble-svg-json.ts -- json/yaml/hcl's per-diagram body finalization
 * (formerly `json/renderer-shell.ts#assembleJsonShell`), dispatched from
 * `assemble-svg.ts#finalizeShellFragment`. Moved out of that file (500-line
 * hook cap, dbp-T2a); see its header for why the finalize work lives in core
 * (decisions.md D1/D2 of the T8 mission).
 */
import type { RenderFragment } from './dispatcher.js';
import { group } from './svg.js';
import { spliceIntoContentGroup } from './assemble-svg-splice.js';
import { backcolorMarkup } from './assemble-svg-backcolor.js';
import { resolveColorToSvgHex } from './klimt/color/HColorSet.js';
import { exportTo } from './TextBlockExporter.js';

/**
 * The document background `SvgGraphics`' constructor paints
 * (`SvgGraphics.java:176-192`, via `assemble-svg-backcolor.ts#backcolorMarkup`):
 * a gradient always (def + `url(#…)` rect); a plain colour unless it is
 * `#00000000`, `#000000` or `#FFFFFF` (`:187-191`) -- the black case draws no
 * rect (`tests/fixtures/document-background/json-black.svg`), white spelled
 * any way (`!theme plain` -> `"white"`, `json/vogeku-38-soxe333`) and
 * transparent neither (`json/sevaji-38-xita618`). The solid rect is the
 * `rect(…, { stroke: 'none' })` this family always emitted (`svg.ts
 * #strokeDecorationOf` drops the stroke width for `stroke:none`), jar-verified
 * against the five non-default-background fixtures of this family's corpus.
 */
function jsonBackgroundRect(fragment: RenderFragment, width: number, height: number): string {
  return backcolorMarkup(fragment.background, fragment.backgroundGradient, width, height);
}

/**
 * jff-T2a (decisions.md D1): a json/yaml/hcl producer that handed over its
 * RAW chromed block ({@link RenderFragment.exportMargin}) is exported the way
 * `UgDiagram#getExporter` (`UgDiagram.java:123-139`) exports every json
 * diagram: `addChrome` (`:128`), `TextBlockUtils.addBackcolor` (`:130-132`,
 * which only carries the colour, `TextBlockUtils.java:152-174`, into
 * `TextBlockExporter.Builder`, `TextBlockExporter.java:427-428,491`), then
 * {@link exportTo} (`TextBlockExporter.java:159-177`: margin shift, factor
 * over block + margin, canvas `trunc(dim + 1) x factor`).
 *
 * The back-colour rect is NOT part of the shifted, scaled block: `SvgGraphics`'
 * constructor paints it (`SvgGraphics.java:176-192`, `paintBackcolor`
 * `:207-212`) when `createUGraphic` runs (`TextBlockExporter.java:169`,
 * `:285`), before the margin translate (`:173`), as the root `<g>`'s first
 * child at (0,0); `finalizeRootAttributes` then sizes it `format(maxX)` x
 * `format(maxY)` (`SvgGraphics.java:819-821`) -- the same numbers as the root
 * `width`/`height` (`:810-811`), i.e. {@link exportTo}'s scaled canvas. So it
 * is spliced AFTER the export, at the exported size.
 */
function exportJsonTextBlock(fragment: RenderFragment): RenderFragment {
  const body = fragment.bodyWrapped === true ? fragment.body : group(fragment.body);
  const exported = exportTo(fragment, body);
  const backgroundRect = jsonBackgroundRect(fragment, exported.width, exported.height);
  return { ...exported, body: spliceIntoContentGroup(exported.body, backgroundRect) };
}

/**
 * json/yaml/hcl's per-diagram body finalization -- also canonicalizes
 * `fragment.background` itself (not just the body), since
 * `assembleDocumentShell` writes it verbatim into the root `style` and a
 * themed `"white"` would otherwise reach the document as
 * `background:white` where the jar writes `background:#FFFFFF`
 * (`json/vogeku-38-soxe333`, `!theme plain`) -- matching class's own
 * resolve-before-shell convention (N4). A fragment carrying `exportMargin`
 * then runs the export tail ({@link exportJsonTextBlock}); without it the
 * producer already exported its block and only the back-colour rect is added,
 * at the truncated canvas.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/drawing/svg/SvgGraphics.java:176-192
 */
export function finalizeJsonFragment(fragment: RenderFragment): RenderFragment {
  const canonical =
    fragment.background === undefined
      ? fragment
      : { ...fragment, background: resolveColorToSvgHex(fragment.background) };
  if (canonical.exportMargin !== undefined) return exportJsonTextBlock(canonical);
  const backgroundRect = jsonBackgroundRect(canonical, Math.trunc(canonical.width), Math.trunc(canonical.height));
  const body =
    fragment.bodyWrapped === true
      ? spliceIntoContentGroup(fragment.body, backgroundRect)
      : group(backgroundRect + fragment.body);
  return { ...canonical, body };
}
