# T3a — register the plugins, first survey

Read [D2](../decisions.md#d2--one-package-per-upstream-package-plugins-as-the-utility-factories-register) and
[task-contract.md](../task-contract.md).

**Java:** `PSystemBuilder.java:169, 172-174, 188`, `core/DiagramType.java:105-205`.

**Write:** `src/registered-plugins.ts` (`registry.register(definitionPlugin); // java:169`, `mathPlugin` `:172`, `latexPlugin` `:173`,
`creolePlugin` `:174`, `helpPlugin` `:188`, in position; `scripts/parity-dashboard.ts` reads these as text); `src/core/block-extractor.ts`
(`'creole'`, `'math'`, `'latex'`, `'def'` in `DiagramType`, the start-tag map, `PORT_TO_UPSTREAM`, following `'wire'` at `:44`, `:162`,
`:416`; `@startdef` start lines carry arguments such as `(id=macro)`); `src/core/EmbeddedDiagram.ts` (the `creole` keyword reaches the new
plugin; `{{math`, `{{latex`, `{{def` stay unrecognised as upstream's scan has them absent: confirm in `getEmbeddedType`
`EmbeddedDiagram.java:257-366`).

Help is a `@startuml`-routed command factory: it runs in factory order after every UML engine has rejected the source. Confirm how the
existing `@startuml` utility plugins do this (`singleLinePlugin`'s `SEQUENCE_HACK` type at `PSystemSingleLineFactory.ts:183-185`,
`dispatcher.ts`) before writing the plugin's `type`.

Then, alone:
```sh
npm run svg:survey -- unknown --out /tmp/cmf-t3a/parity-unknown.json
node plans/creole-math-factories-port/measurements/factory-rows.mjs /tmp/cmf-t3a --json /tmp/cmf-t3a/rows.json
node plans/creole-math-factories-port/measurements/survey-moves.mjs /tmp/cmf-b0/parity-unknown.json /tmp/cmf-t3a/parity-unknown.json
npx jiti plans/creole-math-factories-port/measurements/row-diffs.mts plans/creole-math-factories-port/measurements/planning-rows.json /tmp/cmf-t3a/diffs.json
```

Journal the row counts by factory and every non-conformant row's first diff. A routing change for a row outside the 41 stops the task.
Expect the non-`<math>` creole rows, `def` and most `help` rows conformant, and math/latex diverged only inside the glyph group.

## Acceptance
- Given the survey, when compared to `/tmp/cmf-b0`, then no `unknown` row outside the 41 changes verdict (`survey-moves.mjs`).
- Given `factory-rows.mjs`, then the 7 non-`<math>` creole rows, both `def` and the 4 help rows other than `help font` are conformant.

Observability: N/A — no new observable operations. Rollback: Reversible.
