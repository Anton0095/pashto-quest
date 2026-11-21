"""Exact owner approval boundaries, including the later nun correction."""
import copy,json,sys
from pathlib import Path
sys.path.insert(0,'tools')
import build
from curriculum_schema import is_user_approved,is_native_approved
read=lambda name:json.loads(Path('content/'+name+'.json').read_text())
a=read('USER_LANGUAGE_APPROVALS');l=read('LIBRARY_LEXICON');n=read('NARRATIVE_EXPRESSIONS');p=read('FIXED_PHRASES')
_, active = build.approval_records('lemmas')
assert len(a['lemmas']) == 474
assert len(active) == len(l['entries']) == 473
for e in l['entries']:
 r = active[e['lemmaId']]
 assert e['lemmaId']==r['lemmaId'] and is_user_approved(e) and not is_native_approved(e)
 assert (e['displayLemmaPs'],e['englishSenses'],e['romanisation'])==(r['pashto'],r['englishSenses'],r['romanisation'])
 assert all(not f.get('userVerified') and f['reviewStatus']!='user_approved' for f in e['forms'])
 for key in ['reviewer','date','reference']:
  bad=copy.deepcopy(e);bad['userApproval'].pop(key);assert not is_user_approved(bad)
assert next(e for e in l['entries'] if e['displayLemmaPs']=='نن')['romanisation']=='nun'
assert len(p['phrases'])==18 and all(is_user_approved(x) for x in p['phrases'])
assert len([e for e in n['expressions'] if e['active']])==14
# These historical pending slots were removed in the onboarding cleanup; they must stay absent.
assert set(a['stillUntranslatedPhraseIds']).isdisjoint({e['id'] for e in n['expressions']} | {e['id'] for e in p['phrases']})
assert next(x for x in p['phrases'] if x['id']=='phrase-day-7-opening')['day']==5
assert all(not x.get('userVerified') for x in read('DISTRICT_VOCABULARY_CANDIDATES')['candidates'])
entries = {e['lemmaId']: e for e in l['entries']}
for name, pashto, roman in [('tree', 'ونه', 'wona'), ('brother', 'ورور', 'wror'),
                           ('flower', 'ګل', 'gul'), ('wife', 'مېرمن', 'merman'),
                           ('purse', 'همياني', 'humyani')]:
 identity = 'lemma:expansion:noun:' + name
 entry = entries[identity]
 citation = next(f for f in entry['forms'] if f['formId'] == identity + ':citation')
 assert (entry['displayLemmaPs'], entry['romanisation']) == (pashto, roman)
 assert (citation['pashto'], citation['romanisation']) == (pashto, roman)
assert entries['lemma:n-bag3']['displayLemmaPs'] == 'کڅوړه'
assert entries['lemma:expansion:noun:purse']['englishSenses'] == ['Purse']
assert all(entries['lemma:expansion:noun:purse']['forms'][0]['morphology'][key] is None
           for key in ('gender', 'number', 'case'))
assert 'lemma:expansion:noun:parent' not in entries
assert any(r['lemmaId'] == 'lemma:expansion:noun:parent' for r in a['lemmas'])
for identity in ['bilal-day-1', 'bilal-day-1-correct']:
 event = read('RPG_WORLD')['events'][identity]
 assert 'jheel' in event['pashto']['roman'] and 'jaheel' not in event['pashto']['roman']
build.build()
print('PASS 473 active exact user-approved bases, 18 phrases, nun, unapproved forms/candidates, evidence boundaries and build')
