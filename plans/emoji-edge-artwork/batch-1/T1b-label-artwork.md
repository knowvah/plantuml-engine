# T1b: the label draws the emoji artwork (D1)

**Writes:** `src/core/creole-atoms.ts`, `src/core/creole-atoms-image-resolver.ts`,
`src/core/svek/image/EntityImageDescriptionTextBlock.ts`, `tests/unit/description/c4dd-t1b-text-atoms.test.ts`, a unit
test beside the resolver or the text block (find them with `grep -rln "makeAtomImageResolverFor\|buildTextBlock"
tests/unit`), the gate.
**Reads:** `EntityImageDescriptionEmoji.ts`, `EntityImageDescriptionDelegates.ts:200-300`, `internal-emoji-store.ts`,
`AtomEmoji.java`, `Emoji.java`.

## Steps

1. **Red.**
   - In `c4dd-t1b-text-atoms.test.ts`, render every row with `{ assetStore: buildEmojiAssetsStore() }` (the
     `jarFixtureDiffs` third argument). Empty `PENDING` and delete it, and set the collected count to 7.
     `emoji-mixed-edge` now fails with 1 diff.
   - Add a unit test: `makeAtomImageResolverFor(registry with an emoji store)(font).emojiArtwork?.(<rocket codepoint>)`
     returns the stored SVG, and it is `undefined` with no store. Drawing `buildTextBlock('a <:rocket:>', …, resolver)`
     emits the artwork's primitives, so assert a `fill` from the oracle's emoji group, not a `<text>`.
2. **Green.** Make the three D1 changes in `decisions.md`. Do the `y` check D1 names before you fold the glyph fallback
   into `drawEmojiAtom`, and journal what you found.
3. **Exposed mechanisms.** The artwork changes the ink that `LimitFinder` and `Footprint` collect. Grep for
   `buildTextBlock` sizer sites that now receive `emojiArtwork` (`EntityImageDescriptionName.ts:194`, the stereotype
   block at `EntityImageDescriptionDelegates.ts:499`, `renderer-cluster.ts:182`). Every gate row and survey row that
   moves is either towards the jar, or a stop 1.
4. **Measure** (task contract step 5), including the `class` survey: class sites hold registry resolvers too.
5. **Pin** `desc-edge-emoji-only` as `ZERO`. `issue-150` is pinned by the c4dd test from step 1.

## Acceptance
- Given `emoji-mixed-edge.puml` and the emoji store, when the c4dd gate runs, then it reports 0 diffs and the gate
  collects 7 rows with no `PENDING` set.
- Given `desc-edge-emoji-only`, when the authored gate runs, then it reports 0 diffs.
- Given no asset store, when any gate row renders, then its SVG is byte-identical to the base (check one with
  `git stash` on `src/`, or compare against a base render saved before the change).
- Given the every-engine survey, when `verdict-diff.mjs <base>` runs, then it reports 0 lost.

Observability is N/A. Rollback is Reversible.
