# @knowvah/plantuml-themes-unlicensed

Eight PlantUML themes that [plantuml-engine](https://github.com/knowvah/plantuml-engine)
does not ship in its MIT core: `amiga`, `blueprint`, `carbon-gray`, `crt-amber`,
`crt-green`, `mimeograph`, `mono` and `plain`.

> **"Unlicensed" does not mean "The Unlicense".** The theme authors stated no
> licence at all. This package redistributes the files as PlantUML does,
> unmodified. Read [`LICENSE`](./LICENSE) and [`LICENSES.md`](./LICENSES.md)
> before you ship it.

```sh
npm install @knowvah/plantuml-engine @knowvah/plantuml-themes-unlicensed
```

```js
import { renderSync, themeStore, withThemes } from '@knowvah/plantuml-engine';
import { unlicensedThemes } from '@knowvah/plantuml-themes-unlicensed';

const base = { get: () => undefined, has: () => false }; // or your own include store
const includeStore = withThemes(base, themeStore(unlicensedThemes));

renderSync('@startuml\n!theme amiga\nAlice -> Bob\n@enduml', { includeStore });
```

Without the package registered, `!theme amiga` renders PlantUML's
`Cannot load theme amiga` error page. `withThemes` composes with `withStdlib`
in either order, and `themeStore` takes several packages (the first one that
defines a name wins).

`@knowvah/plantuml-all` already depends on and re-exports this package.
