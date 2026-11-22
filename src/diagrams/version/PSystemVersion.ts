/**
 * `PSystemVersion` — the `about`/`authors`, `version`, bare `stdlib`, `testdot`
 * and `keydistributor` pages: lines of creole drawn black on white, the first
 * three with the PlantUML logo in the bottom-right corner (`PlainStringsDiagram`).
 *
 * This port prints its own name and version string (`plantuml-engine version
 * <v>`, matching the error banner's `fullDescription()`) where the jar prints
 * `PlantUML version ` + `Version.versionString()` (`core/version.ts`; user ruling 2026-10-08, "keep
 * own version string", DIVERGENCES.md "Error pages print this port's
 * version").
 *
 * The `version` page (`createShowVersion`, java:172-202) prints this port's
 * own environment where the jar prints its host's (decisions.md D14,
 * DIVERGENCES.md "`version` page prints the port's own environment"): its
 * layout engine through `GraphvizUtils.addDotStatus`'s library arm, and none
 * of the JVM/OS/environment lines a browser library does not have.
 *
 * `testdot` (`createTestDot`, java:234-240) prints the executable arm's
 * version line with this port's engine and none of the checks it has no
 * counterpart for (#182 rulings 2-4, 2026-11-13; DIVERGENCES.md "Key tools
 * and `testdot` describe plantuml-engine"). `keydistributor`
 * (`createKeyDistributor`, java:242-258) prints the jar's `No license found`:
 * no distributor licence exists here.
 *
 * Not ported:
 * - The private image constructor (java:83-89): only `createKeyDistributor`
 *   calls it, with `im = null` in this build, which draws what the public
 *   constructor draws with `withImage = false`.
 * - The other image getters (`getTime01`, `getTime15`,
 *   `getPlantumlSmallIcon(2)`, `getArecibo`, `getDotc`, `getDotd`): resources
 *   of other pages, owned where they are drawn (`core/error/`). `getCharlieImage`
 *   and `getApple2Image` went with the eggs upstream (dadad87bba3).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java
 */
import { renderSvg } from '@knowvah/dot-engine';
import type { UmlSource } from '../../core/block-extractor.js';
// The canvas-free text measurer `renderSvg` measures `test` with, installed
// for its side effect as every other engine consumer does.
import '../../core/dot-engine-measurer.js';
import { withEngineMessagesDropped } from '../../core/dot-engine-messages.js';
import { PLANTUML_LOGO } from '../../core/error/plantuml-logo.js';
import type { RasterImage } from '../../core/error/raster-image.js';
import { GraphicPosition } from '../../core/klimt/geom/GraphicPosition.js';
import { PlainStringsDiagram } from '../../core/PlainStringsDiagram.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { COMMIT, COMPILE_TIME_STRING, DOT_ENGINE_VERSION, fullDescription, versionString } from '../../core/version.js';
import { License } from './License.js';
import { STDLIB_CATALOG } from './stdlib-catalog.js';

/** `DiagramDescription("(Version)")`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:294 */
const DESCRIPTION = '(Version)';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:208 */
const BLANK = ' ';

/** `s.replaceAll("\\</?\\w+\\>", "")`: Java's `\w` is `[a-zA-Z_0-9]`, as JS's.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:249 */
const TAG = /<\/?\w+>/g;

/**
 * The layout engine this port draws with, named as the module `renderSvg` is
 * imported from. It stands where upstream names its JavaScript layout library
 * (`"VizJs library is used!"`); `@knowvah/dot-engine` exports no version
 * string, so the page names the engine without one (decisions.md D14).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:94
 */
const LAYOUT_ENGINE = '@knowvah/dot-engine';

/** `create(null, "digraph foo { test; }", "svg")`, laid out by `dot`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:161-162 */
const TEST_DOT = 'digraph foo { test; }';
const TEST_ENGINE = 'dot';

