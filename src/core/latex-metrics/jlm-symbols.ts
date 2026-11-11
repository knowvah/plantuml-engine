/**
 * The symbols and macros JLaTeXMath builds from other atoms than the glyph
 * KaTeX draws for the same name (JLaTeXMath 1.0.7,
 * `~/git/plantuml/gradle/libs.versions.toml:12`, decompiled with `javap -c
 * -p` from the pinned oracle jar). Each is a `PredefinedTeXFormulas` string
 * (`PredefinedTeXFormulas.<clinit>`) or a `PredefMacros` macro, rebuilt here
 * from the same pieces; every piece's metrics are KaTeX's (the same Computer
 * Modern TFM data) unless KaTeX has no such glyph, then JLaTeXMath's font XML.
 */
import type { Atom, CharAtom } from './atoms.js';
import { FormulaBuilder } from './convert.js';
import type { Glyph, KNode } from './katex-glyphs.js';
import { nodeList, probeGlyph, stringField } from './katex-glyphs.js';
import { TYPE_INNER, TYPE_ORDINARY, TYPE_PUNCTUATION, TYPE_RELATION, XHEIGHT_CM, muUnit } from './tex-font.js';

const NO_GLYPH: Glyph = { width: 0, height: 0, depth: 0, italic: 0 };

/** `\mapstochar`: `jlm_cmsy10` code 55 (`fonts/base/jlm_base.map.xml:204`,
 *  `fonts/maths/jlm_cmsy10.xml:70`); KaTeX has no such glyph. */
const MAPSTOCHAR: Glyph = { width: 0, height: 0.366875, depth: -0.133125, italic: 0 };

/** A `SymbolAtom` for a KaTeX symbol probe, typed as `TeXSymbols.xml` types it. */
function symbol(probe: string, type: number, glyph: Glyph | undefined = probeGlyph(probe)): CharAtom {
  return {
    kind: 'char',
    type,
    limits: 'nolimits',
    glyph: { glyph: glyph ?? NO_GLYPH, xHeight: XHEIGHT_CM },
    mathChar: false,
  };
}

/** `TypedAtom(l, r, body)` (`\mathrel`, `\mathinner`; `PredefMacros#mathrel_macro`
 *  and `#mathinner_macro`). */
const typed = (type: number, body: Atom): Atom => ({
  kind: 'typed',
  left: type,
  right: type,
  limits: 'nolimits',
  body,
});

/** `PredefMacros#joinrel_macro`: `TypedAtom(REL, REL, SpaceAtom(UNIT_MU,
 *  -2.6f, 0, 0))`. */
const JOINREL_MU = -2.6;
const joinrel = (): Atom =>
  typed(TYPE_RELATION, { kind: 'space', space: { em: (style) => JOINREL_MU * muUnit(style) } });

/** The root `TeXFormula#add` builds from a sequence of atoms. */
function formulaOf(...atoms: Atom[]): Atom {
  const f = new FormulaBuilder();
  for (const a of atoms) f.add(a);
  return f.root ?? { kind: 'row', elements: [] };
}

/** `\not` (`TeXSymbols.xml` `not`, type rel; KaTeX's `\@not`, width 0). */
export const notSymbol = (): Atom => symbol('\\@not', TYPE_RELATION);

const mathrelSymbol = (probe: string): Atom => typed(TYPE_RELATION, symbol(probe, TYPE_RELATION));

/** `PredefinedTeXFormulas`: `ldots` is `\mathinner{\ldotp\ldotp\ldotp}`. */
export function ldotsAtom(): Atom {
  const dot = (): Atom => symbol('\\ldotp', TYPE_PUNCTUATION);
  return typed(TYPE_INNER, formulaOf(dot(), dot(), dot()));
}

/** `cdots` is `\mathinner{\cdotp\cdotp\cdotp}`. */
function cdotsAtom(): Atom {
  const dot = (): Atom => symbol('\\cdotp', TYPE_PUNCTUATION);
  return typed(TYPE_INNER, formulaOf(dot(), dot(), dot()));
}

/** `bowtie` is `\mathrel\triangleright\joinrel\mathrel\triangleleft`. */
const bowtieAtom = (): Atom => formulaOf(mathrelSymbol('\\triangleright'), joinrel(), mathrelSymbol('\\triangleleft'));

/** `models` is `\mathrel|\joinrel\equals`. */
const modelsAtom = (): Atom => formulaOf(mathrelSymbol('|'), joinrel(), symbol('=', TYPE_RELATION));

/** `mapsto` is `\mapstochar\rightarrow`. */
const mapstoAtom = (): Atom => formulaOf(symbol('', TYPE_RELATION, MAPSTOCHAR), symbol('\\rightarrow', TYPE_RELATION));

