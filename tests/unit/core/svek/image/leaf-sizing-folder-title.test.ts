/**
 * SI1 T12 (ADR-4) — the folder/package SHOWN-title un-narrowing: the
 * title block now measures through the REAL `BodyFactory.create2` →
 * `BodyEnhanced1` route (`leaf-sizing-folder-title.ts`), replacing the
 * measured-but-untraced `FOLDER_SHOWN_TITLE_EXTRA_WIDTH = 12` flat
 * constant (deleted) — the 12 IS `BodyEnhanced1`'s separator-free
 * `decorate` margin, `getMarginX()=6` both sides
 * (BodyEnhancedAbstract.java:107-109).
 *
 * Every dimension asserted here is jar-pinned: the three probe diagrams
 * were run through the deterministic oracle jar
 * (`-DPLANTUML_DETERMINISTIC_TEXT=true -DPLANTUML_DUMP_DOT`, SI1 T12
 * probes, 2026-08-06) and the DOT node sizes hand-reconciled against the
 * BodyEnhanced1 expressions before the gate was touched.
 */
import { describe, it, expect } from 'vitest';
import { measureLeafNode } from '../../../../../src/core/svek/image/leaf-sizing.js';
import { measureShownFolderTitle } from '../../../../../src/core/svek/image/leaf-sizing-folder-title.js';
import { DeterministicMeasurer } from '../../../../../src/core/measurer-deterministic.js';
import type { FontSpec } from '../../../../../src/core/measurer.js';
import type { DescriptiveNode } from '../../../../../src/diagrams/description/ast.js';

const fontSpec: FontSpec = { family: 'Helvetica', size: 14 };
const measurer = new DeterministicMeasurer();

function node(id: string, display: string, symbol: DescriptiveNode['symbol']): DescriptiveNode {
  return { id, display, symbol, children: [] };
}

