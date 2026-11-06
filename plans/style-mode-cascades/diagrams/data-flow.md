# Data flow: where a style colour and property come from (D2, D3, D6, D7)

```plantuml
@startuml
participant "preprocessor" as pre
participant "style cut" as cut
participant "StyleBuilder" as sb
participant "buildTheme" as bt
participant "engine readers" as rd
participant "colour mapper" as cm
participant "SVG" as svg
pre -> cut : hoisted style blocks with their line
cut -> pre : T1b, a block that fails to parse stops the engine at its line
pre -> sb : skin, theme, style blocks, skinparams in source order
sb --> bt : merged Style per element signature
bt -> bt : T2a, under mode dark map each colour to its media partner
bt --> rd : theme buckets
sb --> rd : T4, FontSize, LineThickness, RoundCorner, Shadowing
rd -> cm : drawn fragment and root background
cm -> svg : T3, monochrome or reverse colour mapping
@enduml
```

Upstream does all of this on one `UGraphic`: the builder is fed in storage order (`SkinParam.java:227-234`), every
colour is an `HColor` carrying its `@media` partner, and `TitledDiagram#muteColorMapper` maps the output once
(`TitledDiagram.java:292-313`). The port stores hex strings in the theme, so dark mode is applied when the theme is
built (D2), and the other mappers run over the finished fragment (D6).
