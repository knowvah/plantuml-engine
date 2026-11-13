## Observation: exo `**` emitted a standalone activate event
- **Context**: sogr T2c, row kikate-70-xevi302.
- **Finding**: `executeExoArrow` emitted `{kind:'activate'}` before the message for `**`, which rendered as a white 10x24 activation box. Upstream's CREATE life event is parked as `pendingCreate` and taken by the message (`SequenceDiagram.java:374-377,207-214`); `CommandArrow` already did this without an event. The `compare` diff (title/rect) was only the stray rect; the title group already matched.
- **Impact**: any exo `**` form now yields `create` on the message only; `<- a **`, `[<- a **`, `-> a ** #red`, `a ->] **`, `[o-> a **` + `[-> a ++` are byte-identical to the jar (sans plantuml-src).
- **Confidence**: High
