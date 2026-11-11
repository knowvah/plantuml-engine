/**
 * Stacked constructions: the `VRowAtom` a formula-level `\\` builds and the
 * `UnderOverAtom` behind `\stackrel`, `\overset` and `\underset` (JLaTeXMath
 * 1.0.7, `~/git/plantuml/gradle/libs.versions.toml:12`, decompiled with
 * `javap -c -p` from the pinned oracle jar).
 */
import type { BuildBox, StackSpace, UnderOverAtom, VRowAtom } from './atoms.js';
import type { Box } from './box.js';
import { ALIGN_CENTER, VBox, hboxAligned, strutBox } from './box.js';
import type { KNode } from './katex-glyphs.js';
import { nodeField, nodeList } from './katex-glyphs.js';
import { PREC } from './row.js';
import { XHEIGHT_CM, sizeFactor, subStyle, unitFactor } from './tex-font.js';

/**
 * `VRowAtom#createBox` (`halign` 5 = `ALIGN_NONE`, the constructor default):
 * every row's box is added to a `VerticalBox`, with `StrutBox(0,
 * env.getInterline(), 0, 0)` between rows (`addInterline`, set by
 * `ArrayOfAtoms#getAsVRow`); `TeXEnvironment.<init>` calls `setInterline(1,
 * 1.0f)`, i.e. one ex (`UNIT_EX` is 1). The baseline is the last row's
 * (`vtop` false): `setHeight(depth + height - last.getDepth())`,
 * `setDepth(last.getDepth())`.
 */
export function vrowBox(atom: VRowAtom, style: number, build: BuildBox): Box {
  const v = new VBox();
  const interline = XHEIGHT_CM * sizeFactor(style);
  let last = strutBox(0, 0, 0);
  atom.rows.forEach((row, i) => {
    if (i > 0) v.add(strutBox(0, interline, 0));
    last = build(row, style);
    v.add(last);
  });
  const total = v.box.height + v.box.depth;
  v.box.height = total - last.depth;
  v.box.depth = last.depth;
  return v.box;
}

/** `UnderOverAtom.changeWidth`: pad to `width` centred when it differs by
 *  more than 1.0E-7f. */
const changeWidth = (b: Box, width: number): Box =>
  Math.abs(width - b.width) > PREC ? hboxAligned(b, width, ALIGN_CENTER) : b;

/** `SpaceAtom(unit, 0, space, 0).createBox`: a strut of that height. */
const spaceHeight = (s: StackSpace, style: number): Box => strutBox(0, s.amount * (unitFactor(s.unit, style) ?? 0), 0);

/**
 * `UnderOverAtom#createBox`: the script boxes in `env.subStyle()` (both
 * `*ScriptSize` flags are true in the three macros), all padded to the
 * widest, stacked over / space / base / space / under; the baseline is the
 * base's.
 */
export function underOverBox(atom: UnderOverAtom, style: number, build: BuildBox): Box {
  const base = build(atom.base, style);
  const over = atom.over === undefined ? undefined : build(atom.over, subStyle(style));
  const under = atom.under === undefined ? undefined : build(atom.under, subStyle(style));
  const width = Math.max(base.width, over?.width ?? 0, under?.width ?? 0);
  const v = new VBox();
  if (over !== undefined) v.add(changeWidth(over, width)).add(spaceHeight(atom.overSpace, style));
  const b = changeWidth(base, width);
  v.add(b);
  const height = v.box.height + v.box.depth - b.depth;
  if (under !== undefined) v.add(spaceHeight(atom.underSpace, style)).add(changeWidth(under, width));
  v.box.depth = v.box.height + v.box.depth - height;
  v.box.height = height;
  return v.box;
}

/**
 * The macros' constructor arguments (`PredefMacros#stackrel_macro`:
 * `UnderOverAtom(base, under, UNIT_MU, 0.5f, true, over, UNIT_MU, 2.5f,
 * true)`; `#overset_macro`: `(base, over, UNIT_MU, 2.5f, true, true)`;
 * `#underset_macro`: `(base, under, UNIT_MU, 0.5f, true, false)`). The
 * six-argument constructor with `over` false leaves `overUnit` 0 (`UNIT_EM`)
 * and `createBox` reads the under space's unit from it, so `\underset`'s
 * 0.5 is in em; `stackrel`'s absent optional argument is an `EmptyAtom`
 * (`TeXParser#parse` adds one to an empty formula), so `\stackrel` always
 * has an under part.
 */
export const STACK_SPACES = {
  stackrel: { over: { amount: 2.5, unit: 'mu' }, under: { amount: 0.5, unit: 'mu' } },
  overset: { over: { amount: 2.5, unit: 'mu' }, under: { amount: 0, unit: 'mu' } },
  underset: { over: { amount: 0, unit: 'em' }, under: { amount: 0.5, unit: 'em' } },
} as const satisfies Record<string, { over: StackSpace; under: StackSpace }>;

export type StackKind = keyof typeof STACK_SPACES;

/** What KaTeX's `\stackrel`/`\overset`/`\underset` expansion leaves in the
 *  parse tree: `\mathrel`/`\mathord` over `\mathop{base}\limits^{over}`
 *  (or `_{under}`); `suppressBaseShift` is true only for the latter two. */
export interface StackParts {
  kind: StackKind;
  base: KNode[];
  script: KNode | undefined;
}

/** Recognise the expansion; `undefined` for any other `mclass`. */
export function stackParts(n: KNode): StackParts | undefined {
  const [only, ...rest] = nodeList(n, 'body');
  if (only?.type !== 'supsub' || rest.length > 0) return undefined;
  const op = nodeField(only, 'base');
  if (op?.type !== 'op' || op.raw['symbol'] === true || op.raw['alwaysHandleSupSub'] !== true) return undefined;
  const sup = nodeField(only, 'sup');
  const sub = nodeField(only, 'sub');
  const shifted = op.raw['suppressBaseShift'] === true;
  const kind: StackKind = !shifted ? 'stackrel' : sup === undefined ? 'underset' : 'overset';
  return { kind, base: nodeList(op, 'body'), script: sup ?? sub };
}
