/**
 * `scripts/utility-assets-store.ts` (ufp T1i, ADR-2): serves every dedication PNG and both egg
 * pictures under the modules' own `assetKey`s, each with the sha256 the module records.
 */
import { createHash } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildUtilityAssetsStore, readUtilityAssetsStore } from '../../../scripts/utility-assets-store.js';
import { DEDICATION_IMAGES } from '../../../src/diagrams/dedication/dedication-images.js';

const sha256 = (bytes: Uint8Array): string => createHash('sha256').update(bytes).digest('hex');
const EXPECTED = Object.values(DEDICATION_IMAGES);

describe('buildUtilityAssetsStore', () => {
  const store = buildUtilityAssetsStore();

  it('covers the 10 dedications (the egg pictures went upstream in dadad87bba3)', () => {
    expect(EXPECTED).toHaveLength(10);
  });

  it.each(EXPECTED.map((image) => [image.assetKey, image.sha256] as const))('serves %s with sha256 %s', (key, hash) => {
    expect(store.has(key)).toBe(true);
    const payload = store.get(key);
    expect(payload?.mimeType).toBe('image/png');
    expect(sha256(payload?.bytes ?? new Uint8Array())).toBe(hash);
  });

  it('misses an unknown key', () => {
    expect(store.has('eggs:nope.png')).toBe(false);
    expect(store.get('eggs:nope.png')).toBe(undefined);
  });

  it('is memoized process-wide', () => {
    expect(buildUtilityAssetsStore()).toBe(store);
  });
});

describe('readUtilityAssetsStore', () => {
  it('names the missing directory', () => {
    const missing = join(mkdtempSync(join(tmpdir(), 'uas-')), 'absent');
    expect(() => readUtilityAssetsStore(missing)).toThrow(/absent does not exist/);
  });
});
