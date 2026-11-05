/**
 * How many `<style>` blocks (their own opening tag's source line) sit strictly BEFORE `currentLine`: the generation an
 * entity created at that line captures, mirroring upstream's `Entity#currentStyleBuilder` snapshot
 * (`preprocessor.ts#PreprocessorResult.stylePositions`). `undefined` (a hand-built fixture, or a merged-brace line with
 * no tracked position) returns `0`.
 *
 * @see ~/git/plantuml/src/main/java/net/atmp/CucaDiagram.java:808-819
 */
export function countStyleBlocksBefore(
  stylePositions: readonly (number | undefined)[],
  currentLine: number | undefined,
): number {
  if (currentLine === undefined) return 0;
  let count = 0;
  for (const pos of stylePositions) {
    if (pos !== undefined && pos < currentLine) count += 1;
  }
  return count;
}
