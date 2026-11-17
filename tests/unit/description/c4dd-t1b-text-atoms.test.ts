/**
 * c4dd T1b: each text atom of a line sits on its own descent, through the real `Sea`. `buildTextBlock` serves edge
 * labels, so these rows go through `SvekEdge`. Each `oracle/<name>.svg` is the jar's, from `scripts/oracle-render.sh`.
 */
import { describe, expect, it } from 'vitest';

import { DeterministicMeasurer } from '../../../src/core/measurer-deterministic.js';
import { HorizontalAlignment } from '../../../src/core/klimt/geom/HorizontalAlignment.js';
import { MeasurerStringBounder } from '../../../src/core/measurer-bounder.js';
import { measureAtomsWidthHeight } from '../../../src/core/svek/image/EntityImageDescriptionTextMeasure.js';
import { buildTextBlock } from '../../../src/core/svek/image/EntityImageDescriptionSupport.js';
import { buildEmojiAssetsStore } from '../../helpers/emoji-assets-store.js';
import { jarFixtureDiffs, jarFixtureNames } from '../../helpers/jar-fixture-dir.js';

const DIR = 'tests/fixtures/c4dd-T1b';
const names = jarFixtureNames(DIR);
/** The survey renders with the emoji asset store (`scripts/svg-parity-survey.ts`); #150 draws its artwork on a label. */
const assetStore = buildEmojiAssetsStore();

describe('mixed-size lines against the jar', () => {
  it('collects every fixture with an oracle', () => {
    expect(names.length).toBe(7);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name, { assetStore })).toEqual([]);
  });
});

describe('the line through Sea', () => {
  const bounder = new MeasurerStringBounder(new DeterministicMeasurer());
  const font = { family: 'sans-serif', size: 13, color: '#000', styles: new Set<never>() } as never;
  const SIZE_13_HEIGHT = bounder.calculateDimension(font, 'x').getHeight();

  it('a <sub> grows the line by its altitude (AtomText.getSpace, 3 at size 13)', () => {
    const block = buildTextBlock('x<sub>2</sub>', font, HorizontalAlignment.LEFT);
    expect(block.calculateDimension(bounder).getHeight()).toBeCloseTo(SIZE_13_HEIGHT + 3, 3);
  });

  it('a line with no atoms measures zero', () => {
    expect(measureAtomsWidthHeight(bounder, [], undefined)).toEqual({ width: 0, height: 0, top: [] });
  });
});
