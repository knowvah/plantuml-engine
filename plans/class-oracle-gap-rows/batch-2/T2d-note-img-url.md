# T2d: a missing image inside a note's URL label

**Rows:** `bejuve-37-furu333`, `robuji-68-rise413`.

```
component "compA" as compA {
}
note right of compA: [[http://google.fr <img:foo.webp{scale=2}>]]
```

(`robuji` adds a `{a nice toolip}` and `HelloWorld.png`.) The jar's first drawn group is the note (`ent0003`). Its text
is `(Cannot decode)` in `monospace`, 104.213 wide, and the page is 265 wide. Ours draws `compA` first and the page is
104 wide.

## Lead (verify before acting)

- **Text:** `AtomImg.java:176-206` returns `AtomTextUtils.createLegacy("(Cannot decode)", fc)` for an image it cannot
  read. `src/core/creole-atoms.ts:111,325,389` already models `(Cannot decode)` for some forms: find why the
  `[[url <img:…>]]` label form does not reach it. Read `AtomTextUtils.createAtomTextForUrl` too.
- **Order:** `compA` is an empty group, so after T2b it is a muted leaf printed by `printGroups`. Re-measure after
  T2b before chasing the draw order separately.

## Acceptance
- Given each row, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T2d.test.ts`, then it asserts the `(Cannot decode)` text, its
  `font-family="monospace"` and its `textLength`.

Observability is N/A. Rollback is Reversible.
