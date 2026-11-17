import { describe, it, expect } from 'vitest';
import { computeSimpleSelectorOverrides } from '../../../src/core/style-map-simple-fields.js';
import type { StyleMap } from '../../../src/core/skinparam.js';
import { REMOVED_BUSINESS_FILL_FIELDS } from '../../helpers/removed-theme-fields.js';

const ACTOR_BACKGROUND = '#123';
const BUSINESS_BACKGROUND = '#456';

function businessStyleMap(): StyleMap {
  return new Map([
    ['actor', new Map([['backgroundcolor', ACTOR_BACKGROUND]])],
    ['actor.business', new Map([['backgroundcolor', BUSINESS_BACKGROUND]])],
    ['usecase.business', new Map([['backgroundcolor', BUSINESS_BACKGROUND]])],
  ]);
}

// #156 option #1: the `actor.business`/`usecase.business` selector entries
// wrote theme fields nothing read; the business symbols take their fill from
// the element style buckets (`style-element-scope.ts`), as
// `EntityImageDescription.java:164-166` reads `styleTitle`.
describe('computeSimpleSelectorOverrides — business selectors (#156)', () => {
  it('writes no business fill key for actor.business / usecase.business', () => {
    const override = computeSimpleSelectorOverrides(businessStyleMap());
    for (const field of REMOVED_BUSINESS_FILL_FIELDS) {
      expect(Object.hasOwn(override, field)).toBe(false);
    }
  });

  it('still maps actor BackGroundColor to actorFill and nothing else', () => {
    const override = computeSimpleSelectorOverrides(businessStyleMap());
    expect(override).toEqual({ actorFill: ACTOR_BACKGROUND });
  });
});
