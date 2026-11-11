/**
 * `\underbrace` / `\overbrace`: `OverUnderDelimiter`, `OverUnderBox` and the
 * brace `DelimiterFactory#create(String, TeXEnvironment, float)` builds
 * (JLaTeXMath 1.0.7, `~/git/plantuml/gradle/libs.versions.toml:12`,
 * decompiled with `javap -c -p` from the pinned oracle jar).
 *
 * The brace glyphs' metrics are read from JLaTeXMath's font XML: KaTeX's
 * brace delimiters have other widths, and the width is what sizes the
 * result (`OverUnderBox` adds `del.getWidth()` to the height or depth).
 */
import type { BuildBox, OverUnderDelimiterAtom } from './atoms.js';
import type { Box } from './box.js';
import { ALIGN_CENTER, VBox, charBox, hboxAligned, strutBox } from './box.js';
import { PREC } from './row.js';
import { XHEIGHT_CM, sizeFactor } from './tex-font.js';

interface BraceGlyph {
  width: number;
  height: number;
  depth: number;
}

/**
 * `lbrace` (`jlm_cmsy10` code 102, `fonts/maths/jlm_cmsy10.xml:177`) and
 * `rbrace` (code 103, `:180`) with their `NextLarger` chains, which have
 * identical metrics: `jlm_cmex10` codes 169/170 (`fonts/base/jlm_cmex10.xml:27`,
 * `:30`), 110/111 (`:297`, `:300`), 189/190 (`:81`, `:84`), 40/41 (`:123`,
 * `:126`); the last continues into the extension chars 56/57.
 */
const BRACE_SIZES: readonly BraceGlyph[] = [
  { width: 0.500002, height: 0.75, depth: 0.25 },
  { width: 0.583336, height: 0.039999, depth: 1.160013 },
  { width: 0.666669, height: 0.039999, depth: 1.760019 },
  { width: 0.750002, height: 0.039999, depth: 2.360025 },
  { width: 0.80556, height: 0.039999, depth: 2.9600315 },
];

/** The extension pieces of `jlm_cmex10` codes 56/57 (`Extension top=56|57
 *  mid=60|61 bot=58|59 rep=62`, `jlm_cmex10.xml:163-166`): top and bottom
 *  (`:163`, `:169`), middle (`:175`), repeat (`:181`); none has a height. */
const EXTENSION_WIDTH = 0.888891;
const EXTENSION_TOP = 0.900009;
const EXTENSION_MIDDLE = 1.800018;
const EXTENSION_BOTTOM = 0.900009;
const EXTENSION_REPEAT = 0.300003;

const glyphBox = (g: BraceGlyph, f: number): Box => charBox(g.width * f, g.height * f, g.depth * f, 0, XHEIGHT_CM);

/** The extension `DelimiterFactory#create` stacks: top, middle, bottom, then
 *  repeat pieces until `height + depth` exceeds `width` (java loop at
 *  bytecode 253-341). Every piece has zero height, so where a repeat is
 *  inserted does not change the sum. */
function extensionBox(width: number, f: number): Box {
  const piece = (depth: number): Box => glyphBox({ width: EXTENSION_WIDTH, height: 0, depth }, f);
  const v = new VBox().add(piece(EXTENSION_TOP)).add(piece(EXTENSION_MIDDLE)).add(piece(EXTENSION_BOTTOM));
  while (v.box.height + v.box.depth <= width) v.add(piece(EXTENSION_REPEAT));
  return v.box;
}

/** `DelimiterFactory#create("lbrace"|"rbrace", env, width)`: the first
 *  glyph of the chain at least `width` tall, else the extension. */
export function braceBox(style: number, width: number): Box {
  const f = sizeFactor(style);
  const fit = BRACE_SIZES.find((g) => (g.height + g.depth) * f >= width);
  return fit === undefined ? extensionBox(width, f) : glyphBox(fit, f);
}

/**
 * `OverUnderDelimiter#createBox` for the macros' script-less atom, then
 * `OverUnderBox`'s constructor: the base padded to the delimiter's length,
 * and the delimiter's width added above (over) or below (under) it. The
 * kern is `SpaceAtom(UNIT_EX, 0, 0, 0)`'s height, 0.
 */
export function overUnderDelimiterBox(atom: OverUnderDelimiterAtom, style: number, build: BuildBox): Box {
  const raw = atom.base === undefined ? strutBox(0, 0, 0) : build(atom.base, style);
  const del = braceBox(style, raw.width);
  const maxWidth = Math.max(raw.width, del.height + del.depth);
  const base = maxWidth - raw.width > PREC ? hboxAligned(raw, maxWidth, ALIGN_CENTER) : raw;
  const height = base.height + (atom.over ? del.width : 0);
  const depth = base.depth + (atom.over ? 0 : del.width);
  return strutBox(base.width, height, depth);
}
