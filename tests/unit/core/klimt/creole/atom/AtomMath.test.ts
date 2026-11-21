/**
 * AtomMath.test.ts — T10e: coverage for `klimt/creole/atom/AtomMath.java`'s
 * port. `calculateDimensionSlow`/`drawU` bind to `core/latex.ts`
 * (`measureLatex`/`renderLatexAsImage`) instead of upstream's rasterized
 * `ScientificEquationSafe#getImage`/`getSvg` — see `AtomMath.ts`'s own
 * module doc comment. All dimension assertions are cross-checked directly
 * against `measureLatex`'s own output so this test does not hard-code a
 * second copy of its heuristic.
 */
import { describe, expect, it } from 'vitest';
import { AtomMath } from '../../../../../../src/core/klimt/creole/atom/AtomMath.js';
import { ScientificEquationSafe } from '../../../../../../src/core/math/ScientificEquationSafe.js';
import { measureLatex, renderLatexAsImage } from '../../../../../../src/core/latex.js';
import { UImage } from '../../../../../../src/core/klimt/shape/UImage.js';
import { URectangle } from '../../../../../../src/core/klimt/shape/URectangle.js';
import { XDimension2D } from '../../../../../../src/core/klimt/geom/XDimension2D.js';
import { UTranslate } from '../../../../../../src/core/klimt/UTranslate.js';
import type { UShape } from '../../../../../../src/core/klimt/UShape.js';
import type { UChange } from '../../../../../../src/core/klimt/UChange.js';
import type { UGraphic } from '../../../../../../src/core/klimt/UGraphic.js';
import type { StringBounder } from '../../../../../../src/core/klimt/font/StringBounder.js';
import { MeasurerStringBounder } from '../../../../../../src/core/measurer-bounder.js';
import { DeterministicMeasurer } from '../../../../../../src/core/measurer-deterministic.js';
import { jarMeasurer } from '../../../../../../src/core/measurer-jar.js';
import { GraphicStrings } from '../../../../../../src/core/klimt/shape/GraphicStrings.js';

class FakeStringBounder implements StringBounder {
  calculateDimension(): XDimension2D {
    return new XDimension2D(0, 0);
  }
}

const sb: StringBounder = new FakeStringBounder();

/** Same per-file `RecordingUGraphic` convention `StripeCode.test.ts`/
 *  `AtomWithMargin.test.ts` already use. */
class RecordingUGraphic implements UGraphic {
  constructor(
    private readonly translate: UTranslate = UTranslate.none(),
    private readonly drawn: { shape: UShape; translate: UTranslate }[] = [],
  ) {}

  apply(change: UChange): UGraphic {
    if (change instanceof UTranslate) return new RecordingUGraphic(this.translate.compose(change), this.drawn);
    return this;
  }

  draw(shape: UShape): void {
    this.drawn.push({ shape, translate: this.translate });
  }

  getParam(): never {
    throw new Error('not needed');
  }

  getTranslate(): UTranslate {
    return this.translate;
  }

  getStringBounder(): StringBounder {
    return sb;
  }

  getDrawn(): readonly { shape: UShape; translate: UTranslate }[] {
    return this.drawn;
  }
}

describe('AtomMath.calculateDimensionSlow (java:64-71) — bound to measureLatex', () => {
  it('matches measureLatex(math.getSource()) exactly for a simple expression', () => {
    const math = ScientificEquationSafe.fromLatex('x^2');
    const atom = new AtomMath(math, '#000000', null);
    const expected = measureLatex('x^2');
    expect(atom.calculateDimension(sb)).toEqual(new XDimension2D(expected.width, expected.height));
  });

  it('a structural marker (\\frac) widens the height, matching measureLatex', () => {
    const math = ScientificEquationSafe.fromLatex('\\frac{a}{b}');
    const atom = new AtomMath(math, null, null);
    const expected = measureLatex('\\frac{a}{b}');
    expect(expected.height).toBeGreaterThan(measureLatex('x').height);
    expect(atom.calculateDimension(sb)).toEqual(new XDimension2D(expected.width, expected.height));
  });

  it('memoizes calculateDimension (inherited AbstractAtom/TextBlockMemoized)', () => {
    const math = ScientificEquationSafe.fromLatex('x');
    const atom = new AtomMath(math, null, null);
    const first = atom.calculateDimension(sb);
    const second = atom.calculateDimension(sb);
    expect(second).toBe(first);
  });
});

