/**
 * Generates `src/core/themes-source.ts`: upstream's bundled theme files,
 * VERBATIM, keyed by theme name -- the text `ThemeUtils#loadBundledOrLocalTheme`
 * reads from the jar's `/themes/puml-theme-<name>.puml` resources
 * (`ThemeUtils.java:131-139`). Browser-safe `src/` has no filesystem, so the
 * resources are embedded as string literals, exactly as upstream's own browser
 * build ships them in `themes.js` (`ThemeUtils.java:84-117`, `loadJsTheme`).
 *
 * One property per theme, laid out exactly as Prettier prints it (key on its
 * own line, bare when identifier-safe; the literal in `.prettierrc`'s single
 * quote unless the text holds more single quotes than double), so the
 * pre-commit Prettier pass leaves the generated file byte-identical. Core's 35
 * themes stay far under the 500-line file cap.
 *
 * #180: `scripts/theme-packages.json` classifies every upstream theme as
 * `core`, `unlicensed` or `gpl` (plans/themes-opt-in-packages D5). The two
 * package classes are also written to `packages/themes-<class>/generated/themes.js`
 * (plus a `.d.ts`), in the same literal style. A theme the table does not
 * classify fails the run: a new upstream theme needs a licence decision.
 *
 *   npx jiti scripts/build-theme-sources.ts           regenerate
 *   npx jiti scripts/build-theme-sources.ts --check   exit 1 if any output would change
 *
 * Drift gate: `tests/unit/core/themes-source.test.ts`.
 *
 * Node-only dev tooling -- never imported by `src/`.
 *
 * @see ~/git/knowvah/plantuml/src/main/java/net/sourceforge/plantuml/theme/ThemeUtils.java
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLANTUML_CHECKOUT } from './lib/plantuml-checkout.js';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Upstream's theme resource folder (`ThemeUtils.java` `THEME_PATH = "themes"`), in the checkout
 *  `PLANTUML_FORK` names (as `rebaseline-svg-goldens.ts` reads it), else `~/git/knowvah/plantuml`. */
export const UPSTREAM_THEMES_DIR = join(PLANTUML_CHECKOUT, 'src', 'main', 'resources', 'themes');

export const THEME_SOURCES_PATH = join(REPO, 'src', 'core', 'themes-source.ts');

/** The D5 classification table, shared with `scripts/compile-themes.py`. */
export const THEME_TABLE_PATH = join(REPO, 'scripts', 'theme-packages.json');

/** Where a theme ships (#180 ruling). */
export type ThemeHome = 'core' | 'unlicensed' | 'gpl';

/** The two package classes, in a fixed order. */
export const PACKAGE_HOMES = ['unlicensed', 'gpl'] as const satisfies readonly ThemeHome[];

export type PackageHome = (typeof PACKAGE_HOMES)[number];

/** A package's generated directory, `packages/themes-<home>/generated/`. */
export function packageGeneratedDir(home: PackageHome): string {
  return join(REPO, 'packages', `themes-${home}`, 'generated');
}

const THEME_HOMES: ReadonlySet<string> = new Set<ThemeHome>(['core', ...PACKAGE_HOMES]);

/** `scripts/theme-packages.json`'s `themes` map, validated. */
export function readThemeTable(path: string = THEME_TABLE_PATH): ReadonlyMap<string, ThemeHome> {
  const raw = (JSON.parse(readFileSync(path, 'utf8')) as { themes: Record<string, string> }).themes;
  for (const [name, home] of Object.entries(raw))
    if (!THEME_HOMES.has(home)) throw new Error(`theme-packages.json: ${name} has unknown home ${home}`);
  return new Map(Object.entries(raw) as [string, ThemeHome][]);
}

/**
 * Splits `sources` by the table. Throws, naming every theme, when an upstream
 * theme is unclassified: a default would silently decide a licence question.
 */