/** `addDotStatus(strings, true)` (java:193): the rich-text prefixes.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:86-89 */
const RED = '<b><color:red>';
const BOLD = '<b>';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:171 */
const EMPTY_FILE = 'Error: dot generates empty file. Check you dot installation.';
/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:175 */
const UNREADABLE_SVG = 'Error: dot generates unreadable SVG file. Check you dot installation.';

/** The authors lines between the licence line and the closing link.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:227-239 */
const AUTHORS = [
  '<u>Original idea</u>: Arnaud Roques',
  '<u>Word Macro</u>: Alain Bertucat & Matthieu Sabatier',
  '<u>Word Add-in</u>: Adriaan van den Brand',
  '<u>J2V8 & viz.js integration</u>: Andreas Studer',
  '<u>Official Eclipse Plugin</u>: Hallvard Tr\u00e6tteberg',
  '<u>Original Eclipse Plugin</u>: Claude Durif & Anne Pecoil',
  '<u>Servlet & XWiki</u>: Maxime Sinclair',
  '<u>Docker</u>: David Ducatel',
  '<u>AWS lib</u>: Chris Passarello',
  '<u>Stdlib Icons</u>: tupadr3',
  '<u>Site design</u>: Raphael Cotisson',
  '<u>Logo</u>: Benjamin Croizet',
  '<u>Web Assembly</u>: Sakir Temel',
] as const;

/** This port's author, credited in the jar's `<u>role</u>` / `<b>label</b>`
 *  forms on one line appended after everything the jar prints, so every jar
 *  line keeps the jar's position (`about`/`authors`, `version`). Kept by user ruling (2026-10-14; DIVERGENCES.md "`about`,
 *  `authors` and `version` credit the TypeScript port"). The GitHub login
 *  follows the jar's own handle-as-name entry (`Stdlib Icons: tupadr3`). */
const PORT_AUTHOR_ROLE = 'TypeScript port';
const PORT_AUTHOR = 'Scott Seely (sseely)';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:241-243 */
const AUTHORS_END = [BLANK, 'https://plantuml.com', BLANK] as const;

