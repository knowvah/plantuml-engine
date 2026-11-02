/**
 * Unit cases for the document-background harness (document-background-paint T0b).
 * Pure helpers are tested directly; `listDbgRows` / `measureDbgRow` run against
 * a temp fixture root so they do not depend on the committed rows.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  THROW_DIFF_COUNT,
  auditDbgPin,
  checkDbgRow,
  firstDbgDiffs,
  listDbgRows,
  measureDbgRow,
  readDbgPin,
  renderDbgMarkup,
  rowFromDiffCount,
} from '../../oracle/svg-conformance/document-background.js';

const SOLID = '@startuml\nskinparam backgroundColor black\nA -> B : hi\n@enduml\n';

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'dbg-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('listDbgRows', () => {
  it('lists puml+svg pairs sorted and skips a puml with no svg', () => {
    for (const f of ['b-black.puml', 'b-black.svg', 'a-gradient.puml', 'a-gradient.svg', 'c-black.puml', 'x.svg']) {
      writeFileSync(join(root, f), '');
    }
    expect(listDbgRows(root)).toEqual(['a-gradient', 'b-black']);
  });

  it('returns [] for an absent root', () => {
    expect(listDbgRows(join(root, 'nope'))).toEqual([]);
  });

  it('lists the committed rows, including the json and class extra separators', () => {
    const rows = listDbgRows();
    expect(rows).toContain('json-gradient-pipe');
    expect(rows).toContain('class-gradient-dash');
    expect(rows).toContain('sequence-skinparam-gradient');
    expect(rows).toHaveLength(43);
  });
});

describe('auditDbgPin -- a missing fixture fails naming it', () => {
  it('names an unpinned fixture and an orphaned pin row', () => {
    expect(auditDbgPin(['a-black', 'b-black'], ['a-black', 'c-black'])).toEqual({
      unpinned: ['b-black'],
      orphaned: ['c-black'],
    });
  });

  it('is empty when pin and disk agree', () => {
    expect(auditDbgPin(['a'], ['a'])).toEqual({ unpinned: [], orphaned: [] });
  });
});

describe('checkDbgRow -- shrink-only', () => {
  const pinned = { conformant: false, diffCount: 3 };
  it('passes at or below the pin', () => {
    expect(checkDbgRow('r', pinned, { conformant: false, diffCount: 3 }).ok).toBe(true);
    expect(checkDbgRow('r', pinned, { conformant: true, diffCount: 0 }).ok).toBe(true);
  });
  it('fails on a rise, naming the row and both counts', () => {
    const rise = checkDbgRow('r', pinned, { conformant: false, diffCount: 4 });
    expect(rise.ok).toBe(false);
    expect(rise.message).toContain('r: diffCount ROSE -- pin=3, now=4');
  });
  it('fails when a conformant row stops being conformant', () => {
    const lost = checkDbgRow('r', { conformant: true, diffCount: 0 }, { conformant: false, diffCount: 1 });
    expect(lost.ok).toBe(false);
    expect(lost.message).toContain('LOST conformance');
  });
});

describe('rowFromDiffCount', () => {
  it('is conformant only at zero', () => {
    expect(rowFromDiffCount(0)).toEqual({ conformant: true, diffCount: 0 });
    expect(rowFromDiffCount(2)).toEqual({ conformant: false, diffCount: 2 });
  });
});

describe('measureDbgRow', () => {
  it('is conformant with zero diffs when the oracle is our own render', () => {
    writeRow('r-black', SOLID, renderDbgMarkup(SOLID));
    expect(measureDbgRow('r-black', root)).toEqual({ conformant: true, diffCount: 0 });
    expect(firstDbgDiffs('r-black', 10, root)).toEqual([]);
  });

  it('reports a differing oracle as non-conformant, with its first diffs', () => {
    writeRow('r-black', SOLID, '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
    const m = measureDbgRow('r-black', root);
    expect(m.conformant).toBe(false);
    expect(m.diffCount).toBeGreaterThan(0);
    expect(firstDbgDiffs('r-black', 2, root)).toHaveLength(2);
    expect(firstDbgDiffs('r-black', 2, root)[0]).toMatch(/^svg\/[^:]+: ours=.* jar=/);
  });

  it('encodes a throwing render as THROW_DIFF_COUNT', () => {
    writeRow('t-black', SOLID, '<svg/>');
    const boom = (): string => {
      throw new Error('boom');
    };
    expect(measureDbgRow('t-black', root, boom)).toEqual({ conformant: false, diffCount: THROW_DIFF_COUNT });
    expect(firstDbgDiffs('t-black', 5, root, boom)).toEqual(['renderSync threw: boom']);
  });

  it('encodes a non-Error throw by its string form', () => {
    writeRow('t-black', SOLID, '<svg/>');
    const boom = (): string => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- exercising the non-Error branch
      throw 'plain';
    };
    expect(firstDbgDiffs('t-black', 5, root, boom)).toEqual(['renderSync threw: plain']);
  });
});

describe('committed pin', () => {
  it('pins every committed row with a conformant flag that agrees with its count', () => {
    const pin = readDbgPin();
    expect(Object.keys(pin.rows).sort()).toEqual(listDbgRows());
  });
});

function writeRow(row: string, markup: string, svg: string): void {
  writeFileSync(join(root, `${row}.puml`), markup);
  writeFileSync(join(root, `${row}.svg`), svg);
}
