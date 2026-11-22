# Decisions (vkt)

## Auto-confirmed (unattended)

Every decision below was taken by the unattended planner on 2026-11-21. Each names the rejected options and the
evidence, so the maintainer can audit it. The maintainer's rulings on #182 (2026-11-13) are inputs, not decisions:
D2-D5 only apply them. The D5 texts are proposals for the morning report; per the issue they "don't stop the mission".

| # | Decision | Rejected |
|---|---|---|
| D1 | Six regexes, upstream's order, unchanged | the issue's five (omits one-arg `keycheck`) |
| D2 | Upstream classes: `createTestDot`/`createKeyDistributor` on `PSystemVersion`, new `PSystemKeygen`, `PSystemKeycheck` | one shared "key page" class |
| D3 | Port the reachable path only; cite every branch that cannot be reached here | port `PLSSignature` key decoding; port dead branches |
| D4 | `DOT_ENGINE_VERSION` constant in `core/version.ts`, drift-pinned by a test | no version; JSON import; build-time define |
| D5 | Line-by-line texts (table below) | — |
| D6 | Rows are authored utility fixtures; ledger ids `authored-utility/<slug>` | `svg-utility/<slug>` ids; no ledger entries |
| D7 | `version` page unchanged | apply rulings 2-4 to `version` too |
| D8 | No public API change; `dist/*.d.ts` byte-identical | — |

### D1: Six regexes, upstream's order, unchanged

`PSystemVersionFactory.java:62-87`, inside `if (!TeaVM.isTeaVM())` (java:58), which the port already reads as the
JVM arm (`PSystemVersionFactory.ts:31-35`): `testdot`, `keydistributor`, `keygen`, `keyimport(\s+[0-9a-z]+)?`,
`keycheck\s+([0-9a-z]+)\s+([0-9a-z]+)`, `keycheck\s+[0-9a-z]+`, each `(?i)^...\s*$`, built with the file's
existing `JAVA_SPACES` suffix. `keyimport` trims the line and takes the rest after `keyimport` as the key
(java:73-74); `keycheck` reads the two groups (java:78-81) or the one key (java:85).

**Evidence for six:** the jar renders `keycheck abc123` (planning probe: header, `Provided license information:`,
`No valid license found. ...`), and the port's own header already names "the one-argument `keycheck` of upstream
3a4d1675141". The issue's "five" counts commands, and `keycheck` is one command with two forms.

### D2: Upstream's classes

- `PSystemVersion.createTestDot` (java:234-240) and `createKeyDistributor` (java:242-258) in `PSystemVersion.ts`.
  Both build a page with no logo: `createTestDot` passes `withImage = false`; `createKeyDistributor` uses the private
  image constructor (java:83-89) with `im = null`, which is the same page, so it calls the existing constructor with
  `withImage = false` and says why.
- `PSystemKeygen` (`PSystemKeygen.java`) and `PSystemKeycheck` (`PSystemKeycheck.java`), each a `UgSimpleDiagram`
  with `getDescription()` `"(Key)"`, `calculateDimension`/`drawU` through `getTextBlock()`, and its own private
  `header()`. Upstream duplicates `header()` in both classes; the port mirrors that (CLAUDE.md: do not refactor while
  porting). `PSystemLicense.ts` is the in-repo form for a `UgSimpleDiagram` text page.
- **Rejected:** one shared key-page class. It would erase upstream's class boundary that 16 years of commits name.

### D3: Port the reachable path only

