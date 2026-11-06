/**
 * The merged-style facts an activity diagram's plain elements read off the document's ONE style builder: the
 * `Shadowing` of the start/stop/end circles, and the action box.
 *
 * `skin rose` declares `element { Shadowing 4.0 }` and `root { LineThickness 1.0 }` (`rose.skin:11,27,84`), so a rose
 * activity casts a shadow on every circle and box. Upstream reads each off the
 * element's own merged style: `CircleStart#drawU` / `CircleEnd#drawU` / `FtileCircleEndCross` (`circle.setDeltaShadow(
 * style.getShadowing())`, `CircleStart.java:79-81`, `CircleEnd.java:83-85`, `FtileCircleEndCross.java:78,105`),
 * `FtileBox` (`:173`). The signatures are `VCompactFactory.java:91-109` (`root, element, activityDiagram, circle,
 * start|stop|end`) and `FtileBox.java:97-99`. The note's own are `note-style-facts.ts`.
 *
 * Carried on the theme under a symbol key rather than a `Theme` field, so the public `Theme` type stays as it is; a
 * spread of the theme keeps it (`activity-box-theme.ts` does the same for a stereotyped box).
 */
import type { PreprocessorResult } from './preprocessor.js';
import type { Theme } from './theme.js';
import { currentStyleBuilderOf } from './document-back-color.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';
import type { StyleBuilder } from './style/StyleBuilder.js';

/** The `Shadowing` each plain activity element casts (`Style#getShadowing`, 0 when none is declared). */
export interface ActivityShadowing {
  readonly start: number;
  readonly stop: number;
  readonly end: number;
  readonly box: number;
}

/** The facts {@link withActivityDocumentStyle} stores. */
export interface ActivityDocumentStyle {
  readonly shadowing: ActivityShadowing;
}

const DOCUMENT_STYLE_KEY: unique symbol = Symbol('activity.documentStyle');

type ThemeWithDocumentStyle = Theme & { readonly [DOCUMENT_STYLE_KEY]?: ActivityDocumentStyle };

const circle = (leaf: 'start' | 'stop' | 'end'): StyleSignatureBasic =>
  StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'circle', leaf);

/** `VCompactFactory.java:91-109`. */
const START = circle('start');
const STOP = circle('stop');
const END = circle('end');
/** `FtileBox.java:97-99`. */
const BOX = StyleSignatureBasic.of('root', 'element', 'activityDiagram', 'activity');

function shadowingOf(signature: StyleSignatureBasic, builder: StyleBuilder): number {
  return signature.getMergedStyle(builder)?.getShadowing() ?? 0;
}

/** The facts of one builder. */
export function resolveActivityDocumentStyle(builder: StyleBuilder): ActivityDocumentStyle {
  return {
    shadowing: {
      start: shadowingOf(START, builder),
      stop: shadowingOf(STOP, builder),
      end: shadowingOf(END, builder),
      box: shadowingOf(BOX, builder),
    },
  };
}

/**
 * `theme` with the document's merged-style facts, unchanged when a `<style>` block does not parse (the caller keeps the
 * flat tiers, as `activity-circle-style.ts#withActivityCircleStyle`).
 */
export function withActivityDocumentStyle(theme: Theme, pre: PreprocessorResult): Theme {
  let builder: StyleBuilder;
  try {
    builder = currentStyleBuilderOf(pre);
  } catch (e) {
    if (e instanceof StyleParsingException) return theme;
    throw e;
  }
  return { ...theme, [DOCUMENT_STYLE_KEY]: resolveActivityDocumentStyle(builder) } as ThemeWithDocumentStyle;
}

/** The facts on `theme`, `undefined` for a hand-built theme or an unparsable `<style>` block. */
export function activityDocumentStyleOf(theme: Theme): ActivityDocumentStyle | undefined {
  return (theme as ThemeWithDocumentStyle)[DOCUMENT_STYLE_KEY];
}
