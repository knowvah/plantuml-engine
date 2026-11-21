"""Re-dump the three style storage fixtures through probe/run.sh new.

Usage: python3 -I regen-fixtures.py <repo> <outdir>, then prettier --write
Writes plantuml-skin-storage.json, mindmap-idea-styles.json and
style-parser-storage.json into <outdir> (unformatted; prettier afterwards).
style-parser-storage.json keeps each case's existing form: `full` cases are
stored whole; delta cases store the leading stereotyped (legacy) styles plus
every plain style that differs, by index, from the skin dump
(storage-dump.ts expand()).
"""
import json
import os
import subprocess
import sys
import tempfile

repo, outdir = sys.argv[1], sys.argv[2]
fx = os.path.join(repo, 'tests/unit/core/style/fixtures')
run = os.path.join(fx, 'probe/run.sh')


def dump(puml, *extra):
    out = subprocess.run(['bash', run, 'new', puml, *extra], check=True,
                         capture_output=True, text=True).stdout
    return json.loads(out)


def write(name, data):
    with open(os.path.join(outdir, name), 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write('\n')


skin = dump(os.path.join(fx, 'probe/r.puml'))
write('plantuml-skin-storage.json', skin)

ideas = {
    'depth': dump(os.path.join(repo, 'test-results/dot-cache/mindmap/cejije-94-xibi793/in.puml'), 'ideas'),
    'stereo': dump(os.path.join(fx, 'probe/stereo.puml'), 'ideas'),
}
write('mindmap-idea-styles.json', ideas)

with open(os.path.join(fx, 'style-parser-storage.json')) as f:
    cases = json.load(f)
result = {}
tmp = tempfile.mkdtemp()
for name, c in cases.items():
    p = os.path.join(tmp, name + '.puml')
    with open(p, 'w') as f:
        f.write(c['source'])
    full = dump(p)
    if 'full' in c:
        result[name] = {'source': c['source'], 'full': full}
        continue
    n = 0
    while n < len(full) and full[n]['stereotypes']:
        n += 1
    legacy, plain = full[:n], full[n:]
    assert all(not s['stereotypes'] for s in plain), name
    changed = {str(i): s for i, s in enumerate(plain) if i >= len(skin) or skin[i] != s}
    result[name] = {'source': c['source'], 'legacy': legacy,
                    'plainLength': len(plain), 'plainChanged': changed}
write('style-parser-storage.json', result)
