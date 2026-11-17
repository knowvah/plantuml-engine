# T1d: class and entity comment names are the quark name (D3)

**Writes:** the class parser's classifier create sites (start at `class-ensure-classifier.ts`,
`class-namespace-resolve.ts`, `class-declaration-parser.ts`; find the rest with `grep -rn "classifiers.push\|kind:"
src/diagrams/class/*.ts`), `ast.ts` / `class-classifier-ast.ts` (a `quarkName` field), `class-geo-types.ts` and
`class-geo-builders.ts` (carry it), `renderer-group.ts` (`leafPortion`, `wrapEntity`), `renderer-leaf.ts`,
`renderer-usymbol-entity.ts` or `core/svek/DecorateEntityImage.ts` (the `entity` comment's name), unit tests.
**Reads:** D3 in `decisions.md`; `abel/Entity.java:686-688`, `plasma/Quark.java`, `plasma/Plasma.java`,
`net/atmp/CucaDiagram.java:244-283`; `src/core/plasma/Quark.ts`, `src/diagrams/description/namespace-groups.ts`
(`leafDisplayName`, `bareEntityName`).

## Steps

1. Read how upstream names a quark: what `Plasma` does with the separator, with `none`, with a leading separator
   (`.BaseClass` under `none` keeps its dot), and with an entity made inside a `namespace` block under `none`
   (`momoba-92`: `net.dummy.Person`). Quote it in the journal.
2. Red: unit tests on `lobofa-60` (`::`), `fokudo-49` (`\\`), `rixeje-01` (`/`), `zecate-11` (`-`), `pexivi-54` and
   `momoba-92` (`none`), `cokavo-95` and `catana-32` (`entity` comments), and the c4dd-T2c separator fixture.
3. Green: stamp `quarkName` where the classifier is created, with the separator active then; copy it to
   `ClassifierGeo`; `wrapEntity` and the `entity` emitter read it. The link comment's ends already match on every row
   (`linkCommentOf`); check that they still do, and route them through the same name if a row says otherwise.
4. Grep `leafPortion`'s callers. Remove it if none needs a dotted split any more; otherwise correct its doc comment.
5. Measure. Expect the class and entity rows of bucket B to empty. Update the open lists and the gate.

## Acceptance
- Given `set namespaceSeparator ::` with `class X::B`, when rendered, then the comment is `<!--class B-->`.
- Given `set namespaceSeparator none` with `class X.Y.Z`, when rendered, then the comment is `<!--class X.Y.Z-->`.
- Given `cokavo-95-zopa741`, when rendered, then its entity comment is `<!--entity b-->`.

Observability is N/A. Rollback is Reversible.
