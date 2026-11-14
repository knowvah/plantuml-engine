/**
 * A grouping frame's header component, the seam `PartitionTile` overrides
 * (`getComponent`, `teoz/PartitionTile.java:93-148`) over `GroupingTile`'s
 * `ComponentRoseGroupingHeader` (`teoz/GroupingTile.java:251-255`).
 *
 * `GroupingTile` reads four things off its component: the preferred width
 * (`:216`) and height (`:157,257-259,349-365`), and -- at draw time -- the
 * title. One factory, {@link createHeaderComponent}, picks the component for
 * the opener (`TileBuilder.java:154-163`), so the layout asks the component
 * and never asks "is this a partition".
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/sequencediagram/teoz/PartitionTile.java
 */
import type { FrameEvent, TextRun } from './ast.js';
import { HorizontalAlignment } from '../../core/klimt/geom/HorizontalAlignment.js';
import { alignedBlockRuns } from './sequence-block-align.js';
import {
  buildTabRuns,
  computeHeaderTab,
  groupingPaints,
  headerHeight,
  headerWidth,
  type FramePaints,
  type HeaderTab,
  type TextEnv,
} from './sequence-frame-metrics.js';

/**
 * `PartitionTile.TITLE_VPAD` (`PartitionTile.java:69`): breathing room above
 * and below the title text, reserved in the preferred height and applied
 * when the title is drawn (`:150`, `:121-122`).
 */
export const PARTITION_TITLE_VPAD = 4;

/** What `GroupingTile` asks of its header component. */
export interface HeaderComponent {
  /** The fields `FrameGeo` carries for the header. */
  readonly tab: HeaderTab;
  /** `getPreferredDimension(...).getWidth()`. */
  preferredWidth(): number;
  /** `getPreferredDimension(...).getHeight()`. */
  preferredHeight(): number;
  /** The title runs for a frame whose top-left is `(x, y)`. */
  runs(x: number, y: number): readonly TextRun[];
}

/** `ComponentRoseGroupingHeader`, via `GroupingTile#getComponent` (`:251-255`). */
function groupHeaderComponent(event: FrameEvent, paints: FramePaints, env: TextEnv): HeaderComponent {
  const tab = computeHeaderTab(event, paints.headerPaint, env);
  return {
    tab,
    preferredWidth: () => headerWidth(tab, paints.paint, env),
    preferredHeight: () => headerHeight(tab, paints.paint, env),
    runs: (x, y) => buildTabRuns(tab, paints, x, y, env),
  };
}

/**
 * `PartitionTile#getComponent` (`PartitionTile.java:93-148`): the title alone,
 * `Display.create(getComment())` (`:85`, one line -- no `\n` split) at the
 * header style's font, LEFT (`:84-86`); no tab, no padding. Its preferred
 * dimension is the title's width by its height plus `2 * TITLE_VPAD`
 * (`:119-125`), and `drawU` puts the title `TITLE_VPAD` below the frame top
 * (`:150`). The x is the border span's, so the layout builds the runs at
 * x 0 and `layout.ts#backfillPartitionSpan` centres them.
 */
function partitionHeaderComponent(event: FrameEvent, paints: FramePaints, env: TextEnv): HeaderComponent {
  // `titleBlock()`'s `Display.create(getComment())` throws a NullPointerException on a partition with no
  // comment (`PartitionTile.java:85`, reached from `getPreferredDimension`, `:120`): the jar's crash page.
  if (event.commentIsNull === true) throw new Error('PartitionTile.titleBlock: partition has no comment');
  const comment = event.branchLabels[0] ?? '';
  const place = (x: number, y: number) =>
    alignedBlockRuns([comment], paints.headerPaint.font, { leftX: x, top: y }, HorizontalAlignment.LEFT, env);
  const title = place(0, 0);
  return {
    tab: {
      tabText: comment,
      tabTextWidth: title.width,
      tabWidth: title.width,
      tabHeight: title.height + 2 * PARTITION_TITLE_VPAD,
    },
    preferredWidth: () => title.width,
    preferredHeight: () => title.height + 2 * PARTITION_TITLE_VPAD,
    runs: (x, y) => place(x, y + PARTITION_TITLE_VPAD).runs,
  };
}

/** `TileBuilder#buildOne`'s choice (`TileBuilder.java:154-163`). */
export function createHeaderComponent(event: FrameEvent, paints: FramePaints, env: TextEnv): HeaderComponent {
  return event.frameType === 'partition'
    ? partitionHeaderComponent(event, paints, env)
    : groupHeaderComponent(event, paints, env);
}

/**
 * A group's header component width, `getPreferredDimensionIfEmpty().getWidth()`
 * (`GroupingTile.java:257-259`), for a reader outside the walk: the participant
 * row's frame clearance (`ensureClearsTitleOf`, `:663-665`).
 */
export function groupHeaderWidth(event: FrameEvent, env: TextEnv): number {
  return createHeaderComponent(event, groupingPaints(event), env).preferredWidth();
}
