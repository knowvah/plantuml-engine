## Observation: the resolver's emojiArtwork reaches buildTextBlock only; descAtomOps sites still read an explicit param
- **Context**: eea T1b (#150), authoring a `note on link` emoji probe.
- **Finding**: `AtomImageResolver.emojiArtwork` (set by `makeAtomImageResolverFor` from `registry.emoji`) is read only by `drawAtoms` (`EntityImageDescriptionTextBlock.ts`). Every `descAtomOps(resolver, emojiArtwork)` caller still needs its own second argument: `buildNoteBody` (`leaf-sizing.ts`) and `buildClusterTitle` (via `renderer-cluster.ts`) pass none, so description notes and group titles draw the glyph even with a store (#202, #200).
- **Impact**: when fixing an emoji site that goes through `buildDesc`/`descAtomOps`, check both the sizer and the drawer for the second argument; `resolveAtomImage?.emojiArtwork` is the same table, so it is the natural source.
- **Confidence**: High (probes `desc-note-emoji`, `desc-edge-emoji-note` at 9 diffs with `XX` controls at 0).

## Observation: a `note on link` in the description renderer is built with no sprite registry
- **Context**: same probe.
- **Finding**: `renderer-edge.ts:205` calls `buildLinkNoteBlock(text, theme, undefined, color)`; `renderer-cluster-note.ts:26` passes the registry. A sprite in a description link note therefore resolves nothing at draw time.
- **Impact**: part of #202; a sprite probe on a link note would show it.
- **Confidence**: High (read).
