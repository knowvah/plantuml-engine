/**
 * What the routing and refusal gates share: how the corpus is split into part
 * files, and the classifier for the jar's own error pages.
 *
 * Vitest shards by file and neither gate's measurement can be cut across files
 * unless the files exist, so a fixture's part is a pure function of its key. A
 * slice stays stable as the corpus grows, and a new fixture moves no other.
 */
import { createHash } from 'node:crypto';
import { readdirSync } from 'node:fs';

/** On PR #153's numbers the whole-corpus refusal test took 424 s, so four parts
 *  should take about 106 s each. */
export const CORPUS_GATE_PARTS = 4;

/** For the walk that replaced the render in each gate's completeness check.
 *  Ten thousand directories of `existsSync`, on a contended 4-vCPU runner. */
export const CORPUS_WALK_BUDGET_MS = 60_000;

/** The 1-based part a fixture key belongs to. */
export function corpusGatePartOf(key: string): number {
  return (createHash('sha1').update(key).digest().readUInt32BE(0) % CORPUS_GATE_PARTS) + 1;
}

export function expectedPartTestFiles(gate: string): string[] {
  return Array.from({ length: CORPUS_GATE_PARTS }, (_, i) => `${gate}.part-${i + 1}.test.ts`);
}

export function partTestFilesOnDisk(dir: string, gate: string): string[] {
  return readdirSync(dir)
    .filter((name) => name.startsWith(`${gate}.part-`))
    .sort();
}

/**
 * Upstream's two graphical error pages, keyed on the text PlantUML itself
 * writes into them. NOT on the slug, and NOT on the absence of
 * `data-diagram-type` -- that absence is a legitimate `NONE` for `@startdot`
 * passthrough and for several of our own engines, and must keep comparing as
 * a real value everywhere else (D4).
 *
 *   1. `PSystemError.header()` (`PSystemError.java:148-155`) opens EVERY
 *      graphical error page with `Version.fullDescription()`
 *      (`Version.java:51-54`) -- `"PlantUML version " + version + " / " +
 *      commit + " [" + compileTime + "]"`. `getGraphicalFormatted()`
 *      (`PSystemError.java:126-146`) lays that header out first, on a black
 *      ground in `HColors.MY_GREEN`.
 *   2. The crash page prepends `ReportLog.anErrorHasOccurred`
 *      (`ReportLog.java:103-108`), whose first line is
 *      `"An error has occurred : " + exception`.
 *
 * Each upstream line becomes one whole `<text>` element, so both markers are
 * anchored at BOTH ends -- `>` opens the element and `</text>` closes it.
 * That is what stops either firing on a real diagram: a label merely
 * MENTIONING the phrase leaves other characters inside the element, and a
 * label whose entire content is `PlantUML version X / Y [Z]` is upstream's
 * own banner by construction. Measured over all 3158 committed goldens: 8
 * fire, 3150 do not, and each of the 8 is a black-ground error image.
 */
const JAR_ERROR_PAGE_RE = />(?:PlantUML version [^<]*\[[^<]*\]|An error has occurred[^<]*)<\/text>/;

export function isJarErrorPage(head: string): boolean {
  return JAR_ERROR_PAGE_RE.test(head);
}
