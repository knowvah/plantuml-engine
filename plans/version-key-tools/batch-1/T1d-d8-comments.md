# T1d: the D8 comments say what is true

**Decisions:** D3, D8.

## Do

1. `src/diagrams/version/LicenseInfo.ts:14-22`: the "Not ported" list says the key tools are out by D8. Rewrite it:
   the key tools are ported (#182), and `persistMe`, `retrieveNamed`, `retrieve`, `retrieveDistributorOrNamed`,
   `setIfValid`, `fileCandidates` and `main` stay unported because no reachable path in this build calls them
   (D3: `PLSSignature` decoding and host sources). Keep every Java line citation.
2. `src/core/utils/SignatureUtils.ts:4`: "(license/keygen, out of this port's roadmap)" becomes what is true:
   the key tools are ported (#182), but `PLSSignature` and `LicenseInfo`'s decoding are not (D3). The file's own
   "NOT PORTED — `salting`" note (`:41`) cites `SignatureUtils.java:98-107`; at the current pin `salting` is
   java:102-111. Re-read the Java and correct the citation and its reason if either is stale.
3. Grep `src/` once more for `D8`, `testdot`, `keygen`, `key tools`, `out of this port's roadmap`; every remaining
   hit in `src/diagrams/version/` or `SignatureUtils.ts` must be true. (`src/core/annotations/model.ts:129` and the
   theme files cite other missions' D8s; leave them.)
4. `npm run catalog`; commit `docs/catalog.md` with the rest.

## Acceptance
- Given `grep -rn "decisions.md D8" src/diagrams/version src/core/utils`, when run, then it prints nothing.
- Given `npm test`, when `tests/architecture/catalog.test.ts` runs, then it passes.

Observability: N/A, no new observable operations. Rollback: Reversible.
