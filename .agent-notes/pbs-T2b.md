## Observation: parse runs before the render's measurer is resolved
- **Context**: pbs T2b, threading `FileFormat.PNG`'s bounder into `parseWire` (D4).
- **Finding**: `prepareBlock` (`src/index.ts`) parses inside `registry.resolve` and only then calls
  `resolveMeasurer(plugin.type, options)`, because the measurer default depends on the plugin type. A plugin that needs
  the measurer at parse time can only see `RenderOptions.measurer` (now forwarded as `ParseOptions.measurer`); an
  absent one means the type default, which is never a `DeterministicMeasurer`.
- **Impact**: any future engine that measures while commands execute (as wire `print` does) must read
  `ParseOptions.measurer`, not wait for `layoutSync`.
- **Confidence**: High

## Observation: production wire bytes checked against the base sha out of tree
- **Context**: pbs T2b acceptance "production output byte-identical".
- **Finding**: `git archive <base> src assets package.json tsconfig.json | tar -x -C /tmp/x` plus a `node_modules`
  symlink lets `jiti` import the base sha's `src/index.ts` beside the working tree, with no worktree or stash.
- **Impact**: a cheap before/after byte check for any "production unchanged" claim.
- **Confidence**: High
