/**
 * Document-background ratchet (document-background-paint T0b, D5).
 *
 * `tests/fixtures/document-background/` holds the authored rows; the pin
 * `oracle/goldens/document-background.json` records each row's verdict and
 * `diffCount`. Modelled on `files.authored.ratchet.test.ts`:
 *
 *   - every `.puml` with a `.svg` has EXACTLY one pin row (a new fixture with
 *     no row FAILS naming it);
 *   - every pin row names a `.puml` + `.svg` on disk;
 *   - a row's `diffCount` may only shrink; a `conformant` row stays conformant.
 *
 * A row whose render throws is pinned at `THROW_DIFF_COUNT`.
 */
import { describe, it, expect } from 'vitest';

import { auditDbgPin, checkDbgRow, listDbgRows, measureDbgRow, readDbgPin } from './document-background.js';

const pin = readDbgPin();
const onDisk = listDbgRows();

describe('document-background ratchet -- pin shape', () => {
  it('every .puml with a .svg has exactly one pin row, and every row names a fixture on disk', () => {
    const { unpinned, orphaned } = auditDbgPin(onDisk, Object.keys(pin.rows));
    expect(unpinned, `fixtures with no oracle/goldens/document-background.json row: ${unpinned.join(', ')}`).toEqual(
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

describe('document-background ratchet -- diffCount never rises', () => {
  for (const [row, pinned] of Object.entries(pin.rows)) {
    it(`${row}: never rises above ${String(pinned.diffCount)}`, () => {
      const { ok, message } = checkDbgRow(row, pinned, measureDbgRow(row));
      expect(ok, message).toBe(true);
    });
  }
});
