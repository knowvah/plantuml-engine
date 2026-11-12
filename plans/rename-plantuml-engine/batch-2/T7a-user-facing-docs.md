# T7a — user-facing docs

**Context.** What a reader of the repo, the docs site or a workspace package's npm page sees.

**Task.**
1. Root: `README.md` (title, CI badge URLs, imports), `RELEASING.md` (peer/dev keys, publish step, deprecate
   example), `CLAUDE.md` (title line only), `DIVERGENCES.md` (any line T3 did not touch).
2. `CHANGELOG.md`: one new entry at the top in the file's existing format — the rename (package, dist filenames,
   version string, repo URL), `Refs: #173`. Past entries untouched (D2).
3. `docs-site/index.md`, `docs-site/guide/{api,getting-started,image-providers,styling-data-diagrams,
   why-no-smetana}.md`. Clone instructions: `git clone https://github.com/knowvah/plantuml-engine.git` /
   `cd plantuml-engine`. `why-no-smetana.md:35` ("plantuml-ts began in April 2026") is history told in a live
   doc: write "plantuml-engine began in April 2026 (under its first name)" so the file stays clean.
4. `packages/*/{README.md,LICENSE,LICENSES.md,index.js}`: links → `https://github.com/knowvah/plantuml-engine`;
   bare `npm install plantuml-ts` → `npm install @knowvah/plantuml-engine`; "the plantuml-ts source repo" → "the
   plantuml-engine source repo". `packages/stdlib/LICENSE:7` names the stale `plantuml/plantuml-ts` URL — fix to
   `knowvah/plantuml-engine`.
5. `assets/{emoji,sprites}/LICENSES.md`.

**Write-set.** The files above, `PENDING`.

**Acceptance criteria.**
- Given `npm run docs:build`, then it exits 0, and the built site's `<title>` and `og:site_name` read
  `plantuml-engine`.
- Given `git diff -- CHANGELOG.md`, then only the new top entry is added.
- Given `git grep -nI plantuml-ts -- README.md RELEASING.md CLAUDE.md DIVERGENCES.md docs-site packages assets`,
  then it is empty.

Observability: N/A — no new observable operations. Rollback: Reversible.
