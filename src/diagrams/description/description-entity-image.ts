/**
 * The leaf images description draws for a `leafType` (decisions D2): the one factory both the sizer
 * (`layout-dot-tree.ts#buildDotNodes`) and the renderer (`renderer-entity.ts#drawEntity`) call, so they measure and
 * draw the same object (`planning/sizer-renderer-parity.md`).
 *
 * `GeneralImageBuilder#createEntityImageBlockInternal` dispatches these on `leaf.getLeafType()`
 * (`GeneralImageBuilder.java:183-187` for map and json); a leaf with no `leafType` keeps `EntityImageDescription`.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/GeneralImageBuilder.java:183-187
 */
import { OBJECT_STEREOTYPE_BUCKET } from '../../core/legacy-stereotype-font.js';
import { FontStyle, type FontConfiguration } from '../../core/klimt/shape/UText.js';
import type { EntityDecorationInfo } from '../../core/svek/DecorateEntityImage.js';
import { EntityImageJson } from '../../core/svek/image/EntityImageJson.js';
import { EntityImageMap } from '../../core/svek/image/EntityImageMap.js';
import { EntityImageDomain } from '../../core/descdiagram/EntityImageDomain.js';
import { EntityImageMachine } from '../../core/descdiagram/EntityImageMachine.js';
import { EntityImageDesignedDomain } from '../../core/descdiagram/EntityImageDesignedDomain.js';
import { EntityImageRequirement } from '../../core/descdiagram/EntityImageRequirement.js';
import type { DescdiagramBoxParams } from '../../core/descdiagram/descdiagram-common.js';
import { Stereotype } from '../../core/stereo/Stereotype.js';
import { toSvgHex } from '../../core/klimt/color/HColorSet.js';
import { UStroke } from '../../core/klimt/UStroke.js';
import type { Paint } from '../../core/paint.js';
import { GUILLEMET_DEFAULT, manageGuillemet, type GuillemetPair } from '../../core/text/Guillemet.js';
import type { Theme } from '../../core/theme.js';
import type { DescriptiveNode } from './ast.js';
import { bareEntityName } from './namespace-groups.js';
import { rawStereotypeLabels } from './parse-helpers.js';
import { parseColorOverride } from './renderer-color-override.js';

/** `FontParam.OBJECT_STEREOTYPE(12, Font.ITALIC)`. @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/font/FontParam.java:58 */
const OBJECT_STEREOTYPE_SIZE = 12;
/** `FontParam#getDefaultColor` for every font param. @see FontParam.java:144-146 */
const FONT_PARAM_DEFAULT_COLOR = '#000000';

/** The theme reads every leaf image shares, resolved once per layout and once per render. */
export interface LeafImageEnv {
  /** `getSkinParam().guillemet()`. */
  readonly guillemet: GuillemetPair;
  /** `FontConfiguration.create(skinParam, FontParam.OBJECT_STEREOTYPE, stereotype)`. */
  readonly objectStereotypeFont: FontConfiguration;
  /** The theme's font family, which every `FontParam` default takes. */
  readonly fontFamily: string;
}

/** What the factory reads off a node: the AST node at layout time, its geo copy at render time. */
export type EntityImageSubject = Pick<
  DescriptiveNode,
  'id' | 'display' | 'stereotype' | 'leafType' | 'jsonValue' | 'mapBodier' | 'entityStyle' | 'color'
>;

/** The images a `leafType` leaf draws. */
export type LeafTypeImage = EntityImageJson | EntityImageMap | ProblemFramesImage;

/** `FontConfiguration.create(skinParam, FontParam.OBJECT_STEREOTYPE, stereotype)` through its skinparam chain. */
function objectStereotypeFont(theme: Theme): FontConfiguration {
  const bucket = theme.colors.elements?.[OBJECT_STEREOTYPE_BUCKET];
  const styles = new Set<FontStyle>();
  if (bucket?.fontStyle === undefined || bucket.fontStyle.italic) styles.add(FontStyle.ITALIC);
  if (bucket?.fontStyle?.bold === true) styles.add(FontStyle.BOLD);
  return {
    family: bucket?.fontFamily ?? theme.fontFamily,
    size: bucket?.fontSize ?? OBJECT_STEREOTYPE_SIZE,
    color: typeof bucket?.font === 'string' ? bucket.font : FONT_PARAM_DEFAULT_COLOR,
    styles,
  };
}

