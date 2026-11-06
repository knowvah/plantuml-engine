/**
 * `CommandNewpage` starts a brand-new diagram (`CommandNewpage.java:68-73`, `NewpagedDiagram.java:60-73`), so a
 * `skinparam` or `<style>` after it belongs to a later page. The collector hoists them all out of the block; the
 * port draws the first page, which reads only those ahead of the first `newpage`.
 */
import type { PreprocessorResult, SkinparamAssignment } from './preprocessor.js';

const NEWPAGE_LINE = /^\s*newpage\s*$/i;

function isBefore(position: number | undefined, limit: number): boolean {
  return position === undefined || position < limit;
}

/** The first page's `skinparam` values, last assignment winning, as the collector's map is built. */
function skinparamOf(assignments: readonly SkinparamAssignment[]): ReadonlyMap<string, string> {
  return new Map(assignments.map((a) => [a.key, a.value]));
}

/** The document position of the first `newpage`, `undefined` without one. */
function firstNewpagePosition(
  lines: readonly string[],
  linePositions: readonly (number | undefined)[] | undefined,
): number | undefined {
  const line = lines.findIndex((text) => NEWPAGE_LINE.test(text));
  return line === -1 ? undefined : linePositions?.[line];
}

/** The `skinparam` assignments of the first page. */
export function firstPageAssignments(
  assignments: readonly SkinparamAssignment[],
  lines: readonly string[],
  linePositions: readonly (number | undefined)[] | undefined,
): readonly SkinparamAssignment[] {
  const limit = firstNewpagePosition(lines, linePositions);
  return limit === undefined ? assignments : assignments.filter((a) => isBefore(a.position, limit));
}

/** `preprocessed` with the declarations after the first `newpage` removed; the same object when nothing moves. */
export function firstPageOf(preprocessed: PreprocessorResult): PreprocessorResult {
  const { lines, linePositions, skinparamAssignments, stylePositions, styles, declarationOrder } = preprocessed;
  const limit = firstNewpagePosition(lines, linePositions);
  if (limit === undefined || skinparamAssignments === undefined) return preprocessed;
  const assignments = firstPageAssignments(skinparamAssignments, lines, linePositions);
  const keptStyles = stylePositions.map((position) => isBefore(position, limit));
  if (assignments.length === skinparamAssignments.length && keptStyles.every(Boolean)) return preprocessed;
  const skinparam = skinparamOf(assignments);
  return {
    ...preprocessed,
    skinparam,
    skinparamAssignments: assignments,
    styles: styles.filter((_, i) => keptStyles[i]),
    stylePositions: stylePositions.filter((_, i) => keptStyles[i]),
    ...(declarationOrder === undefined
      ? {}
      : {
          declarationOrder: {
            skinparam: new Map([...declarationOrder.skinparam].filter(([key]) => skinparam.has(key))),
            styles: declarationOrder.styles.filter((_, i) => keptStyles[i]),
          },
        }),
  };
}
