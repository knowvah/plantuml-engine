# T2d: an OpenIconic inside a url label

**Row:** `tupema-84-tako461` (2 diffs). The jar wraps the `<&link-intact>` glyph of messages 1 and 2 (both inside
`[[http://www.google.com ...]]`) in an `<a>`; we draw a bare `<path>`. Message 3 has no url and already matches.

## Java to read

- `klimt/creole/legacy/AtomTextUtils.java:70-135`: a url's label goes through `createAtomTextForUrl`, which splits it
  on OpenIconic, sprite, img and emoji patterns (`:93-94`), and builds `AtomOpenIconic(null, scale, openIcon,
  fontConfiguration, url)` (`:117`). The text pieces become `AtomText(..., url, ...)`.
- `klimt/creole/atom/AtomOpenIconic.java:55-84`: `drawU` calls `ug.startUrl(url)` before the glyph and `closeUrl()`
  after (`:77-82`).
- Where a sequence message label reaches the creole parser, to confirm it takes this path.

## Steps

1. The port's `AtomOpenIconic.ts:100-101` says the url "is always `null` from `addOpenIcon`". That is true of
   `StripeSimple.java:242`, not of `AtomTextUtils.java:117`. Confirm which creole implementation the sequence label
   uses (`src/core/klimt/creole/` or `src/core/creole-atoms*.ts`; `sequence-creole-sheet.ts`), and quote it.
2. Red: assert the jar's `<a>` element (its attributes, from `in.svg`) around each glyph.
3. Carry the url into the atom and wrap the draw, as upstream does. Do the same for the sprite and img branches only
   if the port has the same gap there (`:120-131`); do not add an emoji branch, which upstream throws on (`:110-111`).
4. Pin the row.
5. This creole path is shared. The batch-close survey is the guard: list every row in every engine that moved, and
   quote the mechanism for each.

## Acceptance
- Given `tupema-84-tako461`, then it is at 0 diffs and pinned.
- Given the every-engine survey at batch close, then no row lost conformance, and every moved row is journalled.

Observability is N/A: there are no new observable operations. Rollback is Reversible.
