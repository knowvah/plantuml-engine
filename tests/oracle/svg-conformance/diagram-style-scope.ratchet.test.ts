/**
 * Diagram-style-scope ratchet (diagram-style-scope T0b).
 *
 * `tests/fixtures/diagram-style-scope/` holds the authored rows; the pin
 * `oracle/goldens/diagram-style-scope.json` records each row's verdict and
 * `diffCount`. Modelled on `document-background.ratchet.test.ts`:
 *
 *   - every `.puml` with a `.svg` has EXACTLY one pin row (a new fixture with
 *     no row FAILS naming it);
 *   - every pin row names a `.puml` + `.svg` on disk;
 *   - a row's `diffCount` may only shrink; a `conformant` row stays conformant;
 *   - a `stockError` row is measured under the error-page rule (smc D5).
 */
import { describe, it, expect } from 'vitest';

import { auditScopePin, checkScopeRow, listScopeRows, measureScopeRow, readScopePin } from './diagram-style-scope.js';

const pin = readScopePin();
const onDisk = listScopeRows();

describe('diagram-style-scope ratchet -- pin shape', () => {
  it('every .puml with a .svg has exactly one pin row, and every row names a fixture on disk', () => {
    const { unpinned, orphaned } = auditScopePin(onDisk, Object.keys(pin.rows));
    expect(unpinned, `fixtures with no oracle/goldens/diagram-style-scope.json row: ${unpinned.join(', ')}`).toEqual(
      [],
    );
    expect(orphaned, `pin rows with no .puml+.svg on disk: ${orphaned.join(', ')}`).toEqual([]);
  });

  it('pins a row whose conformant flag agrees with its diffCount', () => {
    for (const [row, r] of Object.entries(pin.rows)) {
      expect(r.conformant, `${row}: conformant must equal (diffCount === 0)`).toBe(r.diffCount === 0);
    }
  });
});

describe('diagram-style-scope ratchet -- diffCount never rises', () => {
  for (const [row, pinned] of Object.entries(pin.rows)) {
    it(`${row}: never rises above ${String(pinned.diffCount)}`, () => {
      const { ok, message } = checkScopeRow(row, pinned, measureScopeRow(row, undefined, undefined, pinned.stockError));
      expect(ok, message).toBe(true);
    });
  }
});