/** {@link LeafImageEnv} from the theme. */
export function leafImageEnv(theme: Theme): LeafImageEnv {
  return {
    guillemet: {
      start: theme.colors.graph.guillemetStart ?? GUILLEMET_DEFAULT.start,
      end: theme.colors.graph.guillemetEnd ?? GUILLEMET_DEFAULT.end,
    },
    objectStereotypeFont: objectStereotypeFont(theme),
    fontFamily: theme.fontFamily,
  };
}

/** `stereotype.getLabels(getSkinParam().guillemet())`, or `undefined` for no stereotype. */
function guillemetLabels(node: EntityImageSubject, env: LeafImageEnv): readonly string[] | undefined {
  if (node.stereotype === undefined || node.stereotype.length === 0) return undefined;
  return rawStereotypeLabels(node.stereotype)?.map((l) => manageGuillemet(l, env.guillemet));
}

/** `entity.getColors().getColor(ColorType.BACK)`: the declaration's `#colour`. */
function backColorOf(node: EntityImageSubject): Paint | undefined {
  return node.color === undefined ? undefined : parseColorOverride(node.color).back;
}

/** `entity.getColors().getColor(ColorType.LINE)`: a map's `##colour` (`CommandCreateMap#executeArg0`). */
function lineColorOf(node: EntityImageSubject): Paint | undefined {
  return node.color === undefined ? undefined : parseColorOverride(node.color).line;
}

/** The group every leaf image opens (`EntityImageJson.java:177-182`); the location is not carried, as for
 *  `EntityImageDescription` (`renderer-entity.ts#buildEntityParams`). */
function entityInfo(node: EntityImageSubject, uid: string): EntityDecorationInfo {
  return { name: bareEntityName(node.id), qualifiedName: node.id, uid, location: null };
}

/** The json image of `node`, or `undefined` when it is not a json leaf. */
export function jsonImageFor(node: EntityImageSubject, env: LeafImageEnv, uid = ''): EntityImageJson | undefined {
  const style = node.entityStyle?.json;
  const styleHeader = node.entityStyle?.jsonHeader;
  if (node.leafType !== 'json' || style === undefined || styleHeader === undefined) return undefined;
  return new EntityImageJson({
    entity: entityInfo(node, uid),
    display: node.display,
    stereoLabels: guillemetLabels(node, env),
    json: node.jsonValue,
    style,
    styleHeader,
    stereoFont: env.objectStereotypeFont,
    backColor: backColorOf(node),
  });
}

/** The map image of `node`, or `undefined` when it is not a map leaf. */
export function mapImageFor(node: EntityImageSubject, env: LeafImageEnv, uid = ''): EntityImageMap | undefined {
  const style = node.entityStyle?.map;
  const styleHeader = node.entityStyle?.mapHeader;
  if (node.leafType !== 'map' || style === undefined || styleHeader === undefined) return undefined;
  return new EntityImageMap({
    entity: entityInfo(node, uid),
    display: node.display,
    stereoLabels: guillemetLabels(node, env),
    map: node.mapBodier?.getMap() ?? new Map(),
    style,
    styleHeader,
    stereoFont: env.objectStereotypeFont,
    lineColor: lineColorOf(node),
    backColor: backColorOf(node),
  });
}

/** `GeneralImageBuilder#createEntityImageBlockInternal`'s leaf-type branches (`:183-187`, `:235-256`), in its order. */
export function leafTypeImageFor(node: EntityImageSubject, env: LeafImageEnv, uid = ''): LeafTypeImage | undefined {
  return mapImageFor(node, env, uid) ?? jsonImageFor(node, env, uid) ?? problemFramesImageFor(node, env);
}

/** `FontParam.<image>(12, plain)` and `<image>_STEREOTYPE(12, italic)`: every Problem Frames font defaults to 12 and
 *  `FontParam#getDefaultColor` (`FontParam.java:132-139`). Legacy `skinparam domain*` keys are not read (no theme
 *  bucket carries them yet). */
const PROBLEM_FRAMES_FONT_SIZE = 12;
/** `ColorParam.<image>Background(HColors.WHITE)` / `<image>Border(HColors.BLACK)`. @see ColorParam.java:73-76 */
const PROBLEM_FRAMES_BACKGROUND = '#FFFFFF';
const PROBLEM_FRAMES_BORDER = '#000000';
/** `UStroke.withThickness(1.5)`, every box image's default `getStroke()` (e.g. `EntityImageDomain.java:90-97`). */
const PROBLEM_FRAMES_STROKE = 1.5;

