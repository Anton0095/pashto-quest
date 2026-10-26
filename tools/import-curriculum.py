#!/usr/bin/env python3
"""Import stable-ID CSV into a separate curriculum proposal; never certify language."""

import argparse, csv, json, io
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def proposal(path):
    entries = {
        e["lemmaId"]: e
        for e in json.loads((ROOT / "content/LIBRARY_LEXICON.json").read_text())[
            "entries"
        ]
    }
    seen = set()
    rows = []
    for r in csv.DictReader(io.StringIO(Path(path).read_text())):
        eid = r["lemmaId"]
        e = entries.get(eid)
        if not e or eid in seen:
            raise ValueError("Unknown or duplicate stable lemma ID: " + eid)
        seen.add(eid)
        day = int(r["plannedDay"])
        order = int(r["teachingOrder"])
        district = r["district"]
        if (
            not e["firstIntroductionConstraints"]["earliestDay"] <= day <= 13
            or order < 1
        ):
            raise ValueError("Invalid day/order: " + eid)
        if district not in (
            e["suitableDistricts"]
            if e["vocabularyClass"] == "district"
            else ["universal"]
        ):
            raise ValueError("Unsuitable district: " + eid)
        if r["verifiedStatus"] not in [
            "unreviewed",
            "editorial_draft",
            "curriculum_approved",
        ]:
            raise ValueError("CSV cannot confer native language certification")
        rows.append(
            {
                "lemmaId": eid,
                "day": day,
                "district": district,
                "teachingOrder": order,
                "verifiedStatus": r["verifiedStatus"],
            }
        )
    if len({(r["district"], r["teachingOrder"]) for r in rows}) != len(rows):
        raise ValueError("Duplicate teaching order")
    return {
        "approval": {
            "approved": False,
            "reviewer": None,
            "date": None,
            "reference": None,
        },
        "introductions": rows,
    }


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("input")
    p.add_argument("output")
    a = p.parse_args()
    Path(a.output).write_text(
        json.dumps(proposal(a.input), ensure_ascii=False, indent=2) + "\n"
    )
