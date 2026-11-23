/**
 * `PSystemKeygen` — the `keygen` and `keyimport [key]` page: a black-on-white
 * `GraphicStrings` block under the header the key tools share.
 *
 * Upstream asks for a QR code to mail for a PlantUML Professional Edition
 * licence. plantuml-engine has no such edition, so lines 4-5 say so instead
 * (#182 ruling 1, "inspired by, not conformant", 2026-11-13; vkt D5;
 * DIVERGENCES.md "Key tools and `testdot` describe plantuml-engine").
 *
 * Upstream's private no-argument `getTextBlock()` (java:82-111) would collide
 * with `UgDiagram#getTextBlock(num, stringBounder)` (TS has no overloading by
 * arity); it is the module function {@link getTextBlock}, taking the key it
 * reads, as `PSystemLicense.ts` does.
 *
 * Not ported, because no path in this build reaches it (vkt D3):
 * - the valid-key branch of `getTextBlock` (java:87-110: provided and
 *   installed licence, `persistMe`, `fileCandidates`): `retrieveNamed(key)`
 *   needs `PLSSignature` decoding and is NONE for every key here;
 * - the QR image of `getFlashTextBlock` (java:119-129): the MIT edition's
 *   `FlashCodeUtilsNone.exportFlashcode` answers null (`FlashCodeFactory.ts`),
 *   and its payload needs `PLSSignature.signature()` (host name, MAC addresses);
 * - the installed-licence footer (java:131-138): `retrieveNamedSlow()` is NONE.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java
 */
import type { UmlSource } from '../../core/block-extractor.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { XDimension2D } from '../../core/klimt/geom/XDimension2D.js';
import { GraphicStrings } from '../../core/klimt/shape/GraphicStrings.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { UGraphic } from '../../core/klimt/UGraphic.js';
import type { PreprocessingArtifact } from '../../core/tim/PreprocessingArtifact.js';
import { UgSimpleDiagram } from '../../core/UgSimpleDiagram.js';
import { COMPILE_TIME_STRING, versionString } from '../../core/version.js';
import { License } from './License.js';
import type { LicenseInfo } from './LicenseInfo.js';
import { retrieveNamedSlow } from './LicenseInfo.js';

/** `DiagramDescription("(Key)")`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:175 */
const DESCRIPTION = '(Key)';

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:185 */
const BLANK = ' ';

/**
 * `<b>PlantUML version ` + `Version.versionString()` + `</b> (` +
 * `Version.compileTimeString()` + `)`, the licence line and a blank, with this
 * port's name as `getAuthorsStrings` writes it (user ruling 2026-10-08).
 * Upstream duplicates `header()` in `PSystemKeycheck`; so does the port.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:178-187
 */
function header(): string[] {
  return [
    `<b>plantuml-engine version ${versionString()}</b> (${COMPILE_TIME_STRING})`,
    `(${License.getCurrent().toString()} source distribution)`,
    BLANK,
  ];
}

/**
 * The header and two lines, java:115-116's request for a QR code mailed to
 * PlantUML, said as what is true here (vkt D5): the port has no edition to
 * license and is `License.getCurrent()` software. With no flash (java:119-129)
 * and no footer (java:131-138), the anonymous `TextBlock` (java:142-171) draws
 * and sizes the header block alone, so that block is returned.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:113-172
 */
function getFlashTextBlock(_info: LicenseInfo): TextBlock {
  const strings = header();
  strings.push('plantuml-engine has no <i>Professional Edition License</i>:');
  strings.push(`it is <b>${License.getCurrent().toString()}</b> software and needs no license key.`);
  return GraphicStrings.createBlackOnWhite(strings);
}

/**
 * `retrieveNamedSlow()` (java:83) resets the licence cache to NONE, as
 * upstream's does. `key.length() == 0 || retrieveNamed(key).isNone()` (java:84)
 * is true for every key here (vkt D3), so the key is not read.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:82-111
 */
export function getTextBlock(_key: string): TextBlock {
  const installed = retrieveNamedSlow();
  return getFlashTextBlock(installed);
}

/** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:63 */
export class PSystemKeygen extends UgSimpleDiagram {
  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:65-70 */
  constructor(
    source: UmlSource,
    private readonly key: string,
    preprocessing: PreprocessingArtifact,
  ) {
    super(source, preprocessing);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:72-75 */
  calculateDimension(stringBounder: StringBounder): XDimension2D {
    return getTextBlock(this.key).calculateDimension(stringBounder);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:77-80 */
  drawU(ug: UGraphic): void {
    getTextBlock(this.key).drawU(ug);
  }

  /** @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/version/PSystemKeygen.java:174-176 */
  getDescription(): string {
    return DESCRIPTION;
  }
}
