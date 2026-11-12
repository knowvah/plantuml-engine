# T2 — package identity

**Context.** The npm name, dist filenames, workspace references, path aliases and the generated stdlib `.d.ts`
specifier must change together — any one left behind breaks resolution. Nothing is published, so there is no
compatibility shim (decisions.md, "no consumers").

**Task.**
1. `package.json`: `name`, `repository.url`, `main`/`module`/`types`/`exports` paths → `plantuml-engine`.
2. `vite.config.ts`: entry key `'plantuml-engine'`, `name: 'PlantUmlEngine'` (D1), comments.
   `tsconfig.json` `paths` key + comment; `packages/tsconfig.base.json` comment.
3. `packages/*/package.json` (7): `description`, `repository.url`, `peerDependencies` and `devDependencies` keys
   → `@knowvah/plantuml-engine` (keep `^0.2.0` and `file:../..`).
4. Lockfile per D5: `npm install --package-lock-only --ignore-scripts`; audit `git diff package-lock.json` — only
   name, the renamed workspace link entries, and `file:` specifiers. Anything else: STOP 4. Then `npm ci`.
5. `demo/{app.ts,index.html,vite.config.ts}`; `docs-site/.vitepress/config.ts` (alias, `title`, `og:site_name`,
   `socialLinks`, the shim plugin `name`); `docs-site/.vitepress/theme/Playground.vue`.
6. `scripts/build-pages.ts` (`/dist/plantuml-engine.js`); `scripts/build-stdlib-packages/{emit-module,
   emit-remote-manifest}.ts` (`DTS_IMPORT` specifiers + comment).
7. `src/core/sprite-split-stdlib.ts` (doc example import only — the `Symbol` description is T4's),
   `src/image-providers/index.ts` (doc line).
8. `NOTICE` (title line 1, dist filenames line 15, line 54).
9. Tests: `tests/architecture/packages-peer-range.test.ts` (`PEER_NAME` + doc),
   `tests/unit/image-providers/entry.test.ts` (`ROOT_BUNDLE`, `SUBPATH`), `tests/unit/stdlib-eager-omission.test.ts`
   (comment), `tests/unit/stdlib-dts-import-specifier.test.ts`: its guard at `:103` looks for the bare pre-scope
   specifier `from 'plantuml-ts'`. Rewrite it to assert that every emitted `from '…'` specifier equals the declared
   peer name, so a regression to `'plantuml-ts'` **or** a bare `'plantuml-engine'` both fail; update `:125`.

**Write-set.** The files above; `PENDING`; `docs/catalog.md` if drifted.
**Read-set.** `RELEASING.md:10-20,55-70` (peer/dev contract); `tests/unit/stdlib-dts-import-specifier.test.ts:1-130`.

**Acceptance criteria.**
- Given `npm run build`, then `dist/` holds `plantuml-engine.{js,cjs,d.ts}` and `image-providers.*`, and no
  `plantuml-ts.*` (delete a stale `dist/` first).
- Given a fresh `npm ci`, then it exits 0 and `readlink node_modules/@knowvah/plantuml-engine` resolves to the repo
  root; `node_modules/@knowvah/plantuml-ts` does not exist.
- Given `git diff package-lock.json`, then every changed line is a name, link or `file:` entry (D5).
- Given `npm pack --dry-run`, then the tarball is `knowvah-plantuml-engine-0.2.0.tgz` and lists no `plantuml-ts`
  path.
- Given the full suite, then it is green with the same file/test counts as T1's close.

Observability: N/A — no new observable operations. Rollback: Reversible (revert; `npm ci` restores the old link).
