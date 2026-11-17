/**
 * class-comment-bytes (ccb, #151, D4): the `<!--...-->` comment sequence of an SVG, and how far two sequences are apart.
 * `compareSvg` drops comment nodes (`normalize.ts`), so the class and object ratchets and the ccb authored gate hold
 * comment bytes through these two functions instead. The count agrees with
 * `plans/class-comment-bytes/measurements/measure-ccb.mts`: the multiset difference, both sides.
 */

/** Every comment body in document order, exactly as written (no trimming, no unescaping). */
export function svgComments(svg: string): string[] {
  return [...svg.matchAll(/<!--([\s\S]*?)-->/g)].map((m) => m[1]!);
}

/**
 * The size of the multiset difference of two comment sequences (comments only `ours` has plus comments only `jar`
 * has), plus 1 when the multisets agree and the order does not. 0 means byte-equal sequences.
 */
export function commentMismatch(ours: readonly string[], jar: readonly string[]): number {
  const jarOnly = [...jar];
  let oursOnly = 0;
  for (const c of ours) {
    const i = jarOnly.indexOf(c);
    if (i >= 0) jarOnly.splice(i, 1);
    else oursOnly++;
  }
  const size = oursOnly + jarOnly.length;
  if (size > 0) return size;
  return ours.every((c, i) => c === jar[i]) ? 0 : 1;
}

/** `#<index> ours <a> jar <b>` for the first position where the sequences differ, or `''` when they are equal. */
export function firstCommentDiff(ours: readonly string[], jar: readonly string[]): string {
  const n = Math.max(ours.length, jar.length);
  for (let i = 0; i < n; i++) {
    if (ours[i] !== jar[i]) return `#${String(i)} ours ${JSON.stringify(ours[i])} jar ${JSON.stringify(jar[i])}`;
  }
  return '';
}
