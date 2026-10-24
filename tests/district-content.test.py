"""Build-time gates prevent editorial candidates leaking into playable content."""
import copy
import json
import runpy
import unittest

validate = runpy.run_path('tools/embed_library.py')['validate']
data = json.load(open('content/LIBRARY_LEXICON.json'))

class ActivationTests(unittest.TestCase):
    def test_existing_draft(self):
        validate(data)

    def test_incomplete_language(self):
        for field in ['displayLemmaPs', 'romanisation', 'forms']:
            broken = copy.deepcopy(data)
            broken['entries'][0][field] = None
            with self.assertRaises(ValueError):
                validate(broken)

    def test_duplicate_identity(self):
        broken = copy.deepcopy(data)
        broken['entries'].append(broken['entries'][0])
        with self.assertRaises(ValueError):
            validate(broken)

    def test_candidate_cannot_claim_activation_without_review(self):
        broken = copy.deepcopy(data)
        broken['entries'][0]['promotionCandidateId'] = 'candidate:noun:mother'
        with self.assertRaises(ValueError):
            validate(broken)

if __name__ == '__main__':
    unittest.main()
