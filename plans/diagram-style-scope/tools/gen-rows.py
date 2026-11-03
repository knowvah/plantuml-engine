#!/usr/bin/env python3
"""dss T0b: author the diagram-style-scope rows. Usage: gen-rows.py <out-dir>

Writes <engine>__<group>-<case>.puml only; oracles come from
scripts/oracle-render.sh. Bodies are deliberately small except the cascade
group, whose richer bodies put every element kind under the selector.
"""
import sys

OUT = sys.argv[1]
A, B, WHITE = '#AAAAAA', '#BBBBBB', '#FFFFFF'


def row(name, tag, text):
    with open(f'{OUT}/{name}.puml', 'w') as f:
        f.write(f'@start{tag}\n{text}@end{tag}\n')


def style(text):
    return f'<style>\n{text}</style>\n'


def own(n, c):
    return f'{n} {{\n  document {{\n    BackgroundColor {c}\n  }}\n}}\n'


def bare(n, c, p='BackgroundColor'):
    return f'{n} {{\n  {p} {c}\n}}\n'


def rev(n, c):
    return f'document {{\n  {n} {{\n    BackgroundColor {c}\n  }}\n}}\n'


def doc(c):
    return bare('document', c)


def nested(n, s, p, c):
    return f'{n} {{\n  {s} {{\n    {p} {c}\n  }}\n}}\n'


# engine: (start tag, minimal body, the name the jar's own document signature uses)
SMALL = {
    'sequence': ('uml', 'A -> B\n', 'sequenceDiagram'),
    'class': ('uml', 'class A\n', 'classDiagram'),
    'object': ('uml', 'object A\n', 'objectDiagram'),
    'state': ('uml', '[*] --> A\n', 'stateDiagram'),
    'component': ('uml', '[A]\n', 'componentDiagram'),
    'usecase': ('uml', '(A)\n', 'usecaseDiagram'),
    'activity': ('uml', 'start\n:a;\nstop\n', 'activityDiagram'),
    'mindmap': ('mindmap', '* A\n', 'mindmapDiagram'),
    'wbs': ('wbs', '* A\n', 'wbsDiagram'),
    'gantt': ('gantt', '[A] lasts 1 day\n', 'ganttDiagram'),
    'salt': ('salt', '{\n  Hello\n}\n', 'saltDiagram'),
    'json': ('json', '{"a": 1}\n', 'jsonDiagram'),
    'yaml': ('yaml', 'a: 1\n', 'yamlDiagram'),
    'files': ('files', '/a\n', 'filesDiagram'),
}

# Group selector: each engine x the four selector forms.
for e, (t, b, n) in SMALL.items():
    foreign = 'usecaseDiagram' if e == 'class' else 'classDiagram'
    for case, s in [
        ('own-doc', own(n, A)),
        ('own-bare', bare(n, A)),
        ('reversed', rev(n, A)),
        ('foreign-doc', own(foreign, A)),
    ]:
        row(f'{e}__selector-{case}', t, style(s) + b)

# DiagramType#getStyleName's final `return SName.activityDiagram` (files, board).
row('files__selector-activitydiagram', 'files', style(own('activityDiagram', A)) + SMALL['files'][1])
row('board__selector-activitydiagram', 'board', style(own('activityDiagram', A)) + 'A\n+B\n')

# Group variant: sequence's own selector across value kinds and interactions.
SEQ = SMALL['sequence'][1]
sd = 'sequenceDiagram'
for case, s, pre in [
    ('solid', own(sd, A), ''),
    ('gradient', own(sd, 'red/blue'), ''),
    ('black', own(sd, 'black'), ''),
    ('over-doc', doc('pink') + own(sd, A), ''),
    ('mismatched', own('classDiagram', A), ''),
    ('title', own(sd, A), 'title T\n'),
]:
    row(f'sequence__variant-{case}', 'uml', pre + style(s) + SEQ)

# Group order: two matching declarations, the later one wins in the jar.
ORD = {
    'sequence': ('uml', SEQ, sd),
    'class': ('uml', 'class A\n', 'classDiagram'),
    'json': ('json', '{"a": 1}\n', 'jsonDiagram'),
}
for e, (t, b, n) in ORD.items():
    root = lambda c: bare('root', c)
    for case, s in {
        'root-only': root(A),
        'element-only': bare('element', A),
        'doc-then-own': doc(A) + own(n, B),
        'own-then-doc': own(n, A) + doc(B),
        'bare-then-own': bare(n, A) + own(n, B),
        'own-then-bare': own(n, A) + bare(n, B),
        'bare-then-doc': bare(n, A) + doc(B),
        'doc-then-bare': doc(A) + bare(n, B),
        'own-then-rev': own(n, A) + rev(n, B),
        'rev-then-own': rev(n, A) + own(n, B),
        'root-then-bare': root(A) + bare(n, B),
        'bare-then-root': bare(n, A) + root(B),
        'both-types': nested('classDiagram', 'sequenceDiagram', 'BackgroundColor', A),
    }.items():
        row(f'{e}__order-{case}', t, style(s) + b)
    for case, text in {
        'skin-then-own': f'skinparam backgroundColor {A}\n' + style(own(n, B)),
        'own-then-skin': style(own(n, A)) + f'skinparam backgroundColor {B}\n',
        'skin-then-doc': f'skinparam backgroundColor {A}\n' + style(doc(B)),
        'doc-then-skin': style(doc(A)) + f'skinparam backgroundColor {B}\n',
        # A later style that restates the default must still beat the skinparam (D3).
        'skin-then-white': f'skinparam backgroundColor {A}\n' + style(doc(WHITE)),
    }.items():
        row(f'{e}__order-{case}', t, text + b)

