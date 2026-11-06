# T2e — colour specs

Commit: `fix(description): resolve the jar's colour specs on links and fonts`.

## Context
Raw values reach the SVG: `text:Red`, `#line.dashed:blue` as `stroke` and `fill`, and `#?black:white` as a text `fill`. #145 lists them; these rows are done here (D6).

- `skinparam arrowColor<<write>> #line.dashed:blue;text:coral` and `Color<<v1.1>> text:Red`: `FromSkinparamToStyle.java` (*lead*) decides what each part becomes; `Colors.java:95-124` reads a `name:value` part with `getColorOrNull` (`:112`). The jar's stroke is `#FFF` on `gekage-52` and `#008000` on `kokodo-61`, so it is not simply "the part after the colon". Read before guessing.
- `#?black:white` is `HColorAutomagic`, resolved against the background it sits on (`HColorSet` *lead*). `core/style-element-scope.ts` already imports `parseConditionalColor`, so find which readers skip it. Ours prints `#?black:white`; the jar prints `#FFF` and `#000`.
- `skinparam arrow<<dotted>> { Color orange;text:orange;line.dotted }`, `Color ;text:orange;line.dotted`: `doluca-89`, `kufofi-19`, `pupuma-17`, `kajiko-47`. `dotEqual` is false on these, so the label font differs: it feeds the DOT.

`colorOrNeutral` in `HColorSet.ts` is for places where the jar errors (#143), and does not apply here.

## Rows
`golati-24`, `kokodo-61`, `koxeca-82`, `gekage-52`, `xekale-36`, `baxodi-80`, `bitujo-81`, `degici-07`, `pexaxo-70`, `doluca-89`, `kufofi-19`, `pupuma-17`, `kajiko-47`.

## Acceptance
- Given all 5,927 cached rows' `fill`, `stroke` and `stop-color` in our output, when scanned for `text:`, `line.` and `#?`, then none remains: a unit test holds this for the rows above.
- Given `degici-07`, then `cloud`'s text is `#FFF` and `database`'s is `#000`.

Observability: N/A — no new observable operations. Rollback: Reversible.
