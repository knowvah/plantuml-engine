/**
 * sizer-footprint-parity T3 (ADR-1/ADR-2), re-measured by SI10 (ADR-1/ADR-2)
 * — pins the CURRENT widened-routing state in `leaf-sizing.ts`:
 *
 * - `usecase`/`usecase-business` + `<$sprite>` on a SINGLE-LINE display
 *   routes through `measureEntityLeaf`, and for a lone sprite atom whose ink
 *   is a rectangular `<path>` (a shape whose drawn corners ARE its bbox
 *   corners) that must match `measureUsecase`'s own ink-fit math exactly —
 *   a rectangle's enclosing-circle dimensions are translation invariant, so
 *   both paths derive the SAME ellipse from the SAME ink box, even though
 *   (T10/ADR-3) they now get there by two DIFFERENT mechanisms: real
 *   `SvgNanoParser` decomposition for `measureLeafNode`, the unchanged
 *   ink-bbox approximation for `measureUsecase` (off-limits, ADR-3).
 * - A MULTI-LINE display mixing a sprite line with any other line ALSO now
 *   routes through `measureEntityLeaf` (SI10/ADR-1/ADR-2): the T3-era guard
 *   that kept this on `measureUsecase` was re-measured INERT (`widened 0`,
 *   IDENTICAL cause histogram, both named fixtures `delta 0, conformant
 *   true` with and without it) — see `leaf-sizing.ts#hasUnroutedUsecaseMarkup`'s
 *   own doc comment for the full measurement. This case therefore asserts
 *   LITERAL dimensions captured from a real run, not a tautological
 *   `toEqual` against the old path (ADR-3: that comparison was true BY
 *   CONSTRUCTION while the guard existed and is retired along with it).
 * - `<latex>` (usecase and box family both) stays guarded — permanent
 *   divergence, `DIVERGENCES.md`.
 * - box+`<img>` is now UNGUARDED (T3/ADR-1: the cannot-decode fallback font
 *   is hardcoded at its draw site, so no caller-threaded font is needed) —
 *   routes through `measureEntityLeaf` and, for this synthetic case,
 *   produces the IDENTICAL dimension the legacy fallback used to.
 */
import { describe, it, expect } from 'vitest';
import {
  measureLeafNode,
  measureUsecase,
  measureUsecaseOrActorLeaf,
} from '../../../../../src/core/svek/image/leaf-sizing.js';
import { DeterministicMeasurer } from '../../../../../src/core/measurer-deterministic.js';
import type { FontSpec } from '../../../../../src/core/measurer.js';
import type { DescriptiveNode } from '../../../../../src/diagrams/description/ast.js';
import type { SpriteDims, SpriteDimsLookup } from '../../../../../src/core/creole-atoms.js';
import { createSpriteRegistry, addSprite, spriteDimsLookupFor } from '../../../../../src/core/sprite-commands.js';
import { SpriteSvg } from '../../../../../src/core/klimt/sprite/SpriteSvg.js';

const fontSpec: FontSpec = { family: 'Helvetica', size: 14 };
const measurer = new DeterministicMeasurer();

/** A lookup NOT backed by a real registry (no `svg`) — for assertions made
 *  directly against `measureUsecase`, which never routes through T10's
 *  real-decomposition path and only ever reads `inkWidth`/`inkHeight`. */
function rawSprite(dims: SpriteDims): SpriteDimsLookup {
  return { get: (name) => (name === 'icon' ? dims : undefined) };
}

/** A REAL registered SVG sprite (T10) whose drawn ink is a rectangular
 *  `<path>` -- `SpriteSvg.from` derives `inkX/inkY/inkWidth/inkHeight` from
 *  the path's own corners (`svgInkBox`), the SAME numbers the old
 *  hand-authored `SHRUNK_INK` literal asserted, but computed from real
 *  geometry so `measureLeafNode` actually exercises `SvgNanoParser`
 *  decomposition, not a fabricated ink number. */
