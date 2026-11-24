# T2b: description

**Goal:** the description engine's hidden set and removed set take a note's flag from its single-link host, as
`CucaDiagram#isHidden` and `#isRemoved` do (`CucaDiagram.java:778-812`, `isNoteWithSingleLinkAttachedTo` `:835-853`,
D1). This covers component, usecase and actor diagrams, and the description ELK adapter's link test.

## Rows this task owns (README table)

`hnh-desc-hide-host`, `hnh-uc-hide-host`, `hnh-desc-actor-host`, `hnh-desc-floating-note`,
`hnh-desc-hide-by-stereotype`, `hnh-desc-two-notes`, `hnh-desc-hide-note-name`, `hnh-desc-elk-hide-note-name`,
`hnh-desc-hidden-link-remove`. Target 0 diffs. Six of them keep 1 comment mismatch, the hidden-entity comment (I3);
their reasons then name I3's number. `hnh-desc-elk-hide-host` and `hnh-desc-hide-lone-note` must stay at 0.

## Steps

1. **Red:** `tests/unit/description/hidden-note-delegation.test.ts`. Assert the exact id sets for parsed sources:
   - `note right of B` + `hide B` gives `{B, <note id>}`;
   - `note "named" as N`, `N .. B`, `hide N` gives `{}` (N passes its flag to visible B);
   - `note "alone" as N` + `hide N` gives `{N}`;
   - `N -[hidden]- B`, `N .. A`, `remove A`: the removed set is `{A}` (N keeps two links).
2. **The helper.** Port `isNoteWithSingleLinkAttachedTo` into `element-grammar.ts` under that name. It returns the
   other end's id or `undefined`. Skip a link only when the upstream `link.getType().isInvisible()` would be true.
   Find the description link's equivalent (`description-elk-adapter.ts:139`, `:477-479` build it from the link
   style); a `-[hidden]-` link (`link.hidden`) counts.
3. **Hidden.** `effectiveHiddenIds(nodes, rules)` gains the links. For a `note` node, `other !== undefined && other
   !== id` means the note's flag is the host's **own** fold, without the host's parents (`isHidden(other)` is the
   diagram method). Otherwise the existing fold applies. The note's own parent walk still runs first
   (`Entity.java:434-446`). Update both callers (`layout.ts:228`, `description-elk-adapter.ts:538`).
4. **Removed.** Make the removal cascade (`element-grammar.ts:258-271`) use the same helper, so a `-[hidden]-` link
   counts. Upstream `isRemoved(other)` recurses, so keep the fixed point. Do not add the `other != leaf` guard: upstream
   `isRemoved` has none (`:796-812`).
5. **Measure** (contract step 5), then the component and usecase surveys and the description golden ratchet. Pin the
   rows (contract step 6).

## Read-set
`element-grammar.ts:200-345`, `layout.ts:220-240`, `description-elk-adapter.ts:130-145`, `:470-545`,
`layout-geo-post.ts:105-145`, the description AST's link type.

## Write-set
`element-grammar.ts`, `layout.ts`, `description-elk-adapter.ts`, `tests/unit/description/hidden-note-delegation.test.ts`,
the gate.

## Acceptance
- Given `hnh-desc-hide-host`, when it renders, then it has 0 diffs, and its one comment mismatch is the missing
  `entity B` (I3).
- Given `hnh-desc-hide-note-name`, then the note is drawn, with 0 diffs.
- Given `hnh-desc-hidden-link-remove`, then `N` is drawn and the comments include `link N to B`.
- Given the component and usecase surveys against `<base>`, then 0 rows are lost.

Observability is N/A. Rollback is Reversible.
