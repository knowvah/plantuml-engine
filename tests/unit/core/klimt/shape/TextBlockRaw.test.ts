/**
 * TextBlockRaw / SingleLine.rawText / TileText — raw text with no creole, ported for `GraphicStrings`'
 * `CreoleMode.NO_CREOLE` (the formula rollback since aa79d2d80ee, and the crash banner).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TextBlockRaw.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/SingleLine.java
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/shape/TileText.java
 */
import { describe, expect, it } from 'vitest';
import { MeasurerStringBounder } from '../../../../../src/core/measurer-bounder.js';
import { DeterministicMeasurer } from '../../../../../src/core/measurer-deterministic.js';
import { TextBlockRaw } from '../../../../../src/core/klimt/shape/TextBlockRaw.js';
import { SingleLine } from '../../../../../src/core/klimt/shape/SingleLine.js';
import { TileText } from '../../../../../src/core/klimt/shape/TileText.js';
import { UTranslate } from '../../../../../src/core/klimt/UTranslate.js';
import type { UText, FontConfiguration } from '../../../../../src/core/klimt/shape/UText.js';
import type { UChange } from '../../../../../src/core/klimt/UChange.js';
import type { UGraphic } from '../../../../../src/core/klimt/UGraphic.js';
import type { UShape } from '../../../../../src/core/klimt/UShape.js';

const sb = new MeasurerStringBounder(new DeterministicMeasurer());
const MONO: FontConfiguration = { family: 'monospace', size: 14, color: '#000000', styles: new Set() };
const SMALL: FontConfiguration = { ...MONO, size: 6 };

class Recording implements UGraphic {
  constructor(
    private readonly translate: UTranslate = UTranslate.none(),
    readonly drawn: { shape: UShape; translate: UTranslate }[] = [],
  ) {}
  apply(change: UChange): UGraphic {
    return change instanceof UTranslate ? new Recording(this.translate.compose(change), this.drawn) : this;
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
  getStringBounder() {
    return sb;
  }
}

function texts(ug: Recording): string[] {
  return ug.drawn.map(
    ({ shape, translate }) => `${(shape as UText).getText()}@${translate.getDx()},${translate.getDy()}`,
  );
}

describe('TextBlockRaw', () => {
  it('stacks one raw line per string, each the font height high (TextBlockRaw.java:72-96)', () => {
    const block = new TextBlockRaw(['ab', 'c'], MONO);
    expect(block.calculateDimension(sb).getHeight()).toBe(28);
    const ug = new Recording();
    block.drawU(ug);
    // SingleLine#maxDeltaY puts the baseline at the font size (SingleLine.java:95-107).
    expect(texts(ug)).toEqual(['ab@0,14', 'c@0,28']);
  });

  it('keeps a backslash and creole markup as written', () => {
    const ug = new Recording();
    new TextBlockRaw(['\\glb **x**'], MONO).drawU(ug);
    expect(texts(ug)).toEqual(['\\glb **x**@0,14']);
  });

  it('an empty string is one space (SingleLine.java:55-56)', () => {
    const ug = new Recording();
    SingleLine.rawText('', MONO).drawU(ug);
    expect(texts(ug)).toEqual([' @0,14']);
  });
});

describe('TileText', () => {
  it('is at least 10 high (TileText.java:69-71)', () => {
    expect(new TileText('x', SMALL).calculateDimension(sb).getHeight()).toBe(10);
    expect(new TileText('x', SMALL).getFontSize2D()).toBe(6);
  });

  it('advances a tab to the next eight-space stop and draws nothing for it (TileText.java:94-140)', () => {
    const tab = sb.calculateDimension(MONO, '        ').getWidth();
    const a = sb.calculateDimension(MONO, 'a').getWidth();
    const tile = new TileText('a\tb', MONO);
    expect(tile.calculateDimension(sb).getWidth()).toBe(tab + sb.calculateDimension(MONO, 'b').getWidth());
    const ug = new Recording();
    tile.drawU(ug);
    expect(texts(ug)).toEqual(['a@0,0', `b@${tab},0`]);
    expect(a).toBeLessThan(tab);
  });
});