In this build every licence lookup answers `NONE` (`LicenseInfo.ts:6-12`), and the MIT edition the port mirrors has
no QR encoder (`FlashCodeFactory.ts`, `FlashCodeUtilsNone.exportFlashcode` returns `null`,
`FlashCodeUtilsNone.java:45-47`). So these upstream branches cannot run here, and are cited in JSDoc instead of
ported (ruling 3's "Don't port it as dead code" is the maintainer's stated preference):

- `PSystemKeygen.getTextBlock`'s valid-key branch (java:52-75: `persistMe`, `fileCandidates`, installed licence).
  `retrieveNamed(key)` needs `PLSSignature` and is `NONE` for every key here.
- `getFlashTextBlock`'s QR image (java:84-94) and installed-licence footer (java:96-103).
- `createKeyDistributor`'s licence branch (java:249-256): `retrieveDistributor()` is `undefined` here.
- `PSystemKeycheck.addDetails` (java:83-90): reached only for a non-`NONE` licence.
- `PSystemKeycheck.drawFlash` (java:103-131): private and never called upstream either.

`PSystemKeycheck` still calls `License.addLicenseInfo(strings, LicenseInfo.NONE)`. It adds nothing, but it keeps
upstream's line order where a later licence source would put its fields.

**Rejected: port `PLSSignature` key decoding.** `retrieveNamed(sig, key, false)` (`PLSSignature.java:178-188`) is a
pure function of its two arguments: base-36 `BigInteger`, RSA through `QBlock` and `Dedication.E/N`, an xor with
`PBKDF2WithHmacSHA1` (500 rounds, `SignatureUtils.java:102-111`) salted by `java.util.Random`. It is portable, but
the issue says "Don't invent a license store or a key check that doesn't exist". A decoder for PlantUML Professional
Edition keys would report licences that mean nothing for an MIT library. `signature()` (java:235-243) also needs the
host name and MAC addresses, which a browser library cannot read.

### D4: `DOT_ENGINE_VERSION` in `src/core/version.ts`

Ruling 2 prints `<b>@knowvah/dot-engine</b> ""<version>""` where upstream prints `<b>GraphViz</b> ""<version>""`
(`GraphvizUtils.java:126`). dot-engine 2.12.3 exports no version (`dist/index.d.ts`), and its `exports` map has no
`./package.json`. So the port declares `export const DOT_ENGINE_VERSION = '2.12.3'` beside `VERSION`, and a test in
`tests/unit/core/version.test.ts` pins it to `node_modules/@knowvah/dot-engine/package.json#version` and to the
version in `package.json#dependencies['@knowvah/dot-engine']` (a tarball URL ending `dot-engine-<v>.tgz`). This
follows the `VERSION` precedent, which is pinned to `package.json#version` the same way after it drifted
(ufp journal row 36). A dependency bump that forgets the constant then fails `npm test`.

- **Rejected: print no version.** It contradicts ruling 2's text.
- **Rejected: import the package's `package.json`.** The `exports` map forbids the subpath, and `src/` would ship
  a JSON module to browsers.
- **Rejected: a build-time define.** `src/` has no build-time substitution, and `core/version.ts` says why
  ("no ambient build state to read here").

### D5: Line-by-line text (auto-confirmed for maintainer review)

The header is the one `about` already prints, for the same reasons: `plantuml-engine version` (ruling 2026-10-08,
DIVERGENCES.md "Error pages print this port's version") and `License.getCurrent()` = `MIT` (D13 of
utility-factories-port). Rich-text tags are written as upstream writes them. Jar lines are the planning probes
(`scripts/oracle-render.sh`, one file per run, at the current pin).

**`testdot`** (`createTestDot`, java:234-240; `addDotStatus`'s executable arm, `GraphvizUtils.java:110-155`)

| # | Jar | Ours | Why |
|---|---|---|---|
| 1 | `PlantUML version $version$ / $git.commit.id$ [Unknown compile time]` | `fullDescription()`: `plantuml-engine version 0.2.0 / unknown [Unknown compile time]` | `Version.fullDescription()`; ours already exists (`core/version.ts`) |
| — | (INSECURE only) `The environment variable GRAPHVIZ_DOT ...`, `Dot executable is ...` (java:111-119) | dropped | no executable or environment variable; the jar's default profile prints neither |
| 2 | `<b>GraphViz</b> ""dot - graphviz version 16.1.1 (...)""` | `<b>@knowvah/dot-engine</b> ""2.12.3""` | ruling 2, D4 |
| — | `Warning : cannot determine dot version` / `... seems old` (java:130-136) | dropped | ruling 3 |
| 3 | `<b>Installation seems OK. File generation OK` | dropped | ruling 4 |
| — | `Error: ...` / `Error: only sequence diagrams will be generated` (java:151-154) | dropped | `ExeState` checks a file; the engine is a linked library, never missing |

**`keydistributor`** (`createKeyDistributor`, java:242-258): `No license found`, both sides. It is true here (no
distributor licence exists), so it stays jar-identical (D6).

**`keygen`, `keyimport`, `keyimport <key>`** (`PSystemKeygen.getFlashTextBlock`, java:78-137; any key, because D3)

| # | Jar | Ours | Why |
|---|---|---|---|
| 1 | `<b>PlantUML version $version$</b> (Unknown compile time)` | `<b>plantuml-engine version 0.2.0</b> (Unknown compile time)` | header |
| 2 | `(GPL source distribution)` | `(MIT source distribution)` | header, D13 |
| 3 | ` ` | ` ` | |
| 4 | `To get your <i>Professional Edition License</i>,` | `plantuml-engine has no <i>Professional Edition License</i>:` | no such edition exists for us |
| 5 | `please send this qrcode to <b>plantuml@gmail.com</b> :` | `it is <b>MIT</b> software and needs no license key.` | the address and the QR request are PlantUML's; the licence name comes from `License.getCurrent()` |
| — | QR image, 4x scale | none | the MIT edition draws none either (`FlashCodeUtilsNone`), D3 |

**`keycheck <sig> <key>`, `keycheck <key>`** (`PSystemKeycheck.getTextBlock`, java:64-81)

| # | Jar | Ours | Why |
|---|---|---|---|
| 1-3 | header | header | as `keygen` |
| 4 | `<u>Provided license information</u>:` | same | upstream's order; the fields `addLicenseInfo` would add are empty for `NONE` on both sides |
| 5 | `No valid license found. A named license is bound to the machine it was issued for.` | `No license key was checked: plantuml-engine reads none.` | no key check exists (D3); machine binding is PlantUML's |
| 6 | ` ` | ` ` | |

### D6: Rows are authored utility fixtures, ledgered as `authored-utility/<slug>`

No corpus row exists, so T2a authors `tests/fixtures/utility/cov-*.puml` with the jar's `.svg` beside each
(the T3-cov form, `oracle/goldens/svg-utility/README.md`), measured into `authored-baseline.json` with a reason per
nonzero row.

Each **diverging** row gets an in-force ledger entry with `match.id` `authored-utility/<slug>`, `acceptedBy`
`maintainer (ruling 2026-11-13, #182)`, and its measured diff count in the reason.

- **Rejected: `svg-utility/<slug>`.** The ledger gate (`emitter.golden.test.ts:150-155`) resolves every
  `svg-<type>/<slug>` id to `tests/oracle/svg-conformance/parity-<type>.json`, and there is no `parity-utility.json`,
  so the read would throw. An id without the `svg-` prefix passes the schema test (`:102-119`) and is skipped by the
  survey-verdict test, which cannot see authored rows anyway.
- **Rejected: no ledger entries.** The issue's Done-when asks for each row signed.
- A row that measures **0 diffs** (expected: `cov-keydistributor`) is conformant. It gets no ledger entry, because
  the ledger comment calls an entry for a conformant row bookkeeping to retire. Journal it and name it in the T3
  issue comment.

### D7: `version` page unchanged

Upstream's `version` and `testdot` both call `GraphvizUtils.addDotStatus` (`PSystemVersion.java:175`, `:238`), so
the jar prints the same Graphviz block on both. Ours already takes the library arm on `version` (D14 of
utility-factories-port: `@knowvah/dot-engine library is used!` plus the file-generation probe). Rulings 2-4 are
scoped "`testdot`:", and the issue's Done-when says no other row's verdict moves. So `version` keeps its block, and
`testdot` gets its own function for the executable arm's version line (`GraphvizUtils.java:122-127`), named and cited
in `PSystemVersion.ts`. The asymmetry goes to the maintainer as a question in the T3 issue comment, not a stop.

### D8: No public API change

None of the new classes is exported from `src/index.ts`. `DOT_ENGINE_VERSION` is a `src/core/version.ts` export,
which is internal. T0 snapshots `dist/*.d.ts`; T3 compares. Any change is stop 5.

## Operational readiness

- **Observability:** N/A. A browser library with no service, SLI or log. Every task's observability is N/A.
- **Rollback:** Reversible. Revert the squash commit; no data, schema or contract changes.
- **Scalability:** N/A. Six one-line pages; no layout call. `testdot` no longer runs `renderSvg` (ruling 4).
- **Failure modes:** (1) dot-engine is bumped and `DOT_ENGINE_VERSION` is not: `version.test.ts` fails in CI;
  update the constant. (2) A later upstream pin changes a key-page line: the authored rows' reasons go stale; the
  re-pin procedure re-captures them. (3) An authored oracle captured in a multi-file run: the QR race changes the
  keygen height; re-render one file per run.
- **Backwards compatibility:** six sources that drew a `Syntax Error?` page now draw a page. No API or data change.
