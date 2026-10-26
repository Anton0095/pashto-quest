#!/usr/bin/env python3
"""Maintain the effective lexical audit after approved curriculum overrides."""

import argparse, json, re
from pathlib import Path
from build import build
from curriculum_schema import audit

ROOT = Path(__file__).resolve().parents[1]


def rendered():
    html = build()
    data = json.loads(re.search(r"const LIBRARY_DATA=(\{.*?\});", html, re.S)[1])
    game = json.loads(re.search(r"const GAME_DATA=(\{.*?\});", html, re.S)[1])
    words = {w["id"]: w for w in game["words"]}
    result = audit(data)
    result["audioFindings"] = [
        f["formId"]
        for e in data["entries"]
        for f in e["forms"]
        if f.get("audioContentId") and f["audioContentId"] not in words
    ]
    result["retimedCards"] = [
        {
            "sourceId": w["id"],
            "authoredDay": w["loop"],
            "earliestPracticeDay": max(
                [w["loop"]]
                + [
                    next(
                        f["firstAllowedDay"]
                        for e in data["entries"]
                        if e["lemmaId"] == r["lemmaId"]
                        for f in e["forms"]
                        if f["formId"] == r["formId"]
                    )
                    for r in data["sourceMappings"].get(w["id"], [])
                ]
            ),
        }
        for w in game["words"]
        if w.get("type") == "sentence"
    ]
    result["nativeCertifiedLemmas"] = sum(
        e.get("reviewStatus") == "approved"
        and bool(e.get("nativeReview", {}).get("reviewer"))
        and bool(e.get("nativeReview", {}).get("reference"))
        for e in data["entries"]
    )
    result["sourceMappingCorrections"] = data.get("sourceMappingCorrections", [])
    result["generationBoundary"] = {
        "policy": "Explicit semantic tuples only (authored attestations plus three composed combinations); feature-vetted development drafts, not native certification. No lexical verb templates enabled.",
        "frames": data["sentenceFrames"],
    }
    return json.dumps(result, ensure_ascii=False, indent=2) + "\n"


if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--check", action="store_true")
    a = p.parse_args()
    path = ROOT / "content/CURRICULUM_AUDIT.json"
    s = rendered()
    if a.check:
        if path.read_text() != s:
            raise SystemExit("Stale curriculum audit")
    else:
        path.write_text(s)
    print(
        "Lexical audit: stable identities, intended introductions, form exclusions and authored retiming recorded; native review pending."
    )
