# Component map

What the mission creates (`src/diagrams/regex/`) and what it imports. Rendered through the jar at planning (parses as
DESCRIPTION). The two cross-package edges into `ebnf` and `json` are the layering entries of D1 and D3.

```plantuml
@startuml
title regex-engine-port components
package "src/diagrams/regex (new)" {
  [PSystemRegexFactory] as F
  [CommandRegexfSingleLine] as C
  [PSystemRegex] as D
  [RegexExpression] as X
  [ShuntingYard] as Y
  [GroupSplitter] as G
  [regex-common-commands\nregex-style-dispatch\nregex-skin-param] as H
}
package "src/diagrams/ebnf (eep)" {
  [ETile and subclasses, Symbol] as T
}
package "src/diagrams/json" {
  [StyleExtractor] as S
}
package "src/core" {
  [CharInspector, BlocLines, I18n] as U
  [TitledDiagram] as TD
  [block-extractor, registered-plugins,\ndocument-back-color, assemble-svg] as R
}
R --> F : routes regex
F --> C : registers
F --> H : common commands
C --> D : addBlocLines
D --> X : parse
D --> Y : postfix order
D --> G : split groups
D --> T : builds tiles
D --> S : applyStyles
D --> TD : extends
X --> U : reads chars
@enduml
```