export function classifyThemes(
  sources: ReadonlyMap<string, string>,
  table: ReadonlyMap<string, ThemeHome>,
): ReadonlyMap<ThemeHome, ReadonlyMap<string, string>> {
  const missing = [...sources.keys()].filter((name) => !table.has(name));
  if (missing.length > 0)
    throw new Error(
      `scripts/theme-packages.json does not classify upstream theme(s): ${missing.join(', ')}. ` +
        'Decide core, unlicensed or gpl from the theme header licence (#180).',
    );
  const byHome = new Map<ThemeHome, Map<string, string>>([
    ['core', new Map()],
    ...PACKAGE_HOMES.map((h) => [h, new Map<string, string>()] as const),
  ]);
  for (const [name, text] of sources) byHome.get(table.get(name)!)!.set(name, text);
  return byHome;
}

/** The themes `themes-source.ts` embeds: the table's `core` class only (#180). */
export function coreThemeSources(
  sources: ReadonlyMap<string, string>,
  table: ReadonlyMap<string, ThemeHome>,
): ReadonlyMap<string, string> {
  return classifyThemes(sources, table).get('core')!;
}

/** `ThemeUtils.java` `THEME_FILE_PREFIX` / `THEME_FILE_SUFFIX`. */
const THEME_FILE_PREFIX = 'puml-theme-';
const THEME_FILE_SUFFIX = '.puml';

/**
 * Every `puml-theme-<name>.puml` in `dir`, keyed by `<name>`, sorted by name --
 * the filter `ThemeUtils#getAllThemeNames` applies (`ThemeUtils.java:181-184`).
 */
export function readThemeSources(dir: string = UPSTREAM_THEMES_DIR): ReadonlyMap<string, string> {
  const names = readdirSync(dir)
    .filter((f) => f.startsWith(THEME_FILE_PREFIX) && f.endsWith(THEME_FILE_SUFFIX))
    .map((f) => f.slice(THEME_FILE_PREFIX.length, f.length - THEME_FILE_SUFFIX.length))
    .sort();
  return new Map(
    names.map((name) => [name, readFileSync(join(dir, `${THEME_FILE_PREFIX}${name}${THEME_FILE_SUFFIX}`), 'utf8')]),
  );
}

/** Escapes that JavaScript requires inside a quoted literal. */
const ESCAPES: Readonly<Record<string, string>> = { '\\': '\\\\', '\n': '\\n', '\r': '\\r', '\t': '\\t' };

/** Control characters other than the three with short escapes. */
const RE_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u;

/** Prettier's quote choice: the preferred (single) quote unless the text holds more of it. */
function quoteFor(text: string): string {
  const singles = text.split("'").length - 1;
  const doubles = text.split('"').length - 1;
  return singles > doubles ? '"' : "'";
}

