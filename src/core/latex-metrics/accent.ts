/**
 * Accents and over/under lines: `AccentedAtom`, `OverlinedAtom` and
 * `UnderlinedAtom` (JLaTeXMath 1.0.7, `~/git/plantuml/gradle/libs.versions.toml:12`,
 * decompiled with `javap -c -p` from the pinned oracle jar).
 *
 * The accent glyphs' metrics are read from JLaTeXMath's own font XML rather
 * than from KaTeX: KaTeX draws `\vec`, `\hat` ... as SVG paths or from other
 * code points, so it exposes no glyph with these metrics.
 */
import type { AccentAtom, BuildBox, FontGlyph, OverlinedAtom, UnderlinedAtom } from './atoms.js';
import type { Box } from './box.js';
import { ALIGN_CENTER, VBox, hbox, hboxAligned, strutBox } from './box.js';
import { PREC, scaledCharBox } from './row.js';
import { XHEIGHT_CM, crampStyle, param, sizeFactor, xHeight } from './tex-font.js';

const cm = (width: number, height: number, italic = 0): FontGlyph => ({
  glyph: { width, height, depth: 0, italic },
  xHeight: XHEIGHT_CM,
});

/**
 * `PredefMacros#accent_macros` commands (`PredefinedCommands`: `hat` 62,
 * `tilde` 64, `acute` 65, `grave` 66, `ddot` 67, `mathring` 69, `bar` 70,
 * `breve` 71, `check` 72, `vec` 73, `dot` 74) → the accent symbol
 * (`fonts/base/jlm_base.map.xml:58-72`) and its glyph. Every glyph is
 * `jlm_cmr10` (`fonts/latin/jlm_cmr10.xml`) but `vec`, which is
 * `jlm_cmmi10_unchanged` code 126
 * (`fonts/base/jlm_cmmi10_unchanged.xml:131`, italic 0.153819). None has a
 * `NextLarger` or a depth. x-height of both fonts is 0.430555
 * (`jlm_cmr10.xml:2`, `jlm_cmmi10_unchanged.xml:2`).
 */
const ACCENT_GLYPHS: Readonly<Record<string, FontGlyph>> = {
  grave: cm(0.500002, 0.694445), // jlm_cmr10.xml:29 (code 181)
  acute: cm(0.500002, 0.694445), // jlm_cmr10.xml:30 (code 182)
  check: cm(0.500002, 0.628473), // jlm_cmr10.xml:31 (code 183)
  breve: cm(0.500002, 0.694445), // jlm_cmr10.xml:32 (code 184)
  bar: cm(0.500002, 0.567777), // jlm_cmr10.xml:33 (code 185)
  mathring: cm(0.750002, 0.694445), // jlm_cmr10.xml:34 (code 186)
  hat: cm(0.500002, 0.694445), // jlm_cmr10.xml:234 (code 94)
  dot: cm(0.277779, 0.667859), // jlm_cmr10.xml:235 (code 95)
  tilde: cm(0.500002, 0.667859), // jlm_cmr10.xml:371 (code 126)
  ddot: cm(0.500002, 0.667859), // jlm_cmr10.xml:372 (code 196)
  vec: cm(0.500002, 0.714444, 0.153819), // jlm_cmmi10_unchanged.xml:131
};

/** The accent glyph for a macro name, or `undefined` when `accent_macros`
 *  does not build it. */
export const accentGlyph = (name: string): FontGlyph | undefined => ACCENT_GLYPHS[name];

const emptyBox = (): Box => strutBox(0, 0, 0);

/**
 * `AccentedAtom#createBox` with `acc` false and `changeSize` true: the
 * accent is the unscaled display-style `CharBox`, pulled down by
 * `min(base.height, x-height)` onto the base, centred over it and shifted by
 * the base character's skew. `hasNextLarger` is false for every accent glyph
 * (see `ACCENT_GLYPHS`), so the `getNextLarger` loop never runs.
 */
export function accentedBox(atom: AccentAtom, style: number, build: BuildBox): Box {
  const base = atom.base === undefined ? emptyBox() : build(atom.base, crampStyle(style));
  const w = base.width;
  const under = atom.underbase;
  const skew = under?.kind === 'char' ? (under.glyph.glyph.skew ?? 0) * sizeFactor(style) : 0;
  const gap = Math.min(base.height, xHeight(style, atom.accent.xHeight));
  const accent = scaledCharBox(atom.accent, style);
  const hb = Math.abs(accent.italic) > PREC ? hbox(strutBox(-accent.italic, 0, 0), accent) : accent;
  const delta = (w - hb.width) / 2;
  hb.shift = skew + (delta > 0 ? delta : 0);
  const below = delta < 0 ? hboxAligned(base, hb.width, ALIGN_CENTER) : base;
  const v = new VBox()
    .add(hb)
    .add(strutBox(0, -gap, 0))
    .add(below);
  const total = v.box.height + v.box.depth;
  v.box.depth = below.depth;
  v.box.height = total - below.depth;
  if (delta >= 0) return v.box;
  const wrapped = hbox(strutBox(delta, 0, 0), v.box);
  wrapped.width = w;
  return wrapped;
}

/**
 * `OverlinedAtom#createBox`: `OverBar(base, 3t, t)` over the cramped base,
 * its depth the base's and its height the base's plus `5t`, `t` being
 * `getDefaultRuleThickness(style)`.
 */
export function overlinedBox(atom: OverlinedAtom, style: number, build: BuildBox): Box {
  const t = param('defaultrulethickness', style);
  const base = atom.base === undefined ? emptyBox() : build(atom.base, crampStyle(style));
  const bar = new VBox()
    .add(strutBox(0, t, 0))
    .add(strutBox(base.width, t, 0))
    .add(strutBox(0, 3 * t, 0))
    .add(base);
  bar.box.depth = base.depth;
  bar.box.height = base.height + 5 * t;
  return bar.box;
}

/**
 * `UnderlinedAtom#createBox`: the base, a `3t` strut and a rule `t` thick as
 * wide as the base; depth the base's plus `5t`, height the base's.
 */
export function underlinedBox(atom: UnderlinedAtom, style: number, build: BuildBox): Box {
  const t = param('defaultrulethickness', style);
  const base = atom.base === undefined ? emptyBox() : build(atom.base, style);
  const v = new VBox()
    .add(base)
    .add(strutBox(0, 3 * t, 0))
    .add(strutBox(base.width, t, 0));
  v.box.depth = base.depth + 5 * t;
  v.box.height = base.height;
  return v.box;
}
