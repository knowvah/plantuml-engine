/**
 * The font of a classifier's `<<stereotype>>` label (and, for classes, of the generic box that shares it): the
 * `stereotype` style of the leaf's own query, `forStereotypeItself(stereotype)` (upstream 53fba993513 for classes,
 * e7e3d8063b5 / #3013 for objects, maps and JSON). Before those commits the label read the legacy
 * `FontParam.CLASS_STEREOTYPE` / `OBJECT_STEREOTYPE` skinparam chain (`legacy-stereotype-font.ts`), which no
 * `<style>` reached.
 *
 * Written onto the classifier once per render, so the sizer and the renderer read one answer. A value still equal
 * to what the default builder (`plantuml.skin` alone) answers is left out, and the readers fall to that skin's own
 * value ({@link STEREOTYPE_FONT_DEFAULTS}).
 *
 * @see net/sourceforge/plantuml/svek/image/EntityImageClassHeader.java:83-87,133-147 (upstream a720bdd)
 * @see net/sourceforge/plantuml/svek/image/EntityImageObject.java:103-107,122-126 (upstream a720bdd)
 * @see net/sourceforge/plantuml/svek/image/EntityImageMap.java:101-105,136-140 (upstream a720bdd)
 * @see net/sourceforge/plantuml/svek/image/EntityImageJson.java:101-105,138-142 (upstream a720bdd)
 */
import { noGradient, parseColor } from '../../core/paint.js';
import { parseFontStyleFlags } from '../../core/skinparam-key-handlers-shared.js';
import { Stereotype } from '../../core/stereo/Stereotype.js';
import { writableColor } from '../../core/style-element-scope.js';
import { buildMindmapStyleBuilder } from '../../core/style/mindmap-style-builder.js';
import type { PName } from '../../core/style/PName.js';
import type { SName } from '../../core/style/SName.js';
import type { StyleBuilder } from '../../core/style/StyleBuilder.js';
import { StyleSignatureBasic } from '../../core/style/StyleSignatureBasic.js';
import type { Value } from '../../core/style/Value.js';
import type { Classifier } from './ast.js';
import { rawStereotypeLabels } from './class-stereotype.js';
import { isObjectKind } from './object-kind-style.js';

/** What the label's `FontConfiguration` reads off the merged style; absent: the skin's value. */
export interface StereotypeFontValues {
  readonly font?: string;
  readonly fontFamily?: string;
  readonly fontSize?: number;
  readonly fontFace?: { readonly bold: boolean; readonly italic: boolean };
}

/**
 * The skin's answer: `classDiagram { class { stereotype { FontSize 12 } } }` and its `objectDiagram`
 * `object`/`map`/`json` twins, `stereotype { FontStyle italic }`, `root { FontColor black }`.
 * @see skin/plantuml.skin (upstream a720bdd), `stereotype` and `classDiagram`/`objectDiagram` blocks
 */
export const STEREOTYPE_FONT_DEFAULTS = { size: 12, bold: false, italic: true, color: '#000000' } as const;

/** `EntityImageClassHeader#getStyleSignature` is `StyleQueries.CLASSDIAG_CLASS_HEADER`; the label drops `header`. */
const CLASS_SNAMES: readonly SName[] = ['root', 'element', 'classDiagram', 'class_'];

/** `StyleQueries.OBJECTDIAG_OBJECT` / `_MAP` / `_JSON`. */
function querySNames(kind: string): readonly SName[] {
  return isObjectKind(kind) ? ['root', 'element', 'objectDiagram', kind] : CLASS_SNAMES;
}

const FIELD_READS: Readonly<{ [K in keyof StereotypeFontValues]-?: [PName, (v: Value) => StereotypeFontValues[K]] }> = {
  font: ['FontColor', fontColorOf],
  fontFamily: ['FontName', (v) => v.asString() || undefined],
  fontSize: ['FontSize', sizeOf],
  fontFace: ['FontStyle', (v) => parseFontStyleFlags(v.asString() ?? '')],
};