describe('AtomMath.getStartingAltitude (java:73-75)', () => {
  it('is always 0, regardless of the formula', () => {
    const math = ScientificEquationSafe.fromLatex('\\int_0^1 x\\,dx');
    const atom = new AtomMath(math, '#123456', null);
    expect(atom.getStartingAltitude(sb)).toBe(0);
  });
});

describe('AtomMath.drawU (java:77-98) — bound to renderLatexAsImage', () => {
  it('draws one UImage whose dims/href match renderLatexAsImage(source, foreground)', () => {
    const math = ScientificEquationSafe.fromLatex('x^2');
    const atom = new AtomMath(math, '#ff0000', null);
    const ug = new RecordingUGraphic();
    atom.drawU(ug);

    const drawn = ug.getDrawn();
    expect(drawn).toHaveLength(1);
    expect(drawn[0]!.shape).toBeInstanceOf(UImage);
    const expected = renderLatexAsImage('x^2', '#ff0000');
    const shape = drawn[0]!.shape as UImage;
    expect(shape.getWidth()).toBe(expected.width);
    expect(shape.getHeight()).toBe(expected.height);
    expect(shape.getHref()).toBe(expected.href);
  });

  it('draws at the incoming translate unchanged (no internal offset)', () => {
    const math = ScientificEquationSafe.fromLatex('y');
    const atom = new AtomMath(math, '#000000', null);
    const ug = new RecordingUGraphic(new UTranslate(7, 3));
    atom.drawU(ug);
    expect(ug.getDrawn()[0]!.translate).toEqual(new UTranslate(7, 3));
  });

  it('a null foreground falls back to black (#000000), matching upstream XColor.BLACK default', () => {
    const math = ScientificEquationSafe.fromLatex('z');
    const atom = new AtomMath(math, null, null);
    const ug = new RecordingUGraphic();
    atom.drawU(ug);
    const expected = renderLatexAsImage('z', '#000000');
    expect((ug.getDrawn()[0]!.shape as UImage).getHref()).toBe(expected.href);
  });

  it("a background paints the formula's box first, then the same image (ScientificEquationSafe.java:129-133)", () => {
    const math = ScientificEquationSafe.fromLatex('w');
    const withBg = new AtomMath(math, '#00ff00', '#ffffff');
    const withoutBg = new AtomMath(math, '#00ff00', null);
    const ug1 = new RecordingUGraphic();
    const ug2 = new RecordingUGraphic();
    withBg.drawU(ug1);
    withoutBg.drawU(ug2);
    const [box, image] = ug1.getDrawn();
    expect(box!.shape).toBeInstanceOf(URectangle);
    expect([(box!.shape as URectangle).getWidth(), (box!.shape as URectangle).getHeight()]).toEqual([
      measureLatex('w').width,
      measureLatex('w').height,
    ]);
    expect((image!.shape as UImage).getHref()).toBe((ug2.getDrawn()[0]!.shape as UImage).getHref());
    expect(ug2.getDrawn()).toHaveLength(1);
  });
});

describe('AtomMath.calculateDimensionSlow on a rollback (ScientificEquationSafe.java:110-115, aa79d2d80ee)', () => {
  const rollback = (): AtomMath => new AtomMath(ScientificEquationSafe.fromLatex('\\glb{x}'), null, null);

  it('is the rollback block measured by the host bounder (cov-rollback-latex: 48.85 x 24)', () => {
    const dim = rollback().calculateDimension(new MeasurerStringBounder(new DeterministicMeasurer()));
    expect([dim.getWidth(), dim.getHeight()]).toEqual([Math.fround(38.85) + 10, 24]);
  });

  it('is exactly the monospaced block, untruncated, under any bounder', () => {
    const awt = new MeasurerStringBounder(jarMeasurer);
    const block = GraphicStrings.createBlackOnWhiteMonospaced(['\\glb{x}']).calculateDimension(awt);
    const dim = rollback().calculateDimension(awt);
    expect([dim.getWidth(), dim.getHeight()]).toEqual([block.getWidth(), block.getHeight()]);
  });
});
