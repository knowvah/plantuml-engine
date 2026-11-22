# T1b: `PSystemKeygen`; `keygen` and `keyimport [key]`

**Decisions:** D1, D2, D3, D5 (`keygen`).

## Read first

- `PSystemVersionFactory.java:68-76`; `PSystemKeygen.java` in full (`getTextBlock` :47-76, `getFlashTextBlock`
  :78-137, `header` :143-152, `getDescription` :139-141).
- Ours: `src/diagrams/version/PSystemLicense.ts` (the `UgSimpleDiagram` text-page form, including its note on the
  `getTextBlock` name collision), `src/core/UgSimpleDiagram.ts:15-25`, `PSystemVersion.ts:119-131`
  (`getAuthorsStrings`'s header line), `License.ts:184-192`, `src/core/flashcode/FlashCodeFactory.ts`.

## Do

1. Create `src/diagrams/version/PSystemKeygen.ts`: `class PSystemKeygen extends UgSimpleDiagram`, constructor
   `(source, key, preprocessing)` keeping `key` (java:32-35), `getDescription()` `"(Key)"`, `calculateDimension` and
   `drawU` through upstream's private `getTextBlock()`. That name collides with `UgDiagram#getTextBlock(num,
   stringBounder)`, so follow `PSystemLicense.ts`: a module function, documented.
2. `getTextBlock()` reaches only `getFlashTextBlock(installed)` here (D3): cite java:48-49 and the valid-key branch
   java:52-75 as unreachable (`retrieveNamed(key)` is `NONE`: no `PLSSignature`). Do not add `retrieveNamed` or
   `persistMe` to `LicenseInfo.ts`.
3. `getFlashTextBlock`: `header()` plus D5's lines 4-5, as one `GraphicStrings.createBlackOnWhite`. Cite java:84-94
   (QR: `FlashCodeUtilsNone` in the MIT edition, payload needs `PLSSignature.signature()`) and java:96-103
   (installed-licence footer, `retrieveNamedSlow()` is `NONE`). Line 5 takes the licence name from
   `License.getCurrent().toString()`.
4. Private `header()` (java:143-152) with this port's version line, as `getAuthorsStrings` writes it.
5. Factory: `KEYGEN` (java:68) and `KEYIMPORT` (`keyimport(\s+[0-9a-z]+)?`, java:72) after `KEYDISTRIBUTOR`.
   `keyimport` trims the line and passes `line.trim().substring('keyimport'.length).trim()` (java:73-74).
6. Tests (`tests/unit/version/PSystemKeygen.test.ts` + factory cases): `keygen`, `KEYGEN`, `keyimport`,
   `keyimport abc123`, `keyimport ABC123` all draw the same lines; `keyimport a-b` is refused (factory answers
   `undefined`); no `<image>`; description `(Key)`.

## Acceptance
- Given `@startuml\nkeygen\n@enduml`, when rendered, then the lines are D5's five `keygen` lines in order and there is
  no `<image>`.
- Given `keyimport` with no key, with `abc123`, or with `ABC123`, when rendered, then each page equals the `keygen`
  page.
- Given `keyimport a-b`, when the factory runs, then it answers `undefined`.

Observability: N/A, no new observable operations. Rollback: Reversible.