function svgIconSprite(svg: string): SpriteDimsLookup {
  const registry = createSpriteRegistry();
  const sprite = SpriteSvg.from(svg);
  if (sprite === undefined) throw new Error('test fixture SVG failed to parse dimensions');
  addSprite(registry, 'icon', sprite);
  return spriteDimsLookupFor(registry);
}

/** Declared 16x16, ink rectangle [1,11]x[1,9] (10x8 at offset 1,1) — the
 *  SAME numbers `SHRUNK_INK` used to declare directly. */
const SHRUNK_INK_SVG = '<svg width="16" height="16"><path d="M1,1 L11,1 L11,9 L1,9 Z"/></svg>';

function usecaseNode(display: string): DescriptiveNode {
  return { id: 'u', display, symbol: 'usecase', children: [] };
}

describe('T3 widened routing — usecase + <$sprite>', () => {
  it("a single-line sprite display routes through measureEntityLeaf and matches measureUsecase's own ink-fit math for a lone atom", () => {
    const display = '<$icon>';
    const sprites = svgIconSprite(SHRUNK_INK_SVG);
    const routed = measureLeafNode(usecaseNode(display), fontSpec, measurer, undefined, sprites);
    const viaOldPath = measureUsecase(display, fontSpec, measurer, sprites);
    expect(routed.width).toBeCloseTo(viaOldPath.width, 6);
    expect(routed.height).toBeCloseTo(viaOldPath.height, 6);
    // Sanity: the ink box (10x8) is smaller than the declared box (16x16),
    // so the fitted ellipse must be smaller than one built from the FULL
    // declared box -- proves the resolver is actually shrinking to ink,
    // not silently falling back to the declared dims.
    const declaredBoxLookup = rawSprite({ width: 16, height: 16 });
    const declaredBoxResult = measureUsecase(display, fontSpec, measurer, declaredBoxLookup);
    expect(routed.width).toBeLessThan(declaredBoxResult.width);
  });

  it('a multi-line display mixing a sprite line with a text line now routes through measureEntityLeaf too (SI10: the T3 guard measured INERT)', () => {
    const display = '<$icon>\nlabel text';
    const sprites = svgIconSprite(SHRUNK_INK_SVG);
    const routed = measureLeafNode(usecaseNode(display), fontSpec, measurer, undefined, sprites);
    // Literal dimensions from the jar, NOT derived from `measureUsecase` at
    // test time (ADR-3: that comparison was tautological while the guard
    // existed; asserting literals here means the test actually fails if the
    // faithful path's geometry moves). tests/fixtures/isw-T2-cls/leaf-ucs.svg
    // (oracle seam #4 v2): `<ellipse rx="36.552" ry="21.712">` = 73.104 x
    // 43.424 (was 68.578 x 43.476 while a space was 0 wide).
    expect(routed.width).toBeCloseTo(73.104, 3);
    expect(routed.height).toBeCloseTo(43.424, 2); // the jar prints ry at 3 dp
    // Sanity: the OLD analytic path lands within floating-point noise of the
    // SAME numbers for this fixture -- proof the guard's removal is size-
    // neutral here, not proof the two paths are the same mechanism (T10/
    // ADR-3: they reach this point via different ink-decomposition code).
    const viaOldPath = measureUsecase(display, fontSpec, measurer, sprites);
    expect(routed.width).toBeCloseTo(viaOldPath.width, 6);
    expect(routed.height).toBeCloseTo(viaOldPath.height, 6);
  });

  it('a <latex> use-case display still stays on measureUsecase', () => {
    const display = '<latex>x^2</latex>';
    const routed = measureLeafNode(usecaseNode(display), fontSpec, measurer);
    const viaOldPath = measureUsecase(display, fontSpec, measurer);
    expect(routed).toEqual(viaOldPath);
  });
});

