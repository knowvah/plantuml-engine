/**
 * EntityImageDescriptionTextMeasure -- the measuring half of `EntityImageDescriptionTextBlock.ts`
 * (`measureLine`, the per-line atom build, `LineMetrics`, the wrap), split out by a pure move only to keep
 * both files under this project's 500-line ceiling once `AtomText.java:179-181`'s 10-px run floor landed.
 * `EntityImageDescriptionTextBlock.ts` re-exports `measureLine`, so every import path is unchanged.
 */
import { asAtomOpenIconic } from '../../klimt/creole/atom/AtomOpenIconic.js';
import type { StringBounder } from '../../klimt/font/StringBounder.js';
import { getFont, type FontConfiguration } from '../../klimt/shape/UText.js';
import type { AtomImageResolver } from '../../creole-atoms.js';
import type { CreoleAtom } from '../../klimt/creole/atom/Atom.js';
import { SPACE_ATOM_HEIGHT } from '../../klimt/creole/atom/AtomSpace.js';
import { verticalAtomBox, bulletDimension, layoutLineThroughSea } from './creole-sea-line.js';
import { buildLineAtoms, type LineBuildAtoms } from '../../klimt/creole/legacy/StripeSimple.js';
import { getSplitted } from '../../klimt/creole/Fission.js';
import { atomTextWidth } from '../../klimt/creole/legacy/AtomText.js';
import { renderLatexAsImage } from '../../latex.js';
import { EMOJI_BOX_FACTOR, emojiBoxDim } from '../../klimt/creole/atom/AtomEmoji.js';

/**
 * SI15 T1 (ADR-1): widens `AtomImageResolver`'s `image` variant with the
 * optional raster-pixel fields `render-atoms.ts`'s producers
 * (`resolveSpriteAtom`/`resolveImgAtom`) now populate. Declared locally
 * rather than widening `AtomImageResolver` itself in `creole-atoms.ts` —
 * that module sits at this project's 500-line file cap; the resolver's
 * runtime shape already carries these fields (`render-atoms.ts`'s own
 * `ResolvedAtomImage`), only the shared static type doesn't expose them.
 */
export type ResolvedAtomImageWithRaster =
  | (Extract<ReturnType<AtomImageResolver>, { readonly kind: 'image' }> & {
      readonly rasterWidth?: number;
      readonly rasterHeight?: number;
    })
  | Exclude<ReturnType<AtomImageResolver>, { readonly kind: 'image' }>;

// ---------------------------------------------------------------------------
// Text construction seam — see EntityImageDescription.ts's doc comment
// ("Text-construction seam")
// ---------------------------------------------------------------------------

/** `AtomText.java:179-181`: the smallest height a text run measures. */
export const MIN_TEXT_RUN_HEIGHT = 10;

/** One measured text line: width/height/descent, read off the ACTIVE
 *  `StringBounder` (maintainer course-correction, 2026-07-10: no
 *  prop-drilled `measurer` parameter — the render-phase seam is
 *  `UGraphicSvg.build`'s own `measurer` param, which `getStringBounder()`
 *  already turns into real width/height/descent; see that method's doc
 *  comment). `getDescent` is optional on `StringBounder` (not every
 *  implementation carries it — e.g. hand-rolled test doubles); falling
 *  back to the same `size/4.5` approximation every measurer in this
 *  codebase already uses as its own descent formula
 *  (`FormulaMeasurer`/`WidthTableMeasurer`/`CanvasMeasurer`/
 *  `FixedMeasurer`, `measurer.ts`) keeps behavior sane for any caller not
 *  wired through the updated `UGraphicSvg`. */
export function measureLine(
  stringBounder: StringBounder,
  line: string,
  font: FontConfiguration,
): { width: number; height: number; rawHeight: number; descent: number } {
  const dim = stringBounder.calculateDimension(font, line);
  // Upstream AtomText.java:183-184: a run containing a tabulation takes
  // #getWidth's tab-stop tokenizer instead of the plain StringBounder width.
  // Tab-free runs short-circuit to the identical single measurement, so this
  // is a zero-diff change for every display without a tab.
  const width = atomTextWidth(line, font.size, (t) => stringBounder.calculateDimension(font, t).getWidth());
  const descent = stringBounder.getDescent?.(font, line) ?? font.size / 4.5;
  // `AtomText#calculateDimensionSlow` (AtomText.java:179-181): `if (h < 10) h = 10` -- the run's MEASURED height is
  // floored, but `drawU` (:215) places the baseline from the raw `rect.getHeight() - descent`, so both are returned.
  return { width, height: Math.max(dim.getHeight(), MIN_TEXT_RUN_HEIGHT), rawHeight: dim.getHeight(), descent };
}

export interface LineMetrics {
  width: number;
  height: number;
  /**
   * Each atom's box top within the line, parallel to the atoms: `Sea#getPosition(atom).getMinY()` after
   * `translateMinYto(0)`, the position `SheetBlock1#drawU` translates to before `Atom#drawU`
   * (`SheetBlock1.java:212-217`). A text run's baseline is its own `rect.getHeight() - descent` below this
   * (`AtomText.java:213-215`), so there is no single baseline per line.
   */
  top: readonly number[];
}

