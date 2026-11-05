# T5b — `!theme`, `skin`, monochrome

Commit: `fix(description): read theme and monochrome values on entities`.

## Context
- `taneno-85` (`!theme aws-orange`, 273 diffs): `stroke-width` 0.521 against 1.042, exactly double, then text `y` and `cx`. So a `LineThickness` from the theme doubles under a scale. Read which.
- `reroca-56` (`!theme carbon-gray`): stroke and width on a `rect` the jar leaves without them.
- `sifobi-72` (`skin rose`), `buvofa-22` (`!theme mars`), `jobuje-80`, `vajaxu-62` (`monochrome reverse`), `ludipa-77`.
- #120 owns dark mode, monochrome and the skin cascades for its authored rows. Corpus rows here finish here (D6). Read `.agent-notes/dss-*.md` and the dss section of `planning/next-missions.md` first, because D2's builder may make #120's items cheaper: comment on #120 if so.

## Rows
`taneno-85`, `reroca-56`, `sifobi-72`, `buvofa-22`, `vajaxu-62`.

## Acceptance
- Given `taneno-85`, when rendered, then `stroke-width` is `1.042`, and the row has zero diffs or a named remainder.
- Given `vajaxu-62`, then `monochrome reverse` matches.

Observability: N/A — no new observable operations. Rollback: Reversible.
