/**
 * Theme packages (#180, plans/themes-opt-in-packages/decisions.md D1, D2):
 * `themeStore`, `withThemes`, the lookup order, and forwarding through
 * `withStdlib` and the async prefetch store.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/theme/ThemeUtils.java#loadBundledOrLocalTheme
 */
import { describe, expect, it, vi } from 'vitest';
import { prepareIncludeStore, renderSync } from '../../../../src/index.js';
import { loadTheme } from '../../../../src/core/tim/EaterTheme.js';
import { EMPTY_INCLUDE_STORE, MapIncludeStore, type IncludeStore } from '../../../../src/core/tim/IncludeStore.js';
import { withStdlib } from '../../../../src/core/tim/StdlibStore.js';
import { themeStore, withThemes, type ThemePackage } from '../../../../src/core/tim/ThemeStore.js';

const ZZ_BACKGROUND = '#123456';
const zzSource = (bg: string): string => `---\nname: zz\n---\nskinparam backgroundColor ${bg}\n`;
const ZZ_PKG: ThemePackage = { name: 'p', license: 'MIT', themes: { zz: { source: zzSource(ZZ_BACKGROUND) } } };
const ZZ_SOURCE = '@startuml\n!theme zz\na -> b\n@enduml';
const STDLIB_KEY = 'lib/x.puml';
const STDLIB_TEXT = '!$FROM_STDLIB = "1"';
const stdlib = { getPumlResource: (f: string): string | undefined => (f === STDLIB_KEY ? STDLIB_TEXT : undefined) };

function backgroundOf(svg: string): string | undefined {
  return /background:(#[0-9A-Fa-f]{6})/.exec(svg)?.[1];
}

describe('themeStore', () => {
  it('looks up a theme by name, first package wins', () => {
    const second: ThemePackage = {
      name: 'q',
      license: 'MIT',
      themes: { zz: { source: zzSource('#ABCDEF') }, yy: { source: 'y' } },
    };
    const store = themeStore(ZZ_PKG, second);
    expect(store.getTheme('zz')?.source).toBe(zzSource(ZZ_BACKGROUND));
    expect(store.getTheme('yy')?.source).toBe('y');
    expect(store.themeNames()).toEqual(['zz', 'yy']);
  });

  it('misses Object prototype members', () => {
    expect(themeStore(ZZ_PKG).getTheme('constructor')).toBeUndefined();
    expect(themeStore(ZZ_PKG).getTheme('toString')).toBeUndefined();
  });
});

describe('withThemes: registered themes render (D2)', () => {
  it('renders a packaged theme only when registered', () => {
    const includeStore = withThemes(EMPTY_INCLUDE_STORE, themeStore(ZZ_PKG));
    expect(backgroundOf(renderSync(ZZ_SOURCE, { includeStore }))).toBe(ZZ_BACKGROUND);
    expect(renderSync(ZZ_SOURCE)).toContain('Cannot load theme zz');
  });

  it('describes a packaged theme by its bundled resource path (ThemeUtils.java:131-133)', () => {
    const theme = loadTheme(withThemes(EMPTY_INCLUDE_STORE, themeStore(ZZ_PKG)), 'zz', undefined);
    expect(theme?.lines[0]?.getLocation()?.getDescription()).toBe('</themes/puml-theme-zz.puml>');
    expect(theme?.metadata).toEqual({ name: 'zz' });
  });

  it('reads core before a package, and a package before a local file', () => {
    const amiga: ThemePackage = { name: 'p', license: 'MIT', themes: { 'aws-orange': { source: '!$PKG = "1"' } } };
    const core = loadTheme(withThemes(EMPTY_INCLUDE_STORE, themeStore(amiga)), 'aws-orange', undefined);
    expect(core?.metadata['name']).toBe('aws-orange');
    const local = new MapIncludeStore({ 'puml-theme-zz.puml': 'skinparam backgroundColor #000000' });
    expect(backgroundOf(renderSync(ZZ_SOURCE, { includeStore: withThemes(local, themeStore(ZZ_PKG)) }))).toBe(
      ZZ_BACKGROUND,
    );
  });

  it('forwards get/has and the stdlib seam to the base', () => {
    const base = withStdlib(new MapIncludeStore({ 'a.puml': 'A' }), stdlib);
    const store = withThemes(base, themeStore(ZZ_PKG));
    expect(store.get('a.puml')).toBe('A');
    expect(store.has('a.puml')).toBe(true);
    expect(store.has('b.puml')).toBe(false);
    expect(store.getPumlResource?.(STDLIB_KEY)).toBe(STDLIB_TEXT);
    expect(withThemes(EMPTY_INCLUDE_STORE, themeStore()).getPumlResource?.(STDLIB_KEY)).toBeUndefined();
    expect(store.packagedThemeNames?.()).toEqual(['zz']);
  });
});

describe('composition with withStdlib, either order (D1)', () => {
  const orders: readonly [string, IncludeStore][] = [
    ['withStdlib(withThemes(...))', withStdlib(withThemes(EMPTY_INCLUDE_STORE, themeStore(ZZ_PKG)), stdlib)],
    ['withThemes(withStdlib(...))', withThemes(withStdlib(EMPTY_INCLUDE_STORE, stdlib), themeStore(ZZ_PKG))],
  ];

  it.each(orders)('%s resolves a <bundle/file> include and the packaged theme', (_label, includeStore) => {
    expect(includeStore.getPumlResource?.(STDLIB_KEY)).toBe(STDLIB_TEXT);
    expect(includeStore.getPackagedTheme?.('zz')?.source).toBe(zzSource(ZZ_BACKGROUND));
    expect(includeStore.packagedThemeNames?.()).toEqual(['zz']);
    expect(
      backgroundOf(renderSync(`@startuml\n!include <${STDLIB_KEY}>\n!theme zz\na -> b\n@enduml`, { includeStore })),
    ).toBe(ZZ_BACKGROUND);
  });

  it('withStdlib over a store with no packages names none', () => {
    const store = withStdlib(EMPTY_INCLUDE_STORE, stdlib);
    expect(store.getPackagedTheme?.('zz')).toBeUndefined();
    expect(store.packagedThemeNames?.()).toEqual([]);
  });
});

describe('the async prefetch keeps the registered themes (D1, D2)', () => {
  it('forwards both methods and never fetches a registered theme', async () => {
    const fetcher = vi.fn();
    const includeStore = await prepareIncludeStore(ZZ_SOURCE, {
      fetcher,
      includeStore: withThemes(EMPTY_INCLUDE_STORE, themeStore(ZZ_PKG)),
    });
    expect(includeStore.getPackagedTheme?.('zz')?.source).toBe(zzSource(ZZ_BACKGROUND));
    expect(includeStore.packagedThemeNames?.()).toEqual(['zz']);
    expect(fetcher).not.toHaveBeenCalled();
    expect(backgroundOf(renderSync(ZZ_SOURCE, { includeStore }))).toBe(ZZ_BACKGROUND);
  });

  it('still fetches the local file for an unregistered name', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('offline'));
    const includeStore = await prepareIncludeStore(ZZ_SOURCE, { fetcher });
    expect(fetcher).toHaveBeenCalledWith('puml-theme-zz.puml');
    expect(includeStore.getPackagedTheme?.('zz')).toBeUndefined();
    expect(includeStore.packagedThemeNames?.()).toEqual([]);
  });
});
