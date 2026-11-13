/**
 * `GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames()`:
 * the JVM host's font families. Both upstream callers read it: `help font`
 * (`CommandHelpFont.java:73`) and `listfonts` (`PSystemListFonts.java:52`).
 *
 * A browser-safe library has no API that enumerates the host's fonts, so this
 * seam answers none and both pages draw their header lines only. Maintainer
 * ruling #169 (2026-11-11, `DIVERGENCES.md`) names this a library-forced
 * divergence and rejects bundling the oracle machine's font list; it covers
 * `listfonts` (#135) as well.
 *
 * Hoisted out of `src/diagrams/help/CommandHelpFont.ts` (ftp D4) so that
 * `diagrams/font` reads it without importing `diagrams/help`
 * (`tests/architecture/layering.test.ts`, rule 2).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/help/CommandHelpFont.java:73
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/font/PSystemListFonts.java:52
 */
export function availableFontFamilyNames(): readonly string[] {
  return [];
}