/** `ne`/`neq` is `\not\equals`. */
export const notEqualsAtom = (): Atom => formulaOf(notSymbol(), symbol('=', TYPE_RELATION));

/** `notin` is `\not\in`. */
export const notInAtom = (): Atom => formulaOf(notSymbol(), symbol('\\in', TYPE_RELATION));

/** The KaTeX symbol names JLaTeXMath builds from other atoms. */
const SYMBOLS: Readonly<Record<string, () => Atom>> = {
  '\\ldots': ldotsAtom,
  '\\@cdots': cdotsAtom,
  '\\cdots': cdotsAtom,
  '\\bowtie': bowtieAtom,
  '\\models': modelsAtom,
  '\\mapsto': mapstoAtom,
  '\\ddots': () => ({ kind: 'dots', type: TYPE_ORDINARY, shape: 'ddots' }),
};

/** `jlm_jlmi10`'s `xHeight="0"` (`fonts/latin/jlm_jlmi10.xml:2`). */
const XHEIGHT_JLMI10 = 0;

/**
 * `«`/`»`: `TeXFormulaSettings.xml:82,86` map them to `guillemotleft`/`guillemotright`
 * (`TeXSymbols.xml:412-413`, type punct), drawn from `jlm_jlmi10` codes 33 and 36
 * (`fonts/base/jlm_base.map.xml:12-13`, `fonts/latin/jlm_jlmi10.xml:3-4`). KaTeX has no
 * math glyph for either (it warns "Unrecognized Unicode character").
 */
const GUILLEMOTS: Readonly<Record<string, Glyph>> = {
  '«': { width: 0.557, height: 0.485, depth: 0, italic: 0.14 },
  '»': { width: 0.557, height: 0.485, depth: 0, italic: -0.004 },
};

/** The `SymbolAtom` JLaTeXMath maps a character to when KaTeX has no glyph for it. */
export function jlmCharSymbol(ch: string): Atom | undefined {
  const glyph = GUILLEMOTS[ch];
  if (glyph === undefined) return undefined;
  return {
    kind: 'char',
    type: TYPE_PUNCTUATION,
    limits: 'nolimits',
    glyph: { glyph, xHeight: XHEIGHT_JLMI10 },
    mathChar: false,
  };
}

/** The atom JLaTeXMath builds for the KaTeX symbol `name`, if it differs
 *  from the glyph itself. */
export const jlmSymbol = (name: string): Atom | undefined => SYMBOLS[name]?.();

/** `\vdots` is `VdotsAtom` (`PredefMacros#vdots_macro`); KaTeX expands it to
 *  `\mathord{\varvdots\rule{0pt}{15pt}}`. */
export const VDOTS_GLYPH = '\\varvdots';
export const vdotsAtom = (): Atom => ({ kind: 'dots', type: TYPE_ORDINARY, shape: 'vdots' });

const textOf = (n: KNode | undefined): string | undefined => (n === undefined ? undefined : stringField(n, 'text'));

/** KaTeX's `\not`: `\mathrel{\rlap{\@not}}`. */
function isNotLap(n: KNode | undefined): boolean {
  if (n?.type !== 'lap' || stringField(n, 'alignment') !== 'rlap') return false;
  return textOf(nodeList(n, 'body').flatMap((b) => nodeList(b, 'body'))[0]) === '\\@not';
}

/** The `mclass` KaTeX's negation macros expand to, and its body. */
const negationBody = (n: KNode): KNode[] => {
  const first = nodeList(n, 'html')[0];
  return first?.type === 'mclass' ? nodeList(first, 'body') : [];
};

/**
 * KaTeX's `\not`, `\ne`/`\neq` (`\not=`) and `\notin` (`\in` then a left
 * lap of `/`) are `htmlmathml` nodes; JLaTeXMath builds them as `\not`
 * (type rel) followed by the symbol (`PredefinedTeXFormulas`: `ne`, `neq`
 * `\not\equals`; `notin` `\not\in`).
 */
export function negationAtom(n: KNode): Atom | undefined {
  const [head, tail] = negationBody(n);
  if (isNotLap(head)) return notSymbol();
  if (head?.type === 'htmlmathml' && negationAtom(head) !== undefined && textOf(tail) === '=') return notEqualsAtom();
  const lap = tail?.type === 'lap' && stringField(tail, 'alignment') === 'llap';
  const inner = head?.type === 'ordgroup' ? nodeList(head, 'body') : [];
  if (lap && textOf(inner[0]) === '\\in') return notInAtom();
  return undefined;
}
