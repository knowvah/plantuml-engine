# T1a: `DOT_ENGINE_VERSION`, `testdot`, `keydistributor`

**Decisions:** D1, D2, D4, D5 (`testdot`, `keydistributor`), D7.

## Read first

- `PSystemVersionFactory.java:58-66`; `PSystemVersion.java:69-89`, `:234-258`; `GraphvizUtils.java:83-158`.
- Ours: `src/core/version.ts`; `src/diagrams/version/PSystemVersion.ts:54-61` (`LAYOUT_ENGINE`), `:146-181`
  (`addDotStatus`, the `version` page's arm, which stays as it is, D7); `PSystemVersionFactory.ts:20-49`;
  `LicenseInfo.ts:182-188` (`retrieveDistributor` is `undefined`).
- `tests/unit/core/version.test.ts`; `tests/unit/version/PSystemVersion.test.ts`, `PSystemVersionFactory.test.ts`.

## Do

1. **`DOT_ENGINE_VERSION`** (D4): export it from `src/core/version.ts` with JSDoc citing `GraphvizUtils.java:126`
   and ruling 2. Red first: in `version.test.ts`, assert it equals
   `node_modules/@knowvah/dot-engine/package.json#version`, and the version parsed from
   `package.json#dependencies['@knowvah/dot-engine']` (`/dot-engine-(\d+\.\d+\.\d+)\.tgz$/`).
2. **`createTestDot`** (java:234-240): `fullDescription()`, then the executable arm's version line. Name the helper
   for what it ports (for example `addDotVersionStatus`, citing `GraphvizUtils.java:122-127`), and cite in its JSDoc
   what rulings 2-4 drop: java:111-119 (INSECURE-only lines), :129-136 (ruling 3), :137-145 (ruling 4), :151-154
   (`ExeState`, no executable). `withImage = false`. Do not call `renderSvg` from this path.
3. **`createKeyDistributor`** (java:242-258): `retrieveDistributor()` is `undefined`, so the page is
   `["No license found"]` with no image. The licence branch (java:249-256) is cited, not ported (D3). The private
   image constructor (java:83-89) is not needed: with `im = null` it equals `withImage = false`; say so in JSDoc.
4. **Factory:** add `TESTDOT` and `KEYDISTRIBUTOR` regexes (java:62, :65) after `STDLIB`, in upstream's order, each
   with its `@see`. Remove "`testdot` ... out by decisions.md D8" from the header for these two, leaving the key-tool
   lines until T1b/T1c.
5. **Header JSDoc of `PSystemVersion.ts`:** replace the "Not ported: `createTestDot`, `createKeyDistributor`..." item
   (`:19-20`) with what is true now, citing #182. Update `:166`'s "-testdot ... not ported" if it is no longer true.
6. Tests: the factory claims `testdot`, `TESTDOT  ` (trailing spaces), `keydistributor`; each page's `getLines()` in
   order; `testdot` has no image and its line 2 is `<b>@knowvah/dot-engine</b> ""${DOT_ENGINE_VERSION}""`.

## Acceptance
- Given `@startuml\ntestdot\n@enduml`, when rendered, then the lines are `fullDescription()` and
  `<b>@knowvah/dot-engine</b> ""2.12.3""`, and the SVG has no `<image>`.
- Given `@startuml\nkeydistributor\n@enduml`, when rendered, then the only line is `No license found` and there is no
  `<image>`.
- Given a `package.json` whose dot-engine tarball is not `DOT_ENGINE_VERSION`, when `version.test.ts` runs, then it
  fails.
- Given `@startuml\nversion\n@enduml`, when rendered, then its lines are unchanged from `<base>` (D7).

Observability: N/A, no new observable operations. Rollback: Reversible.
