#!/usr/bin/env python3
"""dss T0d: T0c's probes as authored rows (user ruling 2026-11-02). Usage: gen-probe-rows.py <out-dir>

They exercise reader sites the `cascade` rows do not reach (reader-audit.md section 2). Writes
.puml only; oracles come from scripts/oracle-render.sh.
"""
import sys,os
OUT=sys.argv[1]
def row(name,text,tag='uml'):
    open(f'{OUT}/{name}.puml','w').write(f'@start{tag}\n{text}@end{tag}\n')
def style(t): return f'<style>\n{t}</style>\n'
def bare(n,p,c): return f'{n} {{\n  {p} {c}\n}}\n'
PROPS=[('bg','BackgroundColor','#AAAAAA'),('line','LineColor','#BB0000'),('font','FontColor','#0000BB')]
BODIES={
 'activity':{'lanes':('activityDiagram',"|L1|\nstart\n:a;\n|L2|\n:b;\npartition P {\n  :c;\n}\ngroup G\n  :d;\nend group\nstop\n"),
   'loops':('activityDiagram',"start\nwhile (c) is (y)\n:a;\nendwhile (n)\nrepeat\n:b;\nrepeat while (d) is (y) not (n)\nswitch (x)\ncase (1)\n:e;\ncase (2)\n:f;\nendswitch\nsplit\n:g;\nsplit again\n:h;\nend split\nfloating note left: fl\n(A)\n:i;\nend\n"),
   'sdl':('activityDiagram',"start\n:a|\n:b<\n:c>\n:d/\n:e]\n:f}\n:g;\nnote right\n  m\nend note\nnote left: k\nstop\n")},
 'state':{'flatnote':('stateDiagram',"state A\nA --> B : l\nnote left of A : n\nnote \"free\" as F\nnote on link : k\n"),
   'pseudo':('stateDiagram',"state f <<fork>>\nstate j <<join>>\nstate c <<choice>>\nstate r <<sdlreceive>>\nf --> j\nj --> c\nc --> r\n[*] --> f\nr --> [*]\n"),
   'hist':('stateDiagram',"state S {\n  [*] --> a\n  a --> [H]\n  a --> [H*]\n}\nstate T {\n  state en <<entryPoint>>\n  state ex <<exitPoint>>\n  en --> b\n  b --> ex\n}\nS --> T\n"),
   'conc':('stateDiagram',"state S {\n  a --> b\n  --\n  c --> d\n}\nstate X : body line\nX --> S\n"),
   'cluster':('stateDiagram',"state A {\n  state B {\n    c --> d\n  }\n  e --> B\n}\nA --> z\nz --> B\n")},
 'class':{'notes':('classDiagram',"class A\nclass B\nA --> B\nnote on link : k\nnote \"free\" as N\nN .. A\nnote top of B : t\n"),
   'kinds':('classDiagram',"class A <<S>> {\n  +x\n  {method} y()\n}\nannotation An\nentity En\nexception Ex\nA \"1\" --> \"2\" An : lab\nnamespace N {\n  class C\n}\npackage P2 <<Cloud>> {\n  class D\n}\npackage P3 <<Rectangle>> {\n  class D2\n}\nA o-- En\n<> dia\nA -- dia\nEx -- dia\n"),
   'generic':('classDiagram',"class G<T> {\n  v\n}\nclass Q\nQ::a --> G\ncircle ci\nci -- Q\n() lp\nlp -- Q\n")},
 'object':{'kinds':('objectDiagram',"object O\nO : a = 1\nmap M {\n k => v\n}\njson J {\n \"a\": 1\n}\nO --> M\nnote top of O : n\n")},
 'component':{'syms':('componentDiagram',"agent a\nartifact b\nboundary c\ncard d\ncollections e\ncontrol f\nentity g\nfile h\nfolder i\nframe j\nhexagon k\nnode l\nperson m\nqueue n\nrectangle o\nstack p\nstorage q\nusecase r\nactor s\ncomponent t\ninterface u\ndatabase v\ncloud w\nlabel x\n"),
   'clusters':('componentDiagram',"node N {\n  [a]\n}\nfolder F {\n  [b]\n}\nframe Fr {\n  [c]\n}\ncloud C {\n  [d]\n}\ndatabase D {\n  [e]\n}\nrectangle R {\n  [f]\n}\ncomponent K {\n  [g]\n  port p1\n}\ncard Ca {\n  [h]\n}\nstorage St {\n  [i]\n}\nqueue Q {\n  [j]\n}\n"),
   'links':('componentDiagram',"[a] --> [b] : lab\nnote on link : k\nnote \"free\" as N\nN .. [a]\nnote top of [b] : t\n() lp\nlp - [a]\n")},
}
FORMS={'diag':lambda n,p,c:bare(n,p,c),'element':lambda n,p,c:bare('element',p,c),'root':lambda n,p,c:bare('root',p,c)}
for e,bs in BODIES.items():
    for bn,(n,b) in bs.items():
        row(f'{e}__{bn}-none',b)
        for pk,p,c in PROPS:
            for fk,f in FORMS.items():
                row(f'{e}__{bn}-{pk}-{fk}',style(f(n,p,c))+b)
