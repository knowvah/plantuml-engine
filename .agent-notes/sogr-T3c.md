## Observation: the 5 px width and the box heights of teoz-ng-001-1 were one mechanism
- **Context**: `C -> C ++--:A1` on a participant already live, under a mainframe and a box.
- **Finding**: `MessageEvent` stored `activates`/`deactivates` as two fields and every consumer took `--++` order (deactivate first), but `manageActivations` applies charAt(0) then charAt(2) (`CommandArrow.java:445-466`), so `++--` is activate-then-deactivate. The wrong order closed C's outer bar at the self arrow and opened the nested one later, and the self arrow lost its level-2 x offset (the width). Fixed with `MessageEvent.activatesFirst` in three consumers.
- **Impact**: the mainframe, `box` and `Dolls` were never at fault; nothing to port there.
- **Confidence**: High (row at 0, 93 other rows unchanged)
