# T3d: URLs on a link label and on a description entity

**Rows:** `volode-59-safa575`, `lolovi-23-loji748`.

- `volode`: `Car -- Wheel : [[http://google.com test]]`. The jar's label text sits inside an `<a>` (the comparator
  reports text node `a` / `text`), and the page is 93 wide, against our 198.
- `lolovi`: `component MyComponent [[http://www.google.com]] [ … ]` inside `package MyPackage { }`. The jar's entity
  group has 1 child (an `<a>` holding the shapes), and ours has 7.

## Lead (verify before acting)

- **Link label:** read how the jar draws a link label whose display is a URL (`Display` / `Url` on `Link`,
  `AtomTextUtils.createAtomTextForUrl`, `startUrl`/`closeUrl`). The width gap suggests we measure the raw
  `[[http://google.com test]]` text, not `test`. sogr T2d ported the OpenIconic-in-URL case. Check what it reused.
- **Entity URL:** read `EntityImageDescription#drawU` for `ug.startUrl(url)` / `closeUrl`. Check whether description
  already wraps it (if so, reuse that), and why the class engine's description-entity path does not.

## Acceptance
- Given each row, when it is measured, then `n=0`.
- Given unit tests in `tests/unit/class/cogr-T3d.test.ts`, then the `<a>` wrappers and `volode`'s label width match
  the oracle.

Observability is N/A. Rollback is Reversible.