describe("SI10 — measureUsecaseOrActorLeaf matches the description engine's own faithful path (ADR-2)", () => {
  it('usecase: the exported entry point returns the same Dim as measureLeafNode for an equivalent node', () => {
    const display = 'Hello World';
    const sprites = svgIconSprite(SHRUNK_INK_SVG);
    const viaEntryPoint = measureUsecaseOrActorLeaf(display, 'usecase', fontSpec, measurer, sprites);
    const viaFaithfulPath = measureLeafNode(usecaseNode(display), fontSpec, measurer, undefined, sprites);
    // jar: tests/fixtures/isw-T2-cls/usecase-hello.svg, `<ellipse rx="53.371"
    // ry="13.074">` = 106.742 x 26.148 (was 103.015 x 25.799).
    expect(viaEntryPoint.width).toBeCloseTo(106.742, 3);
    expect(viaEntryPoint.height).toBeCloseTo(26.148, 3);
    expect(viaEntryPoint).toEqual(viaFaithfulPath);
  });

  it('actor: the exported entry point returns the same Dim as measureLeafNode for an equivalent node', () => {
    const display = 'Bob';
    const sprites = svgIconSprite(SHRUNK_INK_SVG);
    const actorNode: DescriptiveNode = { id: 'a', display, symbol: 'actor', children: [] };
    const viaEntryPoint = measureUsecaseOrActorLeaf(display, 'actor', fontSpec, measurer, sprites);
    const viaFaithfulPath = measureLeafNode(actorNode, fontSpec, measurer, undefined, sprites);
    expect(viaEntryPoint).toEqual({ width: 27, height: 74 });
    expect(viaEntryPoint).toEqual(viaFaithfulPath);
  });
});

describe('T3 widened routing — box + <img> now routes through measureEntityLeaf (ADR-1)', () => {
  it('a rectangle with an unresolvable <img> tag no longer routes to the legacy fallback', () => {
    const display = '<img:does-not-exist.png>';
    const node: DescriptiveNode = { id: 'r', display, symbol: 'rectangle', children: [] };
    const routed = measureLeafNode(node, fontSpec, measurer);
    // Jar-verified fallback: `(Cannot decode)` at the hardcoded monospace(14)
    // fallback font measures 104.212 wide now that its space counts (100.362
    // before); margins/icon bring the box to the jar's `<rect width="124.213"
    // height="34">` (tests/fixtures/isw-T2-cls/leaf-img.svg, oracle seam #4 v2)
    // regardless of which routing path is taken (T1's font-independence finding
    // holds here too).
    expect(routed.width).toBeCloseTo(124.213, 3);
    expect(routed.height).toBe(34);
  });
});

/** ddd-T5e: a `<latex>` box is its image atom through `measureEntityLeaf`. Jar: `skinparam componentStyle uml1` +
 *  `component "<latex>x^2</latex>"` draws 47x46; `rectangle "<latex>x^2</latex>" <<Foo>>` draws 61.725x60, and
 *  without the stereotype 47x46. */
describe('a <latex> box sizes from its image atom', () => {
  it('a uml1 component measures the jar box', () => {
    const node: DescriptiveNode = { id: 'c', display: '<latex>x^2</latex>', symbol: 'component', children: [] };
    expect(measureLeafNode(node, fontSpec, measurer, { componentStyle: 'uml1' })).toEqual({ width: 47, height: 46 });
  });

  it('a stereotype widens to its label and adds its line', () => {
    const plain: DescriptiveNode = { id: 'r', display: '<latex>x^2</latex>', symbol: 'rectangle', children: [] };
    const stereotyped: DescriptiveNode = { ...plain, stereotype: ['Foo'] };
    expect(measureLeafNode(plain, fontSpec, measurer)).toEqual({ width: 47, height: 46 });
    const dim = measureLeafNode(stereotyped, fontSpec, measurer);
    expect(dim.width).toBeCloseTo(61.725, 4);
    expect(dim.height).toBe(60);
  });
});
