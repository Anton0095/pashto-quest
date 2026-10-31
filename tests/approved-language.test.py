"""Exact owner approval boundaries, including the later nun correction."""
import copy,json,sys
from pathlib import Path
sys.path.insert(0,'tools')
import build
from curriculum_schema import is_user_approved,is_native_approved
read=lambda name:json.loads(Path('content/'+name+'.json').read_text())
a=read('USER_LANGUAGE_APPROVALS');l=read('LIBRARY_LEXICON');n=read('NARRATIVE_EXPRESSIONS');p=read('FIXED_PHRASES')
assert len(a['lemmas'])==len(l['entries'])==473
for e,r in zip(l['entries'],a['lemmas']):
 assert e['lemmaId']==r['lemmaId'] and is_user_approved(e) and not is_native_approved(e)
 assert (e['displayLemmaPs'],e['englishSenses'],e['romanisation'])==(r['pashto'],r['englishSenses'],r['romanisation'])
 assert all(not f.get('userVerified') and f['reviewStatus']!='user_approved' for f in e['forms'])
 for key in ['reviewer','date','reference']:
  bad=copy.deepcopy(e);bad['userApproval'].pop(key);assert not is_user_approved(bad)
assert next(e for e in l['entries'] if e['displayLemmaPs']=='نن')['romanisation']=='nun'
assert len(p['phrases'])==18 and all(is_user_approved(x) for x in p['phrases'])
assert len([e for e in n['expressions'] if e['active']])==14
assert {e['id'] for e in n['expressions'] if not e['active']}==set(a['stillUntranslatedPhraseIds'])
assert next(x for x in p['phrases'] if x['id']=='phrase-day-7-opening')['day']==5
assert all(not x.get('userVerified') for x in read('DISTRICT_VOCABULARY_CANDIDATES')['candidates'])
build.build()
print('PASS 473 exact user-approved bases, 18 phrases, nun, unapproved forms/candidates, evidence boundaries and build')
