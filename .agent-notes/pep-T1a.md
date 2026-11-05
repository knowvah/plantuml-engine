## Observation: VerticalLine draws nothing for a lone interior skip
- **Context**: porting `nwdiag/VerticalLine.java` for packet's indicator ticks (pep T1a)
- **Finding**: with a skip strictly between y1 and y2, java:74-77 adds an arc and `continue`s past `ug.draw`; `drawn` is already true, so after the loop the last skip's path is never drawn. A line with one interior skip and no later one draws nothing. The brief's T1a acceptance expected a drawn arc.
- **Impact**: #124 (nwdiag) should expect missing vertical segments where a network crosses the last skip; the port mirrors it.
- **Confidence**: High (read java:57-91; unit test pins it)
