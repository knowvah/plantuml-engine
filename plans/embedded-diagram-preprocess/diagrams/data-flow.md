# Data flow: a one-line `{{ }}` embed, after T1c

The outer preprocessor sees `note top of a: \n{{\n!theme crt-amber\n...\n}}` as one line, so the directive survives
to the nested render. Since #3016 (in the pin `a720bdd`), the jar and the port both preprocess the body there. T1c
adds the `block` source label, which only an embedded error page prints.

```plantuml
@startuml
start
:outer preprocessor runs on the whole line;
note right: outer variables are substituted here
:the parser collects the embed body between the braces;
:nested renderSync(body, options + source description block);
note right
  src/index.ts:321 (T1c)
  jar: EmbeddedDiagram.from calls BlockUml.convert
  and labels every line "block"
end note
:the nested preprocessor runs, so !theme applies;
note right: jar: noDefinitions makes BlockUml run TimLoader
if (nested source parses?) then (yes)
  :draw the nested diagram, here 167x136;
else (no)
  :draw the nested error page;
  note right: prints From block (line N)
endif
:embed it as an image in the note;
stop
@enduml
```
