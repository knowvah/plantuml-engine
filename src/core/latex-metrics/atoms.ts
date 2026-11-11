/**
 * The atom model JLaTeXMath typesets, reduced to what sizing needs, and the
 * type queries glue and scripts read from it. `latex-metrics.ts` dispatches
 * `createBox` over it.
 *
 * Each atom kind mirrors one JLaTeXMath class (JLaTeXMath 1.0.7,
 * `~/git/plantuml/gradle/libs.versions.toml:12`); the class is named on the
 * kind. Glyph metrics are KaTeX's (`katex-glyphs.ts`), resolved to the right
 * font when the atom is built (`convert.ts`), so an atom carries its glyph
 * rather than a font id.
 */
import type { Align, Box } from './box.js';
import type { CharFont } from './kern.js';
import type { Glyph } from './katex-glyphs.js';
import { TYPE_BIG_OPERATOR, TYPE_INNER, TYPE_ORDINARY } from './tex-font.js';

/** `Atom.type_limits`: `TeXConstants.SCRIPT_NORMAL`/`SCRIPT_LIMITS`/
 *  `SCRIPT_NOLIMITS`. `Atom.java:74` defaults it to NOLIMITS. */
export type Limits = 'normal' | 'limits' | 'nolimits';

/** A glyph and the x-height of the font it is drawn from. */
export interface FontGlyph {
  glyph: Glyph;
  xHeight: number;
}

/** `CharAtom` (a math- or text-mode `[0-9a-zA-Z]`) or `SymbolAtom` (every
 *  other symbol). `mathChar` is `Dummy#isCharInMathMode`. A big-operator
 *  symbol also carries its display-size successor (`hasNextLarger`). */
export interface CharAtom {
  kind: 'char';
  type: number;
  limits: Limits;
  glyph: FontGlyph;
  mathChar: boolean;
  larger?: FontGlyph;
  /** `CharSymbol#getCharFont`, where the kern/ligature tables know it. */
  cf?: CharFont;
}

/** `RowAtom`. */
export interface RowAtom {
  kind: 'row';
  elements: Atom[];
}

/** `SpaceAtom`: `Dummy#isKern`. `muskip` is a `\,`/`\:`/`\;` glue type
 *  (signed), `blank` the interword space, otherwise `width(style)`. */
export interface SpaceAtom {
  kind: 'space';
  space: { muskip: number } | { blank: true } | { em: (style: number) => number };
}

/** `ScriptsAtom`. */
export interface ScriptsAtom {
  kind: 'scripts';
  base: Atom | undefined;
  sub: Atom | undefined;
  sup: Atom | undefined;
}

/** `BigOperatorAtom` (type BIG_OPERATOR, `BigOperatorAtom.java`). */
export interface BigOperatorAtom {
  kind: 'bigop';
  type: number;
  base: Atom;
  under: Atom | undefined;
  over: Atom | undefined;
}

/** `FractionAtom` (type INNER unless a group made it ORDINARY). */
export interface FractionAtom {
  kind: 'frac';
  type: number;
  num: Atom | undefined;
  den: Atom | undefined;
  rule: boolean;
}

/** `NthRoot` (type ORDINARY, the `Atom` default). */
export interface NthRootAtom {
  kind: 'sqrt';
  type: number;
  body: Atom;
  index: Atom | undefined;
}

/** A delimiter's glyph and its `NextLarger` successors, smallest first. */
export interface Delimiter {
  sizes: FontGlyph[];
  /** The `Extension rep` glyph of a delimiter whose `NextLarger` chain ends
   *  in an extension char: stacked until tall enough
   *  (`DelimiterFactory#create(String, TeXEnvironment, float)`). */
  repeat?: FontGlyph;
}

/** `FencedAtom` (always INNER, `FencedAtom.java:96-102`). */
export interface FencedAtom {
  kind: 'fenced';
  left: Delimiter | undefined;
  body: Atom;
  right: Delimiter | undefined;
}

/** `TypedAtom`: fixed left/right types over a body. */
export interface TypedAtom {
  kind: 'typed';
  left: number;
  right: number;
  limits: Limits;
  body: Atom;
}

/** `RomanAtom`/`BoldAtom`/`TextStyleAtom`/`ColorAtom`-free wrappers: their
 *  type is the `Atom` default ORDINARY and they box as their body. A
 *  `style` is `StyleAtom`'s forced style. */
export interface WrapAtom {
  kind: 'wrap';
  type: number;
  body: Atom;
  style?: number;
}

/** `PhantomAtom(el, false, true, true)`: the empty script base. */
export interface PhantomAtom {
  kind: 'phantom';
  body: Atom;
}

/** `MatrixAtom`'s environment (`MatrixAtom.ARRAY`/`MatrixAtom.MATRIX`, the
 *  private `type` field the `array` and `matrix` environments pass its
 *  constructor, `PredefMacros#arrayATATenv_macro`/`#matrixATATenv_macro`). */
export type MatrixEnv = 'array' | 'matrix';

/** `MatrixAtom`: a grid of cells (`ArrayOfAtoms`; an empty cell is `null`
 *  upstream, `undefined` here). `type` is the `Atom` default ORDINARY, not
 *  the environment; `align` is one entry per column (`position[]`). */
export interface MatrixAtom {
  kind: 'matrix';
  type: number;
  env: MatrixEnv;
  rows: (Atom | undefined)[][];
  align: Align[];
  /** `MatrixAtom.vlines`: the `|` count before column `j` (`VlineAtom(n)`,
   *  absent = 0), one entry per separator `0..cols`. */
  vlines?: number[];
}

