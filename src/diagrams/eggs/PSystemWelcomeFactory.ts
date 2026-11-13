/**
 * `PSystemWelcomeFactory` — the FIRST factory `PSystemBuilder` tries
 * (`PSystemBuilder.java:133`). Typed `SEQUENCE` ("This is a hack for
 * @startuml", java:58-61), it answers a source of exactly two lines -- the
 * `@startuml` line and its `@enduml` -- with the Welcome page, logo
 * bottom-right, and every other source with `null`, which
 * `PSystemErrorUtils#merge` skips (`PSystemErrorUtils.java:120-121`).
 *
 * The factory implements `PSystemFactory` directly, so it has no empty test of
 * its own (`factoryBase: 'PSystemFactory'`): on an empty two-line block it
 * runs before any command factory can answer *Empty description*
 * (`dispatcher.ts#isEmptyDescription`).
 *
 * `PSystemWelcome` itself stays in `src/core/error/`, because the error page
 * stacks it too (`error-renderer.ts`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemWelcomeFactory.java
 */
import type { DiagramType, UmlSource } from '../../core/block-extractor.js';
import type { AssembledSvg, SyncPlugin } from '../../core/dispatcher.js';
import { renderPSystemWelcome } from '../../core/error/error-renderer.js';
import { PSystemWelcome } from '../../core/error/PSystemWelcome.js';
import type { StringMeasurer } from '../../core/measurer.js';
import { NULL_SYSTEM } from '../../core/parse-refusal.js';
import type { ParseRefusal } from '../../core/parse-refusal.js';

/** `getDiagramType()`: "This is a hack for @startuml".
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemWelcomeFactory.java:58-61 */
const SEQUENCE_HACK = 'sequence' satisfies DiagramType;

/** `source.getTotalLineCount() == 2`.
 *  @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemWelcomeFactory.java:52 */
const WELCOME_SOURCE_LINES = 2;

/**
 * `UmlSource#getTotalLineCount` is `source.size()` (`UmlSource.java:239-241`):
 * `BlockUml#data`, `@start` and `@end` included, comment and preprocessor
 * lines already gone -- the port's `seedSourceLines`. A hand-built source has
 * its interior only.
 */
function getTotalLineCount(source: UmlSource): number {
  return (source.seedSourceLines ?? ['@startuml', ...source.lines, '@enduml']).length;
}

/**
 * `createSystem`: the Welcome page for a two-line source, else `null`.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/eggs/PSystemWelcomeFactory.java:49-56
 */
export function createSystem(source: UmlSource): PSystemWelcome | ParseRefusal {
  if (getTotalLineCount(source) === WELCOME_SOURCE_LINES) return new PSystemWelcome('BACKGROUND_CORNER_BOTTOM_RIGHT');

  return NULL_SYSTEM;
}

/** The Welcome page and the layout measurer it is drawn with. */
interface WelcomeGeometry {
  readonly diagram: PSystemWelcome;
  readonly measurer: StringMeasurer;
}

/** The Welcome plugin, registered first (`PSystemBuilder.java:133`). */
export const welcomePlugin: SyncPlugin<PSystemWelcome, WelcomeGeometry> = {
  type: SEQUENCE_HACK,
  factoryBase: 'PSystemFactory',
  parse: (source) => createSystem(source),
  layoutSync: (diagram, _theme, measurer) => ({ diagram, measurer }),
  /** `PSystemWelcome#getTextBlock` (`PSystemWelcome.java:80-86`), exported as a `UgDiagram`. */
  render: (geo): AssembledSvg => ({ completeSvg: renderPSystemWelcome(geo.diagram, geo.measurer) }),
};
