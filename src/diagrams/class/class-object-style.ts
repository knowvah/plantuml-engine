/**
 * What an `object`, `map` or `json` image asks its two merged styles (odd T2a, D3): `getStyle()` and `getStyleHeader()`,
 * both `withTOBECHANGED(stereotype)` on the diagram's last builder. Written onto the classifier once per render, so the
 * sizer and the renderer read one answer.
 *
 * A value still equal to the skin's is left out unless the flat path holds that role, so the readers fall through to
 * their own tiers as `style-element-scope.ts#roleColor`'s do (D3, D3a).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageObject.java:123-135
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageMap.java:137-149
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/image/EntityImageJson.java:139-149
 */
import { noGradient, parseColor, type Paint } from '../../core/paint.js';
import { parseFontStyleFlags } from '../../core/skinparam-key-handlers-shared.js';
import { Stereotype } from '../../core/stereo/Stereotype.js';
import { writableColor } from '../../core/style-element-scope.js';
import { buildMindmapStyleBuilder } from '../../core/style/mindmap-style-builder.js';
import type { PName } from '../../core/style/PName.js';
import type { SName } from '../../core/style/SName.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { Value } from '../../core/style/Value.js';
import type { ElementColors, Theme } from '../../core/theme.js';
import type { Classifier } from './ast.js';
import { rawStereotypeLabels } from './class-stereotype.js';
import { isObjectKind, type ObjectKind } from './object-kind-style.js';

/** One merged style's answers. Absent: the skin's value, with nothing on the flat path to override. */
export interface ObjectStyleValues {
  readonly background?: Paint;
  readonly border?: Paint;
  readonly font?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly fontFace?: { readonly bold: boolean; readonly italic: boolean };
  readonly lineThickness?: number;
  readonly roundCorner?: number;
  /** `Style#wrapWidth` (`Style.java:330-333`) as a width: `<= 0` for no wrap. */
  readonly maximumWidth?: number;
  readonly minimumWidth?: number;
  /** `Style#getShadowing` (`Style.java:128-130`). */
  readonly shadowing?: number;
  /** `Style#getHorizontalAlignment`, which only `BodierMap#getBody` reads (`BodierMap.java:105`). */
  readonly horizontalAlignment?: string;
  /** `LineStyle`, `Style#getStroke` (`Style.java:306-316`), as `<visible>,<space>` read on the box's stroke. */
  readonly lineStyle?: string;
}

/** `getStyle()` and `getStyleHeader()` of one leaf. */
export interface ObjectStyleScope {
  readonly box: ObjectStyleValues;
  readonly header: ObjectStyleValues;
}

/** What one role reads of a bucket on the flat path: {@link heldByFlat}. */
type FlatRoles = Readonly<Record<keyof ObjectStyleValues, unknown>>;

/** A {@link FlatRoles} value for a role written whether or not it moved from the skin. */
const ALWAYS_ANSWERS = true;

function flatBox(bucket: ElementColors | undefined): FlatRoles {
  return {
    background: bucket?.background ?? bucket?.backgroundColorByStereo,
    border: bucket?.border,
    font: bucket?.font,
    fontFamily: bucket?.fontFamily,
    fontSize: bucket?.fontSize ?? bucket?.fontSizeByStereo,
    fontFace: bucket?.fontStyle,
    // The tiers below a kind's own read a `class_` signature no object holds, so the box always answers:
    // `!theme aws-orange`'s `skinparam class { BorderThickness 1 }` leaves a map at the skin's 0.5.
    lineThickness: ALWAYS_ANSWERS,
    roundCorner: ALWAYS_ANSWERS,
    maximumWidth: bucket?.maximumWidth,
    minimumWidth: bucket?.minimumWidth,
    shadowing: bucket?.shadowing,
    horizontalAlignment: undefined,
    lineStyle: bucket?.lineStyle,
  };
}

function flatHeader(bucket: ElementColors | undefined): FlatRoles {
  return {
    background: bucket?.headerBackground,
    border: undefined,
    font: bucket?.headerFont,
    fontFamily: bucket?.headerFontFamily,
    fontSize: bucket?.headerFontSize,
    fontFace: bucket?.headerFontStyle,
    lineThickness: undefined,
    roundCorner: undefined,
    maximumWidth: undefined,
    minimumWidth: undefined,
    shadowing: undefined,
    horizontalAlignment: undefined,
    lineStyle: undefined,
  };
}

