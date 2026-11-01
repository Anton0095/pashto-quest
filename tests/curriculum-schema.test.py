import copy, importlib.util, json, tempfile, unittest, runpy, re
from unittest.mock import patch
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location(
    "schema", ROOT / "tools/curriculum_schema.py"
)
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def data():
    d = json.loads((ROOT / "content/LIBRARY_LEXICON.json").read_text())
    d["sentenceFrames"] = json.loads(
        (ROOT / "content/SENTENCE_FRAMES.json").read_text()
    )
    return d


class Schema(unittest.TestCase):
    def test_all_records(self):
        entries, forms = m.validate_curriculum(data())
        self.assertEqual(len(entries), 473)
        self.assertGreater(len(forms), 565)
        provisional = [e for e in entries.values() if e["reviewStatus"] == "user_approved"]
        self.assertEqual(len(provisional), 473)
        self.assertTrue(all(e["userVerified"] is True for e in provisional))

    def test_rejections(self):
        for change in [
            "pos",
            "traits",
            "orphan",
            "grammar",
            "duplicate",
            "features",
            "day1verb",
            "frame",
            "english",
            "lemmaFeatures",
            "terminal",
            "composite",
        ]:
            d = data()
            e = d["entries"][0]
            if change == "pos":
                e["partOfSpeech"] = "grammar"
            if change == "traits":
                del e["traits"]["gender"]
            if change == "orphan":
                next(iter(d["sourceMappings"].values()))[0]["formId"] = "missing"
            if change == "grammar":
                e["introduction"]["requiredGrammarIds"] = ["grammar-day-99"]
            if change == "duplicate":
                d["entries"].append(copy.deepcopy(e))
            if change == "features":
                e["forms"][0]["morphology"]["person"] = 2
            if change == "day1verb":
                next(e for e in d["entries"] if e["partOfSpeech"] == "verb")[
                    "introduction"
                ]["day"] = 1
            if change == "frame":
                d["sentenceFrames"]["frames"][0]["slots"]["noun"]["features"][
                    "case"
                ] = "oblique"
            if change == "english":
                d["sentenceFrames"]["frames"][0]["englishRealiser"] = "unrelated"
            if change == "lemmaFeatures":
                e["traits"]["gender"] = "unknown-but-asserted"
            if change == "composite":
                d["sentenceFrames"]["compositeFrames"][0]["earliestDay"] = 1
            if change == "terminal":
                d["sentenceFrames"]["frames"][0]["terminals"][0][
                    "grammarId"
                ] = "grammar-day-99"
            with self.subTest(change=change), self.assertRaises(ValueError):
                m.validate_curriculum(d)

    def test_ordinary_sentence_cannot_be_declared_phrase(self):
        build = runpy.run_path(str(ROOT / "tools/build.py"))["build"]
        read = build.__globals__["read"]
        def altered(path):
            if path != "content/FIXED_PHRASES.json":
                return read(path)
            phrases = json.loads(read(path))
            phrases["phrases"][0]["pashto"] = "کور لوی دی."
            return json.dumps(phrases)
        with patch.dict(build.__globals__, read=altered), self.assertRaises(ValueError):
            build()

    def test_overrides_require_human_evidence_and_never_certify_language(self):
        build = runpy.run_path(str(ROOT / "tools/build.py"))["build"]
        read = build.__globals__["read"]
        dark = next(e for e in data()["entries"] if e["lemmaId"] == "lemma:a-dark")
        proposal = {
            "approval": {"approved": False},
            "introductions": [
                {
                    "lemmaId": dark["lemmaId"],
                    "day": 6,
                    "district": "residential",
                    "teachingOrder": dark["introduction"]["teachingOrder"],
                    "verifiedStatus": "curriculum_approved",
                }
            ],
        }

        def overridden(path):
            return (
                json.dumps(proposal)
                if path == "content/CURRICULUM_OVERRIDES.json"
                else read(path)
            )

        with patch.dict(build.__globals__, {"read": overridden}):
            for approved in [False, True]:
                proposal["approval"] = {
                    "approved": approved,
                    "reviewer": "Test curriculum editor",
                    "date": "2026-10-26",
                    "reference": "test fixture",
                }
                rendered = build()
                effective = json.loads(
                    re.search(r"const LIBRARY_DATA=(\{.*?\});", rendered, re.S)[1]
                )
                item = next(
                    e for e in effective["entries"] if e["lemmaId"] == dark["lemmaId"]
                )
                self.assertEqual(item["introduction"]["day"], 6 if approved else 5)
                self.assertEqual(item["reviewStatus"], "user_approved")
            del proposal["approval"]["reviewer"]
            with self.assertRaises(ValueError):
                build()

    def test_csv_is_a_proposal_not_certification(self):
        spec = importlib.util.spec_from_file_location(
            "importer", ROOT / "tools/import-curriculum.py"
        )
        i = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(i)
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp) / "schedule.csv"
            p.write_text(
                "lemmaId,plannedDay,district,teachingOrder,verifiedStatus\nlemma:a-dark,5,residential,1,editorial_draft\n"
            )
            self.assertFalse(i.proposal(p)["approval"]["approved"])
            p.write_text(p.read_text().replace("editorial_draft", "native_verified"))
            with self.assertRaises(ValueError):
                i.proposal(p)


if __name__ == "__main__":
    unittest.main()
