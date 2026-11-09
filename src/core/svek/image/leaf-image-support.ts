/**
 * Helpers the legacy activity leaf images share: the merged style (`getMergedStyle` is nullable here, upstream
 * dereferences it), `Colors#getColor(Style, PName, HColorSet)`, the colour narrowing the klimt `Fore`/`Back`
 * need, and the `<g>` the start, end and branch images open.
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/klimt/color/Colors.java:239-252
 */
import type { Colors } from '../../abel/Colors.js';
import { ColorType } from '../../abel/ColorType.js';
import type { Entity } from '../../abel/Entity.js';
import { Back } from '../../klimt/Back.js';
import { Fore } from '../../klimt/Fore.js';
import { HColorGradient } from '../../klimt/color/HColorGradient.js';
import { HColorSimple } from '../../klimt/color/HColorSimple.js';
import type { UGraphic } from '../../klimt/UGraphic.js';
import { UGroup, UGroupType } from '../../klimt/shape/UGroup.js';
import type { HColorSet } from '../../klimt/color/HColorSet.js';
import type { PName } from '../../style/PName.js';
import type { Style } from '../../style/Style.js';
import type { StyleBuilder } from '../../style/StyleBuilder.js';
import type { StyleSignature } from '../../style/StyleSignature.js';

/** A paintable colour: what `UGraphic#apply(HColor)` takes upstream. */
export type PaintColor = HColorSimple | HColorGradient;

/** `getStyleSignature().getMergedStyle(getSkinParam().getCurrentStyleBuilder())`: upstream dereferences the result. */
export function mergedStyleOf(signature: StyleSignature, builder: StyleBuilder): Style {
  const style = signature.getMergedStyle(builder);
  if (style === undefined) throw new Error('NullPointerException: no style merged for the signature');
  return style;
}

/** `ug.apply(HColor)`'s cast. A style colour is an `HColorSimple` or an `HColorGradient`. */
export function asPaintColor(color: object): PaintColor {
  if (color instanceof HColorSimple || color instanceof HColorGradient) return color;
  throw new Error('ClassCastException: colour is not an HColorSimple or HColorGradient');
}

/** `style.value(name).asColor(set)` as a paintable colour. */
export function styleColor(style: Style, name: PName, set: HColorSet): PaintColor {
  return asPaintColor(style.value(name).asColor(set));
}

/**
 * `Colors#getColor(Style, PName, HColorSet)`: the entity's own BACK/LINE colour wins over the style's.
 * @see Colors.java:239-252
 */
export function colorsGetColor(colors: Colors, style: Style, name: PName, set: HColorSet): PaintColor {
  if (name === 'BackGroundColor') {
    const color = colors.getColor(ColorType.BACK);
    if (color !== undefined) return asPaintColor(color);
  }
  if (name === 'LineColor') {
    const color = colors.getColor(ColorType.LINE);
    if (color !== undefined) return asPaintColor(color);
  }
  return styleColor(style, name, set);
}

/** `ug.apply(HColor)`. */
export function applyFore(ug: UGraphic, color: PaintColor): UGraphic {
  return ug.apply(new Fore(color));
}

/** `ug.apply(color.bg())`. */
export function applyBack(ug: UGraphic, color: PaintColor): UGraphic {
  return ug.apply(new Back(color));
}

/** The `startGroup`/`closeGroup` surface, duck-typed on concrete UGraphics (the `Cluster.ts` convention). */
interface UGraphicWithGroups extends UGraphic {
  startGroup(group: UGroup): void;
  closeGroup(): void;
}

function requireGroups(ug: UGraphic): UGraphicWithGroups {
  const candidate = ug as Partial<UGraphicWithGroups>;
  if (typeof candidate.startGroup !== 'function' || typeof candidate.closeGroup !== 'function')
    throw new Error('leaf images: ug does not support startGroup/closeGroup (see UGraphicSvg)');
  return ug as UGraphicWithGroups;
}

/**
 * The group of an entity image: `CLASS`, `ID` = `entity_<name>`, `DATA_ENTITY`, `DATA_UID`,
 * `DATA_QUALIFIED_NAME`, and `DATA_SOURCE_LINE` when `withLocation` (`new UGroup(getEntity().getLocation())`).
 * The branch image builds `new UGroup()`, with no location.
 * @see EntityImageCircleStart.java:68-76, EntityImageBranch.java:70-75
 */
export function entityGroup(entity: Entity, cssClass: string, withLocation: boolean): UGroup {
  const location = withLocation ? entity.getLocation() : undefined;
  const group = new UGroup(location === undefined ? undefined : { position: location.getPosition() });
  group.put(UGroupType.CLASS, cssClass);
  group.put(UGroupType.ID, `entity_${entity.getName()}`);
  group.put(UGroupType.DATA_ENTITY, entity.getName());
  group.put(UGroupType.DATA_UID, entity.getUid());
  group.put(UGroupType.DATA_QUALIFIED_NAME, entity.getQuark().getQualifiedName());
  return group;
}

/** `ug.startGroup(group); draw(ug); ug.closeGroup();` */
export function inGroup(ug: UGraphic, group: UGroup, draw: () => void): void {
  const grouped = requireGroups(ug);
  grouped.startGroup(group);
  draw();
  grouped.closeGroup();
}
