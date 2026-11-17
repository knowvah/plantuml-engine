# T4a: `CommandCreateDomain`

## Context

One regex command creates both keywords, as a leaf or (with a trailing `{`) as a group
(`descdiagram/CommandCreateDomain.java`, `getRegexConcat` and `executeArg`). Notable upstream details to mirror:

- `CODE` is `([a-zA-Z0-9]+)` and `as` is mandatory; `DISPLAY` must be quoted.
- A leaf is `LeafType.DOMAIN`/`REQUIREMENT`; a group is `GroupType.DOMAIN`/`REQUIREMENT` via `gotoGroup`.
- `usymbol` is `USymbols.fromString(typeString)`, which is `null` for every string this command passes
  (`USymbols.java:122-181`).
- "Object already exists : <code>" when the quark has data: the jar's error, ours must match it.
- `executeArg` reads `URL_KEY` and `COLOR`, which the regex never captures: both are always null. Port that as-is.

## Steps
1. Port the command into `src/diagrams/description/command-domain.ts`, registered last
   (`DescriptionDiagramFactory.java:137`).
2. Leaves: `leafType: 'domain' | 'requirement'` with the stereotype (D2). Until T4b and T4c land, a domain leaf may
   still draw wrongly; journal its diff count.
3. Groups: a null-usymbol group. Read `svek/Cluster.java` (and `ClusterDecoration`) for what a null usymbol draws, and
   match `rukitu`'s package-tab clusters (`M` with `«Machine»`, `R` with none), including the stroke `#000` 1.5 the
   oracle shows.

## Write-set
`src/diagrams/description/command-domain.ts` (create), `command-table.ts`, `parse-state.ts`, `ast.ts`, the cluster style
code that picks a group's decoration (find it from `renderer-cluster.ts`), tests.

## Acceptance
- Given `rukitu`, when measured, then it is not an error page and its two clusters' paths and titles equal the oracle's.
- Given `domain "A" as A` twice, when rendered, then both sides error the same way (render the oracle to check).
- Given `domain A as A` (unquoted display), when rendered, then both sides agree (the jar's regex requires quotes;
  check what the jar draws and match it).

Observability is N/A. Rollback is Reversible.
