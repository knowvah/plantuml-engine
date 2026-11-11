import { describe, expect, it } from 'vitest';

import { HColorSimple } from '../../../src/core/klimt/color/HColorSimple.js';
import { Display } from '../../../src/core/klimt/creole/Display.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import { Stereotype } from '../../../src/core/stereo/Stereotype.js';
import type { HColor } from '../../../src/core/style/Value.js';
import {
  createDisplay,
  fore,
  timingStyle,
  timingStyleStereotyped,
  type TimingSkinParam,
} from '../../../src/diagrams/timing/timing-klimt.js';
import { RecordingUGraphic } from '../../helpers/recording-ugraphic.js';
import { oracleMeasurer, timingSkinParam } from './helpers/timing.js';

describe('timing-klimt', () => {
  it('merges root, element, timingDiagram and the sname against the current builder', () => {
    const skinParam = timingSkinParam();
    const style = timingStyle(skinParam, 'timeline');
    expect(style.getStroke().getThickness()).toBe(2);
    expect(style.value('LineColor').asColor(skinParam.getIHtmlColorSet())).toBeInstanceOf(HColorSimple);
  });

  it('throws NullPointerException when the builder answers no style', () => {
    const base = timingSkinParam();
    const noBuilder = Object.create(base, {
      getCurrentStyleBuilder: { value: () => undefined },
    }) as unknown as TimingSkinParam;
    expect(() => timingStyle(noBuilder, 'timeline')).toThrow('java.lang.NullPointerException');
  });

  it('timingStyleStereotyped merges the stereotype rule, and throws when the builder answers no style', () => {
    const skinParam = timingSkinParam('<style>\ntimingDiagram { .foo { concise { LineThickness 7 } } }\n</style>');
    const foo = Stereotype.build('<<foo>>');
    expect(timingStyleStereotyped(skinParam, foo, 'concise').getStroke().getThickness()).toBe(7);
    expect(timingStyleStereotyped(skinParam, undefined, 'concise').getStroke().getThickness()).toBe(1.5);
    const noBuilder = Object.create(skinParam, {
      getCurrentStyleBuilder: { value: () => undefined },
    }) as unknown as TimingSkinParam;
    expect(() => timingStyleStereotyped(noBuilder, undefined, 'concise')).toThrow('java.lang.NullPointerException');
  });

  it('fore() wraps an HColorSimple and rejects a foreign HColor with ClassCastException', () => {
    const color = timingSkinParam().getIHtmlColorSet().getColorOrWhite('#336699');
    expect(fore(color).getColor()).toBe(color);
    expect(() => fore({} as HColor)).toThrow('java.lang.ClassCastException');
  });

  it('createDisplay lays text out in the style font (the "100" label of the oracle is 18.356 wide)', () => {
    const skinParam = timingSkinParam();
    const block = createDisplay(
      Display.getWithNewlines(skinParam.getPragma(), '100'),
      timingStyle(skinParam, 'timeline'),
      skinParam,
      HorizontalAlignment.LEFT,
    );
    const bounder = new RecordingUGraphic(oracleMeasurer()).getStringBounder();
    expect(block.calculateDimension(bounder).getWidth()).toBeCloseTo(18.356, 2);
  });
});
