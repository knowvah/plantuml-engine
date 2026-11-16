## Observation: a planning brief's "we draw" can be stale
- **Context**: ucol T4, filing the out-of-scope probe `class-arrow-multi` (`A -[#zzblue;#red]-> B`).
- **Finding**: the brief said the jar errors and we draw; we draw the same "Syntax Error?" page, at the base too.
  The measurer's 7 diffs were the two error pages' banners. Render ours and check for the error banner before filing.
- **Impact**: a nonzero diff count between two error pages is not evidence that we draw.
- **Confidence**: High

## Observation: `name:value` colours throw at several jar sites that take the whole capture as one colour
- **Context**: ucol T4, `obj-line` and `uc-actor-line`.
- **Finding**: `CommandCreateEntityObject.java:140-142` and `CommandParticipant.java:183-185` pass the whole
  `ColorParser.exp1()` capture (which matches `#line:red`) to the throwing `getColor`, so the command returns
  `badColor()`: the object diagram errors, and a sequence participant hands the diagram to the next factory.
- **Impact**: #190, #191. Any `#name:value` on those declarations is never a `Colors` map in the jar.
- **Confidence**: High
