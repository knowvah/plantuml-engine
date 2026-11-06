/**
 * Whether a name resolves to a declared entity, without creating anything: `quarkInContext(true, name).getData()`.
 */
import { countByName, firstWithName, qualifiedId, splitOnSeparator } from './class-namespace-resolve.js';
import type { ParseState } from './class-parse-state.js';

/**
 * Read-only counterpart to `resolveReference`'s lookup rules, for the map
 * link's dest resolution — upstream's `quarkInContext(true, dest)` followed
 * immediately by `entity2 == null` bails without ever creating anything, so
 * this must NOT mutate `state.ast.namespaces` the way `resolveReference`'s
 * qualified-path fallback does (`ensureNamespaceChain` unconditionally
 * registers namespace entries for the resolved id, even when the caller only
 * wanted to check existence) — a namespace conjured for a dest that turns
 * out not to exist would later get promoted to a phantom leaf classifier by
 * `collapseEmptyNamespacesFinal` (class-namespace.ts). Mirrors the bare-name
 * unique-match shortcut (`tryReuseExisting`'s `countByName`/`firstWithName`
 * pair) for the common case, falling back to a plain qualified-id lookup
 * against the already-registered `classifierIndex` for a dotted reference —
 * a simplified (existence-check-only) subset of the full endpoint resolution
 * `class-relationship-parser.ts` performs for ordinary arrow endpoints,
 * sufficient here since a map link never AUTO-CREATES its destination.
 */
export function resolveExistingId(state: ParseState, rawName: string): string | undefined {
  const sep = state.namespaceSeparator;
  if (splitOnSeparator(rawName, sep) === null && countByName(state.ast.classifiers, sep, rawName) === 1) {
    return firstWithName(state.ast.classifiers, sep, rawName)!.id;
  }
  const id = qualifiedId(rawName, state.activeNamespace, sep, state.ast.namespaces);
  return state.classifierIndex.has(id) ? id : undefined;
}
