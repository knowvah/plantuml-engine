# T5: sprite/assetStore measurement; `aws` v1 ruling issue

**Writes:** `plans/playground-stdlib/followups.md` (new), `tests/e2e/playground-stdlib.spec.ts` (the fixme's issue
number).
**Reads:** decisions.md D1, D5; `src/core/render-options.ts:40-60`, `src/core/asset-store.ts`,
`src/core/internal-sprite-store.ts:1-60`, `src/core/remote-image-prefetch.ts`; `packages/sprites-archimate/index.d.ts`,
`packages/emoji/index.d.ts`.

## Task

1. **Sprites (issue step 4, D5).** Pick three fixtures, preferring upstream or corpus ones (`grep -rl` in `tests/corpus/`
   and `~/git/pdiff/`): one using a jar-internal archimate sprite (`<$archimate/…>`), one using the `archimate` stdlib
   bundle's macros, and one with an emoji (`<:1f600:>`).
   - Render each with the oracle, and in vitest with `render(src, { stdlibRegistry: playgroundRegistry('/') })` and no
     `assetStore` (the playground's path).
   - Compare with `compareSvg`, as the issue did, and journal the diff counts and the first differing attribute.
   - If the playground path differs where the jar draws artwork, draft a follow-up issue in `followups.md`: title,
     symptom, the measured diffs, and why it is new `src/` API (D5).
2. **`aws` v1 ruling.** File it with
   `gh issue create --label needs-ruling --title "Ruling needed: publish the legacy aws v1 stdlib bundle (playground #172 repro)"`.
   The body quotes si5b D2's deferral, gives the bundle size (`du -sh assets/stdlib/aws`, file count from
   `assets/stdlib.manifest.json`), the license verdict (`planning/s4-stdlib-audit.md:125`), the 5 fixtures, and the two
   options: package it as a remote manifest like awslib14, or keep it deferred.
   Put the issue number into T1's `test.fixme` comment.
3. Also file the sprite follow-up from step 1, if one was drafted, without queue labels. Record both numbers in
   `followups.md` and the journal.

## Acceptance
- Given the three fixtures, when measured, then the journal holds an oracle-vs-playground diff count for each, and the
  D5 verdict (needed / not needed).
- Given the filed ruling issue, then T1's fixme names its number, and `followups.md` links it.

Commit: `docs(ps): record the playground sprite measurement and rulings`, with `Refs: #172`.
Observability is N/A. Rollback is Reversible.
