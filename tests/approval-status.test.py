"""Synthetic approval records only; no real language record is modified."""
import copy,json,re,runpy,sys
from pathlib import Path
sys.path.insert(0,str(Path('tools').resolve()))
import build
from curriculum_schema import is_native_approved
raw=json.loads(Path('content/LIBRARY_LEXICON.json').read_text());data=copy.deepcopy(raw)
e=next(e for e in data['entries'] if e.get('promotionCandidateId'));e['reviewStatus']='native_approved';e['nativeReview']={'reviewer':'SYNTHETIC FIXTURE ONLY','reference':'fixture://not-a-real-language-review'}
assert is_native_approved(e);build.validate(data)
html=build.build();embedded=json.loads(re.search(r'const LIBRARY_DATA=(\{.*?\});',html,re.S)[1]);fake=next(v for v in embedded['entries'] if v['lemmaId']==e['lemmaId']);fake.update(reviewStatus=e['reviewStatus'],nativeReview=e['nativeReview'])
module=runpy.run_path('tools/curriculum-audit.py');fn=module['rendered'];fn.__globals__['build']=lambda:re.sub(r'const LIBRARY_DATA=\{.*?\};',lambda m:'const LIBRARY_DATA='+json.dumps(embedded)+';',html,count=1,flags=re.S)
assert json.loads(fn())['nativeCertifiedLemmas']==1
fake['nativeReview']={};assert json.loads(fn())['nativeCertifiedLemmas']==0
e['nativeReview']={}
try:build.validate(data);raise AssertionError('Missing review accepted')
except ValueError:pass
e['reviewStatus']='approved';e['nativeReview']={'reviewer':'SYNTHETIC','reference':'fixture://legacy'}
assert not is_native_approved(e)
try:build.validate(data);raise AssertionError('Noncanonical status accepted')
except ValueError:pass
assert json.loads(Path('content/LIBRARY_LEXICON.json').read_text())==raw
print('PASS synthetic canonical approval, evidence rejection and audit counts; real lexicon unchanged')
