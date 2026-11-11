/**
 * Horizontal typesetting: `RowAtom.createBox`, the glyph boxes of `CharAtom`
 * and `SymbolAtom`, `SpaceAtom`, and the inter-atom glue they get
 * (JLaTeXMath 1.0.7, `~/git/plantuml/gradle/libs.versions.toml:12`).
 */
import type { Atom, BuildBox, CharAtom, FontGlyph, SpaceAtom } from './atoms.js';
import { leftType, rightType } from './atoms.js';
import type { Box } from './box.js';
import type { Ligature } from './kern.js';
import { kernBetween, ligatureOf } from './kern.js';
import { HBox, addItalicCorrectionToWidth, charBox, hbox, strutBox } from './box.js';
import {
  STYLE_TEXT,
  TYPE_BIG_OPERATOR,
  TYPE_BINARY_OPERATOR,
  TYPE_CLOSING,
  TYPE_INNER,
  TYPE_OPENING,
  TYPE_ORDINARY,
  TYPE_PUNCTUATION,
  TYPE_RELATION,
  glueWidth,
  interwordSpace,
  param,
  sizeFactor,
} from './tex-font.js';

/** `TeXFormula.PREC` (`TeXFormula.java:112`). */
export const PREC = 0.0000001;

/** `DefaultTeXFont#getChar(…, style)` → `new CharBox(c)`: the glyph's
 *  metrics scaled by the style's size factor. */
export function scaledCharBox(fg: FontGlyph, style: number): Box {
  const f = sizeFactor(style);
  const g = fg.glyph;
  return charBox(g.width * f, g.height * f, g.depth * f, g.italic * f, fg.xHeight);
}

/** `SymbolAtom#createBox` for a big operator (`SymbolAtom.java`): the
 *  display style takes the next larger glyph, centred on the axis, with its
 *  italic correction as a trailing strut. */
export function bigOperatorSymbolBox(atom: CharAtom, style: number): Box {
  const c = style < STYLE_TEXT && atom.larger !== undefined ? atom.larger : atom.glyph;
  const cb = scaledCharBox(c, style);
  cb.shift = -(cb.height + cb.depth) / 2 - param('axisheight', style);
  const delta = c.glyph.italic * sizeFactor(style);
  return delta > PREC ? hbox(cb, strutBox(delta, 0, 0)) : hbox(cb);
}

/** `CharAtom#createBox`/`SymbolAtom#createBox`. */
export function charAtomBox(atom: CharAtom, style: number): Box {
  return atom.type === TYPE_BIG_OPERATOR ? bigOperatorSymbolBox(atom, style) : scaledCharBox(atom.glyph, style);
}

/** `Glue.get(l, r, env)` as a box. */
export const glueBox = (left: number, right: number, style: number): Box =>
  strutBox(glueWidth(left, right, style), 0, 0);

/** `SpaceAtom.MUSKIP` sizes: `TeXConstants.java:92-97`. */
const THINMUSKIP = 1;
const MEDMUSKIP = 2;

/** `SpaceAtom#createBox` (`SpaceAtom.java`): a muskip is the glue between a
 *  given type and a big operator, so medium and thick spaces vanish in
 *  script styles. */
export function spaceBox(atom: SpaceAtom, style: number): Box {
  const s = atom.space;
  if ('blank' in s) return strutBox(interwordSpace(style), 0, 0);
  if ('em' in s) return strutBox(s.em(style), 0, 0);
  const bl = Math.abs(s.muskip);
  const left = bl === THINMUSKIP ? TYPE_INNER : bl === MEDMUSKIP ? TYPE_BINARY_OPERATOR : TYPE_RELATION;
  const w = glueWidth(left, TYPE_BIG_OPERATOR, style);
  return strutBox(s.muskip < 0 ? -w : w, 0, 0);
}

/** `RowAtom.binSet` (`RowAtom.java:80-85`). */
const BIN_SET: ReadonlySet<number> = new Set([
  TYPE_BINARY_OPERATOR,
  TYPE_BIG_OPERATOR,
  TYPE_RELATION,
  TYPE_OPENING,
  TYPE_PUNCTUATION,
]);

/** `Dummy`: an element whose type `changeToOrd` may override. */
export interface Dummy {
  atom: Atom;
  type: number | undefined;
}

const dummyLeft = (d: Dummy): number => d.type ?? leftType(d.atom);
const dummyRight = (d: Dummy): number => d.type ?? rightType(d.atom);

/** `RowAtom#changeToOrd`: a binary operator with nothing to bind becomes
 *  ordinary. */
