#!/usr/bin/env python3
"""Generate the human-editable vocabulary review register from the lexicon."""
import csv
import io
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIELDS = ["lemmaId", "english", "pashto", "romanisation", "partOfSpeech",
          "district", "plannedDay", "teachingOrder", "userVerified",
          "nativeReviewStatus", "source", "notes"]

def render():
    data = json.loads((ROOT / "content/LIBRARY_LEXICON.json").read_text())
    out = io.StringIO(newline="")
    writer = csv.DictWriter(out, fieldnames=FIELDS, lineterminator="\n")
    writer.writeheader()
    for e in sorted(data["entries"], key=lambda x: (x["introduction"]["day"], x["introduction"]["district"], x["introduction"]["teachingOrder"])):
        provenance = e.get("provenance", {})
        writer.writerow({
            "lemmaId": e["lemmaId"], "english": "; ".join(e["englishSenses"]),
            "pashto": e["displayLemmaPs"], "romanisation": e["romanisation"],
            "partOfSpeech": e["partOfSpeech"], "district": e["introduction"]["district"],
            "plannedDay": e["introduction"]["day"], "teachingOrder": e["introduction"]["teachingOrder"],
            "userVerified": str(e.get("userVerified", False)).lower(),
            "nativeReviewStatus": e["reviewStatus"],
            "source": provenance.get("source", e.get("introduction", {}).get("rationale", "authored game content")),
            "notes": " | ".join(
                item if isinstance(item, str) else json.dumps(item, ensure_ascii=False, sort_keys=True)
                for item in e.get("forms", [{}])[0].get("metadataUncertainty", [])
            ),
        })
    return out.getvalue()

if __name__ == "__main__":
    import sys
    target = ROOT / "content/VOCABULARY_REVIEW.csv"
    text = render()
    if "--check" in sys.argv:
        if not target.exists() or target.read_text() != text:
            raise SystemExit("Stale vocabulary review CSV")
    else:
        target.write_text(text)
    print(f"Vocabulary review register synchronized: {text.count(chr(10)) - 1} lemmas")
