import { describe, expect, it } from 'vitest';
import { HColorSet } from '../../../src/core/klimt/color/HColorSet.js';
import { UTranslate } from '../../../src/core/klimt/UTranslate.js';
import { Spot } from '../../../src/diagrams/wire/Spot.js';
import { WBlock } from '../../../src/diagrams/wire/WBlock.js';
import { record } from '../../helpers/recording-ugraphic.js';
import { measurer } from './helpers.js';

function blockAt10x20(): WBlock {
  const root = new WBlock('', UTranslate.none(), 0, 0, undefined);
  root.addBlock(0, 'a', 40, 40, undefined);
  return root.getBlock('a')!;
}

describe('Spot#drawMe (Spot.java:59-68)', () => {
  it('defaults to red at the block origin, offset by -2,-2', () => {
    const events = record(measurer, (ug) => new Spot(blockAt10x20(), undefined, undefined, undefined).drawMe(ug));
    expect(events).toEqual([{ draw: 'UEllipse(5,5)', chain: ['fore(#FF0000)', 'back(#FF0000)', 'translate(8,18)'] }]);
  });

  it('reads percentages against the block and uses the given colour', () => {
    const green = HColorSet.instance().getColor('#00FF00');
    const events = record(measurer, (ug) => new Spot(blockAt10x20(), green, '50%', '100%-5').drawMe(ug));
    expect(events).toEqual([{ draw: 'UEllipse(5,5)', chain: ['fore(#00FF00)', 'back(#00FF00)', 'translate(28,53)'] }]);
  });
});
