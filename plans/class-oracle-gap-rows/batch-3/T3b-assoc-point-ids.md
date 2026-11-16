# T3b: association-point link ids under a namespace separator

**Row:** `kibinu-30-pese048`.

```
set namespaceSeparator \\
CardBundle\\Card "1" --> "1..*" TagBundle\\Tag
(CardBundle\\Card,TagBundle\\Tag) .. TagBundle\\CardTag
```

The only diffs are three `path/@id`s. Ours is `CardBundle\\Card-apoint7`, and the jar's is `Card-apoint7`
(likewise `apoint7-to-Tag` and `apoint7-CardTag`).

## Lead (verify before acting)

The jar's link id uses the entity's short name (its `Quark` name without the namespace prefix), not its full name.
Find the link-id builder upstream (`svek/SvekEdge` / `Link#getIdCommentForSvg` or the like) and the name it reads. Then
check how our id builder gets the name, and whether the plain `.` separator case already uses the short name (if it
does, the gap is only the custom separator).

## Acceptance
- Given `kibinu-30-pese048`, when it is measured, then `n=0`.
- Given a unit test in `tests/unit/class/cogr-T3b.test.ts`, then the three ids match the oracle.

Observability is N/A. Rollback is Reversible.
