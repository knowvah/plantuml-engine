/**
 * Node-side {@link AssetStore} over the vendored utility-diagram pictures --
 * the ten dedication PNGs (`assets/dedication/`; the two egg pictures went with
 * their factories upstream, dadad87bba3) -- for harnesses that render synchronously: the survey, the
 * utility conformance harness and unit tests (ufp T1i, ADR-2).
 *
 * Sibling of `scripts/emoji-assets-store.ts`. Lives under `scripts/` because it
 * uses Node `fs`, which `src/` may never do (CLAUDE.md). Keys are the modules'
 * own `assetKey`s (`dedication:<resource>.png`).
 *
 * ```ts
 * combineAssetStores(buildSpriteAssetsStore(), buildUtilityAssetsStore())
 * ```
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AssetPayload, AssetStore } from '../src/core/asset-store.js';
import { DEDICATION_IMAGES } from '../src/diagrams/dedication/dedication-images.js';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const DEFAULT_ASSETS_DEDICATION_DIR = join(REPO_ROOT, 'assets', 'dedication');

const PNG_MIME = 'image/png';
const PNG_SUFFIX = '.png';

/**
 * Reads every dedication PNG into an in-memory {@link AssetStore}. Eager (10
 * small files), so the store is a pure lookup afterwards. Throws with a
 * remediation hint when the directory is absent.
 */
export function readUtilityAssetsStore(dedicationDir: string = DEFAULT_ASSETS_DEDICATION_DIR): AssetStore {
  if (!existsSync(dedicationDir))
    throw new Error(`${dedicationDir} does not exist. Restore it from git (\`git checkout -- assets\`).`);
  const entries = new Map<string, AssetPayload>();
  const add = (assetKey: string, path: string): void => {
    entries.set(assetKey, { bytes: new Uint8Array(readFileSync(path)), mimeType: PNG_MIME });
  };
  for (const { resource, assetKey } of Object.values(DEDICATION_IMAGES))
    add(assetKey, join(dedicationDir, resource + PNG_SUFFIX));
  return {
    get: (key: string): AssetPayload | undefined => entries.get(key),
    has: (key: string): boolean => entries.has(key),
  };
}

let cached: AssetStore | undefined;

/** Process-wide cached {@link readUtilityAssetsStore}. */
export function buildUtilityAssetsStore(): AssetStore {
  cached ??= readUtilityAssetsStore();
  return cached;
}
