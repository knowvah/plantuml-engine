# Component map: who holds the emoji artwork after the mission

```plantuml
@startuml
component "SpriteRegistry\n(emoji store)" as Reg
component "makeAtomImageResolverFor" as Mk
component "AtomImageResolver\n(+ emojiArtwork, T1b)" as Res
component "description renderer-edge\n(labelFields)" as DescEdge
component "activity-legacy renderer-edge\n(T1d)" as LegEdge
component "SvekEdge\n(label, drawEndText T1c)" as Svek
component "quantifier-block\n(sizer, T1c)" as Quant
component "buildTextBlock / drawAtoms" as BTB
component "drawEmojiAtom" as Draw
component "descAtomOps\n(desc path, unchanged)" as Desc

Reg --> Mk : emoji lookup
Mk --> Res : builds
DescEdge --> Svek : resolveAtomImage
LegEdge --> Svek : resolveAtomImage
Svek --> BTB : resolver for the font
Quant --> BTB : resolver for the font
BTB --> Draw : resolver.emojiArtwork
Desc --> Draw : explicit emojiArtwork
@enduml
```

Not in this mission (D3): the class edge label and quantifier, the description cluster title sizer, and the state edge
label. Each one draws or measures an emoji through its own path.