/** Each value's `PName`, and how a raw value becomes the field. */
const FIELD_READS: Readonly<{ [K in keyof ObjectStyleValues]-?: [PName, (v: Value) => ObjectStyleValues[K]] }> = {
  background: ['BackGroundColor', colorOf],
  border: ['LineColor', colorOf],
  font: ['FontColor', fontColorOf],
  fontFamily: ['FontName', (v) => v.asString() || undefined],
  fontSize: ['FontSize', sizeOf],
  fontFace: ['FontStyle', (v) => parseFontStyleFlags(v.asString() ?? '')],
  lineThickness: ['LineThickness', (v) => v.asDouble()],
  roundCorner: ['RoundCorner', (v) => v.asDouble()],
  maximumWidth: ['MaximumWidth', (v) => v.asDouble()],
  minimumWidth: ['MinimumWidth', (v) => v.asDouble()],
  shadowing: ['Shadowing', (v) => v.asDouble()],
  horizontalAlignment: ['HorizontalAlignment', (v) => v.asString()?.toLowerCase()],
  lineStyle: ['LineStyle', (v) => v.asString() ?? undefined],
};

function colorOf(value: Value): Paint | undefined {
  const raw = writableColor(value);
  return raw === undefined ? undefined : parseColor(raw);
}

/** A gradient `FontColor` prints its first colour (`style-element-scope.ts#roleColor`). */
function fontColorOf(value: Value): string | undefined {
  const raw = writableColor(value);
  return raw === undefined ? undefined : noGradient(parseColor(raw));
}

/** `Style#getUFont` (`Style.java:241-253`): `asInt(true)`, -1 for no digits, which falls through to the flat tiers. */
function sizeOf(value: Value): number | undefined {
  const size = value.asIntButMinusOneIfError();
  return size === -1 ? undefined : size;
}

function stereotypeOf(raw: string | undefined): Stereotype | undefined {
  const labels = raw === undefined ? [] : rawStereotypeLabels(raw);
  return labels.length === 0 ? undefined : Stereotype.build(labels.join(''));
}

interface ScopeRead {
  readonly builder: StyleBuilder;
  readonly defaultBuilder: StyleBuilder;
  readonly stereotype: Stereotype | undefined;
}

/** The fields of one signature, by {@link FIELD_READS}. `Value#toString` carries the priority (`DarkString.java:86-88`). */
function valuesOf(read: ScopeRead, snames: readonly SName[], flat: FlatRoles): ObjectStyleValues {
  const signature = StyleSignatureBasic.of(...snames).withTOBECHANGED(read.stereotype);
  const style = signature.getMergedStyle(read.builder);
  const untouched = signature.getMergedStyle(read.defaultBuilder);
  const out: Record<string, unknown> = {};
  for (const [field, [pname, convert]] of Object.entries(FIELD_READS)) {
    const value = style?.value(pname);
    if (value === undefined) continue;
    const isDefault = value.toString() === untouched?.value(pname).toString();
    if (isDefault && flat[field as keyof ObjectStyleValues] === undefined) continue;
    const written = (convert as (v: Value) => unknown)(value);
    if (written !== undefined) out[field] = written;
  }
  return out;
}

/** `EntityImageObject.java:123-124`, `EntityImageMap.java:137-138`, `EntityImageJson.java:139-140`. */
function kindSNames(kind: ObjectKind): readonly SName[] {
  return ['root', 'element', 'objectDiagram', kind];
}

/** Stores each object-family leaf's {@link ObjectStyleScope} on the AST. */
export function annotateObjectStyles(classifiers: readonly Classifier[], builder: StyleBuilder, theme: Theme): void {
  const defaultBuilder = buildMindmapStyleBuilder({ skinparam: new Map(), styles: [] });
  for (const classifier of classifiers) {
    if (!isObjectKind(classifier.kind)) continue;
    const read = { builder, defaultBuilder, stereotype: stereotypeOf(classifier.stereotype) };
    const bucket = theme.colors.elements?.[classifier.kind];
    const snames = kindSNames(classifier.kind);
    classifier.objectStyle = {
      box: valuesOf(read, snames, flatBox(bucket)),
      header: valuesOf(read, [...snames, 'header'], flatHeader(bucket)),
    };
  }
}
