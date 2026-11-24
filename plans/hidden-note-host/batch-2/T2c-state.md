# T2c: state

**Goal:** a state note takes its hidden flag from its single-link host, as `CucaDiagram#isHidden` does
(`CucaDiagram.java:778-794`, `:835-853`, D1), and a hidden note draws nothing (`SvekResult.java:82-90`).

## Rows this task owns (README table)

`hnh-state-hide-host`, `hnh-state-multiline-note`, `hnh-state-two-notes`. Target 0 diffs. `hnh-state-two-notes`
keeps its comment mismatch, the note's link name (I6); its reason then names I6's number.
`hnh-state-hide-lone-note` and `hnh-state-remove-host` must stay at 0.

## Steps

1. **Red:** `tests/unit/state/hidden-note-delegation.test.ts`. Assert that `computeHiddenIds` returns exactly
   `{B, <note id>}` for `note right of B` + `hide B`, `{N}` for a lone `note "alone" as N` + `hide N`, and `{}` for
   `note right of B` + `hide <note id>` while `B` is visible. Upstream delegates first, so the note's own rule is never
   read.
2. **The delegation.** `state-directives.ts#applyingIds` serves both `computeRemovedIds` and `computeHiddenIds`.
   Add `isNoteWithSingleLinkAttachedTo` over `collectVisibleLinks(ast)` (`:110-125`, whose note connectors are the
   `note.target` links). A delegated note takes the host's **own** fold, before any parent cascade, then the existing
   fold for the rest. Keep `isHidden`'s `other !== leaf` guard and omit it for removal, as upstream does
   (`:778-812`). `filterRemovedEntities` already drops a note whose target is removed (`:236-239`). Leave that, unless
   the helper makes it redundant and no row moves.
3. **The draw.** State notes are `StateNodeGeo`s (`renderer.ts:320`), so `markHidden` (`state-hidden.ts:51-61`) marks
   a hidden note id like any node, and the renderer skips it (`renderer.ts:249-251`, `:298`). Confirm on
   `hnh-state-hide-host` that the opale note (`renderStateNoteOpale`) and the flat-note path (`buildFlatNoteGeos`,
   `renderer-note.ts:195`) both go through that skip. If a path draws notes outside the node walk, add the same test
   there, citing `SvekResult.java:85`.
4. **Measure** (contract step 5), then the state survey and the state golden ratchet. Pin the rows (contract step 6).

## Read-set
`state-directives.ts`, `state-hidden.ts`, `layout.ts:440-465`, `renderer.ts:240-330`, `renderer-note.ts:150-460`,
`ast-notes.ts`.

## Write-set
`state-directives.ts`, `state-hidden.ts` and `renderer.ts` or `renderer-note.ts` if step 3 needs it,
`tests/unit/state/hidden-note-delegation.test.ts`, the gate.

## Acceptance
- Given `hnh-state-hide-host`, when it renders, then it has 0 diffs and its only comment is `link A to B`.
- Given `hnh-state-two-notes`, then neither note on `B` is drawn, "on A" is, and the diff count is 0.
- Given the state survey against `<base>`, then 0 rows are lost.

Observability is N/A. Rollback is Reversible.
