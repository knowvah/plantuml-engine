# hidden-note-host (hnh) — observations, 2026-11-23

## Observation: a member tip folds its own hide rules in the jar
- **Context**: T2a push-forward probes for #204.
- **Finding**: with `hide *` and `show A`, the jar hides a tip on `A::m()` while drawing `A`
  (`hnh-tips-hide-star-show-host`). A `TIPS` leaf is never delegated to its host
  (`CucaDiagram.java:836-837`), but `CucaDiagram#isHidden` still folds its own `hides2`, and `*` matches it.
  The port draws it. Left open under #277 (`needs-ruling`) because the brief said never to set `hidden` on a tips geo.
- **Impact**: whoever settles #277 can carry `computeHiddenIds`' verdict onto a `'tips'` geo in
  `note-hidden.ts#markHiddenNotes` and skip it in `renderOneNote`'s tips branch.
- **Confidence**: High (jar oracle in `tests/fixtures/hidden-note-host/`).

## Observation: description `-[hidden]-` is Link.hidden, never an invisible LinkType
- **Context**: T2b, porting `isNoteWithSingleLinkAttachedTo`.
- **Finding**: `CommandLinkElement.java:359` sends the arrow style to `WithLinkType#applyStyle`, and `hidden` there is
  `goHidden()` (`WithLinkType.java:100-101,149-150`). Every upstream test that skips `getType().isInvisible()`
  (`isNoteWithSingleLinkAttachedTo`, `Entity#isAloneAndUnlinked`) therefore counts a `-[hidden]-` link. Our
  `markUnlinked` and the note removal cascade used to skip it. `description-elk-adapter.ts#linkTypeOf` still maps
  `link.hidden` to `LinkStyle.INVISIBLE()`, which is the same mix-up on the ELK path (no row measured against it yet).
- **Impact**: any new description code that asks "is this link invisible" must not read `DescriptiveLink.hidden`.
- **Confidence**: High for dot (jar probes `hnh-desc-hidden-link-remove`, `hnh-desc-remove-unlinked-hidden-link`);
  Medium for the ELK adapter mapping (read, not measured).

## Observation: a delegated note ignores its own remove/show
- **Context**: T2b probes.
- **Finding**: `CucaDiagram#isRemoved` returns `isRemoved(other)` before folding the note's own `removed` list, so
  `remove N` on a single-link note with a visible host keeps it (`hnh-desc-remove-note-name`), and `show N` does not
  undo a hidden host (`hnh-desc-show-note-hidden-host`).
- **Impact**: description `effectiveRemovedIds` now drops the parse-time `removed` marker for a delegated note.
- **Confidence**: High (jar oracles).

## Observation: compareSvg diff counts can rise when a row gets closer
- **Context**: T2a, `hnh-smetana-hide-host`.
- **Finding**: removing the extra note `<g>` raised the diff count 16 -> 86 while the score fell 95 -> 86. Before,
  the note paired against class A's group and two `[childCount]` diffs (`compare.ts:534-549`) hid A's coordinates;
  afterwards each Smetana-vs-dot coordinate counts on its own.
- **Impact**: a rising diff count on a Smetana or geometry-only row is not by itself a regression; read the diffs.
- **Confidence**: High.

## Observation: survey timeouts under load hit the first concurrency batch
- **Context**: component survey at load 24-40.
- **Finding**: six `conformant -> timeout` rows, exactly the first six slugs alphabetically; a rerun at load 14 gave 0.
  The every-engine `npm run svg:survey` took more than 20 minutes at load 12-40.
- **Impact**: rerun before calling a timeout a finding; budget 25+ minutes for a full survey in a loaded session.
- **Confidence**: High.
