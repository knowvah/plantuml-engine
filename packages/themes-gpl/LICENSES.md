# Licences — @knowvah/plantuml-themes-gpl

**GPL-3.0-or-later.** This package holds one PlantUML theme, verbatim from
PlantUML's `src/main/resources/themes/`:

| Theme | Author (header `author:`) | Header `license:` |
| --- | --- | --- |
| `sunlust` | Artem V. Ageev | `GPL 3+` |

[`LICENSE`](./LICENSE) is the GNU General Public License, version 3. The theme
header's `GPL 3+` means version 3 or (at your option) any later version.

Why a separate package: `@knowvah/plantuml-engine` is MIT, and a GPL file cannot
ship in its MIT `dist/`. The maintainer ruling of 2026-11-13 (issue #180) moved
`sunlust` here, and keeps it out of `@knowvah/plantuml-all`, so that no MIT or
meta-package install pulls GPL code by default. Without this package
registered, `!theme sunlust` gives PlantUML's own `Cannot load theme sunlust`
error.

The `index.js` / `index.d.ts` wrapper is distributed with the theme under the
same GPL-3.0-or-later terms.
