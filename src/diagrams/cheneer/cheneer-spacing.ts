/**
 * The graph spacing `DotStringFactory#createDotString` writes (`nodesep`, `ranksep`) for a diagram that is not
 * `DiagramType.ACTIVITY`: the largest dzeta of any link divided by ten, floored at 35 and 60 (40 under kermor),
 * replaced outright by a non-zero `skinparam nodesep`/`ranksep`. Chen's type is `CHEN_EER`, so the activity floors
 * (20 and 40) never apply (`DotStringFactory.java:243-258`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/DotStringFactory.java:92-133,243-258
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:1152-1203
 */
import type { Link } from '../../core/abel/Link.js';
import { getMargin } from '../../core/decoration/LinkDecor.js';
import type { StringBounder } from '../../core/klimt/font/StringBounder.js';
import type { TextBlock } from '../../core/klimt/shape/TextBlock.js';
import type { ChenEdgeTexts } from './cheneer-edge-text.js';
import type { ChenEerSkinParam } from './cheneer-skin-param.js';

/** The divisor of both dzetas (`max / 10`). @see DotStringFactory.java:97, 116 */
const DZETA_DIVISOR = 10;
/** The vertical divisor under `!pragma kermor on`. @see DotStringFactory.java:111-114 */
const VERTICAL_DZETA_DIVISOR_KERMOR = 100;
/** `getMinRankSep` of any type but `ACTIVITY`, without and with kermor. @see DotStringFactory.java:246-250 */
const MIN_RANKSEP = 60;
const MIN_RANKSEP_KERMOR = 40;
/** `getMinNodeSep` of any type but `ACTIVITY`. @see DotStringFactory.java:258 */
const MIN_NODESEP = 35;

/** One link and the texts its `SvekEdge` built. */
export interface DzetaEdge {
  readonly link: Link;
  readonly texts: ChenEdgeTexts;
}

/** `getDecorDzeta`: the margins of the two decors. @see SvekEdge.java:1152-1157 */
function getDecorDzeta(link: Link): number {
  const linkType = link.getType();
  return getMargin(linkType.getDecor1()) + getMargin(linkType.getDecor2());
}

/** The sum of the label, tail and head sizes along one axis (`ArithmeticStrategySum`). @see SvekEdge.java:1166-1176 */
function sumTexts(
  texts: ChenEdgeTexts,
  measure: (block: TextBlock) => number,
  labelSide: (dim: { width: number; height: number }) => number,
): number {
  let result = 0;
  if (texts.labelDim !== undefined) result += labelSide(texts.labelDim);
  if (texts.startTailText !== undefined) result += measure(texts.startTailText);
  if (texts.endHeadText !== undefined) result += measure(texts.endHeadText);
  return result;
}

/** @see SvekEdge.java:1159-1179 */
export function getHorizontalDzeta(edge: DzetaEdge, stringBounder: StringBounder): number {
  const { link, texts } = edge;
  if (link.getEntity1() === link.getEntity2()) return getDecorDzeta(link);

  // `isHorizontal()`: `link.getLength() == 1`.
  if (link.getLength() !== 1) return 0;

  const sum = sumTexts(
    texts,
    (block) => block.calculateDimension(stringBounder).getWidth(),
    (dim) => dim.width,
  );
  return sum + getDecorDzeta(link);
}

/** @see SvekEdge.java:1185-1203 */
export function getVerticalDzeta(edge: DzetaEdge, stringBounder: StringBounder): number {
  const { link, texts } = edge;
  if (link.getEntity1() === link.getEntity2()) return getDecorDzeta(link);

  if (link.getLength() === 1) return 0;

  const sum = sumTexts(
    texts,
    (block) => block.calculateDimension(stringBounder).getHeight(),
    (dim) => dim.height,
  );
  return sum + getDecorDzeta(link);
}

/** The `nodesep` and `ranksep` of `createDotString`, in pixels. @see DotStringFactory.java:109-133 */
export function getSeparators(
  edges: readonly DzetaEdge[],
  skinParam: ChenEerSkinParam,
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
  if (nodesep < MIN_NODESEP) nodesep = MIN_NODESEP;

  if (skinParam.getNodesep() !== 0) nodesep = skinParam.getNodesep();

  let ranksep = vertical / (kermor ? VERTICAL_DZETA_DIVISOR_KERMOR : DZETA_DIVISOR);
  const minRanksep = kermor ? MIN_RANKSEP_KERMOR : MIN_RANKSEP;
  if (ranksep < minRanksep) ranksep = minRanksep;

  if (skinParam.getRanksep() !== 0) ranksep = skinParam.getRanksep();

  return { nodesep, ranksep };
}
