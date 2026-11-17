# class-comment-bytes (ccb, #151)

## Observation: a hidden link still consumes its link id
- **Context**: T1c, writing the comment of a `-[hidden]-` link or a link to a hidden class.
- **Finding**: `SvekEdge#drawU` returns early only for `opale` and `isInvis` (`SvekEdge.java:833-837`), so a hidden
  link reaches `uniq(ids, link.idCommentForSvg())` (`:944`) under `UHidden`. A later visible link between the same
  ends gets the `-1` suffix (jar probe `tests/fixtures/class-comment-bytes/hidden-link-shared-id`: `id="A-B-1"`).
  `renderer-edge.ts#hiddenLinkMarkup` calls `linkIdForSvg` for that reason.
- **Impact**: any change that skips a hidden edge before id assignment moves the `-N` suffixes of later links.
- **Confidence**: High

## Observation: our name lookup recomputes quark names with the current separator
- **Context**: push-forward probes with `set namespaceSeparator` changed mid-diagram.
- **Finding**: `Plasma` keys `countByName`/`firstWithName` by the name a quark registered with (`Plasma.java:63-108`).
  `class-namespace-resolve.ts#leafName` splits the id with the separator active at lookup, so a name declared before
  the change resolves differently from the jar (extra or missing leaf). Filed #203. `Classifier.quarkName` (ccb T1d)
  carries the creation-time name.
- **Impact**: a fix should read `quarkName` in `countByName`/`firstWithName`; watch `set separator none` rows such as
  `momoba-92-bole393`, where the id and the quark name differ.
- **Confidence**: High (mechanism read; the fix itself is unmeasured)

## Observation: a note with one link is hidden with its host
- **Context**: push-forward probe `hidden-class-with-note`.
- **Finding**: `CucaDiagram#isHidden` gives a NOTE with exactly one visible link the hidden flag of the other end
  (`CucaDiagram.java:769-776`, `isNoteWithSingleLinkAttachedTo` at `:799-819`); `isRemoved` has the same rule. Our
  class engine's D5 rule (`renderer-leaf.ts:165-170`) draws every note regardless. Filed #204.
- **Impact**: the "UHidden wraps only the host" comments in `renderer.ts`, `renderer-leaf.ts` and
  `renderer-note-dispatch.ts` are wrong for single-link notes.
- **Confidence**: High
