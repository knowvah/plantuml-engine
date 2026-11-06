/**
 * The `<style>` commands' failure path — smc T1b (D3).
 *
 * Upstream's `<style>` block is a command every `PSystemCommandFactory`
 * dispatches (`CommonCommands.java:91-93`): `CommandStyleMultilinesCSS`,
 * `CommandStyleSingleLineCSS` and `CommandStyleImport` each parse their sheet
 * where they stand, and a `StyleParsingException` is the command error
 * `Error in style definition: <message>` (`CommandStyleMultilinesCSS.java:84-98`,
 * `CommandStyleSingleLineCSS.java:80-95`, `CommandStyleImport.java:120-130`).
 * The factory stops at that line and the jar draws its `PSystemError` page.
 *
 * This port hoists every `<style>` sheet out of the body in the preprocessor
 * collector (`preprocessed.styles`, opened at `preprocessed.stylePositions`),
 * so {@link styleCutOf} restores the command's place in the dispatch the way
 * `skinCutOf` does for `skin` (unwind2-S8). Only a `PSystemCommandFactory`
 * dispatches these commands: the `StyleExtractor` factories catch and log the
 * same exception and draw (`JsonDiagramFactory.java:99-103`,
 * `FilesDiagram.java:66-70`), so the cut is marked
 * {@link SkinCut.commandFactoryOnly}.
 */
import type { UmlSource } from './block-extractor.js';
import type { PreprocessorResult } from './preprocessor.js';
import { refuse } from './parse-refusal.js';
import { linesBefore, skinCutOf, type SkinCut } from './skin-command.js';
import { removeStartingQuote } from './style/mindmap-style-builder.js';
import { readLines, StyleParser, StyleParsingException } from './style/parser/StyleParser.js';

/** `"Error in style definition: " + e.getMessage()`. @see CommandStyleMultilinesCSS.java:93 */
const STYLE_ERROR_PREFIX = 'Error in style definition: ';

/**
 * The command error a `<style>` sheet's parse raises, or `undefined` when it
 * parses. The sheet is the block's inner lines after
 * `MultilinesStrategy.REMOVE_STARTING_QUOTE` (`CommandStyleMultilinesCSS.java:63`).
 * Parse failure depends on the sheet alone: the builder only feeds the
 * parser's priority counter (`StyleParser.java:65-71`).
 * @see ~/git/plantuml/src/main/java/net/sourceforge/plantuml/style/CommandStyleMultilinesCSS.java:84-98
 */
export function styleCommandError(sheet: string): string | undefined {
  try {
    new StyleParser().parse(removeStartingQuote(readLines(sheet)));
  } catch (e) {
    if (e instanceof StyleParsingException) return STYLE_ERROR_PREFIX + e.message;
    throw e;
  }
  return undefined;
}

/**
 * The cut for the first `<style>` sheet upstream would refuse, if any: an
 * execution error at the block's opening line (`executeFewLines` reports
 * `step.blocLines.getFirst()`, `PSystemCommandFactory.java:181-185`), having
 * consumed the body lines before it.
 */
export function styleCutOf(
  preprocessed: Pick<PreprocessorResult, 'styles' | 'stylePositions'>,
  source: UmlSource,
): SkinCut | undefined {
  for (const [i, sheet] of preprocessed.styles.entries()) {
    const message = styleCommandError(sheet);
    if (message === undefined) continue;
    const position = preprocessed.stylePositions[i] ?? 0;
    const index = linesBefore(source, position);
    return { index, refusal: refuse('execution', position, index, message), commandFactoryOnly: true };
  }
  return undefined;
}

/**
 * Every hoisted command that fails, earliest line first: upstream's per-line
 * loop stops at whichever it reaches first.
 */
export function commandCutsOf(
  preprocessed: Pick<PreprocessorResult, 'skinDirectives' | 'styles' | 'stylePositions'>,
  source: UmlSource,
): SkinCut[] {
  const cuts = [skinCutOf(preprocessed, source), styleCutOf(preprocessed, source)].filter(
    (cut): cut is SkinCut => cut !== undefined,
  );
  return cuts.sort((a, b) => a.refusal.line - b.refusal.line);
}
