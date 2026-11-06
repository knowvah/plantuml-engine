# Data flow: where a stereotyped box gets its look (D2, D3)

```plantuml
@startuml
participant "command regex" as cmd
participant "Stereogroup" as sg
participant "dispatch (ours)" as disp
participant "merged Style" as style
participant "sizer" as size
participant "renderer" as draw
cmd -> sg : the stereogroup text after the command
sg --> disp : labels, BoxStyle, inner colours
disp -> disp : T1a, inner colour onto the shape this command builds
disp -> style : T1b, stereotype label with the element signature
style --> size : font, padding, round corner, wrap width
style --> draw : line and back colour, stroke, shadowing
size -> draw : box dimension
@enduml
```

The jar reads every value in the last three arrows from one `Style` (`FtileBox.java:146-171`). Today the inner
colour reaches only an action body, and the stereotype reaches the renderer one colour at a time.
