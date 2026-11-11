/**
 * `DdotsAtom` and `VdotsAtom` (JLaTeXMath 1.0.7,
 * `~/git/plantuml/gradle/libs.versions.toml:12`, `javap -c -p` of the pinned
 * oracle jar): three `ldotp` dots, stacked with a `SpaceAtom(UNIT_MU, 0,
 * 4.0f, 0)` between them.
 */
import type { BuildBox, DotsAtom } from './atoms.js';
import type { Box } from './box.js';
import { ALIGN_CENTER, ALIGN_LEFT, ALIGN_RIGHT, VBox, hboxAligned, strutBox } from './box.js';
import { ldotsAtom } from './jlm-symbols.js';
import { scaledCharBox } from './row.js';
import { XHEIGHT_CM, muUnit } from './tex-font.js';
import { probeGlyph } from './katex-glyphs.js';

/** `SpaceAtom(UNIT_MU, 0, 4.0f, 0)`: the vertical gap, in mu. */
const DOT_GAP_MU = 4;

const dotBox = (style: number): Box => {
  const glyph = probeGlyph('\\ldotp') ?? { width: 0, height: 0, depth: 0, italic: 0 };
  return scaledCharBox({ glyph, xHeight: XHEIGHT_CM }, style);
};

/** `DdotsAtom#createBox`: the dot padded to the width of `ldots`, left,
 *  centre, right; height is the total, depth 0. */
function ddotsBox(style: number, build: BuildBox): Box {
  const width = build(ldotsAtom(), style).width;
  const gap = (): Box => strutBox(0, DOT_GAP_MU * muUnit(style), 0);
  const v = new VBox()
    .add(hboxAligned(dotBox(style), width, ALIGN_LEFT))
    .add(gap())
    .add(hboxAligned(dotBox(style), width, ALIGN_CENTER))
    .add(gap())
    .add(hboxAligned(dotBox(style), width, ALIGN_RIGHT));
  v.box.height += v.box.depth;
  v.box.depth = 0;
  return v.box;
}

/** `VdotsAtom#createBox`: dot, gap, dot, gap, dot; height is the total,
 *  depth 0. */
function vdotsBox(style: number): Box {
  const gap = (): Box => strutBox(0, DOT_GAP_MU * muUnit(style), 0);
  const v = new VBox().add(dotBox(style)).add(gap()).add(dotBox(style)).add(gap()).add(dotBox(style));
  v.box.height += v.box.depth;
  v.box.depth = 0;
  return v.box;
}

export const dotsBox = (atom: DotsAtom, style: number, build: BuildBox): Box =>
  atom.shape === 'ddots' ? ddotsBox(style, build) : vdotsBox(style);
