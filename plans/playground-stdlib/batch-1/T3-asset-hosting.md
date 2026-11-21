# T3: self-host remote bundle assets under `/stdlib/`

**Writes:** `docs-site/copy-stdlib-assets.mjs` (new), `package.json` (scripts), `.gitignore`, `docs-site/playground.md`.
**Reads:** decisions.md D1, D2, D4; `docs-site/copy-brand-assets.mjs` (the pattern);
`packages/stdlib-aws/scripts/copy-assets.mjs`, `packages/stdlib-tupadr3/scripts/copy-assets.mjs`;
`packages/stdlib-aws/README.md` ("Attribution and license"); `planning/s4-stdlib-audit.md:162-170`.

## Task

1. `docs-site/copy-stdlib-assets.mjs`:
   - Run each package's `copy-assets` (`npm run copy-assets -w @knowvah/plantuml-stdlib-aws -w
     @knowvah/plantuml-stdlib-tupadr3`, or import the logic if they export it).
   - Then copy `packages/stdlib-aws/assets/awslib14/` → `docs-site/public/stdlib/awslib14/` and
     `packages/stdlib-tupadr3/assets/tupadr3/` → `docs-site/public/stdlib/tupadr3/`, byte-for-byte (`cpSync`,
     no read-and-rewrite: CC BY-ND, si5b D3).
   - Copy each package's `LICENSE*` and `LICENSES.md` into its bundle folder (stop 5).
   - Remove stale files first, so a dropped asset does not linger.
   - Fail with a clear message naming `npm run build:stdlib` / the vendored-stdlib step when the source is missing (D4).
2. `package.json`: add `"docs:stdlib": "node docs-site/copy-stdlib-assets.mjs"`, and prepend it in `docs:dev` and
   `docs:build` after `docs:brand`.
3. `.gitignore`: add `docs-site/public/stdlib/` next to the brand-assets entry, with a comment naming the script.
4. `docs-site/playground.md`: list the bundles that work (D1), say that other `<bundle/…>` includes are not available
   yet, and credit AWS per si5b D4 (CC BY-ND 2.0 link, awslabs repo credit) and Font Awesome / tupadr3 per
   `packages/stdlib-tupadr3/LICENSES.md`.

## Acceptance
- Given `npm run docs:stdlib`, then `cmp` of 3 sampled files against `assets/stdlib/<bundle>/` is identical, and each
  bundle folder holds its LICENSE text.
- Given the docs dev server, when `GET /stdlib/awslib14/Storage/SimpleStorageService.puml`, then 200 with the vendored
  bytes.
- Given T1's spec, when it runs after T2 and T3, then cases 1-3 pass.

Commit: `feat(docs): self-host remote stdlib assets for the playground`, with `Refs: #172`.
Observability is N/A. Rollback is Reversible.
