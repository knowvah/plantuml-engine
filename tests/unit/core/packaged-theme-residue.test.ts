/**
 * #180 D4: a theme that ships in a registered package carries its residual
 * summary there; `buildTheme`'s stage 1 reads it when core has none.
 *
 * The residue (`colors.graph.json`) has no renderer reader today: the json
 * family paints from its jar styles (`src/diagrams/json/layout.ts:68-73`), so
 * the observable is the resolved base `Theme`, not an SVG.
 */
import { describe, expect, it } from 'vitest';
import { resolveBaseTheme } from '../../../src/core/packaged-theme-residue.js';
import { resolveTheme } from '../../../src/core/theme.js';
import { EMPTY_INCLUDE_STORE } from '../../../src/core/tim/IncludeStore.js';
import { themeStore, withThemes, type PackagedTheme } from '../../../src/core/tim/ThemeStore.js';

const RESIDUE_BG = '#0B58A8'; // themes-builtin-a-m.ts, amiga
const ZZ_SOURCE = '---\nname: zz\n---\n';
const residue: PackagedTheme['residue'] = { colors: { graph: { json: { background: RESIDUE_BG } } } };

function storeWith(themes: Record<string, PackagedTheme>) {
  return withThemes(EMPTY_INCLUDE_STORE, themeStore({ name: 'p', license: 'MIT', themes }));
}

describe('resolveBaseTheme (D4)', () => {
  it("merges a registered theme's residue onto the default theme", () => {
    const theme = resolveBaseTheme('zz', storeWith({ zz: { source: ZZ_SOURCE, residue } }));
    expect(theme.colors.graph.json?.background).toBe(RESIDUE_BG);
    expect(theme.colors.graph.json?.border).toBe(resolveTheme('default').colors.graph.json?.border);
  });

  it('is the default theme without a residue, a package or a store', () => {
    const fallback = resolveTheme('default');
    expect(resolveBaseTheme('zz', storeWith({ zz: { source: ZZ_SOURCE } }))).toBe(fallback);
    expect(resolveBaseTheme('zz', EMPTY_INCLUDE_STORE)).toBe(fallback);
    expect(resolveBaseTheme('zz', undefined)).toBe(fallback);
  });

  it("prefers core's residue for a core name", () => {
    const store = storeWith({ 'black-knight': { source: ZZ_SOURCE, residue } });
    expect(resolveBaseTheme('black-knight', store)).toEqual(resolveTheme('black-knight'));
    expect(resolveBaseTheme('black-knight', store).colors.graph.json?.background).not.toBe(RESIDUE_BG);
  });

  it('keeps the named aliases', () => {
    expect(resolveBaseTheme('dark', undefined)).toBe(resolveTheme('dark'));
  });
});
