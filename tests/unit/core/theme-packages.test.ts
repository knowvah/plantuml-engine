/**
 * #180: the D5 classification table and the two theme packages
 * (plans/themes-opt-in-packages/decisions.md D4-D6).
 *
 * The table must equal the maintainer ruling of 2026-11-13 and agree with
 * every theme's own `license:` header. Headers are read from the generated
 * data (core plus both packages), which together hold all 44 upstream themes,
 * so the check runs without the `~/git/plantuml` checkout CI lacks.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { THEMES as GPL_SOURCES } from '../../../packages/themes-gpl/generated/themes.js';
import { gplThemes } from '../../../packages/themes-gpl/index.js';
import { THEMES as UNLICENSED_SOURCES } from '../../../packages/themes-unlicensed/generated/themes.js';
import { unlicensedThemes } from '../../../packages/themes-unlicensed/index.js';
import {
  UPSTREAM_THEMES_DIR,
  classifyThemes,
  readThemeTable,
  type ThemeHome,
} from '../../../scripts/build-theme-sources.js';
import { THEME_SOURCES } from '../../../src/core/themes-source.js';
import { BUILTIN_THEMES } from '../../../src/core/themes-builtin.js';
import { readLines } from '../../../src/core/tim/ReadLineReader.js';
import { readThemeWithYamlHeader } from '../../../src/core/tim/EaterTheme.js';

const REPO = join(import.meta.dirname, '..', '..', '..');

/** The ruling's sets (#180). */
const UNLICENSED = ['amiga', 'blueprint', 'carbon-gray', 'crt-amber', 'crt-green', 'mimeograph', 'mono', 'plain'];
const GPL = ['sunlust'];
const APACHE = ['mars', 'toy', 'vibrant'];
const MIT_COUNT = 31;
const NONE_THEME = '_none_';

/** The header `license:` value that sends a theme to each home (D5). */
const HOME_OF_LICENSE: Readonly<Record<string, ThemeHome>> = {
  MIT: 'core',
  'Apache License, Version 2.0': 'core',
  '': 'unlicensed',
  'GPL 3+': 'gpl',
};

const table = readThemeTable();
const allSources: Readonly<Record<string, string>> = { ...UNLICENSED_SOURCES, ...GPL_SOURCES, ...THEME_SOURCES };

function namesIn(home: ThemeHome): string[] {
  return [...table].filter(([, h]) => h === home).map(([name]) => name);
}

function licenseOf(source: string): string {
  return readThemeWithYamlHeader(readLines(source, 'x')).metadata['license'] ?? '';
}

describe('scripts/theme-packages.json (D5)', () => {
  it("equals the ruling's three sets", () => {
    expect(table.size).toBe(44);
    expect(namesIn('unlicensed').sort()).toEqual([...UNLICENSED].sort());
    expect(namesIn('gpl')).toEqual(GPL);
    const core = namesIn('core');
    expect(core).toHaveLength(MIT_COUNT + APACHE.length + 1);
    expect(core).toEqual(expect.arrayContaining([...APACHE, NONE_THEME]));
  });

  it("agrees with every theme's license header (_none_ is core by ruling)", () => {
    expect(Object.keys(allSources).sort()).toEqual([...table.keys()].sort());
    const mismatched = [...table]
      .filter(([name]) => name !== NONE_THEME)
      .filter(([name, home]) => HOME_OF_LICENSE[licenseOf(allSources[name]!)] !== home);
    expect(mismatched).toEqual([]);
    expect(licenseOf(allSources[NONE_THEME]!)).toBe('');
    expect(namesIn('core').filter((n) => licenseOf(allSources[n]!) === 'MIT')).toHaveLength(MIT_COUNT);
  });

  it('fails on an upstream theme it does not classify, naming it', () => {
    const sources = new Map([...Object.entries(allSources), ['new', '---\nname: new\n---\n']]);
    expect(() => classifyThemes(sources, table)).toThrow(/\bnew\b/);
  });
});

describe('the theme packages (D6)', () => {
  it('unlicensed holds exactly the 8 themes, verbatim', () => {
    expect(Object.keys(unlicensedThemes.themes).sort()).toEqual([...UNLICENSED].sort());
    expect(unlicensedThemes.name).toBe('@knowvah/plantuml-themes-unlicensed');
    expect(unlicensedThemes.license).toBe('SEE LICENSE IN LICENSE');
    for (const [name, theme] of Object.entries(unlicensedThemes.themes))
      expect(theme.source).toBe(UNLICENSED_SOURCES[name]);
  });

  it('gpl holds sunlust, with its residue', () => {
    expect(Object.keys(gplThemes.themes)).toEqual(GPL);
    expect(gplThemes.license).toBe('GPL-3.0-or-later');
    // Today's BUILTIN_THEMES.sunlust (themes-builtin-p-v.ts at 5aa2d33f5).
    expect(gplThemes.themes['sunlust']?.residue).toEqual({
      colors: {
        graph: {
          json: {
            background: '#FDF6E3',
            border: '#657B83',
            arrowColor: '#657B83',
            keyText: '#657B83',
            stringValue: '#657B83',
            numberValue: '#657B83',
            booleanValue: '#657B83',
            nullValue: '#657B83',
          },
        },
      },
    });
  });

  it('leaves no packaged theme, source or residue, in core (D4)', () => {
    for (const pkg of [unlicensedThemes, gplThemes])
      for (const name of Object.keys(pkg.themes)) {
        expect(Object.hasOwn(THEME_SOURCES, name), name).toBe(false);
        expect(Object.hasOwn(BUILTIN_THEMES, name), name).toBe(false);
      }
    expect(Object.keys(BUILTIN_THEMES).sort()).toEqual(
      namesIn('core')
        .filter((n) => n !== NONE_THEME)
        .sort(),
    );
  });

  it.runIf(existsSync(UPSTREAM_THEMES_DIR))('amiga is upstream byte for byte', () => {
    const upstream = readFileSync(join(UPSTREAM_THEMES_DIR, 'puml-theme-amiga.puml'), 'utf8');
    expect(unlicensedThemes.themes['amiga']?.source).toBe(upstream);
  });

  it('packages/all names the unlicensed package and never the gpl one', () => {
    const files = ['package.json', 'index.js', 'index.d.ts'].map((f) =>
      readFileSync(join(REPO, 'packages', 'all', f), 'utf8'),
    );
    for (const text of files) expect(text).not.toContain('plantuml-themes-gpl');
    expect(files.every((text) => text.includes('@knowvah/plantuml-themes-unlicensed'))).toBe(true);
    const pkg = JSON.parse(files[0]!) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies)).toContain('@knowvah/plantuml-themes-unlicensed');
  });
});
