/**
 * A skinparam that executes after a `<style>` block wins its property by storage order.
 *
 * Upstream folds every skinparam into the one style storage as it executes (`SkinParam#setParam` converts it with
 * `FromSkinparamToStyle#convertNow` and mutes the builder, `SkinParam.java:227-234`), and a value's priority is the
 * builder's running counter (`ValueImpl.java:51-55`, `StyleBuilder.java:119-122`), so the later declaration of a
 * property wins whichever form it took and whatever the selector's depth (`Style#mergeWith`, `Style.java:121-134`).
 *
 * The port keeps the two forms in two tiers: a `<style>` run writes a cascade field of the graph colours, a skinparam
 * writes a flat field or an element bucket, and a reader prefers the cascade tier. That is exact while the skinparam
 * comes first. For a skinparam that comes after, the cascade value it supersedes is dropped here, the way
 * `build-theme.ts#withoutSupersededArrowCascade` does for `ArrowColor`, so the reader falls to the skinparam's tier.
 * A later `<style>` run writes the cascade field again and wins in turn.
 *
 * Only the keys below, each with the row that measures it; a key `FromSkinparamToStyle` does not convert
 * (`FromSkinparamToStyle.java:304-336`) cannot supersede anything.
 */
import { cleanForKeySlow } from './style/mindmap-style-builder.js';
import type { StyleMap } from './skinparam.js';
import { CLASS_SNAMES } from './style-cascade-class-snames.js';
import { resolveStyleCascade } from './style-map-element.js';
import type { Theme } from './theme.js';

type GraphColors = Theme['colors']['graph'];

/** A key whose cleaned name is on the left supersedes the cascade fields on the right. */
const SUPERSEDED_BY_KEY: ReadonlyMap<string, readonly (keyof GraphColors)[]> = new Map([
  // `addConvert("classFontSize", PName.FontSize, SName.element, SName.class_, SName.header)` (`:185`), the class
  // header's own signature: `class__casc-fontsize-after`.
  ['classfontsize', ['classCascadeHeaderFontSize']],
  // `addConvert("stateBorderThickness", PName.LineThickness, SName.state)` (`:208`): `state__casc-thickness-after`.
  ['stateborderthickness', ['stateLineThickness']],
  // `addConvert("roundCorner", PName.RoundCorner, SName.root)` (`:164`): the root's value, later than a `state`
  // or `class` value, merges over it by counter, `state__casc-roundcorner-after`.
  ['roundcorner', ['classCascadeRoundCorner', 'stateCascadeRoundCorner', 'stateRoundCorner']],
  // `addConvert("arrowThickness", PName.LineThickness, SName.arrow)` (`FromSkinparamToStyle.java:150`): the state arrow's
  // `{root, element, stateDiagram, arrow}` LineThickness, later than a theme's `root { LineThickness 1 }`:
  // `state__casc-control-theme`.
  ['arrowthickness', ['stateArrowLineThickness']],
]);

/** The graph fields a skinparam run with these keys supersedes. */
export function supersededCascadeFields(keys: Iterable<string>): ReadonlySet<keyof GraphColors> {
  const fields = new Set<keyof GraphColors>();
  for (const key of keys)
    for (const cleaned of cleanForKeySlow(key)) {
      if (cleaned.includes('<<')) continue;
      for (const field of SUPERSEDED_BY_KEY.get(cleaned) ?? []) fields.add(field);
    }
  return fields;
}

/** `theme` without the cascade values a skinparam run with these keys supersedes. */
export function withoutSupersededCascades(theme: Theme, keys: Iterable<string>): Theme {
  const fields = supersededCascadeFields(keys);
  const graph = theme.colors.graph;
  if (![...fields].some((field) => graph[field] !== undefined)) return theme;
  const rest: Record<string, unknown> = { ...graph };
  for (const field of fields) delete rest[field];
  return { ...theme, colors: { ...theme.colors, graph: rest as unknown as GraphColors } };
}

/**
 * The converse of {@link withoutSupersededCascades}: a `<style>` run that executes after a skinparam wins the
 * property by counter (`ValueImpl.java:51-55`, `StyleBuilder.java:119-122`), but the readers prefer the flat
 * skinparam tier over the cascade tier, so the flat field the run supersedes is dropped here.
 *
 * Only the pairs below, each with the row that measures it. The run's own declarations decide (`segmentStyleMap`),
 * not a before/after comparison: a run that restates the cascade's value still executes later.
 */
const SUPERSEDED_BY_STYLE: readonly {
  /** The `<style>` property, on any of the element's selectors, that supersedes the flat field. */
  readonly snames: readonly string[];
  readonly property: string;
  readonly flat: keyof GraphColors;
}[] = [
  // `addConvert("classBorderThickness", PName.LineThickness, SName.element, SName.class_)`
  // (`FromSkinparamToStyle.java:195`) against a later `class { LineThickness N }`: `class__casc-thickness-theme`.
  { snames: CLASS_SNAMES, property: 'linethickness', flat: 'classBorderThickness' },
];

/** `theme` without the flat skinparam values the `<style>` run `styleMap` supersedes. */
export function withoutSupersededByStyle(theme: Theme, styleMap: StyleMap): Theme {
  const graph = theme.colors.graph;
  const dropped = SUPERSEDED_BY_STYLE.filter(
    (entry) =>
      graph[entry.flat] !== undefined && resolveStyleCascade(styleMap, entry.snames, entry.property) !== undefined,
  );
  if (dropped.length === 0) return theme;
  const rest: Record<string, unknown> = { ...graph };
  for (const entry of dropped) delete rest[entry.flat];
  return { ...theme, colors: { ...theme.colors, graph: rest as unknown as GraphColors } };
}
