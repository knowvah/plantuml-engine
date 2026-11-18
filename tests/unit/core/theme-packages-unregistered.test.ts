/**
 * #180 D2: a theme that left core resolves only through its registered
 * package. Unregistered, `!theme <name>` is upstream's unknown-name error,
 * `Cannot load theme <name>` (`EaterTheme.java:82-85`): licence-forced,
 * named in DIVERGENCES.md.
 */
import { describe, expect, it } from 'vitest';
import { renderSync } from '../../../src/index.js';
import { THEME_SOURCES } from '../../../src/core/themes-source.js';
import { expectErrorDiagram, expectNoErrorDiagram } from '../../helpers/error-diagram.js';
import { themedIncludeStore, themePackagesStore } from '../../helpers/theme-packages-store.js';

const MOVED = ['amiga', 'blueprint', 'carbon-gray', 'crt-amber', 'crt-green', 'mimeograph', 'mono', 'plain', 'sunlust'];

const sourceWith = (name: string): string => `@startuml\n!theme ${name}\na -> b\n@enduml`;

describe('moved themes without their package (#180 D2)', () => {
  it('core holds none of them; the packages hold all of them', () => {
    expect(MOVED.filter((name) => Object.hasOwn(THEME_SOURCES, name))).toEqual([]);
    expect([...themePackagesStore().themeNames()].sort()).toEqual(MOVED);
  });

  it.each(MOVED)('!theme %s: the Cannot load theme error page, unregistered', (name) => {
    expectErrorDiagram(renderSync(sourceWith(name)), `Cannot load theme ${name}`);
  });

  it.each(MOVED)('!theme %s: the themed page, registered', (name) => {
    const svg = renderSync(sourceWith(name), { includeStore: themedIncludeStore() });
    expectNoErrorDiagram(svg, name);
    expect(svg).not.toBe(renderSync('@startuml\na -> b\n@enduml'));
  });

  it('sunlust registered paints its background (puml-theme-sunlust.puml)', () => {
    const svg = renderSync(sourceWith('sunlust'), { includeStore: themedIncludeStore() });
    expect(svg).toMatch(/background:#(FDF6E3|fdf6e3)/);
  });
});
