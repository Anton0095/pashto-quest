#!/usr/bin/env python3
"""Bundle the editable Library lexicon and runtime into the offline single-file game."""
import argparse
import json
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
START='// BEGIN LIBRARY BUNDLE'
END='// END LIBRARY BUNDLE'
def render(html):
    data=json.loads((ROOT/'content/LIBRARY_LEXICON.json').read_text())
    encoded=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<',r'\u003c').replace('\u2028',r'\u2028').replace('\u2029',r'\u2029')
    block=START+'\nconst LIBRARY_DATA='+encoded+';\n'+(ROOT/'src/library-engine.js').read_text()+'\n'+(ROOT/'src/library-ui.js').read_text()+'\n'+END
    if START in html:
        return re.sub(re.escape(START)+r'.*?'+re.escape(END),lambda _:block,html,count=1,flags=re.S)
    return html.replace('const EXAM_VERSION=2, XP_STEP=200;',block+'\nconst EXAM_VERSION=2, XP_STEP=200;',1)
if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--check',action='store_true');args=p.parse_args()
    path=ROOT/'index.html';old=path.read_text();new=render(old)
    if args.check and old!=new:raise SystemExit('Library bundle stale: run python3 tools/embed_library.py')
    if not args.check:path.write_text(new)
    print('Library bundle synchronized.')
