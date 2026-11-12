/**
 * `GeneralImageBuilder#createEntityImageBlockInternal`, for the leaf types of the legacy activity engine only:
 * `NOTE`, `ACTIVITY`, `CIRCLE_START`, `CIRCLE_END`, `BRANCH`/`STATE_CHOICE` and `SYNCHRO_BAR`/`STATE_FORK_JOIN`, in
 * upstream's order, then the four Chen EER leaves (`CHEN_ENTITY`, `CHEN_RELATIONSHIP`, `CHEN_ATTRIBUTE`,
 * `CHEN_CIRCLE`, java:222-232, cheneer T2a). Every other branch of the Java chain (`isLikeClass`, `PORTIN`/`PORTOUT`, `STATE`,
 * lollipops, `CIRCLE`, `DESCRIPTION`, `USECASE`, `OBJECT`, `MAP`, `JSON`, `ARC_CIRCLE`,
 * `POINT_FOR_ASSOCIATION`, groups) belongs to an engine that does not use this builder yet; `NOTE` is
 * `EntityImageNote`, sized here (laep T2b) and drawn through `Opale` by the renderer task T2c. Each of those throws, naming the owner,
 * rather than answer a guess.
 *
 * Entry point name kept; the other seam-wide parameters (`isHideEmptyDescriptionForState`, `portionShower`,
 * `graphvizVersion`, `links`) are read only by the branches not ported, so they are not carried.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GeneralImageBuilder.java:104-189
 */
import type { Entity } from '../abel/Entity.js';
import { LeafType } from '../abel/LeafType.js';
import { EntityImageActivity, type NodePolygons } from './image/EntityImageActivity.js';
import { EntityImageBranch } from './image/EntityImageBranch.js';
import { EntityImageCircleEnd } from './image/EntityImageCircleEnd.js';
import { EntityImageCircleStart } from './image/EntityImageCircleStart.js';
import { EntityImageChenAttribute } from './image/EntityImageChenAttribute.js';
import { EntityImageChenCircle } from './image/EntityImageChenCircle.js';
import { EntityImageChenEntity } from './image/EntityImageChenEntity.js';
import { EntityImageChenRelationship } from './image/EntityImageChenRelationship.js';
import { EntityImageEmptyPackage, type EmptyPackageSkinParam } from './image/EntityImageEmptyPackage.js';
import type { PortionShower } from '../cucadiagram/PortionShower.js';
import type { EntityImageState } from './image/EntityImageState.js';
import { EntityImageNote } from './image/EntityImageNote.js';
import type { InnerActivity } from './InnerActivity.js';
import { EntityImageSynchroBar } from './image/EntityImageSynchroBar.js';

/** The images this builder answers. */
export type LegacyLeafImage =
  | EntityImageActivity
  | EntityImageCircleStart
  | EntityImageCircleEnd
  | EntityImageBranch
  | EntityImageSynchroBar
  | EntityImageNote
  | EntityImageEmptyPackage
  | EntityImageChenEntity
  | EntityImageChenRelationship
  | EntityImageChenAttribute
  | EntityImageChenCircle
  /** An empty inner activity's image, stored by `Entity#overrideImage` (`GroupMakerActivity.java:113-114`). */
  | EntityImageState
  /** An autarkic group's image, stored by `Entity#overrideImage` (`GroupMakerActivity`), never built here. */
  | InnerActivity;

/** @see GeneralImageBuilder.java:104-189 */
export function createEntityImageBlockInternal(
  leaf: Entity,
  skinParam: EmptyPackageSkinParam,
  bibliotekon: NodePolygons,
  portionShower: PortionShower,
): LegacyLeafImage {
  if (leaf.isRemoved()) throw new Error('IllegalStateException');

  const leafType = leaf.getLeafType();
  if (leafType === LeafType.NOTE) return new EntityImageNote(leaf, skinParam);

  if (leafType === LeafType.ACTIVITY) return new EntityImageActivity(leaf, skinParam, bibliotekon);

  if (leafType === LeafType.CIRCLE_START) return new EntityImageCircleStart(leaf, skinParam);

  if (leafType === LeafType.CIRCLE_END) return new EntityImageCircleEnd(leaf, skinParam);

  if (leafType === LeafType.BRANCH || leafType === LeafType.STATE_CHOICE) return new EntityImageBranch(leaf, skinParam);

  if (leafType === LeafType.SYNCHRO_BAR || leafType === LeafType.STATE_FORK_JOIN)
    return new EntityImageSynchroBar(leaf, skinParam);

  if (leafType === LeafType.EMPTY_PACKAGE) {
    // `leaf.getUSymbol() != null` builds an `EntityImageDescription` (GeneralImageBuilder.java:201-203): not ported.
    if (leaf.getUSymbol() !== undefined) throw new Error('unported: EntityImageDescription for an empty package');
    return new EntityImageEmptyPackage(leaf, skinParam, portionShower);
  }

  // The Chen EER leaves, after `TIPS` and before the `DOMAIN` chain (GeneralImageBuilder.java:222-232).
  if (leafType === LeafType.CHEN_ENTITY) return new EntityImageChenEntity(leaf, skinParam);

  if (leafType === LeafType.CHEN_RELATIONSHIP) return new EntityImageChenRelationship(leaf, skinParam);

  if (leafType === LeafType.CHEN_ATTRIBUTE) return new EntityImageChenAttribute(leaf, skinParam);

  if (leafType === LeafType.CHEN_CIRCLE) return new EntityImageChenCircle(leaf, skinParam);

  throw new Error(`unported: GeneralImageBuilder has no image for leaf type ${String(leafType)} yet`);
}
