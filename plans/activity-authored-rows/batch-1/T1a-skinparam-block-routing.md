# T1a — A `skinparam` block with stereotyped keys or block comments stays activity

**State at planning:** four rows draw `Syntax Error? (Assumed diagram type: class)` where the jar draws an activity
diagram: `kizofi-56-mibi017` 34 and `fuficu-36-caga441` 37 open with `skinparam activity {` /
`skinparam partition {` blocks holding `BackgroundColor<<MyGreen>> LightGreen`; `nabako-16-gefo071` and
`zugoco-10-pexu073` 113 each open with `skinparam activity {` holding a `/'BackgroundColor Yellow'/` comment line.
`bosada-42` and `bofaxe-86` (T6a) start the same way and draw: read why they get past.

**Read:** `CommandSkinParamMultilines.java` (its block regex and how a line inside is split; stereotyped keys
`Key<<st>>`), the block-comment handling in the preprocessor or `BlocLines`, and the diagram factory that claims
the source (`PSystemBuilder`, the activity3 factory's commands). Ours: the router that picked class, and the
skinparam block parser.

**Do:** red with one row's first diffs. Fix where the line is refused, not in the router's guess.

**Measure:** the four rows; surveys of activity and every bucket that has a `skinparam` block in its corpus
(class, component, sequence, state, usecase at least), since the block parser is shared.

## Acceptance
- Given the four rows, then each renders an activity diagram, and its remaining diffs are journaled with an owner.
- Given every bucket's survey, then 0 lost.

Observability N/A. Rollback Reversible.