/**
 * Empirically-calibrated separator-atom footprint (jar-verified against
 * component/butebe-90-dozo380's queue3 -- `queue "queue1\n----\ntoto"`,
 * cross-checked structurally, not numerically, against component/
 * babafi-51-dixi026's actor `a` -- `"a\n====\ncan use b"`). Upstream's real
 * stacking is `SheetBlock1`/`StripeSimple`'s Atom-altitude system
 * (`CreoleHorizontalLine#getStartingAltitude() === 0`, TeX-box-style
 * ascent/descent placement) -- a substantially larger, unported creole
 * layout subsystem (G1 I4c's deferred "full char-atom subsystem" family,
 * now partially landed as of E2r/L1 — see `klimt/creole/`). `buildTextBlock`
 * here is a documented SCOPED SUBSTITUTE (naive top-down height-summing,
 * not the real Sheet algorithm), so reproducing the jar's exact box height
 * under this simpler model requires two DIFFERENT numbers, reverse-derived
 * from queue3's own box geometry (content height 36 = line1 14 + SEP +
 * line3 14 -> SEP contributes 8 to total block height) and its separator
 * `<line>`'s own drawn y (exactly at the cursor position BEFORE the
 * separator, no offset -- so only 4, half of the 8 total, is consumed
 * before the NEXT line's cursor starts; the other half is trailing space
 * after the last line, absorbed into the block's overall height by
 * `calculateDimension` alone). Width is not independently verified (no
 * sampled fixture has the bare separator as the WIDEST line); kept equal
 * to the draw-advance value as the least-surprising default. */
export const SEPARATOR_SIZE_HEIGHT = 8;
export const SEPARATOR_DRAW_ADVANCE = SEPARATOR_SIZE_HEIGHT / 2;
export const SEPARATOR_WIDTH_CONTRIBUTION = SEPARATOR_DRAW_ADVANCE;
export const SEPARATOR_DEFAULT_THICKNESS = 1;

/** One display line's classification plus its built atom sequence (E2r/L1,
 *  unified onto the shared lexer per creole-lexer-unification ADR-1) —
 *  `atoms` is empty for a `HORIZONTAL_LINE` line (nothing to measure/draw as
 *  text; `drawSeparatorLine` handles it directly), `lineFont` is the BASE
 *  font for `NORMAL`, or the heading-cascaded font
 *  (`fontConfigurationForHeading`) for `HEADING` — the font every atom on
 *  this line's OWN style flags/color start from before any nested
 *  `<b>`/`**`/etc. run adds more. Alias of `StripeSimple.ts`'s
 *  `LineBuildAtoms`, the shared shape both this renderer and
 *  `leaf-sizing.ts#creoleVisibleText` (the sizer) now consume. */
export type LineBuild = LineBuildAtoms;

/** Delegates to the shared lexer (`buildLineAtoms`, ADR-1). No font is
 *  threaded for the `<img>` cannot-decode fallback — that fallback is
 *  hardcoded inside `buildLineAtoms` itself (`StripeSimple.ts`'s
 *  `IMG_FALLBACK_FONT`, `sizer-footprint-parity` ADR-1); a PREVIOUS
 *  mission's `defaultFont` seam here is deleted. */
export function buildLine(line: string, font: FontConfiguration): LineBuild {
  return buildLineAtoms(line, font);
}

/**
 * The size an atom measures at: `AtomText#drawU` and `#calculateDimensionSlow` read
 * `fontConfiguration.getFont()`, which mutes a `<sub>`/`<sup>` run (`FontConfiguration.java:98-104`).
 */
export function measuringFont(fc: FontConfiguration): FontConfiguration {
  return { ...fc, size: getFont(fc).size };
}

/**
 * `Atom#calculateDimension` for one atom. An unresolved inline atom (`resolveAtomImage` returns `undefined`, or no
 * resolver supplied at all) contributes nothing, matching `StripeSimple.addSprite`'s "never added" behavior.
 */
function atomDimension(
  stringBounder: StringBounder,
  atom: CreoleAtom,
  resolveAtomImage: AtomImageResolver | undefined,
): { readonly width: number; readonly height: number } {
  if (atom.kind === 'text') return measureLine(stringBounder, atom.text, measuringFont(atom.font));
  if (atom.kind === 'latex') return renderLatexAsImage(atom.expr, atom.color ?? '#000000');
  // `AtomEmoji#calculateDimensionSlow`: the 36*factor square; its -3*factor altitude reaches the line through `Sea`.
  if (atom.kind === 'emoji') return { width: EMOJI_BOX_FACTOR * atom.factor, height: EMOJI_BOX_FACTOR * atom.factor };
  // `AtomSpace#calculateDimensionSlow`: (width, 1).
  if (atom.kind === 'space') return { width: atom.width, height: SPACE_ATOM_HEIGHT };
  // stdd T6d: `Bullet#calculateDimensionSlow` (`Bullet.java:57-62`).
  if (atom.kind === 'bullet') return bulletDimension(atom.order);
  // `AtomVerticalTexts#calculateDimensionSlow` (`AtomVerticalTexts.java:54-64`).
  if (atom.kind === 'vertical')
    return verticalAtomBox(atom.lines, (sub) => atomDimension(stringBounder, sub, resolveAtomImage));
  const glyph = atom.ambientFont === undefined ? undefined : asAtomOpenIconic(atom, atom.ambientFont);
  if (glyph !== undefined) {
    const dim = glyph.calculateDimension(stringBounder);
    return { width: dim.getWidth(), height: dim.getHeight() };
  }
  return resolveAtomImage?.(atom.atom, () => stringBounder) ?? { width: 0, height: 0 };
}

