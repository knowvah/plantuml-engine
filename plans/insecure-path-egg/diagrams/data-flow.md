# Data flow — `path` under each profile

The render's profile reaches the registry through `ParseOptions` (D1). Under INSECURE the path plugin is a candidate,
and its page is drawn at export (D2). An invalid character throws there and becomes the error page (D3).

```plantuml
@startuml
participant "renderSync" as R
participant "parseOptionsOf" as P
participant "DiagramRegistry.resolve" as D
participant "pathPlugin" as F
participant "GraphicsPath" as G
participant "UMotif" as M
participant "errorSvg" as E

R -> P : RenderOptions
P --> R : ParseOptions with securityProfile
R -> D : source, ParseOptions
alt profile is not INSECURE
  D -> D : skip pathPlugin (registeredOnlyUnder)
  D --> R : next candidate, or merged refusal
else profile is INSECURE
  D -> F : parse (single line, case-insensitive)
  F --> D : PSystemPath
  D --> R : pathPlugin owns the block
  R -> G : writeImage at export
  G -> M : new UMotif(path)
  alt every char in A-Z or a-w
    M --> G : DotPath from 20,20
    G --> R : 50x50 SVG page, one black path
  else any other char
    M --> R : throws IllegalArgumentException
    R -> E : err
    E --> R : error page
  end
end
@enduml
```
