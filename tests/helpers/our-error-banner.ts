/**
 * Recognises OUR error page by its version banner: `PSystemError#header()`
 * (`fullDescription()`) drawn as one whole `<text>` in the banner's fixed
 * bold-italic `MY_GREEN` (`src/core/error/error-page-exact.ts#bannerSegment`).
 *
 * The text alone is not enough. `testdot` prints `fullDescription()` as its
 * first line too, black on white, as upstream's `createTestDot` prints
 * `Version.fullDescription()` (`PSystemVersion.java:236`; vkt, #182). The
 * fill tells the two apart.
 *
 * Built from `fullDescription()` and `MY_GREEN` themselves, never spelled out,
 * so a version bump cannot silently blind a classifier. Imports no vitest, so
 * `scripts/` can use it. Scans the WHOLE document: the banner's offset moves
 * with source length (`refusal-coverage-gate.ts#weErroredIn`).
 */
import { MY_GREEN } from '../../src/core/error/error-text.js';
import { fullDescription } from '../../src/core/version.js';

const TEXT_OPEN = '<text';
const BANNER_FILL = `fill="${MY_GREEN}"`;

/** True when `svg` holds a `<text>` in the banner fill whose content is exactly `fullDescription()`. */
export function hasOurErrorBanner(svg: string): boolean {
  const needle = `>${fullDescription()}</text>`;
  for (let at = svg.indexOf(needle); at !== -1; at = svg.indexOf(needle, at + needle.length)) {
    const open = svg.lastIndexOf(TEXT_OPEN, at);
    if (open !== -1 && svg.slice(open, at).includes(BANNER_FILL)) return true;
  }
  return false;
}
