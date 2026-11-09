/**
 * The graph spacing `DotStringFactory#createDotString` writes (`nodesep`, `ranksep`): the largest dzeta of any link
 * divided by ten, floored at the activity minimum, replaced outright by a non-zero `skinparam nodesep`/`ranksep`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/DotStringFactory.java:92-133,243-258
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:1152-1203
 */
import type { Link } from '../../core/abel/Link.js';
import { getMargin } from '../../core/decoration/LinkDecor.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { EdgeTexts } from './activity-legacy-edge-text.js';
import type { ActivityLegacySkinParam } from './activity-legacy-skin-param.js';

/** The divisor of both dzetas (`max / 10`). @see DotStringFactory.java:97, 116 */
const DZETA_DIVISOR = 10;
/** The vertical divisor under `!pragma kermor on`. @see DotStringFactory.java:111-114 */
const VERTICAL_DZETA_DIVISOR_KERMOR = 100;
/** `getMinRankSep` of `DiagramType.ACTIVITY`. @see DotStringFactory.java:243-246 */
const MIN_RANKSEP_ACTIVITY = 40;
/** `getMinNodeSep` of `DiagramType.ACTIVITY`. @see DotStringFactory.java:255-258 */
const MIN_NODESEP_ACTIVITY = 20;

/** `ArithmeticStrategySum`: the sum of what it is fed. */
class ArithmeticStrategySum {
  private result = 0;

  eat(value: number): void {
    this.result += value;
  }

  getResult(): number {
    return this.result;
  }
}

/** One link and the texts its `SvekEdge` built. */
export interface DzetaEdge {
  readonly link: Link;
  readonly texts: EdgeTexts;
}

/** `getDecorDzeta`: the margins of the two decors. @see SvekEdge.java:1152-1157 */
function getDecorDzeta(link: Link): number {
  const linkType = link.getType();
  return getMargin(linkType.getDecor1()) + getMargin(linkType.getDecor2());
}

/** `hasNoteLabelText() ? labelText.calculateDimension : nothing`, plus the tail and head texts. */
function eatTexts(
  strategy: ArithmeticStrategySum,
  texts: EdgeTexts,
  measure: (block: TextBlock) => number,
  labelSide: (dim: { width: number; height: number }) => number,
): void {
  if (texts.labelDim !== undefined) strategy.eat(labelSide(texts.labelDim));
  if (texts.startTailText !== undefined) strategy.eat(measure(texts.startTailText));
  if (texts.endHeadText !== undefined) strategy.eat(measure(texts.endHeadText));
}

/** @see SvekEdge.java:1159-1179 */
export function getHorizontalDzeta(edge: DzetaEdge, stringBounder: StringBounder): number {
  const { link, texts } = edge;
  if (link.getEntity1() === link.getEntity2()) return getDecorDzeta(link);

  // `isHorizontal()`: `link.getLength() == 1`.
  if (link.getLength() !== 1) return 0;

  const strategy = new ArithmeticStrategySum();
  eatTexts(
    strategy,
    texts,
    (block) => block.calculateDimension(stringBounder).getWidth(),
    (dim) => dim.width,
  );
  return strategy.getResult() + getDecorDzeta(link);
}

/** @see SvekEdge.java:1185-1203 */
export function getVerticalDzeta(edge: DzetaEdge, stringBounder: StringBounder): number {
  const { link, texts } = edge;
  if (link.getEntity1() === link.getEntity2()) return getDecorDzeta(link);

  if (link.getLength() === 1) return 0;

  const strategy = new ArithmeticStrategySum();
  eatTexts(
    strategy,
    texts,
    (block) => block.calculateDimension(stringBounder).getHeight(),
    (dim) => dim.height,
  );
  return strategy.getResult() + getDecorDzeta(link);
}

/** `getMinRankSep` for `DiagramType.ACTIVITY`. @see DotStringFactory.java:243-250 */
export function getMinRankSep(): number {
  return MIN_RANKSEP_ACTIVITY;
}

/** `getMinNodeSep` for `DiagramType.ACTIVITY`. @see DotStringFactory.java:255-258 */
export function getMinNodeSep(): number {
  return MIN_NODESEP_ACTIVITY;
}

/** The `nodesep` and `ranksep` of `createDotString`, in pixels. @see DotStringFactory.java:109-133 */
export function getSeparators(
  edges: readonly DzetaEdge[],
  skinParam: ActivityLegacySkinParam,
  stringBounder: StringBounder,
  kermor: boolean,
): { nodesep: number; ranksep: number } {
  let horizontal = 0;
  let vertical = 0;
  for (const edge of edges) {
    horizontal = Math.max(horizontal, getHorizontalDzeta(edge, stringBounder));
    vertical = Math.max(vertical, getVerticalDzeta(edge, stringBounder));
  }
  let nodesep = horizontal / DZETA_DIVISOR;
  if (nodesep < getMinNodeSep()) nodesep = getMinNodeSep();

  if (skinParam.getNodesep() !== 0) nodesep = skinParam.getNodesep();

  let ranksep = vertical / (kermor ? VERTICAL_DZETA_DIVISOR_KERMOR : DZETA_DIVISOR);
  if (ranksep < getMinRankSep()) ranksep = getMinRankSep();

  if (skinParam.getRanksep() !== 0) ranksep = skinParam.getRanksep();

  return { nodesep, ranksep };
}
