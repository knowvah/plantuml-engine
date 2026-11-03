/**
 * Unit cases for the diagram-style-scope harness (diagram-style-scope T0b).
 * Pure helpers are tested directly; listing and measuring run against a temp
 * fixture root so they do not depend on the committed rows, apart from the
 * committed-state checks at the end.
 */
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  DIAGRAM_STYLE_SCOPE_ROOT,
  THROW_DIFF_COUNT,
  auditScopePin,
  checkScopeRow,
  firstScopeDiffs,
  listScopeRows,
  measureScopeRow,
  readScopeFixture,
  readScopePin,
  scopeRowFromDiffCount,
} from '../../oracle/svg-conformance/diagram-style-scope.js';
import { renderDbgMarkup } from '../../oracle/svg-conformance/document-background.js';

const ROW_COUNT = 446;
const SOLID = '@startuml\nskinparam backgroundColor black\nA -> B : hi\n@enduml\n';

let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'dss-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('listScopeRows', () => {
  it('lists puml+svg pairs sorted and skips a puml with no svg', () => {
    for (const f of ['b__x-y.puml', 'b__x-y.svg', 'a__x-y.puml', 'a__x-y.svg', 'c__x-y.puml', 'z.svg']) {
      writeFileSync(join(root, f), '');
    }
    expect(listScopeRows(root)).toEqual(['a__x-y', 'b__x-y']);
  });

  it('returns [] for an absent root', () => {
    expect(listScopeRows(join(root, 'nope'))).toEqual([]);
  });

  it('lists the committed rows', () => {
    const rows = listScopeRows();
    expect(rows).toHaveLength(ROW_COUNT);
    expect(rows).toContain('sequence__selector-own-doc');
    expect(rows).toContain('sequence__variant-gradient');
    expect(rows).toContain('sequence__scope-malformed-brace');
    expect(rows).toEqual([...rows].sort());
  });
});

describe('auditScopePin -- a missing fixture fails naming it', () => {
  it('names an unpinned fixture and an orphaned pin row', () => {
    expect(auditScopePin(['a__x-y', 'b__x-y'], ['a__x-y', 'c__x-y'])).toEqual({
      unpinned: ['b__x-y'],
      orphaned: ['c__x-y'],
    });
  });

  it('names a pin row whose fixture pair is missing on disk', () => {
    writeFileSync(join(root, 'gone__x-y.puml'), SOLID);
    const onDisk = listScopeRows(root);
    expect(onDisk).toEqual([]);
    expect(auditScopePin(onDisk, ['gone__x-y']).orphaned).toEqual(['gone__x-y']);
  });

  it('is empty when pin and disk agree', () => {
    expect(auditScopePin(['a'], ['a'])).toEqual({ unpinned: [], orphaned: [] });
  });
});

describe('checkScopeRow -- shrink-only', () => {
  const pinned = { conformant: false, diffCount: 3 };
  it('passes at or below the pin', () => {
    expect(checkScopeRow('r', pinned, { conformant: false, diffCount: 3 }).ok).toBe(true);
    expect(checkScopeRow('r', pinned, { conformant: true, diffCount: 0 }).ok).toBe(true);
  });
  it('fails on a rise, naming the row and both counts', () => {
    const rise = checkScopeRow('r', pinned, { conformant: false, diffCount: 4 });
    expect(rise.ok).toBe(false);
    expect(rise.message).toContain('r: diffCount ROSE -- pin=3, now=4');
  });
  it('fails when a conformant row stops being conformant', () => {
    const lost = checkScopeRow('r', { conformant: true, diffCount: 0 }, { conformant: false, diffCount: 1 });
    expect(lost.ok).toBe(false);
    expect(lost.message).toContain('r: conformant row LOST conformance (now 1 diffs)');
  });
});

describe('scopeRowFromDiffCount', () => {
  it('is conformant only at zero', () => {
    expect(scopeRowFromDiffCount(0)).toEqual({ conformant: true, diffCount: 0 });
    expect(scopeRowFromDiffCount(2)).toEqual({ conformant: false, diffCount: 2 });
  });
});

describe('measureScopeRow', () => {
  it('is conformant with zero diffs when the oracle is our own render', () => {
    writeRow('s__x-y', SOLID, renderDbgMarkup(SOLID));
    expect(measureScopeRow('s__x-y', root)).toEqual({ conformant: true, diffCount: 0 });
    expect(firstScopeDiffs('s__x-y', 10, root)).toEqual([]);
  });

  it('reports a differing oracle as non-conformant, with its first diffs', () => {
    writeRow('s__x-y', SOLID, '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>');
    const m = measureScopeRow('s__x-y', root);
    expect(m.conformant).toBe(false);
    expect(m.diffCount).toBeGreaterThan(0);
    expect(firstScopeDiffs('s__x-y', 2, root)).toHaveLength(2);
  });

  it('encodes a throwing render as THROW_DIFF_COUNT', () => {
    writeRow('t__x-y', SOLID, '<svg/>');
    const boom = (): string => {
      throw new Error('boom');
    };
    expect(measureScopeRow('t__x-y', root, boom)).toEqual({ conformant: false, diffCount: THROW_DIFF_COUNT });
    expect(firstScopeDiffs('t__x-y', 5, root, boom)).toEqual(['renderSync threw: boom']);
  });

  it('reads the markup and oracle of a row', () => {
    writeRow('s__x-y', SOLID, '<svg/>');
    expect(readScopeFixture('s__x-y', root)).toEqual({ markup: SOLID, golden: '<svg/>' });
  });
});

describe('committed rows and pin', () => {
  it('pins every committed row, in the interface shape', () => {
    const pin = readScopePin();
    expect(Object.keys(pin.rows).sort()).toEqual(listScopeRows());
  });

  it('seeds the known pre-fix verdicts of the first two rows the mission moves', () => {
    const { rows } = readScopePin();
    expect(rows['sequence__selector-own-doc']).toEqual({ conformant: false, diffCount: 2 });
    expect(rows['sequence__variant-gradient']).toEqual({ conformant: false, diffCount: 3 });
  });

  it('measures a committed row to its pinned value', () => {
    const live = measureScopeRow('sequence__selector-own-doc');
    expect(live).toEqual(readScopePin().rows['sequence__selector-own-doc']);
  });

  it('roots the fixtures under tests/fixtures/diagram-style-scope', () => {
    expect(DIAGRAM_STYLE_SCOPE_ROOT.endsWith('tests/fixtures/diagram-style-scope')).toBe(true);
  });
});

function writeRow(row: string, markup: string, svg: string): void {
  writeFileSync(join(root, `${row}.puml`), markup);
  writeFileSync(join(root, `${row}.svg`), svg);
}