/** `BreakMarkAtom`: `TeXFormula#add` (java:431-436) appends one after a
 *  `TypedAtom` whose right type is BINARY_OPERATOR or RELATION. It is the
 *  `Atom` default ORDINARY and boxes as nothing. */
export interface BreakMarkAtom {
  kind: 'break';
}

/** `AccentedAtom` built by `PredefMacros#accent_macros` (`\\hat`, `\\vec`,
 *  ...): the `AccentedAtom(Atom, String)` constructor, which leaves `acc`
 *  false. `underbase` is the atom whose skew positions the accent: `base`,
 *  or a nested accent's own `underbase` (`AccentedAtom.java` constructor). */
export interface AccentAtom {
  kind: 'accent';
  type: number;
  accent: FontGlyph;
  base: Atom | undefined;
  underbase: Atom | undefined;
}

/** `OverlinedAtom` (type ORDINARY, `OverlinedAtom.<init>`). */
export interface OverlinedAtom {
  kind: 'overline';
  type: number;
  base: Atom | undefined;
}

/** `UnderlinedAtom` (type ORDINARY, `UnderlinedAtom.<init>`). */
export interface UnderlinedAtom {
  kind: 'underline';
  type: number;
  base: Atom | undefined;
}

/** `OverUnderDelimiter` as `PredefMacros#underbrace_macro`/`#overbrace_macro`
 *  build it: no script, a brace symbol, kern 0; type INNER
 *  (`OverUnderDelimiter.<init>`). */
export interface OverUnderDelimiterAtom {
  kind: 'overunder';
  type: number;
  base: Atom | undefined;
  over: boolean;
}

/** `VRowAtom` as `ArrayOfAtoms#getAsVRow` builds it for a formula-level
 *  `\\` (`PredefMacros#cr_macro`): one entry per row, `addInterline` set
 *  (type ORDINARY, the `Atom` default). */
export interface VRowAtom {
  kind: 'vrow';
  type: number;
  rows: Atom[];
}

/** A `SpaceAtom(unit, 0, space, 0)` between the base and a script of
 *  `UnderOverAtom`; `unit` is `TeXConstants.UNIT_MU` (5) or `UNIT_EM` (0). */
export interface StackSpace {
  amount: number;
  unit: 'mu' | 'em';
}

/** `UnderOverAtom` as `stackrel_macro`, `overset_macro` and `underset_macro`
 *  build it: a script is in script style; an absent script is `undefined`.
 *  `under` and `over` carry their own space; `UnderOverAtom#createBox`
 *  reads the under space's unit from the OVER unit field. */
export interface UnderOverAtom {
  kind: 'underover';
  base: Atom;
  over: Atom | undefined;
  under: Atom | undefined;
  overSpace: StackSpace;
  underSpace: StackSpace;
}

/** `DdotsAtom`/`VdotsAtom` (`\\ddots`, `\\vdots`; type ORDINARY, the `Atom`
 *  default): three `ldotp` dots stacked diagonally or vertically. */
export interface DotsAtom {
  kind: 'dots';
  type: number;
  shape: 'ddots' | 'vdots';
}

export type Atom =
  | CharAtom
  | RowAtom
  | SpaceAtom
  | ScriptsAtom
  | BigOperatorAtom
  | FractionAtom
  | NthRootAtom
  | FencedAtom
  | MatrixAtom
  | TypedAtom
  | WrapAtom
  | PhantomAtom
  | BreakMarkAtom
  | AccentAtom
  | OverlinedAtom
  | UnderlinedAtom
  | OverUnderDelimiterAtom
  | VRowAtom
  | DotsAtom
  | UnderOverAtom;

/** `Atom#getLeftType` with every subclass override. */
export function leftType(atom: Atom | undefined): number {
  if (atom === undefined) return TYPE_ORDINARY;
  switch (atom.kind) {
    case 'row':
      return leftType(atom.elements[0]);
    case 'underover':
      return leftType(atom.base);
    case 'scripts':
    case 'phantom':
      return leftType(atom.kind === 'scripts' ? atom.base : atom.body);
    case 'fenced':
      return TYPE_INNER;
    case 'typed':
      return atom.left;
    case 'space':
    case 'break':
      return TYPE_ORDINARY;
    default:
      return atom.type;
  }
}

/** `Atom#getRightType` with every subclass override. */
export function rightType(atom: Atom | undefined): number {
  if (atom === undefined) return TYPE_ORDINARY;
  switch (atom.kind) {
    case 'row':
      return rightType(atom.elements[atom.elements.length - 1]);
    case 'scripts':
    case 'phantom':
      return rightType(atom.kind === 'scripts' ? atom.base : atom.body);
    case 'typed':
      return atom.right;
    case 'underover':
      return rightType(atom.base);
    default:
      return leftType(atom);
  }
}

/** `Atom.type_limits`; only a big-operator symbol and `\mathop` set it. */
export const limitsOf = (atom: Atom): Limits =>
  atom.kind === 'char' || atom.kind === 'typed' ? atom.limits : 'nolimits';

/** `TeXParser.parse`'s `{…}` case (java:714-720): the group's atom becomes
 *  ORDINARY. Only atoms whose type IS their `type` field change. */
export function setOrdinary(atom: Atom): Atom {
  if (atom.kind === 'char' || atom.kind === 'frac' || atom.kind === 'sqrt' || atom.kind === 'bigop') {
    return { ...atom, type: TYPE_ORDINARY };
  }
  return atom;
}

/** A big operator by `getRightType` (`TeXParser#getScripts`, java:836). */
export const isBigOperator = (atom: Atom | undefined): boolean => rightType(atom) === TYPE_BIG_OPERATOR;

/** Builds an atom's box at a style; injected so each builder module can
 *  recurse without importing the dispatcher. */
export type BuildBox = (atom: Atom, style: number) => Box;
