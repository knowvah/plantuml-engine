# Data flow

How a source reaches each of the four factories after this mission: Welcome, ListFonts, Crash and Path. The order is
the registry order, `PSystemBuilder.java:133-200`. Each candidate's parse runs inside `attempt`, and after T1d a throw
there becomes a "Fatal crash error" refusal while the loop goes on to the next factory (D7).

```plantuml
@startuml
participant "renderSync" as R
participant "dispatcher.attempt" as A
participant "welcomePlugin\n(java:133)" as W
participant "listFontsPlugin\n(java:148)" as L
participant "crashPlugin\n(java:200)" as C
participant "error-diagrams" as E

R -> A : @startuml block, candidates in order
A -> W : parse(source)
alt total line count is 2
  W --> A : PSystemWelcome
  A --> R : Welcome page
else otherwise
  W --> A : null (refused)
  A -> L : parse(source), single-line gate
  alt the line is listfont or listfonts
    L --> A : PSystemListFonts with no font names (ruling 169)
  else
    L --> A : refused
  end
end
R -> A : @startcrash block
A -> C : parse(source)
alt crash when parsing
  C --> A : ProtectedCommand error
else crash when finalizing
  C -> A : checkFinalError throws
  A -> A : catch, Fatal crash error (T1d)
else otherwise
  C --> A : CrashDiagram, typed BPM
end
A --> R : diagram or merged refusal
R -> E : refusal or draw-time throw
E --> R : our error page
note over A : path X is never a candidate under LEGACY,\nthe profile of both the oracle and the library default (D5)
@enduml
```
