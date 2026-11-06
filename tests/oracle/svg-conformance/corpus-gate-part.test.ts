import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  CORPUS_GATE_PARTS,
  corpusGatePartOf,
  expectedPartTestFiles,
  isJarErrorPage,
  partTestFilesOnDisk,
} from './corpus-gate-part.js';
import { keyOf, manifest } from './routing-conformance-gate.js';

describe('corpus gate parts', () => {
  it('assigns a key the same part every time, so a slice is stable', () => {
    const key = 'dot-cache:sequence/zudize-61-vomi445';
    expect(corpusGatePartOf(key)).toBe(corpusGatePartOf(key));
    expect(corpusGatePartOf(key)).toBe(2);
  });

  it('spreads the real corpus across every part, none above 30% of it', () => {
    const counts = new Map<number, number>();
    for (const f of manifest.fixtures) {
      const part = corpusGatePartOf(keyOf(f));
      counts.set(part, (counts.get(part) ?? 0) + 1);
    }
    expect([...counts.keys()].sort()).toEqual(Array.from({ length: CORPUS_GATE_PARTS }, (_, i) => i + 1));
    expect(Math.max(...counts.values()) / manifest.fixtures.length).toBeLessThan(0.3);
  });

  it('names one test file per part, in order', () => {
    expect(expectedPartTestFiles('gate')).toEqual([
      'gate.part-1.test.ts',
      'gate.part-2.test.ts',
      'gate.part-3.test.ts',
      'gate.part-4.test.ts',
    ]);
  });

  it("finds only the named gate's part files on disk, so a deleted part is seen", () => {
    const dir = mkdtempSync(join(tmpdir(), 'corpus-gate-part-'));
    for (const name of ['a.part-2.test.ts', 'a.part-1.test.ts', 'a.test.ts', 'b.part-1.test.ts']) {
      writeFileSync(join(dir, name), '');
    }
    expect(partTestFilesOnDisk(dir, 'a')).toEqual(['a.part-1.test.ts', 'a.part-2.test.ts']);
  });

  it('recognises a whole-element error banner, not a label that mentions one', () => {
    expect(isJarErrorPage('<text x="1">PlantUML version 1.2 / abc [now]</text>')).toBe(true);
    expect(isJarErrorPage('<text x="1">about PlantUML version 1.2 / abc [now]</text>')).toBe(false);
  });
});