/** A JS string literal for `text`, in the quote Prettier would choose. */
export function toStringLiteral(text: string): string {
  const quote = quoteFor(text);
  let body = '';
  for (const ch of text) {
    if (ch === quote) body += `\\${ch}`;
    else if (ESCAPES[ch] !== undefined) body += ESCAPES[ch];
    else if (RE_CONTROL.test(ch)) body += `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
    else body += ch;
  }
  return `${quote}${body}${quote}`;
}

const HEADER = `/**
 * GENERATED by \`scripts/build-theme-sources.ts\` -- do not edit by hand.
 *
 * Upstream's bundled theme files, verbatim, keyed by theme name: the
 * \`/themes/puml-theme-<name>.puml\` resources \`ThemeUtils#loadBundledOrLocalTheme\`
 * reads (\`ThemeUtils.java:131-139\`). Embedded because browser-safe \`src/\` has
 * no filesystem -- upstream's browser build ships the same texts in
 * \`themes.js\` (\`ThemeUtils.java:84-117\`). Look a theme up with
 * \`Object.hasOwn\`, never a bare index: a name such as \`constructor\` must miss.
 *
 * Only the themes MIT allows here (#180, \`scripts/theme-packages.json\`): the
 * MIT ones, \`_none_\`, and the Apache-2.0 \`mars\`, \`toy\` and \`vibrant\`, whose
 * licence text ships as \`dist/licenses/Apache-2.0-future-architect-puml-themes.txt\`
 * (from \`src/core/licenses/\`). The rest are in \`@knowvah/plantuml-themes-unlicensed\`
 * and \`@knowvah/plantuml-themes-gpl\`, which a host registers with \`withThemes\`.
 *
 * @see ~/git/knowvah/plantuml/src/main/resources/themes/
 * @see ~/git/knowvah/plantuml/src/main/java/net/sourceforge/plantuml/theme/ThemeUtils.java
 */
`;

/** An identifier-safe key stays bare, as Prettier's `quoteProps: as-needed` leaves it. */
const RE_BARE_KEY = /^[A-Za-z_$][\w$]*$/u;

/**
 * Prettier keeps a value on its key's line when the key prints narrower than
 * `tabWidth + MIN_OVERLAP_FOR_BREAK` (2 + 3; `isObjectPropertyWithShortKey` in
 * Prettier's assignment layout) and breaks after the colon otherwise.
 */
const SHORT_KEY_WIDTH = 5;

function objectProps(sources: ReadonlyMap<string, string>): string {
  return [...sources]
    .map(([name, text]) => {
      const key = RE_BARE_KEY.test(name) ? name : toStringLiteral(name);
      const gap = key.length < SHORT_KEY_WIDTH ? ' ' : '\n    ';
      return `  ${key}:${gap}${toStringLiteral(text)},`;
    })
    .join('\n');
}

/** The module text for `sources` -- pure, so the drift test can call it. */
export function renderThemeSourcesModule(sources: ReadonlyMap<string, string>): string {
  return `${HEADER}\nexport const THEME_SOURCES: Readonly<Record<string, string>> = {\n${objectProps(sources)}\n};\n`;
}

const PACKAGE_HEADER = `/**
 * GENERATED by \`scripts/build-theme-sources.ts\` -- do not edit by hand.
 *
 * Upstream's \`/themes/puml-theme-<name>.puml\` files, verbatim, keyed by theme
 * name, for the themes \`scripts/theme-packages.json\` places in this package
 * (#180). \`index.js\` wraps them as a \`ThemePackage\`.
 *
 * @see ~/git/knowvah/plantuml/src/main/resources/themes/
 */
`;

/** `packages/themes-<home>/generated/themes.js` for `sources` -- pure. */
export function renderPackageThemesModule(sources: ReadonlyMap<string, string>): string {
  return `${PACKAGE_HEADER}\nexport const THEMES = {\n${objectProps(sources)}\n};\n`;
}

/** `packages/themes-<home>/generated/themes.d.ts`. */
export const PACKAGE_THEMES_DTS = `// GENERATED by scripts/build-theme-sources.ts -- do not edit by hand.

/** Verbatim upstream theme files, keyed by theme name. */
export declare const THEMES: Readonly<Record<string, string>>;
`;

/** Every output file and the text it must hold -- pure, for \`--check\` and the drift test. */
export function renderAllOutputs(
  sources: ReadonlyMap<string, string>,
  table: ReadonlyMap<string, ThemeHome>,
): ReadonlyMap<string, string> {
  const classified = classifyThemes(sources, table);
  const outputs = new Map<string, string>([[THEME_SOURCES_PATH, renderThemeSourcesModule(classified.get('core')!)]]);
  for (const home of PACKAGE_HOMES) {
    const dir = packageGeneratedDir(home);
    outputs.set(join(dir, 'themes.js'), renderPackageThemesModule(classified.get(home)!));
    outputs.set(join(dir, 'themes.d.ts'), PACKAGE_THEMES_DTS);
  }
  return outputs;
}

function main(): void {
  const outputs = renderAllOutputs(readThemeSources(), readThemeTable());
  const stale = [...outputs].filter(([path, body]) => (existsSync(path) ? readFileSync(path, 'utf8') : '') !== body);
  if (process.argv.includes('--check')) {
    for (const [path] of stale)
      console.error(`${relative(REPO, path)} is out of date -- run \`npx jiti scripts/build-theme-sources.ts\`.`);
    if (stale.length > 0) process.exit(1);
    console.log('[themes] every generated theme file is up to date.');
    return;
  }
  for (const [path, body] of outputs) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  }
  console.log(`[themes] wrote ${String(outputs.size)} files (${String(stale.length)} changed)`);
}

// CLI only: importing this module (the drift test does) must have no side effect.
if (process.argv[1]?.endsWith('build-theme-sources.ts') === true) main();