/** A gradient `FontColor` prints its first colour (`style-element-scope.ts#roleColor`). */
function fontColorOf(value: Value): string | undefined {
  const raw = writableColor(value);
  return raw === undefined ? undefined : noGradient(parseColor(raw));
}

/** `Style#getUFont` (`Style.java:241-253`): -1 for no digits, which keeps the skin's size. */
function sizeOf(value: Value): number | undefined {
  const size = value.asIntButMinusOneIfError();
  return size === -1 ? undefined : size;
}

function stereotypeOf(raw: string | undefined): Stereotype | undefined {
  const labels = raw === undefined ? [] : rawStereotypeLabels(raw);
  return labels.length === 0 ? undefined : Stereotype.build(labels.join(''));
}

/** `getQuery().add(SName.stereotype).forStereotypeItself(stereotype)`, read field by field; a null stereotype
 *  leaves the query as is (`forStereotypeItself`'s first guard). */
function valuesOf(
  builder: StyleBuilder,
  defaultBuilder: StyleBuilder,
  kind: string,
  stereotype: Stereotype | undefined,
): StereotypeFontValues {
  const signature = StyleSignatureBasic.of(...querySNames(kind), 'stereotype').forStereotypeItself(stereotype);
  const style = signature.getMergedStyle(builder);
  const untouched = signature.getMergedStyle(defaultBuilder);
  const out: Record<string, unknown> = {};
  for (const [field, [pname, convert]] of Object.entries(FIELD_READS)) {
    const value = style?.value(pname);
    if (value === undefined || value.toString() === untouched?.value(pname).toString()) continue;
    const written = (convert as (v: Value) => unknown)(value);
    if (written !== undefined) out[field] = written;
  }
  return out;
}

/**
 * A class's generic box is drawn in `getStereotypeFontConfiguration(stereotype)` whether or not the class carries a
 * stereotype (`EntityImageClassHeader.java:146-147`): `forStereotypeItself(null)` keeps the plain `stereotype` query.
 * Objects, maps and JSON have no generic box.
 */
function drawsGenericBox(classifier: Classifier): boolean {
  return !isObjectKind(classifier.kind) && classifier.typeParams.length > 0;
}

/** Stores the {@link StereotypeFontValues} of each classifier with a stereotype label or a generic box on the AST. */
export function annotateStereotypeFonts(classifiers: readonly Classifier[], builder: StyleBuilder): void {
  const defaultBuilder = buildMindmapStyleBuilder({ skinparam: new Map(), styles: [] });
  for (const classifier of classifiers) {
    const stereotype = stereotypeOf(classifier.stereotype);
    if (stereotype === undefined && !drawsGenericBox(classifier)) continue;
    classifier.stereotypeFont = valuesOf(builder, defaultBuilder, classifier.kind, stereotype);
  }
}

/** The classifier's merged-style answers the geo carries to the renderer: `objectStyle` and `stereotypeFont`. */
export function mergedStyleFields(
  classifier: Pick<Classifier, 'objectStyle' | 'stereotypeFont'>,
): Pick<Classifier, 'objectStyle' | 'stereotypeFont'> {
  return {
    ...(classifier.objectStyle !== undefined ? { objectStyle: classifier.objectStyle } : {}),
    ...(classifier.stereotypeFont !== undefined ? { stereotypeFont: classifier.stereotypeFont } : {}),
  };
}

/** The label face: what the merged style moved off the skin, else the skin's 12 pt italic in the root family. */
export function styledStereoFace(
  rootFamily: string,
  styled: StereotypeFontValues,
): { family: string; size: number; bold: boolean; italic: boolean } {
  return {
    family: styled.fontFamily ?? rootFamily,
    size: styled.fontSize ?? STEREOTYPE_FONT_DEFAULTS.size,
    bold: styled.fontFace?.bold ?? STEREOTYPE_FONT_DEFAULTS.bold,
    italic: styled.fontFace?.italic ?? STEREOTYPE_FONT_DEFAULTS.italic,
  };
}
