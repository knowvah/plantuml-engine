# T2a: class and object

**Goal:** a class or object `NOTE` leaf draws nothing when its hidden flag is set, as `SvekResult#drawU` draws it
under `UHidden` (`svek/SvekResult.java:82-90`). The flag is the one `computeHiddenIds` already computes with the
single-link delegation (`class-directives-removal.ts:336-349`, `CucaDiagram.java:778-794`, D1). A `TIPS` leaf keeps
drawing (D2).

## Rows this task owns (README table)

`hnh-hide-host`, `hnh-hide-by-tag`, `hnh-hide-by-stereotype`, `hnh-floating-note`, `hnh-multiline-note`,
`hnh-two-notes`, `hnh-object-host`, `hnh-hide-lone-note`, `hnh-hide-unlinked-note`, `hnh-hide-note-two-links`,
`hnh-smetana-hide-host`. Target 0 for each, except `hnh-smetana-hide-host`, whose leftover geometry gets the
2026-08-09 Smetana reason once nothing but numbers is left.

## Steps

1. **Red:** `tests/unit/class/hidden-note-draw.test.ts`. Parse, lay out and render the issue's source through the
   class pipeline. Assert that the SVG holds no `data-qualified-name="__note_0"` group and no text "a note", and that
   the comment list is `['class A', 'class B', 'link A to B']`. Add one case each for `hide N` on a lone note, and for
   a tip on a hidden host, which must still draw "a tip".
2. **Carry the flag to the note geo.** Find where a `NoteGeo` is built from a `ClassNote` (`note-layout.ts`,
   `note-opale.ts`, `note-freestanding.ts`; `NoteGeo` is in `note-layout-types.ts:39`). Set an optional
   `hidden?: true` from the same `hiddenIds` set `buildClassifierGeos` reads (`class-geo-builders.ts:141`), with a
   doc comment citing `CucaDiagram.java:778-794`. Never set it on a `'tips'` geo.
3. **Draw.** In `renderClassLeaf` (`renderer-leaf.ts:172-180`), a hidden note pushes no entity markup. Keep its uid:
   the jar numbers it (`SvekResult` draws every node, hidden ones included). Check `renderer-uid.ts` and confirm that
   no uid shifts on `hnh-hide-host`.
4. **The connector.**
   - An opale connector is part of the note's image (`EntityImageNote.java:225-260`), so it goes with the note.
   - A plain connector is a `Link` (`renderer-note-connector.ts`), so it draws as its comment only when either end is
     hidden (`Link.java:458-459`, `hiddenLinkMarkup`). Add the note's own flag to the endpoint test
     (`renderer.ts:246`, `hiddenClassifierIds`). `hnh-hide-note-two-links` needs this: the note is hidden by its own
     fold, and the jar writes `link N to A`, `link N to B`, nothing else.
5. **Comments.** Rewrite D5 at `renderer-leaf.ts:165-170`, `renderer.ts:200-205` and `renderer-note-dispatch.ts:55-59`
   to state the jar's rule (D2). Update `class-comment-bytes.authored.test.ts:57-58`: the
   `hidden-class-with-note` comment drops "its note is drawn where the jar hides it, #204".
6. **Measure** (contract step 5), then the class and object surveys and `class-comment-bytes`. Pin the rows (contract
   step 6).

## Read-set
`class-directives-removal.ts:286-430`, `class-geo-builders.ts`, `layout.ts:300-325`, `class-leaf-geo.ts`,
`note-layout-types.ts`, `renderer.ts`, `renderer-leaf.ts`, `renderer-note-dispatch.ts`, `renderer-note-connector.ts`,
`renderer-uid.ts`; upstream `SvekResult.java:70-101`, `EntityImageNote.java:225-290`.

## Write-set
The class files above, `tests/unit/class/hidden-note-draw.test.ts`, the gate, `class-comment-bytes.authored.test.ts`.

## Acceptance
- Given `hnh-hide-host`, when it renders, then it has 0 diffs and its comments are `class A`, `class B`,
  `link A to B`.
- Given `hnh-tips-on-member`, then it stays at 0 and draws "a tip".
- Given `hnh-hide-note-name` and `hnh-host-in-hidden-package` (the jar draws the note), then both stay at 0.
- Given the class and object surveys against `<base>`, then 0 rows are lost.

Observability is N/A. Rollback is Reversible.
