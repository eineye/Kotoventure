#!/usr/bin/env python3
"""Split a 4-column translation table (key, ja, zh, es) into i18n/tl/<lang>-<name>.tsv files.
usage: split-ui.py i18n/tl4/<name>.tsv"""
import os, sys
src = sys.argv[1]
name = os.path.splitext(os.path.basename(src))[0]
out = {l: [] for l in ('ja', 'zh', 'es')}
for line in open(src, encoding='utf-8'):
    line = line.rstrip('\n')
    if not line: continue
    k, ja, zh, es = line.split('\t')
    out['ja'].append(f'{k}\t{ja}'); out['zh'].append(f'{k}\t{zh}'); out['es'].append(f'{k}\t{es}')
tl = os.path.join(os.path.dirname(__file__), '..', 'i18n', 'tl')
for l, rows in out.items():
    open(os.path.join(tl, f'{l}-{name}.tsv'), 'w', encoding='utf-8').write('\n'.join(rows) + '\n')
print(name, len(out['ja']))