/** The images a domain or requirement leaf draws. */
export type ProblemFramesImage =
  EntityImageDomain | EntityImageMachine | EntityImageDesignedDomain | EntityImageRequirement;

/** `entity.getStereotype()`, rebuilt from the run the parser kept. */
function stereotypeObject(node: EntityImageSubject): Stereotype | undefined {
  const labels = node.stereotype === undefined ? undefined : rawStereotypeLabels(node.stereotype);
  return labels === undefined || labels.length === 0 ? undefined : Stereotype.build(labels.join(''));
}

function legacyFont(env: LeafImageEnv, italic: boolean): FontConfiguration {
  return {
    family: env.fontFamily,
    size: PROBLEM_FRAMES_FONT_SIZE,
    color: FONT_PARAM_DEFAULT_COLOR,
    styles: italic ? new Set([FontStyle.ITALIC]) : new Set(),
  };
}

function boxParams(node: EntityImageSubject, env: LeafImageEnv): DescdiagramBoxParams {
  return {
    display: node.display,
    stereoLabels: guillemetLabels(node, env),
    nameFont: legacyFont(env, false),
    stereoFont: legacyFont(env, true),
    borderColor: PROBLEM_FRAMES_BORDER,
    backColor: backColorOf(node) ?? PROBLEM_FRAMES_BACKGROUND,
    stroke: UStroke.withThickness(PROBLEM_FRAMES_STROKE),
  };
}

/** `new EntityImageDomain(leaf, letter)`; `stereotype.getHtmlColor()` fills the tag. */
function domainImage(
  node: EntityImageSubject,
  env: LeafImageEnv,
  stereotype: Stereotype,
  letter: string,
): EntityImageDomain {
  const color = stereotype.getHtmlColor();
  return new EntityImageDomain({
    ...boxParams(node, env),
    letter,
    tagBackColor: color === undefined ? undefined : toSvgHex(color),
  });
}

/** `new EntityImageRequirement(leaf)`. */
function requirementImage(
  node: EntityImageSubject,
  env: LeafImageEnv,
  stereotype: Stereotype | undefined,
): EntityImageRequirement | undefined {
  const style = node.entityStyle?.requirement;
  if (style === undefined) return undefined;
  const label = stereotype?.getLabel(env.guillemet);
  return new EntityImageRequirement({
    display: node.display,
    stereoLabel: label,
    style,
    stereoFont: legacyFont(env, true),
    lineColor: lineColorOf(node) ?? PROBLEM_FRAMES_BORDER,
    backColor: backColorOf(node) ?? PROBLEM_FRAMES_BACKGROUND,
    guillemet: env.guillemet,
  });
}

/**
 * `GeneralImageBuilder.java:235-256`, branch for branch: machine/specification, designed/solved, any requirement,
 * lexical/given (`X`), causal (`C`), biddable/uncertain (`B`), then any domain (`P`). The last branch dereferences a
 * null stereotype in `EntityImageDomain.java:83`, so a domain with none throws, as the jar crashes.
 */
export function problemFramesImageFor(node: EntityImageSubject, env: LeafImageEnv): ProblemFramesImage | undefined {
  if (node.leafType !== 'domain' && node.leafType !== 'requirement') return undefined;
  const isDomain = node.leafType === 'domain';
  const stereotype = stereotypeObject(node);
  if (isDomain && stereotype?.isMachineOrSpecification() === true) return new EntityImageMachine(boxParams(node, env));
  if (isDomain && stereotype?.isDesignedOrSolved() === true) return new EntityImageDesignedDomain(boxParams(node, env));
  if (node.leafType === 'requirement') return requirementImage(node, env, stereotype);
  if (stereotype === undefined)
    throw new Error('NullPointerException: Cannot invoke "Stereotype.getHtmlColor()" because "stereotype" is null');
  if (stereotype.isLexicalOrGiven()) return domainImage(node, env, stereotype, 'X');
  if (stereotype.isCausal()) return domainImage(node, env, stereotype, 'C');
  if (stereotype.isBiddableOrUncertain()) return domainImage(node, env, stereotype, 'B');
  return domainImage(node, env, stereotype, 'P');
}
