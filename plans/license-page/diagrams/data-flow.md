# Data flow: the license page

A `license` source reaches `PSystemLicense`, which draws `License#getText1` then `#getText2` as one block of text
lines. T1 changes only what the four `License` methods push; T2a and T2b account for the rows that change.

```plantuml
@startuml
start
:source with the single line "license" (or licence, LICENSE);
:PSystemLicenseFactory accepts it;
:PSystemLicense asks License for getText1;
:header1 pushes the free-edition banner (ruling item 1);
:PSystemLicense asks License for getText2;
:header2 pushes the copyright and project lines (items 1 and 2);
:end3 calls addMit (item 3);
:end3 pushes the images paragraph (items 4 and 5);
:end3 pushes the GraphViz lines (item 6);
:end3 pushes the credits (item 7);
if (elk-engine has replaced elkjs at T1?) then (yes)
  :the ELK credit line is pushed;
else (no)
  :the line is omitted and a needs-ruling issue is filed;
endif
:GraphicStrings draws every line;
:the authored ratchet compares the SVG with the jar oracle;
:the three changed rows are signed in the ledger;
stop
@enduml
```
