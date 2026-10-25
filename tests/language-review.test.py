import json
from pathlib import Path
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]


class ReviewExport(unittest.TestCase):
    def test_review_contract(self):
        report = json.loads((ROOT / "docs/language-review/coverage.json").read_text())
        rows = []
        for b in report["batches"]:
            batch = json.loads((ROOT / "docs/language-review" / b["file"]).read_text())
            self.assertFalse(batch["activationAllowed"])
            self.assertLessEqual(len(batch["items"]), 25)
            rows += batch["items"]
        self.assertEqual(len(rows), len({r["id"] for r in rows}))
        byid = {r["id"]: r for r in rows}
        lex = json.loads((ROOT / "content/LIBRARY_LEXICON.json").read_text())
        for e in lex["entries"]:
            self.assertEqual(byid[e["lemmaId"]]["morphology"]["forms"], e["forms"])
            self.assertEqual(byid[e["lemmaId"]]["intendedMeaning"], e["englishSenses"])
        for r in rows:
            self.assertEqual(r["status"], "pending-human-review")
            self.assertIsNone(r["decision"])
            self.assertIsNone(r["reviewer"])
            self.assertIsNone(r["proposedPashto"])
            self.assertTrue(r["evidence"])
            self.assertTrue(r["suitableScenes"])
        self.assertEqual(report["counts"]["selected-candidate"], 301)
        self.assertEqual(report["counts"]["universal-target"], 40)
        self.assertEqual(report["structuralGaps"]["unmappedSourceReferences"], [])
        self.assertEqual(report["structuralGaps"]["missingLexicalCardMappings"], [])
        self.assertTrue(
            all(
                "؟" not in r["existing"].get("pashto", "")
                for r in rows
                if r["kind"] == "possible-form-or-identity-gap"
            )
        )

    def test_generated_parity(self):
        subprocess.run(
            ["python3", "tools/prepare-language-review.py", "--check"],
            cwd=ROOT,
            check=True,
            stdout=subprocess.DEVNULL,
        )


if __name__ == "__main__":
    unittest.main()