function changeToOrd(cur: Dummy, prev: Dummy | undefined, next: Atom | undefined): void {
  if (dummyLeft(cur) === TYPE_BINARY_OPERATOR && (prev === undefined || BIN_SET.has(dummyRight(prev)) || !next)) {
    cur.type = TYPE_ORDINARY;
    return;
  }
  if (next !== undefined && dummyRight(cur) === TYPE_BINARY_OPERATOR) {
    const nextType = leftType(next);
    if (nextType === TYPE_RELATION || nextType === TYPE_CLOSING || nextType === TYPE_PUNCTUATION) {
      cur.type = TYPE_ORDINARY;
    }
  }
}

const isKern = (atom: Atom): boolean => atom.kind === 'space';

/** `RowAtom.ligKernSet` (`RowAtom.<clinit>`): the left types of a next atom
 *  that may ligate or kern with a glyph before it: 0 through 6. */
const LIG_KERN_SET: ReadonlySet<number> = new Set([
  TYPE_ORDINARY,
  TYPE_BIG_OPERATOR,
  TYPE_BINARY_OPERATOR,
  TYPE_RELATION,
  TYPE_OPENING,
  TYPE_CLOSING,
  TYPE_PUNCTUATION,
]);

/** `FixedCharAtom(CharFont)`: the glyph a ligature produced (type ORDINARY). */
function fixedChar(prev: CharAtom, lig: Ligature): CharAtom {
  return {
    kind: 'char',
    type: TYPE_ORDINARY,
    limits: 'nolimits',
    glyph: { glyph: lig.glyph, xHeight: prev.glyph.xHeight },
    mathChar: false,
    cf: lig.cf,
  };
}

/** The ligature or kern between two glyphs: `RowAtom#createBox`'s inner loop
 *  (java 269-434). `cur` is replaced by each ligature it forms with the atom
 *  after it, which is consumed; the kern of the first pair that does not
 *  ligate follows `cur`. Returns the final glyph, the kern, and how many
 *  following atoms were consumed. */
function ligKern(cur: Dummy, rest: readonly Atom[], style: number): { kern: number; consumed: number } {
  let consumed = 0;
  for (let next = rest[consumed]; next !== undefined; next = rest[consumed]) {
    const at = cur.atom;
    if (dummyRight(cur) !== TYPE_ORDINARY || at.kind !== 'char') break;
    if (next.kind !== 'char' || !LIG_KERN_SET.has(leftType(next))) break;
    const [left, right] = [at.cf, next.cf];
    const lig = left === undefined || right === undefined ? undefined : ligatureOf(left, right);
    if (lig === undefined) {
      const kern = left === undefined || right === undefined ? 0 : kernBetween(left, right, sizeFactor(style));
      return { kern, consumed };
    }
    cur.atom = fixedChar(at, lig);
    cur.type = undefined;
    consumed++;
  }
  return { kern: 0, consumed };
}

/**
 * `RowAtom#createBox` (`RowAtom.java:145-255`): glue between neighbours by
 * type, none around a kern, a math-mode `CharAtom`'s italic correction added
 * to its width, and the ligatures and kerns of adjacent same-font glyphs
 * (`ligKern`). A `RowAtom` element is handed the previous atom
 * (`Dummy#setPreviousAtom`, java 492-498; `RowAtom` implements `Row`), so
 * its first elements are glued to what precedes the nested row; `inherited`
 * is that atom.
 */
export function rowBox(elements: readonly Atom[], style: number, build: BuildBox, inherited?: Dummy): Box {
  const h = new HBox();
  let prev = inherited;
  for (let i = 0; i < elements.length; i++) {
    const at = elements[i] as Atom;
    // java:157-167: a break mark is skipped unless nothing follows it.
    if (at.kind === 'break' && i + 1 < elements.length) continue;
    const cur: Dummy = { atom: at, type: undefined };
    changeToOrd(cur, prev, elements[i + 1]);
    const { kern, consumed } = ligKern(cur, elements.slice(i + 1), style);
    i += consumed;
    // java:437-440: `previousIndex() != 0`, the first element is never glued.
    if (i !== 0 && prev !== undefined && !isKern(prev.atom) && !isKern(cur.atom)) {
      h.add(glueBox(dummyRight(prev), dummyLeft(cur), style));
    }
    const b = cur.atom.kind === 'row' ? rowBox(cur.atom.elements, style, build, prev) : build(cur.atom, style);
    if (cur.atom.kind === 'char' && cur.atom.mathChar) addItalicCorrectionToWidth(b);
    h.add(b);
    if (Math.abs(kern) > PREC) h.add(strutBox(kern, 0, 0));
    if (!isKern(cur.atom)) prev = cur;
  }
  return h.box;
}