# Group element-order: re-declared and competing element selectors.
NOTE_BODY = 'class A\nnote left of A : n\n'
N = lambda c: nested('classDiagram', 'note', 'BackgroundColor', c)
M = lambda c: bare('note', c)
for case, s in {
    'aba': N(A) + M(B) + N('#CCCCCC'),
    'bab': M(A) + N(B) + M('#CCCCCC'),
    'root-last': N(A) + bare('root', B),
    'elem-then-class': bare('element', A) + bare('class', B),
    'class-then-elem': bare('class', A) + bare('element', B),
}.items():
    row(f'class__element-order-{case}', 'uml', style(s) + NOTE_BODY)
row(
    'class__element-order-skin-then-default',
    'uml',
    f'skinparam classBackgroundColor {A}\n' + style(bare('class', '#F1F1F1')) + NOTE_BODY,
)

# Group scope: bucket leaks, skins, themes, dark mode, malformed styles.
for name, s, body in [
    ('sequence__scope-note-classdiagram', nested('classDiagram', 'note', 'BackgroundColor', 'red'), 'A -> B\nnote left: n\n'),
    ('sequence__scope-note-sequencediagram', nested(sd, 'note', 'BackgroundColor', 'red'), 'A -> B\nnote left: n\n'),
    ('class__scope-note-sequencediagram', nested(sd, 'note', 'BackgroundColor', 'red'), NOTE_BODY),
    ('class__scope-note-objectdiagram', nested('objectDiagram', 'note', 'BackgroundColor', 'red'), NOTE_BODY),
    ('state__scope-state-classdiagram', nested('classDiagram', 'state', 'BackgroundColor', 'red'), 'state A\n'),
]:
    row(name, 'uml', style(s) + body)
for case, text in {
    'theme-style': '!theme cerulean\n' + style(doc(A)),
    'theme-only': '!theme cerulean\n',
    'dark-style': 'skinparam mode dark\n' + style(doc(A)),
    'dark-own': 'skinparam mode dark\n' + style(own(sd, A)),
    'dark-unrelated-style': 'skinparam mode dark\n' + style(bare('note', A)),
    'skin-rose-style': 'skin rose\n' + style(doc(A)),
    'skin-debug': 'skin debug\n',
    'malformed-brace': '<style>\ndocument {\n  BackgroundColor\n}\n}\n</style>\n',
    'unknown-sname': style(bare('notAnSName', 'red')),
}.items():
    row(f'sequence__scope-{case}', 'uml', text + SEQ)
row('class__scope-nested-embed', 'uml', style(own('classDiagram', A)) + 'class A {\n  {{\n    A -> B\n  }}\n}\n')

# Group cascade: bg, line, font x four selector forms over a rich body, plus a
# style-free baseline row (a row's bar is its delta over that baseline).
RICH = {
    'sequence': ('uml', 'participant P\nactor U\ndatabase D\nP -> U : m\nactivate U\nnote left: n\nU --> D : r\ngroup g\nP -> D\nend\nref over P : x\n== d ==\n', sd),
    'class': ('uml', 'class C {\n  a\n}\ninterface I\nenum E\nabstract A\nC --> I : l\nnote left of C : n\npackage P {\n  class Q\n}\n', 'classDiagram'),
    'object': ('uml', 'object O\nO : a = 1\nmap M {\n k => v\n}\nO --> M\nnote left of O : n\n', 'classDiagram'),
    'state': ('uml', '[*] --> A\nstate A {\n  [*] --> B\n}\nA --> [*] : l\nstate C <<choice>>\nA --> C\nnote left of A : n\n', 'stateDiagram'),
    'component': ('uml', '[C]\ninterface I\npackage P {\n  [D]\n}\ndatabase DB\ncloud X\nC --> I : l\nnote left of C : n\n', 'componentDiagram'),
    'usecase': ('uml', 'actor U\n(Do)\nrectangle R {\n  (X)\n}\nU --> (Do) : l\nnote left of U : n\n', 'componentDiagram'),
    'activity': ('uml', 'start\n:a;\nif (c) then (y)\n  :b;\nelse (n)\n  :d;\nendif\nfork\n  :e;\nfork again\n  :f;\nend fork\nnote left: n\nstop\n', 'activityDiagram'),
    'json': ('json', '{"a": 1, "b": [1, 2], "c": {"d": true}}\n', 'jsonDiagram'),
    'yaml': ('yaml', 'a: 1\nb:\n  c: 2\n', 'yamlDiagram'),
}
PROPS = [('bg', 'BackgroundColor', A), ('line', 'LineColor', '#BB0000'), ('font', 'FontColor', '#0000BB')]
for e, (t, b, n) in RICH.items():
    row(f'{e}__cascade-none', t, b)
    for key, p, c in PROPS:
        for form, s in {
            'diag': bare(n, c, p),
            'diag-element': nested(n, 'element', p, c),
            'element': bare('element', c, p),
            'root': bare('root', c, p),
        }.items():
            row(f'{e}__cascade-{key}-{form}', t, style(s) + b)