/**
 * One stripe through the real `Sea`, as `SheetBlock1#initMap` does (`SheetBlock1.java:130-152`): the width adds, each
 * atom hangs from the line by its own height and starting altitude (`Sea.java:72-80`), so `<sub>` grows a line's
 * bottom, `<sup>` its top, and a run shorter than `AtomText.java:179-181`'s floor sits inside its floored box. The
 * measuring half of `layoutLineThroughSea`; `dy` is unused here because this seam draws from `top`.
 */
export function measureAtomsWidthHeight(
  stringBounder: StringBounder,
  atoms: readonly CreoleAtom[],
  resolveAtomImage: AtomImageResolver | undefined,
): LineMetrics {
  const layout = layoutLineThroughSea(atoms, {
    dim: (atom) => atomDimension(stringBounder, atom, resolveAtomImage),
    drawHeight: () => 0,
    descent: () => 0,
    normalDescent: () => 0,
  });
  return { width: layout.width, height: layout.height, top: layout.top };
}

export function measureBuiltLine(
  stringBounder: StringBounder,
  built: LineBuild,
  resolveAtomImage: AtomImageResolver | undefined,
): LineMetrics {
  if (built.classification.type === 'HORIZONTAL_LINE') {
    return { width: SEPARATOR_WIDTH_CONTRIBUTION, height: SEPARATOR_SIZE_HEIGHT, top: [] };
  }
  return measureAtomsWidthHeight(stringBounder, built.atoms, resolveAtomImage);
}

/** Per-atom width only — upstream: `Neutron#getWidth(StringBounder)`,
 *  `Fission.ts#getSplitted`'s `measureAtomWidth` callback (E2r/L3,
 *  word-wrap). Mirrors `measureAtomsWidthHeight`'s per-atom width branch
 *  (kept separate rather than merged: that function also needs each
 *  atom's HEIGHT in the same pass, a different accumulation shape). */
export function measureSingleAtomWidth(
  stringBounder: StringBounder,
  atom: CreoleAtom,
  resolveAtomImage: AtomImageResolver | undefined,
): number {
  if (atom.kind === 'text') return measureLine(stringBounder, atom.text, measuringFont(atom.font)).width;
  if (atom.kind === 'latex') return renderLatexAsImage(atom.expr, atom.color ?? '#000000').width;
  // A2s R2i: emoji x-advance is the 36*factor box (see measureAtomsWidthHeight).
  if (atom.kind === 'emoji') return emojiBoxDim(atom.factor).width;
  if (atom.kind === 'space') return atom.width;
  if (atom.kind === 'bullet') return bulletDimension(atom.order).width;
  if (atom.kind === 'vertical') return measureAtomsWidthHeight(stringBounder, [atom], resolveAtomImage).width;
  const resolved = resolveAtomImage?.(atom.atom, () => stringBounder);
  return resolved === undefined ? 0 : resolved.width;
}

/**
 * Builds every `\n`-split raw line's `LineBuild` (E2r/L1, `buildLine`),
 * then word-wraps it (E2r/L3, `Fission.ts#getSplitted`) when `maxWidth > 0`
 * — one raw line may expand into MULTIPLE physical `LineBuild`s, each
 * reusing the raw line's own classification/heading-cascaded font (already
 * baked into every atom by `buildLine`; re-attaching it to each wrapped
 * sub-line is bookkeeping only, not a second application). A
 * `HORIZONTAL_LINE` line is never wrapped (upstream's `CreoleHorizontalLine`
 * stripe carries no text atoms for `Fission` to split — `buildLine`'s own
 * doc comment).
 */
export function buildWrappedLines(
  rawLines: readonly string[],
  font: FontConfiguration,
  resolveAtomImage: AtomImageResolver | undefined,
  stringBounder: StringBounder,
  maxWidth: number,
): readonly LineBuild[] {
  const result: LineBuild[] = [];
  for (const raw of rawLines) {
    const built = buildLine(raw, font);
    if (built.classification.type === 'HORIZONTAL_LINE' || maxWidth === 0) {
      result.push(built);
      continue;
    }
    const splitAtoms = getSplitted(built.atoms, maxWidth, (atom) =>
      measureSingleAtomWidth(stringBounder, atom, resolveAtomImage),
    );
    for (const sub of splitAtoms) {
      result.push({ classification: built.classification, atoms: sub, lineFont: built.lineFont });
    }
  }
  return result;
}
