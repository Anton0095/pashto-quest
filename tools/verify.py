#!/usr/bin/env python3
"""One verification entry point; default includes every browser suite."""
import argparse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import shlex
import subprocess
import tempfile

ROOT=Path(__file__).resolve().parents[1]
(ROOT / 'work').mkdir(exist_ok=True)
parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--quick',action='store_true',help='Syntax, model, corpus and build checks only; browsers are explicitly unrun')
args=parser.parse_args()
logs=Path(tempfile.mkdtemp(prefix='pashto-quest-checks-'))

def run(command):
    result=subprocess.run(command,cwd=ROOT,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    name='-'.join(command).replace('/','_')+'.log'
    (logs/name).write_text(result.stdout)
    print(('PASS ' if result.returncode==0 else 'FAIL ')+shlex.join(command),flush=True)
    if result.returncode:print('\n'.join(result.stdout.splitlines()[-30:]),flush=True)
    return result.returncode==0

commands=[['python3','tools/build.py','--check'],['python3','tools/curriculum-audit.py','--check'],['python3','tools/vocabulary-review.py','--check'],['python3','tests/curriculum-schema.test.py'],['node','tests/curriculum-first.test.mjs'],['node','tests/productive-generation.test.mjs'],['node','tests/generated-architecture.test.mjs'],['node','tests/generated-dialogue.test.mjs'],['node','tools/generation-audit.mjs','--check'],['node','tools/district-inventory.mjs','--check'],['node','tests/cleanup-model.test.mjs'],['node','tests/current-model.test.mjs'],['node','tests/game-state.test.mjs'],['node','tests/audio.test.mjs'],['node','tests/curriculum-expansion.test.mjs'],['python3','tests/district-content.test.py']]
commands += [['node','tests/'+name+'.test.mjs'] for name in ['p1-regression','p1-storage','generation-cache','audit-save','audit-teaching','audit-compaction']]
commands += [['python3','tests/approval-status.test.py'],['node','tests/approval-status.test.mjs']]
commands += [['node','--check',str(path.relative_to(ROOT))] for directory,pattern in [('src','*.js'),('tools','*.mjs'),('tests','*.mjs')] for path in sorted((ROOT/directory).glob(pattern))]
passed=True
for command in commands:passed=run(command) and passed
script=(ROOT/'index.html').read_text().split('<script>')[1].split('</script>')[0]
compiled=subprocess.run(['node','--check'],input=script,text=True,capture_output=True,cwd=ROOT)
passed=compiled.returncode==0 and passed
print('PASS compiled release syntax' if compiled.returncode==0 else compiled.stderr)
if not args.quick:
    browsers=[['node','tests/'+name+'.test.mjs'] for name in ['audit-teaching-browser','audit-tabs','narrative-feedback','p1-browser','cleanup-browser','generated-learning','resume-behaviour','challenge-disclosure','independent-browser','full-curriculum']]
    with ThreadPoolExecutor(max_workers=2) as executor:
        passed=all(list(executor.map(run,browsers))) and passed
    if passed:
        passed=run(['node','tools/delivery-audit.mjs','--write']) and passed
        passed=run(['node','tools/delivery-audit.mjs','--check']) and passed
else:
    print('UNRUN browser suites (--quick)')
    passed=run(['node','tools/delivery-audit.mjs','--check']) and passed
print('Logs:',logs)
raise SystemExit(0 if passed else 1)
