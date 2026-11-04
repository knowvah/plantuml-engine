/**
 * Where a freshly captured oracle lands in `test-results/dot-cache/`
 * (mission oracle-gap-capture, T2; plans/oracle-gap-capture/decisions.md D2).
 *
 * A row lands by the JAR's `data-diagram-type` (`TextBlockExporter.java:
 * 292-294`), not by the manifest file it came from: the existing buckets are
 * homogeneous by jar type, and `scripts/svg-conformance-census.ts:181-192`
 * forces one engine per bucket, so a non-SEQUENCE row filed under `sequence`
 * would be measured through `parseSequence`. The table, in order:
 *
 * | condition                                   | bucket    | why |
 * |---------------------------------------------|-----------|-----|
 * | manifest bucket is `dot`, `hcl` or `yaml`   | manifest  | its `@start` keyword decided it, not a guess |
 * | manifest `object` and jar CLASS             | `object`  | `EXPECTED_TAG.object` (`scripts/dot-parity-rows.ts:43-49`): no separate object engine upstream (`ClassDiagramFactory.java`) |
 * | jar error page                              | `unknown` | the accounting bucket; its existing rows already hold error pages |
 * | jar SEQUENCE, ACTIVITY, CLASS, STATE, TIMING| that type | the bucket's engine |
 * | anything else (DESCRIPTION, no type)        | `unknown` | #113 owns `unknown` DESCRIPTION rows; no basis for component over usecase |
 *
 * `jarType` is `diagramTypeOf(head)` and `jarErrored` is `isJarErrorPage(head)`
 * from `scripts/pin-corpus-tree-measure.ts`, the gates' own classifiers.
 */

/** The accounting bucket `unknown-bucket-routing-repair` built the gates around. */
export const UNKNOWN_BUCKET = 'unknown';

/** Buckets whose `@start<keyword>` fixed the type before the jar ran. */
const KEYWORD_BUCKETS: ReadonlySet<string> = new Set(['dot', 'hcl', 'yaml']);

const OBJECT_BUCKET = 'object';
const OBJECT_JAR_TYPE = 'CLASS';

/** Jar types with a bucket of their own, keyed by `data-diagram-type`. */
const ENGINE_BUCKETS: Readonly<Record<string, string>> = {
  SEQUENCE: 'sequence',
  ACTIVITY: 'activity',
  CLASS: 'class',
  STATE: 'state',
  TIMING: 'timing',
};

/** Pure: the D2 table above. */
export function routeBucket(manifestBucket: string, jarType: string, jarErrored: boolean): string {
  if (KEYWORD_BUCKETS.has(manifestBucket)) return manifestBucket;
  if (manifestBucket === OBJECT_BUCKET && jarType === OBJECT_JAR_TYPE) return OBJECT_BUCKET;
  if (jarErrored) return UNKNOWN_BUCKET;
  return ENGINE_BUCKETS[jarType] ?? UNKNOWN_BUCKET;
}
