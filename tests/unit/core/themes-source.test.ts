/**
 * `src/core/themes-source.ts` must not drift from its generator
 * (`scripts/build-theme-sources.ts`) or from upstream's theme files.
 *
 * Two checks, because CI has no `~/git/plantuml` checkout:
 *   - always: the committed file is exactly what the generator prints for the
 *     data it holds (a hand edit, or a Prettier reformat, fails here);
 *   - with the upstream checkout present: that data is upstream's, verbatim.
 *
 * #180: core holds only the 35 themes `scripts/theme-packages.json` classes
 * `core`; the other 9 are generated into `packages/themes-*`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { join } from 'node:path';
import {
  PACKAGE_THEMES_DTS,
  THEME_SOURCES_PATH,
  UPSTREAM_THEMES_DIR,
  coreThemeSources,
  packageGeneratedDir,
  readThemeSources,
  readThemeTable,
  renderAllOutputs,
  renderPackageThemesModule,
  renderThemeSourcesModule,
  toStringLiteral,
} from '../../../scripts/build-theme-sources.js';
import { THEMES as GPL_THEMES } from '../../../packages/themes-gpl/generated/themes.js';
import { THEMES as UNLICENSED_THEMES } from '../../../packages/themes-unlicensed/generated/themes.js';
import { THEME_SOURCES } from '../../../src/core/themes-source.js';

/** `ls ~/git/plantuml/src/main/resources/themes/puml-theme-*.puml | wc -l`. */
const UPSTREAM_THEME_COUNT = 44;
/** #180: 31 MIT + 3 Apache-2.0 + `_none_` (scripts/theme-packages.json). */
const CORE_THEME_COUNT = 35;

describe('themes-source.ts', () => {
  it('is the generator output for the data it holds', () => {
    const committed = readFileSync(THEME_SOURCES_PATH, 'utf8');
    expect(renderThemeSourcesModule(new Map(Object.entries(THEME_SOURCES)))).toBe(committed);
    expect(Object.keys(THEME_SOURCES)).toHaveLength(CORE_THEME_COUNT);
  });

  it.runIf(existsSync(UPSTREAM_THEMES_DIR))('holds upstream theme files verbatim', () => {
    expect(renderThemeSourcesModule(coreThemeSources(readThemeSources(), readThemeTable()))).toBe(
      readFileSync(THEME_SOURCES_PATH, 'utf8'),
    );
  });
});

describe('packages/themes-*/generated (#180)', () => {
  it.each([
    ['unlicensed', UNLICENSED_THEMES],
    ['gpl', GPL_THEMES],
  ] as const)('%s is the generator output for the data it holds', (home, themes) => {
    const dir = packageGeneratedDir(home);
    expect(renderPackageThemesModule(new Map(Object.entries(themes)))).toBe(
      readFileSync(join(dir, 'themes.js'), 'utf8'),
    );
    expect(readFileSync(join(dir, 'themes.d.ts'), 'utf8')).toBe(PACKAGE_THEMES_DTS);
  });

  it('core plus both packages hold every theme once', () => {
    const names = [...Object.keys(UNLICENSED_THEMES), ...Object.keys(GPL_THEMES), ...Object.keys(THEME_SOURCES)];
    expect(names).toHaveLength(UPSTREAM_THEME_COUNT);
    expect(new Set(names).size).toBe(UPSTREAM_THEME_COUNT);
  });

  it.runIf(existsSync(UPSTREAM_THEMES_DIR))('every generated theme file is upstream verbatim', () => {
    const stale = [...renderAllOutputs(readThemeSources(), readThemeTable())].filter(
      ([path, body]) => readFileSync(path, 'utf8') !== body,
    );
    expect(stale.map(([path]) => path)).toEqual([]);
  });
});

describe('toStringLiteral', () => {
  it.each([
    ['plain', "'plain'"],
    ["it's", '"it\'s"'],
    ['say "x"', '\'say "x"\''],
    ['a\\b\n\tc\r', "'a\\\\b\\n\\tc\\r'"],
    ['\u0001', "'\\u0001'"],
  ])('%j -> %s', (text, literal) => {
    expect(toStringLiteral(text)).toBe(literal);
  });
});
