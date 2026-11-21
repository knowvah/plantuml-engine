# Playground

Edit the PlantUML source on the left and the SVG updates live. Everything
runs in your browser — there is no server. Use **Export SVG** / **Export PNG**
to download the current render.

<Playground height="480px" />

::: tip
This is the actual library, imported from source. What you see here is
exactly what `renderSync(source, { includeStore })` produces in your own app,
after `prepareIncludeStore(source, { stdlibRegistry })` has resolved the
source's `!include` directives.
:::

## Standard library includes

`!include <bundle/…>` works for the bundles the `@knowvah/plantuml-stdlib*`
packages ship. Each bundle loads the first time a diagram names it.

| Bundle | Package | Loaded as |
| --- | --- | --- |
| `C4` | `@knowvah/plantuml-stdlib` | one chunk |
| `archimate` | `@knowvah/plantuml-stdlib` | one chunk; `Archimate.puml` itself shows an include error until [#228](https://github.com/knowvah/plantuml-engine/issues/228) is resolved |
| `cloudinsight` | `@knowvah/plantuml-stdlib` | one chunk |
| `cloudogu` | `@knowvah/plantuml-stdlib` | one chunk |
| `bootstrap`, `bootstrap1.13.1` | `@knowvah/plantuml-stdlib` | one chunk |
| `awslib14` (and its alias `awslib`) | `@knowvah/plantuml-stdlib-aws` | a manifest, then one file per include from `/stdlib/awslib14/` |
| `tupadr3` | `@knowvah/plantuml-stdlib-tupadr3` | a manifest, then one file per include from `/stdlib/tupadr3/` |

Other `<bundle/…>` includes, such as the legacy `aws` library
([#226](https://github.com/knowvah/plantuml-engine/issues/226)), are not
available here yet; the playground shows the library's include error for them.
Jar-internal sprites (`<$archimate/…>`) and emoji (`<:1f600:>`) draw without
their artwork for now ([#227](https://github.com/knowvah/plantuml-engine/issues/227)).

### Attribution

- **AWS icons** (`awslib14`): "AWS Icons for PlantUML" by Amazon.com, Inc. or
  its affiliates ([awslabs/aws-icons-for-plantuml](https://github.com/awslabs/aws-icons-for-plantuml)),
  licensed under [CC BY-ND 2.0](https://creativecommons.org/licenses/by-nd/2.0/);
  the macro code is MIT. The files are served unmodified, with their licence
  texts, under `/stdlib/awslib14/` (see its `LICENSES.md`).
- **tupadr3 icon sprites** (`tupadr3`): [tupadr3/plantuml-icon-font-sprites](https://github.com/tupadr3/plantuml-icon-font-sprites),
  MIT. The artwork keeps its own licence: Font Awesome Free icons are
  [CC BY 4.0](https://fontawesome.com/license/free), Devicons are MIT, and
  Material Design Icons are Apache 2.0. Details, and the categories whose
  artwork licence is still unconfirmed, are in
  `/stdlib/tupadr3/LICENSES.md`.
