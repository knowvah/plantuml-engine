/**
 * Order-insensitive SVG comparison for `@startflow` (flp D4, D7): the jar
 * draws boxes in `HashMap<Tile, ActivityBox>` identity-hash order
 * (`FlowDiagram.java:129-140`), so a positional compare cannot tell a right
 * port from a wrong one. This compares the multiset of `>`-split tag strings
 * of the drawn body, as `plans/flow-engine-port/measurements/multiset.mjs`
 * does. A label is its own token (`START</text`), so a broken label fails.
 *
 * A regression test of our output, never a conformance verdict: the survey's
 * verdict stays `compareSvg`'s.
 */

/** The tag strings from the first `<g` on, without `<?plantuml ...?>`, which the port never emits. */
export function multisetTags(svg: string): string[] {
  return svg
    .slice(svg.indexOf('<g'))
    .split('>')
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !t.startsWith('<?plantuml'));
}

/** What each side has that the other lacks. */
export interface MultisetDiff {
  readonly onlyOurs: readonly string[];
  readonly onlyTheirs: readonly string[];
}

function count(list: readonly string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of list) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

function minus(a: ReadonlyMap<string, number>, b: ReadonlyMap<string, number>): string[] {
  const out: string[] = [];
  for (const [t, n] of a) for (let k = 0; k < n - (b.get(t) ?? 0); k++) out.push(t);
  return out;
}

/** The two-sided multiset difference of `ours` and `theirs`; both empty means multiset-equal. */
export function multisetDiff(ours: string, theirs: string): MultisetDiff {
  const a = count(multisetTags(ours));
  const b = count(multisetTags(theirs));
  return { onlyOurs: minus(a, b), onlyTheirs: minus(b, a) };
}

/** `ours` equals `theirs` as a multiset of tags. */
export function isMultisetEqual(ours: string, theirs: string): boolean {
  const { onlyOurs, onlyTheirs } = multisetDiff(ours, theirs);
  return onlyOurs.length === 0 && onlyTheirs.length === 0;
}
