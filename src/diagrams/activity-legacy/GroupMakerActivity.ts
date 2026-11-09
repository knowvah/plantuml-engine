/**
 * `GroupMakerActivity`: the image of an autarkic activity group. It builds the group's own svek pass (its
 * leaves, the links wholly inside it, its sub-partitions), solves it, and wraps the result in an
 * {@link InnerActivity}, the rounded frame the parent pass draws as one `ACTIVITY` leaf.
 *
 * The nested pass is `GraphvizImageBuilder#buildImage` with an empty `dotStrings[]`, so its DOT has no `nodesep` or
 * `ranksep` (`omitSeparators`), and its `layoutGraph` call happens inside `simplify`, before the parent's.
 *
 * Port-only: the string measurer is a constructor argument (the nested ink walk needs it); `DotMode` is not
 * passed (one value); the border and back colours are `Rose#getHtmlColor` over this port's skin param
 * ({@link getHtmlColor}). An empty group (`EntityImageState`) throws `unported:`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GroupMakerActivity.java:62-155
 */
import { ColorType } from '../../core/abel/ColorType.js';
import type { Entity } from '../../core/abel/Entity.js';
import { GroupType } from '../../core/abel/GroupType.js';
import type { Link } from '../../core/abel/Link.js';
import type { GroupHierarchy } from '../../core/cucadiagram/GroupHierarchy.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import { HColorSet } from '../../core/klimt/color/HColorSet.js';
import type { StringMeasurer } from '../../core/measurer.js';
import type { Stereotype } from '../../core/stereo/Stereotype.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import { EntityImageState } from '../../core/svek/image/EntityImageState.js';
import { InnerActivity } from '../../core/svek/InnerActivity.js';
import { asPaintColor, type PaintColor } from '../../core/svek/image/leaf-image-support.js';
import { driverBounderFor, runInkWalk } from '../../core/klimt/drawing/ink-walk.js';
import type { ActivityDiagram } from './ActivityDiagram.js';
import type { ActivityLegacyDotScope } from './activity-legacy-dot.js';
import { solveActivityLegacy } from './layout-geometry.js';
import { ActivityLegacySvekResult } from './renderer-svek-result.js';

/** `ColorParam.activityBorder`: its name and default, `HColors.MY_RED`. @see ColorParam.java:45, HColors.java:96 */
const ACTIVITY_BORDER = { name: 'activityBorder', defaultValue: '#A80036' } as const;
/** `ColorParam.background`: its name and default, `HColors.WHITE`. @see ColorParam.java:43, HColors.java:87 */
const BACKGROUND = { name: 'background', defaultValue: '#FFFFFF' } as const;
/** `SkinParam#getParamName`'s suffix. @see SkinParam.java:431 */
const COLOR_SUFFIX = 'color';

/**
 * `Rose#getHtmlColor(skinParam, stereotype, colorParam)` over `SkinParam#getHtmlColor`: the stereotype's own
 * `<param>color<<label>>`, then `<param>color`, else the parameter's default.
 * @see Rose.java:72-80, SkinParam.java:371-396
 */
function getHtmlColor(
  diagram: ActivityDiagram,
  stereo: Stereotype | undefined,
  param: { readonly name: string; readonly defaultValue: string },
): PaintColor {
  const skinParam = diagram.getSkinParam();
  const set = HColorSet.instance();
  if (stereo !== undefined)
    for (const s of stereo.getMultipleLabels()) {
      const value = skinParam.getValue(`${param.name}${COLOR_SUFFIX}<<${s}>>`);
      if (value !== null) return asPaintColor(set.getColorOrWhite(value));
    }
  const value = skinParam.getValue(`${param.name}${COLOR_SUFFIX}`);
  if (value !== null) {
    if (param === BACKGROUND && (value.toLowerCase() === 'transparent' || value.toLowerCase() === 'none'))
      return asPaintColor(set.getColorOrWhite('transparent'));

    return asPaintColor(set.getColorOrWhite(value));
  }
  return asPaintColor(set.getColorOrWhite(param.defaultValue));
}

