/**
 * `deepMergeTheme` and its helpers — split out of `theme.ts` (mechanical
 * extraction to keep that file under the project's 500-line cap, same
 * rationale as `theme-graph-colors.ts`/`theme-element-resolve.ts`; a pure
 * move, no behavior change). Re-exported from `theme.ts` so every existing
 * `from './theme.js'` call site is unaffected.
 */
import type { ElementColors, Theme, ThemeOverride } from './theme.js';

/**
 * Merge the `<style>`-derived element buckets onto `base.colors.elements`
 * **per SName**, mirroring `StyleBuilder#muteStyle`
 * (`~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/
 * StyleBuilder.java:86-104`): the incoming styles are merged into a COPY of
 * the existing storage one `StyleSignatureBasic` at a time — absent
 * signature → `put`, present signature → `orig.mergeWith(modifiedStyle,
 * MergeStrategy.OVERWRITE_EXISTING_VALUE)`. So the incoming block wins
 * FIELD-BY-FIELD inside its own signature, and can never evict a signature
 * it does not name.
 *
 * S1L-tail F4-e (M1, `plans/s1l-tail-fix/findings/fariba-82-residual.md`):
 * `deepMergeTheme`'s `colors: { ...base.colors, ...partial.colors }` spread
 * is shallow, so handing it a bare `elements` key REPLACED the whole map.
 * Any element-scoped `<style>` selector therefore deleted every
 * skinparam-derived bucket built by stage 2 — in `fariba-82-xolu802`, a
 * `<style> file { … }` block deleted `elements.rectangle`'s
 * `stereotypeFontSize: 12` (from awslib's `skinparam rectangle {
 * StereotypeFontSize 12 }`), forcing the `«User»` row to 14pt and +2px of
 * node height. Upstream cannot express that: `file` and `rectangle` are
 * distinct signatures.
 *
 * `stereotypeFontSizeByStereo` merges one level deeper for the same reason:
 * its keys are per-stereotype-NAME rules that upstream registers as their
 * OWN (more specific) signatures, so a `<style>` rule for one tag must not
 * evict a skinparam-derived rule for a different tag either.
 */
export function mergeElementBuckets(
  base: Theme['colors']['elements'],
  incoming: Readonly<Record<string, ElementColors>>,
): Partial<Record<string, ElementColors>> {
  const merged: Partial<Record<string, ElementColors>> = { ...base };
  for (const [sname, style] of Object.entries(incoming)) {
    const orig = merged[sname];
    if (orig === undefined) {
      merged[sname] = style;
      continue;
    }
    const byStereo = { ...orig.stereotypeFontSizeByStereo, ...style.stereotypeFontSizeByStereo };
    merged[sname] = {
      ...orig,
      ...style,
      ...(Object.keys(byStereo).length > 0 ? { stereotypeFontSizeByStereo: byStereo } : {}),
    };
  }
  return merged;
}

/** Merge the nested `colors.graph` block (activity/json one level deep). */
function mergeGraphColors(base: Theme, partial: ThemeOverride): Theme['colors']['graph'] {
  const pg = partial.colors?.graph;
  return {
    ...base.colors.graph,
    ...(pg ?? {}),
    activity: {
      ...(base.colors.graph.activity ?? {}),
      ...(pg?.activity ?? {}),
    },
    json: {
      ...(base.colors.graph.json ?? {}),
      ...(pg?.json ?? {}),
    },
  };
}

/** Top-level optional scalar fields copied verbatim during a merge. */
const OPTIONAL_SCALAR_KEYS = [
  'defaultFontSize',
  'padding', // add3-T3f (PADDING)
  'swimlaneWidth', // add4-T1b
  'swimlaneWrapTitleWidth', // isw-T2b-ca
  'linetype',
  'fixCircleLabelOverlapping',
  'componentStyle',
  'conditionEndStyle', // T1p-a
  'conditionStyle', // T2c
  'actorStyle',
  'minimumWidth',
  'strictUml',
  'genericDisplayOld', // cdd3-T25 (E3-3)
  'monochrome',
  'reverseColor',
  'stereotypeAlignment',
  'svgDimensionStyle',
  'shadowing',
  'packageStyle',
  'nodeSep',
  'rankSep',
  'wrapWidth',
  'dpi',
  'topurl', // cdd-T34
  'lengthAdjust', // sdd3-T2c
  'maxMessageSize',
  'sameClassWidth',
  'classAttributeIconSize',
  'groupInheritance',
  'tabSize',
  'cardinalityFontSize',
  'cardinalityFontFamily', // T1 (edge-label-box-backlog, D3)
  'cardinalityFontColor', // SI26 T1 (D5)
  'cardinalityFontStyle', // T11 (cdd3, Q-5)
  // `diagramMargin` is the one non-scalar here. It rides this list because the
  // merge is a whole-value replacement, which is exactly right for a margin:
  // a theme that sets one replaces all four sides, it does not blend with the
  // default. Omitting it silently dropped every theme's margin.
  'diagramMargin',
  'handwritten',
  'styleOverrides',
  'hyperlinkUnderline', // add2 T3e
  'svgLinkTarget', // add2 T3e
  'preserveAspectRatio', // add2 T3e
] as const;

/** Copy the top-level optional scalars, preferring `partial` then `base`. */
function applyOptionalScalars(merged: Theme, base: Theme, partial: ThemeOverride): void {
  for (const key of OPTIONAL_SCALAR_KEYS) {
    const value = partial[key] ?? base[key];
    if (value !== undefined) {
      (merged as Record<typeof key, unknown>)[key] = value;
    }
  }
}

/**
 * Deep-merge a partial Theme on top of a base Theme.
 * Returns a new Theme object — neither `base` nor `partial` is mutated.
 * Nested objects (`colors`, `colors.graph`, `colors.graph.activity`,
 * `colors.graph.json`, `sequence`) are merged one level deep; scalar fields
 * use nullish coalescing so that explicit `undefined` falls through to the
 * base value.
 */
export function deepMergeTheme(base: Theme, partial: ThemeOverride): Theme {
  const merged: Theme = {
    fontFamily: partial.fontFamily ?? base.fontFamily,
    fontSize: partial.fontSize ?? base.fontSize,
    colors: {
      ...base.colors,
      ...(partial.colors ?? {}),
      graph: mergeGraphColors(base, partial),
    },
    sequence: {
      ...base.sequence,
      ...(partial.sequence ?? {}),
    },
  };
  applyOptionalScalars(merged, base, partial);
  return merged;
}
