# Data flow: one unresolvable colour token

How a token `HColorSet` cannot parse travels, and which upstream method decides what the jar draws. Today's class and
description sites skip the decision and keep the raw token; this mission adds it at each site (D2).

```plantuml
@startuml
start
:colour token from the source line;
switch (where the token came from)
case (arrow style -[#x]->)
  :WithLinkType.applyStyle
  (WithLinkType.java:161-163);
  :getColorOrWhite;
  :unknown token draws white #FFF;
case (name:value part #line:x)
  :Colors constructor
  (Colors.java:105-113);
  :getColorOrNull;
  :null claims the key and clears an earlier value;
  :the element draws its default colour;
case (style value)
  :ValueImpl.asColor
  (ValueImpl.java:92-108);
  :getColorOrWhite;
  :unknown token draws white #FFF;
case (bare token #x)
  :getColor throws NoSuchColorException;
  :the jar draws an error page;
  :out of scope here, the 143 neutral grey applies;
endswitch
:a valid fill or stroke value in the SVG;
stop
@enduml
```