# object rows: classDiagram bare form too (D4)
b=BODIES['object']['kinds'][1]
for pk,p,c in PROPS:
    row(f'object__kinds-{pk}-classdiag',style(bare('classDiagram',p,c))+b)
# D3/D5 probes
NOTE='class A\nnote left of A : n\n'
def N(c): return 'classDiagram {\n  note {\n    BackgroundColor %s\n  }\n}\n'%c
def M(c): return 'note {\n  BackgroundColor %s\n}\n'%c
row('class__d3-aba-default',style(N('#AAAAAA')+M('#BBBBBB')+N('#FEFFDD'))+NOTE)
row('class__d3-bab-default',style(M('#AAAAAA')+N('#BBBBBB')+M('#FEFFDD'))+NOTE)
row('class__d3-skin-element-default','skinparam noteBackgroundColor #AAAAAA\n'+style(bare('element','BackgroundColor','#FEFFDD'))+NOTE)
row('class__d3-skin-note-default','skinparam noteBackgroundColor #AAAAAA\n'+style(bare('note','BackgroundColor','#FEFFDD'))+NOTE)
row('class__d3-skin-class-root-default','skinparam classBackgroundColor #AAAAAA\n'+style(bare('root','BackgroundColor','#F1F1F1'))+'class A\n')
row('class__d3-skin-class-element-default','skinparam classBackgroundColor #AAAAAA\n'+style(bare('element','BackgroundColor','#F1F1F1'))+'class A\n')
row('class__d3-style-class-then-element-default',style(bare('class','BackgroundColor','#AAAAAA')+bare('element','BackgroundColor','#F1F1F1'))+'class A\n')
row('component__d3-style-comp-then-element-default',style(bare('component','BackgroundColor','#AAAAAA')+bare('element','BackgroundColor','#F1F1F1'))+'[A]\n')
row('component__d3-skin-comp-then-root-default','skinparam componentBackgroundColor #AAAAAA\n'+style(bare('root','BackgroundColor','#F1F1F1'))+'[A]\n')
row('state__d3-skin-state-then-element-default','skinparam stateBackgroundColor #AAAAAA\n'+style(bare('element','BackgroundColor','#F1F1F1'))+'state A\n')
# D5 own-prefix residual leaks
row('object__d5-classdiag-object',style('classDiagram {\n  object {\n    BackgroundColor #AAAAAA\n  }\n}\n')+'object O\n')
row('class__d5-objectdiag-class',style('objectDiagram {\n  class {\n    BackgroundColor #AAAAAA\n  }\n}\n')+'class C\n')
row('class__d5-objectdiag-bare',style('objectDiagram {\n  BackgroundColor #AAAAAA\n}\n')+'class C\nobject O\n')
row('object__d5-objectdiag-object',style('objectDiagram {\n  object {\n    BackgroundColor #AAAAAA\n  }\n}\n')+'object O\n')
row('state__d5-classdiag-state',style('classDiagram {\n  state {\n    BackgroundColor #AAAAAA\n  }\n}\n')+'state A\n')
row('state__d5-activitydiag-diamond',style('activityDiagram {\n  diamond {\n    BackgroundColor #AAAAAA\n  }\n}\n')+'state c <<choice>>\nc --> d\n')
row('state__d5-activitydiag-activity',style('activityDiagram {\n  activity {\n    BackgroundColor #AAAAAA\n  }\n}\n')+'state c <<choice>>\nc --> d\n')
row('usecase__d5-usecasediag',style('usecaseDiagram {\n  usecase {\n    BackgroundColor #AAAAAA\n  }\n}\n')+'(A)\n')
row('component__d5-componentdiag',style('componentDiagram {\n  component {\n    BackgroundColor #AAAAAA\n  }\n}\n')+'[A]\n')
# D2: one bucket, two signatures
row('component__d2-rect-then-group',style(bare('rectangle','BackgroundColor','#AAAAAA')+bare('group','BackgroundColor','#BBBBBB'))+'rectangle R {\n  rectangle S\n}\n')
row('component__d2-group-then-rect',style(bare('group','BackgroundColor','#BBBBBB')+bare('rectangle','BackgroundColor','#AAAAAA'))+'rectangle R {\n  rectangle S\n}\n')
row('sequence__d2-stereo',style('note {\n  BackgroundColor #AAAAAA\n  .t {\n    BackgroundColor #BBBBBB\n  }\n}\n')+'A -> B\nnote left <<t>> : n\nnote right: m\n')
# D3: theme + unrelated style / element
row('sequence__d3-theme-unrelated','!theme cyborg\n'+style(bare('note','BackgroundColor','#AAAAAA'))+'A -> B\n')
row('sequence__d3-theme-only','!theme cyborg\nA -> B\n')
row('class__d3-theme-unrelated','!theme cyborg\n'+style(bare('note','BackgroundColor','#AAAAAA'))+'class A\n')
row('class__d3-theme-only','!theme cyborg\nclass A\n')
row('class__d3-theme-element','!theme cyborg\n'+style(bare('element','BackgroundColor','#AAAAAA'))+'class A\n')
row('class__d3-skin-rose-element','skin rose\n'+style(bare('element','FontColor','#0000BB'))+'class A\n')
# nested
row('class__nested-skinparam-bg','skinparam backgroundColor #AAAAAA\nskinparam noteBackgroundColor #BBBBBB\nclass A {\n  {{\n    A -> B\n    note left: n\n  }}\n}\n')
row('class__nested-skinparam-note-then-style','skinparam noteBackgroundColor #BBBBBB\nclass A {\n  {{\n    <style>\n    note {\n      BackgroundColor #AAAAAA\n    }\n    </style>\n    A -> B\n    note left: n\n  }}\n}\n')
row('class__nested-style-then-skinparam','skinparam noteBackgroundColor #BBBBBB\nclass A {\n  {{\n    skinparam noteBackgroundColor #CCCCCC\n    <style>\n    note {\n      BackgroundColor #AAAAAA\n    }\n    </style>\n    A -> B\n    note left: n\n  }}\n}\n')
row('class__nested-note-only','skinparam noteBackgroundColor #BBBBBB\n'+style(bare('classDiagram','BackgroundColor','#AAAAAA'))+'class A {\n  {{\n    A -> B\n    note left: n\n  }}\n}\n')
# stale-flat-value cases (D3a)
row('class__x-line-black',style(bare('note','FontColor','#AAAAAA')+bare('element','FontColor','black'))+NOTE)
row('class__x-note-root-default',style(bare('note','BackgroundColor','#AAAAAA')+bare('root','BackgroundColor','#FEFFDD'))+NOTE)
row('component__x-skin-exact','skinparam componentBackgroundColor #AAAAAA\n'+style(bare('root','BackgroundColor','#f1f1f1'))+'[A]\n')
row('component__x-style-exact',style(bare('component','BackgroundColor','#AAAAAA')+bare('element','BackgroundColor','#f1f1f1'))+'[A]\n')
row('state__x-state-element-default',style(bare('state','LineColor','#AAAAAA')+bare('element','LineColor','#181818'))+'state A\n')
# T1a's findings: a malformed block's own colour (D6a); value identity, not colour equality, under dark (D3)
row('sequence__scope-malformed-colour',style('document {\n  BackgroundColor #AAAAAA\n}\nnote {\n  FontSize\n}\n}\n')+'A -> B\n')
row('sequence__scope-dark-explicit-white','skinparam mode dark\n'+style('document {\n  BackgroundColor white\n}\n')+'A -> B\n')
row('sequence__scope-dark-skinparam-white','skinparam mode dark\nskinparam backgroundColor white\n'+style(bare('note','BackgroundColor','#AAAAAA'))+'A -> B\n')
