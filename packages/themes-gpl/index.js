/**
 * @knowvah/plantuml-themes-gpl -- PlantUML themes that `@knowvah/plantuml-engine`
 * does not ship in its MIT core (issue #180). Register them with the engine:
 *
 *   import { renderSync, themeStore, withThemes } from '@knowvah/plantuml-engine';
 *   import { gplThemes } from '@knowvah/plantuml-themes-gpl';
 *   const base = { get: () => undefined, has: () => false }; // or your own include store
 *   const includeStore = withThemes(base, themeStore(gplThemes));
 *   renderSync(source, { includeStore });
 *
 * Licence: GPL-3.0-or-later. See LICENSE and LICENSES.md.
 */
import { RESIDUE } from './generated/residue.js';
import { THEMES } from './generated/themes.js';

/**
 * One `PackagedTheme` per theme: the verbatim upstream text, plus the residual
 * summary core keeps for its own themes (`PackagedTheme.residue`).
 *
 * @param {string} name
 * @param {string} source
 * @returns {import('@knowvah/plantuml-engine').PackagedTheme}
 */
function packagedTheme(name, source) {
  const residue = Object.hasOwn(RESIDUE, name) ? RESIDUE[name] : undefined;
  return residue === undefined ? { source } : { source, residue };
}

/** @type {import('@knowvah/plantuml-engine').ThemePackage} */
export const gplThemes = {
  name: '@knowvah/plantuml-themes-gpl',
  license: 'GPL-3.0-or-later',
  themes: Object.fromEntries(Object.entries(THEMES).map(([name, source]) => [name, packagedTheme(name, source)])),
};
