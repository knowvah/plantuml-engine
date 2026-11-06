/**
 * The merged `note` style's `Shadowing` and `LineThickness` for a diagram that draws its notes through
 * `EntityImageNote` (state) or `FtileWithNoteOpale` (activity).
 *
 * `skin rose` declares `element { Shadowing 4.0 }` and `root { LineThickness 1.0 }` (`rose.skin:11,84`), so a rose note
 * casts a shadow and strokes at 1. Upstream reads both off the note's merged style:
 * `EntityImageNote.java:109,188-189,283-285` (`root, element, <diagram>, note`; `polygon.setDeltaShadow(shadowing)`,
 * `ug.apply(style.getStroke())`) and `FtileWithNoteOpale.java:88-89,137-143` (`root, element, activityDiagram, note`;
 * `new Opale(shadowing, …, stroke)`, which shadows its outline, `Opale.java:122`).
 *
 * Carried on the theme under a symbol key rather than a `Theme` field, so the public `Theme` type stays as it is; a
 * spread of the theme keeps it (`activity-box-theme.ts` does the same for a stereotyped box).
 */
import type { PreprocessorResult } from './preprocessor.js';
import type { Theme } from './theme.js';
import type { DiagramType } from './block-extractor.js';
import { currentStyleBuilderOf, styleNameOf } from './document-back-color.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import { cleanForKeySlow } from './style/mindmap-style-builder.js';
import { StyleSignatureBasic } from './style/StyleSignatureBasic.js';

/** What a note's merged style holds for the two properties. */
export interface NoteStyleFacts {
  readonly shadowing: number;
  readonly thickness: number;
}

const NOTE_STYLE_FACTS_KEY: unique symbol = Symbol('note.styleFacts');

type ThemeWithNoteFacts = Theme & { readonly [NOTE_STYLE_FACTS_KEY]?: NoteStyleFacts };

/** `plantuml.skin:325` `note { LineThickness 0.5 }`, a note whose merged style is absent keeps the flat tiers'. */
const NO_NOTE_THICKNESS = 0.5;

/**
 * `theme` with the facts of the note signature `root, element, <diagram>, note`, unchanged when a `<style>` block does
 * not parse (the caller keeps the flat tiers).
 */
export function withNoteStyleFacts(theme: Theme, pre: PreprocessorResult, diagramType: DiagramType): Theme {
  try {
    const builder = currentStyleBuilderOf(pre);
    const note = StyleSignatureBasic.of('root', 'element', styleNameOf(diagramType), 'note').getMergedStyle(builder);
    const facts: NoteStyleFacts = {
      shadowing: note?.getShadowing() ?? 0,
      thickness: note?.getStroke().getThickness() ?? NO_NOTE_THICKNESS,
    };
    return { ...theme, [NOTE_STYLE_FACTS_KEY]: facts } as ThemeWithNoteFacts;
  } catch (e) {
    if (e instanceof StyleParsingException) return theme;
    throw e;
  }
}

/** The facts on `theme`, `undefined` for a hand-built theme or an unparsable `<style>` block. */
export function noteStyleFactsOf(theme: Theme): NoteStyleFacts | undefined {
  return (theme as ThemeWithNoteFacts)[NOTE_STYLE_FACTS_KEY];
}

const NOTE_ROUND_CORNER_KEY: unique symbol = Symbol('note.roundCorner');

type ThemeWithNoteRoundCorner = Theme & { readonly [NOTE_ROUND_CORNER_KEY]?: number };

/** `SkinParam.DIGITS`: a value that is only digits counts (`SkinParam.java:135-137,911-913`). */
const DIGITS = /^\d+$/;

/** `CornerParam.DEFAULT#getRoundKey`. @see CornerParam.java:41-46 */
const DEFAULT_ROUND_KEY = 'roundcorner';

/**
 * `getSkinParam().getRoundCorner(CornerParam.DEFAULT, null)` of `EntityImageNote.java:270-272`: the flat `skinparam
 * roundCorner` when it is digits, else 0. It reads the flat parameter map only, so a `<style>` `RoundCorner` never
 * reaches a class or state note (`SkinParam.java:891-916`).
 */
export function noteRoundCornerOf(skinparam: ReadonlyMap<string, string>): number {
  let value: string | undefined;
  for (const [key, raw] of skinparam) if (cleanForKeySlow(key).includes(DEFAULT_ROUND_KEY)) value = raw.trim();
  return value !== undefined && DIGITS.test(value) ? Number(value) : 0;
}

/** `theme` carrying the note round corner of `pre`, under a symbol key like {@link withNoteStyleFacts}. */
export function withNoteRoundCorner(theme: Theme, pre: Pick<PreprocessorResult, 'skinparam'>): Theme {
  const roundCorner = noteRoundCornerOf(pre.skinparam);
  return roundCorner === 0 ? theme : ({ ...theme, [NOTE_ROUND_CORNER_KEY]: roundCorner } as ThemeWithNoteRoundCorner);
}

/** The round corner on `theme`, 0 when none (a hand-built theme, or no `skinparam roundCorner`). */
export function noteRoundCornerOfTheme(theme: Theme): number {
  return (theme as ThemeWithNoteRoundCorner)[NOTE_ROUND_CORNER_KEY] ?? 0;
}
