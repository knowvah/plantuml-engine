/**
 * c4dd T4a: authored C4 and DomainStory shapes past the 11 corpus rows, and the sequence box title they found
 * (`Display.getWithNewlines`, `CommandBoxStart.java:128`). Each `oracle/<name>.svg` is the jar's.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { combineAssetStores, loadElk, type ElkBackend } from '../../../src/index.js';
import { buildEmojiAssetsStore } from '../../../scripts/emoji-assets-store.js';
import { buildSpriteAssetsStore } from '../../../scripts/sprite-assets-store.js';
import { buildUtilityAssetsStore } from '../../../scripts/utility-assets-store.js';
import { CI_RENDER_BUDGET_MS } from '../../helpers/ci-test-budgets.js';
import { fixtureIncludeStore } from '../../helpers/fixture-include-store.js';
import { jarFixtureDiffs, jarFixtureNames } from '../../helpers/jar-fixture-dir.js';

// Each probe pulls a C4 stdlib include through the preprocessor.
vi.setConfig({ testTimeout: CI_RENDER_BUDGET_MS });

const DIR = 'tests/fixtures/c4dd-T4a';
const names = jarFixtureNames(DIR);
const assetStore = combineAssetStores(buildSpriteAssetsStore(), buildEmojiAssetsStore(), buildUtilityAssetsStore());

let elk: ElkBackend;
beforeAll(async () => {
  elk = await loadElk();
});

describe('C4 and DomainStory probes against the jar', () => {
  it('collects every probe', () => {
    expect(names.length).toBe(34);
  });

  it.each(names)('%s', (name) => {
    expect(jarFixtureDiffs(DIR, name, { assetStore, includeStore: fixtureIncludeStore(), elk })).toEqual([]);
  });
});
