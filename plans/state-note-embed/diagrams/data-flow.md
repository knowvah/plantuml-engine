# Data flow: a state note with an embedded block

The note's size already comes from `buildNoteBody` (unchanged). This mission adds the stripe path beside it, and the
draw reads the stripes when they exist.

```plantuml
@startuml
title State note embed: data flow (proposed)
start
:note text from the parser;
:measureNote (state-note-layout.ts);
fork
  :measureNotePureText via buildNoteBody;
  :width and height, unchanged;
fork again
  :splitEdgeLabelEmbeds;
  if (a line opens an embed?) then (yes)
    :text segments through stateCreoleBlock;
    :embed segments through edgeLabelEmbedAtom;
    :stackEdgeLabelStripes, left aligned;
    :NoteSpec.noteStripes;
  else (no)
    :no stripes, lines as today;
  endif
end fork
:materializeNoteSpec copies to StateNodeGeo;
:renderNoteTextLines at marginX1 and marginY;
if (noteStripes set?) then (yes)
  :text stripes through the state text emitter;
  :image stripes through state-embed-draw;
else (no)
  :renderStateTextLines, byte identical;
endif
stop
@enduml
```
