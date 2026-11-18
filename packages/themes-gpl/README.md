# @knowvah/plantuml-themes-gpl

The PlantUML theme `sunlust` (Artem V. Ageev), which
[plantuml-engine](https://github.com/knowvah/plantuml-engine) does not ship in
its MIT core because its header licenses it `GPL 3+`.

> **GPL-3.0-or-later.** Installing and bundling this package brings GPL terms
> into what you ship. It is deliberately not part of `@knowvah/plantuml-all`.
> See [`LICENSES.md`](./LICENSES.md).

```sh
npm install @knowvah/plantuml-engine @knowvah/plantuml-themes-gpl
```

```js
import { renderSync, themeStore, withThemes } from '@knowvah/plantuml-engine';
import { gplThemes } from '@knowvah/plantuml-themes-gpl';

const base = { get: () => undefined, has: () => false }; // or your own include store
const includeStore = withThemes(base, themeStore(gplThemes));

renderSync('@startuml\n!theme sunlust\nAlice -> Bob\n@enduml', { includeStore });
```

Without the package registered, `!theme sunlust` renders PlantUML's
`Cannot load theme sunlust` error page. Register several theme packages with
one `themeStore(unlicensedThemes, gplThemes)`.
