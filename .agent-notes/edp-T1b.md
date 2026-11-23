## Observation: upstream's EmbeddedDiagram#getNeutrons no longer throws
- **Context**: edp T1b, re-citing `src/core/EmbeddedDiagram.ts`'s module JSDoc at the pin a720bdd.
- **Finding**: `EmbeddedDiagram.java:289-292` at a720bdd returns `Arrays.asList(Neutron.create(this))`. The port's JSDoc (and `getNeutrons()` body) still says it throws, ADR-9, citing the older java:252-255.
- **Impact**: an embed inside a wrapped line (`maxMessageSize`, `Sheet`/`Fission` splitting by neutrons) may behave differently from the jar. Not measured; worth a dedicated check with a fixture.
- **Confidence**: Medium (Java read at the pin; port behaviour not exercised)

## Observation: a group3015-style fixture test needs the include store and the pragma strip
- **Context**: edp T1b, comparing `renderSync` with jar oracles for the `group3015` sources.
- **Finding**: bare `renderSync(src, { measurer })` fails the `!theme crt-amber` cases (no theme without `fixtureIncludeStore()`), and a `!pragma layout smetana` source differs from a graphviz oracle until `stripLayoutPragma` removes the line, as the corpus capture does.
- **Impact**: a new jar-compared unit test of a themed or smetana source should render the way the survey does.
- **Confidence**: High
