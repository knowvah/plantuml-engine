/**
 * stdd T2a: the state diagram's `<style>` arrow cascade, the state twin of `style-cascade-description.ts`.
 * `SvekEdge#drawU` merges `{root, element, stateDiagram, arrow}.withTOBECHANGED(stereotype)`
 * (`SvekEdge.java:816-821,874-876`); the per-tag tier is keyed by the cleaned tag (`StyleSignatureBasic#clean`).
 *
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/svek/SvekEdge.java:816-821,874-905
 */
import type { StyleMap } from './skinparam.js';
import type { Theme } from './theme.js';
import { arrowTagCascadeEntry, cascadeHex } from './style-cascade-class.js';
import { cleanStereotypeToken, collectStyleTagNames } from './style-map-element.js';
import { resolveStyleCascade } from './style-map-tag-cascade.js';
import { STATE_ARROW_SNAMES } from './style-cascade-class-snames.js';

export type StateCascadeOverride = Pick<
  Theme['colors']['graph'],
  | 'stateArrowTagCascade'
  | 'stateLineThickness'
  | 'stateCircleStartLineThickness'
  | 'stateCircleEndLineThickness'
  | 'stateNameHyperlinkColor'
  | 'stateNameHyperlinkUnderlineThickness'
  | 'stateDescriptionHyperlinkColor'
  | 'stateRoundCorner'
  | 'stateNameHorizontalAlignment'
  | 'stateArrowLineThickness'
>;

/** `EntityImageStateCommon.STYLE` (`EntityImageStateCommon.java:60-61`): a box and a cluster's stroke. */
const STATE_SNAMES = ['root', 'element', 'statediagram', 'state'] as const;
/** `EntityImageCircleStart.java:56-58` / `EntityImageCircleEnd.java:57-59`. */
const CIRCLE_START_SNAMES = ['root', 'element', 'statediagram', 'circle', 'start'] as const;
const CIRCLE_END_SNAMES = ['root', 'element', 'statediagram', 'circle', 'end'] as const;
/** `EntityImageStateCommon#getStyleStateName` / `#getStyleStateDescription` (`EntityImageStateCommon.java:91-98`). */
const STATE_NAME_SNAMES = [...STATE_SNAMES, 'name'] as const;
const STATE_DESCRIPTION_SNAMES = [...STATE_SNAMES, 'description'] as const;

/** `Style#getStroke` (`Style.java:299-305`): `LineThickness` of the merged style, declaration order
 *  (`StyleStorage#computeMergedStyle`); `undefined` where nothing declared it, so the renderer's
 *  skin default stands (`element { LineThickness 0.5 }`, `plantuml.skin:91-93`; circles 1). */
function cascadeThickness(
  styleMap: StyleMap,
  snames: readonly string[],
  property = 'linethickness',
): number | undefined {
  const raw = resolveStyleCascade(styleMap, snames, property);
  if (raw === undefined) return undefined;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** `Value#asHorizontalAlignment` (`ValueImpl`, `HorizontalAlignment.fromString`): `left`, `right`, else `center`. */
function cascadeAlignment(styleMap: StyleMap, snames: readonly string[]): 'left' | 'center' | 'right' | undefined {
  const raw = resolveStyleCascade(styleMap, snames, 'horizontalalignment')?.trim().toLowerCase();
  if (raw === undefined) return undefined;
  return raw === 'left' || raw === 'right' ? raw : 'center';
}

/** `<style> arrow { .tag { LineColor; LineThickness; FontColor } }` as a state link sees it. */
export function computeStateStyleCascadeOverrides(styleMap: StyleMap): Partial<StateCascadeOverride> {
  const tags: Record<string, NonNullable<StateCascadeOverride['stateArrowTagCascade']>[string]> = {};
  for (const tag of collectStyleTagNames(styleMap)) {
    const fontColor = cascadeHex(styleMap, STATE_ARROW_SNAMES, 'fontcolor', [tag]);
    const entry = {
      ...arrowTagCascadeEntry(styleMap, tag, STATE_ARROW_SNAMES),
      ...(fontColor === undefined ? {} : { fontColor }),
    };
    if (Object.keys(entry).length > 0) tags[cleanStereotypeToken(tag)] = entry;
  }
  const stateLineThickness = cascadeThickness(styleMap, STATE_SNAMES);
  const stateCircleStartLineThickness = cascadeThickness(styleMap, CIRCLE_START_SNAMES);
  const stateCircleEndLineThickness = cascadeThickness(styleMap, CIRCLE_END_SNAMES);
  // stdd T3d: `Style#getFontConfiguration` (`Style.java:265-266`) for the name and description zones.
  const stateNameHyperlinkColor = cascadeHex(styleMap, STATE_NAME_SNAMES, 'hyperlinkcolor');
  const stateNameHyperlinkUnderlineThickness = cascadeThickness(
    styleMap,
    STATE_NAME_SNAMES,
    'hyperlinkunderlinethickness',
  );
  const stateDescriptionHyperlinkColor = cascadeHex(styleMap, STATE_DESCRIPTION_SNAMES, 'hyperlinkcolor');
  // stdd T5a: `style.value(PName.RoundCorner)` of the state style (`EntityImageStateCommon`, `InnerStateAutonom.java:88`,
  // `Cluster.java:320`): a skin's `root { RoundCorner 15 }` reaches it (sumiri-68, `skin debug`).
  const stateRoundCorner = cascadeThickness(styleMap, STATE_SNAMES, 'roundcorner');
  // stdd T5a: `ClusterHeader#getTitleHorizontalAlignment` / `getStyleStateName().getHorizontalAlignment()`
  // (`ClusterHeader.java:181-183`, `InnerStateAutonom.java:91`): `state.name { HorizontalAlignment }`, a skin's
  // `root { HorizontalAlignment left }` included (niveno-60).
  const stateNameHorizontalAlignment = cascadeAlignment(styleMap, STATE_NAME_SNAMES);
  // `SvekEdge.java:874-905`'s `styleLine.getStroke()` LineThickness over `{root, element, stateDiagram, arrow}`.
  const stateArrowLineThickness = cascadeThickness(styleMap, STATE_ARROW_SNAMES);
  return {
    ...(stateNameHorizontalAlignment !== undefined ? { stateNameHorizontalAlignment } : {}),
    ...(stateArrowLineThickness !== undefined ? { stateArrowLineThickness } : {}),
    ...(stateRoundCorner !== undefined ? { stateRoundCorner } : {}),
    ...(stateNameHyperlinkColor !== undefined ? { stateNameHyperlinkColor } : {}),
    ...(stateNameHyperlinkUnderlineThickness !== undefined ? { stateNameHyperlinkUnderlineThickness } : {}),
    ...(stateDescriptionHyperlinkColor !== undefined ? { stateDescriptionHyperlinkColor } : {}),
    ...(Object.keys(tags).length > 0 ? { stateArrowTagCascade: tags } : {}),
    ...(stateLineThickness !== undefined ? { stateLineThickness } : {}),
    ...(stateCircleStartLineThickness !== undefined ? { stateCircleStartLineThickness } : {}),
    ...(stateCircleEndLineThickness !== undefined ? { stateCircleEndLineThickness } : {}),
  };
}