/** @see GroupMakerActivity.java:62 */
export class GroupMakerActivity {
  private readonly diagram: ActivityDiagram;
  private readonly group: Entity;
  private readonly stringBounder: StringBounder;
  private readonly measurer: StringMeasurer;

  /** @see GroupMakerActivity.java:88-93 */
  constructor(diagram: ActivityDiagram, group: Entity, stringBounder: StringBounder, measurer: StringMeasurer) {
    this.diagram = diagram;
    this.group = group;
    this.stringBounder = stringBounder;
    this.measurer = measurer;
  }

  /** `InnerGroupHierarchy`. @see GroupMakerActivity.java:69-86 */
  private innerGroupHierarchy(): Pick<GroupHierarchy, 'getChildrenGroups' | 'isEmpty'> {
    const { diagram, group } = this;
    return {
      getChildrenGroups(parent: Entity): readonly Entity[] {
        if (parent.isRoot()) return diagram.getChildrenGroups(group);

        return diagram.getChildrenGroups(parent);
      },
      isEmpty(g: Entity): boolean {
        return diagram.isEmpty(g);
      },
    };
  }

  /** @see GroupMakerActivity.java:95-106 */
  private getPureInnerLinks(): Link[] {
    const result: Link[] = [];
    for (const link of this.diagram.getLinks()) {
      const e1 = link.getEntity1();
      const e2 = link.getEntity2();
      if (
        e1.getParentContainer() === this.group &&
        e1.isGroup() === false &&
        e2.getParentContainer() === this.group &&
        e2.isGroup() === false
      )
        result.push(link);
    }
    return result;
  }

  /** `{root, element, activityDiagram, group}`. @see GroupMakerActivity.java:108-110 */
  getDefaultStyleDefinitionGroup(): StyleSignatureBasic {
    return StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'group');
  }

  /** `new DotData(diagram, group, links, group.leafs(), new InnerGroupHierarchy(), ALL)`. @see GroupMakerActivity.java:120-121 */
  private dotScope(links: readonly Link[]): ActivityLegacyDotScope {
    return {
      topParent: this.group,
      links,
      leafs: this.group.leafs(),
      omitSeparators: true,
      ...this.innerGroupHierarchy(),
    };
  }

  /** @see GroupMakerActivity.java:112-146 */
  getImage(): InnerActivity | EntityImageState {
    if (this.group.countChildren() === 0) return new EntityImageState(this.group, this.diagram.getSkinParam());

    const links = this.getPureInnerLinks();
    const { diagram, stringBounder, measurer } = this;
    const skinParam = diagram.getSkinParam();
    const geometry = solveActivityLegacy({ diagram, scope: this.dotScope(links), stringBounder, measurer });

    if (this.group.getGroupType() !== GroupType.INNER_ACTIVITY)
      throw new Error(`UnsupportedOperationException: ${String(this.group.getGroupType())}`);

    const stereo = this.group.getStereotype();
    const borderColor = getHtmlColor(diagram, stereo, ACTIVITY_BORDER);
    const back = this.group.getColors().getColor(ColorType.BACK);
    const backColor = back === undefined ? getHtmlColor(diagram, stereo, BACKGROUND) : asPaintColor(back);

    const style = this.getDefaultStyleDefinitionGroup().getMergedStyle(skinParam.getCurrentStyleBuilder());
    if (style === undefined) throw new Error('NullPointerException: no group style merged');

    const image = new ActivityLegacySvekResult({
      geometry,
      skinParam,
      inkWalk: (draw) => runInkWalk(draw, driverBounderFor(measurer), measurer),
      stringBounder,
    });
    return new InnerActivity(
      {
        drawU: (ug) => image.drawU(ug),
        calculateDimension: (sb) => image.calculateDimension(sb),
        isHidden: () => false,
      },
      borderColor,
      backColor,
      style.getShadowing(),
    );
  }
}
