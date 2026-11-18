/**
 * @knowvah/plantuml-themes-unlicensed -- PlantUML themes that `@knowvah/plantuml-engine`
 * does not ship in its MIT core (issue #180). Register them with the engine:
 *
 *   import { renderSync, themeStore, withThemes } from '@knowvah/plantuml-engine';
 *   import { unlicensedThemes } from '@knowvah/plantuml-themes-unlicensed';
 *   const base = { get: () => undefined, has: () => false }; // or your own include store
 *   const includeStore = withThemes(base, themeStore(unlicensedThemes));
 *   renderSync(source, { includeStore });
 *
 * Licence: SEE LICENSE IN LICENSE. See LICENSE and LICENSES.md.
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
export const unlicensedThemes = {
  name: '@knowvah/plantuml-themes-unlicensed',
  license: 'SEE LICENSE IN LICENSE',
  themes: Object.fromEntries(Object.entries(THEMES).map(([name, source]) => [name, packagedTheme(name, source)])),
};