/** `getImage("logo.png")`: the bundled logo (`core/error/plantuml-logo.ts`).
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:92-94 */
export function getPlantumlImage(): RasterImage {
  return PLANTUML_LOGO;
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:247-252 */
function add(result: string[], s: string, withTag: boolean): void {
  result.push(withTag ? s : s.replaceAll(TAG, ''));
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:219-245 */
export function getAuthorsStrings(withTag: boolean): string[] {
  const strings: string[] = [];
  // `PlantUML version` → `plantuml-engine version` (ufp journal row 24a): the
  // 2026-10-08 ruling's reason — never tell a user they ran PlantUML.
  add(strings, `<b>plantuml-engine version ${versionString()}</b> (${COMPILE_TIME_STRING})`, withTag);
  add(strings, `(${License.getCurrent().toString()} source distribution)`, withTag);
  add(strings, BLANK, withTag);
  for (const line of AUTHORS) add(strings, line, withTag);
  for (const line of AUTHORS_END) add(strings, line, withTag);
  add(strings, `<u>${PORT_AUTHOR_ROLE}</u>: ${PORT_AUTHOR}`, withTag);
  return strings;
}

/**
 * `Stdlib.addInfoVersion`: one block per stdlib folder. Upstream reads the
 * folders at runtime (`getAllFolderNames`, `Stdlib.retrieve`); the port reads
 * the generated {@link STDLIB_CATALOG} (decisions.md D5), so the `IOException`
 * arm (java:333-336) has no counterpart.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/preproc/Stdlib.java:320-337
 */
export function addInfoVersion(strings: string[], details: boolean): void {
  for (const { name, version, source } of STDLIB_CATALOG) {
    if (details) strings.push(`<b>${name}`, `Version ${version}`, `Delivered by ${source}`, BLANK);
    else strings.push(`* ${name} (Version ${version})`);
  }
}

/**
 * `getTestCreateSimpleFile`: lays the test graph out with the port's engine.
 * The `ProcessState` timeout arm (java:164-165) has no counterpart:
 * `renderSvg` runs in-process and synchronously, with no process to time out.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:160-178
 */
function getTestCreateSimpleFile(): string | undefined {
  const data = withEngineMessagesDropped(() => renderSvg(TEST_DOT, TEST_ENGINE));
  if (data.length === 0) return EMPTY_FILE;
  if (!data.includes('<svg')) return UNREADABLE_SVG;
  return undefined;
}

/**
 * `addDotStatus(strings, true)`, its `useVizJs` arm (java:93-108): the port
 * lays out with a linked JavaScript library, never a `dot` executable, so the
 * executable arms (java:110-155 — `GRAPHVIZ_DOT`, `Dot executable is`,
 * `ExeState`, `<b>GraphViz</b> ""<dot -V>""` and the version checks) have no
 * counterpart on this page; `testdot` prints the version line alone
 * ({@link addDotVersionStatus}). `Logme.error(e)` (java:104) is not mirrored:
 * `src/` logs nothing, and the page prints the error. The error code it
 * returns is read only by the CLI's `-testdot`
 * (`OptionPrint.printCheckGraphviz`), which this library has no CLI for.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:83-108
 */
function addDotStatus(strings: string[]): void {
  // java:94 `VizJs library is used!` → the engine this port links (D14).
  strings.push(`${LAYOUT_ENGINE} library is used!`);
  try {
    const err = getTestCreateSimpleFile();
    strings.push(err === undefined ? `${BOLD}Installation seems OK. File generation OK` : RED + err);
  } catch (e) {
    // `e.toString()`: JS `Error#toString` is `name: message`, as Java's
    // `getClass().getName() + ": " + message` minus the package.
    strings.push(RED + String(e));
  }
}

/**
 * `addDotStatus(strings, true)` for `testdot`, its executable arm's version
 * line (java:122-127): `<b>GraphViz</b>` → `@knowvah/dot-engine` and the
 * `dot -V` answer → {@link DOT_ENGINE_VERSION} (#182 ruling 2). The rest of
 * the arm is not printed:
 * - java:111-119 (`GRAPHVIZ_DOT`, `Dot executable is`): INSECURE profile only,
 *   and the port has no executable or environment variable;
 * - java:128-136 (`cannot determine dot version`, `seems old`): ruling 3;
 * - java:137-145 (`Installation seems OK. File generation OK`): ruling 4;
 * - java:146-154 (the exception and `ExeState` errors): the engine is a
 *   linked library, so there is no file to check and nothing to fail.
 * The `useVizJs` arm (java:93-108) is the `version` page's ({@link addDotStatus}, vkt D7).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:110-155
 */
function addDotVersionStatus(strings: string[]): void {
  strings.push(`<b>${LAYOUT_ENGINE}</b> ""${DOT_ENGINE_VERSION}""`);
}

/** `strings.add("No license found")` (java:247): `retrieveDistributor()` is
 *  null in this build. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:247 */
const NO_LICENSE_FOUND = 'No license found';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:67 */
export class PSystemVersion extends PlainStringsDiagram {
  /**
   * The `!TeaVM.isTeaVM()` arm (java:72): this port mirrors the JVM jar. The
   * `try`/`catch` around `getPlantumlImage()` (java:73-80) guards a classpath
   * read; the bundled logo cannot fail.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:69-81
   */
  constructor(source: UmlSource, withImage: boolean, args: readonly string[], preprocessing: PreprocessingArtifact) {
    super(source, preprocessing);
    this.strings.push(...args);
    if (withImage) {
      this.image = getPlantumlImage();
      this.imagePosition = GraphicPosition.BACKGROUND_CORNER_BOTTOM_RIGHT;
    }
  }

  /**
   * The `version` page with this port's own values (decisions.md D14).
   * `ReportLog` is a list of strings (`crash/ReportLog.java:50-71`).
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:172-202
   */
  static createShowVersion(source: UmlSource, preprocessing: PreprocessingArtifact): PSystemVersion {
    const strings: string[] = [];
    // java:174 `<b>PlantUML</b>` → this port's name (journal row 24a, D14).
    strings.push(`<b>plantuml-engine</b> ""${versionString()}""`);
    // java:175-176 `CompilationInfo.COMMIT`, `Version.compileTimeString()`:
    // this port's own build constants (`core/version.ts`).
    strings.push(`<b>Git Commit</b> ""${COMMIT}""`);
    strings.push(`<b>Build Time</b> ""${COMPILE_TIME_STRING}""`);
    // java:178 `!TeaVM.isTeaVM()`: the port mirrors the JVM jar.
    strings.push(`<b>License</b> ""${License.getCurrent().toString()}""`);
    // java:180 `checkOldVersionWarning` adds nothing: the port never stamps a
    // compile time, and unstamped `Version.compileTime()` is now
    // (Version.java:79-82), so the age is 0 days < 140 (ReportLog.java:87-95).
    // java:181-189 omitted: `Loaded from <jar>` and the Word-mode lines print
    // only under the INSECURE profile; the port has no jar path and no Word
    // mode to report, and the jar's default LEGACY prints neither.
    strings.push(BLANK);
    addDotStatus(strings);
    strings.push(BLANK);
    // java:194-195 `OptionPrint.interestingProperties()` omitted: Java
    // Runtime, JVM, Default Encoding, Language and Country are JVM system
    // properties (OptionPrint.java:61-81); a browser library has no JVM, and
    // reading the host's locale would make the page host-dependent.
    // java:197-198 `OptionPrint.interestingValues()` omitted: its ` ` and
    // `PLANTUML_LIMIT_SIZE: <n>` (OptionPrint.java:83-88) report an environment
    // variable and an image-size limit this port neither reads nor applies.
    // Upstream's own browser build drops both blocks (`TeaVM.isTeaVM()`,
    // OptionPrint.java:62-63, :85).
    strings.push(`<b>${PORT_AUTHOR_ROLE}</b> ""${PORT_AUTHOR}""`);
    return new PSystemVersion(source, true, strings, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:205-211 */
  static createStdLib(source: UmlSource, preprocessing: PreprocessingArtifact): PSystemVersion {
    const strings: string[] = [];
    addInfoVersion(strings, true);
    strings.push(BLANK);
    return new PSystemVersion(source, true, strings, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:214-217 */
  static createShowAuthors(source: UmlSource, preprocessing: PreprocessingArtifact): PSystemVersion {
    return new PSystemVersion(source, true, getAuthorsStrings(true), preprocessing);
  }

  /**
   * `fullDescription()` and the dot status, with no logo (`withImage =
   * false`). `ReportLog` is a list of strings (`crash/ReportLog.java:50-71`).
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:234-240
   */
  static createTestDot(source: UmlSource, preprocessing: PreprocessingArtifact): PSystemVersion {
    const strings: string[] = [fullDescription()];
    addDotVersionStatus(strings);
    return new PSystemVersion(source, false, strings, preprocessing);
  }

  /**
   * `retrieveDistributor()` answers null in this build
   * (`LicenseInfo.ts#retrieveDistributor`, java:197-199), so the page is
   * `No license found` and `im` stays null. The licence branch (java:249-256:
   * owner, context, dates, key start and the distributor image) cannot run in
   * this build and is not ported (vkt D3). With `im = null` the private image
   * constructor (java:83-89) draws what `withImage = false` draws.
   * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:242-258
   */
  static createKeyDistributor(source: UmlSource, preprocessing: PreprocessingArtifact): PSystemVersion {
    return new PSystemVersion(source, false, [NO_LICENSE_FOUND], preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:293-295 */
  getDescription(): string {
    return DESCRIPTION;
  }

  /** `Collections.unmodifiableList(strings)`.
   *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemVersion.java:297-299 */
  getLines(): readonly string[] {
    return [...this.strings];
  }
}
