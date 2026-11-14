import json,unittest
from pathlib import Path
class Research(unittest.TestCase):
 def test_every_noun_and_source(self):
  lex=json.loads(Path('content/LIBRARY_LEXICON.json').read_text());r=json.loads(Path('content/NOUN_MORPHOLOGY_RESEARCH.json').read_text())
  nouns={e['lemmaId'] for e in lex['entries'] if e['partOfSpeech']=='noun'}
  self.assertEqual(nouns,{e['lemmaId'] for e in r['entries']})
  self.assertTrue(all(e['lookup']['query'] and e['localDialectStatus'] for e in r['entries']))
  for e in lex['entries']:
   for f in e['forms']:
    if ':research:' not in f['formId']:continue
    self.assertFalse(f['userVerified']);self.assertEqual(f['reviewStatus'],'needs_native_review');self.assertTrue(f['morphologyResearch'])
    if f['composition']['enabled']:
     self.assertFalse(f['metadataUncertainty']);self.assertEqual(f['morphology']['case'],'direct');self.assertEqual(f['morphology']['number'],'plural')
if __name__=='__main__':unittest.main()
