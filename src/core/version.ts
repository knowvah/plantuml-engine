/**
 * The version banner the error diagram prints above the source listing.
 *
 * Upstream reads `CompilationInfo` (a build-time-filtered resource) and, when
 * the build did not stamp a timestamp, prints `[Unknown compile time]` — which
 * is exactly what the reference jar emits (`PlantUML version $version$ /
 * $git.commit.id$ [Unknown compile time]`: an unfiltered dev build).
 *
 * This port keeps the same line shape but sources every field from a
 * module-level constant. `src/` must run in a browser and render
 * reproducibly, so there is no `Date.now()`, no `process.env`, and no ambient
 * build state to read here (CLAUDE.md, Architecture Notes). A release build
 * that wants a real commit id substitutes {@link COMMIT} at bundle time.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/Version.java
 */

/** plantuml-engine's own version — kept in step with `package.json#version`. */
export const VERSION = '0.2.0';

/** Build-stamped at release; the placeholder is what a dev build reports. */
export const COMMIT = 'unknown';

/**
 * Upstream prints a UTC timestamp when the build stamped one, and this literal
 * otherwise. This port never stamps one (no ambient build state in `src/`).
 * @see ~/git/plantuml/.../version/Version.java#compileTimeString
 */
export const COMPILE_TIME_STRING = 'Unknown compile time';

/** @see ~/git/plantuml/.../version/Version.java#versionString */
export function versionString(): string {
  return VERSION;
}

/** @see ~/git/plantuml/.../version/Version.java#fullDescription */
export function fullDescription(): string {
  return `plantuml-engine version ${versionString()} / ${COMMIT} [${COMPILE_TIME_STRING}]`;
}

/**
 * The `@knowvah/dot-engine` release this port lays out with. `testdot` prints
 * it where the jar prints the `dot -V` answer, `<b>GraphViz</b> ""<version>""`
 * (#182 ruling 2, 2026-11-13). The package exports no version string and its
 * `exports` map has no `./package.json`, so it is a constant here, pinned to
 * the installed package and to `package.json`'s tarball by
 * `tests/unit/core/version.test.ts` (vkt D4).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/dot/GraphvizUtils.java:122-126
 */
export const DOT_ENGINE_VERSION = '2.12.3';
