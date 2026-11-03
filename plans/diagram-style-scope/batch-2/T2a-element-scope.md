# T2a — element colours through the StyleBuilder (D1, D1a, D2, D2a, D3, D3a, D5, D5a)

Agent: typescript-pro (opus, effort high), worktree `dss-T2a`. Include [../task-contract.md](../task-contract.md).
Commit: `fix(core): read element colours through the style engine (T2a)`.

## Context
Measured: `<x>Diagram`, `root` and `element { BackgroundColor | LineColor | FontColor }` stop short of entities and notes.
`measurements/reader-audit.md` holds each element's signature. `elements[sname]` is read first by
`theme-element-resolve.ts:126-127`; stereotypes and inline colours are already above it.

## Task
1. New `src/core/style-element-scope.ts`: the signature table from the audit, each row with its Java `file:line`, and
   `elementScopeColors` applying D3 and D3a: only under the gate; a value differing from the default-skin builder's for that signature, or any value
   where the flat path already holds that bucket's role. A second signature on one sname gets its own key (D2a: `group.<symbol>`, note on link, state choice vs history).
2. `buildTheme` merges them into `theme.colors.elements`, after segments, before Stage 4. One builder per document: reuse T1a's.
3. D5, D5a: `collectElementStyleBuckets` takes the diagram type and stops collapsing a prefix foreign to the bucket's signature, for background, border and font.
   `clusterBackground` and `clusterBorder` read the `group.<symbol>` key first (D2a); the audit's description sites 2 and 3 are yours, not T3a's.
4. D6's catch applies here too.

## Measure
`diff-row.mts --all` before and after; every `cascade`, `element-order` and bucket-leak mover named. Report per engine what
remains: that is Batch 3's input.

## Write-set
`src/core/style-element-scope.ts`, `src/core/build-theme.ts`, `src/core/style-map-element.ts`, `src/core/theme-element-resolve.ts`,
`src/core/style-map-theme.ts`, `src/diagrams/description/renderer-cluster.ts`, new `tests/unit/core/style-element-scope.test.ts`, their existing unit tests, `docs/catalog.md`.

## Read-set
[../decisions.md](../decisions.md), `plans/diagram-style-scope/measurements/reader-audit.md`, `src/core/theme-element-resolve.ts:110-145`,
`src/core/style-map-element.ts:140-185`, `src/core/style-cascade-class.ts:294-330`, `src/core/document-back-color.ts`.

## Acceptance
- Given `component__cascade-bg-diag`, then the entity fills match the jar.
- Given `component/foboxa-33-menu312`, `nibige-54-voki590`, `zosuje-43-zebi775`, then conformant held (D2a).
- Given `class__scope-note-objectdiagram` and `state__scope-state-classdiagram`, then 0 diffs.
- Given a stereotype or inline colour over a `<style>` value, then it still wins (unit test citing the Java).
- Given a source with empty `preprocessed.styles` and unset `preprocessed.skin`, then bytes are identical (byte check).

Observability: N/A. Rollback: Reversible.