describe('SI1 T12 — folder/package title via create2/BodyEnhanced1 (jar-pinned probes)', () => {
  it('package with code==display: jar 2.388021x0.513889in = 171.9375x37px', () => {
    // title = 129.9375 ("Elektronisk dokument") + 6 + 6 (getMarginX both
    // sides); label slot EMPTY (upstream's empty-desc package branch);
    // + USymbolFolder margin [30, 23]; height 14 + 23.
    const d = measureLeafNode(node('Elektronisk dokument', 'Elektronisk dokument', 'package'), fontSpec, measurer);
    expect(d.width).toBeCloseTo(175.78751, 3);
    expect(d.height).toBeCloseTo(37, 3);
  });

  it('package pp as "Display Here": jar 1.477604x0.708333in = 106.3875x51px', () => {
    // title = 15.575 ("pp") + 12; label = 76.3875 ("Display Here") WINS the
    // mergeTB width max; height 14 + 14 + 23.
    const d = measureLeafNode(node('pp', 'Display Here', 'package'), fontSpec, measurer);
    expect(d.width).toBeCloseTo(110.2375, 3);
    expect(d.height).toBeCloseTo(51, 3);
  });

  it('folder fb (showTitle=false — create2 never measured): jar 0.972222x0.722222in = 70x52px', () => {
    // dimName is the FIXED (40, 15) tab (USymbolFolder.java:172): 40 floors
    // the 11.6375 label; height 15 + 14 + 23.
    const d = measureLeafNode(node('fb', 'fb', 'folder'), fontSpec, measurer);
    expect(d.width).toBeCloseTo(70, 3);
    expect(d.height).toBeCloseTo(52, 3);
  });

  it('title block = creole text width + getMarginX()=6 both sides, one line high', () => {
    const [w, h] = measureShownFolderTitle('Elektronisk dokument', fontSpec, measurer, undefined, undefined);
    expect(w).toBeCloseTo(measurer.measure('Elektronisk dokument', fontSpec).width + 12, 6);
    expect(h).toBeCloseTo(14, 6);
  });

  it('a literal \\n escape in the code splits the title (Display.getWithNewlines), stacking lines', () => {
    // Upstream codeDisplay = Display.getWithNewlines(pragma, entity.getName())
    // — the two-char escape scanner. Width = widest line + 12; height = 2
    // lines. (Expression-derived from the jar-verified single-line pins
    // above; the flat path billed such a code ONE line.)
    const [w, h] = measureShownFolderTitle('ab\\ncd', fontSpec, measurer, undefined, undefined);
    const lineW = Math.max(measurer.measure('ab', fontSpec).width, measurer.measure('cd', fontSpec).width);
    expect(w).toBeCloseTo(lineW + 12, 6);
    expect(h).toBeCloseTo(28, 6);
  });

  // SI30/T2: `titleAtomOps`'s text-atom `getStartingAltitude`/muted-font
  // measurement — the same `Sea#doAlign` math
  // `EntityImageDescriptionDelegates.test.ts` derives for `descAtomOps`
  // ('x' NORMAL spans [-14,0]; '2' EXPOSANT muted-height-11 spans [-17,-6];
  // getHeight = 0 - (-17) = 17, decisions.md#D1/D2).
  it('title x<sup>2</sup>: EXPOSANT altitude grows height 14->17; <sup> measures at the muted width', () => {
    const [w, h] = measureShownFolderTitle('x<sup>2</sup>', fontSpec, measurer, undefined, undefined);
    const expectedTextWidth =
      measurer.measure('x', fontSpec).width + measurer.measure('2', { family: fontSpec.family, size: 11 }).width;
    expect(w).toBeCloseTo(expectedTextWidth + 12, 6);
    expect(h).toBeCloseTo(17, 6);
  });

  // ptw T2a (#219, M1): the title is a `create2` block whose `MethodsOrFieldsArea` lines are built with
  // `style.wrapWidth()` (`MethodsOrFieldsArea.java:255`, `:264`), `style` being `styleTitle`
  // (`EntityImageDescription.java:201-202`). Jar (`ptw-issue`, `package { MaximumWidth 100 }`): svek node
  // `1.900694in = 136.85px` wide, `0.902778in = 65px` high; the widest stripe is `empty package` (38.0625 + 3.85 +
  // 52.9375 = 94.85, the jar's text runs), so the block is 94.85 + 12 and three lines high.
  it('title wraps at the title wrap width: three 14px lines, the widest stripe + getMarginX()=6 both sides', () => {
    const code = 'A rather long empty package title';
    const [w, h] = measureShownFolderTitle(code, fontSpec, measurer, { wrapWidth: 100 }, undefined);
    const stripe = ['empty', ' ', 'package'].reduce((sum, atom) => sum + measurer.measure(atom, fontSpec).width, 0);
    expect(w).toBeCloseTo(stripe + 12, 6);
    expect(w).toBeCloseTo(106.85, 3);
    expect(h).toBeCloseTo(42, 6);
  });

  it('title wrap width 0 keeps one line', () => {
    const code = 'A rather long empty package title';
    const [w, h] = measureShownFolderTitle(code, fontSpec, measurer, { wrapWidth: 0 }, undefined);
    expect(w).toBeCloseTo(measurer.measure(code, fontSpec).width + 12, 6);
    expect(h).toBeCloseTo(14, 6);
  });

  it('package leaf: entitySizing.wrapWidthTitle sizes the DOT node as the jar (1.900694 x 0.902778 in)', () => {
    const code = 'A rather long empty package title';
    const d = measureLeafNode(
      { ...node(code, code, 'package'), entitySizing: { wrapWidthTitle: 100 } },
      fontSpec,
      measurer,
    );
    expect(d.width).toBeCloseTo(136.85, 3);
    expect(d.height).toBeCloseTo(65, 3);
  });

  // ptw T2b (#219, M2): `desc` is `create3(display, …, style.wrapWidth(), …)` (`EntityImageDescription.java:184-188`),
  // the BODY style's wrap, which a style-only `package { MaximumWidth 100 }` sets with no `skinparam wrapWidth`.
  // Jar `ptw-as-label` svek node: `1.734028 x 1.097222in` = 124.85 x 79px (title `P` 14 + three label lines 42 + 23).
  it('package label: entitySizing.wrapWidth wraps the label with no opts.wrapWidth (jar 1.734028 x 1.097222 in)', () => {
    const display = 'A rather long empty package title';
    const d = measureLeafNode(
      { ...node('P', display, 'package'), entitySizing: { wrapWidth: 100 } },
      fontSpec,
      measurer,
    );
    expect(d.width).toBeCloseTo(124.85, 3);
    expect(d.height).toBeCloseTo(79, 3);
  });

  // Jar `ptw-folder` (`folder { MaximumWidth 100 }`): `1.528646 x 1.111111in` = 110.0625 x 80px (tab 15 + 42 + 23).
  it('folder label: entitySizing.wrapWidth wraps the label (jar 1.528646 x 1.111111 in)', () => {
    const display = 'A rather long empty folder title';
    const d = measureLeafNode(
      { ...node(display, display, 'folder'), entitySizing: { wrapWidth: 100 } },
      fontSpec,
      measurer,
    );
    expect(d.width).toBeCloseTo(110.0625, 3);
    expect(d.height).toBeCloseTo(80, 3);
  });

  // ptw T2b push-forward (#219): `BodyEnhanced1#getArea` floors the `create2` block at `styleTitle`'s `MinimumWidth`
  // (`BodyEnhanced1.java:182-184`). Jar `ptw-min-width-title` (`package { title { MinimumWidth 200 } }`, `"Short P"`):
  // svek node `3.194444 x 0.513889in` = 230 x 37px (200 + 30, one line 14 + 23).
  it("title MinimumWidth floors the title block; the package node is the jar's 3.194444 x 0.513889 in", () => {
    const [w, h] = measureShownFolderTitle('Short P', fontSpec, measurer, { minimumWidth: 200 }, undefined);
    expect([w, h]).toEqual([200, 14]);
    const d = measureLeafNode(
      { ...node('Short P', 'Short P', 'package'), entitySizing: { minimumWidthTitle: 200 } },
      fontSpec,
      measurer,
    );
    expect(d.width).toBeCloseTo(230, 3);
    expect(d.height).toBeCloseTo(37, 3);
  });
});

// ptw T2c (#219, M3): the folder sizer's label is empty when the display `equalsLike` `getWithNewlines(code)`
// (`EntityImageDescription.java:180-183`). Jar `ptw-ctl-newline` (`package "First line\nSecond line" {}`): svek node
// `1.600521 x 0.708333in` = 115.2375 x 51px, the two-line title alone (+ 30, + 23).
describe('ptw T2c — a `\\n` in the code draws the name once', () => {
  it('package with an escaped `\\n` code and its split display: title only, no label', () => {
    const d = measureLeafNode(
      node('First line\\nSecond line', 'First line\nSecond line', 'package'),
      fontSpec,
      measurer,
    );
    const title = measureShownFolderTitle('First line\\nSecond line', fontSpec, measurer, undefined, undefined);
    expect(d.height).toBeCloseTo(title[1] + 23, 6);
    expect(d.height).toBeCloseTo(51, 6);
    expect(d.width).toBeCloseTo(title[0] + 30, 6);
    expect(d.width).toBeCloseTo(115.2375, 3);
  });
});
