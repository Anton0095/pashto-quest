"""Build-time gates prevent editorial candidates leaking into playable content."""
import copy
import json
import runpy
from pathlib import Path
import unittest

validate = runpy.run_path('tools/build.py')['validate']
validate_expressions = runpy.run_path('tools/build.py')['validate_expressions']
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
        broken['entries'][0]['userApproval'] = {}
        with self.assertRaises(ValueError):
            validate(broken)

    def test_pending_expression_cannot_be_activated_without_language(self):
        expressions = json.loads(Path('content/NARRATIVE_EXPRESSIONS.json').read_text())
        expressions['expressions'][1]['active'] = True
        with self.assertRaises(ValueError):
            validate_expressions(expressions)

    def test_supplied_text_is_not_a_review_bypass_for_other_translations(self):
        expressions = json.loads(Path('content/NARRATIVE_EXPRESSIONS.json').read_text())
        expressions['expressions'][0]['pashto'] = 'سلام'
        with self.assertRaises(ValueError):
            validate_expressions(expressions)

    def test_explicit_vocabulary_class(self):
        broken = copy.deepcopy(data)
        broken['entries'][0]['vocabularyClass'] = 'universal'
        with self.assertRaises(ValueError):
            validate(broken)

if __name__ == '__main__':
    unittest.main()
