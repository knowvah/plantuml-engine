/**
 * The style builder as it stood at a document line (smc-T4b).
 *
 * Upstream builds the builder while commands execute: each `skinparam` (`SkinParam#setParam`, `SkinParam.java:227-234`)
 * and each `<style>` block (`CommandStyleMultilinesCSS.java:84-91`) mutes it where it is dispatched, and
 * `ActivityDiagram3#addActivity` hands a box the builder current at its command (`ActivityDiagram3.java:114-117`,
 * `InstructionSimple.java:85,107`, `FtileBox.java:144-150`). The preprocessor collected both streams and kept each one's
 * document line (`skinparamAssignments`, `stylePositions`), so the builder at a line is the one `currentStyleBuilderOf`
 * builds from the declarations before it.
 */
import type { PreprocessorResult } from './preprocessor.js';
import { currentStyleBuilderOf } from './document-back-color.js';
import { StyleParsingException } from './style/parser/StyleParser.js';
import type { StyleBuilder } from './style/StyleBuilder.js';

/** The greatest document line a located skinparam or `<style>` block sits at; `undefined` when none is located. */
export function lastDeclarationPosition(pre: PreprocessorResult): number | undefined {
  const positions = [
    ...(pre.skinparamAssignments ?? []).map((assignment) => assignment.position),
    ...pre.stylePositions,
  ].filter((position): position is number => position !== undefined);
  return positions.length === 0 ? undefined : Math.max(...positions);
}

/** `pre` without the declarations located at or after `position` (an unlocated one counts as executed before). */
export function declaredBefore(pre: PreprocessorResult, position: number): PreprocessorResult {
  const skinparam = new Map<string, string>();
  const skinparamOrder = new Map<string, number>();
  for (const assignment of pre.skinparamAssignments ?? []) {
    if (assignment.position !== undefined && assignment.position >= position) continue;
    skinparam.set(assignment.key, assignment.value);
    skinparamOrder.set(assignment.key, assignment.order);
  }
  const keptStyles = pre.styles.map((_, i) => (pre.stylePositions[i] ?? -1) < position);
  const order = pre.declarationOrder;
  return {
    ...pre,
    skinparam,
    styles: pre.styles.filter((_, i) => keptStyles[i]),
    ...(order === undefined
      ? {}
      : { declarationOrder: { skinparam: skinparamOrder, styles: order.styles.filter((_, i) => keptStyles[i]) } }),
  };
}

/** The builder current at `position`, `null` for a `<style>` block the parser rejects. */
export function builderAtPosition(pre: PreprocessorResult, position: number): StyleBuilder | null {
  try {
    return currentStyleBuilderOf(declaredBefore(pre, position));
  } catch (e) {
    if (e instanceof StyleParsingException) return null;
    throw e;
  }
}
