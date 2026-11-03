/**
 * State readers of the scoped element colours (dss T3c, D2, D2a).
 *
 * `buildTheme` writes what each element's own signature asks the `StyleBuilder`
 * into `theme.colors.elements[bucket].{background,border,font}`
 * (`core/style-element-scope.ts`); a bucket is present only where the value
 * parts from the default skin's (D3) or the flat path already held it (D3a).
 * A reader therefore takes the bucket when it is there and keeps its own
 * default otherwise. {@link stateBucketPaint} keeps a gradient for a shape whose
 * driver draws one; {@link stateBucketColor} is the solid read.
 *
 * Buckets, with the Java signature each one mirrors:
 *   circle.start  `EntityImageCircleStart.java:56-58`
 *   circle.end    `EntityImageCircleEnd.java:57-59`
 *   activity.diamond  `EntityImageBranch.java:62-63` (`activityDiagram`, not `stateDiagram`)
 *   note          `EntityImageNote.java:188-189`
 *   note.link     `EntityImageNoteLink.java:64` -> `ComponentType.java:98-99` (`sequenceDiagram`, not `stateDiagram`)
 *   activitybar   `EntityImageSynchroBar.java:62-63` (`activityDiagram`, fork and join)
 *   diamond       `EntityImagePseudoState.java:70-71` (`stateDiagram`, history)
 *   state         `ConcurrentStates.java:115-116` (the concurrent rule), `EntityImageState2.java:80-83`
 *   arrow         `SvekEdge.java:817-819`
 *   state.name | state.description | state.body
 *                 `EntityImageStateCommon.java:61-62` + `addSName`,
 *                 `InnerStateAutonom.java:107-117`, `Cluster.java:464-470`
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleSignatureBasic.java:194-220
 */
import { resolveColorToSvgHex } from '../../core/klimt/color/HColorSet.js';
import type { Paint } from '../../core/paint.js';
import { LINK_NOTE_BUCKET, STATE_CHOICE_BUCKET } from '../../core/style-element-scope.js';
import type { Theme } from '../../core/theme.js';

/** The one colour role a bucket read takes. */
export type StateBucketRole = 'background' | 'border' | 'font';

/** `EntityImageCircleStart.java:56-58`. */
export const STATE_CIRCLE_START_BUCKET = 'circle.start';
/** `EntityImageCircleEnd.java:57-59`. */
export const STATE_CIRCLE_END_BUCKET = 'circle.end';
/** `EntityImageBranch.java:62-63`: `<<choice>>` signs as an activity diamond. */
export const STATE_CHOICE_DIAMOND_BUCKET: string = STATE_CHOICE_BUCKET;
/** `EntityImageNote.java:188-189`. */
export const STATE_NOTE_BUCKET = 'note';
/** `EntityImageNoteLink.java:64` -> `ComponentType.java:98-99`: a link's note signs as a sequence note. */
export const STATE_LINK_NOTE_BUCKET: string = LINK_NOTE_BUCKET;
/** `EntityImageSynchroBar.java:62-63`: fork, join and syncBar sign as an activity bar. */
export const STATE_ACTIVITY_BAR_BUCKET = 'activitybar';
/** `EntityImagePseudoState.java:70-71`: `[H]` and `[H*]`. */
export const STATE_HISTORY_BUCKET = 'diamond';
/** `ConcurrentStates.java:115-116`, `EntityImageState2.java:80-83`, `EntityImageStateCommon.java:61-62`. */
export const STATE_BUCKET = 'state';
/** `SvekEdge.java:817-819`. */
export const STATE_ARROW_BUCKET = 'arrow';
/** `EntityImageStateCommon.getStyleStateName` (`EntityImageStateCommon.java:75-78`). */
export const STATE_NAME_BUCKET = 'state.name';
/** `EntityImageStateCommon.getStyleStateDescription` (`EntityImageStateCommon.java:80-82`). */
export const STATE_DESCRIPTION_BUCKET = 'state.description';
/** `EntityImageStateCommon.getStyleStateBody` (`EntityImageStateCommon.java:94-96`). */
export const STATE_BODY_BUCKET = 'state.body';

/**
 * What a bucket holds for `role`, a solid resolved to its SVG colour and a gradient whole
 * (`DriverRectangleSvg.java:97-111`, `DriverPathSvg.java:64-77`), or `undefined` when the bucket is absent.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleStorage.java:102-116
 */
export function stateBucketPaint(
  theme: Pick<Theme, 'colors'>,
  bucket: string,
  role: StateBucketRole,
): Paint | undefined {
  const value = theme.colors.elements?.[bucket]?.[role];
  return typeof value === 'string' ? resolveColorToSvgHex(value) : value;
}

/**
 * The resolved SVG colour a bucket holds for `role`, or `undefined` when the
 * bucket is absent (the reader keeps its default) or holds a gradient.
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/StyleStorage.java:102-116
 */
export function stateBucketColor(
  theme: Pick<Theme, 'colors'>,
  bucket: string,
  role: StateBucketRole,
): string | undefined {
  const value = theme.colors.elements?.[bucket]?.[role];
  return typeof value === 'string' ? resolveColorToSvgHex(value) : undefined;
}
