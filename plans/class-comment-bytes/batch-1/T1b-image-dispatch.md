# T1b: comment only where the upstream image comments (D1)

**Writes:** `src/diagrams/class/renderer-group.ts` (the predicate), `src/diagrams/class/renderer-leaf.ts`
(`renderClassifierLeaf`), unit tests beside them (`grep -rln "wrapEntity\|renderClassifierLeaf" tests/unit`).
**Reads:** `svek/GeneralImageBuilder.java:100-245`, `EntityImageClass.java:141-142`, `EntityImageObject.java:159-210`,
`EntityImageMap.java:151-215`, `EntityImageJson.java:153-210`, `EntityImageState.java`, `EntityImageDescription.java:295`.

## Steps

1. Read the dispatch and list, per `LeafType`, which image it builds and whether that image writes a comment. Map our
   classifier kinds (`kind`, `stateLeaf`, `folderTab`, USymbol, `assoc-circle`, `association`, `lollipop`, note) onto
   those leaf types. Journal the table.
2. Red: a unit test for `vozomu-86-rodo657` (`object toto1` + implicit class `toto2`): comments are exactly
   `<!--class toto2-->` then the link comment. Another for a `map`, a `json` and `togixe-65`'s `state state`.
3. Green: the predicate (D1) and `withComment: predicate(classifier) === 'class'` at `renderer-leaf.ts:139-141`. Check
   the USymbol path still writes `entity` for exactly the kinds `GeneralImageBuilder` sends to `EntityImageDescription`.
4. Measure. Expect bucket C (89 rows) to empty. Remove those entries from both open lists.

## Acceptance
- Given `vozomu-86-rodo657`, when rendered, then the comment sequence equals its golden's.
- Given every `svg-object` pin, when the ratchet runs, then no row is in the open list for D1.
- Given any pin that was comment-equal at T0, when the ratchet runs, then it is still equal.

Observability is N/A. Rollback is Reversible.
