# Licences — @knowvah/plantuml-themes-unlicensed

**Not MIT, and not "The Unlicense".** The eight themes below come from PlantUML's
`src/main/resources/themes/`, verbatim. Their authors stated no licence: each
header's `license:` field is empty or absent. See [`LICENSE`](./LICENSE).

| Theme | Author (header `author:`) | Header `license:` |
| --- | --- | --- |
| `amiga` | Matthew Leather | *(none stated)* |
| `blueprint` | Matthew Leather | *(none stated)* |
| `carbon-gray` | Bharat Rajagopalan | *(none stated)* |
| `crt-amber` | Matthew Leather | *(none stated)* |
| `crt-green` | Matthew Leather | *(none stated)* |
| `mimeograph` | Matthew Leather | *(none stated)* |
| `mono` | Denis Bondarenko feat Matthew Leather | *(none stated)* |
| `plain` | Matthew Leather | *(none stated)* |

Why a separate package: `@knowvah/plantuml-engine` is MIT, and the MIT `dist/`
may only carry files whose licence allows it. The maintainer ruling of
2026-11-13 (issue #180) moved these themes here. Without this package
registered, `!theme amiga` (and the others) gives PlantUML's own
`Cannot load theme amiga` error.

A theme moves back to core if its author grants MIT.

The `index.js` / `index.d.ts` wrapper is plantuml-engine code, MIT.
`@knowvah/plantuml-all` depends on this package; see its `LICENSES.md`.
